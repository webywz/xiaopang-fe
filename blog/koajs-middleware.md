---
layout: doc
title: Koa.js中间件开发详解
description: 全面解析Koa.js中间件机制、洋葱模型、开发与组合技巧，助你构建高可维护性的Node.js Web应用。
---

# Koa.js中间件开发详解

Koa.js以极简和中间件机制著称，是现代Node.js Web开发的主流选择。本文将系统讲解Koa中间件的原理、洋葱模型、开发与组合技巧。

## 目录

- [Koa中间件机制原理](#koa中间件机制原理)
- [洋葱模型执行流程](#洋葱模型执行流程)
- [中间件开发与组合](#中间件开发与组合)
- [常用中间件示例](#常用中间件示例)
- [错误处理与调试技巧](#错误处理与调试技巧)
- [实战建议与最佳实践](#实战建议与最佳实践)

## Koa中间件机制原理

Koa的中间件系统是其最核心的特性，它采用了一种简洁而强大的设计模式：

### 基本原理

- Koa中间件本质是一个接收`context`和`next`参数的异步函数，签名为`async (ctx, next) => {}`
- 通过`app.use()`方法按顺序注册，形成中间件栈
- `next()`函数返回Promise，用于控制中间件的执行流程
- 中间件可以在请求处理前后执行特定逻辑，实现非侵入式的功能扩展

### 源码简析

Koa中间件系统的核心实现非常精简，理解它对掌握中间件开发至关重要：

```js
/**
 * 简化版Koa中间件机制实现
 */
function compose(middleware) {
  // 验证middleware是否为数组
  if (!Array.isArray(middleware)) 
    throw new TypeError('Middleware stack must be an array!');
  
  // 验证middleware的每个元素是否为函数
  for (const fn of middleware) {
    if (typeof fn !== 'function') 
      throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * 返回一个函数，接收context和next函数
   * @param {Object} context - 上下文对象
   * @param {Function} next - 可选的最后一个中间件执行后的回调
   */
  return function(context, next) {
    // 当前执行的中间件索引
    let index = -1;
    
    // 开始执行第一个中间件
    return dispatch(0);
    
    /**
     * 执行指定索引的中间件
     * @param {Number} i - 中间件索引
     */
    function dispatch(i) {
      // 确保next()在每个中间件中只被调用一次
      if (i <= index) 
        return Promise.reject(new Error('next() called multiple times'));
      
      index = i;
      
      // 获取当前要执行的中间件，如果已经是最后一个则使用传入的next
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      
      // 如果没有下一个中间件，返回已完成的Promise
      if (!fn) return Promise.resolve();
      
      // 尝试执行当前中间件，并传入dispatch(i+1)作为next参数
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```

这个简化版的实现展示了Koa如何组合多个中间件函数，并确保它们按正确的顺序执行。

### 注册与执行过程

```js
const Koa = require('koa');
const app = new Koa();

/**
 * 中间件1
 */
app.use(async (ctx, next) => {
  console.log('中间件1 - 开始');
  ctx.state.middleware1 = '来自中间件1的数据';
  await next(); // 暂停当前中间件，执行下一个
  console.log('中间件1 - 结束');
  // 可以处理响应
  ctx.body = {
    ...ctx.body,
    middleware1Complete: true
  };
});

/**
 * 中间件2
 */
app.use(async (ctx, next) => {
  console.log('中间件2 - 开始');
  ctx.state.middleware2 = '来自中间件2的数据';
  await next();
  console.log('中间件2 - 结束');
});

/**
 * 中间件3 - 路由处理
 */
app.use(async (ctx) => {
  console.log('路由处理');
  ctx.body = {
    status: 'success',
    data: {
      message: 'Hello Koa',
      state: ctx.state // 包含之前中间件设置的数据
    }
  };
});

// 启动服务
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

当收到请求时，控制台输出顺序将是：
```
中间件1 - 开始
中间件2 - 开始
路由处理
中间件2 - 结束
中间件1 - 结束
```

这展示了Koa中间件的执行流程是如何按照"洋葱模型"进行的。

### 中间件上下文对象

`ctx`对象是中间件的核心，它包含了请求和响应的所有信息：

```js
app.use(async (ctx, next) => {
  // 请求相关属性与方法
  console.log(ctx.request); // 完整的请求对象
  console.log(ctx.req);     // Node原生请求对象
  console.log(ctx.url);     // 请求URL
  console.log(ctx.path);    // 请求路径
  console.log(ctx.query);   // 查询参数对象
  console.log(ctx.headers); // 请求头
  console.log(ctx.method);  // HTTP方法
  
  // 响应相关属性与方法
  console.log(ctx.response); // 完整的响应对象
  console.log(ctx.res);      // Node原生响应对象
  ctx.status = 200;          // 设置状态码
  ctx.body = { data: '...' }; // 设置响应体
  ctx.set('X-Custom', 'Value'); // 设置响应头
  
  // 状态管理
  ctx.state.user = await getUser(); // state用于在中间件间传递数据
  
  // 工具方法
  ctx.throw(401, '未授权');  // 抛出带状态码的错误
  ctx.assert(ctx.user, 401, '未授权'); // 条件断言
  
  await next();
});
```

理解`ctx`对象和中间件执行机制，是有效开发Koa应用的基础。

## 洋葱模型执行流程

Koa的中间件执行流程遵循"洋葱模型"，这是理解Koa中间件最关键的概念：

### 洋葱模型详解

- 中间件按照注册顺序依次执行，直到遇到`await next()`
- 每遇到`await next()`，当前中间件暂停，控制权传递给下一个中间件
- 当最内层中间件执行完毕后，控制权依次返回给上层中间件
- 每个中间件都有"前处理"和"后处理"两个阶段，分别对应`await next()`调用前和调用后的代码

这个执行模型形象地类比为洋葱的结构 - 请求像一支箭一样穿过洋葱的所有层，然后沿着相同的路径返回：

```
        ┌─────────────────────────────────────┐
        │           中间件1 (开始)             │
        │  ┌─────────────────────────────┐    │
        │  │        中间件2 (开始)        │    │
        │  │  ┌─────────────────────┐    │    │
        │  │  │    中间件3 (开始)    │    │    │
        │  │  │                     │    │    │
请求 ─────────────> 路由处理 <─────────────────── 响应
        │  │  │                     │    │    │
        │  │  │    中间件3 (结束)    │    │    │
        │  │  └─────────────────────┘    │    │
        │  │        中间件2 (结束)        │    │
        │  └─────────────────────────────┘    │
        │           中间件1 (结束)             │
        └─────────────────────────────────────┘
```

### 实际执行示例

下面是一个详细展示洋葱模型执行流程的示例：

```js
const Koa = require('koa');
const app = new Koa();

// 记录请求处理时间的中间件
app.use(async (ctx, next) => {
  const start = Date.now(); // 前处理：记录开始时间
  console.log(`1️⃣ 开始处理 ${ctx.method} ${ctx.url}`);
  
  await next(); // 控制权交给下一个中间件
  
  // 后处理：计算并记录请求耗时
  const ms = Date.now() - start;
  console.log(`4️⃣ 结束处理 ${ctx.method} ${ctx.url} - ${ms}ms`);
  ctx.set('X-Response-Time', `${ms}ms`);
});

// 日志中间件
app.use(async (ctx, next) => {
  console.log(`2️⃣ 日志记录: ${ctx.method} ${ctx.url}`);
  await next();
  console.log(`3️⃣ 日志完成: ${ctx.status}`);
});

// 业务处理中间件
app.use(async (ctx) => {
  console.log(`➡️ 处理业务逻辑`);
  ctx.body = '请求处理完成';
});

app.listen(3000);
```

当请求到达服务器时，控制台输出顺序将是：
```
1️⃣ 开始处理 GET /
2️⃣ 日志记录: GET /
➡️ 处理业务逻辑
3️⃣ 日志完成: 200
4️⃣ 结束处理 GET / - 5ms
```

### 洋葱模型的优势

1. **前置处理与后置处理**：中间件可在请求处理的不同阶段执行逻辑
   
2. **错误处理**：外层中间件可以捕获内层中间件抛出的错误

   ```js
   app.use(async (ctx, next) => {
     try {
       await next();
     } catch (err) {
       ctx.status = err.status || 500;
       ctx.body = { error: err.message };
       // 可以记录错误日志或做其他处理
       ctx.app.emit('error', err, ctx);
     }
   });
   ```

3. **灵活的响应修改**：中间件可以在后置处理阶段修改来自内层中间件的响应

   ```js
   app.use(async (ctx, next) => {
     await next();
     // 后置处理：为所有响应增加统一字段
     if (ctx.body && typeof ctx.body === 'object') {
       ctx.body.serverTime = new Date().toISOString();
       ctx.body.apiVersion = 'v1.0';
     }
   });
   ```

4. **数据传递**：通过`ctx.state`在中间件之间传递数据

   ```js
   app.use(async (ctx, next) => {
     ctx.state.user = await fetchUserFromDb(ctx.query.userId);
     await next();
   });
   
   app.use(async (ctx) => {
     // 可以访问上一个中间件设置的user数据
     const { user } = ctx.state;
     ctx.body = { message: `Hello, ${user.name}` };
   });
   ```

理解洋葱模型是掌握Koa中间件开发的关键，它使得中间件可以在请求的完整生命周期中灵活地执行逻辑。

## 中间件开发与组合

Koa的中间件开发遵循模块化和单一职责原则，通过组合多个中间件可以构建强大而灵活的应用：

### 中间件分类

根据功能，Koa中间件通常可分为几类：

1. **应用级中间件**：处理所有请求，如日志记录、错误处理、响应时间统计等
2. **路由级中间件**：仅处理特定路由的请求
3. **预处理中间件**：处理请求体解析、参数验证等
4. **安全类中间件**：处理认证、授权、CSRF保护等
5. **响应处理中间件**：处理压缩、缓存控制等

### 中间件开发模式

#### 1. 基本中间件函数

最简单的中间件是一个接收`ctx`和`next`的异步函数：

```js
/**
 * 简单请求日志中间件
 * @param {import('koa').Context} ctx
 * @param {Function} next
 */
async function simpleLogger(ctx, next) {
  const start = Date.now();
  console.log(`--> ${ctx.method} ${ctx.url}`);
  await next();
  const ms = Date.now() - start;
  console.log(`<-- ${ctx.method} ${ctx.url} ${ctx.status} ${ms}ms`);
}

app.use(simpleLogger);
```

#### 2. 中间件工厂函数

更常见的模式是创建一个返回中间件函数的工厂函数，这样可以接受配置参数：

```js
/**
 * 可配置的日志中间件工厂
 * @param {Object} options - 配置选项
 * @param {boolean} [options.logBody=false] - 是否记录请求体
 * @param {boolean} [options.logHeaders=false] - 是否记录请求头
 * @returns {Function} Koa中间件函数
 */
function logger(options = {}) {
  const { logBody = false, logHeaders = false } = options;
  
  return async function(ctx, next) {
    const start = Date.now();
    
    // 前置日志
    console.log(`--> ${ctx.method} ${ctx.url}`);
    
    if (logHeaders) {
      console.log('Headers:', ctx.headers);
    }
    
    if (logBody && ctx.request.body) {
      console.log('Body:', ctx.request.body);
    }
    
    try {
      await next();
      // 后置日志
      const ms = Date.now() - start;
      console.log(`<-- ${ctx.method} ${ctx.url} ${ctx.status} ${ms}ms`);
    } catch (err) {
      // 错误日志
      const ms = Date.now() - start;
      console.error(`<-- ${ctx.method} ${ctx.url} ${err.status || 500} ${ms}ms`);
      console.error(err);
      throw err;
    }
  };
}

// 使用中间件工厂函数
app.use(logger({ logHeaders: true }));
```

#### 3. 类形式的中间件

对于复杂中间件，可以使用类来组织代码：

```js
/**
 * 用户认证中间件类
 */
class AuthMiddleware {
  /**
   * @param {Object} options - 认证选项
   * @param {string} options.secret - JWT密钥
   * @param {string[]} [options.excludePaths=[]] - 排除的路径
   */
  constructor(options) {
    this.secret = options.secret;
    this.excludePaths = options.excludePaths || [];
  }
  
  /**
   * 创建中间件函数
   * @returns {Function} Koa中间件函数
   */
  middleware() {
    return async (ctx, next) => {
      // 检查是否为排除路径
      if (this.excludePaths.some(path => ctx.path.startsWith(path))) {
        return await next();
      }
      
      // 获取并验证令牌
      const token = this.extractToken(ctx);
      
      if (!token) {
        ctx.status = 401;
        ctx.body = { error: '未提供认证令牌' };
        return;
      }
      
      try {
        // 验证JWT令牌
        const user = jwt.verify(token, this.secret);
        // 保存到状态中供后续中间件使用
        ctx.state.user = user;
        await next();
      } catch (err) {
        ctx.status = 401;
        ctx.body = { error: '无效的认证令牌' };
      }
    };
  }
  
  /**
   * 从请求中提取令牌
   * @private
   * @param {import('koa').Context} ctx
   * @returns {string|null} 提取的令牌或null
   */
  extractToken(ctx) {
    const authHeader = ctx.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

// 使用类中间件
const authMiddleware = new AuthMiddleware({ 
  secret: process.env.JWT_SECRET,
  excludePaths: ['/api/login', '/api/public']
});
app.use(authMiddleware.middleware());
```

### 中间件组合技术

在复杂应用中，将相关中间件组合成一个中间件栈是常见的做法：

#### 使用koa-compose

`koa-compose`是一个用于组合多个中间件的官方工具：

```js
const compose = require('koa-compose');

// 认证相关的中间件集合
const authMiddlewares = compose([
  // 1. 令牌提取中间件
  async (ctx, next) => {
    const token = ctx.headers.authorization?.split(' ')[1];
    if (token) {
      ctx.state.token = token;
    }
    await next();
  },
  
  // 2. 令牌验证中间件
  async (ctx, next) => {
    if (!ctx.state.token) {
      ctx.status = 401;
      ctx.body = { error: '未认证' };
      return;
    }
    
    try {
      ctx.state.user = jwt.verify(ctx.state.token, process.env.JWT_SECRET);
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = { error: '无效令牌' };
    }
  },
  
  // 3. 权限检查中间件
  async (ctx, next) => {
    const { user } = ctx.state;
    
    if (!user.roles?.includes('admin')) {
      ctx.status = 403;
      ctx.body = { error: '权限不足' };
      return;
    }
    
    await next();
  }
]);

// 在需要认证的路由中使用组合中间件
router.get('/admin/dashboard', authMiddlewares, async (ctx) => {
  ctx.body = { data: '管理员仪表板数据' };
});
```

#### 模块化中间件

对于大型应用，可将中间件按功能组织到独立模块中：

```js
// middlewares/index.js
const compose = require('koa-compose');
const errorHandler = require('./error-handler');
const logger = require('./logger');
const auth = require('./auth');
const rateLimit = require('./rate-limit');

/**
 * 全局中间件栈
 * @param {Object} options - 配置选项
 * @returns {Function} 组合中间件
 */
exports.globalMiddlewares = (options = {}) => compose([
  errorHandler(options.error),
  logger(options.logger),
  rateLimit(options.rateLimit)
]);

/**
 * API保护中间件栈
 * @param {Object} options - 配置选项
 * @returns {Function} 组合中间件
 */
exports.apiProtection = (options = {}) => compose([
  auth.verifyToken(options.auth),
  rateLimit({
    ...options.rateLimit,
    max: 60,  // 认证用户更高的速率限制
    keyGenerator: (ctx) => ctx.state.user.id
  })
]);

// app.js
const { globalMiddlewares, apiProtection } = require('./middlewares');

// 应用全局中间件
app.use(globalMiddlewares({
  logger: { logLevel: 'info' },
  rateLimit: { max: 30, window: 60000 }
}));

// 在路由级应用保护中间件
const privateRouter = new Router({ prefix: '/api/private' });
privateRouter.use(apiProtection({
  auth: { secret: process.env.JWT_SECRET }
}));
```

### 实用中间件实现

#### 跨域(CORS)中间件

```js
/**
 * CORS中间件
 * @param {Object} options - CORS配置选项
 * @returns {Function} Koa中间件
 */
function cors(options = {}) {
  const defaultOptions = {
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'Date', 'X-Request-Id'],
    allowCredentials: true,
    maxAge: 86400, // 1天
    origin: ctx => ctx.get('Origin')
  };
  
  const opts = { ...defaultOptions, ...options };
  
  return async function corsMiddleware(ctx, next) {
    // 处理预检请求
    if (ctx.method === 'OPTIONS') {
      if (!ctx.get('Access-Control-Request-Method')) {
        return await next();
      }
      
      // 设置CORS头
      ctx.set('Access-Control-Allow-Origin', 
        typeof opts.origin === 'function' ? opts.origin(ctx) : opts.origin);
        
      ctx.set('Access-Control-Allow-Methods', 
        opts.allowMethods.join(','));
        
      ctx.set('Access-Control-Allow-Headers', 
        opts.allowHeaders.join(','));
        
      ctx.set('Access-Control-Allow-Credentials', 
        opts.allowCredentials.toString());
        
      ctx.set('Access-Control-Max-Age', 
        opts.maxAge.toString());
      
      ctx.status = 204; // No content
      return;
    }
    
    // 处理实际请求
    ctx.set('Access-Control-Allow-Origin', 
      typeof opts.origin === 'function' ? opts.origin(ctx) : opts.origin);
      
    if (opts.allowCredentials) {
      ctx.set('Access-Control-Allow-Credentials', 'true');
    }
    
    if (opts.exposeHeaders?.length) {
      ctx.set('Access-Control-Expose-Headers', 
        opts.exposeHeaders.join(','));
    }
    
    await next();
  };
}
```

中间件的开发和组合是构建Koa应用的核心技能，掌握这些技术可以让你的应用更加模块化和可维护。

## 常用中间件示例

Koa生态系统提供了丰富的中间件，以下是一些最常用的中间件及其使用示例：

### 核心中间件

#### 1. 请求体解析 - koa-bodyparser

解析请求体，支持 JSON、表单和文本类型：

```js
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

// 基本用法
app.use(bodyParser());

// 高级配置
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  formLimit: '1mb', // 表单数据大小限制
  jsonLimit: '1mb', // JSON数据大小限制
  textLimit: '1mb', // 文本数据大小限制
  strict: true,     // 严格模式，只解析Content-Type头匹配的请求
  onerror: (err, ctx) => {
    ctx.throw(422, `请求体解析失败: ${err}`);
  }
}));

// 使用解析后的数据
app.use(async ctx => {
  // 解析后的数据在ctx.request.body中
  const { name, email } = ctx.request.body;
  ctx.body = { received: { name, email } };
});
```

#### 2. 路由管理 - @koa/router

管理应用路由，支持路径参数、嵌套路由和中间件：

```js
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router({
  prefix: '/api/v1' // 全局前缀
});

// 基本路由
router.get('/', ctx => {
  ctx.body = { message: 'API首页' };
});

// 带参数的路由
router.get('/users/:id', ctx => {
  const { id } = ctx.params;
  ctx.body = { userId: id };
});

// 添加多个中间件
router.post('/protected', 
  async (ctx, next) => {
    // 认证中间件
    if (!ctx.headers.authorization) {
      ctx.status = 401;
      ctx.body = { error: '需要认证' };
      return;
    }
    await next();
  },
  ctx => {
    // 路由处理
    ctx.body = { message: '受保护的资源' };
  }
);

// 路由分组
const adminRouter = new Router({
  prefix: '/admin'
});

adminRouter.get('/dashboard', ctx => {
  ctx.body = { admin: true };
});

// 嵌套路由
router.use(adminRouter.routes(), adminRouter.allowedMethods());

// 应用路由中间件
app
  .use(router.routes())
  .use(router.allowedMethods());
```

#### 3. 静态文件服务 - koa-static

提供静态文件服务：

```js
const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();

// 基本用法
app.use(serve('./public'));

// 高级配置
app.use(serve(path.join(__dirname, 'public'), {
  maxage: 24 * 60 * 60 * 1000, // 缓存1天
  gzip: true,                  // 支持gzip
  br: true,                    // 支持brotli
  index: 'index.html',         // 默认文件
  setHeaders: (res, path, stats) => {
    // 自定义响应头
    res.setHeader('X-Served-By', 'Koa Static');
  }
}));
```

#### 4. 会话管理 - koa-session

管理用户会话，支持多种存储引擎：

```js
const Koa = require('koa');
const session = require('koa-session');
const redisStore = require('koa-redis');

const app = new Koa();

// 设置签名密钥
app.keys = ['some secret key', 'another secret key'];

const CONFIG = {
  key: 'koa.sess',           // cookie键名
  maxAge: 86400000,          // cookie有效期，单位ms
  autoCommit: true,          // 自动提交头部
  overwrite: true,           // 是否允许覆盖
  httpOnly: true,            // 是否仅服务器可访问
  signed: true,              // 是否签名
  rolling: false,            // 每次请求强制设置cookie
  renew: false,              // 快过期时自动续期
  secure: process.env.NODE_ENV === 'production', // 仅通过HTTPS发送
  sameSite: null,            // cookie sameSite选项
  
  // 使用Redis存储会话
  store: redisStore({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0
  })
};

app.use(session(CONFIG, app));

// 使用会话
app.use(async ctx => {
  // 获取会话视图次数
  let views = ctx.session.views || 0;
  ctx.session.views = ++views;
  
  ctx.body = {
    message: `您已访问此页面 ${views} 次`,
    sessionId: ctx.cookies.get('koa.sess')
  };
});
```

### 安全中间件

#### 1. 安全头设置 - koa-helmet

设置安全相关的HTTP头：

```js
const Koa = require('koa');
const helmet = require('koa-helmet');

const app = new Koa();

// 基本用法 - 应用所有默认安全头
app.use(helmet());

// 自定义配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'api.example.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noCache: true
}));
```

#### 2. 速率限制 - koa-ratelimit

限制请求频率，防止API滥用：

```js
const Koa = require('koa');
const ratelimit = require('koa-ratelimit');
const Redis = require('ioredis');

const app = new Koa();

// 创建Redis客户端
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// 应用速率限制中间件
app.use(ratelimit({
  driver: 'redis',        // 使用Redis存储
  db: redisClient,        // Redis客户端
  duration: 60000,        // 限制周期 - 1分钟
  max: 100,               // 周期内最大请求数
  id: ctx => ctx.ip,      // 限制标识 - 客户端IP
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  disableHeader: false,   // 是否禁用头信息
  errorMessage: '请求过多，请稍后再试',
  whitelist: ctx => {
    // 白名单函数，返回true则不限制
    return ctx.path.startsWith('/public');
  },
  blacklist: ctx => {
    // 黑名单函数，返回true则总是限制
    return ctx.path.startsWith('/admin') && !ctx.state.isAdmin;
  }
}));
```

#### 3. CSRF保护 - koa-csrf

防止跨站请求伪造攻击：

```js
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const CSRF = require('koa-csrf');

const app = new Koa();

// CSRF保护需要会话支持
app.keys = ['csrf secret'];
app.use(session(app));
app.use(bodyParser());

// 应用CSRF保护
app.use(new CSRF({
  invalidTokenMessage: '无效的CSRF令牌',
  invalidTokenStatusCode: 403,
  excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
  disableQuery: false // 允许从查询参数获取令牌
}));

// 为表单提供CSRF令牌
app.use(async (ctx, next) => {
  if (ctx.url === '/form' && ctx.method === 'GET') {
    ctx.body = `
      <form action="/submit" method="POST">
        <input type="hidden" name="_csrf" value="${ctx.csrf}">
        <input type="text" name="username">
        <button type="submit">提交</button>
      </form>
    `;
    return;
  }
  await next();
});

// 处理表单提交
app.use(async (ctx, next) => {
  if (ctx.url === '/submit' && ctx.method === 'POST') {
    // CSRF验证在此之前已自动完成
    ctx.body = { success: true, data: ctx.request.body };
    return;
  }
  await next();
});

// 为AJAX请求提供CSRF令牌
app.use(async (ctx, next) => {
  if (ctx.url === '/api/csrf-token' && ctx.method === 'GET') {
    ctx.body = { csrf: ctx.csrf };
    return;
  }
  await next();
});
```

### 其他实用中间件

#### 1. 响应压缩 - koa-compress

压缩响应数据，减少传输大小：

```js
const Koa = require('koa');
const compress = require('koa-compress');

const app = new Koa();

app.use(compress({
  filter: (content_type) => {
    // 仅压缩文本和JSON
    return /text|json|javascript|css|xml/i.test(content_type);
  },
  threshold: 2048,      // 最小压缩大小（字节）
  gzip: {
    flush: require('zlib').constants.Z_SYNC_FLUSH
  },
  deflate: {
    flush: require('zlib').constants.Z_SYNC_FLUSH
  },
  br: false // 禁用brotli压缩
}));
```

#### 2. 日志记录 - koa-logger

记录请求和响应日志：

```js
const Koa = require('koa');
const logger = require('koa-logger');

const app = new Koa();

// 基本用法
app.use(logger());

// 自定义日志输出
app.use(logger((str, args) => {
  // str 是格式化的日志字符串
  // args 包含请求/响应信息
  
  // 例如，将日志发送到外部服务
  if (args.length >= 3 && args[1] === 'response') {
    // 请求方法、路径、状态码
    const [method, , status] = args;
    
    if (status >= 500) {
      console.error(`错误: ${method} ${args[0]} ${status}`);
      // 可以发送警报通知
    }
  }
}));
```

#### 3. 响应缓存 - koa-cache-control

设置HTTP缓存控制头：

```js
const Koa = require('koa');
const cacheControl = require('koa-cache-control');

const app = new Koa();

// 基本用法
app.use(cacheControl({
  maxAge: 30
}));

// 路由级缓存控制
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/static')) {
    // 静态资源缓存1年
    ctx.cacheControl = {
      maxAge: 31536000
    };
  } else if (ctx.path.startsWith('/api')) {
    // API响应不缓存
    ctx.cacheControl = {
      noCache: true
    };
  }
  await next();
});
```

#### 4. 参数验证 - koa-joi-router

集成了路由和请求验证：

```js
const Koa = require('koa');
const Router = require('koa-joi-router');
const Joi = Router.Joi;

