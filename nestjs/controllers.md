---
outline: deep
---

# Nest.js 控制器

控制器负责处理传入的请求并向客户端返回响应。

## 控制器基础
控制器的目的是接收应用的特定请求。路由机制控制哪个控制器接收哪些请求。

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
    return '添加了一只猫';
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(+id);
  }
}
```

## 请求对象
Nest.js 提供了对请求对象的访问，你可以通过方法参数使用装饰器注入。

```typescript
import { Controller, Get, Req, Res, Param, Query, Headers, Body } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('demo')
export class DemoController {
  @Get('request')
  getRequest(@Req() request: Request) {
    return { url: request.url, method: request.method };
  }

  @Get('response')
  getResponse(@Res() response: Response) {
    return response.status(200).send('使用响应对象');
  }

  @Get('param/:id')
  getParam(@Param('id') id: string) {
    return { id };
  }

  @Get('query')
  getQuery(@Query('name') name: string, @Query('age') age: number) {
    return { name, age };
  }

  @Get('headers')
  getHeaders(@Headers() headers) {
    return { headers };
  }

  @Post('body')
  getBody(@Body() body) {
    return { body };
  }
}
```

## 响应处理
Nest.js 提供了多种方式来处理响应。

### 标准方式
通常情况下，Nest 会自动处理响应。当请求处理程序返回一个 JavaScript 对象或数组时，它会自动序列化为 JSON。

```typescript
@Get()
findAll(): Cat[] {
  return this.catsService.findAll();
}
```

### 自定义响应
如果你想完全控制响应，可以使用 `@Res()` 装饰器注入响应对象。

```typescript
@Get()
findAll(@Res() response) {
  const cats = this.catsService.findAll();
  return response.status(200).json(cats);
}
```

## 路由装饰器
Nest 提供了一系列与标准 HTTP 方法相对应的装饰器。

```typescript
@Get()
findAll() {}

@Post()
create() {}

@Put()
update() {}

@Delete()
remove() {}

@Patch()
patch() {}

@Options()
options() {}

@Head()
head() {}
``` 