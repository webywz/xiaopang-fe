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

模块化是现代JavaScript应用程序的核心理念，在Node.js中尤为重要。Node.js的模块系统允许开发者将代码分割成独立、可复用的单元，极大提升了代码的组织性和可维护性。

### 模块化的意义

模块化开发带来了诸多好处：

1. **代码组织** - 将相关功能组织到单独的模块中
2. **代码复用** - 允许在不同项目中复用代码
3. **依赖管理** - 明确模块间的依赖关系
4. **封装性** - 隐藏内部实现，只暴露必要的API
5. **命名空间** - 避免全局命名空间污染

Node.js从一开始就内置了模块系统，这也是其最核心的特性之一。

### Node.js支持的模块规范

Node.js支持两种主要的模块系统：

- **CommonJS** - Node.js原生的模块系统，使用`require()`和`module.exports`
- **ES Modules (ESM)** - ECMAScript标准的模块系统，使用`import`和`export`语法

```js
/**
 * 两种模块系统的基本语法对比
 */

// CommonJS 风格
// 文件: logger-commonjs.js
function log(message) {
  console.log(`[INFO] ${message}`);
}

module.exports = { log };

// 使用CommonJS模块
const logger = require('./logger-commonjs');
logger.log('使用CommonJS模块');

// ----------------------------

// ES Modules 风格
// 文件: logger-esm.js
export function log(message) {
  console.log(`[INFO] ${message}`);
}

// 使用ESM模块
import { log } from './logger-esm.js';
log('使用ES模块');
```

### 模块解析策略

Node.js使用特定的算法来解析模块路径：

1. **核心模块** - 如`fs`、`path`等内置模块
2. **文件模块** - 以`/`、`./`或`../`开头的本地模块
3. **包模块** - 安装在`node_modules`目录中的第三方模块

```js
// 核心模块导入
const fs = require('fs');
const path = require('path');

// 文件模块导入 (相对路径)
const myUtils = require('./utils');
const config = require('../config');

// 包模块导入 (从node_modules查找)
const express = require('express');
const lodash = require('lodash');
```

### 模块类型

Node.js应用中常见的几种模块类型：

#### 1. 内置核心模块

Node.js自带的模块，如`fs`、`http`、`path`等，无需安装即可使用。

```js
// 使用核心模块
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});
server.listen(3000);
```

#### 2. 第三方模块

通过npm安装的模块，存放在`node_modules`目录中。

```js
// 使用第三方模块
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(3000);
```

#### 3. 本地模块

开发者自己创建的模块，通常使用相对路径引用。

```js
// config.js
module.exports = {
  dbUrl: 'mongodb://localhost:27017/myapp',
  apiKey: 'secret-key-123',
  isDev: process.env.NODE_ENV !== 'production'
};

// app.js
const config = require('./config');
console.log(`连接到数据库: ${config.dbUrl}`);
```

### 模块系统的发展

Node.js的模块系统经历了显著的演变：

1. **早期阶段** - 仅支持CommonJS
2. **过渡阶段** - 添加实验性的ESM支持，需要使用`.mjs`扩展名
3. **现代阶段** - 通过`package.json`中的`"type": "module"`字段提供完整ESM支持

这种演进允许开发者选择最适合其项目的模块系统，同时保持向后兼容性。

```json
// package.json示例 - 配置项目使用ESM
{
  "name": "my-modern-app",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js"
}
```

在接下来的章节中，我们将深入探讨CommonJS和ESM的工作机制、它们的异同点以及如何在实际项目中高效使用它们。

## CommonJS模块机制

CommonJS是Node.js原生采用的模块系统，提供了一种简单而强大的方式来组织和复用代码。它的设计理念是让服务器端JavaScript具备模块化能力，实现代码隔离和依赖管理。

### CommonJS的核心概念

CommonJS模块有几个关键特性：

#### 1. 模块作用域

每个模块都有自己的作用域，模块内部定义的变量、函数和类在外部不可见，除非显式导出。这种封装性防止了全局命名空间污染。

```js
// logger.js
// 这些变量在模块内部是私有的
const DEFAULT_LEVEL = 'info';
const levels = ['debug', 'info', 'warn', 'error'];

function formatMessage(message, level) {
  return `[${level.toUpperCase()}] ${message}`;
}

// 只导出公共API
module.exports = function(message, level = DEFAULT_LEVEL) {
  if (!levels.includes(level)) {
    level = DEFAULT_LEVEL;
  }
  console.log(formatMessage(message, level));
};

// main.js
const logger = require('./logger');
logger('这是一条信息'); // [INFO] 这是一条信息
logger('出现错误', 'error'); // [ERROR] 出现错误

// 无法访问模块内部变量
console.log(logger.DEFAULT_LEVEL); // undefined
console.log(logger.formatMessage); // undefined
```

#### 2. 模块标识符

在CommonJS中，`require()`函数接受一个模块标识符参数，用于定位要加载的模块：

```js
// 三种不同类型的模块标识符
const fs = require('fs'); // 内置模块
const express = require('express'); // node_modules中的模块 
const config = require('./config'); // 相对路径的本地模块
```

#### 3. 模块加载过程

当使用`require()`加载模块时，Node.js会执行以下步骤：

1. **解析**：确定模块的绝对路径
2. **加载**：读取并解析文件内容
3. **包装**：将代码包装在函数中，提供模块级作用域
4. **执行**：运行模块代码，填充`exports`对象
5. **缓存**：缓存模块实例，使后续的`require`直接返回缓存结果
6. **返回**：返回`module.exports`对象

```js
/**
 * Node.js模块包装函数的简化示意
 * 这不是实际代码，而是展示Node.js内部如何包装模块
 */
(function(exports, require, module, __filename, __dirname) {
  // 模块的实际代码被放在这里
  const myVariable = 'Hello World';
  function myFunction() { return myVariable; }
  
  // 导出内容
  module.exports = myFunction;
});
```

### 模块导出方式

CommonJS提供了多种方式来导出模块内容：

#### 1. 导出对象

最常见的方式是通过`module.exports`导出一个包含多个属性和方法的对象：

```js
// utils.js
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b !== 0 ? a / b : null)
};

// 使用
const utils = require('./utils');
console.log(utils.add(5, 3)); // 8
console.log(utils.multiply(2, 4)); // 8
```

#### 2. 导出单个函数

如果模块主要提供一个功能，可以直接将函数赋值给`module.exports`：

```js
// greet.js
module.exports = function(name) {
  return `你好，${name}！`;
};

// 使用
const greet = require('./greet');
console.log(greet('张三')); // 你好，张三！
```

#### 3. 导出构造函数/类

可以导出构造函数或ES6类，让使用者能够实例化对象：

