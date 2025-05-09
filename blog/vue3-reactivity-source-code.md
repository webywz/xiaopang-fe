---
title: Vue 3响应式系统源码解析
date: 2024-04-23
author: 前端小胖
tags: ['Vue', 'Source Code', 'Reactivity']
description: 深入解析Vue 3响应式系统的实现原理，包括响应式对象的创建、依赖收集、派发更新等核心机制。
---

# Vue 3响应式系统源码解析

Vue 3的响应式系统是框架的核心特性之一，本文将深入分析其实现原理和源码细节。

[[toc]]

## 响应式系统概述

### 1. 核心概念

Vue 3的响应式系统主要基于以下几个核心概念：

- **Proxy**: 用于创建响应式对象
- **Effect**: 副作用函数，用于执行依赖更新
- **Track**: 依赖收集
- **Trigger**: 触发更新

### 2. 基础架构

```typescript
// packages/reactivity/src/reactive.ts
import { isObject, toRawType } from '@vue/shared'
import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const reactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()

export function reactive(target: object) {
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    reactiveMap
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 如果目标不是对象，直接返回
  if (!isObject(target)) {
    return target
  }

  // 如果已经是代理，返回已有的代理
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 创建代理
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  
  return proxy
}
```

## 响应式对象的实现

### 1. 基础处理器

```typescript
// packages/reactivity/src/baseHandlers.ts
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'

export const mutableHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: object) {
    // 追踪依赖
    track(target, TrackOpTypes.GET, key)
    
    const res = Reflect.get(target, key, receiver)
    
    // 如果是对象，递归创建响应式对象
    if (isObject(res)) {
      return reactive(res)
    }
    
    return res
  },
  
  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const oldValue = (target as any)[key]
    const result = Reflect.set(target, key, value, receiver)
    
    // 如果值发生变化，触发更新
    if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
    
    return result
  },
  
  deleteProperty(target: object, key: string | symbol) {
    const hadKey = hasOwn(target, key)
    const oldValue = (target as any)[key]
    const result = Reflect.deleteProperty(target, key)
    
    if (result && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
    }
    
    return result
  }
}
```

### 2. 依赖收集

```typescript
// packages/reactivity/src/effect.ts
export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  active = true
  deps: Dep[] = []
  
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    
    try {
      activeEffect = this
      return this.fn()
    } finally {
      activeEffect = undefined
    }
  }
  
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

// 依赖收集
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}
```

### 3. 派发更新

```typescript
// packages/reactivity/src/effect.ts
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect) {
          if (effect.computed) {
            computedRunners.add(effect)
          } else {
            effects.add(effect)
          }
        }
      })
    }
  }
  
  // 添加相关依赖
  if (key !== void 0) {
    add(depsMap.get(key))
  }
  
  // 执行更新
  const run = (effect: ReactiveEffect) => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
  
  // 先运行计算属性
  computedRunners.forEach(run)
  // 再运行普通效果
  effects.forEach(run)
}
```

## 计算属性的实现

### 1. 计算属性类

```typescript
// packages/reactivity/src/computed.ts
export class ComputedRefImpl<T> {
  private _value!: T
  private _dirty = true
  public readonly effect: ReactiveEffect<T>
  
  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>
  ) {
    this.effect = new ReactiveEffect(getter, () => {
      // 当依赖变化时，将_dirty设为true
      if (!this._dirty) {
        this._dirty = true
        trigger(this, TriggerOpTypes.SET, 'value')
      }
    })
    this.effect.computed = true
  }
  
  get value() {
    // 追踪依赖
    track(this, TrackOpTypes.GET, 'value')
    
    // 如果脏，重新计算
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

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  return new ComputedRefImpl(getter, setter)
}
```

## Ref的实现

### 1. Ref基础类

```typescript
// packages/reactivity/src/ref.ts
export class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public readonly __v_isRef = true
  public dep?: Dep = undefined
  
  constructor(value: T, public readonly _shallow = false) {
    this._rawValue = _shallow ? value : toRaw(value)
    this._value = _shallow ? value : convert(value)
  }
  
  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  
  set value(newVal) {
    const useDirectValue = this._shallow || !this.__v_isShallow
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : convert(newVal)
      trigger(this, TriggerOpTypes.SET, 'value', newVal)
    }
  }
}

export function ref<T extends object>(value: T): ToRef<T>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
export function ref(value?: unknown) {
  return createRef(value)
}

function createRef(rawValue: unknown, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
```

## 实际应用示例

### 1. 响应式对象的使用

```typescript
// 示例：创建响应式对象
const state = reactive({
  count: 0,
  todos: []
})

// 创建effect
effect(() => {
  console.log('Count changed:', state.count)
})

// 修改值会触发effect
state.count++
```

### 2. 计算属性的使用

```typescript
const count = ref(0)
const double = computed(() => count.value * 2)

// 自动追踪依赖
console.log(double.value) // 0
count.value++
console.log(double.value) // 2
```

### 3. 嵌套响应式对象

```typescript
const nested = reactive({
  user: {
    name: 'John',
    age: 30,
    address: {
      city: 'Shanghai'
    }
  }
})

effect(() => {
  // 深层属性变化也会触发更新
  console.log('City changed:', nested.user.address.city)
})

nested.user.address.city = 'Beijing'
```

## 性能优化

### 1. 依赖清理

```typescript
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

### 2. 避免无限递归

```typescript
// packages/reactivity/src/effect.ts
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  
  const effect = createReactiveEffect(fn, options)
  
  if (!options.lazy) {
    effect()
  }
  
  return effect
}

function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(): unknown {
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    
    if (!effectStack.includes(effect)) {
      cleanup(effect)
      try {
        enableTracking()
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  
  effect.raw = fn
  effect.deps = []
  effect.options = options
  return effect
}
```

## 总结

Vue 3的响应式系统通过以下几个关键点实现了高效的响应式更新：

1. 使用Proxy代替Object.defineProperty，实现了更完整的响应式覆盖
2. 通过WeakMap和Set实现了更高效的依赖收集和清理
3. 采用effect栈管理机制避免了递归和死循环
4. 实现了惰性的计算属性求值
5. 支持深层响应式和浅层响应式

通过深入理解Vue 3响应式系统的实现原理，我们可以：

- 更好地理解Vue 3的工作机制
- 在开发中避免常见的响应式陷阱
- 优化应用的性能
- 实现自定义的响应式逻辑
