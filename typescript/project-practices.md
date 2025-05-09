# TypeScript 项目实践指南

## 目录

1. [项目结构](#项目结构)
2. [配置最佳实践](#配置最佳实践)
3. [代码组织](#代码组织)
4. [类型设计模式](#类型设计模式)
5. [团队协作规范](#团队协作规范)
6. [版本控制与分支策略](#版本控制与分支策略)
7. [文档生成](#文档生成)
8. [代码质量工具](#代码质量工具)
9. [依赖管理](#依赖管理)
10. [项目模板与脚手架](#项目模板与脚手架)

## 项目结构

### 推荐的目录结构

```
project-root/
├── src/                  # 源代码
│   ├── api/              # API 请求和接口
│   ├── components/       # UI 组件
│   ├── config/           # 配置文件
│   ├── hooks/            # 自定义钩子
│   ├── models/           # 数据模型和类型定义
│   ├── pages/            # 页面组件
│   ├── services/         # 业务逻辑服务
│   ├── styles/           # 全局样式
│   ├── types/            # 全局类型定义
│   └── utils/            # 工具函数
├── public/               # 静态资源
├── tests/                # 测试文件
│   ├── unit/             # 单元测试
│   ├── integration/      # 集成测试
│   └── e2e/              # 端到端测试
├── docs/                 # 文档
├── scripts/              # 构建和部署脚本
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 依赖和脚本
└── README.md             # 项目说明
```

### 命名约定

- **文件名**：使用 kebab-case（例如 `user-profile.ts`）或根据框架约定
- **类**：使用 PascalCase（例如 `UserProfile`）
- **接口**：使用 PascalCase，不要添加 `I` 前缀（例如 `UserData` 而非 `IUserData`）
- **类型**：使用 PascalCase（例如 `UserState`）
- **函数/方法**：使用 camelCase（例如 `getUserData`）
- **常量**：使用 UPPER_SNAKE_CASE（例如 `API_URL`）
- **变量**：使用 camelCase（例如 `userData`）

## 配置最佳实践

### tsconfig.json 推荐配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "sourceMap": true,
    "declaration": true,
    "incremental": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 关键配置选项说明

- **strict**: 启用所有严格类型检查选项
- **noImplicitAny**: 禁止隐式的 `any` 类型
- **strictNullChecks**: 使 `null` 和 `undefined` 有自己的类型
- **noUnusedLocals/noUnusedParameters**: 检查未使用的变量和参数
- **paths**: 配置模块导入路径别名，提高可读性
- **incremental**: 启用增量编译，提高构建速度

## 代码组织

### 模块化原则

- 按功能或领域组织代码，而不是按类型
- 保持模块小而专注，遵循单一职责原则
- 使用桶（barrel）导出简化导入语句

```typescript
// 在 models/index.ts 中创建桶导出
export * from './user.model';
export * from './product.model';
export * from './order.model';

// 在其他文件中使用
import { User, Product, Order } from '@/models';
```

### 类型定义管理

- 与实现代码放在同一文件，除非是跨模块共享
- 全局类型放在 `src/types` 目录
- 针对第三方库的类型放在 `src/types/vendor` 目录

### 导入排序规范

```typescript
// 1. 第三方库导入
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 绝对路径导入（内部模块）
import { AuthService } from '@/services/auth';
import { User } from '@/models';

// 3. 相对路径导入
import { ProfileForm } from './components/ProfileForm';
import { useAuth } from './hooks/useAuth';

// 4. 类型导入
import type { ProfileProps } from './types';

// 5. 资源导入
import './styles.css';
```

## 类型设计模式

### 组合优于继承

```typescript
// 不推荐
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
}

// 推荐
interface Animal {
  name: string;
  age: number;
}

interface Dog {
  animal: Animal;
  breed: string;
}

// 或使用交叉类型
type Dog = Animal & {
  breed: string;
};
```

### 使用泛型提高复用性

```typescript
// 通用列表组件
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
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
<List items={users} renderItem={user => user.name} />;
```

### 区分模型类型和业务逻辑

```typescript
// 数据模型
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// 特定用例的DTO
interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// API响应
interface UserResponse {
  user: User;
  token: string;
}
```

### 使用类型守卫

```typescript
interface Admin {
  id: number;
  name: string;
  permissions: string[];
  role: 'admin';
}

interface Customer {
  id: number;
  name: string;
  purchases: number;
  role: 'customer';
}

type User = Admin | Customer;

function isAdmin(user: User): user is Admin {
  return user.role === 'admin';
}

function processUser(user: User) {
  if (isAdmin(user)) {
    // TypeScript 知道这里 user 是 Admin 类型
    console.log(user.permissions);
  } else {
    // TypeScript 知道这里 user 是 Customer 类型
    console.log(user.purchases);
  }
}
```

## 团队协作规范

### 代码审查清单

- 类型定义是否准确和完整
- 是否避免使用 `any` 类型
- 是否处理了所有可能的 `null` 和 `undefined` 值
- 变量和函数命名是否清晰而有意义
- 代码是否遵循项目架构和设计模式
- 是否添加了适当的注释和文档

### TypeScript 风格指南

- 优先使用接口定义对象结构
- 使用类型别名定义联合类型和交叉类型
- 使用枚举表示一组固定选项
- 明确函数返回类型
- 使用只读属性表示不可变数据

### 代码注释规范

使用 JSDoc 注释格式：

```typescript
/**
 * 用户服务类，处理用户相关的业务逻辑
 */
class UserService {
  /**
   * 根据ID获取用户信息
   * @param userId - 用户唯一标识符
   * @returns 用户信息对象，如果未找到则返回null
   * @throws {ApiError} 当API请求失败时抛出
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await api.get(`/users/${userId}`);
    } catch (error) {
      throw new ApiError('获取用户信息失败', error);
    }
  }
}
```

## 版本控制与分支策略

### 推荐的 Git 工作流

- `main`/`master`: 稳定的生产代码
- `develop`: 开发中的代码，已通过测试
- `feature/*`: 新功能开发
- `bugfix/*`: 修复非生产环境的 bug
- `hotfix/*`: 紧急修复生产环境的 bug
- `release/*`: 准备发布的版本

### 提交消息规范

遵循 Conventional Commits 规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格调整，不影响功能
- `refactor`: 重构代码，既不修复 bug 也不添加新功能
- `perf`: 性能优化
- `test`: 添加或修改测试
- `build`: 影响构建系统或外部依赖的更改
- `ci`: 对 CI 配置文件和脚本的更改

示例：
```
feat(auth): 实现谷歌登录功能

添加了谷歌OAuth认证流程，允许用户使用谷歌账号登录。

Closes #123
```

## 文档生成

### TypeDoc 配置

使用 TypeDoc 自动从源代码生成 API 文档：

```json
// typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "theme": "default"
}
```

### README 模板

每个项目应包含包含以下部分的 README.md：

- 项目简介
- 安装指南
- 使用示例
- 可用脚本
- 项目结构
- 技术栈
- 贡献指南
- 许可证

## 代码质量工具

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'react/prop-types': 'off' // 因为使用 TypeScript，不需要 prop-types
  }
};
```

### Prettier 配置

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

### 预提交钩子

使用 husky 和 lint-staged 设置预提交检查：

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## 依赖管理

### 依赖分类

- **dependencies**: 生产环境依赖
- **devDependencies**: 开发工具、测试框架等
- **peerDependencies**: 宿主环境中预期提供的依赖
- **optionalDependencies**: 非必要的依赖

### 版本锁定

- 使用 `package-lock.json` 或 `yarn.lock` 锁定版本
- 考虑使用 `~` 和 `^` 前缀定义版本范围

### 依赖更新策略

- 定期审查并更新依赖
- 使用 `npm-check-updates` 或 `yarn upgrade-interactive` 检查更新
- 重要库更新后进行全面测试

## 项目模板与脚手架

### 常用项目模板

- Create React App + TypeScript
- Next.js + TypeScript
- Vue CLI + TypeScript
- Vite + TypeScript
- NestJS (内置 TypeScript 支持)

### 自定义项目模板

创建符合团队需求的项目模板，包含：

- 预配置的 TypeScript 设置
- 常用的库和工具
- 目录结构
- 代码风格配置
- CI/CD 配置模板
- 文档模板

### 创建脚手架工具

使用 Yeoman 或类似工具创建自定义项目生成器：

```javascript
// 使用 Yeoman 创建项目生成器
npm install -g yo generator-generator
yo generator
```

这样可以标准化项目创建流程，确保所有新项目遵循团队最佳实践。 