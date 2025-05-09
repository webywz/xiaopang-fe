---
outline: deep
---

# Nest.js 缓存管理

缓存是提高应用性能的重要技术，可以减少计算负载并加快响应时间。Nest.js 提供了灵活的缓存管理解决方案，支持多种缓存存储方式。本文将详细介绍如何在 Nest.js 中使用和管理缓存。

## 缓存基础

### 安装依赖

首先安装必要的依赖：

```bash
npm install @nestjs/cache-manager cache-manager
```

对于 Nest.js v9 及以上版本：

```bash
npm install @nestjs/cache-manager cache-manager@^5.0.0
```

### 注册缓存模块

在应用的根模块中注册 `CacheModule`：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5 * 60 * 1000, // 缓存过期时间，单位毫秒（这里是5分钟）
      max: 100, // 最大缓存项数
      isGlobal: true, // 全局注册，所有模块都可以使用
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 使用缓存

### 注入缓存管理器

在服务或控制器中注入缓存管理器：

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // 使用缓存的方法
}
```

### 基本操作

缓存管理器提供了四个基本方法：

```typescript
async getHello(): Promise<string> {
  // 1. 获取缓存
  const cachedData = await this.cacheManager.get<string>('hello');
  if (cachedData) {
    console.log('从缓存获取数据');
    return cachedData;
  }

  // 2. 设置缓存
  const data = `Hello World! ${Date.now()}`;
  await this.cacheManager.set('hello', data);
  console.log('将数据存入缓存');
  
  return data;
}

async clearCache(): Promise<void> {
  // 3. 删除指定缓存
  await this.cacheManager.del('hello');
  
  // 4. 重置所有缓存
  await this.cacheManager.reset();
}
```

### 自动缓存响应

通过 `@UseInterceptors` 装饰器和 `CacheInterceptor` 可以自动缓存控制器响应：

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AppService } from './app.service';

@Controller()
@UseInterceptors(CacheInterceptor) // 应用到整个控制器
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('custom-ttl')
  @CacheTTL(30) // 自定义此路由的缓存过期时间为30秒
  getWithCustomTtl(): string {
    return this.appService.getHello();
  }
  
  @Get('no-cache')
  @CacheTTL(0) // 设置为0禁用此路由的缓存
  getWithoutCache(): string {
    return this.appService.getHello();
  }
}
```

也可以全局应用缓存拦截器：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5 * 60 * 1000,
      max: 100,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

### 自定义缓存键

默认情况下，Nest.js 使用请求的 URL 作为缓存键。可以通过实现自定义 `CacheKey` 来更改这一行为：

```typescript
import { Injectable, CacheKey, CacheTTL } from '@nestjs/common';

@Injectable()
export class UserService {
  @CacheKey('custom_key')
  @CacheTTL(60 * 5)
  async findAllUsers() {
    return [/* 用户列表 */];
  }
}
```

对于控制器中的路由，可以结合 `@CacheKey` 装饰器使用：

```typescript
import { Controller, Get, CacheKey, CacheTTL } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get()
  @CacheKey('all_users')
  @CacheTTL(60 * 5)
  findAll() {
    return this.userService.findAllUsers();
  }
}
```

## 高级缓存配置

### 使用 Redis 作为缓存存储

默认情况下，Nest.js 使用内存作为缓存存储。在生产环境中，通常会使用 Redis 等分布式缓存系统：

```bash
npm install cache-manager-redis-store@2 redis@3
```

对于 Redis 客户端 v4，使用：

```bash
npm install cache-manager-redis-yet redis
```

配置 Redis 存储：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60 * 5, // 5分钟
    }),
  ],
})
export class AppModule {}
```

对于 Redis 客户端 v4，配置略有不同：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';

@Module({
  imports: [
    CacheModule.register({
      store: async () => {
        const client = createClient({
          url: 'redis://localhost:6379',
        });
        await client.connect();
        
        return redisStore(client);
      },
      ttl: 60 * 5, // 5分钟
    }),
  ],
})
export class AppModule {}
```

### 异步配置

在实际应用中，缓存配置通常需要从配置服务获取，可以使用异步配置：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('CACHE_TTL', 300) * 1000, // 转换为毫秒
        max: configService.get('CACHE_MAX_ITEMS', 100),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
      }),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### 自定义缓存管理器

