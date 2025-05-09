---
layout: doc
title: Vue 3应用性能优化指南
---

# Vue 3应用性能优化指南

## 概述

随着Vue应用规模的增长，性能优化变得越来越重要。本文将从多个角度介绍Vue 3应用的性能优化技巧，帮助你构建高性能的现代Vue应用。

## Vue 3特有的性能优化

### 1. 片段(Fragments)

Vue 3支持多根节点组件(片段)，减少不必要的包装元素，降低渲染成本。

```vue
<!-- Vue 2需要单根节点 -->
<template>
  <div>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </div>
</template>

<!-- Vue 3支持多根节点 -->
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

### 2. 静态提升

Vue 3会自动检测并提升静态内容，避免重复渲染。

```vue
<template>
  <div>
    <!-- 这个元素及其子元素会被视为静态内容提升 -->
    <div class="static-content">
      <h2>静态标题</h2>
      <p>静态文本内容</p>
    </div>
    
    <!-- 动态内容 -->
    <div>{{ dynamicMessage }}</div>
  </div>
</template>
```

### 3. 使用v-memo优化渲染

```vue
<template>
  <div>
    <div v-for="item in items" :key="item.id">
      <!-- 只有当item.id或item.status变化时才会重新渲染 -->
      <expensive-component v-memo="[item.id, item.status]" :item="item" />
    </div>
  </div>
</template>
```

## 代码层面优化

### 1. 合理使用v-if和v-show

```vue
<!-- 频繁切换使用v-show更高效 -->
<template>
  <div v-show="isVisible" class="chart-container">
    <!-- 复杂图表组件 -->
  </div>
</template>

<!-- 不经常切换使用v-if更合适 -->
<template>
  <heavy-component v-if="isNeeded" />
</template>
```

**最佳实践**:
- 对于频繁切换的元素使用`v-show`
- 对于条件较少改变的元素使用`v-if`

### 2. 避免v-for和v-if一起使用

```vue
<!-- 错误方式 - v-for和v-if在同一元素 -->
<template>
  <div>
    <user-item
      v-for="user in users"
      v-if="user.isActive"
      :key="user.id"
      :user="user"
    />
  </div>
</template>

<!-- 正确方式 - 先过滤数据 -->
<template>
  <div>
    <user-item
      v-for="user in activeUsers"
      :key="user.id"
      :user="user"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const activeUsers = computed(() => {
  return users.value.filter(user => user.active)
})
</script>
```

### 3. 使用计算属性优化

```vue
<template>
  <div>
    <item v-for="item in filteredItems" :key="item.id" :item="item" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([])
const searchQuery = ref('')

const filteredItems = computed(() => {
  return items.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
```

## 优化渲染性能

### 1. 使用shallowRef和shallowReactive

当你有大型数据结构，但只关心顶层属性变化时：

```js
/**
 * 使用shallowRef和shallowReactive优化大型数据结构
 */
import { shallowRef, shallowReactive } from 'vue'

// 只有.value的变化会触发更新，而不是深层属性
const userData = shallowRef({
  id: 1,
  name: 'Zhang San',
  profile: { /* 大量嵌套数据 */ }
})

// 只跟踪对象顶层属性的变化
const appState = shallowReactive({
  settings: { /* 复杂设置对象 */ },
  statistics: { /* 大量统计数据 */ }
})

// 修改顶层属性会触发更新
appState.settings = newSettings

// 修改深层属性不会自动触发更新
appState.statistics.visitCount++
```

### 2. 使用markRaw跳过响应式转换

```js
/**
 * 使用markRaw跳过不需要响应式的大型对象
 */
import { reactive, markRaw } from 'vue'

// 大型对象或第三方库实例不需要是响应式的
const chartInstance = markRaw(new ComplexChartLibrary())

const state = reactive({
  // chartInstance不会被转换为响应式
  chart: chartInstance,
  data: { /* 其他响应式数据 */ }
})
```

### 3. 使用keep-alive缓存组件

```vue
<template>
  <div>
    <keep-alive :include="cachedTabs" :max="10">
      <component :is="currentTab"></component>
    </keep-alive>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('UserList')
const cachedTabs = ['UserList', 'UserSettings']
</script>
```

### 4. 虚拟滚动优化长列表

```vue
<template>
  <div>
    <vue-virtual-scroller
      :items="items"
      :item-height="50"
      class="scroller"
    >
      <template v-slot:default="{ item }">
        <user-item :user="item" />
      </template>
    </vue-virtual-scroller>
  </div>
</template>

<script setup>
import { VueVirtualScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { ref } from 'vue'

const items = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `用户 ${i}`,
    email: `user${i}@example.com`
  }))
)
</script>
```

## Vite 构建优化

### 1. 配置优化

```js
/**
 * vite.config.js 优化配置
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es'
    ]
  },
  
  // 生产构建优化
  build: {
    // CSS代码分割
    cssCodeSplit: true,
    
    // 启用gzip压缩
    brotliSize: false,
    
    // 分块策略
    rollupOptions: {
      output: {
        // 自定义分块
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'chart-vendor': ['echarts', 'd3']
        }
      }
    },
    
    // 最小化混淆选项
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 2. 按需加载路由和组件

```js
/**
 * 路由按需加载配置
 */
