---
title: JavaScript装饰器实战指南
description: 解析装饰器语法、应用场景与在类、方法、属性等方面的实战技巧。
---

# JavaScript装饰器实战指南

## 简介

装饰器（Decorator）是ES提案中的一项高级特性，用于对类、方法、属性等进行声明式扩展。装饰器让元编程和AOP（面向切面编程）在JavaScript中变得简单高效。

## 关键技术点

- 装饰器的基本语法与使用场景
- 类装饰器、方法装饰器、属性装饰器
- 装饰器工厂与参数化
- 装饰器与元数据反射（Reflect Metadata）
- 装饰器在主流框架（如TypeScript、NestJS）中的应用

## 实用案例与代码示例

### 1. 类装饰器

```js
/**
 * 类装饰器：为类添加静态属性
 * @param {Function} target
 */
function addVersion(target) {
  target.version = '1.0.0';
}

@addVersion
class MyClass {}
console.log(MyClass.version); // '1.0.0'
```

### 2. 方法装饰器

```js
/**
 * 方法装饰器：为方法添加日志
 * @param {Object} target
 * @param {string} key
 * @param {PropertyDescriptor} descriptor
 */
function log(target, key, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`调用${key}，参数:`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

class User {
  @log
  say(name) { return `Hi, ${name}`; }
}
const u = new User();
u.say('Tom');
```

### 3. 属性装饰器

```js
/**
 * 属性装饰器：为属性添加默认值
 * @param {Object} target
 * @param {string} key
 */
function defaultValue(val) {
  return function(target, key) {
    let value = val;
    Object.defineProperty(target, key, {
      get() { return value; },
      set(v) { value = v; },
      configurable: true,
      enumerable: true
    });
  };
}

class Product {
  @defaultValue(100)
  price;
}
const p = new Product();
console.log(p.price); // 100
```

### 4. 装饰器工厂

```js
/**
 * 装饰器工厂：可传参的装饰器
 */
function role(roleName) {
  return function(target) {
    target.role = roleName;
  };
}

@role('admin')
class Admin {}
console.log(Admin.role); // 'admin'
```

## 实践建议

- 推荐在TypeScript等支持装饰器的环境下使用
- 合理拆分装饰器逻辑，提升可复用性
- 注意装饰器执行顺序和作用域
- 关注装饰器提案进展，避免生产环境滥用

## 小结

装饰器为JavaScript带来了声明式元编程能力。合理运用可极大提升代码的可读性、扩展性和可维护性。 