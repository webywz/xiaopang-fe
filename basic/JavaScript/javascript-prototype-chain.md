---
title: 深入理解JavaScript原型链
description: 全面解析JavaScript原型链的原理、实现机制与开发实战。
---

# 深入理解JavaScript原型链

## 简介

原型链是JavaScript实现继承和对象属性查找的核心机制。理解原型链有助于掌握对象、函数、继承等底层原理，是进阶JavaScript开发的必备知识。

## 关键技术点

- 原型对象（prototype）与__proto__
- 构造函数与原型链关系
- 属性查找与继承机制
- Object.create与原型式继承
- ES6 class与原型链

## 实用案例与代码示例

### 1. 构造函数与原型链

```js
/**
 * 构造函数与原型链示例
 * @constructor
 */
function Animal(name) {
  this.name = name;
}
Animal.prototype.sayHi = function() {
  return `你好，我是${this.name}`;
};
const cat = new Animal('喵喵');
cat.sayHi(); // "你好，我是喵喵"
```

### 2. 属性查找机制

```js
/**
 * 属性查找演示
 */
cat.hasOwnProperty('name'); // true
cat.hasOwnProperty('sayHi'); // false
'sayHi' in cat; // true
```

### 3. Object.create与原型式继承

```js
/**
 * 使用Object.create实现原型式继承
 */
const animal = { canRun: true };
const dog = Object.create(animal);
dog.name = '旺财';
dog.canRun; // true
```

### 4. ES6 class与原型链

```js
/**
 * ES6 class继承与原型链
 */
class Person {
  constructor(name) { this.name = name; }
  greet() { return `Hi, I'm ${this.name}`; }
}
class Student extends Person {
  study() { return `${this.name} 在学习`; }
}
const s = new Student('小明');
s.greet(); // "Hi, I'm 小明"
s.study(); // "小明 在学习"
```

## 实践建议

- 理解prototype与__proto__的区别与联系
- 避免在原型上添加引用类型属性
- 使用Object.create实现更灵活的继承
- 熟悉ES6 class语法，提升代码可读性

## 小结

原型链是JavaScript对象系统的基础。深入理解其原理，有助于编写更高效、可维护的面向对象代码。 