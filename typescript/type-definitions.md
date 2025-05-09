# TypeScript 类型定义指南

## 基础类型

### 原始类型

```typescript
// 基本类型注解
const isComplete: boolean = false;
const decimal: number = 6;
const hex: number = 0xf00d;
const binary: number = 0b1010;
const color: string = "blue";
const list: number[] = [1, 2, 3];
const tuple: [string, number] = ["hello", 10];
```

### 特殊类型

```typescript
// 空值
function warnUser(): void {
  console.log("警告信息");
}

// 任意类型（尽量避免使用）
let notSure: any = 4;
notSure = "可能是字符串";

// 未知类型（比 any 更安全）
let unknownValue: unknown = 4;
// 需要类型检查或断言后才能使用
if (typeof unknownValue === "string") {
  console.log(unknownValue.toUpperCase());
}

// Never 类型表示永不会返回的函数
function error(message: string): never {
  throw new Error(message);
}
```

## 对象与接口

### 接口定义

```typescript
/**
 * 用户信息接口
 */
interface User {
  // 必选属性
  id: number;
  name: string;
  
  // 可选属性
  age?: number;
  
  // 只读属性
  readonly createdAt: Date;
  
  // 方法定义
  updateProfile(data: Partial<User>): Promise<void>;
}

// 使用接口
const user: User = {
  id: 1,
  name: "张三",
  createdAt: new Date(),
  updateProfile: async (data) => {
    // 实现细节
  }
};
```

### 索引签名

```typescript
/**
 * 字典类型
 */
interface Dictionary<T> {
  [key: string]: T;
}

const stringDict: Dictionary<string> = {
  key1: "value1",
  key2: "value2"
};

/**
 * 混合类型接口
 */
interface Counter {
  // 具体属性
  count: number;
  // 方法
  reset(): void;
  // 索引签名
  [propName: string]: any;
}
```

### 接口继承

```typescript
interface Person {
  name: string;
  age: number;
}

/**
 * 通过继承扩展接口
 */
interface Employee extends Person {
  employeeId: string;
  department: string;
}

/**
 * 多重继承
 */
interface Manager extends Employee, Admin {
  manageTeamSize: number;
}
```

## 类型别名与交叉类型

### 类型别名

```typescript
/**
 * 使用 type 关键字定义类型别名
 */
type ID = string | number;

type Point = {
  x: number;
  y: number;
};

// 使用类型别名
const userId: ID = 123456;
const coordinates: Point = { x: 10, y: 20 };
```

### 交叉类型

```typescript
type Person = {
  name: string;
  age: number;
};

type ContactInfo = {
  email: string;
  phone: string;
};

/**
 * 使用交叉类型组合多个类型
 */
type Employee = Person & ContactInfo & {
  employeeId: string;
  department: string;
};

// 创建完整的员工信息
const employee: Employee = {
  name: "李四",
  age: 30,
  email: "lisi@example.com",
  phone: "13800138000",
  employeeId: "EMP123",
  department: "技术部"
};
```

## 函数类型

### 函数签名

```typescript
// 函数类型声明
type GreetFunction = (name: string) => string;

// 函数表达式
const greet: GreetFunction = (name) => `你好，${name}`;

// 带有明确参数类型和返回类型的函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 可选参数和默认参数
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
```

### 函数重载

```typescript
/**
 * 函数重载声明
 */
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;

// 实现函数
function formatValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.trim();
  } else if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return value ? "是" : "否";
  }
}
```

## 泛型

### 泛型基础

```typescript
/**
 * 泛型函数
 * @param value 任意类型的值
 * @returns 输入值
 */
function identity<T>(value: T): T {
  return value;
}

// 使用方式
const stringResult = identity<string>("Hello");
const numberResult = identity(42); // 类型推断

/**
 * 泛型接口
 */
interface GenericResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 使用泛型接口
const userResponse: GenericResponse<User> = {
  data: { id: 1, name: "王五", createdAt: new Date() },
  status: 200,
  message: "成功"
};

/**
 * 泛型类
 */
class GenericBox<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}

const box = new GenericBox<string>("TypeScript");
```

### 泛型约束

```typescript
/**
 * 使用 extends 关键字约束泛型类型
 */
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): T {
  console.log(`长度: ${value.length}`);
  return value;
}

// 有效调用
logLength("Hello");
logLength([1, 2, 3]);
logLength({ length: 10, value: "test" });

// 无效调用 (会产生编译错误)
// logLength(123);
```