在某些情况下，您可能需要创建自定义缓存管理器：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Module({
  imports: [CacheModule.register()],
  providers: [
    {
      provide: 'CUSTOM_CACHE_MANAGER',
      useFactory: (cacheManager: Cache) => {
        // 自定义逻辑，例如添加日志、错误处理等
        return {
          async get(key: string) {
            console.log(`Getting from cache: ${key}`);
            return await cacheManager.get(key);
          },
          async set(key: string, value: any, options?: any) {
            console.log(`Setting to cache: ${key}`);
            return await cacheManager.set(key, value, options);
          },
          async del(key: string) {
            console.log(`Deleting from cache: ${key}`);
            return await cacheManager.del(key);
          },
          async reset() {
            console.log('Resetting cache');
            return await cacheManager.reset();
          },
        };
      },
      inject: [CACHE_MANAGER],
    },
  ],
  exports: ['CUSTOM_CACHE_MANAGER'],
})
export class CustomCacheModule {}
```

## 缓存策略与模式

### 缓存策略

#### 缓存旁路 (Cache-Aside)

最常用的缓存模式，应用先查缓存，缓存未命中时查数据库并更新缓存：

```typescript
async findUserById(id: number): Promise<User> {
  // 尝试从缓存获取
  const cachedUser = await this.cacheManager.get<User>(`user:${id}`);
  if (cachedUser) {
    return cachedUser;
  }
  
  // 缓存未命中，从数据库获取
  const user = await this.userRepository.findOne({ where: { id } });
  if (user) {
    // 更新缓存
    await this.cacheManager.set(`user:${id}`, user, { ttl: 3600 });
  }
  
  return user;
}
```

#### 写入缓存 (Write-Through)

数据写入同时更新缓存：

```typescript
async createUser(createUserDto: CreateUserDto): Promise<User> {
  // 创建用户
  const user = await this.userRepository.save(createUserDto);
  
  // 同时更新缓存
  await this.cacheManager.set(`user:${user.id}`, user);
  
  return user;
}
```

#### 写回缓存 (Write-Back)

先写入缓存，异步更新数据库（适用于高写入场景）：

```typescript
async updateUserStatus(id: number, status: string): Promise<void> {
  // 先更新缓存
  const cachedUser = await this.cacheManager.get<User>(`user:${id}`);
  if (cachedUser) {
    cachedUser.status = status;
    await this.cacheManager.set(`user:${id}`, cachedUser);
  }
  
  // 异步更新数据库
  this.updateQueue.add({ id, status });
}
```

### 缓存失效策略

#### 基于时间的失效 (TTL)

设置缓存项的过期时间：

```typescript
// 设置缓存1小时后过期
await this.cacheManager.set('key', 'value', { ttl: 3600 });
```

#### 基于事件的失效

当相关数据更新时主动使缓存失效：

```typescript
async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  // 更新数据库
  const user = await this.userRepository.findOne({ where: { id } });
  Object.assign(user, updateUserDto);
  await this.userRepository.save(user);
  
  // 使缓存失效
  await this.cacheManager.del(`user:${id}`);
  
  return user;
}
```

#### 模式失效

当实体更新时，使相关的所有缓存失效：

```typescript
async updateUserRole(id: number, role: string): Promise<void> {
  // 更新用户角色
  await this.userRepository.update(id, { role });
  
  // 使特定用户缓存失效
  await this.cacheManager.del(`user:${id}`);
  
  // 使相关缓存失效
  await this.cacheManager.del('all_users');
  await this.cacheManager.del(`user_roles:${role}`);
}
```

## 常见缓存场景

### 缓存数据库查询结果

```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Product[]> {
    const cacheKey = 'all_products';
    const cachedProducts = await this.cacheManager.get<Product[]>(cacheKey);
    
    if (cachedProducts) {
      return cachedProducts;
    }
    
    const products = await this.productRepository.find();
    await this.cacheManager.set(cacheKey, products, { ttl: 3600 });
    
    return products;
  }
  
  async findById(id: number): Promise<Product> {
    const cacheKey = `product:${id}`;
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey);
    
    if (cachedProduct) {
      return cachedProduct;
    }
    
    const product = await this.productRepository.findOne({ where: { id } });
    if (product) {
      await this.cacheManager.set(cacheKey, product, { ttl: 3600 });
    }
    
    return product;
  }
  
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);
    
    // 更新缓存
    await this.cacheManager.set(`product:${id}`, product);
    // 使相关缓存失效
    await this.cacheManager.del('all_products');
    
    return product;
  }
}
```

### 缓存外部 API 调用

```typescript
@Injectable()
export class WeatherService {
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWeather(city: string): Promise<any> {
    const cacheKey = `weather:${city}`;
    const cachedWeather = await this.cacheManager.get(cacheKey);
    
    if (cachedWeather) {
      return cachedWeather;
    }
    
    try {
      const response = await this.httpService.get(
        `https://api.weather.com/data?city=${city}`,
      ).toPromise();
      
      const weatherData = response.data;
      // 缓存30分钟
      await this.cacheManager.set(cacheKey, weatherData, { ttl: 30 * 60 });
      
      return weatherData;
    } catch (error) {
      throw new ServiceUnavailableException('无法获取天气数据');
    }
  }
}
```

### 缓存计算密集型操作

```typescript
@Injectable()
export class ReportService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async generateComplexReport(userId: number, date: string): Promise<any> {
    const cacheKey = `report:${userId}:${date}`;
    const cachedReport = await this.cacheManager.get(cacheKey);
    
