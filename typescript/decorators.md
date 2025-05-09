# TypeScript 装饰器指南

## 装饰器简介

装饰器是一种特殊类型的声明，可以附加到类声明、方法、访问器、属性或参数上。装饰器使用 `@expression` 形式，其中 `expression` 必须计算为一个函数，该函数将在运行时被调用，并带有关于被装饰声明的信息。

TypeScript 装饰器是实验性功能，需要在 `tsconfig.json` 中启用：

```json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true  // 可选，用于反射元数据
  }
}
```

## 装饰器类型

### 类装饰器

类装饰器在类声明之前被声明，应用于类构造函数，可以用来观察、修改或替换类定义。

```typescript
/**
 * 类装饰器示例 - 为类添加额外属性
 * @param constructor 类的构造函数
 */
function Logger(constructor: Function) {
  console.log(`创建类: ${constructor.name}`);
  // 向类原型添加属性
  constructor.prototype.logger = function() {
    console.log(`${constructor.name} 实例方法被调用`);
  };
}

@Logger
class Person {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

// 扩展类型以支持动态添加的方法
interface Person {
  logger(): void;
}

const person = new Person("张三");
person.logger(); // 输出: "Person 实例方法被调用"
```

### 工厂装饰器

装饰器工厂是一个返回装饰器的函数，允许我们自定义装饰器应用时的行为。

```typescript
/**
 * 带参数的类装饰器工厂
 * @param logString 日志内容
 */
function WithLog(logString: string) {
  return function(constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}

@WithLog("日志 - Person类")
class Person {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}
```

### 方法装饰器

方法装饰器应用在方法声明之前，可以用来观察、修改或替换方法定义。

```typescript
/**
 * 性能监控方法装饰器
 */
function Measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const finish = performance.now();
    console.log(`${propertyKey} 执行时间: ${finish - start} 毫秒`);
    return result;
  };
  
  return descriptor;
}

class TaskRunner {
  @Measure
  runTask(taskName: string) {
    console.log(`执行任务: ${taskName}`);
    // 模拟耗时操作
    for (let i = 0; i < 1000000; i++) {}
  }
}

const runner = new TaskRunner();
runner.runTask("重要任务");
// 输出:
// 执行任务: 重要任务
// runTask 执行时间: 5.6700000166893005 毫秒
```

### 访问器装饰器

访问器装饰器应用在访问器声明之前。

```typescript
function Configurable(value: boolean) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
  
  @Configurable(false)
  get x() {
    return this._x;
  }
  
  @Configurable(false)
  get y() {
    return this._y;
  }
}
```

### 属性装饰器

属性装饰器应用在属性声明之前。

```typescript
/**
 * 属性验证装饰器
 */
function MinLength(length: number) {
  return function(target: any, propertyKey: string) {
    // 保存原始的属性值
    let value: string;
    
    // 属性描述符
    const descriptor: PropertyDescriptor = {
      get() {
        return value;
      },
      set(newValue: string) {
        if (newValue.length < length) {
          throw new Error(`${propertyKey} 长度必须大于等于 ${length}`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    };
    
    Object.defineProperty(target, propertyKey, descriptor);
  };
}

class User {
  @MinLength(3)
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

try {
  const user = new User("李");  // 错误: name 长度必须大于等于 3
} catch (e) {
  console.error(e.message);
}

const validUser = new User("张三");  // 正常
```

### 参数装饰器

参数装饰器应用在方法参数声明之前。

```typescript
/**
 * 参数验证装饰器
 */
function Required(target: Object, propertyKey: string, parameterIndex: number) {
  // 获取方法的参数元数据
  const existingRequiredParameters: number[] = Reflect.getOwnMetadata(
    "required",
    target,
    propertyKey
  ) || [];
  
  // 添加当前参数索引到必需参数列表
  existingRequiredParameters.push(parameterIndex);
  
  // 保存参数元数据
  Reflect.defineMetadata(
    "required",
    existingRequiredParameters,
    target,
    propertyKey
  );
}

function Validate(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const requiredParams: number[] = Reflect.getOwnMetadata(
      "required",
      target,
      propertyName
    ) || [];
    
    // 验证必需参数不为 null 或 undefined
    for (const index of requiredParams) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(`参数 ${index} 是必需的`);
      }
    }
    
    return method.apply(this, args);
  };
  
  return descriptor;
}

class UserService {
  @Validate
  createUser(@Required username: string, email: string, age: number) {
    // 创建用户逻辑
    return { username, email, age };
  }
}

const userService = new UserService();
try {
  userService.createUser(null!, "test@example.com", 25);
} catch (e) {
  console.error(e.message);  // 参数 0 是必需的
}

userService.createUser("张三", "zhangsan@example.com", 30);  // 正常
```

