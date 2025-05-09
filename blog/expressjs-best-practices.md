---
layout: doc
title: Express.js最佳实践指南
description: 全面解析Express.js开发的架构设计、路由管理、中间件、性能与安全优化等最佳实践，助你构建高质量Node.js Web应用。
---

# Express.js最佳实践指南

Express.js是Node.js最流行的Web框架之一。本文将系统讲解Express.js开发中的架构设计、路由管理、中间件、性能与安全优化等最佳实践。

## 目录

- [项目结构与架构设计](#项目结构与架构设计)
- [路由与控制器分离](#路由与控制器分离)
- [中间件的合理使用](#中间件的合理使用)
- [性能优化技巧](#性能优化技巧)
- [安全加固实践](#安全加固实践)
- [实战建议与最佳实践](#实战建议与最佳实践)

## 项目结构与架构设计

### 推荐的项目目录结构

采用模块化、分层的项目结构，便于维护和扩展：

```
project-root/
├── config/                 # 配置文件
│   ├── index.js            # 主配置
│   ├── database.js         # 数据库配置
│   └── swagger.js          # API文档配置
├── controllers/            # 控制器
│   ├── auth.js             # 认证控制器
│   └── user.js             # 用户控制器
├── middlewares/            # 中间件
│   ├── auth.js             # 认证中间件
│   ├── errorHandler.js     # 错误处理中间件
│   └── validator.js        # 验证中间件
├── models/                 # 数据模型
│   └── user.js             # 用户模型
├── routes/                 # 路由定义
│   ├── index.js            # 路由汇总
│   └── user.js             # 用户路由
├── services/               # 业务服务
│   ├── auth.js             # 认证服务
│   └── user.js             # 用户服务
├── utils/                  # 工具函数
│   ├── logger.js           # 日志工具
│   └── helpers.js          # 辅助函数
├── tests/                  # 测试文件
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
├── public/                 # 静态资源
│   ├── css/                # 样式文件
│   └── js/                 # 客户端脚本
├── views/                  # 视图模板(如果有)
├── .env.example            # 环境变量示例
├── .eslintrc.js            # ESLint配置
├── .gitignore              # Git忽略配置
├── jest.config.js          # Jest测试配置
├── package.json            # 项目依赖
├── ecosystem.config.js     # PM2配置
└── server.js               # 应用入口
```

### 分层架构实现

遵循关注点分离原则，实现清晰的分层架构：

```js
/**
 * 用户相关模块的分层架构示例
 */

// 1. 路由层 - routes/user.js
// 负责URL映射和请求接收
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');

router.get('/', auth.protect, userController.getAllUsers);
router.get('/:id', auth.protect, userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', auth.protect, userController.updateUser);
router.delete('/:id', auth.protect, auth.restrictTo('admin'), userController.deleteUser);

module.exports = router;

// 2. 控制器层 - controllers/user.js
// 负责处理HTTP请求和响应
const userService = require('../services/user');
const { catchAsync } = require('../utils/errors');

exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await userService.findAll(page, limit);
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await userService.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: '未找到用户'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
});

// 3. 服务层 - services/user.js
// 负责业务逻辑处理
const User = require('../models/user');

exports.findAll = async (page, limit) => {
  const skip = (page - 1) * limit;
  return await User.find()
    .select('-password')
    .skip(skip)
    .limit(Number(limit));
};

exports.findById = async (id) => {
  return await User.findById(id).select('-password');
};

exports.create = async (userData) => {
  return await User.create(userData);
};

// 4. 模型层 - models/user.js
// 负责数据结构和数据库交互
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供用户名']
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 实例方法：检查密码
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
```

### 模块化职责分明

每个模块拥有单一职责，便于测试和维护：

```js
/**
 * 认证中间件 - middlewares/auth.js
 * 职责：处理用户认证和授权
 */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');
const { AppError } = require('../utils/errors');
const config = require('../config');

/**
 * 保护路由中间件
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) 获取token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('请先登录以获取访问权限', 401));
    }
    
    // 2) 验证token
    const decoded = await promisify(jwt.verify)(token, config.app.jwtSecret);
    
    // 3) 检查用户是否仍然存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('此token关联的用户不存在', 401));
    }
    
    // 4) 检查用户是否在token签发后更改了密码
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('用户近期修改了密码，请重新登录', 401));
    }
    
    // 授予访问权限
    req.user = user;
    next();
  } catch (err) {
    next(new AppError('认证失败', 401));
  }
};

/**
 * 角色限制中间件
 * @param {...String} roles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('权限不足，无法执行此操作', 403));
    }
    next();
  };
};
```

### 适合大型应用的领域驱动设计

针对复杂业务场景，可采用领域驱动设计(DDD)组织代码：

```
project-root/
├── src/
│   ├── domain/              # 领域层
│   │   ├── user/            # 用户领域
│   │   │   ├── entities/    # 实体
│   │   │   ├── repositories/# 仓储接口
│   │   │   ├── services/    # 领域服务
│   │   │   └── events/      # 领域事件
│   │   └── order/           # 订单领域
│   ├── application/         # 应用层
│   │   ├── commands/        # 命令处理器 
│   │   ├── queries/         # 查询处理器
│   │   └── services/        # 应用服务
│   ├── infrastructure/      # 基础设施层
│   │   ├── database/        # 数据库实现
│   │   ├── messaging/       # 消息实现
│   │   └── external/        # 外部服务
│   └── interfaces/          # 接口层
│       ├── api/             # API接口
│       ├── workers/         # 后台工作进程
│       └── subscribers/     # 事件订阅
```

DDD风格的代码示例：

```js
/**
 * 用户实体 - src/domain/user/entities/User.js
 */
class User {
  constructor(id, name, email, passwordHash, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // 领域行为
  changeEmail(newEmail) {
    // 领域验证逻辑
    if (!this.isValidEmail(newEmail)) {
      throw new Error('无效的邮箱格式');
    }
    
    if (this.email === newEmail) {
      return false;
    }
    
    this.email = newEmail;
    this.updatedAt = new Date();
    return true;
  }
  
  changePassword(newPasswordHash) {
    if (!newPasswordHash) {
      throw new Error('密码不能为空');
    }
    
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
    return true;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * 用户仓储接口 - src/domain/user/repositories/UserRepository.js
 */
class UserRepository {
  async findById(id) { 
    throw new Error('方法未实现');
  }
  
  async findByEmail(email) {
    throw new Error('方法未实现');
  }
  
  async save(user) {
    throw new Error('方法未实现');
  }
  
  async delete(id) {
    throw new Error('方法未实现');
  }
}

/**
 * 用户服务 - src/domain/user/services/UserService.js
 */
class UserService {
  constructor(userRepository, eventBus) {
    this.userRepository = userRepository;
    this.eventBus = eventBus;
  }
  
  async registerUser(name, email, password) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }
    
    const passwordHash = await this.hashPassword(password);
    const userId = this.generateId();
    
    const user = new User(userId, name, email, passwordHash, 'user');
    await this.userRepository.save(user);
    
    // 发布领域事件
    this.eventBus.publish(new UserRegisteredEvent(user.id, user.email));
    
    return user;
  }
  
  async changeUserEmail(userId, newEmail) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const emailChanged = user.changeEmail(newEmail);
    if (emailChanged) {
      await this.userRepository.save(user);
      this.eventBus.publish(new UserEmailChangedEvent(user.id, newEmail));
    }
    
    return user;
  }
  
  // 实用方法
  async hashPassword(password) {
    // 实现密码哈希逻辑
  }
  
  generateId() {
    // 生成唯一ID
  }
}

/**
 * 仓储MongoDB实现 - src/infrastructure/database/MongoUserRepository.js
 */
const { ObjectId } = require('mongodb');
const User = require('../../domain/user/entities/User');

class MongoUserRepository extends UserRepository {
  constructor(database) {
    super();
    this.collection = database.collection('users');
  }
  
  async findById(id) {
    const userData = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!userData) return null;
    
    return this.mapToEntity(userData);
  }
  
  async findByEmail(email) {
    const userData = await this.collection.findOne({ email });
    if (!userData) return null;
    
    return this.mapToEntity(userData);
  }
  
  async save(user) {
    const userData = {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    if (user.id) {
      // 更新现有用户
      await this.collection.updateOne(
        { _id: new ObjectId(user.id) },
        { $set: userData }
      );
    } else {
      // 创建新用户
      const result = await this.collection.insertOne(userData);
      user.id = result.insertedId.toString();
    }
    
    return user;
  }
  
  async delete(id) {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
  
  mapToEntity(userData) {
    return new User(
      userData._id.toString(),
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.role
    );
  }
}
```

### 依赖注入与模块解耦

使用依赖注入模式实现模块解耦:

```js
/**
 * 依赖注入容器 - utils/container.js
 */
class Container {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }
  
  // 注册单例服务
  register(name, instance) {
    this.services.set(name, instance);
  }
  
  // 注册工厂函数
  factory(name, factory) {
    this.factories.set(name, factory);
  }
  
  // 获取服务实例
  get(name) {
    // 如果是已经注册的单例，直接返回
    if (this.services.has(name)) {
      return this.services.get(name);
    }
    
    // 如果是工厂，调用工厂函数创建实例
    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      const instance = factory(this);
      this.services.set(name, instance); // 缓存实例
      return instance;
    }
    
    throw new Error(`服务 "${name}" 未注册`);
  }
}

// 创建并导出容器单例
const container = new Container();
module.exports = container;

/**
 * 应用启动时配置容器 - server.js
 */
const container = require('./utils/container');
const UserController = require('./controllers/user');
const UserService = require('./services/user');
const User = require('./models/user');
const config = require('./config');
const mongoose = require('mongoose');

// 配置数据库
mongoose.connect(config.database.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 注册服务
container.register('config', config);
container.register('db', mongoose.connection);

// 使用工厂函数注册需要依赖的服务
container.factory('userService', (container) => {
  return new UserService(User);
});

container.factory('userController', (container) => {
  const userService = container.get('userService');
  return new UserController(userService);
});

/**
 * 路由配置 - routes/user.js
 */
const express = require('express');
const router = express.Router();
const container = require('../utils/container');

// 路由定义
router.get('/', async (req, res, next) => {
  try {
    const userController = container.get('userController');
    await userController.getAllUsers(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

## 路由与控制器分离

### 路由定义与组织

将路由配置与业务逻辑分离，提高代码的可维护性：

```js
/**
 * 路由入口 - routes/index.js
 * @module routes
 */
const express = require('express');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const productRoutes = require('./product');
const healthRoutes = require('./health');

const router = express.Router();

/**
 * 规范化API路由映射
 * @param {Express.Router} baseRouter - 基础路由器实例
 */
function setupRoutes(baseRouter) {
  // API版本前缀
  const apiPrefix = '/api/v1';
  
  // 注册各模块路由
  baseRouter.use(`${apiPrefix}/users`, userRoutes);
  baseRouter.use(`${apiPrefix}/auth`, authRoutes);
  baseRouter.use(`${apiPrefix}/products`, productRoutes);
  
  // 健康检查路由（不带API前缀）
  baseRouter.use('/health', healthRoutes);
  
  // API文档路由
  if (process.env.NODE_ENV !== 'production') {
    baseRouter.get(`${apiPrefix}`, (req, res) => {
      res.json({
        message: 'API服务正在运行',
        documentation: '/api-docs',
        version: '1.0.0'
      });
    });
  }
  
  // 处理404路由
  baseRouter.all(`${apiPrefix}/*`, (req, res) => {
    res.status(404).json({
      status: 'fail',
      message: `找不到路径: ${req.originalUrl}`
    });
  });
}

// 应用路由配置
setupRoutes(router);

module.exports = router;
```

### 路由模块化

每个资源独立路由文件，便于管理和扩展：

```js
/**
 * 用户路由 - routes/user.js
 * @module routes/user
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');
const { validateUser } = require('../middlewares/validators');

// 资源集合路由
router.route('/')
  .get(
    authMiddleware.protect, 
    userController.getAllUsers
  )
  .post(
    validateUser, 
    userController.createUser
  );

// 个体资源路由
router.route('/:id')
  .get(
    authMiddleware.protect, 
    userController.getUser
  )
  .put(
    authMiddleware.protect, 
    authMiddleware.restrictTo('admin', 'self'), 
    validateUser, 
    userController.updateUser
  )
  .delete(
    authMiddleware.protect, 
    authMiddleware.restrictTo('admin'), 
    userController.deleteUser
  );

// 特殊操作路由
router.get(
  '/:id/profile',
  authMiddleware.protect,
  userController.getUserProfile
);

router.put(
  '/:id/change-password',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin', 'self'),
  validateUser,
  userController.changePassword
);

module.exports = router;
```

### 控制器实现

控制器专注于处理HTTP请求和响应，将业务逻辑委托给服务层：

```js
/**
 * 用户控制器 - controllers/user.js
 * @module controllers/user
 */
const userService = require('../services/user');
const { catchAsync } = require('../utils/errors');
const { AppError } = require('../utils/errors');

/**
 * 获取用户列表
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  // 提取查询参数
  const { 
    page = 1, 
    limit = 10, 
    sort = '-createdAt',
    fields = 'name,email,role',
    ...filters
  } = req.query;
  
  // 调用服务层处理业务逻辑
  const result = await userService.findAll({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    fields,
    filters
  });
  
  // 构建响应
  res.status(200).json({
    status: 'success',
    results: result.data.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.ceil(result.total / result.limit)
    },
    data: result.data
  });
});

/**
 * 获取单个用户
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await userService.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('未找到此用户', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
});

/**
 * 创建用户
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 */
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await userService.create(req.body);
  
  // 删除敏感字段
  const userResponse = { ...newUser.toObject() };
  delete userResponse.password;
  
  res.status(201).json({
    status: 'success',
    data: userResponse
  });
});

/**
 * 更新用户
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // 安全检查：普通用户只能更新自己
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('您没有权限更新其他用户', 403));
  }
  
  // 不允许通过此接口更新密码
  if (req.body.password) {
    delete req.body.password;
  }
  
  const updatedUser = await userService.update(req.params.id, req.body);
  
  if (!updatedUser) {
    return next(new AppError('未找到此用户', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});

/**
 * 删除用户
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const result = await userService.delete(req.params.id);
  
  if (!result) {
    return next(new AppError('未找到此用户', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * 更改密码
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  // 安全检查：普通用户只能更改自己的密码
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new AppError('您没有权限更改其他用户的密码', 403));
  }
  
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  // 验证请求数据
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('请提供当前密码、新密码和确认密码', 400));
  }
  
  if (newPassword !== confirmPassword) {
    return next(new AppError('新密码和确认密码不匹配', 400));
  }
  
  // 调用服务层更改密码
  const result = await userService.changePassword(
    req.params.id,
    currentPassword,
    newPassword
  );
  
  if (!result.success) {
    return next(new AppError(result.message, 400));
  }
  
  res.status(200).json({
    status: 'success',
    message: '密码已成功更改'
  });
});
```

### 服务层实现

服务层封装业务逻辑，被控制器调用：

```js
/**
 * 用户服务 - services/user.js
 * @module services/user
 */
const User = require('../models/user');
const bcrypt = require('bcryptjs');

/**
 * 查找所有用户
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 用户列表及分页信息
 */
exports.findAll = async ({ page, limit, sort, fields, filters }) => {
  // 构建查询
  let query = User.find();
  
  // 应用过滤条件
  if (filters) {
    const allowedFilters = ['name', 'email', 'role'];
    const sanitizedFilters = {};
    
    Object.keys(filters).forEach(key => {
      if (allowedFilters.includes(key)) {
        sanitizedFilters[key] = filters[key];
      }
    });
    
    query = query.find(sanitizedFilters);
  }
  
  // 应用字段选择
  if (fields) {
    const fieldList = fields.split(',').join(' ');
    query = query.select(fieldList);
  }
  
  // 应用排序
  if (sort) {
    const sortFields = sort.split(',').join(' ');
    query = query.sort(sortFields);
  } else {
    query = query.sort('-createdAt');
  }
  
  // 应用分页
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);
  
  // 执行查询
  const [users, total] = await Promise.all([
    query.exec(),
    User.countDocuments()
  ]);
  
  return {
    data: users,
    page,
    limit,
    total
  };
};

/**
 * 根据ID查找用户
 * @param {string} id - 用户ID
 * @returns {Promise<Object>} 用户对象或null
 */
exports.findById = async (id) => {
  return await User.findById(id).select('-password');
};

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<Object>} 新创建的用户
 */
exports.create = async (userData) => {
  // 检查邮箱是否已存在
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('该邮箱已被注册');
  }
  
  // 创建新用户
  return await User.create(userData);
};

/**
 * 更新用户信息
 * @param {string} id - 用户ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise<Object>} 更新后的用户
 */
exports.update = async (id, updateData) => {
  // 禁止更新敏感字段
  const protectedFields = ['password', 'passwordChangedAt', 'role'];
  protectedFields.forEach(field => {
    if (updateData[field]) delete updateData[field];
  });
  
  // 更新用户
  return await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
};

/**
 * 删除用户
 * @param {string} id - 用户ID
 * @returns {Promise<boolean>} 操作结果
 */
exports.delete = async (id) => {
  const result = await User.findByIdAndDelete(id);
  return !!result;
};

/**
 * 修改用户密码
 * @param {string} id - 用户ID
 * @param {string} currentPassword - 当前密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<Object>} 操作结果
 */
exports.changePassword = async (id, currentPassword, newPassword) => {
  // 查找用户（带密码字段）
  const user = await User.findById(id).select('+password');
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }
  
  // 验证当前密码
  const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrectPassword) {
    return { success: false, message: '当前密码不正确' };
  }
  
  // 设置新密码
  user.password = newPassword;
  user.passwordChangedAt = Date.now() - 1000; // 减1秒以确保令牌处理正确
  await user.save();
  
  return { success: true };
};
```

### 请求验证中间件

使用专门的验证中间件确保请求数据的有效性：

```js
/**
 * 用户验证中间件 - middlewares/validators.js
 * @module middlewares/validators
 */
