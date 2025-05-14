# SQL Server 实战案例：数据生命周期管理与归档策略

## 1. 需求描述
以"订单数据全生命周期管理"为例，要求对订单数据从生成、活跃、归档到销毁进行分层管理，满足合规要求，优化存储成本，支持自动归档与定期清理。

## 2. 生命周期分层设计
- **热数据**：近3个月内活跃订单，频繁访问，存储于主表。
- **温数据**：3-12个月订单，偶尔访问，可存储于次级存储或分区。
- **冷数据/归档数据**：1年以上历史订单，归档表或低成本存储。
- **销毁数据**：超出合规保留期的数据，定期物理删除。

## 3. 核心 SQL 与管理操作
```sql
-- 标记生命周期（可加字段 lifecycle）
ALTER TABLE orders ADD lifecycle NVARCHAR(10) DEFAULT 'hot';

-- 自动归档脚本：将1年以上订单归档
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE());
DELETE FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE());

-- 定期清理超期数据（如归档表保留3年）
DELETE FROM orders_archive WHERE created_at < DATEADD(YEAR, -3, GETDATE());

-- 可结合分区表、作业调度实现自动化
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 自动归档超期订单
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<{archived: number, deleted: number}>}
 */
async function autoArchiveOrders(pool) {
  const insertResult = await pool.request().query(`
    INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE())
  `);
  const deleteResult = await pool.request().query(`
    DELETE FROM orders WHERE created_at < DATEADD(YEAR, -1, GETDATE())
  `);
  return { archived: insertResult.rowsAffected[0], deleted: deleteResult.rowsAffected[0] };
}

/**
 * 定期清理归档表超期数据
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<number>} 删除行数
 */
async function cleanExpiredArchive(pool) {
  const result = await pool.request().query(`
    DELETE FROM orders_archive WHERE created_at < DATEADD(YEAR, -3, GETDATE())
  `);
  return result.rowsAffected[0];
}
```

## 5. 优化与总结
- 建议结合分区表、自动化作业提升归档与清理效率
- 生命周期分层字段便于数据分级管理与查询
- 归档与销毁操作建议有日志与审批，防止误删
- 存储策略应兼顾性能、成本与合规要求
- 定期评估归档与清理策略，适应业务变化

---

本案例适合大数据量、合规要求高的企业，建议结合实际业务持续完善数据生命周期管理体系。 