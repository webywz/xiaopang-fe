---
outline: deep
---

# Nest.js 异常过滤器

异常过滤器处理应用程序中的所有未处理异常。当发生异常但没有被捕获时，用户将收到适当的响应。

## 内置异常层

Nest 提供了一个内置的异常层，负责处理应用程序中未处理的异常。当应用代码未处理异常时，该层会捕获异常，然后自动发送适当的用户友好响应。

```typescript
// 抛出标准异常
throw new HttpException('禁止访问', HttpStatus.FORBIDDEN);
```

上述代码将返回：

```json
{
  "statusCode": 403,
  "message": "禁止访问"
}
```

## 自定义响应对象

要自定义响应，可以传递一个对象而不是仅仅一个字符串：

```typescript
throw new HttpException({
  status: HttpStatus.FORBIDDEN,
  error: '禁止访问',
  details: '您没有访问此资源的权限',
}, HttpStatus.FORBIDDEN);
```

响应将是：

```json
{
  "status": 403,
  "error": "禁止访问",
  "details": "您没有访问此资源的权限"
}
```

## 内置HTTP异常

Nest 提供了一系列扩展自基础 `HttpException` 的标准异常：

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

使用示例：

```typescript
throw new NotFoundException('未找到所请求的资源');
```

## 异常过滤器

虽然内置的异常过滤器自动处理了许多情况，但您可能希望完全控制异常层。例如，添加日志记录或基于特定条件使用不同的 JSON 模式。

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
  }
}
```

## 绑定过滤器

异常过滤器可以在不同级别绑定：方法级别，控制器级别或全局级别。

### 方法级别绑定

```typescript
@Post()
@UseFilters(HttpExceptionFilter)
create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

### 控制器级别绑定

```typescript
@Controller('cats')
@UseFilters(HttpExceptionFilter)
export class CatsController {}
```

### 全局级别绑定

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

## 捕获所有异常

要捕获每个发生的异常，不管其类型如何，可以将 `@Catch()` 装饰器留空：

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## 继承内置过滤器

若要自定义内置过滤器而不是编写完整的过滤器，可以继承 `BaseExceptionFilter`：

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 添加自定义逻辑
    console.error('Exception occurred:', exception);
    
    // 委托给内置的异常处理程序
    super.catch(exception, host);
  }
}
```

## 依赖注入的工作原理

与大多数提供者一样，异常过滤器可以通过构造函数注入依赖项。

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    this.logger.error(
      `Http 状态码: ${status}, 路径: ${request.url}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

## 捕获多种异常

要捕获多种异常，可以在 `@Catch()` 装饰器中提供一个逗号分隔的异常列表：

```typescript
@Catch(NotFoundException, ForbiddenException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 实现代码
  }
}
```

## 自定义异常类

创建自定义异常类以表示特定于应用的错误：

```typescript
export class ItemNotFoundException extends HttpException {
  constructor(itemId: string) {
    super(`ID 为 ${itemId} 的项目未找到`, HttpStatus.NOT_FOUND);
  }
}

// 使用
throw new ItemNotFoundException('123');
```

## 高级用例

### 带有详细错误堆栈的异常过滤器

在开发环境中返回详细的错误堆栈：

```typescript
@Catch()
export class DetailedExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      message: exception.message || '服务器内部错误',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 仅在开发环境中包含堆栈跟踪
    if (this.configService.get('NODE_ENV') === 'development') {
      errorResponse['stack'] = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
```

### 事务回滚的异常过滤器

在异常发生时回滚数据库事务：

```typescript
@Catch()
export class TransactionExceptionFilter implements ExceptionFilter {
  constructor(private readonly connection: Connection) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 检查是否有活动事务
    const queryRunner = this.connection.createQueryRunner();
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 特定域的异常过滤器

为不同类型的请求（HTTP、WebSocket、微服务）创建特定的过滤器：

```typescript
@Catch()
export class HttpAndWsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    
    if (host.getType() === 'http') {
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = 
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (host.getType() === 'ws') {
      const client = host.switchToWs().getClient();
      const status = 
        exception instanceof WsException
          ? exception.getStatus()
          : 1011; // 内部错误

      client.send(JSON.stringify({
        event: 'error',
        data: {
          statusCode: status,
          message: exception['message'] || '未知错误',
          timestamp: new Date().toISOString(),
        }
      }));
    }
  }
}
```

### 异常报告服务集成

将异常报告到像 Sentry 这样的外部服务：

```typescript
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('SentryService') private readonly sentryService: SentryService
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 将异常报告给 Sentry
    this.sentryService.captureException(exception, {
      extra: {
        url: request.url,
        method: request.method,
        statusCode: status,
      }
    });

    response.status(status).json({
      statusCode: status,
      message: exception.message || '服务器内部错误',
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 处理异步异常

在异步方法中处理异常：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  try {
    await this.catsService.create(createCatDto);
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: '无法创建猫',
      details: error.message,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
``` 