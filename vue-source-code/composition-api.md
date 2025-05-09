---
layout: doc
title: Vue Composition API源码分析
---

# Vue Composition API源码分析

## Composition API概述

Composition API是Vue 3引入的一组API，旨在解决大型组件代码组织和逻辑复用的问题。它允许我们根据功能而不是选项类型组织代码，并提供更好的TypeScript支持和逻辑复用能力。

## 核心API实现

### setup函数

setup函数是Composition API的入口，它在组件创建过程中被调用：

```js
/**
 * 处理组件的setup函数
 * @param {Object} instance - 组件实例
 */
function setupStatefulComponent(instance) {
  const Component = instance.type
  
  // 创建渲染上下文代理
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  
  const { setup } = Component
  if (setup) {
    // 设置当前实例，供getCurrentInstance使用
    setCurrentInstance(instance)
    
    // 创建setup上下文对象
    const setupContext = createSetupContext(instance)
    
    // 调用setup函数并处理返回值
    let setupResult
    try {
      setupResult = setup(shallowReadonly(instance.props), setupContext)
    } catch (e) {
      handleError(e, instance, 'setup')
    } finally {
      setCurrentInstance(null)
    }
    
    // 处理setup返回结果
    handleSetupResult(instance, setupResult)
  } else {
    // 如果没有setup，直接完成组件设置
    finishComponentSetup(instance)
  }
}

/**
 * 创建setup上下文对象
 * @param {Object} instance - 组件实例
 * @returns {Object} - setup上下文
 */
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: (exposed) => {
      instance.exposed = exposed || {}
    }
  }
}

/**
 * 处理setup函数的返回值
 * @param {Object} instance - 组件实例
 * @param {any} setupResult - setup函数的返回值
 */
function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    // 如果返回函数，将其作为渲染函数
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    // 如果返回对象，将其作为响应式状态
    // 使用proxyRefs解包refs，便于模板中访问
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}
```

### ref

ref是创建响应式引用的核心API：

```js
/**
 * 创建一个响应式引用
 * @param {any} value - 初始值
 * @returns {Object} - 包含value属性的响应式对象
 */
export function ref(value) {
  return createRef(value, false)
}

/**
 * 创建ref对象
 * @param {any} rawValue - 原始值
 * @param {boolean} shallow - 是否为浅层响应
 * @returns {Object} - ref对象
 */
function createRef(rawValue, shallow) {
  // 如果已经是ref，直接返回
  if (isRef(rawValue)) {
    return rawValue
  }
  
  const ref = {
    __v_isRef: true,
    get value() {
      // 跟踪依赖
      track(ref, TrackOpTypes.GET, 'value')
      return rawValue
    },
    set value(newVal) {
      // 只有值变化时才触发更新
      if (hasChanged(newVal, rawValue)) {
        rawValue = shallow ? newVal : convert(newVal)
        // 触发更新
        trigger(ref, TriggerOpTypes.SET, 'value', newVal)
      }
    }
  }
  
  return ref
}

/**
 * 检查值是否为ref
 * @param {any} r - 要检查的值
 * @returns {boolean} - 是否为ref
 */
export function isRef(r) {
  return !!(r && r.__v_isRef === true)
}

/**
 * 解包ref
 * @param {any} ref - 可能是ref的值
 * @returns {any} - 如果是ref返回其value，否则返回原值
 */
export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}

/**
 * 为对象上的所有属性创建代理，自动解包refs
 * @param {Object} objectWithRefs - 包含refs的对象
 * @returns {Object} - 代理后的对象
 */
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      // 自动解包
      return unref(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
      // 如果原属性是ref且新值不是ref，则设置.value
      if (isRef(target[key]) && !isRef(value)) {
        target[key].value = value
        return true
      } else {
        // 否则直接设置属性
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}
```

### reactive

reactive用于创建响应式对象：

```js
/**
 * 创建响应式对象
 * @param {Object} target - 目标对象
 * @returns {Proxy} - 代理后的响应式对象
 */
export function reactive(target) {
  // 特殊处理：如果传入的是ref/readonly/reactive，直接返回
  if (isReadonly(target)) {
    return target
  }
  
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}

/**
 * 创建响应式对象
 * @param {Object} target - 目标对象
 * @param {boolean} isReadonly - 是否只读
 * @param {Object} baseHandlers - 基本类型的代理处理器
 * @param {Object} collectionHandlers - 集合类型的代理处理器
 * @returns {Proxy} - 代理后的响应式对象
 */
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
  if (!isObject(target)) {
    return target
  }
  
  // 如果目标已经是代理，返回已存在的代理
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  
  // 获取目标的类型
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  
  // 根据类型选择代理处理器
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  
  // 缓存代理对象
  proxyMap.set(target, proxy)
  
  return proxy
}
```

### computed

computed用于创建计算属性：

