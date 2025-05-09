---
outline: deep
---

# Nest.js 提供者

提供者是 Nest.js 中的一个基本概念。许多基本的 Nest 类可能被视为提供者 – 服务、存储库、工厂、助手等等。

## 服务
服务是一个广义的概念，它封装了任何一个由应用使用的功能。

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: number): Cat {
    return this.cats.find(cat => cat.id === id);
  }
}
```

## 依赖注入
Nest.js 通过依赖注入的方式自动解析提供者之间的关系。

```typescript
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  // 通过构造函数注入 CatsService
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }
}
```

在模块中注册提供者：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],  // 将 CatsService 注册为提供者
})
export class CatsModule {}
```

## 作用域
提供者通常具有与应用程序生命周期同步的生命周期。应用程序启动时，必须解析每个依赖项，因此必须实例化每个提供者。同样，当应用程序关闭时，每个提供者都将被销毁。但是，有一些方法可以改变提供者生命周期的行为。

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

可用的作用域有：

- `DEFAULT` - 单例，每个提供者在整个应用程序中共享一个实例
- `REQUEST` - 为每个请求提供一个新的提供者实例
- `TRANSIENT` - 每次注入提供者时创建一个新的实例

## 自定义提供者
有时你需要更高级的提供者注册方式，例如当你想要手动实例化提供者，或者利用现有类的能力，或者在运行时使用模拟版本替换提供者。

### 值提供者
`useValue` 语法对于注入常量值、外部库或使用模拟对象替换实现非常有用。

```typescript
// 模拟服务
const mockCatsService = {
  findAll: () => ['测试猫'],
};

@Module({
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class CatsModule {}
```

### 工厂提供者
`useFactory` 语法允许动态创建提供者。实际提供者将由工厂函数返回的值提供。

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection();
        return connection;
      },
    },
  ],
})
export class AppModule {}
``` 