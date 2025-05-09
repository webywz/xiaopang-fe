---
layout: doc
title: Vue生命周期源码分析
---

# Vue生命周期源码分析

## 生命周期概述

生命周期是Vue组件从创建到销毁的整个过程，Vue提供了多个生命周期钩子函数，允许开发者在特定阶段添加自己的代码。了解生命周期的实现原理有助于我们更好地使用这些钩子函数。

## 生命周期钩子

Vue 3提供了以下生命周期钩子:

1. `beforeCreate` - 组件实例初始化之后，数据观测和事件配置之前
2. `created` - 组件实例创建完成后
3. `beforeMount` - 组件挂载到DOM之前
4. `mounted` - 组件挂载到DOM后
5. `beforeUpdate` - 数据更新时，虚拟DOM重新渲染之前
6. `updated` - 数据更新导致虚拟DOM重新渲染后
7. `beforeUnmount` - 组件卸载之前
8. `unmounted` - 组件卸载后
9. `activated` - 被keep-alive缓存的组件激活时
10. `deactivated` - 被keep-alive缓存的组件停用时
11. `errorCaptured` - 捕获来自子孙组件的错误

## 生命周期钩子注册

Vue 3中，生命周期钩子可以通过选项API或组合式API进行注册：

```js
/**
 * 创建生命周期钩子注册函数
 * @param {string} lifecycle - 生命周期名称
 * @returns {Function} - 注册钩子的函数
 */
function createHook(lifecycle) {
  return (hook, target = currentInstance) => {
    // 注册钩子到组件实例
    if (target) {
      // 获取对应生命周期名称的钩子数组
      const hooks = target[lifecycle] || (target[lifecycle] = [])
      
      // 包装钩子函数，确保this指向正确
      const wrappedHook = () => {
        // 保存当前实例
        const currentInstance = instance
        // 设置当前实例为目标实例
        setCurrentInstance(target)
        // 调用钩子
        const res = callWithAsyncErrorHandling(hook)
        // 恢复当前实例
        setCurrentInstance(currentInstance)
        return res
      }
      
      // 添加到钩子数组
      hooks.push(wrappedHook)
      
      return wrappedHook
    } else {
      console.warn(`${lifecycle} is called when there is no active component instance.`)
    }
  }
}

// 创建各个生命周期钩子的注册函数
export const onBeforeMount = createHook('bm')
export const onMounted = createHook('m')
export const onBeforeUpdate = createHook('bu')
export const onUpdated = createHook('u')
export const onBeforeUnmount = createHook('bum')
export const onUnmounted = createHook('um')
export const onActivated = createHook('a')
export const onDeactivated = createHook('da')
export const onErrorCaptured = createHook('ec')
```

## 生命周期钩子调用

每个生命周期钩子在组件生命周期中的特定点被调用：

```js
/**
 * 调用生命周期钩子
 * @param {Array} hooks - 钩子函数数组
 * @param {Object} instance - 组件实例
 * @param {Array} args - 参数
 */
export function callHook(hooks, instance, args = null) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i]
      
      // 确保钩子函数的this指向组件实例
      if (args) {
        hook.apply(instance, args)
      } else {
        hook.call(instance)
      }
    }
  }
}
```

## 各阶段生命周期的实现

### 创建阶段

组件实例创建时的生命周期：

```js
/**
 * 创建组件实例
 * @param {Object} vnode - 虚拟节点
 */
function createComponentInstance(vnode) {
  // 创建组件实例...
  
  const instance = {
    // ...组件实例属性
  }
  
  return instance
}

/**
 * 设置组件
 * @param {Object} instance - 组件实例
 */
function setupComponent(instance) {
  // 初始化props和slots...
  
  // 处理组件选项
  const { props, data, methods, computed, watch, provide, inject, ...lifecycles } = instance.type
  
  // beforeCreate在这里隐式调用
  // 此时组件的props和data还未初始化
  callHook(lifecycles.beforeCreate, instance)
  
  // 初始化props、data等...
  
  // created在这里调用
  // 此时可以访问props和data，但DOM还未创建
  callHook(lifecycles.created, instance)
  
  // 如果存在setup函数，执行它
  if (instance.type.setup) {
    // ...执行setup
  }
}
```

