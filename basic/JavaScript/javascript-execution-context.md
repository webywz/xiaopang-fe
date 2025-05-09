---
title: JavaScript执行上下文与作用域详解
description: 全面解析JavaScript执行上下文、作用域链与变量提升等核心机制。
---

# JavaScript执行上下文与作用域详解

## 简介

执行上下文和作用域是JavaScript变量查找、函数调用和内存管理的基础。理解它们的原理有助于编写更健壮、可维护的代码。

## 关键技术点

- 执行上下文类型（全局、函数、eval）
- 执行上下文栈与生命周期
- 作用域与作用域链
- 变量提升与函数提升
- 块级作用域（let/const）与暂时性死区

## 实用案例与代码示例

### 1. 执行上下文栈

```js
/**
 * 演示执行上下文栈的入栈与出栈
 */
function foo() {
  function bar() {
    // bar上下文入栈
    return 'bar';
  }
  // foo上下文入栈
  return bar();
}
foo(); // 全局 -> foo -> bar -> foo -> 全局
```

### 2. 作用域链

```js
/**
 * 作用域链变量查找
 */
const a = 1;
function outer() {
  const b = 2;
  function inner() {
    const c = 3;
    return a + b + c; // 作用域链查找a、b、c
  }
  return inner();
}
```

### 3. 变量提升与函数提升

```js
/**
 * 变量提升与函数提升演示
 */
console.log(foo); // [Function: foo]
console.log(bar); // undefined
function foo() {}
var bar = 1;
```

### 4. 块级作用域与暂时性死区

```js
/**
 * let/const的块级作用域与TDZ
 */
{
  // console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
}
```

## 实践建议

- 避免全局变量污染，优先使用局部作用域
- 理解变量提升，避免未定义行为
- 使用let/const代替var，减少作用域相关bug
- 善用闭包实现私有变量

## 小结

执行上下文与作用域是JavaScript运行机制的核心。深入理解其原理，有助于编写更安全、可维护的现代JavaScript代码。 