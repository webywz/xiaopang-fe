---
layout: doc
title: Vue 3组合式函数(Composables)最佳实践
---

# Vue 3组合式函数(Composables)最佳实践

## 组合式函数简介

组合式函数(Composables)是Vue 3中用于封装和重用有状态逻辑的函数。它们是Composition API的核心优势之一，让我们能够以更灵活、更模块化的方式组织代码。

## 基本原则

### 命名约定

组合式函数应以`use`作为前缀，这是Vue社区的约定。

```js
// ✓ 正确
function useUserState() { /* ... */ }
function useCartItems() { /* ... */ }

// ✗ 错误
function userState() { /* ... */ }
function getCartItems() { /* ... */ }
```

### 返回值结构

组合式函数应返回一个包含暴露状态和方法的普通对象。

```js
/**
 * 用户管理组合式函数
 * @returns {Object} 包含用户状态和操作方法的对象
 */
export function useUser() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchUser = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      user.value = await api.getUser(id)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    user,          // 状态
    loading,       // 状态
    error,         // 状态
    fetchUser      // 方法
  }
}
```

## 常见组合式函数模式

### 1. 资源管理模式

管理API请求、加载状态和错误处理的组合式函数。

```js
/**
 * 通用资源管理组合式函数
 * @template T 资源类型
 * @param {Function} fetchFunction 获取资源的异步函数
 * @returns {Object} 资源状态和操作方法
 */
export function useResource(fetchFunction) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * 加载资源数据
   * @param {...any} args 传递给fetchFunction的参数
   */
  const loadResource = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await fetchFunction(...args)
    } catch (err) {
      error.value = err.message || '加载资源失败'
      console.error('Resource loading error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置资源状态
   */
  const resetResource = () => {
    data.value = null
    error.value = null
  }

  return {
    data,
    loading,
    error,
    loadResource,
    resetResource
  }
}

// 使用示例
import { useResource } from '@/composables/useResource'
import { getProduct } from '@/api/products'

export default {
  setup() {
    const { 
      data: product, 
      loading, 
      error, 
      loadResource: loadProduct 
    } = useResource(getProduct)

    // 组件挂载时加载产品
    onMounted(() => {
      loadProduct(route.params.id)
    })

    return {
      product,
      loading,
      error
    }
  }
}
```

### 2. 页面交互状态管理

管理页面UI状态的组合式函数。

```js
/**
 * 管理弹窗状态的组合式函数
 * @returns {Object} 弹窗状态和控制方法
 */
export function useModal() {
  const isVisible = ref(false)
  const modalData = ref(null)

  /**
   * 打开弹窗
   * @param {any} data 传递给弹窗的数据
   */
  const openModal = (data = null) => {
    modalData.value = data
    isVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closeModal = () => {
    isVisible.value = false
    // 可选择在动画结束后清除数据
    setTimeout(() => {
      modalData.value = null
    }, 300)
  }

  return {
    isVisible,
    modalData,
    openModal,
    closeModal
  }
}

// 使用示例
export default {
  setup() {
    const { isVisible, modalData, openModal, closeModal } = useModal()
    
    const handleEditUser = (user) => {
      openModal(user)
    }
    
    return {
      isVisible,
      modalData,
      closeModal,
      handleEditUser
    }
  }
}
```

### 3. 事件处理器

管理事件监听和自动清理的组合式函数。

```js
/**
 * 事件处理组合式函数
 * @param {string} eventName 事件名称
 * @param {Function} handler 事件处理函数
 * @param {Object} options 事件选项
 * @returns {Function} 清理函数
 */
export function useEventListener(target, eventName, handler, options = {}) {
  // 如果传入的是ref，则需要使用.value
  const targetRef = computed(() => {
    return unref(target)
  })
  
  onMounted(() => {
    if (!targetRef.value) return
    
    targetRef.value.addEventListener(eventName, handler, options)
  })
  
  onBeforeUnmount(() => {
    if (!targetRef.value) return
    
    targetRef.value.removeEventListener(eventName, handler, options)
  })
}

// 使用示例
export default {
  setup() {
    const inputRef = ref(null)
    
    useEventListener(inputRef, 'focus', () => {
      console.log('Input focused')
    })
    
    useEventListener(window, 'resize', () => {
      console.log('Window resized')
    })
    
    return {
      inputRef
    }
  }
}
```

## 高级组合式函数模式

### 1. 提供接收值或Ref的灵活API

```js
/**
 * 计数器组合式函数
 * @param {number|Ref<number>} initialValue 初始值
 * @returns {Object} 计数器状态和方法
 */
export function useCounter(initialValue = 0) {
  // 确保以ref形式处理参数
  const count = isRef(initialValue) 
    ? initialValue 
    : ref(initialValue)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = isRef(initialValue) 
      ? initialValue.value 
      : initialValue
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}

// 使用示例 - 传递值
const { count, increment } = useCounter(10)

// 使用示例 - 传递ref，实现共享状态
const sharedCount = ref(0)
const counterA = useCounter(sharedCount)
const counterB = useCounter(sharedCount)
// counterA和counterB共享同一个计数状态
```

