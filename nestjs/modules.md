---
outline: deep
---

# Nest.js 模块系统

模块是 Nest.js 应用程序的基本构建块，它提供了对相关组件进行组织和封装的能力。

## 基本模块
每个 Nest.js 应用至少有一个模块——根模块。根模块是 Nest 用来构建应用程序图的起点。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

`@Module()` 装饰器接受一个描述模块属性的对象：

- `imports` - 导入模块的列表，这些模块导出了此模块中所需的提供者
- `controllers` - 必须创建的控制器列表
- `providers` - 由 Nest 注入器实例化的提供者，并且可以在整个模块中共享
- `exports` - 由本模块提供并应在其他模块中可用的提供者的子集

## 特性模块
随着应用程序的增长，组织代码变得越来越重要。特性模块可以帮助你组织代码，使其更易于维护和理解。

```typescript
// cats/cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}

// app.module.ts
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

## 共享模块
Nest 中的模块默认是单例的，因此你可以在多个模块之间共享任何提供者的相同实例。

```typescript
// cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService] // 导出 CatsService 使其他模块可以使用
})
export class CatsModule {}
```

现在，每个导入 `CatsModule` 的模块都可以访问 `CatsService`，并且将与所有其他模块共享同一实例。

## 全局模块
当你想提供一组随处可用的提供者时，可以使用 `@Global()` 装饰器将模块标记为全局的。

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

全局模块应该只注册一次，通常由根模块或核心模块注册。

## 动态模块
动态模块允许你自定义模块的属性和行为，以便在导入它们时能够配置它们。

```typescript
// database.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

使用动态模块：

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    DatabaseModule.forRoot([User]),
  ],
})
export class AppModule {}
```

## 模块参考
动态模块还可以返回一个参考其自身的模块，通过指定 `global` 属性，这样模块就可以是全局的：

```typescript
import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class ConfigModule {
  static forRoot(options): DynamicModule {
    return {
      module: ConfigModule,
      global: true,  // 全局注册
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['CONFIG_OPTIONS'],
    };
  }
}
```

## 模块继承
模块类可以继承其他模块类，这在许多情况下非常有用：

```typescript
// parent.module.ts
import { Module } from '@nestjs/common';
import { CommonService } from './common.service';

@Module({
  providers: [CommonService],
  exports: [CommonService],
})
export class ParentModule {}

// child.module.ts
import { Module } from '@nestjs/common';
import { ParentModule } from './parent.module';
import { ChildService } from './child.service';

@Module({
  imports: [ParentModule],
  providers: [ChildService],
})
export class ChildModule {}
```

## 模块循环依赖
当两个模块互相依赖时，会形成循环依赖。在 Nest 中，使用 `forwardRef()` 函数解决这个问题：

```typescript
// a.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { BModule } from './b.module';

@Module({
  imports: [forwardRef(() => BModule)],
})
export class AModule {}

// b.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AModule } from './a.module';

@Module({
  imports: [forwardRef(() => AModule)],
})
export class BModule {}
```

## 模块中的生命周期钩子
模块类可以实现几个可选的生命周期方法，这些方法在应用程序生命周期的特定时刻被调用：

```typescript
import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Module({})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('模块已初始化');
  }

  onModuleDestroy() {
    console.log('模块即将销毁');
  }
}
```

可用的生命周期钩子有：
- `onModuleInit()` - 模块初始化后调用
- `onModuleDestroy()` - 模块销毁前调用
- `beforeApplicationShutdown()` - 响应终止信号（如 SIGTERM）
- `onApplicationShutdown()` - 应用程序关闭前调用 