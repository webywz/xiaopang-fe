---
title: Vue3企业级中后台项目实战指南
date: 2024-04-22
author: 前端小胖
tags: ['Vue3', 'TypeScript', 'Vite', '项目实战']
description: 本文将详细介绍如何使用Vue3、TypeScript、Vite等最新技术栈，从零开始搭建一个功能完整的企业级中后台系统。
---

# Vue3企业级中后台项目实战指南

在企业级应用开发中，中后台系统是一个非常重要的领域。本文将基于Vue3生态系统最新的技术栈，详细介绍如何搭建一个功能完整、性能优秀、代码优雅的中后台项目。

[[toc]]

## 技术栈概述

本项目采用以下技术栈：

- **核心框架**: Vue 3.4+
- **开发语言**: TypeScript 5.0+
- **构建工具**: Vite 5.0
- **状态管理**: Pinia 2.0
- **UI框架**: Element Plus
- **CSS方案**: UnoCSS / TailwindCSS
- **HTTP工具**: Axios
- **路由管理**: Vue Router 4
- **代码规范**: ESLint + Prettier
- **Git提交**: Husky + Commitlint
- **单元测试**: Vitest + Vue Test Utils
- **自动部署**: GitHub Actions
- **Mock方案**: Mock.js + Vite Plugin
- **权限管理**: RBAC (基于角色的访问控制)
- **国际化**: Vue I18n
- **图表**: ECharts 5
- **富文本编辑器**: TinyMCE / WangEditor
- **Excel导入导出**: XLSX.js
- **代码编辑器**: Monaco Editor

## 项目初始化

首先，我们使用Vite来创建项目：

```bash
# 创建项目
npm create vite@latest vue3-admin -- --template vue-ts

# 进入项目目录
cd vue3-admin

# 安装依赖
pnpm install
```

## 工程化配置

### 1. TypeScript配置

创建`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": [
      "vite/client",
      "element-plus/global",
      "vitest/globals"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2. Vite配置

创建`vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import { viteMockServe } from 'vite-plugin-mock'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts'
    }),
    Unocss(),
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          echarts: ['echarts'],
          lodash: ['lodash-es']
        }
      }
    }
  }
})
```

### 3. ESLint配置

创建`.eslintrc.js`：

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off'
  }
}
```

### 4. Prettier配置

创建`.prettierrc`：

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "none",
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### 5. Git Hooks配置

安装依赖：

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

初始化husky：

```bash
npx husky install
```

创建`.husky/pre-commit`：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

创建`.husky/commit-msg`：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit $1
```

创建`commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ]
  }
}
```

创建`.lintstagedrc`：

```json
{
  "*.{js,jsx,ts,tsx,vue}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{scss,less,css,html}": [
    "prettier --write"
  ],
  "package.json": [
    "prettier --write"
  ],
  "*.md": [
    "prettier --write"
  ]
}
```

### 6. 环境变量配置

创建以下环境变量文件：

`.env`：
```
VITE_APP_TITLE=Vue3 Admin
VITE_APP_API_BASE_URL=/api
```

`.env.development`：
```
VITE_APP_ENV=development
VITE_APP_BASE_API=http://localhost:8080
VITE_APP_MOCK=true
```

`.env.production`：
```
VITE_APP_ENV=production
VITE_APP_BASE_API=https://api.example.com
VITE_APP_MOCK=false
```

## 权限系统设计

在企业级中后台系统中，权限控制是一个核心功能。我们采用RBAC（基于角色的访问控制）模型来实现权限系统。

### 1. 权限模型设计

```typescript
// src/types/auth.ts
export interface IUser {
  id: number
  username: string
  avatar: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface IRole {
  id: number
  name: string
  code: string
  description: string
  permissions: string[]
}

export interface IPermission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number
}
```

### 2. 权限Store

```typescript
// src/store/modules/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router'