const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

/**
 * 验证结果处理中间件
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  next();
};

/**
 * 用户数据验证规则
 */
const userValidationRules = () => {
  return [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('用户名长度必须在2-50之间')
      .trim(),
    
    body('email')
      .optional()
      .isEmail().withMessage('请提供有效的电子邮箱')
      .normalizeEmail(),
    
    body('password')
      .optional()
      .isLength({ min: 8 }).withMessage('密码长度至少为8个字符')
      .matches(/\d/).withMessage('密码必须包含数字')
      .matches(/[A-Z]/).withMessage('密码必须包含大写字母')
      .matches(/[a-z]/).withMessage('密码必须包含小写字母')
      .matches(/[^A-Za-z0-9]/).withMessage('密码必须包含特殊字符'),
    
    body('role')
      .optional()
      .isIn(['user', 'admin']).withMessage('角色必须是user或admin')
  ];
};

/**
 * 密码更改验证规则
 */
const passwordChangeRules = () => {
  return [
    body('currentPassword')
      .notEmpty().withMessage('当前密码不能为空'),
    
    body('newPassword')
      .notEmpty().withMessage('新密码不能为空')
      .isLength({ min: 8 }).withMessage('新密码长度至少为8个字符')
      .matches(/\d/).withMessage('新密码必须包含数字')
      .matches(/[A-Z]/).withMessage('新密码必须包含大写字母')
      .matches(/[a-z]/).withMessage('新密码必须包含小写字母')
      .matches(/[^A-Za-z0-9]/).withMessage('新密码必须包含特殊字符'),
    
    body('confirmPassword')
      .notEmpty().withMessage('确认密码不能为空')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('确认密码必须与新密码匹配');
        }
        return true;
      })
  ];
};

