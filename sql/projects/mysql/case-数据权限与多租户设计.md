# 数据权限与多租户设计案例

## 1. 需求分析
- 支持多租户（如SaaS平台）下的数据隔离与权限控制。
- 每个租户拥有独立的数据空间，用户仅能访问本租户数据。
- 支持租户管理员、普通用户等多级权限管理。
- 支持按租户、用户、角色等多维度灵活授权。
- 具备良好扩展性，便于后续接入更多权限模型与安全策略。

---

## 2. 表结构设计

### 租户表（tenant）
```sql
CREATE TABLE `tenant` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '租户ID',
  `name` VARCHAR(64) NOT NULL COMMENT '租户名称',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租户表';
```

### 用户表（user）
```sql
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `role` VARCHAR(32) NOT NULL DEFAULT 'user' COMMENT '角色（admin/user）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  INDEX idx_tenant (`tenant_id`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 业务数据表（如 order）
```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `status` VARCHAR(32) NOT NULL COMMENT '订单状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  INDEX idx_tenant (`tenant_id`),
  INDEX idx_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表（多租户）';
```

### 角色权限表（role_permission）
```sql
CREATE TABLE `role_permission` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  `role` VARCHAR(32) NOT NULL COMMENT '角色',
  `permission` VARCHAR(64) NOT NULL COMMENT '权限标识',
  INDEX idx_tenant_role (`tenant_id`, `role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限表';
```

---

## 3. 核心 SQL

### 3.1 查询本租户订单（数据隔离）
```sql
SELECT * FROM `order` WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?, ?;
```

### 3.2 查询用户权限
```sql
SELECT permission FROM role_permission WHERE tenant_id = ? AND role = ?;
```

### 3.3 新增租户用户
```sql
INSERT INTO user (tenant_id, username, role) VALUES (?, ?, ?);
```

### 3.4 新增业务数据（如订单）
```sql
INSERT INTO `order` (tenant_id, user_id, amount, status) VALUES (?, ?, ?, ?);
```

---

## 4. Node.js 代码实现

```js
/**
 * 查询本租户订单（分页）
 * @param {object} db - 数据库连接对象
 * @param {number} tenantId - 租户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 订单列表
 */
async function getTenantOrders(db, tenantId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM `order` WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [tenantId, offset, pageSize]
  );
}

/**
 * 查询用户权限
 * @param {object} db - 数据库连接对象
 * @param {number} tenantId - 租户ID
 * @param {string} role - 角色
 * @returns {Promise<Array>} 权限列表
 */
async function getRolePermissions(db, tenantId, role) {
  return db.query(
    'SELECT permission FROM role_permission WHERE tenant_id = ? AND role = ?',
    [tenantId, role]
  );
}

/**
 * 新增租户用户
 * @param {object} db - 数据库连接对象
 * @param {number} tenantId - 租户ID
 * @param {string} username - 用户名
 * @param {string} role - 角色
 * @returns {Promise<number>} 新用户ID
 */
async function createTenantUser(db, tenantId, username, role = 'user') {
  const result = await db.query(
    'INSERT INTO user (tenant_id, username, role) VALUES (?, ?, ?)',
    [tenantId, username, role]
  );
  return result.insertId;
}

/**
 * 新增业务数据（如订单）
 * @param {object} db - 数据库连接对象
 * @param {number} tenantId - 租户ID
 * @param {number} userId - 用户ID
 * @param {number} amount - 订单金额
 * @param {string} status - 订单状态
 * @returns {Promise<number>} 新订单ID
 */
async function createOrder(db, tenantId, userId, amount, status) {
  const result = await db.query(
    'INSERT INTO `order` (tenant_id, user_id, amount, status) VALUES (?, ?, ?, ?)',
    [tenantId, userId, amount, status]
  );
  return result.insertId;
}
```

---

## 5. 优化与总结

- 所有业务表均带有 tenant_id 字段，保障数据物理隔离。
- 关键查询均带 tenant_id 条件，防止越权访问。
- 角色权限表支持灵活扩展，便于多级权限管理。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注租户数据隔离、权限校验与安全策略的完善。

---

本案例适用于SaaS平台、企业多租户系统等场景，便于团队快速搭建安全、可扩展的数据权限与多租户架构。 