# TypeScript 工具类型

TypeScript内置了许多实用的工具类型，可以帮助我们进行常见的类型转换。这些工具类型使用TypeScript的类型系统特性（泛型、条件类型、映射类型等）实现，能够简化类型编写并提高代码可维护性。本文将详细介绍TypeScript的主要工具类型及其使用场景。

## 部分工具类型

### `Partial<T>`

将类型T的所有属性设为可选。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 使所有属性变为可选
type PartialUser = Partial<User>;
// 等同于:
// type PartialUser = {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
// }

// 用于更新操作，只需提供要更新的字段
function updateUser(userId: number, updates: Partial<User>): Promise<User> {
  // 实现...
  return Promise.resolve({} as User);
}

// 只更新名称
updateUser(1, { name: "新名称" });
```

### `Required<T>`

将类型T的所有可选属性设为必需。

```typescript
interface Config {
  host?: string;
  port?: number;
  secure?: boolean;
}

// 使所有属性变为必需
type RequiredConfig = Required<Config>;
// 等同于:
// type RequiredConfig = {
//   host: string;
//   port: number;
//   secure: boolean;
// }

// 确保提供完整配置
function initServer(config: RequiredConfig): void {
  // 安全地访问所有属性，无需检查undefined
  console.log(`Server starting at ${config.host}:${config.port}`);
}
```

### `Readonly<T>`

将类型T的所有属性设为只读。

```typescript
interface Point {
  x: number;
  y: number;
}

// 使所有属性变为只读
type ReadonlyPoint = Readonly<Point>;
// 等同于:
// type ReadonlyPoint = {
//   readonly x: number;
//   readonly y: number;
// }

// 不可变对象
const origin: ReadonlyPoint = { x: 0, y: 0 };
// origin.x = 10; // 错误: 无法分配到'x'，因为它是只读属性

// 用于确保对象不被修改
function calculateDistance(p1: ReadonlyPoint, p2: ReadonlyPoint): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
```

### `Record<K, T>`

构造一个类型，其属性名为K，属性值为T。

```typescript
type UserRoles = Record<string, string[]>;
// 等同于: { [key: string]: string[] }

const roles: UserRoles = {
  admin: ["manage_users", "manage_content"],
  editor: ["edit_content"],
  viewer: ["view_content"]
};

// 使用字面量联合类型作为键
type Theme = "light" | "dark" | "system";
type ColorScheme = {
  primary: string;
  secondary: string;
  text: string;
};

// 各主题的颜色方案
type ThemeConfig = Record<Theme, ColorScheme>;

const themeConfig: ThemeConfig = {
  light: {
    primary: "#007bff",
    secondary: "#6c757d",
    text: "#212529"
  },
  dark: {
    primary: "#375a7f",
    secondary: "#444",
    text: "#fff"
  },
  system: {
    primary: "#007bff",
    secondary: "#6c757d",
    text: "#212529"
  }
};
```

## 选择工具类型

### `Pick<T, K>`

从类型T中选择属性K。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// 只保留id和name属性
type UserSummary = Pick<User, "id" | "name">;
// 等同于:
// type UserSummary = {
//   id: number;
//   name: string;
// }

// 用于API响应处理，只选择需要的字段
function getUsersList(): UserSummary[] {
  // 实现...
  return [];
}
```

### `Omit<T, K>`

从类型T中排除属性K。

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// 排除自动生成的字段
type NewProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;
// 等同于:
// type NewProduct = {
//   name: string;
//   price: number;
//   description: string;
// }

// 用于创建新记录，不包含自动生成的字段
function createProduct(product: NewProduct): Product {
  // 实现...
  return {} as Product;
}
```

### `Exclude<T, U>`

从类型T中排除可赋值给U的类型。

```typescript
type Status = "pending" | "approved" | "rejected";

// 排除"rejected"状态
type ActiveStatus = Exclude<Status, "rejected">;
// 结果: "pending" | "approved"

// 更复杂的例子
type NumericOrString = number | string | boolean | object;
type PrimitiveTypes = Exclude<NumericOrString, object>;
// 结果: number | string | boolean
```

### `Extract<T, U>`

从类型T中提取可赋值给U的类型。

```typescript
type Status = "pending" | "approved" | "rejected" | "draft";

