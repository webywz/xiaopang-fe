---
layout: doc
title: Vue 3不同场景下的状态管理方案
---

# Vue 3不同场景下的状态管理方案

## 概述

随着应用规模的增长，状态管理变得越来越重要。Vue 3提供了多种状态管理方案，从简单的组合式API到复杂的专用状态管理库。本文将介绍不同场景下的状态管理策略，帮助你选择最适合的解决方案。

## 小型应用的状态管理

### 1. 组合式API

对于小型应用，Vue 3的组合式API提供了简洁高效的状态管理方案。

```vue
<!-- /src/composables/useCounter.js -->
import { ref, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const doubleCount = computed(() => count.value * 2)
  
  return {
    count,
    increment,
    decrement,
    doubleCount
  }
}
```

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { useCounter } from './composables/useCounter'

const { count, increment, decrement, doubleCount } = useCounter()
</script>
```

### 2. provide/inject

当需要跨多层组件共享状态时，可以使用provide/inject：

```vue
<!-- App.vue -->
<template>
  <div>
    <h1>App Count: {{ count }}</h1>
    <button @click="increment">App Increment</button>
    <child-component />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ChildComponent from './ChildComponent.vue'

const count = ref(0)
const increment = () => count.value++

// 提供响应式状态
provide('counter', {
  count,
  increment
})
</script>
```

```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <h2>Child Count: {{ counter.count }}</h2>
    <button @click="counter.increment">Child Increment</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const counter = inject('counter')
</script>
```

## 中型应用的状态管理

### 1. 组合式状态管理模式

对于中型应用，可以基于组合式API构建自定义状态管理模式：

```js
// store/counter.js
import { reactive, computed, readonly } from 'vue'

// 创建状态
const state = reactive({
  count: 0,
  history: []
})

// 创建操作方法
const actions = {
  increment() {
    state.count++
    state.history.push(`INCREMENT at ${new Date().toISOString()}`)
  },
  decrement() {
    state.count--
    state.history.push(`DECREMENT at ${new Date().toISOString()}`)
  },
  reset() {
    state.count = 0
    state.history = []
  }
}

// 创建getters
const getters = {
  doubleCount: computed(() => state.count * 2),
  historyCount: computed(() => state.history.length)
}

// 导出只读状态、getters和可变actions
export function useCounterStore() {
  return {
    state: readonly(state),
    ...getters,
    ...actions
  }
}
```

使用这种自定义Store：

```vue
<template>
  <div>
    <p>Count: {{ store.state.count }}</p>
    <p>Double: {{ store.doubleCount }}</p>
    <p>History Events: {{ store.historyCount }}</p>
    
    <button @click="store.increment">+</button>
    <button @click="store.decrement">-</button>
    <button @click="store.reset">Reset</button>
    
    <div>
      <h3>History</h3>
      <ul>
        <li v-for="(entry, index) in store.state.history" :key="index">
          {{ entry }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from './store/counter'

const store = useCounterStore()
</script>
```

## 大型应用的状态管理

### 1. Pinia

Pinia是Vue团队推荐的状态管理库，专为Vue 3设计，提供了出色的TypeScript支持和开发者体验。

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    history: []
  }),
  
  // getters
  getters: {
    doubleCount: (state) => state.count * 2,
    historyCount: (state) => state.history.length
  },
  
  // actions
  actions: {
    increment() {
      this.count++
      this.history.push(`INCREMENT at ${new Date().toISOString()}`)
    },
    decrement() {
      this.count--
      this.history.push(`DECREMENT at ${new Date().toISOString()}`)
    },
    reset() {
      this.count = 0
      this.history = []
    }
  }
})
```

使用组合式API风格的Pinia：

```js
// stores/users.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchUsers } from '../api'

export const useUsersStore = defineStore('users', () => {
  // 状态
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // getters
  const userCount = computed(() => users.value.length)
  const activeUsers = computed(() => 
    users.value.filter(user => user.active)
  )
  
  // actions
  async function loadUsers() {
    loading.value = true
    error.value = null
    
    try {
      users.value = await fetchUsers()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    // 状态
    users,
    loading,
    error,
    
    // getters
    userCount,
    activeUsers,
    
    // actions
    loadUsers
  }
})
```

在组件中使用：

```vue
<template>
  <div>
    <div v-if="usersStore.loading">加载中...</div>
    <div v-else-if="usersStore.error">错误: {{ usersStore.error }}</div>
    <div v-else>
      <h2>用户列表 ({{ usersStore.userCount }})</h2>
      <h3>活跃用户: {{ usersStore.activeUsers.length }}</h3>
      
      <ul>
        <li v-for="user in usersStore.users" :key="user.id">
          {{ user.name }} - {{ user.active ? '活跃' : '非活跃' }}
        </li>
      </ul>
      
      <button @click="usersStore.loadUsers">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { useUsersStore } from './stores/users'
import { onMounted } from 'vue'

const usersStore = useUsersStore()

onMounted(() => {
  usersStore.loadUsers()
})
</script>
```

### 2. 模块化状态管理

对于大型应用，按功能域组织状态模块至关重要：

```
/stores
  /index.js          # 主入口
  /modules
    /auth.js         # 认证状态模块
    /users.js        # 用户管理模块
    /products.js     # 产品管理模块
    /cart.js         # 购物车模块
    /ui.js           # UI状态管理
```

## 数据持久化与同步

### 1. 使用localStorage持久化

```js
// stores/persistedCounter.js
import { defineStore } from 'pinia'

// 加载持久化状态
const savedState = localStorage.getItem('counter')
const initialState = savedState ? JSON.parse(savedState) : { count: 0 }

export const useCounterStore = defineStore('counter', {
  state: () => initialState,
  
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  
  actions: {
    increment() {
      this.count++
      this.saveState()
    },
    decrement() {
      this.count--
      this.saveState()
    },
    // 持久化状态
    saveState() {
      localStorage.setItem('counter', JSON.stringify(this.$state))
    }
  }
})
```

### 2. 结合插件实现高级持久化

使用pinia-plugin-persistedstate插件：

```js
// stores/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    name: '',
    email: '',
    preferences: {}
  }),
  
  actions: {
    setUser(userData) {
      this.$patch(userData)
    },
    clearUser() {
      this.$reset()
    }
  },
  
  // 配置持久化
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['id', 'name', 'email'], // 只持久化特定字段
  }
})
```

## 状态管理最佳实践

1. **根据应用规模选择策略**
   - 小应用：组合式API + provide/inject
   - 中型应用：自定义Store模式
   - 大型应用：Pinia或其他成熟状态管理库

2. **保持Store简洁**
   - 只将真正需要共享的状态放入Store
   - 局部状态优先使用组件内ref/reactive

3. **设计合理的状态结构**
   - 避免重复或冗余数据
   - 使用规范化数据结构处理关联数据

4. **状态变更集中处理**
   - 所有状态变更都通过actions处理
   - 避免在组件中直接修改状态

5. **利用Vue 3的响应式系统**
   - 巧妙使用ref、reactive、computed等API
   - 掌握shallowRef、shallowReactive等性能优化API

6. **适当使用插件扩展功能**
   - 持久化存储
   - 开发者工具集成
   - 路由同步

## 总结

Vue 3状态管理方案丰富多样，从简单的组合式API到成熟的Pinia，都能满足不同规模和需求的应用。关键是根据应用特点选择适合的方案，遵循最佳实践，避免过度设计，让状态管理成为应用开发的助力而非阻力。 