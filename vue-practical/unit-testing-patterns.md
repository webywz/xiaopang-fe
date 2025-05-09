---
layout: doc
title: Vue单元测试模式实践指南
---

# Vue单元测试模式实践指南

## 单元测试概述

单元测试是保证Vue应用质量和可维护性的关键实践。良好的测试不仅能发现潜在问题，还能促进更清晰的代码结构和API设计。本文将介绍Vue应用中的单元测试策略和模式。

## 测试工具选择

### Vitest (推荐)

Vitest是专为Vite项目设计的单元测试框架，对Vue项目有极佳的支持：

```js
// 安装依赖
// npm install -D vitest @vue/test-utils happy-dom

// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### Jest

Jest是一个成熟的测试框架，适用于各种Vue项目：

```js
// 安装依赖
// npm install -D jest @vue/test-utils @vue/vue3-jest @types/jest babel-jest

// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['vue', 'js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/*.spec.[jt]s?(x)']
}
```

## 组件测试模式

### 1. 挂载和渲染测试

测试组件是否正确渲染：

```js
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile.vue', () => {
  test('正确渲染用户信息', () => {
    const user = { id: 1, name: '张三', email: 'zhangsan@example.com' }
    const wrapper = mount(UserProfile, {
      props: { user }
    })
    
    // 验证文本内容
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('zhangsan@example.com')
    
    // 验证DOM结构
    expect(wrapper.find('.user-name').exists()).toBe(true)
    expect(wrapper.find('.user-email').exists()).toBe(true)
  })
  
  test('当用户数据为空时显示占位符', () => {
    const wrapper = mount(UserProfile)
    expect(wrapper.text()).toContain('暂无用户信息')
  })
})
```

### 2. 事件测试

测试组件事件交互：

```js
import { mount } from '@vue/test-utils'
import Counter from '@/components/Counter.vue'

describe('Counter.vue', () => {
  test('点击按钮增加计数', async () => {
    const wrapper = mount(Counter)
    
    // 初始状态
    expect(wrapper.text()).toContain('Count: 0')
    
    // 触发点击事件
    await wrapper.find('button.increment').trigger('click')
    
    // 验证状态更新
    expect(wrapper.text()).toContain('Count: 1')
    
    // 再次点击
    await wrapper.find('button.increment').trigger('click')
    expect(wrapper.text()).toContain('Count: 2')
  })
  
  test('点击重置按钮恢复初始状态', async () => {
    const wrapper = mount(Counter)
    
    // 增加计数
    await wrapper.find('button.increment').trigger('click')
    await wrapper.find('button.increment').trigger('click')
    expect(wrapper.text()).toContain('Count: 2')
    
    // 点击重置
    await wrapper.find('button.reset').trigger('click')
    expect(wrapper.text()).toContain('Count: 0')
  })
})
```

### 3. Props和插槽测试

测试组件的props和插槽：

```js
import { mount } from '@vue/test-utils'
import Card from '@/components/Card.vue'

describe('Card.vue', () => {
  test('正确接收并应用props', () => {
    const wrapper = mount(Card, {
      props: {
        title: '卡片标题',
        bordered: true,
        type: 'primary'
      }
    })
    
    expect(wrapper.find('.card-title').text()).toBe('卡片标题')
    expect(wrapper.classes()).toContain('card--bordered')
    expect(wrapper.classes()).toContain('card--primary')
  })
  
  test('正确渲染默认插槽', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<div class="test-content">卡片内容</div>'
      }
    })
    
    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('卡片内容')
  })
  
  test('正确渲染具名插槽', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2 class="custom-header">自定义标题</h2>',
        footer: '<div class="custom-footer">自定义底部</div>'
      }
    })
    
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-footer').exists()).toBe(true)
    expect(wrapper.find('.custom-header').text()).toBe('自定义标题')
  })
})
```

### 4. 组件交互与表单测试

测试用户交互和表单操作：

```js
import { mount } from '@vue/test-utils'
import LoginForm from '@/components/LoginForm.vue'

describe('LoginForm.vue', () => {
  test('表单提交时触发login事件', async () => {
    const wrapper = mount(LoginForm)
    
    // 填写表单
    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    
    // 提交表单
    await wrapper.find('form').trigger('submit.prevent')
    
    // 验证事件
    expect(wrapper.emitted('login')).toBeTruthy()
    expect(wrapper.emitted('login')[0][0]).toEqual({
      email: 'user@example.com',
      password: 'password123'
    })
  })
  
  test('验证表单数据', async () => {
    const wrapper = mount(LoginForm)
    
    // 提交空表单
    await wrapper.find('form').trigger('submit.prevent')
    
    // 验证错误信息
    expect(wrapper.find('.error-message').text()).toContain('请填写邮箱')
    
    // 填写无效邮箱
    await wrapper.find('input[type="email"]').setValue('invalid-email')
    await wrapper.find('form').trigger('submit.prevent')
    
    // 验证错误信息更新
    expect(wrapper.find('.error-message').text()).toContain('无效的邮箱格式')
    
    // 没有触发登录事件
    expect(wrapper.emitted('login')).toBeFalsy()
  })
})
```

## Composables测试模式

### 1. 基本的Composable测试

测试组合式函数：

```js
import { useCounter } from '@/composables/useCounter'
import { mount } from '@vue/test-utils'

