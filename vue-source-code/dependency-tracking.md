---
layout: doc
title: Vue依赖收集原理
---

# Vue依赖收集原理

## 依赖收集概述

依赖收集是Vue响应式系统的核心机制，它解决了"谁用到了这个数据，数据变化时通知谁"的问题。本文将深入分析Vue 3中依赖收集的实现原理和工作流程，帮助你理解Vue响应式系统的内部运作机制。

## 响应式系统架构

Vue 3的响应式系统主要由以下几个部分组成：

1. **reactive/ref** - 创建响应式对象/值
2. **effect** - 副作用函数，会自动追踪依赖
3. **track** - 依赖追踪
4. **trigger** - 触发更新

依赖收集发生在`track`阶段，当访问响应式对象的属性时，系统会记录当前正在执行的副作用函数(effect)，建立数据和副作用函数之间的关联。

## 核心数据结构

Vue 3使用WeakMap、Map和Set的嵌套结构来存储依赖关系：

```ts
// packages/reactivity/src/effect.ts
// 全局依赖图
const targetMap = new WeakMap<object, KeyToDepMap>()
// 每个对象的依赖图
type KeyToDepMap = Map<any, Dep>
// 每个属性的依赖集合
type Dep = Set<ReactiveEffect>
```

这个结构可以表述为：
- targetMap: 响应式对象 -> 它的属性依赖图
- KeyToDepMap: 属性名 -> 依赖集合
- Dep: 副作用函数集合

## 依赖收集过程

### 1. 创建响应式对象

依赖收集的前提是创建响应式对象，通过`reactive`或`ref`API：

```js
// packages/reactivity/src/reactive.ts
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T> {
  // 如果已经是响应式对象，直接返回
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 创建Proxy代理对象
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  // 存储原始对象到代理对象的映射
  proxyMap.set(target, proxy)
  return proxy
}
```

### 2. 定义副作用函数

副作用函数通过`effect`API创建，它在首次执行和依赖变化时都会运行：

```js
// packages/reactivity/src/effect.ts
export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {
  // 创建副作用函数对象
  const _effect = new ReactiveEffect(fn)
  
  if (options) {
    // 合并选项
    extend(_effect, options)
    if (options.scope) recordEffectScope(_effect, options.scope)
  }
  
  if (!options || !options.lazy) {
    // 立即执行副作用函数
    _effect.run()
  }
  
  // 返回绑定了this的runner函数
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = []
  
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null,
    scope?: EffectScope
  ) {
    recordEffectScope(this, scope)
  }
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    try {
      // 设置当前活动的effect
      activeEffect = this
      trackOpBit = 1 << ++effectTrackDepth
      
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this)
      } else {
        cleanupEffect(this)
      }
      
      // 执行函数，触发依赖收集
      return this.fn()
    } finally {
      // 清理工作
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this)
      }
      
      trackOpBit = 1 << --effectTrackDepth
      activeEffect = undefined
    }
  }
  
  // 停止effect
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}
```

### 3. 依赖追踪

当在副作用函数中访问响应式对象的属性时，触发`track`函数收集依赖：

```js
// packages/reactivity/src/effect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (shouldTrack && activeEffect) {
    // 获取目标对象的依赖图
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    
    // 获取属性的依赖集合
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep()))
    }
    
    // 收集依赖
    trackEffects(dep)
  }
}

export function trackEffects(dep: Dep) {
  let shouldTrack = false
  
  if (effectTrackDepth <= maxMarkerBits) {
    // 优化：避免重复收集
    if (!newTracked(dep)) {
      dep.n |= trackOpBit // 标记为新依赖
      shouldTrack = !wasTracked(dep)
    }
  } else {
    shouldTrack = !dep.has(activeEffect!)
  }
  
  if (shouldTrack) {
    // 添加依赖到集合
    dep.add(activeEffect!)
    // 记录effect依赖了哪些属性
    activeEffect!.deps.push(dep)
  }
}
```

### 4. 触发更新

当响应式对象的属性变化时，通过`trigger`函数触发依赖更新：

```js
// packages/reactivity/src/effect.ts
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  // 获取目标对象的依赖图
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // 没有依赖，直接返回
    return
  }
  
  // 收集需要触发的effects
  let deps: (Dep | undefined)[] = []
  
  if (type === TriggerOpTypes.CLEAR) {
    // 清除操作触发所有依赖
    deps = [...depsMap.values()]
  } else if (key === 'length' && isArray(target)) {
    // 数组length变化
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        deps.push(dep)
      }
    })
  } else {
    // 处理普通属性变化
    if (key !== void 0) {
      deps.push(depsMap.get(key))
    }
    
    // 处理特殊操作类型
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // 数组添加元素
          deps.push(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }
  
  // 触发收集的effects
  triggerEffects(createDep(deps))
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = isArray(dep) ? dep : [...dep]
  
  // 优先执行计算属性的effect
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  
  // 执行其他effect
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

function triggerEffect(effect: ReactiveEffect) {
  if (effect !== activeEffect || effect.allowRecurse) {
    if (effect.scheduler) {
      // 如果有调度器，使用调度器执行
      effect.scheduler()
    } else {
      // 否则直接执行
      effect.run()
    }
  }
}
```

## 计算属性中的依赖收集

Vue的计算属性也基于相同的依赖收集机制，但增加了缓存和延迟计算的特性：