function hasPermission(roles: string[], route: RouteRecordRaw) {
  if (route.meta?.roles) {
    return roles.some(role => route.meta?.roles?.includes(role))
  }
  return true
}

function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]) {
  const res: RouteRecordRaw[] = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  
  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    dynamicRoutes: [] as RouteRecordRaw[]
  }),
  
  actions: {
    generateRoutes(roles: string[]) {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      this.routes = constantRoutes.concat(accessedRoutes)
      this.dynamicRoutes = accessedRoutes
      return accessedRoutes
    }
  }
})
```

### 3. 权限指令

```typescript
// src/directives/permission.ts
import { ObjectDirective } from 'vue'
import { useUserStore } from '@/store/modules/user'

export const permission: ObjectDirective = {
  mounted(el: HTMLElement, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const { roles, permissions } = userStore
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = roles.some(role => {
        return value.includes(role)
      }) || permissions.some(permission => {
        return value.includes(permission)
      })
      
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('need roles or permissions')
    }
  }
}
```

## 路由和菜单配置

### 1. 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/index.vue'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'System',
    meta: { 
      title: '系统管理',
      icon: 'setting',
      roles: ['admin', 'system']
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'role' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index.vue'),
        name: 'Menu',
        meta: { title: '菜单管理', icon: 'menu' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
```

### 2. 路由守卫

```typescript
// src/router/permission.ts
import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        if (!userStore.roles.length) {
          const { roles } = await userStore.getUserInfo()
          const accessRoutes = await permissionStore.generateRoutes(roles)
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          next({ ...to, replace: true })
        } else {
          next()
        }
      } catch (error) {
        await userStore.resetToken()
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
```

### 3. 菜单组件

```vue
<!-- src/components/Menu/index.vue -->
<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    :collapse-transition="false"
    mode="vertical"
  >
    <sidebar-item
      v-for="route in permissionRoutes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const isCollapse = computed(() => !appStore.sidebar.opened)

const permissionRoutes = computed(() => {
  return permissionStore.routes
})
</script>
```

## 状态管理

本项目使用Pinia作为状态管理方案，相比Vuex具有更好的TypeScript支持和更简洁的API。

### 1. Store的基本结构

```typescript
// src/store/modules/user.ts
import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

interface UserState {
  token: string
  userInfo: {
    id: number
    username: string
    avatar: string
    roles: string[]
    permissions: string[]
  } | null
  roles: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    userInfo: null,
    roles: []
  }),
  
  getters: {
    hasRole: (state) => (role: string) => state.roles.includes(role),
    userAvatar: (state) => state.userInfo?.avatar
  },
  
  actions: {
    async login(username: string, password: string) {
      try {
        const { token } = await login({ username, password })
        this.token = token
        setToken(token)
      } catch (error) {
        removeToken()
        throw error
      }
    },
    
    async getUserInfo() {
      try {
        const data = await getUserInfo()
        this.userInfo = data
        this.roles = data.roles
        return data
      } catch (error) {
        removeToken()
        throw error
      }
    },
    
    async logout() {
      try {
        await logout()
      } finally {
        this.resetToken()
      }
    },
    
    resetToken() {
      this.token = ''
      this.roles = []
      this.userInfo = null
      removeToken()
    }
  }
})
```

### 2. 应用配置Store

```typescript
// src/store/modules/app.ts
import { defineStore } from 'pinia'
import { getSidebarStatus, setSidebarStatus } from '@/utils/localStorage'
import { Theme } from '@/constants/enum'

interface AppState {
  sidebar: {
    opened: boolean
    withoutAnimation: boolean
  }
  device: 'desktop' | 'mobile'
  theme: Theme
  size: 'default' | 'large' | 'small'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      opened: getSidebarStatus() !== 'closed',
      withoutAnimation: false
    },
    device: 'desktop',
    theme: Theme.Light,
    size: 'default'
  }),
  
  actions: {
    toggleSidebar(withoutAnimation?: boolean) {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = withoutAnimation || false
      setSidebarStatus(this.sidebar.opened ? 'opened' : 'closed')
    },
    
    closeSidebar(withoutAnimation?: boolean) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation || false
      setSidebarStatus('closed')
    },
    
    toggleDevice(device: 'desktop' | 'mobile') {
      this.device = device
    },
    
    setTheme(theme: Theme) {
      this.theme = theme
    },
    
    setSize(size: 'default' | 'large' | 'small') {
      this.size = size
    }
  }
})
```