## 装饰器应用场景

### 依赖注入

装饰器常用于实现依赖注入系统。

```typescript
// 简化版依赖注入实现
const Injectable = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata('injectable', true, target);
  };
};

class Container {
  private static instances: Map<any, any> = new Map();

  static resolve<T>(target: new (...args: any[]) => T): T {
    if (Container.instances.has(target)) {
      return Container.instances.get(target);
    }

    // 检查类是否标记为可注入
    const injectable = Reflect.getMetadata('injectable', target);
    if (!injectable) {
      throw new Error(`类 ${target.name} 未标记为可注入`);
    }

    // 创建实例并存储
    const instance = new target();
    Container.instances.set(target, instance);
    return instance;
  }
}

@Injectable()
class Logger {
  log(message: string) {
    console.log(`[日志] ${message}`);
  }
}

@Injectable()
class UserRepository {
  findAll() {
    return [{ id: 1, name: '张三' }, { id: 2, name: '李四' }];
  }
}

@Injectable()
class UserService {
  private logger = Container.resolve(Logger);
  private repository = Container.resolve(UserRepository);

  getUsers() {
    this.logger.log('获取用户列表');
    return this.repository.findAll();
  }
}

const userService = Container.resolve(UserService);
console.log(userService.getUsers());
```

### 数据验证

装饰器可用于属性和方法参数的数据验证。

```typescript
// 装饰器元数据键
const VALIDATION_KEY = 'validation';

// 验证装饰器工厂
function Validate(validationFn: (value: any) => boolean, errorMsg: string) {
  return function(target: any, propertyKey: string) {
    // 获取现有验证规则
    const validations = Reflect.getMetadata(VALIDATION_KEY, target) || {};
    
    // 添加新的验证规则
    validations[propertyKey] = { validationFn, errorMsg };
    
    // 更新元数据
    Reflect.defineMetadata(VALIDATION_KEY, validations, target);
    
    // 获取属性描述符
    let value: any;
    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue: any) {
        const validations = Reflect.getMetadata(VALIDATION_KEY, target);
        const validation = validations[propertyKey];
        
        if (validation && !validation.validationFn(newValue)) {
          throw new Error(validation.errorMsg);
        }
        
        value = newValue;
      }
    });
  };
}

// 验证规则
const IsEmail = () => Validate(
  (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  '无效的邮箱地址'
);

const MinLength = (min: number) => Validate(
  (value: string) => value.length >= min,
  `长度必须大于等于 ${min}`
);

// 使用验证装饰器
class User {
  @MinLength(3)
  name: string;
  
  @IsEmail()
  email: string;
  
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}

try {
  const user = new User('张', 'invalid-email');
} catch (e) {
  console.error(e.message);
}
```

### 面向切面编程 (AOP)

装饰器可用于实现面向切面编程，如日志记录、性能测量和事务管理。

```typescript
/**
 * 日志切面装饰器
 */
function Log(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`[${new Date().toISOString()}] 调用方法: ${methodName}`);
    console.log(`参数:`, args);
    
    try {
      const result = originalMethod.apply(this, args);
      console.log(`方法 ${methodName} 返回:`, result);
      return result;
    } catch (error) {
      console.error(`方法 ${methodName} 抛出异常:`, error);
      throw error;
    }
  };
  
  return descriptor;
}

/**
 * 错误处理装饰器
 */
function HandleError(errorHandler?: (error: Error) => void) {
  return function(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        if (errorHandler) {
          errorHandler(error);
        } else {
          console.error(`[错误处理] ${methodName}:`, error);
        }
        // 根据需要返回默认值或重新抛出异常
        return null;
      }
    };
    
    return descriptor;
  };
}

class OrderService {
  @Log
  @HandleError()
  calculateTotal(items: {price: number; quantity: number}[]) {
    if (!items || items.length === 0) {
      throw new Error('订单为空');
    }
    
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}

const orderService = new OrderService();
orderService.calculateTotal([
  { price: 100, quantity: 2 },
  { price: 50, quantity: 1 }
]);
orderService.calculateTotal([]);  // 被错误处理装饰器捕获
```