### 挂载阶段

组件挂载到DOM时的生命周期：

```js
/**
 * 挂载组件
 * @param {Object} initialVNode - 初始虚拟节点
 * @param {Element} container - 容器元素
 */
function mountComponent(initialVNode, container) {
  // 创建组件实例
  const instance = (initialVNode.component = createComponentInstance(initialVNode))
  
  // 设置组件
  setupComponent(instance)
  
  // 设置渲染副作用
  setupRenderEffect(instance, initialVNode, container)
}

/**
 * 设置渲染副作用
 * @param {Object} instance - 组件实例
 * @param {Object} initialVNode - 初始虚拟节点
 * @param {Element} container - 容器元素
 */
function setupRenderEffect(instance, initialVNode, container) {
  // 创建组件更新函数
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // 首次挂载
      
      // beforeMount在这里调用
      // 此时组件即将挂载到DOM
      const { bm } = instance
      if (bm) {
        callHook(bm, instance)
      }
      
      // 执行组件的渲染函数获取子树
      const subTree = (instance.subTree = instance.render())
      
      // 渲染子树到DOM
      patch(null, subTree, container)
      
      // 保存DOM元素引用
      initialVNode.el = subTree.el
      
      // 标记为已挂载
      instance.isMounted = true
      
      // mounted在这里调用
      // 此时组件已经挂载到DOM
      const { m } = instance
      if (m) {
        callHook(m, instance)
      }
    } else {
      // 更新
      
      // 获取新旧子树
      const { next, vnode } = instance
      
      // 如果存在预更新的vnode
      if (next) {
        next.el = vnode.el
        updateComponentPreRender(instance, next)
      }
      
      // beforeUpdate在这里调用
      // 此时组件即将更新
      const { bu } = instance
      if (bu) {
        callHook(bu, instance)
      }
      
      // 执行渲染函数获取新子树
      const nextTree = instance.render()
      const prevTree = instance.subTree
      
      // 更新子树引用
      instance.subTree = nextTree
      
      // 更新DOM
      patch(prevTree, nextTree, container)
      
      // updated在这里调用
      // 此时组件已经更新
      const { u } = instance
      if (u) {
        callHook(u, instance)
      }
    }
  }
  
  // 创建带有响应式效果的更新函数
  instance.update = effect(componentUpdateFn, {
    scheduler: () => queueJob(instance.update)
  })
}
```

### 更新阶段

组件更新时的生命周期：

```js
/**
 * 更新组件预渲染
 * @param {Object} instance - 组件实例
 * @param {Object} nextVNode - 下一个虚拟节点
 */
function updateComponentPreRender(instance, nextVNode) {
  // 更新组件虚拟节点
  instance.vnode = nextVNode
  instance.next = null
  
  // 更新props
  instance.props = nextVNode.props
  
  // 如果需要，更新插槽
  if (nextVNode.children) {
    updateSlots(instance, nextVNode.children)
  }
}
```

### 卸载阶段

组件卸载时的生命周期：

```js
/**
 * 卸载组件
 * @param {Object} vnode - 虚拟节点
 */
function unmountComponent(vnode) {
  const { component } = vnode
  
  // beforeUnmount在这里调用
  // 此时组件即将卸载
  const { bum } = component
  if (bum) {
    callHook(bum, component)
  }
  
  // 卸载子树
  unmount(component.subTree)
  
  // unmounted在这里调用
  // 此时组件已经卸载
  const { um } = component
  if (um) {
    callHook(um, component)
  }
  
  // 清理副作用
  if (component.effect) {
    component.effect.stop()
  }
  
  // 移除组件引用
  vnode.component = null
}
```

## 特殊生命周期钩子

### keep-alive相关钩子

当组件被keep-alive包裹时，会触发特殊的生命周期钩子：

