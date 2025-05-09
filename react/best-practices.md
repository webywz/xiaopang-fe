---
outline: deep
---

# React 最佳实践指南

本文介绍 React 开发中的最佳实践、设计模式和优化技巧，帮助你构建高质量的 React 应用。

## 组件设计原则

### 单一责任原则
组件应该只做一件事情，这样组件更易于维护、测试和复用。

```jsx
// 不推荐：功能过于复杂的组件
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  
  // 获取用户数据
  // 获取帖子数据
  // 获取评论数据
  // 渲染用户信息
  // 渲染帖子列表
  // 渲染评论列表
}

// 推荐：拆分为多个单一职责组件
function UserDashboard() {
  return (
    <div>
      <UserProfile />
      <UserPosts />
      <UserComments />
    </div>
  );
}
```

### 组件分类
将组件分为展示型组件和容器型组件，可以提高代码的可维护性。

```jsx
// 展示型组件：关注UI展示
function UserCard({ name, avatar, bio }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{bio}</p>
    </div>
  );
}

// 容器型组件：关注数据获取和状态管理
function UserCardContainer({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const data = await fetchUserData(userId);
      setUser(data);
      setLoading(false);
    }
    
    fetchUser();
  }, [userId]);
  
  if (loading) return <Spinner />;
  if (!user) return <div>用户不存在</div>;
  
  return <UserCard name={user.name} avatar={user.avatar} bio={user.bio} />;
}
```

## 性能优化技巧

### 避免不必要的渲染

使用 React.memo、useMemo 和 useCallback 避免不必要的渲染。

```jsx
// 使用 React.memo 优化展示型组件
const UserCard = React.memo(function UserCard({ name, avatar, bio }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{bio}</p>
    </div>
  );
});

// 使用 useMemo 缓存计算结果
function FilteredUserList({ users, searchTerm }) {
  // 只有当 users 或 searchTerm 变化时才重新计算
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);
  
  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 使用 useCallback 避免函数重新创建
function UserForm({ onSubmit }) {
  const [name, setName] = useState('');
  
  // 只有当 name 变化时才重新创建函数
  const handleSubmit = useCallback(() => {
    onSubmit({ name });
  }, [name, onSubmit]);
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 虚拟列表优化
对于长列表，使用虚拟列表技术，如 `react-window` 或 `react-virtualized`。

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## 代码组织与可维护性

### 自定义 Hook 抽取复用逻辑

将复杂逻辑提取到自定义 Hook 中，提高代码复用性和可读性。

```jsx
// 自定义 Hook：管理分页逻辑
function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // 计算总页数
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // 获取当前页的数据
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);
  
  // 页面导航函数
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [goToPage, currentPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [goToPage, currentPage]);
  
  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  };
}

