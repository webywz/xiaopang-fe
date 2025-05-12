# React 数据请求详解

现代 React 应用常需与后端 API 交互，数据请求管理是前端开发的核心环节。主流方案有 axios、react-query、SWR 等。

## 目录
- 数据请求管理简介
- axios 基础与进阶
- react-query 基础与进阶
- SWR 基础与进阶
- 全局错误与 Loading 管理
- 缓存、同步与自动刷新
- 方案对比与选型建议
- 数据请求最佳实践
- 常见问题与解决方案

---

## 数据请求管理简介

- 传统方案：fetch、axios 直接请求，手动管理 loading、error、缓存
- 现代方案：react-query、SWR 等自动处理缓存、同步、重试、刷新

---

## axios 基础与进阶

axios 是最流行的 HTTP 客户端，支持拦截器、全局配置、取消请求等。

### 基础用法

```js
/**
 * @file axios-basic.js
 * @description axios 基础用法。
 */
import axios from 'axios';

axios.get('/api/user')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

### 在 React 组件中使用

```jsx
/**
 * @file AxiosInComponent.jsx
 * @description 组件内发起请求。
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserInfo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/user')
      .then(res => setUser(res.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了</div>;
  return <div>用户名：{user.name}</div>;
}
```

### 拦截器与全局配置

```js
/**
 * @file axios-interceptor.js
 * @description axios 拦截器与全局配置。
 */
import axios from 'axios';

axios.defaults.baseURL = '/api';
axios.interceptors.request.use(config => {
  // 添加 token
  config.headers.Authorization = 'Bearer token';
  return config;
});
axios.interceptors.response.use(
  res => res,
  err => {
    // 统一错误处理
    alert('请求出错');
    return Promise.reject(err);
  }
);
```

---

## react-query 基础与进阶

react-query 是现代 React 数据请求管理库，自动处理缓存、同步、重试、刷新等。

### 基础用法

```jsx
/**
 * @file ReactQueryBasic.jsx
 * @description react-query 基础用法。
 */
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';

const queryClient = new QueryClient();

function User() {
  const { data, isLoading, error } = useQuery('user', () => axios.get('/api/user').then(res => res.data));
  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错了</div>;
  return <div>用户名：{data.name}</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <User />
    </QueryClientProvider>
  );
}
```

### 自动刷新与依赖

```jsx
/**
 * @file ReactQueryRefetch.jsx
 * @description react-query 自动刷新与依赖。
 */
import { useQuery } from 'react-query';

function Time() {
  const { data } = useQuery('time', () => fetch('/api/time').then(r => r.json()), {
    refetchInterval: 1000 // 每秒自动刷新
  });
  return <div>当前时间：{data?.time}</div>;
}
```

---

## SWR 基础与进阶

SWR 是 Vercel 推出的数据请求库，主打缓存、自动同步、乐观更新。

### 基础用法

```jsx
/**
 * @file SWRBasic.jsx
 * @description SWR 基础用法。
 */
import useSWR from 'swr';

function User() {
  const { data, error, isLoading } = useSWR('/api/user', url => fetch(url).then(r => r.json()));
  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错了</div>;
  return <div>用户名：{data.name}</div>;
}
```

### 乐观更新

```jsx
/**
 * @file SWROptimistic.jsx
 * @description SWR 乐观更新。
 */
import useSWR, { mutate } from 'swr';

function LikeButton({ id }) {
  const { data } = useSWR(`/api/post/${id}`);
  const like = async () => {
    mutate(`/api/post/${id}`, { ...data, likes: data.likes + 1 }, false);
    await fetch(`/api/post/${id}/like`, { method: 'POST' });
    mutate(`/api/post/${id}`);
  };
  return <button onClick={like}>点赞 {data?.likes}</button>;
}
```

---

## 全局错误处理与 Loading 管理

- axios 拦截器统一处理错误和 loading
- react-query/SWR 支持全局 loading/error 组件

---

## 缓存、同步与自动刷新

- axios 需手动实现缓存
- react-query/SWR 内置缓存、依赖刷新、自动重试
- 适合实时数据、协作场景

---

## 方案对比与选型建议

| 特性         | axios      | react-query   | SWR         |
|--------------|------------|--------------|-------------|
| 缓存         | 手动       | 自动         | 自动        |
| 自动刷新     | 手动       | 支持         | 支持        |
| 错误处理     | 手动       | 自动/手动    | 自动/手动   |
| 乐观更新     | 手动       | 支持         | 支持        |
| 依赖管理     | 手动       | 支持         | 支持        |
| 适用场景     | 通用       | 复杂/实时    | 轻量/实时   |

- axios 适合简单请求、全局配置需求
- react-query 适合复杂数据流、缓存、依赖刷新
- SWR 适合轻量、实时、乐观更新场景

---

## 数据请求最佳实践

- 请求逻辑与 UI 解耦，便于测试和维护
- 统一错误与 loading 管理，提升用户体验
- 合理利用缓存与自动刷新，减少请求压力
- 避免重复请求，合并依赖
- 对敏感操作（如删除）使用乐观更新

---

## 常见问题与解决方案

### 1. 多次重复请求
- 检查依赖数组、缓存 key，使用 react-query/SWR 自动去重

### 2. 全局错误未捕获
- axios 拦截器、react-query/SWR 全局配置

### 3. 数据不同步
- 使用依赖刷新、手动触发 refetch/mutate

---

/**
 * @module DataFetching
 * @description 本文极致细化了 React 数据请求管理方案，适合新手和进阶开发者参考。
 */ 