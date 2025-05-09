# Vue 3状态管理

Vue 3提供了多种全新的状态管理方式，更加灵活和高效。本文将介绍Vue 3中的响应式API、组合式函数以及官方推荐的Pinia状态管理库。

## Vue 3的响应式状态管理

### reactive和ref

Vue 3的Composition API提供了强大的响应式API，可用于创建和管理响应式状态：

```js
/**
 * Vue 3响应式API基础用法
 */
import { ref, reactive, computed, readonly, watchEffect } from 'vue'

// 使用ref处理简单值类型
const count = ref(0)
// 修改值需要使用.value
count.value++

// 使用reactive处理对象
const user = reactive({
  name: '张三',
  age: 30,
  profile: {
    level: 1,
    avatar: 'avatar.jpg'
  }
})
// 直接修改属性
user.age++
user.profile.level = 2

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 只读代理，防止修改
const readonlyUser = readonly(user)

// 自动跟踪依赖并响应更改
watchEffect(() => {
  console.log(`Count is ${count.value}, double is ${doubleCount.value}`)
  console.log(`User: ${user.name}, age: ${user.age}`)
})
```

### toRefs和toRef

在组合式函数中解构响应式对象时保持响应性：

```js
/**
 * 处理响应式对象的解构
 */
import { reactive, toRefs, toRef } from 'vue'

const state = reactive({
  name: '张三',
  age: 30
})

// 将整个对象的所有属性转为ref
const { name, age } = toRefs(state)
name.value = '李四' // state.name也会更新

// 只转换单个属性为ref
const onlyName = toRef(state, 'name')
onlyName.value = '王五' // state.name也会更新
```

## 组合式函数（Composables）进行状态管理

Vue 3允许创建自定义组合式函数，用于跨组件共享和重用状态逻辑：

```js
/**
 * 创建用户状态管理的组合式函数
 * @returns {Object} 用户状态和方法
 */
// useUser.js
import { reactive, readonly, computed } from 'vue'

export function useUser() {
  // 私有响应式状态
  const state = reactive({
    user: null,
    loading: false,
    error: null
  })
  
  // 计算属性
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin = computed(() => state.user?.role === 'admin')
  
  // 方法
  async function login(username, password) {
    state.loading = true
    state.error = null
    
    try {
      // 假设这是API调用
      const user = await api.login(username, password)
      state.user = user
    } catch (err) {
      state.error = err.message
    } finally {
      state.loading = false
    }
  }
  
  function logout() {
    state.user = null
  }
  
  // 暴露接口 (只读状态 + 方法)
  return {
    // 暴露只读状态防止直接修改
    state: readonly(state),
    isLoggedIn,
    isAdmin,
    login,
    logout
  }
}
```

在组件中使用：

```vue
<script setup>
/**
 * 使用自定义的用户状态管理
 */
import { useUser } from '@/composables/useUser'

const { state, isLoggedIn, isAdmin, login, logout } = useUser()

async function handleLogin() {
  await login('admin', 'password')
}
</script>

<template>
  <div>
    <div v-if="state.loading">登录中...</div>
    <div v-else-if="state.error">错误: {{ state.error }}</div>
    <div v-else-if="isLoggedIn">
      欢迎, {{ state.user.name }}
      <span v-if="isAdmin">(管理员)</span>
      <button @click="logout">登出</button>
    </div>
    <button v-else @click="handleLogin">登录</button>
  </div>
</template>
```

## Pinia - Vue 3官方推荐状态管理库

Pinia是Vue 3的官方状态管理库，是Vuex的下一代版本，提供了更简单的API和更好的TypeScript支持。

### 安装和配置Pinia

```bash
# 安装
npm install pinia
# 或
yarn add pinia
# 或
pnpm add pinia
```

```js
/**
 * 在Vue 3应用中配置Pinia
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

### 创建Pinia Store

```js
/**
 * 使用defineStore创建Pinia store
 * @returns {Object} Store实例及其状态和方法
 */
// stores/counter.js
import { defineStore } from 'pinia'

// 选项式API风格
export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    lastChanged: null
  }),
  
  // 类似计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    // 使用this访问getter
    doubleCountPlusOne() {
      return this.doubleCount + 1
    }
  },
  
  // 修改状态的方法
  actions: {
    increment() {
      this.count++
      this.lastChanged = new Date()
    },
    async fetchInitialCount() {
      // 可以包含异步操作
      const data = await api.getCount()
      this.count = data.count
    }
  }
})

// 组合式API风格 (setup风格)
export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const loading = ref(false)
  
  // getters
  const isLoggedIn = computed(() => !!user.value)
  
  // actions
  async function login(username, password) {
    loading.value = true
    try {
      user.value = await api.login(username, password)
    } finally {
      loading.value = false
    }
  }
  
  function logout() {
    user.value = null
  }
  
  return {
    user,
    loading,
    isLoggedIn,
    login,
    logout
  }
})
```

### 在组件中使用Pinia

```vue
<script setup>
/**
 * 在Vue 3组件中使用Pinia store
 */
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// 获取store实例
const counterStore = useCounterStore()
const userStore = useUserStore()

// 解构，保持响应性
// 注意: 对于状态和getters，使用storeToRefs保持响应性
const { count, doubleCount } = storeToRefs(counterStore)
// actions可以直接解构
const { increment, fetchInitialCount } = counterStore

// 另一个store同理
const { user, loading, isLoggedIn } = storeToRefs(userStore)
const { login, logout } = userStore
</script>

<template>
  <div>
    <h2>Counter: {{ count }}</h2>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="fetchInitialCount">重置</button>
    
    <div v-if="isLoggedIn">
      欢迎, {{ user.name }}
      <button @click="logout">登出</button>
    </div>
    <button v-else @click="login('admin', 'password')">
      登录
    </button>
  </div>
</template>
```

### Pinia的状态持久化

使用插件扩展Pinia功能，如状态持久化：

```js
/**
 * Pinia状态持久化插件
 */
// plugins/persistedState.js
import { createPersistedState } from 'pinia-plugin-persistedstate'

export const piniaPersistedState = createPersistedState({
  // 持久化配置
  storage: localStorage,
  key: (id) => `app-${id}`
})

// main.js
import { createPinia } from 'pinia'
import { piniaPersistedState } from './plugins/persistedState'

const pinia = createPinia()
pinia.use(piniaPersistedState)

// 在store中启用持久化
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  // 开启持久化
  persist: true,
  // 或者自定义持久化配置
  // persist: {
  //   storage: sessionStorage,
  //   paths: ['count']
  // }
})
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶) 