---
title: JavaScript安全编程最佳实践
description: 系统梳理JavaScript安全风险、常见攻击与防护措施。
---

# JavaScript安全编程最佳实践

## 简介

Web安全是前端开发不可忽视的重要环节。JavaScript作为浏览器端的主要编程语言，面临XSS、CSRF、原型污染等多种安全威胁。掌握安全编程技巧，有助于保障应用和用户数据安全。

## 关键技术点

- XSS（跨站脚本攻击）防护
- CSRF（跨站请求伪造）防护
- 输入校验与输出编码
- 安全的Cookie与本地存储
- 原型污染与依赖安全
- 安全的第三方库使用

## 实用案例与代码示例

### 1. 防止XSS攻击

```js
/**
 * 对用户输入进行HTML转义，防止XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str.replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}
```

### 2. 防止CSRF攻击

```js
/**
 * 发送请求时携带CSRF Token
 */
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCSRFToken()
  },
  body: JSON.stringify({ foo: 'bar' })
});
```

### 3. 安全设置Cookie

```js
/**
 * 设置安全Cookie属性
 */
document.cookie = 'token=xxx; Secure; HttpOnly; SameSite=Strict';
```

### 4. 防止原型污染

```js
/**
 * 严格校验对象属性，防止原型污染
 * @param {object} obj
 * @param {string} key
 * @param {any} value
 */
function safeSet(obj, key, value) {
  if (['__proto__', 'constructor', 'prototype'].includes(key)) return;
  obj[key] = value;
}
```

## 实践建议

- 所有用户输入都需校验和转义
- 使用Content Security Policy（CSP）防止XSS
- 请求需带CSRF Token，避免跨站请求伪造
- Cookie应设置Secure、HttpOnly、SameSite属性
- 定期升级依赖，关注第三方库安全
- 采用自动化工具检测安全漏洞

## 小结

安全是Web开发的底线。通过规范编码和多层防护，可有效降低JavaScript应用的安全风险。 