### 泛型工具类型

```typescript
/**
 * 常用的内置泛型工具类型
 */

// 部分类型
interface Product {
  id: number;
  name: string;
  price: number;
  inventory: number;
}

// 创建更新对象时，所有字段都是可选的
type UpdateProductDTO = Partial<Product>;

// 所有字段都必填
type RequiredProduct = Required<Product>;

// 所有字段都只读
type ReadonlyProduct = Readonly<Product>;

// 从类型中选取部分属性
type ProductSummary = Pick<Product, "id" | "name" | "price">;

// 从类型中排除部分属性
type ProductPublicInfo = Omit<Product, "inventory">;

// 提取属性的类型
type ProductId = Product["id"]; // number

// 记录类型
type ProductFlags = Record<keyof Product, boolean>;
```

## 高级类型

### 联合与交叉类型

```typescript
// 联合类型：可以是多种类型之一
type Status = "pending" | "fulfilled" | "rejected";
type ID = string | number;

// 交叉类型：同时满足多个类型
type DraggableElement = HTMLElement & {
  isDragging: boolean;
  dragStart: () => void;
  dragEnd: () => void;
};
```

### 条件类型

```typescript
/**
 * 使用条件类型进行类型判断
 */
type IsArray<T> = T extends any[] ? true : false;

type CheckString = IsArray<string>; // false
type CheckArray = IsArray<number[]>; // true

/**
 * 提取返回值类型
 */
type ReturnTypeOf<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

function fetchData(): Promise<User[]> {
  return Promise.resolve([]);
}

type FetchResult = ReturnTypeOf<typeof fetchData>; // Promise<User[]>
```

### 映射类型

```typescript
/**
 * 映射类型：根据现有类型创建新类型
 */

// 将所有属性变为可选
type Optional<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性变为只读
type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将特定属性变为可为空
type Nullable<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

// 应用映射类型
type OptionalUser = Optional<User>;
type NullableUserContact = Nullable<User, "email" | "phone">;
```

### 字面量类型与模板字面量

```typescript
// 字面量类型
type Direction = "north" | "south" | "east" | "west";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// 数字字面量类型
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

// 布尔字面量类型
type TypedBoolean = true | false;

// 模板字面量类型
type EventName<T extends string> = `${T}Changed`;
type UserEvents = EventName<"user" | "admin">; // "userChanged" | "adminChanged"

// HTTP 端点模板
type HttpEndpoint = `/${string}`;
type ApiRoute = `/api/${string}`;
```

## 类型断言与类型守卫

### 类型断言

```typescript
// 使用 as 语法
const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;

// 尖括号语法（不推荐，与 JSX 冲突）
const ctx = (<HTMLCanvasElement>canvas).getContext("2d");

// 非空断言操作符
function processValue(value: string | null) {
  // 断言 value 不为 null
  const length = value!.length;
}
```

### 类型守卫

```typescript
/**
 * 使用类型谓词
 */
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // 此处 value 被视为 string 类型
    console.log(value.toUpperCase());
  }
}

/**
 * 使用 instanceof 守卫
 */
class Bird {
  fly() {
    console.log("鸟在飞");
  }
}

class Fish {
  swim() {
    console.log("鱼在游");
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly(); // 类型细化为 Bird
  } else {
    animal.swim(); // 类型细化为 Fish
  }
}

/**
 * 使用 in 操作符
 */
interface Admin {
  id: number;
  role: string;
}

interface User {
  id: number;
  email: string;
}

function checkAccess(person: Admin | User) {
  if ("role" in person) {
    // person 是 Admin
    console.log(`管理员角色: ${person.role}`);
  } else {
    // person 是 User
    console.log(`用户邮箱: ${person.email}`);
  }
}
```

## 声明文件

### 全局声明

```typescript
// global.d.ts

/**
 * 为全局对象添加属性
 */
declare global {
  interface Window {
    appConfig: {
      apiUrl: string;
      version: string;
    };
  }
}

// 扩展第三方库
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      username: string;
    };
  }
}

// 向全局添加类型
declare type UUID = string;

// 全局函数
declare function formatCurrency(value: number): string;
```

### 模块声明

```typescript
// for-untyped-lib.d.ts

/**
 * 为无类型的库提供类型
 */
declare module 'untyped-lib' {
  export function helper(input: string): string;
  
  export interface Options {
    timeout: number;
    retries: number;
  }
  
  export default function main(options?: Options): Promise<void>;
}
```

### 通配符模块声明

