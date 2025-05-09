---
layout: doc
title: 如何减少CSS重排与重绘
description: 深入解析浏览器重排（Reflow）与重绘（Repaint）机制，提供高效减少重排重绘的实用技巧。
---

# 如何减少CSS重排与重绘

重排（Reflow）与重绘（Repaint）是影响页面性能的关键因素。本文将系统讲解其原理、常见触发方式与优化技巧。

## 目录

- [重排与重绘的原理](#重排与重绘的原理)
- [常见触发重排/重绘的操作](#常见触发重排重绘的操作)
- [减少重排与重绘的技巧](#减少重排与重绘的技巧)
- [高效动画与过渡实现](#高效动画与过渡实现)
- [性能监测与调试](#性能监测与调试)

## 重排与重绘的原理

- **重排（Reflow）**：布局阶段，涉及元素尺寸、位置变化，代价较高
- **重绘（Repaint）**：仅涉及外观（如颜色、阴影）变化，代价较低

## 常见触发重排/重绘的操作

- 修改元素尺寸、位置、结构（如增删节点）
- 读取布局属性（如offsetWidth、clientHeight）会强制刷新布局
- 频繁操作样式、批量DOM操作

## 减少重排与重绘的技巧

- 批量修改样式，合并DOM操作
- 使用`class`切换而非逐条修改样式
- 离线操作（如DocumentFragment、display:none）后再插入

```js
/**
 * 批量插入节点，减少重排
 * @param {HTMLElement} parent 父节点
 * @param {HTMLElement[]} children 子节点数组
 */
function appendBatch(parent, children) {
  const frag = document.createDocumentFragment();
  children.forEach(child => frag.appendChild(child));
  parent.appendChild(frag);
}
```

## 高效动画与过渡实现

- 优先使用`transform`和`opacity`，避免触发重排
- 合理使用`will-change`提升动画流畅度

```css
.box {
  transition: transform 0.3s, opacity 0.3s;
}
```

## 性能监测与调试

- 使用Chrome DevTools Performance面板分析重排/重绘
- 利用requestAnimationFrame优化高频操作

---

> 参考资料：[MDN 重排与重绘](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work) 