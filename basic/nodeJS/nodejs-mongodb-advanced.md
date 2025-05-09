---
layout: doc
title: Node.js与MongoDB高级应用
description: 全面解析Node.js与MongoDB的高阶集成、Schema设计、聚合管道、性能优化与实战技巧。
---

# Node.js与MongoDB高级应用

MongoDB是最流行的NoSQL数据库之一，Node.js与其结合可高效处理大规模数据。本文将系统讲解Node.js与MongoDB的高阶集成、Schema设计、聚合管道、性能优化与实战技巧。

## 目录

- [Mongoose与原生驱动对比](#mongoose与原生驱动对比)
- [Schema设计与数据建模](#schema设计与数据建模)
- [聚合管道与复杂查询](#聚合管道与复杂查询)
- [事务与数据一致性](#事务与数据一致性)
- [索引与性能优化](#索引与性能优化)
- [高级查询技巧](#高级查询技巧)
- [变更流与实时应用](#变更流与实时应用)
- [地理空间查询](#地理空间查询)
- [实战建议与最佳实践](#实战建议与最佳实践)

## Mongoose与原生驱动对比

- Mongoose提供Schema、模型、验证、钩子等高级功能
- 原生驱动更灵活，适合极致性能场景

```js
// 连接MongoDB（Mongoose）
const mongoose = require('mongoose');
/**
 * 连接MongoDB数据库
 * @param {string} uri 连接字符串
 * @returns {Promise<void>}
 */
async function connectMongo(uri) {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}
```

### Mongoose的核心优势

Mongoose作为对象文档映射(ODM)工具，为Node.js应用提供了丰富的功能：

```js
/**
 * Mongoose连接与基本配置
 */
const mongoose = require('mongoose');

// 连接选项
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  family: 4 // 使用IPv4
};

/**
 * 连接MongoDB并处理事件
 * @param {string} uri 连接字符串
 * @returns {Promise<void>}
 */
async function connectWithEvents(uri) {
  mongoose.connection.on('connected', () => console.log('MongoDB连接成功'));
  mongoose.connection.on('error', (err) => console.error('MongoDB连接错误:', err));
  mongoose.connection.on('disconnected', () => console.log('MongoDB连接断开'));
  
  // 应用退出时关闭连接
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB连接已关闭');
    process.exit(0);
  });
  
  await mongoose.connect(uri, options);
}
```

### 原生驱动的使用场景

当需要更高性能或更底层的控制时，可以使用MongoDB原生驱动：

```js
const { MongoClient } = require('mongodb');

/**
 * MongoDB客户端类
 */
class MongoDBClient {
  /**
   * 构造函数
   * @param {string} uri 连接字符串
   * @param {Object} options 连接选项
   */
  constructor(uri, options = {}) {
    this.uri = uri;
    this.options = {
      useUnifiedTopology: true,
      maxPoolSize: 50,
      ...options
    };
    this.client = null;
    this.db = null;
  }

  /**
   * 连接数据库
   * @param {string} dbName 数据库名称
   * @returns {Promise<Db>}
   */
  async connect(dbName) {
    if (!this.client) {
      this.client = new MongoClient(this.uri, this.options);
      await this.client.connect();
      console.log('MongoDB原生驱动连接成功');
    }
    
    this.db = this.client.db(dbName);
    return this.db;
  }

  /**
   * 关闭连接
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('MongoDB原生驱动连接已关闭');
    }
  }

  /**
   * 获取集合
   * @param {string} collectionName 集合名称
   * @returns {Collection}
   */
  collection(collectionName) {
    if (!this.db) {
      throw new Error('请先连接数据库');
    }
    return this.db.collection(collectionName);
  }
}

// 使用示例
const mongoClient = new MongoDBClient('mongodb://localhost:27017');
```

### 性能对比与选择建议

在真实应用中，Mongoose和原生驱动的选择应基于具体需求：

| 功能/特性 | Mongoose | 原生驱动 |
|---------|----------|---------|
| 数据验证 | 内置支持  | 需自行实现 |
| Schema定义 | 良好支持 | 无架构支持 |
| 中间件/钩子 | 支持 | 不支持 |
| 查询API | 简洁易用 | 更底层灵活 |
| 性能 | 略低(有封装开销) | 更高 |
| 学习曲线 | 中等 | 较陡 |

```js
/**
 * 在项目中同时使用Mongoose和原生驱动
 * @param {string} uri 连接字符串
 * @returns {Object} 包含Mongoose模型和原生集合的对象
 */
async function setupDatabases(uri) {
  // 使用Mongoose管理结构化数据
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const User = mongoose.model('User', userSchema);
  
  // 使用原生驱动处理大批量/高性能操作
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db('myapp');
  const logsCollection = db.collection('logs');
  
  return { 
    models: { User }, 
    collections: { logs: logsCollection },
    cleanup: async () => {
      await mongoose.disconnect();
      await client.close();
    }
  };
}
```

## Schema设计与数据建模

- 合理设计Schema，明确字段类型、索引、唯一性
- 支持嵌套文档、数组、引用等复杂结构

```js
// 用户Schema示例
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  age: Number,
  tags: [String]
});
const User = mongoose.model('User', userSchema);
```

### 高级Schema特性

Mongoose Schema支持丰富的配置选项和验证规则：

```js
/**
 * 用户模式定义(包含高级特性)
 */
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, '用户名不能为空'], 
    minlength: [3, '用户名最少3个字符'],
    maxlength: [20, '用户名最多20个字符'],
    trim: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value}不是有效的邮箱地址`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // 默认查询不返回该字段
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'editor'],
      message: '{VALUE}不是有效的角色'
    },
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // 创建后不可修改
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // 嵌套文档
  profile: {
    firstName: String,
    lastName: String,
    bio: {
      type: String,
      maxlength: 200
    },
    socialMedia: {
      twitter: String,
      facebook: String,
      linkedin: String
    }
  },
  // 数组类型
  interests: [String],
  // 引用其他集合
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
}, {
  timestamps: true, // 自动管理createdAt和updatedAt
  toJSON: { virtuals: true }, // JSON序列化包含虚拟属性
  toObject: { virtuals: true },
  id: false // 不生成额外的id字段
});

// 添加虚拟属性
userSchema.virtual('fullName').get(function() {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// 添加实例方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  // 实际应用中需使用bcrypt等进行密码比对
  return candidatePassword === this.password;
};

// 添加静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// 添加查询助手
userSchema.query.byActive = function() {
  return this.where({ isActive: true });
};

// 添加中间件(钩子)
userSchema.pre('save', async function(next) {
  // 仅当密码字段被修改时执行操作
  if (!this.isModified('password')) return next();
  
  // 在实际应用中，这里应该对密码进行加密处理
  // this.password = await bcrypt.hash(this.password, 12);
  this.updatedAt = new Date();
  next();
});

// 创建User模型
const User = mongoose.model('User', userSchema);
```

### 文档关系建模策略

MongoDB支持多种数据关系模式，每种适用于不同场景：

```js
/**
 * 方法1: 嵌入式文档(适合一对少量关系)
 */
const postWithCommentsSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  // 嵌入评论数组
  comments: [{
    user: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

/**
 * 方法2: 文档引用(适合一对多、多对多关系)
 */
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
});

const commentSchema = new mongoose.Schema({
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post'
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

/**
 * 方法3: 双向引用(适合需要从两侧查询的关系)
 */
// 用户模式(已定义)添加文章引用
userSchema.add({
  posts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post'
  }]
});

// 文章模式包含用户引用
const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
});

/**
 * 方法4: 树状结构(适合层级数据)
 */
const categorySchema = new mongoose.Schema({
  name: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  ancestors: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    name: String
  }]
});

// 添加子分类方法
categorySchema.methods.addChild = async function(childName) {
  const ancestors = [...this.ancestors, { _id: this._id, name: this.name }];
  const childCategory = new Category({
    name: childName,
    parent: this._id,
    ancestors
  });
  return await childCategory.save();
};
```

### Schema最佳实践

设计MongoDB Schema时的核心原则：

```js
/**
 * 1. 优先考虑应用访问模式
 * 
 * 示例: 博客系统中，文章与评论的关系处理
 */
// 如果通常按文章查询所有评论，可使用嵌入式设计
const blogWithCommentsSchema = new mongoose.Schema({
  title: String,
  content: String,
  comments: [{ user: String, text: String }]
});

// 如果评论数量巨大或需要独立分页查询，应使用引用设计
const blogReferenceSchema = new mongoose.Schema({
  title: String,
  content: String,
  commentCount: { type: Number, default: 0 }
});

const commentReferenceSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  user: String,
  text: String
});