const app = new Koa();
const router = Router();

// 定义带验证的路由
router.route({
  method: 'post',
  path: '/users',
  validate: {
    type: 'json',
    body: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required(),
      age: Joi.number().integer().min(18).max(120)
    }).options({ abortEarly: false, allowUnknown: false }),
    output: {
      201: {
        body: Joi.object({
          id: Joi.string().required(),
          username: Joi.string().required()
        })
      }
    },
    failure: 422, // 验证失败状态码
    continueOnError: false // 验证失败时不继续处理
  },
  handler: async ctx => {
    // 验证通过，处理请求
    const { username, email } = ctx.request.body;
    
    // 创建用户...
    ctx.status = 201;
    ctx.body = {
      id: 'new-user-id',
      username
    };
  }
});

app.use(router.middleware());
```

上述示例展示了如何使用和配置Koa生态系统中的常用中间件，这些中间件共同构成了构建完整Web应用所需的基础设施。

## 错误处理与调试技巧

Koa的错误处理机制是其最强大的特性之一，通过中间件和事件系统，可以实现优雅的错误处理和全面的调试。

### 错误处理中间件

#### 全局错误处理中间件

在应用程序的最外层添加错误处理中间件，捕获所有未处理的错误：

```js
const Koa = require('koa');
const app = new Koa();

