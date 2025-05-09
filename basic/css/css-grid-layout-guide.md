---
layout: doc
title: CSS Grid布局完全指南
description: 全面解析CSS Grid布局的基本概念、核心属性、实用技巧与最佳实践，助你掌握现代Web布局新方式。
---

# CSS Grid布局完全指南

CSS Grid是现代Web开发中最强大的布局系统之一，能够实现复杂的二维布局。本文将带你系统学习Grid的核心概念、常用属性、实战技巧与性能优化建议。

## 目录

- [什么是CSS Grid？](#什么是css-grid)
- [Grid容器与项目](#grid容器与项目)
- [核心属性详解](#核心属性详解)
- [常见布局案例](#常见布局案例)
- [响应式设计与Grid](#响应式设计与grid)
- [性能与最佳实践](#性能与最佳实践)
- [常见问题解答](#常见问题解答)

## 什么是CSS Grid？

CSS Grid是一种二维布局系统，可以同时控制行和列。与Flexbox相比，Grid更适合用于整体页面布局或大型组件的结构设计。

```js
/**
 * 创建一个基本的Grid容器
 * @example
 * .container {
 *   display: grid;
 *   grid-template-columns: 1fr 1fr 1fr;
 *   grid-gap: 16px;
 * }
 */
```

## Grid容器与项目

- **Grid容器**：设置`display: grid`或`display: inline-grid`的元素。
- **Grid项目**：Grid容器的直接子元素。

## 核心属性详解

- `grid-template-columns` / `grid-template-rows`：定义列和行的轨道数量与大小。
- `grid-gap` / `gap`：设置行列间距。
- `grid-column` / `grid-row`：项目跨越的行/列范围。
- `justify-items` / `align-items`：项目在单元格内的对齐方式。
- `grid-area`：命名区域，便于复杂布局。

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: 100px auto;
  gap: 12px;
}
.item1 {
  grid-column: 1 / 3;
  grid-row: 1;
}
```

## 常见布局案例

### 圣杯布局

```css
/**
 * 圣杯布局示例
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/
 */
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "left main right"
    "footer footer footer";
}
.header { grid-area: header; }
.left   { grid-area: left; }
.main   { grid-area: main; }
.right  { grid-area: right; }
.footer { grid-area: footer; }
```

### 响应式卡片布局

```css
/**
 * 响应式卡片布局
 * @example
 * .cards {
 *   display: grid;
 *   grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
 *   gap: 20px;
 * }
 */
```

## 响应式设计与Grid

Grid与媒体查询结合，可轻松实现响应式布局。例如：

```css
@media (max-width: 600px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

## 性能与最佳实践

- 尽量使用`gap`而非`margin`分隔项目，简化代码。
- 合理命名区域，提升可维护性。
- 避免嵌套过深，保持布局简洁。

## 常见问题解答

**Q: Grid和Flexbox如何选择？**  
A: Grid适合二维布局（行+列），Flexbox适合一维布局（行或列）。

**Q: 可以和Flexbox混用吗？**  
A: 可以。Grid用于整体结构，Flexbox用于局部细节。

---

> 参考资料：[MDN CSS Grid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout) 