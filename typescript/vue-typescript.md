---
layout: doc
title: Vue与TypeScript
---

# Vue与TypeScript

TypeScript为Vue应用程序开发带来了类型安全和更好的开发体验。本文将详细介绍如何在Vue项目中高效使用TypeScript，帮助您构建更加健壮的应用程序。

## Vue 3与TypeScript

Vue 3是专门为TypeScript设计的，提供了一流的TypeScript支持。与Vue 2相比，Vue 3带来了很多改进，使得TypeScript集成更加顺畅。

### 基于组合式API的类型推导

Vue 3的组合式API(Composition API)为TypeScript提供了极好的类型推导能力：

```ts
<script setup lang="ts">
import { ref, computed } from 'vue'

// 变量类型自动推导
const count = ref(0) // 推导为 Ref<number> 类型
const message = ref('Hello') // 推导为 Ref<string> 类型

// 计算属性类型推导
const doubleCount = computed(() => count.value * 2) // 推导为 ComputedRef<number> 类型

// 函数参数与返回值类型
function increment(step: number): void {
  count.value += step
}
</script>
```

### defineProps与defineEmits

使用`defineProps`和`defineEmits`可以获得完整的类型检查：

```ts
<script setup lang="ts">
// 方式1：使用类型注解
const props = defineProps<{
  name: string
  age?: number
  isActive: boolean
}>()

// 方式2：使用运行时验证 + 类型推导
const props = defineProps({
  name: { type: String, required: true },
  age: { type: Number, default: 18 },
  isActive: Boolean
})

// 方式3：使用withDefaults设置默认值 (只适用于类型注解方式)
const props = withDefaults(defineProps<{
  name: string
  age?: number
  isActive?: boolean
}>(), {
  age: 18,
  isActive: false
})

// Emit 类型定义
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'change', id: number, value: string): void
}>()

// 或者使用更简洁的语法
const emit = defineEmits<{
  'update': [value: string]
  'change': [id: number, value: string]
}>()
</script>
```

### 类型化的Ref模板引用

在Vue 3中，模板引用可以带有明确的类型：

```ts
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 为DOM元素设置类型
const inputEl = ref<HTMLInputElement | null>(null)

// 为Vue组件设置类型
import MyComponent from './MyComponent.vue'
const myComponentRef = ref<InstanceType<typeof MyComponent> | null>(null)

onMounted(() => {
  // 类型安全的DOM访问
  if (inputEl.value) {
    inputEl.value.focus()
  }
  
  // 类型安全的组件方法访问
  if (myComponentRef.value) {
    myComponentRef.value.someMethod()
  }
})
</script>

<template>
  <input ref="inputEl" />
  <MyComponent ref="myComponentRef" />
</template>
```

## 定义类型

### 为Props定义接口

推荐使用TypeScript接口或类型别名来定义props：

```ts
// 使用接口
interface UserProps {
  id: number
  name: string
  email: string
  role?: 'admin' | 'user' | 'guest'
  settings: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
}

// 在组件中使用
const props = defineProps<UserProps>()
```

### 事件类型

为了更好的类型安全，可以为事件定义明确的类型：

```ts
// 定义事件类型
type UserEvents = {
  'update:name': [name: string]
  'select': [user: UserProps]
  'status-change': [id: number, status: 'active' | 'inactive']
}

// 在组件中使用
const emit = defineEmits<UserEvents>()

// 使用事件
function updateName(name: string) {
  emit('update:name', name) // 类型正确
}

function selectInvalidUser() {
  // @ts-expect-error - 类型错误：缺少必要字段
  emit('select', { id: 1, name: 'User' }) 
}
```

### 为响应式状态定义类型

```ts
<script setup lang="ts">
import { reactive, ref } from 'vue'

// 复杂状态类型定义
interface UserState {
  id: number
  profile: {
    name: string
    bio: string
    social: {
      twitter?: string
      github?: string
    }
  }
  posts: Array<{
    id: number
    title: string
    published: boolean
  }>
}

// 使用reactive
const user = reactive<UserState>({
  id: 1,
  profile: {
    name: 'TypeScript User',
    bio: 'I love TypeScript',
    social: {}
  },
  posts: []
})

// 使用ref存储复杂类型
const currentUser = ref<UserState | null>(null)
</script>
```

## 全局类型声明

### 组件类型增强

在TypeScript项目中，可以通过模块增强(module augmentation)来扩展Vue的类型：

```ts
// types/vue.d.ts
import { Store } from 'vuex'
import { Router } from 'vue-router'

declare module 'vue' {
  interface ComponentCustomProperties {
    $store: Store<any>
    $router: Router
    $filters: {
      formatDate(date: Date): string
      capitalize(value: string): string
    }
    $api: {
      get(url: string): Promise<any>
      post(url: string, data: any): Promise<any>
    }
  }
}

// 确保这个文件被当作模块
export {}
```

### 全局属性类型化

