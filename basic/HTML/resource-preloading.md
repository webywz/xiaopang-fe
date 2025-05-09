---
title: 资源预加载与性能优化
description: 深入解析Web资源预加载技术及其在性能优化中的应用实践。
---

# 资源预加载与性能优化

## 简介

资源预加载是提升Web页面加载速度和用户体验的重要手段。通过合理预加载关键资源，可以减少首屏渲染等待时间，提升整体性能。

## 关键技术点

- `<link rel="preload">`与`<link rel="prefetch">`的区别与用法
- 关键资源优先级管理
- 预加载字体、脚本、样式和图片
- 结合HTTP/2推送资源
- 预加载与懒加载的协同

## 实用案例与代码示例

### 1. 预加载关键CSS和字体

```html
<!-- 预加载CSS -->
<link rel="preload" href="/css/main.css" as="style" onload="this.rel='stylesheet'">
<!-- 预加载字体 -->
<link rel="preload" href="/fonts/icon.woff2" as="font" type="font/woff2" crossorigin>
```

### 2. 预取未来可能用到的资源

```html
<!-- 预取下一个页面的脚本 -->
<link rel="prefetch" href="/js/next-page.js" as="script">
```

### 3. Service Worker缓存预加载

```js
/**
 * 通过Service Worker预缓存资源
 * @param {string[]} urls 需要预缓存的资源列表
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('precache-v1').then(cache => cache.addAll(['/index.html', '/main.css', '/main.js']))
  );
});
```

## 实践建议

- 只预加载首屏和关键渲染资源，避免带宽浪费
- 合理区分preload与prefetch的使用场景
- 监控预加载资源的实际效果，避免阻塞渲染
- 结合Lighthouse等工具分析资源加载顺序

## 小结

资源预加载是Web性能优化的重要组成部分。合理利用预加载技术，能有效提升页面加载速度和用户体验。 