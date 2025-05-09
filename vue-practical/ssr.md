---
layout: doc
title: Vue 3的SSR实践与Nuxt 3应用
---

# Vue 3的SSR实践与Nuxt 3应用

## 概述

服务端渲染(SSR)是提升Vue应用性能、SEO和用户体验的重要技术。本文将介绍Vue 3的SSR实践和Nuxt 3框架的应用，帮助开发者构建高性能、可扩展的服务端渲染应用。

## 服务端渲染基础

### 1. 什么是SSR

服务端渲染(Server-Side Rendering)是在服务器上执行JavaScript代码生成HTML，然后发送到浏览器的技术。与传统客户端渲染(CSR)相比，SSR有以下优势：

- **更好的SEO**: 搜索引擎可直接抓取完整的HTML内容
- **更快的首屏加载**: 用户无需等待JavaScript加载和执行即可看到内容
- **更好的用户体验**: 特别是在低性能设备或网络连接不佳的情况下

### 2. SSR vs CSR vs SSG

| 渲染方式 | 描述 | 适用场景 |
|---------|------|----------|
| **客户端渲染(CSR)** | 在浏览器中渲染 | 后台管理系统、交互复杂的应用 |
| **服务端渲染(SSR)** | 在服务器上渲染后发送到浏览器 | 需要SEO的内容网站、社交媒体 |
| **静态站点生成(SSG)** | 构建时预渲染所有页面 | 博客、文档站点、营销网站 |
| **增量静态再生(ISR)** | 结合SSG和SSR的优势 | 内容更新频率适中的网站 |

### 3. Vue 3 SSR的工作流程

![Vue SSR流程](https://v3.vuejs.org/guide/ssr/ssr-architecture.png)

1. 服务器接收请求
2. 创建Vue应用实例
3. 在服务器上渲染Vue组件为HTML
4. 将HTML发送到客户端
5. 客户端加载JavaScript
6. 客户端"激活"(Hydration)应用，接管交互功能

## 手动实现Vue 3 SSR

### 1. 基础项目设置

要手动实现Vue 3 SSR，首先需要设置项目：

```bash
# 创建项目目录
mkdir vue-ssr-app
cd vue-ssr-app

# 初始化package.json
npm init -y

# 安装依赖
npm install vue@next vue-router@next express
npm install -D vite @vitejs/plugin-vue
```

### 2. 创建通用入口文件

```js
// src/app.js - 通用入口文件
import { createSSRApp } from 'vue'
import { createRouter } from './router'
import App from './App.vue'

// 导出一个工厂函数，为每个请求创建新的应用实例
export function createApp() {
  const app = createSSRApp(App)
  const router = createRouter()
  
  app.use(router)
  
  return { app, router }
}
```

### 3. 创建客户端和服务端入口

```js
// src/entry-client.js - 客户端入口
import { createApp } from './app'

const { app, router } = createApp()

// 等待路由就绪后挂载应用
router.isReady().then(() => {
  app.mount('#app')
})
```

```js
// src/entry-server.js - 服务端入口
import { createApp } from './app'
import { renderToString } from '@vue/server-renderer'

export async function render(url, manifest) {
  const { app, router } = createApp()
  
  // 设置服务端路由位置
  await router.push(url)
  await router.isReady()
  
  // 渲染应用为HTML字符串
  const ctx = {}
  const html = await renderToString(app, ctx)
  
  return { html }
}
```

### 4. 配置Vite

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    ssr: true,
  }
})
```

### 5. 创建Express服务器

```js
// server.js
import fs from 'fs'
import path from 'path'
import express from 'express'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