/**
 * 2. 平衡文档大小与查询效率
 */
// 对于大型数据集合，创建子文档摘要
const articleSchema = new mongoose.Schema({
  title: String,
  content: String, // 可能很长
  // 仅保存最近的5条评论摘要
  recentComments: [{
    user: String,
    preview: { type: String, maxlength: 50 },
    createdAt: Date
  }],
  commentCount: Number
});

/**
 * 3. 使用适当的数据类型
 */
const productSchema = new mongoose.Schema({
  name: String,
  price: {
    type: mongoose.Decimal128, // 货币使用Decimal128而非Float
    get: v => v ? parseFloat(v.toString()) : null // 转换为JS数字
  },
  isInStock: Boolean, // 布尔值查询更高效
  tags: [String], // 数组支持
  details: mongoose.Schema.Types.Mixed, // 灵活的动态字段(但放弃了类型检查)
  objectId: mongoose.Schema.Types.ObjectId,
  createdAt: Date
});

// 设置toJSON选项启用getters
productSchema.set('toJSON', { getters: true });

/**
 * 4. 模式演化与版本控制
 */
const userSchemaV2 = new mongoose.Schema({
  name: String,
  contact: {
    // 新版本将email和phone合并到contact对象下
    email: String,
    phone: String
  },
  // 添加版本标记
  schemaVersion: { type: Number, default: 2 }
});

// 迁移中间件示例
userSchemaV2.pre('save', function(next) {
  if (!this.schemaVersion) {
    // 旧数据迁移逻辑
    if (this.email && !this.contact) {
      this.contact = { email: this.email };
      delete this.email;
    }
    this.schemaVersion = 2;
  }
  next();
});
```

## 聚合管道与复杂查询

- 聚合管道（aggregate）支持分组、过滤、排序、统计等复杂操作

```js
/**
 * 查询年龄大于18岁的用户数量
 * @returns {Promise<number>}
 */
async function countAdults() {
  return await User.aggregate([
    { $match: { age: { $gt: 18 } } },
    { $count: 'adultCount' }
  ]);
}
```

### 基础聚合操作

MongoDB的聚合框架提供类似SQL的数据处理能力：

```js
/**
 * 用户数据分析示例
 * @returns {Promise<Array>} 聚合结果
 */
async function analyzeUsers() {
  return await User.aggregate([
    // 阶段1: 筛选活跃用户
    { 
      $match: { 
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      } 
    },
    
    // 阶段2: 按角色分组并计数
    { 
      $group: { 
        _id: '$role',
        count: { $sum: 1 },
        avgAge: { $avg: '$age' },
        names: { $push: '$username' }
      } 
    },
    
    // 阶段3: 排序
    { 
      $sort: { count: -1 } 
    },
    
    // 阶段4: 限制结果数量
    { 
      $limit: 5 
    },
    
    // 阶段5: 添加字段
    {
      $addFields: {
        roleCategory: {
          $cond: {
            if: { $eq: ['$_id', 'admin'] },
            then: '管理层',
            else: '普通用户'
          }
        }
      }
    }
  ]);
}
```

### 高级聚合技术

复杂数据分析场景下的聚合管道示例：

```js
/**
 * 高级销售数据分析
 * @param {Date} startDate 开始日期
 * @param {Date} endDate 结束日期
 * @returns {Promise<Array>} 分析结果
 */
async function analyzeSales(startDate, endDate) {
  return await Order.aggregate([
    // 筛选日期范围内的订单
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    
    // 展开订单项数组
    {
      $unwind: '$items'
    },
    
    // 查找关联的产品信息
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    
    // 处理查询结果
    {
      $addFields: {
        productDetail: { $arrayElemAt: ['$productInfo', 0] },
        itemTotal: { $multiply: ['$items.quantity', '$items.price'] }
      }
    },
    
    // 按产品分类分组
    {
      $group: {
        _id: '$productDetail.category',
        totalSales: { $sum: '$itemTotal' },
        totalQuantity: { $sum: '$items.quantity' },
        averageOrderValue: { $avg: '$itemTotal' },
        products: {
          $addToSet: {
            name: '$productDetail.name',
            id: '$productDetail._id'
          }
        }
      }
    },
    
    // 再次按销售额排序
    {
      $sort: { totalSales: -1 }
    },
    
    // 添加百分比字段
    {
      $facet: {
        categories: [{ $match: {} }],
        total: [
          { $group: { _id: null, sum: { $sum: '$totalSales' } } }
        ]
      }
    },
    
    // 展开并计算百分比
    {
      $unwind: '$total'
    },
    
    {
      $project: {
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: {
              _id: '$$category._id',
              totalSales: '$$category.totalSales',
              totalQuantity: '$$category.totalQuantity',
              products: '$$category.products',
              percentage: {
                $multiply: [
                  { $divide: ['$$category.totalSales', '$total.sum'] },
                  100
                ]
              }
            }
          }
        },
        grandTotal: '$total.sum'
      }
    }
  ]);
}
```

### 聚合管道优化技巧

优化MongoDB聚合性能的关键策略：

```js
/**
 * 优化的聚合查询示例
 * @returns {Promise<Array>} 优化的聚合结果
 */
