# TypeScript 与 React

TypeScript 为 React 开发带来类型安全和更好的开发体验。本文介绍如何在 React 项目中高效使用 TypeScript。

---

## 1. TypeScript 基础

### 常用类型

```ts
const name: string = '张三';
const age: number = 30;
const isActive: boolean = true;
const skills: string[] = ['React', 'TypeScript'];
const tuple: [string, number] = ['位置', 123];
```

### 接口与类型别名

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  readonly createdAt: Date;
}

type UserRole = 'admin' | 'user' | 'guest';
const userRole: UserRole = 'admin';
```

---

## 2. React 组件类型定义

### 函数组件

```tsx
interface GreetingProps {
  name: string;
  age?: number;
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>你好, {name}!</h1>
      {age ? <p>年龄: {age}</p> : null}
    </div>
  );
}
```

### 类组件

```tsx
import React from 'react';

interface CounterProps {
  initialCount: number;
}

interface CounterState {
  count: number;
}

class Counter extends React.Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = { count: props.initialCount };
  }

  increment = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
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

---

## 3. 事件与表单

```tsx
function EventButton(props: { onClick: (id: number) => void }) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    props.onClick(123);
  };
  return <button onClick={handleClick}>点击我</button>;
}

function InputForm() {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 4. 泛型组件

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>(props: ListProps<T>) {
  return (
    <ul>
      {props.items.map((item, idx) => (
        <li key={idx}>{props.renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
];

function UserList() {
  return (
    <List
      items={users}
      renderItem={user => <span>{user.name}</span>}
    />
  );
}
```

---

## 5. 自定义 Hook 类型

```tsx
import { useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };
  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}
```

---

## 6. 类型技巧

### 联合类型与交叉类型

```ts
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface BaseButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
}

type ButtonProps = BaseButtonProps & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);
```

### 条件类型与映射类型

```ts
type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

type ReadonlyProps<T> = {
  readonly [P in keyof T]: T[P];
};
```

---

## 7. 常用库类型实践

### React Router

```tsx
import { useParams, useNavigate } from 'react-router-dom';

interface UserParams {
  id: string;
}

function UserProfile() {
  const { id } = useParams<UserParams>();
  const navigate = useNavigate();
  return (
    <div>
      <h1>用户 {id} 的资料</h1>
      {/* // onClick={() => navigate('/')} */}
      <button>返回首页</button> 
    </div>
  );
}
```

### Redux Toolkit

```jsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}
const initialState: CounterState = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
```

---

## 8. tsconfig.json 推荐配置

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

---

## 9. React + TypeScript 最佳实践

- 组件 props 建议用 interface
- 避免使用 React.FC
- 事件处理器用具体类型（如 React.MouseEvent）
- props 建议只读
- 优先命名导出
- 复杂对象可用 Partial《T》
- 只在含 JSX 的文件用 .tsx
- 开发和 CI 流程中启用类型检查

---

## 10. 总结

TypeScript 为 React 带来：

- 类型安全，减少运行时错误
- 更好的开发体验和补全
- 自动文档
- 更安全的重构

掌握本文内容，可让你的 React 项目更健壮、可维护！

---

如需更详细的某一部分内容或代码示例，请随时告知！ 