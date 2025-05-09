---
outline: deep
---

# React Hooks 使用指南

Hooks 是 React 16.8 中新增的特性。它可以让你在不编写 class 的情况下使用 state 以及其他 React 特性。

## useState
useState 是一个内置的 Hook，让你在函数组件中添加 state。

```jsx
import React, { useState } from 'react';

function Counter() {
  // 声明一个叫 "count" 的 state 变量，以及更新它的函数 setCount
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

## useEffect
useEffect 允许你在函数组件中执行副作用操作。

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 类似于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 更新文档标题
    document.title = `你点击了 ${count} 次`;

    // 返回一个清除函数，类似于 componentWillUnmount
    return () => {
      document.title = 'React App';
    };
  }, [count]); // 仅在 count 更改时重新执行

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

## useRef
useRef 返回一个可变的 ref 对象，该对象的 `.current` 属性被初始化为传入的参数。返回的对象在组件的整个生命周期内保持不变。

```jsx
import React, { useRef, useEffect } from 'react';

function TextInputWithFocusButton() {
  // 创建一个 ref 来存储 textInput DOM 元素
  const inputRef = useRef(null);
  
  // 点击按钮时使用 ref 聚焦输入框
  const focusInput = () => {
    // current 指向已挂载到 DOM 上的 input 元素
    inputRef.current.focus();
  };
  
  // useRef 的另一个用途是保存任何可变值
  const intervalRef = useRef(null);
  
  useEffect(() => {
    // 设置一个定时器
    intervalRef.current = setInterval(() => {
      console.log('定时器正在运行');
    }, 1000);
    
    // 清除定时器
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  
  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
    </div>
  );
}
```

## useReducer
useReducer 是 useState 的替代方案，适用于复杂的状态逻辑。类似于 Redux 的工作原理。

```jsx
import React, { useReducer } from 'react';

// 定义 reducer 函数
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  // 使用 useReducer 钩子
  // 第一个参数是 reducer 函数
  // 第二个参数是初始状态
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      计数: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

## useContext
useContext 让你不使用组件嵌套就可以订阅 React 的 Context。

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建一个 Context
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <div>
        <ThemedButton />
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          切换主题
        </button>
      </div>
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  // 使用 useContext 读取当前主题
  const theme = useContext(ThemeContext);
  
  return (
    <button style={{ 
      background: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#fff' : '#333',
    }}>
      我是一个 {theme} 主题的按钮
    </button>
  );
}
```

## useMemo
useMemo 允许你记住计算结果，以避免在每次渲染时重新计算。

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveCalculation({ list, filter }) {
  // 使用 useMemo 缓存计算结果
  // 只有当 list 或 filter 改变时，才会重新计算
  const filteredList = useMemo(() => {
    console.log('正在过滤列表...');
    return list.filter(item => item.includes(filter));
  }, [list, filter]);
  
  return (
    <div>
      <h2>过滤结果:</h2>
      <ul>
        {filteredList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState('');
  const list = ['苹果', '香蕉', '橙子', '草莓', '菠萝'];
  
  return (
    <div>
      <input 
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="输入过滤条件"
      />
      <ExpensiveCalculation list={list} filter={filter} />
    </div>
  );
}
```

## useCallback
useCallback 允许你缓存函数定义，以避免在每次渲染时创建新函数。

```jsx
import React, { useState, useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);
  
  // 使用 useCallback 缓存回调函数
  // 只有当 count 改变时，handleClick 才会改变
  const handleClick = useCallback(() => {
    console.log(`点击了 ${count} 次`);
    // 这里可以使用 count
  }, [count]); // 只有 count 改变时才会重新创建函数
  
  return (
    <div>
      <ChildComponent onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>增加计数</button>
      <button onClick={() => setOtherState(otherState + 1)}>
        改变其他状态 ({otherState})
      </button>
    </div>
  );
}

// 使用 React.memo 优化子组件
const ChildComponent = React.memo(function ChildComponent({ onClick }) {
  console.log('子组件渲染');
  return <button onClick={onClick}>点击我</button>;
});
```

## useLayoutEffect
useLayoutEffect 与 useEffect 类似，但它会在所有 DOM 变更之后同步调用。可以使用它来读取 DOM 布局并同步触发重渲染。

```jsx
import React, { useState, useLayoutEffect, useRef } from 'react';

function Tooltip() {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef();
  
  // 使用 useLayoutEffect 在浏览器绘制前测量和更新 DOM
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const height = tooltipRef.current.clientHeight;
      setTooltipHeight(height);
      // 这里的更新会在用户看到页面之前应用
      // 防止布局抖动
    }
  }, []);
  
  return (
    <div>
      <div 
        ref={tooltipRef} 
        style={{ 
          position: 'absolute',
          top: `-${tooltipHeight}px`,
        }}
      >
        这是一个工具提示
      </div>
      <button>悬停查看提示</button>
    </div>
  );
}
```

## useDebugValue
useDebugValue 可用于在 React 开发者工具中显示自定义 hook 的标签。