async function createServer() {
  const app = express()
  
  let vite
  if (!isProd) {
    // 开发模式：使用Vite的开发服务器
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    
    app.use(vite.middlewares)
  } else {
    // 生产模式：使用静态文件服务
    app.use(express.static(path.resolve(__dirname, 'dist/client')))
  }
  
  app.use('*', async (req, res) => {
    const url = req.originalUrl
    
    try {
      let template, render
      
      if (!isProd) {
        // 开发模式：按需编译
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        // 生产模式：使用构建好的文件
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
        render = (await import('./dist/server/entry-server.js')).render
      }
      
      const { html: appHtml } = await render(url)
      
      const html = template.replace(`<!--app-html-->`, appHtml)
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })
  
  return { app }
}

createServer().then(({ app }) => {
  app.listen(3000, () => {
    console.log('Server started at http://localhost:3000')
  })
})
```

## Nuxt 3入门

### 1. Nuxt 3简介

Nuxt 3是基于Vue 3的全栈框架，提供了开箱即用的SSR能力和良好的开发体验。它具有以下特性：

- 自动路由配置
- 服务端渲染
- 静态站点生成
- 组件自动导入
- 混合渲染模式
- TypeScript支持
- Vite构建系统

### 2. 创建Nuxt 3项目

```bash
# 使用npx创建项目
npx nuxi init nuxt3-app

# 进入项目目录并安装依赖
cd nuxt3-app
npm install

# 启动开发服务器
npm run dev
```

### 3. Nuxt 3基本目录结构

```
/nuxt3-app
  /assets        # 静态资源文件
  /components    # Vue组件目录（自动导入）
  /composables   # 组合式函数目录（自动导入）
  /content       # 内容目录（用于Nuxt Content模块）
  /layouts       # 布局组件
  /middleware    # 路由中间件
  /pages         # 页面组件（自动生成路由）
  /plugins       # Nuxt插件
  /public        # 公共静态文件
  /server        # 服务器API和中间件
  .env           # 环境变量
  app.vue        # 应用入口组件
  nuxt.config.ts # Nuxt配置文件
```

### 4. Nuxt 3配置

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // 应用模式：'universal' | 'spa'
  ssr: true,
  
  // 自动导入
  imports: {
    dirs: ['composables/**']
  },
  
  // 模块
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/content'
  ],
  
  // 运行时配置
  runtimeConfig: {
    // 仅服务端访问的配置
    apiSecret: process.env.API_SECRET,
    // 同时在客户端和服务端可访问的配置
    public: {
      apiBase: process.env.API_BASE
    }
  },
  
  // Vite配置
  vite: {
    optimizeDeps: {
      include: ['lodash-es']
    }
  }
})
```

## Nuxt 3核心概念

### 1. 页面与路由

Nuxt 3基于目录结构自动生成路由配置：

```
/pages
  index.vue             # 主页路由 (/)
  about.vue             # 关于页 (/about)
  /users
    index.vue           # 用户列表 (/users)
    [id].vue            # 用户详情页 (/users/:id)
  /products
    [category]/[id].vue # 产品详情 (/products/:category/:id)
```

动态路由参数示例：

```vue
<!-- pages/users/[id].vue -->
<template>
  <div>
    <h1>用户详情</h1>
    <p>用户ID: {{ $route.params.id }}</p>
    <p>用户名: {{ user.name }}</p>
  </div>
</template>

<script setup>
const route = useRoute()
const { id } = route.params

// 数据获取
const { data: user } = await useFetch(`/api/users/${id}`)
</script>
```

### 2. 数据获取

Nuxt 3提供了多种数据获取方式：

#### 使用useFetch

```vue
<script setup>
// 自动处理SSR和客户端状态
const { data, pending, error, refresh } = await useFetch('/api/users')
</script>

<template>
  <div>
    <p v-if="pending">加载中...</p>
    <p v-else-if="error">加载失败: {{ error }}</p>
    <ul v-else>
      <li v-for="user in data" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
    <button @click="refresh">刷新</button>
  </div>
</template>
```

#### 使用useAsyncData

```vue
<script setup>
// 自定义获取逻辑
const { data: products, pending } = await useAsyncData('products', async () => {
  const res = await fetch('https://api.example.com/products')
  return res.json()
})
</script>
```

#### 服务端API路由

```ts
// server/api/users.ts
export default defineEventHandler(async (event) => {
  // 获取数据库数据或调用外部API
  const users = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' }
  ]
  
  return users
})

// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 在真实应用中从数据库获取用户
  return {
    id,
    name: id === '1' ? '张三' : '李四',
    email: `user${id}@example.com`
  }
})
```

### 3. 中间件

Nuxt 3支持三种中间件类型：

#### 路由中间件

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token').value
  
  if (!token && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

#### 命名中间件

```ts
// middleware/logger.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`从 ${from.path} 导航到 ${to.path}`)
})
```

#### 内联中间件

```vue
<script setup>
definePageMeta({
  middleware: [
    // 内联中间件
    function(to, from) {
      if (to.params.id === 'forbidden') {
        return abortNavigation('禁止访问')
      }
    },
    // 命名中间件
    'auth'
  ]
})
</script>
```

### 4. 布局系统

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
        <NuxtLink to="/users">用户</NuxtLink>
      </nav>
    </header>
    
    <main>
      <!-- 页面内容 -->
      <slot />
    </main>
    
    <footer>
      <p>&copy; 2023 我的Nuxt应用</p>
    </footer>
  </div>
</template>
```

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside>
      <!-- 管理侧边栏 -->
    </aside>
    <main>
      <slot />
    </main>
  </div>
</template>
```

使用布局：

```vue
<!-- pages/admin/dashboard.vue -->
<script>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <h1>管理员仪表盘</h1>
    <!-- 页面内容 -->
  </div>
</template>
```

### 5. 客户端与服务端导航

```vue
<template>
  <div>
    <!-- 声明式导航 -->
    <NuxtLink to="/users">用户列表</NuxtLink>
    
    <!-- 带参数的导航 -->
    <NuxtLink :to="{ name: 'users-id', params: { id: user.id } }">
      {{ user.name }}
    </NuxtLink>
    
    <!-- 编程式导航 -->
    <button @click="handleNavigate">查看详情</button>
  </div>
</template>

<script setup>
const router = useRouter()

function handleNavigate() {
  // 编程式导航
  router.push(`/users/1`)
  
  // 或使用Nuxt提供的方法
  navigateTo('/users/1')
}
</script>
```

## 高级SSR技术

### 1. 状态管理

与Pinia集成:

```ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})
```

在组件中使用:

```vue
<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <button @click="counter.increment">+</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '~/stores/counter'

const counter = useCounterStore()
</script>
```

### 2. 混合渲染模式

Nuxt 3支持在同一应用中混合不同的渲染模式:

```vue
<script>
// 默认SSR页面
definePageMeta({
  // 默认渲染模式
})
</script>
```

```vue
<script>
// 仅客户端渲染页面
definePageMeta({
  ssr: false
})
</script>
```

```vue
<script>
// 静态生成页面
definePageMeta({
  static: true
})
</script>
```

### 3. 缓存策略

优化SSR性能的缓存策略:

```ts
// 使用useAsyncData的缓存选项
const { data } = await useAsyncData('users', 
  () => $fetch('/api/users'),
  {
    // 缓存10分钟
    watch: [],
    server: true,
    transform: (data) => data.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    })),
    cache: 60 * 10
  }
)
```

服务端API路由缓存:

```ts
// server/api/products.ts
import { createCachedEventHandler } from '#imports'

export default cachedEventHandler(
  async (event) => {
    // 获取产品数据
    return await fetchProducts()
  },
  {
    // 缓存1小时
    maxAge: 60 * 60,
    // 根据查询参数生成缓存键
    getKey: (event) => {
      const query = getQuery(event)
      return `products-${query.category || 'all'}-${query.page || 1}`
    }
  }
)
```

### 4. 页面过渡和加载状态

```vue
<!-- app.vue -->
<template>
  <div>
    <!-- 加载进度条 -->
    <NuxtLoadingIndicator color="#38bdf8" />
    
    <!-- 页面内容 -->
    <NuxtPage />
  </div>
</template>
```

自定义页面过渡:

```css
/* assets/transitions.css */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: ['~/assets/transitions.css']
})
```

### 5. 动态导入和代码分割

```vue
<template>
  <div>
    <h1>Dashboard</h1>
    <button @click="showChart = !showChart">
      {{ showChart ? '隐藏图表' : '显示图表' }}
    </button>
    
    <!-- 懒加载组件 -->
    <LazyComplexChart v-if="showChart" :data="chartData" />
  </div>
</template>

<script setup>
const showChart = ref(false)
const chartData = ref([/* ... */])
</script>
```

## SSR性能优化

### 1. 服务端性能优化

```ts
// server/api/heavyOperation.ts
import { defineEventHandler, cachedFunction } from 'h3'

// 使用记忆化缓存复杂计算
const getProcessedData = cachedFunction(
  async (param) => {
    // 复杂且耗时的操作
    return heavyComputation(param)
  },
  {
    maxAge: 60 * 5, // 5分钟缓存
    getKey: (param) => `processed-data-${param}`
  }
)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const param = query.param || 'default'
  
  return await getProcessedData(param)
})
```

### 2. 客户端性能优化

```vue
<template>
  <div>
    <!-- 优化大列表渲染 -->
    <RecycleScroller
      class="scroller"
      :items="items"
      :item-size="50"
      key-field="id"
    >
      <template #item="{ item }">
        <div class="user-item">
          {{ item.name }}
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const { data: items } = await useFetch('/api/users?limit=1000')
</script>
```

### 3. 图片和资源优化

```vue
<template>
  <div>
    <!-- 使用Nuxt图片组件自动优化 -->
    <NuxtImg
      src="/images/hero.jpg"
      width="800"
      height="600"
      placeholder
      format="webp"
      quality="80"
      loading="lazy"
      alt="Hero image"
    />
  </div>
</template>
```

## Nuxt应用部署

### 1. 服务端渲染部署

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server'
  }
})
```

部署到Node.js服务器:

```bash
# 构建应用
npm run build

# 启动服务
node .output/server/index.mjs
```

### 2. 静态网站生成(SSG)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'static'
  }
})
```

生成静态网站:

```bash
# 生成静态文件
npm run generate

# 部署.output/public目录到CDN或静态服务器
```

### 3. 部署到Serverless平台

```ts
// nuxt.config.ts - 部署到Vercel
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  }
})

// nuxt.config.ts - 部署到Netlify
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify'
  }
})
```

## 总结

Vue 3的SSR和Nuxt 3框架为开发高性能、可扩展的现代Web应用提供了强大的解决方案。SSR技术解决了传统SPA应用的SEO和首屏加载问题，而Nuxt 3则简化了SSR应用的开发流程，提供了完备的开发体验。

通过合理选择渲染策略、优化数据获取、实施缓存策略以及使用先进的部署方案，开发者可以构建出既有良好用户体验又具备出色性能的Vue应用。不论是内容密集型网站、电子商务平台还是企业应用，SSR技术都能满足多样化的需求，帮助应用在竞争激烈的Web世界中脱颖而出。 