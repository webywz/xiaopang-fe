---
title: React Fiber架构源码解析
date: 2024-04-23
author: 前端小胖
tags: ['React', 'Source Code', 'Fiber']
description: 深入解析React Fiber架构的实现原理，包括并发渲染、调度机制和优先级管理等核心内容。
---

# React Fiber架构源码解析

本文将深入分析React Fiber架构的实现原理和源码细节，帮助你理解React的核心工作机制。

[[toc]]

## 一、Fiber架构基础

### 1.1 Fiber节点结构

```typescript
interface FiberNode {
  // 节点类型信息
  tag: WorkTag;                 // 标记Fiber类型
  type: any;                   // 元素类型
  elementType: any;            // 元素类型，与type类似但用于DEV环境
  
  // 链表结构
  return: Fiber | null;        // 父Fiber
  child: Fiber | null;         // 第一个子Fiber
  sibling: Fiber | null;       // 下一个兄弟Fiber
  
  // 工作单元
  pendingProps: any;           // 新的props
  memoizedProps: any;          // 已生效的props
  memoizedState: any;          // 已生效的state
  
  // 副作用
  flags: Flags;                // 副作用标记
  subtreeFlags: Flags;         // 子树副作用标记
  updateQueue: UpdateQueue<any> | null;  // 更新队列
  
  // 调度优先级
  lanes: Lanes;                // 优先级
  childLanes: Lanes;           // 子树优先级
}
```

### 1.2 工作循环结构

```typescript
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  // 1. 开始处理当前Fiber
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork, renderLanes);
  
  // 2. 处理完当前Fiber
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  // 3. 移动到下一个工作单元
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
```

## 二、并发渲染实现

### 2.1 时间切片

```typescript
// packages/scheduler/src/forks/Scheduler.js
function shouldYield(): boolean {
  const currentTime = getCurrentTime();
  if (currentTime >= deadline) {
    // 已超过当前时间片
    if (needsPaint || scheduling.isInputPending()) {
      return true;
    }
    // 检查是否还有剩余时间
    return currentTime >= maxYieldInterval;
  } else {
    return false;
  }
}

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}
```

### 2.2 优先级调度

```typescript
// packages/react-reconciler/src/ReactFiberLane.js
export type Lanes = number;
export type Lane = number;

// 优先级定义
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const InputContinuousLane: Lane = /*             */ 0b0000000000000000000000000000100;
export const DefaultLane: Lane = /*                     */ 0b0000000000000000000000000010000;
export const IdleLane: Lane = /*                        */ 0b0100000000000000000000000000000;

// 优先级检查
function includesNonIdleWork(lanes: Lanes) {
  return (lanes & NonIdleLanes) !== NoLanes;
}

// 优先级合并
function mergeLanes(a: Lanes, b: Lanes): Lanes {
  return a | b;
}
```

## 三、Diff算法实现

### 3.1 单节点Diff

```typescript
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement
): Fiber {
  const key = element.key;
  let child = currentFirstChild;
  
  while (child !== null) {
    // 1. 比较key
    if (child.key === key) {
      // 2. 比较type
      if (child.elementType === element.type) {
        // 可以复用
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.props);
        existing.return = returnFiber;
        return existing;
      }
      // key相同但type不同，删除所有旧节点
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  
  // 创建新节点
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.return = returnFiber;
  return created;
}
```

### 3.2 多节点Diff

```typescript
function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  
  // 第一轮：处理更新的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );
    if (newFiber === null) {
      break;
    }
    // ... 处理移动逻辑
  }
  
  // 第二轮：处理剩余节点
  if (newIdx === newChildren.length) {
    // 删除剩余旧节点
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  if (oldFiber === null) {
    // 添加剩余新节点
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      // ... 构建链表
    }
    return resultingFirstChild;
  }
  
  // 第三轮：处理移动的节点
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    );
    // ... 处理移动逻辑
  }
  
  return resultingFirstChild;
}
```

## 四、Hooks实现

### 4.1 useState实现

```typescript
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

// 内部实现
function mountState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  // 创建Hook对象
  const hook = mountWorkInProgressHook();
  
  // 初始化state
  if (typeof initialState === 'function') {
    initialState = (initialState as () => S)();
  }
  hook.memoizedState = hook.baseState = initialState;
  
  // 创建更新队列
  const queue: UpdateQueue<S> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  };
  hook.queue = queue;
  
  // 创建dispatch函数
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ));
  
  return [hook.memoizedState, dispatch];
}
```

### 4.2 useEffect实现

```typescript
function useEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null,
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}

// 内部实现
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null,
): void {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps,
  );
}

function mountEffectImpl(
  fiberFlags: Flags,
  hookFlags: HookFlags,
  create: () => (() => void) | void,
  deps: Array<any> | void | null,
): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  );
}
```

## 五、调度系统

### 5.1 任务调度

```typescript
// packages/scheduler/src/forks/Scheduler.js
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Function,
): Task {
  // 获取当前时间
  const currentTime = getCurrentTime();
  
  // 计算开始时间
  const startTime = currentTime + priorityToTimeout(priorityLevel);
  
  // 创建新任务
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime: startTime + timeout,
    sortIndex: -1,
  };
  
  // 加入任务队列
  if (startTime > currentTime) {
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    // 启动定时器
    requestHostTimeout(handleTimeout, startTime - currentTime);
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // 请求主线程回调
    requestHostCallback(flushWork);
  }
  
  return newTask;
}
```

### 5.2 优先级转换

```typescript
// packages/scheduler/src/forks/SchedulerPriorities.js
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;

function priorityToTimeout(priority: PriorityLevel): number {
  switch (priority) {
    case ImmediatePriority:
      return IMMEDIATE_PRIORITY_TIMEOUT;
    case UserBlockingPriority:
      return USER_BLOCKING_PRIORITY_TIMEOUT;
    case IdlePriority:
      return IDLE_PRIORITY_TIMEOUT;
    case LowPriority:
      return LOW_PRIORITY_TIMEOUT;
    case NormalPriority:
    default:
      return NORMAL_PRIORITY_TIMEOUT;
  }
}
```

## 总结

React Fiber架构的核心特性：

1. **增量渲染**：通过Fiber节点实现工作单元的分割
2. **优先级调度**：支持任务优先级排序和中断恢复
3. **副作用管理**：统一管理DOM操作和生命周期
4. **并发特性**：实现可中断的渲染过程

通过以上源码分析，我们可以看到React Fiber架构在以下方面的具体实现：
- Fiber节点的数据结构设计
- 可中断的工作循环机制
- 高效的Diff算法
- Hooks的内部实现
- 完整的调度系统