---
outline: deep
---

# Next.js 路由系统

Next.js 有一个基于文件系统的路由器，本文将详细介绍其使用方法。

## 文件系统路由
Next.js 使用基于文件系统的路由，当文件添加到 pages 目录时，它会自动变成一个路由。

```jsx
// pages/index.js → /
// pages/blog/index.js → /blog
// pages/blog/first-post.js → /blog/first-post
// pages/dashboard/settings/username.js → /dashboard/settings/username
```

## 动态路由
Next.js 支持带有动态路由的页面。例如，如果你创建了一个名为 pages/posts/[id].js 的文件，那么它将可以通过 posts/1, posts/2 等路径访问。

```jsx
// pages/posts/[id].js
import { useRouter } from 'next/router'

export default function Post() {
  const router = useRouter()
  const { id } = router.query

  return <p>文章 ID: {id}</p>
}
```

## 路由跳转
使用 Link 组件和 useRouter 钩子实现客户端路由跳转。

```jsx
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navigation() {
  const router = useRouter()

  return (
    <div>
      <h1>导航示例</h1>
      
      {/* 使用 Link 组件 */}
      <nav>
        <ul>
          <li>
            <Link href="/">
              首页
            </Link>
          </li>
          <li>
            <Link href="/about">
              关于
            </Link>
          </li>
          <li>
            <Link href="/posts/[id]" as="/posts/1">
              文章 1
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* 使用 useRouter 编程式导航 */}
      <button onClick={() => router.push('/dashboard')}>
        进入控制台
      </button>
    </div>
  )
}
```

## 浅层路由
通过设置 shallow 选项，可以在不运行数据获取方法的情况下更新当前页面的 URL。

```jsx
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/?counter=10', undefined, { shallow: true })}>
      设置计数器
    </button>
  )
} 