    if (cachedReport) {
      return cachedReport;
    }
    
    // 执行复杂计算
    const report = await this.performComplexCalculations(userId, date);
    
    // 缓存结果一天
    await this.cacheManager.set(cacheKey, report, { ttl: 24 * 60 * 60 });
    
    return report;
  }

  private async performComplexCalculations(userId: number, date: string): Promise<any> {
    // 模拟复杂计算
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { userId, date, data: 'Complex report data' };
  }
}
```

## 缓存最佳实践

### 缓存键命名约定

使用一致的命名模式以便于管理和调试：

```typescript
// 推荐的命名模式：
// - 实体:id 用于单个实体缓存
// - 实体:属性:值 用于实体列表缓存
// - 操作:参数 用于操作结果缓存

// 单个用户
const userCacheKey = `user:${userId}`;

// 用户列表缓存
const activeUsersCacheKey = 'user:status:active';

// 操作结果缓存
const reportCacheKey = `report:monthly:${year}:${month}`;
```

### 监控与管理

实现缓存监控服务：

```typescript
@Injectable()
export class CacheMonitoringService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private metricsService: MetricsService,
  ) {}

  async monitorCacheStats(): Promise<void> {
    // 记录缓存命中率
    this.metricsService.recordCacheHitRate(this.hitRate);
    
    // 记录缓存大小
    this.metricsService.recordCacheSize(await this.getCacheSize());
  }
  
  // 实现获取缓存统计信息的方法
  private async getCacheSize(): Promise<number> {
    // 注意：这取决于使用的缓存实现
    // 对于 Redis，可以使用 Redis 客户端的命令获取
    return 0; // 例子
  }
  
  // 缓存命中率
  private get hitRate(): number {
    // 使用 cacheManager 提供的统计信息
    return 0; // 例子
  }
}
```

### 缓存预热

在应用启动时预加载常用数据到缓存：

```typescript
@Injectable()
export class CacheWarmupService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  async onModuleInit() {
    console.log('预热缓存...');
    
    // 预热用户数据
    const users = await this.userService.findAllWithoutCache();
    await this.cacheManager.set('all_users', users, { ttl: 3600 });
    
    // 预热产品数据
    const popularProducts = await this.productService.findPopularWithoutCache();
    await this.cacheManager.set('popular_products', popularProducts, { ttl: 3600 });
    
    console.log('缓存预热完成');
  }
}
```

### 防止缓存击穿和缓存雪崩

缓存击穿：当一个热点键过期时，大量请求同时访问数据库

```typescript
@Injectable()
export class UserService {
  private fetchLocks = new Map<string, Promise<any>>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findById(id: number): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    
    if (cachedUser) {
      return cachedUser;
    }
    
