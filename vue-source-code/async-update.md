---
layout: doc
title: Vue异步更新队列
---

# Vue异步更新队列

## 异步更新概述

Vue的响应式系统在数据变化时不会立即更新DOM，而是将所有状态变更缓存在一个队列中，在下一个事件循环"tick"中批量执行。这种异步更新机制可以避免不必要的计算和DOM操作，提高性能。本文将深入分析Vue 3中异步更新队列的实现原理和工作流程。

## 为什么需要异步更新？

假设在一个同步渲染的系统中，每次状态变化都会触发视图更新：

```js
state.count = 1  // 更新DOM
state.count = 2  // 更新DOM
state.count = 3  // 更新DOM
```

这将导致多次重复且无意义的DOM操作。而Vue的异步更新队列会将这些变化缓冲起来，合并为一次更新：

```js
state.count = 1
state.count = 2
state.count = 3
// 下一个tick才更新DOM，且只更新一次，值为3
```

## 核心数据结构

Vue 3的异步更新队列主要基于以下数据结构：

```js
// packages/runtime-core/src/scheduler.ts
// 任务队列
const queue: SchedulerJob[] = []
// 后置任务队列
const postFlushCbs: SchedulerJob[] = []
// 是否正在刷新队列
let isFlushing = false
let isFlushPending = false
```

## 异步更新机制实现

### 1. 任务入队

当组件状态发生变化时，Vue会将组件的更新函数加入到队列中：

```js
// packages/runtime-core/src/scheduler.ts
export function queueJob(job: SchedulerJob) {
  // 队列为空或当前job不在队列中时才入队
  if (
    (!queue.length ||
      !queue.includes(
        job,
        isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
      )) &&
    job !== currentPreFlushParentJob
  ) {
    // 将任务加入队列
    if (job.id == null) {
      queue.push(job)
    } else {
      // 按id排序，确保父组件先于子组件更新
      queue.splice(findInsertionIndex(queue, job.id), 0, job)
    }
    // 调度队列刷新
    queueFlush()
  }
}
```

### 2. 队列刷新

任务入队后，会触发队列的异步刷新：

```js
// packages/runtime-core/src/scheduler.ts
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 在下一个事件循环"tick"中刷新队列
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true
  
  // 执行队列前先排序
  // 这确保了：
  // 1. 先执行组件更新（父组件先于子组件）
  // 2. 如果组件在父组件更新期间卸载，可以跳过其更新
  queue.sort((a, b) => getId(a) - getId(b))
  
  try {
    // 执行队列中的任务
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job && job.active !== false) {
        callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
      }
    }
  } finally {
    // 重置队列状态
    flushIndex = 0
    queue.length = 0
    
    // 执行后置任务
    flushPostFlushCbs(seen)
    
    isFlushing = false
    currentFlushPromise = null
    
    // 如果在执行过程中有新的任务被添加，继续处理
    if (queue.length || postFlushCbs.length) {
      flushJobs(seen)
    }
  }
}
```

### 3. 微任务调度

Vue 3使用Promise作为异步调度的默认机制：

```js
// packages/runtime-core/src/scheduler.ts
const resolvedPromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

// 在flushJobs函数中：
currentFlushPromise = resolvedPromise.then(flushJobs)
```

这使得更新操作会在当前事件循环的微任务阶段执行，优先级高于setTimeout等宏任务。

### 4. nextTick API实现

Vue提供了`nextTick`API，允许开发者在DOM更新后执行代码：

```js
// packages/runtime-core/src/scheduler.ts
export function nextTick<T = void>(
  this: T,
  fn?: (this: T) => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}
```

`nextTick`实际上是返回当前刷新队列的Promise，或者创建一个新的Promise，这样可以确保传入的回调函数在DOM更新后执行。

## 任务优先级系统

Vue 3的调度器支持多种优先级的任务：

```js
// packages/runtime-core/src/scheduler.ts
// 预刷新回调（在渲染前）
export function queuePreFlushCb(cb: SchedulerJob) {
  queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex)
}

// 后置刷新回调（在渲染后）
export function queuePostFlushCb(cb: SchedulerJob | SchedulerJob[]) {
  queueCb(
    cb,
    activePostFlushCbs,
    pendingPostFlushCbs,
    postFlushIndex
  )
}
```

这种设计允许不同类型的任务在渲染过程的不同阶段执行：

1. **预刷新任务(Pre-flush)**: 在组件渲染前执行，适合需要在渲染前修改数据的操作
2. **普通更新任务**: 组件的更新函数，负责重新渲染组件
3. **后置刷新任务(Post-flush)**: 在组件渲染后执行，适合需要访问更新后DOM的操作

