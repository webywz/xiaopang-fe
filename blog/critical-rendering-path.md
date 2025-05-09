---
layout: doc
title: 关键渲染路径与性能优化
description: 深入解析浏览器关键渲染路径、各阶段性能瓶颈与优化策略，助你提升Web页面首屏速度。
---

# 关键渲染路径与性能优化

关键渲染路径（Critical Rendering Path, CRP）决定了页面首屏渲染速度。本文将系统讲解CRP的各阶段、性能瓶颈与优化策略。

## 目录

- [关键渲染路径概述](#关键渲染路径概述)
- [各阶段性能瓶颈](#各阶段性能瓶颈)
- [优化策略与实战](#优化策略与实战)
- [性能监测与工具](#性能监测与工具)

## 关键渲染路径概述

关键渲染路径包括：
1. HTML解析生成DOM树
2. CSS解析生成CSSOM树
3. 合成渲染树（Render Tree）
4. 布局（Layout/Reflow）
5. 绘制（Paint/Repaint）
6. 分层与合成（Compositing）

```js
/**
 * 关键渲染路径主要阶段
 * @returns {string[]}
 */
function getCRPStages() {
  return ['DOM树生成', 'CSSOM树生成', '渲染树合成', '布局', '绘制', '分层与合成'];
}
```

## 各阶段性能瓶颈

- **DOM/CSSOM生成**：大文件、阻塞资源、复杂选择器
- **布局（Reflow）**：频繁DOM操作、样式变更
- **绘制（Repaint）**：大面积阴影、渐变、图片等
- **合成**：过多分层、动画过度

## 优化策略与实战

- 内联关键CSS，异步加载非关键CSS
- 批量DOM操作，减少重排重绘
- 优先使用transform、opacity实现动画
- 图片懒加载、字体异步加载
- 利用HTTP/2多路复用、CDN加速

```js
/**
 * 批量更新样式，减少重排
 * @param {HTMLElement} el 目标元素
 * @param {Object} styles 样式对象
 */
function batchUpdateStyles(el, styles) {
  Object.assign(el.style, styles);
}
```

## 性能监测与工具

- Chrome DevTools > Performance、Coverage
- Lighthouse、WebPageTest
- 使用Performance API自定义埋点

---

> 参考资料：[MDN 关键渲染路径](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Critical_rendering_path) 