// 使用自定义 Hook
function PaginatedList({ items }) {
  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(items, 5);
  
  return (
    <div>
      <ul>
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <div className="pagination">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
        >
          上一页
        </button>
        
        <span>
          {currentPage} / {totalPages}
        </span>
        
        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
```

### 目录结构组织

采用合理的目录结构，例如按功能或页面组织代码。

```
src/
├── components/            # 共享组件
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.css
│   │   └── Button.test.jsx
│   └── Card/
│       ├── Card.jsx
│       └── Card.css
├── hooks/                 # 自定义 Hook
│   ├── useFetch.js
│   └── useForm.js
├── pages/                 # 页面组件
│   ├── Home/
│   │   ├── Home.jsx
│   │   └── Home.css
│   └── Profile/
│       ├── Profile.jsx
│       └── Profile.css
├── services/              # API 服务
│   ├── api.js
│   └── auth.js
├── utils/                 # 工具函数
│   ├── formatDate.js
│   └── validation.js
└── context/               # React Context
    ├── AuthContext.js
    └── ThemeContext.js
```

## 测试最佳实践

### 组件测试
使用 React Testing Library 编写以用户行为为中心的测试。

```jsx
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

/**
 * 测试按钮组件
 */
describe('Button 组件', () => {
  test('渲染文本正确', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('点击我');
  });

  test('点击时调用 onClick 处理函数', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('禁用状态下无法点击', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 集成测试
测试多个组件的交互，确保功能正常。

```jsx
// LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import { AuthProvider } from '../context/AuthContext';

/**
 * 登录表单集成测试
 */
describe('LoginForm 集成测试', () => {
  test('提交有效表单后显示成功信息', async () => {
    // 模拟 API 调用
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token' })
    });

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/用户名/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: 'password123' }
    });
    
    // 提交表单
    fireEvent.click(screen.getByRole('button', { name: /登录/i }));
    
    // 等待成功信息显示
    await waitFor(() => {
      expect(screen.getByText(/登录成功/i)).toBeInTheDocument();
    });
    
    // 清理 mock
    global.fetch.mockRestore();
  });
});
```

## React 最佳安全实践

### 防止 XSS 攻击
避免使用 `dangerouslySetInnerHTML`，若必须使用，确保输入已经被安全地清洗。

```jsx
// 不安全的方式
function Comment({ comment }) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />;
}

// 更安全的方式：使用 DOMPurify
import DOMPurify from 'dompurify';

function SafeComment({ comment }) {
  const sanitizedComment = DOMPurify.sanitize(comment);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedComment }} />;
}
```

### 依赖安全
定期检查和更新依赖，使用 npm audit 或其他工具检查安全漏洞。

```bash
# 检查依赖安全性
npm audit

# 修复安全问题
npm audit fix
```

## React Hooks 最佳实践

React Hooks 是 React 16.8 引入的特性，让函数组件能够使用状态和其他 React 特性。以下是各种 Hook 的使用方法和最佳实践。

### useState 最佳实践

```jsx
/**
 * useState Hook 的最佳实践
 */
function UserProfile() {
  // 1. 使用结构化状态而非多个状态
  // 不推荐
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  
  // 推荐
  const [user, setUser] = useState({
    name: '',
    age: 0,
    email: ''
  });
  
  // 2. 使用函数式更新避免闭包陷阱
  const incrementAge = () => {
    // 不推荐: 可能使用过时的状态
    // setUser({...user, age: user.age + 1});
    
    // 推荐: 确保使用最新状态
    setUser(prevUser => ({...prevUser, age: prevUser.age + 1}));
  };
  
  // 3. 懒初始化处理复杂计算
  const [expensiveValue] = useState(() => {
    // 这个函数只在组件首次渲染时执行一次
    return computeExpensiveValue();
  });
  
  return (
    <div>
      <input
        value={user.name}
        onChange={e => setUser({...user, name: e.target.value})}
      />
      {/* 其他表单元素 */}
    </div>
  );
}
```

### useEffect 使用技巧

```jsx
/**
 * useEffect Hook 的使用技巧
 */
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. 使用依赖数组优化效果
  useEffect(() => {
    // 仅在 query 变化时执行
    if (!query) return;
    
    let isMounted = true;
    setLoading(true);
    
    // 2. 处理异步操作
    const fetchData = async () => {
      try {
        const data = await searchApi(query);
        // 3. 避免在组件卸载后设置状态
        if (isMounted) {
          setResults(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // 4. 清理函数防止内存泄漏
    return () => {
      isMounted = false;
    };
  }, [query]);
  
  // 5. 分离关注点 - 单独的 effect 处理不同功能
  useEffect(() => {
    document.title = `搜索: ${query}`;
  }, [query]);
  
  return (
    <div>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      {loading ? <Spinner /> : (
        <ul>
          {results.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### useRef 高级用法

```jsx
/**
 * useRef Hook 的高级用法
 */
function StopwatchComponent() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // 1. 存储不触发重渲染的可变值
  const intervalRef = useRef(null);
  // 2. 保存之前的值
  const prevTimeRef = useRef(time);
  // 3. 引用 DOM 元素
  const buttonRef = useRef(null);
  
  useEffect(() => {
    // 更新 prevTime 引用
    prevTimeRef.current = time;
  }, [time]);
  
  useEffect(() => {
    // 处理计时器逻辑
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      // 清理计时器
      clearInterval(intervalRef.current);
    };
  }, [isRunning]);
  
  // 4. 使用 useRef 跟踪变量而不触发重渲染
  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
    
    // 聚焦按钮
    buttonRef.current.focus();
  };
  
  return (
    <div>
      <div>当前时间: {time}秒</div>
      <div>上次记录的时间: {prevTimeRef.current}秒</div>
      <button 
        ref={buttonRef}
        onClick={toggleStopwatch}
      >
        {isRunning ? '暂停' : '开始'}
      </button>
    </div>
  );
}
```

### useReducer 状态管理

```jsx
/**
 * useReducer Hook 用于复杂状态管理
 */
// 定义 reducer 函数
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, {
        id: Date.now(),
        text: action.payload,
        completed: false
      }];
    case 'TOGGLE_TODO':
      return state.map(todo => 
        todo.id === action.payload
          ? {...todo, completed: !todo.completed}
          : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

function TodoApp() {
  // 使用 useReducer 替代复杂的 useState 逻辑
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // 分发 action 来修改状态
    dispatch({ type: 'ADD_TODO', payload: text });
    setText('');
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="添加待办事项..."
        />
        <button type="submit">添加</button>
      </form>
      
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            <span 
              onClick={() => dispatch({ 
                type: 'TOGGLE_TODO', 
                payload: todo.id 
              })}
            >
              {todo.text}
            </span>
            <button 
              onClick={() => dispatch({ 
                type: 'DELETE_TODO', 
                payload: todo.id 
              })}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useContext 跨组件通信

```jsx
/**
 * useContext Hook 实现跨组件通信
 */
// 1. 创建一个 Context
const ThemeContext = createContext();

// 2. 创建一个 Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  // 将值和修改值的方法都放入 context
  const value = {
    theme,
    toggleTheme: () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 创建一个自定义 Hook 简化 Context 使用
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme 必须在 ThemeProvider 内部使用');
  }
  return context;
}

// 4. 在组件中使用 Context
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff',
      }}
      onClick={toggleTheme}
    >
      切换主题
    </button>
  );
}

// 5. 应用组件
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>主题演示</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}
```

### useMemo 和 useCallback 性能优化

```jsx
/**
 * useMemo 和 useCallback 优化性能
 */
function ExpensiveCalculation({ items, filter, onClick }) {
  // 1. useMemo 缓存计算结果
  const filteredItems = useMemo(() => {
    console.log('Filtering items...'); // 在依赖变化时才执行
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);
  
  // 2. useCallback 缓存函数引用
  const handleItemClick = useCallback((item) => {
    console.log('Item clicked:', item);
    onClick(item);
  }, [onClick]);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li 
          key={item.id}
          onClick={() => handleItemClick(item)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// 注意：不要过度优化！只有在确实需要时才使用这些 Hook
```

### 自定义 Hook 设计模式

```jsx
/**
 * 自定义 Hook 设计模式
 */
// 1. 提取复用逻辑到自定义 Hook
function useLocalStorage(key, initialValue) {
  // 状态初始化时从 localStorage 获取
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // 更新状态同时更新 localStorage
  const setValue = (value) => {
    try {
      // 处理函数形式
      const valueToStore = 
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 2. 组合多个自定义 Hook
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    fetchUser(userId)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);
  
  return { user, loading, error };
}

// 3. 使用自定义 Hook
function UserProfile({ userId }) {
  // 使用自定义 Hook
  const [preferences, setPreferences] = useLocalStorage(`user-${userId}-prefs`, {});
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <p>加载中...</p>;
  if (error) return <p>错误: {error.message}</p>;
  if (!user) return <p>未找到用户</p>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>邮箱: {user.email}</p>
      <div>
        <h3>偏好设置</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.darkMode || false}
            onChange={() => setPreferences({
              ...preferences,
              darkMode: !preferences.darkMode
            })}
          />
          深色模式
        </label>
      </div>
    </div>
  );
}
```

### useLayoutEffect vs useEffect

```jsx
/**
 * useLayoutEffect 和 useEffect 的比较
 */
function Tooltip({ text, position }) {
  const tooltipRef = useRef(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  
  // 在 DOM 更新后但在浏览器绘制前同步执行
  useLayoutEffect(() => {
    // 这里的代码会阻塞浏览器渲染，但可以避免闪烁
    if (tooltipRef.current) {
      const height = tooltipRef.current.getBoundingClientRect().height;
      setTooltipHeight(height);
    }
  }, [position]); // 当位置变化时重新计算
  
  // 普通 useEffect 会在浏览器绘制后异步执行
  useEffect(() => {
    // 这里的代码不会阻塞浏览器渲染，适合副作用操作
    console.log('Tooltip rendered, height:', tooltipHeight);
  }, [tooltipHeight]);
  
  return (
    <div 
      ref={tooltipRef}
      className="tooltip"
      style={{
        top: position.y - tooltipHeight,
        left: position.x
      }}
    >
      {text}
    </div>
  );
}
```

### 使用 Hook 的规则和注意事项

```jsx
/**
 * Hook 使用规则与最佳实践
 */
function CompliantComponent() {
  // 1. 只在顶层调用 Hooks
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 错误：不要在条件语句中使用 Hooks
  // if (name !== '') {
  //   useEffect(() => {
  //     document.title = name;
  //   }, [name]);
  // }
  
  // 正确：将条件放在 Hook 内部
  useEffect(() => {
    if (name !== '') {
      document.title = name;
    }
  }, [name]);
  
  // 2. 只在 React 函数中调用 Hooks
  // - React 函数组件中
  // - 自定义 Hook 中
  // 不要在普通 JavaScript 函数中调用
  
  // 3. 确保依赖数组包含所有依赖项
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <p>{count}</p>
      <input 
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={handleClick}>增加</button>
    </div>
  );
}
```

### 更多 React Hooks 高级用法

#### useImperativeHandle 使用方法

```jsx
/**
 * useImperativeHandle Hook使用示例
 * 用于向父组件暴露自定义实例值
 */
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

// 使用forwardRef包装子组件以获取ref
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  // 自定义暴露给父组件的实例值
  useImperativeHandle(ref, () => ({
    // 只暴露特定的方法，而不是整个DOM节点
    focus: () => {
      inputRef.current.focus();
    },
    // 暴露自定义方法
    clear: () => {
      inputRef.current.value = '';
    },
    // 暴露自定义属性
    getValue: () => inputRef.current.value
  }));
  
  return <input ref={inputRef} {...props} />;
});

// 父组件中使用
function Parent() {
  const fancyInputRef = useRef(null);
  
  const handleClick = () => {
    // 调用子组件暴露的方法
    fancyInputRef.current.focus();
  };
  
  const handleClear = () => {
    fancyInputRef.current.clear();
  };
  
  const handleGetValue = () => {
    alert(fancyInputRef.current.getValue());
  };
  
  return (
    <div>
      <FancyInput ref={fancyInputRef} />
      <button onClick={handleClick}>聚焦输入框</button>
      <button onClick={handleClear}>清空输入框</button>
      <button onClick={handleGetValue}>获取值</button>
    </div>
  );
}
```

#### useDebugValue 调试钩子

```jsx
/**
 * useDebugValue Hook用于在React开发者工具中显示自定义hook的标签
 */
import { useState, useEffect, useDebugValue } from 'react';

// 自定义Hook
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
  
  // 在React DevTools中添加自定义显示标签
  useDebugValue(isOnline ? '在线' : '离线');
  
  // 也可以使用格式化函数延迟计算（仅在DevTools打开时计算）
  useDebugValue(isOnline, status => 
    status ? '✅ 在线' : '❌ 离线'
  );
  
  return isOnline;
}

function StatusDisplay() {
  const isOnline = useOnlineStatus();
  
  return <div>当前状态: {isOnline ? '在线' : '离线'}</div>;
}
```

#### useId 生成唯一ID

```jsx
/**
 * useId Hook用于生成唯一标识符
 * React 18新增
 */
import { useId } from 'react';

function LabeledInput({ label }) {
  // 生成唯一ID
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

// 用于复杂表单时避免ID冲突
function ComplexForm() {
  // 每个组件实例都会生成唯一ID
  const nameId = useId();
  const emailId = useId();
  
  // 可以使用同一个ID前缀生成相关联的多个ID
  const baseId = useId();
  const firstNameId = `${baseId}-firstName`;
  const lastNameId = `${baseId}-lastName`;
  
  return (
    <form>
      <div>
        <label htmlFor={nameId}>姓名:</label>
        <input id={nameId} />
      </div>
      
      <div>
        <label htmlFor={emailId}>邮箱:</label>
        <input id={emailId} type="email" />
      </div>
      
      <fieldset>
        <legend>详细信息</legend>
        <div>
          <label htmlFor={firstNameId}>名:</label>
          <input id={firstNameId} />
        </div>
        <div>
          <label htmlFor={lastNameId}>姓:</label>
          <input id={lastNameId} />
        </div>
      </fieldset>
    </form>
  );
}
```

### 实用自定义 Hooks 示例

#### useMediaQuery 媒体查询钩子

```jsx
/**
 * 媒体查询自定义Hook
 * 用于响应式设计
 */
import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  // 获取初始匹配状态
  const getMatches = (query) => {
    // 服务端渲染支持
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };
  
  const [matches, setMatches] = useState(getMatches(query));
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // 处理媒体查询变化
    const handleChange = () => setMatches(mediaQuery.matches);
    
    // 添加事件监听
    // 使用事件监听器的新旧两种API，以兼容不同浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 旧版API，某些浏览器可能需要
      mediaQuery.addListener(handleChange);
    }
    
    // 初始检查
    handleChange();
    
    // 清理事件监听
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);
  
  return matches;
}

// 使用示例
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return (
    <div>
      <h2>当前设备类型</h2>
      {isMobile && <p>移动设备</p>}
      {isTablet && <p>平板设备</p>}
      {isDesktop && <p>桌面设备</p>}
      
      <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
        响应式内容
      </div>
    </div>
  );
}
```

#### useAsync 异步操作钩子

```jsx
/**
 * 处理异步操作的自定义Hook
 */
import { useState, useCallback, useEffect } from 'react';

function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  
  // 包装异步函数
  const execute = useCallback(async (...params) => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    try {
      const response = await asyncFunction(...params);
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);
  
  // 立即执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { execute, status, value, error, isLoading: status === 'pending' };
}

// 使用示例
function UserData({ userId }) {
  const fetchUserData = async (id) => {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) throw new Error('获取用户数据失败');
    return response.json();
  };
  
  const { 
    execute,
    status, 
    value: user, 
    error, 
    isLoading 
  } = useAsync(() => fetchUserData(userId), true);
  
  return (
    <div>
      {isLoading && <div>加载中...</div>}
      
      {status === 'error' && (
        <div>
          <p>错误: {error.message}</p>
          <button onClick={execute}>重试</button>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <h2>{user.name}</h2>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}
```

#### useEventListener 事件监听钩子

```jsx
/**
 * 事件监听自定义Hook
 */
import { useRef, useEffect } from 'react';

function useEventListener(eventName, handler, element = window) {
  // 创建一个ref来存储处理函数
  const savedHandler = useRef();
  
  // 如果处理函数变化，更新ref.current值
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // 确保元素支持addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    // 创建事件监听器调用存储的处理函数
    const eventListener = (event) => savedHandler.current(event);
    
    // 添加事件监听
    element.addEventListener(eventName, eventListener);
    
    // 清理
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// 使用示例
function KeyLogger() {
  const [keys, setKeys] = useState([]);
  
  // 处理键盘事件
  const handler = ({ key }) => {
    setKeys((prevKeys) => [...prevKeys, key].slice(-10));
  };
  
  // 使用自定义Hook添加事件监听
  useEventListener('keydown', handler);
  
  return (
    <div>
      <h2>最近按下的10个键:</h2>
      <ul>
        {keys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### useDarkMode 暗黑模式钩子

```jsx
/**
 * 暗黑模式切换自定义Hook
 */
import { useEffect } from 'react';

function useDarkMode() {
  // 使用之前创建的useLocalStorage和useMediaQuery
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // 如果用户未设置主题，则使用系统首选项
  const enabled = darkMode === null ? prefersDarkMode : darkMode;
  
  useEffect(() => {
    // 根据当前主题设置body的class
    const className = 'dark-mode';
    const element = document.body;
    
    if (enabled) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }, [enabled]);
  
  return [enabled, setDarkMode];
}

// 使用示例
function ThemeToggle() {
  const [darkMode, setDarkMode] = useDarkMode();
  
  return (
    <div className="theme-toggle">
      <h2>主题设置</h2>
      <label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={e => setDarkMode(e.target.checked)}
        />
        深色模式
      </label>
      <p>当前主题: {darkMode ? '深色' : '浅色'}</p>
    </div>
  );
}
```

#### useClipboard 剪贴板操作钩子

```jsx
/**
 * 剪贴板操作自定义Hook
 */
import { useState, useCallback } from 'react';

function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);
  
  const copy = useCallback((text) => {
    // 使用新的异步Clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          // 设置复制成功的提示持续时间
          setTimeout(() => setCopied(false), duration);
        })
        .catch((error) => {
          console.error('复制失败:', error);
          setCopied(false);
        });
    } else {
      // 回退到旧的document.execCommand方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), duration);
        } else {
          console.error('复制失败');
          setCopied(false);
        }
      } catch (error) {
        console.error('复制失败:', error);
        setCopied(false);
      }
    }
  }, [duration]);
  
  return [copied, copy];
}