/**
 * 全局错误处理中间件
 * @param {import('koa').Context} ctx
 * @param {Function} next
 */
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 记录错误
    console.error('服务器错误', err);
    
    // 设置状态码
    ctx.status = err.status || 500;
    
    // 区分环境的错误响应
    const isDev = process.env.NODE_ENV === 'development';
    
    // 设置响应体
    ctx.body = {
      error: {
        message: isDev || err.expose ? err.message : '服务器内部错误',
        ...(isDev && { stack: err.stack, details: err.details })
      }
    };
    
    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
});
```

#### 业务逻辑错误类

创建自定义错误类，提供统一的错误结构：

```js
/**
 * 业务逻辑错误基类
 */
class BusinessError extends Error {
  /**
   * 创建业务逻辑错误
   * @param {string} message 错误消息
   * @param {number} status HTTP状态码
   * @param {string} code 业务错误代码
   * @param {Object} details 详细错误信息
   */
  constructor(message, status = 400, code = 'BUSINESS_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true; // 允许将错误消息暴露给客户端
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 特定业务错误子类
class ResourceNotFoundError extends BusinessError {
  constructor(resource, id, details = null) {
    super(
      `${resource} with id ${id} not found`,
      404,
      'RESOURCE_NOT_FOUND',
      details
    );
  }
}

class ValidationError extends BusinessError {
  constructor(errors) {
    super(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      errors
    );
  }
}

class AuthenticationError extends BusinessError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends BusinessError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}
```

#### 抛出和处理特定业务错误

在业务逻辑中使用自定义错误：

```js
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

// 使用全局错误处理中间件
app.use(errorHandler);

// 使用自定义错误
router.get('/users/:id', async (ctx) => {
  const user = await getUserById(ctx.params.id);
  
  if (!user) {
    throw new ResourceNotFoundError('User', ctx.params.id);
  }
  
  ctx.body = user;
});

router.post('/users', async (ctx) => {
  try {
    const userData = ctx.request.body;
    const validatedData = validateUser(userData);
    const user = await createUser(validatedData);
    ctx.status = 201;
    ctx.body = user;
  } catch (err) {
    if (err.name === 'ValidationFailedError') {
      throw new ValidationError(err.errors);
    }
    throw err;
  }
});

// 添加路由
app.use(router.routes());
```

### 错误监听与日志

使用Koa的事件系统记录和监控错误：

```js
const Koa = require('koa');
const app = new Koa();

// 为特定类型的错误添加定制处理
app.on('error', (err, ctx) => {
  // 日志记录
  const requestId = ctx.state.requestId || 'unknown';
  const logContext = {
    requestId,
    url: ctx.url,
    method: ctx.method,
    ip: ctx.ip,
    userId: ctx.state.user?.id,
    status: ctx.status,
    errorCode: err.code,
    errorName: err.name
  };
  
  // 不同错误类型的处理
  if (err.status >= 500) {
    // 服务器错误，需要报警
    console.error('严重错误', { ...logContext, error: err });
    // 可以发送邮件或Slack通知
    sendAlertNotification(err, logContext);
  } else if (err.status === 401 || err.status === 403) {
    // 安全相关错误，可能需要记录
    console.warn('安全警告', { ...logContext, error: err.message });
  } else {
    // 普通客户端错误
    console.info('客户端错误', { ...logContext, error: err.message });
  }
  
  // 可以将错误发送到错误监控服务
  sendToErrorMonitoring(err, logContext);
});
```

### 调试技巧

#### 请求ID跟踪

使用请求ID中间件关联同一请求的所有日志：

```js
const Koa = require('koa');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();

/**
 * 请求ID中间件
 * @param {import('koa').Context} ctx
 * @param {Function} next
 */
app.use(async (ctx, next) => {
  // 从请求头获取或生成新的请求ID
  const requestId = ctx.get('X-Request-ID') || uuidv4();
  
  // 保存到上下文
  ctx.state.requestId = requestId;
  
  // 添加到响应头
  ctx.set('X-Request-ID', requestId);
  
  // 创建带请求ID的日志函数
  ctx.log = createLogger(requestId);
  
  await next();
});

// 日志工厂函数
function createLogger(requestId) {
  return {
    info: (message, data = {}) => console.info(message, { requestId, ...data }),
    error: (message, data = {}) => console.error(message, { requestId, ...data }),
    warn: (message, data = {}) => console.warn(message, { requestId, ...data }),
    debug: (message, data = {}) => console.debug(message, { requestId, ...data })
  };
}
```

#### 详细请求日志

使用中间件记录请求详细信息：

```js
/**
 * 详细请求日志中间件
 * @param {import('koa').Context} ctx
 * @param {Function} next
 */
app.use(async (ctx, next) => {
  const start = Date.now();
  
  // 请求开始日志
  ctx.log.info('开始处理请求', {
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    userAgent: ctx.get('User-Agent'),
    query: ctx.query,
    headers: ctx.headers
  });
  
  // 如果是POST/PUT/PATCH请求，记录请求体
  if (['POST', 'PUT', 'PATCH'].includes(ctx.method)) {
    ctx.log.debug('请求体', { body: ctx.request.body });
  }
  
  try {
    await next();
  } catch (err) {
    // 错误日志
    ctx.log.error('请求处理错误', { error: err });
    throw err;
  }
  
  // 响应时间
  const ms = Date.now() - start;
  
  // 请求结束日志
  ctx.log.info('请求处理完成', {
    status: ctx.status,
    duration: `${ms}ms`,
    responseSize: ctx.response.length,
    responseType: ctx.type
  });
});
```

#### 开发环境中间件

在开发环境添加有用的调试中间件：

```js
const Koa = require('koa');
const app = new Koa();

if (process.env.NODE_ENV === 'development') {
  // 响应时间中间件
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
  
  // 开发错误页面 - 使用koa-onerror
  require('koa-onerror')(app);
  
  // 方便的调试输出
  app.use(async (ctx, next) => {
    // 添加一个debug工具到ctx
    ctx.debug = (label, data) => {
      console.log(`[DEBUG ${label}]`, data);
      return data; // 为了链式调用
    };
    
    await next();
  });
}
```

#### 使用断点调试

在Node.js中使用断点进行调试：

```js
// 在关键位置添加断点
async function processData(ctx) {
  const { id } = ctx.params;
  
  // 在此处添加断点
  debugger;
  
  const data = await fetchData(id);
  return processResult(data);
}
```

启动调试服务器：

```bash
# 使用Node.js内置调试器
node --inspect app.js

# 在故障点自动暂停
node --inspect-brk app.js
```

### 常见错误模式及解决方案

#### 1. 异步错误不捕获

问题：
```js
app.use(async (ctx) => {
  // 错误：这里的异步错误不会被捕获
  setTimeout(() => {
    throw new Error('定时器错误');
  }, 100);
  
  ctx.body = 'ok';
});
```

解决方案：
```js
app.use(async (ctx) => {
  // 正确：将异步操作包装在Promise中
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // 可能出错的代码
        if (Math.random() > 0.5) {
          throw new Error('定时器错误');
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
  
  ctx.body = 'ok';
});
```

#### 2. 错误信息泄露

问题：
```js
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 错误：直接将错误堆栈返回给客户端
    ctx.body = {
      message: err.message,
      stack: err.stack
    };
    ctx.status = 500;
  }
});
```

解决方案：
```js
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 正确：根据环境区分错误响应
    ctx.status = err.status || 500;
    
    if (process.env.NODE_ENV === 'production') {
      // 生产环境只返回基本信息
      ctx.body = {
        error: 'Internal Server Error'
      };
    } else {
      // 开发环境返回详细信息
      ctx.body = {
        message: err.message,
        stack: err.stack,
        status: ctx.status
      };
    }
    
    // 始终记录错误
    console.error(err);
  }
});
```

#### 3. 未处理的Promise拒绝

监听全局未捕获的Promise错误：

```js
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 可选：强制程序崩溃，让进程管理器重启应用
  // process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 可选：在记录错误后优雅关闭
  // server.close(() => process.exit(1));
});
```

### 生产环境错误处理最佳实践

1. **使用集中式日志系统**：

```js
const winston = require('winston');
const { createLogger, format, transports } = winston;

