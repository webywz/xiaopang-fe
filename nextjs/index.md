---
layout: doc
title: Next.js开发指南
description: 从入门到精通的Next.js开发教程
---

# Next.js开发指南

<div class="under-construction">
  <img src="/images/under-construction.png" alt="正在建设中" />
  <h2>此页面正在建设中</h2>
  <p>我们正在编写Next.js系列教程，敬请期待！</p>
  <p>你可以先查看我们已有的相关文章：</p>
  <ul>
    <li><a href="/blog/frontend-monorepo">大型前端项目的Monorepo实践指南</a></li>
    <li><a href="/blog/react-server-components">React Server Components详解</a></li>
  </ul>
</div>

Next.js 是一个轻量级的 React 框架，用于构建服务端渲染和静态网站。

## Next.js 介绍
Next.js 为您提供了生产环境所需的所有功能以及最佳的开发体验。

## 创建 Next.js 应用
使用 create-next-app 快速开始一个新的 Next.js 项目。

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

## 页面与布局
Next.js 中的每个页面都是从 pages 目录中的组件导出。

```jsx
// pages/index.js
export default function Home() {
  return (
    <div>
      <h1>欢迎来到 Next.js!</h1>
      <p>这是一个示例页面</p>
    </div>
  )
}
```

## 静态生成与服务端渲染
Next.js 支持两种预渲染形式：静态生成和服务器端渲染。

```jsx
// 静态生成示例
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()

  return {
    props: {
      data,
    },
    // 页面将在指定时间（秒）后重新生成
    revalidate: 10,
  }
}

// 使用数据的组件
export default function Blog({ data }) {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  )
} 