// 使用示例
function CopyToClipboard() {
  const [value, setValue] = useState('这是要复制的文本');
  const [copied, copy] = useClipboard();
  
  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={() => copy(value)}>
        {copied ? '已复制!' : '复制文本'}
      </button>
    </div>
  );
}
```

### React hooks 性能调优技巧

```jsx
/**
 * React Hooks 性能调优技巧
 */

// 1. 避免不必要的Effect依赖

// 不推荐: 依赖过多，频繁触发
function Counter() {
  const [count, setCount] = useState(0);
  
  // 每次count变化都会重新设置定时器
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [count]); // 依赖count导致每次更新都重建定时器
  
  return <div>{count}</div>;
}

// 推荐: 使用函数式更新减少依赖
function OptimizedCounter() {
  const [count, setCount] = useState(0);
  
  // 使用函数式更新不依赖外部变量
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1); // 使用函数式更新
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖数组，只在挂载时设置一次
  
  return <div>{count}</div>;
}

// 2. 性能优化中的自定义比较函数
const MemoizedComponent = React.memo(
  function ExpensiveComponent({ item }) {
    /* 渲染逻辑 */
    return <div>{item.name}</div>;
  },
  // 自定义比较函数，只关心name属性是否变化
  (prevProps, nextProps) => {
    return prevProps.item.name === nextProps.item.name;
  }
);

// 3. 优化Context性能 - 拆分Context
// 不推荐: 所有状态放在一个Context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  // 任何一个状态变化，所有消费此Context的组件都会重新渲染
  const value = {
    user, setUser,
    theme, setTheme,
    notifications, setNotifications
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 推荐: 拆分不同关注点到多个Context
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();

function OptimizedAppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
          {children}
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 4. 使用useCallback包装事件处理函数
function SearchComponent({ onSearch }) {
  const [term, setTerm] = useState('');
  
  // 使用useCallback确保函数引用稳定
  const handleSearch = useCallback(() => {
    onSearch(term);
  }, [term, onSearch]);
  
  return (
    <div>
      <input
        value={term}
        onChange={e => setTerm(e.target.value)}
      />
      <ExpensiveChildComponent onSearch={handleSearch} />
    </div>
  );
}
```

## 总结
随着React的不断发展，Hooks已经成为函数组件状态管理和生命周期处理的核心。掌握各种Hooks的高级用法和性能优化技巧，将使你的React应用更加高效、可维护。采用合适的设计模式，编写可复用的自定义Hooks，将帮助你构建出更优雅、更强大的React应用。 