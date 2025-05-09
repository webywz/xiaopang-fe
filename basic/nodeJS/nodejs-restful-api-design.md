---
layout: doc
title: Node.js RESTful API设计原则
description: 全面解析RESTful API设计规范、路由与资源建模、状态码与错误处理、版本管理与最佳实践，助你构建高质量Node.js后端服务。
---

# Node.js RESTful API设计原则

RESTful API是现代Web后端服务的主流接口风格。本文将系统讲解Node.js下RESTful API的设计规范、路由与资源建模、状态码与错误处理、版本管理与最佳实践。

## 目录

- [RESTful API核心理念](#restful-api核心理念)
- [路由与资源建模](#路由与资源建模)
- [HTTP方法与语义](#http方法与语义)
- [状态码与错误处理](#状态码与错误处理)
- [API版本管理](#api版本管理)
- [实战建议与最佳实践](#实战建议与最佳实践)

## RESTful API核心理念

RESTful（Representational State Transfer）是一种软件架构风格，它定义了一组用于创建Web服务的约束和属性。在Node.js应用程序中，设计符合REST原则的API可以提高可维护性、扩展性和客户端兼容性。

### 以资源为中心

REST架构的核心是围绕资源展开，每个资源通过唯一的URL进行标识：

```
https://api.example.com/users           // 用户集合资源
https://api.example.com/users/123       // ID为123的用户资源
https://api.example.com/users/123/posts // ID为123的用户的所有博文资源
```

在Node.js中，可以这样设计资源路由：

```js
/**
 * 资源路由设计示例
 */
const express = require('express');
const router = express.Router();

// 用户资源
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 嵌套资源：用户的博客文章
router.get('/users/:userId/posts', listUserPosts);
router.get('/users/:userId/posts/:postId', getUserPost);
router.post('/users/:userId/posts', createUserPost);

module.exports = router;
```

### 使用标准HTTP方法

RESTful API使用标准的HTTP方法来表示对资源的操作意图：

| HTTP方法 | 操作 | 特性 |
|----------|------|------|
| GET | 读取资源 | 安全的、幂等的 |
| POST | 创建资源 | 非幂等的 |
| PUT | 更新资源(完全替换) | 幂等的 |
| PATCH | 部分更新资源 | 应当是幂等的 |
| DELETE | 删除资源 | 幂等的 |

在Node.js中实现：

```js
/**
 * 在Express.js中实现HTTP方法
 */
app.get('/api/users/:id', (req, res) => {
  // 读取操作 - 获取用户
  const user = userService.findById(req.params.id);
  res.json(user);
});

app.post('/api/users', (req, res) => {
  // 创建操作 - 新建用户
  const newUser = userService.create(req.body);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  // 更新操作(完全替换) - 更新用户全部字段
  const updatedUser = userService.replace(req.params.id, req.body);
  res.json(updatedUser);
});

app.patch('/api/users/:id', (req, res) => {
  // 部分更新操作 - 只更新提供的字段
  const patchedUser = userService.update(req.params.id, req.body);
  res.json(patchedUser);
});

app.delete('/api/users/:id', (req, res) => {
  // 删除操作
  userService.remove(req.params.id);
  res.status(204).end();
});
```

### 无状态通信

REST架构要求服务器和客户端之间的交互是无状态的，每个请求必须包含所有必要信息：

```js
/**
 * 无状态API示例 - 每个请求都包含完整的认证信息
 */
app.get('/api/protected-resource', (req, res) => {
  // 从请求中获取认证信息
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  try {
    // 验证令牌
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // 使用令牌中的信息访问资源
    const userId = decodedToken.userId;
    const resource = resourceService.getForUser(userId);
    
    res.json(resource);
  } catch (err) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
});
```

### 接口幂等性

幂等性意味着对同一资源进行多次相同请求应该产生与单次请求相同的效果。这对于确保API操作的可靠性至关重要：

```js
/**
 * 幂等操作示例：使用PUT更新资源
 */
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  
  // 无论调用多少次，结果都是一样的
  const product = {
    id,
    ...productData,
    updatedAt: new Date()
  };
  
  // 替换式更新，完全覆盖现有数据
  productsRepository.save(product);
  
  res.json(product);
});

/**
 * 非幂等操作示例：使用POST创建资源
 */
app.post('/api/orders', (req, res) => {
  // 每次调用都会创建新资源
  const newOrder = {
    id: generateId(),
    ...req.body,
    status: 'pending',
    createdAt: new Date()
  };
  
  ordersRepository.save(newOrder);
  
  // 返回201状态码和新创建的资源
  res.status(201).json(newOrder);
});
```

### 统一接口

RESTful API应当提供统一的接口，包括：

1. **资源标识**：每个资源都有唯一URI
2. **通过表述操作资源**：客户端通过交换资源的表述(如JSON)来操作资源
3. **自描述消息**：消息包含足够的信息，接收者可以理解其含义
4. **超媒体作为应用状态引擎(HATEOAS)**：客户端可以通过初始URI导航整个API

```js
/**
 * HATEOAS示例 - 响应中包含相关链接
 */
app.get('/api/users/:id', (req, res) => {
  const user = userService.findById(req.params.id);
  
  // 添加HATEOAS链接
  const userWithLinks = {
    ...user,
    _links: {
      self: { href: `/api/users/${user.id}` },
      posts: { href: `/api/users/${user.id}/posts` },
      followers: { href: `/api/users/${user.id}/followers` }
    }
  };
  
  res.json(userWithLinks);
});
```

通过深入理解和应用这些RESTful核心理念，可以设计出直观、一致且易于使用的API，为客户端提供良好的开发体验。

## 路由与资源建模

合理的路由设计和资源建模是构建直观、易用API的基础。本节将探讨如何在Node.js应用中设计有效的RESTful路由结构和资源模型。

### 路由设计原则

#### 简洁而语义化的路径

RESTful API的路径应该简洁明了，清晰表达资源的含义和层级关系：

```
/users                 // 好：简洁明了
/get-all-users         // 差：动词不应该出现在URL中
/api/v1/user-management/users  // 差：过于冗长
```

#### 使用名词表示资源

路由应使用名词（通常是复数形式）来表示资源，而不是动词：

```
/users       // 好：使用名词复数
/getUser     // 差：使用动词
/user/create // 差：使用动词
```

#### 一致的复数形式

为保持一致性，所有资源名称都应使用复数形式：

```
/users
/products
/categories
/orders
```

#### 资源层级与嵌套

资源之间的层级关系应通过路径嵌套表示：

```
/users/:userId/posts         // 用户的博文集合
/users/:userId/posts/:postId // 用户的特定博文
```

在Express.js中的实现：

```js
/**
 * 资源层级路由示例
 */
const express = require('express');
const app = express();

// 主资源路由
const usersRouter = express.Router();
app.use('/api/users', usersRouter);

// 用户集合资源
usersRouter.get('/', async (req, res) => {
  const users = await User.find(req.query);
  res.json(users);
});

// 单个用户资源
usersRouter.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

// 嵌套资源：用户的博文
usersRouter.get('/:userId/posts', async (req, res) => {
  const posts = await Post.find({ userId: req.params.userId });
  res.json(posts);
});

// 嵌套资源：用户的特定博文
usersRouter.get('/:userId/posts/:postId', async (req, res) => {
  const post = await Post.findOne({ 
    _id: req.params.postId,
    userId: req.params.userId
  });
  
  if (!post) return res.status(404).json({ error: '博文不存在' });
  res.json(post);
});
```

#### 避免过深的嵌套

嵌套不宜过深，通常不超过2-3层：

```
/users/:userId/posts/:postId/comments/:commentId  // 可接受但已接近极限
```

对于过深的嵌套，可以考虑使用查询参数或独立资源：

```
/comments?postId=123&userId=456  // 使用查询参数
/posts/:postId/comments          // 使用更浅的嵌套
```

### 资源建模策略

#### 基本资源模型

每个资源应该有明确的属性和唯一标识符：

```js
/**
 * 用户资源模型示例
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },  // 安全：默认不查询
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

#### 关系模型设计

RESTful API中的资源关系可以通过以下方式表示：

1. **内嵌文档**：适用于一对一或一对少量关系

```js
// 用户包含地址
const userSchema = new mongoose.Schema({
  // ... 其他字段
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
});
```

2. **引用ID**：适用于一对多或多对多关系

```js
// 用户与订单：一对多关系
const userSchema = new mongoose.Schema({
  // ... 其他字段
});

const orderSchema = new mongoose.Schema({
  // ... 其他字段
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
```

3. **关系表**：适用于复杂的多对多关系

```js
// 用户与角色：多对多关系
const userRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  grantedAt: { type: Date, default: Date.now }
});
```

#### 查询参数设计

使用查询参数实现过滤、排序、分页和字段选择：

```js
/**
 * 高级查询处理示例
 */
app.get('/api/products', async (req, res) => {
  try {
    // 1. 构建查询条件
    const filter = {};
    
    // 过滤条件
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.minPrice && req.query.maxPrice) {
      filter.price = { 
        $gte: parseFloat(req.query.minPrice), 
        $lte: parseFloat(req.query.maxPrice) 
      };
    }
    
    // 2. 构建排序条件
    const sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      for (const field of sortFields) {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      }
    }
    
    // 3. 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 4. 字段选择
    const fields = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    
    // 5. 执行查询
    const products = await Product.find(filter)
      .select(fields)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // 获取总记录数
    const total = await Product.countDocuments(filter);
    
    // 6. 构建响应
    res.json({
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

查询参数示例：
```
/api/products?category=electronics&minPrice=100&maxPrice=500&sort=-price,name&page=2&limit=20&fields=name,price,category
```

#### 资源表述格式

设计一致的资源表述格式，通常使用JSON：

```js
// 单个资源响应结构
{
  "id": "6092df32a9d9d32a4c5c2bc7",
  "name": "Product Name",
  "price": 99.99,
  "category": "electronics",
  "createdAt": "2023-05-15T10:30:00Z",
  "updatedAt": "2023-05-16T08:15:30Z"
}

// 集合资源响应结构
{
  "data": [
    { /* 资源1 */ },
    { /* 资源2 */ }
  ],
  "pagination": {
    "total": 125,
    "page": 2,
    "limit": 20,
    "pages": 7
  },
  "links": {
    "self": "/api/products?page=2&limit=20",
    "first": "/api/products?page=1&limit=20",
    "prev": "/api/products?page=1&limit=20",
    "next": "/api/products?page=3&limit=20",
    "last": "/api/products?page=7&limit=20"
  }
}
```

通过遵循这些路由与资源建模原则，可以设计出结构清晰、易于理解和使用的RESTful API，为客户端开发人员提供一致且直观的接口体验。

## HTTP方法与语义

在RESTful API设计中，HTTP方法（也称为HTTP动词）定义了对资源执行的操作类型。合理使用这些方法可以创建语义明确、符合REST原则的API。

### 主要HTTP方法

#### GET - 获取资源

- **用途**：获取资源信息，不应修改任何数据
- **特性**：安全的、幂等的、可缓存的
- **成功状态码**：200 OK

```js
/**
 * GET方法示例 - 获取单个资源
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `No product found with ID: ${req.params.id}`
      });
    }
    
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET方法示例 - 获取资源集合
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### POST - 创建资源

- **用途**：创建新资源
- **特性**：非幂等的（多次调用会创建多个资源）
- **成功状态码**：201 Created

```js
/**
 * POST方法示例 - 创建新资源
 */
app.post('/api/products', async (req, res) => {
  try {
    // 验证请求数据
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details 
      });
    }
    
    // 创建新产品
    const newProduct = new Product({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 保存到数据库
    const savedProduct = await newProduct.save();
    
    // 返回201状态码和创建的资源
    res.status(201)
      .location(`/api/products/${savedProduct.id}`) // 设置Location头
      .json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### PUT - 更新资源（全量更新）

- **用途**：替换现有资源（更新所有字段）
- **特性**：幂等的（多次调用结果相同）
- **成功状态码**：200 OK 或 204 No Content

```js
/**
 * PUT方法示例 - 全量更新资源
 */
app.put('/api/products/:id', async (req, res) => {
  try {
    // 验证请求数据
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details 
      });
    }
    
    // 使用{new: true}返回更新后的文档
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 返回更新后的资源
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### PATCH - 部分更新资源

- **用途**：部分更新资源（只更新提供的字段）
- **特性**：应当是幂等的
- **成功状态码**：200 OK 或 204 No Content

```js
/**
 * PATCH方法示例 - 部分更新资源
 */
app.patch('/api/products/:id', async (req, res) => {
  try {
    // 验证部分更新的数据
    const { error } = validateProductUpdate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details 
      });
    }
    
    // 构建更新对象
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // 执行部分更新
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### DELETE - 删除资源

- **用途**：删除资源
- **特性**：幂等的（多次删除同一资源结果相同）
- **成功状态码**：204 No Content（常见）或 200 OK

```js
/**
 * DELETE方法示例 - 删除资源
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 返回204状态码，无内容
    res.status(204).end();
    
    // 或者返回200状态码和被删除的资源
    // res.status(200).json(deletedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 次要HTTP方法

除了主要的HTTP方法外，还有一些不太常用但在特定场景下有用的方法：

#### HEAD - 与GET类似，但只返回头信息

- **用途**：检查资源是否存在，获取元数据
- **特性**：安全的、幂等的、可缓存的
- **成功状态码**：200 OK

```js
/**
 * HEAD方法示例 - 检查资源是否存在
 */
app.head('/api/products/:id', async (req, res) => {
  try {
    const exists = await Product.exists({ _id: req.params.id });
    
    if (!exists) {
      return res.status(404).end();
    }
    
    // 设置相关头信息
    res.set('Resource-Type', 'Product');
    res.status(200).end();
  } catch (err) {
    res.status(500).end();
  }
});
```

#### OPTIONS - 获取资源支持的HTTP方法

- **用途**：查询资源支持的操作
- **特性**：安全的、幂等的
- **成功状态码**：200 OK

```js
/**
 * OPTIONS方法示例 - 返回支持的方法
 */
app.options('/api/products/:id', (req, res) => {
  res.set('Allow', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS');
  res.status(200).end();
});

app.options('/api/products', (req, res) => {
  res.set('Allow', 'GET, POST, OPTIONS');
  res.status(200).end();
});
```

### 安全性与幂等性

在选择HTTP方法时，理解安全性和幂等性的概念至关重要：

| 方法    | 安全性 | 幂等性 | 可缓存 |
|---------|-------|--------|-------|
| GET     | ✅ 是  | ✅ 是   | ✅ 是  |
| HEAD    | ✅ 是  | ✅ 是   | ✅ 是  |
| OPTIONS | ✅ 是  | ✅ 是   | ✅ 是  |
| PUT     | ❌ 否  | ✅ 是   | ❌ 否  |
| DELETE  | ❌ 否  | ✅ 是   | ❌ 否  |
| PATCH   | ❌ 否  | 应该是   | ❌ 否  |
| POST    | ❌ 否  | ❌ 否   | 条件性  |

- **安全方法**：不修改资源状态，只读操作
- **幂等方法**：多次重复执行产生相同的结果

### 自定义操作处理

某些操作难以用标准HTTP方法表示，如激活用户、处理支付等。处理这类操作的方法：

#### 1. 将操作建模为资源

```
POST /users/:id/activation  // 创建激活资源
GET /users/:id/activation   // 获取激活状态
```

#### 2. 使用查询参数

```
POST /users/:id?action=activate
```

#### 3. 使用功能性URL路径（不完全RESTful）

```
POST /users/:id/activate
```

示例实现：

```js
/**
 * 特殊操作示例 - 激活用户账户
 */
app.post('/api/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.active) {
      return res.status(400).json({ error: 'User already activated' });
    }
    
    // 执行激活操作
    user.active = true;
    user.activatedAt = new Date();
    await user.save();
    
    // 返回激活后的用户
    res.status(200).json({
      message: 'User activated successfully',
      user: {
        id: user._id,
        email: user.email,
        active: user.active,
        activatedAt: user.activatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

通过正确使用HTTP方法及其语义，可以创建直观、一致且符合RESTful原则的API，使客户端开发人员能够轻松理解和使用您的服务。

## 状态码与错误处理

HTTP状态码是RESTful API设计中至关重要的一部分，它们提供了关于请求处理结果的标准化信息。良好的错误处理机制能提升API的可用性和开发体验。

### 常用HTTP状态码

HTTP状态码分为五类，每一类都有其特定的含义：

#### 2xx - 成功

| 状态码 | 名称 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功（GET、PUT、PATCH） |
| 201 | Created | 资源创建成功（POST） |
| 204 | No Content | 请求成功但无返回内容（DELETE） |

#### 4xx - 客户端错误

| 状态码 | 名称 | 使用场景 |
|--------|------|---------|
| 400 | Bad Request | 请求格式错误、参数无效 |
| 401 | Unauthorized | 认证失败（未提供凭证或凭证无效） |
| 403 | Forbidden | 权限不足（已认证但无权限） |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 请求方法不支持 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求过于频繁（限流） |

#### 5xx - 服务器错误

| 状态码 | 名称 | 使用场景 |
|--------|------|---------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务暂时不可用 |
| 504 | Gateway Timeout | 网关超时 |

### 状态码使用示例

```js
/**
 * 状态码使用示例
 */
// 200 OK - 成功获取资源
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json(user);
});

// 201 Created - 成功创建资源
app.post('/api/users', async (req, res) => {
  const newUser = await new User(req.body).save();
  res
    .status(201)
    .location(`/api/users/${newUser.id}`)
    .json(newUser);
});

// 204 No Content - 成功但无返回内容
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// 400 Bad Request - 请求格式错误
app.post('/api/orders', async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid order data provided',
      details: error.details
    });
  }
  // 处理请求...
});

// 401 Unauthorized - 认证失败
app.get('/api/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is required'
    });
  }
  // 验证token...
});

// 403 Forbidden - 权限不足
app.delete('/api/articles/:id', async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (article.authorId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to delete this article'
    });
  }
  // 处理删除...
});
```

### 统一错误响应格式

为了提供一致的错误处理体验，应该设计统一的错误响应格式：

```js
/**
 * 错误响应对象
 * @typedef {Object} ErrorResponse
 * @property {string} error - 错误类型
 * @property {string} message - 用户友好的错误消息
 * @property {string} [code] - 错误代码（可选）
 * @property {Object} [details] - 详细错误信息（可选）
 * @property {string} [stack] - 错误堆栈（仅开发环境）
 */

/**
 * 发送错误响应
 * @param {import('express').Response} res - Express响应对象
 * @param {number} statusCode - HTTP状态码
 * @param {string} error - 错误类型
 * @param {string} message - 错误消息
 * @param {Object} [options] - 附加选项
 * @param {string} [options.code] - 错误代码
 * @param {Object} [options.details] - 详细错误信息
 * @param {Error} [options.err] - 原始错误对象（用于开发环境显示堆栈）
 */
function sendErrorResponse(res, statusCode, error, message, options = {}) {
  const { code, details, err } = options;
  
  const errorResponse = {
    error,
    message,
    ...(code && { code }),
    ...(details && { details })
  };
  
  // 在开发环境中包含堆栈信息
  if (process.env.NODE_ENV === 'development' && err) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
}
```

### 集中式错误处理中间件

在Express.js中，可以使用中间件实现集中式错误处理：

```js
/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 默认错误状态码和消息
  let statusCode = err.statusCode || 500;
  let errorType = 'Internal Server Error';
  let errorMessage = err.message || 'Something went wrong';
  let errorDetails = err.details;
  let errorCode = err.code;
  
  // 根据错误类型设置适当的状态码和消息
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'Validation Error';
    errorDetails = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorType = 'Invalid ID';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'Authentication Error';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'Token Expired';
  } else if (err.code === 11000) { // MongoDB重复键错误
    statusCode = 409;
    errorType = 'Duplicate Error';
    errorMessage = 'A resource with the same unique field already exists';
  }
  
  // 记录错误日志
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    statusCode,
    errorType,
    message: errorMessage,
    ...(errorDetails && { details: errorDetails }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
  
  // 发送错误响应
  sendErrorResponse(res, statusCode, errorType, errorMessage, {
    code: errorCode,
    details: errorDetails,
    err: err
  });
};

// 注册全局错误处理中间件（必须在路由之后）
app.use(errorHandler);
```

### 自定义错误类

创建自定义错误类可以使错误处理更加系统化：

```js
/**
 * 应用基础错误类
 */
class AppError extends Error {
  /**
   * 创建应用错误
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP状态码
   * @param {string} [code] - 自定义错误代码
   * @param {Object} [details] - 错误详情
   */
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - 验证错误
 */
class ValidationError extends AppError {
  constructor(message, details) {
    super(message || 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - 认证错误
 */
class AuthenticationError extends AppError {
  constructor(message) {
    super(message || 'Authentication required', 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 403 Forbidden - 权限错误
 */
class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Insufficient permissions', 403, 'FORBIDDEN_ERROR');
  }
}

/**
 * 404 Not Found - 资源不存在
 */
class NotFoundError extends AppError {
  constructor(resource, id) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

/**
 * 409 Conflict - 资源冲突
 */
class ConflictError extends AppError {
  constructor(message, details) {
    super(message || 'Resource conflict', 409, 'CONFLICT_ERROR', details);
  }
}

/**
 * 429 Too Many Requests - 请求过多
 */
class TooManyRequestsError extends AppError {
  constructor(message) {
    super(
      message || 'Too many requests, please try again later',
      429,
      'RATE_LIMIT_ERROR'
    );
  }
}
```

### 实际使用自定义错误

```js
/**
 * 使用自定义错误示例
 */
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new NotFoundError('Product', req.params.id);
    }
    
    res.json(product);
  } catch (err) {
    // 将错误传递给错误处理中间件
    next(err);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      throw new ValidationError('Invalid product data', error.details);
    }
    
    // 检查产品名称是否已存在
    const existingProduct = await Product.findOne({ name: req.body.name });
    if (existingProduct) {
      throw new ConflictError('Product name already exists');
    }
    
    const newProduct = await new Product(req.body).save();
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// 需要认证的接口
app.get('/api/protected', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      throw new AuthenticationError('Invalid token');
    }
    
    // 权限检查
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
    
    res.json({ message: 'Protected data accessed successfully' });
  } catch (err) {
    next(err);
  }
});
```

### 异步错误处理优化

为了避免编写大量的try-catch代码块，可以创建异步处理包装器：

```js
/**
 * 异步处理包装器
 * @param {Function} fn - 异步控制器函数
 * @returns {Function} Express中间件函数
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 使用异步处理包装器简化代码
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new NotFoundError('Product', req.params.id);
  }
  
  res.json(product);
}));
```

### 错误日志记录

生产环境中应有详细的错误日志：

```js
/**
 * 错误日志记录
 */
const winston = require('winston');
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 增强错误处理中间件
const enhancedErrorHandler = (err, req, res, next) => {
  // 记录详细错误信息
  logger.error({
    message: err.message,
    error: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    requestId: req.id, // 假设使用了请求ID中间件
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user.id : 'anonymous'
  });
  
  // 处理错误响应...
};
```

通过使用统一的状态码和错误处理模式，API可以提供清晰、一致的错误信息，帮助客户端开发人员理解和解决问题，提高整体开发体验和应用可靠性。

## API版本管理

API版本管理是RESTful API设计中的重要部分，它允许API演进和改进的同时保持向后兼容性。有效的版本管理策略能够确保现有客户端继续正常运作，同时让新客户端可以利用新特性。

### 版本管理的必要性

API版本管理的主要原因包括：

1. **向后兼容性**: 保护现有客户端不受破坏性变更的影响
2. **新功能开发**: 允许添加新特性而不影响现有功能
3. **技术迁移**: 在底层技术变更时保持API稳定
4. **淘汰过时功能**: 提供机制逐步淘汰旧版本

### 版本控制策略

以下是几种常见的API版本控制策略：

#### 1. URL路径版本控制

在URL路径中嵌入版本号，这是最直观和常用的方法：

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**实现示例**：

```js
/**
 * URL路径版本控制
 */
const express = require('express');
const app = express();

// v1 API路由
const v1Routes = express.Router();
v1Routes.get('/users', (req, res) => {
  // v1版本逻辑
  res.json({ version: 'v1', users: [/* ... */] });
});

// v2 API路由
const v2Routes = express.Router();
v2Routes.get('/users', (req, res) => {
  // v2版本逻辑 - 例如添加了分页
  const { page = 1, limit = 10 } = req.query;
  res.json({
    version: 'v2',
    meta: { page: Number(page), limit: Number(limit) },
    users: [/* ... */]
  });
});

// 注册版本化路由
app.use('/v1', v1Routes);
app.use('/v2', v2Routes);
```

**优点**：
- 简单直观，易于实现和理解
- 允许不同版本使用完全不同的代码库
- 客户端可以轻松指定所需的API版本

**缺点**：
- URL不应表示资源的实现细节（版本是API的实现细节）
- 需要客户端修改代码以迁移到新版本
- 可能导致代码重复

#### 2. 请求头版本控制

通过自定义HTTP头指定API版本：

```
Accept: application/json
API-Version: 2
```

或使用媒体类型（Media Type）版本控制：

```
Accept: application/vnd.example.v2+json
```

**实现示例**：

```js
/**
 * 请求头版本控制
 */
app.get('/users', (req, res) => {
  // 方法1: 自定义头
  const version = req.headers['api-version'] || '1';
  
  // 方法2: 内容协商
  // const acceptHeader = req.headers['accept'];
  // const match = acceptHeader && acceptHeader.match(/application\/vnd\.example\.v(\d+)\+json/);
  // const version = match ? match[1] : '1';
  
  if (version === '1') {
    // v1版本逻辑
    return res.json({ version: 'v1', users: [/* ... */] });
  } else if (version === '2') {
    // v2版本逻辑
    const { page = 1, limit = 10 } = req.query;
    return res.json({
      version: 'v2',
      meta: { page: Number(page), limit: Number(limit) },
      users: [/* ... */]
    });
  }
  
  // 不支持的版本
  res.status(400).json({
    error: 'Invalid Version',
    message: `API version ${version} is not supported`
  });
});

// 更优雅的实现：使用中间件解析版本
function versionMiddleware(req, res, next) {
  // 自定义头
  let version = req.headers['api-version'];
  
  // 或从Accept头解析
  if (!version) {
    const acceptHeader = req.headers['accept'];
    const match = acceptHeader && acceptHeader.match(/application\/vnd\.example\.v(\d+)\+json/);
    version = match ? match[1] : '1'; // 默认为v1
  }
  
  req.apiVersion = version;
  next();
}

app.use(versionMiddleware);
```

**优点**：
- 不污染URL（URL保持简洁）
- 符合HTTP协议的内容协商原则
- 不需要在路由层分离代码

**缺点**：
- 对客户端来说不那么直观
- 更难测试（需要设置HTTP头）
- 一些缓存代理可能忽略自定义头

#### 3. 查询参数版本控制

通过URL查询参数指定版本：

```
https://api.example.com/users?version=2
```

**实现示例**：

```js
/**
 * 查询参数版本控制
 */
app.get('/users', (req, res) => {
  const version = req.query.version || '1';
  
  if (version === '1') {
    // v1版本逻辑
    return res.json({ version: 'v1', users: [/* ... */] });
  } else if (version === '2') {
    // v2版本逻辑
    const { page = 1, limit = 10 } = req.query;
    return res.json({
      version: 'v2',
      meta: { page: Number(page), limit: Number(limit) },
      users: [/* ... */]
    });
  }
  
  // 不支持的版本
  res.status(400).json({
    error: 'Invalid Version',
    message: `API version ${version} is not supported`
  });
});
```

**优点**：
- 简单易用
- 不需要额外的HTTP头
- 易于缓存和分享

**缺点**：
- 污染URL
- 与其他查询参数混合可能导致混淆
- 违反REST原则，查询参数通常用于过滤和分页

### 版本策略的比较

| 策略 | 可见性 | 易用性 | REST合规性 | 缓存友好性 |
|------|--------|--------|------------|------------|
| URL路径 | 高 | 高 | 中 | 高 |
| HTTP头 | 低 | 中 | 高 | 中 |
| 查询参数 | 高 | 高 | 低 | 高 |

### 版本路由实现方案

对于大型项目，可以实现更结构化的版本控制：

```js
/**
 * 结构化版本路由实现
 */
const express = require('express');
const app = express();

// 版本控制器
class VersionController {
  constructor() {
    this.handlers = {};
  }
  
  // 注册版本处理器
  register(version, handler) {
    this.handlers[version] = handler;
  }
  
  // 创建Express处理中间件
  middleware() {
    return (req, res, next) => {
      // 获取请求版本（可以从URL、头或查询参数获取）
      const version = this.getRequestVersion(req);
      
      // 查找对应的处理器
      const handler = this.handlers[version] || this.handlers['default'];
      
      if (handler) {
        return handler(req, res, next);
      }
      
      // 版本不支持
      res.status(400).json({
        error: 'Unsupported Version',
        message: `API version ${version} is not supported`
      });
    };
  }
  
  // 获取请求版本的通用方法（可以根据项目需求调整）
  getRequestVersion(req) {
    // 1. 从URL路径中提取（假设格式为 /v{n}/...）
    const pathVersion = req.path.split('/')[1];
    if (pathVersion && pathVersion.match(/^v\d+$/)) {
      return pathVersion.substring(1); // 移除 'v' 前缀
    }
    
    // 2. 从自定义头中提取
    const headerVersion = req.headers['api-version'];
    if (headerVersion) {
      return headerVersion;
    }
    
    // 3. 从Accept头中提取
    const acceptHeader = req.headers['accept'];
    const match = acceptHeader && acceptHeader.match(/application\/vnd\.example\.v(\d+)\+json/);
    if (match) {
      return match[1];
    }
    
    // 4. 从查询参数中提取
    const queryVersion = req.query.version;
    if (queryVersion) {
      return queryVersion;
    }
    
    // 5. 默认版本
    return 'default';
  }
}

// 用法示例
const userController = new VersionController();

// 注册v1处理器
userController.register('1', (req, res) => {
  res.json({ version: 'v1', users: [/* ... */] });
});

// 注册v2处理器
userController.register('2', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  res.json({
    version: 'v2',
    meta: { page: Number(page), limit: Number(limit) },
    users: [/* ... */]
  });
});

// 注册默认处理器（回退到最新版本或最稳定版本）
userController.register('default', (req, res) => {
  // 默认使用v1
  res.json({ version: 'v1', users: [/* ... */] });
});

// 应用控制器中间件
app.get('/users', userController.middleware());
```

### 版本管理的最佳实践

1. **选择一致的版本控制策略**：在整个API中使用相同的版本控制方法

2. **语义化版本号**：考虑使用语义化版本（Semantic Versioning）
   ```
   主版本.次版本.修订版本 (MAJOR.MINOR.PATCH)
   ```
   - 不兼容的API更改 → 增加主版本号
   - 向后兼容的新功能 → 增加次版本号
   - 向后兼容的问题修复 → 增加修订版本号

3. **明确的版本淘汰政策**：
   ```js
   /**
    * 版本弃用通知
    */
   app.use('/v1', (req, res, next) => {
     // 添加弃用警告头
     res.set({
       'X-API-Warn': 'This API version is deprecated and will be removed on 2024-12-31',
       'X-API-Docs': 'https://api.example.com/docs/migration-to-v2'
     });
     next();
   }, v1Routes);
   ```

4. **版本共存**：维护多个活跃版本，给客户端足够时间迁移

5. **文档与变更日志**：为每个版本提供完整文档和变更说明

6. **抽象共享代码**：跨版本共享核心业务逻辑，仅在接口层处理版本差异

### 实现跨版本代码复用

避免代码重复的技巧：

```js
/**
 * 跨版本代码复用
 */
// 共享业务逻辑层
const userService = {
  // 基础用户查询逻辑（所有版本共享）
  findUsers: async (options = {}) => {
    const { page = 1, limit = 10, sort = 'createdAt' } = options;
    // 数据库查询逻辑...
    return {
      users: [/* ... */],
      pagination: { page, limit, total: 100 }
    };
  }
};

// V1 API实现
app.get('/v1/users', async (req, res) => {
  // v1简单实现
  const result = await userService.findUsers();
  // 转换为v1响应格式
  res.json({ users: result.users });
});

// V2 API实现
app.get('/v2/users', async (req, res) => {
  // v2添加了分页
  const { page = 1, limit = 10, sort } = req.query;
  const result = await userService.findUsers({ page, limit, sort });
  
  // 转换为v2响应格式（包含分页信息）
  res.json({
    data: result.users,
    meta: result.pagination
  });
});
```

通过这种方式，业务逻辑只实现一次，而API层处理不同版本的表示和行为差异。

### API网关中的版本管理

对于大型项目，可以使用API网关进行版本路由：

```js
/**
 * API网关版本路由
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// API网关配置
const gatewayConfig = {
  // v1路由到旧API服务器
  'v1': {
    target: 'http://legacy-api.internal:3000',
    pathRewrite: { '^/v1': '' }
  },
  // v2路由到新API服务器
  'v2': {
    target: 'http://new-api.internal:3001',
    pathRewrite: { '^/v2': '' }
  }
};

// 为每个版本设置代理
Object.entries(gatewayConfig).forEach(([version, config]) => {
  app.use(`/${version}`, createProxyMiddleware(config));
});

// 默认版本（重定向到最新版本）
app.use('/', (req, res) => {
  res.redirect(`/v2${req.path}`);
});

app.listen(8080, () => {
  console.log('API Gateway running on port 8080');
});
```

这种方法允许完全分离不同版本的代码和部署，同时为客户端提供一致的入口点。

通过实施有效的API版本策略，可以在不破坏现有客户端的情况下持续改进API，确保系统能够平稳演进。

## 实战建议与最佳实践

RESTful API设计不仅需要遵循基本原则，还应考虑安全性、性能、可用性和文档等实际问题。以下是在Node.js环境中构建高质量RESTful API的实战建议和最佳实践。

### 安全性最佳实践

安全性是API设计中的关键考虑因素，应贯穿整个开发周期。

#### 1. 身份验证与授权

```js
/**
 * JWT身份验证
 */
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

// 身份验证中间件
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // 验证token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // 将用户信息附加到请求对象
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

// 角色授权中间件
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户凭据（示例）
  const user = await User.findOne({ username });
  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid username or password'
    });
  }
  
  // 生成JWT
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // 响应包含token
  res.json({
    token,
    expiresIn: 3600,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
});

// 受保护的路由
app.get('/api/users', authenticate, authorize(['admin']), async (req, res) => {
  const users = await User.find({});
  res.json(users);
});
```

#### 2. 输入验证和清理

```js
/**
 * 输入验证
 */
const { body, validationResult } = require('express-validator');

// 用户创建验证规则
const validateCreateUser = [
  body('username')
    .notEmpty().withMessage('用户名必填')
    .isLength({ min: 3, max: 30 }).withMessage('用户名长度应在3-30个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
    
  body('email')
    .notEmpty().withMessage('邮箱必填')
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('密码必填')
    .isLength({ min: 8 }).withMessage('密码长度最少8个字符')
    .matches(/\d/).withMessage('密码必须包含数字')
    .matches(/[a-z]/).withMessage('密码必须包含小写字母')
    .matches(/[A-Z]/).withMessage('密码必须包含大写字母')
    .matches(/[^a-zA-Z0-9]/).withMessage('密码必须包含特殊字符'),
    
  // 验证结果处理中间件
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }
    next();
  }
];

// 应用验证规则
app.post('/api/users', validateCreateUser, async (req, res) => {
  // 输入已验证，可以安全处理
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
});
```

#### 3. 防止常见攻击

```js
/**
 * 安全头设置
 */
const helmet = require('helmet');
app.use(helmet()); // 设置安全相关的HTTP头

/**
 * 速率限制 - 防止暴力攻击
 */
const rateLimit = require('express-rate-limit');

// 登录限制器
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 5, // 每个IP限制5次请求
  message: {
    error: 'Too Many Requests',
    message: '登录尝试次数过多，请15分钟后再试'
  }
});

// 应用于登录路由
app.post('/api/login', loginLimiter, loginController);

// API一般限制器
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: 60, // 每个IP每分钟60次请求
  message: {
    error: 'Too Many Requests',
    message: '请求频率过高，请稍后再试'
  }
});

// 应用于所有API路由
app.use('/api', apiLimiter);

/**
 * CORS配置
 */
const cors = require('cors');

// 配置CORS选项
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'https://example.com',
      'https://www.example.com'
    ];
    // 允许在开发环境中没有来源（如Postman请求）
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS不允许此来源访问'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'], // 暴露给客户端的响应头
  credentials: true, // 允许携带凭证（cookies）
  maxAge: 86400 // 预检请求缓存24小时
};

app.use(cors(corsOptions));
```

#### 4. 敏感数据保护

```js
/**
 * 敏感数据处理
 */
// 用户模型
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  // 其他字段...
});

// 密码哈希中间件
userSchema.pre('save', async function(next) {
  // 仅当密码被修改时才重新哈希
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值并哈希密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 转换为JSON时排除敏感字段
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  // 删除敏感字段
  delete userObject.password;
  // 可能还需要删除其他敏感信息
  return userObject;
};
```

### 性能优化

构建高性能API需要注意以下几个方面：

#### 1. 分页、过滤和排序

```js
/**
 * 高级列表API
 */
app.get('/api/products', async (req, res) => {
  try {
    // 解析查询参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || '-createdAt'; // 默认按创建时间降序
    
    // 构建过滤条件
    const filter = {};
    
    // 处理价格范围过滤
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // 处理类别过滤
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // 处理搜索查询
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ];
    }
    
    // 计算跳过的文档数量
    const skip = (page - 1) * limit;
    
    // 查询数据库
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // 计算总页数
    const totalPages = Math.ceil(total / limit);
    
    // 设置分页头
    res.set({
      'X-Total-Count': total,
      'X-Total-Pages': totalPages,
      'X-Current-Page': page
    });
    
    // 返回结果
    res.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages
      },
      links: {
        self: `/api/products?page=${page}&limit=${limit}`,
        ...(page > 1 && { prev: `/api/products?page=${page-1}&limit=${limit}` }),
        ...(page < totalPages && { next: `/api/products?page=${page+1}&limit=${limit}` }),
        first: `/api/products?page=1&limit=${limit}`,
        last: `/api/products?page=${totalPages}&limit=${limit}`
      }
    });
  } catch (err) {
    next(err);
  }
});
```

#### 2. 缓存策略

```js
/**
 * API响应缓存
 */
const mcache = require('memory-cache');

// 缓存中间件
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // 根据URL和查询参数创建缓存键
    const key = `__express__${req.originalUrl || req.url}`;
    
    // 检查缓存
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      // 返回缓存的响应
      res.send(cachedBody);
      return;
    }
    
    // 重写res.send方法来缓存响应
    const originalSend = res.send;
    res.send = function(body) {
      // 只缓存成功的响应
      if (res.statusCode === 200) {
        mcache.put(key, body, duration * 1000);
      }
      originalSend.call(this, body);
    };
    
    next();
  };
};

// 应用缓存中间件 - 缓存产品列表60秒
app.get('/api/products', cacheMiddleware(60), productsController.getProducts);

/**
 * HTTP缓存控制
 */
// 缓存控制中间件
const cacheControl = (maxAge) => {
  return (req, res, next) => {
    // 设置缓存控制头
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

// 不同路由使用不同的缓存策略
app.get('/api/products/:id', cacheControl(3600), productsController.getProduct); // 缓存1小时
app.get('/api/categories', cacheControl(86400), categoriesController.getCategories); // 缓存1天
```

#### 3. 数据库优化

```js
/**
 * 高效查询
 */
// 创建必要的索引
const productSchema = new mongoose.Schema({
  name: { type: String, index: true },
  price: { type: Number, index: true },
  category: { type: String, index: true },
  tags: [{ type: String, index: true }],
  createdAt: { type: Date, default: Date.now, index: true }
});

// 选择性字段投影
app.get('/api/products', async (req, res) => {
  // 解析客户端请求的字段
  const fields = req.query.fields ? req.query.fields.split(',').join(' ') : '';
  
  const products = await Product.find({})
    .select(fields || 'name price category') // 默认仅返回基本字段
    .lean();
    
  res.json(products);
});

// 批量操作
app.post('/api/products/batch', async (req, res) => {
  const { operations } = req.body;
  
  // 使用bulkWrite进行批量操作
  const result = await Product.bulkWrite(
    operations.map(op => {
      if (op.type === 'insert') {
        return {
          insertOne: { document: op.data }
        };
      } else if (op.type === 'update') {
        return {
          updateOne: {
            filter: { _id: op.id },
            update: { $set: op.data }
          }
        };
      } else if (op.type === 'delete') {
        return {
          deleteOne: { filter: { _id: op.id } }
        };
      }
    })
  );
  
  res.json({ result });
});
```

### API文档与自动化

良好的文档对于API采用至关重要，应确保文档始终与实际API保持同步。

#### 1. OpenAPI/Swagger文档

```js
/**
 * Swagger集成
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '产品API',
      version: '1.0.0',
      description: '产品管理RESTful API'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '开发服务器'
      },
      {
        url: 'https://api.example.com',
        description: '生产服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'] // API路由文件的位置
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 设置Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 以JSON格式提供OpenAPI规范
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
```

在路由文件中添加Swagger注释：

```js
/**
 * @swagger
 * /products:
 *   get:
 *     summary: 获取产品列表
 *     description: 返回分页的产品列表，支持过滤和排序。
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页项目数
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: 排序字段和方向 (例如: -price表示价格降序)
 *     responses:
 *       200:
 *         description: 成功响应
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/products', productController.getProducts);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: 产品ID
 *         name:
 *           type: string
 *           description: 产品名称
 *         description:
 *           type: string
 *           description: 产品描述
 *         price:
 *           type: number
 *           description: 产品价格
 *         category:
 *           type: string
 *           description: 产品类别
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: 总项目数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         limit:
 *           type: integer
 *           description: 每页项目数
 *         totalPages:
 *           type: integer
 *           description: 总页数
 */
```

#### 2. 自动化测试

```js
/**
 * API测试
 */
// test/api/products.test.js
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('产品API', () => {
  // 测试前准备
  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.TEST_DB_URI);
    // 清空测试数据
    await Product.deleteMany({});
  });
  
  // 测试后清理
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  // 测试创建产品
  describe('POST /api/products', () => {
    it('应该创建新产品', async () => {
      const productData = {
        name: '测试产品',
        description: '测试描述',
        price: 99.99,
        category: '测试'
      };
      
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(productData)
        .expect(201);
        
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(productData.name);
      expect(res.body.price).toBe(productData.price);
    });
    
    it('应拒绝无效数据', async () => {
      const invalidData = {
        description: '缺少名称和价格'
      };
      
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
        
      expect(res.body).toHaveProperty('error', 'Validation Error');
    });
  });
  
  // 测试获取产品列表
  describe('GET /api/products', () => {
    it('应返回产品列表', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);
        
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total');
    });
    
    it('应支持分页', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=5')
        .expect(200);
        
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
    });
  });
});
```

---

> 参考资料：[RESTful API设计指南](https://restfulapi.net/) 

### 日志记录和监控

有效的日志记录对于问题诊断和性能监控至关重要。

#### 1. 结构化日志

```js
/**
 * 结构化日志
 */
const winston = require('winston');

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'product-api' },
  transports: [
    // 写入所有日志到文件
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 请求日志中间件
const requestLogger = (req, res, next) => {
  // 生成唯一请求ID
  req.id = crypto.randomUUID();
  
  // 记录请求开始
  const startTime = Date.now();
  
  // 记录原始URL和方法
  const requestLog = {
    id: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };
  
  // 如果有认证用户，记录用户ID
  if (req.user) {
    requestLog.userId = req.user.id;
  }
  
  logger.info(`API请求开始`, requestLog);
  
  // 在响应完成时记录结果
  res.on('finish', () => {
    const responseLog = {
      id: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime
    };
    
    // 根据状态码调整日志级别
    const logLevel = res.statusCode >= 500 ? 'error' :
                     res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`API请求完成`, responseLog);
  });
  
  next();
};

// 应用请求日志中间件
app.use(requestLogger);
```

#### 2. API性能监控

```js
/**
 * API性能监控
 */
const promClient = require('prom-client');
const responseTime = require('response-time');

// 创建一个注册表
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// 创建HTTP请求计数器
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'HTTP请求总数',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// 创建HTTP请求持续时间直方图
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP请求持续时间分布',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// API监控中间件
app.use((req, res, next) => {
  // 获取路由路径（如果有）
  const route = req.route ? req.route.path : req.path;
  
  // 使用response-time中间件测量响应时间
  responseTime((req, res, time) => {
    // 增加请求计数
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
    
    // 记录请求持续时间
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode
      },
      time / 1000 // 转换为秒
    );
  })(req, res, next);
});

// 提供Prometheus指标端点
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});
```

#### 3. 健康检查端点

```js
/**
 * 健康检查和就绪状态
 */
app.get('/health', (req, res) => {
  // 检查API是否正常运行
  res.status(200).json({ status: 'up' });
});

app.get('/ready', async (req, res) => {
  try {
    // 检查关键依赖
    
    // 1. 数据库连接
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // 2. 其他关键服务（例如Redis、外部API等）
    const redisStatus = await checkRedisConnection();
    const externalApiStatus = await checkExternalApi();
    
    const allSystemsOperational = dbStatus === 'connected' && 
                                redisStatus === 'connected' &&
                                externalApiStatus === 'available';
    
    res.status(allSystemsOperational ? 200 : 503).json({
      status: allSystemsOperational ? 'ready' : 'not_ready',
      checks: {
        database: dbStatus,
        redis: redisStatus,
        externalApi: externalApiStatus
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '健康检查执行失败',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});
```

### 高级设计模式

以下是一些用于构建可扩展API的高级设计模式。

#### 1. 控制器-服务-仓库模式

这种架构模式将应用分为三层，每层有明确的职责：

- **仓库层(Repository)**: 负责数据访问逻辑
- **服务层(Service)**: 处理业务逻辑
- **控制器层(Controller)**: 处理HTTP请求和响应

##### 仓库层实现

仓库层负责与数据库交互，封装所有数据访问逻辑：

```js
// src/repositories/productRepository.js
class ProductRepository {
  /**
   * 查找所有产品
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 产品列表
   */
  async findAll(options) {
    const { filter, sort, skip, limit } = options;
    return Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }
  
  /**
   * 根据ID查找产品
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 产品对象
   */
  async findById(id) {
    return Product.findById(id).lean();
  }
  
  /**
   * 创建新产品
   * @param {Object} data - 产品数据
   * @returns {Promise<Object>} 创建的产品
   */
  async create(data) {
    const product = new Product(data);
    return product.save();
  }
  
  /**
   * 更新产品
   * @param {string} id - 产品ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的产品
   */
  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    });
  }
  
  /**
   * 删除产品
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 删除的产品
   */
  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
  
  /**
   * 计算产品数量
   * @param {Object} filter - 过滤条件
   * @returns {Promise<number>} 产品数量
   */
  async count(filter) {
    return Product.countDocuments(filter);
  }
}

module.exports = ProductRepository;
```

##### 服务层实现

服务层包含业务逻辑，协调仓库层的数据访问：

```js
// src/services/productService.js
class ProductService {
  /**
   * 构造函数
   * @param {ProductRepository} productRepository - 产品仓库实例
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }
  
  /**
   * 获取产品列表
   * @param {Object} queryParams - 查询参数
   * @returns {Promise<Object>} 包含产品和分页信息的对象
   */
  async getProducts(queryParams) {
    // 处理业务逻辑
    const { page = 1, limit = 20, sort = '-createdAt', ...filters } = queryParams;
    
    // 构建过滤条件
    const filter = this.buildFilter(filters);
    
    // 计算分页
    const skip = (page - 1) * limit;
    
    // 并行查询数据和总数
    const [products, total] = await Promise.all([
      this.productRepository.findAll({ filter, sort, skip, limit }),
      this.productRepository.count(filter)
    ]);
    
    // 计算分页元数据
    const totalPages = Math.ceil(total / limit);
    
    return {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    };
  }
  
  /**
   * 根据ID获取产品
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 产品对象
   */
  async getProductById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }
    return product;
  }
}

module.exports = ProductService;
```

##### 服务层的产品管理方法

服务层还包含创建、更新和删除产品的业务逻辑：

```js
// src/services/productService.js 的额外方法
class ProductService {
  // ... 前面的方法
  
  /**
   * 创建新产品
   * @param {Object} data - 产品数据
   * @returns {Promise<Object>} 创建的产品
   */
  async createProduct(data) {
    // 业务逻辑验证
    await this.validateProduct(data);
    return this.productRepository.create(data);
  }
  
  /**
   * 更新产品
   * @param {string} id - 产品ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的产品
   */
  async updateProduct(id, data) {
    // 确认产品存在
    const exists = await this.productRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Product', id);
    }
    
    // 业务逻辑验证
    await this.validateProduct(data, id);
    
    return this.productRepository.update(id, data);
  }
  
  /**
   * 删除产品
   * @param {string} id - 产品ID
   * @returns {Promise<Object>} 删除的产品
   */
  async deleteProduct(id) {
    // 确认产品存在
    const exists = await this.productRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Product', id);
    }
    
    // 检查是否可以删除（例如，检查依赖关系）
    await this.canDeleteProduct(id);
    
    return this.productRepository.delete(id);
  }
}
```

##### 服务层的辅助方法

服务层的私有辅助方法用于验证和过滤：

```js
// src/services/productService.js 的辅助方法
class ProductService {
  // ... 前面的方法
  
  /**
   * 验证产品数据
   * @param {Object} data - 产品数据
   * @param {string} [id] - 产品ID（更新时）
   * @returns {Promise<void>}
   */
  async validateProduct(data, id = null) {
    // 例如，检查产品名称是否唯一
    if (data.name) {
      const nameFilter = { name: data.name };
      if (id) nameFilter._id = { $ne: id }; // 更新时排除自身
      
      const existingProduct = await this.productRepository.findAll({
        filter: nameFilter,
        limit: 1
      });
      
      if (existingProduct.length > 0) {
        throw new ConflictError('产品名称已存在');
      }
    }
  }
  
  /**
   * 检查产品是否可以删除
   * @param {string} id - 产品ID
   * @returns {Promise<void>}
   */
  async canDeleteProduct(id) {
    // 检查是否存在订单使用此产品
    const ordersWithProduct = await Order.countDocuments({
      'items.product': id
    });
    
    if (ordersWithProduct > 0) {
      throw new ConflictError('无法删除已被订单引用的产品');
    }
  }
  
  /**
   * 构建过滤条件
   * @param {Object} filters - 过滤参数
   * @returns {Object} 过滤条件对象
   */
  buildFilter(filters) {
    const filter = {};
    
    // 处理价格范围
    if (filters.minPrice || filters.maxPrice) {
      filter.price = {};
      if (filters.minPrice) filter.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) filter.price.$lte = parseFloat(filters.maxPrice);
    }
    
    // 处理类别
    if (filters.category) {
      filter.category = filters.category;
    }
    
    // 处理搜索查询
    if (filters.q) {
      filter.$or = [
        { name: { $regex: filters.q, $options: 'i' } },
        { description: { $regex: filters.q, $options: 'i' } }
      ];
    }
    
    return filter;
  }
}
```

##### 控制器层实现

控制器层处理HTTP请求和响应，委托业务逻辑给服务层：

```js
// src/controllers/productController.js
class ProductController {
  /**
   * 构造函数
   * @param {ProductService} productService - 产品服务实例
   */
  constructor(productService) {
    this.productService = productService;
  }
  
  /**
   * 获取产品列表
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  getProducts = asyncHandler(async (req, res) => {
    const result = await this.productService.getProducts(req.query);
    
    // 设置分页头
    res.set({
      'X-Total-Count': result.pagination.total,
      'X-Total-Pages': result.pagination.totalPages,
      'X-Current-Page': result.pagination.page
    });
    
    res.json({
      data: result.products,
      meta: result.pagination
    });
  });
  
  /**
   * 获取单个产品
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  getProductById = asyncHandler(async (req, res) => {
    const product = await this.productService.getProductById(req.params.id);
    res.json(product);
  });
}
```

##### 控制器层的产品管理方法

控制器层包含处理产品创建、更新和删除的方法：

```js
// src/controllers/productController.js 的额外方法
class ProductController {
  // ... 前面的方法
  
  /**
   * 创建产品
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  createProduct = asyncHandler(async (req, res) => {
    const product = await this.productService.createProduct(req.body);
    res.status(201)
      .location(`/api/products/${product._id}`)
      .json(product);
  });
  
  /**
   * 更新产品
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  updateProduct = asyncHandler(async (req, res) => {
    const product = await this.productService.updateProduct(req.params.id, req.body);
    res.json(product);
  });
  
  /**
   * 删除产品
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  deleteProduct = asyncHandler(async (req, res) => {
    await this.productService.deleteProduct(req.params.id);
    res.status(204).end();
  });
}
```

##### 连接各层

将所有层连接起来，构建完整的控制器-服务-仓库架构：

```js
// 依赖注入和路由配置
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// 路由配置
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', validateCreateProduct, productController.createProduct);
router.put('/products/:id', validateUpdateProduct, productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
```

#### 2. 模块化和代码组织

推荐的文件结构：

```
src/
├── config/               # 配置文件
│   ├── database.js       # 数据库配置
│   ├── server.js         # 服务器配置
│   └── logger.js         # 日志配置
├── controllers/          # API控制器
│   ├── userController.js
│   └── productController.js
├── services/             # 业务逻辑服务
│   ├── userService.js
│   └── productService.js
├── repositories/         # 数据访问层
│   ├── userRepository.js
│   └── productRepository.js
├── models/               # 数据模型
│   ├── User.js
│   └── Product.js
├── routes/               # API路由定义
│   ├── userRoutes.js
│   └── productRoutes.js
├── middleware/           # 中间件
│   ├── auth.js
│   ├── error.js
│   └── validate.js
├── utils/                # 工具函数
│   ├── asyncHandler.js
│   └── apiResponse.js
├── validators/           # 验证规则
│   ├── userValidator.js
│   └── productValidator.js
├── errors/               # 自定义错误类
│   └── index.js
├── app.js                # Express应用设置
└── server.js             # 主入口点
```

#### 3. Feature Flags（功能标志）

功能标志允许逐步推出新功能或A/B测试：

```js
/**
 * 功能标志实现
 */
const featureFlags = {
  // 从环境变量、数据库或配置服务加载
  ENABLE_NEW_PRICING_API: process.env.ENABLE_NEW_PRICING_API === 'true',
  ENABLE_ADVANCED_SEARCH: process.env.ENABLE_ADVANCED_SEARCH === 'true',
  ENABLE_BETA_FEATURES: false
};

// 功能标志中间件
const checkFeatureFlag = (flagName) => {
  return (req, res, next) => {
    if (featureFlags[flagName]) {
      next();
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested feature is not available'
      });
    }
  };
};

// 仅在启用了高级搜索功能时启用此路由
app.get('/api/products/search/advanced', 
  checkFeatureFlag('ENABLE_ADVANCED_SEARCH'), 
  productController.advancedSearch
);

// 向客户端暴露功能标志
app.get('/api/feature-flags', (req, res) => {
  // 只暴露客户端需要知道的标志
  res.json({
    enableAdvancedSearch: featureFlags.ENABLE_ADVANCED_SEARCH,
    enableBetaFeatures: featureFlags.ENABLE_BETA_FEATURES
  });
});
```

### 总结与核心原则

在设计Node.js RESTful API时，请记住以下核心原则：

1. **以资源为中心**: 设计应围绕资源进行，而不是操作。

2. **标准化HTTP方法**: 正确使用HTTP方法 (GET, POST, PUT, DELETE, PATCH) 与资源交互。

3. **清晰的URL设计**: 使用直观、一致的URL命名约定。

4. **版本控制**: 从一开始就实施版本控制策略，以促进API演进。

5. **一致的响应格式**: 为所有端点使用一致的JSON响应结构。

6. **适当的状态码**: 使用正确的HTTP状态码传达请求结果。

7. **全面的错误处理**: 实现集中式错误处理机制，提供清晰的错误消息。

8. **安全优先**: 将身份验证、授权和输入验证集成到API设计中。

9. **性能考虑**: 实施分页、缓存和数据库优化。

10. **文档和测试**: 自动生成文档并编写全面的测试套件。

通过遵循这些原则和最佳实践，可以创建强大、可维护和可扩展的RESTful API，为客户端提供出色的开发体验。