/**
 * 用户验证中间件
 */
exports.validateUser = [
  ...userValidationRules(),
  validateRequest
];

/**
 * 密码更改验证中间件
 */
exports.validatePasswordChange = [
  ...passwordChangeRules(),
  validateRequest
];
```

## 中间件的合理使用

### 中间件的分类与职责

Express中间件按职责可分为几类，各司其职：

1. **应用级中间件** - 绑定到应用实例，处理所有请求
2. **路由级中间件** - 绑定到特定路由，处理特定请求
3. **错误处理中间件** - 专门处理错误情况
4. **内置中间件** - Express自带的中间件，如`express.json()`
5. **第三方中间件** - 如`helmet`, `morgan`等

### 常用中间件示例

实用中间件的实现示例：

#### 请求日志中间件

```js
/**
 * 请求日志中间件
 * @module middlewares/logger
 */
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

/**
 * 配置请求日志
 * @param {Express} app - Express应用实例
 */
const setupLogger = (app) => {
  // 创建日志目录
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // 开发环境 - 控制台彩色日志
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  // 生产环境 - 文件日志
  if (process.env.NODE_ENV === 'production') {
    // 创建访问日志写入流
    const accessLogStream = fs.createWriteStream(
      path.join(logDir, 'access.log'),
      { flags: 'a' }
    );
    
    // 自定义日志格式
    const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
    
    // 应用日志中间件
    app.use(morgan(logFormat, { stream: accessLogStream }));
  }
};

