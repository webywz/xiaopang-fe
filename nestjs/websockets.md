---
outline: deep
---

# Nest.js WebSocket

Nest.js 提供了使用 WebSocket 构建实时应用程序的能力，支持与 Socket.io 和原生 WebSocket 的集成。

## WebSocket 基础

WebSocket 是一种在单个 TCP 连接上提供全双工通信的协议，允许服务器和客户端之间进行实时数据交换。

## 安装依赖

要使用 Socket.io，首先安装必要的依赖：

```bash
npm i @nestjs/websockets @nestjs/platform-socket.io
```

如果要使用原生 WebSocket：

```bash
npm i @nestjs/websockets @nestjs/platform-ws
```

## 网关基础

在 Nest 中，网关是一个用 `@WebSocketGateway()` 装饰的类：

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
```

## Socket.io 集成

### 基本网关

创建一个基本的 Socket.io 网关：

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    this.server.emit('messageResponse', data);
    return data;
  }
}
```

### 命名空间

可以通过命名空间隔离通信通道：

```typescript
@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  // ...
}
```

### 生命周期钩子

WebSocket 网关提供了生命周期钩子：

```typescript
import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket 网关已初始化');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`客户端已连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端已断开连接: ${client.id}`);
  }
}
```

### 客户端与用户认证

在网关中实现用户认证：

```typescript
import { WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';
import { WsAuthUser } from './ws-auth-user.decorator';
import { User } from '../users/user.entity';

@WebSocketGateway()
export class ChatGateway {
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
    @WsAuthUser() user: User,
  ) {
    client.join(room);
    client.to(room).emit('userJoined', { userId: user.id, username: user.username });
    return { success: true };
  }
}
```

WebSocket JWT 守卫的实现：

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);
    
    if (!token) {
      throw new WsException('未认证');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      client['user'] = payload;
      return true;
    } catch {
      throw new WsException('认证令牌无效');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const { authorization } = client.handshake.headers;
    if (!authorization) return undefined;
    
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
```

用户装饰器：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsAuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return client.user;
  },
);
```

## 房间和命名空间

### 加入和离开房间

```typescript
@SubscribeMessage('joinRoom')
joinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
  client.join(room);
  return { event: 'joinedRoom', room };
}

@SubscribeMessage('leaveRoom')
leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
  client.leave(room);
  return { event: 'leftRoom', room };
}
```

### 向房间发送消息

```typescript
@SubscribeMessage('msgToRoom')
handleMessageToRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { room: string; message: string },
) {
  client.to(data.room).emit('msgToClient', {
    sender: client.id,
    message: data.message,
    room: data.room,
  });
  
  return { event: 'messageSent', room: data.room };
}
```

## 原生 WebSocket

Nest 也支持原生 WebSocket：

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway(8080, { transport: WsAdapter })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  onEvent(@MessageBody() data: any): any {
    const event = 'events';
    return { event, data };
  }
}
```

## 处理大型消息

对于大型数据，可以使用流：

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Observable, from, map } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  onEvent(@MessageBody() data: any): Observable<any> {
    // 假设这是一个大型数据集合，需要分块发送
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

    return from(items).pipe(
      map(item => ({ event: 'events', data: item })),
    );
  }
}
```

## 发送和接收二进制数据

处理二进制数据：

```typescript
import { WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class BinaryGateway {
  @SubscribeMessage('binary')
  handleBinary(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ArrayBuffer,
  ) {
    const buffer = Buffer.from(data);
    // 处理二进制数据
    return buffer;
  }
}
```

## Socket.io Adapter 自定义

自定义适配器，例如添加 Redis 适配器：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

在 `main.ts` 中使用：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  
  app.useWebSocketAdapter(redisIoAdapter);
  
  await app.listen(3000);
}
bootstrap();
```

## 异常处理

WebSocket 的异常处理：

```typescript
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WebsocketExceptionsFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const error = exception.getError();
    const details = typeof error === 'string' ? { message: error } : error;
    
    client.emit('exception', {
      status: 'error',
      details,
    });
  }
}
```

使用过滤器：

```typescript
@UseFilters(WebsocketExceptionsFilter)
@SubscribeMessage('events')
onEvent(@MessageBody() data: any) {
  if (data.shouldFail) {
    throw new WsException('操作失败');
  }
  return data;
}
```

## WebSocket 与 HTTP 应用集成

在同一个应用中使用 HTTP 和 WebSocket：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  providers: [EventsGateway],
})
export class AppModule {}
```

