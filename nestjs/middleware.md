---
outline: deep
---

# Nest.js 中间件

中间件是在路由处理程序之前调用的函数。中间件函数可以访问请求和响应对象，以及应用程序的请求-响应周期中的 `next()` 中间件函数。

## 中间件基础
中间件可以执行以下任务:
- 执行任何代码
- 对请求和响应对象进行更改
- 结束请求-响应周期
- 调用堆栈中的下一个中间件函数
- 如果当前中间件函数没有结束请求-响应周期，则必须调用 `next()` 以将控制传递给下一个中间件函数

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('请求...');
    next();
  }
}
```

## 应用中间件
在模块类中使用 `configure()` 方法来应用中间件：

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

## 路由路径配置
`forRoutes()` 方法可以接受字符串、多个字符串、RouteInfo 对象、控制器类甚至多个控制器类：

```typescript
// 使用字符串路径
consumer
  .apply(LoggerMiddleware)
  .forRoutes('cats');

// 使用路由对象
consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'cats', method: RequestMethod.GET });

// 使用控制器
consumer
  .apply(LoggerMiddleware)
  .forRoutes(CatsController);
```

## 路由通配符
路由路径支持模式匹配：

```typescript
consumer
  .apply(LoggerMiddleware)
  .forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

## 中间件消费者
`MiddlewareConsumer` 是一个帮助类，它提供了几种应用中间件的方法：

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.POST },
    { path: 'cats', method: RequestMethod.GET },
  )
  .forRoutes(CatsController);
```

## 函数式中间件
如果中间件不需要任何依赖关系，可以使用函数式中间件：

```typescript
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`请求...`);
  next();
}
```

使用函数式中间件：

```typescript
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

## 多个中间件
要绑定多个中间件，只需在 `apply()` 方法中以逗号分隔它们：

```typescript
consumer
  .apply(cors(), helmet(), logger)
  .forRoutes(CatsController);
```

## 全局中间件
若要一次性将中间件绑定到每个注册的路由，可以使用由 INestApplication 实例提供的 `use()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

## 请求域上下文绑定
在 Web 应用程序中，通常希望在处理请求的不同阶段访问请求状态。你可以使用 Nest 的请求域上下文：

```typescript
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const payload = this.jwtService.verify(token);
      req['user'] = payload;
    }
    
    next();
  }
}
```

## 异步中间件
中间件可以是异步的。只需将 `async` 关键字添加到函数签名：

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    await someAsyncOperation();
    next();
  }
}
```

## 错误处理中间件
创建一个专门用于捕获和处理错误的中间件：

```typescript
@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      console.error('中间件捕获到错误：', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
}
```

## 用例示例

### 身份验证中间件

```typescript
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ message: '未提供 API 密钥' });
    }
    
    const user = await this.usersService.findByApiKey(apiKey);
    
    if (!user) {
      return res.status(401).json({ message: '无效的 API 密钥' });
    }
    
    req['user'] = user;
    next();
  }
}
```

### 请求日志中间件

```typescript
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    
    const startTime = Date.now();
    
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;
      
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms - ${userAgent} ${ip}`,
      );
    });
    
    next();
  }
}
```

### CORS 中间件

```typescript
import * as cors from 'cors';

// 在 main.ts 中应用
const app = await NestFactory.create(AppModule);
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-production-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// 或者作为路由特定中间件
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors({
        origin: 'http://localhost:3000',
        credentials: true,
      }))
      .forRoutes(CatsController);
  }
}
```

### 请求速率限制中间件

```typescript
import * as rateLimit from 'express-rate-limit';

// 在 main.ts 中应用
const app = await NestFactory.create(AppModule);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 限制每个 IP 15 分钟内最多 100 个请求
    message: '请求过多，请稍后再试',
  }),
);
``` 