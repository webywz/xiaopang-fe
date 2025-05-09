# TypeScript 测试策略指南

## 目录

- [测试类型](#测试类型)
- [测试工具](#测试工具)
- [测试配置](#测试配置)
- [测试实践](#测试实践)
- [类型测试](#类型测试)
- [测试组织](#测试组织)
- [测试自动化](#测试自动化)
- [最佳实践](#最佳实践)

## 测试类型 {#测试类型}

### 单元测试

针对独立代码单元的测试，通常是函数、方法或小型类。

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// sum.test.ts
import { sum } from './sum';

describe('sum function', () => {
  it('adds two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });
});
```

### 集成测试

测试多个组件或模块之间的交互。

```typescript
// userService.test.ts
import { UserService } from './userService';
import { UserRepository } from './userRepository';

describe('UserService with real UserRepository', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);
  });

  it('creates and retrieves a user', async () => {
    const userId = await userService.createUser({ name: '张三', email: 'zhangsan@example.com' });
    const user = await userService.getUserById(userId);
    
    expect(user).toBeDefined();
    expect(user?.name).toBe('张三');
    expect(user?.email).toBe('zhangsan@example.com');
  });
});
```

### 端到端测试

模拟真实用户场景，测试整个应用流程。

```typescript
// 使用 Playwright 进行 E2E 测试
import { test, expect } from '@playwright/test';

test('user can login and view dashboard', async ({ page }) => {
  // 访问登录页面
  await page.goto('http://localhost:3000/login');
  
  // 填写登录表单
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 验证登录成功并重定向到仪表板
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(page.locator('h1')).toContainText('欢迎回来');
});
```

## 测试工具 {#测试工具}

### Jest

最受欢迎的 JavaScript 测试框架，内置丰富功能。

#### 安装与配置

```bash
npm install --save-dev jest ts-jest @types/jest
```

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
```

### Vitest

新兴的快速单元测试框架，与 Vite 无缝集成。

#### 安装与配置

```bash
npm install --save-dev vitest
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  }
});
```

### Cypress

用于现代 Web 应用程序的端到端测试框架。

#### 安装与配置

```bash
npm install --save-dev cypress
```

```typescript
// cypress/tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts"]
}
```

### Testing Library

注重用户交互的测试工具。

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## 测试配置 {#测试配置}

### TypeScript 测试配置

通常需要创建专门的 `tsconfig.test.json`：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "types": ["jest", "node"]
  },
  "include": ["src/**/*.test.ts", "src/**/*.spec.ts", "tests/**/*.ts"]
}
```

### 代码覆盖率

使用 Jest 或 Vitest 内置的覆盖率工具：

```json
// Jest 配置
{
  "jest": {
    "collectCoverage": true,
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.test.{ts,tsx}"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 测试实践 {#测试实践}

### 测试 API 服务

使用 `msw` (Mock Service Worker) 模拟 API 响应：

```typescript
// src/mocks/server.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
      ])
    );
  })
);

// 在测试中使用
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 测试 React 组件

使用 React Testing Library：

```typescript
// UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';

test('renders user list correctly', async () => {
  render(<UserList />);
  
  // 验证加载状态
  expect(screen.getByText('加载中...')).toBeInTheDocument();
  
  // 等待数据加载完成
  await waitFor(() => {
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });
});
```

### 测试异步代码

#### Promise 测试

```typescript
// userService.test.ts
test('fetchUser returns user data', async () => {
  const user = await userService.fetchUser(1);
  expect(user).toEqual({
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com'
  });
});
```

#### 异步错误处理测试

```typescript
test('fetchUser throws error for invalid id', async () => {
  await expect(userService.fetchUser(-1)).rejects.toThrow('Invalid user ID');
});
```

### 测试依赖注入

使用 mock 或 stub 替代真实依赖：

```typescript
// 使用 Jest 的模拟函数
test('notifyUser calls email service with correct data', () => {
  // 创建模拟邮件服务
  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(true)
  };
  
  const notificationService = new NotificationService(mockEmailService);
  
  // 执行被测试方法
  notificationService.notifyUser({
    userId: 1,
    message: '您的账户已激活'
  });
  
  // 验证模拟函数的调用
  expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.any(String),
      subject: expect.stringContaining('激活'),
      body: expect.stringContaining('账户已激活')
    })
  );
});
```

## 类型测试 {#类型测试}

### 使用 dtslint 测试类型定义

安装 dtslint：

```bash
npm install --save-dev dtslint
```

创建类型测试：

```typescript
// types.d.ts
export type Exact<T, U> = 
  T extends U ? U extends T ? T : never : never;

// types-test.ts
import { Exact } from './types';

// $ExpectType true
type Test1 = Exact<{ a: string }, { a: string }> extends never ? false : true;

// $ExpectType false
type Test2 = Exact<{ a: string }, { a: string, b: number }> extends never ? false : true;
```

### 使用条件类型测试

创建类型断言辅助工具：

```typescript
// 类型测试辅助函数和类型
type AssertTrue<T extends true> = T;
type AssertFalse<T extends false> = T;
type IsExact<T, U> = 
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? true : false;

// 运用于实际类型测试
type PersonDTO = {
  name: string;
  age: number;
};

type PersonModel = {
  name: string;
  age: number;
  id: string;
};

type Test1 = AssertFalse<IsExact<PersonDTO, PersonModel>>;
```

## 测试组织 {#测试组织}

### 文件结构

使用一致的命名和位置组织测试文件：

```
src/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx   # 组件旁边放测试
│   └── [...]
├── services/
│   ├── userService.ts
│   ├── userService.test.ts
│   └── [...]
└── tests/                # 特殊或大型测试
    ├── integration/
    │   └── userFlow.test.ts
    ├── e2e/
    │   └── authenticatedUser.test.ts
    └── helpers/
        └── testUtils.ts
```

### 测试夹具

创建可重用的测试数据和实用程序：

```typescript
// tests/fixtures/users.ts
export const testUsers = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: 'user' }
];

