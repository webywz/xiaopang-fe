# React设计模式

设计模式是解决软件设计中常见问题的可复用方案。在React开发中，掌握一些关键设计模式可以帮助我们构建更灵活、可维护的组件和应用。本文将介绍React中常用的设计模式及其实现方法。

## 复合组件模式

复合组件模式（Compound Components）允许创建由多个组件组成的UI单元，这些组件共享状态并协同工作。

### 基本实现

```jsx
/**
 * 复合组件基本实现
 */
import React, { createContext, useContext, useState } from 'react';

// 创建上下文
const TabContext = createContext();

// 父组件
function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  const value = {
    activeIndex,
    setActiveIndex
  };
  
  return (
    <TabContext.Provider value={value}>
      <div className="tabs">{children}</div>
    </TabContext.Provider>
  );
}

// 子组件 - 选项卡头部
Tabs.TabList = function TabList({ children }) {
  return (
    <div className="tab-list">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, { index });
      })}
    </div>
  );
};

// 子组件 - 选项卡
Tabs.Tab = function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabContext);
  const isActive = activeIndex === index;
  
  return (
    <div 
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </div>
  );
};

// 子组件 - 内容面板列表
Tabs.TabPanels = function TabPanels({ children }) {
  const { activeIndex } = useContext(TabContext);
  
  return (
    <div className="tab-panels">
      {React.Children.toArray(children)[activeIndex]}
    </div>
  );
};

// 子组件 - 内容面板
Tabs.Panel = function Panel({ children }) {
  return <div className="panel">{children}</div>;
};
```

### 使用方式

```jsx
/**
 * 复合组件使用示例
 */
function App() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.TabList>
        <Tabs.Tab>第一页</Tabs.Tab>
        <Tabs.Tab>第二页</Tabs.Tab>
        <Tabs.Tab>第三页</Tabs.Tab>
      </Tabs.TabList>
      
      <Tabs.TabPanels>
        <Tabs.Panel>第一页内容</Tabs.Panel>
        <Tabs.Panel>第二页内容</Tabs.Panel>
        <Tabs.Panel>第三页内容</Tabs.Panel>
      </Tabs.TabPanels>
    </Tabs>
  );
}
```

### 优势

1. **声明式API**：使用方式清晰直观
2. **状态封装**：内部状态和逻辑对使用者透明
3. **灵活性**：子组件可以任意组合和排序

## 渲染属性模式

渲染属性（Render Props）是一种通过属性传递渲染逻辑的技术，允许组件共享代码和状态。

### 基本实现

```jsx
/**
 * 渲染属性模式实现
 */
import React, { useState } from 'react';

function Toggle({ render, children }) {
  const [on, setOn] = useState(false);
  
  const toggle = () => setOn(!on);
  
  // 支持两种使用方式：render属性或children
  const renderFn = render || children;
  
  return renderFn({ on, toggle });
}
```

### 使用方式

```jsx
/**
 * 渲染属性使用示例
 */
function App() {
  return (
    <Toggle render={({ on, toggle }) => (
      <div>
        <button onClick={toggle}>
          {on ? '关闭' : '打开'}
        </button>
        <div>{on ? '内容已显示' : '内容已隐藏'}</div>
      </div>
    )} />
    
    {/* 或使用children方式 */}
    <Toggle>
      {({ on, toggle }) => (
        <div>
          <button onClick={toggle}>
            {on ? '关闭' : '打开'}
          </button>
          <div>{on ? '内容已显示' : '内容已隐藏'}</div>
        </div>
      )}
    </Toggle>
  );
}
```

### 高级用法：组合渲染属性

```jsx
/**
 * 组合多个渲染属性组件
 */
function App() {
  return (
    <Toggle>
      {({ on: toggleOn, toggle: toggleToggle }) => (
        <Counter initial={0}>
          {({ count, increment }) => (
            <div>
              <button onClick={() => {
                toggleToggle();
                increment();
              }}>
                {toggleOn ? '关闭' : '打开'} | 点击次数: {count}
              </button>
              {toggleOn && <div>显示的内容</div>}
            </div>
          )}
        </Counter>
      )}
    </Toggle>
  );
}
```

### 优势

1. **逻辑复用**：可以在多个组件间共享状态和行为
2. **关注点分离**：将状态逻辑与UI渲染分离
3. **灵活控制**：使用者可以完全控制渲染结果

## 高阶组件模式

高阶组件（Higher-Order Components，HOC）是一个接收组件并返回新组件的函数，用于增强原始组件的功能。

### 基本实现

