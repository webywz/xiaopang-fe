---
layout: doc
title: WebSocket与Server-Sent Events原理
description: 深入解析WebSocket与SSE的协议原理、浏览器实现与应用场景，助你掌握实时通信技术。
---

# WebSocket与Server-Sent Events原理

WebSocket与Server-Sent Events（SSE）是现代Web实时通信的两大主流方案。本文将系统讲解两者的协议原理、浏览器实现与应用场景。

## 目录

- [WebSocket协议原理](#websocket协议原理)
- [SSE协议原理](#sse协议原理)
- [浏览器实现与API](#浏览器实现与api)
- [应用场景与对比](#应用场景与对比)
- [调试与最佳实践](#调试与最佳实践)

## WebSocket协议原理

- 基于TCP的全双工通信协议，单连接可双向实时收发数据
- 握手阶段通过HTTP/1.1升级协议，后续数据帧独立于HTTP

```js
/**
 * 创建WebSocket连接
 * @param {string} url 服务器地址
 * @returns {WebSocket}
 */
function createWebSocket(url) {
  return new WebSocket(url);
}
```

## SSE协议原理

- 基于HTTP的单向服务器推送协议，客户端自动重连
- 只支持服务器到客户端的消息流，文本格式

```js
/**
 * 创建SSE连接
 * @param {string} url 服务器地址
 * @returns {EventSource}
 */
function createSSE(url) {
  return new EventSource(url);
}
```

## 浏览器实现与API

- WebSocket：`WebSocket`对象，支持二进制、心跳、断线重连需自实现
- SSE：`EventSource`对象，自动重连，支持自定义事件

## 应用场景与对比

| 特性         | WebSocket         | SSE                |
| ------------ | ---------------- | ------------------ |
| 通信方向     | 双向              | 单向（服务器推送） |
| 协议         | 独立于HTTP        | 基于HTTP           |
| 断线重连     | 需自实现          | 自动支持           |
| 二进制支持   | 支持              | 不支持             |
| 浏览器支持   | 主流全支持        | IE不支持           |

## 调试与最佳实践

- Chrome DevTools > Network面板查看WS/SSE连接
- WebSocket需实现心跳与重连机制
- SSE适合轻量推送、兼容性要求不高场景

---

> 参考资料：[MDN WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) | [MDN SSE](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events) 