```ts
// 在main.ts中
import { createApp } from 'vue'
import App from './App.vue'
import { api } from './api'

const app = createApp(App)

// 添加全局属性
app.config.globalProperties.$filters = {
  formatDate(date: Date): string {
    return date.toLocaleDateString()
  },
  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
}

app.config.globalProperties.$api = api

app.mount('#app')
```

## 使用TypeScript与Pinia

Vue 3生态的状态管理首选Pinia，它提供了一流的TypeScript支持：

```ts
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn(): boolean {
      return !!this.currentUser
    },
    
    userById: (state) => {
      return (id: number): User | undefined => {
        return state.users.find(user => user.id === id)
      }
    }
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        this.users = data as User[]
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error'
      } finally {
        this.loading = false
      }
    },
    
    async login(email: string, password: string): Promise<boolean> {
      // 登录逻辑
      return true
    }
  }
})
```

在组件中使用：

```ts
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 完整类型支持
const user = userStore.currentUser // 类型: User | null
const isLoggedIn = userStore.isLoggedIn // 类型: boolean

// 调用action
userStore.fetchUsers()

// 使用带参数的getter
const user1 = userStore.userById(1) // 类型: User | undefined
</script>
```

## 使用TypeScript与Vue Router

Vue Router与TypeScript结合使用时也能获得良好的类型推导：

```ts
// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import { useUserStore } from '@/stores/user'

// 路由元信息类型扩展
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: '个人资料'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 带类型的导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 类型安全地访问meta字段
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 检查角色
  if (to.meta.roles && userStore.currentUser) {
    const hasRole = to.meta.roles.includes(userStore.currentUser.role)
    if (!hasRole) {
      next({ name: 'Forbidden' })
      return
    }
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - My App`
  }
  
  next()
})

export default router
```

在组件中使用：

```ts
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 类型安全的路由参数访问
const id = Number(route.params.id)

// 类型安全的路由导航
function navigateToProfile() {
  router.push({ name: 'Profile' })
}

// 类型安全的路由元信息访问
const requiresAuth = route.meta.requiresAuth // 类型: boolean | undefined
</script>
```

## 编写类型安全的组件

### 具名插槽的TypeScript支持

在Vue 3中可以为具名插槽提供类型：

```ts
<script setup lang="ts">
// 定义插槽的Props类型
interface HeaderSlotProps {
  title: string
  subtitle?: string
}

interface ItemSlotProps {
  item: {
    id: number
    name: string
  }
  index: number
}

// 提供给模板中的插槽
defineSlots<{
  header(props: HeaderSlotProps): any
  default(): any
  item(props: ItemSlotProps): any
}>()
</script>

<template>
  <div>
    <header>
      <slot name="header" title="标题" subtitle="副标题"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        <slot name="item" :item="item" :index="index"></slot>
      </li>
    </ul>
  </div>
</template>
```

使用带类型的插槽：

```vue
<template>
  <MyComponent>
    <template #header="{ title, subtitle }">
      <h1>{{ title }}</h1>
      <h2 v-if="subtitle">{{ subtitle }}</h2>
    </template>
    
    <template #item="{ item, index }">
      <div>{{ index + 1 }}. {{ item.name }}</div>
    </template>
  </MyComponent>
</template>
```

### 使用泛型组件

可以创建灵活的泛型组件：

```ts
<script setup lang="ts">
import { computed } from 'vue'

// 定义泛型类型参数
interface Props<T> {
  items: T[]
  selectedId?: string | number
  itemKey: keyof T
  itemText: keyof T
}

// 使用泛型约束props
const props = defineProps<Props<any>>()

// 提供事件
const emit = defineEmits<{
  'select': [item: any]
}>()

const selectedItem = computed(() => {
  if (props.selectedId === undefined) return null
  return props.items.find(item => item[props.itemKey] === props.selectedId) || null
})

function select(item: any) {
  emit('select', item)
}
</script>

<template>
  <ul>
    <li 
      v-for="item in items" 
      :key="item[itemKey]" 
      :class="{ active: item[itemKey] === selectedId }"
      @click="select(item)"
    >
      {{ item[itemText] }}
    </li>
  </ul>
</template>
```

使用泛型组件：

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'User 1', email: 'user1@example.com' },
  { id: 2, name: 'User 2', email: 'user2@example.com' }
]
</script>

<template>
  <GenericList
    :items="users"
    item-key="id"
    item-text="name"
    :selected-id="1"
    @select="(user) => console.log(user.email)"
  />
</template>
```

## 编写类型安全的Composables

Composables（组合式函数）是Vue 3的强大特性，结合TypeScript可以创建可重用且类型安全的逻辑：

