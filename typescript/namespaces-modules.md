# TypeScript 命名空间与模块

组织和管理代码是大型应用程序开发中的关键挑战。TypeScript提供了命名空间和模块两种机制来组织和分享代码。本文将详细介绍它们的概念、使用方法和最佳实践。

## 命名空间（Namespaces）

命名空间是TypeScript特有的代码组织形式，它可以将代码分组并防止全局命名冲突。

### 基本语法

使用`namespace`关键字定义命名空间：

```typescript
namespace Validation {
  // 在命名空间内部定义接口
  export interface StringValidator {
    isValid(s: string): boolean;
  }
  
  // 未导出的内容在命名空间外部不可见
  const numberRegexp = /^[0-9]+$/;
  
  // 导出的类可以在命名空间外部使用
  export class ZipCodeValidator implements StringValidator {
    isValid(s: string): boolean {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

// 使用命名空间中的类
let validator = new Validation.ZipCodeValidator();
let result = validator.isValid("12345");
```

### 嵌套命名空间

命名空间可以嵌套：

```typescript
namespace Utils {
  export namespace Math {
    export function add(a: number, b: number): number {
      return a + b;
    }
    
    export function subtract(a: number, b: number): number {
      return a - b;
    }
  }
  
  export namespace String {
    export function padLeft(value: string, padding: number): string {
      return " ".repeat(padding) + value;
    }
  }
}

// 使用嵌套命名空间
console.log(Utils.Math.add(1, 2));  // 3
console.log(Utils.String.padLeft("Hello", 4));  // "    Hello"
```

### 命名空间别名

可以为命名空间或其成员创建别名：

```typescript
namespace Shapes {
  export namespace Polygons {
    export class Triangle {
      // ...
    }
    
    export class Square {
      // ...
    }
  }
}

// 创建别名简化长命名空间访问
import polygons = Shapes.Polygons;
let square = new polygons.Square();
```

### 分割命名空间

命名空间可以跨多个文件分割，使用引用标签将它们连接起来：

```typescript
// validator.ts
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
  }
}

// zip-code-validator.ts
/// <reference path="validator.ts" />
namespace Validation {
  const numberRegexp = /^[0-9]+$/;
  
  export class ZipCodeValidator implements StringValidator {
    isValid(s: string): boolean {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

// email-validator.ts
/// <reference path="validator.ts" />
namespace Validation {
  const emailRegexp = /^[^@]+@[^@]+\.[^@]+$/;
  
  export class EmailValidator implements StringValidator {
    isValid(s: string): boolean {
      return emailRegexp.test(s);
    }
  }
}

// main.ts
/// <reference path="zip-code-validator.ts" />
/// <reference path="email-validator.ts" />

// 使用扩展后的Validation命名空间
let zipValidator = new Validation.ZipCodeValidator();
let emailValidator = new Validation.EmailValidator();
```

要编译使用引用标签的分割命名空间，可以使用`--outFile`选项将所有输入文件连接到一个输出文件：

```bash
tsc --outFile main.js main.ts
```

## 模块（Modules）

TypeScript采用了ES模块标准，使用`import`和`export`关键字进行模块化开发。

### 导出（Export）

可以导出声明、变量、函数、类等：

```typescript
// 导出声明
export interface StringValidator {
  isValid(s: string): boolean;
}

// 导出变量
export const PI = 3.14159;

// 导出函数
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 导出类
export class ZipCodeValidator implements StringValidator {
  isValid(s: string): boolean {
    return /^[0-9]+$/.test(s) && s.length === 5;
  }
}

// 导出重命名
function sum(x: number, y: number): number {
  return x + y;
}
export { sum as add };

// 默认导出
export default class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
```

### 导入（Import）

导入模块的方式有多种：

```typescript
// 导入整个模块的内容
import * as validators from "./validators";

// 导入特定导出
import { StringValidator, ZipCodeValidator } from "./validators";

// 导入并重命名
import { ZipCodeValidator as ZCV } from "./validators";

// 导入默认导出
import Calculator from "./calculator";

// 导入默认导出和命名导出
import Calculator, { PI, capitalize } from "./calculator";

// 副作用导入（只执行模块代码，不导入任何内容）
import "./polyfills";
```

### 动态导入

TypeScript支持动态导入表达式：

```typescript
async function loadModule() {
  // 动态导入，返回Promise
  const validators = await import("./validators");
  
  // 使用动态导入的模块
  const validator = new validators.ZipCodeValidator();
  return validator.isValid("12345");
}

loadModule().then(result => {
  console.log(result);  // true 或 false
});
```

### 模块解析

TypeScript有两种模块解析策略：

1. **Classic**: TypeScript以前的默认解析策略
2. **Node**: 模仿Node.js的模块解析机制

使用`--moduleResolution`标志设置模块解析策略：

```bash
tsc --moduleResolution node app.ts
```

在`tsconfig.json`中配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

现代TypeScript项目通常使用Node策略，因为它与npm生态系统兼容。

### 路径映射

在`tsconfig.json`中，可以使用路径映射来简化导入路径：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/core/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

使用路径映射的导入示例：

```typescript
// 而不是 import { User } from "../../core/models/user"
import { User } from "@core/models/user";
```

## 命名空间与模块的比较

### 命名空间