async function optimizedAggregation() {
  return await BlogPost.aggregate([
    // 1. 尽早使用$match减少处理文档数
    {
      $match: {
        publishedAt: { $exists: true },
        status: 'published'
      }
    },
    
    // 2. 使用索引字段排序
    {
      $sort: { publishedAt: -1 }
    },
    
    // 3. 限制处理文档数
    {
      $limit: 1000
    },
    
    // 4. 投影仅需要的字段
    {
      $project: {
        title: 1,
        author: 1,
        publishedAt: 1,
        category: 1,
        readTime: 1,
        _id: 0
      }
    },
    
    // 5. 后续聚合操作...
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgReadTime: { $avg: '$readTime' }
      }
    },
    
    // 设置内存限制和允许磁盘使用
    { $sort: { count: -1 } }
  ]).option({
    allowDiskUse: true,     // 允许使用磁盘处理大型聚合
    maxTimeMS: 60000,       // 设置超时限制(60秒)
    comment: '分类文章统计'  // 添加注释便于分析
  });
}
```

## 事务与数据一致性

MongoDB 4.0以后支持多文档事务，可实现复杂业务的数据一致性：

```js
/**
 * 使用事务进行资金转账
 * @param {string} fromAccountId 转出账户ID
 * @param {string} toAccountId 转入账户ID
 * @param {number} amount 转账金额
 * @returns {Promise<boolean>} 事务结果
 */
async function transferMoney(fromAccountId, toAccountId, amount) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 查询转出账户
    const fromAccount = await Account.findById(fromAccountId).session(session);
    if (!fromAccount || fromAccount.balance < amount) {
      throw new Error('余额不足或账户不存在');
    }
    
    // 查询转入账户
    const toAccount = await Account.findById(toAccountId).session(session);
    if (!toAccount) {
      throw new Error('转入账户不存在');
    }
    
    // 执行转账操作
    await Account.findByIdAndUpdate(
      fromAccountId, 
      { $inc: { balance: -amount } },
      { session, new: true }
    );
    
    await Account.findByIdAndUpdate(
      toAccountId, 
      { $inc: { balance: amount } },
      { session, new: true }
    );
    
    // 记录交易历史
    await Transaction.create([{
      fromAccount: fromAccountId,
      toAccount: toAccountId,
      amount,
      date: new Date()
    }], { session });
    
    // 提交事务
    await session.commitTransaction();
    return true;
  } catch (error) {
    // 发生错误时回滚事务
    await session.abortTransaction();
    console.error('转账事务失败:', error);
    throw error;
  } finally {
    // 结束会话
    session.endSession();
  }
}
```

### 事务注意事项

MongoDB事务有一些特殊限制和注意事项：

```js
/**
 * 典型事务模式
 * @param {Function} callback 事务操作函数
 * @returns {Promise<any>} 事务结果
 */
async function withTransaction(callback) {
  const session = await mongoose.startSession();
  
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    }, {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    });
    
    return result;
  } finally {
    session.endSession();
  }
}

// 使用示例
await withTransaction(async (session) => {
  const user = await User.create([{ name: '张三', email: 'zhang@example.com' }], { session });
  await Profile.create([{ userId: user[0]._id, bio: '新用户' }], { session });
});
```

### 非事务数据一致性策略

在不支持事务的MongoDB版本或分片集群中的替代方案：

```js
/**
 * 双阶段提交模式实现数据一致性
 * @param {Object} userData 用户数据
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object>} 操作结果
 */
async function createUserAndOrder(userData, orderData) {
  // 阶段1: 创建临时记录
  const user = await User.create({
    ...userData,
    status: 'pending' // 标记为待处理状态
  });
  
  try {
    // 阶段2: 创建关联记录
    const order = await Order.create({
      ...orderData,
      userId: user._id,
      status: 'pending'
    });
    
    // 阶段3: 更新状态为完成
    await User.findByIdAndUpdate(user._id, { status: 'active' });
    await Order.findByIdAndUpdate(order._id, { status: 'created' });
    
    return { user, order };
  } catch (error) {
    // 失败时回滚 - 将用户标记为失败
    await User.findByIdAndUpdate(user._id, { status: 'failed' });
    throw error;
  }
}

// 清理未完成事务的后台任务
async function cleanupPendingTransactions() {
  const pendingUsers = await User.find({ status: 'pending', createdAt: { $lt: new Date(Date.now() - 30 * 60000) } });
  
  for (const user of pendingUsers) {
    await User.findByIdAndUpdate(user._id, { status: 'failed' });
    // 记录清理日志
  }
}
```

## 索引与性能优化

MongoDB索引是提升查询性能的关键，需合理创建与管理：

```js
// 创建单字段索引
userSchema.index({ email: 1 }); // 1表示升序索引

// 创建复合索引
userSchema.index({ username: 1, createdAt: -1 });

// 创建唯一索引
userSchema.index({ email: 1 }, { unique: true });

// 创建文本索引
blogSchema.index({ title: 'text', content: 'text' }, {
  weights: { title: 10, content: 5 } // 标题权重更高
});
```

### 索引类型与使用场景

MongoDB支持多种类型的索引，每种适用于不同场景：

```js
// 在Mongoose模型中定义各类索引
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  tags: [String],
  specifications: { 
    size: String,
    color: String,
    weight: Number
  },
  location: {
    type: { type: String, default: 'Point' }, 
    coordinates: [Number] // [经度, 纬度]
  },
  createdAt: Date
});

// 1. 单字段索引
productSchema.index({ price: 1 }); // 用于价格等值、范围查询

// 2. 复合索引（最左前缀原则）
productSchema.index({ category: 1, price: -1 }); // 类别+价格降序查询

// 3. 多键索引（数组字段）
productSchema.index({ tags: 1 }); // 数组元素查询

// 4. 地理空间索引
productSchema.index({ location: '2dsphere' }); // 位置查询

// 5. 文本索引
productSchema.index({ name: 'text', description: 'text' }); // 全文搜索

// 6. 哈希索引
productSchema.index({ name: 'hashed' }); // 用于分片集群

// 7. TTL索引（自动过期）
productSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 * 24 * 30 }); // 30天后过期

// 8. 部分索引（条件索引）
productSchema.index(
  { price: 1 }, 
  { partialFilterExpression: { price: { $gt: 1000 } } } // 仅为高价商品创建索引
);

// 9. 通配符索引（嵌套字段）
productSchema.index({ 'specifications.$**': 1 }); // 索引所有规格字段
```

### 查询优化实践

MongoDB查询优化的核心技巧：

```js
/**
 * 查询优化示例
 */
class ProductService {
  /**
   * 使用覆盖索引优化
   * @returns {Promise<Array>} 产品ID和名称列表
   */
  async getProductIdentifiers() {
    // 使用投影仅返回索引覆盖的字段（_id和name）
    return await Product.find({}, { _id: 1, name: 1 })
      .lean() // 返回普通JS对象提升性能
      .hint({ _id: 1, name: 1 }); // 强制使用指定索引
  }
  