```js
/**
 * 处理被keep-alive包裹的组件
 * @param {Object} vnode - 虚拟节点
 * @param {Element} container - 容器元素
 */
function processComponent(vnode, container) {
  if (vnode.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    // 激活缓存的组件
    activateComponent(vnode)
  } else if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    // 缓存组件
    cacheComponent(vnode)
  } else {
    // 普通组件处理
    mountComponent(vnode, container)
  }
}

/**
 * 激活组件
 * @param {Object} vnode - 虚拟节点
 */
function activateComponent(vnode) {
  const instance = vnode.component
  
  // DOM操作：将组件DOM移回文档
  hostInsert(instance.subTree.el, container)
  
  // activated钩子调用
  const { a } = instance
  if (a) {
    callHook(a, instance)
  }
}

/**
 * 停用组件
 * @param {Object} vnode - 虚拟节点
 */
function deactivateComponent(vnode) {
  const instance = vnode.component
  
  // deactivated钩子调用
  const { da } = instance
  if (da) {
    callHook(da, instance)
  }
  
  // DOM操作：将组件DOM移出文档但不销毁
  hostRemove(instance.subTree.el)
}
```

### 错误捕获钩子

错误捕获钩子用于处理组件树中的错误：

```js
/**
 * 处理组件错误
 * @param {Error} err - 错误对象
 * @param {Object} instance - 发生错误的组件实例
 * @param {string} info - 错误信息
 * @returns {boolean} - 是否处理了错误
 */
function handleError(err, instance, info) {
  // 向上查找errorCaptured钩子
  const cur = instance
  
  while (cur) {
    const { ec } = cur
    if (ec) {
      for (let i = 0; i < ec.length; i++) {
        // 调用errorCaptured钩子
        // 如果返回true，表示错误已处理
        if (ec[i](err, instance, info) === true) {
          return true
        }
      }
    }
    // 查找父组件
    cur = cur.parent
  }
  
  // 如果没有处理，则抛出错误
  console.error(err)
  return false
}
```

## 选项API与组合式API的生命周期对应关系

Vue 3支持选项API和组合式API两种方式定义生命周期钩子，它们的对应关系如下：

```js
// 内部映射关系
const LifecycleHooks = {
  beforeCreate: 'bc',
  created: 'c',
  beforeMount: 'bm',
  mounted: 'm',
  beforeUpdate: 'bu',
  updated: 'u',
  beforeUnmount: 'bum',
  unmounted: 'um',
  activated: 'a',
  deactivated: 'da',
  errorCaptured: 'ec',
  renderTracked: 'rtc',
  renderTriggered: 'rtg'
}

// 组合式API钩子注册与对应的选项API钩子
const CompApiToOptionsApi = {
  onBeforeMount: 'beforeMount',
  onMounted: 'mounted',
  onBeforeUpdate: 'beforeUpdate',
  onUpdated: 'updated',
  onBeforeUnmount: 'beforeUnmount',
  onUnmounted: 'unmounted',
  onActivated: 'activated',
  onDeactivated: 'deactivated',
  onErrorCaptured: 'errorCaptured',
  onRenderTracked: 'renderTracked',
  onRenderTriggered: 'renderTriggered'
}
```

## 生命周期实现的技术要点

### 1. 闭包与函数式编程

Vue使用闭包和函数式编程来管理生命周期钩子：

```js
// 使用闭包存储当前活动实例
let currentInstance = null

// 设置当前实例
export function setCurrentInstance(instance) {
  currentInstance = instance
}

// 获取当前实例
export function getCurrentInstance() {
  return currentInstance
}

// 使用函数式编程创建钩子注册函数
export const onMounted = createHook('m')
```

### 2. 副作用与依赖收集

生命周期钩子的执行依赖于Vue的响应式系统：

```js
// 创建带有响应式效果的更新函数
instance.update = effect(componentUpdateFn, {
  scheduler: () => queueJob(instance.update)
})
```

### 3. 事件队列

Vue使用事件队列来批量处理更新，确保生命周期钩子在适当的时机调用：

```js
// 将更新函数添加到队列
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

// 刷新队列
function flushJobs() {
  // 排序队列确保父组件在子组件之前更新
  queue.sort((a, b) => a.id - b.id)
  
  // 执行队列中的任务
  for (let i = 0; i < queue.length; i++) {
    const job = queue[i]
    job()
  }
  
  // 清空队列
  queue.length = 0
}
```

## 总结

Vue的生命周期系统是组件运行机制的核心部分，它通过一系列的钩子函数，让开发者可以在组件的不同阶段执行代码。理解生命周期的实现原理，有助于我们更好地掌握组件的运行机制，编写出更高质量的Vue应用。 