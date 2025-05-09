---
outline: deep
---

# Next.js 状态管理

有效的状态管理对于构建现代 React 应用程序至关重要，本文将介绍在 Next.js 中使用各种状态管理解决方案。

## React 内置状态管理

React 自身提供了一些基本的状态管理工具，适用于简单的状态管理需求。

### useState 和 useReducer

适用于组件级别的简单状态：

```jsx
"use client"

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  )
}
```

使用 `useReducer` 处理复杂状态逻辑：

```jsx
"use client"

import { useReducer } from 'react'

// 定义初始状态
const initialState = { count: 0, lastAction: null }

// 定义 reducer 函数
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, lastAction: 'increment' }
    case 'decrement':
      return { count: state.count - 1, lastAction: 'decrement' }
    case 'reset':
      return { count: 0, lastAction: 'reset' }
    default:
      throw new Error()
  }
}

export default function AdvancedCounter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <div>
      <p>计数: {state.count}</p>
      <p>上次操作: {state.lastAction || '无'}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>减少</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  )
}
```

### Context API

适用于跨组件共享状态：

```jsx
"use client"

import { createContext, useContext, useReducer } from 'react'

// 创建上下文
const CountContext = createContext(null)

// 初始状态和 reducer 函数
const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

// 提供者组件
export function CountProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <CountContext.Provider value={{ state, dispatch }}>
      {children}
    </CountContext.Provider>
  )
}

// 自定义钩子
export function useCount() {
  const context = useContext(CountContext)
  if (!context) {
    throw new Error('useCount 必须在 CountProvider 内部使用')
  }
  return context
}

// 使用状态的组件
function CountDisplay() {
  const { state } = useCount()
  return <div>计数: {state.count}</div>
}

function CountButtons() {
  const { dispatch } = useCount()
  return (
    <div>
      <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>减少</button>
    </div>
  )
}

// 父组件集成了提供者
export default function CounterApp() {
  return (
    <CountProvider>
      <CountDisplay />
      <CountButtons />
    </CountProvider>
  )
}
```

## 状态库集成

### Redux Toolkit

Redux Toolkit 是 Redux 的官方推荐工具包，简化了 Redux 的使用。

#### 设置 Redux Toolkit

1. 安装依赖：

```bash
npm install @reduxjs/toolkit react-redux
```

2. 创建 store：

```jsx
// lib/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import userReducer from './slices/userSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      user: userReducer,
    },
  })
}

// 为服务器端渲染和客户端分别创建 store
let store

export function initializeStore(preloadedState) {
  let _store = store ?? makeStore(preloadedState)

  // 为 SSR 创建新 store 实例
  if (preloadedState && store) {
    _store = makeStore({
      ...store.getState(),
      ...preloadedState,
    })
    store = undefined
  }

  // 为 SSR 创建 store
  if (typeof window === 'undefined') return _store
  
  // 为客户端创建 store
  if (!store) store = _store
  
  return _store
}

export function useStore(initialState) {
  return initializeStore(initialState)
}
```

3. 创建 slice：

```jsx
// lib/redux/slices/counterSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export const selectCount = (state) => state.counter.value

export default counterSlice.reducer
```

4. 设置 Redux 提供者：

```jsx
// app/providers.jsx
"use client"

import { Provider } from 'react-redux'
import { useStore } from '../lib/redux/store'

export function ReduxProvider({ children, initialState = {} }) {
  const store = useStore(initialState)
  
  return <Provider store={store}>{children}</Provider>
}
```

5. 在布局中应用：

```jsx
// app/layout.jsx
import { ReduxProvider } from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
```

6. 在组件中使用：

```jsx
"use client"

import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement, selectCount } from '../lib/redux/slices/counterSlice'

export default function Counter() {
  const count = useSelector(selectCount)
  const dispatch = useDispatch()
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => dispatch(increment())}>增加</button>
      <button onClick={() => dispatch(decrement())}>减少</button>
    </div>
  )
}
```

### Zustand

Zustand 是一个小型、快速且可扩展的状态管理解决方案。

#### 设置 Zustand

1. 安装依赖：

```bash
npm install zustand
```

2. 创建 store：

```jsx
// lib/store/useCounterStore.js
import { create } from 'zustand'

export const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

3. 在组件中使用：

```jsx
"use client"

import { useCounterStore } from '../lib/store/useCounterStore'

export default function Counter() {
  const { count, increment, decrement, reset } = useCounterStore()
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>减少</button>
      <button onClick={reset}>重置</button>
    </div>
  )
}
```

4. 结合 React 的 `useMemo` 优化选择器：

```jsx
"use client"

import { useCounterStore } from '../lib/store/useCounterStore'
import { useMemo } from 'react'

export default function CounterStatus() {
  const count = useCounterStore((state) => state.count)
  
  const status = useMemo(() => {
    if (count > 0) return '正数'
    if (count < 0) return '负数'
    return '零'
  }, [count])
  
  return <div>当前状态: {status}</div>
}
```

### Jotai

Jotai 采用原子化的方式来管理状态。

#### 设置 Jotai

1. 安装依赖：

```bash
npm install jotai
```

2. 创建原子：

```jsx
// lib/atoms/counter.js
import { atom } from 'jotai'

// 基本原子
export const countAtom = atom(0)

// 派生原子
export const doubleCountAtom = atom(
  (get) => get(countAtom) * 2
)