  /**
   * 分页优化查询
   * @param {number} page 页码
   * @param {number} limit 每页数量
   * @returns {Promise<Array>} 分页结果
   */
  async getProductsPaginated(page = 1, limit = 20) {
    // 使用.skip()和.limit()组合进行分页
    // 注意：大量skip会导致性能问题
    return await Product.find({})
      .sort({ _id: 1 }) // 使用_id排序便于利用索引
      .skip((page - 1) * limit)
      .limit(limit);
  }
  
  /**
   * 基于ID的高效分页
   * @param {string} lastId 上一页的最后ID
   * @param {number} limit 每页数量
   * @returns {Promise<Array>} 分页结果
   */
  async getProductsIdBased(lastId = null, limit = 20) {
    const query = lastId ? { _id: { $gt: new mongoose.Types.ObjectId(lastId) } } : {};
    
    return await Product.find(query)
      .sort({ _id: 1 })
      .limit(limit);
  }
  
  /**
   * 投影优化
   * @param {string} id 产品ID
   * @returns {Promise<Object>} 产品基本信息
   */
  async getProductBasicInfo(id) {
    return await Product.findById(id, { 
      name: 1, 
      price: 1,
      category: 1
      // 排除大字段如详细描述、评论等
    });
  }
  
  /**
   * 解释查询计划
   * @param {Object} query 查询条件
   * @returns {Promise<Object>} 查询计划
   */
  async explainQuery(query = {}) {
    return await Product.find(query).explain('executionStats');
  }
}
```

### 性能监控与诊断

持续监控和优化MongoDB性能的工具与技术：

```js
/**
 * MongoDB性能监控类
 */
class MongoPerformanceMonitor {
  /**
   * 检查慢查询
   * @param {number} threshold 慢查询阈值(毫秒)
   * @returns {Promise<Array>} 慢查询列表
   */
  async checkSlowQueries(threshold = 100) {
    const { db } = mongoose.connection;
    
    // 确保已开启慢查询分析
    await db.command({ profile: 1, slowms: threshold });
    
    // 查询慢查询日志
    return await db.collection('system.profile').find({
      millis: { $gt: threshold }
    }).sort({ ts: -1 }).limit(20).toArray();
  }
  
  /**
   * 获取集合统计信息
   * @param {string} collectionName 集合名称
   * @returns {Promise<Object>} 统计信息
   */
  async getCollectionStats(collectionName) {
    const { db } = mongoose.connection;
    return await db.command({
      collStats: collectionName,
      scale: 1024 * 1024 // 以MB为单位返回
    });
  }
  
  /**
   * 检查集合索引使用情况
   * @param {string} collectionName 集合名称
   * @returns {Promise<Object>} 索引统计信息
   */
  async getIndexStats(collectionName) {
    const { db } = mongoose.connection;
    
    // 获取集合索引信息
    const indexes = await db.collection(collectionName).indexes();
    
    // 聚合索引使用统计
    const aggregateResult = await db.collection('system.profile').aggregate([
      { $match: { ns: `${db.databaseName}.${collectionName}`, op: 'query' } },
      { $group: {
          _id: '$queryPlanner.winningPlan.inputStage.indexName',
          count: { $sum: 1 },
          avgTimeMillis: { $avg: '$millis' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return {
      availableIndexes: indexes,
      indexUsage: aggregateResult
    };
  }
  
  /**
   * 创建性能测试报告
   * @returns {Promise<Object>} 性能报告
   */
  async generatePerformanceReport() {
    const { db } = mongoose.connection;
    
    // 获取数据库状态
    const serverStatus = await db.command({ serverStatus: 1 });
    
    // 提取关键性能指标
    return {
      connections: serverStatus.connections,
      networkStats: serverStatus.network,
      opCounters: serverStatus.opcounters,
      memory: serverStatus.mem,
      wiredTiger: {
        cache: serverStatus.wiredTiger.cache,
        concurrentTransactions: serverStatus.wiredTiger.concurrentTransactions
      },
      timestamp: new Date()
    };
  }
}
```

## 高级查询技巧

MongoDB支持丰富的高级查询功能，能够满足复杂的业务需求：

```js
/**
 * 高级查询示例集合
 */
class AdvancedQueries {
  /**
   * 全文搜索查询
   * @param {string} searchText 搜索文本
   * @returns {Promise<Array>} 搜索结果
   */
  async textSearch(searchText) {
    // 需要先在Schema中定义文本索引
    return await Article.find(
      { $text: { $search: searchText } },
      { score: { $meta: 'textScore' } }  // 添加相关性得分
    ).sort({ score: { $meta: 'textScore' } });  // 按相关性排序
  }
  
  /**
   * 模糊匹配查询
   * @param {string} keyword 关键词
   * @returns {Promise<Array>} 查询结果
   */
  async fuzzySearch(keyword) {
    const regex = new RegExp(keyword, 'i');  // i表示不区分大小写
    return await Product.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    });
  }
  
  /**
   * 复杂条件查询
   * @param {Object} filters 过滤条件
   * @returns {Promise<Array>} 查询结果
   */
  async advancedFilter(filters) {
    const query = {};
    
    // 价格范围过滤
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    
    // 分类过滤(支持多选)
    if (filters.categories && filters.categories.length > 0) {
      query.category = { $in: filters.categories };
    }
    
    // 标签过滤(必须包含所有指定标签)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    
    // 日期范围过滤
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    // 排除条件
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      query._id = { $nin: filters.excludeIds };
    }
    
    // 嵌套字段条件
    if (filters.specifications) {
      Object.entries(filters.specifications).forEach(([key, value]) => {
        query[`specifications.${key}`] = value;
      });
    }
    
    return await Product.find(query);
  }
  
  /**
   * 使用存在性操作符
   * @param {boolean} hasDiscount 是否有折扣
   * @returns {Promise<Array>} 查询结果
   */
  async findByFieldExistence(hasDiscount) {
    return await Product.find({
      discountPrice: hasDiscount ? { $exists: true } : { $exists: false }
    });
  }
  
  /**
   * 数组元素查询
   * @param {Object} criteria 查询条件
   * @returns {Promise<Array>} 查询结果
   */
  async findByArrayConditions(criteria) {
    // 查询条件示例
    const query = {
      // 数组大小匹配
      'specifications.options': { $size: criteria.optionsCount },
      
      // 数组包含特定元素
      tags: { $elemMatch: { $eq: criteria.tag } },
      
      // 与特定位置的元素匹配
      [`variants.${criteria.variantIndex}.inStock`]: true
    };
    
    return await Product.find(query);
  }
  
  /**
   * 关联查询(使用populate)
   * @param {string} userId 用户ID
   * @returns {Promise<Object>} 用户及其相关数据
   */
  async getUserWithRelatedData(userId) {
    return await User.findById(userId)
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { createdAt: -1 }, limit: 5 }
      })
      .populate({
        path: 'reviews',
        select: 'productId rating comment',
        populate: {
          path: 'productId',
          select: 'name price'
        }
      });
  }
}
```

### 高级更新操作

MongoDB提供了多种高级更新操作，能够高效处理复杂数据修改：

```js
/**
 * 高级更新操作集
 */
