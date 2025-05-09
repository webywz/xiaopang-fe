# TypeScript 高级类型

TypeScript的类型系统非常强大，除了基本类型和泛型外，它还提供了许多高级类型特性，使我们能够更精确地建模复杂的数据结构和逻辑关系。本文将详细介绍这些高级类型特性。

## 交叉类型（Intersection Types）

交叉类型使用 `&` 运算符将多个类型合并成一个类型，新类型将具有所有类型的特性。

```typescript
interface BusinessPartner {
  name: string;
  credit: number;
}

interface Identity {
  id: number;
  email: string;
}

interface Contact {
  phone: string;
  address: string;
}

// 交叉类型
type Employee = Identity & Contact;
type Customer = BusinessPartner & Contact;

// 使用交叉类型
const employee: Employee = {
  id: 1,
  email: "john@example.com",
  phone: "123-456-7890",
  address: "123 Main St"
};

const customer: Customer = {
  name: "Acme Inc",
  credit: 10000,
  phone: "098-765-4321",
  address: "456 Market St"
};
```

交叉类型在实现混入（mixins）或扩展现有类型时特别有用。

## 联合类型（Union Types）

联合类型使用 `|` 运算符表示一个值可以是多种类型之一。

```typescript
// 基本联合类型
type StringOrNumber = string | number;

function formatInput(input: StringOrNumber): string {
  if (typeof input === "string") {
    return input.trim();
  }
  return input.toString();
}

formatInput("hello");  // 返回 "hello"
formatInput(42);       // 返回 "42"

// 联合类型的对象
type Shape = Circle | Rectangle | Triangle;

interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}

const circle: Circle = { kind: "circle", radius: 5 };
console.log(calculateArea(circle));  // 约 78.54
```

## 类型别名（Type Aliases）

类型别名使用 `type` 关键字为类型提供另一个名称，可以用来简化复杂的类型定义。

```typescript
// 简单类型别名
type UserID = string;
type Coordinates = [number, number];

// 联合类型别名
type Status = "pending" | "approved" | "rejected";

// 对象类型别名
type User = {
  id: UserID;
  name: string;
  status: Status;
  location?: Coordinates;
};

// 函数类型别名
type Callback = (error: Error | null, data: any) => void;
type Processor<T> = (items: T[]) => T[];

// 递归类型别名
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

const tree: TreeNode<string> = {
  value: "root",
  children: [
    { value: "child1" },
    { 
      value: "child2",
      children: [
        { value: "grandchild1" },
        { value: "grandchild2" }
      ]
    }
  ]
};
```

## 字面量类型（Literal Types）

字面量类型表示一个特定的值，而不是一个范围的值。

```typescript
// 字符串字面量类型
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction, steps: number): void {
  console.log(`Moving ${steps} steps ${direction}`);
}

move("north", 10);  // 正确
// move("northeast", 10);  // 错误：类型 '"northeast"' 不能赋给类型 'Direction'

// 数字字面量类型
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

function rollDice(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

// 布尔字面量类型
type YesNo = true | false;

// 对象字面量类型
type Config = {
  readonly mode: "development" | "production";
  port: 80 | 443 | 8080 | 8443;
  caching: YesNo;
};

const serverConfig: Config = {
  mode: "production",
  port: 443,
  caching: true
};
```

## 可辨识联合（Discriminated Unions）

可辨识联合是一种特殊的联合类型，其中每个成员类型都有一个共同的字面量属性，用来区分不同的类型。

```typescript
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "circle":
      return Math.PI * shape.radius ** 2;
    default:
      // 穷尽检查：确保所有可能的类型都被处理
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

使用可辨识联合可以帮助编译器进行穷尽性检查，如果有未处理的联合成员，TypeScript会产生编译错误。

## 类型保护（Type Guards）

类型保护是一种运行时检查，可以帮助TypeScript在特定的代码块中缩小类型范围。

```typescript
// 使用类型谓词
function isString(value: any): value is string {
  return typeof value === "string";
}

function processValue(value: string | number): void {
  if (isString(value)) {
    // 在此块中，TypeScript知道value是字符串
    console.log(value.toUpperCase());
  } else {
    // 在此块中，TypeScript知道value是数字
    console.log(value.toFixed(2));
  }
}

// 使用typeof类型保护
function printValue(value: string | number): void {
  if (typeof value === "string") {
    console.log("String: " + value);
  } else {
    console.log("Number: " + value);
  }
}

// 使用instanceof类型保护
class Bird {
  fly(): void {
    console.log("Flying...");
  }
}

class Fish {
  swim(): void {
    console.log("Swimming...");
  }
}

function move(animal: Bird | Fish): void {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// 使用in操作符类型保护
interface Developer {
  name: string;
  language: string;
}

interface Designer {
  name: string;
  tool: string;
}

function describe(person: Developer | Designer): void {
  if ("language" in person) {
    console.log(`${person.name} uses ${person.language}`);
  } else {
    console.log(`${person.name} uses ${person.tool}`);
  }
}
```

## 索引类型（Index Types）

索引类型允许TypeScript检查使用动态属性名的代码。

```typescript
// 索引类型查询操作符 keyof
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserKey = keyof User;  // "id" | "name" | "email" | "age"

// 索引访问操作符 T[K]
type UserIdType = User["id"];  // number
type UserNameOrEmail = User["name" | "email"];  // string

// 一个使用索引类型的函数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  age: 30
};

