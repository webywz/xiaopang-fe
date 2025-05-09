---
layout: doc
title: CSS渐变高级技巧与应用
description: 深入解析CSS线性、径向、锥形渐变的原理、语法与高级应用，助你打造丰富多彩的Web视觉效果。
---

# CSS渐变高级技巧与应用

CSS渐变为Web设计带来了丰富的色彩表现力。本文将系统讲解线性渐变、径向渐变、锥形渐变的原理、语法与高级应用技巧。

## 目录

- [渐变类型与基本语法](#渐变类型与基本语法)
- [线性渐变（linear-gradient）](#线性渐变linear-gradient)
- [径向渐变（radial-gradient）](#径向渐变radial-gradient)
- [锥形渐变（conic-gradient）](#锥形渐变conic-gradient)
- [实战案例与技巧](#实战案例与技巧)
- [性能与兼容性](#性能与兼容性)

## 渐变类型与基本语法

- `linear-gradient`：线性渐变
- `radial-gradient`：径向渐变
- `conic-gradient`：锥形渐变（现代浏览器支持）

```css
.bg-linear {
  background: linear-gradient(90deg, #2196f3, #e91e63);
}
.bg-radial {
  background: radial-gradient(circle, #ff9800, #4caf50 80%);
}
.bg-conic {
  background: conic-gradient(from 90deg, #f44336, #2196f3, #f44336);
}
```

## 线性渐变（linear-gradient）

- 可设置角度、方向、多个色标
- 支持透明度、重复渐变

```css
.button {
  background: linear-gradient(135deg, #42a5f5 0%, #ab47bc 100%);
}
```

## 径向渐变（radial-gradient）

- 以圆心为起点向外扩散
- 可设置形状（circle/ellipse）、位置、半径

```css
.avatar {
  background: radial-gradient(circle at 70% 30%, #fff, #2196f3 80%);
}
```

## 锥形渐变（conic-gradient）

- 沿圆心旋转形成色环
- 适合仪表盘、进度环等视觉效果

```css
.pie {
  background: conic-gradient(from 0deg, #4caf50 0% 40%, #e91e63 40% 100%);
}
```

## 实战案例与技巧

### 渐变边框

```css
.card {
  border: 4px solid transparent;
  border-image: linear-gradient(90deg, #42a5f5, #ab47bc) 1;
}
```

### 渐变文字

```css
.text-gradient {
  background: linear-gradient(90deg, #ff9800, #e91e63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 动态渐变动画

```css
@keyframes gradient-move {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.animated-bg {
  background: linear-gradient(270deg, #42a5f5, #ab47bc, #42a5f5);
  background-size: 200% 200%;
  animation: gradient-move 3s linear infinite;
}
```

## 性能与兼容性

- 渐变为纯CSS实现，性能优良
- `conic-gradient`需现代浏览器支持，IE不支持

---

> 参考资料：[MDN CSS渐变](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient) 