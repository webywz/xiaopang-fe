---
outline: deep
---

# Nest.js 入门

Nest.js 是一个用于构建高效、可靠和可扩展的服务器端应用程序的框架。

## Nest.js 介绍
Nest.js 是一个渐进式 Node.js 框架，用于构建高效、可靠和可扩展的服务器端应用程序。它使用 TypeScript 构建，并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式响应式编程）的元素。

## 安装与设置
使用 Nest CLI 快速创建新的 Nest.js 项目。

```bash
# 安装 Nest CLI
npm i -g @nestjs/cli

# 创建新项目
nest new project-name
```

## 基本结构
Nest.js 应用的基本结构包括模块、控制器和服务。

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '你好，Nest.js！';
  }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## 核心概念
Nest.js 的核心概念包括模块、控制器和提供者。

### 模块
模块是一个用 `@Module()` 装饰器注释的类。它提供了元数据，Nest 用它来组织应用程序结构。

### 控制器
控制器负责处理传入的请求，并返回对客户端的响应。

### 提供者
提供者是 Nest.js 中的一个基本概念。许多基本的 Nest 类可能被视为提供者，例如服务、存储库、工厂、助手等。 