```js
/**
 * 创建计算属性
 * @param {Function|Object} getterOrOptions - getter函数或选项对象
 * @returns {Object} - 计算属性ref
 */
export function computed(getterOrOptions) {
  let getter
  let setter
  
  // 处理传入参数
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  // 创建computed实例
  const cRef = new ComputedRefImpl(getter, setter)
  
  return cRef
}

/**
 * 计算属性实现类
 */
class ComputedRefImpl {
  constructor(getter, setter) {
    this._setter = setter
    this._value = undefined
    this._dirty = true
    
    // 创建getter effect
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          // 触发依赖此计算属性的响应
          trigger(this, TriggerOpTypes.SET, 'value')
        }
      }
    })
  }
  
  get value() {
    // 如果脏，重新计算
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    // 收集依赖
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  
  set value(newValue) {
    this._setter(newValue)
  }

  get __v_isRef() {
    return true
  }
}
```

### watch和watchEffect

watch和watchEffect用于观察数据变化：

```js
/**
 * 监听响应式数据变化
 * @param {any} source - 监听源
 * @param {Function} cb - 回调函数
 * @param {Object} options - 选项
 * @returns {Function} - 停止监听的函数
 */
export function watch(source, cb, options = {}) {
  return doWatch(source, cb, options)
}

/**
 * 立即运行一个函数，同时响应式地跟踪其依赖
 * @param {Function} effect - 副作用函数
 * @param {Object} options - 选项
 * @returns {Function} - 停止监听的函数
 */
export function watchEffect(effect, options = {}) {
  return doWatch(effect, null, options)
}

/**
 * 监听实现
 * @param {any} source - 监听源
 * @param {Function|null} cb - 回调函数
 * @param {Object} options - 选项
 * @returns {Function} - 停止监听的函数
 */
function doWatch(source, cb, {
  immediate = false,
  deep = false,
  flush = 'pre',
  onTrack,
  onTrigger
} = {}) {
  // 获取当前实例
  const instance = currentInstance
  
  // 创建获取监听值的getter函数
  let getter
  let forceTrigger = false
  
  // 处理不同类型的监听源
  if (isRef(source)) {
    // ref
    getter = () => source.value
    forceTrigger = !!source._shallow
  } else if (isReactive(source)) {
    // reactive对象
    getter = () => source
    deep = true
  } else if (isArray(source)) {
    // 数组
    getter = () => source.map(s => {
      if (isRef(s)) {
        return s.value
      } else if (isReactive(s)) {
        return traverse(s)
      } else if (isFunction(s)) {
        return callWithErrorHandling(s, instance, 'watch getter')
      } else {
        console.warn('Invalid watch source')
      }
    })
  } else if (isFunction(source)) {
    // 函数
    if (cb) {
      // 普通watch
      getter = () => callWithErrorHandling(source, instance, 'watch getter')
    } else {
      // watchEffect
      getter = () => {
        if (instance && instance.isUnmounted) {
          return
        }
        if (cleanup) {
          cleanup()
        }
        return callWithErrorHandling(source, instance, 'watch callback', [onInvalidate])
      }
    }
  } else {
    getter = NOOP
  }
  
  // 深度监听
  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
  
  // 清理函数
  let cleanup
  // 注册无效化函数
  function onInvalidate(fn) {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, instance, 'watch cleanup')
    }
  }
  
  // 旧值
  let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE
  
  // 任务处理函数
  const job = () => {
    if (!effect.active) {
      return
    }
    if (cb) {
      // watch(source, cb)
      const newValue = effect.run()
      if (deep || forceTrigger || hasChanged(newValue, oldValue)) {
        // 清理之前的副作用
        if (cleanup) {
          cleanup()
        }
        // 调用回调
        callWithAsyncErrorHandling(cb, instance, 'watch callback', [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onInvalidate
        ])
        oldValue = newValue
      }
    } else {
      // watchEffect
      effect.run()
    }
  }
  
  // 设置调度器的执行时机
  let scheduler
  if (flush === 'sync') {
    // 同步执行
    scheduler = job
  } else if (flush === 'post') {
    // 组件更新后执行
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
  } else {
    // 默认，组件更新前执行
    scheduler = () => {
      if (!instance || instance.isMounted) {
        queuePreFlushCb(job)
      } else {
        // 组件挂载前，直接同步执行一次
        job()
      }
    }
  }
  
  // 创建响应式effect
  const effect = new ReactiveEffect(getter, scheduler)
  
  // 初始执行
  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else if (flush === 'post') {
    queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense)
  } else {
    effect.run()
  }
  
  // 返回停止函数
  return () => {
    effect.stop()
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect)
    }
  }
}

/**
 * 递归遍历对象，触发所有属性的getter以收集依赖
 * @param {any} value - 要遍历的值
 * @param {Set} seen - 已遍历值的集合（防止循环引用）
 * @returns {any} - 原值
 */
function traverse(value, seen = new Set()) {
  // 非对象或已遍历过，直接返回
  if (!isObject(value) || seen.has(value)) {
    return value
  }
  // 添加到已遍历集合
  seen.add(value)
  
  // 遍历对象或数组
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (value instanceof Map) {
    value.forEach((v, key) => {
      // 遍历Map的value
      traverse(value.get(key), seen)
    })
  } else if (value instanceof Set) {
    value.forEach(v => {
      // 遍历Set的元素
      traverse(v, seen)
    })
  } else {
    // 遍历对象的属性
    for (const key in value) {
      traverse(value[key], seen)
    }
  }
  
  return value
}
```

