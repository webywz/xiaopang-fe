# SQL Server 实战案例：数据质量管理与异常检测

## 1. 需求描述
以"订单数据质量管理"为例，要求保障订单表数据唯一性、完整性、有效性，自动检测异常数据并告警，支持批量修复建议。

## 2. 表结构与质量规则设计
```sql
-- 订单表，含唯一约束、外键、检查约束
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) CHECK (amount >= 0),
  status NVARCHAR(20) CHECK (status IN ('pending','paid','cancelled')),
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 唯一索引防止重复订单号
CREATE UNIQUE INDEX idx_orders_id ON orders(id);

-- 触发器示例：禁止负数金额插入
CREATE TRIGGER trg_orders_amount_check ON orders
AFTER INSERT, UPDATE
AS
BEGIN
  IF EXISTS (SELECT 1 FROM inserted WHERE amount < 0)
    THROW 50001, '订单金额不能为负数', 1;
END;
```

## 3. 核心 SQL 操作
```sql
-- 检查重复订单
SELECT id, COUNT(*) FROM orders GROUP BY id HAVING COUNT(*) > 1;

-- 检查无效用户ID
SELECT o.id FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE u.id IS NULL;

-- 检查无效状态
SELECT * FROM orders WHERE status NOT IN ('pending','paid','cancelled');

-- 批量修复无效状态
UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending','paid','cancelled');
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 检查订单表数据质量
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<Object>} 异常数据统计
 */
async function checkOrderDataQuality(pool) {
  const [dup, invalidUser, invalidStatus] = await Promise.all([
    pool.request().query('SELECT COUNT(*) AS cnt FROM (SELECT id FROM orders GROUP BY id HAVING COUNT(*) > 1) t'),
    pool.request().query('SELECT COUNT(*) AS cnt FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE u.id IS NULL'),
    pool.request().query("SELECT COUNT(*) AS cnt FROM orders WHERE status NOT IN ('pending','paid','cancelled')")
  ]);
  return {
    duplicateOrders: dup.recordset[0].cnt,
    invalidUserId: invalidUser.recordset[0].cnt,
    invalidStatus: invalidStatus.recordset[0].cnt
  };
}

/**
 * 批量修复无效订单状态
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<number>} 修复行数
 */
async function fixInvalidOrderStatus(pool) {
  const result = await pool.request().query("UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending','paid','cancelled')");
  return result.rowsAffected[0];
}
```

## 5. 优化与总结
- 结合唯一约束、外键、检查约束、触发器提升数据质量
- 定期自动检测异常数据，及时修复
- 关键表建议加数据校验作业与告警
- 业务层与数据库层双重校验，防止脏数据流入
- 数据修复建议有日志记录，便于追溯

---

本案例适合对数据质量有较高要求的业务，建议结合实际场景持续完善数据校验与异常处理流程。 