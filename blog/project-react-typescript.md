---
title: 从零搭建React+TypeScript项目 - 最佳实践指南
date: 2024-04-22
author: 前端小胖
tags: ['React', 'TypeScript', '项目实战', '工程化']
description: 本文详细介绍如何从零开始搭建一个基于React和TypeScript的现代前端项目，包含工程化配置、最佳实践和性能优化策略。
---

# 从零搭建React+TypeScript项目

在现代前端开发中，React结合TypeScript已经成为构建大型应用的主流技术选择。本文将带你从零开始搭建一个完整的React+TypeScript项目，包含工程化配置、代码规范、最佳实践和性能优化策略，让你的项目开发更加高效、稳定和可维护。

[[toc]]

## 技术栈概述

本项目将使用以下技术栈：

- **核心框架**: React 18
- **开发语言**: TypeScript 5.0+
- **构建工具**: Vite
- **路由管理**: React Router 6
- **状态管理**: React Context + hooks / Zustand
- **样式解决方案**: TailwindCSS / styled-components
- **表单处理**: React Hook Form
- **API请求**: Axios / SWR
- **代码规范**: ESLint + Prettier
- **测试工具**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

## 项目初始化

### 使用Vite创建项目

首先，我们使用Vite初始化项目：

```bash
# 创建项目
npm create vite@latest my-react-ts-app -- --template react-ts

# 进入项目目录
cd my-react-ts-app

# 安装依赖
npm install
```

### 目录结构设计

一个良好的目录结构能够帮助团队更好地组织和管理代码：

```
my-react-ts-app/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 项目资源文件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI组件
│   ├── hooks/              # 自定义hooks
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   ├── store/              # 状态管理
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 应用入口组件
│   ├── main.tsx            # 应用入口文件
│   └── vite-env.d.ts       # Vite类型声明
├── .eslintrc.js            # ESLint配置
├── .prettierrc             # Prettier配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── package.json            # 项目依赖
```

## 工程化配置

### TypeScript配置

编辑`tsconfig.json`，优化TypeScript配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 配置Vite

修改`vite.config.ts`，添加路径别名和优化配置：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios', 'lodash']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 配置ESLint和Prettier

安装ESLint和Prettier：

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier eslint-config-prettier eslint-plugin-prettier
```

创建`.eslintrc.js`：

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks',
    'jsx-a11y',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

创建`.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "endOfLine": "auto"
}
```

## 路由配置

安装React Router：

```bash
npm install react-router-dom
```

创建基础路由配置 `src/router.tsx`：

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 懒加载路由组件
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
]);

// 路由提供者组件
export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

## 状态管理

### Context + useReducer模式

创建`src/store/AppContext.tsx`：

```tsx
import { createContext, useReducer, useContext, ReactNode } from 'react';

// 定义状态类型
interface AppState {
  theme: 'light' | 'dark';
  user: {
    id: string | null;
    name: string | null;
    isAuthenticated: boolean;
  };
}

// 定义Action类型
type Action = 
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOGIN', payload: { id: string; name: string } }
  | { type: 'LOGOUT' };

// 初始状态
const initialState: AppState = {
  theme: 'light',
  user: {
    id: null,
    name: null,
    isAuthenticated: false
  }
};

// 创建Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Reducer函数
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    case 'LOGIN':
      return {
        ...state,
        user: {
          id: action.payload.id,
          name: action.payload.name,
          isAuthenticated: true
        }
      };
    case 'LOGOUT':
      return {
        ...state,
        user: {
          id: null,
          name: null,
          isAuthenticated: false
        }
      };
    default:
      return state;
  }
}

// Context Provider组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
```

### Zustand状态管理（可选）

安装Zustand：

```bash
npm install zustand
```

创建`src/store/useStore.ts`：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string | null;
  name: string | null;
  isAuthenticated: boolean;
}

interface AppState {
  theme: 'light' | 'dark';
  user: User;
  toggleTheme: () => void;
  login: (id: string, name: string) => void;
  logout: () => void;
}

// 创建store
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      user: {
        id: null,
        name: null,
        isAuthenticated: false
      },
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      login: (id, name) => set({
        user: {
          id,
          name,
          isAuthenticated: true
        }
      }),
      logout: () => set({
        user: {
          id: null,
          name: null,
          isAuthenticated: false
        }
      })
    }),
    {
      name: 'app-storage',
      // 只持久化主题设置
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
```

## API服务层

### Axios配置

安装Axios：

```bash
npm install axios
```

创建`src/services/api.ts`：