```js
// user.js
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  getInfo() {
    return `${this.name} <${this.email}>`;
  }
}

module.exports = User;

// 使用
const User = require('./user');
const admin = new User('管理员', 'admin@example.com');
console.log(admin.getInfo()); // 管理员 <admin@example.com>
```

#### 4. exports别名

`exports`是`module.exports`的引用，可以用来添加属性，但不能直接赋值：

```js
// helpers.js
// 正确用法 - 添加属性
exports.formatDate = function(date) {
  return date.toISOString().split('T')[0];
};

exports.generateId = function() {
  return Math.random().toString(36).substr(2, 9);
};

// 使用
const helpers = require('./helpers');
console.log(helpers.formatDate(new Date())); // 如：2023-04-01
console.log(helpers.generateId()); // 如：x7f9ae2p1

// 错误用法
// exports = { formatDate, generateId }; // 这不会修改module.exports
// 正确做法是使用module.exports
// module.exports = { formatDate, generateId };
```

### require的解析规则

`require`函数使用一套特定的规则来解析模块路径：

#### 1. 文件模块解析

1. 如果精确匹配到带扩展名的文件，直接加载
2. 尝试添加`.js`、`.json`和`.node`扩展名查找
3. 尝试将路径视为目录，查找`package.json`中的`main`字段
4. 尝试加载目录下的`index.js`、`index.json`或`index.node`

```js
// 解析示例
require('./config');
// 尝试顺序:
// 1. ./config.js
// 2. ./config.json
// 3. ./config.node
// 4. ./config/package.json 中的 main 字段
// 5. ./config/index.js
// 6. ./config/index.json
// 7. ./config/index.node
```

#### 2. 包模块解析

对于非相对路径或绝对路径的模块，Node.js会在`node_modules`目录中查找：

1. 先在当前目录的`node_modules`查找
2. 如果未找到，继续在父目录的`node_modules`查找
3. 一直向上递归，直到文件系统根目录

```js
// 当在 /home/user/project/app.js 中执行
require('express');
// 查找顺序:
// 1. /home/user/project/node_modules/express
// 2. /home/user/node_modules/express
// 3. /home/node_modules/express
// 4. /node_modules/express
```

### 循环依赖处理

CommonJS的模块系统能够处理循环依赖，但可能导致意外行为：

```js
// a.js
console.log('a模块开始加载');
exports.done = false;
const b = require('./b.js');
console.log('在a模块中，b.done =', b.done);
exports.done = true;
console.log('a模块加载完成');

// b.js
console.log('b模块开始加载');
exports.done = false;
const a = require('./a.js');
console.log('在b模块中，a.done =', a.done);
exports.done = true;
console.log('b模块加载完成');

// main.js
console.log('主模块开始加载');
const a = require('./a.js');
console.log('在主模块中，a.done =', a.done);
```

当运行`main.js`时，输出如下：

```
主模块开始加载
a模块开始加载
b模块开始加载
在b模块中，a.done = false
b模块加载完成
在a模块中，b.done = true
a模块加载完成
在主模块中，a.done = true
```

这是因为循环依赖时，Node.js返回的是模块的"未完成"版本，即只包含已执行部分的导出。

### CommonJS的局限性

尽管功能强大，CommonJS也存在一些局限：

1. **同步加载** - 模块加载是同步的，不适合浏览器环境
2. **静态分析困难** - 动态`require`使得工具难以分析依赖关系
3. **无Tree Shaking** - 无法像ESM那样只加载用到的代码
4. **循环依赖复杂性** - 处理循环依赖时行为可能难以预测

ES Modules正是为了解决这些问题而设计的，我们将在下一节详细讨论ESM。

## ESM（ES Modules）支持

ES Modules是JavaScript的官方标准模块系统，最初为浏览器环境设计，现已在Node.js中得到完整支持。ESM采用静态导入导出语法，提供了比CommonJS更强大的功能和更好的性能特性。

### 启用ESM支持

在Node.js中使用ESM有几种方式：

#### 1. 使用`.mjs`扩展名

最直接的方法是将文件扩展名改为`.mjs`，Node.js会自动将其视为ES模块：

```js
// math.mjs
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// app.mjs
import { add, subtract } from './math.mjs';
console.log(add(5, 3)); // 8
console.log(subtract(10, 4)); // 6
```

#### 2. 在package.json中设置type字段

更常见的做法是在`package.json`中设置`"type": "module"`，这会使项目中所有`.js`文件默认被视为ES模块：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module"
}
```

#### 3. 混合使用两种模块系统

可以在同一项目中混合使用CommonJS和ESM：

- 在`"type": "module"`的项目中，使用`.cjs`扩展名表示CommonJS模块
- 在`"type": "commonjs"`(默认)的项目中，使用`.mjs`扩展名表示ES模块

```
project/
├── package.json      // "type": "module"
├── esm-file.js       // 被视为ESM
├── cjs-file.cjs      // 被视为CommonJS
└── nested/
    ├── esm-file.js   // 被视为ESM
    └── cjs-file.cjs  // 被视为CommonJS
```

### ESM语法和功能

ES模块提供了丰富的导入和导出语法，支持各种模块交互方式。

#### 1. 命名导出与导入

可以导出多个具名值，并在导入时选择性地只导入需要的部分：

```js
// utils.js
export const PI = 3.14159;
export function square(x) {
  return x * x;
}
export function cube(x) {
  return x * x * x;
}

// 使用命名导入
import { PI, square } from './utils.js';
console.log(PI); // 3.14159
console.log(square(3)); // 9

// 使用命名空间导入
import * as Utils from './utils.js';
console.log(Utils.PI); // 3.14159
console.log(Utils.cube(3)); // 27
```

#### 2. 默认导出与导入

每个模块可以有一个默认导出，通常用于模块的主要功能：

```js
// greeting.js
export default function(name) {
  return `你好，${name}！`;
}

// 导入默认导出
import greet from './greeting.js';
console.log(greet('世界')); // 你好，世界！

// 同时导入默认导出和命名导出
export const version = '1.0.0';
import greet, { version } from './greeting.js';
```

#### 3. 动态导入

ESM支持运行时动态导入模块，返回Promise：

```js
// 根据条件动态加载模块
async function loadModule(condition) {
  if (condition) {
    const { default: Module } = await import('./module-a.js');
    return new Module();
  } else {
    const { default: Module } = await import('./module-b.js');
    return new Module();
  }
}

// 按需加载大型模块
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart-library.js');
  renderChart(data, container);
});
```

#### 4. 导入导出的组合与重导出

可以从其他模块导入后再导出，实现模块聚合：

```js
// lib.js - 聚合多个子模块的公共API
export { default as Feature1 } from './feature1.js';
export { api, helpers } from './feature2.js';
export * from './utils.js';
export * as constants from './constants.js';

