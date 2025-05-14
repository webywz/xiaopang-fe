# 订单管理系统案例

## 1. 需求分析

- 支持用户下单、支付、取消、完成订单等全流程。
- 订单可包含多个商品，需记录商品快照（下单时的价格、名称等，防止商品信息变更影响历史订单）。
- 支持订单状态流转及状态变更日志，便于追踪订单生命周期。
- 支持多维度（用户、时间、状态、金额区间）高效查询。
- 订单数据需支持高并发写入与查询，保障数据一致性。
- 具备良好扩展性，便于后续增加优惠券、发票、售后等功能。

---

## 2. 表结构设计

### 用户表（user）

```sql
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `email` VARCHAR(128) NOT NULL COMMENT '邮箱',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 商品表（product）

```sql
CREATE TABLE `product` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '商品单价',
  `stock` INT NOT NULL COMMENT '库存',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 订单主表（order）

```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `status` VARCHAR(32) NOT NULL COMMENT '订单状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `snapshot` JSON COMMENT '订单快照（如收货地址、下单时用户信息等）',
  INDEX idx_user_created (`user_id`, `created_at`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

### 订单明细表（order_item）

```sql
CREATE TABLE `order_item` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(128) NOT NULL COMMENT '商品名称快照',
  `product_price` DECIMAL(10,2) NOT NULL COMMENT '商品单价快照',
  `quantity` INT NOT NULL COMMENT '购买数量',
  `subtotal` DECIMAL(10,2) NOT NULL COMMENT '小计',
  INDEX idx_order (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';
```

### 订单状态流转表（order_status_log）

```sql
CREATE TABLE `order_status_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `from_status` VARCHAR(32) NOT NULL COMMENT '原状态',
  `to_status` VARCHAR(32) NOT NULL COMMENT '新状态',
  `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  `remark` VARCHAR(255) COMMENT '备注',
  INDEX idx_order (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态流转日志表';
```

---

## 3. 核心 SQL

### 3.1 创建订单（含多商品、事务处理）

```sql
-- 1. 开启事务
START TRANSACTION;

-- 2. 插入订单主表
INSERT INTO `order` (`user_id`, `total_amount`, `status`, `snapshot`)
VALUES (?, ?, '待支付', ?);

-- 获取新插入订单ID
SET @order_id = LAST_INSERT_ID();

-- 3. 插入订单明细表（多条）
INSERT INTO `order_item` (`order_id`, `product_id`, `product_name`, `product_price`, `quantity`, `subtotal`)
VALUES
(@order_id, ?, ?, ?, ?, ?),
(@order_id, ?, ?, ?, ?, ?);
-- 多商品可批量插入

-- 4. 扣减商品库存
UPDATE `product` SET `stock` = `stock` - ? WHERE `id` = ? AND `stock` >= ?;
-- 对每个商品执行，防止超卖

-- 5. 插入订单状态流转日志
INSERT INTO `order_status_log` (`order_id`, `from_status`, `to_status`, `remark`)
VALUES (@order_id, '', '待支付', '用户下单');

-- 6. 提交事务
COMMIT;
```

---

### 3.2 查询订单及明细

```sql
-- 查询指定用户的订单（分页）
SELECT * FROM `order`
WHERE `user_id` = ?
ORDER BY `created_at` DESC
LIMIT ?, ?;

-- 查询某订单的明细
SELECT * FROM `order_item`
WHERE `order_id` = ?;
```

---

### 3.3 订单状态变更（如支付、取消）

```sql
-- 1. 开启事务
START TRANSACTION;

-- 2. 更新订单状态（乐观锁，防止并发）
UPDATE `order`
SET `status` = ?, `updated_at` = NOW()
WHERE `id` = ? AND `status` = ?;

-- 3. 插入状态流转日志
INSERT INTO `order_status_log` (`order_id`, `from_status`, `to_status`, `remark`)
VALUES (?, ?, ?, ?);

-- 4. 若取消订单，需回滚库存
UPDATE `product` p
JOIN `order_item` oi ON p.id = oi.product_id
SET p.stock = p.stock + oi.quantity
WHERE oi.order_id = ?;

-- 5. 提交事务
COMMIT;
```

---

### 3.4 多条件高效查询（用户、时间、状态、金额区间）

```sql
SELECT * FROM `order`
WHERE 1=1
  AND (`user_id` = ? OR ? IS NULL)
  AND (`status` = ? OR ? IS NULL)
  AND (`created_at` BETWEEN ? AND ?)
  AND (`total_amount` BETWEEN ? AND ?)
ORDER BY `created_at` DESC
LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

### 4.1 下单接口

```js
/**
 * 创建订单（支持多商品，含事务处理）
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {Array<{productId: number, quantity: number}>} items - 订单商品列表
 * @param {object} snapshot - 订单快照信息（如收货地址等）
 * @returns {Promise<number>} 新订单ID
 */
async function createOrder(db, userId, items, snapshot) {
  // 开启事务
  await db.beginTransaction();
  try {
    // 计算总金额、获取商品快照
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const [product] = await db.query('SELECT * FROM product WHERE id = ?', [item.productId]);
      if (!product || product.stock < item.quantity) {
        throw new Error('商品库存不足');
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      });
    }

    // 插入订单主表
    const result = await db.query(
      'INSERT INTO `order` (`user_id`, `total_amount`, `status`, `snapshot`) VALUES (?, ?, ?, ?)',
      [userId, totalAmount, '待支付', JSON.stringify(snapshot)]
    );
    const orderId = result.insertId;

    // 插入订单明细表
    for (const oi of orderItems) {
      await db.query(
        'INSERT INTO order_item (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, oi.productId, oi.productName, oi.productPrice, oi.quantity, oi.subtotal]
      );
      // 扣减库存
      const updateRes = await db.query(
        'UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [oi.quantity, oi.productId, oi.quantity]
      );
      if (updateRes.affectedRows === 0) {
        throw new Error('商品库存不足');
      }
    }

    // 插入订单状态流转日志
    await db.query(
      'INSERT INTO order_status_log (order_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [orderId, '', '待支付', '用户下单']
    );

    // 提交事务
    await db.commit();
    return orderId;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}
```

---

### 4.2 查询订单接口

```js
/**
 * 查询用户订单（分页）
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 订单列表
 */
async function getUserOrders(db, userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const orders = await db.query(
    'SELECT * FROM `order` WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [userId, offset, pageSize]
  );
  return orders;
}

/**
 * 查询订单明细
 * @param {object} db - 数据库连接对象
 * @param {number} orderId - 订单ID
 * @returns {Promise<Array>} 订单明细列表
 */
async function getOrderItems(db, orderId) {
  const items = await db.query(
    'SELECT * FROM order_item WHERE order_id = ?',
    [orderId]
  );
  return items;
}
```

---

### 4.3 订单状态变更接口

```js
/**
 * 更新订单状态（如支付、取消，含乐观锁与日志）
 * @param {object} db - 数据库连接对象
 * @param {number} orderId - 订单ID
 * @param {string} fromStatus - 原状态
 * @param {string} toStatus - 新状态
 * @param {string} remark - 备注
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateOrderStatus(db, orderId, fromStatus, toStatus, remark) {
  await db.beginTransaction();
  try {
    // 更新订单状态（乐观锁）
    const res = await db.query(
      'UPDATE `order` SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?',
      [toStatus, orderId, fromStatus]
    );
    if (res.affectedRows === 0) {
      throw new Error('订单状态已变更或不存在');
    }
    // 插入状态流转日志
    await db.query(
      'INSERT INTO order_status_log (order_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [orderId, fromStatus, toStatus, remark]
    );
    // 若取消订单，回滚库存
    if (toStatus === '已取消') {
      await db.query(
        `UPDATE product p
         JOIN order_item oi ON p.id = oi.product_id
         SET p.stock = p.stock + oi.quantity
         WHERE oi.order_id = ?`,
        [orderId]
      );
    }
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}
```

---

## 5. 优化与总结

### 5.1 表结构与索引优化
- 订单主表、明细表、状态日志表均采用 InnoDB 引擎，支持事务与行级锁，保障数据一致性。
- 订单主表对 user_id+created_at、status 建立联合索引，提升用户订单查询和状态筛选效率。
- 明细表、状态日志表均对 order_id 建立索引，便于订单详情与日志的高效查询。
- 订单快照字段采用 JSON 存储，便于扩展和记录下单时的关键信息。

### 5.2 SQL 性能优化
- 查询接口均采用分页（LIMIT），避免一次性拉取大量数据。
- 多条件查询时，建议根据实际业务场景调整索引顺序，利用覆盖索引减少回表。
- 复杂统计或报表建议异步化、分批处理，避免影响主业务库性能。
- 使用 EXPLAIN 分析 SQL 执行计划，及时优化慢查询。

### 5.3 并发控制与一致性
- 下单、状态变更等关键操作均在事务中完成，防止并发下超卖、脏写等问题。
- 扣减库存、订单状态变更采用乐观锁（WHERE 条件带原状态/库存），防止并发冲突。
- 业务层可引入分布式锁（如 Redis 锁）进一步提升高并发场景下的数据一致性。
- 订单状态流转日志便于追溯订单生命周期，辅助排查问题。

### 5.4 读写分离与分库分表建议
- 订单表数据量大时，可按用户ID或时间分表，提升写入与查询性能。
- 读写分离架构下，主库负责写入，从库负责查询，提升整体吞吐量。
- 订单明细、日志等大表可单独分库，减轻主库压力。
- 采用中间件（如 MyCat、ShardingSphere）可实现透明分库分表。

### 5.5 实践总结与常见问题
- 订单系统需重点关注数据一致性、幂等性与高并发下的性能瓶颈。
- 订单状态流转建议采用有限状态机思想，避免非法流转。
- 业务扩展时，建议通过快照、冗余字段等方式保障历史数据不受影响。
- 常见问题如库存超卖、订单丢失、状态错乱等，需通过事务、锁、日志等手段综合防控。

---

本案例涵盖了订单系统的核心业务建模、SQL实现、Node.js代码与性能优化建议，适合团队学习与实际项目参考。 