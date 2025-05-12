# React 路由（react-router）详解

React Router 是 React 生态中最主流的路由解决方案，支持声明式路由、嵌套路由、动态参数、懒加载等特性。

## 目录
- 基础用法
- 嵌套路由
- 动态路由与参数
- 路由懒加载
- 编程式导航
- 路由守卫与权限控制
- 路由最佳实践
- 常见问题与解决方案

---

## 基础用法

```jsx
/**
 * @function App
 * @description React Router 基础用法示例，包含首页和关于页。
 */
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <h2>首页</h2>;
}
function About() {
  return <h2>关于</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 嵌套路由

```jsx
/**
 * @function Dashboard
 * @description 仪表盘页面，包含嵌套路由。
 */
import { Link, Routes, Route } from 'react-router-dom';

function Stats() { return <div>统计页</div>; }
function Settings() { return <div>设置页</div>; }

function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      <nav>
        <Link to="stats">统计</Link>
        <Link to="settings">设置</Link>
      </nav>
      <Routes>
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
```

---

## 动态路由与参数

```jsx
/**
 * @function UserDetail
 * @description 动态路由参数获取示例。
 */
import { useParams } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams();
  return <div>用户ID: {id}</div>;
}
```

---

## 路由懒加载

```jsx
/**
 * @description 路由组件懒加载，提升首屏性能。
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 编程式导航

```jsx
/**
 * @function GoBackButton
 * @description 使用 useNavigate 实现编程式导航。
 */
import { useNavigate } from 'react-router-dom';

function GoBackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>返回上一页</button>;
}
```

---

## 路由守卫与权限控制

```jsx
/**
 * @function RequireAuth
 * @description 路由守卫示例，未登录跳转到登录页。
 */
import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const isLogin = false; // 实际项目中应从全局状态获取
  const location = useLocation();
  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// 用法
// <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
```

---

## 路由最佳实践

- 路由配置建议集中管理，便于维护
- 路由懒加载提升性能
- 嵌套路由结构清晰，便于扩展
- 路由守卫统一处理权限
- 使用 `useNavigate` 替代 `history` 进行跳转

---

## 常见问题与解决方案

### 1. 路由刷新页面 404
- 需后端配置 history fallback，或静态服务器配置重定向到 index.html

### 2. 路由参数变化组件不刷新
- 使用 useEffect 监听参数变化

```jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

function UserDetail() {
  const { id } = useParams();
  useEffect(() => {
    // 监听 id 变化，执行副作用
  }, [id]);
  return <div>用户ID: {id}</div>;
}
```

---

/**
 * @module ReactRouter
 * @description 本文详细介绍了 React Router 的各类用法与最佳实践，适合新手和进阶开发者参考。
 */ 