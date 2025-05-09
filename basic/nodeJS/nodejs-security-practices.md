---
layout: doc
title: Node.js应用安全最佳实践
description: 全面解析Node.js安全风险、常见攻击防御、依赖管理与安全开发实践，助你构建健壮可靠的后端服务。
---

# Node.js应用安全最佳实践

Node.js应用安全是后端开发的重中之重。本文将系统讲解Node.js安全风险、常见攻击防御、依赖管理与安全开发实践。

## 目录

- [常见安全风险与攻击类型](#常见安全风险与攻击类型)
- [输入校验与输出转义](#输入校验与输出转义)
- [依赖管理与漏洞修复](#依赖管理与漏洞修复)
- [认证与权限控制](#认证与权限控制)
- [密码存储与敏感数据保护](#密码存储与敏感数据保护)
- [安全中间件与HTTP头部防护](#安全中间件与HTTP头部防护)
- [服务器端环境安全](#服务器端环境安全)
- [实战建议与最佳实践](#实战建议与最佳实践)

## 常见安全风险与攻击类型

Node.js应用面临多种安全风险，了解这些风险是防御的第一步：

### 注入攻击

```js
/**
 * SQL注入示例与防御
 */
// 不安全的查询方式
function unsafeQuery(username) {
  // 危险：直接拼接用户输入
  return db.query(`SELECT * FROM users WHERE username = '${username}'`);
}

// 安全的参数化查询
function safeQuery(username) {
  // 安全：使用参数化查询
  return db.query('SELECT * FROM users WHERE username = ?', [username]);
}

/**
 * 命令注入示例与防御
 */
// 不安全的命令执行
const { exec } = require('child_process');
function unsafeExec(fileName) {
  // 危险：直接拼接用户输入到系统命令
  return exec(`find /data -name ${fileName}`);
}

// 安全的命令执行
const { spawn } = require('child_process');
function safeExec(fileName) {
  // 安全：使用spawn并传递参数数组
  return spawn('find', ['/data', '-name', fileName]);
}
```

### 跨站脚本攻击(XSS)

```js
/**
 * XSS攻击示例与防御
 * @param {string} userInput 用户输入
 * @returns {string} 安全处理后的输出
 */
const escapeHTML = (userInput) => {
  return userInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 使用DOMPurify库(客户端)
const DOMPurify = require('dompurify');
function sanitizeHTML(userHTML) {
  return DOMPurify.sanitize(userHTML);
}

// 服务端HTML净化
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurifyServer = createDOMPurify(window);

function sanitizeHTMLServer(userHTML) {
  return DOMPurifyServer.sanitize(userHTML);
}
```

### 跨站请求伪造(CSRF)

```js
/**
 * Express中的CSRF防护
 */
const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();

// 解析Cookie
app.use(cookieParser());

// 使用CSRF中间件
const csrfProtection = csrf({ cookie: true });

// 为表单路由添加CSRF保护
app.get('/form', csrfProtection, (req, res) => {
  // 传递CSRF令牌到视图
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/process', csrfProtection, (req, res) => {
  // POST请求自动验证CSRF令牌
  res.send('数据处理成功');
});

// 处理CSRF错误
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF令牌验证失败
    return res.status(403).send('表单已过期或无效，请重试');
  }
  next(err);
});
```

### 原型链污染

```js
/**
 * 原型链污染防护
 */

// 不安全的对象合并
function unsafeMerge(target, source) {
  // 危险：直接递归合并对象
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      unsafeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 安全的对象合并
function safeMerge(target, source) {
  // 安全：阻止修改__proto__和constructor
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue;
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 使用Object.create(null)创建无原型对象
function createSafeObject() {
  return Object.create(null);
}

// 使用JSON解析/序列化阻断原型链污染
function safeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
```

### 拒绝服务攻击(DoS)

```js
/**
 * 正则表达式DoS(ReDoS)防护
 */

// 危险的正则表达式(容易导致灾难性回溯)
const unsafeRegex = /^(a+)+b$/;

// 安全的正则表达式替代方案
const safeRegex = /^a+b$/;

// API限流中间件
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在windowMs内最多100次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: '请求过于频繁，请稍后再试'
});

// 应用限流中间件到所有API路由
app.use('/api/', apiLimiter);

// 更严格的登录限流
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每个IP每小时最多5次失败尝试
  message: '登录失败次数过多，请1小时后再试'
});

app.use('/login', loginLimiter);
```

### 路径遍历

```js
/**
 * 路径遍历(目录穿越)防护
 */
const path = require('path');

// 不安全的文件访问
function unsafeFileAccess(userProvidedPath) {
  // 危险：直接使用用户输入的路径
  const filePath = `/app/public/${userProvidedPath}`;
  return fs.readFileSync(filePath);
}

// 安全的文件访问
function safeFileAccess(userProvidedPath) {
  // 安全：规范化路径并验证
  const safePath = path.normalize(userProvidedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join('/app/public', safePath);
  
  // 验证最终路径是否在允许的目录内
  const publicDir = path.resolve('/app/public');
  const resolvedPath = path.resolve(filePath);
  
  if (!resolvedPath.startsWith(publicDir)) {
    throw new Error('路径访问被拒绝');
  }
  
  return fs.readFileSync(filePath);
}
```

## 输入校验与输出转义

完善的输入校验是确保应用安全的基础：

### 输入校验最佳实践

```js
/**
 * 使用Joi进行输入验证
 */
const Joi = require('joi');

// 定义用户注册验证模式
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': '密码必须包含大小写字母和数字，且长度至少为8位'
    }),
  
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required(),
  
  birthYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear()),
  
  role: Joi.string()
    .valid('user', 'editor', 'admin')
    .default('user')
});

// Express中间件进行请求验证
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        status: 'error',
        errors
      });
    }
    
    // 替换请求体为验证后的数据
    req.body = value;
    next();
  };
}

// 路由使用验证中间件
app.post('/api/users', validateRequest(registerSchema), (req, res) => {
  // 处理已验证的数据
  registerUser(req.body);
  res.status(201).json({ status: 'success' });
});
```

### 高级输入验证策略

```js
/**
 * 不同类型输入的验证策略
 */
const validator = require('validator');

// 验证并清理URL
function validateAndSanitizeUrl(url) {
  // 首先验证是否为URL
  if (!validator.isURL(url, { require_protocol: true })) {
    throw new Error('无效的URL格式');
  }
  
  // 验证URL是否为允许的域
  const allowedDomains = ['example.com', 'api.example.com', 'cdn.example.com'];
  const domain = new URL(url).hostname;
  
  if (!allowedDomains.some(allowed => domain === allowed || domain.endsWith('.' + allowed))) {
    throw new Error('URL域名不在允许列表内');
  }
  
  // 清理URL
  return validator.trim(url);
}

// 验证并清理HTML内容
function validateAndSanitizeHTML(html) {
  // 使用sanitize-html库
  const sanitizeHtml = require('sanitize-html');
  
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => {
        // 强制外部链接在新窗口打开并添加noopener
        if (attribs.href && !attribs.href.startsWith('/')) {
          attribs.target = '_blank';
          attribs.rel = 'noopener noreferrer';
        }
        return { tagName, attribs };
      }
    }
  });
}

// 验证文件上传
function validateFileUpload(file) {
  // 检查文件大小
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('文件大小超过限制');
  }
  
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('不支持的文件类型');
  }
  
  // 检查文件扩展名
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error('不支持的文件扩展名');
  }
  
  // 验证实际文件内容与声明的MIME类型一致
  // 这需要额外的库，如file-type
  // 示例略
  
  return true;
}
```

## 依赖管理与漏洞修复

Node.js应用通常有大量依赖包，如何安全管理这些依赖至关重要：

### 依赖安全检查

```js
/**
 * 依赖安全工具使用示例
 */

// package.json中添加安全扫描脚本
// "scripts": {
//   "audit": "npm audit --audit-level=moderate",
//   "audit:fix": "npm audit fix",
//   "snyk": "snyk test",
//   "snyk:fix": "snyk wizard",
//   "outdated": "npm outdated"
// }

// 持续集成(CI)中的依赖安全检查
// .github/workflows/security.yml
// name: Security Checks
// on: [push, pull_request]
// jobs:
//   security:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v2
//       - uses: actions/setup-node@v2
//         with:
//           node-version: '16'
//       - name: Install dependencies
//         run: npm ci
//       - name: Run npm audit
//         run: npm audit --audit-level=moderate
```

### 锁定依赖版本

```js
/**
 * 依赖锁定与精确管理
 */

// 使用package-lock.json或yarn.lock锁定版本
// 始终提交这些锁文件到代码仓库

// 使用npm ci而非npm install进行安装
// npm ci完全按照package-lock.json安装依赖

// Dockerfile中正确安装依赖
// COPY package.json package-lock.json ./
// RUN npm ci --only=production

// Node.js中手动控制间接依赖
function checkVulnerableLibs() {
  try {
    // 检查lodash版本
    const lodash = require('lodash/package.json');
    const semver = require('semver');
    
    if (semver.lt(lodash.version, '4.17.21')) {
      console.warn('警告: lodash版本低于4.17.21，存在原型污染风险');
    }
    
    // 检查其他关键依赖...
  } catch (error) {
    console.error('依赖检查失败:', error);
  }
}
```

### 依赖治理策略

```js
/**
 * 依赖治理策略实现
 */
class DependencyGovernance {
  /**
   * 建立依赖白名单
   * @returns {Object} 受信任的依赖及其版本
   */
  static getTrustedDependencies() {
    return {
      // 核心依赖
      'express': '^4.17.1',
      'mongoose': '^6.0.0',
      
      // 安全相关
      'helmet': '^5.0.0',
      'jsonwebtoken': '^8.5.1',
      'validator': '^13.6.0',
      
      // 工具类
      'lodash': '^4.17.21',
      'moment': '^2.29.1'
    };
  }
  
  /**
   * 检查依赖是否在白名单中且版本合规
   * @param {Object} dependencies 当前使用的依赖
   * @returns {Array} 不符合规范的依赖列表
   */
  static auditDependencies(dependencies) {
    const trusted = this.getTrustedDependencies();
    const violations = [];
    const semver = require('semver');
    
    for (const [name, version] of Object.entries(dependencies)) {
      // 检查是否在白名单中
      if (!trusted[name]) {
        violations.push({
          name,
          issue: '未在白名单中的依赖',
          severity: 'high'
        });
        continue;
      }
      
      // 检查版本是否符合要求
      const cleanVersion = version.replace(/^\^|~/, '');
      if (!semver.satisfies(cleanVersion, trusted[name])) {
        violations.push({
          name,
          issue: `版本 ${version} 不符合白名单要求 ${trusted[name]}`,
          severity: 'medium'
        });
      }
    }
    
    return violations;
  }
  
  /**
   * 生成依赖风险报告
   */
  static generateRiskReport() {
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const violations = this.auditDependencies(packageJson.dependencies || {});
    const devViolations = this.auditDependencies(packageJson.devDependencies || {});
    
    return {
      timestamp: new Date().toISOString(),
      productionDependencies: {
        total: Object.keys(packageJson.dependencies || {}).length,
        violations: violations.length,
        details: violations
      },
      developmentDependencies: {
        total: Object.keys(packageJson.devDependencies || {}).length,
        violations: devViolations.length,
        details: devViolations
      }
    };
  }
}
```

## 认证与权限控制

认证和授权是安全系统的核心组成部分：

### JWT认证实现

```js
/**
 * JWT认证系统实现
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '7d';

class AuthService {
  /**
   * 生成访问令牌
   * @param {Object} payload 令牌载荷
   * @returns {String} JWT令牌
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'api.myapp.com',
      audience: 'myapp.com',
      subject: payload.id.toString()
    });
  }
  
  /**
   * 生成刷新令牌
   * @param {String} userId 用户ID
   * @returns {String} 刷新令牌
   */
  static generateRefreshToken(userId) {
    return jwt.sign(
      { type: 'refresh' }, 
      JWT_SECRET, 
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'api.myapp.com',
        audience: 'myapp.com',
        subject: userId.toString(),
        jwtid: crypto.randomBytes(16).toString('hex')
      }
    );
  }
  
  /**
   * 验证JWT令牌
   * @param {String} token JWT令牌
   * @returns {Object} 解码后的载荷
   */
  static async verifyToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('令牌已过期');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('无效的令牌');
      }
      throw error;
    }
  }
  
  /**
   * 创建认证中间件
   * @returns {Function} Express中间件
   */
  static authMiddleware() {
    return async (req, res, next) => {
      try {
        // 获取认证头
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            status: 'error',
            message: '未提供认证令牌'
          });
        }
        
        // 提取令牌
        const token = authHeader.split(' ')[1];
        
        // 验证令牌
        const decoded = await this.verifyToken(token);
        
        // 将用户信息添加到请求对象
        req.user = decoded;
        
        next();
      } catch (error) {
        return res.status(401).json({
          status: 'error',
          message: error.message
        });
      }
    };
  }
  
  /**
   * 基于角色的访问控制
   * @param {String[]} allowedRoles 允许的角色列表
   * @returns {Function} Express中间件
   */
  static restrictTo(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: '请先登录'
        });
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: '没有权限执行此操作'
        });
      }
      
      next();
    };
  }
  
  /**
   * 刷新访问令牌
   * @param {String} refreshToken 刷新令牌
   * @returns {Object} 新的令牌对
   */
  static async refreshAccessToken(refreshToken) {
    try {
      // 验证刷新令牌
      const decoded = await this.verifyToken(refreshToken);
      
      // 确认是刷新令牌
      if (decoded.type !== 'refresh') {
        throw new Error('无效的刷新令牌');
      }
      
      // 这里通常要检查令牌是否在黑名单中
      // 略...
      
      // 获取用户信息
      const user = await getUserById(decoded.sub);
      
      if (!user) {
        throw new Error('用户不存在');
      }
      
      // 生成新的令牌对
      return {
        accessToken: this.generateAccessToken({
          id: user.id,
          role: user.role
        }),
        refreshToken: this.generateRefreshToken(user.id)
      };
    } catch (error) {
      throw error;
    }
  }
}

// Express路由示例
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 验证用户
    const user = await authenticateUser(email, password);
    
    // 生成令牌
    const accessToken = AuthService.generateAccessToken({
      id: user.id,
      role: user.role
    });
    
    const refreshToken = AuthService.generateRefreshToken(user.id);
    
    // 保存刷新令牌到数据库或Redis
    // 略...
    
    res.json({
      status: 'success',
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
});

// 受保护的路由
app.get(
  '/api/protected',
  AuthService.authMiddleware(),
  (req, res) => {
    res.json({
      status: 'success',
      message: '受保护的资源访问成功',
      user: req.user
    });
  }
);

// 仅管理员可访问的路由
app.delete(
  '/api/users/:id',
  AuthService.authMiddleware(),
  AuthService.restrictTo('admin'),
  async (req, res) => {
    // 删除用户...
    res.json({
      status: 'success',
      message: '用户删除成功'
    });
  }
);
```

### OAuth 2.0集成

```js
/**
 * OAuth 2.0集成示例
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// 配置Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://myapp.com/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 查找或创建用户
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          role: 'user'
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// 序列化用户
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 反序列化用户
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Express路由
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 成功登录
    const token = AuthService.generateAccessToken({
      id: req.user.id,
      role: req.user.role
    });
    
    // 可以重定向到前端并附加令牌
    res.redirect(`/oauth-success?token=${token}`);
  }
);
```

## 密码存储与敏感数据保护

密码和敏感数据的安全存储是防止数据泄露的关键：

### 密码哈希与存储

```js
/**
 * 密码哈希与验证
 */
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class PasswordManager {
  /**
   * 对密码进行哈希处理
   * @param {string} password 原始密码
   * @returns {Promise<string>} 哈希后的密码
   */
  static async hash(password) {
    // 推荐的bcrypt盐轮次(根据安全需求和硬件性能调整)
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  /**
   * 验证密码
   * @param {string} password 待验证的密码
   * @param {string} hash 存储的哈希值
   * @returns {Promise<boolean>} 验证结果
   */
  static async verify(password, hash) {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * 生成安全随机密码
   * @param {number} length 密码长度，默认16
   * @returns {string} 生成的随机密码
   */
  static generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}:"<>?[];\',./';
    let password = '';
    
    // 生成随机密码
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % charset.length;
      password += charset[randomIndex];
    }
    
    return password;
  }
  
  /**
   * 密码重置令牌生成
   * @returns {Object} 令牌与哈希
   */
  static generateResetToken() {
    // 生成随机令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 哈希存储令牌
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // 设置过期时间(10分钟)
    const resetTokenExpires = Date.now() + 10 * 60 * 1000;
    
    return {
      resetToken,         // 发送给用户
      resetTokenHash,     // 存储到数据库
      resetTokenExpires   // 存储到数据库
    };
  }
}

// Mongoose中实现密码哈希
// userSchema.pre('save', async function(next) {
//   // 仅当密码被修改时才重新哈希
//   if (!this.isModified('password')) return next();
//   
//   try {
//     this.password = await PasswordManager.hash(this.password);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });
```

### 敏感数据加密

```js
/**
 * 数据加密解密服务
 */
const crypto = require('crypto');

class EncryptionService {
  constructor(encryptionKey, ivLength = 16) {
    // 必须是32字节(256位)密钥用于AES-256
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY;
    this.algorithm = 'aes-256-cbc';
    this.ivLength = ivLength;
    
    if (!this.encryptionKey || this.encryptionKey.length !== 32) {
      throw new Error('无效的加密密钥：必须是32字节(256位)');
    }
  }
  
  /**
   * 加密数据
   * @param {string} text 待加密文本
   * @returns {string} 加密后的文本(base64)
   */
  encrypt(text) {
    // 生成随机初始化向量
    const iv = crypto.randomBytes(this.ivLength);
    
    // 创建加密器
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      Buffer.from(this.encryptionKey), 
      iv
    );
    
    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // 将IV与密文拼接，并转为base64
    return Buffer.concat([iv, Buffer.from(encrypted, 'base64')])
      .toString('base64');
  }
  
  /**
   * 解密数据
   * @param {string} encryptedText 加密后的文本(base64)
   * @returns {string} 解密后的原文
   */
  decrypt(encryptedText) {
    // 解码base64
    const buffer = Buffer.from(encryptedText, 'base64');
    
    // 提取IV(前16字节)
    const iv = buffer.slice(0, this.ivLength);
    
    // 提取密文
    const encrypted = buffer.slice(this.ivLength).toString('base64');
    
    // 创建解密器
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      Buffer.from(this.encryptionKey), 
      iv
    );
    
    // 解密数据
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * 加密对象中的敏感字段
   * @param {Object} data 包含敏感字段的对象
   * @param {Array} sensitiveFields 需要加密的字段名数组
   * @returns {Object} 加密后的对象
   */
  encryptFields(data, sensitiveFields) {
    const result = { ...data };
    
    for (const field of sensitiveFields) {
      if (result[field]) {
        result[field] = this.encrypt(result[field].toString());
      }
    }
    
    return result;
  }
  
  /**
   * 解密对象中的敏感字段
   * @param {Object} data 包含加密字段的对象
   * @param {Array} encryptedFields 需要解密的字段名数组
   * @returns {Object} 解密后的对象
   */
  decryptFields(data, encryptedFields) {
    const result = { ...data };
    
    for (const field of encryptedFields) {
      if (result[field]) {
        result[field] = this.decrypt(result[field]);
      }
    }
    
    return result;
  }
}

// 使用示例
// const encryptionKey = crypto.randomBytes(32); // 或从环境变量读取
// const encryptionService = new EncryptionService(encryptionKey);
// 
// // 加密信用卡信息
// const cardData = {
//   number: '4111111111111111',
//   expiry: '12/25',
//   cvv: '123',
//   name: 'John Doe'
// };
// 
// const encryptedData = encryptionService.encryptFields(
//   cardData, 
//   ['number', 'cvv']
// );
// 
// // 数据库中只存储加密后的数据
// await PaymentInfo.create(encryptedData);
// 
// // 读取并解密
// const storedData = await PaymentInfo.findOne({ name: 'John Doe' });
// const decryptedData = encryptionService.decryptFields(
//   storedData.toObject(),
//   ['number', 'cvv']
// );
```

## 安全中间件与HTTP头部防护

配置适当的HTTP安全头部可防止多种常见攻击：

### Helmet中间件配置

```js
/**
 * Helmet安全中间件配置
 */
const express = require('express');
const helmet = require('helmet');

const app = express();

// 基本Helmet配置
app.use(helmet());

// 自定义高安全性配置
app.use(
  helmet({
    // 内容安全策略
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted-cdn.com"],
        styleSrc: ["'self'", "https://trusted-cdn.com", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://trusted-cdn.com"],
        connectSrc: ["'self'", "https://api.myapp.com"],
        fontSrc: ["'self'", "https://trusted-cdn.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
        reportUri: '/csp-report',
      },
    },
    
    // 跨域资源共享
    crossOriginResourcePolicy: { policy: 'same-origin' },
    
    // 跨域嵌入器策略
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    
    // 跨域开放者策略
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-Frame-Options
    frameguard: {
      action: 'deny',
    },
    
    // Referrer-Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // Strict-Transport-Security
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    
    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
    
    // X-XSS-Protection
    xssFilter: true,
  })
);

// 内容安全策略报告处理
app.post('/csp-report', (req, res) => {
  console.log('CSP违规:', req.body);
  
  // 将报告保存到数据库或发送到监控服务
  // saveCSPViolation(req.body);
  
  res.status(204).end();
});
```

### CORS配置

```js
/**
 * CORS安全配置
 */
const cors = require('cors');

// 基本CORS配置
app.use(cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24小时预检请求缓存
}));

// 动态CORS配置
const whitelist = [
  'https://myapp.com',
  'https://admin.myapp.com',
  /\.myapp\.com$/
];

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有origin的请求(如移动应用或Postman)
    if (!origin) return callback(null, true);
    
    // 检查origin是否在白名单中
    const isAllowed = whitelist.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      const msg = `${origin}不在CORS允许列表中`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 为不同路由设置不同的CORS规则
app.options('/api/public', cors()); // 启用预检请求

app.get('/api/public', cors(), (req, res) => {
  // 公开API，任何来源都可访问
  res.json({ message: '公开数据' });
});

app.get('/api/private', cors({ 
  origin: 'https://admin.myapp.com',
  credentials: true
}), (req, res) => {
  // 仅管理员可访问
  res.json({ message: '受保护数据' });
});
```

## 服务器端环境安全

服务器环境配置对于应用安全同样重要：

### 安全环境变量管理

```js
/**
 * 安全环境变量配置
 */
// 使用dotenv加载.env文件
require('dotenv').config();

// 环境变量验证
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

const missingEnvVars = requiredEnvVars.filter(
  envVar => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(`缺少必要的环境变量: ${missingEnvVars.join(', ')}`);
}

// 在生产环境中禁用控制台输出敏感信息
if (process.env.NODE_ENV === 'production') {
  const originalConsoleLog = console.log;
  console.log = function() {
    const args = Array.from(arguments);
    // 过滤敏感信息
    const filteredArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return arg
          .replace(/token=[\w\.\-]+/gi, 'token=[FILTERED]')
          .replace(/password=[\w\.\-]+/gi, 'password=[FILTERED]')
          .replace(/secret=[\w\.\-]+/gi, 'secret=[FILTERED]');
      }
      return arg;
    });
    originalConsoleLog.apply(console, filteredArgs);
  };
}

// 生产环境配置检查
function validateProductionConfig() {
  if (process.env.NODE_ENV === 'production') {
    // 确保在生产环境中使用HTTPS
    if (!process.env.HTTPS || process.env.HTTPS !== 'true') {
      console.warn('警告: 生产环境未启用HTTPS!');
    }
    
    // 确保在生产环境中使用强密钥
    if (
      process.env.JWT_SECRET && 
      process.env.JWT_SECRET.length < 32
    ) {
      console.warn('警告: JWT密钥强度不足!');
    }
    
    // 确保没有开启调试模式
    if (process.env.DEBUG && process.env.DEBUG !== 'false') {
      console.warn('警告: 生产环境开启了调试模式!');
    }
  }
}

validateProductionConfig();
```

### 安全启动脚本

```js
/**
 * 生产环境安全启动脚本
 */
// 启动前的安全检查
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function runSecurityChecks() {
  console.log('执行启动前安全检查...');
  
  // 1. 检查npm审计
  try {
    childProcess.execSync('npm audit --audit-level=high', {
      stdio: 'inherit'
    });
    console.log('✅ 依赖安全检查通过');
  } catch (error) {
    console.error('❌ 发现高风险依赖漏洞，请修复后再启动');
    process.exit(1);
  }
  
  // 2. 检查配置文件权限
  try {
    const envFilePath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envFilePath)) {
      const stats = fs.statSync(envFilePath);
      
      // 检查文件权限(仅Unix系统)
      if (process.platform !== 'win32') {
        const permissions = stats.mode & 0o777;
        if (permissions > 0o600) {
          console.error(`❌ .env文件权限过宽: ${permissions.toString(8)}`);
          console.error('应设置为600(仅所有者可读写)');
          process.exit(1);
        }
      }
    }
    console.log('✅ 配置文件权限检查通过');
  } catch (error) {
    console.error('❌ 配置文件权限检查失败:', error);
  }
  
  // 3. 检查敏感配置值
  const weakSecrets = [
    'secret',
    'password',
    'test',
    '123456',
    'admin',
    'key'
  ];
  
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && (
    jwtSecret.length < 32 || 
    weakSecrets.includes(jwtSecret.toLowerCase())
  )) {
    console.error('❌ JWT_SECRET配置强度不足');
    process.exit(1);
  }
  
  console.log('✅ 安全配置检查通过');
  console.log('✅ 所有安全检查通过，正在启动应用...');
}

// 生产环境执行安全检查
if (process.env.NODE_ENV === 'production') {
  runSecurityChecks();
}

// 生产环境优化
if (process.env.NODE_ENV === 'production') {
  // 优化垃圾回收
  const v8 = require('v8');
  v8.setFlagsFromString('--max_old_space_size=4096');
  
  // 禁用开发工具
  process.env.NODE_OPTIONS = '--no-deprecation --no-warnings';
  
  // 设置进程优先级
  try {
    process.setpriority(process.pid, -10);
  } catch (error) {
    // 不支持setpriority
  }
}
```

## 实战建议与最佳实践

Node.js安全实践的综合建议：

### 安全发布前的自查清单

```js
/**
 * 应用发布安全自查清单
 */
const securityChecklist = {
  // 输入验证
  inputValidation: [
    '✓ 所有用户输入经过验证和净化',
    '✓ 使用第三方验证库(Joi/Validator)严格校验',
    '✓ 文件上传限制类型和大小',
    '✓ 防止SQL和NoSQL注入'
  ],
  
  // 认证与授权
  authentication: [
    '✓ 使用强密码策略',
    '✓ 实施密码哈希(bcrypt)和盐值',
    '✓ 防护暴力破解(速率限制)',
    '✓ 使用安全的会话管理',
    '✓ JWT使用强密钥和短有效期',
    '✓ 实施精细的访问控制'
  ],
  
  // 依赖安全
  dependencies: [
    '✓ 使用npm audit/Snyk检查依赖漏洞',
    '✓ 定期更新依赖包',
    '✓ 锁定依赖版本',
    '✓ 移除未使用的依赖'
  ],
  
  // HTTP安全
  httpSecurity: [
    '✓ 启用HTTPS',
    '✓ 配置HSTS',
    '✓ 使用Helmet设置安全HTTP头',
    '✓ 配置安全的CORS策略',
    '✓ 使用适当的CSP策略'
  ],
  
  // 敏感数据
  sensitiveData: [
    '✓ 加密敏感数据存储',
    '✓ 安全管理环境变量',
    '✓ 日志不包含敏感信息',
    '✓ 不将密钥硬编码到源代码'
  ],
  
  // 错误处理
  errorHandling: [
    '✓ 生产环境中不暴露错误细节',
    '✓ 集中处理异常',
    '✓ 记录错误但隐藏实现细节'
  ],
  
  // 服务器安全
  serverSecurity: [
    '✓ 使用最新Node.js稳定版',
    '✓ 配置服务器超时和资源限制',
    '✓ 正确设置文件权限',
    '✓ 应用最小权限原则'
  ],
  
  // 安全生命周期
  securityLifecycle: [
    '✓ 安全集成到CI/CD流程',
    '✓ 定期安全测试和代码审查',
    '✓ 持续监控和日志分析',
    '✓ 安全事件响应计划'
  ]
};

// 运行检查并生成报告
function generateSecurityReport() {
  let report = '# 应用安全检查报告\n\n';
  let totalChecks = 0;
  let passedChecks = 0;
  
  for (const [category, checks] of Object.entries(securityChecklist)) {
    report += `## ${category}\n\n`;
    
    checks.forEach(check => {
      totalChecks++;
      if (check.startsWith('✓')) {
        passedChecks++;
        report += `- ${check}\n`;
      } else {
        report += `- ❌ ${check}\n`;
      }
    });
    
    report += '\n';
  }
  
  const complianceRate = (passedChecks / totalChecks * 100).toFixed(2);
  report += `## 合规率: ${complianceRate}%\n`;
  
  if (complianceRate < 80) {
    report += '\n⚠️ 警告: 安全合规率过低，请解决未通过的检查项!\n';
  }
  
  return report;
}
```

### 常见安全问题修复

```js
/**
 * 常见Node.js安全问题修复示例
 */

// 1. 防止原型链污染
function secureDeepMerge(target, source) {
  // 创建无原型对象
  const result = Object.create(null);
  
  // 复制目标对象属性
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      result[key] = target[key];
    }
  }
  
  // 安全合并源对象属性
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      // 跳过危险属性
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      if (typeof source[key] === 'object' && 
          source[key] !== null && 
          typeof result[key] === 'object' && 
          result[key] !== null) {
        // 递归合并对象
        result[key] = secureDeepMerge(result[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

// 2. 修复正则表达式DoS
function safeRegexReplace(unsafeRegex, safeRegex) {
  const problemRegexes = {
    // 嵌套量词，可能导致灾难性回溯
    email: {
      unsafe: /^([a-zA-Z0-9_\.\-]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
      safe: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    // 嵌套重复组
    nested: {
      unsafe: /^(a+)*$/,
      safe: /^a*$/
    },
    // 重叠范围
    ranges: {
      unsafe: /^[\s\S]*$/,
      safe: /^.*$/
    }
  };
  
  return problemRegexes[unsafeRegex].safe;
}

// 3. 安全的JSON解析
function safeJsonParse(jsonString) {
  try {
    // JSON.parse抛出的异常可能包含用户输入，容易导致信息泄露
    return JSON.parse(jsonString);
  } catch (e) {
    // 不返回原始错误信息
    throw new Error('无效的JSON格式');
  }
}

// 4. 安全的动态函数执行
function safeEval(code, context = {}) {
  // 不使用eval，而是使用Function构造函数
  // 还是有安全风险，仅用于受信任的代码
  const contextKeys = Object.keys(context);
  const contextValues = contextKeys.map(key => context[key]);
  
  try {
    // 创建一个沙盒函数
    const sandboxFn = new Function(...contextKeys, `"use strict"; return (${code});`);
    return sandboxFn(...contextValues);
  } catch (error) {
    throw new Error('代码执行失败: ' + error.message);
  }
}

// 5. 防止命令注入的安全执行
function safeCommand(command, args) {
  const { execFile } = require('child_process');
  
  return new Promise((resolve, reject) => {
    // 使用execFile而非exec，防止命令注入
    execFile(command, args, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}
```

---

> 参考资料：[OWASP Node.js安全指南](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)、[Node.js安全最佳实践](https://github.com/goldbergyoni/nodebestpractices)、[NodeGoat - OWASP Node.js漏洞演示](https://github.com/OWASP/NodeGoat) 