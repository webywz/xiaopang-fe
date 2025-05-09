# Vue 3路由管理

Vue Router 4是Vue 3的官方路由，它提供了与Vue 3的深度集成，完全支持Composition API和TypeScript。

## Vue Router 4安装和基本设置

### 安装

```bash
# npm
npm install vue-router@4

# yarn
yarn add vue-router@4

# pnpm
pnpm add vue-router@4
```

### 创建路由实例

```js
/**
 * Vue Router 4基本配置
 * @param {Array} routes - 路由配置数组
 * @returns {Router} Vue Router实例
 */
import { createRouter, createWebHistory } from 'vue-router'

// 1. 定义路由组件
// 可以从其他文件导入，也可以使用懒加载
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')
const User = () => import('./views/User.vue')
const NotFound = () => import('./views/NotFound.vue')

// 2. 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    // 路由元数据
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    meta: {
      requiresAuth: true
    }
  },
  {
    // 捕获所有未匹配的路由
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

// 3. 创建路由实例
const router = createRouter({
  // 使用HTML5历史模式
  history: createWebHistory(),
  // 也可以使用哈希模式
  // history: createWebHashHistory(),
  routes
})

export default router
```

### 在Vue 3应用中使用路由

```js
/**
 * 在Vue 3应用中集成路由
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
// 注册路由实例
app.use(router)
app.mount('#app')
```

## Vue Router 4的组件使用

### 路由组件与链接

```vue
<template>
  <div>
    <!-- 导航区域 -->
    <nav>
      <!-- 使用router-link导航 -->
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      
      <!-- 带参数的命名路由 -->
      <router-link :to="{ name: 'User', params: { id: 123 } }">
        用户资料
      </router-link>
      
      <!-- 带查询参数的导航 -->
      <router-link :to="{ path: '/search', query: { q: 'vue' } }">
        搜索
      </router-link>
      
      <!-- 自定义router-link (从v4开始) -->
      <router-link to="/about" v-slot="{ route, href, navigate, isActive, isExactActive }">
        <NavLink
          :href="href"
          @click="navigate"
          :class="{ active: isActive, 'exact-active': isExactActive }"
        >
          关于我们
        </NavLink>
      </router-link>
    </nav>
    
    <!-- 路由视图 -->
    <router-view v-slot="{ Component, route }">
      <!-- 带过渡效果的路由视图 -->
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active {
  color: #42b983;
  font-weight: bold;
}
</style>
```

## Composition API中的路由使用

Vue Router 4为Composition API提供了一系列组合式函数：

```vue
<script setup>
/**
 * 在Composition API中使用路由
 */
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 获取router实例用于导航
const router = useRouter()
// 获取当前route对象用于访问路由信息
const route = useRoute()

// 访问路由参数
const userId = computed(() => route.params.id)
// 访问查询参数
const searchQuery = computed(() => route.query.q)

// 监听路由变化
watch(
  () => route.params,
  (newParams) => {
    console.log('路由参数变化:', newParams)
  }
)

// 编程式导航
function goToHome() {
  router.push('/')
}

function goToUser(id) {
  router.push({
    name: 'User',
    params: { id }
  })
}

function goBack() {
  router.back()
}

function goForward() {
  router.forward()
}

// 替换当前历史记录
function replaceRoute() {
  router.replace('/about')
}
</script>

<template>
  <div>
    <p>当前用户ID: {{ userId }}</p>
    <p>搜索关键词: {{ searchQuery }}</p>
    
    <button @click="goToHome">首页</button>
    <button @click="goToUser(100)">用户100</button>
    <button @click="goBack">后退</button>
    <button @click="goForward">前进</button>
  </div>
</template>
```

## 动态路由

Vue Router 4支持动态添加和删除路由：

```js
/**
 * 动态路由管理
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home }
  ]
})

// 动态添加路由
router.addRoute({
  path: '/about',
  name: 'About',
  component: () => import('./views/About.vue')
})

// 添加嵌套路由
router.addRoute('User', {
  path: 'profile',
  component: UserProfile
})

// 检查路由是否存在
router.hasRoute('About') // true

// 获取所有路由记录
const routes = router.getRoutes()

// 删除路由
router.removeRoute('About')

// 通过添加同名路由替换现有路由
router.addRoute({
  path: '/about',
  name: 'About',
  component: NewAboutPage
})
```

## 路由守卫

Vue Router 4的导航守卫用于控制导航并处理权限验证等逻辑：

```js
/**
 * Vue Router 4导航守卫
 */
const router = createRouter({ ... })

// 全局前置守卫
router.beforeEach((to, from) => {
  // 检查用户是否已登录
  const isAuthenticated = localStorage.getItem('token')
  
  // 如果需要身份验证且用户未登录，重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
  
  // 返回false取消导航
  // 返回路由地址或路由对象进行重定向
  // 不返回或返回true继续导航
})

// 全局解析守卫
router.beforeResolve(async (to) => {
  // 导航确认前调用
  // 可用于解析数据
  if (to.meta.fetchData) {
    try {
      await fetchData(to.params.id)
    } catch (error) {
      return '/error'
    }
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 导航完成后调用
  // 不会影响导航本身
  // 常用于分析、更改页面标题等
  document.title = to.meta.title || '默认标题'
})
```

### 路由组件内的守卫

```js
/**
 * 组件内的路由守卫 (选项式API)
 */
export default {
  // 组件独享守卫
  beforeRouteEnter(to, from) {
    // 在渲染该组件的对应路由被确认前调用
    // 不能访问 `this`，因为组件实例还未创建
    // 可以传入回调访问组件实例
    return (vm) => {
      // 通过 `vm` 访问组件实例
    }
  },
  
  beforeRouteUpdate(to, from) {
    // 在当前路由改变，但此组件被复用时调用
    // 如对/users/1 和 /users/2 之间跳转
    // 可访问 `this`
  },
  
  beforeRouteLeave(to, from) {
    // 导航离开该组件的对应路由时调用
    // 可访问 `this`
    
    // 可以通过返回 false 取消离开
    const answer = window.confirm('确定要离开吗？未保存的更改将丢失！')
    if (!answer) return false
  }
}
```

### Composition API中的导航守卫

```js
/**
 * 在Composition API中使用导航守卫
 */
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    // 在当前组件内创建可重用的导航守卫
    onBeforeRouteLeave((to, from) => {
      const answer = window.confirm('确定要离开吗？未保存的更改将丢失！')
      if (!answer) return false
    })
    
    onBeforeRouteUpdate((to, from) => {
      // 处理路由参数变化
      console.log(`路由从 ${from.path} 更新到 ${to.path}`)
    })
  }
}
```

## 路由的滚动行为

可以自定义路由切换时页面滚动的位置：

```js
/**
 * 自定义路由滚动行为
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  scrollBehavior(to, from, savedPosition) {
    // 返回期望滚动到的位置
    
    // 如果存在历史滚动位置，则使用历史位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有 hash，滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 其他情况下，滚动到顶部
    return { top: 0 }
  }
})
```

## 路由懒加载

通过动态导入优化应用性能：

```js
/**
 * 路由懒加载示例
 */
const routes = [
  {
    path: '/about',
    name: 'About',
    // 懒加载路由组件
    component: () => import('./views/About.vue')
  },
  
  // 带选项的懒加载
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ './views/User.vue')
  },
  
  // 按组分块
  {
    path: '/settings',
    component: () => import(/* webpackChunkName: "admin" */ './views/Settings.vue')
  },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ './views/Admin.vue')
  }
]
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [高级进阶](/vue/高级进阶) 