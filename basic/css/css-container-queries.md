---
layout: doc
title: CSS容器查询：响应式设计的未来
description: 全面解析CSS容器查询(Container Queries)的原理、语法、应用场景与最佳实践，助你实现更灵活的响应式组件。
---

# CSS容器查询：响应式设计的未来

容器查询（Container Queries）是CSS响应式设计的重大进步，使组件能根据自身容器大小自适应，而非仅依赖视口。本文将介绍其原理、语法、应用场景与实战技巧。

## 目录

- [容器查询的基本原理](#容器查询的基本原理)
- [核心语法与用法](#核心语法与用法)
- [典型应用场景](#典型应用场景)
- [实战案例与技巧](#实战案例与技巧)
- [兼容性与注意事项](#兼容性与注意事项)

## 容器查询的基本原理

传统媒体查询基于视口宽度，容器查询则基于元素自身的尺寸，适合组件化开发。

## 核心语法与用法

### 定义容器

```css
.card {
  container-type: inline-size;
  container-name: card;
}
```

### 使用容器查询

```css
@container card (min-width: 400px) {
  .card-title {
    font-size: 2rem;
  }
}
```

- `container-type`：指定容器类型（如`inline-size`）
- `container-name`：命名容器，便于复用
- `@container`：编写基于容器的条件样式

## 典型应用场景

- 组件在不同父容器下自适应（如卡片、侧边栏、弹窗）
- 复杂布局中嵌套组件的响应式适配

## 实战案例与技巧

### 响应式卡片组件

```css
.card {
  container-type: inline-size;
  width: 100%;
  max-width: 600px;
}
@container (max-width: 400px) {
  .card-title {
    font-size: 1.2rem;
  }
  .card-content {
    padding: 8px;
  }
}
@container (min-width: 401px) {
  .card-title {
    font-size: 2rem;
  }
  .card-content {
    padding: 24px;
  }
}
```

### 动态切换布局

```js
/**
 * 检测容器宽度并动态切换样式
 * @param {HTMLElement} el 目标元素
 */
function updateCardLayout(el) {
  const width = el.offsetWidth;
  if (width < 400) {
    el.classList.add('card-small');
    el.classList.remove('card-large');
  } else {
    el.classList.add('card-large');
    el.classList.remove('card-small');
  }
}
```

## 兼容性与注意事项

- 容器查询已在主流现代浏览器支持，IE/旧版Edge不支持
- 需为容器元素显式设置`container-type`
- 可与媒体查询、Grid等技术结合

---

> 参考资料：[MDN CSS容器查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Container_Queries) 