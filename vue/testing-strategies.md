# Vue 3测试策略

本章节介绍Vue 3应用的测试策略和最佳实践，包括单元测试、组件测试、端到端测试以及测试驱动开发方法。

## 单元测试基础

### 测试组合式函数

```js
/**
 * 单元测试组合式函数
 */
// useCounter.js - 被测试的组合式函数
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  }
}

// useCounter.spec.js - 测试文件
import { useCounter } from './useCounter'
import { describe, it, expect } from 'vitest'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count, doubleCount } = useCounter()
    expect(count.value).toBe(0)
    expect(doubleCount.value).toBe(0)
  })
  
  it('initializes with provided value', () => {
    const { count, doubleCount } = useCounter(5)
    expect(count.value).toBe(5)
    expect(doubleCount.value).toBe(10)
  })
  
  it('increments the count', () => {
    const { count, increment } = useCounter(0)
    increment()
    expect(count.value).toBe(1)
  })
  
  it('decrements the count', () => {
    const { count, decrement } = useCounter(1)
    decrement()
    expect(count.value).toBe(0)
  })
  
  it('updates doubleCount when count changes', () => {
    const { count, doubleCount, increment } = useCounter(1)
    expect(doubleCount.value).toBe(2)
    increment()
    expect(count.value).toBe(2)
    expect(doubleCount.value).toBe(4)
  })
})
```

### 测试工具函数

```js
/**
 * 测试工具函数
 */
// utils.js - 工具函数
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price)
}

export function filterItems(items, searchTerm) {
  if (!searchTerm) return items
  
  searchTerm = searchTerm.toLowerCase()
  return items.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  )
}

// utils.spec.js - 测试文件
import { formatPrice, filterItems } from './utils'
import { describe, it, expect } from 'vitest'

describe('formatPrice', () => {
  it('formats price with USD by default', () => {
    expect(formatPrice(10)).toBe('$10.00')
    expect(formatPrice(10.5)).toBe('$10.50')
  })
  
  it('formats price with specified currency', () => {
    expect(formatPrice(10, 'EUR')).toBe('€10.00')
    expect(formatPrice(10, 'JPY')).toBe('¥10')
  })
})

describe('filterItems', () => {
  const items = [
    { id: 1, name: 'iPhone', description: 'Smartphone by Apple' },
    { id: 2, name: 'Galaxy', description: 'Smartphone by Samsung' }
  ]
  
  it('returns all items when searchTerm is empty', () => {
    expect(filterItems(items, '')).toEqual(items)
    expect(filterItems(items)).toEqual(items)
  })
  
  it('filters items by name', () => {
    const result = filterItems(items, 'iPhone')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
  
  it('filters items by description', () => {
    const result = filterItems(items, 'Samsung')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })
  
  it('is case insensitive', () => {
    expect(filterItems(items, 'iPHONE')).toHaveLength(1)
    expect(filterItems(items, 'samsung')).toHaveLength(1)
  })
})
```

## 组件测试

### 使用Vitest和Vue Test Utils测试组件

```js
/**
 * 使用Vue Test Utils测试组件
 */
// Counter.vue - 测试组件
<script setup>
import { ref } from 'vue'

const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
})

const count = ref(props.initialValue)

function increment() {
  count.value++
}

function decrement() {
  count.value--
}
</script>

<template>
  <div>
    <p class="count" data-testid="count">{{ count }}</p>
    <button @click="increment" class="increment" data-testid="increment">+</button>
    <button @click="decrement" class="decrement" data-testid="decrement">-</button>
  </div>
</template>

// Counter.spec.js - 测试文件
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.vue'

describe('Counter.vue', () => {
  it('renders the initial count value', () => {
    const wrapper = mount(Counter, {
      props: {
        initialValue: 5
      }
    })
    
    expect(wrapper.get('[data-testid="count"]').text()).toBe('5')
  })
  
  it('increments the count when + button is clicked', async () => {
    const wrapper = mount(Counter)
    
    await wrapper.get('[data-testid="increment"]').trigger('click')
    
    expect(wrapper.get('[data-testid="count"]').text()).toBe('1')
  })
  
  it('decrements the count when - button is clicked', async () => {
    const wrapper = mount(Counter, {
      props: {
        initialValue: 1
      }
    })
    
    await wrapper.get('[data-testid="decrement"]').trigger('click')
    
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0')
  })
})
```

