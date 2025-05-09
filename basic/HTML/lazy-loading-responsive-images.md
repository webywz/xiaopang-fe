---
title: 图片懒加载与响应式图片技术
description: 系统讲解图片懒加载与响应式图片的实现原理与优化实践。
---

# 图片懒加载与响应式图片技术

## 简介

图片懒加载与响应式图片技术是提升Web页面加载速度和移动端体验的关键手段。通过按需加载和自适应图片，可以显著减少流量消耗和首屏渲染时间。

## 关键技术点

- 原生`loading="lazy"`属性
- Intersection Observer实现懒加载
- `<picture>`与`srcset`实现响应式图片
- WebP等新格式图片优化
- 图片压缩与CDN加速

## 实用案例与代码示例

### 1. 原生懒加载

```html
<img src="/images/demo.jpg" loading="lazy" alt="示例图片">
```

### 2. Intersection Observer懒加载

```js
/**
 * 使用Intersection Observer实现图片懒加载
 * @param {string} selector 图片选择器
 */
function lazyLoadImages(selector) {
  const images = document.querySelectorAll(selector);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
}
// 调用示例：lazyLoadImages('img[data-src]');
```

### 3. 响应式图片

```html
<picture>
  <source srcset="/images/demo.webp" type="image/webp">
  <source srcset="/images/demo.jpg" type="image/jpeg">
  <img src="/images/demo.jpg" alt="响应式图片示例">
</picture>
```

### 4. 使用srcset和sizes自适应图片

```html
<img src="/images/demo-800.jpg" srcset="/images/demo-400.jpg 400w, /images/demo-800.jpg 800w" sizes="(max-width: 600px) 400px, 800px" alt="自适应图片">
```

## 实践建议

- 优先使用原生`loading="lazy"`，兼容性不足时用JS方案兜底
- 合理设置图片尺寸，避免布局偏移
- 使用WebP等高效图片格式
- 利用CDN分发和压缩图片资源
- 定期检测图片加载性能，优化大图

## 小结

图片懒加载与响应式图片技术是现代Web性能优化的重要组成部分。合理应用可显著提升页面加载速度和移动端体验。 