```jsx
import React, { useState, useEffect, useDebugValue } from 'react';

// 自定义 Hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // 在 React 开发工具中显示这个值
  useDebugValue(isOnline ? '在线' : '离线');
  
  return isOnline;
}

function StatusIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      当前状态: {isOnline ? '在线 ✅' : '离线 ❌'}
    </div>
  );
}
```

## useImperativeHandle
useImperativeHandle 自定义使用 ref 时公开给父组件的实例值。

```jsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

// 使用 forwardRef 转发 ref
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  // 使用 useImperativeHandle 自定义暴露给父组件的 ref 值
  useImperativeHandle(ref, () => ({
    // 暴露自定义方法
    focus: () => {
      inputRef.current.focus();
    },
    // 暴露自定义属性
    value: () => inputRef.current.value
  }));
  
  return <input ref={inputRef} />;
});

function Parent() {
  const fancyInputRef = useRef();
  
  return (
    <div>
      <FancyInput ref={fancyInputRef} />
      <button onClick={() => fancyInputRef.current.focus()}>
        聚焦输入框
      </button>
      <button onClick={() => alert(fancyInputRef.current.value())}>
        获取值
      </button>
    </div>
  );
}
```

## useId (React 18)
useId 是一个用于生成唯一 ID 的 hook，对于需要唯一 ID 的可访问性属性非常有用。

```jsx
import React, { useId } from 'react';

function LabeledInput() {
  // 生成唯一 ID
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>邮箱:</label>
      <input id={id} type="email" />
    </div>
  );
}

function FormWithMultipleInputs() {
  // 每次调用 useId 生成唯一前缀
  const idPrefix = useId();
  
  // 用同一前缀生成多个相关 ID
  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  
  return (
    <form>
      <div>
        <label htmlFor={nameId}>姓名:</label>
        <input id={nameId} type="text" />
      </div>
      <div>
        <label htmlFor={emailId}>邮箱:</label>
        <input id={emailId} type="email" />
      </div>
    </form>
  );
}
```

## 自定义 Hooks
通过自定义 Hook，可以将组件逻辑提取到可重用的函数中。

```jsx
import { useState, useEffect } from 'react';

// 自定义 Hook
function useWindowSize() {
  // 初始化窗口尺寸 state
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // 处理窗口大小变化
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // 添加事件监听
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 空依赖数组表示仅在组件挂载和卸载时执行

  return windowSize;
}

// 使用自定义 Hook
function WindowSizeComponent() {
  const size = useWindowSize();
  
  return (
    <div>
      <p>窗口宽度: {size.width}</p>
      <p>窗口高度: {size.height}</p>
    </div>
  );
}
```

## 实用自定义 Hooks 示例

### useLocalStorage
创建一个支持 localStorage 持久化的状态钩子。

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 尝试从 localStorage 获取
      const item = window.localStorage.getItem(key);
      // 如果不存在则返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // 更新 localStorage 值的函数
  const setValue = value => {
    try {
      // 允许函数式更新
      const valueToStore = 
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到 state
      setStoredValue(valueToStore);
      
      // 保存到 localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用示例
function App() {
  const [name, setName] = useLocalStorage('name', '');
  
  return (
    <div>
      <input
        type="text"
        placeholder="输入你的名字"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <p>你好, {name || '访客'}!</p>
    </div>
  );
}
```

### useFetch
创建一个用于处理数据获取的钩子。

```jsx
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`请求错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
          setData(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(
    `https://api.example.com/users/${userId}`
  );
  
  if (loading) return <p>加载中...</p>;
  if (error) return <p>错误: {error}</p>;
  if (!user) return <p>无用户数据</p>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>邮箱: {user.email}</p>
      <p>电话: {user.phone}</p>
    </div>
  );
}
```

## Hooks 使用规则

1. **只在最顶层使用 Hooks**
   - 不要在循环、条件或嵌套函数中调用 Hook
   - 确保 Hooks 在每次渲染时都以相同的顺序被调用

2. **只在 React 函数中调用 Hooks**
   - 在 React 的函数组件中调用 Hooks
   - 在自定义 Hooks 中调用其他 Hooks
   - 不要在普通的 JavaScript 函数中调用 Hooks

3. **自定义 Hook 必须以 "use" 开头**
   - 这是一个约定，确保 React 能够检查 Hooks 规则的违反情况

## Hook 与类组件的对比

| 类组件 | Hooks |
| ----- | ----- |
| `constructor` | `useState`, `useReducer` |
| `getDerivedStateFromProps` | 在渲染期间更新 `useState` 的值 |
| `shouldComponentUpdate` | `React.memo` |
| `render` | 函数组件本身 |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [dependency])` |
| `componentWillUnmount` | `useEffect` 返回的清理函数 |
| `getSnapshotBeforeUpdate`, `componentDidCatch`, `getDerivedStateFromError` | 目前没有对应的 Hook |

## 总结

React Hooks 为函数组件带来了状态管理和生命周期特性，使函数组件变得更加强大。通过使用内置的 Hooks 和创建自定义 Hooks，你可以编写更简洁、更可维护的 React 代码。确保遵循 Hooks 的使用规则，以避免意外的行为和错误。 