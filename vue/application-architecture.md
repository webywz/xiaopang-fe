# Vue 3应用架构

本章节介绍Vue 3应用的架构设计和组织，帮助开发者构建可维护、可扩展的大型Vue 3应用。

## 项目结构与组织

### 标准项目结构

```
project-root/
│
├── public/                 # 静态资源，不会经过webpack处理
│   ├── favicon.ico
│   └── index.html          # HTML模板
│
├── src/                    # 源代码
│   ├── assets/             # 静态资源，会经过webpack处理
│   │   └── logo.png
│   │
│   ├── components/         # 通用/共享组件
│   │   ├── common/         # 基础UI组件
│   │   ├── layout/         # 布局组件
│   │   └── features/       # 特性相关组件
│   │
│   ├── composables/        # 组合式函数
│   │   ├── useAuth.js
│   │   └── useNotification.js
│   │
│   ├── router/             # 路由配置
│   │   ├── index.js        # 路由实例
│   │   └── routes/         # 路由模块
│   │
│   ├── stores/             # Pinia状态管理
│   │   ├── auth.js
│   │   ├── cart.js
│   │   └── index.js
│   │
│   ├── views/              # 页面级组件
│   │   ├── HomeView.vue
│   │   ├── AboutView.vue
│   │   └── features/       # 按功能组织的页面
│   │
│   ├── services/           # API调用和服务
│   │   ├── api.js          # API基础配置
│   │   └── modules/        # API模块
│   │
│   ├── utils/              # 工具函数
│   │   ├── helpers.js
│   │   └── validation.js
│   │
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
│
├── tests/                  # 测试文件
│   ├── unit/
│   └── e2e/
│
├── .env                    # 环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .eslintrc.js            # ESLint配置
├── vite.config.js          # Vite配置
├── package.json            # 项目依赖和脚本
└── README.md               # 项目说明文档
```

### 基于功能的项目结构

对于大型应用，可以考虑按功能模块组织代码：

```
src/
├── features/              # 按功能模块组织
│   ├── auth/              # 认证模块
│   │   ├── components/    # 模块内组件
│   │   ├── composables/   # 模块内组合式函数
│   │   ├── services/      # 模块内服务
│   │   ├── store/         # 模块状态管理
│   │   └── routes.js      # 模块路由配置
│   │
│   ├── products/          # 产品模块
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── routes.js
│   │
│   └── checkout/          # 结账模块
│
├── shared/                # 共享资源
│   ├── components/        # 共享组件
│   ├── composables/       # 共享组合式函数
│   ├── utils/             # 共享工具
│   └── services/          # 共享服务
│
├── router/                # 主路由配置
├── stores/                # 根状态存储
├── App.vue
└── main.js
```

## 大型应用架构模式

### 模块化设计

```js
/**
 * 特性模块化设计示例
 */
// features/auth/index.js - 模块入口
import * as components from './components'
import * as composables from './composables'
import { store } from './store'
import routes from './routes'

// 导出整个模块
export default {
  name: 'auth',
  install(app, options) {
    // 注册模块内组件
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
    
    // 注册模块状态存储
    app.use(store)
    
    // 添加自定义属性
    app.config.globalProperties.$auth = composables
  },
  routes // 导出路由配置
}

// main.js - 应用入口
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// 导入特性模块
import AuthModule from './features/auth'
import ProductModule from './features/products'
import CheckoutModule from './features/checkout'

const app = createApp(App)

// 创建路由表，整合各模块的路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 基本路由
    { path: '/', component: () => import('./views/HomeView.vue') },
    
    // 特性模块路由
    ...AuthModule.routes,
    ...ProductModule.routes,
    ...CheckoutModule.routes
  ]
})

// 安装模块
app.use(AuthModule)
app.use(ProductModule, { /* 模块选项 */ })
app.use(CheckoutModule)

app.use(router)
app.mount('#app')
```

### 领域驱动设计 (DDD)