### 测试组件事件和props

```js
/**
 * 测试组件事件和props
 */
// UserForm.vue - 测试组件
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'reset'])

const form = ref({
  name: '',
  email: ''
})

// 同步props和本地表单
watch(() => props.user, (newUser) => {
  form.value.name = newUser.name
  form.value.email = newUser.email
}, { immediate: true })

function submit() {
  emit('update', { ...form.value })
}

function reset() {
  form.value.name = props.user.name
  form.value.email = props.user.email
  emit('reset')
}
</script>

<template>
  <form @submit.prevent="submit">
    <input 
      v-model="form.name" 
      data-testid="name-input" 
      placeholder="Name"
    />
    <input 
      v-model="form.email" 
      data-testid="email-input" 
      placeholder="Email"
    />
    <button type="submit" data-testid="submit-button">Update</button>
    <button type="button" @click="reset" data-testid="reset-button">Reset</button>
  </form>
</template>

// UserForm.spec.js - 测试文件
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import UserForm from './UserForm.vue'

describe('UserForm.vue', () => {
  const user = {
    name: 'John Doe',
    email: 'john@example.com'
  }
  
  it('initializes form with user props', () => {
    const wrapper = mount(UserForm, {
      props: { user }
    })
    
    expect(wrapper.get('[data-testid="name-input"]').element.value).toBe(user.name)
    expect(wrapper.get('[data-testid="email-input"]').element.value).toBe(user.email)
  })
  
  it('emits update event with form data on submit', async () => {
    const wrapper = mount(UserForm, {
      props: { user }
    })
    
    // 修改输入
    await wrapper.get('[data-testid="name-input"]').setValue('Jane Doe')
    await wrapper.get('[data-testid="email-input"]').setValue('jane@example.com')
    
    // 提交表单
    await wrapper.get('form').trigger('submit')
    
    // 检查事件
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0][0]).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com'
    })
  })
  
  it('emits reset event and resets form on reset', async () => {
    const wrapper = mount(UserForm, {
      props: { user }
    })
    
    // 修改输入
    await wrapper.get('[data-testid="name-input"]').setValue('Jane Doe')
    // 点击重置
    await wrapper.get('[data-testid="reset-button"]').trigger('click')
    
    // 检查事件
    expect(wrapper.emitted('reset')).toBeTruthy()
    // 检查表单值是否重置
    expect(wrapper.get('[data-testid="name-input"]').element.value).toBe(user.name)
  })
  
  it('updates form when props change', async () => {
    const wrapper = mount(UserForm, {
      props: { user }
    })
    
    // 更新props
    await wrapper.setProps({
      user: {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }
    })
    
    // 检查表单是否更新
    expect(wrapper.get('[data-testid="name-input"]').element.value).toBe('Jane Doe')
    expect(wrapper.get('[data-testid="email-input"]').element.value).toBe('jane@example.com')
  })
})
```

## 端到端测试

### 使用Cypress测试Vue应用

