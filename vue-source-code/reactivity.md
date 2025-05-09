---
layout: doc
title: Vue响应式系统源码分析
---

# Vue响应式系统源码分析

## 响应式系统概述

Vue 3的响应式系统是基于ES6的Proxy实现的，相比Vue 2使用的Object.defineProperty有了质的提升。本文将深入分析Vue 3响应式系统的实现原理。

## 核心API实现

### reactive

```js
/**
 * 创建一个响应式对象
 * @param {Object} target - 目标对象
 * @returns {Proxy} - 代理后的响应式对象
 */
export function reactive(target) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target
  }
  
  // 创建响应式代理
  const proxy = new Proxy(target, baseHandlers)
  return proxy
}
```

### ref

```js
/**
 * 创建一个包装对象，使基本类型值也能具有响应式
 * @param {any} value - 任意值
 * @returns {Object} - 包含value属性的响应式对象
 */
export function ref(value) {
  return createRef(value)
}

function createRef(rawValue) {
  const r = {
    __v_isRef: true,
    get value() {
      track(r, "value")
      return rawValue
    },
    set value(newVal) {
      rawValue = newVal
      trigger(r, "value")
    }
  }
  return r
}
```

## 依赖收集与触发更新

Vue 3响应式系统的核心在于依赖收集(track)和触发更新(trigger)：

```js
/**
 * 追踪依赖
 * @param {Object} target - 目标对象
 * @param {string|symbol} key - 属性键
 */
export function track(target, key) {
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

/**
 * 触发更新
 * @param {Object} target - 目标对象
 * @param {string|symbol} key - 属性键
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const effects = new Set()
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => effects.add(effect))
    }
  }
  
  // 添加与key相关的所有副作用函数
  if (key !== void 0) {
    add(depsMap.get(key))
  }
  
  // 运行所有副作用函数
  effects.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}
```

## 计算属性的实现

```js
/**
 * 创建计算属性
 * @param {Function|Object} getterOrOptions - getter函数或包含getter和setter的对象
 * @returns {Object} - 计算属性对象
 */
export function computed(getterOrOptions) {
  let getter, setter
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  const cacheRef = ref()
  let dirty = true
  
  const effect = createEffect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true
        trigger(cacheRef, 'value')
      }
    }
  })
  
  const computedRef = {
    __v_isRef: true,
    get value() {
      if (dirty) {
        cacheRef.value = effect.run()
        dirty = false
      }
      track(computedRef, 'value')
      return cacheRef.value
    },
    set value(newValue) {
      setter(newValue)
    }
  }
  
  return computedRef
}
```

## 响应式系统的优势与局限

### 优势
1. 使用Proxy可以拦截更多操作（如新增属性、删除属性等）
2. 可以监听数组索引和长度变化
3. 懒初始化，提高性能

### 局限
1. 不支持IE11（因为IE不支持Proxy）
2. 复杂数据结构深层嵌套时性能开销较大
3. 原始值（如字符串、数字）需要通过ref包装才能具有响应性

## 总结

Vue 3的响应式系统是其核心特性之一，通过Proxy实现了对数据变化的精确监测，为声明式UI更新提供了基础。理解其工作原理对于深入掌握Vue框架至关重要。 