// 提取表示完成的状态
type FinalStatus = Extract<Status, "approved" | "rejected">;
// 结果: "approved" | "rejected"

// 更复杂的例子
type ResponseData = 
  | { status: 200; data: any }
  | { status: 404; error: string }
  | { status: 500; error: string };

type ErrorResponse = Extract<ResponseData, { error: string }>;
// 结果: { status: 404; error: string } | { status: 500; error: string }
```

## 非空工具类型

### `NonNullable<T>`

从类型T中排除`null`和`undefined`。

```typescript
type MaybeString = string | null | undefined;

// 排除null和undefined
type DefinitelyString = NonNullable<MaybeString>;
// 结果: string

// 实际应用
function processValue<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("值不能为null或undefined");
  }
  return value as NonNullable<T>;
}

const value: string | null = "hello";
const processedValue = processValue(value); // 类型为string
```

## 函数工具类型

### `Parameters<T>`

获取函数类型T的参数类型组成的元组。

```typescript
// 函数类型
type FetchUserFn = (id: number, includeDetails: boolean) => Promise<User>;

// 获取参数类型
type FetchUserParams = Parameters<FetchUserFn>;
// 结果: [number, boolean]

// 实际应用：参数代理
function logFunctionCall<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  console.log(`调用函数，参数:`, args);
  const result = fn(...args);
  console.log(`函数返回:`, result);
  return result;
}

// 使用函数
function add(a: number, b: number): number {
  return a + b;
}

const result = logFunctionCall(add, 5, 3);
// 输出:
// 调用函数，参数: [5, 3]
// 函数返回: 8
```

### `ReturnType<T>`

获取函数类型T的返回类型。

```typescript
// 函数类型
function createUser(name: string, email: string) {
  return {
    id: Date.now(),
    name,
    email,
    createdAt: new Date()
  };
}

// 获取返回类型
type User = ReturnType<typeof createUser>;
// 结果: 
// {
//   id: number;
//   name: string;
//   email: string;
//   createdAt: Date;
// }

// 实际应用：存储函数结果
function cacheResult<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 使用缓存函数
const cachedCreateUser = cacheResult(createUser);
const user1 = cachedCreateUser("Alice", "alice@example.com");
// 第二次调用会返回缓存结果
const user2 = cachedCreateUser("Alice", "alice@example.com");
```

### `ConstructorParameters<T>`

获取构造函数类型T的参数类型组成的元组。

```typescript
class User {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// 获取构造函数参数类型
type UserConstructorParams = ConstructorParameters<typeof User>;
// 结果: [string, number]

// 实际应用：工厂函数
function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args);
}

// 使用工厂函数
const user = createInstance(User, "Alice", 30);
```

### `InstanceType<T>`

获取构造函数类型T的实例类型。

```typescript
class API {
  baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  get(endpoint: string): Promise<any> {
    return fetch(`${this.baseUrl}${endpoint}`).then(r => r.json());
  }
}

// 获取实例类型
type APIInstance = InstanceType<typeof API>;

// 实际应用：依赖注入容器
class Container {
  private services = new Map<string, any>();
  
  register<T extends new (...args: any[]) => any>(
    id: string,
    ctor: T,
    ...args: ConstructorParameters<T>
  ): void {
    const instance = new ctor(...args);
    this.services.set(id, instance);
  }
  
  get<T>(id: string): T {
    if (!this.services.has(id)) {
      throw new Error(`Service '${id}' not found`);
    }
    return this.services.get(id) as T;
  }
}

// 使用容器
const container = new Container();
container.register("api", API, "https://api.example.com");

// 获取服务，类型安全
const api = container.get<APIInstance>("api");
api.get("/users");
```

## 字符串工具类型

### `Uppercase<S>`

将字符串字面量类型转换为大写。

```typescript
type Event = "click" | "focus" | "blur";

// 转换为大写
type UppercaseEvent = Uppercase<Event>;
// 结果: "CLICK" | "FOCUS" | "BLUR"

// 实际应用：命名约定
type HTTPMethod = "get" | "post" | "put" | "delete";

