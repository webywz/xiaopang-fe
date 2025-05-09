# TypeScript 泛型

泛型是TypeScript中最强大的特性之一，它允许我们创建可重用的组件，这些组件可以与多种类型一起工作，而不仅仅是单一类型。本文将详细介绍TypeScript泛型的使用方法和高级特性。

## 为什么需要泛型？

假设我们想创建一个函数，它返回传入的任何值。不使用泛型，我们可能会这样写：

```typescript
function identity(arg: any): any {
  return arg;
}
```

这个函数虽然可以工作，但它有一个问题：它丢失了类型信息。如果我们传入一个数字，我们只知道返回值是`any`类型，而不是具体的数字类型。

使用泛型，我们可以保留类型信息：

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// 调用方式1：明确指定类型参数
let output1 = identity<string>("myString");  // output1类型为string

// 调用方式2：让编译器自动推断类型参数
let output2 = identity(42);  // output2类型为number
```

泛型使得函数的输入类型和输出类型之间建立了关联，保持了类型信息。

## 泛型类型变量

在使用泛型时，编译器要求你在函数体内正确使用类型参数：

```typescript
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);  // 错误：T上不存在'length'属性
  return arg;
}
```

要解决这个问题，我们可以指定`arg`是包含`length`属性的数组：

```typescript
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length);  // 数组有length属性，所以没问题
  return arg;
}

// 或者使用泛型约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);  // 现在我们知道T有length属性
  return arg;
}

// 正确：字符串有length属性
loggingIdentity("hello");

// 正确：数组有length属性
loggingIdentity([1, 2, 3]);

// 错误：数字没有length属性
// loggingIdentity(123);
```

## 泛型接口

我们可以创建泛型接口，使接口的某些属性类型可变：

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
myIdentity(123);  // 正确
// myIdentity("123");  // 错误：类型'string'的参数不能赋给类型'number'的参数
```

泛型接口在实际开发中非常有用，例如创建通用的数据服务：

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// 用户列表API响应
type UserListResponse = ApiResponse<User[]>;

// 单个用户API响应
type UserResponse = ApiResponse<User>;

// 使用示例
function fetchUsers(): Promise<UserListResponse> {
  return fetch('/api/users')
    .then(response => response.json());
}

function fetchUser(id: number): Promise<UserResponse> {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());
}
```

## 泛型类

类也可以使用泛型：

```typescript
class GenericBox<T> {
  private contents: T;

  constructor(value: T) {
    this.contents = value;
  }

  getValue(): T {
    return this.contents;
  }

  setValue(value: T): void {
    this.contents = value;
  }
}

// 使用字符串类型
const stringBox = new GenericBox<string>("Hello TypeScript");
const greeting: string = stringBox.getValue();

// 使用数字类型
const numberBox = new GenericBox<number>(123);
const value: number = numberBox.getValue();
```

泛型类在创建容器类、集合类等场景下非常有用：

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }
}

// 数字栈
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop());  // 2

// 字符串栈
const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
console.log(stringStack.pop());  // "world"
```

## 泛型约束

有时我们想限制泛型类型必须具有特定的属性或方法，这就是泛型约束：

```typescript
interface HasId {
  id: number;
}

// T必须有id属性
function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const user = findById(users, 2);  // { id: 2, name: "Bob" }
```

多个类型参数之间也可以约束：

```typescript
// 指定K必须是T的键
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice", email: "alice@example.com" };

console.log(getProperty(user, "name"));  // "Alice"
// console.log(getProperty(user, "age"));  // 错误：'age'不是'id' | 'name' | 'email'
```

## 泛型默认类型

我们可以为泛型参数指定默认类型：

```typescript
interface ApiRequest<T = any> {
  endpoint: string;
  data?: T;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

// 使用默认类型
const getRequest: ApiRequest = {
  endpoint: '/api/users',
  method: 'GET'
};

// 指定具体类型
interface User {
  name: string;
  email: string;
}

const createUserRequest: ApiRequest<User> = {
  endpoint: '/api/users',
  method: 'POST',
  data: { name: "Alice", email: "alice@example.com" }
};
```

## 条件类型

条件类型使我们能够基于条件选择类型：

```typescript
type IsArray<T> = T extends any[] ? true : false;

type WithArray = IsArray<string[]>;  // true
type WithoutArray = IsArray<number>;  // false
```