const userName = getProperty(user, "name");  // 返回 "John"
// const invalid = getProperty(user, "phone");  // 错误：'phone'不是'id' | 'name' | 'email' | 'age'
```

## 映射类型（Mapped Types）

映射类型基于旧类型创建新类型，通过遍历旧类型的所有属性并以某种方式转换它们。

```typescript
// 基本映射类型
interface Person {
  name: string;
  age: number;
  email: string;
}

// 将所有属性变为可选
type PartialPerson = {
  [K in keyof Person]?: Person[K];
};

// 将所有属性变为只读
type ReadonlyPerson = {
  readonly [K in keyof Person]: Person[K];
};

// 使用映射类型
const partialPerson: PartialPerson = { name: "Alice" };  // 不需要提供所有属性
const readonlyPerson: ReadonlyPerson = { name: "Bob", age: 25, email: "bob@example.com" };
// readonlyPerson.age = 26;  // 错误：无法分配到'age'，因为它是只读属性

// 自定义映射类型
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type Proxy<T> = {
  get(): T;
  set(value: T): void;
};

type Proxify<T> = {
  [K in keyof T]: Proxy<T[K]>;
};

// 条件映射类型
type OptionalIfNullable<T> = {
  [K in keyof T]: null extends T[K] ? T[K] | undefined : T[K];
};
```

TypeScript内置了许多实用的映射类型，如 `Partial<T>`, `Required<T>`, `Readonly<T>`, `Record<K, T>` 等。

## 条件类型（Conditional Types）

条件类型根据条件选择不同的类型，类似于三元运算符。

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// 分布式条件类型
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T0 = TypeName<string>;  // "string"
type T1 = TypeName<number[]>;  // "object"
type T2 = TypeName<() => void>;  // "function"
type T3 = TypeName<string | string[]>;  // "string" | "object"

// 条件类型与映射类型结合
type NonNullableProperties<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// 使用infer关键字进行类型推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greeting() { return "hello"; }
type GreetingReturn = ReturnType<typeof greeting>;  // string

// 提取Promise返回类型
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Promise<string>;
type ExtractedString = UnpackPromise<PromiseString>;  // string
```

## 模板字面量类型（Template Literal Types）

模板字面量类型是在TypeScript 4.1中引入的，它们允许基于字符串字面量类型创建新的字符串字面量类型。

```typescript
// 基本模板字面量类型
type Greeting = `Hello, ${string}!`;
let greeting: Greeting = "Hello, TypeScript!";
// let invalid: Greeting = "Hi, TypeScript!";  // 错误：不匹配'Greeting'类型

// 联合类型与模板字面量
type Direction = "north" | "south" | "east" | "west";
type DirectionCommand = `move ${Direction}`;  // "move north" | "move south" | "move east" | "move west"

// 键重映射
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// 等同于:
// type PersonGetters = {
//   getName: () => string;
//   getAge: () => number;
// };

// 模板字面量类型与映射类型结合
type RemovePrefix<S extends string, Prefix extends string> = 
  S extends `${Prefix}${infer Rest}` ? Rest : S;

type T0 = RemovePrefix<"prefix_value", "prefix_">;  // "value"
type T1 = RemovePrefix<"other_value", "prefix_">;   // "other_value"
```

## 实用类型工具（Utility Types）

TypeScript内置了许多实用的类型转换工具，以下是一些最常用的：

```typescript
// Partial<T> - 将所有属性变为可选
interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(id: number, updates: Partial<User>): void {
  // 实现略
}

updateUser(1, { name: "New Name" });  // 只更新部分字段

// Required<T> - 将所有属性变为必需
type PartialUser = Partial<User>;
type CompleteUser = Required<PartialUser>;  // 所有字段都是必需的

// Readonly<T> - 将所有属性变为只读
type ReadonlyUser = Readonly<User>;

// Record<K, T> - 创建具有指定键类型K和值类型T的对象类型
type UserRoles = Record<string, string[]>;

// Pick<T, K> - 从类型T中选择属性K
type UserBasicInfo = Pick<User, "id" | "name">;

// Omit<T, K> - 从类型T中排除属性K
type UserWithoutEmail = Omit<User, "email">;

// Exclude<T, U> - 从类型T中排除可以赋值给类型U的所有类型
type T0 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"
type T1 = Exclude<string | number | boolean, boolean>;  // string | number

// Extract<T, U> - 从类型T中提取可以赋值给类型U的所有类型
type T2 = Extract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"
type T3 = Extract<string | number | boolean, boolean>;  // boolean

// NonNullable<T> - 从类型T中排除null和undefined
type T4 = NonNullable<string | null | undefined>;  // string

// ReturnType<T> - 获取函数类型T的返回类型
type T5 = ReturnType<() => string>;  // string
type T6 = ReturnType<(x: number) => number[]>;  // number[]

// Parameters<T> - 获取函数类型T的参数类型组成的元组
type T7 = Parameters<(a: string, b: number) => void>;  // [string, number]

// ConstructorParameters<T> - 获取构造函数类型T的参数类型组成的元组
class Person {
  constructor(name: string, age: number) {}
}
type T8 = ConstructorParameters<typeof Person>;  // [string, number]

// InstanceType<T> - 获取构造函数类型T的实例类型
type T9 = InstanceType<typeof Person>;  // Person
```

