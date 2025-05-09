---
outline: deep
---

# Next.js API 路由开发

Next.js 提供了内置的 API 路由功能，让你能够直接在 Next.js 应用中创建 API 端点。

## Pages Router API 路由

在 Pages Router 中，API 路由位于 `pages/api` 目录下。

```jsx
// pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: '你好，世界！' })
}
```

### 请求处理

API 路由支持不同的 HTTP 方法：

```jsx
// pages/api/users.js
export default function handler(req, res) {
  const { method } = req
  
  switch (method) {
    case 'GET':
      // 获取用户列表
      res.status(200).json({ users: [] })
      break
    case 'POST':
      // 创建新用户
      const { name, email } = req.body
      res.status(201).json({ id: 1, name, email })
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
```

### 动态 API 路由

创建动态 API 路由：

```jsx
// pages/api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query
  const { method } = req
  
  switch (method) {
    case 'GET':
      // 获取特定用户
      res.status(200).json({ id, name: '张三' })
      break
    case 'PUT':
      // 更新特定用户
      res.status(200).json({ id, ...req.body })
      break
    case 'DELETE':
      // 删除特定用户
      res.status(200).json({ id, deleted: true })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
```

## App Router API 路由 (Route Handlers)

在 App Router 中，API 路由被称为 Route Handlers，位于 `app` 目录下任意位置的 `route.js` 文件中。

```jsx
// app/api/hello/route.js
export async function GET() {
  return Response.json({ message: '你好，世界！' })
}
```

### HTTP 方法

Route Handlers 支持所有 HTTP 方法：GET、POST、PUT、PATCH、DELETE、HEAD 和 OPTIONS。

```jsx
// app/api/posts/route.js
import { NextResponse } from 'next/server'

export async function GET() {
  const posts = await fetchPosts()
  return NextResponse.json(posts)
}

export async function POST(request) {
  const data = await request.json()
  const newPost = await createPost(data)
  return NextResponse.json(newPost, { status: 201 })
}
```

### 动态路由

动态路由 Route Handlers：

```jsx
// app/api/posts/[id]/route.js
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params
  const post = await getPostById(id)
  
  if (!post) {
    return NextResponse.json(
      { message: '找不到文章' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(post)
}

export async function DELETE(request, { params }) {
  const { id } = params
  await deletePost(id)
  return new Response(null, { status: 204 })
}
```

## API 认证与授权

### 基于 JWT 的认证

```jsx
// app/api/auth/login/route.js
import { sign } from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // 获取登录信息
    const { username, password } = await request.json()
    
    // 验证用户
    const user = await verifyUser(username, password)
    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }
    
    // 创建 JWT
    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    // 返回令牌
    const response = NextResponse.json({ token })
    
    // 设置 cookie (可选)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1小时
    })
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}
```

### 保护 API 路由中间件

```jsx
// middleware.js
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export function middleware(request) {
  // 获取令牌
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.split(' ')[1]
  
  // 匹配 API 路由
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  // 排除无需验证的路由
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
  
  // 如果是需要保护的 API 路由，验证令牌
  if (isApiRoute && !isAuthRoute) {
    if (!token) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }
    
    try {
      // 验证令牌
      const decoded = verify(token, process.env.JWT_SECRET)
      
      // 将用户信息添加到请求头中
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', decoded.id)
      
      // 继续处理请求
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      })
    } catch (error) {
      return NextResponse.json(
        { error: '令牌无效' },
        { status: 401 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
```

## API 错误处理

创建自定义错误处理器：

```jsx
// app/api/utils/error-handler.js
import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

export function handleApiError(error) {
  console.error('API Error:', error)
  
  const statusCode = error.statusCode || 500
  const message = error.message || '服务器错误'
  
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  )
}
```

在路由中使用错误处理：

```jsx
// app/api/products/route.js
import { NextResponse } from 'next/server'
import { ApiError, handleApiError } from '../utils/error-handler'

export async function GET() {
  try {
    const products = await fetchProducts()
    
    if (!products) {
      throw new ApiError('无法获取产品', 404)
    }
    
    return NextResponse.json(products)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## API 速率限制

使用中间件实现速率限制：

```jsx
// middleware.js
import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// 连接到 Redis
const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

// 速率限制配置
const RATE_LIMIT_MAX = 60 // 最大请求数
const RATE_LIMIT_WINDOW = 60 // 时间窗口（秒）

export async function middleware(request) {
  // 获取客户端 IP
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  
  // 仅对 API 路由应用速率限制
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = `rate-limit:${ip}`
    
    // 获取当前计数
    const count = await redis.incr(key)
    
    // 首次请求时设置过期时间
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW)
    }
    
    // 添加速率限制头信息
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - count).toString())
    
    // 超出限制
    if (count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { 
          status: 429,
          headers: {
            'Retry-After': RATE_LIMIT_WINDOW.toString()
          }
        }
      )
    }
    
    return response
  }
  
  return NextResponse.next()
}
``` 