# Nest.js 安全最佳实践

## 身份验证和授权

### 使用 Passport.js 进行身份验证

Nest.js 与 [Passport.js](http://www.passportjs.org/) 无缝集成，提供了多种身份验证策略。

#### 安装依赖

```bash
npm install @nestjs/passport passport passport-local
npm install @types/passport-local --save-dev

# 对于 JWT 认证
npm install @nestjs/jwt passport-jwt
npm install @types/passport-jwt --save-dev
```

#### 基本 JWT 认证实现

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

#### 使用 JWT Guard 保护路由

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile() {
    return { message: '这是受保护的路由' };
  }
}
```

### 基于角色的访问控制 (RBAC)

#### 创建自定义角色装饰器

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### 创建角色守卫

```typescript
// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

#### 使用角色守卫保护路由

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get()
  @Roles('admin')
  getAdminData() {
    return { message: '这是管理员路由' };
  }
}
```

## 保护敏感数据

### 使用环境变量存储密钥

使用 `dotenv` 和 `@nestjs/config` 模块来管理环境变量：

```bash
npm install @nestjs/config
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
})
export class AppModule {}
```

### 敏感数据加密

使用 `bcrypt` 对密码等敏感数据进行加密：

```bash
npm install bcrypt
npm install @types/bcrypt --save-dev
```

```typescript
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
```

### 使用 Helmet 设置安全相关的 HTTP 头

Helmet 有助于通过设置各种 HTTP 头来保护应用程序免受一些众所周知的 Web 漏洞的影响：

```bash
npm install helmet
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
```

## 防止常见攻击

### CSRF 保护

使用 `csurf` 包来防止跨站请求伪造攻击：

```bash
npm install csurf
npm install @types/csurf --save-dev
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  app.use(csurf({ cookie: true }));
  
  await app.listen(3000);
}
bootstrap();
```

在视图中使用 CSRF 令牌：

```html
<form action="/user" method="post">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}">
  <!-- 其他表单字段 -->
</form>
```

### XSS 防护

使用 `helmet` 可以帮助防止一些 XSS 攻击，但对于内容净化，可以使用 `sanitize-html`：

```bash
npm install sanitize-html
npm install @types/sanitize-html --save-dev
```

```typescript
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class ContentService {
  sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
      allowedAttributes: {
        'a': ['href', 'target']
      }
    });
  }
}
```

### SQL 注入防护

使用 ORM（如 TypeORM 或 Sequelize）来防止 SQL 注入攻击：

```typescript
// 使用 TypeORM 查询构建器
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 安全方式：使用参数化查询
  async findByName(name: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.name = :name', { name })
      .getMany();
  }
}
```

### NoSQL 注入防护

对于 MongoDB，可以使用 Mongoose 的内置验证和查询构建器：

```typescript
// 使用 Mongoose 模式验证
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: props => `${props.value} 不是有效的用户名！`
    }
  },
  email: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} 不是有效的电子邮件！`
    }
  },
  // 其他字段
});
```

## 速率限制

### 使用 ThrottlerModule 实现速率限制

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 自定义特定路由的速率限制

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @UseGuards(ThrottlerGuard)
  @Throttle(3, 60) // 60秒内最多3次请求
  @Post('login')
  login() {
    return { message: '登录成功' };
  }
}
```

## 安全日志记录

### 记录安全相关事件

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  logSecurityEvent(eventType: string, details: any, userId?: string) {
    this.logger.warn({
      message: `安全事件: ${eventType}`,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 实现审计日志

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(action: string, resource: string, resourceId: string, userId: string, details?: any) {
    const auditLog = new AuditLog();
    auditLog.action = action;
    auditLog.resource = resource;
    auditLog.resourceId = resourceId;
    auditLog.userId = userId;
    auditLog.details = details;
    auditLog.timestamp = new Date();
    auditLog.ipAddress = details?.ipAddress;

    return this.auditLogRepository.save(auditLog);
  }
}
```

## 上传文件安全

