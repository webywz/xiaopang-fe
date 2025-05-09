# Vue 3性能优化

本章节将深入探讨Vue 3应用的性能优化策略和技巧，帮助开发者构建高性能的Vue 3应用。

## 应用启动性能优化

### 按需引入和tree-shaking

```js
/**
 * Vue 3按需引入API
 */
// ❌ 导入整个Vue库，包体积大
import Vue from 'vue'

// ✅ 按需导入，减小包体积
import { createApp, ref, computed } from 'vue'
```

### 异步组件和路由

```js
/**
 * 异步组件和路由优化
 */
import { defineAsyncComponent } from 'vue'
import { createRouter } from 'vue-router'

// 1. 异步组件 - 按需加载
const AsyncComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)

// 2. 路由级代码分割
const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      // 异步加载路由组件
      component: () => import('./views/Dashboard.vue'),
      // 组件预获取，提升用户体验
      // 当鼠标悬停在指向该路由的链接上时预加载
      meta: { preload: true }
    },
    // 按模块分组打包
    {
      path: '/settings',
      component: () => import(/* webpackChunkName: "admin" */ './views/Settings.vue')
    },
    {
      path: '/admin',
      component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
    }
  ]
})

// 3. 实现路由组件预获取
router.beforeResolve((to, from, next) => {
  // 找到即将要进入的路由组件，预获取其异步组件
  const matched = router.resolve(to).matched
  const preloadComponents = matched
    .filter(record => record.meta.preload)
    .flatMap(record => record.components ? Object.values(record.components) : [])
  
  // 预获取组件
  for (const component of preloadComponents) {
    // 对于组件工厂函数，调用它会开始加载
    if (typeof component === 'function') {
      component()
    }
  }
  
  next()
})
```

### 懒加载和优先级控制

```js
/**
 * 组件懒加载和优先级控制
 */
import { defineAsyncComponent, h } from 'vue'

// 使用异步加载并添加延迟时间，让关键组件先加载
const LowPriorityComponent = defineAsyncComponent(() => 
  new Promise(resolve => {
    // 延迟低优先级组件的加载
    setTimeout(() => {
      resolve(import('./components/LowPriorityComponent.vue'))
    }, 100)
  })
)

// 用占位符快速渲染页面结构
function SkeletonLayout() {
  return h('div', { class: 'skeleton-layout' }, [
    h('div', { class: 'skeleton-header' }),
    h('div', { class: 'skeleton-sidebar' }),
    h('div', { class: 'skeleton-content' })
  ])
}
```

## 运行时性能优化

### v-once和v-memo指令

```vue
<template>
  <div>
    <!-- 静态内容只渲染一次 -->
    <header v-once>
      <h1>{{ appTitle }}</h1>
      <AppLogo />
    </header>
    
    <!-- 仅当特定依赖项更改时重新渲染 -->
    <div v-for="item in items" :key="item.id">
      <!-- item.id和item.status变化时重新渲染 -->
      <ItemCard v-memo="[item.id, item.status]" :item="item" />
    </div>
  </div>
</template>

<script setup>
/**
 * v-once和v-memo优化
 */
import { ref } from 'vue'

const appTitle = 'Performance Dashboard'

const items = ref([
  { id: 1, name: 'Item 1', status: 'active', data: {...} },
  { id: 2, name: 'Item 2', status: 'pending', data: {...} },
  // 更多项目...
])

// 即使items数组发生变化，只有当id或status变化时，ItemCard才会重新渲染
</script>
```

### 计算属性与缓存

```js
/**
 * 计算属性优化
 */
import { ref, computed, watchEffect } from 'vue'

const users = ref([
  /* 大量用户数据 */
])

// ✅ 使用计算属性缓存结果
const activeUsers = computed(() => {
  console.log('Computing active users') // 只在依赖变化时执行
  return users.value.filter(user => user.active)
})

// ❌ 不推荐: 在模板中使用过滤器方法
function getActiveUsers() {
  console.log('Getting active users') // 每次渲染都会执行
  return users.value.filter(user => user.active)
}

// ✅ 不频繁变化的复杂计算，使用带getter/setter的计算属性
const sortedFilteredUsers = computed({
  get() {
    console.log('Complex sorting and filtering')
    return users.value
      .filter(user => user.active)
      .sort((a, b) => a.name.localeCompare(b.name))
  },
  set(newUsers) {
    // 处理外部设置该计算属性的情况
    users.value = newUsers.map(user => ({ ...user, active: true }))
  }
})
```

### 虚拟列表渲染大数据集

