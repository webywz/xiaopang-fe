---
layout: doc
title: Nest.js企业级应用开发
description: 全面解析Nest.js架构设计、依赖注入、模块化、装饰器与企业级开发最佳实践，助你构建高可维护性Node.js应用。
---

# Nest.js企业级应用开发

Nest.js是基于TypeScript的Node.js企业级后端框架，强调模块化、可测试性和可维护性。本文将系统讲解Nest.js的架构设计、依赖注入、模块化开发与企业级最佳实践。

## 目录

- [Nest.js架构与核心理念](#nestjs架构与核心理念)
- [模块化与依赖注入](#模块化与依赖注入)
- [控制器与服务分层](#控制器与服务分层)
- [装饰器与中间件用法](#装饰器与中间件用法)
- [企业级开发最佳实践](#企业级开发最佳实践)

## Nest.js架构与核心理念

- 基于模块（Module）、控制器（Controller）、服务（Provider）三层架构
- 强类型、依赖注入、装饰器驱动开发
- 支持REST、GraphQL、WebSocket等多种协议

## 模块化与依赖注入

### 模块化架构设计

Nest.js采用模块化架构，将应用分割为高内聚、低耦合的功能单元，每个模块封装特定的功能集：

```ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // 导入其他模块或功能
    TypeOrmModule.forFeature([User]), // 引入数据库实体
  ],
  controllers: [UserController], // 注册控制器
  providers: [UserService], // 注册服务
  exports: [UserService], // 导出服务供其他模块使用
})
export class UserModule {}
```

模块分类与组织策略：

1. **核心模块 (Core Module)**：包含应用核心功能，如日志、异常处理、身份验证等
2. **共享模块 (Shared Module)**：包含可跨多个模块重用的组件，如通用服务、工具类
3. **特性模块 (Feature Module)**：实现特定业务功能的模块，如用户、订单、商品等
4. **基础设施模块 (Infrastructure Module)**：提供技术基础设施，如数据库连接、消息队列等

```
src/
├── core/              # 核心模块
│   ├── config/        # 配置管理
│   ├── logger/        # 日志服务
│   ├── guards/        # 全局守卫
│   └── interceptors/  # 全局拦截器
├── shared/            # 共享模块
│   ├── dtos/          # 数据传输对象
│   ├── utils/         # 工具类
│   └── constants/     # 常量定义
├── modules/           # 特性模块
│   ├── user/          # 用户模块
│   ├── auth/          # 认证模块
│   └── product/       # 产品模块
└── app.module.ts      # 根模块
```

### 依赖注入系统详解

Nest.js的依赖注入系统是其核心特性，它使组件间的依赖关系更加清晰和灵活：

#### 1. 注入方式

```ts
// 构造函数注入（推荐方式）
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}
}

// 属性注入（不推荐，但有时有用）
@Injectable()
export class UserService {
  @Inject(ConfigService)
  private readonly configService: ConfigService;
}
```

#### 2. 自定义提供者

```ts
// providers.ts
import { Provider } from '@nestjs/common';

// 值提供者 - 直接提供一个值
export const CONNECTION_PROVIDER: Provider = {
  provide: 'DATABASE_CONNECTION', // 令牌
  useValue: {
    host: 'localhost', 
    port: 5432
  },
};

// 类提供者 - 实例化一个类
export const SERVICE_PROVIDER: Provider = {
  provide: UserService, // 类作为令牌
  useClass: UserService,
};

// 工厂提供者 - 动态创建提供者
export const REPOSITORY_PROVIDER: Provider = {
  provide: 'USER_REPOSITORY',
  useFactory: (connection: any) => {
    return connection.getRepository(User);
  },
  inject: ['DATABASE_CONNECTION'], // 工厂函数的依赖
};

// 别名提供者 - 使用现有的提供者
export const ALIAS_PROVIDER: Provider = {
  provide: 'USER_SERVICE_ALIAS',
  useExisting: UserService,
};
```

在模块中注册自定义提供者：

```ts
@Module({
  providers: [
    CONNECTION_PROVIDER,
    SERVICE_PROVIDER,
    REPOSITORY_PROVIDER,
    ALIAS_PROVIDER,
  ],
})
export class AppModule {}
```

#### 3. 作用域

Nest.js提供了三种提供者作用域：

```ts
import { Injectable, Scope } from '@nestjs/common';

// 默认单例模式 - 整个应用共享一个实例
@Injectable()
export class DefaultService {}

// 请求作用域 - 每个请求创建新实例
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

// 瞬态作用域 - 每次注入创建新实例
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {}
```

选择合适的作用域对性能有显著影响：
- **单例**（Default）：内存占用最小，适合无状态服务
- **请求作用域**：适合需访问请求上下文的服务，但会增加内存开销
- **瞬态**：适合需要完全独立实例的服务，内存开销最大

#### 4. 模块间服务共享

要在模块间共享服务，需要在提供者所在模块中导出：

```ts
// user.module.ts
@Module({
  providers: [UserService],
  exports: [UserService], // 导出服务
})
export class UserModule {}

// auth.module.ts
@Module({
  imports: [UserModule], // 导入包含所需服务的模块
  providers: [AuthService],
})
export class AuthModule {}

// auth.service.ts
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  
  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    // 验证逻辑...
  }
}
```

#### 5. 循环依赖处理

处理模块间的循环依赖：

```ts
// 使用forwardRef解决循环依赖
@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [UserService],
})
export class UserModule {}

@Module({
  imports: [forwardRef(() => UserModule)],
  exports: [AuthService],
})
export class AuthModule {}

// 在服务中也需要使用forwardRef
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
}
```

虽然Nest.js提供了解决循环依赖的方法，但这通常是设计问题的信号。更好的方法是重构代码，例如：
- 提取共享逻辑到第三个服务
- 使用事件系统解耦组件
- 重新思考责任划分

### 动态模块与配置

动态模块允许自定义模块的导入并传递配置参数：

```ts
// database.module.ts
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
  
  // 常用于特性模块
  static forFeature(entities: any[]): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        ...entities.map(entity => ({
          provide: `${entity.name}_REPOSITORY`,
          useFactory: (connection: Connection) => connection.getRepository(entity),
          inject: [Connection],
        })),
      ],
      exports: [
        ...entities.map(entity => `${entity.name}_REPOSITORY`),
      ],
    };
  }
}

// 在应用模块中使用
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'test',
    }),
  ],
})
export class AppModule {}

// 在特性模块中使用
@Module({
  imports: [
    DatabaseModule.forFeature([User, Product]),
  ],
})
export class UserModule {}
```

### 懒加载模块

对于大型应用，可以使用懒加载模块优化启动时间：

```ts
// 主应用
const app = await NestFactory.create(AppModule);
await app.listen(3000);

// 懒加载微服务
setTimeout(async () => {
  const microservice = await NestFactory.createMicroservice(
    MicroserviceModule,
    {
      transport: Transport.TCP,
      options: { port: 3001 },
    },
  );
  await microservice.listen();
}, 5000);
```

## 控制器与服务分层

### 控制器层设计原则

控制器负责处理HTTP请求和响应，但不应包含业务逻辑。控制器的主要职责是：

1. 路由定义与请求处理
2. 数据验证与转换
3. 响应格式化
4. 错误处理与状态码管理

```ts
import { Controller, Get, Post, Body, Param, UseGuards, UsePipes, ValidationPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('用户管理')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '成功获取用户列表'
  })
  @ApiBearerAuth()
  async findAll() {
    return {
      code: HttpStatus.OK,
      data: await this.userService.findAll(),
      message: '获取用户列表成功'
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '用户创建成功'
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      code: HttpStatus.CREATED,
      data: user,
      message: '用户创建成功'
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取指定用户' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '成功获取用户信息' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: '用户不存在' 
  })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return {
      code: HttpStatus.OK,
      data: await this.userService.findById(id),
      message: '获取用户成功'
    };
  }
}
```

#### RESTful控制器设计

遵循标准REST架构原则：

1. 使用恰当的HTTP方法（GET, POST, PUT, DELETE等）
2. 返回正确的状态码（200, 201, 400, 404, 500等）
3. 使用一致的URL结构（/api/v1/resources, /api/v1/resources/:id）
4. 提供分页、排序和筛选功能
5. 错误信息格式一致

```ts
// 控制器中实现分页、排序和筛选
@Get()
async findAll(
  @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  @Query('sort') sort = 'createdAt',
  @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  @Query('search') search?: string,
) {
  const [data, total] = await this.userService.findAll({
    page,
    limit,
    sort,
    order,
    search,
  });
  
  return {
    code: HttpStatus.OK,
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    message: '获取用户列表成功',
  };
}
```

#### 数据传输对象（DTO）

DTO用于定义数据结构和验证规则，实现输入验证和类型安全：

```ts
// create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'johndoe', 
    description: '用户名' 
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(4, { message: '用户名长度不能小于4个字符' })
  @MaxLength(20, { message: '用户名长度不能超过20个字符' })
  username: string;

  @ApiProperty({ 
    example: 'johndoe@example.com', 
    description: '电子邮件' 
  })
  @IsNotEmpty({ message: '电子邮件不能为空' })
  @IsEmail({}, { message: '电子邮件格式不正确' })
  email: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: '密码' 
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码长度不能小于8个字符' })
  @MaxLength(30, { message: '密码长度不能超过30个字符' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '密码必须包含至少1个大写字母、1个小写字母和1个数字或特殊字符',
  })
  password: string;
}

// DTO继承示例 - 更新用户信息
import { PartialType, OmitType } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

// DTO转换示例
export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
  
  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
```

### 服务层架构与设计模式

服务层封装业务逻辑，遵循单一职责原则，提供可测试和可复用的功能。一个完整的服务层通常包括：

#### 1. 基础服务实现

```ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../core/logger/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext('UserService');
  }

  async findAll(options?: { 
    page: number; 
    limit: number; 
    sort: string; 
    order: 'ASC' | 'DESC';
    search?: string;
  }): Promise<[User[], number]> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC', search } = options || {};
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (search) {
      queryBuilder.where(
        'user.username LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy(`user.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit);
      
    return queryBuilder.getManyAndCount();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    
    // 检查邮箱是否已存在
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Attempt to create user with existing email: ${email}`);
      throw new ConflictException(`邮箱 ${email} 已被注册`);
    }
    
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    
    // 触发用户创建事件
    this.eventEmitter.emit('user.created', savedUser);
    this.logger.log(`User created: ${savedUser.id}`);
    
    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // 先确认用户存在
    await this.findById(id);
    
    // 如果更新邮箱，检查邮箱唯一性
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`邮箱 ${updateUserDto.email} 已被使用`);
      }
    }
    
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.findById(id);
    
    // 触发用户更新事件
    this.eventEmitter.emit('user.updated', updatedUser);
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
    this.eventEmitter.emit('user.deleted', { id });
  }
}
```

#### 2. 多层服务架构

对于复杂业务，采用多层服务架构：

```
services/
├── user/
│   ├── user.service.ts          # 主服务层，对外暴露API
│   ├── user.repository.ts       # 数据访问层，处理数据存储
│   └── user-billing.service.ts  # 子服务，处理特定业务领域
```

```ts
// 数据访问层 - 处理数据存储和查询
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
  
  async findAll(options): Promise<[User[], number]> {
    // 数据查询逻辑...
  }
  
  async findById(id: string): Promise<User> {
    // 数据查询逻辑...
  }
  
  // 更多数据访问方法...
}

// 子服务 - 处理特定业务领域
@Injectable()
export class UserBillingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paymentService: PaymentService,
  ) {}
  
  async processSubscription(userId: string, planId: string): Promise<void> {
    // 处理用户订阅逻辑...
  }
  
  // 更多计费相关方法...
}

// 主服务 - 协调各子服务，实现业务流程
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userBillingService: UserBillingService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async upgradeToPremium(userId: string, planId: string): Promise<User> {
    // 1. 验证用户
    const user = await this.userRepository.findById(userId);
    
    // 2. 处理订阅
    await this.userBillingService.processSubscription(userId, planId);
    
    // 3. 更新用户状态
    user.isPremium = true;
    await this.userRepository.save(user);
    
    // 4. 发送通知
    await this.notificationService.sendUpgradeConfirmation(user);
    
    return user;
  }
  
  // 更多业务方法...
}
```

#### 3. 事务管理

处理跨多个实体的原子操作：

```ts
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class TransferService {
  constructor(
    @InjectEntityManager() 
    private readonly entityManager: EntityManager,
  ) {}

  async transferFunds(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    // 使用事务确保原子性
    await this.entityManager.transaction(async manager => {
      // 1. 获取账户信息
      const fromAccount = await manager.findOne(Account, { 
        where: { id: fromAccountId },
        lock: { mode: 'pessimistic_write' } // 使用悲观锁防止并发问题
      });
      
      const toAccount = await manager.findOne(Account, { 
        where: { id: toAccountId },
        lock: { mode: 'pessimistic_write' }
      });
      
      if (!fromAccount || !toAccount) {
        throw new NotFoundException('账户不存在');
      }
      
      if (fromAccount.balance < amount) {
        throw new BadRequestException('账户余额不足');
      }
      
      // 2. 更新账户余额
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      
      // 3. 保存变更
      await manager.save(fromAccount);
      await manager.save(toAccount);
      
      // 4. 记录交易
      const transaction = manager.create(Transaction, {
        fromAccount,
        toAccount,
        amount,
        date: new Date(),
      });
      
      await manager.save(transaction);
    });
  }
}
```

#### 4. 缓存策略

```ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CachedUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) 
    private readonly cacheManager: Cache,
  ) {}

  async findById(id: string): Promise<User> {
    // 查询缓存
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    
    if (cachedUser) {
      return cachedUser;
    }
    
    // 缓存未命中，查询数据库
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    // 设置缓存，有效期30分钟
    await this.cacheManager.set(cacheKey, user, 1800000);
    
    return user;
  }

  // 更新后自动刷新缓存
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // 更新数据库记录
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    
    if (!updatedUser) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    // 更新缓存
    const cacheKey = `user:${id}`;
    await this.cacheManager.set(cacheKey, updatedUser, 1800000);
    
    return updatedUser;
  }

  // 删除时清除缓存
  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
    await this.cacheManager.del(`user:${id}`);
  }
}
```

#### 5. 应用领域驱动设计（DDD）

在复杂业务场景中，可以采用领域驱动设计：

```
src/
├── domain/                  # 领域层
│   ├── user/
│   │   ├── entities/        # 领域实体
│   │   ├── value-objects/   # 值对象
│   │   ├── events/          # 领域事件
│   │   └── repositories/    # 仓储接口
├── application/             # 应用层
│   ├── user/
│   │   ├── commands/        # 命令处理器
│   │   ├── queries/         # 查询处理器
│   │   └── dto/             # 数据传输对象
├── infrastructure/          # 基础设施层
│   ├── database/
│   │   ├── repositories/    # 仓储实现
│   │   └── entities/        # ORM实体
├── interfaces/              # 接口层
│   ├── http/
│   │   ├── controllers/     # 控制器
│   │   └── middlewares/     # 中间件
```

```ts
// 领域实体
export class UserEntity {
  private readonly id: UserId;
  private name: UserName;
  private email: Email;
  private password: Password;
  private role: UserRole;
  private status: UserStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  
  // 领域行为
  public activate(): void {
    if (this.status.equals(UserStatus.PENDING)) {
      this.status = UserStatus.ACTIVE;
      this.updatedAt = new Date();
      // 添加领域事件
      this.addDomainEvent(new UserActivatedEvent(this.id));
    } else {
      throw new Error('Cannot activate user with current status');
    }
  }
  
  // 更多领域行为...
}

// 领域服务
@Injectable()
export class UserDomainService {
  async changePassword(user: UserEntity, currentPassword: string, newPassword: string): Promise<void> {
    // 验证当前密码
    if (!user.validatePassword(currentPassword)) {
      throw new Error('Current password is incorrect');
    }
    
    // 检查新密码策略
    if (!this.passwordPolicy.isSatisfiedBy(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }
    
    // 更新密码
    user.setPassword(newPassword);
  }
}

// 应用服务
@Injectable()
export class UserApplicationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  
  async changePassword(command: ChangePasswordCommand): Promise<void> {
    // 获取领域实体
    const user = await this.userRepository.findById(new UserId(command.userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // 执行领域逻辑
    await this.userDomainService.changePassword(
      user,
      command.currentPassword,
      command.newPassword
    );
    
    // 保存实体
    await this.userRepository.save(user);
    
    // 发布应用事件
    this.eventEmitter.emit('user.password_changed', { userId: command.userId });
  }
}
```

## 装饰器与中间件用法

### 装饰器系统

Nest.js大量使用TypeScript装饰器来实现声明式编程，提高代码可读性和开发效率：

#### 1. 类装饰器

Nest.js中的类装饰器主要用于定义组件类型和元数据：

```ts
// 控制器装饰器
@Controller('api/v1/users')
export class UserController {}

// 服务装饰器
@Injectable()
export class UserService {}

// 模块装饰器
@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class UserModule {}

// 全局模块装饰器
@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}
```

#### 2. 方法装饰器

用于控制器方法，定义路由、处理方式和元数据：

```ts
export class UserController {
  // HTTP方法装饰器
  @Get()
  findAll() {}
  
  @Post()
  create() {}
  
  @Put(':id')
  update() {}
  
  @Delete(':id')
  remove() {}
  
  @Patch(':id')
  patch() {}
  
  // 路由参数装饰器
  @Get(':id')
  findOne(@Param('id') id: string) {}
  
  // 响应装饰器
  @HttpCode(204)
  @Header('Cache-Control', 'none')
  deleteUser() {}
  
  // 重定向装饰器
  @Redirect('https://example.com', 301)
  redirect() {}
}
```

#### 3. 参数装饰器

用于获取请求数据并注入到方法参数中：

```ts
@Post()
createUser(
  @Body() createUserDto: CreateUserDto,
  @Body('email') email: string,
  @Param('id') id: string,
  @Query('sort') sort: string,
  @Headers('User-Agent') userAgent: string,
  @Ip() ipAddress: string,
  @Session() session: Record<string, any>,
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
) {
  // 实现逻辑...
}
```

#### 4. 自定义装饰器

可以创建自定义装饰器来简化重复代码和增强可读性：

```ts
// 参数装饰器 - 提取用户ID
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return data ? user?.[data] : user;
  },
);

// 使用自定义参数装饰器
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

@Get('role')
getRole(@CurrentUser('role') role: string) {
  return { role };
}

// 方法装饰器 - 角色授权
export function Roles(...roles: string[]) {
  return SetMetadata('roles', roles);
}

// 使用自定义方法装饰器
@Get('admin-panel')
@Roles('admin')
getAdminPanel() {
  return { access: true };
}

// 类和方法装饰器 - API版本控制
export function ApiVersion(version: string) {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // 方法装饰器
      Reflect.defineMetadata('api:version', version, descriptor.value);
      return descriptor;
    }
    // 类装饰器
    Reflect.defineMetadata('api:version', version, target);
    return target;
  };
}

// 组合多个装饰器
export function Public() {
  return applyDecorators(
    SetMetadata('isPublic', true),
    SkipThrottle(),
    ApiResponse({ status: 200 }),
  );
}
```

#### 5. 守卫装饰器

```ts
// 认证守卫
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

// 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
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

// 使用守卫装饰器
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('protected')
getProtectedResource() {
  return { data: 'protected data' };
}
```

### 中间件

中间件是在路由处理程序之前调用的函数，可以访问请求和响应对象，实现横切关注点：

#### 1. 函数式中间件

```ts
// 函数式中间件
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

// 在模块中应用
@Module({
  imports: [],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger)
      .forRoutes('*');
  }
}
```

#### 2. 类中间件

```ts
// 类中间件
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = uuid();
    
    req.requestId = requestId; // 注入请求ID供后续使用
    
    console.log(`[${requestId}] Request: ${req.method} ${req.url}`);
    
    // 响应拦截
    const originalSend = res.send;
    res.send = function(body) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`[${requestId}] Response: ${res.statusCode} (${duration}ms)`);
      return originalSend.call(this, body);
    };
    
    next();
  }
}

// 在模块中应用多个中间件
@Module({
  imports: [],
  controllers: [UserController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware, CorrelationIdMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'metrics', method: RequestMethod.GET },
      )
      .forRoutes(UserController);
      
    // 或者通过路径指定
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes(
        { path: 'auth/*', method: RequestMethod.POST },
        { path: 'api/v1/users', method: RequestMethod.POST },
      );
  }
}
```

#### 3. 全局中间件

```ts
// 在main.ts中注册全局中间件
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局中间件
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.use(cookieParser());
  
  await app.listen(3000);
}
bootstrap();
```

### 拦截器

拦截器实现了AOP（面向切面编程），可以在执行方法前后添加逻辑：

```ts
// 日志拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    
    this.logger.log(`Request: ${method} ${url}`);
    
    const now = Date.now();
    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        
        this.logger.log(`Response: ${response.statusCode} (${delay}ms)`);
      }),
    );
  }
}

// 响应转换拦截器
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        code: context.switchToHttp().getResponse().statusCode,
        data,
        message: 'Operation successful',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// 缓存拦截器
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const ttl = this.reflector.get<number>('cache-ttl', context.getHandler()) || 60;
    const cacheKey = `${request.url}`;
    
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(response => {
        this.cacheManager.set(cacheKey, response, ttl * 1000);
      }),
    );
  }
}

// 应用拦截器
@UseInterceptors(LoggingInterceptor)
export class AppController {
  // 全控制器应用拦截器
}

@Get()
@UseInterceptors(HttpCacheInterceptor)
@SetMetadata('cache-ttl', 120)
findAll() {
  // 单路由应用拦截器
}

// 全局应用拦截器
app.useGlobalInterceptors(new TransformInterceptor());
```

### 异常过滤器

异常过滤器允许统一处理异常，提供一致的错误响应格式：

```ts
// 全局异常过滤器
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_ERROR';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || message;
        code = (errorResponse as any).error || code;
      } else {
        message = errorResponse.toString();
      }
    }
    
    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = 'VALIDATION_ERROR';
    }
    
    // 数据库错误处理
    if (exception.name === 'QueryFailedError') {
      status = HttpStatus.BAD_REQUEST;
      message = '数据操作失败';
      code = 'DATABASE_ERROR';
    }
    
    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
      'ExceptionFilter'
    );
    
    // 返回统一格式的错误响应
    response.status(status).json({
      code: status,
      error: code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

// 在main.ts中注册全局异常过滤器
app.useGlobalFilters(new GlobalExceptionFilter(app.get(LoggerService)));
```

### 管道

管道主要用于数据验证和转换：

```ts
// 自定义验证管道
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.Schema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error, value: validatedValue } = this.schema.validate(value);
    
    if (error) {
      throw new BadRequestException('验证失败: ' + error.message);
    }
    
    return validatedValue;
  }
}

// 使用自定义管道
@Post()
createUser(
  @Body(new JoiValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
) {
  return this.userService.create(createUserDto);
}

// 全局使用ValidationPipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // 删除未在DTO中定义的属性
    forbidNonWhitelisted: true, // 如果请求包含未定义的属性，抛出错误
    transform: true, // 自动转换基本类型值
    transformOptions: { enableImplicitConversion: true },
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
      }));
      return new UnprocessableEntityException(result);
    },
  }),
);
```

## 企业级开发最佳实践

### 项目结构设计

采用领域驱动的分层架构，提升代码可维护性：

```
src/
├── main.ts                # 应用入口
├── app.module.ts          # 根模块
├── config/                # 配置管理
├── core/                  # 核心模块
│   ├── guards/            # 全局守卫
│   ├── interceptors/      # 全局拦截器
│   ├── filters/           # 全局过滤器
│   └── decorators/        # 自定义装饰器
├── common/                # 通用模块
│   ├── constants/         # 常量定义
│   ├── enums/             # 枚举定义
│   ├── exceptions/        # 自定义异常
│   └── utils/             # 工具函数
├── modules/               # 业务模块
│   ├── user/              # 用户模块
│   ├── auth/              # 认证模块
│   └── product/           # 产品模块
└── shared/                # 共享模块
    ├── services/          # 共享服务
    └── entities/          # 共享实体
```

### 配置管理

使用NestJS配置模块实现类型安全的、分环境的配置：

```ts
// config/configuration.ts
export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});

// config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
});

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    // 其他模块...
  ],
})
export class AppModule {}
```

### 异常处理策略

设计统一异常处理机制，提高系统健壮性：

```ts
// 业务异常基类
export class BusinessException extends HttpException {
  constructor(
    private readonly errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        code: status,
        error: errorCode,
        message,
      },
      status,
    );
  }
}

// 具体业务异常
export class UserNotFoundException extends BusinessException {
  constructor(userId: string) {
    super(
      'USER_NOT_FOUND',
      `用户ID ${userId} 不存在`,
      HttpStatus.NOT_FOUND,
    );
  }
}

// 使用具体业务异常
@Injectable()
export class UserService {
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }
}
```

### 生产环境安全最佳实践

保障应用安全性的关键措施：

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 安全相关中间件
  app.use(helmet()); // 添加安全相关的HTTP头
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每IP限制请求数
    }),
  );
  
  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  
  // 全局前缀
  app.setGlobalPrefix('api/v1');
  
  // 请求验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Swagger API文档（仅在非生产环境）
  if (configService.get('NODE_ENV') !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('API文档')
      .setDescription('应用API接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
  
  await app.listen(configService.get('PORT', 3000));
}
```

### 测试策略

实现多层次测试策略，保障代码质量：

1. **单元测试** - 测试单个函数/方法的逻辑：

```ts
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<Repository<User>>;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    
    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });
  
  it('should find a user by id', async () => {
    const user = { id: '1', username: 'test' };
    repository.findOne.mockReturnValue(user);
    
    expect(await service.findById('1')).toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
```

2. **集成测试** - 测试多个组件协同工作：

```ts
// user.controller.integration.spec.ts
describe('UserController (integration)', () => {
  let app: INestApplication;
  let userService: UserService;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });
  
  it('/GET users/:id should return a user', () => {
    const user = { id: '1', username: 'test' };
    jest.spyOn(userService, 'findById').mockImplementation(() => Promise.resolve(user));
    
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(200)
      .expect(res => {
        expect(res.body.data).toEqual(user);
      });
  });
});
```

3. **E2E测试** - 测试完整流程：

```ts
// user.e2e-spec.ts
describe('User Module (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // 先登录获取JWT令牌
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });
      
    jwtToken = response.body.data.token;
  });
  
  it('should create a new user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
      })
      .expect(201)
      .expect(res => {
        expect(res.body.data.username).toEqual('newuser');
        expect(res.body.data).toHaveProperty('id');
      });
  });
});
```

### 性能优化策略

采用多种技术提升应用性能：

1. **数据库查询优化**：
   - 使用QueryBuilder构建高效查询
   - 创建适当的索引
   - 使用关系的懒加载/预加载

2. **缓存策略**：
   - 使用Redis缓存频繁查询数据
   - 实现多级缓存（内存、Redis）

3. **压缩与资源优化**：
   - 使用compression中间件压缩响应
   - 实现响应流式处理

4. **异步任务处理**：
   - 将耗时任务移至队列处理
   - 使用Bull队列实现可靠的任务调度

```ts
// 队列处理示例
@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.emailQueue.add('welcome', { user }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}

