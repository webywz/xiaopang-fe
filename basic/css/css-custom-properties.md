---
layout: doc
title: CSS变量（自定义属性）实战应用
description: 深入讲解CSS变量（自定义属性）的语法、作用域、动态应用与实际开发场景，助力提升样式复用性与维护性。
---

# CSS变量（自定义属性）实战应用

CSS变量（Custom Properties）为样式开发带来了极大的灵活性和可维护性。本文将系统介绍CSS变量的基础用法、作用域、动态应用及最佳实践。

## 目录

- [什么是CSS变量？](#什么是css变量)
- [基本语法与使用](#基本语法与使用)
- [作用域与继承](#作用域与继承)
- [动态更新与响应式](#动态更新与响应式)
- [实际开发案例](#实际开发案例)
- [最佳实践与注意事项](#最佳实践与注意事项)

## 什么是CSS变量？

CSS变量，也称自定义属性，是以`--`开头的属性，可以在整个文档或局部作用域内复用。

```css
/**
 * 定义和使用CSS变量
 * @example
 * :root {
 *   --main-color: #3498db;
 * }
 * .btn {
 *   color: var(--main-color);
 * }
 */
```

## 基本语法与使用

- 定义变量：`--变量名: 值;`
- 使用变量：`var(--变量名[, 备选值])`

```css
:root {
  --font-size: 16px;
}
.text {
  font-size: var(--font-size);
}
```

## 作用域与继承

CSS变量遵循层叠和继承规则，可以在不同选择器下覆盖。

```css
:root {
  --theme-color: #222;
}
.header {
  --theme-color: #fff;
  color: var(--theme-color);
}
```

## 动态更新与响应式

CSS变量可通过JavaScript动态修改，实现主题切换、响应式等效果。

```js
/**
 * 动态修改CSS变量
 * @param {string} name 变量名
 * @param {string} value 新值
 */
function setCssVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}
// setCssVar('--main-color', '#e74c3c');
```

## 实际开发案例

### 主题切换

```js
/**
 * 切换暗色/亮色主题
 */
function toggleTheme(isDark) {
  setCssVar('--bg-color', isDark ? '#222' : '#fff');
  setCssVar('--text-color', isDark ? '#fff' : '#222');
}
```

### 响应式字体

```css
:root {
  --base-font: 16px;
}
@media (max-width: 600px) {
  :root {
    --base-font: 14px;
  }
}
body {
  font-size: var(--base-font);
}
```

## 最佳实践与注意事项

- 统一在`:root`定义全局变量，便于管理。
- 变量命名建议采用模块化前缀，如`--btn-bg`。
- 兼容性：IE不支持CSS变量，需注意降级处理。

---

> 参考资料：[MDN CSS自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*) 