    // 防止缓存击穿，使用互斥锁
    if (!this.fetchLocks.has(cacheKey)) {
      const fetchPromise = this.fetchAndCacheUser(id, cacheKey);
      this.fetchLocks.set(cacheKey, fetchPromise);
      
      // 请求完成后移除锁
      fetchPromise.finally(() => {
        this.fetchLocks.delete(cacheKey);
      });
    }
    
    return this.fetchLocks.get(cacheKey);
  }
  
  private async fetchAndCacheUser(id: number, cacheKey: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (user) {
      // 使用随机过期时间防止缓存雪崩
      const ttl = 3600 + Math.floor(Math.random() * 120); // 3600-3720秒
      await this.cacheManager.set(cacheKey, user, { ttl });
    }
    
    return user;
  }
}
```

### 缓存分层

对不同类型的数据使用不同的缓存层：

```typescript
@Injectable()
export class MultiLevelCacheService {
  constructor(
    @Inject('MEMORY_CACHE') private memoryCache: Cache,
    @Inject('REDIS_CACHE') private redisCache: Cache,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    // 1. 尝试从内存缓存获取
    const memoryResult = await this.memoryCache.get<T>(key);
    if (memoryResult) {
      return memoryResult;
    }
    
    // 2. 从 Redis 缓存获取
    const redisResult = await this.redisCache.get<T>(key);
    if (redisResult) {
      // 填充内存缓存
      await this.memoryCache.set(key, redisResult, { ttl: 60 }); // 短期缓存
      return redisResult;
    }
    
    return undefined;
  }
  
  async set(key: string, value: any, options?: any): Promise<void> {
    // 同时写入内存和 Redis 缓存
    await this.memoryCache.set(key, value, { ttl: 60, ...options }); // 短期内存缓存
    await this.redisCache.set(key, value, { ttl: 3600, ...options }); // 长期 Redis 缓存
  }
  
  async del(key: string): Promise<void> {
    // 删除所有缓存层
    await this.memoryCache.del(key);
    await this.redisCache.del(key);
  }
}
```

## 缓存在不同场景下的应用

### REST API 缓存

使用 HTTP 缓存头实现客户端缓存：

```typescript
import { Controller, Get, Param, Header, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300') // 5分钟客户端缓存
  async findAll() {
    return this.productService.findAll();
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productService.findById(+id);
    
    if (product.isStatic) {
      // 静态产品长时间缓存
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1天
    } else {
      // 动态产品短时间缓存
      res.setHeader('Cache-Control', 'public, max-age=60'); // 1分钟
    }
    
    return res.json(product);
  }
}
```

### GraphQL 缓存

使用 `@CacheControl` 指令为 GraphQL 操作添加缓存控制：

```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CacheControl } from './cache-control.decorator';

@Resolver('Product')
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query('products')
  @CacheControl({ maxAge: 60 }) // 1分钟
  async getProducts() {
    return this.productService.findAll();
  }
  
  @Query('product')
  @CacheControl({ maxAge: 300 }) // 5分钟
  async getProduct(@Args('id') id: number) {
    return this.productService.findById(id);
  }
}
```

### WebSocket 缓存

对 WebSocket 消息进行缓存，减少重复计算：

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@WebSocketGateway()
export class StockGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private stockService: StockService,
  ) {}

  @SubscribeMessage('getStockData')
  async handleGetStockData(@MessageBody() stock: string) {
    const cacheKey = `stock:${stock}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      return { event: 'stockData', data: cachedData };
    }
    
    const stockData = await this.stockService.getStockData(stock);
    // 缓存1分钟
    await this.cacheManager.set(cacheKey, stockData, { ttl: 60 });
    
    return { event: 'stockData', data: stockData };
  }
}
```

## 总结

Nest.js 提供了强大而灵活的缓存机制，可以显著提高应用性能。通过选择合适的缓存策略、使用适当的存储引擎以及遵循最佳实践，可以构建高效、可扩展的应用程序。

缓存管理是一门平衡艺术，需要在数据一致性和性能之间找到平衡点。通过本文介绍的技术和模式，您可以在 Nest.js 应用中有效地实现和管理缓存。

## 参考资源

- [Nest.js 官方文档 - 缓存](https://docs.nestjs.com/techniques/caching)
- [node-cache-manager 文档](https://github.com/node-cache-manager/node-cache-manager)
- [Redis 文档](https://redis.io/documentation) 