### 2. 共享状态模式

```js
/**
 * 创建可在多个组件间共享的状态
 * @param {T} initialState 初始状态
 * @returns {Object} 共享状态和方法
 */
export function createSharedState(initialState) {
  // 创建一个不会被垃圾回收的状态实例
  const state = reactive({ ...initialState })
  
  // 公开的方法
  const actions = {
    update(newState) {
      Object.assign(state, newState)
    },
    reset() {
      Object.assign(state, initialState)
    }
  }
  
  // 公开的getter
  const getters = {
    getState() {
      return readonly(state)
    }
  }
  
  return {
    ...actions,
    ...getters
  }
}

// 创建一个共享的状态实例
export const useUserSharedState = createSharedState({
  name: '',
  email: '',
  preferences: {}
})

// 在组件A中使用
const componentA = {
  setup() {
    const sharedState = useUserSharedState
    const state = sharedState.getState()
    
    const updateName = (name) => {
      sharedState.update({ name })
    }
    
    return { state, updateName }
  }
}

// 在组件B中使用
const componentB = {
  setup() {
    const sharedState = useUserSharedState
    const state = sharedState.getState()
    
    return { state }
  }
}
```

### 3. 生命周期控制模式

```js
/**
 * 带生命周期管理的数据加载
 * @returns {Object} 数据状态和控制方法
 */
export function usePageData() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 使用effectScope管理所有副作用
  const scope = effectScope()
  
  scope.run(() => {
    // 在作用域中设置自动化的操作
    const route = useRoute()
    
    // 当路由参数变化时自动重新加载数据
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          loadData(newId)
        }
      },
      { immediate: true }
    )
  })
  
  async function loadData(id) {
    loading.value = true
    error.value = null
    
    try {
      data.value = await fetchData(id)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  function dispose() {
    // 清理所有副作用
    scope.stop()
  }
  
  // 自动清理
  onUnmounted(dispose)
  
  return {
    data,
    loading,
    error,
    loadData,
    dispose
  }
}
```

## Vue 3特有组合式函数技巧

### 1. 利用toRefs实现属性响应式传递

```js
/**
 * 表单处理组合式函数
 * @param {Object} initialValues 初始表单值
 * @returns {Object} 表单状态和方法
 */
export function useForm(initialValues = {}) {
  // 创建响应式表单状态
  const form = reactive({
    values: { ...initialValues },
    errors: {},
    touched: {}
  })
  
  const setFieldValue = (field, value) => {
    form.values[field] = value
    form.touched[field] = true
  }
  
  const reset = () => {
    form.values = { ...initialValues }
    form.errors = {}
    form.touched = {}
  }
  
  // 使用toRefs确保返回值的响应式
  return {
    ...toRefs(form),  // 解构同时保持响应性
    setFieldValue,
    reset
  }
}

// 使用示例
export default {
  setup() {
    const { values, errors, touched, setFieldValue } = useForm({
      name: '',
      email: ''
    })
    
    // values.name, values.email 都是响应式的
    
    return {
      values,
      errors,
      touched,
      setFieldValue
    }
  }
}
```

### 2. 使用provide/inject实现跨层级共享

```js
/**
 * 创建一个可注入的状态
 * @param {string} key 唯一键名
 * @param {any} defaultValue 默认值
 * @returns {Object} 提供者和消费者函数
 */
export function createInjectionState(key, defaultValue) {
  // 创建提供者组合式函数
  const useProvideState = () => {
    const state = reactive(defaultValue)
    provide(key, state)
    return state
  }
  
  // 创建消费者组合式函数
  const useInjectedState = () => {
    return inject(key, () => reactive(defaultValue))
  }
  
  return [useProvideState, useInjectedState]
}

// 创建身份验证状态
const [useProvideAuth, useAuth] = createInjectionState('auth', {
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {}
})

// 在根组件提供状态
const App = {
  setup() {
    const auth = useProvideAuth()
    
    auth.login = async (credentials) => {
      // 实现登录逻辑
      auth.user = await api.login(credentials)
      auth.isLoggedIn = true
    }
    
    auth.logout = () => {
      auth.user = null
      auth.isLoggedIn = false
    }
  }
}

// 在任何后代组件中使用
const ProfileButton = {
  setup() {
    const auth = useAuth()
    
    return {
      user: auth.user,
      isLoggedIn: auth.isLoggedIn,
      logout: auth.logout
    }
  }
}
```

### 3. 使用watchEffect进行响应式副作用