// 创建一个简单的组件来测试composable
const TestComponent = {
  template: `
    <div>
      <p class="count">{{ count }}</p>
      <button class="increment" @click="increment">+</button>
      <button class="decrement" @click="decrement">-</button>
    </div>
  `,
  setup() {
    return useCounter()
  }
}

describe('useCounter', () => {
  test('提供初始计数为0', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.find('.count').text()).toBe('0')
  })
  
  test('increment方法增加计数', async () => {
    const wrapper = mount(TestComponent)
    await wrapper.find('.increment').trigger('click')
    expect(wrapper.find('.count').text()).toBe('1')
  })
  
  test('decrement方法减少计数', async () => {
    const wrapper = mount(TestComponent)
    await wrapper.find('.increment').trigger('click')
    await wrapper.find('.increment').trigger('click')
    await wrapper.find('.decrement').trigger('click')
    expect(wrapper.find('.count').text()).toBe('1')
  })
})
```

### 2. 直接测试Composable

不依赖组件直接测试组合式函数：

```js
import { useCounter } from '@/composables/useCounter'
import { vi } from 'vitest'

describe('useCounter (直接测试)', () => {
  test('提供正确的响应式状态和方法', () => {
    const { count, increment, decrement } = useCounter()
    
    // 初始值
    expect(count.value).toBe(0)
    
    // 调用方法
    increment()
    expect(count.value).toBe(1)
    
    increment()
    expect(count.value).toBe(2)
    
    decrement()
    expect(count.value).toBe(1)
  })
  
  test('接受初始值', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })
})
```

### 3. 测试依赖外部服务的Composable

使用模拟来测试具有依赖的组合式函数：

```js
import { useUsers } from '@/composables/useUsers'
import { vi } from 'vitest'

// 模拟API服务
vi.mock('@/services/api', () => ({
  getUsers: vi.fn().mockResolvedValue([
    { id: 1, name: '张三' },
    { id: 2, name: '李四' }
  ]),
  deleteUser: vi.fn().mockResolvedValue({ success: true })
}))