// 创建生产环境日志器
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // 控制台日志
    new transports.Console(),
    // 文件日志
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// 在Koa中使用
app.on('error', (err, ctx) => {
  logger.error('应用错误', {
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: err.code
    },
    request: {
      url: ctx.url,
      method: ctx.method,
      headers: ctx.headers,
      ip: ctx.ip
    },
    response: {
      status: ctx.status
    }
  });
});
```

2. **优雅关闭处理**：

```js
const Koa = require('koa');
const app = new Koa();

const server = app.listen(3000);

function shutdown() {
  console.log('收到关闭信号，开始优雅关闭...');
  
  // 先关闭HTTP服务器，停止接收新请求
  server.close(() => {
    console.log('HTTP服务器已关闭');
    
    // 关闭数据库连接
    closeDatabase()
      .then(() => {
        console.log('数据库连接已关闭');
        process.exit(0);
      })
      .catch(err => {
        console.error('关闭数据库连接时出错:', err);
        process.exit(1);
      });
  });
  
  // 如果30秒内没有完成关闭，强制退出
  setTimeout(() => {
    console.error('无法在30秒内完成优雅关闭，强制退出');
    process.exit(1);
  }, 30000);
}

// 监听终止信号
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

通过上述错误处理和调试技巧，可以构建更加健壮和可维护的Koa应用程序，提高开发效率和系统稳定性。