// tests/fixtures/testDatabase.ts
export class TestDatabase {
  async setup() {
    // 设置临时数据库
  }
  
  async teardown() {
    // 清理资源
  }
  
  async seed(data: any) {
    // 填充测试数据
  }
}
```

### 测试上下文共享

对于需要共享上下文的测试用例：

```typescript
// 使用 Jest 的 beforeAll
let testContext: { server: any; database: any; };

beforeAll(async () => {
  const server = await startTestServer();
  const database = new TestDatabase();
  await database.setup();
  
  testContext = { server, database };
});

afterAll(async () => {
  await testContext.database.teardown();
  await testContext.server.stop();
});

test('user API endpoint returns correct data', async () => {
  const response = await fetch(`${testContext.server.url}/api/users`);
  const data = await response.json();
  expect(data).toHaveLength(2);
});
```

## 测试自动化 {#测试自动化}

### CI/CD 集成

配置 GitHub Actions 进行自动测试：

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Run type checks
      run: npm run type-check
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

### 预提交钩子

使用 husky 和 lint-staged 确保测试通过：

```json
// package.json
{
  "scripts": {
    "test:staged": "jest --bail --findRelatedTests"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm run test:staged"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

## 最佳实践 {#最佳实践}

### 测试金字塔

遵循测试金字塔原则：
- 底层：大量单元测试
- 中层：中等数量的集成测试
- 顶层：少量端到端测试

### TDD 开发流程

采用测试驱动开发流程：
1. 编写失败的测试
2. 实现最小化的功能代码使测试通过
3. 重构代码，保持测试通过

### 独立且可重复的测试

确保测试之间互不干扰：

```typescript
// 不要在测试间共享可变状态
let sharedState; // ❌ 不推荐

// 每个测试创建自己的状态
test('example test 1', () => {
  const state = createInitialState(); // ✅ 推荐
  // 使用 state 进行测试
});

test('example test 2', () => {
  const state = createInitialState(); // 每个测试有自己的状态
  // 使用 state 进行测试
});
```

### 测试行为而非实现

关注组件的公共行为，而不是内部实现细节：

```typescript
// ❌ 不推荐：测试实现细节
test('_processData method formats data correctly', () => {
  const service = new DataService();
  // @ts-ignore - 访问私有方法
  const result = service._processData(rawData);
  expect(result).toEqual(expectedData);
});

// ✅ 推荐：测试公共行为
test('getData returns formatted data', async () => {
  const service = new DataService();
  const result = await service.getData();
  expect(result).toMatchObject({
    formattedData: expect.any(Array),
    timestamp: expect.any(Number)
  });
});
```

### 可维护性和可读性

编写清晰、自我描述的测试：

```typescript
// ❌ 不推荐
test('test1', () => {
  const x = new C();
  x.m();
  expect(x.v).toBe(1);
});

// ✅ 推荐
test('Counter increments value when increment method is called', () => {
  // 安排 (Arrange)
  const counter = new Counter();
  
  // 执行 (Act)
  counter.increment();
  
  // 断言 (Assert)
  expect(counter.value).toBe(1);
});
```

### 测试覆盖率与质量

优先考虑测试质量而非仅追求高覆盖率：

- 优先测试核心功能和边界条件
- 为错误处理路径编写测试
- 关注测试的可读性和可维护性

### 性能优化测试

对于性能关键部分，添加性能测试：

```typescript
// 使用 Jest 的 timer 模拟测试性能
test('data processing completes within time limit', () => {
  jest.useFakeTimers();
  
  const startTime = performance.now();
  dataProcessor.processLargeDataset(testData);
  const endTime = performance.now();
  
  const executionTime = endTime - startTime;
  expect(executionTime).toBeLessThan(100); // 执行时间不超过100ms
});
```

### 可观察性与测试监控

监控测试质量和性能：

- 集成测试覆盖率报告工具
- 实施测试性能监控
- 跟踪测试失败率和修复时间

## 总结

有效的 TypeScript 测试策略结合了不同类型的测试，选择合适的工具，并遵循良好的实践。通过自动化测试流程，可以提高代码质量，减少错误，并增强团队信心。

测试不仅是为了捕获错误，更是设计良好软件的工具。高质量的测试使代码更可维护，更具弹性，并支持团队持续快速交付。 