### 验证上传文件

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class FileValidationService {
  validateFile(file: Express.Multer.File) {
    // 检查文件类型
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExtension = extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(`不支持的文件类型: ${fileExtension}`);
    }
    
    // 检查文件大小 (例如，限制为 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`文件大小超过限制: ${file.size} > ${maxSize}`);
    }
    
    return true;
  }
}
```

### 安全存储上传文件

将上传的文件存储在一个不会被 Web 服务器直接访问的位置，并使用 UUID 命名以防止文件名猜测：

```typescript
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FileStorageService {
  async storeFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuidv4()}${extname(file.originalname)}`;
    const filePath = join(process.env.UPLOAD_DIR, fileName);
    
    // 创建写入流
    const writeStream = createWriteStream(filePath);
    
    return new Promise((resolve, reject) => {
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve(fileName));
      writeStream.on('error', reject);
    });
  }
}
```

## API 安全

### 使用 HTTPS

在生产环境中，始终使用 HTTPS：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/private-key.pem'),
    cert: fs.readFileSync('./secrets/public-certificate.pem'),
  };
  
  const app = await NestFactory.create(AppModule, { httpsOptions });
  await app.listen(3000);
}
bootstrap();
```

### API 密钥验证

实现自定义 API 密钥守卫：

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedException('API 密钥缺失');
    }
    
    // 检查 API 密钥是否有效
    const isValidApiKey = this.validateApiKey(apiKey);
    
    if (!isValidApiKey) {
      throw new UnauthorizedException('无效的 API 密钥');
    }
    
    return true;
  }
  
  private validateApiKey(apiKey: string): boolean {
    // 在实际应用中，可能需要从数据库或缓存中验证 API 密钥
    const validApiKeys = [process.env.API_KEY_1, process.env.API_KEY_2];
    return validApiKeys.includes(apiKey);
  }
}
```

## 安全依赖管理

### 使用 npm audit 检查漏洞

定期运行 `npm audit` 来检查项目依赖项中的已知漏洞：

```bash
npm audit
```

修复发现的漏洞：

```bash
npm audit fix
```

### 使用 Snyk 持续监控依赖

集成 [Snyk](https://snyk.io/) 来持续监控依赖项的安全漏洞：

```bash
npm install -g snyk
snyk auth
snyk test
```

## Docker 安全最佳实践

### 使用非 root 用户运行容器

```dockerfile
FROM node:16-alpine

# 创建应用目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 修改权限
RUN chown -R nestjs:nodejs /usr/src/app

# 切换到非 root 用户
USER nestjs

# 启动应用
CMD ["node", "dist/main"]
```

### 使用多阶段构建减小攻击面

```dockerfile
# 构建阶段
FROM node:16-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段
FROM node:16-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /usr/src/app

USER nestjs

CMD ["node", "dist/main"]
```

## 安全配置检查列表

### 生产环境安全检查清单

- [ ] 使用 HTTPS 并配置适当的 TLS 设置
- [ ] 设置适当的 HTTP 安全头（使用 Helmet）
- [ ] 实现认证和授权机制
- [ ] 设置速率限制以防止暴力破解和 DoS 攻击
- [ ] 实现 CSRF 保护
- [ ] 验证和净化所有用户输入
- [ ] 使用 ORM 防止 SQL 注入
- [ ] 安全地存储密码和敏感数据
- [ ] 设置日志记录，但不记录敏感信息
- [ ] 使用安全的依赖项，定期运行 `npm audit`
- [ ] 遵循最小权限原则
- [ ] 进行定期安全审计
- [ ] 实现内容安全策略 (CSP)

## 安全审计和渗透测试

### 实施安全审计

定期对应用程序进行安全审计，检查代码、配置和基础设施中的漏洞：

1. 代码审查：检查安全问题
2. 依赖项审计：使用 `npm audit` 或 Snyk
3. 配置审查：检查环境配置中的安全问题
4. 渗透测试：测试应用程序的安全性

### 渗透测试工具和资源

- [OWASP ZAP](https://www.zaproxy.org/)：开源的 Web 应用程序漏洞扫描器
- [Burp Suite](https://portswigger.net/burp)：专业的安全测试工具
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)：最常见的安全风险列表

## 总结

保护 Nest.js 应用程序需要多方面的安全措施，从身份验证和授权到 API 安全、数据保护和依赖管理。通过遵循本文档中的最佳实践，你可以大大提高应用程序的安全性。

请记住，安全是一个持续的过程，需要不断关注和改进。定期了解最新的安全威胁和防护措施，定期测试和审计你的应用程序，以确保它能够抵御不断演变的威胁。 