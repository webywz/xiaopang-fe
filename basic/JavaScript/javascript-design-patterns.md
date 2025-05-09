---
title: JavaScript设计模式实战指南
description: 系统梳理JavaScript常用设计模式及其在实际开发中的应用与实现。
---

# JavaScript设计模式实战指南

## 简介

设计模式是解决软件开发常见问题的通用方案。掌握JavaScript中的设计模式，有助于提升代码的可维护性、可扩展性和复用性。

## 关键技术点

- 单例模式（Singleton）
- 工厂模式（Factory）
- 观察者模式（Observer）
- 发布-订阅模式（Pub/Sub）
- 策略模式（Strategy）
- 装饰器模式（Decorator）

## 实用案例与代码示例

### 1. 单例模式

```js
/**
 * 单例模式实现
 */
const Singleton = (function() {
  let instance;
  /**
   * @constructor
   */
  function createInstance() {
    return { time: Date.now() };
  }
  return {
    getInstance() {
      if (!instance) instance = createInstance();
      return instance;
    }
  };
})();
```

### 2. 工厂模式

```js
/**
 * 工厂模式创建不同类型对象
 * @param {string} type 类型
 * @returns {object}
 */
function ShapeFactory(type) {
  switch(type) {
    case 'circle': return { draw: () => '画圆' };
    case 'square': return { draw: () => '画方' };
    default: return { draw: () => '未知形状' };
  }
}
```

### 3. 观察者模式

```js
/**
 * 观察者模式实现
 */
class Subject {
  constructor() { this.observers = []; }
  /** @param {Function} fn */
  subscribe(fn) { this.observers.push(fn); }
  /** @param {any} data */
  notify(data) { this.observers.forEach(fn => fn(data)); }
}
```

### 4. 发布-订阅模式

```js
/**
 * 发布-订阅模式实现
 */
class PubSub {
  constructor() { this.events = {}; }
  /** @param {string} event @param {Function} fn */
  subscribe(event, fn) {
    (this.events[event] = this.events[event] || []).push(fn);
  }
  /** @param {string} event @param {any} data */
  publish(event, data) {
    (this.events[event] || []).forEach(fn => fn(data));
  }
}
```

### 5. 策略模式

```js
/**
 * 策略模式实现
 */
const strategies = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b
};
function execute(strategy, a, b) {
  return strategies[strategy](a, b);
}
```

### 6. 装饰器模式

```js
/**
 * 装饰器模式为函数添加日志
 * @param {Function} fn
 * @returns {Function}
 */
function withLog(fn) {
  return function(...args) {
    console.log('调用参数:', args);
    return fn.apply(this, args);
  };
}
```

## 实践建议

- 根据实际场景选择合适的设计模式，避免过度设计
- 结合ES6+语法提升模式实现的简洁性
- 通过单元测试保障模式实现的正确性
- 多阅读源码，理解模式在主流库/框架中的应用

## 小结

设计模式是提升JavaScript开发质量的重要工具。合理运用可让代码结构更清晰、扩展性更强。 