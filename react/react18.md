# React 18新特性

React 18是React的一个重要版本更新，引入了许多新特性和改进。本文将介绍React 18中的主要新特性及其使用方法。

## 并发模式

React 18最重要的新特性是并发渲染机制，这是React团队多年研发的成果。

### 什么是并发模式

并发模式允许React中断、暂停、恢复或放弃渲染。这使得React能够：

- 同时准备多个UI版本
- 为用户交互优先分配CPU资源
- 在后台准备新的UI
- 避免过时的渲染内容

关键是，这些改变对大多数开发者来说是透明的，通过新的API自动启用。

### 并发特性

并发模式启用了以下关键特性：

1. **自动批处理**：多个状态更新合并为一次渲染
2. **过渡更新**：将紧急更新与非紧急更新区分开
3. **选择性水合**：优先处理用户交互部分的水合
4. **流式服务器渲染**：更早发送HTML并流式传输内容

## 新的根API

React 18引入了新的根API，以支持并发渲染。

### createRoot

新的`createRoot`API替代了`ReactDOM.render`：

```jsx
/**
 * 使用新的createRoot API
 */
// React 17及以前
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### hydrateRoot

同样，SSR应用需要使用新的`hydrateRoot`API：

```jsx
/**
 * 使用新的hydrateRoot API
 */
// React 17及以前
import ReactDOM from 'react-dom';
ReactDOM.hydrate(<App />, document.getElementById('root'));

// React 18
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

## 自动批处理

React 18改进了状态更新的批处理机制。

### 什么是批处理

批处理是指React将多个状态更新合并为一次重新渲染，以提高性能。

```jsx
/**
 * 批处理示例
 */
function handleClick() {
  setCount(c => c + 1); // 不会触发重新渲染
  setFlag(f => !f);     // 不会触发重新渲染
  // React只会在这之后重新渲染一次
}
```

### 自动批处理的改进

在React 17中，批处理只在React事件处理程序中生效。在React 18中，所有更新都会自动批处理，包括：

- 事件处理程序
- 异步操作
- setTimeout
- 原生事件处理
- Promise
- 其他任何上下文

```jsx
/**
 * React 18中的自动批处理
 */
// React 17 - 这些更新不会被批处理
setTimeout(() => {
  setCount(c => c + 1); // 触发重新渲染
  setFlag(f => !f);     // 触发重新渲染
}, 1000);

// React 18 - 这些更新会被批处理
setTimeout(() => {
  setCount(c => c + 1); // 不会触发重新渲染
  setFlag(f => !f);     // 不会触发重新渲染
  // React只会在这之后重新渲染一次
}, 1000);
```

### 禁用批处理

如果需要，可以使用`flushSync`禁用批处理：

```jsx
/**
 * 使用flushSync禁用批处理
 */
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1); // 立即重新渲染
  });
  
  flushSync(() => {
    setFlag(f => !f);     // 立即重新渲染
  });
}
```

## 过渡(Transitions)

过渡是React 18的一个重要新特性，用于区分紧急和非紧急更新。

### 紧急更新与非紧急更新

- **紧急更新**：直接反映用户输入的操作，如点击、输入等
- **非紧急更新**：将UI从一个视图过渡到另一个视图

### useTransition Hook

`useTransition`允许将更新标记为非紧急：

```jsx
/**
 * useTransition Hook
 */
import { useState, useTransition } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  function handleChange(e) {
    // 紧急更新：更新输入值
    setQuery(e.target.value);
    
    // 非紧急更新：更新搜索结果
    startTransition(() => {
      // 这个更新可以被中断
      setResults(searchResults(e.target.value));
    });
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? (
        <div>加载中...</div>
      ) : (
        <ResultsList results={results} />
      )}
    </>
  );
}
```

### startTransition API

如果不需要`isPending`状态，可以直接使用`startTransition`：

```jsx
/**
 * startTransition API
 */
import { startTransition } from 'react';

function handleClick() {
  // 紧急：显示正在提交
  setStatus('submitting');
  
  // 非紧急：切换页面视图
  startTransition(() => {
    navigateToPage('/success');
  });
}
```

## Suspense改进

React 18显著增强了Suspense功能，特别是在服务器端渲染方面。

### 客户端Suspense

Suspense允许声明性地"等待"，并在等待过程中显示加载状态：

```jsx
/**
 * 客户端Suspense示例
 */
import { Suspense, lazy } from 'react';

const Comments = lazy(() => import('./Comments'));

function Post() {
  return (
    <>
      <PostContent />
      <Suspense fallback={<div>加载评论中...</div>}>
        <Comments />
      </Suspense>
    </>
  );
}
```

### 服务器端Suspense

React 18改进了对服务器端Suspense的支持，启用了流式SSR：

```jsx
/**
 * 服务器端Suspense示例
 */
// App.jsx
function App() {
  return (
    <Layout>
      <Article />
      <Suspense fallback={<Spinner />}>
        <Comments />
      </Suspense>
    </Layout>
  );
}

// server.js
import { renderToPipeableStream } from 'react-dom/server';

function handleRequest(req, res) {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/client.js'],
    onShellReady() {
      // 设置响应头
      res.setHeader('Content-Type', 'text/html');
      // 开始流式传输初始HTML
      pipe(res);
      // 注意：Comments内容会在加载完成后通过流式传输
    }
  });
}
```

## 新的Hooks

React 18引入了几个新的Hooks，以支持并发特性和其他功能。

### useId

