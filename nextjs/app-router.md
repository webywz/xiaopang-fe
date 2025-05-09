---
outline: deep
---

# Next.js App Router

App Router 是 Next.js 13 引入的新一代路由系统，基于 React Server Components，提供了更强大的路由功能。

## App 目录结构

Next.js 13+ 引入了新的 `app` 目录结构，与传统的 `pages` 目录并存。

```jsx
app/
├── layout.js      // 根布局
├── page.js        // 根页面 (/)
├── about/
│   └── page.js    // 关于页面 (/about)
├── blog/
│   ├── layout.js  // 博客布局
│   ├── page.js    // 博客首页 (/blog)
│   └── [slug]/
│       └── page.js // 博客文章页 (/blog/article-1)
└── api/
    └── route.js   // API 路由
```

## 特殊文件约定

App Router 使用特殊的文件名约定来定义 UI：

```jsx
app/
├── layout.js      // 共享布局
├── page.js        // 页面 UI
├── loading.js     // 加载状态
├── error.js       // 错误边界
├── not-found.js   // 404 页面
└── template.js    // 类似 layout 但每次都重新创建
```

## Route Groups

Route Groups 允许你将路由分组而不影响 URL 路径。

```jsx
app/
├── (marketing)/ // 不影响 URL 路径
│   ├── about/
│   │   └── page.js // /about
│   └── blog/
│       └── page.js // /blog
└── (shop)/
    ├── cart/
    │   └── page.js // /cart
    └── checkout/
        └── page.js // /checkout
```

## 并行路由

并行路由允许在同一视图中同时呈现多个页面。

```jsx
app/
├── @dashboard/
│   └── page.js
├── @analytics/
│   └── page.js
└── layout.js
```

```jsx
// app/layout.js
export default function Layout({ children, dashboard, analytics }) {
  return (
    <div>
      {children}
      {dashboard}
      {analytics}
    </div>
  )
}
```

## 拦截路由

拦截路由允许你在当前布局内加载新的路由，适用于模态框和对话框。

```jsx
app/
├── feed/
│   └── page.js
└── (.)photo/[id]/
    └── page.js // 会在/feed内显示，而不是导航到新页面
```

## Route Handlers

Route Handlers 允许你为特定路由创建自定义请求处理程序。

```jsx
// app/api/users/route.js
export async function GET() {
  const users = await getUsers()
  return Response.json(users)
}

export async function POST(request) {
  const data = await request.json()
  const newUser = await createUser(data)
  return Response.json(newUser, { status: 201 })
}
``` 