```ts
// composables/useAsyncData.ts
import { ref, Ref, computed } from 'vue'

interface UseAsyncDataOptions<T> {
  immediate?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseAsyncDataReturn<T, P extends any[]> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (...args: P) => Promise<T>
  hasData: Ref<boolean>
  reset: () => void
}

/**
 * 异步数据获取和管理的组合式函数
 */
export function useAsyncData<T, P extends any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T, P> {
  const {
    immediate = false,
    initialData = null,
    onSuccess,
    onError
  } = options
  
  const data = ref<T | null>(initialData) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const hasData = computed(() => data.value !== null)
  
  async function execute(...args: P): Promise<T> {
    loading.value = true
    error.value = null
    
    try {
      const result = await asyncFunction(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err) {
      const thrownError = err instanceof Error ? err : new Error(String(err))
      error.value = thrownError
      onError?.(thrownError)
      throw thrownError
    } finally {
      loading.value = false
    }
  }
  
  function reset() {
    data.value = initialData
    error.value = null
    loading.value = false
  }
  
  // 如果设置了immediate，立即执行
  if (immediate) {
    execute([] as unknown as P[0])
  }
  
  return {
    data,
    loading,
    error,
    execute,
    hasData,
    reset
  }
}
```

在组件中使用：

```ts
<script setup lang="ts">
import { useAsyncData } from '@/composables/useAsyncData'

interface User {
  id: number
  name: string
  email: string
}

// 定义API函数
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

// 使用组合式函数
const { 
  data: user, 
  loading, 
  error, 
  execute: loadUser 
} = useAsyncData(fetchUser, {
  immediate: true,
  onSuccess: (user) => console.log(`Loaded user: ${user.name}`),
  initialData: { id: 0, name: 'Loading...', email: '' }
})

// 强类型的响应式数据
if (user.value) {
  console.log(user.value.email) // 类型安全的访问
}

// 使用execute方法重新加载
function reloadUser(userId: number) {
  loadUser(userId) // 类型安全的参数
}
</script>
```

## 高级类型技巧

### 为事件处理器添加类型

```ts
<script setup lang="ts">
// 事件类型
function handleClick(event: MouseEvent) {
  console.log(event.clientX, event.clientY)
}

// 表单事件类型
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}

// 防止事件冒泡
function handleClickNoPropagation(event: MouseEvent) {
  event.stopPropagation()
}
</script>
```

### 扩展Window和Document类型

```ts
// types/global.d.ts
interface Window {
  // 添加全局变量
  googleMaps?: any
  $appConfig: {
    apiUrl: string
    environment: 'development' | 'production'
  }
}

interface Document {
  // 添加自定义方法
  $showModal: (message: string) => void
}

// 使用
window.$appConfig.apiUrl // 类型安全
document.$showModal('Hello') // 类型安全
```

## 常见陷阱和解决方案

### 类型断言的正确使用

```ts
<script setup lang="ts">
import { ref } from 'vue'

// 避免过度使用 as any
const data = ref<string | null>(null)

// 错误方式
function processData() {
  // 不安全，会导致运行时错误
  (data.value as string).toUpperCase() 
}

// 正确方式
function processDataSafely() {
  if (data.value) {
    // 类型缩窄，安全且受类型保护
    data.value.toUpperCase() 
  }
}

// 当确实需要断言时
function externalLibraryCall() {
  const element = document.getElementById('app')
  
  // 当你确信元素存在且是特定类型
  if (element) {
    (element as HTMLDivElement).style.display = 'none'
  }
}
</script>
```

### 处理第三方库

有时需要为第三方库创建类型声明：

```ts
// types/some-untyped-module.d.ts
declare module 'some-untyped-module' {
  export function doSomething(value: string): Promise<string>
  
  export interface Options {
    timeout?: number
    cache?: boolean
  }
  
  export default function main(options?: Options): void
}

// 使用
import someModule from 'some-untyped-module'
someModule({ timeout: 1000 }) // 类型安全
```

## 最佳实践和技巧

### 项目配置

推荐的tsconfig.json配置：

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "webpack-env",
      "jest",
      "node"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 类型检查性能优化

随着项目变大，TypeScript类型检查可能会变慢，这里有一些提升性能的技巧：

1. 使用Project References分割大型项目
2. 确保不必要的文件不包含在`include`中
3. 使用`skipLibCheck: true`减少对node_modules的检查
4. 考虑使用`incremental: true`启用增量编译

### 开发工具

利用IDE和工具获得更好的TypeScript体验：

1. **VS Code**：使用Volar扩展获得最佳Vue+TypeScript体验
2. **ESLint**：使用`@typescript-eslint`规则集
3. **vue-tsc**：用于命令行类型检查和构建

```json
// package.json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint --ext .ts,.vue --ignore-path .gitignore ."
  }
}
```

## 总结

Vue 3与TypeScript的结合提供了优秀的开发体验和类型安全保障。通过遵循本文介绍的最佳实践，你可以充分利用两者的优势，构建出类型安全、可维护性高的Vue应用程序。

关键要点：

1. 使用`<script setup lang="ts">`获得最佳类型推导体验
2. 为props、events和slots定义清晰的类型
3. 合理使用接口和类型别名组织代码
4. 利用Vue 3的组合式API创建类型安全的可复用逻辑
5. 正确处理类型断言和空值检查
6. 为第三方库和全局变量提供类型定义

随着Vue应用的复杂度增加，TypeScript带来的好处会更加明显，帮助你捕获潜在错误并提高代码质量。 