```vue
<template>
  <div>
    <!-- 自定义虚拟滚动实现 -->
    <div
      class="virtual-list"
      @scroll="onScroll"
      ref="containerRef"
      :style="{ height: containerHeight + 'px', overflow: 'auto' }"
    >
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{
            position: 'absolute',
            top: item._offsetTop + 'px',
            width: '100%',
            height: itemHeight + 'px'
          }"
        >
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 虚拟列表实现
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 列表配置
const itemHeight = 50 // 每项固定高度
const containerHeight = 400 // 容器高度
const buffer = 5 // 上下额外渲染的项数

// 模拟大数据集
const allItems = ref(
  Array.from({ length: 10000 }).map((_, i) => ({
    id: i,
    content: `Item ${i}`,
    _offsetTop: i * itemHeight // 预计算位置
  }))
)

// 容器引用
const containerRef = ref(null)
// 滚动位置
const scrollTop = ref(0)

// 计算可见项
const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight) - buffer
  const end = Math.ceil((scrollTop.value + containerHeight) / itemHeight) + buffer
  
  const startIndex = Math.max(0, start)
  const endIndex = Math.min(allItems.value.length - 1, end)
  
  return allItems.value.slice(startIndex, endIndex + 1)
})

// 计算总高度
const totalHeight = computed(() => allItems.value.length * itemHeight)

// 处理滚动事件
function onScroll(event) {
  scrollTop.value = event.target.scrollTop
}

// 也可以使用现成的虚拟列表库
// 如: vue-virtual-scroller, vue-virtual-scroll-grid
</script>
```

### 延迟加载和组件卸载策略

```vue
<template>
  <div>
    <!-- 可视区域内的图片懒加载 -->
    <div v-for="image in images" :key="image.id">
      <img
        v-if="isVisible(image.id)"
        :src="image.url"
        :alt="image.alt"
      />
      <div v-else class="placeholder"></div>
    </div>
    
    <!-- 使用v-show而非v-if保留DOM但隐藏显示 -->
    <div v-show="showDetails" class="details-panel">
      <!-- 复杂但频繁切换的内容 -->
    </div>
    
    <!-- 使用KeepAlive缓存组件实例 -->
    <keep-alive :include="cachedComponents" :max="10">
      <component :is="currentTab" />
    </keep-alive>
  </div>
</template>

<script setup>
/**
 * 延迟加载和组件卸载策略
 */
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// 图片数据
const images = ref([/* 图片列表 */])
// 可见元素ID集合
const visibleIds = ref(new Set())

// 注册交叉观察器
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.dataset.id
      if (entry.isIntersecting) {
        visibleIds.value.add(Number(id))
      } else {
        visibleIds.value.delete(Number(id))
      }
    })
  }, { rootMargin: '100px' })
  
  // 观察所有图片占位符
  document.querySelectorAll('.placeholder').forEach(el => {
    observer.observe(el)
  })
  
  // 清理
  onUnmounted(() => {
    observer.disconnect()
  })
})

// 检查元素是否可见
function isVisible(id) {
  return visibleIds.value.has(id)
}

// KeepAlive缓存策略
const cachedComponents = ['UserProfile', 'Dashboard', 'FrequentAccess']
const currentTab = ref('Dashboard')
</script>
```

## 构建优化

### Vite开发和构建优化

```js
/**
 * vite.config.js配置
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    // 浏览器兼容性
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // 包大小分析
    visualizer({
      open: true,
      gzipSize: true
    })
  ],
  // 构建优化
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        // 将第三方库单独打包
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'lodash': ['lodash-es'],
          'ui': ['element-plus']
        }
      }
    },
    // 启用gzip压缩
    reportCompressedSize: true,
    // CSS代码分割
    cssCodeSplit: true,
    // 缩小文件大小
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 删除console语句
        drop_debugger: true // 删除debugger语句
      }
    }
  },
  // 开发服务器配置
  server: {
    hmr: true, // 热更新
    // 预构建依赖项
    optimizeDeps: {
      include: [
        'vue', 'vue-router', 'pinia',
        'lodash-es', 'axios'
      ]
    }
  }
})
```

### 代码分割和异步加载策略

```js
/**
 * 高级代码分割策略
 */
// 路由代码分割
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  // 管理员模块
  {
    path: '/admin',
    // 预获取整个管理员模块
    component: () => import(/* webpackPrefetch: true */ './views/Admin.vue'),
    children: [
      {
        path: 'users',
        component: () => import('./views/admin/Users.vue')
      },
      {
        path: 'settings',
        component: () => import('./views/admin/Settings.vue')
      }
    ]
  },
  // 按功能模块分组
  {
    path: '/products',
    component: () => import(/* webpackChunkName: "shop" */ './views/Products.vue')
  },
  {
    path: '/cart',
    component: () => import(/* webpackChunkName: "shop" */ './views/Cart.vue')
  },
  {
    path: '/checkout',
    component: () => import(/* webpackChunkName: "shop" */ './views/Checkout.vue')
  }
]

// 按需加载非关键模块
function setupAnalytics() {
  // 当用户交互后再加载分析代码
  document.addEventListener('click', () => {
    import('./analytics').then(module => {
      module.init()
    })
  }, { once: true })
}
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶)
- [高级主题](/vue/advanced-topics) 