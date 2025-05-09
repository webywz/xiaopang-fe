---
title: JavaScript迭代器与生成器深度解析
description: 详解迭代器协议、生成器语法及其在异步编程、数据流等场景的应用。
---

# JavaScript迭代器与生成器深度解析

## 简介

迭代器（Iterator）和生成器（Generator）是ES6引入的强大特性，极大提升了数据遍历、异步流程控制和自定义数据结构的能力。掌握它们有助于编写更高效、优雅的现代JavaScript代码。

## 关键技术点

- 迭代器协议与可迭代对象
- for...of与解构赋值
- 自定义迭代器实现
- 生成器函数与yield
- 生成器在异步编程中的应用

## 实用案例与代码示例

### 1. 迭代器协议与for...of

```js
/**
 * 自定义可迭代对象
 */
const range = {
  start: 1,
  end: 3,
  [Symbol.iterator]() {
    let cur = this.start;
    return {
      next: () => ({
        value: cur,
        done: cur++ > this.end
      })
    };
  }
};
for (const n of range) {
  console.log(n); // 1, 2, 3
}
```

### 2. 生成器函数

```js
/**
 * 生成器函数基础用法
 */
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
const g = gen();
console.log(g.next()); // { value: 1, done: false }
console.log(g.next()); // { value: 2, done: false }
```

### 3. 生成器与异步流程控制

```js
/**
 * 生成器配合Promise实现异步流程
 * @param {Function} genFunc 生成器函数
 */
function run(genFunc) {
  const gen = genFunc();
  function next(data) {
    const { value, done } = gen.next(data);
    if (done) return value;
    value.then(next);
  }
  next();
}

run(function* () {
  const data = yield fetch('/api/data').then(r => r.json());
  console.log(data);
});
```

### 4. 生成器实现无限序列

```js
/**
 * 生成器实现斐波那契数列
 */
function* fib() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const f = fib();
console.log(f.next().value); // 0
console.log(f.next().value); // 1
console.log(f.next().value); // 1
```

## 实践建议

- 善用for...of遍历可迭代对象，提升代码可读性
- 生成器适合实现复杂数据流和异步控制
- 注意生成器的惰性求值特性，避免内存泄漏
- 结合async/await与生成器提升异步编程体验

## 小结

迭代器与生成器为JavaScript带来了更强的数据遍历和异步控制能力。合理运用可让代码更简洁、灵活和高效。 