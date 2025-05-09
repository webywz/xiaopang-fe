---
outline: deep
---

# Nest.js 拦截器

拦截器是具有 `@Injectable()` 装饰器的类，实现 `NestInterceptor` 接口。拦截器具有一系列强大的功能，可以：

- 在函数执行前/后绑定额外的逻辑
- 转换函数的返回值
- 转换函数抛出的异常
- 扩展基本函数行为
- 根据特定条件完全重写函数（例如，缓存）

## 拦截器基础

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('执行前...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`执行后... ${Date.now() - now}ms`)),
      );
  }
}
```

## 拦截器绑定
拦截器可以在不同级别绑定：
- 方法级别
- 控制器级别
- 全局级别

### 方法级别

```typescript
@Get()
@UseInterceptors(LoggingInterceptor)
findAll() {
  return this.catsService.findAll();
}
```

### 控制器级别

```typescript
@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {
  // ...
}
```

### 全局级别

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

## 响应映射
拦截器可以修改从路由处理程序返回的响应：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

使用这个拦截器会将响应格式化为：

```json
{
  "data": {
    // 原始响应数据
  }
}
```

## 异常映射
拦截器可以用来处理和转换异常：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => 
          throwError(() => new HttpException('发生了错误', HttpStatus.BAD_GATEWAY)),
        ),
      );
  }
}
```

## 缓存拦截器
拦截器可以实现缓存功能，以提高应用程序性能：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly cache = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isCacheable = request.method === 'GET';
    const key = request.url;

    if (isCacheable && this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return next.handle().pipe(
      tap(response => {
        if (isCacheable) {
          this.cache.set(key, response);
        }
      }),
    );
  }
}
```

## 超时拦截器
可以实现一个超时拦截器，在请求处理时间过长时中断执行：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // 5秒超时
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
```

## 日志拦截器
更完整的日志拦截器，用于记录详细的请求和响应信息：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers } = request;
    
    this.logger.log(
      `请求 - ${method} ${url} - 客户端: ${ip} - 用户代理: ${headers['user-agent']}`,
    );
    
    if (Object.keys(body).length) {
      this.logger.debug(`请求体: ${JSON.stringify(body)}`);
    }

    const now = Date.now();
    
    return next.handle().pipe(
      tap(response => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `响应 - ${method} ${url} - ${responseTime}ms`,
        );
        this.logger.debug(`响应体: ${JSON.stringify(response)}`);
      }),
    );
  }
}
```

## 用户活动跟踪拦截器
跟踪用户活动，更新用户的最后活动时间：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user) {
      this.userService.updateLastActive(user.id);
    }
    
    return next.handle();
  }
}
```

## 响应加密拦截器
加密敏感的响应数据：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionKey: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { encrypted };
      }),
    );
  }
}
```

## 文件流拦截器
处理文件流响应：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, StreamableFile } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fs from 'fs';

@Injectable()
export class FileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (data && data.filePath) {
          const file = fs.createReadStream(data.filePath);
          return new StreamableFile(file);
        }
        return data;
      }),
    );
  }
}
```

## 条件拦截器
根据条件决定是否应用拦截器：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

// 创建跳过拦截器的装饰器
export const SkipTransform = () => SetMetadata('skipTransform', true);

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipTransform = this.reflector.get<boolean>(
      'skipTransform',
      context.getHandler(),
    );
    
    if (skipTransform) {
      return next.handle();
    }
    
    return next.handle().pipe(
      map(data => ({ data, timestamp: new Date().toISOString() })),
    );
  }
}
```

## 实际应用案例

### 响应标准化拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta: {
    status: number;
    message: string;
    timestamp: string;
  };
}

@Injectable()
export class StandardResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;
    
    return next.handle().pipe(
      map(data => ({
        data,
        meta: {
          status: statusCode,
          message: HttpStatus[statusCode],
          timestamp: new Date().toISOString(),
        }
      })),
    );
  }
}
```

### 性能监控拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly performanceService: PerformanceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const start = process.hrtime();
    
    return next.handle().pipe(
      tap(() => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        this.performanceService.record({
          path: url,
          method,
          duration,
          userAgent,
          timestamp: new Date(),
        });
      }),
    );
  }
}
```

### 请求限流拦截器

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip;
    
    const result = await this.rateLimiterService.checkLimit(key);
    
    if (!result.success) {
      throw new HttpException({
        message: '请求过多，请稍后再试',
        remainingSeconds: result.remainingSeconds,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }
    
    return next.handle();
  }
}
``` 