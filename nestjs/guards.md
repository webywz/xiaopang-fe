---
outline: deep
---

# Nest.js 守卫

守卫是一个使用 `@Injectable()` 装饰器的类，实现 `CanActivate` 接口。守卫的主要职责是确定请求是否应该由路由处理程序处理。这通常用于实现身份验证、授权和权限管理。

## 守卫的工作原理
守卫在每个中间件之后执行，但在任何拦截器或管道之前执行。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // 在这里添加你的认证逻辑
    // 例如，检查请求中是否包含有效的 JWT
    return true; // 返回 true 表示允许请求继续进行
  }
}
```

## 守卫的绑定
守卫可以在不同级别绑定：
- 方法级别（适用于特定路由）
- 控制器级别（适用于控制器中的所有路由）
- 全局级别（适用于整个应用程序）

### 方法级别绑定

```typescript
@Get('profile')
@UseGuards(AuthGuard)
getProfile(@Request() req) {
  return req.user;
}
```

### 控制器级别绑定

```typescript
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

### 全局级别绑定

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new AuthGuard());
```

## 基于角色的授权
实现一个角色守卫来进行授权控制：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
```

创建一个角色装饰器：

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

使用角色装饰器：

```typescript
@Post()
@Roles('admin')
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

## JWT 认证守卫
使用 JSON Web Token 进行身份验证的守卫：

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('认证令牌缺失');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      // 将用户信息附加到请求对象上，以便在路由处理程序中使用
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('认证令牌无效');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## 组合多个守卫
可以同时应用多个守卫，它们将按照定义的顺序执行：

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

## 守卫执行上下文
守卫可以访问执行上下文，通过这个上下文可以获取当前请求的详细信息：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 支持 HTTP 和 GraphQL
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return this.validateRequest(request);
    } else {
      // GraphQL
      const ctx = GqlExecutionContext.create(context);
      const { req } = ctx.getContext();
      return this.validateRequest(req);
    }
  }

  private validateRequest(request: any): boolean {
    // 在这里添加认证逻辑
    return true;
  }
}
```

## 权限管理与授权
实现细粒度的权限控制：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler()) || [];
    if (requiredPermissions.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every(permission => 
      user?.permissions?.includes(permission)
    );
  }
}
```

创建权限装饰器：

```typescript
import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);
```

使用权限装饰器：

```typescript
@Delete(':id')
@RequirePermissions('delete:cats')
remove(@Param('id') id: string) {
  return this.catsService.remove(id);
}
```

## 守卫中的依赖注入
守卫可以通过构造函数注入依赖：

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 使用注入的服务进行验证
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      return false;
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findById(payload.sub);
      request['user'] = user;
      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## 条件守卫
有些情况下，你可能希望在特定条件下跳过守卫：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// 创建跳过认证的装饰器
export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为公共路由
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // 添加你的认证逻辑
    return true;
  }
}
```

使用公共装饰器：

```typescript
@Get()
@Public()
findAll() {
  return this.catsService.findAll();
}
```

## 实际应用案例

### 基于 IP 的访问控制

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly whitelist = [
    '127.0.0.1',
    '::1',
    // 其他允许的 IP 地址
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    return this.whitelist.includes(ip);
  }
}
```

### 速率限制守卫

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  // 简单的内存存储，生产环境应使用 Redis 等外部存储
  private readonly store = new Map<string, { count: number, timestamp: number }>();
  private readonly limit = 100; // 每小时最大请求数
  private readonly window = 60 * 60 * 1000; // 1小时的毫秒数

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const now = Date.now();
    
    // 检查并更新请求计数
    if (!this.store.has(ip)) {
      this.store.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    const record = this.store.get(ip);
    
    // 如果时间窗口已过，重置计数
    if (now - record.timestamp > this.window) {
      this.store.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    // 增加计数并检查是否超过限制
    record.count++;
    this.store.set(ip, record);
    
    return record.count <= this.limit;
  }
}
```

### 基于订阅的访问控制

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false;
    }
    
    // 检查用户是否有有效的订阅
    const hasActiveSubscription = await this.subscriptionService.hasActiveSubscription(user.id);
    
    return hasActiveSubscription;
  }
}
``` 