### 生命周期钩子

组合式API提供了一系列生命周期钩子：

```js
/**
 * 创建生命周期钩子注册函数
 * @param {string} lifecycle - 生命周期名称
 * @returns {Function} - 注册钩子的函数
 */
function createHook(lifecycle) {
  return (hook, target = currentInstance) => {
    // 注册钩子函数
    if (target) {
      const hooks = target[lifecycle] || (target[lifecycle] = [])
      
      // 包装钩子，确保this指向正确的实例
      const wrappedHook = (...args) => {
        setCurrentInstance(target)
        const res = callWithAsyncErrorHandling(hook, target, lifecycle, args)
        setCurrentInstance(null)
        return res
      }
      
      hooks.push(wrappedHook)
      
      return wrappedHook
    } else {
      console.warn(`${lifecycle} is called when there is no active component instance.`)
    }
  }
}

// 创建各个生命周期钩子注册函数
export const onBeforeMount = createHook('bm')
export const onMounted = createHook('m')
export const onBeforeUpdate = createHook('bu')
export const onUpdated = createHook('u')
export const onBeforeUnmount = createHook('bum')
export const onUnmounted = createHook('um')
export const onActivated = createHook('a')
export const onDeactivated = createHook('da')
export const onErrorCaptured = createHook('ec')
export const onRenderTracked = createHook('rtc')
export const onRenderTriggered = createHook('rtg')
```

### provide/inject

provide和inject用于跨组件传递数据：

```js
/**
 * 提供数据给后代组件
 * @param {string|Symbol} key - 键
 * @param {any} value - 值
 */
export function provide(key, value) {
  if (!currentInstance) {
    console.warn(`provide() can only be used inside setup().`)
  } else {
    let provides = currentInstance.provides
    
    // 如果当前组件的provides是继承父组件的，创建新的
    const parentProvides = currentInstance.parent && currentInstance.parent.provides
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    
    // 提供值
    provides[key] = value
  }
}

/**
 * 注入祖先组件提供的数据
 * @param {string|Symbol} key - 键
 * @param {any} defaultValue - 默认值
 * @returns {any} - 注入的值或默认值
 */
export function inject(key, defaultValue, treatDefaultAsFactory = false) {
  if (!currentInstance) {
    console.warn(`inject() can only be used inside setup().`)
  } else {
    // 在父级链中查找提供的值
    const provides = currentInstance.parent && currentInstance.parent.provides
    
    if (provides && key in provides) {
      return provides[key]
    } else if (arguments.length > 1) {
      // 使用默认值
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue()
        : defaultValue
    } else {
      console.warn(`Injection "${String(key)}" not found.`)
    }
  }
}
```

## 组合式函数 (Composables)

组合式API的一个主要优势是可以创建可复用的组合式函数：

```js
/**
 * 示例：useMousePosition组合式函数
 * @returns {Object} - 包含鼠标位置的响应式对象
 */
export function useMousePosition() {
  // 创建响应式状态
  const x = ref(0)
  const y = ref(0)
  
  // 创建事件处理函数
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }
  
  // 在组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('mousemove', update)
  })
  
  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })
  
  // 返回响应式状态
  return { x, y }
}
```

## Composition API的优势

### 1. 逻辑复用

组合式API使逻辑复用变得更加简单和灵活：

```js
// 在多个组件中复用逻辑
import { useMousePosition } from './composables/mouse'
import { useLocalStorage } from './composables/storage'

export default {
  setup() {
    // 组合多个功能
    const { x, y } = useMousePosition()
    const { state, setState } = useLocalStorage('key', { count: 0 })
    
    return {
      x, y,
      state,
      setState
    }
  }
}
```

### 2. 更好的类型推断

与选项API相比，组合式API提供了更好的TypeScript类型推断：

```ts
interface User {
  id: number
  name: string
}

// 类型推断工作良好
function useUser(id: number) {
  const user = ref<User | null>(null)
  
  const fetchUser = async () => {
    user.value = await api.getUser(id)
  }
  
  return {
    user,
    fetchUser
  }
}

// 在组件中使用
const { user, fetchUser } = useUser(1)
// TypeScript知道user.value是User类型
if (user.value) {
  console.log(user.value.name)
}
```

### 3. 更小的生产包体积

组合式API的代码通常比等效的选项API代码更容易被tree-shaking优化：

```js
// 导入需要的功能
import { ref, computed, watch, onMounted } from 'vue'

// 未使用的API不会包含在最终的打包结果中
```

## 总结

Vue 3的Composition API提供了更灵活、更强大的组件逻辑组织方式，解决了大型组件代码组织和逻辑复用的问题。通过深入理解其实现原理，我们可以更好地利用这些API构建高质量的Vue应用。与选项API相比，组合式API不仅提供了更好的TypeScript支持，还能产生更小的生产包体积，并促进更好的代码组织和复用。 