type HTTPHeader = `X-${Uppercase<HTTPMethod>}-Method`;
// 结果: "X-GET-Method" | "X-POST-Method" | "X-PUT-Method" | "X-DELETE-Method"
```

### `Lowercase<S>`

将字符串字面量类型转换为小写。

```typescript
type Direction = "NORTH" | "SOUTH" | "EAST" | "WEST";

// 转换为小写
type LowercaseDirection = Lowercase<Direction>;
// 结果: "north" | "south" | "east" | "west"

// 实际应用：URL构建
function createEndpoint<T extends string>(resource: T): Lowercase<T> {
  return resource.toLowerCase() as Lowercase<T>;
}

const userEndpoint = createEndpoint("USER");
// 类型为"user"
```

### `Capitalize<S>`

将字符串字面量类型的首字母转换为大写。

```typescript
type Status = "pending" | "active" | "completed";

// 首字母大写
type CapitalizedStatus = Capitalize<Status>;
// 结果: "Pending" | "Active" | "Completed"

// 实际应用：创建方法名
type EntityName = "user" | "product" | "order";

type GetEntityMethod = `get${Capitalize<EntityName>}`;
// 结果: "getUser" | "getProduct" | "getOrder"

type EntityMethods<T extends string> = {
  [K in `get${Capitalize<T>}` | `create${Capitalize<T>}` | `update${Capitalize<T>}` | `delete${Capitalize<T>}`]: () => void;
};

type UserMethods = EntityMethods<"user">;
// 结果: {
//   getUser: () => void;
//   createUser: () => void;
//   updateUser: () => void;
//   deleteUser: () => void;
// }
```

### `Uncapitalize<S>`

将字符串字面量类型的首字母转换为小写。

```typescript
type ClassName = "User" | "Product" | "ShoppingCart";

// 首字母小写
type PropertyName = Uncapitalize<ClassName>;
// 结果: "user" | "product" | "shoppingCart"

// 实际应用：创建属性名
type ReactComponent = "Button" | "Input" | "Select";

type PropName<T extends string> = `${Uncapitalize<T>}Props`;
// 例如：PropName<"Button"> 结果为 "buttonProps"

type ComponentPropsMap = {
  [K in ReactComponent as PropName<K>]: any;
};
// 结果: {
//   buttonProps: any;
//   inputProps: any;
//   selectProps: any;
// }
```

## 自定义工具类型

除了内置工具类型，我们还可以创建自定义工具类型：

### `DeepPartial<T>`

递归地将所有属性变为可选，包括嵌套对象。

```typescript
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
      key: string;
    };
  };
  database: {
    url: string;
    username: string;
    password: string;
  };
  features: {
    cache: boolean;
    notification: boolean;
  };
}

// 部分配置，包括嵌套对象
function updateConfig(config: DeepPartial<AppConfig>): void {
  // 实现...
}

// 可以只更新嵌套属性
updateConfig({
  server: {
    ssl: {
      enabled: true
    }
  }
});
```

### `PickByType<T, U>`

从类型T中选择类型为U的属性。

```typescript
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  posts: number[];
  createdAt: Date;
}

// 选择所有字符串类型的属性
type UserStringProps = PickByType<User, string>;
// 结果: { name: string; email: string; }

// 实际应用：选择特定类型的表单字段
interface FormField {
  name: string;
  label: string;
  value: string | number | boolean | Date;
  type: "text" | "number" | "checkbox" | "date";
  required: boolean;
  disabled: boolean;
}

type TextFormFields = PickByType<FormField, string | "text">;
```

### `OmitByType<T, U>`

从类型T中排除类型为U的属性。

```typescript
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  posts: number[];
  createdAt: Date;
}

// 排除所有布尔类型的属性
type UserNonBooleanProps = OmitByType<User, boolean>;
// 结果: { id: number; name: string; email: string; posts: number[]; createdAt: Date; }