// 使用聚合模块
import { Feature1, api, helpers, formatDate, constants } from './lib.js';
```

### ESM与CommonJS的关键区别

ES模块与CommonJS有许多根本性的区别：

#### 1. 静态结构与分析

ESM的导入导出语句是静态的，必须位于模块顶层：

```js
// 正确 - 静态导入
import { readFile } from 'fs/promises';

// 错误 - 条件导入在ESM中不允许
if (condition) {
  import { something } from './module.js'; // 语法错误
}

// 正确 - 使用动态导入代替
if (condition) {
  import('./module.js').then(module => {
    // 使用module
  });
}
```

这种静态结构使得工具可以在执行前分析依赖关系，实现tree-shaking等优化。

#### 2. 异步加载

ESM模块是异步加载的，这与CommonJS的同步加载模型不同：

```js
// ESM模块加载是异步的
import { readFile } from 'fs/promises';

console.log('开始');
// 这里的模块已完全加载，但加载过程是异步的
console.log('模块加载完成');

// CommonJS是同步的
const fs = require('fs');
// 只有在模块完全加载后才会继续执行
console.log('模块加载完成');
```

#### 3. 值引用与副本

ESM导入的是对原始值的"实时绑定"(live binding)，而不是副本：

```js
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 - 值会更新，因为是引用
```

而在CommonJS中导入的是值的副本：

```js
// counter.js (CommonJS)
let count = 0;
function increment() {
  count++;
}
module.exports = { count, increment };

// main.js (CommonJS)
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 仍然是0，因为导入的是副本
```

#### 4. 严格模式

ESM总是在严格模式下执行，不需要添加`'use strict'`指令：

```js
// ESM自动处于严格模式
import { something } from './module.js';

// 这将抛出错误，因为ESM下未声明变量不会自动成为全局变量
undeclaredVar = 'value'; // ReferenceError
```

#### 5. 顶层this

在CommonJS模块中，顶层`this`指向模块本身；在ESM中，顶层`this`是`undefined`：

```js
// CommonJS
console.log(this === module.exports); // true

// ESM
console.log(this); // undefined
```

### Node.js中ESM与CommonJS的互操作性

Node.js提供了一定程度的互操作能力，允许ESM导入CommonJS模块，反之则有限制。

#### 1. 从ESM导入CommonJS模块

ESM可以导入CommonJS模块，但CommonJS的`module.exports`会被视为默认导出：

```js
// legacy.cjs (CommonJS)
module.exports = {
  legacyMethod: function() { return 'legacy'; },
  anotherMethod: function() { return 'another'; }
};

// modern.js (ESM)
// 导入整个模块作为默认导出
import legacy from './legacy.cjs';
console.log(legacy.legacyMethod()); // 'legacy'

// 使用解构导入
import { legacyMethod, anotherMethod } from './legacy.cjs';
console.log(legacyMethod()); // 'legacy'
```

#### 2. 从CommonJS导入ESM模块

CommonJS不能直接`require()`ESM模块，但可以使用动态`import()`：

```js
// esm-module.mjs
export function modern() {
  return '现代模块';
}

// cjs-module.cjs
// 错误做法 - 不能直接require ESM
// const { modern } = require('./esm-module.mjs'); // 出错

// 正确做法 - 使用动态import()
(async () => {
  const { modern } = await import('./esm-module.mjs');
  console.log(modern()); // '现代模块'
})();
```

#### 3. __dirname和__filename在ESM中的替代方案

ESM模块中没有`__dirname`和`__filename`，需要使用`import.meta.url`代替：

```js
// CommonJS
console.log(__dirname);
console.log(__filename);

// ESM
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);
console.log(__filename);
```

### ESM的高级功能

ES模块系统提供了一些高级功能，增强了模块开发体验。

#### 1. import.meta对象

`import.meta`是一个包含当前模块信息的对象：

```js
// 获取模块URL
console.log(import.meta.url);
// 例如: file:///home/user/project/module.js

// 在浏览器中还可能有其他属性
console.log(import.meta.scriptElement); // 在某些浏览器环境中
```

#### 2. 导入断言

可以使用导入断言指定导入资源的类型（主要在浏览器环境有用）：

```js
// 导入JSON模块并指定类型
import data from './data.json' assert { type: 'json' };

// 导入CSS模块
import styles from './styles.css' assert { type: 'css' };
```

#### 3. 模块预加载

在生产环境中，可以使用`--experimental-specifier-resolution=node`标志启用自动扩展名解析，简化导入路径：

```js
// 不需要写扩展名
import { something } from './module';  // 自动查找module.js

// 也可以使用目录导入
import { feature } from './features'; // 自动查找features/index.js
```

### 迁移策略：从CommonJS到ESM

如果要将项目从CommonJS迁移到ESM，可以采用以下策略：

1. **渐进式迁移**：先将package.json中type设为"commonjs"（默认），然后逐个将文件扩展名改为.mjs
2. **双包发布**：同时提供CommonJS和ESM两个版本，在package.json中指定入口：

```json
{
  "name": "my-lib",
  "main": "./dist/index.js",        // CommonJS入口
  "module": "./dist/index.mjs",     // ESM入口 
  "exports": {
    ".": {
      "require": "./dist/index.js", // CommonJS消费者
      "import": "./dist/index.mjs"  // ESM消费者
    }
  }
}
```

3. **代码转换工具**：使用工具如`jscodeshift`自动转换代码：

```js
// 从
const { feature } = require('./module');
module.exports = { feature };

// 转换为
import { feature } from './module.js';
export { feature };
```

随着JavaScript生态系统的发展，ESM正逐渐成为主流模块系统，了解和使用ESM将有助于编写更现代、更高效的Node.js应用程序。

## 模块加载与缓存原理

Node.js的模块系统采用了高效的加载和缓存机制，理解这些底层原理有助于开发更高效的应用程序并解决常见问题。

### 模块加载过程

Node.js加载模块时遵循一个精确的步骤序列，这个过程在CommonJS和ESM中有所不同。

#### CommonJS模块加载流程

1. **解析模块路径**：确定模块的完整文件路径
2. **检查缓存**：如果模块已加载，直接返回缓存的`module.exports`
3. **加载模块**：读取模块文件并编译为JavaScript函数
4. **模块封装**：将代码包装在函数中提供隔离作用域
5. **执行模块代码**：调用包装函数，填充`exports`对象
6. **缓存模块**：将加载结果存入`require.cache`
7. **返回导出**：提供`module.exports`给调用者

这个过程可以用伪代码表示：

```js
function require(modulePath) {
  // 1. 解析绝对路径
  const filename = resolveFilename(modulePath);
  
  // 2. 检查缓存
  if (require.cache[filename]) {
    return require.cache[filename].exports;
  }
  
  // 3. 创建模块对象
  const module = {
    exports: {},
    loaded: false,
    id: filename,
    // ...其他元数据
  };
  
  // 4. 缓存模块（即使还未完成加载）
  require.cache[filename] = module;
  
  // 5. 加载模块（读取文件）
  const content = readFileSync(filename, 'utf8');
  
  // 6. 包装代码
  const wrapper = Function('exports', 'require', 'module', '__filename', '__dirname',
    content + '\n return module.exports;');
  
  // 7. 执行模块函数
  wrapper.call(module.exports, module.exports, require, module, filename, dirname(filename));
  
  // 8. 标记为已加载
  module.loaded = true;
  
  // 9. 返回导出对象
  return module.exports;
}
```

#### ESM模块加载流程

ESM采用了更复杂的异步加载过程，主要包括三个阶段：

1. **构建**：解析模块说明符，定位文件
2. **实例化**：为导出创建内存空间，但未填充值
3. **评估**：执行代码，填充导出值

这种设计使得ESM能够在执行前检测到循环依赖，并在对所有依赖进行静态分析后再执行代码。

### 模块缓存机制

Node.js为了提高性能，使用缓存避免重复加载同一模块。

#### CommonJS缓存

CommonJS模块在首次加载后会被缓存，之后的`require`调用都返回相同实例：

```js
// module.js
console.log('模块被加载');
module.exports = { count: 0 };