```js
/**
 * Cypress端到端测试
 */
// cypress/e2e/todo.cy.js
describe('Todo App', () => {
  beforeEach(() => {
    // 访问应用
    cy.visit('/')
    
    // 清除所有待办事项
    cy.get('[data-testid="clear-completed"]').click()
  })
  
  it('displays the todo app', () => {
    cy.contains('h1', 'Todo App')
    cy.get('[data-testid="new-todo"]').should('be.visible')
  })
  
  it('can add new todos', () => {
    // 添加新待办事项
    cy.get('[data-testid="new-todo"]').type('Learn Cypress{enter}')
    
    // 验证待办事项已添加
    cy.get('[data-testid="todo-list"] li').should('have.length', 1)
    cy.contains('[data-testid="todo-list"] li', 'Learn Cypress')
  })
  
  it('can mark todos as completed', () => {
    // 添加待办事项
    cy.get('[data-testid="new-todo"]').type('Learn Cypress{enter}')
    
    // 标记为已完成
    cy.get('[data-testid="todo-checkbox"]').first().click()
    
    // 验证已标记为完成
    cy.get('[data-testid="todo-list"] li').first().should('have.class', 'completed')
  })
  
  it('persists todos between page loads', () => {
    // 添加待办事项
    cy.get('[data-testid="new-todo"]').type('Persistent Todo{enter}')
    
    // 重新加载页面
    cy.reload()
    
    // 验证待办事项依然存在
    cy.contains('[data-testid="todo-list"] li', 'Persistent Todo')
  })
  
  it('filters todos correctly', () => {
    // 添加两个待办事项
    cy.get('[data-testid="new-todo"]').type('Active todo{enter}')
    cy.get('[data-testid="new-todo"]').type('Completed todo{enter}')
    
    // 将第二个标记为已完成
    cy.get('[data-testid="todo-checkbox"]').eq(1).click()
    
    // 过滤为活动待办事项
    cy.get('[data-testid="filter-active"]').click()
    cy.get('[data-testid="todo-list"] li').should('have.length', 1)
    cy.contains('[data-testid="todo-list"] li', 'Active todo')
    
    // 过滤为已完成待办事项
    cy.get('[data-testid="filter-completed"]').click()
    cy.get('[data-testid="todo-list"] li').should('have.length', 1)
    cy.contains('[data-testid="todo-list"] li', 'Completed todo')
    
    // 显示所有待办事项
    cy.get('[data-testid="filter-all"]').click()
    cy.get('[data-testid="todo-list"] li').should('have.length', 2)
  })
})
```

### 使用Playwright测试Vue应用

```js
/**
 * Playwright端到端测试
 */
// tests/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页
    await page.goto('/login')
  })
  
  test('displays login form', async ({ page }) => {
    // 验证标题
    await expect(page.locator('h1')).toHaveText('Login')
    
    // 验证表单元素
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
  
  test('shows error with invalid credentials', async ({ page }) => {
    // 填写表单
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    
    // 提交表单
    await page.getByRole('button', { name: 'Login' }).click()
    
    // 验证错误消息
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })
  
  test('navigates to dashboard with valid login', async ({ page }) => {
    // 填写表单
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    
    // 提交表单
    await page.getByRole('button', { name: 'Login' }).click()
    
    // 验证导航到仪表板
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toHaveText('Dashboard')
  })
  
  test('remembers user session', async ({ page }) => {
    // 登录
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Remember me').check()
    await page.getByRole('button', { name: 'Login' }).click()
    
    // 确认已登录
    await expect(page).toHaveURL('/dashboard')
    
    // 关闭并重新打开页面
    await page.close()
    const newPage = await page.context().newPage()
    await newPage.goto('/')
    
    // 验证仍然登录
    await expect(newPage).toHaveURL('/dashboard')
  })
})
```

## 测试驱动开发 (TDD)

### TDD工作流程

