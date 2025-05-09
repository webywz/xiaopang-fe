---
layout: doc
title: 内容安全策略(CSP)实践指南
description: 全面解析CSP的原理、配置方法、常见用法与安全最佳实践，助你防御XSS等Web攻击。
---

# 内容安全策略(CSP)实践指南

内容安全策略（Content Security Policy, CSP）是Web防御XSS等攻击的重要机制。本文将系统讲解CSP的原理、配置方法、常见用法与安全最佳实践。

## 目录

- [CSP原理与作用](#csp原理与作用)
- [CSP核心指令详解](#csp核心指令详解)
- [常见配置与用法](#常见配置与用法)
- [调试与兼容性](#调试与兼容性)
- [安全最佳实践](#安全最佳实践)

## CSP原理与作用

内容安全策略是一种浏览器安全机制，通过严格限制资源来源防止常见的Web攻击：

- 通过HTTP响应头或meta标签声明允许的资源加载源
- 浏览器强制执行这些限制，拦截违规的资源加载
- 有效防止XSS、数据注入、点击劫持等多种攻击
- 减轻攻击者即使找到XSS漏洞后的影响范围

### CSP的工作原理

CSP的核心思想是"白名单机制"，明确指定哪些源是可信的：

```js
/**
 * CSP工作原理示意
 * @param {Request} request 请求对象
 * @param {Response} response 响应对象
 */
function cspMechanism(request, response) {
  // 1. 服务器在响应中设置CSP策略
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted-cdn.com"
  );
  
  // 2. 浏览器加载页面，解析CSP策略
  
  // 3. 浏览器根据CSP规则检查每个资源
  function browserEnforcement(resource) {
    if (!isAllowedByCSP(resource)) {
      // 4. 阻止违规资源加载
      console.error('违反CSP策略: 阻止加载', resource.url);
      // 5. 可选：发送违规报告
      sendViolationReport();
      return false;
    }
    return true;
  }
}
```

### CSP的保护范围

CSP可以防护的安全威胁包括：

- **XSS攻击**：限制脚本执行来源，阻止内联脚本
- **数据注入攻击**：限制可加载资源的域名和协议
- **点击劫持**：使用frame-ancestors指令控制页面是否可被嵌入
- **混合内容**：可强制所有资源使用HTTPS
- **资源滥用**：防止网站资源被第三方滥用

## CSP核心指令详解

CSP通过一系列指令控制不同类型资源的加载源：

### 基础资源加载指令

```js
/**
 * CSP基础资源指令解析
 * @returns {Object} CSP指令及其作用
 */
function cspDirectiveExplanation() {
  return {
    // 基础指令
    'default-src': '所有资源的默认策略，当特定资源类型没有指定策略时使用此项',
    'script-src': 'JavaScript文件及内联脚本的允许来源',
    'style-src': 'CSS样式表及内联样式的允许来源',
    'img-src': '图片资源的允许来源',
    'font-src': '字体文件的允许来源',
    'connect-src': 'XHR、WebSocket、Fetch等连接的允许目标',
    'media-src': '音频和视频资源的允许来源',
    'object-src': 'Flash和其他插件的允许来源',
    'child-src': 'web workers和嵌套浏览上下文(如iframe)的允许来源',
    'frame-src': '框架的允许来源（优先于child-src）',
    'worker-src': 'Web Worker的允许来源',
    'manifest-src': 'Web应用清单文件的允许来源'
  };
}
```

### 特殊指令

```js
/**
 * CSP特殊指令解析
 * @returns {Object} CSP特殊指令及其作用
 */
function cspSpecialDirectives() {
  return {
    // 文档指令
    'base-uri': '限制<base>标签的URL',
    'sandbox': '对页面应用沙箱限制，类似iframe的sandbox属性',
    'form-action': '限制表单提交的目标URL',
    
    // 导航指令
    'navigate-to': '限制页面可导航到的URL',
    'frame-ancestors': '控制哪些父页面可以嵌入当前页面（可替代X-Frame-Options）',
    
    // 报告指令
    'report-uri': '指定违规报告的提交URL（已逐渐被report-to取代）',
    'report-to': '指定违规报告的提交端点（支持更复杂的报告配置）'
  };
}
```

### 指令值语法

CSP指令的值有多种形式：

- **主机源**：
  - `'self'`：当前域名
  - `example.com`：特定域名
  - `*.example.com`：特定域的所有子域
  - `https://example.com`：特定协议+域名
  - `https:`：任何使用HTTPS协议的源
  - `*`：任何来源（谨慎使用）

- **特殊关键字**：
  - `'none'`：不允许任何源
  - `'unsafe-inline'`：允许内联脚本/样式（不推荐）
  - `'unsafe-eval'`：允许eval等动态代码执行（不推荐）
  - `'strict-dynamic'`：允许受信任脚本动态加载的脚本
  - `'nonce-{随机值}'`：允许特定nonce值的内联资源
  - `'sha256-{哈希值}'`：允许特定哈希匹配的内联资源

## 常见配置与用法

### 基础安全配置

最简单但有效的CSP配置：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none';
```

这个配置：
- 仅允许同域资源加载（默认）
- 脚本仅允许同域及指定CDN
- 完全禁止插件内容（如Flash）

### 使用Meta标签

当无法修改服务器响应头时，可使用meta标签：

```html
<!-- meta标签方式 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src *; script-src 'self' https://trusted-cdn.com">
```

### 使用Nonce和Hash

更安全的内联脚本控制方法：

```js
/**
 * 使用nonce的CSP示例
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象 
 */
function nonceBasedCSP(req, res) {
  // 1. 生成随机nonce值
  const nonce = require('crypto').randomBytes(16).toString('base64');
  
  // 2. 设置CSP头
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}'`
  );
  
  // 3. 在HTML中使用nonce
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSP Nonce Demo</title>
    </head>
    <body>
      <!-- 此脚本允许执行，因为有匹配nonce -->
      <script nonce="${nonce}">
        console.log('这个脚本可以执行');
      </script>
      
      <!-- 此脚本被阻止，无nonce -->
      <script>
        console.log('这个脚本被CSP阻止');
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
}
```

使用哈希值允许特定内联脚本：

```js
/**
 * 计算脚本的SHA哈希值
 * @param {string} scriptContent 脚本内容
 * @returns {string} 哈希值
 */
function calculateScriptHash(scriptContent) {
  const crypto = require('crypto');
  const hash = crypto
    .createHash('sha256')
    .update(scriptContent)
    .digest('base64');
  return `'sha256-${hash}'`;
}

// 示例用法:
const scriptContent = "console.log('Hello, CSP!');";
const hash = calculateScriptHash(scriptContent);
// 设置CSP: `script-src 'self' ${hash}`
```

### 报告模式

在实施严格CSP前先进行测试：

```js
/**
 * CSP报告模式配置
 */
function cspReportOnlyMode(req, res) {
  // 仅报告违规，不阻止加载
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    `
      default-src 'self';
      script-src 'self' https://cdn.example.com;
      report-uri /csp-violation-report;
    `
  );
  
  // 处理CSP违规报告
  app.post('/csp-violation-report', (req, res) => {
    console.log('CSP违规:', req.body);
    // 将违规记录保存到日志系统
    logViolation(req.body);
    res.status(204).end();
  });
}
```

## 调试与兼容性

### CSP调试技巧

开发过程中调试CSP问题的方法：

```js
/**
 * CSP调试最佳实践
 */
function cspDebuggingTips() {
  // 1. 使用浏览器开发工具
  // Chrome: DevTools > Console (查看CSP违规消息)
  // Chrome: DevTools > Security (查看CSP策略详情)
  
  // 2. 使用报告模式收集违规
  setHeader('Content-Security-Policy-Report-Only', policy);
  
  // 3. 实时监测违规
  const endpoint = {
    endpoints: [{
      url: '/csp-report'
    }],
    max_age: 86400
  };
  
  setHeader('Report-To', JSON.stringify(endpoint));
  setHeader('Content-Security-Policy', 
    'default-src \'self\'; report-to csp-endpoint');
}
```

### 浏览器兼容性

CSP浏览器支持情况：

- 所有现代浏览器（Chrome、Firefox、Safari、Edge）支持CSP Level 2
- 较新的浏览器支持CSP Level 3
- IE11仅部分支持旧版CSP，需谨慎使用
- 注意一些新指令（如navigate-to）可能只有最新浏览器支持

```js
/**
 * 浏览器兼容CSP实现
 */
function browsersCompatibility() {
  // CSP Level 1 - 广泛支持
  const cspLevel1 = `
    default-src 'self';
    script-src 'self' https://cdn.example.com;
    style-src 'self' https://cdn.example.com;
    img-src 'self' data:;
  `;
  
  // CSP Level 2 - 现代浏览器支持
  const cspLevel2 = `
    default-src 'self';
    script-src 'self' 'nonce-{随机值}';
    style-src 'self';
  `;
  
  // CSP Level 3 - 最新浏览器支持
  const cspLevel3 = `
    default-src 'self';
    script-src 'self' 'strict-dynamic';
    navigate-to 'self';
  `;
}
```

### 渐进增强实施

针对不同浏览器渐进增强CSP实施：

1. 从报告模式开始，收集实际违规
2. 先实施基本限制，如限制script-src和object-src
3. 逐步增加严格限制，如移除unsafe-inline
4. 最后添加更高级特性，如strict-dynamic

## 安全最佳实践

### 基本原则

```js
/**
 * CSP安全最佳实践
 * @returns {Object} 最佳实践列表
 */
function cspBestPractices() {
  return {
    '禁用不安全指令': '避免使用\'unsafe-inline\'和\'unsafe-eval\'',
    '最小化信任范围': '尽可能缩小允许的源列表，避免使用通配符',
    '使用nonce或哈希': '使用随机nonce或哈希值而非unsafe-inline',
    '禁用危险源': '设置object-src \'none\'禁用插件',
    '部署报告系统': '配置report-uri/report-to并监控违规',
    '结合其他安全头': '同时使用X-Content-Type-Options等其他安全响应头',
    '定期审查和更新': '随应用变化更新CSP策略'
  };
}
```

### 高级配置示例

具有较高安全性的CSP配置：

```http
Content-Security-Policy: default-src 'none'; script-src 'self' 'nonce-{随机值}' https://cdn.example.com; connect-src 'self' https://api.example.com; img-src 'self' data:; style-src 'self' https://cdn.example.com; font-src 'self'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; report-uri https://example.com/csp-reports;
```

此配置：
- 采用"默认拒绝"策略（default-src 'none'）
- 只允许必要的资源加载
- 使用nonce控制内联脚本
- 禁止使用iframe嵌入和被嵌入
- 限制表单提交和base标签
- 启用违规报告

### 逃逸与绕过风险

开发者需要注意CSP的一些绕过风险：

```js
/**
 * CSP绕过风险提醒
 */
function cspBypassWarnings() {
  // 1. JSONP端点可能被用于XSS
  const jsonpRisk = "允许访问的域中存在JSONP端点，可能被用于注入脚本";
  
  // 2. 内联事件处理器
  const inlineEventRisk = "内联事件处理器可能绕过script-src策略";
  
  // 3. 动态脚本加载
  const evalRisk = "允许'unsafe-eval'时，攻击者可通过注入字符串实现远程控制";
  
  // 4. 数据泄露风险
  const dataExfilRisk = "宽松的connect-src可能被用于数据窃取";
  
  // 5. CDN子资源完整性
  const SRI = "CDN资源应使用SRI(子资源完整性)保护";
}
```

### CSP与其他安全机制的组合

CSP应与其他安全机制结合使用：

1. **与HTTPS一起使用**：通过Strict-Transport-Security强制使用HTTPS
2. **结合X-Content-Type-Options**：防止MIME类型嗅探
3. **配合X-Frame-Options或frame-ancestors**：防止点击劫持
4. **与子资源完整性(SRI)结合**：防止CDN被攻击后的影响
5. **与其他安全头一起使用**：Referrer-Policy、Feature-Policy等

```js
/**
 * 安全响应头综合配置
 */
function securityHeadersSetup(res) {
  // CSP配置
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' https://cdn.example.com");
  
  // 其他安全响应头
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}
```

---

> 参考资料：
> - [MDN CSP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
> - [Google CSP指南](https://developers.google.com/web/fundamentals/security/csp)
> - [OWASP CSP备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
> - [CSP Evaluator](https://csp-evaluator.withgoogle.com/) 