module.exports = { setupLogger };
```

#### 认证中间件

```js
/**
 * 认证中间件
 * @module middlewares/auth
 */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');
const { AppError } = require('../utils/errors');
const config = require('../config');

/**
 * 提取认证token
 * @param {Request} req - Express请求对象
 * @returns {string|null} 认证token或null
 */
const extractToken = (req) => {
  // 从认证头提取
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  
  // 从cookie提取
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }
  
  return null;
};

/**
 * 保护路由中间件 - 要求用户登录
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) 获取token
    const token = extractToken(req);
    
    if (!token) {
      return next(new AppError('请先登录以获取访问权限', 401));
    }
    
    // 2) 验证token
    const decoded = await promisify(jwt.verify)(token, config.app.jwtSecret);
    
    // 3) 检查用户是否仍然存在
    const user = await User.findById(decoded.id).select('+role');
    if (!user) {
      return next(new AppError('此token关联的用户不存在', 401));
    }
    
    // 4) 检查用户是否在token签发后更改了密码
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('用户近期修改了密码，请重新登录', 401));
    }
    
    // 授予访问权限
    req.user = user;
    next();
  } catch (err) {
    next(new AppError('认证失败，请重新登录', 401));
  }
};

/**
 * 角色限制中间件 - 限制特定角色访问
 * @param {...String} roles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // protect中间件应该在此之前运行，确保req.user存在
    if (!req.user) {
      return next(new AppError('用户未认证，无法检查权限', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('您没有权限执行此操作', 403));
    }
    
    next();
  };
};

/**
 * "本人或管理员"中间件 - 限制只能操作自己的资源，管理员除外
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.restrictToSelfOrAdmin = (req, res, next) => {
  // protect中间件应该在此之前运行，确保req.user存在
  if (!req.user) {
    return next(new AppError('用户未认证，无法检查权限', 401));
  }
  
  // 管理员可以访问任何用户资源
  if (req.user.role === 'admin') {
    return next();
  }
  
  // 非管理员只能访问自己的资源
  if (req.params.id && req.params.id !== req.user.id.toString()) {
    return next(new AppError('您只能操作自己的资源', 403));
  }
  
  next();
};

/**
 * 可选认证中间件 - 如果有token则认证，没有则继续
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }
    
    const decoded = await promisify(jwt.verify)(token, config.app.jwtSecret);
    const user = await User.findById(decoded.id).select('+role');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (err) {
    // 忽略错误，继续处理
    next();
  }
};
```

#### API速率限制中间件

```js
/**
 * 速率限制中间件
 * @module middlewares/rateLimiter
 */
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const config = require('../config');