// main.js
const mod1 = require('./module.js'); // 输出: 模块被加载
const mod2 = require('./module.js'); // 无输出，使用缓存

console.log(mod1 === mod2); // true - 相同对象实例

// 修改第一个返回的模块对象
mod1.count++;
console.log(mod1.count); // 1
console.log(mod2.count); // 1 - 同一实例
```

查看和操作模块缓存：

```js
// 查看所有已缓存模块
console.log(Object.keys(require.cache));

// 删除特定模块的缓存
delete require.cache[require.resolve('./module.js')];

// 删除后再次加载 - 模块会重新执行
const mod3 = require('./module.js'); // 输出: 模块被加载
console.log(mod1 === mod3); // false - 不同实例
```

#### ESM缓存

ESM也有类似的缓存机制，但管理方式不同：

```js
// module.mjs
console.log('ESM模块被加载');
export let value = { count: 0 };

// main.mjs
import { value as value1 } from './module.mjs'; // 输出: ESM模块被加载
import { value as value2 } from './module.mjs'; // 无输出，使用缓存

console.log(value1 === value2); // true - 相同对象实例

// 修改对象属性 (注意：ESM中不能直接修改导出的变量，但可以修改其属性)
value1.count++;
console.log(value1.count); // 1
console.log(value2.count); // 1 - 同一实例
```

ESM模块缓存是基于模块URL的，对于Node.js环境，是基于解析后的文件路径。目前没有直接操作ESM模块缓存的标准API。

### 循环依赖处理

循环依赖是指两个或多个模块互相引用的情况，Node.js的两种模块系统都能处理循环依赖，但行为各不相同。

#### CommonJS中的循环依赖

当遇到循环依赖时，CommonJS返回"未完成"的模块对象：

```js
// a.js
console.log('a模块开始执行');
exports.aValue = 'a模块的值';
const b = require('./b.js');
console.log('b.bValue:', b.bValue);
exports.aSecondValue = '基于b模块的计算: ' + b.bValue.toUpperCase();
console.log('a模块执行完毕');

// b.js
console.log('b模块开始执行');
exports.bValue = 'b模块的值';
const a = require('./a.js');
console.log('a.aValue:', a.aValue); // 可以访问已定义的 aValue
console.log('a.aSecondValue:', a.aSecondValue); // undefined，因尚未定义
exports.bSecondValue = '来自a的值: ' + a.aValue;
console.log('b模块执行完毕');

// main.js
console.log('主程序开始');
const a = require('./a.js');
console.log('a.aSecondValue最终值:', a.aSecondValue);
console.log('主程序结束');
```

执行`main.js`会得到：

```
主程序开始
a模块开始执行
b模块开始执行
a.aValue: a模块的值
a.aSecondValue: undefined
b模块执行完毕
b.bValue: b模块的值
a模块执行完毕
a.aSecondValue最终值: 基于b模块的计算: B模块的值
主程序结束
```

**图解循环依赖加载过程**：

```
main加载a.js
  |
  a.js开始执行
  |
  a.js设置 exports.aValue
  |
  a.js加载b.js
     |
     b.js开始执行
     |
     b.js设置 exports.bValue
     |
     b.js加载a.js（发现循环）
     |
     b.js拿到未完成的a.js的exports（包含aValue但不包含aSecondValue）
     |
     b.js读取a.aValue（成功）并设置自己的bSecondValue
     |
     b.js执行完毕，返回控制权给a.js
  |
  a.js恢复执行，读取b.bValue成功
  |
  a.js设置aSecondValue
  |
  a.js执行完毕，返回控制权给main
|
main继续执行，此时a模块已完全加载
```

#### ESM中的循环依赖

ESM使用"活绑定"处理循环依赖，允许在初始化顺序不会导致死锁的情况下使用循环依赖：

```js
// a.mjs
import { bValue, bFunction } from './b.mjs';
export let aValue = 'a的初始值';

console.log('a.mjs执行');
console.log('b模块中的值:', bValue);

// 延迟修改导出值
setTimeout(() => {
  aValue = 'a的新值';
  console.log('a.mjs更新了值');
}, 1000);

export function aFunction() {
  return 'A函数,' + bFunction();
}

// b.mjs
import { aValue, aFunction } from './a.mjs';
export let bValue = 'b的值';

console.log('b.mjs执行');
console.log('a模块的初始值:', aValue); // 访问a模块的导出

setTimeout(() => {
  console.log('1秒后a模块的值:', aValue); // 将看到更新后的值
}, 1500);

export function bFunction() {
  return 'B函数';
}

// main.mjs
import { aFunction, aValue } from './a.mjs';
import { bFunction, bValue } from './b.mjs';

console.log('主模块执行');
console.log('a模块:', aValue);
console.log('b模块:', bValue);
console.log(aFunction());