// 写入原子
export const countActionsAtom = atom(
  (get) => get(countAtom),
  (get, set, action) => {
    switch (action.type) {
      case 'increment':
        set(countAtom, get(countAtom) + 1)
        break
      case 'decrement':
        set(countAtom, get(countAtom) - 1)
        break
      case 'reset':
        set(countAtom, 0)
        break
    }
  }
)
```

3. 在组件中使用：

```jsx
"use client"

import { useAtom, useAtomValue } from 'jotai'
import { countAtom, doubleCountAtom, countActionsAtom } from '../lib/atoms/counter'

export default function Counter() {
  // 读取和写入计数
  const [count, setCount] = useAtom(countAtom)
  
  // 只读取双倍计数
  const doubleCount = useAtomValue(doubleCountAtom)
  
  // 使用动作原子
  const [_, dispatch] = useAtom(countActionsAtom)
  
  return (
    <div>
      <p>计数: {count}</p>
      <p>双倍计数: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>直接增加</button>
      <button onClick={() => dispatch({ type: 'increment' })}>通过动作增加</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>通过动作减少</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  )
}
```

4. 使用 Provider 支持服务器组件：

```jsx
// app/jotai-provider.jsx
"use client"

import { Provider } from 'jotai'

export default function JotaiProvider({ children }) {
  return <Provider>{children}</Provider>
}
```

```jsx
// app/layout.jsx
import JotaiProvider from './jotai-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  )
}
```

## Next.js 服务器组件和状态管理

在 Next.js 的服务器组件中管理状态需要特别考虑，因为服务器组件本身不包含状态。

### 在服务器组件中使用状态

1. 将状态逻辑分离到客户端组件：

```jsx
// app/components/CounterClient.jsx - 客户端组件
"use client"

import { useState } from 'react'

export default function CounterClient() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}
```

```jsx
// app/counter/page.jsx - 服务器组件
import CounterClient from '../components/CounterClient'

export default function CounterPage() {
  return (
    <div>
      <h1>计数器页面</h1>
      <CounterClient />
    </div>
  )
}
```

2. 使用 Server Actions 更新状态：

```jsx
// app/actions.js
"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function updatePreferences(formData) {
  const theme = formData.get('theme')
  
  // 设置 cookie
  cookies().set('theme', theme)
  
  // 重定向到首页
  redirect('/')
}
```

```jsx
// app/components/ThemeSelector.jsx
"use client"

import { updatePreferences } from '../actions'

export default function ThemeSelector({ currentTheme }) {
  return (
    <form action={updatePreferences}>
      <select name="theme" defaultValue={currentTheme}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
        <option value="system">系统</option>
      </select>
      <button type="submit">保存</button>
    </form>
  )
}
```

```jsx
// app/settings/page.jsx
import { cookies } from 'next/headers'
import ThemeSelector from '../components/ThemeSelector'

export default function SettingsPage() {
  const cookieStore = cookies()
  const currentTheme = cookieStore.get('theme')?.value || 'system'
  
  return (
    <div>
      <h1>设置</h1>
      <h2>主题设置</h2>
      <ThemeSelector currentTheme={currentTheme} />
    </div>
  )
}
```

## 数据缓存与重新验证

Next.js 提供了内置的数据缓存和重新验证机制，适用于与服务器交互的状态。

### 使用 SWR

1. 安装依赖：

```bash
npm install swr
```

2. 创建钩子：

```jsx
// lib/hooks/useUser.js
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export function useUser(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/users/${id}` : null,
    fetcher
  )
  
  return {
    user: data,
    isLoading,
    isError: error,
    mutate
  }
}
```

3. 在组件中使用：

```jsx
"use client"

import { useUser } from '../lib/hooks/useUser'

export default function UserProfile({ userId }) {
  const { user, isLoading, isError, mutate } = useUser(userId)
  
  if (isLoading) return <div>加载中...</div>
  if (isError) return <div>加载失败</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => mutate()}>刷新数据</button>
    </div>
  )
}
```

### 使用 React Query

1. 安装依赖：

```bash
npm install @tanstack/react-query
```

2. 设置 React Query：

```jsx
// app/providers.jsx
"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

3. 在布局中使用：

```jsx
// app/layout.jsx
import { ReactQueryProvider } from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
```

4. 创建查询钩子：

```jsx
// lib/hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 获取产品列表
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json())
  })
}

// 获取单个产品
export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetch(`/api/products/${id}`).then(res => res.json()),
    enabled: !!id
  })
}

// 添加产品
export function useAddProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (newProduct) => 
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
```

5. 在组件中使用：

```jsx
"use client"

import { useProducts, useAddProduct } from '../lib/hooks/useProducts'
import { useState } from 'react'

export default function ProductManager() {
  const { data: products, isLoading, error } = useProducts()
  const addProduct = useAddProduct()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>
  
  const handleSubmit = (e) => {
    e.preventDefault()
    addProduct.mutate({ name, price: parseFloat(price) })
    setName('')
    setPrice('')
  }
  
  return (
    <div>
      <h1>产品管理</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="产品名称"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="价格"
          required
        />
        <button type="submit" disabled={addProduct.isPending}>
          {addProduct.isPending ? '添加中...' : '添加产品'}
        </button>
      </form>
      
      <h2>产品列表</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ¥{product.price}
          </li>
        ))}
      </ul>
    </div>
  )
} 