---
title: Next.js 14全栈应用开发实践指南
date: 2024-04-22
author: 前端小胖
tags: ['Next.js', 'React', 'TypeScript', 'Full Stack']
description: 本文将详细介绍如何使用Next.js 14的最新特性，从零开始搭建一个全栈应用，包括服务端组件、数据获取、API路由等核心概念的实践应用。
---

# Next.js 14全栈应用开发实践指南

Next.js作为React全栈开发的首选框架，在14版本中引入了许多革命性的特性。本文将带你深入了解如何利用这些特性构建一个现代化的全栈应用。

[[toc]]

## 技术栈概述

本项目采用以下技术栈：

- **框架**: Next.js 14
- **开发语言**: TypeScript 5.0+
- **UI框架**: Tailwind CSS
- **组件库**: Shadcn UI
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **API开发**: tRPC
- **缓存**: React Query
- **部署**: Vercel
- **监控**: Sentry
- **测试**: Jest + React Testing Library
- **CI/CD**: GitHub Actions
- **文件存储**: AWS S3 / Cloudinary
- **支付集成**: Stripe
- **实时功能**: Socket.io / Pusher

## Next.js 14的核心特性

1. **App Router**
   - 基于文件系统的路由
   - 嵌套路由和布局
   - 动态路由
   - 平行路由
   - 拦截路由

2. **服务器组件**
   - 零客户端JavaScript
   - 自动代码分割
   - 流式渲染
   - 边缘渲染支持

3. **数据获取**
   - 服务器端数据获取
   - 增量静态再生成(ISR)
   - 动态函数
   - 路由缓存

4. **服务器操作**
   - 表单处理
   - 数据修改
   - 乐观更新
   - 重新验证

## 项目初始化

首先，创建一个新的Next.js项目：

```bash
# 创建项目
npx create-next-app@latest fullstack-app --typescript --tailwind --eslint

# 进入项目目录
cd fullstack-app

# 安装依赖
npm install
```

### 项目目录结构

采用Next.js 14的App Router结构：

```
fullstack-app/
├── app/
│   ├── (auth)/          # 认证相关路由
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/     # 仪表板路由
│   │   ├── settings/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── api/             # API路由
│   │   ├── auth/
│   │   └── trpc/
│   ├── components/      # 共享组件
│   │   ├── ui/
│   │   └── forms/
│   ├── lib/             # 工具函数
│   │   ├── prisma.ts
│   │   └── auth.ts
│   ├── styles/          # 样式文件
│   ├── types/           # 类型定义
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 首页
│   └── error.tsx        # 错误处理
├── prisma/              # Prisma配置
│   ├── schema.prisma
│   └── migrations/
├── public/              # 静态资源
├── tests/               # 测试文件
├── .env                 # 环境变量
├── next.config.js      # Next.js配置
├── tailwind.config.js  # Tailwind配置
├── tsconfig.json       # TypeScript配置
└── package.json        # 项目配置
```

## 服务器组件实践

### 1. 服务器组件基础

```tsx
// app/components/UserList.tsx
import { db } from '@/lib/db'
import { UserCard } from './UserCard'

async function getUsers() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true
    }
  })
  return users
}

export default async function UserList() {
  const users = await getUsers()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### 2. 流式渲染

```tsx
// app/components/PostList.tsx
import { Suspense } from 'react'
import { PostCard } from './PostCard'
import { LoadingSkeleton } from './LoadingSkeleton'

async function getPosts() {
  // 模拟较慢的数据获取
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const posts = await db.post.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return posts
}

export default function PostList() {
  return (
    <div className="space-y-4">
      <Suspense 
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        }
      >
        <Posts />
      </Suspense>
    </div>
  )
}