setTimeout(() => {
  console.log('2秒后a模块:', aValue); // 会看到更新后的值
}, 2000);
```

ESM使用两阶段处理（链接和求值），使得模块间依赖关系在实际执行前就确定，大大减少了循环依赖的问题。

### 模块解析策略

Node.js使用多种策略解析模块路径，包括路径解析和包解析。

#### 路径解析算法

当导入模块时，Node.js使用以下规则：

1. **绝对路径或相对路径**
   ```js
   require('/absolute/path/to/file');
   require('./relative/path/to/file');
   require('../parent/path/to/file');
   ```

2. **核心模块**：检查是否为Node.js内置模块（如`fs`、`path`）
   ```js
   require('fs'); // 优先级高于同名第三方模块
   ```

3. **node_modules查找**：从当前目录开始，向上递归查找`node_modules`目录

#### 包管理与解析

Node.js模块路径解析中，包遵循以下规则：

1. **package.json主入口**：
   ```json
   {
     "name": "my-package",
     "main": "lib/index.js",      // CommonJS入口
     "module": "lib/index.mjs",   // ESM入口（非标准但常用）
     "exports": {                 // 现代包入口点定义
       ".": {
         "import": "./lib/index.mjs",
         "require": "./lib/index.js"
       },
       "./utils": {
         "import": "./lib/utils/index.mjs",
         "require": "./lib/utils/index.js"
       }
     }
   }
   ```

2. **exports字段优先级**：Node.js 12+提供的`exports`字段提供了更精确的子路径控制
   ```js
   // 对应 my-package/lib/utils/index.js 或 my-package/lib/utils/index.mjs
   import { something } from 'my-package/utils';
   ```

3. **条件导出**：基于环境条件选择不同的入口点
   ```json
   {
     "exports": {
       ".": {
         "node": "./node.js",
         "browser": "./browser.js",
         "default": "./fallback.js"
       }
     }
   }
   ```

### 优化模块加载

理解模块加载机制有助于优化应用性能：

#### 1. 采用有效缓存策略

利用CommonJS的模块缓存来实现单例模式：
```js
// db.js - 数据库连接单例
let connection = null;

module.exports = async function getConnection() {
  if (connection) return connection;
  
  connection = await createConnection({
    // 数据库配置...
  });
  
  return connection;
};
```

#### 2. 按需加载优化启动时间

延迟加载不立即使用的大型模块：
```js
// 而不是顶层加载
// const heavyModule = require('./heavy-module');

function operationThatNeedsHeavyModule() {
  // 仅在需要时加载
  const heavyModule = require('./heavy-module');
  return heavyModule.doSomething();
}
```

#### 3. 结合动态导入改进性能

使用ESM的动态导入实现按需加载：
```js
// 按需加载语言文件示例
async function loadTranslations(locale) {
  try {
    // 根据语言动态加载翻译文件
    const translations = await import(`./locales/${locale}.js`);
    return translations.default;
  } catch (err) {
    console.error(`无法加载语言 ${locale}:`, err);
    // 加载默认语言作为后备
    const defaultTranslations = await import('./locales/en.js');
    return defaultTranslations.default;
  }
}
```

#### 4. 合理组织模块结构

采用适当的模块设计模式，比如聚合模块：

```js
// api/index.js - 聚合模块
const users = require('./users');
const posts = require('./posts');
const comments = require('./comments');

module.exports = {
  users,
  posts,
  comments
};

// 使用时，只需一个导入语句
const api = require('./api');
api.users.getById(1);
api.posts.getByUser(1);
```

### 常见模块加载问题与解决方案

#### 1. require与严格相对路径

确保始终使用`./`或`../`开头：

```js
// 错误 - 会被当作包名查找
const myUtils = require('utils'); 

// 正确
const myUtils = require('./utils');
```

#### 2. 防止意外模块卸载

遵循模块设计最佳实践：

```js
// 不要直接导出可变对象
// exports.config = { debug: true };  // 坏习惯

// 导出getter，防止外部直接修改
let config = { debug: true };
exports.getConfig = () => ({ ...config }); // 返回副本
exports.setDebug = (value) => { config.debug = !!value; };
```

#### 3. 处理条件导入

根据环境变量决定加载不同模块：

```js
// 根据环境加载适当配置
const config = process.env.NODE_ENV === 'production'
  ? require('./config.prod')
  : require('./config.dev');

module.exports = config;
```

理解Node.js模块的加载和缓存机制是构建高效、可靠应用程序的关键。通过合理利用这些机制，可以实现更好的代码组织和性能优化。

## 模块导出与导入用法

Node.js提供了多种模块导出和导入的模式，了解这些模式及其最佳实践能够帮助开发者创建更易维护和复用的代码。

### CommonJS模块导出模式

CommonJS提供了几种导出模式，每种适用于不同场景。

#### 1. 导出对象

最常见的方式是通过`module.exports`导出包含多个功能的对象：

```js
// math.js
/**
 * 数学工具模块
 * @module math
 */

/**
 * 计算两数之和
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 */
function add(a, b) {
  return a + b;
}

/**
 * 计算两数之差
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之差
 */
function subtract(a, b) {
  return a - b;
}

// 导出多个函数
module.exports = {
  add,
  subtract,
  PI: 3.14159
};

// 使用方式
const math = require('./math');
console.log(math.add(5, 3)); // 8
console.log(math.PI); // 3.14159
```

这种模式适合导出有关联的多个函数或值。

#### 2. 直接导出函数

当模块主要提供单一功能时，可以直接导出函数：

```js
// logger.js
/**
 * 日志记录器
 * @param {string} message - 日志消息
 * @param {string} [level='info'] - 日志级别
 */
module.exports = function logger(message, level = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
};

// 使用方式
const logger = require('./logger');
logger('应用已启动'); // [2023-04-01T12:34:56.789Z] [INFO] 应用已启动
logger('发生错误', 'error'); // [2023-04-01T12:34:56.789Z] [ERROR] 发生错误
```

这种模式简化了模块的使用方式，适合单一职责的工具函数。

#### 3. 导出类

可以导出类或构造函数，让使用者创建实例：

```js
// database.js
/**
 * 数据库连接类
 */
class Database {
  /**
   * 创建数据库连接
   * @param {Object} config - 连接配置
   */
  constructor(config) {
    this.config = config;
    this.connected = false;
  }

  /**
   * 连接到数据库
   * @returns {Promise<void>}
   */
  async connect() {
    // 连接逻辑...
    this.connected = true;
    console.log('数据库已连接');
  }

  /**
   * 执行查询
   * @param {string} sql - SQL查询语句
   * @returns {Promise<Array>} 查询结果
   */
  async query(sql) {
    if (!this.connected) {
      throw new Error('必须先连接数据库');
    }
    // 查询逻辑...
    return [/* 查询结果 */];
  }
}

module.exports = Database;

// 使用方式
const Database = require('./database');
const db = new Database({ host: 'localhost', port: 5432 });
async function main() {
  await db.connect();
  const results = await db.query('SELECT * FROM users');
}
```

#### 4. 使用exports别名

`exports`是`module.exports`的引用，可以直接添加属性：

```js
// utils.js
/**
 * 格式化日期为YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串
 */
exports.formatDate = function(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 生成随机ID
 * @param {number} [length=8] - ID长度
 * @returns {string} 随机ID
 */
exports.generateId = function(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
};

// 注意: 不要直接赋值，会破坏exports与module.exports的引用关系
// exports = { formatDate, generateId }; // 错误!

// 使用方式
const utils = require('./utils');
console.log(utils.formatDate(new Date())); // 如：2023-04-01
console.log(utils.generateId()); // 如：x7t2yu9z
```

### ES模块导出模式

ESM提供了更灵活的导出语法。

#### 1. 命名导出

可以在声明时直接导出，或在模块末尾导出已声明的项：

```js
// api.js
// 声明时导出
export const API_VERSION = '1.0.0';

export function fetchUsers() {
  return fetch('/api/users').then(res => res.json());
}

// 类导出
export class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }
}