```js
/**
 * 测试驱动开发示例 - 任务筛选器
 */
// 1. 先编写失败的测试
// taskFilter.spec.js
import { describe, it, expect } from 'vitest'
import { filterTasks } from './taskFilter'

describe('filterTasks', () => {
  const tasks = [
    { id: 1, title: 'Task 1', completed: false, priority: 'high' },
    { id: 2, title: 'Task 2', completed: true, priority: 'medium' },
    { id: 3, title: 'Buy milk', completed: false, priority: 'low' }
  ]
  
  it('filters tasks by completion status', () => {
    expect(filterTasks(tasks, { completed: true })).toEqual([tasks[1]])
    expect(filterTasks(tasks, { completed: false })).toEqual([tasks[0], tasks[2]])
  })
  
  it('filters tasks by search term', () => {
    expect(filterTasks(tasks, { searchTerm: 'milk' })).toEqual([tasks[2]])
    expect(filterTasks(tasks, { searchTerm: 'task' })).toEqual([tasks[0], tasks[1]])
  })
  
  it('filters tasks by priority', () => {
    expect(filterTasks(tasks, { priority: 'high' })).toEqual([tasks[0]])
    expect(filterTasks(tasks, { priority: 'low' })).toEqual([tasks[2]])
  })
  
  it('combines multiple filter criteria', () => {
    expect(filterTasks(tasks, { 
      completed: false,
      priority: 'high'
    })).toEqual([tasks[0]])
    
    expect(filterTasks(tasks, {
      searchTerm: 'task',
      completed: false
    })).toEqual([tasks[0]])
  })
  
  it('returns all tasks when no filters provided', () => {
    expect(filterTasks(tasks, {})).toEqual(tasks)
  })
})

// 2. 实现功能代码
// taskFilter.js
export function filterTasks(tasks, filters = {}) {
  return tasks.filter(task => {
    // 检查完成状态
    if (filters.completed !== undefined && task.completed !== filters.completed) {
      return false
    }
    
    // 检查优先级
    if (filters.priority && task.priority !== filters.priority) {
      return false
    }
    
    // 检查搜索词
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      if (!task.title.toLowerCase().includes(searchTerm)) {
        return false
      }
    }
    
    return true
  })
}

// 3. 运行测试确认通过

// 4. 重构代码以改进性能或可读性，保持测试通过
export function filterTasks(tasks, filters = {}) {
  const { completed, priority, searchTerm } = filters
  
  // 如果没有过滤条件，返回所有任务
  if (!completed && !priority && !searchTerm) {
    return tasks
  }
  
  return tasks.filter(task => {
    // 检查完成状态
    if (completed !== undefined && task.completed !== completed) {
      return false
    }
    
    // 检查优先级
    if (priority && task.priority !== priority) {
      return false
    }
    
    // 检查搜索词
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })
}
```

### 模拟外部依赖

```js
/**
 * 模拟外部依赖进行测试
 */
// userService.js - 要测试的服务
import axios from 'axios'

export async function fetchUsers() {
  const response = await axios.get('/api/users')
  return response.data
}

export async function createUser(userData) {
  const response = await axios.post('/api/users', userData)
  return response.data
}

// userService.spec.js - 测试文件
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUsers, createUser } from './userService'
import axios from 'axios'

// 模拟axios
vi.mock('axios')

describe('userService', () => {
  beforeEach(() => {
    // 清除所有模拟
    vi.clearAllMocks()
  })
  
  describe('fetchUsers', () => {
    it('fetches users from the API', async () => {
      // 设置模拟响应
      const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
      axios.get.mockResolvedValue({ data: users })
      
      // 调用函数
      const result = await fetchUsers()
      
      // 验证结果
      expect(result).toEqual(users)
      // 验证API调用
      expect(axios.get).toHaveBeenCalledWith('/api/users')
      expect(axios.get).toHaveBeenCalledTimes(1)
    })
    
    it('throws error when the API call fails', async () => {
      // 设置模拟错误
      const error = new Error('Network Error')
      axios.get.mockRejectedValue(error)
      
      // 验证抛出异常
      await expect(fetchUsers()).rejects.toThrow('Network Error')
    })
  })
  
  describe('createUser', () => {
    it('creates a new user', async () => {
      // 设置模拟数据
      const userData = { name: 'Alice', email: 'alice@example.com' }
      const createdUser = { id: 3, ...userData }
      
      // 设置模拟响应
      axios.post.mockResolvedValue({ data: createdUser })
      
      // 调用函数
      const result = await createUser(userData)
      
      // 验证结果
      expect(result).toEqual(createdUser)
      // 验证API调用
      expect(axios.post).toHaveBeenCalledWith('/api/users', userData)
      expect(axios.post).toHaveBeenCalledTimes(1)
    })
  })
})
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶)
- [高级主题](/vue/advanced-topics)
- [性能优化](/vue/performance-optimization) 