### 3. 数据缓存Store

```typescript
// src/store/modules/cache.ts
import { defineStore } from 'pinia'

interface CacheState {
  cachedViews: string[]
  cachedComponents: string[]
}

export const useCacheStore = defineStore('cache', {
  state: (): CacheState => ({
    cachedViews: [],
    cachedComponents: []
  }),
  
  actions: {
    addCachedView(view: string) {
      if (!this.cachedViews.includes(view)) {
        this.cachedViews.push(view)
      }
    },
    
    removeCachedView(view: string) {
      const index = this.cachedViews.indexOf(view)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },
    
    addCachedComponent(component: string) {
      if (!this.cachedComponents.includes(component)) {
        this.cachedComponents.push(component)
      }
    },
    
    removeCachedComponent(component: string) {
      const index = this.cachedComponents.indexOf(component)
      if (index > -1) {
        this.cachedComponents.splice(index, 1)
      }
    }
  }
})
```

## 组件封装

### 1. 表格组件封装

```vue
<!-- src/components/Table/index.vue -->
<template>
  <div class="table-container">
    <div class="table-header" v-if="$slots.header">
      <slot name="header" />
    </div>
    
    <el-table
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        align="center"
      />
      
      <el-table-column
        v-if="index"
        type="index"
        width="55"
        align="center"
        label="序号"
      />
      
      <slot />
      
      <el-table-column
        v-if="$slots.operation"
        label="操作"
        align="center"
        :width="operationWidth"
      >
        <template #default="scope">
          <slot name="operation" :row="scope.row" />
        </template>
      </el-table-column>
    </el-table>
    
    <div class="table-footer" v-if="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  data: any[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  selection?: boolean
  index?: boolean
  height?: string | number
  maxHeight?: string | number
  pagination?: boolean
  total?: number
  operationWidth?: string | number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  border: true,
  stripe: true,
  selection: false,
  index: false,
  pagination: false,
  total: 0,
  operationWidth: 150,
  pageSizes: () => [10, 20, 30, 50]
})

const emit = defineEmits([
  'selection-change',
  'page-change',
  'size-change'
])

const currentPage = ref(1)
const pageSize = ref(10)

watch(() => props.data, () => {
  if (currentPage.value > 1 && props.data.length === 0) {
    currentPage.value = currentPage.value - 1
  }
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', { page: currentPage.value, size })
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('page-change', { page, size: pageSize.value })
}
</script>

<style lang="scss" scoped>
.table-container {
  .table-header {
    margin-bottom: 16px;
  }
  
  .table-footer {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
```

### 2. 表单组件封装