// 或者在末尾集中导出
const API_URL = 'https://api.example.com';
function fetchPosts() {
  return fetch('/api/posts').then(res => res.json());
}

// 集中导出
export { API_URL, fetchPosts };
```

#### 2. 默认导出

每个模块可以有一个默认导出：

```js
// auth.js
export default class Auth {
  login(credentials) {
    // 登录逻辑...
    return fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
  
  logout() {
    // 登出逻辑...
    return fetch('/api/logout', { method: 'POST' });
  }
}

// 或者导出函数
export default function authenticate(token) {
  // 认证逻辑...
  return fetch('/api/validate', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

#### 3. 混合导出

可以同时使用默认导出和命名导出：

```js
// api-client.js
// 默认导出
export default class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  get(endpoint) {
    return fetch(`${this.baseUrl}/${endpoint}`);
  }
  
  post(endpoint, data) {
    return fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

// 命名导出
export const VERSION = '2.0.0';
export function formatResponse(response) {
  return response.json();
}
```

### CommonJS导入模式

CommonJS提供了几种导入模块的模式：

#### 1. 整体导入

导入整个模块：

```js
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

// 使用
fs.readFileSync('file.txt');
const filePath = path.join(__dirname, 'data.json');
const id = utils.generateId();
```

#### 2. 使用解构赋值

使用对象解构直接提取需要的部分：

```js
const { readFile, writeFile } = require('fs');
const { add, subtract } = require('./math');

// 使用
readFile('input.txt', (err, data) => {
  // 处理文件...
});
console.log(add(5, 3)); // 8
```

#### 3. 动态导入

可以根据条件动态加载模块：

```js
function loadConfig(env) {
  let config;
  
  if (env === 'production') {
    config = require('./config.prod');
  } else if (env === 'test') {
    config = require('./config.test');
  } else {
    config = require('./config.dev');
  }
  
  return config;
}

const config = loadConfig(process.env.NODE_ENV);
```

### ES模块导入模式

ESM提供了多种灵活的导入语法：

#### 1. 命名导入

从模块中导入特定的命名导出：

```js
import { fetchUsers, API_VERSION } from './api.js';

fetchUsers().then(users => {
  console.log(`API ${API_VERSION}获取到${users.length}个用户`);
});
```

#### 2. 默认导入

导入模块的默认导出：

```js
import Auth from './auth.js';
import authenticate from './authenticate.js';

const auth = new Auth();
auth.login({ username: 'admin', password: 'secret' });

authenticate('token123').then(valid => {
  console.log('令牌有效:', valid);
});
```

#### 3. 命名空间导入

将所有命名导出作为一个对象导入：

```js
import * as Utils from './utils.js';

const today = Utils.formatDate(new Date());
const id = Utils.generateId();
console.log(`今天是 ${today}，生成ID: ${id}`);
```

#### 4. 混合导入

同时导入默认导出和命名导出：

```js
import ApiClient, { VERSION, formatResponse } from './api-client.js';

const api = new ApiClient('https://api.example.com');
console.log(`使用API版本: ${VERSION}`);

api.get('users')
  .then(formatResponse)
  .then(data => console.log(data));
```

#### 5. 动态导入

使用`import()`函数动态加载模块：

```js
async function loadFeature(featureName) {
  try {
    // 动态导入，返回Promise
    const module = await import(`./features/${featureName}.js`);
    return module.default; // 获取默认导出
  } catch (err) {
    console.error(`加载功能 ${featureName} 失败:`, err);
    return null;
  }
}

// 按用户需求加载功能
button.addEventListener('click', async () => {
  const feature = await loadFeature('chart');
  if (feature) {
    feature.initialize(container);
  }
});
```

### 跨规范导入导出

在一些项目中，可能需要在CommonJS和ESM之间进行互操作。

#### 从ESM导入CommonJS模块

```js
// commonjs-module.cjs
module.exports = {
  hello: 'world',
  sayHello() {
    return 'Hello from CommonJS!';
  }
};

// esm-module.mjs
import cjsModule from './commonjs-module.cjs';
console.log(cjsModule.hello); // 'world'
console.log(cjsModule.sayHello()); // 'Hello from CommonJS!'

// 也可以使用解构导入，但要注意这是从默认导出解构，不是从命名导出
import { hello, sayHello } from './commonjs-module.cjs';
console.log(hello); // 'world'
```

#### 从CommonJS导入ESM模块

CommonJS不能直接静态导入ESM模块，但可以使用动态导入：

```js
// esm-module.mjs
export const data = { name: 'ESM模块' };
export function getMessage() {
  return 'Hello from ESM!';
}

// commonjs-module.cjs
// 错误: 不能直接require
// const esmModule = require('./esm-module.mjs');

// 正确: 使用动态导入
(async () => {
  const esmModule = await import('./esm-module.mjs');
  console.log(esmModule.data.name); // 'ESM模块'
  console.log(esmModule.getMessage()); // 'Hello from ESM!'
})();
```

### 模块导入导出最佳实践

为了使代码更易维护和优化，请考虑以下最佳实践：

#### 1. 选择合适的导出方式

- 对于提供单一功能的模块，使用默认导出
- 对于提供多个独立功能的模块，使用命名导出
- 在创建库时，提供清晰的公共API界面

#### 2. 避免过度导出

只导出需要公开的API，保持模块界面简洁：

```js
// bad
export function internalHelper() { /* ... */ } // 不应导出内部辅助函数
export const INTERNAL_CONFIG = { /* ... */ }; // 不应导出内部配置

// good
function internalHelper() { /* ... */ } // 模块内部私有
const INTERNAL_CONFIG = { /* ... */ }; // 模块内部私有

export function publicAPI() { // 只导出公共API
  // 内部使用私有功能
  internalHelper();
  // ...
}
```

#### 3. 使用索引文件整合导出

创建索引文件汇总和重导出相关模块：

```js
// models/user.js
export class User { /* ... */ }

// models/post.js
export class Post { /* ... */ }

// models/comment.js
export class Comment { /* ... */ }

// models/index.js - 汇总导出
export { User } from './user.js';
export { Post } from './post.js';
export { Comment } from './comment.js';

// 应用中可以从一个地方导入所有模型
import { User, Post, Comment } from './models';
```

#### 4. 保持单一责任原则

每个模块应该只有一个职责或相关功能集：

```js
// 不好的做法 - 混合不相关功能
// mixed.js
export function validateUser() { /* ... */ }
export function calculateTax() { /* ... */ }
export function renderTemplate() { /* ... */ }

// 好的做法 - 分离为独立模块
// user-validation.js
export function validateUser() { /* ... */ }

// tax-calculator.js
export function calculateTax() { /* ... */ }

// template-renderer.js
export function renderTemplate() { /* ... */ }
```

通过正确使用模块导出和导入模式，您可以创建更加模块化、可维护且性能更好的Node.js应用程序。模块化思想不仅是代码组织的技术手段，更是软件工程思想的体现，对于构建任何规模的应用程序都至关重要。

## 实战建议与最佳实践

理解模块系统的原理后，掌握一些实战建议和最佳实践将帮助您构建更高质量的Node.js应用程序。

### 模块组织策略

一个好的模块组织结构能够提高代码的可维护性和可扩展性。

#### 1. 按功能域划分模块

将相关功能组织在同一目录下，形成功能域：

```
src/
├── auth/              # 认证相关功能
│   ├── index.js       # 导出公共API
│   ├── middlewares.js # 认证中间件
│   ├── services.js    # 认证服务
│   └── utils.js       # 认证工具函数
├── users/             # 用户相关功能
│   ├── controllers.js # 用户控制器
│   ├── models.js      # 用户模型
│   ├── routes.js      # 用户路由
│   └── index.js       # 导出公共API
└── shared/            # 共享工具和服务
    ├── logger.js      # 日志工具
    ├── database.js    # 数据库连接
    └── validators.js  # 通用验证器
```

这种结构使得：
- 相关代码在一起，便于查找和理解
- 每个域都有明确的边界和职责
- 通过索引文件控制公共API导出

```js
// auth/index.js
const middlewares = require('./middlewares');
const services = require('./services');

// 仅导出公共API，隐藏内部实现
module.exports = {
  authenticate: middlewares.authenticate,
  authorize: middlewares.authorize,
  login: services.login,
  logout: services.logout
};

// 应用中使用
const auth = require('./auth');
app.use(auth.authenticate);
```

#### 2. 分层架构模块组织

对于较大的应用程序，可以考虑按层次组织模块：

```
src/
├── controllers/    # 处理HTTP请求响应
├── services/       # 业务逻辑层
├── repositories/   # 数据访问层
├── models/         # 数据模型
├── middlewares/    # Express中间件
└── utils/          # 工具函数
```

层与层之间通过明确的依赖关系连接：

```js
// controllers/user.js
const userService = require('../services/user');

async function getUser(req, res) {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// services/user.js
const userRepo = require('../repositories/user');

async function findById(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error('用户不存在');
  }
  return user;
}
```

### 模块设计原则

良好的模块设计能够提高代码质量和可维护性。

#### 1. 高内聚低耦合

每个模块应当专注于单一的职责，并且与其他模块的依赖关系要尽可能少：

```js
// 高内聚的模块示例 - 只关注用户验证
/**
 * 用户验证模块
 * @module user-validator
 */

/**
 * 验证用户名
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(username);
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

/**
 * 验证邮箱格式
 * @param {string} email - 电子邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  validateUsername,
  validatePassword,
  validateEmail
};
```

#### 2. 接口设计

模块应该提供清晰、一致的公共接口：

```js
// database.js - 良好的接口设计
/**
 * 数据库模块
 * @module database
 */

// 私有变量和函数
const pool = createConnectionPool();
function formatResult(rows) { /* ... */ }

// 公共API - 清晰的命名和一致的返回模式
/**
 * 查询单个记录
 * @param {string} sql - SQL查询
 * @param {Array} params - 查询参数
 * @returns {Promise<Object|null>} 查询结果
 */
async function findOne(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows.length ? formatResult(rows[0]) : null;
}

/**
 * 查询多个记录
 * @param {string} sql - SQL查询
 * @param {Array} params - 查询参数 
 * @returns {Promise<Array>} 查询结果数组
 */
async function findMany(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows.map(formatResult);
}

/**
 * 执行更新操作
 * @param {string} sql - SQL更新语句
 * @param {Array} params - 更新参数
 * @returns {Promise< number >} 影响的行数
 */
async function execute(sql, params) {
  const { rowCount } = await pool.query(sql, params);
  return rowCount;
}

// 只导出公共API
module.exports = {
  findOne,
  findMany,
  execute
};
```

#### 3. 错误处理策略

模块应该有统一的错误处理策略：

```js
// api-client.js - 统一的错误处理
/**
 * API客户端模块
 * @module api-client
 */

// 自定义错误类
class ApiError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * 发送API请求
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>} 响应数据
 * @throws {ApiError} 当API请求失败时
 */
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`https://api.example.com/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || '请求失败',
        response.status,
        data
      );
    }
    
    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err; // 重新抛出已格式化的错误
    }
    
    // 处理网络错误等
    throw new ApiError(
      err.message || '网络错误',
      0,
      null
    );
  }
}

