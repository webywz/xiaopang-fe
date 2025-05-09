---
outline: deep
---

# Next.js 部署与优化

Next.js 应用可以部署到各种环境中，本文将详细介绍部署流程和性能优化策略。

## 部署到 Vercel

Vercel 是 Next.js 的创建者开发的平台，提供了最佳的 Next.js 部署体验。

### 基本部署步骤

1. 在 [Vercel](https://vercel.com) 上创建账户
2. 安装 Vercel CLI（可选）：
   ```bash
   npm i -g vercel
   ```
3. 连接 GitHub 仓库或使用命令行部署：
   ```bash
   # 在项目目录下执行
   vercel
   ```

### 自定义部署配置

在项目根目录创建 `vercel.json` 文件：

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["hkg1"],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

## 部署到其他平台

### 静态导出

如果你的 Next.js 应用不需要服务器端渲染或 API 路由，可以将其导出为静态网站：

```bash
# 在 next.config.js 中启用静态导出
module.exports = {
  output: 'export'
}

# 生成静态文件
npm run build
```

生成的 `out` 目录可以部署到任何静态托管服务，如 GitHub Pages、Netlify 或 Cloudflare Pages。

### 部署到 Node.js 服务器

1. 构建应用：
   ```bash
   npm run build
   ```

2. 创建启动脚本 `server.js`：
   ```javascript
   const { createServer } = require('http')
   const { parse } = require('url')
   const next = require('next')

   const dev = process.env.NODE_ENV !== 'production'
   const hostname = 'localhost'
   const port = process.env.PORT || 3000
   const app = next({ dev, hostname, port })
   const handle = app.getRequestHandler()

   app.prepare().then(() => {
     createServer(async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true)
         await handle(req, res, parsedUrl)
       } catch (err) {
         console.error('Error occurred handling', req.url, err)
         res.statusCode = 500
         res.end('内部服务器错误')
       }
     }).listen(port, (err) => {
       if (err) throw err
       console.log(`> 准备就绪，服务器运行在 http://${hostname}:${port}`)
     })
   })
   ```

3. 使用 PM2 或类似工具启动：
   ```bash
   pm2 start server.js
   ```

### 部署到 Docker

创建 `Dockerfile`：

```dockerfile
# 基础镜像
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

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

修改 `next.config.js`：

```javascript
module.exports = {
  output: 'standalone'
}
```

构建和运行 Docker 镜像：

```bash
docker build -t my-next-app .
docker run -p 3000:3000 my-next-app
```

## 性能优化

### 图像优化

Next.js 提供了内置的图像优化组件 `next/image`：

```jsx
import Image from 'next/image'

export default function Profile() {
  return (
    <div>
      <h1>个人资料</h1>
      <Image
        src="/profile.jpg"
        alt="个人照片"
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
        priority
      />
    </div>
  )
}
```

配置图像优化选项：

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/webp', 'image/avif']
  }
}
```

### 字体优化

使用 `next/font` 进行字体优化：

```jsx
// app/layout.js
import { Inter } from 'next/font/google'

// 自动托管、零布局偏移、不阻塞渲染
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 脚本优化

使用 `next/script` 组件优化 JavaScript 脚本加载：

```jsx
import Script from 'next/script'

export default function Analytics() {
  return (
    <>
      {/* 懒加载第三方脚本 */}
      <Script
        src="https://example.com/analytics.js"
        strategy="lazyOnload"
        onLoad={() => console.log('脚本已加载')}
      />
      
      {/* 内联脚本 */}
      <Script id="show-banner">
        {`document.getElementById('banner').classList.remove('hidden')`}
      </Script>
      
      {/* 在 afterInteractive 阶段加载 */}
      <Script
        strategy="afterInteractive"
        src="https://example.com/instant.js"
      />
    </>
  )
}
```

### 元数据优化

在 App Router 中优化元数据：

```jsx
// app/page.js
export const metadata = {
  title: '我的网站',
  description: '这是我的网站描述',
  openGraph: {
    title: '我的网站',
    description: '这是我的网站描述',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '网站预览图',
      },
    ],
  },
}

export default function Page() {
  return <div>页面内容</div>
}
```

动态生成元数据：

```jsx
// app/products/[id]/page.js
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id)
  
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    }
  }
}
```

### 路由优化

使用 `prefetch` 预加载路由：

```jsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/dashboard" prefetch={true}>
        控制台
      </Link>
    </nav>
  )
}
```

### 缓存与重新验证

配置缓存与重新验证策略：

```jsx
// app/products/page.js
export const revalidate = 60 // 每60秒重新验证

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 } // 使用 fetch 选项配置单个请求
  }).then(res => res.json())
  
  return (
    <div>
      <h1>产品列表</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 动态路由选择性静态生成

```jsx
// app/products/[id]/page.js
export async function generateStaticParams() {
  // 只为热门产品预渲染
  const products = await getTopProducts(10)
  
  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default async function Product({ params }) {
  const product = await getProduct(params.id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  )
}
```

## 分析与监控

### 内置分析

使用内置的分析工具：

```bash
ANALYZE=true npm run build
```

在 `next.config.js` 中配置：

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // 其他配置
})
```

### 性能监控

集成 [Next.js Speed Insights](https://vercel.com/analytics)：

```jsx
// app/layout.js
export const metadata = {
  metadataBase: new URL('https://example.com'),
  // ...其他元数据
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
``` 