## 实际应用示例

### 类型安全的事件系统

```typescript
// 事件类型定义
interface UserEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string; timestamp: number };
  purchase: { userId: string; productId: string; amount: number };
}

// 事件处理器类型
type EventHandler<T> = (payload: T) => void;

// 事件系统
class EventBus {
  private handlers: Partial<{
    [K in keyof UserEvents]: EventHandler<UserEvents[K]>[]
  }> = {};

  // 添加事件监听器
  on<K extends keyof UserEvents>(
    eventName: K, 
    handler: EventHandler<UserEvents[K]>
  ): void {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    
    this.handlers[eventName]!.push(handler);
  }

  // 触发事件
  emit<K extends keyof UserEvents>(
    eventName: K, 
    payload: UserEvents[K]
  ): void {
    const handlers = this.handlers[eventName] || [];
    handlers.forEach(handler => handler(payload));
  }
}

// 使用事件系统
const eventBus = new EventBus();

// 添加事件监听器
eventBus.on("login", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${new Date(timestamp).toISOString()}`);
});

eventBus.on("purchase", ({ userId, productId, amount }) => {
  console.log(`User ${userId} purchased ${productId} for $${amount}`);
});

// 触发事件
eventBus.emit("login", { 
  userId: "user123", 
  timestamp: Date.now() 
});

eventBus.emit("purchase", { 
  userId: "user123", 
  productId: "product456", 
  amount: 99.99 
});

// 类型检查能确保事件名称和负载类型匹配
// eventBus.emit("login", { userId: "user123" });  // 错误：缺少'timestamp'属性
// eventBus.emit("unknown", {});  // 错误：类型'"unknown"'不能赋给类型'keyof UserEvents'
```

### 类型安全的API客户端

```typescript
// API端点定义
interface ApiEndpoints {
  "/users": {
    get: {
      response: User[];
      params: { role?: string };
    };
    post: {
      request: Omit<User, "id">;
      response: User;
    };
  };
  "/users/:id": {
    get: {
      response: User;
      params: { id: string };
    };
    put: {
      request: Partial<User>;
      response: User;
      params: { id: string };
    };
    delete: {
      response: void;
      params: { id: string };
    };
  };
}

// API客户端实现
class ApiClient {
  constructor(private baseUrl: string) {}

  async get<
    Path extends keyof ApiEndpoints,
    Endpoint extends ApiEndpoints[Path],
    Method extends keyof Endpoint,
    Data extends Endpoint[Method & "get"] = Endpoint[Method & "get"]
  >(
    path: Path,
    params: Data["params"]
  ): Promise<Data["response"]> {
    // 构建URL和查询参数
    let url = this.baseUrl + this.buildPath(path, params);
    
    // 发送请求
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async post<
    Path extends keyof ApiEndpoints,
    Endpoint extends ApiEndpoints[Path],
    Method extends keyof Endpoint,
    Data extends Endpoint[Method & "post"] = Endpoint[Method & "post"]
  >(
    path: Path,
    data: Data["request"],
    params?: Data["params"]
  ): Promise<Data["response"]> {
    // 构建URL和查询参数
    let url = this.baseUrl + this.buildPath(path, params);
    
    // 发送请求
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // 构建路径，替换URL参数
  private buildPath(path: string, params?: Record<string, any>): string {
    if (!params) return path;
    
    let result = path;
    
    // 替换路径参数 (例如 :id)
    for (const key in params) {
      if (result.includes(`:${key}`)) {
        result = result.replace(`:${key}`, params[key]);
        delete params[key];
      }
    }
    
    // 添加查询参数
    const queryParams = new URLSearchParams();
    for (const key in params) {
      queryParams.append(key, params[key]);
    }
    
    const queryString = queryParams.toString();
    if (queryString) {
      result += `?${queryString}`;
    }
    
    return result;
  }
}

// 使用API客户端
const apiClient = new ApiClient("https://api.example.com");

async function examples() {
  // 获取所有用户
  const users = await apiClient.get("/users", { role: "admin" });
  
  // 获取单个用户
  const user = await apiClient.get("/users/:id", { id: "123" });
  
  // 创建新用户
  const newUser = await apiClient.post("/users", { 
    name: "Alice", 
    email: "alice@example.com" 
  });
}
```

TypeScript的高级类型系统提供了强大的工具，使我们能够创建类型安全且灵活的应用程序。通过掌握这些高级类型特性，可以大大提高代码的可维护性和稳定性。 