```typescript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在请求被发送前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做些什么
    return response.data;
  },
  (error: AxiosError) => {
    // HTTP错误状态处理
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，登出并重定向到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          console.error('禁止访问');
          break;
        case 404:
          // 资源不存在
          console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error(`HTTP错误: ${status}`);
          break;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查您的网络连接');
    } else {
      // 设置请求时出现问题
      console.error('请求配置错误', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 通用请求方法
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.get<T, T>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post<T, T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put<T, T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T, T>(url, config),
};

export default api;
```

### API模块示例

创建`src/services/userService.ts`：

```typescript
import { request } from './api';

// 用户类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 登录请求参数
export interface LoginParams {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 用户相关API
export const userService = {
  // 登录
  login: (params: LoginParams) =>
    request.post<LoginResponse>('/auth/login', params),
    
  // 获取当前用户信息
  getCurrentUser: () =>
    request.get<User>('/users/me'),
    
  // 更新用户信息
  updateUser: (id: string, data: Partial<User>) =>
    request.put<User>(`/users/${id}`, data),
};
```

## 自定义Hooks

### 使用SWR进行数据获取

安装SWR：

```bash
npm install swr
```

创建`src/hooks/useUser.ts`：

```typescript
import useSWR from 'swr';
import { userService, User } from '@/services/userService';

export function useUser() {
  // SWR hook用于获取用户信息
  const { data, error, isLoading, mutate } = useSWR<User>(
    '/users/me',
    () => userService.getCurrentUser()
  );

  return {
    user: data,
    isLoading,
    isError: error,
    isLoggedIn: !!data,
    mutate // 用于更新用户数据
  };
}
```

### 创建useLocalStorage钩子

创建`src/hooks/useLocalStorage.ts`：

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状态管理
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回一个封装版的setState函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许值是一个函数，类似于useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存state
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // 触发自定义事件，通知其他组件值已更改
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听变化
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // 当localStorage变化时更新state
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue] as const;
}
```

## 组件结构

### 创建布局组件

创建`src/components/layout/Layout.tsx`：

```tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAppContext } from '@/store/AppContext';

const Layout = () => {
  const { state } = useAppContext();
  const { theme } = state;

  return (
    <div className={`app ${theme}`}>
      <Header />
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
```

### 创建通用组件

创建`src/components/common/Button.tsx`：

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

// 按钮变种
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// 按钮大小
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * 按钮组件
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  // 基础类名
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // 变种类名
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    text: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  
  // 尺寸类名
  const sizeClasses = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };
  
  // 禁用或加载状态
  const stateClasses = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';
  
  // 组合所有类名
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${className || ''}`;

  return (
    <button 
      className={classes}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      
      {children}
    </button>
  );
};

export default Button;
```

## 测试配置

安装Vitest和测试库：

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

创建`src/setupTests.ts`：

```typescript
import '@testing-library/jest-dom';
```

更新`vite.config.ts`添加测试配置：

```typescript
/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
  // 其他配置...
})
```

创建一个示例测试文件`src/components/common/Button.test.tsx`：

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
    expect(screen.getByText('Click me').parentElement).toContainElement(
      document.querySelector('svg.animate-spin')
    );
  });
});
```

## CI/CD配置

创建`.github/workflows/main.yml`：

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
      
    - name: Type check
      run: npm run tsc
    
    - name: Run tests
      run: npm run test
    
    - name: Build
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/

  deploy:
    needs: build-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist
    
    # 部署到GitHub Pages
    - name: Deploy to GitHub Pages
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        folder: dist
```

## 项目启动脚本

更新`package.json`文件中的脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky install"
  }
}
```

## 总结

通过本文，我们从零搭建了一个基于React+TypeScript的现代前端项目，包含了：

1. 项目初始化和目录结构设计
2. TypeScript、ESLint、Prettier等工程化配置
3. 路由管理和代码分割
4. 状态管理（Context API和Zustand）
5. API请求层封装
6. 自定义Hooks
7. 组件设计与实现
8. 测试配置与示例
9. CI/CD流程

这个项目架构适合中大型React应用，具有良好的可扩展性和可维护性。通过使用TypeScript，我们获得了更好的类型安全和开发体验，减少了运行时错误，提高了代码质量。

希望本文对你搭建自己的React+TypeScript项目有所帮助！

## 参考资源

- [React官方文档](https://reactjs.org/docs/getting-started.html)
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [Vite官方文档](https://vitejs.dev/guide/)
- [React Router文档](https://reactrouter.com/en/main)
- [Zustand GitHub仓库](https://github.com/pmndrs/zustand)
- [SWR数据获取](https://swr.vercel.app/)
- [Testing Library文档](https://testing-library.com/docs/) 