// 导出API和错误类
module.exports = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  ApiError // 导出错误类便于消费者处理特定错误
};

// 使用示例
// const api = require('./api-client');
// try {
//   const user = await api.get('users/1');
// } catch (err) {
//   if (err instanceof api.ApiError && err.statusCode === 404) {
//     // 处理"未找到"错误
//   } else {
//     // 处理其他错误
//   }
// }
```

### 模块测试策略

良好的模块设计应该便于测试。

#### 1. 可测试的模块设计

设计模块时考虑其可测试性：

```js
// calculator.js - 设计为可测试
/**
 * 计算器模块
 * @module calculator
 */

/**
 * 加法运算
 * @param {number} a - 第一个操作数
 * @param {number} b - 第二个操作数
 * @returns {number} 和
 */
function add(a, b) {
  return a + b;
}

/**
 * 减法运算
 * @param {number} a - 第一个操作数 
 * @param {number} b - 第二个操作数
 * @returns {number} 差
 */
function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract
};

// calculator.test.js
const { add, subtract } = require('./calculator');

test('add function correctly adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});

test('subtract function correctly subtracts numbers', () => {
  expect(subtract(5, 3)).toBe(2);
  expect(subtract(1, 1)).toBe(0);
  expect(subtract(0, 5)).toBe(-5);
});
```

#### 2. 依赖注入

使用依赖注入使模块更易测试：

```js
// user-service.js - 使用依赖注入
/**
 * 用户服务模块
 * @module user-service
 */

/**
 * 创建用户服务
 * @param {Object} deps - 依赖对象
 * @param {Object} deps.userRepo - 用户仓库
 * @param {Object} deps.mailService - 邮件服务
 * @returns {Object} 用户服务对象
 */
function createUserService(deps = {}) {
  // 提供默认依赖或使用注入的依赖
  const {
    userRepo = require('./user-repository'),
    mailService = require('./mail-service')
  } = deps;
  
  return {
    /**
     * 创建新用户
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>} 创建的用户
     */
    async createUser(userData) {
      const user = await userRepo.create(userData);
      await mailService.sendWelcomeEmail(user.email);
      return user;
    },
    
    /**
     * 查找用户
     * @param {string} id - 用户ID
     * @returns {Promise<Object>} 找到的用户
     */
    findUser(id) {
      return userRepo.findById(id);
    }
  };
}

module.exports = createUserService;

// 在测试中使用mock依赖
// user-service.test.js
test('createUser should create user and send welcome email', async () => {
  // 创建mock依赖
  const mockUserRepo = {
    create: jest.fn().mockResolvedValue({
      id: '123',
      email: 'test@example.com'
    })
  };
  
  const mockMailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true)
  };
  
  // 注入mock依赖
  const userService = createUserService({
    userRepo: mockUserRepo,
    mailService: mockMailService
  });
  
  // 测试函数行为
  const user = await userService.createUser({
    name: 'Test User',
    email: 'test@example.com'
  });
  
  // 验证结果
  expect(user.id).toBe('123');
  expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
  expect(mockMailService.sendWelcomeEmail).toHaveBeenCalledWith('test@example.com');
});
```

### 性能优化策略

合理利用模块系统可以优化应用性能。

#### 1. 懒加载

延迟加载不立即需要的模块，特别是大型或不常用的模块：

```js
// app.js - 使用懒加载
const express = require('express');
const app = express();