import { createRouter } from 'vue-router'

const router = createRouter({
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/dashboard',
      // 使用注释控制打包分组
      component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue'),
      // 路由级预加载
      beforeEnter: (to, from, next) => {
        // 预获取可能需要的组件
        import('./components/DashboardCharts.vue')
        next()
      }
    }
  ]
})
```

## 运行时性能优化

### 1. 异步组件和Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <async-heavy-component />
    </template>
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncHeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  delay: 200,
  timeout: 5000,
  errorComponent: ErrorComponent,
  loadingComponent: LoadingComponent
})
</script>
```

### 2. 使用watch的flush: 'post' 选项

```js
/**
 * 使用flush: 'post'优化更新性能
 */
import { ref, watch } from 'vue'

const count = ref(0)

// 默认情况下，watch会在组件更新前执行
watch(count, () => {
  console.log('Count changed, before DOM update')
})

// 使用flush: 'post'选项，watch会在组件更新后执行
watch(count, () => {
  console.log('Count changed, after DOM update')
  // 安全地访问更新后的DOM
}, { flush: 'post' })
```

### 3. 利用effect作用域清理

```js
/**
 * 使用effectScope管理和清理副作用
 */
import { effectScope, ref, watch } from 'vue'

// 创建effect作用域
const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  
  // 在作用域内定义的watch会被自动收集
  watch(count, () => {
    console.log('Count changed:', count.value)
  })
  
  // 其他响应式逻辑...
})

// 清理作用域内的所有响应式效果
scope.stop()
```

## 应用层面优化

### 1. 使用服务端渲染(SSR)或静态站点生成(SSG)

使用Nuxt 3或VitePress实现SSR/SSG，提升首屏加载性能和SEO。

```js
/**
 * Nuxt 3配置示例 (nuxt.config.ts)
 */
export default defineNuxtConfig({
  // 启用缓存和静态页面
  nitro: {
    // 预渲染所有页面
    prerender: {
      crawlLinks: true,
      routes: ['/']
    },
    // 服务端缓存配置
    cache: {
      ttl: 60 * 10 // 10分钟
    }
  },
  
  // 图片优化
  image: {
    quality: 80,
    format: ['webp', 'jpg', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  }
})
```

### 2. 性能监控

```js
/**
 * 使用Performance API监控性能
 */
// 监控组件性能
app.mixin({
  beforeCreate() {
    this.$_perfStart = performance.now()
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      const time = performance.now() - this.$_perfStart
      if (time > 100) {
        console.warn(`Component ${this.$options.name} took ${time.toFixed(2)}ms to mount.`)
      }
    }
  }
})

// 使用Vue 3的性能追踪API
if (process.env.NODE_ENV !== 'production') {
  const { PerformanceObserver } = require('perf_hooks')
  
  const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`)
    })
  })
  
  obs.observe({ entryTypes: ['measure'] })
}
```

## 相关资源

- [Vue 3官方性能指南](https://vuejs.org/guide/best-practices/performance.html)
- [Vite构建优化文档](https://vitejs.dev/guide/build.html)
- [Nuxt 3性能优化](https://nuxt.com/docs/getting-started/configuration)
- [Vue 3组合式函数最佳实践](/vue-practical/composables)
- [Vue 3高级主题](/vue/advanced-topics) 