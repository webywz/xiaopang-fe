---
layout: doc
title: CSS代码分割与按需加载
description: 深入解析CSS代码分割、异步加载与按需加载的原理、方案与实战技巧，助你提升Web性能。
---

# CSS代码分割与按需加载

随着Web应用体积增大，CSS代码分割与按需加载成为性能优化的重要手段。本文将系统讲解其原理、主流方案与实战技巧。

## 目录

- [为什么要进行CSS代码分割](#为什么要进行css代码分割)
- [常见分割与加载方案](#常见分割与加载方案)
- [异步加载与按需加载实现](#异步加载与按需加载实现)
- [主流框架中的实践](#主流框架中的实践)
- [最佳实践与注意事项](#最佳实践与注意事项)

## 为什么要进行CSS代码分割

- 降低首屏加载体积，加快渲染速度
- 按需加载，提升交互体验
- 便于维护与扩展

## 常见分割与加载方案

- 多入口CSS文件，按页面/模块拆分
- Webpack、Vite等工具自动分割
- 动态import与懒加载

```js
// Webpack配置示例
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
```

## 异步加载与按需加载实现

- 利用JS动态插入<link>标签
- React/Vue等框架结合路由懒加载

```js
/**
 * 动态加载CSS文件
 * @param {string} href CSS文件路径
 */
function loadCSS(href) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}
```

## 主流框架中的实践

- React: React.lazy + Suspense + 动态import
- Vue: 路由懒加载 + 异步组件

```js
// React路由懒加载示例
const Home = React.lazy(() => import('./Home'));
```

## 最佳实践与注意事项

- 关键CSS优先内联，非关键CSS异步加载
- 合理拆分粒度，避免过度分割
- 监控CSS加载时序，防止闪烁（FOUC）

---

> 参考资料：[MDN CSS异步加载](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Optimizing_CSS_delivery) 