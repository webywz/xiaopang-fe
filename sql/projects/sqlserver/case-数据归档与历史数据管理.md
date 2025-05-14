# SQL Server 实战案例：数据归档与历史数据管理

## 1. 需求描述
以"订单大表历史数据归档"为例，要求定期将一年以前的历史订单归档到归档表或归档库，实现冷热数据分离，提升主表查询与维护效率。

## 2. 表结构与归档策略设计
```sql
-- 主订单表
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  status NVARCHAR(20),
  created_at DATETIME,
  updated_at DATETIME
);

-- 归档订单表（结构与主表一致，可在归档库或同库下）
CREATE TABLE orders_archive (
  id BIGINT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  status NVARCHAR(20),
  created_at DATETIME,
  updated_at DATETIME
);

-- 可结合分区表设计，按年月分区，便于批量归档与清理
```

## 3. 核心 SQL 归档操作
```sql
-- 归档一年以前的订单
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE());
DELETE FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE());

-- 分区表归档（切换分区，效率更高，适合大数据量）
-- ALTER TABLE ... SWITCH PARTITION ...

-- 可用作业/调度脚本定期自动归档
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 归档一年以前的订单数据
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<{archived: number, deleted: number}>}
 */
async function archiveOldOrders(pool) {
  // 先插入归档表
  const insertResult = await pool.request().query(`
    INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE())
  `);
  // 再删除主表数据
  const deleteResult = await pool.request().query(`
    DELETE FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE())
  `);
  return { archived: insertResult.rowsAffected[0], deleted: deleteResult.rowsAffected[0] };
}

/**
 * 查询历史归档订单
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 截止日期
 * @returns {Promise<Array>} 归档订单列表
 */
async function getArchivedOrders(pool, startDate, endDate) {
  const result = await pool.request()
    .input('start', sql.DateTime, startDate)
    .input('end', sql.DateTime, endDate)
    .query('SELECT * FROM orders_archive WHERE created_at BETWEEN @start AND @end');
  return result.recordset;
}
```

## 5. 优化与总结
- 建议结合分区表，提升大数据量归档与清理效率
- 归档操作建议在业务低峰期执行，避免影响主业务
- 归档表可单独存储于低成本存储或归档库
- 定期校验归档数据完整性，防止丢失
- 归档数据可加密、压缩，提升安全与存储效率
- 归档与恢复流程需定期演练，确保可用性

---

本案例适合大数据量历史归档场景，建议结合实际业务制定归档策略与自动化流程。 