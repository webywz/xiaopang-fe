# MySQL 实战案例：分库分表实战

## 1. 需求描述
电商、社交等业务数据量巨大，单表/单库易成为瓶颈。需通过水平分表、分库提升写入和查询性能，支持弹性扩展。

## 2. 表结构与分片策略
- 以订单表为例，按 user_id 取模分表（如 order_0, order_1, ... order_15）
- 分库可按业务线、地理区域、哈希等拆分

```sql
-- 分表结构（order_0 ~ order_15）
CREATE TABLE order_0 (
  id BIGINT PRIMARY KEY COMMENT '订单ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  amount DECIMAL(10,2) NOT NULL,
  status TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 其余 order_1 ~ order_15 结构相同
```

## 3. 分库分表核心 SQL 与路由
- 插入/查询时需根据 user_id 路由到对应分表
- 全局唯一ID建议用雪花算法、UUID 或分布式ID服务

```js
/**
 * 计算分表名
 * @param {number} userId
 * @returns {string} 分表名
 */
function getOrderTable(userId) {
  const idx = userId % 16;
  return `order_${idx}`;
}
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 插入订单（分表路由）
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} userId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function insertOrder(conn, userId, amount) {
  const table = getOrderTable(userId);
  // 订单ID建议用分布式ID生成器
  const orderId = generateUniqueId();
  await conn.execute(
    `INSERT INTO ${table} (id, user_id, amount) VALUES (?, ?, ?)`,
    [orderId, userId, amount]
  );
}

/**
 * 查询用户所有订单（分表路由）
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function getUserOrders(conn, userId) {
  const table = getOrderTable(userId);
  const [rows] = await conn.execute(
    `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}
```

## 5. 优化与总结
- 分片键选择需均匀分布，避免热点
- 全局唯一ID用雪花算法/UUID，防止主键冲突
- 跨分片聚合需应用层汇总，或用中间件（如 ShardingSphere）
- 分表数量建议预留扩容空间，避免频繁迁移
- 分库分表后需完善监控、运维与自动化脚本

---

> 本案例适合大数据量、高并发业务，建议结合实际业务量级和团队运维能力合理设计分片方案。 