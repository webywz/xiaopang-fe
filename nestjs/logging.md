# Nest.js 日志系统

## 内置日志系统

Nest.js 提供了一个内置的日志系统，可以用于记录应用程序的各种事件和错误。默认情况下，Nest.js 使用简单的内置记录器，该记录器在应用程序引导和运行期间记录标准输出和错误信息。

### 默认日志级别

Nest.js 支持以下日志级别：

- `log` - 一般信息日志
- `error` - 错误日志
- `warn` - 警告日志
- `debug` - 调试日志
- `verbose` - 详细日志

### 使用内置日志记录器

在任何 Nest.js 组件内，你可以直接注入和使用 Logger 类：

```typescript
import { Controller, Get, Logger } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

  @Get()
  findAll() {
    this.logger.log('获取所有猫咪');
    this.logger.verbose('这是一条详细日志');
    this.logger.debug('这是一条调试日志');
    this.logger.warn('这是一条警告日志');
    
    try {
      // 一些可能抛出错误的代码
    } catch (error) {
      this.logger.error('获取猫咪时出错', error.stack);
    }
    
    return ['猫咪1', '猫咪2'];
  }
}
```

传递给 Logger 构造函数的字符串（在本例中为 `CatsController.name`）将用作记录器实例的上下文。这有助于区分不同组件的日志消息。

### 应用程序范围的日志配置

你可以在应用程序引导过程中配置日志级别：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // 创建自定义 logger 实例
  const logger = new Logger();
  
  // 创建应用实例并传入 logger 配置
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // 只显示错误、警告和普通日志
  });
  
  await app.listen(3000);
  logger.log('应用程序已启动在端口 3000');
}
bootstrap();
```

### 禁用日志

如果你想完全禁用日志记录，可以在创建应用实例时传递 `false`：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
```

## 自定义日志服务

对于更高级的用例，你可以创建自定义日志服务，实现 Nest.js 的 `LoggerService` 接口：

```typescript
import { LoggerService } from '@nestjs/common';

export class CustomLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(`[INFO] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  error(message: string, trace?: string, context?: string) {
    console.error(`[ERROR] ${context ? `[${context}] ` : ''}${message}`);
    if (trace) {
      console.error(trace);
    }
  }
  
  warn(message: string, context?: string) {
    console.warn(`[WARN] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  debug(message: string, context?: string) {
    console.debug(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`);
  }
  
  verbose(message: string, context?: string) {
    console.log(`[VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
  }
}
```

然后，你可以在应用程序引导时使用自定义日志记录器：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new CustomLogger(),
});
```

## 集成第三方日志库

### Winston 集成

[Winston](https://github.com/winstonjs/winston) 是 Node.js 中最流行的日志库之一。以下是如何在 Nest.js 中集成 Winston：

首先，安装所需的依赖：

```bash
npm install winston nest-winston
```

然后，在应用程序中配置 Winston：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
          ),
        }),
        // 文件输出
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

然后，你可以在控制器或服务中注入并使用 Winston 记录器：

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('example')
export class ExampleController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  @Get()
  findAll() {
    this.logger.info('这是通过 Winston 记录的信息');
    this.logger.error('这是一个错误日志', { 
      context: 'ExampleController', 
      user: 'testUser',
      additional: 'metadata'
    });
    
    return { message: '示例响应' };
  }
}
```

### Pino 集成

[Pino](https://github.com/pinojs/pino) 是另一个高性能的 Node.js 日志库。以下是如何在 Nest.js 中集成 Pino：

首先，安装所需的依赖：

```bash
npm install pino pino-http nestjs-pino
```

然后，在应用程序中配置 Pino：

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        useLevelLabels: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

然后，你可以在控制器或服务中注入并使用 Pino 日志记录器：

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { LOGGER_PROVIDER } from 'nestjs-pino';
import { Logger } from 'nestjs-pino';

@Controller('example')
export class ExampleController {
  constructor(private readonly logger: Logger) {}

  @Get()
  findAll() {
    this.logger.info('这是通过 Pino 记录的信息');
    this.logger.error({ err: new Error('发生了错误') }, '这是一个错误日志');
    
    return { message: '示例响应' };
  }
}
```

## 日志收集与分析

### 集中式日志管理

在生产环境中，建议使用集中式日志收集和分析系统，如 ELK Stack（Elasticsearch, Logstash, Kibana）或 Grafana Loki。

#### ELK Stack 集成示例

```typescript
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
const { ElasticsearchTransport } = require('winston-elasticsearch');

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console(),
        new ElasticsearchTransport({
          level: 'info',
          index: 'app-logs',
          clientOpts: { node: 'http://localhost:9200' },
        }),
      ],
    }),
  ],
})
export class AppModule {}
```

## 日志最佳实践

### 结构化日志

始终使用结构化日志记录，这有助于日志分析和搜索：

```typescript
this.logger.log({
  message: '用户登录',
  userId: user.id,
  timestamp: new Date().toISOString(),
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### 敏感信息处理

确保不要记录敏感信息，例如密码、身份证号、信用卡号等：

```typescript
// 不要这样做
this.logger.log(`用户 ${username} 使用密码 ${password} 登录`);

// 应该这样做
this.logger.log(`用户 ${username} 登录成功`);
```

### 适当的日志级别

合理使用日志级别：

- `error`: 记录应用程序错误，需要立即关注的问题
- `warn`: 记录潜在问题或不规范的行为，但不会导致应用程序失败
- `log`/`info`: 记录重要的业务事件
- `debug`: 记录调试信息，通常只在开发环境启用
- `verbose`: 非常详细的日志，通常只用于诊断问题

### 上下文传递

在分布式系统中，传递请求 ID 或跟踪 ID 以关联同一请求的所有日志：

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['requestId'] = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req['requestId']);
    next();
  }
}
```

然后在日志中包含请求 ID：

```typescript
this.logger.log('处理请求', { requestId: req['requestId'] });
```

## 日志监控与告警

### 实时日志监控

在生产环境中，应该设置日志监控和告警系统，以便及时发现和处理问题。

#### 使用 Prometheus 和 Grafana 监控日志指标

```typescript
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggingInterceptor } from './logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

在 `LoggingInterceptor` 中，你可以记录并监控错误率、响应时间等指标。

## 总结

有效的日志记录对于应用程序监控、故障排除和性能分析至关重要。Nest.js 提供了灵活的日志记录系统，既可以使用内置的日志记录器，也可以集成第三方日志库。

在生产环境中，应该考虑以下方面：

1. 使用适当的日志级别
2. 采用结构化日志格式
3. 集成集中式日志管理系统
4. 设置日志监控和告警
5. 保护敏感信息
6. 在分布式系统中传递请求上下文

通过遵循这些最佳实践，你可以构建一个强大的日志系统，帮助你监控和维护你的 Nest.js 应用程序。 