```js
/**
 * 领域驱动设计架构示例
 */
// domain/user/UserEntity.js - 用户实体
export class UserEntity {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.role = data.role
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date()
  }
  
  isAdmin() {
    return this.role === 'admin'
  }
  
  canAccessResource(resource) {
    // 业务逻辑
    return this.isAdmin() || resource.ownerId === this.id
  }
}

// domain/user/UserRepository.js - 用户仓储
import { UserEntity } from './UserEntity'
import { apiClient } from '@/infrastructure/api'

export class UserRepository {
  async findById(id) {
    const response = await apiClient.get(`/users/${id}`)
    return new UserEntity(response.data)
  }
  
  async findAll() {
    const response = await apiClient.get('/users')
    return response.data.map(user => new UserEntity(user))
  }
  
  async save(user) {
    if (user.id) {
      const response = await apiClient.put(`/users/${user.id}`, user)
      return new UserEntity(response.data)
    } else {
      const response = await apiClient.post('/users', user)
      return new UserEntity(response.data)
    }
  }
}

// application/user/UserService.js - 应用服务
import { UserRepository } from '@/domain/user/UserRepository'

export class UserService {
  constructor() {
    this.userRepository = new UserRepository()
  }
  
  async getUserById(id) {
    return this.userRepository.findById(id)
  }
  
  async updateUserProfile(userId, profileData) {
    const user = await this.userRepository.findById(userId)
    // 业务逻辑
    Object.assign(user, profileData)
    return this.userRepository.save(user)
  }
}

// infrastructure/api/index.js - 基础设施层
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 使用案例
// views/UserProfile.vue
<script setup>
import { ref, onMounted } from 'vue'
import { UserService } from '@/application/user/UserService'

const userService = new UserService()
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const userId = route.params.id
    user.value = await userService.getUserById(userId)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
```

## API层设计

### API服务层

```js
/**
 * API服务层设计
 */
// services/api/client.js - API客户端
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    
    // 如果有token，添加到请求头
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理401错误
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      router.push('/login')
    }
    
    // 处理网络错误
    if (!error.response) {
      console.error('Network Error')
      // 显示网络错误通知
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

// services/api/endpoints/users.js - 用户API模块
import apiClient from '../client'

export const usersApi = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 用户列表
   */
  getUsers(params = {}) {
    return apiClient.get('/users', { params })
  },
  
  /**
   * 获取用户详情
   * @param {number|string} id - 用户ID
   * @returns {Promise<Object>} 用户详情
   */
  getUser(id) {
    return apiClient.get(`/users/${id}`)
  },
  
  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 创建的用户
   */
  createUser(userData) {
    return apiClient.post('/users', userData)
  },
  
  /**
   * 更新用户
   * @param {number|string} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} 更新后的用户
   */
  updateUser(id, userData) {
    return apiClient.put(`/users/${id}`, userData)
  },
  
  /**
   * 删除用户
   * @param {number|string} id - 用户ID
   * @returns {Promise<Object>} 响应数据
   */
  deleteUser(id) {
    return apiClient.delete(`/users/${id}`)
  }
}

// services/api/index.js - 导出所有API
import { usersApi } from './endpoints/users'
import { productsApi } from './endpoints/products'
import { ordersApi } from './endpoints/orders'

export const api = {
  users: usersApi,
  products: productsApi,
  orders: ordersApi
}
```

### API结果缓存

