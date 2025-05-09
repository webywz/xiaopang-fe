---
outline: deep
---

# Next.js 数据获取

Next.js 提供了多种数据获取的方法，本文详细介绍其使用场景。

## getStaticProps
如果你导出一个名为 getStaticProps 的 async 函数，Next.js 将在构建时使用 getStaticProps 返回的 props 预渲染该页面。

```jsx
// 页面将在构建时生成
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return {
    props: {
      posts,
    },
    // 增量静态再生（ISR）
    revalidate: 60, // 60秒后重新生成
  }
}

export default function Blog({ posts }) {
  return (
    <div>
      <h1>博客文章</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## getServerSideProps
如果你导出一个名为 getServerSideProps 的 async 函数，Next.js 将在每次请求时使用 getServerSideProps 返回的数据渲染该页面。

```jsx
// 页面将在每次请求时生成
export async function getServerSideProps(context) {
  const { req, query, params } = context
  const userId = query.userId
  
  const res = await fetch(`https://api.example.com/users/${userId}`)
  const user = await res.json()

  return {
    props: {
      user,
    }
  }
}

export default function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name} 的个人资料</h1>
      <p>电子邮件: {user.email}</p>
    </div>
  )
}
```

## SWR
SWR 是一个用于数据获取的 React Hooks 库，它结合了缓存、重新验证和错误重试等功能。

```jsx
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)

  if (error) return <div>加载失败</div>
  if (isLoading) return <div>加载中...</div>
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.bio}</p>
    </div>
  )
}
```

## getStaticPaths
如果一个页面使用了动态路由并使用了 getStaticProps，那么你需要使用 getStaticPaths 来指定哪些路径需要在构建时生成。

```jsx
// pages/posts/[id].js
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  // 获取应该预渲染的路径
  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }))

  return {
    paths,
    fallback: 'blocking', // 也可以是 true 或 false
  }
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`)
  const post = await res.json()

  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}

export default function Post({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  )
}
``` 