**优点**:
- 不需要构建工具即可使用
- 可以在单个文件中组织结构
- 适合小型应用程序或脚本

**缺点**:
- 难以管理依赖关系
- 不支持异步加载
- 不是JavaScript的标准机制
- 需要全局引用命名空间中的对象

### 模块

**优点**:
- 符合ECMAScript标准
- 清晰的依赖关系
- 支持构建工具和打包优化
- 支持异步加载
- 更好的封装性

**缺点**:
- 需要构建工具来处理模块导入/导出
- 配置可能较复杂

## 混合使用命名空间和模块

在某些情况下，可以混合使用命名空间和模块：

```typescript
// shapes.ts
export namespace Shapes {
  export class Circle {
    constructor(public radius: number) {}
    
    area(): number {
      return Math.PI * this.radius ** 2;
    }
  }
  
  export class Square {
    constructor(public sideLength: number) {}
    
    area(): number {
      return this.sideLength ** 2;
    }
  }
}

// app.ts
import { Shapes } from "./shapes";

const circle = new Shapes.Circle(5);
console.log(circle.area());  // 约 78.54
```

然而，在现代TypeScript应用程序中，建议使用模块而不是命名空间，因为模块是JavaScript的标准机制。

## 模块组织最佳实践

以下是TypeScript模块组织的一些最佳实践：

### 1. 导出接口，隐藏实现细节

```typescript
// user-service.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserService {
  getUser(id: number): Promise<User>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

// 实现细节不导出
class UserServiceImpl implements UserService {
  // 实现...
}

// 只导出工厂函数和接口
export function createUserService(): UserService {
  return new UserServiceImpl();
}
```

### 2. 使用桶（barrel）文件简化导入

创建索引文件（通常命名为`index.ts`）来重新导出其他文件的导出：

```typescript
// models/index.ts
export * from "./user";
export * from "./product";
export * from "./order";

// services/index.ts
export * from "./user-service";
export * from "./auth-service";
export * from "./product-service";
```

使用桶文件简化导入：

```typescript
// 而不是多行导入
// import { User } from "./models/user";
// import { Product } from "./models/product";
// import { Order } from "./models/order";

// 使用一行导入全部模型
import { User, Product, Order } from "./models";
```

### 3. 按功能而不是按类型组织模块

推荐的模块组织方式是按功能或特性领域组织，而不是按类型：

```
src/
  features/
    user/
      components/
      services/
      models/
      hooks/
      user.routes.ts
      index.ts
    product/
      components/
      services/
      models/
      hooks/
      product.routes.ts
      index.ts
  shared/
    components/
    utils/
    hooks/
```

### 4. 保持模块小而专注

每个模块应该有单一职责，并且大小适中：

```typescript
// 不好的做法：一个大型模块包含多个不相关的功能
export function formatDate() { /* ... */ }
export function calculateTax() { /* ... */ }
export function encryptPassword() { /* ... */ }

// 好的做法：分成小而专注的模块
// date-utils.ts
export function formatDate() { /* ... */ }
export function parseDate() { /* ... */ }

// tax-utils.ts
export function calculateTax() { /* ... */ }
export function applyDiscount() { /* ... */ }

// security-utils.ts
export function encryptPassword() { /* ... */ }
export function validatePassword() { /* ... */ }
```

## 示例：完整的模块化应用程序

以下是一个简单的模块化应用程序示例，展示了如何组织TypeScript模块：

### 1. 定义模型

```typescript
// src/models/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// src/models/index.ts
export * from './user';
```

### 2. 创建服务

```typescript
// src/services/api-client.ts
export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
}

// src/services/user-service.ts
import { User } from '../models';
import { ApiClient } from './api-client';

export class UserService {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  async getUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>('/users');
  }
  
  async getUserById(id: number): Promise<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }
  
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.apiClient.post<User>('/users', user);
  }
}

// src/services/index.ts
export * from './api-client';
export * from './user-service';
```

### 3. 创建工具函数

```typescript
// src/utils/date-utils.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// src/utils/index.ts
export * from './date-utils';
```

### 4. 创建应用入口

```typescript
// src/index.ts
import { User } from './models';
import { ApiClient, UserService } from './services';
import { formatDate } from './utils';

async function main() {
  const apiClient = new ApiClient('https://api.example.com');
  const userService = new UserService(apiClient);
  
  try {
    // 获取用户列表
    const users = await userService.getUsers();
    console.log('Users:', users);
    
    // 创建新用户
    const newUser = await userService.createUser({
      name: 'Alice Smith',
      email: 'alice@example.com'
    });
    console.log('New user created:', newUser);
    
    // 格式化日期
    const today = formatDate(new Date());
    console.log('Today:', today);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

这个简单的例子展示了如何使用模块组织TypeScript应用程序，包括接口定义、服务实现、工具函数和应用入口。

## 总结

TypeScript提供了两种组织代码的主要机制：

1. **命名空间**：传统的TypeScript特有机制，适用于小型应用和脚本
2. **模块**：基于ES模块标准，是现代JavaScript/TypeScript应用的推荐方式

在现代应用程序开发中，模块是首选的代码组织方式，因为它符合JavaScript标准，并且与现代构建工具和开发工作流程集成得更好。

命名空间仍然在某些场景中有用，特别是在不使用模块加载器的环境中，但在新项目中通常应该首选模块系统。 