## 实战建议与最佳实践

在Koa应用开发中，良好的中间件设计和使用模式对于构建可维护、高性能的应用至关重要。以下是一些基于实战经验的建议和最佳实践：

### 中间件设计原则

#### 单一职责原则

每个中间件应只负责一项特定功能，避免"万能"中间件：

```js
// 不推荐：一个中间件处理多项功能
app.use(async (ctx, next) => {
  // 处理认证
  const token = ctx.headers.authorization;
  if (token) {
    ctx.state.user = verifyToken(token);
  }
  
  // 记录请求日志
  console.log(`${ctx.method} ${ctx.url}`);
  
  // 设置通用响应头
  ctx.set('X-Powered-By', 'Koa');
  
  await next();
});

// 推荐：拆分为多个专注的中间件
const auth = async (ctx, next) => {
  const token = ctx.headers.authorization;
  if (token) {
    ctx.state.user = verifyToken(token);
  }
  await next();
};

const logger = async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next();
};

const headers = async (ctx, next) => {
  ctx.set('X-Powered-By', 'Koa');
  await next();
};

app.use(auth);
app.use(logger);
app.use(headers);
```

#### 可配置性设计

创建可配置的中间件工厂函数，增强灵活性：

```js
/**
 * 创建缓存中间件
 * @param {Object} options 缓存配置选项
 * @returns {Function} Koa中间件
 */
function createCacheMiddleware(options = {}) {
  const {
    expire = 60, // 默认缓存60秒
    prefix = 'cache:',
    storage = new Map(),
    exclude = []
  } = options;
  
  return async function cache(ctx, next) {
    // 如果请求方法不是GET或路径在排除列表中，跳过缓存
    if (ctx.method !== 'GET' || exclude.some(pattern => 
        pattern instanceof RegExp 
          ? pattern.test(ctx.path) 
          : ctx.path.startsWith(pattern)
    )) {
      return next();
    }
    
    // 缓存键
    const key = `${prefix}${ctx.url}`;
    
    // 尝试获取缓存
    const cached = storage.get(key);
    if (cached && cached.expire > Date.now()) {
      ctx.body = cached.body;
      ctx.set('X-Cache', 'HIT');
      return;
    }
    
    // 继续处理请求
    await next();
    
    // 缓存响应
    if (ctx.body && ctx.status === 200) {
      storage.set(key, {
        body: ctx.body,
        expire: Date.now() + expire * 1000
      });
      ctx.set('X-Cache', 'MISS');
    }
  };
}

// 使用方式
app.use(createCacheMiddleware({
  expire: 300, // 5分钟缓存
  exclude: ['/api/users', /\/dynamic\/.*/] // 排除特定路径
}));
```

