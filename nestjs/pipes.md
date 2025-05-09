---
outline: deep
---

# Nest.js 管道

管道是具有 `@Injectable()` 装饰器的类，实现 `PipeTransform` 接口。管道有两个典型的应用场景：
- **转换**：将输入数据转换为所需的形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则不进行更改直接传递；否则抛出异常

## 内置管道
Nest 提供了多个开箱即用的内置管道：
- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`

### 基本用法

```typescript
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return `This action returns a cat with id ${id}`;
  }
}
```

## 管道绑定
管道可以在不同级别绑定：
- 参数级别
- 方法级别
- 控制器级别
- 全局级别

### 参数级别绑定

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return `This action returns a cat with id ${id}`;
}
```

### 提供选项

```typescript
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return `This action returns a cat with id ${id}`;
}
```

### 方法级别绑定

```typescript
@Post()
@UsePipes(ValidationPipe)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

### 控制器级别绑定

```typescript
@Controller('cats')
@UsePipes(ValidationPipe)
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

### 全局级别绑定

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

## 自定义管道
创建自定义管道很简单。下面是一个简单的转换管道示例：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) {
      throw new BadRequestException('需要正整数');
    }
    return val;
  }
}
```

## 验证管道与 class-validator
推荐使用 `class-validator` 和 `class-transformer` 库进行数据验证。

首先安装必要的包：

```bash
npm i class-validator class-transformer
```

然后，设置验证类：

```typescript
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(20)
  age: number;

  @IsString()
  breed: string;
}
```

创建验证管道：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('验证失败');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

使用内置的验证管道：

```typescript
@Post()
create(
  @Body(new ValidationPipe())
  createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

## 全局验证管道
通常，您希望在整个应用程序中使用相同的验证管道：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除非DTO类属性的属性
      forbidNonWhitelisted: true, // 如果存在非白名单属性，则抛出错误
      transform: true, // 自动转换为DTO类的实例
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

## 高级自定义验证管道示例

### 自定义错误信息

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DetailedValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints);
        return `${error.property}: ${constraints.join(', ')}`;
      });
      throw new BadRequestException({
        message: '验证失败',
        details: messages,
      });
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 条件验证

```typescript
import { IsString, IsOptional, ValidateIf, IsEmail } from 'class-validator';

export class UserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @ValidateIf(o => o.notificationPreference === 'SMS')
  @IsString()
  phoneNumber: string;

  @IsString()
  notificationPreference: 'EMAIL' | 'SMS';
}
```

### 自定义验证装饰器

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 密码至少8位，包含至少一个大写字母、一个小写字母和一个数字
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须至少8位，包含至少一个大写字母、一个小写字母和一个数字`;
        },
      },
    });
  };
}
```

使用自定义验证装饰器：

```typescript
import { IsString, IsEmail } from 'class-validator';
import { IsPasswordValid } from './is-password-valid.decorator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsPasswordValid()
  password: string;
}
```

## 实际应用案例

### 解析数组元素

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ParseArrayPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post('bulk')
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateUserDto }))
    createUserDtos: CreateUserDto[],
  ) {
    return `创建了 ${createUserDtos.length} 个用户`;
  }
}
```

### 转换查询参数

```typescript
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { TransformPipe } from './transform.pipe';

@Controller('products')
export class ProductsController {
  @Get()
  @UsePipes(new TransformPipe())
  findAll(@Query() query) {
    return `查询产品，价格范围: ${query.minPrice} - ${query.maxPrice}`;
  }
}

// transform.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 将查询参数中的字符串数字转换为数字
    if (value.minPrice) {
      value.minPrice = Number(value.minPrice);
    }
    if (value.maxPrice) {
      value.maxPrice = Number(value.maxPrice);
    }
    return value;
  }
}
```

### 混合多个管道

```typescript
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe(), new PositiveIntPipe())
  id: number,
) {
  return this.catsService.findOne(id);
}
``` 