```vue
<!-- src/components/Form/index.vue -->
<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    v-bind="$attrs"
  >
    <el-row :gutter="gutter">
      <el-col
        v-for="item in schemas"
        :key="item.field"
        :span="item.colSpan || 24"
      >
        <el-form-item
          :label="item.label"
          :prop="item.field"
          :rules="item.rules"
        >
          <template v-if="item.slot">
            <slot :name="item.slot" :model="model" />
          </template>
          
          <template v-else>
            <component
              :is="getComponent(item.component)"
              v-model="model[item.field]"
              v-bind="getComponentProps(item)"
              @change="item.onChange?.(model[item.field])"
            >
              <template v-if="item.options">
                <component
                  :is="getOptionComponent(item.component)"
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </template>
            </component>
          </template>
        </el-form-item>
      </el-col>
    </el-row>
    
    <div class="form-footer" v-if="showFooter">
      <slot name="footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </slot>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

interface FormSchema {
  field: string
  label: string
  component: string
  colSpan?: number
  rules?: any[]
  options?: { label: string; value: any }[]
  slot?: string
  props?: Record<string, any>
  onChange?: (value: any) => void
}

interface Props {
  model: Record<string, any>
  schemas: FormSchema[]
  rules?: Record<string, any[]>
  labelWidth?: string | number
  gutter?: number
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: 100,
  gutter: 0,
  showFooter: true
})

const emit = defineEmits(['cancel', 'submit'])

const formRef = ref<FormInstance>()

const getComponent = (component: string) => {
  return `el-${component}`
}

const getOptionComponent = (component: string) => {
  switch (component) {
    case 'select':
      return 'el-option'
    case 'radio':
      return 'el-radio'
    case 'checkbox':
      return 'el-checkbox'
    default:
      return ''
  }
}

const getComponentProps = (schema: FormSchema) => {
  const { component, props = {} } = schema
  switch (component) {
    case 'select':
      return {
        placeholder: `请选择${schema.label}`,
        clearable: true,
        ...props
      }
    case 'input':
      return {
        placeholder: `请输入${schema.label}`,
        clearable: true,
        ...props
      }
    default:
      return props
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    emit('submit', props.model)
  } catch (error) {
    // 表单验证失败
  }
}

// 暴露方法给父组件
defineExpose({
  formRef
})
</script>

<style lang="scss" scoped>
.form-footer {
  margin-top: 24px;
  text-align: right;
}
</style>
```

### 3. 组件使用示例

```vue
<!-- src/views/system/user/index.vue -->
<template>
  <div class="user-container">
    <Table
      :data="tableData"
      :loading="loading"
      selection
      pagination
      :total="total"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <template #header>
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
      </template>
      
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <template #operation="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </Table>
    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <Form
        ref="formRef"
        :model="formData"
        :schemas="formSchemas"
        @cancel="dialogVisible = false"
        @submit="handleSubmit"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Table from '@/components/Table/index.vue'
import Form from '@/components/Form/index.vue'
import { getUserList, addUser, updateUser, deleteUser } from '@/api/user'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()

const formData = reactive({
  username: '',
  password: '',
  email: '',
  role: '',
  status: true
})

const formSchemas = [
  {
    field: 'username',
    label: '用户名',
    component: 'input',
    colSpan: 24,
    rules: [
      { required: true, message: '请输入用户名' }
    ]
  },
  {
    field: 'password',
    label: '密码',
    component: 'input',
    colSpan: 24,
    props: {
      type: 'password'
    },
    rules: [
      { required: true, message: '请输入密码' }
    ]
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'input',
    colSpan: 24,
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入正确的邮箱格式' }
    ]
  },
  {
    field: 'role',
    label: '角色',
    component: 'select',
    colSpan: 24,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' }
    ],
    rules: [
      { required: true, message: '请选择角色' }
    ]
  },
  {
    field: 'status',
    label: '状态',
    component: 'switch',
    colSpan: 24
  }
]

const getList = async (page = 1, size = 10) => {
  loading.value = true
  try {
    const { list, total: totalCount } = await getUserList({ page, size })
    tableData.value = list
    total.value = totalCount
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  console.log('selected:', selection)
}

const handlePageChange = ({ page, size }: { page: number; size: number }) => {
  getList(page, size)
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(formData, {
    username: '',
    password: '',
    email: '',
    role: '',
    status: true
  })
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(formData, row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？')
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    // 取消删除或删除失败
  }
}

const handleSubmit = async (data: any) => {
  try {
    if (dialogType.value === 'add') {
      await addUser(data)
      ElMessage.success('添加成功')
    } else {
      await updateUser(data)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    // 提交失败
  }
}

// 初始化加载数据
getList()
</script>
```

## 主题定制