```js
/**
 * API结果缓存示例
 */
// services/api/cache.js - 缓存实现
export class ApiCache {
  constructor(options = {}) {
    this.cache = new Map()
    this.ttl = options.ttl || 60000 // 默认1分钟
  }
  
  /**
   * 获取缓存项
   * @param {string} key - 缓存键
   * @returns {*|null} 缓存值或null
   */
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (item.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  /**
   * 设置缓存项
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 过期时间(毫秒)
   */
  set(key, value, ttl = this.ttl) {
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }
  
  /**
   * 删除缓存项
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key)
  }
  
  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear()
  }
  
  /**
   * 创建缓存键
   * @param {string} url - API URL
   * @param {Object} params - 查询参数
   * @returns {string} 缓存键
   */
  static createKey(url, params = {}) {
    return `${url}:${JSON.stringify(params)}`
  }
}

// services/api/cacheClient.js - 带缓存的API客户端
import apiClient from './client'
import { ApiCache } from './cache'

const cache = new ApiCache({ ttl: 5 * 60 * 1000 }) // 5分钟缓存

export const cachedApiClient = {
  /**
   * 发送GET请求，支持缓存
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<*>} 响应数据
   */
  async get(url, options = {}) {
    const { params, useCache = true, cacheTTL } = options
    
    // 如果不使用缓存，直接发送请求
    if (!useCache) {
      return apiClient.get(url, { params }).then(res => res.data)
    }
    
    const cacheKey = ApiCache.createKey(url, params)
    
    // 尝试从缓存获取
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return Promise.resolve(cachedData)
    }
    
    // 发送请求并缓存结果
    try {
      const response = await apiClient.get(url, { params })
      cache.set(cacheKey, response.data, cacheTTL)
      return response.data
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  /**
   * 其他方法直接转发到原始客户端
   */
  post(url, data, options) {
    return apiClient.post(url, data, options).then(res => res.data)
  },
  
  put(url, data, options) {
    // 请求成功后清除相关URL的缓存
    return apiClient.put(url, data, options)
      .then(res => {
        // 清除可能受影响的缓存
        const urlBase = url.split('?')[0]
        Array.from(cache.cache.keys())
          .filter(key => key.startsWith(urlBase))
          .forEach(key => cache.delete(key))
        return res.data
      })
  },
  
  delete(url, options) {
    // 删除后清除缓存
    return apiClient.delete(url, options)
      .then(res => {
        const urlBase = url.split('?')[0]
        Array.from(cache.cache.keys())
          .filter(key => key.startsWith(urlBase))
          .forEach(key => cache.delete(key))
        return res.data
      })
  },
  
  /**
   * 清除特定URL的缓存
   * @param {string} urlPattern - URL模式
   */
  clearCache(urlPattern) {
    if (!urlPattern) {
      cache.clear()
      return
    }
    
    Array.from(cache.cache.keys())
      .filter(key => key.includes(urlPattern))
      .forEach(key => cache.delete(key))
  }
}
```

## 微前端架构

### 模块联邦

```js
/**
 * 基于Webpack模块联邦的微前端架构 - 配置
 */
// vite.config.js - 主应用
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'host-app',
      remotes: {
        // 远程模块定义
        'remote-app': 'http://localhost:5001/assets/remoteEntry.js',
        'dashboard': 'http://localhost:5002/assets/remoteEntry.js'
      },
      shared: ['vue'] // 共享依赖
    })
  ]
})

// vite.config.js - 远程模块
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'remote-app',
      filename: 'remoteEntry.js',
      // 暴露组件或模块
      exposes: {
        './Button': './src/components/Button.vue',
        './UserProfile': './src/components/UserProfile.vue',
        './userService': './src/services/userService.js'
      },
      shared: ['vue'] // 共享依赖
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

### 在Vue 3应用中使用远程模块

```js
/**
 * 在主应用中使用远程模块的组件
 */
// App.vue
<script setup>
import { defineAsyncComponent, ref } from 'vue'

// 异步导入远程组件
const RemoteButton = defineAsyncComponent(() => 
  import('remote-app/Button')
)

const RemoteUserProfile = defineAsyncComponent(() => 
  import('remote-app/UserProfile')
)

// 使用远程服务
import('remote-app/userService').then(module => {
  const userService = module.default
  userService.getUserProfile(1).then(user => {
    currentUser.value = user
  })
})

const currentUser = ref(null)
</script>

<template>
  <div>
    <h1>主应用</h1>
    
    <!-- 使用远程组件 -->
    <RemoteButton>点击我</RemoteButton>
    
    <RemoteUserProfile 
      v-if="currentUser"
      :user="currentUser" 
    />
  </div>
</template>
```

### 手动组合多个微前端

```js
/**
 * 手动组合多个微前端应用
 */
// router/index.js - 主应用路由
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

// 应用容器组件
const MicroAppContainer = () => import('@/components/MicroAppContainer.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    // 微应用路由
    {
      path: '/app1/:pathMatch(.*)*',
      name: 'MicroApp1',
      component: MicroAppContainer,
      props: { name: 'app1', baseUrl: 'http://localhost:5001' }
    },
    {
      path: '/app2/:pathMatch(.*)*',
      name: 'MicroApp2',
      component: MicroAppContainer,
      props: { name: 'app2', baseUrl: 'http://localhost:5002' }
    }
  ]
})

export default router

// components/MicroAppContainer.vue - 微应用容器
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  }
})

const appContainer = ref(null)
const route = useRoute()

