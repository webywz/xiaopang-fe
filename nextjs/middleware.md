---
outline: deep
---

# Next.js 中间件

Next.js 中间件允许你在请求完成之前执行代码，适用于身份验证、路由重定向、请求修改等场景。

## 基本用法

中间件定义在项目根目录的 `middleware.js` 或 `middleware.ts` 文件中：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // 获取当前请求的 URL
  const url = request.nextUrl.clone()
  
  // 修改请求
  if (url.pathname === '/old-path') {
    url.pathname = '/new-path'
    return NextResponse.redirect(url)
  }
  
  // 修改响应
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'custom-value')
  return response
}
```

## 配置匹配路径

你可以通过 `matcher` 配置指定中间件应用的路径：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // 中间件逻辑
}

// 仅匹配特定路径
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
}
```

## 用于身份验证

中间件可以用来保护需要身份验证的路由：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // 获取会话 token
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl
  
  // 定义需要保护的路径
  const protectedPaths = ['/dashboard', '/settings', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // 重定向未登录用户
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}
```

## 国际化路由

中间件适用于实现国际化路由：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

const defaultLocale = 'zh'
const locales = ['en', 'zh', 'ja']

function getLocale(request) {
  // 从头信息获取首选语言
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0])
      .find(lang => locales.includes(lang.substring(0, 2)))
    
    if (preferredLocale) {
      return preferredLocale.substring(0, 2)
    }
  }
  
  return defaultLocale
}

export function middleware(request) {
  // 检查 URL 是否已经包含语言
  const { pathname } = request.nextUrl
  
  // 如果已经是语言路径，直接通过
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) {
    return NextResponse.next()
  }
  
  // 重定向到带有语言前缀的路径
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  
  return NextResponse.redirect(newUrl)
}
```

## 高级用法：条件中间件

根据环境条件或其他因素有条件地应用中间件：

```jsx
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // 仅在生产环境中执行特定功能
  if (process.env.NODE_ENV === 'production') {
    // 例如，添加安全相关的头信息
    const response = NextResponse.next()
    
    // 添加内容安全策略
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'"
    )
    
    // 添加其他安全头信息
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response
  }
  
  return NextResponse.next()
} 