// 常用路由立即加载
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// 较大的报表功能懒加载
app.use('/api/reports', (req, res, next) => {
  // 仅在请求到达时加载
  require('./routes/reports')(req, res, next);
});

// 仅管理员使用的功能懒加载
app.use('/api/admin', (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  
  // 只有具有管理员权限的请求才会触发模块加载
  require('./routes/admin')(req, res, next);
});
```

#### 2. 避免循环依赖

循环依赖会导致难以预测的行为和性能问题：

```js
// 避免这种模式
// user.js
const Order = require('./order');
// 使用Order...
module.exports = User;

// order.js
const User = require('./user');
// 使用User...
module.exports = Order;

// 解决方案：重构以消除循环依赖
// 1. 提取共享依赖到第三个模块
// 2. 使用依赖注入
// 3. 重新设计模块边界
```

#### 3. 预加载和缓存

对于频繁使用的模块，可以考虑预加载和缓存：

```js
// app.js - 预加载和预初始化
const config = require('./config');

// 预加载和初始化关键模块
const db = require('./database');
const cache = require('./cache');
const logger = require('./logger');

// 在应用启动时初始化
async function initialize() {
  await db.connect();
  await cache.connect();
  logger.info('应用初始化完成');
  
  // 启动HTTP服务器
  const app = require('./server');
  app.listen(config.port, () => {
    logger.info(`服务器运行在端口 ${config.port}`);
  });
}

initialize().catch(err => {
  console.error('应用初始化失败:', err);
  process.exit(1);
});
```

### 模块安全最佳实践

保护模块和依赖的安全性是现代应用开发的必要考量。

#### 1. 定期更新依赖

使用工具检查和更新依赖项以修复安全漏洞：

```bash
# 检查过时的依赖
npm outdated

# 检查安全漏洞
npm audit

# 修复安全漏洞
npm audit fix
```

#### 2. 输入验证和清理

对模块的输入进行严格验证，防止安全风险：

```js
// 使用验证库如Joi或Zod
const Joi = require('joi');

/**
 * 用户创建架构
 */
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  email: Joi.string().email().required()
});

/**
 * 创建用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<Object>} 创建的用户
 */
async function createUser(userData) {
  // 验证输入
  const { error, value } = userSchema.validate(userData);
  if (error) {
    throw new Error(`验证失败: ${error.message}`);
  }
  
  // 继续处理已验证的数据
  return db.users.create(value);
}
```

#### 3. 安全的模块配置

确保模块的配置不会引入安全风险：

```js
// config.js - 安全配置加载
const fs = require('fs');
const path = require('path');

// 从环境变量加载敏感信息
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // 不要在代码中硬编码密码和密钥!
  },
  // 从文件加载SSL证书
  ssl: {
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  }
};

// 验证配置
function validateConfig(config) {
  // 确保所有必需的配置都存在
  const requiredFields = [
    'database.user', 
    'database.password',
    'ssl.cert',
    'ssl.key'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], config);
    if (!value) {
      throw new Error(`缺少必需的配置: ${field}`);
    }
  }
  
  return config;
}

// 导出验证过的配置
module.exports = validateConfig(config);
```

### 发布与分发最佳实践

如果您正在创建要发布为npm包的模块，请考虑以下最佳实践。

#### 1. 提供双模块格式

同时支持CommonJS和ESM：

```json
// package.json
{
  "name": "my-awesome-lib",
  "version": "1.0.0",
  "description": "一个很棒的库",
  "main": "dist/index.js",         // CommonJS入口
  "module": "dist/index.mjs",      // ESM入口
  "types": "dist/index.d.ts",      // TypeScript类型
  "exports": {
    ".": {
      "require": "./dist/index.js",    // CommonJS
      "import": "./dist/index.mjs",    // ESM
      "types": "./dist/index.d.ts"     // 类型
    },
    "./utils": {
      "require": "./dist/utils.js",
      "import": "./dist/utils.mjs",
      "types": "./dist/utils.d.ts"
    }
  },
  "scripts": {
    "build": "build-script-to-generate-both-formats"
  }
}
```

#### 2. 语义化版本控制

遵循语义化版本控制规范：

- **主版本号（x.0.0）**：不兼容的API变更
- **次版本号（0.x.0）**：向后兼容的功能新增
- **修订号（0.0.x）**：向后兼容的问题修复

```json
{
  "version": "1.2.3",
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

#### 3. 提供清晰的文档

在README中提供清晰的安装和使用指南：

```md
# My Awesome Lib

一个很棒的库，提供了一些很棒的功能。

## 安装

```bash
npm install my-awesome-lib
```

## 使用

### CommonJS
```js
const { doSomething } = require('my-awesome-lib');
doSomething();
```

### ES Modules
```js
import { doSomething } from 'my-awesome-lib';
doSomething();
```

## API

### doSomething()
执行某项操作。返回操作结果。

### doSomethingElse(param)
执行另一项操作。

#### 参数
- `param` (string): 操作参数

#### 返回值
- (Promise<Object>): 操作结果
```

通过遵循这些实战建议和最佳实践，您可以充分利用Node.js模块系统的强大功能，构建高质量、可维护和高性能的应用程序。模块化思想不仅是代码组织的技术手段，更是软件工程思想的体现，对于构建任何规模的应用程序都至关重要。

---

> 参考资料：[Node.js模块官方文档](https://nodejs.org/api/modules.html)