```jsx
/**
 * 高阶组件实现
 * @param {React.ComponentType} WrappedComponent - 被包装的组件
 * @returns {React.ComponentType} 增强后的组件
 */
function withLoading(WrappedComponent) {
  // 返回一个新的函数组件
  return function WithLoading(props) {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <div>加载中...</div>;
    }
    
    // 传递其余属性给被包装组件
    return <WrappedComponent {...restProps} />;
  };
}
```

### 使用方式

```jsx
/**
 * 高阶组件使用示例
 */
// 原始组件
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 应用高阶组件
const UserListWithLoading = withLoading(UserList);

// 使用增强后的组件
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      setUsers([
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
      ]);
      setIsLoading(false);
    }, 2000);
  }, []);
  
  return <UserListWithLoading isLoading={isLoading} users={users} />;
}
```

### 组合多个HOC

```jsx
/**
 * 组合多个高阶组件
 */
// 添加日志记录的HOC
function withLogger(WrappedComponent) {
  return function WithLogger(props) {
    useEffect(() => {
      console.log(`组件${WrappedComponent.name}已挂载`);
      return () => {
        console.log(`组件${WrappedComponent.name}已卸载`);
      };
    }, []);
    
    return <WrappedComponent {...props} />;
  };
}

// 组合多个HOC（从下往上应用）
const EnhancedUserList = withLogger(withLoading(UserList));

// 或使用compose函数
import { compose } from 'redux'; // 或自行实现
const enhance = compose(withLogger, withLoading);
const EnhancedUserList = enhance(UserList);
```

### 优势

1. **代码复用**：将通用功能抽象为可重用的包装器
2. **关注点分离**：主组件只关注核心功能，横切关注点由HOC处理
3. **组合能力**：可以组合多个HOC形成功能管道

## 钩子模式

钩子（Hooks）是React 16.8引入的特性，允许在函数组件中使用状态和其他React特性，是现代React开发的核心模式。

### 自定义Hook

```jsx
/**
 * 自定义Hook实现
 * @param {string} key - 本地存储键
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} 当前值和设置函数
 */
function useLocalStorage(key, initialValue) {
  // 惰性初始化状态
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // 封装设置函数，自动更新localStorage
  const setValue = value => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}
```

### 使用方式

```jsx
/**
 * 自定义Hook使用示例
 */
function UserPreferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  const toggleTheme = () => {
    setTheme(currentTheme => 
      currentTheme === 'light' ? 'dark' : 'light'
    );
  };
  
  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>
        切换到{theme === 'light' ? '深色' : '浅色'}主题
      </button>
      <p>当前主题: {theme}</p>
    </div>
  );
}
```

### 组合多个Hook

```jsx
/**
 * 组合多个Hook
 */
// 计数器Hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// 窗口大小Hook
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// 组合使用
function ResponsiveCounter() {
  const { count, increment } = useCounter(0);
  const { width } = useWindowSize();
  
  const isSmallScreen = width < 768;
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>
        {isSmallScreen ? '+' : '增加'}
      </button>
      <p>当前屏幕宽度: {width}px</p>
    </div>
  );
}
```

### 优势

1. **逻辑复用**：可以在不同组件间共享状态逻辑
2. **简洁代码**：比类组件和HOC更直观和简洁
3. **关注点分离**：可以按照功能而非生命周期组织代码
4. **组合能力**：自定义Hook可以任意组合使用

## Context模式

Context模式用于在组件树中共享全局数据，避免层层传递props。

### 基本实现

```jsx
/**
 * Context模式实现
 */
import React, { createContext, useContext, useState } from 'react';

// 创建Context
const ThemeContext = createContext();

// 提供者组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const value = {
    theme,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义Hook简化使用
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内使用');
  }
  return context;
}
```

### 使用方式

```jsx
/**
 * Context模式使用示例
 */
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={`header ${theme}`}>
      <h1>我的应用</h1>
      <button onClick={toggleTheme}>
        切换到{theme === 'light' ? '深色' : '浅色'}主题
      </button>
    </header>
  );
}

function Content() {
  const { theme } = useTheme();
  
  return (
    <main className={`content ${theme}`}>
      <p>这是应用的主要内容</p>
    </main>
  );
}
```

### 多Context组合

```jsx
/**
 * 多Context组合
 */
// 用户Context
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = (username) => {
    setUser({ username });
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 组合多个Provider
function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  );
}

// 使用
function App() {
  return (
    <AppProviders>
      <Dashboard />
    </AppProviders>
  );
}
```

### 优势

1. **避免Prop钻取**：不需要层层传递props
2. **集中状态管理**：在一个地方定义和更新应用状态
3. **模块化**：可以为不同功能创建独立的Context

## 状态缩减模式