describe('useUsers', () => {
  test('fetchUsers方法加载用户列表', async () => {
    const { users, loading, error, fetchUsers } = useUsers()
    
    // 初始状态
    expect(users.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
    
    // 调用方法
    const fetchPromise = fetchUsers()
    
    // 加载状态
    expect(loading.value).toBe(true)
    
    // 等待完成
    await fetchPromise
    
    // 验证结果
    expect(loading.value).toBe(false)
    expect(users.value).toHaveLength(2)
    expect(users.value[0].name).toBe('张三')
  })
  
  test('处理API错误', async () => {
    const apiError = new Error('API错误')
    const api = require('@/services/api')
    api.getUsers.mockRejectedValueOnce(apiError)
    
    const { users, loading, error, fetchUsers } = useUsers()
    
    try {
      await fetchUsers()
    } catch {}
    
    expect(loading.value).toBe(false)
    expect(error.value).toBe(apiError.message)
    expect(users.value).toEqual([])
  })
})
```

## Pinia Store测试模式

### 1. 创建和测试Store

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    lastOperation: null,
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  
  actions: {
    increment() {
      this.count++
      this.lastOperation = 'increment'
    },
    decrement() {
      this.count--
      this.lastOperation = 'decrement'
    },
  },
})

// stores/counter.spec.js
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'
import { beforeEach, describe, expect, test } from 'vitest'

describe('Counter Store', () => {
  beforeEach(() => {
    // 创建一个新的Pinia实例并使其激活
    setActivePinia(createPinia())
  })
  
  test('初始状态', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    expect(store.lastOperation).toBe(null)
    expect(store.doubleCount).toBe(0)
  })
  
  test('increment', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
    expect(store.lastOperation).toBe('increment')
    expect(store.doubleCount).toBe(2)
  })
  
  test('decrement', () => {
    const store = useCounterStore()
    store.increment()
    store.increment()
    store.decrement()
    expect(store.count).toBe(1)
    expect(store.lastOperation).toBe('decrement')
  })
})
```

### 2. 测试包含API调用的Store

```js
// stores/user.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  
  getters: {
    userById: (state) => (id) => state.users.find(user => user.id === id)
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        this.users = await api.getUsers()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        await api.deleteUser(id)
        this.users = this.users.filter(user => user.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// stores/user.spec.js
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// 模拟API
vi.mock('@/services/api', () => ({
  default: {
    getUsers: vi.fn(),
    deleteUser: vi.fn()
  }
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 清除模拟调用历史
    vi.resetAllMocks()
  })
  
  test('fetchUsers成功', async () => {
    // 设置模拟返回值
    const mockUsers = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
    const api = require('@/services/api').default
    api.getUsers.mockResolvedValue(mockUsers)
    
    const store = useUserStore()
    await store.fetchUsers()
    
    expect(api.getUsers).toHaveBeenCalledTimes(1)
    expect(store.loading).toBe(false)
    expect(store.users).toEqual(mockUsers)
    expect(store.error).toBe(null)
  })
  
  test('fetchUsers错误处理', async () => {
    // 模拟API错误
    const error = new Error('获取用户失败')
    const api = require('@/services/api').default
    api.getUsers.mockRejectedValue(error)
    
    const store = useUserStore()
    
    await expect(store.fetchUsers()).rejects.toThrow('获取用户失败')
    
    expect(store.loading).toBe(false)
    expect(store.error).toBe('获取用户失败')
    expect(store.users).toEqual([])
  })
  
  test('deleteUser成功', async () => {
    // 设置初始状态
    const store = useUserStore()
    store.users = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
    
    // 模拟删除成功
    const api = require('@/services/api').default
    api.deleteUser.mockResolvedValue({ success: true })
    
    await store.deleteUser(1)
    
    expect(api.deleteUser).toHaveBeenCalledWith(1)
    expect(store.users).toEqual([{ id: 2, name: '李四' }])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })
})
```

## 路由组件测试

测试与Vue Router相关的组件：

```js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createApp } from 'vue'
import NavBar from '@/components/NavBar.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
    { path: '/about', name: 'About', component: { template: '<div>About</div>' } }
  ]
})

describe('NavBar.vue', () => {
  test('正确渲染导航链接', async () => {
    // 注入router到测试组件
    const wrapper = mount(NavBar, {
      global: {
        plugins: [router]
      }
    })
    
    // 验证链接存在
    const homeLink = wrapper.find('[data-test="home-link"]')
    const aboutLink = wrapper.find('[data-test="about-link"]')
    
    expect(homeLink.exists()).toBe(true)
    expect(aboutLink.exists()).toBe(true)
    
    // 验证链接指向正确的路由
    expect(homeLink.attributes('href')).toBe('/')
    expect(aboutLink.attributes('href')).toBe('/about')
  })
  
  test('active类应用到当前路由', async () => {
    // 导航到指定路由
    await router.push('/')
    
    const wrapper = mount(NavBar, {
      global: {
        plugins: [router]
      }
    })
    
    // 验证active类
    expect(wrapper.find('[data-test="home-link"]').classes()).toContain('active')
    expect(wrapper.find('[data-test="about-link"]').classes()).not.toContain('active')
    
    // 更改路由
    await router.push('/about')
    
    // 需要等待DOM更新
    await wrapper.vm.$nextTick()
    
    // 验证active类变更
    expect(wrapper.find('[data-test="home-link"]').classes()).not.toContain('active')
    expect(wrapper.find('[data-test="about-link"]').classes()).toContain('active')
  })
})
```

## 测试辅助模式

### 1. 通用测试工具

创建测试辅助函数提高效率：

```js
// tests/utils/index.js
import { mount } from '@vue/test-utils'

/**
 * 创建包含store和router的组件挂载
 */
export function mountWithPlugins(component, options = {}) {
  const { store, router, ...rest } = options
  
  return mount(component, {
    global: {
      plugins: [
        ...(store ? [store] : []),
        ...(router ? [router] : [])
      ],
      ...rest.global
    },
    ...rest
  })
}

/**
 * 等待组件重新渲染
 * 用于异步操作后验证组件状态
 */
export async function waitForUpdate(wrapper) {
  await wrapper.vm.$nextTick()
  jest.runAllTimers()
  await wrapper.vm.$nextTick()
}
```

### 2. 自定义匹配器

扩展Jest/Vitest匹配器：

```js
// tests/setup.js
import { expect } from 'vitest'

expect.extend({
  /**
   * 验证元素是否有指定的Vue指令
   */
  toHaveDirective(wrapper, directive) {
    const directives = wrapper.vm.$options.directives || {}
    const hasDirective = directive in directives
    
    return {
      pass: hasDirective,
      message: () => `Expected ${wrapper.vm.$options.name} ${hasDirective ? 'not ' : ''}to have directive "${directive}"`
    }
  },
  
  /**
   * 验证是否触发了准确的事件参数
   */
  toHaveEmittedWithPayload(wrapper, eventName, payload) {
    const events = wrapper.emitted(eventName) || []
    const hasEventWithPayload = events.some(args => 
      JSON.stringify(args[0]) === JSON.stringify(payload)
    )
    
    return {
      pass: hasEventWithPayload,
      message: () => `Expected ${wrapper.vm.$options.name} ${hasEventWithPayload ? 'not ' : ''}to have emitted "${eventName}" with payload ${JSON.stringify(payload)}`
    }
  }
})
```

## 测试覆盖率策略

### 1. 设置覆盖率目标

```js
// vitest.config.js 
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'c8', // 或 'istanbul'
      reporter: ['text', 'json', 'html'],
      lines: 80,     // 行覆盖率目标
      functions: 80, // 函数覆盖率目标
      branches: 70,  // 分支覆盖率目标
      statements: 80 // 语句覆盖率目标
    }
  }
})
```

### 2. 覆盖率报告分析

```bash
# 运行测试并生成覆盖率报告
npx vitest run --coverage
```

## 持续集成中的测试策略

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: 设置Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 运行Lint
        run: npm run lint
      
      - name: 运行测试
        run: npm run test:ci
      
      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          file: ./coverage/coverage-final.json
```

## 测试最佳实践

1. **针对行为测试，而非实现细节**：测试组件的输出和响应，而不是内部实现
2. **合理使用模拟**：仅模拟外部依赖，避免过度模拟
3. **编写可维护的测试**：使用描述性的测试名称和良好的测试结构
4. **遵循AAA模式**：Arrange（准备）- Act（执行）- Assert（断言）
5. **保持测试简单**：每个测试只关注一个行为
6. **适当使用快照测试**：用于UI组件的稳定性检查
7. **平衡测试覆盖率和成本**：关注核心功能和边界条件
8. **保持测试独立**：测试之间不应相互依赖
9. **持续运行测试**：将测试集成到开发工作流和CI/CD流程中

## 性能测试考虑

对于性能关键的组件，考虑以下测试：

```js
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test } from 'vitest'
import VirtualList from '@/components/VirtualList.vue'