### ORM 实体映射

装饰器常用于ORM框架中定义实体和关系。

```typescript
// 实体装饰器
function Entity(tableName: string) {
  return function(constructor: Function) {
    Reflect.defineMetadata('tableName', tableName, constructor);
  };
}

// 字段装饰器
function Column(options: { type: string; nullable?: boolean; default?: any }) {
  return function(target: any, propertyKey: string) {
    const columns = Reflect.getMetadata('columns', target.constructor) || {};
    columns[propertyKey] = options;
    Reflect.defineMetadata('columns', columns, target.constructor);
  };
}

// 主键装饰器
function PrimaryColumn() {
  return function(target: any, propertyKey: string) {
    const primaryKey = propertyKey;
    Reflect.defineMetadata('primaryKey', primaryKey, target.constructor);
    
    // 同时将其标记为列
    const columns = Reflect.getMetadata('columns', target.constructor) || {};
    columns[propertyKey] = { type: 'number', nullable: false };
    Reflect.defineMetadata('columns', columns, target.constructor);
  };
}

@Entity('users')
class User {
  @PrimaryColumn()
  id: number;
  
  @Column({ type: 'varchar', nullable: false })
  username: string;
  
  @Column({ type: 'varchar', nullable: false })
  email: string;
  
  @Column({ type: 'int', default: 0 })
  age: number;
  
  constructor(id: number, username: string, email: string, age?: number) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.age = age || 0;
  }
}

// 简单的ORM实现
class Repository<T> {
  private entityClass: new (...args: any[]) => T;
  
  constructor(entityClass: new (...args: any[]) => T) {
    this.entityClass = entityClass;
  }
  
  getTableName(): string {
    return Reflect.getMetadata('tableName', this.entityClass);
  }
  
  getColumns(): Record<string, any> {
    return Reflect.getMetadata('columns', this.entityClass) || {};
  }
  
  getPrimaryKey(): string {
    return Reflect.getMetadata('primaryKey', this.entityClass);
  }
  
  generateSQL(entity: T): string {
    const tableName = this.getTableName();
    const columns = this.getColumns();
    const columnNames = Object.keys(columns).join(', ');
    const values = Object.keys(columns).map(key => `'${(entity as any)[key]}'`).join(', ');
    
    return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values})`;
  }
}

const userRepo = new Repository(User);
const user = new User(1, '张三', 'zhangsan@example.com', 30);
console.log(userRepo.generateSQL(user));
// 输出: INSERT INTO users (id, username, email, age) VALUES ('1', '张三', 'zhangsan@example.com', '30')
```

## 实战示例：API 路由装饰器

下面是一个使用装饰器实现的简化版 Express API 路由系统：

```typescript
import * as express from 'express';

// 路由元数据类型
type RouteDefinition = {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  methodName: string;
};

// HTTP 方法装饰器工厂
function createMethodDecorator(method: 'get' | 'post' | 'put' | 'delete') {
  return function(path: string): MethodDecorator {
    return function(
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      // 确保目标类有路由元数据存储
      if (!Reflect.hasMetadata('routes', target.constructor)) {
        Reflect.defineMetadata('routes', [], target.constructor);
      }
      
      // 获取已定义的路由
      const routes = Reflect.getMetadata('routes', target.constructor) as RouteDefinition[];
      
      // 添加新路由
      routes.push({
        method,
        path,
        methodName: propertyKey as string
      });
      
      // 更新元数据
      Reflect.defineMetadata('routes', routes, target.constructor);
      
      return descriptor;
    };
  };
}

// HTTP 方法装饰器
const Get = createMethodDecorator('get');
const Post = createMethodDecorator('post');
const Put = createMethodDecorator('put');
const Delete = createMethodDecorator('delete');