状态缩减（State Reducer）模式允许组件使用者自定义组件的状态更新逻辑。

### 基本实现

```jsx
/**
 * 状态缩减模式实现
 */
import React, { useReducer } from 'react';

// 默认缩减器
function toggleReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return { on: !state.on };
    case 'RESET':
      return { on: false };
    default:
      return state;
  }
}

function Toggle({ reducer = toggleReducer, children }) {
  const [state, dispatch] = useReducer(reducer, { on: false });
  
  const toggle = () => dispatch({ type: 'TOGGLE' });
  const reset = () => dispatch({ type: 'RESET' });
  
  return children({
    on: state.on,
    toggle,
    reset
  });
}
```

### 使用方式

```jsx
/**
 * 状态缩减模式使用示例
 */
function App() {
  // 使用默认缩减器
  return (
    <Toggle>
      {({ on, toggle }) => (
        <button onClick={toggle}>
          {on ? '开启' : '关闭'}
        </button>
      )}
    </Toggle>
  );
}

// 自定义缩减器
function customReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      // 只允许从关闭到开启，不允许反向操作
      return { on: state.on ? state.on : !state.on };
    default:
      return toggleReducer(state, action);
  }
}

function EnhancedApp() {
  return (
    <Toggle reducer={customReducer}>
      {({ on, toggle, reset }) => (
        <div>
          <button onClick={toggle}>
            {on ? '开启' : '关闭'}
          </button>
          <button onClick={reset}>重置</button>
          <p>单向开关：只能从关到开，不能从开到关</p>
        </div>
      )}
    </Toggle>
  );
}
```

### 优势

1. **控制反转**：将控制权交给组件使用者
2. **扩展性**：可以灵活扩展组件的行为
3. **可定制性**：保持核心逻辑的同时允许自定义行为

## 容器和展示组件模式

这种模式将组件分为两类：容器组件（关注数据和行为）和展示组件（关注UI和样式）。

### 基本实现

```jsx
/**
 * 容器和展示组件模式
 */
// 展示组件 - 只关注视觉表现
function UserListView({ users, onSelectUser }) {
  return (
    <div className="user-list">
      <h2>用户列表</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 容器组件 - 处理数据和业务逻辑
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 获取数据
    fetchUsers()
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // 其他业务逻辑...
  };
  
  if (isLoading) {
    return <div>加载中...</div>;
  }
  
  return (
    <>
      <UserListView 
        users={users} 
        onSelectUser={handleSelectUser} 
      />
      {selectedUser && (
        <div>
          <h3>已选择: {selectedUser.name}</h3>
        </div>
      )}
    </>
  );
}
```

### Hook版本

随着Hook的普及，这种模式可以演变为自定义Hook+展示组件的形式：

```jsx
/**
 * 使用Hook的容器和展示组件模式
 */
// 自定义Hook封装数据和逻辑
function useUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers()
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };
  
  return {
    users,
    selectedUser,
    isLoading,
    onSelectUser: handleSelectUser
  };
}

// 展示组件保持不变，只关注视觉表现
// 组合使用
function UserListContainer() {
  const { 
    users, 
    selectedUser, 
    isLoading, 
    onSelectUser 
  } = useUsers();
  
  if (isLoading) {
    return <div>加载中...</div>;
  }
  
  return (
    <>
      <UserListView 
        users={users} 
        onSelectUser={onSelectUser} 
      />
      {selectedUser && (
        <div>
          <h3>已选择: {selectedUser.name}</h3>
        </div>
      )}
    </>
  );
}
```

### 优势

1. **关注点分离**：展示组件专注于视觉表现，容器组件专注于数据和行为
2. **可测试性**：展示组件易于测试，逻辑集中在容器组件中
3. **可重用性**：展示组件可以在多个容器中重用
4. **可维护性**：清晰的责任划分使代码更易于维护

## 总结

React设计模式为我们提供了组织和构建组件的有效方法。根据具体场景，我们可以选择：

1. **复合组件模式**：适用于具有内部关联的UI组件集
2. **渲染属性模式**：适用于需要共享状态和逻辑的场景
3. **高阶组件模式**：适用于增强现有组件的功能
4. **钩子模式**：适用于跨组件复用状态逻辑
5. **Context模式**：适用于跨组件共享全局数据
6. **状态缩减模式**：适用于需要自定义组件行为的场景
7. **容器和展示组件模式**：适用于分离UI和业务逻辑

在实际开发中，我们通常会混合使用这些模式，根据具体需求选择最合适的方案。掌握这些模式不仅有助于构建更好的组件，还能提高代码的可维护性、可测试性和可重用性。 