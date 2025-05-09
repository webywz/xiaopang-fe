---
layout: doc
title: Flexbox与Grid：如何选择合适的布局方案
description: 深度对比Flexbox与Grid的原理、适用场景与最佳实践，助你高效选择现代Web布局方案。
---

# Flexbox与Grid：如何选择合适的布局方案

Flexbox和Grid是现代CSS中最常用的两大布局系统。本文将对比二者的核心原理、适用场景、常见用法与最佳实践，帮助你在实际开发中做出高效选择。

## 目录

- [Flexbox与Grid简介](#flexbox与grid简介)
- [核心原理对比](#核心原理对比)
- [适用场景分析](#适用场景分析)
- [常见布局案例](#常见布局案例)
- [性能与可维护性](#性能与可维护性)
- [最佳实践与选择建议](#最佳实践与选择建议)

## Flexbox与Grid简介

- **Flexbox**（弹性盒布局）：一维布局系统，适合行或列方向的内容分布。
- **Grid**（网格布局）：二维布局系统，适合同时控制行和列的复杂结构。

## 核心原理对比

| 特性         | Flexbox           | Grid             |
| ------------ | ---------------- | ---------------- |
| 维度         | 一维（行或列）    | 二维（行和列）   |
| 布局方式     | 内容驱动         | 网格驱动         |
| 子项定位     | 顺序相关         | 可任意定位       |
| 典型场景     | 导航栏、列表     | 整体页面、复杂组件 |

## 适用场景分析

- **Flexbox适合：**
  - 水平或垂直排列的简单结构
  - 内容数量不定的列表、导航、工具栏
- **Grid适合：**
  - 需要精确控制行列的复杂布局
  - 整体页面结构、仪表盘、卡片瀑布流

## 常见布局案例

### Flexbox实现水平居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
```

### Grid实现九宫格布局

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
}
```

### Flexbox与Grid混合使用

```js
/**
 * 外层用Grid实现整体结构，内层用Flexbox排列内容
 * @example
 * <div class="dashboard">
 *   <div class="sidebar">...</div>
 *   <div class="main">
 *     <div class="toolbar">...</div>
 *     <div class="content">...</div>
 *   </div>
 * </div>
 */
```

## 性能与可维护性

- 两者性能相近，合理使用不会成为瓶颈
- Grid代码更简洁，适合复杂结构
- Flexbox语义清晰，适合一维场景

## 最佳实践与选择建议

- 一维布局优先用Flexbox，二维布局优先用Grid
- 可以混合使用，外层结构用Grid，内层细节用Flexbox
- 关注浏览器兼容性，IE11不支持Grid部分高级特性

---

> 参考资料：[MDN Flexbox](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout) | [MDN Grid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout) 