class AdvancedUpdates {
  /**
   * 原子更新操作
   * @param {string} productId 产品ID
   * @param {number} quantity 购买数量
   * @returns {Promise<Object>} 更新结果
   */
  async purchaseProduct(productId, quantity) {
    // 使用findOneAndUpdate原子操作
    return await Product.findOneAndUpdate(
      { 
        _id: productId, 
        stock: { $gte: quantity } // 确保库存充足
      },
      { 
        $inc: { stock: -quantity }, // 减少库存
        $push: { purchaseHistory: { // 添加购买历史
          quantity,
          date: new Date()
        }}
      },
      { new: true } // 返回更新后的文档
    );
  }
  
  /**
   * 数组更新操作
   * @param {string} postId 文章ID
   * @param {Object} comment 评论数据
   * @returns {Promise<Object>} 更新结果
   */
  async addComment(postId, comment) {
    return await Post.findByIdAndUpdate(
      postId,
      { 
        $push: { 
          comments: {
            ...comment,
            _id: new mongoose.Types.ObjectId(),
            createdAt: new Date()
          }
        },
        $inc: { commentCount: 1 }
      },
      { new: true }
    );
  }
  
  /**
   * 修改数组特定元素
   * @param {string} postId 文章ID
   * @param {string} commentId 评论ID
   * @param {string} newText 新评论内容
   * @returns {Promise<Object>} 更新结果
   */
  async updateComment(postId, commentId, newText) {
    return await Post.findOneAndUpdate(
      { _id: postId, 'comments._id': commentId },
      { 
        $set: { 
          'comments.$.text': newText,
          'comments.$.editedAt': new Date()
        }
      },
      { new: true }
    );
  }
  
  /**
   * 条件更新运算符
   * @param {string} productId 产品ID
   * @param {number} newPrice 新价格
   * @returns {Promise<Object>} 更新结果
   */
  async updatePriceIfLower(productId, newPrice) {
    return await Product.findByIdAndUpdate(
      productId,
      [
        {
          $set: {
            price: {
              $cond: {
                if: { $gt: ['$price', newPrice] },
                then: newPrice,
                else: '$price'
              }
            },
            priceHistory: {
              $cond: {
                if: { $gt: ['$price', newPrice] },
                then: {
                  $concatArrays: ['$priceHistory', [{
                    price: newPrice,
                    date: new Date()
                  }]]
                },
                else: '$priceHistory'
              }
            }
          }
        }
      ],
      { new: true }
    );
  }
  
  /**
   * 聚合管道更新
   * @param {number} discountPercent 折扣百分比
   * @returns {Promise<Object>} 更新结果
   */
  async applyDiscountToExpensiveProducts(discountPercent) {
    return await Product.updateMany(
      { price: { $gt: 1000 } },
      [
        {
          $set: {
            discountPrice: {
              $multiply: [
                '$price',
                { $subtract: [1, { $divide: [discountPercent, 100] }] }
              ]
            },
            discountPercent: discountPercent,
            discountAppliedAt: new Date()
          }
        }
      ]
    );
  }
}
```

## 变更流与实时应用

MongoDB变更流（Change Streams）允许应用程序实时监控数据变更：

```js
/**
 * 变更流监听服务
 */
class ChangeStreamService {
  constructor() {
    this.changeStreams = new Map();
  }
  
  /**
   * 监控数据变更
   * @param {string} collectionName 集合名称
   * @param {Function} callback 回调函数
   * @param {Array} pipeline 过滤管道
   * @returns {void}
   */
  watch(collectionName, callback, pipeline = []) {
    // 获取模型
    const Model = mongoose.model(collectionName);
    
    // 创建变更流
    const changeStream = Model.watch(pipeline, {
      fullDocument: 'updateLookup' // 包含完整的更新后文档
    });
    
    // 处理变更事件
    changeStream.on('change', (change) => {
      callback(change);
    });
    
    // 处理错误
    changeStream.on('error', (error) => {
      console.error(`${collectionName} 变更流错误:`, error);
      
      // 重新连接变更流
      setTimeout(() => {
        changeStream.close();
        this.watch(collectionName, callback, pipeline);
      }, 5000);
    });
    
    // 保存变更流引用以便后续管理
    this.changeStreams.set(collectionName, changeStream);
    
    console.log(`已启动 ${collectionName} 集合的变更流监控`);
  }
  
  /**
   * 关闭特定变更流
   * @param {string} collectionName 集合名称
   * @returns {Promise<void>}
   */
  async closeStream(collectionName) {
    const changeStream = this.changeStreams.get(collectionName);
    
    if (changeStream) {
      await changeStream.close();
      this.changeStreams.delete(collectionName);
      console.log(`已关闭 ${collectionName} 集合的变更流监控`);
    }
  }
  
  /**
   * 关闭所有变更流
   * @returns {Promise<void>}
   */
  async closeAllStreams() {
    for (const [name, stream] of this.changeStreams.entries()) {
      await stream.close();
      console.log(`已关闭 ${name} 集合的变更流监控`);
    }
    
    this.changeStreams.clear();
  }
}

// 使用示例
const changeStreamService = new ChangeStreamService();

// 监控用户集合变更
changeStreamService.watch('User', (change) => {
  console.log('用户数据变更:', change.operationType);
  
  // 根据操作类型处理不同逻辑
  switch (change.operationType) {
    case 'insert':
      console.log('新用户注册:', change.fullDocument.username);
      // 发送欢迎邮件等
      break;
    case 'update':
      console.log('用户信息更新:', change.documentKey._id);
      // 更新相关缓存等
      break;
    case 'delete':
      console.log('用户被删除:', change.documentKey._id);
      // 清理相关资源等
      break;
  }
});

// 带管道的变更流(仅监控重要状态变更)
changeStreamService.watch('Order', (change) => {
  console.log('订单状态变更:', change.fullDocument.status);
  // 处理订单状态变更逻辑
}, [
  { $match: { 'updateDescription.updatedFields.status': { $exists: true } } }
]);
```

### 实时通知系统实现

基于变更流构建实时通知系统：

```js
/**
 * 实时通知系统
 */
class NotificationSystem {
  constructor(io) {
    this.io = io; // Socket.IO实例
    this.changeStreamService = new ChangeStreamService();
    this.connectedUsers = new Map(); // 用户ID到socketId的映射
  }
  