`useId`是一个用于生成稳定且唯一ID的Hook，特别适合于服务器端渲染环境：

```jsx
/**
 * useId Hook
 */
import { useId } from 'react';

function PasswordField() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>密码</label>
      <input id={id} type="password" />
    </>
  );
}
```

### useDeferredValue

`useDeferredValue`允许推迟更新非关键UI部分：

```jsx
/**
 * useDeferredValue Hook
 */
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // 输入时立即响应，但结果列表使用延迟值
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={deferredQuery} />
    </>
  );
}
```

### useSyncExternalStore

`useSyncExternalStore`是为了帮助第三方状态管理库与并发模式集成而设计的：

```jsx
/**
 * useSyncExternalStore Hook
 */
import { useSyncExternalStore } from 'react';

function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    // 订阅函数
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // 获取当前值的函数
    () => navigator.onLine,
    // 服务器端初始值的函数
    () => true
  );
  
  return isOnline;
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <div>{isOnline ? '在线' : '离线'}</div>;
}
```

### useInsertionEffect

`useInsertionEffect`是专为CSS-in-JS库设计的，运行在DOM变更之前：

```jsx
/**
 * useInsertionEffect Hook
 */
import { useInsertionEffect } from 'react';

// 这主要用于CSS-in-JS库，大多数应用不需要直接使用它
function useCSS(rule) {
  useInsertionEffect(() => {
    // 这里可以添加样式，在DOM更新前执行
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  });
}
```

## 服务器端渲染改进

React 18对服务器端渲染进行了全面升级。

### 流式SSR

新的`renderToPipeableStream`API实现了HTML的流式传输：

```jsx
/**
 * 流式SSR示例
 */
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

function handleRequest(req, res) {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        // 当Shell准备好时开始流式传输
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      onAllReady() {
        // 可选回调：所有内容都准备好了
        // 对于爬虫可以等待这里再传输
      },
      onShellError(error) {
        // 处理Shell渲染错误
        res.statusCode = 500;
        res.send('<!DOCTYPE html><html><body>Server Error</body></html>');
      },
      onError(error) {
        console.error(error);
      }
    }
  );
  
  // 可以设置超时中止渲染
  setTimeout(() => {
    abort();
  }, 10000);
}
```

### 选择性水合

React 18引入了选择性水合，优先处理用户正在交互的部分：

```jsx
/**
 * 选择性水合示例
 */
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// 当页面加载时
startTransition(() => {
  hydrateRoot(document.getElementById('root'), <App />);
});

// React会优先水合用户交互的部分
// 不需要额外代码，这是React 18的内置功能
```

## 严格模式增强

React 18的严格模式增加了新的检查，以帮助开发者发现潜在问题。

### 重复挂载检查

在开发模式中，严格模式现在会对组件进行两次挂载和卸载，以帮助发现副作用清理的问题：

```jsx
/**
 * 严格模式重复挂载检查
 */
import { StrictMode } from 'react';

function App() {
  return (
    <StrictMode>
      <RootComponent />
    </StrictMode>
  );
}
```

这有助于找出以下问题：

- 缺少清理函数的useEffect
- 未正确实现的类组件生命周期方法

## 其他改进

### 更精细的Suspense边界

React 18允许Suspense边界更精细地更新：

```jsx
/**
 * 精细Suspense边界示例
 */
function ProfilePage() {
  return (
    <>
      <ProfileHeader />
      <Suspense fallback={<Spinner />}>
        <ProfileTimeline />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <ProfilePosts />
      </Suspense>
    </>
  );
}
```

在React 18中，一个Suspense边界的内容更新不会影响其他边界。

### setState自动保留值

在React 18中，`setState(undefined)`不再触发重新渲染：

```jsx
/**
 * setState自动保留值示例
 */
// React 17
setState(undefined); // 组件会使用initialState重新渲染

// React 18
setState(undefined); // 组件保持当前状态，不重新渲染
```

## 升级到React 18

### 升级步骤

1. 更新依赖：
   ```bash
   npm install react@18 react-dom@18
   ```

2. 更新客户端代码：
   ```jsx
   // 从
   import ReactDOM from 'react-dom';
   ReactDOM.render(<App />, container);

   // 到
   import { createRoot } from 'react-dom/client';
   const root = createRoot(container);
   root.render(<App />);
   ```

3. 更新服务器代码（如果使用SSR）：
   ```jsx
   // 从
   import ReactDOMServer from 'react-dom/server';
   const html = ReactDOMServer.renderToString(<App />);

   // 到
   import { renderToPipeableStream } from 'react-dom/server';
   const { pipe } = renderToPipeableStream(<App />);
   pipe(res);
   ```

### 潜在的兼容性问题

升级到React 18可能会遇到以下兼容性问题：

1. 自动批处理可能改变更新时序
2. 并发渲染可能暴露出现有的竞态条件
3. 严格模式的额外重复挂载可能暴露清理问题
4. Suspense行为变化

## 总结

React 18通过并发渲染引入了一个新时代，让React应用变得更加响应和高效。主要改进包括：

1. **并发渲染**：允许中断、暂停和恢复渲染
2. **自动批处理**：在所有环境中合并状态更新
3. **过渡API**：区分紧急和非紧急更新
4. **服务器端渲染改进**：流式传输和选择性水合
5. **新Hooks**：useId、useDeferredValue等

虽然有些新特性需要显式采用，但许多改进（如自动批处理）无需代码更改即可获益。React 18为构建更流畅、更响应的用户界面奠定了基础。 