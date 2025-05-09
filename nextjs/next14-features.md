---
outline: deep
---

# Next.js 14 新特性

Next.js 14 于 2023 年 10 月发布，带来了多项重要更新和性能改进。本文将详细介绍这些新特性。

## Partial Prerendering (部分预渲染)

Partial Prerendering 是 Next.js 14 中引入的革命性渲染模式，允许单个页面同时包含静态和动态部分。

### 工作原理

Partial Prerendering 将页面初始加载分为两个阶段：

1. **静态外壳** - 预渲染并缓存静态内容
2. **动态区域** - 在请求时异步填充

```jsx
// app/products/page.js
import { Suspense } from 'react'
import ProductList from './ProductList'
import RealtimeStats from './RealtimeStats'

export default function Page() {
  return (
    <div>
      {/* 静态内容会被预渲染和缓存 */}
      <h1>产品列表</h1>
      <p>浏览我们的产品目录</p>
      
      {/* 动态内容使用 Suspense 边界 */}
      <Suspense fallback={<p>加载产品列表...</p>}>
        <ProductList />
      </Suspense>
      
      <Suspense fallback={<p>加载实时统计...</p>}>
        <RealtimeStats />
      </Suspense>
    </div>
  )
}
```

### 自动优化

Next.js 会根据数据获取方式自动确定哪些部分应该静态或动态：

```jsx
// ProductList.js - 使用缓存的数据，会被静态渲染
export default async function ProductList() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // 1小时缓存
  }).then(res => res.json())
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}

// RealtimeStats.js - 使用动态数据，会被动态渲染
export default async function RealtimeStats() {
  const stats = await fetch('https://api.example.com/stats', {
    cache: 'no-store' // 动态数据
  }).then(res => res.json())
  
  return (
    <div>
      <p>当前在线用户: {stats.activeUsers}</p>
      <p>今日销售额: {stats.todaySales}</p>
    </div>
  )
}
```

### 好处

- **快速初始页面加载** - 静态外壳立即显示
- **响应式动态内容** - 动态内容异步加载
- **减少服务器负载** - 大部分内容从 CDN 提供
- **改进的可扩展性** - 仅动态部分需要服务器资源

## Server Actions 改进

Next.js 14 显著改进了服务器操作的功能和性能。

### 稳定版 Server Actions

Server Actions 现在是稳定的生产就绪特性：

```jsx
// app/actions.js
"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  // 服务器端验证
  if (!title || title.length < 3) {
    return { error: '标题至少需要3个字符' }
  }
  
  try {
    // 直接访问数据库
    await db.post.create({
      data: { title, content }
    })
    
    // 重新验证路径
    revalidatePath('/blog')
    
    // 重定向到博客列表
    redirect('/blog')
  } catch (error) {
    return { error: '创建文章失败' }
  }
}
```

### 改进的表单处理

新的表单处理体验，支持状态和验证：

```jsx
"use client"

import { useFormState, useFormStatus } from 'react-dom'
import { createPost } from '@/app/actions'

// 提交按钮组件
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '发布中...' : '发布文章'}
    </button>
  )
}

// 表单组件
export default function NewPostForm() {
  const [state, formAction] = useFormState(createPost, {})
  
  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">标题</label>
        <input id="title" name="title" type="text" required />
        {state.error && state.error.includes('标题') && 
          <p className="error">{state.error}</p>}
      </div>
      
      <div>
        <label htmlFor="content">内容</label>
        <textarea id="content" name="content" required />
      </div>
      
      <SubmitButton />
    </form>
  )
}
```

### 高级用例：乐观更新

使用服务器操作与客户端状态结合实现乐观更新：

```jsx
"use client"

import { experimental_useOptimistic as useOptimistic } from 'react'
import { likePost } from '@/app/actions'

export default function Post({ post }) {
  // 设置乐观状态
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post.likes,
    (state, newLike) => state + newLike
  )
  
  // 处理点赞
  async function handleLike() {
    // 立即更新 UI
    addOptimisticLike(1)
    
    // 调用服务器操作
    await likePost(post.id)
  }
  
  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <div>
        <span>点赞: {optimisticLikes}</span>
        <button onClick={handleLike}>👍</button>
      </div>
    </div>
  )
}
```

