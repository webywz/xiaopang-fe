---
outline: deep
---

# Nest.js 微服务

微服务架构是一种将应用程序构建为独立可部署服务集合的方法。Nest 提供了几种内置传输层实现，帮助我们构建微服务。

## 微服务基础

在 Nest 中创建微服务非常简单：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    },
  );
  await app.listen();
}
bootstrap();
```

## 支持的传输层

Nest 提供多种内置传输器，包括：

- TCP
- Redis
- NATS
- RabbitMQ
- Kafka
- gRPC
- MQTT

### TCP 传输

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 8877,
    },
  },
);
```

### Redis 传输

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
);
```

### RabbitMQ 传输

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cats_queue',
      queueOptions: {
        durable: false
      },
    },
  },
);
```

### Kafka 传输

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'my-kafka-consumer'
      }
    },
  },
);
```

### gRPC 传输

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'hero/hero.proto'),
    },
  },
);
```

## 消息模式
在微服务中，消息传递遵循两种常见模式：

### 请求-响应模式
在此模式中，客户端向微服务发送请求并等待响应。

```typescript
// hero.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class HeroController {
  @MessagePattern({ cmd: 'get_hero' })
  getHero(data: { id: number }): Hero {
    return this.heroService.findById(data.id);
  }
}
```

### 事件模式
在此模式中，客户端发布事件，微服务订阅这些事件并进行处理。

```typescript
// hero.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class HeroController {
  @EventPattern('hero_created')
  async handleHeroCreated(data: Hero) {
    // 处理 hero_created 事件
    await this.heroService.create(data);
  }
}
```

## 客户端应用通信

客户端应用程序可以使用 `ClientProxy` 类与微服务通信。有几种方法可以注入 `ClientProxy` 实例：

### 使用 ClientsModule

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 8877,
        },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

然后在控制器中使用它：

```typescript
// app.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('HERO_SERVICE') private client: ClientProxy) {}

  @Get()
  async getHero() {
    return this.client.send({ cmd: 'get_hero' }, { id: 1 });
  }

  @Get('create')
  async createHero() {
    this.client.emit('hero_created', {
      id: 1,
      name: '张三',
    });
    return '发送事件成功';
  }
}
```

### 动态创建客户端

```typescript
constructor(@Inject('HERO_SERVICE') private client: ClientProxy) {}

async onApplicationBootstrap() {
  await this.client.connect();
}
```

## 混合应用

Nest 允许同时创建微服务和HTTP API：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建HTTP服务
  const app = await NestFactory.create(AppModule);
  
  // 创建微服务
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 8877,
    },
  });
  
  // 启动两种服务
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
```

## 异常处理

在微服务中处理异常：

```typescript
@MessagePattern({ cmd: 'get_hero' })
getHero(data: { id: number }): Hero {
  try {
    return this.heroService.findById(data.id);
  } catch (error) {
    throw new RpcException('找不到英雄');
  }
}
```

## 拦截器、守卫和管道

所有常规的NestJS功能（拦截器、守卫、管道等）在微服务中都能正常工作：

```typescript
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@MessagePattern({ cmd: 'create_hero' })
createHero(data: CreateHeroDto): Promise<Hero> {
  return this.heroService.create(data);
}
```

## 微服务中的请求上下文

在微服务中，`ExecutionContext` 提供对底层传输层和其原始请求的访问：

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToRpc();
    const data = ctx.getData();
    const metadata = ctx.getContext();

    // 进行认证逻辑
    return true;
  }
}
```

## gRPC高级使用

gRPC是一种高性能的RPC框架，它使用Protocol Buffers作为接口定义语言：

```protobuf
// hero.proto
syntax = "proto3";

package hero;

service HeroService {
  rpc FindOne (HeroById) returns (Hero) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}
```

实现gRPC服务：

```typescript
// hero.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class HeroController {
  @GrpcMethod('HeroService', 'FindOne')
  findOne(data: { id: number }, metadata: any): Hero {
    return this.heroService.findById(data.id);
  }
}
```

## Kafka高级使用

对于Kafka这样的流处理平台，Nest提供了额外的功能：

```typescript
// Kafka消费者选项
{
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'my-group',
      allowAutoTopicCreation: true,
    },
    run: {
      autoCommit: true,
      autoCommitInterval: 5000,
    },
  },
}
```

## 微服务架构中的设计模式

### API网关模式

使用Nest作为API网关，路由请求到相应的微服务：

```typescript
// gateway.controller.ts
import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('api')
export class ApiGatewayController {
  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productService: ClientProxy,
  ) {}

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.userService.send({ cmd: 'get_user' }, { id });
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.productService.send({ cmd: 'get_product' }, { id });
  }
}
```

### 服务发现模式

实现服务发现以便微服务可以互相找到：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CONSUL_CLIENT } from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CONSUL_CLIENT,
        useFactory: () => {
          return {
            transport: Transport.TCP,
            options: {
              host: process.env.SERVICE_HOST || 'localhost',
              port: parseInt(process.env.SERVICE_PORT, 10) || 8877,
            },
            async onApplicationBootstrap(client) {
              // 在服务发现中注册自己
              await registerService();
            },
            async onApplicationShutdown(client) {
              // 取消注册
              await deregisterService();
            },
          };
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### 断路器模式

在微服务通信中使用断路器防止级联故障：

```typescript
// app.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Controller()
export class AppController {
  constructor(@Inject('HERO_SERVICE') private client: ClientProxy) {}

  @Get()
  getHero() {
    return this.client.send({ cmd: 'get_hero' }, { id: 1 }).pipe(
      timeout(5000), // 5秒超时
      catchError(err => {
        console.error('服务调用失败', err);
        return of({ id: 0, name: '默认英雄（服务不可用）' });
      }),
    );
  }
}
``` 