// 创建Redis客户端
let redisClient;
if (config.redis && config.redis.host) {
  redisClient = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  });
  
  redisClient.on('error', err => {
    console.error('Redis连接错误:', err);
    console.warn('速率限制将使用内存存储');
  });
}

/**
 * 创建速率限制器
 * @param {Object} options - 限制器选项
 * @returns {Function} 速率限制中间件
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15分钟窗口
    max: 100, // 限制每IP 100个请求
    standardHeaders: true, // 返回标准头
    legacyHeaders: false, // 禁用旧版头
    message: '请求过于频繁，请稍后再试',
    skipSuccessfulRequests: false, // 不跳过成功请求
    // 使用Redis存储，如果可用
    ...(redisClient && {
      store: new RedisStore({
        client: redisClient,
        prefix: options.prefix || 'rate_limit:'
      })
    })
  };
  
  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// 预定义的速率限制器
const limiters = {
  // 通用API限制
  api: createRateLimiter({
    prefix: 'rate_limit_api:',
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 200 // 每IP 200请求
  }),
  
  // 认证接口限制（更严格）
  auth: createRateLimiter({
    prefix: 'rate_limit_auth:',
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10, // 每IP 10请求
    message: '登录尝试次数过多，请稍后再试'
  }),
  
  // 敏感操作限制
  sensitive: createRateLimiter({
    prefix: 'rate_limit_sensitive:',
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5 // 每IP 5请求
  })
};

module.exports = limiters;
```

### 组织和加载中间件

使用函数组织和加载中间件，保持代码整洁：

```js
/**
 * 中间件配置 - middlewares/index.js
 * @module middlewares
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { setupLogger } = require('./logger');
const limiters = require('./rateLimiter');
const { errorHandler } = require('./errorHandler');

/**
 * 设置全局中间件
 * @param {Express} app - Express应用实例
 */
