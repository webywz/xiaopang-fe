---
layout: doc
title: Subgrid深度解析与应用案例
description: 全面解析CSS Subgrid的原理、语法、应用场景与实战技巧，助你实现更强大的嵌套网格布局。
---

# Subgrid深度解析与应用案例

Subgrid是CSS Grid布局的高级特性，允许子网格继承父网格的轨道定义，实现更强大的嵌套布局。本文将介绍Subgrid的原理、语法、应用场景与实战案例。

## 目录

- [Subgrid的基本原理](#subgrid的基本原理)
- [核心语法与用法](#核心语法与用法)
- [典型应用场景](#典型应用场景)
- [实战案例与技巧](#实战案例与技巧)
- [兼容性与注意事项](#兼容性与注意事项)

## Subgrid的基本原理

传统嵌套Grid无法继承父网格轨道，Subgrid允许子元素直接复用父网格的行或列轨道，提升布局一致性。

## 核心语法与用法

### 启用Subgrid

```css
.parent {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
}
.child {
  display: grid;
  grid-template-columns: subgrid;
}
```

- `grid-template-columns: subgrid`：子网格继承父网格的列轨道
- `grid-template-rows: subgrid`：子网格继承父网格的行轨道

## 典型应用场景

- 表格型布局，子项对齐父级列
- 复杂卡片、面板等嵌套结构

## 实战案例与技巧

### 表格型嵌套布局

```css
.wrapper {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: 12px;
}
.row {
  display: grid;
  grid-template-columns: subgrid;
}
.cell {
  padding: 8px;
  border-bottom: 1px solid #eee;
}
```

### 只继承行或列

```css
.card-list {
  display: grid;
  grid-template-rows: 40px 1fr 40px;
}
.card {
  display: grid;
  grid-template-rows: subgrid;
}
```

## 兼容性与注意事项

- Subgrid已在Firefox、Safari等现代浏览器支持，Chrome需开启实验特性
- 只能用于直接子元素，不能跨层级继承
- 可与Grid其他特性（如area、gap）结合

---

> 参考资料：[MDN Subgrid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout/Subgrid) 