#### 错误处理与清理

确保中间件正确处理错误并进行资源清理：

```js
/**
 * 数据库连接中间件
 */
async function dbConnection(ctx, next) {
  // 获取数据库连接
  const connection = await db.getConnection();
  
  // 将连接添加到上下文
  ctx.state.db = connection;
  
  try {
    // 执行后续中间件
    await next();
  } finally {
    // 确保始终释放连接，即使发生错误
    await connection.release();
  }
}
```

### 中间件组织与加载

#### 模块化组织

将中间件按功能分组并模块化组织：

```js
// middleware/index.js - 中间件入口
const compose = require('koa-compose');
const security = require('./security');
const logger = require('./logger');
const db = require('./database');
const error = require('./error');

// 导出预组合的中间件组
module.exports = {
  // 核心中间件（按顺序应用）
  core: compose([
    error,         // 错误处理应该最先注册
    security.headers, // 安全头
    logger.request    // 请求日志
  ]),
  
  // API中间件
  api: compose([
    security.rateLimit, // API限流
    security.jwt,       // JWT认证
    db.connection       // 数据库连接
  ]),
  
  // 静态资源中间件
  static: compose([
    logger.staticAccess,  // 静态资源访问日志
    require('koa-compress')(), // 压缩
    require('koa-static')('./public') // 静态文件服务
  ])
};
```