const setupMiddlewares = (app) => {
  // 基础安全
  app.use(helmet());
  
  // CORS配置
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // 请求体解析
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Cookie解析
  app.use(cookieParser(process.env.COOKIE_SECRET));
  
  // 压缩响应
  app.use(compression());
  
  // 日志
  setupLogger(app);
  
  // 全局速率限制
  if (process.env.NODE_ENV === 'production') {
    app.use('/api', limiters.api);
    app.use('/api/auth', limiters.auth);
  }
  
  // 提供静态文件
  app.use(express.static('public'));
  
  // 记录请求时间中间件
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
};

/**
 * 设置错误处理中间件（应在路由之后调用）
 * @param {Express} app - Express应用实例
 */
const setupErrorHandlers = (app) => {
  // 捕获404
  app.use((req, res, next) => {
    next(new AppError(`找不到路径: ${req.originalUrl}`, 404));
  });
  
  // 全局错误处理
  app.use(errorHandler);
};

module.exports = {
  setupMiddlewares,
  setupErrorHandlers
};
```

在应用入口文件中使用：

```js
/**
 * 应用入口 - app.js
 */
const express = require('express');
const { setupMiddlewares, setupErrorHandlers } = require('./middlewares');
const routes = require('./routes');
const { connectDB } = require('./config/database');
const { initSwagger } = require('./config/swagger');

