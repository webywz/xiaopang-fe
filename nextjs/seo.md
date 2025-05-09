---
outline: deep
---

# Next.js SEO 优化

Next.js 内置了多种 SEO 优化功能，本文详细介绍其使用方法。

## Head 组件
Next.js 内置了一个 Head 组件，用于修改页面的 head 标签。

```jsx
import Head from 'next/head'

function IndexPage() {
  return (
    <div>
      <Head>
        <title>我的网站首页</title>
        <meta name="description" content="这是我的网站描述" />
        <meta name="keywords" content="Next.js, React, JavaScript" />
        <meta property="og:title" content="我的网站首页" />
        <meta property="og:description" content="这是我的网站描述" />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <link rel="canonical" href="https://example.com" />
      </Head>
      <h1>欢迎来到我的网站</h1>
    </div>
  )
}

export default IndexPage
```

## next-seo
next-seo 是一个用于管理 SEO 的插件，它提供了更多的 SEO 功能。

```jsx
import { NextSeo } from 'next-seo'

function IndexPage() {
  return (
    <div>
      <NextSeo
        title="我的网站首页"
        description="这是我的网站描述"
        canonical="https://example.com"
        openGraph={{
          url: 'https://example.com',
          title: '我的网站首页',
          description: '这是我的网站描述',
          images: [
            {
              url: 'https://example.com/og-image.jpg',
              width: 800,
              height: 600,
              alt: '首页图片',
            },
          ],
          site_name: '我的网站',
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />
      <h1>欢迎来到我的网站</h1>
    </div>
  )
}

export default IndexPage
```

## 动态 OG 图像
学习如何为你的 Next.js 应用生成动态的 Open Graph 图像。

```jsx
// pages/api/og.jsx
import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  try {
    const { searchParams } = new URL(req.url)
    
    // 获取动态参数
    const title = searchParams.get('title') || '默认标题'
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            color: 'white',
            background: 'linear-gradient(to right, #667eea, #764ba2)',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {title}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
```

### 在页面中使用动态 OG 图像

```jsx
import Head from 'next/head'

export default function BlogPost({ post }) {
  const ogImageUrl = `https://example.com/api/og?title=${encodeURIComponent(post.title)}`
  
  return (
    <div>
      <Head>
        <title>{post.title}</title>
        <meta property="og:image" content={ogImageUrl} />
        <meta property="twitter:image" content={ogImageUrl} />
      </Head>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  )
}
``` 