#### 按环境加载

根据环境变量有选择地加载中间件：

```js
// app.js
const Koa = require('koa');
const middleware = require('./middleware');

const app = new Koa();
const env = process.env.NODE_ENV || 'development';

// 加载核心中间件
app.use(middleware.core);

// 生产环境特定中间件
if (env === 'production') {
  app.use(require('./middleware/security').helmet());
  app.use(require('./middleware/monitoring').metrics());
} 
// 开发环境特定中间件
else if (env === 'development') {
  app.use(require('./middleware/dev').enableDebug());
  app.use(require('./middleware/dev').mockData());
}

// 加载API中间件
app.use(middleware.api);
```

### 性能优化

#### 避免阻塞操作

确保中间件中的CPU密集型操作不会阻塞事件循环：

```js
const { Worker } = require('worker_threads');

/**
 * 处理CPU密集型任务的中间件
 */
app.use(async (ctx, next) => {
  if (ctx.path === '/heavy-computation') {
    // 将计算密集型任务委托给工作线程
    ctx.body = await new Promise((resolve, reject) => {
      const worker = new Worker('./workers/heavy-computation.js', {
        workerData: ctx.query
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
    return;
  }
  
  await next();
});
```

#### 条件执行

使用条件判断避免不必要的中间件执行：

```js
/**
 * 根据路径条件执行的中间件工厂
 * @param {Function|RegExp|string} predicate 条件判断
 * @param {Function} middleware 要执行的中间件
 */
function conditional(predicate, middleware) {
  return async (ctx, next) => {
    let shouldExecute = false;
    
    if (typeof predicate === 'function') {
      shouldExecute = predicate(ctx);
    } else if (predicate instanceof RegExp) {
      shouldExecute = predicate.test(ctx.path);
    } else if (typeof predicate === 'string') {
      shouldExecute = ctx.path.startsWith(predicate);
    }
    
    if (shouldExecute) {
      await middleware(ctx, next);
    } else {
      await next();
    }
  };
}

// 使用方式
app.use(conditional(
  ctx => ctx.get('Content-Type') === 'application/json',
  bodyParser()
));

app.use(conditional(
  /^\/api\/admin/,
  adminAuth
));
```

#### 缓存中间件结果

对于计算密集型中间件，缓存其计算结果：

