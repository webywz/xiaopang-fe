---
outline: deep
---

# Nest.js 测试

Nest.js 提供了强大的测试支持，包括单元测试和端到端(e2e)测试。本文将详细介绍如何在 Nest.js 应用中进行各种测试。

## 测试基础

Nest.js 在创建项目时自动集成了 Jest 作为默认的测试框架。

### 安装依赖

如果你需要手动安装测试依赖，可以使用：

```bash
npm install --save-dev @nestjs/testing jest @types/jest ts-jest supertest @types/supertest
```

### 测试文件位置

- 单元测试通常与源代码放在同一目录，文件命名为 `*.spec.ts`
- e2e 测试放在 `test` 目录下，文件命名为 `*.e2e-spec.ts`

### Jest 配置

在项目根目录的 `package.json` 中，你会看到测试相关的脚本：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## 单元测试

单元测试用于测试独立的代码单元，如服务、控制器或管道等。

### 测试模块

Nest.js 提供了 `@nestjs/testing` 包用于创建测试环境：

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

### 测试控制器

测试控制器示例：

```typescript
// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: 1, name: '张三', email: 'zhangsan@example.com' },
              { id: 2, name: '李四', email: 'lisi@example.com' },
            ]),
            findOne: jest.fn().mockImplementation((id: number) => 
              Promise.resolve({ id, name: '张三', email: 'zhangsan@example.com' })
            ),
            create: jest.fn().mockImplementation(dto => 
              Promise.resolve({ id: Date.now(), ...dto })
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('应该返回用户数组', async () => {
      const result = await controller.findAll();
      expect(result).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('应该通过id返回单个用户', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual({
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('应该创建新用户', async () => {
      const createUserDto = {
        name: '王五',
        email: 'wangwu@example.com',
        password: 'password123',
      };
      const result = await controller.create(createUserDto);
      expect(result).toHaveProperty('id');
      expect(result.name).toEqual('王五');
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
```

### 测试服务

测试服务示例：

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该返回用户数组', async () => {
      const users = [
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
      ];
      jest.spyOn(repo, 'find').mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('应该返回单个用户', async () => {
      const user = { id: 1, name: '张三', email: 'zhangsan@example.com' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('用户不存在时应该抛出错误', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('create', () => {
    it('应该创建并返回新用户', async () => {
      const createUserDto = {
        name: '王五',
        email: 'wangwu@example.com',
        password: 'password123',
      };
      const newUser = { id: 1, ...createUserDto };
      
      jest.spyOn(repo, 'create').mockReturnValue(newUser);
      jest.spyOn(repo, 'save').mockResolvedValue(newUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(newUser);
      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.save).toHaveBeenCalledWith(newUser);
    });
  });
});
```

### 模拟依赖

#### 手动模拟

使用 Jest 的 `jest.fn()` 模拟方法：

```typescript
const mockService = {
  findAll: jest.fn().mockResolvedValue([{ id: 1, name: '测试' }]),
  findOne: jest.fn().mockResolvedValue({ id: 1, name: '测试' }),
};

const module: TestingModule = await Test.createTestingModule({
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useValue: mockService,
    },
  ],
}).compile();
```

#### 使用 `@nestjs/testing` 的 overrideProvider 方法

```typescript
const mockService = {
  findAll: jest.fn().mockResolvedValue([{ id: 1, name: '测试' }]),
};

const module: TestingModule = await Test.createTestingModule({
  controllers: [UsersController],
  providers: [UsersService],
})
  .overrideProvider(UsersService)
  .useValue(mockService)
  .compile();
```

### 测试异步代码

使用 Jest 的 `async/await` 支持：

```typescript
it('应该异步地返回用户', async () => {
  const result = await service.findAll();
  expect(result).toEqual([{ id: 1, name: '测试' }]);
});
```

### 测试异常

```typescript
it('应该抛出错误', async () => {
  jest.spyOn(service, 'findOne').mockRejectedValue(new Error('测试错误'));
  await expect(controller.findOne('1')).rejects.toThrow('测试错误');
});
```

## 端到端(E2E)测试

E2E 测试用于测试整个应用程序的流程，从 HTTP 请求到响应。

### 基本配置

在 `test` 目录中，你会找到 `jest-e2e.json` 配置文件和 `app.e2e-spec.ts` 测试文件。

```json
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### 测试 HTTP 请求

使用 `supertest` 库发送 HTTP 请求：

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 1);
      });
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: '赵六',
        email: 'zhaoliu@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('赵六');
      });
  });
});
```

### 全局配置

为了确保 E2E 测试环境与实际应用一致，可以应用相同的全局配置：

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 应用全局管道，确保测试环境与实际环境一致
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();
  });

  // 测试用例...
});
```

### 模拟数据库