### 1. 主题变量定义

```scss
// src/styles/variables.scss
// 主题色变量
$--colors: (
  'primary': (
    'base': #409eff,
  ),
  'success': (
    'base': #67c23a,
  ),
  'warning': (
    'base': #e6a23c,
  ),
  'danger': (
    'base': #f56c6c,
  ),
  'info': (
    'base': #909399,
  ),
);

// 暗色主题变量
$--dark: (
  'bg-color': #141414,
  'bg-color-overlay': #1d1e1f,
  'text-color': #e5eaf3,
  'text-color-regular': #cfd3dc,
  'text-color-secondary': #a3a6ad,
  'border-color': #4c4d4f,
  'border-color-light': #414243,
);

// 亮色主题变量
$--light: (
  'bg-color': #ffffff,
  'bg-color-overlay': #f7f7f7,
  'text-color': #303133,
  'text-color-regular': #606266,
  'text-color-secondary': #909399,
  'border-color': #dcdfe6,
  'border-color-light': #e4e7ed,
);
```

### 2. 主题切换实现

```typescript
// src/hooks/useTheme.ts
import { watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Theme } from '@/constants/enum'

export function useTheme() {
  const appStore = useAppStore()
  
  const setTheme = (theme: Theme) => {
    const html = document.documentElement
    if (theme === Theme.Dark) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
    appStore.setTheme(theme)
  }
  
  watch(
    () => appStore.theme,
    (newTheme) => {
      setTheme(newTheme)
    },
    { immediate: true }
  )
  
  return {
    setTheme
  }
}
```

### 3. Element Plus主题定制

```typescript
// src/plugins/element.ts
import { App } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 自定义主题样式
import '@/styles/element-variables.scss'

export default {
  install(app: App) {
    app.use(ElementPlus, {
      locale: zhCn,
    })
  }
}
```

```scss
// src/styles/element-variables.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: $--colors,
  $bg-color: var(--el-bg-color),
  $text-color: var(--el-text-color),
  $border-color: var(--el-border-color),
  // 更多自定义变量...
);

// 暗色主题变量
html.dark {
  --el-bg-color: #{map-get($--dark, 'bg-color')};
  --el-bg-color-overlay: #{map-get($--dark, 'bg-color-overlay')};
  --el-text-color: #{map-get($--dark, 'text-color')};
  --el-text-color-regular: #{map-get($--dark, 'text-color-regular')};
  --el-text-color-secondary: #{map-get($--dark, 'text-color-secondary')};
  --el-border-color: #{map-get($--dark, 'border-color')};
  --el-border-color-light: #{map-get($--dark, 'border-color-light')};
}

// 亮色主题变量
html {
  --el-bg-color: #{map-get($--light, 'bg-color')};
  --el-bg-color-overlay: #{map-get($--light, 'bg-color-overlay')};
  --el-text-color: #{map-get($--light, 'text-color')};
  --el-text-color-regular: #{map-get($--light, 'text-color-regular')};
  --el-text-color-secondary: #{map-get($--light, 'text-color-secondary')};
  --el-border-color: #{map-get($--light, 'border-color')};
  --el-border-color-light: #{map-get($--light, 'border-color-light')};
}
```

### 4. 主题切换组件

```vue
<!-- src/components/ThemeSwitch/index.vue -->
<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="theme-switch">
      <el-icon>
        <component :is="currentThemeIcon" />
      </el-icon>
    </div>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :command="Theme.Light">
          <el-icon><sunny /></el-icon>
          浅色模式
        </el-dropdown-item>
        <el-dropdown-item :command="Theme.Dark">
          <el-icon><moon /></el-icon>
          深色模式
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useTheme } from '@/hooks/useTheme'
import { Theme } from '@/constants/enum'
import { Sunny, Moon } from '@element-plus/icons-vue'

const appStore = useAppStore()
const { setTheme } = useTheme()

const currentThemeIcon = computed(() => {
  return appStore.theme === Theme.Dark ? Moon : Sunny
})

const handleCommand = (command: Theme) => {
  setTheme(command)
}
</script>

<style lang="scss" scoped>
.theme-switch {
  padding: 0 12px;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background-color: var(--el-bg-color-overlay);
  }
}
</style>
```