// 控制器装饰器
function Controller(basePath: string): ClassDecorator {
  return function(target: any) {
    Reflect.defineMetadata('basePath', basePath, target);
    
    // 确保存在路由元数据
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
}

// 注册控制器到 Express 应用
function registerController(app: express.Application, controller: any) {
  // 创建控制器实例
  const instance = new controller();
  
  // 获取基础路径和路由
  const basePath = Reflect.getMetadata('basePath', controller);
  const routes: RouteDefinition[] = Reflect.getMetadata('routes', controller);
  
  // 注册每个路由
  routes.forEach((route) => {
    // 构建完整路径
    const fullPath = basePath + route.path;
    
    // 获取控制器方法
    const handler = instance[route.methodName].bind(instance);
    
    // 注册到 Express
    (app as any)[route.method](fullPath, handler);
    
    console.log(`已注册路由: ${route.method.toUpperCase()} ${fullPath}`);
  });
}

// 请求参数装饰器
function Body(): ParameterDecorator {
  return function(target: any, propertyKey: string | symbol, parameterIndex: number) {
    // 存储参数信息
    const paramMetadata = Reflect.getMetadata('params', target, propertyKey) || {};
    paramMetadata[parameterIndex] = 'body';
    Reflect.defineMetadata('params', paramMetadata, target, propertyKey);
  };
}

// 使用示例
@Controller('/api/users')
class UserController {
  @Get('/')
  getAllUsers(req: express.Request, res: express.Response) {
    res.json([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]);
  }
  
  @Get('/:id')
  getUserById(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    res.json({ id: userId, name: `用户 ${userId}` });
  }
  
  @Post('/')
  createUser(req: express.Request, res: express.Response) {
    const user = req.body;
    // 创建用户逻辑
    res.status(201).json({ ...user, id: Math.floor(Math.random() * 1000) });
  }
  
  @Put('/:id')
  updateUser(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    const userData = req.body;
    res.json({ ...userData, id: userId });
  }
  
  @Delete('/:id')
  deleteUser(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    res.json({ success: true, message: `已删除用户 ${userId}` });
  }
}

// 创建 Express 应用
const app = express();
app.use(express.json());

// 注册控制器
registerController(app, UserController);

// 启动服务器
app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

## TypeScript 装饰器最佳实践

1. **避免过度使用装饰器**：装饰器功能强大，但过度使用会导致代码难以理解和维护。

2. **保持装饰器简单**：每个装饰器应该只有一个明确的职责。

3. **添加适当的文档**：由于装饰器可能改变类或成员的行为，良好的文档对于理解代码至关重要。

4. **考虑性能影响**：某些装饰器实现可能会在运行时增加额外开销，尤其是使用反射时。

5. **测试装饰器**：编写单元测试确保装饰器按预期工作，并在不同情况下有适当的行为。

6. **处理元数据**：在使用与元数据相关的装饰器时，确保正确设置和使用 `emitDecoratorMetadata` 编译选项。

7. **不要修改内置对象**：避免使用装饰器修改 JavaScript 内置对象的行为。

## 注意事项

1. 装饰器是 TypeScript 的实验性功能，API 可能在未来版本中发生变化。

2. 装饰器求值顺序：
   - 参数装饰器，然后是方法装饰器，然后是访问器或属性装饰器，最后是类装饰器
   - 同类型的装饰器从下到上、从右到左评估

3. 如果同时使用 `reflect-metadata` 库，需要确保正确导入：
   ```typescript
   import 'reflect-metadata';
   ```

4. 装饰器只在编译时执行一次，而不是每次创建实例时都执行。

## 总结

TypeScript 装饰器是一种强大的元编程特性，可以用于代码重用、横切关注点分离和声明式编程。它们在依赖注入、ORM、验证和 API 路由等方面有广泛的应用。虽然仍处于实验阶段，但已被广泛采用并成为许多框架和库的核心特性。

随着 ECMAScript 装饰器提案的进展，TypeScript 装饰器将继续演化，并最终成为 JavaScript 标准的一部分。在此之前，请注意 API 可能会有所变化，但掌握装饰器模式和用例将为 TypeScript 开发提供强大的工具。 