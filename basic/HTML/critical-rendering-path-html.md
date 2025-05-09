---
title: HTML文档的关键渲染路径优化
description: 解析关键渲染路径的原理与优化方法，提升Web页面首屏渲染速度。
---

# HTML文档的关键渲染路径优化

## 简介

关键渲染路径（Critical Rendering Path, CRP）是指浏览器将HTML、CSS和JavaScript等资源转化为可视页面的过程。优化CRP能显著提升首屏渲染速度和用户体验。

## 关键技术点

- 了解CRP的五大阶段：HTML解析、DOM构建、CSSOM构建、渲染树生成、布局与绘制
- 减少关键资源数量和体积
- 优化CSS与JavaScript的加载顺序
- 内联关键CSS，延迟非关键CSS
- 异步/延迟加载非关键JavaScript
- 利用资源预加载提升关键资源获取速度

## 实用案例与代码示例

### 1. 内联关键CSS

```html
<!-- 将首屏关键CSS直接写入HTML -->
<style>
  /* 首屏样式 */
  body { background: #fff; color: #222; }
  .header { height: 60px; }
</style>
```

### 2. 延迟加载非关键CSS

```html
<link rel="preload" href="/css/other.css" as="style" onload="this.rel='stylesheet'">
```

### 3. 异步加载JavaScript

```html
<script src="/js/non-critical.js" defer></script>
```

### 4. 关键渲染路径分析工具

```js
/**
 * 使用Lighthouse分析关键渲染路径
 * @param {string} url 需要分析的页面URL
 */
function analyzeCRP(url) {
  // 推荐使用Chrome DevTools或Lighthouse进行分析
  console.log(`请在Chrome DevTools的Performance面板分析：${url}`);
}
```

## 实践建议

- 优先加载和渲染首屏内容，推迟次要资源
- 精简和合并CSS/JS文件，减少HTTP请求
- 利用工具（如Lighthouse、WebPageTest）定期检测CRP瓶颈
- 关注CLS、LCP等核心Web指标

## 小结

优化关键渲染路径是提升Web页面性能的核心手段。通过合理管理资源加载顺序和内容结构，可极大提升首屏渲染速度和用户体验。 