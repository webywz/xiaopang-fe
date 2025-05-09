---
title: ES2022/ES2023新特性解析
description: 系统梳理ES2022与ES2023的核心新特性、语法变化与实用案例。
---

# ES2022/ES2023新特性解析

## 简介

ES2022（ES13）和ES2023（ES14）为JavaScript带来了多项语法和API增强，进一步提升了开发效率和代码可读性。掌握这些新特性有助于编写更现代、健壮的JavaScript代码。

## 关键技术点

- 顶层await
- 类字段与私有方法
- at()方法与findLast/findLastIndex
- Error Cause（错误因由）
- 数组toSorted/toReversed/toSpliced/toWith
- Symbol作为WeakMap/WeakSet键
- ArrayBuffer/TypedArray增强

## 实用案例与代码示例

### 1. 顶层await

```js
/**
 * 顶层await示例（仅在ES模块中可用）
 */
const data = await fetch('/api/data').then(r => r.json());
console.log(data);
```

### 2. 类字段与私有方法

```js
/**
 * 类字段与私有方法
 */
class Counter {
  #count = 0;
  inc() { this.#count++; }
  get value() { return this.#count; }
}
const c = new Counter();
c.inc();
console.log(c.value); // 1
```

### 3. at()方法

```js
/**
 * at()方法支持负索引
 */
const arr = [1, 2, 3];
arr.at(-1); // 3
```

### 4. findLast与findLastIndex

```js
/**
 * findLast/findLastIndex查找最后一个符合条件的元素
 */
const nums = [1, 2, 3, 4, 5];
nums.findLast(x => x % 2 === 0); // 4
nums.findLastIndex(x => x % 2 === 0); // 3
```

### 5. Error Cause

```js
/**
 * Error Cause为错误链路提供更多上下文
 */
try {
  throw new Error('外层错误', { cause: new Error('内层原因') });
} catch (e) {
  console.log(e.cause); // Error: 内层原因
}
```

### 6. toSorted/toReversed/toSpliced/toWith

```js
/**
 * 新增数组方法不会修改原数组
 */
const arr = [3, 1, 2];
const sorted = arr.toSorted(); // [1,2,3]
const reversed = arr.toReversed(); // [2,1,3]
```

## 实践建议

- 新项目优先采用新特性，提升代码可读性与安全性
- 注意新特性在不同环境下的兼容性
- 结合Babel等工具实现向后兼容
- 多阅读官方文档，关注TC39提案进展

## 小结

ES2022/ES2023新特性让JavaScript更强大、更易用。合理运用新语法和API，可大幅提升开发效率和代码质量。 