条件类型在创建复杂的类型时非常有用：

```typescript
// 从T中排除U类型
type Exclude<T, U> = T extends U ? never : T;

type T0 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"
type T1 = Exclude<string | number | boolean, number>;  // string | boolean

// 提取T中可以赋值给U的类型
type Extract<T, U> = T extends U ? T : never;

type T2 = Extract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"
type T3 = Extract<string | number | boolean, boolean>;  // boolean
```

## 映射类型

我们可以基于旧类型创建新类型，其中新类型转换了旧类型属性：

```typescript
// 将所有属性设为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = Readonly<User>;
// 等同于：
// type ReadonlyUser = {
//   readonly id: number;
//   readonly name: string;
// };

// 将所有属性设为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type PartialUser = Partial<User>;
// 等同于：
// type PartialUser = {
//   id?: number;
//   name?: string;
// };
```

## infer关键字

`infer`关键字用于在条件类型中推断类型：

```typescript
// 提取数组元素类型
type ArrayElementType<T> = T extends (infer U)[] ? U : never;

type NumberArray = number[];
type Number = ArrayElementType<NumberArray>;  // number

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greeting(): string {
  return "Hello";
}

type GreetingReturn = ReturnType<typeof greeting>;  // string
```

## 泛型工具类型

TypeScript内置了许多实用的泛型工具类型：

```typescript
// Partial - 使所有属性可选
interface User {
  id: number;
  name: string;
  email: string;
}

// 用于更新用户，只需提供要更新的字段
function updateUser(userId: number, updates: Partial<User>): void {
  // 实现略
}

updateUser(1, { name: "New Name" });  // 正确，不需要提供所有字段

// Readonly - 使所有属性只读
const readonlyUser: Readonly<User> = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
// readonlyUser.name = "Bob";  // 错误：无法分配到"name"，因为它是只读属性

// Record - 创建具有指定键和值类型的对象类型
type UserRoles = Record<string, string[]>;

const roles: UserRoles = {
  "admin": ["manage_users", "manage_content"],
  "editor": ["edit_content"],
  "viewer": ["view_content"]
};

// Pick - 从类型中选择部分属性
type UserBasicInfo = Pick<User, "id" | "name">;
// 等同于：
// type UserBasicInfo = {
//   id: number;
//   name: string;
// };

// Omit - 从类型中排除部分属性
type UserWithoutEmail = Omit<User, "email">;
// 等同于：
// type UserWithoutEmail = {
//   id: number;
//   name: string;
// };

// NonNullable - 从类型中排除null和undefined
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>;  // string
```

## 实际应用示例

### 1. 通用数据服务

```typescript
class DataService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(this.endpoint);
    return response.json();
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`);
    return response.json();
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return response.json();
  }

  async update(id: number, updates: Partial<T>): Promise<T> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async delete(id: number): Promise<void> {
    await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE'
    });
  }
}

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

const userService = new DataService<User>('/api/users');

async function example() {
  // 获取所有用户
  const users = await userService.getAll();
  
  // 获取单个用户
  const user = await userService.getById(1);
  
  // 创建新用户
  const newUser = await userService.create({ name: "Alice", email: "alice@example.com" });
  
  // 更新用户
  const updatedUser = await userService.update(1, { name: "Updated Name" });
  
  // 删除用户
  await userService.delete(1);
}
```

### 2. 状态管理组件

```typescript
type Listener<T> = (state: T) => void;

class Store<T> {
  private state: T;
  private listeners: Listener<T>[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// 使用示例
interface AppState {
  user: {
    name: string;
    isLoggedIn: boolean;
  };
  theme: 'light' | 'dark';
  notifications: number;
}

const initialState: AppState = {
  user: {
    name: '',
    isLoggedIn: false
  },
  theme: 'light',
  notifications: 0
};

const store = new Store<AppState>(initialState);

// 订阅状态变化
const unsubscribe = store.subscribe(state => {
  console.log('State changed:', state);
});

// 更新状态
store.setState({
  user: { name: 'Alice', isLoggedIn: true },
  notifications: 3
});

// 取消订阅
unsubscribe();
```

泛型是TypeScript中最强大的特性之一，掌握泛型可以帮助我们编写更加灵活、可重用的代码，提高代码质量和开发效率。 