## 国际化配置

### 1. Vue I18n配置

```typescript
// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import zhCN from './zh-CN'
import enUS from './en-US'

const appStore = useAppStore()

const i18n = createI18n({
  legacy: false,
  locale: appStore.language || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
```

### 2. 语言包定义

```typescript
// src/locales/zh-CN/index.ts
export default {
  route: {
    dashboard: '首页',
    system: {
      title: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理'
    }
  },
  navbar: {
    profile: '个人中心',
    password: '修改密码',
    logout: '退出登录'
  },
  login: {
    title: '系统登录',
    username: '用户名',
    password: '密码',
    login: '登录',
    remember: '记住密码'
  },
  table: {
    add: '新增',
    edit: '编辑',
    delete: '删除',
    search: '搜索',
    reset: '重置',
    confirm: '确认',
    cancel: '取消',
    operate: '操作'
  }
}

// src/locales/en-US/index.ts
export default {
  route: {
    dashboard: 'Dashboard',
    system: {
      title: 'System',
      user: 'User',
      role: 'Role',
      menu: 'Menu'
    }
  },
  navbar: {
    profile: 'Profile',
    password: 'Change Password',
    logout: 'Logout'
  },
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    remember: 'Remember me'
  },
  table: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    reset: 'Reset',
    confirm: 'Confirm',
    cancel: 'Cancel',
    operate: 'Action'
  }
}
```

### 3. 语言切换组件

```vue
<!-- src/components/LangSwitch/index.vue -->
<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="lang-switch">
      <svg-icon icon-class="language" />
    </div>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in languages"
          :key="item.value"
          :command="item.value"
          :class="{ active: currentLang === item.value }"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import { Language } from '@/constants/enum'

const i18n = useI18n()
const appStore = useAppStore()

const languages = [
  { label: '简体中文', value: Language.ZH_CN },
  { label: 'English', value: Language.EN_US }
]

const currentLang = computed(() => appStore.language)

const handleCommand = (command: Language) => {
  i18n.locale.value = command
  appStore.setLanguage(command)
}
</script>

<style lang="scss" scoped>
.lang-switch {
  padding: 0 12px;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    background-color: var(--el-bg-color-overlay);
  }
}

.active {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
```

### 4. 国际化使用示例

```vue
<!-- src/views/login/index.vue -->
<template>
  <div class="login-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      class="login-form"
    >
      <div class="title-container">
        <h3 class="title">{{ t('login.title') }}</h3>
      </div>
      
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          :placeholder="t('login.username')"
          prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          :type="passwordVisible ? 'text' : 'password'"
          :placeholder="t('login.password')"
          prefix-icon="Lock"
        >
          <template #suffix>
            <el-icon
              class="cursor-pointer"
              @click="passwordVisible = !passwordVisible"
            >
              <component :is="passwordVisible ? 'View' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item>
        <el-checkbox v-model="formData.remember">
          {{ t('login.remember') }}
        </el-checkbox>
      </el-form-item>
      
      <el-button
        :loading="loading"
        type="primary"
        class="w-full"
        @click="handleLogin"
      >
        {{ t('login.login') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import type { FormInstance } from 'element-plus'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const passwordVisible = ref(false)

const formData = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: t('login.username') + t('common.required') }
  ],
  password: [
    { required: true, message: t('login.password') + t('common.required') }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await userStore.login(formData.username, formData.password)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  @apply min-h-screen flex items-center justify-center;
  background-color: var(--el-bg-color-overlay);
  
  .login-form {
    @apply relative w-[520px] max-w-full p-8 bg-white rounded-lg;
    background-color: var(--el-bg-color);
    
    .title-container {
      @apply mb-8 text-center;
      
      .title {
        @apply text-2xl font-bold;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
```