async function Posts() {
  const posts = await getPosts()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### 3. 错误处理

```tsx
// app/components/ErrorBoundary.tsx
'use client'

import { useEffect } from 'react'

interface Props {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // 错误上报
    console.error(error)
  }, [error])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold text-red-500">出错了!</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        重试
      </button>
    </div>
  )
}
```

## 数据库设计

### 1. Schema 定义

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  posts         Post[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   String
  published Boolean   @default(false)
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  comments  Comment[]
  tags      Tag[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("comments")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("tags")
}

enum Role {
  USER
  ADMIN
}
```

### 2. 数据库工具类

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### 3. 数据库迁移

```bash
# 创建迁移
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 生成Prisma Client
npx prisma generate
```

### 4. 种子数据

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员用户
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  // 创建示例标签
  const tags = await Promise.all(
    ['技术', '生活', '随笔'].map(name =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  )

  // 创建示例文章
  await prisma.post.createMany({
    data: [
      {
        title: 'Next.js 13 新特性介绍',
        content: '# Next.js 13\n\nNext.js 13 带来了许多激动人心的新特性...',
        published: true,
        authorId: admin.id
      },
      {
        title: 'React Server Components 实践',
        content: '# RSC\n\nReact Server Components 是一个革命性的特性...',
        published: true,
        authorId: admin.id
      }
    ]
  })

  console.log('Seed data created successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 5. 数据库操作示例

```typescript
// app/actions/post.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(data: {
  title: string
  content: string
  published?: boolean
  authorId: string
  tags?: string[]
}) {
  try {
    const post = await db.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
        authorId: data.authorId,
        tags: data.tags
          ? {
              connect: data.tags.map(tag => ({ name: tag }))
            }
          : undefined
      }
    })

    revalidatePath('/posts')
    redirect(`/posts/${post.id}`)
  } catch (error) {
    throw new Error('Failed to create post')
  }
}

export async function updatePost(postId: string, data: {
  title?: string
  content?: string
  published?: boolean
  tags?: string[]
}) {
  try {
    const post = await db.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        published: data.published,
        tags: data.tags
          ? {
              set: data.tags.map(tag => ({ name: tag }))
            }
          : undefined
      }
    })

    revalidatePath(`/posts/${post.id}`)
    revalidatePath('/posts')
  } catch (error) {
    throw new Error('Failed to update post')
  }
}

export async function deletePost(postId: string) {
  try {
    await db.post.delete({
      where: { id: postId }
    })

    revalidatePath('/posts')
    redirect('/posts')
  } catch (error) {
    throw new Error('Failed to delete post')
  }
}

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success('注册成功')
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">注册</h1>
          <p className="text-gray-500">
            创建您的账号
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">用户名</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="请输入用户名"
              required
              className="w-full rounded-lg border p-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱"
              required
              className="w-full rounded-lg border p-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              required
              className="w-full rounded-lg border p-2"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}

## 测试实践

### 1. 单元测试配置

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1'
  }
}

module.exports = createJestConfig(customJestConfig)

// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 2. 组件测试


// 示例：API速率限制
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
})

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 100, // 在100个请求后开始延迟
  delayMs: 500 // 每个请求增加500ms延迟
})

// 示例：CSRF保护
import { csrf } from '@/lib/csrf'

export async function POST(req: Request) {
  // 验证CSRF token
  const valid = await csrf.verify(req)
  if (!valid) {
    return new Response('Invalid CSRF token', { status: 403 })
  }

  // 处理请求
}

## 最佳实践指南

### 1. 性能优化最佳实践

