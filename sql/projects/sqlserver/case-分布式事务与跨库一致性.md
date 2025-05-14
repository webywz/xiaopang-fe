# SQL Server 实战案例：分布式事务与跨库一致性

## 1. 需求描述
以"跨库转账"为例，要求在两个不同数据库（或服务器）间实现资金转账，确保转出与转入操作要么全部成功、要么全部回滚，保障数据一致性。

## 2. 方案设计
- **两阶段提交（2PC）**：通过 MSDTC（Microsoft Distributed Transaction Coordinator）协调，实现分布式事务。
- **补偿事务**：如部分操作失败，通过补偿逻辑回滚已完成操作。
- **幂等性设计**：防止重复提交导致数据不一致。

## 3. 核心 SQL 操作与配置
```sql
-- 启用 MSDTC 服务（需在操作系统和 SQL Server 配置）
-- 跨库分布式事务示例
BEGIN DISTRIBUTED TRANSACTION;

-- 数据库A：扣款
UPDATE dbA.dbo.accounts SET balance = balance - 100 WHERE id = 1;

-- 数据库B：加款
UPDATE dbB.dbo.accounts SET balance = balance + 100 WHERE id = 2;

COMMIT TRANSACTION;

-- 若中间出错，ROLLBACK TRANSACTION;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 跨库分布式转账（需启用 MSDTC）
 * @param {sql.ConnectionPool} poolA - 数据库A连接池
 * @param {sql.ConnectionPool} poolB - 数据库B连接池
 * @param {number} fromId - 转出账户ID
 * @param {number} toId - 转入账户ID
 * @param {number} amount - 转账金额
 * @returns {Promise<void>}
 */
async function distributedTransfer(poolA, poolB, fromId, toId, amount) {
  const txA = new sql.Transaction(poolA);
  const txB = new sql.Transaction(poolB);
  try {
    await txA.begin();
    await txB.begin();
    await txA.request().query(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`);
    await txB.request().query(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`);
    await txA.commit();
    await txB.commit();
  } catch (err) {
    await txA.rollback();
    await txB.rollback();
    throw err;
  }
}
```

## 5. 优化与总结
- 分布式事务性能开销大，建议仅在强一致性场景使用
- 可用幂等性、补偿机制提升容错能力
- 监控 MSDTC 状态，及时发现异常
- 业务层可采用最终一致性+补偿方案，提升可用性
- 跨库操作建议有唯一事务ID，便于追踪与恢复

---

本案例适合多数据库/多服务强一致性场景，建议结合实际业务选择分布式事务或补偿机制。 