// 队列处理器
@Processor('email')
export class EmailProcessor {
  @Process('welcome')
  async handleWelcomeEmail(job: Job<{ user: User }>): Promise<void> {
    const { user } = job.data;
    // 发送欢迎邮件的实际逻辑
  }
}
```

### 部署与运维

企业级应用的部署最佳实践：

1. **Docker容器化**：
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY package*.json ./
   
   USER node
   EXPOSE 3000
   CMD ["node", "dist/main"]
   ```

2. **健康检查端点**：
   ```ts
   @Controller('health')
   export class HealthController {
     constructor(
       private health: HealthCheckService,
       private db: TypeOrmHealthIndicator,
       private memory: MemoryHealthIndicator,
     ) {}
   
     @Get()
     @HealthCheck()
     check() {
       return this.health.check([
         () => this.db.pingCheck('database'),
         () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
       ]);
     }
   }
   ```

3. **CI/CD流水线**：
   - 实现自动测试、构建和部署
   - 使用环境隔离确保稳定性

4. **监控与日志**：
   - 使用集中式日志系统
   - 实现应用监控和告警

5. **优雅关闭**：
   ```ts
   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     
     // 优雅关闭
     app.enableShutdownHooks();
     
     await app.listen(3000);
   }
   ```

通过上述企业级最佳实践，可以构建高可用、可维护的Nest.js应用，满足现代企业级应用的各种需求。

> 参考资料：[Nest.js官方文档](https://docs.nestjs.com/) 