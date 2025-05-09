# TypeScript与React

TypeScript为React开发带来了类型安全和更好的开发体验。本文将介绍如何在React项目中高效使用TypeScript。

## TypeScript基础知识

在深入React与TypeScript的结合前，先了解一些基础知识：

### 基本类型

```typescript
// 基本类型标注
const name: string = '张三';
const age: number = 30;
const isActive: boolean = true;
const skills: string[] = ['React', 'TypeScript'];
const tuple: [string, number] = ['位置', 123];
```

### 接口与类型别名

```typescript
/**
 * 定义用户接口
 */
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // 可选属性
  readonly createdAt: Date; // 只读属性
}

/**
 * 使用类型别名
 */
type UserRole = 'admin' | 'user' | 'guest';

const userRole: UserRole = 'admin'; // 只能是这三个值之一
```

## React组件类型定义

### 函数组件类型定义

```tsx
/**
 * 使用React.FC定义函数组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 渲染的UI元素
 */
// 方式1：使用React.FC（不推荐，有些限制）
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>你好, {name}!</h1>;
};

// 方式2：使用函数声明（推荐）
interface GreetingProps {
  name: string;
  age?: number;
}

function BetterGreeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>你好, {name}!</h1>
      {age && <p>年龄: {age}</p>}
    </div>
  );
}
```

### 类组件类型定义

```tsx
/**
 * 使用TypeScript定义类组件
 */
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
        <p>计数: {this.state.count}</p>
        <button onClick={this.increment}>增加</button>
      </div>
    );
  }
}
```

### 事件处理

```tsx
/**
 * TypeScript中的React事件处理
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 渲染的UI元素
 */
function EventButton({ onClick }: { onClick: (id: number) => void }) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 阻止默认行为
    event.preventDefault();
    // 调用传入的处理函数
    onClick(123);
  };

  return <button onClick={handleClick}>点击我</button>;
}

// 表单事件
function InputForm() {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 处理表单提交
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 泛型组件

泛型组件允许我们创建可重用的组件，同时保持类型安全。

```tsx
/**
 * 泛型列表组件
 * @template T - 列表项类型
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} 渲染的UI元素
 */
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
];

function App() {
  return (
    <List
      items={users}
      renderItem={(user) => <span>{user.name}</span>}
    />
  );
}
```

## 自定义Hooks类型

```tsx
/**
 * 带类型的自定义hook
 * @param {string} key - 本地存储的键
 * @param {T} initialValue - 初始值
 * @returns {[T, (value: T) => void]} 存储的值和更新函数
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 获取存储的值
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 存储值状态
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回一个包装版本的setState，将新值同步到localStorage
  const setValue = (value: T) => {
    try {
      // 允许值是一个函数，类似useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// 使用自定义hook
function App() {
  const [name, setName] = useLocalStorage<string>('name', '');
  
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入你的名字"
      />
      <p>你好, {name || '访客'}!</p>
    </div>
  );
}
```

## 高级类型技巧

### 联合类型和交叉类型

```tsx
/**
 * 使用联合类型表示多种可能类型
 */
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface BaseButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
}

/**
 * 使用交叉类型组合多个类型
 */
type ButtonProps = BaseButtonProps & (
  | { href: string; onClick?: never } // 链接按钮
  | { href?: never; onClick: () => void } // 动作按钮
);

// 正确使用
const ActionButton = (props: ButtonProps) => {
  // 实现...
  return <button>按钮</button>;
};
```

### 条件类型和映射类型

```tsx
/**
 * 条件类型
 */
type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

// 从组件中提取props类型
const MyComponent = (props: { name: string }) => <div>{props.name}</div>;
type MyComponentProps = ExtractProps<typeof MyComponent>; // { name: string }

/**
 * 映射类型
 */
type ReadonlyProps<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = ReadonlyProps<User>; // { readonly id: number; readonly name: string; }
```

## TypeScript与常见React库

### React Router

```tsx
/**
 * React Router 类型
 */
import { 
  BrowserRouter, 
  Route, 
  NavLink, 
  useParams, 
  useNavigate 
} from 'react-router-dom';

// 路由参数类型
interface UserParams {
  id: string;
}

function UserProfile() {
  // 使用类型安全的useParams
  const { id } = useParams<UserParams>();
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>用户 {id} 的资料</h1>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/">首页</NavLink>
        <NavLink to="/users/1">用户1</NavLink>
      </nav>
      
      <Route path="/users/:id" element={<UserProfile />} />
    </BrowserRouter>
  );
}
```

### Redux与Redux Toolkit

```tsx
/**
 * 使用TypeScript与Redux
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 状态类型
interface CounterState {
  value: number;
}

// 初始状态
const initialState: CounterState = {
  value: 0
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
    }
  }
});

// 导出action创建器
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 使用组件中
function Counter() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}
```

## 实用工具类型

React和TypeScript生态提供了一些有用的实用工具类型：

```tsx
/**
 * React提供的常用类型
 */
// 组件属性类型，包括children
type PropsWithChildren<P> = P & { children?: React.ReactNode };

// 元素引用类型
type Ref<T> = React.RefObject<T> | ((instance: T | null) => void) | null;

// 常用的事件处理器类型
type ChangeEventHandler<T = Element> = (event: React.ChangeEvent<T>) => void;
type MouseEventHandler<T = Element> = (event: React.MouseEvent<T>) => void;

/**
 * 自定义实用类型
 */
// 提取组件属性（不含ref）
type ComponentProps<T extends React.ComponentType<any>> = 
  T extends React.ComponentType<infer P> ? P : never;

// 可选化所有属性
type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

## TypeScript配置最佳实践

### tsconfig.json推荐配置

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 类型安全的关键设置

- `strict: true`：启用所有严格类型检查选项
- `noImplicitAny: true`：禁止隐式的any类型
- `strictNullChecks: true`：启用严格的null检查

## TypeScript与React开发的最佳实践

1. **使用接口而非类型别名定义组件属性**：接口可以被扩展，更适合组件属性
2. **避免使用React.FC**：它有一些限制，如隐式包含children
3. **为事件处理器使用具体的事件类型**：如React.MouseEvent而非泛型Event
4. **组件属性使用只读属性**：确保props不被修改
5. **使用命名导出而非默认导出**：提高代码可读性和自动导入功能
6. **对复杂对象使用部分类型**：使用Partial<T>减少重复代码
7. **为非React文件使用.ts扩展名**：只在包含JSX的文件中使用.tsx
8. **使用TypeScript的构建时类型检查**：在开发和CI流程中使用类型检查

## 总结

TypeScript为React开发带来了以下优势：

- **类型安全**：减少运行时错误
- **开发体验**：更好的代码补全和工具支持
- **文档**：通过类型定义自动形成文档
- **重构**：更容易和安全地进行代码重构

通过掌握本文介绍的技术，您可以构建出类型安全、可维护性高的React应用。 