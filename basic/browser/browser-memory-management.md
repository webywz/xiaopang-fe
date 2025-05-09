---
layout: doc
title: 浏览器中的内存管理与垃圾回收
description: 深入解析浏览器内存管理、垃圾回收机制与常见内存泄漏，助你编写高效可靠的前端代码。
---

# 浏览器中的内存管理与垃圾回收

内存管理与垃圾回收是保障Web应用性能与稳定性的基础。本文将系统讲解浏览器的内存分配、回收机制与常见内存泄漏问题。

## 目录

- [浏览器内存管理概述](#浏览器内存管理概述)
- [垃圾回收机制原理](#垃圾回收机制原理)
- [常见内存泄漏场景](#常见内存泄漏场景)
- [内存优化与调试技巧](#内存优化与调试技巧)

## 浏览器内存管理概述

- JS引擎自动分配与回收内存（自动垃圾回收）
- 堆（Heap）用于对象、数组等动态分配，栈（Stack）用于基本类型与函数调用

## 垃圾回收机制原理

- **标记-清除（Mark-Sweep）**：标记可达对象，清除不可达对象
- **引用计数**：统计对象被引用次数，引用为0时回收
- **分代回收**：新生代（Scavenge）、老生代（Mark-Sweep/Mark-Compact）

```js
/**
 * 模拟标记-清除GC流程
 * @param {Object[]} objects 所有对象
 * @param {Object} root 根对象
 */
function markAndSweep(objects, root) {
  // 1. 标记所有可达对象
  // 2. 清除未标记对象
}
```

## 常见内存泄漏场景

- 全局变量、闭包未释放
- DOM引用未解除
- 定时器/事件监听未清理
- 缓存过大、未及时清理

## 内存优化与调试技巧

- 避免无用全局变量，及时释放引用
- 组件卸载时清理定时器、事件
- 使用Chrome DevTools Memory面板分析内存快照、查找泄漏

```js
/**
 * 释放事件监听，防止内存泄漏
 * @param {HTMLElement} el 元素
 * @param {string} type 事件类型
 * @param {Function} handler 事件处理函数
 */
function removeListener(el, type, handler) {
  el.removeEventListener(type, handler);
}
```

---

> 参考资料：[MDN 垃圾回收](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management) 