  /**
   * 初始化通知系统
   * @returns {void}
   */
  initialize() {
    // 配置Socket.IO连接
    this.io.on('connection', (socket) => {
      console.log('新Socket连接:', socket.id);
      
      // 用户认证
      socket.on('authenticate', (userId) => {
        this.connectedUsers.set(userId, socket.id);
        console.log(`用户 ${userId} 已连接`);
      });
      
      // 断开连接处理
      socket.on('disconnect', () => {
        // 移除用户映射
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            console.log(`用户 ${userId} 已断开连接`);
            break;
          }
        }
      });
    });
    
    // 监控通知集合变更
    this.changeStreamService.watch('Notification', (change) => {
      if (change.operationType === 'insert') {
        const notification = change.fullDocument;
        const recipients = notification.recipients || [];
        
        // 向所有在线收件人推送通知
        recipients.forEach(recipientId => {
          const socketId = this.connectedUsers.get(recipientId.toString());
          
          if (socketId) {
            this.io.to(socketId).emit('notification', {
              id: notification._id,
              type: notification.type,
              content: notification.content,
              createdAt: notification.createdAt
            });
            
            console.log(`已向用户 ${recipientId} 推送通知`);
          }
        });
      }
    });
    
    // 监控消息集合变更
    this.changeStreamService.watch('Message', (change) => {
      if (change.operationType === 'insert') {
        const message = change.fullDocument;
        const recipientId = message.recipient.toString();
        const socketId = this.connectedUsers.get(recipientId);
        
        if (socketId) {
          this.io.to(socketId).emit('new-message', {
            id: message._id,
            from: message.sender,
            content: message.content,
            createdAt: message.createdAt
          });
          
          console.log(`已向用户 ${recipientId} 推送新消息`);
        }
      }
    });
  }
  
  /**
   * 创建通知
   * @param {Object} notification 通知数据
   * @returns {Promise<Object>} 创建的通知
   */
  async createNotification(notification) {
    return await Notification.create(notification);
  }
  
  /**
   * 向特定用户发送系统消息
   * @param {string} userId 用户ID
   * @param {string} content 消息内容
   * @param {string} type 消息类型
   * @returns {Promise<void>}
   */
  async sendSystemMessage(userId, content, type = 'system') {
    // 创建新消息记录
    await Message.create({
      sender: 'system',
      recipient: userId,
      content,
      type,
      createdAt: new Date()
    });
  }
  
  /**
   * 关闭通知系统
   * @returns {Promise<void>}
   */
  async shutdown() {
    await this.changeStreamService.closeAllStreams();
    console.log('通知系统已关闭');
  }
}
```

## 地理空间查询

MongoDB支持强大的地理空间查询功能，适用于基于位置的应用：

```js
/**
 * 定义带地理位置字段的Schema
 */
const locationSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  // GeoJSON Point格式
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [经度, 纬度]
      required: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  openingHours: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 为location字段创建2dsphere索引
locationSchema.index({ location: '2dsphere' });

// 创建模型
const Location = mongoose.model('Location', locationSchema);
```

### 基本地理空间查询

位置数据常见查询操作：

```js
/**
 * 地理空间查询服务
 */
class GeoSpatialService {
  /**
   * 查找附近地点
   * @param {number} longitude 经度
   * @param {number} latitude 纬度
   * @param {number} maxDistance 最大距离(米)
   * @param {string} category 类别(可选)
   * @returns {Promise<Array>} 查询结果
   */
  async findNearby(longitude, latitude, maxDistance = 5000, category = null) {
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    };
    
    // 添加类别过滤条件
    if (category) {
      query.category = category;
    }
    
    return await Location.find(query);
  }
  
  /**
   * 查找给定区域内的地点
   * @param {Array} polygonCoordinates 多边形坐标数组
   * @returns {Promise<Array>} 查询结果
   */
  async findWithinArea(polygonCoordinates) {
    return await Location.find({
      location: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [polygonCoordinates] // 注意格式: [[[lng1, lat1], [lng2, lat2], ...]]
          }
        }
      }
    });
  }
  
  /**
   * 通过圆形区域查询
   * @param {number} longitude 经度
   * @param {number} latitude 纬度
   * @param {number} radiusInMeters 半径(米)
   * @returns {Promise<Array>} 查询结果
   */
  async findWithinCircle(longitude, latitude, radiusInMeters) {
    // 将米转换为弧度(地球半径约6378137米)
    const radiusInRadians = radiusInMeters / 6378137;
    
    return await Location.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians]
        }
      }
    });
  }
  
  /**
   * 计算两点之间距离
   * @param {string} locationId1 地点1 ID
   * @param {string} locationId2 地点2 ID
   * @returns {Promise<number>} 距离(米)
   */
  async calculateDistance(locationId1, locationId2) {
    const [location1, location2] = await Promise.all([
      Location.findById(locationId1),
      Location.findById(locationId2)
    ]);
    
    if (!location1 || !location2) {
      throw new Error('无法找到指定地点');
    }
    
    const [lng1, lat1] = location1.location.coordinates;
    const [lng2, lat2] = location2.location.coordinates;
    
    // 使用聚合管道计算距离
    const result = await Location.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng1, lat1] },
          distanceField: 'distance',
          includeLocs: 'location',
          query: { _id: location2._id }
        }
      }
    ]);
    
    return result.length > 0 ? result[0].distance : null;
  }
}
```

### 高级地理空间功能

实现复杂的地理空间功能：

```js
/**
 * 高级地理空间功能服务
 */
class AdvancedGeoService {
  /**
   * 创建地点
   * @param {Object} locationData 地点数据
   * @returns {Promise<Object>} 创建的地点
   */
  async createLocation(locationData) {
    // 确保坐标正确格式: [经度, 纬度]
    if (locationData.latitude !== undefined && locationData.longitude !== undefined) {
      locationData.location = {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude]
      };
      
      // 删除单独的经纬度字段
      delete locationData.latitude;
      delete locationData.longitude;
    }
    