```js
/**
 * 本地存储同步组合式函数
 * @param {string} key 存储键名
 * @param {Ref} valueRef 要同步的ref
 * @returns {Ref} 同步的ref
 */
export function useLocalStorage(key, initialValue) {
  // 从localStorage获取初始值
  const storedValue = localStorage.getItem(key)
  const value = ref(
    storedValue ? JSON.parse(storedValue) : initialValue
  )
  
  // 使用watchEffect自动保存到localStorage
  watchEffect(() => {
    localStorage.setItem(key, JSON.stringify(value.value))
  })
  
  return value
}

// 使用示例
export default {
  setup() {
    // 自动与localStorage同步
    const theme = useLocalStorage('theme', 'light')
    const settings = useLocalStorage('settings', { notifications: true })
    
    return {
      theme,
      settings
    }
  }
}
```

## 组合式函数的测试

### 单元测试组合式函数

```js
/**
 * 测试useCounter组合式函数
 */
import { useCounter } from '@/composables/useCounter'
import { mount } from '@vue/test-utils'

describe('useCounter', () => {
  test('初始值设置正确', () => {
    const { count } = useCounter(5)
    expect(count.value).toBe(5)
  })
  
  test('increment方法正确增加计数', () => {
    const { count, increment } = useCounter(0)
    increment()
    expect(count.value).toBe(1)
    increment()
    expect(count.value).toBe(2)
  })
  
  test('decrement方法正确减少计数', () => {
    const { count, decrement } = useCounter(2)
    decrement()
    expect(count.value).toBe(1)
  })
  
  test('reset方法重置计数', () => {
    const { count, increment, reset } = useCounter(5)
    increment()
    increment()
    expect(count.value).toBe(7)
    reset()
    expect(count.value).toBe(5)
  })
})
```

### 在组件中测试组合式函数

```js
/**
 * 在组件中测试组合式函数
 */
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Counter from '@/components/Counter.vue'

// Counter.vue组件使用了useCounter组合式函数
describe('Counter组件', () => {
  test('正确显示初始计数', () => {
    const wrapper = mount(Counter, {
      props: {
        initialCount: 5
      }
    })
    
    expect(wrapper.text()).toContain('5')
  })
  
  test('点击增加按钮正确增加计数', async () => {
    const wrapper = mount(Counter)
    
    await wrapper.find('button.increment').trigger('click')
    
    expect(wrapper.text()).toContain('1')
  })
  
  test('点击减少按钮正确减少计数', async () => {
    const wrapper = mount(Counter, {
      props: {
        initialCount: 5
      }
    })
    
    await wrapper.find('button.decrement').trigger('click')
    
    expect(wrapper.text()).toContain('4')
  })
})
```

## 组合式函数共享方式

### 1. 使用插件共享全局组合式函数

```js
/**
 * composables/index.js - 组合式函数集合
 */
import { useUser } from './useUser'
import { useNotification } from './useNotification'
import { useForm } from './useForm'

// 创建组合式函数插件
export const composablesPlugin = {
  install(app) {
    // 添加到全局属性
    app.config.globalProperties.$composables = {
      useUser,
      useNotification,
      useForm
    }
    
    // 提供给inject
    app.provide('composables', {
      useUser,
      useNotification,
      useForm
    })
  }
}

// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { composablesPlugin } from './composables'

const app = createApp(App)
app.use(composablesPlugin)
app.mount('#app')

// 组件中使用
export default {
  setup() {
    const composables = inject('composables')
    const { user, login } = composables.useUser()
    
    return { user, login }
  }
}
```

### 2. 按需导入特定组合式函数

直接从文件导入特定组合式函数是最简单且推荐的方式：

```js
/**
 * 在组件中按需导入组合式函数
 */
import { useUser } from '@/composables/useUser'
import { useCounter } from '@/composables/useCounter'

export default {
  setup() {
    const { user, loading, fetchUser } = useUser()
    const { count, increment } = useCounter(0)
    
    return {
      user,
      loading,
      fetchUser,
      count,
      increment
    }
  }
}
```

## 最佳实践总结

1. **单一职责原则**：每个组合式函数应该关注单一功能点
2. **命名一致性**：始终使用`use`前缀
3. **使用TypeScript**：提供类型安全和更好的开发体验
4. **适当的注释**：使用JSDoc注释描述参数和返回值
5. **返回对象**：返回明确命名的对象，方便解构
6. **生命周期管理**：确保在组件卸载时清理副作用
7. **状态共享**：使用provide/inject或外部状态库共享全局状态
8. **测试优先**：组合式函数非常适合单元测试驱动开发

## 相关资源

- [Vue 3 Composition API文档](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VueUse实用组合式函数库](https://vueuse.org/)
- [Vue 3高级主题](/vue/advanced-topics)
- [Vue 3性能优化指南](/vue-practical/performance) 