## 实际流程分析

让我们以一个具体例子来分析整个异步更新流程：

```vue
<template>
  <div>{{ count }}</div>
  <button @click="increment">Increment</button>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++
      console.log('Count incremented to', count.value)
      count.value++
      console.log('Count incremented to', count.value)
    }
    
    return { count, increment }
  }
}
</script>
```

当用户点击按钮时，发生以下流程：

1. `increment`函数执行，`count.value`从0变为1，然后从1变为2
2. 每次修改`count.value`都会触发其setter，调用`trigger`函数
3. `trigger`执行对应的effects，包括组件的渲染effect
4. 组件渲染effect通过`queueJob`被添加到更新队列中
5. 队列调度开始，通过Promise.then安排在微任务中执行
6. 事件处理函数执行完毕（此时DOM尚未更新）
7. 微任务阶段，`flushJobs`执行队列中的任务
8. 组件重新渲染，DOM更新为显示数字"2"

如果添加了`nextTick`，则可以在DOM更新后执行代码：

```js
function increment() {
  count.value++
  count.value++
  
  nextTick(() => {
    // 这里DOM已经更新，显示的是"2"
    console.log('DOM updated, displayed value:', document.querySelector('div').textContent)
  })
}
```

## 与Vue 2的对比

Vue 3的异步更新队列与Vue 2有以下主要区别：

1. **微任务实现**：
   - Vue 2: 优先使用`Promise.then`，降级到`MutationObserver`、`setImmediate`或`setTimeout`
   - Vue 3: 统一使用`Promise.then`，简化了实现

2. **队列排序**：
   - Vue 3: 按组件ID排序，确保父组件先于子组件更新
   - Vue 2: 也实现了组件更新顺序，但逻辑不同

3. **优先级系统**：
   - Vue 3: 明确区分预刷新、渲染、后置刷新任务
   - Vue 2: 使用watcher的id确定更新顺序

## 调试异步更新

Vue 3提供了一些调试异步更新的方法：

```js
// 检查队列状态
import { devtoolsTimelineMarker } from 'vue'

// 时间线标记（仅在开发模式生效）
devtoolsTimelineMarker && devtoolsTimelineMarker('queue', 'start')
// ...执行队列任务
devtoolsTimelineMarker && devtoolsTimelineMarker('queue', 'end')
```

## 与React的Fiber协调器对比

Vue的异步更新队列与React的Fiber架构有一些相似之处，但也有本质区别：

1. **任务中断**：
   - React Fiber: 可以中断渲染任务，根据优先级重新调度
   - Vue: 任务一旦开始执行就会完成，不会中断

2. **并发模式**：
   - React: 支持并发模式，可以同时准备多个版本的UI
   - Vue: 采用简化的模型，没有实现完整的并发特性

3. **更新粒度**：
   - Vue: 以组件为单位进行更新
   - React: 可以有更细粒度的更新控制

## 性能优化最佳实践

基于Vue的异步更新机制，可以采用以下最佳实践：

1. **避免不必要的状态变更**：
   ```js
   // 不推荐：多次触发更新
   state.value = 1
   nextTick(() => {
     // 一些操作
   })
   state.value = 2
   nextTick(() => {
     // 另一些操作
   })
   
   // 推荐：合并状态变更
   state.value = 2
   nextTick(() => {
     // 所有DOM更新后的操作
   })
   ```

2. **合理使用预刷新和后置刷新回调**：
   ```js
   import { queuePreFlushCb, queuePostFlushCb } from 'vue'
   
   // 在渲染前修改数据
   queuePreFlushCb(() => {
     // 预处理数据
   })
   
   // 在渲染后访问DOM
   queuePostFlushCb(() => {
     // 测量DOM或与第三方库集成
   })
   ```

3. **批量更新状态**：
   ```js
   function batchUpdate() {
     // 所有状态更新集中在一起
     state1.value = 'new value'
     state2.value = 'new value'
     state3.value = [1, 2, 3]
     
     // 只有一次nextTick
     nextTick(() => {
       // DOM已更新
     })
   }
   ```

## 总结

Vue 3的异步更新队列机制是其响应式系统的重要组成部分，通过批量处理更新和优化渲染时机，有效提升了应用性能。理解这一机制的工作原理，可以帮助开发者更好地控制组件更新流程，编写更高效的Vue应用。

异步更新队列与响应式系统、渲染器紧密协作，共同构成了Vue框架的核心运行机制。通过合理利用`nextTick`API和队列的优先级系统，开发者可以精确控制代码在Vue更新生命周期中的执行时机，从而构建出性能更优、逻辑更清晰的应用。 