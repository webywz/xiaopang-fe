---
layout: doc
title: 使用CSS创建沉浸式3D效果
description: 全面解析CSS 3D变换、透视与动画的原理、用法与实战技巧，助你打造沉浸式Web 3D视觉体验。
---

# 使用CSS创建沉浸式3D效果

CSS 3D变换为Web开发带来了全新的视觉表现力。本文将系统讲解3D变换、透视、动画的原理、用法与实战技巧。

## 目录

- [CSS 3D变换原理](#css-3d变换原理)
- [核心属性与用法](#核心属性与用法)
- [3D透视与空间感](#3d透视与空间感)
- [实战案例与技巧](#实战案例与技巧)
- [性能与兼容性](#性能与兼容性)

## CSS 3D变换原理

CSS 3D变换通过`transform`属性实现元素在三维空间的旋转、缩放、平移等操作。

## 核心属性与用法

- `transform: rotateX|rotateY|rotateZ`：绕X/Y/Z轴旋转
- `transform: translateZ`：沿Z轴平移
- `transform-style: preserve-3d`：保留3D子元素

```css
.cube {
  transform: rotateX(30deg) rotateY(45deg) translateZ(50px);
  transform-style: preserve-3d;
}
```

## 3D透视与空间感

- `perspective`：为容器设置透视距离，增强空间感
- `perspective-origin`：设置视角原点

```css
.scene {
  perspective: 800px;
  perspective-origin: 50% 50%;
}
.cube {
  transform: rotateY(30deg);
}
```

## 实战案例与技巧

### 3D卡片翻转动画

```css
.card {
  perspective: 1000px;
}
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card:hover .card-inner {
  transform: rotateY(180deg);
}
.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}
.card-back {
  transform: rotateY(180deg);
}
```

### 3D立方体动画

```js
/**
 * 动态旋转立方体
 * @param {HTMLElement} el 立方体元素
 * @param {number} degX X轴角度
 * @param {number} degY Y轴角度
 */
function rotateCube(el, degX, degY) {
  el.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg)`;
}
```

## 性能与兼容性

- 3D变换会触发硬件加速，性能较好，但不建议大面积使用
- 旧版IE不支持3D变换，移动端兼容性良好

---

> 参考资料：[MDN CSS 3D变换](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function) 