---
title: React与TypeScript
description: 深入了解如何在React项目中有效地使用TypeScript，提高开发效率和代码质量
---

# React与TypeScript

TypeScript为React开发带来了类型安全和更好的开发体验。本文将介绍如何在React项目中高效使用TypeScript，通过实际案例展示TypeScript在React开发中的优势和最佳实践。

## 目录

- [React项目中集成TypeScript](#react项目中集成typescript)
- [组件类型定义](#组件类型定义)
- [状态和属性类型](#状态和属性类型)
- [事件处理](#事件处理)
- [Hooks类型](#hooks类型)
- [Context API](#context-api)
- [Higher-Order Components](#higher-order-components)
- [Redux与TypeScript](#redux与typescript)
- [React Router与TypeScript](#react-router与typescript)
- [样式组件与TypeScript](#样式组件与typescript)
- [测试](#测试)
- [最佳实践](#最佳实践)

## React项目中集成TypeScript {#react项目中集成typescript}

### 创建新的TypeScript React项目

使用Create React App创建TypeScript项目：

```bash
npx create-react-app my-app --template typescript
```

或使用Vite创建TypeScript React项目：

```bash
npm create vite@latest my-app -- --template react-ts
```

### 将现有React项目迁移到TypeScript

1. 安装TypeScript和React类型定义：

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

2. 创建`tsconfig.json`配置文件：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "outDir": "./dist",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

3. 逐步将`.js`/`.jsx`文件重命名为`.ts`/`.tsx`文件。

## 组件类型定义 {#组件类型定义}

### 函数组件类型定义

React提供了`React.FC`类型（函数组件），但更推荐使用显式定义的函数组件类型：

```tsx
// 不推荐的方式
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// 推荐的方式
interface GreetingProps {
  name: string;
  age?: number;
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age !== undefined && <p>You are {age} years old.</p>}
    </div>
  );
}
```

### 类组件类型定义

```tsx
interface CounterProps {
  initialCount: number;
}

interface CounterState {
  count: number;
}

class Counter extends React.Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount
    };
  }

  increment = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### 默认属性

使用默认参数设置默认属性值：

```tsx
interface ButtonProps {
  text: string;
  color?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

function Button({ 
  text, 
  color = 'primary', 
  onClick = () => {} 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${color}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
```

## 状态和属性类型 {#状态和属性类型}

### Prop类型

组件属性类型应该使用interface或type定义：

```tsx
interface UserProps {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  // 可选属性
  role?: 'admin' | 'user' | 'guest';
  // 函数属性
  onSelect?: (id: number) => void;
  // 子元素
  children?: React.ReactNode;
}

function User({ id, name, email, isActive, role = 'user', onSelect, children }: UserProps) {
  return (
    <div className={`user ${isActive ? 'active' : 'inactive'}`}>
      <h3>{name} ({role})</h3>
      <p>{email}</p>
      {children}
      <button onClick={() => onSelect && onSelect(id)}>Select User</button>
    </div>
  );
}
```

### 状态类型

```tsx
// 使用useState hook时的类型
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 使用显式类型参数
  const [items, setItems] = useState<string[]>([]);

  // 使用接口定义复杂状态
  interface FormState {
    username: string;
    password: string;
    rememberMe: boolean;
  }

  const [formData, setFormData] = useState<FormState>({
    username: '',
    password: '',
    rememberMe: false
  });

  return (
    // ... 组件内容
  );
}
```

## 事件处理 {#事件处理}

React事件类型：

```tsx
function EventHandlingComponent() {
  // 鼠标事件
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked', event.currentTarget.name);
  };

  // 表单事件
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed', event.target.value);
  };

  // 表单提交
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
  };

  // 键盘事件
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed');
    }
  };

  // 拖拽事件
  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('Element dragged');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button 
        name="submit-button"
        onClick={handleClick}
      >
        Submit
      </button>
      <div draggable onDrag={handleDrag}>
        Drag me
      </div>
    </form>
  );
}
```

## Hooks类型 {#hooks类型}

### useState

```tsx
// 基本类型
const [count, setCount] = useState(0); // 类型推断为number
const [text, setText] = useState(''); // 类型推断为string
const [active, setActive] = useState(false); // 类型推断为boolean

// 复杂类型需要显式声明
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// 对象类型
interface FormData {
  name: string;
  email: string;
  age: number;
}

const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  age: 0
});
```

### useEffect

```tsx
// 基本用法
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// 带清理函数
useEffect(() => {
  const subscription = someObservable.subscribe();
  
  // 返回清理函数
  return () => {
    subscription.unsubscribe();
  };
}, [someObservable]);
```

### useRef

```tsx
// DOM引用
const inputRef = useRef<HTMLInputElement>(null);

// 持久引用值
const counterRef = useRef<number>(0);

useEffect(() => {
  // 操作DOM
  if (inputRef.current) {
    inputRef.current.focus();
  }
  
  // 更新持久引用值
  counterRef.current += 1;
}, []);

return <input ref={inputRef} />;
```

### useReducer

```tsx
interface State {
  count: number;
  loading: boolean;
  error: string | null;
}

// 使用区分联合类型来定义action
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'RESET':
      return { ...state, count: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    loading: false,
    error: null
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>
        Decrement
      </button>
      <button onClick={() => dispatch({ type: 'RESET', payload: 0 })}>
        Reset
      </button>
    </div>
  );
}
```

### 自定义Hooks

```tsx
// 自定义hook类型
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 使用自定义hook
function ProfileForm() {
  const [username, setUsername] = useLocalStorage<string>('username', '');

  return (
    <input
      value={username}
      onChange={e => setUsername(e.target.value)}
      placeholder="Username"
    />
  );
}
```

## Context API {#context-api}

```tsx
// 定义上下文类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 创建带类型的上下文
const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// 创建上下文提供者
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义hook使用上下文
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 消费上下文
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Toggle Theme
    </button>
  );
}
```

## Higher-Order Components {#higher-order-components}

```tsx
// HOC类型定义
interface WithLoadingProps {
  loading: boolean;
}

// 高阶组件
function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & WithLoadingProps> {
  return ({ loading, ...props }: WithLoadingProps & P) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    return <Component {...(props as P)} />;
  };
}

// 使用HOC
interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);

const UserListWithLoading = withLoading(UserList);

// 使用带加载状态的组件
function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  return <UserListWithLoading loading={loading} users={users} />;
}
```

## Redux与TypeScript {#redux与typescript}

### Redux工具包 (Redux Toolkit)

```tsx
import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

