---
outline: deep
---

# Nest.js 配置管理

配置管理是任何应用程序的重要组成部分，特别是在不同环境（开发、测试、生产）之间切换时。Nest.js 提供了灵活的配置管理解决方案，本文将详细介绍如何在 Nest.js 中有效管理配置。

## ConfigModule 基础

### 安装依赖

首先，安装 `@nestjs/config` 包：

```bash
npm install --save @nestjs/config
```

### 基本使用

在应用的根模块（通常是 `AppModule`）中导入 `ConfigModule`：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
```

这会加载并解析项目根目录下的 `.env` 文件，并将环境变量设置到 Node.js 的 `process.env` 对象中。

### 配置选项

`ConfigModule.forRoot()` 方法支持多种选项：

```typescript
ConfigModule.forRoot({
  // 指定 .env 文件路径
  envFilePath: '.env',
  
  // 加载多个 .env 文件（后面的会覆盖前面的同名变量）
  envFilePath: ['.env.local', '.env'],
  
  // 是否注入到全局模块，使所有模块都可以使用 ConfigService
  isGlobal: true,
  
  // 是否忽略 .env 文件缺失的情况
  ignoreEnvFile: false,
  
  // 环境变量的验证函数
  validate: config => { /* 验证并转换配置 */ return config; },
  
  // 加载的环境变量
  load: [customConfig],
  
  // 是否缓存环境变量
  cache: true,
  
  // 是否展开嵌套的环境变量
  expandVariables: true,
});
```

### 环境变量文件

典型的 `.env` 文件内容：

```
# 应用设置
APP_NAME=My NestJS App
APP_PORT=3000
APP_ENV=development

# 数据库设置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=mydatabase

# JWT设置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## 使用 ConfigService

### 注入 ConfigService

在任何需要访问配置的类中注入 `ConfigService`：

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getAppInfo() {
    const appName = this.configService.get<string>('APP_NAME');
    const appPort = this.configService.get<number>('APP_PORT');
    
    return {
      name: appName,
      port: appPort,
    };
  }
}
```

### 获取配置值

`ConfigService` 提供了几种获取配置值的方法：

```typescript
// 获取值，没有提供默认值时，如果环境变量不存在则返回 undefined
const dbHost = this.configService.get<string>('DB_HOST');

// 获取值，提供默认值
const dbPort = this.configService.get<number>('DB_PORT', 5432);

// 获取必需的值，如果环境变量不存在则抛出异常
const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
```

### 类型安全的配置访问

使用 TypeScript 的类型定义，可以获得更好的类型安全：

```typescript
// config/database.config.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export default (): { database: DatabaseConfig } => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'mydatabase',
  },
});
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

```typescript
// database.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';

@Injectable()
export class DatabaseService {
  private dbConfig: DatabaseConfig;

  constructor(private configService: ConfigService) {
    this.dbConfig = this.configService.get<DatabaseConfig>('database');
  }

  getDatabaseInfo() {
    return {
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      database: this.dbConfig.database,
    };
  }
}
```

## 高级配置技巧

### 配置命名空间

将配置拆分为多个命名空间：

```typescript
// config/app.config.ts
export default () => ({
  app: {
    name: process.env.APP_NAME || 'My App',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.APP_ENV || 'development',
  },
});

// config/database.config.ts
export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'mydatabase',
  },
});

// config/jwt.config.ts
export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, jwtConfig],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

使用命名空间访问配置：

```typescript
// 访问 app 命名空间下的配置
const appName = this.configService.get<string>('app.name');

// 访问 database 命名空间下的配置
const dbHost = this.configService.get<string>('database.host');

// 访问 jwt 命名空间下的配置
const jwtSecret = this.configService.get<string>('jwt.secret');
```

### 环境特定配置

根据不同环境加载不同的配置文件：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

可以创建不同环境的配置文件：
- `.env.development`
- `.env.test`
- `.env.production`

然后通过设置 `NODE_ENV` 环境变量来切换环境：

```bash
NODE_ENV=production npm run start:prod
```

### 配置验证

使用 Joi 库进行配置验证：

```bash
npm install --save joi
```

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        APP_PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
      }),
      validationOptions: {
        abortEarly: true, // 第一个错误就终止验证
        // 或
        // abortEarly: false, // 收集所有错误
      },
    }),
  ],
})
export class AppModule {}
```

### 自定义配置源

