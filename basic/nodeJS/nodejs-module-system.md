---
layout: doc
title: Node.js模块系统详解
description: 全面解析Node.js模块加载机制、CommonJS与ESM规范、模块缓存与最佳实践，助你高效组织后端代码。
---

# Node.js模块系统详解

模块系统是Node.js实现代码复用、解耦与维护的基础。本文将系统讲解Node.js模块加载机制、CommonJS与ESM规范、模块缓存与最佳实践。

## 目录

- [模块系统概述](#模块系统概述)
- [CommonJS模块机制](#commonjs模块机制)
- [ESM（ES Modules）支持](#esm-es-modules-支持)
- [模块加载与缓存原理](#模块加载与缓存原理)
- [模块导出与导入用法](#模块导出与导入用法)
- [实战建议与最佳实践](#实战建议与最佳实践)

## 模块系统概述

Node.js支持两种主流模块系统：

- **CommonJS**：Node.js原生模块系统，使用`require()`和`module.exports`
- **ES Modules (ESM)**：ECMAScript标准模块系统，使用`import`和`export`

模块化的好处：

1. 代码组织更清晰
2. 便于代码复用
3. 明确依赖关系
4. 封装内部实现
5. 避免全局命名冲突

## CommonJS模块机制

### 基本用法

```js
// math.js
function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }
module.exports = { add, sub };

// app.js
const math = require('./math');
console.log(math.add(1, 2)); // 3
```

### 特点

- 每个文件就是一个模块
- `require()`加载模块，`module.exports`导出内容
- 模块作用域独立，变量不会污染全局
- 模块首次加载后会被缓存

### 导出方式

- 导出对象：`module.exports = { ... }`
- 导出函数/类：`module.exports = function() {}` 或 `module.exports = class {}`

### exports别名

```js
// helpers.js
exports.hello = () => 'hello';
// 等价于 module.exports.hello = ...
```
**注意**：不能直接`exports = {}`，否则会断开与`module.exports`的引用。

## ESM（ES Modules）支持

### 启用方式

- 文件扩展名为`.mjs`
- 或`package.json`设置`"type": "module"`

### 基本用法

```js
// math.mjs
export function add(a, b) { return a + b; }
export default function (x) { return x * x; }

// app.mjs
import square, { add } from './math.mjs';
console.log(add(1, 2)); // 3
console.log(square(3)); // 9
```

### 特点

- 静态结构，支持Tree Shaking
- 支持异步动态导入：`import('./module.js')`
- 导入的是"活绑定"，值会实时更新
- 总是严格模式

## 模块加载与缓存原理

### CommonJS加载流程

1. 解析模块路径
2. 检查缓存
3. 读取并执行模块代码
4. 缓存模块导出对象

### ESM加载流程

1. 解析依赖关系（静态分析）
2. 实例化模块（分配内存空间）
3. 执行模块代码（填充值）

### 缓存机制

- CommonJS：`require()`多次只执行一次，返回同一对象
- ESM：同一模块只加载一次，导出为活绑定

## 实战建议与最佳实践

### 1. 高内聚低耦合

每个模块只做一件事，依赖尽量少。

```js
// user-validator.js
function validateUsername(name) { /* ... */ }
function validatePassword(pwd) { /* ... */ }
module.exports = { validateUsername, validatePassword };
```

### 2. 清晰的接口设计

```js
// database.js
async function findOne(sql, params) { /* ... */ }
async function findMany(sql, params) { /* ... */ }
module.exports = { findOne, findMany };
```

### 3. 错误处理统一

```js
class ApiError extends Error { /* ... */ }
async function request(endpoint, options) { /* ... */ }
module.exports = { request, ApiError };
```

### 4. 可测试性

- 依赖注入
- Mock外部依赖

### 5. 性能优化

- 懒加载大模块
- 频繁用的模块预加载
- 避免循环依赖

### 6. 安全与配置

- 配置用环境变量，不要硬编码敏感信息
- 输入严格校验

### 7. 发布npm包建议

- 提供CommonJS和ESM双格式
- 遵循语义化版本
- 文档清晰

## 参考资料

- [Node.js官方模块文档](https://nodejs.org/api/modules.html)
- [ECMAScript Modules in Node.js](https://nodejs.org/api/esm.html)

如需更详细的某一部分内容或代码示例，请随时告知！

---

> 参考资料：[Node.js模块官方文档](https://nodejs.org/api/modules.html)