## 性能优化

### 使用二进制数据

```typescript
@WebSocketGateway({
  cors: true,
  transports: ['websocket'], // 优先使用 WebSocket 传输
  maxHttpBufferSize: 1e8, // 100MB，针对大文件传输
})
export class FileGateway {
  // ...
}
```

### 负载均衡

在多实例环境中使用 Redis 适配器进行消息共享：

```typescript
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  
  app.useWebSocketAdapter(redisIoAdapter);
  
  await app.listen(3000);
}
bootstrap();
```

## 实际应用案例

### 聊天应用

```typescript
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private logger = new Logger('ChatGateway');
  private users: Map<string, { username: string, rooms: Set<string> }> = new Map();
  
  handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    this.users.set(client.id, { username, rooms: new Set() });
    this.logger.log(`用户 ${username} (${client.id}) 已连接`);
  }
  
  handleDisconnect(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      user.rooms.forEach(room => {
        this.server.to(room).emit('userLeft', { userId: client.id, username: user.username });
      });
      this.users.delete(client.id);
      this.logger.log(`用户 ${user.username} (${client.id}) 已断开连接`);
    }
  }
  
  @SubscribeMessage('joinRoom')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    const user = this.users.get(client.id);
    if (user) {
      client.join(room);
      user.rooms.add(room);
      this.server.to(room).emit('userJoined', { userId: client.id, username: user.username });
      this.logger.log(`用户 ${user.username} 加入了房间 ${room}`);
    }
    return { success: true, room };
  }
  
  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    const user = this.users.get(client.id);
    if (user) {
      client.leave(room);
      user.rooms.delete(room);
      this.server.to(room).emit('userLeft', { userId: client.id, username: user.username });
      this.logger.log(`用户 ${user.username} 离开了房间 ${room}`);
    }
    return { success: true, room };
  }
  
  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; message: string },
  ) {
    const user = this.users.get(client.id);
    if (user && user.rooms.has(payload.room)) {
      const messageData = {
        userId: client.id,
        username: user.username,
        room: payload.room,
        message: payload.message,
        timestamp: new Date().toISOString()
      };
      
      this.server.to(payload.room).emit('newMessage', messageData);
      this.logger.log(`用户 ${user.username} 在房间 ${payload.room} 发送了消息`);
      return { success: true };
    }
    
    return { success: false, error: '未加入该房间' };
  }
}
```

### 实时通知系统

```typescript
@WebSocketGateway({
  namespace: 'notifications',
  cors: true,
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private logger = new Logger('NotificationsGateway');
  private userSockets: Map<number, Set<string>> = new Map();
  
  handleConnection(client: Socket) {
    const userId = parseInt(client.handshake.auth.userId, 10);
    if (!userId) {
      client.disconnect();
      return;
    }
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    
    this.userSockets.get(userId).add(client.id);
    this.logger.log(`用户 ${userId} 的客户端 ${client.id} 已连接`);
  }
  
  handleDisconnect(client: Socket) {
    const userId = parseInt(client.handshake.auth.userId, 10);
    if (userId && this.userSockets.has(userId)) {
      const userClients = this.userSockets.get(userId);
      userClients.delete(client.id);
      
      if (userClients.size === 0) {
        this.userSockets.delete(userId);
      }
      
      this.logger.log(`用户 ${userId} 的客户端 ${client.id} 已断开连接`);
    }
  }
  
  // 由其他服务调用，向特定用户发送通知
  sendNotificationToUser(userId: number, notification: any) {
    if (this.userSockets.has(userId)) {
      const userClients = this.userSockets.get(userId);
      this.server.to(Array.from(userClients)).emit('notification', notification);
      this.logger.log(`向用户 ${userId} 发送了通知`);
    }
  }
}
``` 