```typescript
/**
 * 性能优化清单
 * 
 * 1. 组件优化
 * - 使用React.memo()避免不必要的重渲染
 * - 使用useMemo和useCallback缓存计算结果和回调函数
 * - 使用React.lazy()和Suspense实现代码分割
 * 
 * 2. 数据获取优化
 * - 实现数据预取和缓存策略
 * - 使用SWR或React Query进行数据请求管理
 * - 实现乐观更新
 */

// 示例：组件优化
import { memo, useMemo, useCallback } from 'react'

interface ListProps {
  items: Item[]
  onItemClick: (id: string) => void
}

const List = memo(function List({ items, onItemClick }: ListProps) {
  // 缓存计算结果
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.date - a.date)
  }, [items])

  // 缓存回调函数
  const handleClick = useCallback((id: string) => {
    onItemClick(id)
  }, [onItemClick])

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.title}
        </li>
      ))}
    </ul>
  )
})

// 示例：数据获取优化
function useOptimisticUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries(['post', newPost.id])
      const previousPost = queryClient.getQueryData(['post', newPost.id])
      queryClient.setQueryData(['post', newPost.id], newPost)
      return { previousPost }
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(
        ['post', newPost.id],
        context?.previousPost
      )
    },
    onSettled: (newPost) => {
      queryClient.invalidateQueries(['post', newPost.id])
    }
  })
}
```

### 2. 安全最佳实践

```typescript
/**
 * 安全清单
 * 
 * 1. 认证和授权
 * - 实现强密码策略
 * - 实现多因素认证
 * - 实现基于角色的访问控制
 * 
 * 2. 数据安全
 * - 加密敏感数据
 * - 实现安全的会话管理
 * - 防止SQL注入
 */

// 示例：密码加密
import { hash, compare } from 'bcryptjs'

async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

// 示例：API速率限制
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
})

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 100, // 在100个请求后开始延迟
  delayMs: 500 // 每个请求增加500ms延迟
})
```

### 3. 错误处理最佳实践

```typescript
/**
 * 错误处理策略
 * 
 * 1. 全局错误处理
 * - 实现错误边界
 * - 统一错误日志记录
 * - 用户友好的错误提示
 * 
 * 2. API错误处理
 * - 统一的错误响应格式
 * - 合适的HTTP状态码
 * - 详细的错误信息
 */

// 示例：错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出错了！</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// 示例：API错误处理
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 示例：异步错误处理
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new APIError(
        response.statusText,
        response.status,
        'FETCH_ERROR'
      )
    }
    return response
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}
```

### 4. 可访问性最佳实践

```typescript
/**
 * 可访问性指南
 * 
 * 1. 语义化HTML
 * - 使用正确的HTML标签
 * - 提供有意义的替代文本
 * - 使用ARIA属性
 * 
 * 2. 键盘可访问性
 * - 实现键盘导航
 * - 提供可见的焦点指示器
 * - 实现快捷键
 */

// 示例：可访问的导航菜单
function NavigationMenu() {
  return (
    <nav role="navigation" aria-label="主导航">
      <ul>
        <li>
          <a
            href="/"
            aria-current={isCurrentPage('/') ? 'page' : undefined}
          >
            首页
          </a>
        </li>
        <li>
          <button
            aria-expanded={isOpen}
            aria-controls="submenu"
            onClick={toggleMenu}
          >
            产品
          </button>
          <ul id="submenu" role="menu" hidden={!isOpen}>
            <li role="menuitem">
              <a href="/products/new">最新产品</a>
            </li>
            <li role="menuitem">
              <a href="/products/featured">推荐产品</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

// 示例：可访问的表单
function AccessibleForm() {
  return (
    <form aria-labelledby="form-title">
      <h2 id="form-title">联系我们</h2>
      
      <div role="group" aria-labelledby="personal-info">
        <h3 id="personal-info">个人信息</h3>
        
        <label htmlFor="name">
          姓名
          <span aria-hidden="true">*</span>
          <span className="sr-only">必填</span>
        </label>
        <input
          id="name"
          type="text"
          required
          aria-required="true"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="error" role="alert">
            {errors.name}
          </p>
        )}
      </div>
      
      <button type="submit" aria-busy={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  )
}
```

### 5. 国际化最佳实践

