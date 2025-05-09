---
layout: doc
title: 浏览器缓存机制详解
description: 全面解析浏览器缓存的类型、原理、控制策略与优化技巧，助你提升Web性能与用户体验。
---

# 浏览器缓存机制详解

浏览器缓存是提升Web性能的关键机制。本文将系统讲解缓存的类型、原理、控制策略与优化技巧。

## 目录

- [浏览器缓存类型概述](#浏览器缓存类型概述)
- [强缓存与协商缓存原理](#强缓存与协商缓存原理)
- [缓存控制策略与Header](#缓存控制策略与header)
- [缓存失效与更新机制](#缓存失效与更新机制)
- [优化技巧与调试工具](#优化技巧与调试工具)

## 浏览器缓存类型概述

- **强缓存**：无需请求服务器，直接使用本地缓存（如Expires、Cache-Control: max-age）
- **协商缓存**：需向服务器验证缓存有效性（如Last-Modified/If-Modified-Since、ETag/If-None-Match）
- **其他缓存**：Service Worker、Cache Storage、IndexedDB等

## 强缓存与协商缓存原理

- 强缓存命中时直接返回本地资源，状态码200（from disk/memory cache）
- 协商缓存需与服务器通信，若未变更返回304

```js
/**
 * 检查资源是否命中强缓存
 * @param {Response} res fetch响应对象
 * @returns {boolean}
 */
function isStrongCache(res) {
  return res.headers.get('Age') !== null || res.headers.get('Cache-Control')?.includes('max-age');
}
```

## 缓存控制策略与Header

- `Cache-Control`：max-age、no-cache、no-store、public、private等
- `Expires`：资源过期时间（HTTP/1.0）
- `ETag`/`Last-Modified`：协商缓存标识

```http
Cache-Control: max-age=3600, public
ETag: "abc123"
```

## 缓存失效与更新机制

- 资源内容变更需更新ETag/Last-Modified，或更改文件名（hash）
- Service Worker可实现更灵活的缓存更新策略

## 优化技巧与调试工具

- 合理设置缓存Header，提升命中率
- 静态资源采用文件指纹（hash）防止误缓存
- Chrome DevTools > Network面板分析缓存命中与失效

---

> 参考资料：[MDN 浏览器缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching) 