// 创建Express应用
const app = express();

// 连接数据库
connectDB();

// 设置全局中间件
setupMiddlewares(app);

// 初始化API文档
initSwagger(app);

// 注册路由
app.use('/', routes);

// 注册错误处理
setupErrorHandlers(app);

module.exports = app;
```

### 自定义可重用中间件

创建自定义中间件示例：

#### 请求防重复提交中间件

```js
/**
 * 防重复提交中间件
 * @module middlewares/preventDuplicateSubmission
 */
const crypto = require('crypto');
const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');
const { AppError } = require('../utils/errors');

// 创建Redis客户端
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

const redisGet = promisify(redisClient.get).bind(redisClient);
const redisSetex = promisify(redisClient.setex).bind(redisClient);

/**
 * 防止重复提交中间件
 * @param {Object} options - 配置选项
 * @returns {Function} 中间件函数
 */
const preventDuplicateSubmission = (options = {}) => {
  const {
    expirationSeconds = 60, // 默认请求标识有效期
    message = '请勿重复提交', // 提示信息
    statusCode = 409, // 错误状态码
    fieldExtractor = req => JSON.stringify(req.body) // 用于生成唯一标识的字段提取器
  } = options;
  
  return async (req, res, next) => {
    try {
      // 生成请求唯一标识
      const userId = req.user ? req.user.id : 'anonymous';
      const requestData = fieldExtractor(req);
      const path = req.originalUrl;
      
      const requestHash = crypto
        .createHash('sha256')
        .update(`${userId}-${path}-${requestData}`)
        .digest('hex');
      
      const key = `duplicate:${requestHash}`;
      
      // 检查请求是否已存在
      const exists = await redisGet(key);
      
      if (exists) {
        return next(new AppError(message, statusCode));
      }
      
      // 设置请求标识
      await redisSetex(key, expirationSeconds, 'true');
      
      next();
    } catch (err) {
      // Redis错误不应阻止请求继续
      console.error('防重复提交中间件错误:', err);
      next();
    }
  };
};

module.exports = preventDuplicateSubmission;
```

#### 缓存中间件

```js
/**
 * 响应缓存中间件
 * @module middlewares/cache
 */
const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');

// 创建Redis客户端
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