```typescript
/**
 * 国际化实践指南
 * 
 * 1. 文本翻译
 * - 使用翻译键
 * - 处理复数形式
 * - 处理日期和数字格式
 * 
 * 2. 本地化
 * - 支持不同的日期格式
 * - 支持不同的数字格式
 * - 支持不同的货币格式
 */

// 示例：使用next-intl进行国际化
import { useTranslations } from 'next-intl'
import { useFormatter } from 'next-intl'

function LocalizedComponent() {
  const t = useTranslations('Common')
  const format = useFormatter()
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>
        {t('lastUpdate', {
          date: format.dateTime(new Date(), {
            dateStyle: 'long'
          })
        })}
      </p>
      <p>
        {t('price', {
          price: format.number(1000, {
            style: 'currency',
            currency: 'CNY'
          })
        })}
      </p>
    </div>
  )
}

// 示例：RTL支持
function RTLProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useRouter()
  const dir = ['ar', 'he'].includes(locale) ? 'rtl' : 'ltr'
  
  return (
    <div dir={dir} className={dir === 'rtl' ? 'rtl' : undefined}>
      {children}
    </div>
  )
}
```

## 部署与监控

### 1. Docker部署配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 依赖阶段
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### 2. Nginx配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    # SSL配置
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # 安全headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # GZIP压缩
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1100;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### 3. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Build application
        run: npm run build
        
      - name: Deploy to AWS ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: my-service
          cluster: my-cluster
          wait-for-service-stability: true
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
```

### 4. 性能监控

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

// 初始化Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})

// 监控长任务
export function monitorLongTasks() {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          Sentry.captureMessage(
            `Long task detected: ${entry.name} (${Math.round(entry.duration)}ms)`,
            'warning'
          )
        }
      })
    })

    observer.observe({ entryTypes: ['longtask'] })
  }
}

// 收集性能指标
export function collectMetrics() {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'web-vital') {
          Sentry.captureMessage(
            `Web Vital: ${entry.name} = ${entry.value}`,
            'info'
          )
        }
      })
    })

    observer.observe({ entryTypes: ['web-vital'] })
  }
}

// 错误边界组件
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <Sentry.ErrorBoundary
        fallback={({ error }) => (
          <div className="error-container">
            <h2>出错了</h2>
            <p>{error.message}</p>
            <button onClick={() => window.location.reload()}>
              重新加载
            </button>
          </div>
        )}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    )
  }
}
```

### 5. 备份策略

```typescript
// scripts/backup.ts
import { exec } from 'child_process'
import { S3 } from 'aws-sdk'
import { promisify } from 'util'
import { createReadStream } from 'fs'

const execAsync = promisify(exec)
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

async function backupDatabase() {
  const timestamp = new Date().toISOString()
  const filename = `backup-${timestamp}.sql`

  try {
    // 创建数据库备份
    await execAsync(
      `pg_dump ${process.env.DATABASE_URL} > ${filename}`
    )

    // 上传到S3
    await s3.upload({
      Bucket: process.env.AWS_BACKUP_BUCKET!,
      Key: `database-backups/${filename}`,
      Body: createReadStream(filename)
    }).promise()

    // 清理本地文件
    await execAsync(`rm ${filename}`)

    console.log(`Backup completed: ${filename}`)
  } catch (error) {
    console.error('Backup failed:', error)
    throw error
  }
}

// 运行备份
backupDatabase()
```

## 高级功能实现

### 1. 实时搜索

```typescript
// hooks/use-search.ts
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { trpc } from '@/lib/trpc'

export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  debounceMs = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, debounceMs)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await searchFn(searchQuery)
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchFn])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  return {
    query,
    setQuery,
    results,
    isLoading
  }
}

// 使用示例
function SearchComponent() {
  const { query, setQuery, results, isLoading } = useSearch(
    async (q) => {
      const response = await fetch(`/api/search?q=${q}`)
      return response.json()
    }
  )

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
        className="search-input"
      />
      
      {isLoading ? (
        <div>搜索中...</div>
      ) : (
        <ul className="search-results">
          {results.map((result) => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 2. 文件上传优化

```typescript
// lib/upload.ts
import { createHash } from 'crypto'

interface ChunkInfo {
  chunk: Blob
  hash: string
  index: number
}

