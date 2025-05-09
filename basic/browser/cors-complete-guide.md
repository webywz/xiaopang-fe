---
layout: doc
title: 跨域资源共享(CORS)完全指南
description: 全面解析CORS的原理、请求流程、常见问题与安全实践，助你掌握前后端分离时代的跨域通信。
---

# 跨域资源共享(CORS)完全指南

CORS（Cross-Origin Resource Sharing）是现代Web安全通信的基础。本文将系统讲解CORS的原理、请求流程、常见问题与安全实践。

## 目录

- [什么是CORS](#什么是cors)
- [同源策略与跨域问题](#同源策略与跨域问题)
- [CORS请求流程详解](#cors请求流程详解)
- [常见配置与代码示例](#常见配置与代码示例)
- [安全风险与最佳实践](#安全风险与最佳实践)

## 什么是CORS

- CORS是一种允许服务器声明哪些源可访问其资源的机制
- 通过设置响应头实现跨域安全通信

## 同源策略与跨域问题

- 同源策略：协议、域名、端口均相同才允许访问
- 跨域场景：API请求、iframe、资源引用等

## CORS请求流程详解

- 简单请求：GET/POST（特定Content-Type），浏览器自动带上Origin头
- 预检请求（Preflight）：复杂请求先发OPTIONS，服务器返回允许的跨域方法和头
- 响应头关键字段：`Access-Control-Allow-Origin`、`Access-Control-Allow-Methods`、`Access-Control-Allow-Headers`、`Access-Control-Allow-Credentials`

```js
/**
 * 发起带CORS的fetch请求
 * @param {string} url 请求地址
 * @returns {Promise<Response>}
 */
function fetchWithCORS(url) {
  return fetch(url, { credentials: 'include' });
}
```

## 常见配置与代码示例

### 服务端（Node.js/Express）

```js
// 允许所有源跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});
```

### 前端fetch请求

```js
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});
```

## 安全风险与最佳实践

- 不建议生产环境使用`*`，应指定可信域名
- 跨域携带Cookie需`Access-Control-Allow-Credentials: true`且Origin不能为`*`
- 严格校验请求来源与权限，防止CSRF攻击

---

> 参考资料：[MDN CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS) 