const redisGet = promisify(redisClient.get).bind(redisClient);
const redisSetex = promisify(redisClient.setex).bind(redisClient);

/**
 * 响应缓存中间件
 * @param {Object} options - 缓存配置选项
 * @returns {Function} 中间件函数
 */
const cacheResponse = (options = {}) => {
  const {
    ttl = 60, // 缓存生存时间（秒）
    prefix = 'api_cache:', // 缓存键前缀
    keyGenerator = (req) => `${req.originalUrl}` // 缓存键生成函数
  } = options;
  
  return async (req, res, next) => {
    // 跳过非GET请求
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      // 生成缓存键
      const key = `${prefix}${keyGenerator(req)}`;
      
      // 尝试获取缓存
      const cachedResponse = await redisGet(key);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        
        // 设置适当的响应头
        res.setHeader('X-Cache', 'HIT');
        
        // 返回缓存的响应
        return res.status(data.status).json(data.body);
      }
      
      // 设置未命中缓存头
      res.setHeader('X-Cache', 'MISS');
      
      // 保存原始的json方法
      const originalJson = res.json;
      
      // 重写json方法以捕获响应
      res.json = function(body) {
        // 恢复原始方法
        res.json = originalJson;
        
        // 缓存响应
        const responseData = {
          status: res.statusCode,
          body
        };
        
        // 只缓存成功响应
        if (res.statusCode === 200) {
          redisSetex(key, ttl, JSON.stringify(responseData))
            .catch(err => console.error('缓存响应失败:', err));
        }
        
        // 调用原始方法返回响应
        return res.json(body);
      };
      
      next();
    } catch (err) {
      // Redis错误不应阻止请求继续
      console.error('缓存中间件错误:', err);
      next();
    }
  };
};

/**
 * 清除缓存中间件
 * @param {Object} options - 配置选项
 * @returns {Function} 中间件函数
 */
const clearCache = (options = {}) => {
  const {
    patterns = [], // 要清除的缓存模式
    prefix = 'api_cache:' // 缓存键前缀
  } = options;
  
  return async (req, res, next) => {
    // 保存原始的end方法
    const originalEnd = res.end;
    
    // 重写end方法
    res.end = function(...args) {
      // 只在成功响应时清除缓存
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // 清除指定模式的缓存
        patterns.forEach(pattern => {
          const key = typeof pattern === 'function' 
            ? `${prefix}${pattern(req)}` 
            : `${prefix}${pattern}`;
          
          redisClient.keys(`${key}*`, (err, keys) => {
            if (err) return console.error('获取缓存键失败:', err);
            
            if (keys.length > 0) {
              redisClient.del(keys, (err) => {
                if (err) console.error('清除缓存失败:', err);
              });
            }
          });
        });
      }
      
      // 调用原始方法
      originalEnd.apply(res, args);
    };
    
    next();
  };
};

module.exports = {
  cacheResponse,
  clearCache
};
```

在路由中使用自定义中间件：

```js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../middlewares/auth');
const { cacheResponse, clearCache } = require('../middlewares/cache');
const preventDuplicateSubmission = require('../middlewares/preventDuplicateSubmission');

// 使用缓存中间件缓存列表查询
router.get(
  '/',
  auth.protect,
  cacheResponse({ ttl: 300 }), // 缓存5分钟
  userController.getAllUsers
);

使用Git Hooks确保提交代码质量：

```json
// package.json - husky配置
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 持续集成与部署

.github/workflows/ci.yml 示例：

```yaml
name: Express应用CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017
      redis:
        image: redis:6
        ports:
          - 6379:6379
    
    strategy:
      matrix:
        node-version: [14.x, 16.x]
    
    steps:
      - uses: actions/checkout@v2
      
      - name: 设置Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 代码检查
        run: npm run lint
      
      - name: 运行测试
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_URL: mongodb://localhost:27017/test
          REDIS_HOST: localhost
          JWT_SECRET: test_secret_key
      
      - name: 覆盖率报告
        uses: codecov/codecov-action@v2
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: 设置Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.x'
      
      - name: 安装依赖
        run: npm ci
      
      - name: 构建应用
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: 部署到生产服务器
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull
            npm ci --production
            pm2 reload ecosystem.config.js --env production
```

---

> 参考资料：[Express官方文档](https://expressjs.com/zh-cn/) 