    return await Location.create(locationData);
  }
  
  /**
   * 地理聚合查询 - 按区域聚合统计
   * @param {Array} centerCoordinates 中心点坐标[经度, 纬度]
   * @param {number} maxDistance 最大距离(米)
   * @returns {Promise<Array>} 聚合结果
   */
  async aggregateByCategory(centerCoordinates, maxDistance) {
    return await Location.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: centerCoordinates
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          includeLocs: 'location',
          spherical: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          locations: { $push: { name: '$name', distance: '$distance' } },
          avgDistance: { $avg: '$distance' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }
  
  /**
   * 查找一条路径上的兴趣点
   * @param {Array} routeCoordinates 路径坐标数组
   * @param {number} maxDistance 最大偏离距离(米)
   * @returns {Promise<Array>} 查询结果
   */
  async findAlongRoute(routeCoordinates, maxDistance) {
    // 创建路径LineString
    const route = {
      type: 'LineString',
      coordinates: routeCoordinates
    };
    
    return await Location.find({
      location: {
        $near: {
          $geometry: route,
          $maxDistance: maxDistance
        }
      }
    });
  }
  
  /**
   * 查找两个地点之间的其他地点
   * @param {string} startId 起点ID
   * @param {string} endId 终点ID
   * @param {number} maxDeviationDistance 最大偏移距离(米)
   * @returns {Promise<Array>} 查询结果
   */
  async findBetweenLocations(startId, endId, maxDeviationDistance = 1000) {
    const [startLocation, endLocation] = await Promise.all([
      Location.findById(startId),
      Location.findById(endId)
    ]);
    
    if (!startLocation || !endLocation) {
      throw new Error('无法找到起点或终点');
    }
    
    const startCoords = startLocation.location.coordinates;
    const endCoords = endLocation.location.coordinates;
    
    // 创建起点到终点的直线路径
    const routeLine = {
      type: 'LineString',
      coordinates: [startCoords, endCoords]
    };
    
    // 查找靠近路径的地点(不包括起点和终点)
    return await Location.find({
      _id: { $nin: [startId, endId] },
      location: {
        $near: {
          $geometry: routeLine,
          $maxDistance: maxDeviationDistance
        }
      }
    }).sort('distance');
  }
  
  /**
   * 基于地理围栏的实时位置监测
   * @param {Object} userLocation 用户位置{经度, 纬度}
   * @returns {Promise<Array>} 进入的地理围栏
   */
  async checkGeofences(userLocation) {
    // 假设有一个Geofence集合存储地理围栏
    const Geofence = mongoose.model('Geofence');
    
    // 查找用户当前位置进入的所有地理围栏
    return await Geofence.find({
      area: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude]
          }
        }
      }
    });
  }
}
```

## 实战建议与最佳实践

- 统一错误处理与日志记录
- 定期备份与监控数据库状态
- 合理拆分集合，避免单表过大
- 配合Mongoose插件提升开发效率

MongoDB在企业级应用中有许多最佳实践和优化策略：

```js
/**
 * MongoDB企业级应用最佳实践示例
 */
class MongoBestPractices {
  /**
   * 批量操作优化
   * @param {Array} documents 待插入文档
   * @returns {Promise<Object>} 操作结果
   */
  async optimizedBulkInsert(documents) {
    // 使用批量操作API优化大量写入
    if (!documents.length) return { insertedCount: 0 };
    
    // 适当分批处理大量数据
    const batchSize = 1000;
    const model = mongoose.model('DataRecord');
    
    let insertedCount = 0;
    
    // 分批处理
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await model.insertMany(batch, {
        ordered: false, // 非顺序插入提高性能
        rawResult: true // 返回原始结果
      });
      insertedCount += result.insertedCount;
    }
    
    return { insertedCount };
  }
  
  /**
   * 增量数据同步
   * @param {Date} lastSyncTime 上次同步时间
   * @returns {Promise<Object>} 同步结果
   */
  async incrementalSync(lastSyncTime) {
    // 仅同步自上次同步后修改的记录
    const Product = mongoose.model('Product');
    
    const updatedRecords = await Product.find({
      updatedAt: { $gt: lastSyncTime }
    }).lean();
    
    return {
      syncTime: new Date(),
      count: updatedRecords.length,
      records: updatedRecords
    };
  }
}
```

### 数据库设计原则

在MongoDB项目中应遵循的核心设计原则：

```js
/**
 * 产品目录设计示例
 */
// 1. 模式设计围绕查询模式:
// 常见查询: 通过类别浏览产品、搜索产品、获取产品详情
const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, index: true }, // 频繁按slug查询
  price: Number,
  category: { type: String, index: true }, // 频繁按类别查询
  tags: [String], // 用于过滤搜索
  description: String,
  attributes: mongoose.Schema.Types.Mixed, // 不同产品有不同属性
  inventoryCount: Number,
  // 嵌入常用相关数据减少查询次数
  mainImage: {
    url: String,
    alt: String
  },
  // 限制嵌入数组大小
  images: [{
    url: String,
    alt: String
  }],
  // 添加必要的元数据
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 2. 预计算常用值:
productSchema.virtual('isInStock').get(function() {
  return this.inventoryCount > 0;
});

// 3. 基于访问模式分割集合:
// 产品评论单独存储(可能很多且增长迅速)
const productReviewSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    index: true
  },
  userId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

// 4. 按时间范围分片:
// 存储产品销售记录(数据量大)
const saleRecordSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  revenue: Number,
  // 设计支持按年月分片
  year: { type: Number, index: true },
  month: { type: Number, index: true },
  timestamp: { type: Date, default: Date.now }
});
```

### 错误处理与重试机制

健壮的MongoDB应用需要完善的错误处理与重试机制：

```js
/**
 * MongoDB操作包装器
 */
class MongoWrapper {
  /**
   * 带重试的数据库操作
   * @param {Function} operation 数据库操作函数
   * @param {Object} options 重试选项
   * @returns {Promise<any>} 操作结果
   */
  async withRetry(operation, options = {}) {
    const {
      retries = 3,
      factor = 2,
      minTimeout = 1000,
      maxTimeout = 30000,
      randomize = true
    } = options;
    
    let attempt = 0;
    let lastError;
    
    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // 判断是否可重试的错误
        const isRetryable = this._isRetryableError(error);
        if (!isRetryable) throw error;
        
        // 计算退避时间
        attempt++;
        if (attempt >= retries) break;
        
        // 指数退避算法
        let timeout = Math.min(
          maxTimeout,
          minTimeout * Math.pow(factor, attempt)
        );
        
        // 随机化避免惊群效应
        if (randomize) {
          timeout = Math.random() * timeout * 0.5 + timeout * 0.5;
        }
        
        console.warn(`MongoDB操作失败，${attempt}/${retries}次尝试，将在${timeout}ms后重试`, error.message);
        await new Promise(resolve => setTimeout(resolve, timeout));
      }
    }
    
    throw lastError;
  }
  
  /**
   * 判断错误是否可重试
   * @param {Error} error 错误对象
   * @returns {boolean} 是否可重试
   * @private
   */
  _isRetryableError(error) {
    // 可重试的错误类型
    const retryableErrors = [
      'MongoNetworkError',
      'MongoTimeoutError',
      'MongoServerSelectionError',
      'WriteConcernError'
    ];
    
    // 可重试的错误码
    const retryableErrorCodes = [
      6, // HostUnreachable
      7, // HostNotFound
      89, // NetworkTimeout
      91, // ShutdownInProgress
      189, // PrimarySteppedDown
      9001, // SocketException
      11600, // InterruptedAtShutdown
      11602, // InterruptedDueToReplStateChange
      13436, // NotPrimaryNoSecondaryOk
      13435, // NotPrimaryOrSecondary
    ];
    
    // 检查错误类型
    if (retryableErrors.some(name => error.name === name)) return true;
    
    // 检查错误码
    if (error.code && retryableErrorCodes.includes(error.code)) return true;
    
    // 检查写入关注错误
    if (error.writeConcernError) return true;
    
    return false;
  }
  
  /**
   * 异常处理包装
   * @param {Function} handler 处理函数
   * @returns {Function} 包装后的处理函数
   */
  static wrapHandler(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        // 转换MongoDB特定错误为友好的API响应
        if (error.name === 'ValidationError') {
          return res.status(400).json({
            error: 'ValidationError',
            details: Object.values(error.errors).map(err => ({
              field: err.path,
              message: err.message
            }))
          });
        }
        
        if (error.name === 'MongoServerError' && error.code === 11000) {
          return res.status(409).json({
            error: 'DuplicateError',
            message: '记录已存在，无法创建重复项',
            field: Object.keys(error.keyPattern)[0]
          });
        }
        
        // 其他错误交给全局错误处理
        next(error);
      }
    };
  }
}
```

### 安全与授权管理

MongoDB应用中的安全最佳实践：

```js
/**
 * MongoDB安全配置管理
 */
