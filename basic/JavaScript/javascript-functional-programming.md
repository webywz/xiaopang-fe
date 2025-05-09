---
title: JavaScript函数式编程指南
description: 系统梳理JavaScript函数式编程的核心思想、常用技巧与实战案例。
---

# JavaScript函数式编程指南

## 简介

函数式编程（Functional Programming, FP）是一种强调函数、不可变性和组合的编程范式。JavaScript天然支持一等函数和高阶函数，适合进行函数式开发。

## 关键技术点

- 纯函数与副作用
- 不可变数据与持久化数据结构
- 高阶函数（map、filter、reduce等）
- 柯里化与函数组合
- 惰性求值与链式调用

## 实用案例与代码示例

### 1. 纯函数

```js
/**
 * 纯函数示例：无副作用、相同输入必有相同输出
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

### 2. 不可变数据

```js
/**
 * 使用扩展运算符实现数组不可变更新
 * @param {any[]} arr
 * @param {any} item
 * @returns {any[]}
 */
function append(arr, item) {
  return [...arr, item];
}
```

### 3. 高阶函数

```js
/**
 * 使用map、filter、reduce处理数组
 */
const nums = [1, 2, 3, 4];
const squares = nums.map(x => x * x);
const evens = nums.filter(x => x % 2 === 0);
const sum = nums.reduce((acc, cur) => acc + cur, 0);
```

### 4. 柯里化与函数组合

```js
/**
 * 柯里化函数
 * @param {Function} fn
 * @returns {Function}
 */
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return (...rest) => curried.apply(this, args.concat(rest));
    }
  };
}

/**
 * 函数组合
 * @param  {...Function} fns
 * @returns {Function}
 */
function compose(...fns) {
  return x => fns.reduceRight((v, f) => f(v), x);
}
```

## 实践建议

- 优先编写纯函数，减少副作用
- 使用不可变数据结构，避免数据共享带来的bug
- 善用高阶函数提升代码简洁性
- 结合Ramda、Lodash/fp等库提升函数式开发效率
- 注意性能，避免过度嵌套和链式调用

## 小结

函数式编程让JavaScript代码更简洁、可测试和易维护。合理运用FP思想，可大幅提升项目质量和开发效率。 