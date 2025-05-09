---
outline: deep
---

# Next.js 安全最佳实践

安全是任何 Web 应用程序的重要方面，本文将介绍在 Next.js 应用中实施的安全最佳实践。

## 内容安全策略 (CSP)

内容安全策略帮助防止跨站脚本攻击 (XSS) 和其他代码注入攻击。

### 在 Next.js 中配置 CSP

使用自定义 Document 文件设置 CSP 头：

```jsx
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={`
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-cdn.com;
            style-src 'self' 'unsafe-inline' https://trusted-cdn.com;
            img-src 'self' data: https://trusted-cdn.com;
            font-src 'self' https://trusted-cdn.com;
            connect-src 'self' https://api.example.com;
          `.replace(/\s{2,}/g, ' ').trim()}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

在 middleware 中设置 CSP 头（推荐）：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // 设置 CSP 头
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-cdn.com;
    style-src 'self' 'unsafe-inline' https://trusted-cdn.com;
    img-src 'self' data: https://trusted-cdn.com;
    font-src 'self' https://trusted-cdn.com;
    connect-src 'self' https://api.example.com;
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}
```

## 防止 XSS 攻击

跨站脚本攻击是最常见的 Web 安全漏洞之一。

### 用户输入验证与消毒

使用 DOMPurify 清理用户生成的 HTML 内容：

```jsx
// 安装依赖
// npm install dompurify
// npm install @types/dompurify

import DOMPurify from 'dompurify'

export default function Comment({ content }) {
  // 清理 HTML 内容
  const sanitizedContent = DOMPurify.sanitize(content)
  
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
}
```

### 使用安全的组件模式

避免不必要地使用 `dangerouslySetInnerHTML`：

```jsx
// 不安全的做法
function UnsafeComponent({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />
}

// 安全的做法
function SafeComponent({ userInput }) {
  return <div>{userInput}</div>
}
```

## CSRF 保护

跨站请求伪造 (CSRF) 是一种攻击，能让攻击者代表用户执行操作。

### 实现 CSRF 保护

在 API 路由中：

```jsx
// lib/csrf.js
import { randomBytes } from 'crypto'

export function generateCSRFToken() {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token, storedToken) {
  return token === storedToken
}

// pages/api/login.js
import { generateCSRFToken } from '../../lib/csrf'
import { serialize } from 'cookie'

export default function handler(req, res) {
  if (req.method === 'GET') {
    // 生成 CSRF 令牌
    const csrfToken = generateCSRFToken()
    
    // 设置 CSRF cookie
    res.setHeader('Set-Cookie', serialize('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600
    }))
    
    return res.status(200).json({ csrfToken })
  }
  
  res.status(405).end()
}

// pages/api/submit-form.js
import { validateCSRFToken } from '../../lib/csrf'

export default function handler(req, res) {
  if (req.method === 'POST') {
    // 获取请求中的 CSRF 令牌
    const { csrfToken } = req.body
    
    // 获取存储在 cookie 中的 CSRF 令牌
    const storedToken = req.cookies.csrf_token
    
    // 验证 CSRF 令牌
    if (!validateCSRFToken(csrfToken, storedToken)) {
      return res.status(403).json({ error: 'CSRF 验证失败' })
    }
    
    // 处理表单提交
    return res.status(200).json({ success: true })
  }
  
  res.status(405).end()
}
```

前端表单使用：

```jsx
// components/Form.js
"use client"

import { useState, useEffect } from 'react'

export default function Form() {
  const [csrfToken, setCsrfToken] = useState('')
  
  useEffect(() => {
    // 获取 CSRF 令牌
    fetch('/api/login')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 获取表单数据
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    // 添加 CSRF 令牌
    data.csrfToken = csrfToken
    
    // 发送请求
    await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="text" name="username" />
      <button type="submit">提交</button>
    </form>
  )
}
```

## 安全头信息

配置安全相关的 HTTP 头信息可以增强应用程序的安全性。

### 使用 Middleware 设置安全头信息

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // 安全头信息
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}
```

## 安全的依赖管理

保持依赖项更新并检查漏洞是很重要的。

### 使用 npm audit

定期检查依赖项漏洞：

```bash
npm audit
```

修复漏洞：

```bash
npm audit fix
```

### 使用 Dependabot

在 GitHub 仓库中添加 `.github/dependabot.yml` 文件：

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    versioning-strategy: auto
```

## 认证与授权

实现安全的认证和授权机制。

### 使用 NextAuth.js

NextAuth.js 是 Next.js 应用的流行认证解决方案：

```jsx
// 安装依赖
// npm install next-auth

// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: '账号密码',
      credentials: {
        email: { label: '电子邮箱', type: 'email' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          return null
        }
        
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )
        
        if (!isPasswordValid) {
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

保护页面或 API 路由：

```jsx
// middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl
    
    // 检查用户是否有管理员权限
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*']
}
```

## 处理敏感数据

安全地存储和处理敏感信息。

### 环境变量

在 `.env.local` 文件中存储敏感数据：

```
DATABASE_URL=postgres://user:password@localhost:5432/mydb
JWT_SECRET=your-super-secret-jwt-key
API_KEY=your-api-key
```

访问环境变量：

```jsx
// 在服务器端
const dbUrl = process.env.DATABASE_URL

// 在客户端（需要前缀 NEXT_PUBLIC_）
const publicKey = process.env.NEXT_PUBLIC_API_KEY
```

### 加密敏感数据

使用加密库保护数据：

```jsx
// 安装依赖
// npm install crypto-js

import { AES, enc } from 'crypto-js'

// 加密数据
export function encryptData(data, secretKey) {
  return AES.encrypt(JSON.stringify(data), secretKey).toString()
}

// 解密数据
export function decryptData(ciphertext, secretKey) {
  const bytes = AES.decrypt(ciphertext, secretKey)
  return JSON.parse(bytes.toString(enc.Utf8))
}
``` 