```typescript
/**
 * 为资源文件提供类型
 */
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}
```

## 类型设计最佳实践

### 类型命名约定

```typescript
// 接口名称：名词或形容词+名词
interface UserProfile {}
interface ReadonlyData {}

// 类型别名：名词或形容词+名词
type Point = { x: number; y: number };
type Callback = (err: Error | null, data: any) => void;

// 枚举：单数名词
enum Color { Red, Green, Blue }
enum HttpStatus { OK = 200, NotFound = 404 }

// 类型参数：单个大写字母或有意义的名称
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

// 复杂泛型参数使用 TPascalCase 格式
interface Repository<TEntity, TQuery> {}
```

### 避免类型冗余

```typescript
// ❌ 不推荐
const numbers: number[] = [1, 2, 3];
const result: string = "hello";

// ✅ 推荐（利用类型推断）
const numbers = [1, 2, 3];
const result = "hello";

// ❌ 不推荐
function add(a: number, b: number): number {
  return a + b;
}

// ✅ 推荐（返回类型通常可以推断）
function add(a: number, b: number) {
  return a + b;
}

// 但在复杂情况下，显式指定类型可提高可读性
function complexLogic(input: string): ProcessResult {
  // ...复杂逻辑
  return result;
}
```

### 构建有意义的类型层次

```typescript
// 从通用到具体的类型层次
interface Entity {
  id: string | number;
  createdAt: Date;
  updatedAt: Date;
}

interface Person extends Entity {
  name: string;
  email: string;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
  salary: number;
}

interface Manager extends Employee {
  managedTeams: string[];
  budget: number;
}

// 使用组合而非继承来构建复杂类型
type Identity = {
  id: string;
  username: string;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type Preferences = {
  theme: "light" | "dark";
  notifications: boolean;
};

// 使用交叉类型组合
type User = Identity & ContactInfo & Preferences;
```

### 严格的空值处理

```typescript
/**
 * 避免使用 any
 * 使用 unknown 代替 any 作为未知类型
 */

// ❌ 不推荐
function processData(data: any) {
  data.doSomething(); // 不安全，绕过类型检查
}

// ✅ 推荐
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "doSomething" in data) {
    (data as { doSomething: () => void }).doSomething();
  }
}

/**
 * 空值处理
 */
interface User {
  id: number;
  name: string;
  email: string | null; // 明确表示可能为空
}

function sendEmail(email: string) {
  // 实现发送邮件逻辑
}

function notifyUser(user: User) {
  // 空值检查
  if (user.email) {
    sendEmail(user.email); // 类型已细化为 string
  }
}
```

### API 响应类型

```typescript
/**
 * API 响应类型设计模式
 */

// 基础响应类型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: number;
}

// 分页响应
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 错误响应
interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: number;
}

// 使用类型别名区分成功和错误
type Result<T> = ApiResponse<T> | ErrorResponse;

// 使用函数确保类型正确
function handleApiResponse<T>(response: Result<T>): T | null {
  if ('data' in response) {
    return response.data;
  }
  console.error(response.message);
  return null;
}
```

## 高级技巧和模式

### 类型安全的事件系统

```typescript
/**
 * 类型安全的事件系统
 */
type EventMap = {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; timestamp: number };
  'item:added': { itemId: string; quantity: number };
  'payment:completed': { orderId: string; amount: number };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: ((data: T[K]) => void)[] } = {};

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
    return this;
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    this.listeners[event]?.forEach(callback => callback(data));
  }
}

// 使用类型安全的事件系统
const events = new TypedEventEmitter<EventMap>();

events.on('user:login', ({ userId, timestamp }) => {
  console.log(`用户 ${userId} 在 ${new Date(timestamp)} 登录`);
});

events.emit('user:login', { 
  userId: 'user123', 
  timestamp: Date.now() 
});
```

### 状态机类型

```typescript
/**
 * 状态机类型设计
 */
type OrderStatus = 
  | { status: 'pending'; createdAt: Date }
  | { status: 'processing'; startedAt: Date }
  | { status: 'shipped'; shippedAt: Date; trackingId: string }
  | { status: 'delivered'; deliveredAt: Date; recipientName: string }
  | { status: 'cancelled'; cancelledAt: Date; reason: string };

// 状态转换函数
function startProcessing(order: Extract<OrderStatus, { status: 'pending' }>): 
    Extract<OrderStatus, { status: 'processing' }> {
  return {
    status: 'processing',
    startedAt: new Date()
  };
}

function shipOrder(
  order: Extract<OrderStatus, { status: 'processing' }>,
  trackingId: string
): Extract<OrderStatus, { status: 'shipped' }> {
  return {
    status: 'shipped',
    shippedAt: new Date(),
    trackingId
  };
}
```

