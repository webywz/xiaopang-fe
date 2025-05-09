---
outline: deep
---

# Next.js 服务器组件与客户端组件

Next.js 13 引入了 React Server Components (RSC)，它允许你编写既可以在服务器上渲染也可以在客户端上渲染的组件。

## 服务器组件

在 App Router 中，所有组件默认都是服务器组件，除非你明确地标记它们为客户端组件。

### 服务器组件的优势

- **更快的首屏加载** - 减少客户端 JavaScript 大小
- **直接访问后端资源** - 直接查询数据库或文件系统
- **自动代码分割** - 无需手动设置代码分割
- **无需客户端状态管理** - 服务器上获取和处理数据

```jsx
// app/blog/page.js - 默认是服务器组件
async function BlogPage() {
  // 直接访问数据库 - 仅在服务器上执行
  const posts = await db.query('SELECT * FROM posts')
  
  return (
    <div>
      <h1>博客文章</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 客户端组件

当你需要使用浏览器特定功能或 React 的交互式 hooks 时，你需要使用客户端组件。

使用 `"use client"` 指令标记一个组件为客户端组件。该指令必须放在文件的首行。

```jsx
"use client"

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  )
}
```

## 使用 "use server" 指令

`"use server"` 指令允许你创建在服务器上执行的服务器操作，可以在客户端组件中调用这些操作。

```jsx
// app/actions.js
"use server"

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  // 直接访问数据库
  await db.insert('posts', { title, content })
  
  // 重新验证缓存
  revalidatePath('/blog')
}
```

```jsx
// app/blog/new-post.js
"use client"

import { createPost } from '../actions'

export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      <button type="submit">发布文章</button>
    </form>
  )
}
```

## 组件通信模式

### 从服务器组件传递数据到客户端组件

服务器组件可以通过 props 向客户端组件传递数据：

```jsx
// ServerComponent.js
import ClientComponent from './ClientComponent'

export default async function ServerComponent() {
  const data = await fetchData()
  
  return <ClientComponent data={data} />
}
```

```jsx
// ClientComponent.js
"use client"

export default function ClientComponent({ data }) {
  // 使用从服务器组件传递的数据
  return <div>{data.title}</div>
}
```

### 从客户端组件调用服务器操作

使用服务器操作从客户端组件与服务器通信：

```jsx
// app/components/form.js
"use client"

import { updateUser } from '../actions'
import { useTransition } from 'react'

export function ProfileForm({ userId }) {
  const [isPending, startTransition] = useTransition()
  
  return (
    <form>
      <input name="name" />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => updateUser(userId, { name: 'New Name' }))}
      >
        {isPending ? '更新中...' : '更新资料'}
      </button>
    </form>
  )
}
``` 