export class FileUploader {
  private chunks: ChunkInfo[] = []
  private chunkSize = 2 * 1024 * 1024 // 2MB

  constructor(
    private file: File,
    private onProgress?: (progress: number) => void
  ) {}

  async prepare() {
    const fileHash = await this.calculateHash(this.file)
    const chunks = this.splitFile()
    
    this.chunks = await Promise.all(
      chunks.map(async (chunk, index) => ({
        chunk,
        hash: await this.calculateHash(chunk),
        index
      }))
    )

    return {
      fileHash,
      totalChunks: this.chunks.length
    }
  }

  private splitFile() {
    const chunks: Blob[] = []
    let cur = 0
    
    while (cur < this.file.size) {
      chunks.push(
        this.file.slice(cur, cur + this.chunkSize)
      )
      cur += this.chunkSize
    }

    return chunks
  }

  private async calculateHash(blob: Blob) {
    const buffer = await blob.arrayBuffer()
    const hash = createHash('sha256')
    hash.update(Buffer.from(buffer))
    return hash.digest('hex')
  }

  async uploadChunks() {
    let uploadedChunks = 0

    await Promise.all(
      this.chunks.map(async (chunk) => {
        const formData = new FormData()
        formData.append('chunk', chunk.chunk)
        formData.append('hash', chunk.hash)
        formData.append('index', chunk.index.toString())

        await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData
        })

        uploadedChunks++
        this.onProgress?.(
          (uploadedChunks / this.chunks.length) * 100
        )
      })
    )
  }

  async mergeChunks(fileHash: string) {
    const response = await fetch('/api/upload/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileHash,
        filename: this.file.name,
        totalChunks: this.chunks.length
      })
    })

    return response.json()
  }
}

// 使用示例
async function handleFileUpload(file: File) {
  const uploader = new FileUploader(file, (progress) => {
    console.log(`Upload progress: ${progress}%`)
  })

  try {
    const { fileHash, totalChunks } = await uploader.prepare()
    await uploader.uploadChunks()
    const result = await uploader.mergeChunks(fileHash)
    console.log('Upload completed:', result)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### 3. 缓存优化

```typescript
// lib/cache.ts
interface CacheOptions {
  maxAge?: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
}

export class Cache<T> {
  private cache = new Map<string, {
    value: T
    timestamp: number
  }>()
  private maxAge: number
  private maxSize: number

  constructor(options: CacheOptions = {}) {
    this.maxAge = options.maxAge || 5 * 60 * 1000 // 默认5分钟
    this.maxSize = options.maxSize || 100
  }

  set(key: string, value: T) {
    if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) return undefined

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

// 使用示例
const pageCache = new Cache<string>({
  maxAge: 10 * 60 * 1000, // 10分钟
  maxSize: 50
})

async function getPageData(slug: string) {
  // 检查缓存
  const cached = pageCache.get(slug)
  if (cached) return cached

  // 获取数据
  const data = await fetchPageData(slug)
  
  // 存入缓存
  pageCache.set(slug, data)
  
  return data
}
```

## 总结

本文详细介绍了使用Next.js 14构建全栈应用的完整流程，涵盖了从开发到部署的各个方面：

1. 项目初始化和技术栈选择
2. 服务器组件实践
3. 数据库设计和实现
4. API路由开发
5. 认证系统实现
6. 状态管理方案
7. 性能优化实践
   - 组件优化
   - 数据获取优化
   - 缓存策略
   - 文件上传优化
8. 部署和监控
   - Docker配置
   - Nginx设置
   - CI/CD流程
   - 性能监控
   - 备份策略
9. 测试和文档
10. 最佳实践指南
    - 性能优化
    - 安全
    - 错误处理
    - 可访问性
    - 国际化

通过这些实践，我们可以构建一个高性能、可维护、安全可靠的Next.js全栈应用。如果你有任何问题或建议，欢迎在评论区留言讨论。