// 状态类型
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

// 初始状态
const initialState: CounterState = {
  value: 0,
  status: 'idle'
};

// 创建slice
const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // 使用PayloadAction指定payload类型
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setStatus: (state, action: PayloadAction<CounterState['status']>) => {
      state.status = action.payload;
    }
  }
});

// 导出action创建器
export const { increment, decrement, incrementByAmount, setStatus } = counterSlice.actions;

// 配置store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

// 推断RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 在组件中使用

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, increment, decrement } from './store';

// 创建类型化的钩子
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function Counter() {
  // 使用类型化的钩子
  const count = useAppSelector(state => state.counter.value);
  const status = useAppSelector(state => state.counter.status);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>
        Count: {count} (Status: {status})
      </p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

## React Router与TypeScript {#react-router与typescript}

### 路由配置

```tsx
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';

// 定义路由参数类型
interface UserParams {
  userId: string;
}

function UserProfile() {
  // 使用类型化的useParams
  const { userId } = useParams<UserParams>();
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>User Profile: {userId}</h1>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users/123">User 123</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:userId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 路由状态

```tsx
import { useLocation, useNavigate } from 'react-router-dom';

// 定义路由状态类型
interface LocationState {
  from: string;
  message?: string;
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 当使用泛型参数时，状态可能为unknown
  const state = location.state as LocationState | null;
  
  const handleLogin = () => {
    // 传递状态
    navigate('/dashboard', { 
      state: { message: 'Login successful!' } 
    });
  };
  
  return (
    <div>
      <h1>Login</h1>
      {state?.from && <p>You were redirected from: {state.from}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

## 样式组件与TypeScript {#样式组件与typescript}

### Styled Components

```tsx
import styled from 'styled-components';

// 定义主题类型
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fontSizes: {
    small: string;
    medium: string;
    large: string;
  };
}

// 定义带属性的组件
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button = styled.button<ButtonProps>`
  background-color: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : props.theme.colors.secondary
  };
  font-size: ${props => props.theme.fontSizes[props.size || 'medium']};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

// 使用
function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        Primary Button
      </Button>
      <Button variant="secondary" size="small">
        Secondary Button
      </Button>
      <Button fullWidth>Full Width Button</Button>
    </div>
  );
}
```

### CSS Modules

```tsx
// styles.module.css.d.ts
declare const styles: {
  readonly container: string;
  readonly button: string;
  readonly buttonPrimary: string;
  readonly buttonSecondary: string;
};

export default styles;

// 使用CSS模块
import styles from './styles.module.css';

function Button({ variant = 'primary', children }: {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}) {
  const buttonClass = variant === 'primary' 
    ? styles.buttonPrimary 
    : styles.buttonSecondary;
  
  return (
    <button className={`${styles.button} ${buttonClass}`}>
      {children}
    </button>
  );
}
```

## 测试 {#测试}

### Jest与React Testing Library

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('renders counter with initial count', () => {
  render(<Counter initialCount={5} />);
  const countElement = screen.getByText(/count: 5/i);
  expect(countElement).toBeInTheDocument();
});

test('increments count when button is clicked', () => {
  render(<Counter initialCount={5} />);
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);
  expect(screen.getByText(/count: 6/i)).toBeInTheDocument();
});
```

### 类型测试

```tsx
import { render } from '@testing-library/react';

// 类型测试函数，不会实际运行，只是验证类型
function typedRender<P>(
  Component: React.ComponentType<P>,
  props: P & React.PropsWithChildren<{}>
) {
  return render(<Component {...props} />);
}

// 测试
it('should render with correct types', () => {
  // 验证类型是否匹配
  typedRender(Counter, { initialCount: 5 });
  
  // 类型错误，不会通过编译
  // @ts-expect-error
  typedRender(Counter, { initialValue: 5 });
});
```

## 最佳实践 {#最佳实践}

1. **组件类型**：避免使用`React.FC`，转而使用函数声明和显式的属性类型。

2. **属性类型**：使用接口(interface)为组件定义属性类型，利用接口的扩展性。

3. **状态类型**：为useState提供明确的泛型类型参数，尤其是对于复杂类型。

4. **区分联合类型**：通过区分联合类型(Discriminated unions)来处理复杂状态和操作。

5. **组织类型**：将类型和接口放在单独的文件中，以便复用。

```tsx
// types.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserActions {
  onSelect: (user: User) => void;
  onDelete: (id: number) => void;
}
```

6. **字面量类型**：使用字面量类型限制特定值：

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type Size = 'small' | 'medium' | 'large';
```

7. **严格的null检查**：启用`strictNullChecks`并始终处理可能的`null`和`undefined`值。

8. **子组件类型**：使用`React.ReactNode`类型表示子组件。

9. **事件处理器**：使用正确的事件类型，如`React.MouseEvent<HTMLButtonElement>`。

10. **工具类型**：利用TypeScript的工具类型如`Partial`、`Omit`、`Pick`等：

```tsx
// 创建一个省略某些属性的新类型
type UserPreview = Omit<User, 'password' | 'email'>;

// 创建一个所有属性都是可选的新类型
type UserFormUpdate = Partial<User>;

// 只选择某些属性
type UserCredentials = Pick<User, 'email' | 'password'>;
```

11. **命名约定**：对类型使用一致的命名约定，如接口名后加`Props`表示组件属性类型。

12. **类型断言**：尽量避免使用类型断言(`as`)，优先使用类型守卫。

13. **索引签名**：对于动态属性的对象，使用索引签名：

```tsx
interface Dictionary<T> {
  [key: string]: T;
}

const cache: Dictionary<User> = {};
```

14. **模块化类型文件**：为大型项目使用模块化的类型定义文件结构。

## 总结

在React项目中使用TypeScript可以显著提高代码质量和开发体验，通过静态类型检查捕获潜在错误，并提供更好的IDE支持和文档。

遵循本文介绍的最佳实践，可以充分利用TypeScript的优势，编写出更健壮、可维护的React应用程序。 