## Next.js 学习改进

### 新的 Learn Next.js 课程

Next.js 14 发布了全新官方学习课程，涵盖现代 Next.js 应用开发的各个方面：

- App Router 架构
- 数据获取和缓存
- 服务器组件和客户端组件
- Streaming 和 Suspense
- CSS 和样式策略
- 认证和授权
- 元数据和 SEO
- 部署最佳实践

### 新文档结构

文档结构重组，使学习路径更加清晰：

1. **入门指南** - 适合初学者
2. **API 参考** - 详细功能文档
3. **架构指南** - 深入理解原理

## 依赖升级

### 自动 React 升级

Next.js 14 自动包含最新的 React 版本（React 18.3）：

- React 编译器 (alpha)
- 新的 Asset Loading API
- 改进的 Suspense

### 升级 Turbopack

改进的 Turbopack 开发服务器：

- 开发模式下速度提高 53%
- 支持更多 Next.js 功能
- 内存减少 40%

## 增强的构建优化

### 构建时优化

- **减小包体积** - 更智能的 tree-shaking 和代码拆分
- **改进的静态分析** - 更好地检测和删除未使用代码
- **自动渲染优化** - 智能选择最佳渲染策略

```jsx
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'react-icons', 
      'date-fns', 
      'lodash'
    ]
  }
}
```

### 图像和字体

改进的图像和字体优化：

```jsx
// app/components/ProfileImage.jsx
import Image from 'next/image'

export default function ProfileImage() {
  return (
    <Image
      src="/profile.jpg"
      width={300}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority
      sizes="(max-width: 768px) 100vw, 300px"
      alt="个人资料图片"
    />
  )
}
```

## Metadata API 增强

### 增强的元数据类型

新的元数据选项用于改进 SEO：

```jsx
// app/blog/[slug]/page.jsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://example.com/blog/${post.slug}`,
      languages: {
        'zh-CN': `https://example.com/zh/blog/${post.slug}`,
        'en-US': `https://example.com/en/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
    },
    verification: {
      google: 'google-site-verification-code',
      baidu: 'baidu-site-verification-code',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        'max-image-preview': 'large',
      },
    },
  }
}
```

### ViewTransitions API

实验性支持 View Transitions API 用于页面过渡动画：

```jsx
// app/layout.jsx
import { useViewTransition } from 'next/navigation'

export default function Layout({ children }) {
  useViewTransition()
  
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

## 路由处理程序增强

### 高级路由处理

改进的路由处理程序 API：

```jsx
// app/api/products/route.js
import { NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // 检查速率限制
  const ip = request.headers.get('x-forwarded-for')
  const limiterResult = await rateLimiter(ip)
  
  if (!limiterResult.success) {
    return NextResponse.json(
      { error: '请求过于频繁' },
      { status: 429 }
    )
  }
  
  try {
    const products = await getProducts()
    
    // 使用边缘运行时处理器
    const processedProducts = products.map(p => ({
      ...p,
      price: p.price * getCurrencyRate(request),
    }))
    
    return NextResponse.json(processedProducts)
  } catch (error) {
    return NextResponse.json(
      { error: '获取产品失败' },
      { status: 500 }
    )
  }
}

// 获取请求区域的货币汇率
function getCurrencyRate(request) {
  const country = request.geo?.country || 'CN'
  const rates = { CN: 1, US: 0.14, JP: 21.33 }
  return rates[country] || 1
}
```

## 升级指南

### 从 Next.js 13 升级到 14

升级到 Next.js 14 非常简单：

```bash
# 使用 npm
npm install next@latest react@latest react-dom@latest eslint-config-next@latest

# 使用 yarn
yarn add next@latest react@latest react-dom@latest eslint-config-next@latest

# 使用 pnpm
pnpm update next react react-dom eslint-config-next --latest
```

### 破坏性变化

Next.js 14 的主要破坏性变化：

1. Node.js 16.14 或更高版本现在是必需的
2. 不再支持旧的 `next/image` 导入模式
3. 移除了旧的 `next/font` 导入方式 