除了 `.env` 文件外，还可以从其他源加载配置，如配置文件、数据库、远程服务等：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { loadConfigFromDatabase } from './config/database-loader';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true, // 忽略 .env 文件
      load: [
        appConfig, 
        databaseConfig,
        // 异步加载配置
        async () => {
          const dbConfig = await loadConfigFromDatabase();
          return { databaseFromRemote: dbConfig };
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

## 配置服务与其他模块集成

### 与 TypeORM 集成

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
  ],
})
export class AppModule {}
```

### 与 JWT 模块集成

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
})
export class AuthModule {}
```

### 与 Mongoose 集成

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
  ],
})
export class AppModule {}
```

## 最佳实践

### 组织配置文件

推荐的配置文件结构：

```
src/
  config/
    app.config.ts       # 应用相关配置
    database.config.ts  # 数据库相关配置
    auth.config.ts      # 认证相关配置
    mail.config.ts      # 邮件相关配置
    index.ts            # 统一导出所有配置
```

在 `index.ts` 中统一导出：

```typescript
// src/config/index.ts
import appConfig from './app.config';
import databaseConfig from './database.config';
import authConfig from './auth.config';
import mailConfig from './mail.config';

export default [
  appConfig,
  databaseConfig,
  authConfig,
  mailConfig,
];
```

在 `AppModule` 中使用：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### 敏感配置保护

1. 不要将敏感配置（如密码、API密钥）提交到版本控制系统

   提供一个示例 `.env.example` 文件，但不包含实际值：

   ```
   # 数据库设置
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=
   DB_PASSWORD=
   DB_DATABASE=

   # JWT设置
   JWT_SECRET=
   ```

2. 使用环境变量注入敏感配置，特别是在容器化环境中

3. 考虑使用加密的配置存储，如 AWS Secrets Manager、HashiCorp Vault 等

### 配置缓存

在生产环境中，启用配置缓存以提高性能：

```typescript
ConfigModule.forRoot({
  cache: true,
  // 其他选项...
})
```

### 配置文档化

创建一个 `config.md` 文件，记录所有配置项的用途、可选值和默认值，方便团队成员了解配置系统。

```markdown
# 应用配置文档

## 应用设置
- `APP_NAME`: 应用名称，默认值：'My NestJS App'
- `APP_PORT`: 应用端口，默认值：3000
- `APP_ENV`: 应用环境，可选值：development、test、production，默认值：development

## 数据库设置
- `DB_HOST`: 数据库主机地址，默认值：localhost
- `DB_PORT`: 数据库端口，默认值：5432
- `DB_USERNAME`: 数据库用户名，必填
- `DB_PASSWORD`: 数据库密码，必填
- `DB_DATABASE`: 数据库名称，必填
```

## 常见问题解决

### 环境变量不生效

1. 确保 `.env` 文件位于项目根目录
2. 检查变量名大小写是否正确
3. 确保没有空格或其他特殊字符
4. 重启应用以加载新的环境变量

### 配置优先级

配置优先级从高到低：

1. 环境中显式设置的环境变量（如通过命令行设置）
2. `.env` 文件中的环境变量
3. 代码中的默认值

### 测试中的配置

在测试环境中，可以创建模拟的 `ConfigService`：

```typescript
// mock-config.service.ts
import { ConfigService } from '@nestjs/config';

export class MockConfigService extends ConfigService {
  constructor(private mockValues: Record<string, any> = {}) {
    super();
  }

  get<T>(key: string): T {
    return this.mockValues[key] as T;
  }
}
```

在测试中使用：

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MockConfigService } from './mock-config.service';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let configService: MockConfigService;

  beforeEach(async () => {
    configService = new MockConfigService({
      'APP_NAME': 'Test App',
      'APP_PORT': 4000,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should return app info', () => {
    expect(service.getAppInfo()).toEqual({
      name: 'Test App',
      port: 4000,
    });
  });
});
```

## 总结

Nest.js 的配置管理系统提供了灵活而强大的方式来处理应用配置。通过使用 `ConfigModule` 和 `ConfigService`，可以轻松地管理不同环境的配置，实现配置的类型安全，并与各种模块集成。

遵循最佳实践，如组织配置文件、保护敏感信息、启用配置验证等，可以构建一个健壮且可维护的配置系统，为应用程序提供坚实的基础。

## 参考资源

- [Nest.js 官方文档 - 配置](https://docs.nestjs.com/techniques/configuration)
- [dotenv 文档](https://github.com/motdotla/dotenv)
- [Joi 文档](https://joi.dev/api/) 