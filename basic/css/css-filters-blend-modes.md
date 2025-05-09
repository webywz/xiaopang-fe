---
layout: doc
title: CSS滤镜与混合模式实战
description: 深入解析CSS滤镜（filter）与混合模式（mix-blend-mode、background-blend-mode）的原理、用法与实战技巧，助你打造高级视觉效果。
---

# CSS滤镜与混合模式实战

CSS滤镜与混合模式为Web开发带来了丰富的视觉表现力。本文将系统讲解filter、mix-blend-mode、background-blend-mode的原理、用法与实战技巧。

## 目录

- [CSS滤镜（filter）原理与用法](#css滤镜filter原理与用法)
- [常用滤镜效果与组合](#常用滤镜效果与组合)
- [混合模式（blend modes）详解](#混合模式blend-modes详解)
- [实战案例与技巧](#实战案例与技巧)
- [性能与兼容性](#性能与兼容性)

## CSS滤镜（filter）原理与用法

filter属性可为元素添加模糊、灰度、对比度、色相等多种视觉效果。

```css
.img-blur {
  filter: blur(8px);
}
.img-gray {
  filter: grayscale(1);
}
.img-multi {
  filter: brightness(1.2) contrast(1.1) saturate(1.5);
}
```

## 常用滤镜效果与组合

- `blur(px)`：模糊
- `grayscale(%)`：灰度
- `contrast(%)`：对比度
- `brightness(%)`：亮度
- `saturate(%)`：饱和度
- `drop-shadow(x, y, blur, color)`：阴影

## 混合模式（blend modes）详解

- `mix-blend-mode`：设置元素与其下方内容的混合方式
- `background-blend-mode`：设置背景层之间的混合方式

```css
.overlay {
  background: rgba(255,0,0,0.5);
  mix-blend-mode: multiply;
}
.bg-blend {
  background: url(bg.jpg), linear-gradient(#0008, #fff8);
  background-blend-mode: overlay;
}
```

## 实战案例与技巧

### 图片蒙版与高亮

```css
.img-mask {
  filter: brightness(0.7) blur(2px);
  mix-blend-mode: lighten;
}
```

### 文字与图片融合

```css
.text-blend {
  color: #fff;
  mix-blend-mode: difference;
}
```

### 动态滤镜效果

```js
/**
 * 动态调整滤镜
 * @param {HTMLElement} el 目标元素
 * @param {string} value filter值
 */
function setFilter(el, value) {
  el.style.filter = value;
}
```

## 性能与兼容性

- 滤镜和混合模式会增加渲染开销，建议用于小范围或静态内容
- 部分旧版浏览器不支持部分filter或blend mode属性

---

> 参考资料：[MDN CSS滤镜](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter) | [MDN 混合模式](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode) 