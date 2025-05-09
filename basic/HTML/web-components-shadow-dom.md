---
title: Web组件与Shadow DOM实战
description: 深入解析Web Components与Shadow DOM的原理、用法及实战案例。
---

# Web组件与Shadow DOM实战

## 简介

Web Components是一组原生Web标准，允许开发者创建可复用、封装良好的自定义元素。Shadow DOM则为组件提供了样式和DOM的隔离，避免样式冲突和全局污染。

## 关键技术点

- 自定义元素（Custom Elements）
- Shadow DOM的创建与样式隔离
- HTML模板（`<template>`）与插槽（`<slot>`）
- 生命周期回调（connectedCallback等）
- 组件通信与属性传递

## 实用案例与代码示例

### 1. 创建自定义元素与Shadow DOM

```js
/**
 * 创建一个带Shadow DOM的自定义按钮组件
 */
class MyButton extends HTMLElement {
  constructor() {
    super();
    /** @type {ShadowRoot} */
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        button { color: #fff; background: #007bff; border: none; padding: 8px 16px; border-radius: 4px; }
      </style>
      <button><slot>默认按钮</slot></button>
    `;
  }
}
customElements.define('my-button', MyButton);
```

### 2. 使用HTML模板与插槽

```html
<my-button>点击我</my-button>
```

### 3. 生命周期回调与属性监听

```js
/**
 * 带属性监听的自定义元素
 */
class HelloUser extends HTMLElement {
  static get observedAttributes() { return ['name']; }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'name') {
      this.shadowRoot.querySelector('span').textContent = newVal;
    }
  }
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<span>${this.getAttribute('name') || '匿名'}</span>`;
  }
}
customElements.define('hello-user', HelloUser);
```

## 实践建议

- 优先使用Shadow DOM实现样式隔离，避免全局污染
- 组件命名建议使用短横线（如my-button）防止冲突
- 结合模板与插槽提升组件灵活性
- 合理拆分组件，提升复用性与可维护性
- 关注Web Components兼容性，必要时使用Polyfill

## 小结

Web Components与Shadow DOM为前端开发带来了原生的组件化能力。合理设计和使用可大幅提升项目的可维护性和可扩展性。 