---
title: JavaScript模块化开发历史与实践
description: 梳理JavaScript模块化的发展历程、主流方案与现代实践。
---

# JavaScript模块化开发历史与实践

## 简介

模块化是提升JavaScript代码组织性、可维护性和复用性的关键。随着前端工程化发展，模块化方案不断演进，从最初的全局变量到现代ES模块，极大推动了前端生态进步。

## 关键技术点

- 早期模块化：全局变量、命名空间
- CommonJS规范（Node.js）
- AMD/CMD（浏览器异步模块）
- ES6模块（ESM）与import/export
- 模块打包与Tree Shaking

## 实用案例与代码示例

### 1. 全局变量与命名空间

```js
/**
 * 早期通过命名空间防止全局变量冲突
 */
var MyApp = MyApp || {};
MyApp.utils = {
  sum: function(a, b) { return a + b; }
};
```

### 2. CommonJS模块

```js
/**
 * CommonJS导出与导入（Node.js环境）
 */
// math.js
exports.add = (a, b) => a + b;
// main.js
const math = require('./math');
math.add(1, 2);
```

### 3. AMD模块

```js
/**
 * AMD模块定义（以RequireJS为例）
 */
define(['dep'], function(dep) {
  return {
    run: function() { dep.do(); }
  };
});
```

### 4. ES6模块

```js
/**
 * ES6模块导入导出
 */
// utils.js
export function sum(a, b) { return a + b; }
// main.js
import { sum } from './utils.js';
sum(1, 2);
```

### 5. Tree Shaking

```js
/**
 * 仅打包实际用到的模块代码
 * @see https://webpack.js.org/guides/tree-shaking/
 */
// 只要用ES6模块语法，配合现代打包工具即可自动Tree Shaking
```

## 实践建议

- 新项目优先采用ES6模块，提升兼容性与可维护性
- Node.js开发推荐使用CommonJS或ESM
- 合理拆分模块，避免单文件过大
- 配合打包工具优化产物体积
- 关注模块热更新与懒加载等进阶特性

## 小结

模块化是现代JavaScript开发的基石。理解各类模块方案的原理与适用场景，有助于构建高质量、可扩展的前端项目。 