使用内存数据库或测试数据库进行测试：

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { User } from '../src/users/entities/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // 初始化测试数据
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: '测试用户',
        email: 'test@example.com',
        password: 'password',
      });
  });

  // 测试用例...
});
```

## 测试技巧

### 测试覆盖率

使用 Jest 的覆盖率工具：

```bash
npm run test:cov
```

这将生成一个覆盖率报告，显示哪些代码被测试覆盖，哪些没有。

### 测试过滤

只运行特定的测试：

```bash
npm test -- -t "测试名称"
```

### 调试测试

使用 `test:debug` 脚本并在浏览器中打开 `chrome://inspect`：

```bash
npm run test:debug
```

### 测试守卫和管道

```typescript
// auth.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new AuthGuard(jwtService);
  });

  it('有效令牌时应该返回 true', async () => {
    const token = jwtService.sign({ userId: 1 });
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      }),
    } as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('无效令牌时应该抛出错误', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow();
  });
});
```

### 测试自定义装饰器

```typescript
// user.decorator.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { GetUser } from './user.decorator';

describe('GetUser Decorator', () => {
  it('应该从请求对象中提取用户', () => {
    const user = { id: 1, name: '测试用户' };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as ExecutionContext;

    const decorator = GetUser();
    const result = decorator(null, context);

    expect(result).toEqual(user);
  });
});
```

## 测试微服务

### 测试 microservice 应用

```typescript
// user.controller.spec.ts for microservices
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: 1, name: '张三' },
              { id: 2, name: '李四' },
            ]),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('应该返回所有用户', async () => {
      const result = await controller.findAll({});
      expect(result).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
```

### 测试消息模式

```typescript
// payment.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            processPayment: jest.fn().mockImplementation((data) => {
              return { success: true, orderId: data.orderId };
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  describe('processPayment', () => {
    it('应该处理支付并返回结果', async () => {
      const paymentData = { orderId: '123', amount: 100 };
      const result = await controller.processPayment(paymentData);
      
      expect(result).toEqual({ success: true, orderId: '123' });
      expect(service.processPayment).toHaveBeenCalledWith(paymentData);
    });
  });
});
```

## 测试 GraphQL 应用

### 测试 GraphQL 解析器

```typescript
// users.resolver.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: 1, name: '张三', email: 'zhangsan@example.com' },
              { id: 2, name: '李四', email: 'lisi@example.com' },
            ]),
            findOneById: jest.fn().mockImplementation((id) => {
              return Promise.resolve({ id, name: '张三', email: 'zhangsan@example.com' });
            }),
            create: jest.fn().mockImplementation((createUserInput) => {
              return Promise.resolve({
                id: 3,
                ...createUserInput,
              });
            }),
          },
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get<UsersService>(UsersService);
  });

  describe('users', () => {
    it('应该返回用户数组', async () => {
      const result = await resolver.users();
      expect(result).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('user', () => {
    it('应该返回单个用户', async () => {
      const result = await resolver.user(1);
      expect(result).toEqual({
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
      });
      expect(service.findOneById).toHaveBeenCalledWith(1);
    });
  });

  describe('createUser', () => {
    it('应该创建并返回新用户', async () => {
      const createUserInput = {
        name: '王五',
        email: 'wangwu@example.com',
        password: 'password123',
      };
      
      const result = await resolver.createUser(createUserInput);
      
      expect(result).toEqual({
        id: 3,
        ...createUserInput,
      });
      expect(service.create).toHaveBeenCalledWith(createUserInput);
    });
  });
});
```

### 执行 GraphQL 查询

```typescript
// test/graphql.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('应该查询所有用户', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          {
            users {
              id
              name
              email
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.users).toBeDefined();
        expect(Array.isArray(res.body.data.users)).toBeTruthy();
      });
  });

  it('应该查询单个用户', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          {
            user(id: 1) {
              id
              name
              email
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.id).toEqual(1);
      });
  });

  it('应该创建新用户', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            createUser(createUserInput: {
              name: "赵六",
              email: "zhaoliu@example.com",
              password: "password123"
            }) {
              id
              name
              email
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createUser).toBeDefined();
        expect(res.body.data.createUser.name).toEqual('赵六');
      });
  });
});
```

## 总结

测试是保证 Nest.js 应用质量的重要环节。通过单元测试，你可以验证独立组件的功能正确性；通过 E2E 测试，你可以确保整个应用流程的可靠性。

Nest.js 提供的测试工具和框架使得编写和执行测试变得简单高效。通过本文介绍的各种测试技术和最佳实践，你可以为你的 Nest.js 应用构建全面的测试策略，提高代码质量，减少线上问题。

## 参考资源

- [Nest.js 官方文档 - 测试](https://docs.nestjs.com/fundamentals/testing)
- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [SuperTest 文档](https://github.com/visionmedia/supertest) 