```js
// packages/reactivity/src/computed.ts
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>
  
  // 处理只读和可写计算属性
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  // 创建计算属性实例
  const cRef = new ComputedRefImpl(
    getter,
    setter,
    isFunction(getterOrOptions) || !getterOrOptions.set
  )
  
  return cRef as any
}

class ComputedRefImpl<T> {
  public dep?: Dep = undefined
  private _value!: T
  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true
  public readonly [ReactiveFlags.IS_READONLY]: boolean
  public _dirty = true // 脏标记，表示需要重新计算
  
  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
    isReadonly: boolean
  ) {
    // 创建一个effect
    this.effect = new ReactiveEffect(getter, () => {
      // 调度器：当依赖变化时，将_dirty标记为true
      if (!this._dirty) {
        this._dirty = true
        // 触发依赖于计算属性的effects更新
        triggerRefValue(this)
      }
    })
    this[ReactiveFlags.IS_READONLY] = isReadonly
  }
  
  get value() {
    // 收集依赖于计算属性的effect
    trackRefValue(this)
    
    // 如果脏了，重新计算值
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    
    return this._value
  }
  
  set value(newValue: T) {
    this._setter(newValue)
  }
}
```

## 依赖收集的优化技术

Vue 3在依赖收集方面有多项性能优化：

### 1. 依赖标记

依赖标记用于快速判断依赖是否已被收集，避免重复操作：

```js
// 依赖标记位
export const trackOpBit = 1
// 标记是否跟踪过
const wasTracked = (dep: Dep): boolean => (dep.w & trackOpBit) > 0
// 标记是否新跟踪
const newTracked = (dep: Dep): boolean => (dep.n & trackOpBit) > 0

// 初始化依赖标记
export function initDepMarkers({ deps }: ReactiveEffect) {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit // wasTracked
    }
  }
}

// 完成依赖标记
export function finalizeDepMarkers(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    let ptr = 0
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i]
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect)
      } else {
        deps[ptr++] = dep
      }
      // 清除标记位
      dep.w &= ~trackOpBit
      dep.n &= ~trackOpBit
    }
    deps.length = ptr
  }
}
```

### 2. 自动清理无效依赖

当组件重新渲染时，Vue 3会自动清理不再使用的依赖：

```js
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```

## 依赖收集在组件更新中的应用

组件渲染过程实际上是创建一个渲染effect：

```js
// packages/runtime-core/src/renderer.ts
const setupRenderEffect = (
  instance: ComponentInternalInstance,
  initialVNode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  optimized: boolean
) => {
  // 创建渲染effect
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // 首次挂载
      instance.subTree = renderComponentRoot(instance)
      patch(null, instance.subTree, container, anchor, instance, parentSuspense, isSVG)
      initialVNode.el = instance.subTree.el
      instance.isMounted = true
    } else {
      // 更新
      let { next, vnode } = instance
      
      if (next) {
        next.el = vnode.el
        updateComponentPreRender(instance, next, optimized)
      } else {
        next = vnode
      }
      
      const prevTree = instance.subTree
      const nextTree = renderComponentRoot(instance)
      instance.subTree = nextTree
      
      patch(
        prevTree,
        nextTree,
        hostParentNode(prevTree.el!)!,
        getNextHostNode(prevTree),
        instance,
        parentSuspense,
        isSVG
      )
      next.el = nextTree.el
    }
  }
  
  // 创建响应式effect
  const effect = new ReactiveEffect(
    componentUpdateFn,
    () => queueJob(instance.update),
    instance.scope
  )
  
  // 赋值更新函数到实例
  const update = (instance.update = effect.run.bind(effect))
  update()
}
```

## 与Vue 2响应式系统的对比

Vue 3的依赖收集与Vue 2有以下主要区别：

1. **数据结构**：
   - Vue 2: 使用`Dep`类和全局的一维数组存储
   - Vue 3: 使用嵌套的WeakMap/Map/Set结构，更高效

2. **Proxy vs 定义属性**：
   - Vue 2: 使用`Object.defineProperty`
   - Vue 3: 使用ES6 Proxy，支持更全面的拦截操作

3. **内存管理**：
   - Vue 3使用WeakMap，当目标对象无引用时可被垃圾回收
   - 更好的依赖清理算法

4. **性能优化**：
   - Vue 3使用标记系统避免重复依赖收集
   - 精细化的更新触发控制

## 实际应用解析

以一个简单的响应式计数器为例，分析依赖收集过程：

```js
// 创建响应式状态
const counter = reactive({ count: 0 })

// 创建副作用函数
effect(() => {
  console.log('Current count:', counter.count)
})

// 修改状态，触发更新
counter.count++
```

执行流程：

1. `reactive({ count: 0 })`创建Proxy代理对象
2. `effect`创建副作用函数并立即执行
3. 执行过程中访问`counter.count`，触发`get`捕获器
4. `get`捕获器调用`track`，将当前effect与`counter.count`关联
5. 当`counter.count++`时，触发`set`捕获器
6. `set`捕获器调用`trigger`，找到关联的effect并执行

## 总结

Vue 3的依赖收集原理是响应式系统的核心，通过精心设计的Proxy拦截器和effect追踪机制，实现了数据变化到视图更新的自动连接。与Vue 2相比，Vue 3的依赖收集拥有更好的性能和更全面的响应式覆盖，为框架提供了坚实的基础。

理解依赖收集的工作原理，有助于开发者编写更高效的Vue应用，避免意外的性能问题，并能更好地理解Vue框架的内部工作机制。 