## 性能优化

### 1. 路由懒加载

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/index.vue'

// 使用动态导入实现路由懒加载
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'setting',
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index.vue'),
        name: 'User',
        meta: { title: '用户管理', keepAlive: true }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index.vue'),
        name: 'Role',
        meta: { title: '角色管理' }
      }
    ]
  }
]
```

### 2. 组件按需加载

```typescript
// src/plugins/element.ts
import { App } from 'vue'
import {
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElPagination,
  // ... 其他需要的组件
} from 'element-plus'

// 按需导入样式
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
import 'element-plus/es/components/form/style/css'
// ... 其他组件样式

const components = [
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElPagination
]

export default {
  install(app: App) {
    components.forEach(component => {
      app.component(component.name, component)
    })
  }
}
```

### 3. 虚拟列表优化

```vue
<!-- src/components/VirtualList/index.vue -->
<template>
  <div ref="listRef" class="virtual-list" @scroll="handleScroll">
    <div class="virtual-list-phantom" :style="{ height: `${phantomHeight}px` }" />
    <div
      class="virtual-list-content"
      :style="{ transform: `translate3d(0, ${offset}px, 0)` }"
    >
      <div
        v-for="item in visibleData"
        :key="item.id"
        :style="{ height: `${itemHeight}px` }"
        class="virtual-list-item"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThrottleFn } from '@vueuse/core'

interface Props {
  data: any[]
  itemHeight: number
  visibleCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  visibleCount: 10
})

const listRef = ref<HTMLElement>()
const start = ref(0)
const offset = ref(0)

const phantomHeight = computed(() => props.data.length * props.itemHeight)
const visibleData = computed(() => {
  return props.data.slice(start.value, start.value + props.visibleCount)
})

const handleScroll = useThrottleFn(() => {
  if (!listRef.value) return
  
  const scrollTop = listRef.value.scrollTop
  start.value = Math.floor(scrollTop / props.itemHeight)
  offset.value = scrollTop
}, 100)

onMounted(() => {
  if (!listRef.value) return
  listRef.value.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (!listRef.value) return
  listRef.value.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.virtual-list {
  height: 100%;
  overflow: auto;
  position: relative;
  
  &-phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  
  &-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    will-change: transform;
  }
}
</style>
```

### 4. 图片懒加载

```typescript
// src/directives/lazy.ts
import type { DirectiveBinding } from 'vue'

const defaultImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const lazyLoad = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = binding.value
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px'
      }
    )
    
    el.src = defaultImg
    observer.observe(el)
  }
}

export default lazyLoad
```

### 5. 大文件上传优化

```typescript
// src/utils/upload.ts
import SparkMD5 from 'spark-md5'
import axios from 'axios'

interface ChunkInfo {
  chunk: Blob
  hash: string
  index: number
}

export async function uploadFile(file: File) {
  // 计算文件hash
  const fileHash = await calculateHash(file)
  
  // 检查文件是否已上传
  const { uploaded, uploadedChunks } = await checkFileExist(fileHash)
  if (uploaded) {
    return { success: true, url: uploadedChunks }
  }
  
  // 文件切片
  const chunkSize = 2 * 1024 * 1024 // 2MB
  const chunks = createFileChunks(file, chunkSize)
  
  // 上传切片
  const chunkInfos = await Promise.all(
    chunks.map((chunk, index) => {
      return {
        chunk,
        hash: `${fileHash}-${index}`,
        index
      }
    })
  )
  
  // 过滤已上传的切片
  const uploadChunks = chunkInfos.filter(
    ({ hash }) => !uploadedChunks.includes(hash)
  )
  
  // 并发上传切片
  await uploadChunks(uploadChunks)
  
  // 合并切片
  await mergeChunks(fileHash, chunks.length)
}

