---
layout: doc
title: 浏览器同源策略详解
description: 全面解析浏览器同源策略的原理、限制、绕过方式与安全实践，助你理解Web安全基石。
---

# 浏览器同源策略详解

同源策略（Same-Origin Policy, SOP）是Web安全的基石。本文将系统讲解同源策略的原理、限制、常见绕过方式与安全实践。

## 目录

- [同源策略原理](#同源策略原理)
- [同源判定规则](#同源判定规则)
- [同源策略的限制范围](#同源策略的限制范围)
- [常见绕过方式与风险](#常见绕过方式与风险)
- [安全实践与防护建议](#安全实践与防护建议)

## 同源策略原理

同源策略是浏览器最核心的安全机制之一，它的基本思想是：

- 由Netscape公司在1995年首次提出，目前已被所有现代浏览器采用
- 限制不同源的文档或脚本如何相互交互，以保护用户数据安全与隐私
- "同源"指协议、域名、端口三者均相同，缺一不可
- 防止恶意网站读取其他网站的敏感数据，如Cookie、DOM、网络请求等

同源策略对Web安全的重要性体现在：

```js
/**
 * 同源策略的安全价值
 * @returns {Object} 各类安全威胁及防护作用
 */
function sopSecurityValues() {
  return {
    '防止信息泄露': '限制恶意站点读取其他站点的数据',
    '防止Cookie窃取': '限制非同源站点读取Cookie',
    '防止DOM操作': '限制非同源iframe等DOM访问',
    '防止请求伪造': '与CORS等机制配合防止恶意请求',
  };
}
```

如果没有同源策略，恶意网站可能会：
- 读取你的邮箱内容或社交媒体信息
- 窃取你在其他网站上保存的凭证
- 对你访问的其他站点执行未授权操作

## 同源判定规则

两个URL必须满足协议、域名和端口完全相同才被视为同源：

```js
/**
 * 判断两个URL是否同源
 * @param {string} url1 第一个URL
 * @param {string} url2 第二个URL
 * @returns {boolean} 是否同源
 */
function isSameOrigin(url1, url2) {
  const a = new URL(url1);
  const b = new URL(url2);
  return a.protocol === b.protocol && a.hostname === b.hostname && a.port === b.port;
}
```

同源判定的实际案例：

| URL A | URL B | 是否同源 | 原因 |
|-------|-------|---------|------|
| https://example.com | https://example.com/page.html | ✅ 是 | 协议、域名、端口相同 |
| https://example.com | http://example.com | ❌ 否 | 协议不同 |
| https://example.com | https://sub.example.com | ❌ 否 | 域名不同 |
| https://example.com | https://example.com:8080 | ❌ 否 | 端口不同 |
| https://example.com:443 | https://example.com | ✅ 是 | HTTPS默认端口是443 |

需要注意的是，路径、查询参数和片段标识符不属于同源检查范围。

## 同源策略的限制范围

同源策略限制了以下跨源交互：

### 1. DOM访问限制

跨源脚本无法访问另一个源的大多数DOM，但存在部分例外：

```js
/**
 * DOM跨源访问限制
 * @param {Window} crossOriginWindow 跨源窗口对象
 */
function domAccessRestrictions(crossOriginWindow) {
  // 允许访问的有限属性
  const location = crossOriginWindow.location; // 只读访问
  crossOriginWindow.location = 'https://example.com'; // 可写入导航到新URL
  
  const frame = document.getElementById('crossOriginFrame');
  
  // 这些操作将抛出错误
  try {
    // 无法访问DOM
    const doc = crossOriginWindow.document; // 错误!
    
    // 无法访问存储
    const localStorage = crossOriginWindow.localStorage; // 错误!
    
    // 无法访问变量
    const variable = crossOriginWindow.someVariable; // 错误!
  } catch (e) {
    console.error('跨源DOM访问被阻止', e);
  }
}
```

### 2. 数据存储访问限制

浏览器存储机制也受同源策略保护：

- Cookie: 默认情况下受同源限制，但可通过设置域和路径扩展可见范围
- LocalStorage/SessionStorage: 严格的同源限制
- IndexedDB: 严格的同源限制
- Cache API: 严格的同源限制

### 3. 网络请求限制

XMLHttpRequest和Fetch API默认只能发送同源请求，跨源请求需要符合CORS规范：

```js
/**
 * 演示网络请求同源限制
 */
async function networkRequestRestrictions() {
  try {
    // 同源请求 - 允许
    const sameOriginResponse = await fetch('/api/data');
    
    // 跨源请求 - 默认被阻止
    const crossOriginResponse = await fetch('https://other-domain.com/api/data');
    
    // 除非服务器配置了正确的CORS响应头
    const corsEnabledResponse = await fetch('https://cors-enabled-api.com/data');
  } catch (e) {
    console.error('跨源请求被阻止', e);
  }
}
```

## 常见绕过方式与风险

业务中确实存在合法的跨源通信需求，浏览器提供了几种安全的绕过方式：

### 1. 跨域资源共享(CORS)

最常用、最规范的跨源通信方式：

```js
/**
 * 服务器CORS配置示例(Node.js Express)
 */
function corsServerConfig() {
  const express = require('express');
  const app = express();
  
  app.use((req, res, next) => {
    // 允许特定源访问
    res.header('Access-Control-Allow-Origin', 'https://trusted-site.com');
    // 允许的HTTP方法
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // 允许的请求头
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // 允许发送凭证(Cookie等)
    res.header('Access-Control-Allow-Credentials', 'true');
    // 预检请求缓存时间
    res.header('Access-Control-Max-Age', '86400');
    
    next();
  });
}
```

### 2. 跨文档消息通信(postMessage)

安全地在窗口、iframe间传递消息：

```js
/**
 * 使用postMessage进行跨源通信
 */
function postMessageExample() {
  // 发送方(父窗口)
  const iframe = document.getElementById('crossOriginFrame');
  iframe.onload = () => {
    iframe.contentWindow.postMessage(
      { type: 'hello', data: { message: 'Hello from parent' } },
      'https://trusted-child.com' // 目标源，务必指定具体域名
    );
  };
  
  // 接收方(iframe内)
  window.addEventListener('message', (event) => {
    // 始终验证消息来源
    if (event.origin !== 'https://trusted-parent.com') {
      console.error('收到来自不可信源的消息');
      return;
    }
    
    console.log('收到消息:', event.data);
    // 可以安全处理消息
  });
}
```

### 3. JSONP(已过时)

利用`<script>`标签没有跨域限制的历史遗留方法，仅支持GET请求且存在安全风险：

```js
/**
 * JSONP跨域请求示例(不推荐使用)
 */
function jsonpExample() {
  // 创建回调函数
  window.handleJsonpResponse = function(data) {
    console.log('JSONP响应:', data);
    // 清理回调
    delete window.handleJsonpResponse;
  };
  
  // 创建script标签
  const script = document.createElement('script');
  script.src = 'https://api.example.com/data?callback=handleJsonpResponse';
  document.body.appendChild(script);
  
  // 安全风险：远程服务器可以注入任意JavaScript
}
```

## 安全实践与防护建议

### 1. 前端安全最佳实践

```js
/**
 * 前端跨源安全最佳实践
 */
function frontendSecurityBestPractices() {
  // 1. 使用postMessage时始终验证来源
  window.addEventListener('message', (event) => {
    if (!isTrustedOrigin(event.origin)) return;
    // 处理消息
  });
  
  // 2. 发送postMessage时明确指定目标源
  iframe.contentWindow.postMessage(data, 'https://exact-target-origin.com');
  
  // 3. 避免使用不安全的跨域技术如JSONP
  
  // 4. 添加额外的CSRF保护
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  fetch('/api/action', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken }
  });
}
```

### 2. 后端安全最佳实践

- 仔细配置CORS头部，只允许必要的源、方法和头部
- 避免使用`Access-Control-Allow-Origin: *`，特别是在需要发送凭证的API中
- 对敏感操作实施额外身份验证层，不仅依赖同源策略
- 实施细粒度的基于Origin的访问控制策略

### 3. iframe安全加固

```js
/**
 * iframe安全加固实践
 */
function iframeSecurityHardening() {
  const iframe = document.createElement('iframe');
  
  // 1. 添加sandbox属性限制功能
  iframe.sandbox = 'allow-scripts allow-same-origin';
  
  // 2. 设置CSP限制资源加载
  // <meta http-equiv="Content-Security-Policy" content="frame-src 'self' https://trusted-source.com">
  
  // 3. 阻止站点被iframe嵌入(防点击劫持)
  // X-Frame-Options: DENY
  // 或使用CSP: frame-ancestors 'none'
  
  document.body.appendChild(iframe);
}
```

### 4. 定期安全审查

- 定期审查跨源资源访问策略
- 使用安全扫描工具检测配置错误
- 进行渗透测试验证同源策略保护有效性
- 保持对新型跨域攻击手段的了解

---

> 参考资料：
> - [MDN 同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)
> - [Web安全标准](https://w3c.github.io/webappsec-secure-contexts/)
> - [OWASP跨域资源共享指南](https://owasp.org/www-project-cheat-sheets/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) 