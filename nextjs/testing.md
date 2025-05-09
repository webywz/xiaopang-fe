---
outline: deep
---

# Next.js 测试指南

为 Next.js 应用程序编写测试可以提高代码质量和可靠性，本文将介绍如何使用不同的测试工具和方法。

## 单元测试

使用 Jest 进行单元测试是 Next.js 应用程序最常见的测试方法。

### 配置 Jest

1. 安装依赖：

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

2. 创建 Jest 配置文件 `jest.config.js`：

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.js 应用的路径
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  // 添加更多自定义配置
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // 处理模块别名
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
}

// createJestConfig 会添加 Next.js 特定的配置
module.exports = createJestConfig(customJestConfig)
```

3. 创建 Jest 设置文件 `jest.setup.js`：

```javascript
// 使用 jest-dom 扩展断言
import '@testing-library/jest-dom'
```

4. 在 `package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### 测试 React 组件

使用 React Testing Library 测试组件：

```jsx
// components/Button.jsx
export default function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}

// components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button 组件', () => {
  it('渲染按钮文本', () => {
    render(<Button>点击我</Button>)
    const buttonElement = screen.getByText('点击我')
    expect(buttonElement).toBeInTheDocument()
  })

  it('点击时触发 onClick 事件', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>点击我</Button>)
    
    fireEvent.click(screen.getByText('点击我'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 测试自定义钩子

测试自定义 React Hooks：

```jsx
// hooks/useCounter.js
import { useState } from 'react'

export function useCounter(initialCount = 0) {
  const [count, setCount] = useState(initialCount)
  
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initialCount)
  
  return { count, increment, decrement, reset }
}

// hooks/useCounter.test.js
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('应该使用初始计数值', () => {
    const { result } = renderHook(() => useCounter(5))
    expect(result.current.count).toBe(5)
  })
  
  it('应该递增计数', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
  
  it('应该递减计数', () => {
    const { result } = renderHook(() => useCounter(5))
    
    act(() => {
      result.current.decrement()
    })
    
    expect(result.current.count).toBe(4)
  })
  
  it('应该重置计数', () => {
    const { result } = renderHook(() => useCounter(5))
    
    act(() => {
      result.current.increment()
      result.current.reset()
    })
    
    expect(result.current.count).toBe(5)
  })
})
```

## 集成测试

集成测试用于验证多个组件或功能一起工作的情况。

### 测试页面组件

```jsx
// pages/index.js
import { useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('表单已提交！')
  }
  
  return (
    <div>
      <h1>首页</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="输入内容" />
        <button type="submit">提交</button>
      </form>
      {message && <p data-testid="message">{message}</p>}
    </div>
  )
}

// __tests__/index.test.js
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../pages/index'

describe('首页', () => {
  it('应该渲染标题', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('首页')
  })
  
  it('提交表单时应该显示消息', () => {
    render(<Home />)
    
    // 表单提交前，消息不应该可见
    expect(screen.queryByTestId('message')).not.toBeInTheDocument()
    
    // 提交表单
    fireEvent.submit(screen.getByRole('form'))
    
    // 检查消息是否显示
    expect(screen.getByTestId('message')).toHaveTextContent('表单已提交！')
  })
})
```

## 端到端测试

使用 Cypress 进行端到端测试，验证整个应用程序的工作流程。

### 配置 Cypress

1. 安装依赖：

```bash
npm install --save-dev cypress
```

2. 在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "cypress": "cypress open",
    "cypress:headless": "cypress run"
  }
}
```

3. 初始化 Cypress 配置：

```bash
npx cypress open
```

### 编写 Cypress 测试

```javascript
// cypress/e2e/homepage.cy.js
describe('首页', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('应该显示网站标题', () => {
    cy.get('h1').should('contain', '首页')
  })
  
  it('应该显示导航菜单', () => {
    cy.get('nav').should('be.visible')
    cy.get('nav').find('a').should('have.length.at.least', 3)
  })
  
  it('应该能够提交表单', () => {
    cy.get('form').within(() => {
      cy.get('input[type="text"]').type('测试内容')
      cy.get('button[type="submit"]').click()
    })
    
    // 检查成功消息是否显示
    cy.get('[data-testid="message"]').should('be.visible')
    cy.get('[data-testid="message"]').should('contain', '表单已提交！')
  })
})
```

## 测试 API 路由

使用 Jest 和 Supertest 测试 API 路由：

```javascript
// __tests__/api/users.test.js
import { createMocks } from 'node-mocks-http'
import usersHandler from '../../pages/api/users'

describe('/api/users', () => {
  it('应该返回用户列表', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })
    
    await usersHandler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        users: expect.any(Array)
      })
    )
  })
  
  it('应该创建新用户', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: '张三',
        email: 'zhangsan@example.com'
      },
    })
    
    await usersHandler(req, res)
    
    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: '张三',
        email: 'zhangsan@example.com'
      })
    )
  })
})
```

## 测试策略

### 组件测试策略

```
1. 小型组件 -> 单元测试
2. 复杂组件 -> 集成测试
3. 页面组件 -> 集成测试 + 端到端测试
```

### 测试覆盖率

配置 Jest 测试覆盖率：

```javascript
// jest.config.js
const customJestConfig = {
  // ...其他配置
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!next.config.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

运行测试覆盖率报告：

```bash
npm test -- --coverage
```

## 测试服务器组件和客户端组件

### 测试服务器组件

```jsx
// app/components/ServerComponent.jsx
export default async function ServerComponent() {
  const data = await fetchData()
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
    </div>
  )
}

// __tests__/app/components/ServerComponent.test.jsx
import { render, screen } from '@testing-library/react'
import ServerComponent from '../../../app/components/ServerComponent'

// 模拟数据获取函数
jest.mock('../../../lib/data', () => ({
  fetchData: jest.fn().mockResolvedValue({
    title: '测试标题',
    body: '测试内容'
  })
}))

describe('ServerComponent', () => {
  it('应该渲染获取的数据', async () => {
    render(await ServerComponent())
    
    expect(screen.getByRole('heading')).toHaveTextContent('测试标题')
    expect(screen.getByText('测试内容')).toBeInTheDocument()
  })
})
```

### 测试客户端组件

```jsx
// app/components/ClientComponent.jsx
'use client'

import { useState } from 'react'

export default function ClientComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}

// __tests__/app/components/ClientComponent.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import ClientComponent from '../../../app/components/ClientComponent'

describe('ClientComponent', () => {
  it('应该渲染初始计数', () => {
    render(<ClientComponent />)
    
    expect(screen.getByText('当前计数: 0')).toBeInTheDocument()
  })
  
  it('点击按钮时应该增加计数', () => {
    render(<ClientComponent />)
    
    fireEvent.click(screen.getByText('增加'))
    
    expect(screen.getByText('当前计数: 1')).toBeInTheDocument()
  })
})
``` 