```js
const LRU = require('lru-cache');

// 创建LRU缓存
const resultsCache = new LRU({
  max: 500, // 最多缓存500个结果
  maxAge: 1000 * 60 * 5 // 5分钟过期
});

/**
 * 用于将中间件结果缓存的高阶函数
 * @param {Function} fn 原始中间件
 * @param {Function} getCacheKey 生成缓存键的函数
 */
function memoizeMiddleware(fn, getCacheKey = ctx => ctx.url) {
  return async (ctx, next) => {
    const cacheKey = getCacheKey(ctx);
    
    // 检查缓存
    if (resultsCache.has(cacheKey)) {
      ctx.state.cached = resultsCache.get(cacheKey);
      return next();
    }
    
    // 执行原始中间件
    await fn(ctx, next);
    
    // 缓存结果
    if (ctx.state.result) {
      resultsCache.set(cacheKey, ctx.state.result);
    }
  };
}

// 使用示例
app.use(memoizeMiddleware(async (ctx, next) => {
  // 复杂的数据处理...
  ctx.state.result = await computeExpensiveData(ctx.query);
  await next();
}));
```

### 测试与调试

#### 中间件单元测试

为中间件编写独立的单元测试：

```js
// auth.middleware.js
module.exports = async function auth(ctx, next) {
  const token = ctx.headers.authorization;
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: '需要认证' };
    return;
  }
  
  try {
    ctx.state.user = verifyToken(token.replace('Bearer ', ''));
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: '无效的令牌' };
  }
};

// auth.middleware.test.js
const auth = require('./auth.middleware');

describe('Auth Middleware', () => {
  test('应在没有令牌时返回401', async () => {
    const ctx = {
      headers: {},
      status: 200
    };
    const next = jest.fn();
    
    await auth(ctx, next);
    
    expect(ctx.status).toBe(401);
    expect(ctx.body).toEqual({ error: '需要认证' });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('应在有效令牌时调用next', async () => {
    const ctx = {
      headers: {
        authorization: 'Bearer valid-token'
      },
      state: {}
    };
    const next = jest.fn();
    
    // 模拟verifyToken函数
    global.verifyToken = jest.fn().mockReturnValue({ id: 1, name: 'User' });
    
    await auth(ctx, next);
    
    expect(ctx.state.user).toEqual({ id: 1, name: 'User' });
    expect(next).toHaveBeenCalled();
  });
});
```

#### 可调试中间件

设计便于调试的中间件，添加适当的调试信息：

```js
const debug = require('debug')('app:middleware:auth');

module.exports = async function auth(ctx, next) {
  debug('处理认证, 路径: %s', ctx.path);
  
  const token = ctx.headers.authorization;
  if (!token) {
    debug('未提供令牌');
    ctx.status = 401;
    ctx.body = { error: '需要认证' };
    return;
  }
  
  try {
    const tokenValue = token.replace('Bearer ', '');
    debug('验证令牌: %s', tokenValue.substr(0, 10) + '...');
    
    ctx.state.user = verifyToken(tokenValue);
    debug('令牌有效, 用户: %o', { id: ctx.state.user.id, role: ctx.state.user.role });
    
    await next();
  } catch (err) {
    debug('令牌验证失败: %o', { error: err.message });
    ctx.status = 401;
    ctx.body = { error: '无效的令牌' };
  }
};
```

### 实战模式

#### 前缀路由中间件组

按API前缀组织中间件，提高代码组织性：

```js
const Router = require('@koa/router');
const compose = require('koa-compose');

/**
 * 创建带前缀和中间件的路由组
 * @param {string} prefix 路由前缀
 * @param {Function[]} middleware 应用于该前缀的中间件数组
 * @param {Function} routeSetup 路由设置函数
 */
function routeGroup(prefix, middleware, routeSetup) {
  const router = new Router({ prefix });
  
  // 设置路由
  routeSetup(router);
  
  // 返回组合的中间件
  return compose([
    ...middleware,
    router.routes(),
    router.allowedMethods()
  ]);
}

// 使用示例
app.use(routeGroup('/api/users', 
  [authorize('user')], 
  (router) => {
    router.get('/', listUsers);
    router.post('/', createUser);
    router.get('/:id', getUser);
    router.put('/:id', updateUser);
    router.delete('/:id', deleteUser);
  }
));

app.use(routeGroup('/api/admin',
  [authorize('admin')],
  (router) => {
    router.get('/stats', getStats);
    router.post('/settings', updateSettings);
  }
));
```

#### 请求处理流水线

构建处理特定请求类型的中间件流水线：

```js
/**
 * 创建处理特定API端点的流水线
 * @param {Object} options 配置选项
 */
function createApiPipeline(options = {}) {
  const {
    validate,        // 验证中间件
    authorize,       // 授权中间件
    sanitize,        // 输入清理中间件
    process,         // 处理中间件
    transform,       // 输出转换中间件
    cache            // 缓存中间件
  } = options;
  
  const pipeline = [];
  
  if (validate) pipeline.push(validate);
  if (authorize) pipeline.push(authorize);
  if (sanitize) pipeline.push(sanitize);
  if (process) pipeline.push(process);
  if (transform) pipeline.push(transform);
  if (cache) pipeline.push(cache);
  
  return compose(pipeline);
}

// 使用示例
router.post('/users',
  createApiPipeline({
    validate: validateUserInput,
    authorize: requireRole('admin'),
    sanitize: sanitizeUserInput,
    process: createUserInDatabase,
    transform: formatUserResponse
  })
);
```

#### 执行时间监控

监控中间件执行时间，发现性能瓶颈：

```js
/**
 * 创建监控中间件执行时间的包装器
 * @param {string} name 中间件名称
 * @param {Function} middleware 原始中间件
 * @param {number} slowThreshold 慢查询阈值(ms)
 */
function monitorMiddleware(name, middleware, slowThreshold = 100) {
  return async (ctx, next) => {
    const start = Date.now();
    
    // 跟踪请求
    const requestId = ctx.state.requestId || 'unknown';
    console.log(`[${requestId}] 开始执行中间件: ${name}`);
    
    // 执行原始中间件
    await middleware(ctx, next);
    
    // 计算执行时间
    const duration = Date.now() - start;
    
    // 记录执行时间
    if (duration > slowThreshold) {
      console.warn(`[${requestId}] 🐢 慢执行中间件: ${name} (${duration}ms)`);
    } else {
      console.log(`[${requestId}] 完成中间件: ${name} (${duration}ms)`);
    }
  };
}

// 使用示例
app.use(monitorMiddleware('认证', auth, 50));
app.use(monitorMiddleware('请求日志', logger));
app.use(monitorMiddleware('静态文件', serve('./public'), 200));
```

通过遵循这些实战建议和最佳实践，可以编写出更易于维护、性能更好、更健壮的Koa中间件，从而提高整个应用程序的质量。

---

> 参考资料：[Koa官方文档](https://koajs.com/) 