describe('VirtualList性能', () => {
  test('渲染大量项目的性能', () => {
    // 准备大量测试数据
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))
    
    // 测量渲染时间
    const start = performance.now()
    const wrapper = mount(VirtualList, {
      props: { items }
    })
    const end = performance.now()
    
    // 验证只渲染了可见项目
    expect(wrapper.findAll('.list-item').length).toBeLessThan(100)
    
    // 验证渲染时间合理
    const renderTime = end - start
    expect(renderTime).toBeLessThan(500) // 500ms是一个示例阈值
  })
})
```

## 测试驱动开发(TDD)在Vue中的应用

TDD流程示例：

1. **编写失败的测试**：

```js
// UserForm.spec.js
import { mount } from '@vue/test-utils'
import UserForm from '@/components/UserForm.vue'

describe('UserForm.vue', () => {
  test('提交表单时发出create-user事件', async () => {
    const wrapper = mount(UserForm)
    
    // 填写表单
    await wrapper.find('[data-test="name-input"]').setValue('张三')
    await wrapper.find('[data-test="email-input"]').setValue('zhangsan@example.com')
    
    // 提交表单
    await wrapper.find('form').trigger('submit.prevent')
    
    // 验证事件
    expect(wrapper.emitted('create-user')).toBeTruthy()
    expect(wrapper.emitted('create-user')[0][0]).toEqual({
      name: '张三',
      email: 'zhangsan@example.com'
    })
  })
})
```

2. **实现组件使测试通过**：

```vue
<!-- UserForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="name">姓名</label>
      <input 
        id="name"
        data-test="name-input"
        v-model="form.name" 
        type="text"
      />
    </div>
    
    <div>
      <label for="email">邮箱</label>
      <input 
        id="email"
        data-test="email-input"
        v-model="form.email" 
        type="email"
      />
    </div>
    
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['create-user'])

const form = reactive({
  name: '',
  email: ''
})

function handleSubmit() {
  emit('create-user', { ...form })
}
</script>
```

3. **重构并确保测试仍然通过**

## 总结

Vue单元测试是保证应用质量的关键实践。通过合理的测试策略和模式，可以：

1. **提高代码质量**：测试驱动开发促进更好的代码设计
2. **防止回归**：确保新功能不会破坏现有行为
3. **简化重构**：提供安全网以支持代码改进
4. **文档化行为**：测试是最新的功能文档
5. **提高开发信心**：减少上线后的意外问题

选择合适的测试工具和策略，将测试集成到开发流程中，建立适当的测试覆盖率目标，这些都是构建高质量Vue应用的重要步骤。 