// 实际应用：过滤不需要序列化的字段
type SerializableProps<T> = OmitByType<T, Function | Date>;
```

### `Mutable<T>`

将类型T的所有只读属性变为可写。

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

// 移除readonly修饰符
type MutableUser = Mutable<ReadonlyUser>;
// 结果: {
//   id: number;
//   name: string;
//   email: string;
// }

// 实际应用：在编辑状态下修改只读对象
function getEditableUser(user: ReadonlyUser): MutableUser {
  return { ...user };
}
```

### `Nullable<T>`

将类型T的所有属性变为可能为null。

```typescript
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  id: number;
  name: string;
  email: string;
}

// 所有属性都可能为null
type NullableUser = Nullable<User>;
// 结果: {
//   id: number | null;
//   name: string | null;
//   email: string | null;
// }

// 实际应用：表示表单初始状态
const initialForm: NullableUser = {
  id: null,
  name: null,
  email: null
};
```

## 实际应用示例

### 表单处理

```typescript
// 表单字段定义
interface FormFields {
  name: string;
  email: string;
  age: number;
  newsletter: boolean;
}

// 表单状态类型
interface FormState<T> {
  values: T;
  touched: Partial<Record<keyof T, boolean>>;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// 表单操作类型
type FormActions<T> = {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setTouched: <K extends keyof T>(field: K, isTouched: boolean) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  reset: () => void;
  submit: () => Promise<void>;
};

// 自定义Hook返回类型
type UseForm<T> = [FormState<T>, FormActions<T>];

// 初始化表单状态
function initFormState<T>(initialValues: T): FormState<T> {
  return {
    values: initialValues,
    touched: {},
    errors: {},
    isValid: false,
    isSubmitting: false
  };
}

// 使用示例
function createUserForm() {
  const initialValues: FormFields = {
    name: "",
    email: "",
    age: 0,
    newsletter: false
  };
  
  const [formState, formActions] = useForm(initialValues);
  
  // 使用表单状态和操作...
  return { formState, formActions };
}
```

### API类型定义

```typescript
// API响应类型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 错误响应类型
interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// API方法类型
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置类型
interface RequestConfig<T = any> {
  method: ApiMethod;
  url: string;
  data?: T;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

// API客户端类型
interface ApiClient {
  request<TResponse, TRequest = void>(
    config: RequestConfig<TRequest>
  ): Promise<ApiResponse<TResponse>>;
  
  get<TResponse>(
    url: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<TResponse>>;
  
  post<TResponse, TRequest>(
    url: string,
    data: TRequest
  ): Promise<ApiResponse<TResponse>>;
  
  put<TResponse, TRequest>(
    url: string,
    data: TRequest
  ): Promise<ApiResponse<TResponse>>;
  
  delete<TResponse>(
    url: string
  ): Promise<ApiResponse<TResponse>>;
}

// API端点定义
interface Endpoints {
  '/users': {
    GET: {
      response: User[];
      params?: { role?: string };
    };
    POST: {
      request: Omit<User, 'id'>;
      response: User;
    };
  };
  '/users/:id': {
    GET: {
      response: User;
      params: { id: string };
    };
    PUT: {
      request: Partial<User>;
      response: User;
      params: { id: string };
    };
    DELETE: {
      response: void;
      params: { id: string };
    };
  };
}

// 类型安全的API请求函数
function apiRequest<
  Path extends keyof Endpoints,
  Method extends keyof Endpoints[Path],
  Config extends Endpoints[Path][Method]
>(
  path: Path,
  method: Method,
  config?: {
    params?: Config extends { params: infer P } ? P : never;
    data?: Config extends { request: infer R } ? R : never;
  }
): Promise<
  Config extends { response: infer Res } ? ApiResponse<Res> : never
> {
  // 实现略
  return Promise.resolve({} as any);
}

// 使用示例
async function fetchUsers() {
  // 类型安全的API请求
  const response = await apiRequest('/users', 'GET');
  return response.data; // 类型为User[]
}

async function createUser(userData: Omit<User, 'id'>) {
  const response = await apiRequest('/users', 'POST', { data: userData });
  return response.data; // 类型为User
}
```

TypeScript的工具类型为我们提供了一种强大的方式来操作和转换类型，使代码更加灵活和类型安全。掌握这些工具类型及其背后的原理，可以帮助你编写更加精确和可维护的TypeScript代码。 