// 加载微应用
async function loadMicroApp() {
  if (!appContainer.value) return

  // 创建iframe加载微应用
  const iframe = document.createElement('iframe')
  iframe.src = `${props.baseUrl}${route.fullPath.replace(`/app1`, '')}`
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  
  // 清除现有内容
  appContainer.value.innerHTML = ''
  // 添加iframe
  appContainer.value.appendChild(iframe)
  
  // 处理通信
  window.addEventListener('message', handleMessage)
}

// 处理来自微应用的消息
function handleMessage(event) {
  if (event.origin !== props.baseUrl) return
  
  const { type, data } = event.data
  
  if (type === 'navigation') {
    // 处理微应用内部导航
    router.push(`/${props.name}${data.path}`)
  } else if (type === 'auth') {
    // 处理认证请求
    const authStore = useAuthStore()
    authStore.setToken(data.token)
  }
}

onMounted(() => {
  loadMicroApp()
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

// 路由变化时重新加载微应用
watch(() => route.fullPath, () => {
  loadMicroApp()
})
</script>

<template>
  <div ref="appContainer" class="micro-app-container"></div>
</template>
```

## 状态管理策略

### 全局/局部状态平衡

```js
/**
 * 平衡全局和局部状态
 */
// stores/index.js - 根状态存储
import { createPinia } from 'pinia'

// 创建主Pinia实例
const pinia = createPinia()

export default pinia

// stores/global/user.js - 全局用户状态
import { defineStore } from 'pinia'
import { api } from '@/services/api'

// 定义全局用户状态
export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === 'admin'
  },
  
  actions: {
    async fetchUser() {
      this.loading = true
      try {
        const response = await api.users.getCurrentUser()
        this.currentUser = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    clearUser() {
      this.currentUser = null
    }
  },
  
  // 持久化配置
  persist: {
    storage: localStorage,
    paths: ['currentUser']
  }
})

// views/FeatureView.vue - 使用局部状态
<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/global/user'

// 全局状态
const userStore = useUserStore()

// 局部状态 - 只在此组件中使用的状态
const localState = reactive({
  searchQuery: '',
  selectedItems: [],
  viewMode: 'grid'
})

// 计算属性
const filteredItems = computed(() => {
  // 结合全局和局部状态
  return items.value.filter(item => 
    item.name.toLowerCase().includes(localState.searchQuery.toLowerCase()) &&
    (userStore.isAdmin || !item.adminOnly)
  )
})

onMounted(() => {
  // 如果需要，确保用户已加载
  if (!userStore.currentUser) {
    userStore.fetchUser()
  }
})
</script>
```

### 状态管理架构模式

```js
/**
 * 状态管理架构模式
 */
// stores/modules/cart.js - 购物车状态模块
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false
  }),
  
  getters: {
    itemCount: (state) => state.items.length,
    
    totalPrice: (state) => state.items.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    ),
    
    isCartEmpty: (state) => state.items.length === 0
  },
  
  actions: {
    // 命令 - 修改状态的动作
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity
        })
      }
      
      // 同步到服务器
      this.syncCart()
    },
    
    removeItem(productId) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.syncCart()
      }
    },
    
    clearCart() {
      this.items = []
      this.syncCart()
    },
    
    // 异步操作
    async fetchCart() {
      this.loading = true
      try {
        const response = await api.cart.getCart()
        this.items = response.data.items
      } catch (error) {
        console.error('Failed to fetch cart', error)
      } finally {
        this.loading = false
      }
    },
    
    async syncCart() {
      try {
        await api.cart.updateCart({ items: this.items })
      } catch (error) {
        console.error('Failed to sync cart', error)
      }
    }
  },
  
  // 持久化配置
  persist: {
    storage: localStorage,
    paths: ['items']
  }
})

// 组件如何使用
// components/AddToCartButton.vue
<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/modules/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const quantity = ref(1)
const cartStore = useCartStore()

function addToCart() {
  cartStore.addItem(props.product, quantity.value)
}
</script>

<template>
  <div>
    <input v-model="quantity" type="number" min="1" />
    <button @click="addToCart">添加到购物车</button>
  </div>
</template>
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶)
- [高级主题](/vue/advanced-topics)
- [性能优化](/vue/performance-optimization)
- [测试策略](/vue/testing-strategies) 