class MongoSecurity {
  /**
   * 创建具有有限权限的数据库用户
   * @param {Db} db 数据库实例
   * @param {string} username 用户名
   * @param {string} password 密码
   * @param {Array<string>} roles 角色数组
   * @returns {Promise<Object>} 创建结果
   */
  async createRestrictedUser(db, username, password, roles = ['read']) {
    return await db.command({
      createUser: username,
      pwd: password,
      roles: roles.map(role => ({ role, db: db.databaseName }))
    });
  }
  
  /**
   * 审计日志记录
   * @param {Object} logData 日志数据
   * @returns {Promise<Object>} 日志记录
   */
  async logAuditEvent(logData) {
    const AuditLog = mongoose.model('AuditLog');
    return await AuditLog.create({
      ...logData,
      timestamp: new Date(),
      ipAddress: logData.ipAddress || 'unknown'
    });
  }
  
  /**
   * 敏感数据加密
   * @param {string} value 原始值
   * @returns {string} 加密值
   */
  encryptSensitiveData(value) {
    // 实际应用中应使用适当的加密库
    // 这里仅为示例，不应在生产中使用
    return `encrypted_${value}`;
  }
  
  /**
   * 数据访问控制中间件
   * @param {Array<string>} allowedRoles 允许的角色
   * @returns {Function} Express中间件
   */
  static accessControl(allowedRoles) {
    return (req, res, next) => {
      // 检查用户权限
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'AccessDenied',
          message: '您没有权限执行此操作'
        });
      }
      next();
    };
  }
}
```

### 部署与维护

MongoDB生产环境部署与维护策略：

```js
/**
 * MongoDB运维工具集
 */
class MongoOps {
  /**
   * 数据库备份
   * @param {string} dbName 数据库名称
   * @param {string} outputPath 输出路径
   * @returns {Promise<Object>} 备份结果
   */
  async backupDatabase(dbName, outputPath) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      // 使用mongodump工具备份
      const process = spawn('mongodump', [
        `--db=${dbName}`,
        `--out=${outputPath}`,
        '--gzip'
      ]);
      
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            path: outputPath,
            timestamp: new Date(),
            output
          });
        } else {
          reject(new Error(`备份失败，错误码: ${code}\n${output}`));
        }
      });
    });
  }
  
  /**
   * 数据库状态检查
   * @returns {Promise<Object>} 状态报告
   */
  async checkStatus() {
    const { db } = mongoose.connection;
    
    // 并行获取多项指标
    const [serverStatus, dbStats] = await Promise.all([
      db.command({ serverStatus: 1 }),
      db.command({ dbStats: 1 })
    ]);
    
    // 收集关键指标
    return {
      uptime: serverStatus.uptime,
      connections: {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available
      },
      memory: {
        resident: serverStatus.mem.resident,
        virtual: serverStatus.mem.virtual
      },
      storage: {
        dbSize: dbStats.dataSize / (1024 * 1024), // MB
        indexes: dbStats.indexSize / (1024 * 1024), // MB
        collections: dbStats.collections
      },
      operations: serverStatus.opcounters,
      status: 'healthy',
      timestamp: new Date()
    };
  }
  
  /**
   * 索引优化建议
   * @returns {Promise<Array>} 优化建议
   */
  async getIndexRecommendations() {
    const { db } = mongoose.connection;
    
    // 获取未使用索引
    const indexStats = await db.command({ serverStatus: 1, metrics: 1 });
    const indexCounters = indexStats.metrics.commands.listIndexes;
    
    // 获取集合列表
    const collections = await db.listCollections().toArray();
    
    const recommendations = [];
    
    // 分析每个集合
    for (const collection of collections) {
      const collName = collection.name;
      
      // 跳过系统集合
      if (collName.startsWith('system.')) continue;
      
      // 获取集合统计信息
      const collStats = await db.command({ collStats: collName });
      
      // 获取索引
      const indexes = await db.collection(collName).indexes();
      
      // 检查集合大小与索引
      if (collStats.size > 100 * 1024 * 1024 && indexes.length <= 1) { // 100MB以上大集合
        recommendations.push({
          collection: collName,
          recommendation: 'largeCollectionNoIndexes',
          message: `大型集合 (${Math.round(collStats.size/1024/1024)}MB) 只有默认索引，可能需要添加索引`
        });
      }
      
      // 检查索引大小
      if (collStats.totalIndexSize > collStats.size * 2) {
        recommendations.push({
          collection: collName,
          recommendation: 'largeIndexSize',
          message: `索引大小(${Math.round(collStats.totalIndexSize/1024/1024)}MB)超过数据大小的两倍，应考虑移除不必要索引`
        });
      }
    }
    
    return recommendations;
  }
}
```

## 总结

Node.js与MongoDB的结合为现代应用开发提供了强大而灵活的解决方案。从基础的模式设计到高级聚合操作，从性能优化到生产部署，掌握这些技术能够帮助开发者构建高效、可靠的数据驱动型应用。

本文系统地介绍了MongoDB与Node.js集成的各个方面，包括：

1. 选择合适的驱动和ODM工具，了解Mongoose和原生驱动的优缺点
2. 设计灵活而高效的Schema结构，处理各种数据关系
3. 使用聚合管道进行复杂数据分析与处理
4. 利用事务实现数据一致性保证
5. 优化索引和查询策略提升应用性能
6. 实现高级查询及更新操作处理复杂业务逻辑
7. 利用变更流构建实时应用功能
8. 处理地理空间数据开发位置相关服务
9. 应用企业级最佳实践确保系统可靠性和安全性

随着数据量的增长和应用复杂度的提升，MongoDB的水平扩展能力和灵活的数据模型将继续为Node.js应用提供可靠的数据基础。通过持续学习和实践，开发者可以充分发挥这一强大组合的潜力，构建下一代的Web应用和服务。

---

> 参考资料：
> - [Mongoose官方文档](https://mongoosejs.com/docs/)
> - [MongoDB官方文档](https://docs.mongodb.com/)
> - [MongoDB Node.js Driver文档](https://mongodb.github.io/node-mongodb-native/)
> - [MongoDB大规模部署最佳实践](https://www.mongodb.com/blog/post/mongodb-best-practices) 