# TypeScript 配置指南

## 概述

本指南详细说明 TypeScript 项目中 `tsconfig.json` 文件的常用配置项，帮助开发团队理解各个选项的作用并选择适合项目的配置。

## 基础配置示例

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## 核心配置详解

### 编译目标与模块系统

#### `target`

指定编译后的 JavaScript 版本。

```json
"target": "ES2020"
```

常用选项：
- `ES5`：适用于支持旧浏览器
- `ES6`/`ES2015`：现代浏览器的基础支持
- `ES2020`/`ES2021`：使用最新的语言特性

#### `module`

指定生成的模块代码。

```json
"module": "ESNext"
```

常用选项：
- `CommonJS`：Node.js 环境（默认）
- `ESNext`/`ES2020`：现代浏览器和打包工具
- `UMD`：兼容多种模块系统
- `AMD`：RequireJS 等

#### `lib`

指定编译过程中需要包含的库文件。

```json
"lib": ["DOM", "DOM.Iterable", "ESNext"]
```

常用库：
- `DOM`：浏览器 DOM API
- `ESNext`：最新 ECMAScript 特性
- `WebWorker`：Web Worker API
- `ScriptHost`：Windows Script Host API

### 类型检查选项

#### `strict`

启用所有严格类型检查选项，推荐开启。

```json
"strict": true
```

包含以下选项：
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

#### `noImplicitAny`

禁止隐式的 `any` 类型，提高代码类型安全性。

```json
"noImplicitAny": true
```

#### `strictNullChecks`

更严格地检查 `null` 和 `undefined`，避免空值引起的错误。

```json
"strictNullChecks": true
```

#### `noUnusedLocals` 和 `noUnusedParameters`

检查未使用的局部变量和参数。

```json
"noUnusedLocals": true,
"noUnusedParameters": true
```

### 模块解析

#### `moduleResolution`

指定模块解析策略。

```json
"moduleResolution": "node"
```

常用选项：
- `node`：使用 Node.js 的模块解析算法（推荐）
- `classic`：TypeScript 早期的解析算法

#### `baseUrl` 和 `paths`

配置模块导入路径别名，简化导入语句。

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"],
  "#components/*": ["src/components/*"]
}
```

使用示例：

```typescript
// 使用别名导入
import { Button } from '@/components/Button';
import { userData } from '@/store/user';
```

#### `esModuleInterop`

允许使用 ES 模块语法导入 CommonJS 模块，提高兼容性。

```json
"esModuleInterop": true
```

#### `allowSyntheticDefaultImports`

允许从没有默认导出的模块中导入默认值。

```json
"allowSyntheticDefaultImports": true
```

### 输出配置

#### `outDir`

指定编译输出目录。

```json
"outDir": "dist"
```

#### `declaration`

生成 `.d.ts` 声明文件，用于类型共享。

```json
"declaration": true
```

#### `declarationDir`

指定声明文件的输出目录。

```json
"declarationDir": "types"
```

#### `sourceMap`

生成 sourcemap 文件，便于调试。

```json
"sourceMap": true
```

#### `removeComments`

编译时移除注释，减小输出文件体积。

```json
"removeComments": true
```

### JSX 配置

#### `jsx`

指定 JSX 代码的编译方式。

```json
"jsx": "react-jsx"
```

常用选项：
- `react`：将 JSX 转换为 `React.createElement` 调用
- `react-jsx`：React 17+ 的新 JSX 转换
- `preserve`：保留 JSX 语法，由其他工具处理
- `react-native`：保留 JSX 语法

### 装饰器支持

#### `experimentalDecorators`

启用 TypeScript 的装饰器语法支持。

```json
"experimentalDecorators": true
```

#### `emitDecoratorMetadata`

为装饰器生成元数据，供运行时使用（通常用于依赖注入框架如 NestJS）。

```json
"emitDecoratorMetadata": true
```

### 高级选项

#### `skipLibCheck`

跳过声明文件的类型检查，提高编译速度。

```json
"skipLibCheck": true
```

#### `forceConsistentCasingInFileNames`

确保文件名大小写一致，避免在不同操作系统间的问题。

```json
"forceConsistentCasingInFileNames": true
```

#### `resolveJsonModule`

允许导入 JSON 文件作为模块。

```json
"resolveJsonModule": true
```

#### `isolatedModules`

确保每个文件都可以单独编译，适用于 Babel 等工具。

```json
"isolatedModules": true
```

## 项目配置

### `include` 和 `exclude`

指定要包含和排除的文件目录。

```json
"include": ["src/**/*"],
"exclude": ["node_modules", "dist", "**/*.test.ts"]
```

### `files`

明确指定要编译的文件列表，通常用于较小的项目。

```json
"files": [
  "src/index.ts",
  "src/app.ts"
]
```

### `extends`

从其他配置文件继承设置，适用于共享配置。

```json
"extends": "./tsconfig.base.json"
```

## 不同环境的配置示例

### 前端 React 项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
```

### Node.js 后端项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 库或组件包

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["DOM", "ESNext"],
    "declaration": true,
    "declarationDir": "types",
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.stories.tsx"]
}
```

## 配置迁移指南

### 从 JavaScript 迁移到 TypeScript

初始配置应尽量宽松，随后逐步收紧：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "outDir": "dist",
    "strict": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 升级 TypeScript 版本

1. 查看迁移指南：[TypeScript 迁移手册](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
2. 更新 `tsconfig.json` 配置，适应新版本的变化
3. 逐步解决类型错误和废弃警告

## 性能优化

### 提高编译速度

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./buildcache/info.json",
    "skipLibCheck": true
  }
}
```

### 使用项目引用

对于大型单体仓库（monorepo）：

```json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./packages/common" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ]
}
```

## 常见问题与解决方案

### 无法找到模块

检查以下配置：
- `moduleResolution`
- `baseUrl`
- `paths`
- 确保 `include` 包含相关文件

### 第三方库类型问题

- 安装对应的 `@types/*` 包
- 使用 `skipLibCheck: true` 减少类型检查冲突
- 创建自定义声明文件（`*.d.ts`）

### 严格模式报错过多

逐步开启严格检查：
1. 先设置 `"strict": false`
2. 逐个开启 `noImplicitAny`、`strictNullChecks` 等
3. 解决问题后再设置 `"strict": true`

## 最佳实践

1. **保持一致性**：在项目或团队内使用统一的 `tsconfig.json` 配置
2. **按环境分离**：根据不同环境（开发、生产、测试）使用不同的配置文件
3. **使用 extends**：将共享配置提取到基础文件中，其他配置继承它
4. **定期更新**：随着 TypeScript 版本更新，定期检查和优化配置
5. **配置文档化**：在团队 wiki 或项目文档中说明特殊配置的原因和用途 