// 计算文件hash
async function calculateHash(file: File) {
  return new Promise<string>(resolve => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    
    reader.onload = e => {
      spark.append(e.target?.result as ArrayBuffer)
      resolve(spark.end())
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// 创建文件切片
function createFileChunks(file: File, size: number) {
  const chunks: Blob[] = []
  let cur = 0
  
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + size))
    cur += size
  }
  
  return chunks
}

// 上传切片
async function uploadChunks(chunks: ChunkInfo[]) {
  const requests = chunks.map(({ chunk, hash, index }) => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', hash)
    formData.append('index', index.toString())
    
    return axios.post('/api/upload/chunk', formData)
  })
  
  return Promise.all(requests)
}

// 合并切片
async function mergeChunks(fileHash: string, count: number) {
  return axios.post('/api/upload/merge', {
    fileHash,
    count
  })
}

// 检查文件是否已上传
async function checkFileExist(fileHash: string) {
  const { data } = await axios.post('/api/upload/verify', {
    fileHash
  })
  return data
}
```

### 6. 首屏加载优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip压缩
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // 打包分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          echarts: ['echarts'],
          utils: ['lodash-es', 'axios', 'dayjs']
        }
      }
    },
    // 代码压缩配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

## 部署和发布

### 1. Docker部署

创建`Dockerfile`：

```dockerfile
# 构建阶段
FROM node:16-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

# 生产阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建`nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # gzip配置
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 9;
    gzip_types text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.";
    
    # 路由重定向
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://backend-api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location /assets {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 2. 自动化部署

创建`.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 6.32.9
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/vue3-admin
            git pull
            docker-compose up -d --build
```

创建`docker-compose.yml`：

```yaml
version: '3'

services:
  web:
    build: .
    ports:
      - "80:80"
    restart: always
    networks:
      - app-network
      
  backend:
    image: backend-api
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=password
    depends_on:
      - db
    networks:
      - app-network
      
  db:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=vue3_admin
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

### 3. 监控和错误追踪

```typescript
// src/utils/monitor.ts
import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'
import type { App } from 'vue'
import router from '@/router'

export function setupMonitor(app: App) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['localhost', 'my-site-url.com', /^\//]
      })
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE
  })
}

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context
  })
}

export function trackEvent(name: string, data?: Record<string, any>) {
  Sentry.captureMessage(name, {
    level: 'info',
    extra: data
  })
}
```

### 4. 性能监控

```typescript
// src/utils/performance.ts
import { onBeforeUnmount, onMounted } from 'vue'

export function usePerformanceMonitor() {
  let observer: PerformanceObserver

  onMounted(() => {
    // 监控长任务
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long Task detected:', entry)
          // 上报性能数据
          reportPerformance({
            type: 'long-task',
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['longtask'] })
    
    // 收集性能指标
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        const metrics = {
          // DNS解析时间
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          // TCP连接时间
          tcp: navigation.connectEnd - navigation.connectStart,
          // 首字节时间
          ttfb: navigation.responseStart - navigation.requestStart,
          // DOM解析时间
          dom: navigation.domComplete - navigation.domInteractive,
          // 首次绘制
          fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          // 页面加载完成时间
          load: navigation.loadEventEnd - navigation.fetchStart
        }
        
        reportPerformance({
          type: 'page-metrics',
          metrics
        })
      }, 0)
    })
  })
  
  onBeforeUnmount(() => {
    observer?.disconnect()
  })
}

function reportPerformance(data: any) {
  // 上报到性能监控平台
  navigator.sendBeacon('/api/performance', JSON.stringify(data))
}
```

至此，我们已经完成了Vue3企业级中后台项目的主要功能开发。通过合理的工程化配置、组件封装、性能优化和自动化部署，我们构建了一个功能完整、性能优秀、易于维护的中后台系统。希望这个教程能够帮助你更好地理解和应用Vue3技术栈。 