### 可组合的高阶类型

```typescript
/**
 * 可组合的高阶类型
 */

// 基础变换类型
type NonNullable<T> = T extends null | undefined ? never : T;
type Flatten<T> = T extends Array<infer U> ? U : T;

// 组合多个变换
type Process<T> = NonNullable<Flatten<T>>;

const data: (string[] | null)[] = [["a", "b"], null, ["c"]];
type ProcessedItem = Process<typeof data[0]>; // string

/**
 * 函数式类型工具
 */
// 链式类型变换
type Pipeline<T, Transforms extends ((arg: any) => any)[]> = 
  Transforms extends [infer First, ...infer Rest]
    ? First extends (arg: any) => any
      ? Rest extends ((arg: any) => any)[]
        ? Pipeline<ReturnType<First>, Rest>
        : ReturnType<First>
      : never
    : T;

// 使用示例
type StringToNumber = (input: string) => number;
type NumberToBoolean = (input: number) => boolean;

type TransformResult = Pipeline<string, [StringToNumber, NumberToBoolean]>; // boolean
```

### 运行时类型检查

```typescript
/**
 * 使用 zod 库进行运行时类型验证
 * npm install zod
 */
import { z } from 'zod';

// 定义验证模式
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['user', 'admin', 'editor']),
  settings: z.object({
    newsletter: z.boolean(),
    theme: z.enum(['light', 'dark']).default('light')
  })
});

// 提取类型
type User = z.infer<typeof UserSchema>;

// 运行时类型验证
function processUserData(data: unknown): User {
  // 验证并转换数据
  const user = UserSchema.parse(data);
  return user;
}

// 使用安全的数据
try {
  const validatedUser = processUserData({
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "张三",
    email: "zhangsan@example.com",
    role: "user",
    settings: { newsletter: true }
  });
  console.log(validatedUser);
} catch (error) {
  console.error("数据验证失败:", error);
}
```

## 类型定义查错与调试

### 类型诊断

```typescript
// 使用 typeof 调试类型
const complexObject = {
  data: {
    users: [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" }
    ],
    meta: {
      total: 2,
      page: 1
    }
  },
  status: "success"
};

// 提取类型用于检查
type ComplexObjectType = typeof complexObject;
type DataType = typeof complexObject.data;
type UserType = typeof complexObject.data.users[0];

// 使用工具类型分析复杂类型
type KeysOfUser = keyof UserType; // "id" | "name"

// 使用条件类型排查问题
type IsAssignable<T, U> = T extends U ? true : false;

type Check1 = IsAssignable<string, any>; // true
type Check2 = IsAssignable<any, string>; // true
type Check3 = IsAssignable<unknown, string>; // false
type Check4 = IsAssignable<string, unknown>; // true
```

### 严格性检查

```typescript
/**
 * 类型严格性检查工具
 */
type Exact<T, Shape> = T extends Shape
  ? Shape extends T
    ? T
    : never
  : never;

// 使用示例
interface Expected {
  name: string;
  age: number;
}

// 缺少字段会导致类型错误
const obj1: Exact<{ name: string }, Expected> = { name: "张三" }; // 错误

// 额外字段也会导致类型错误
const obj2: Exact<{ name: string, age: number, extra: boolean }, Expected> = {
  name: "张三",
  age: 30,
  extra: true
}; // 错误

// 完全匹配才可以
const obj3: Exact<Expected, Expected> = { name: "张三", age: 30 }; // 正确
```

## 总结

TypeScript 类型系统非常强大，合理使用类型定义可以显著提高代码的可维护性和可靠性。关键实践包括：

1. 优先使用接口定义对象结构，使用类型别名定义联合类型和工具类型
2. 利用泛型创建可复用的类型组件
3. 使用类型断言和类型守卫安全地处理类型转换
4. 构建有意义的类型层次，遵循命名约定
5. 尽可能避免使用 `any` 类型，优先使用 `unknown`
6. 处理好可能为空的值，使用严格的空值检查
7. 利用高级类型如映射类型、条件类型解决复杂场景
8. 考虑使用运行时类型验证保证数据安全

持续学习和实践 TypeScript 类型系统能让你编写更加健壮和可维护的代码。 