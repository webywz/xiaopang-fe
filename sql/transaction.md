# SQL 事务与锁

事务和锁是保证数据库一致性和并发安全的关键机制。

## 事务的 ACID 特性
- **原子性（Atomicity）**：事务要么全部执行，要么全部不执行。
- **一致性（Consistency）**：事务执行前后，数据保持一致。
- **隔离性（Isolation）**：多个事务互不干扰。
- **持久性（Durability）**：事务提交后数据永久保存。

## 隔离级别
- READ UNCOMMITTED
- READ COMMITTED
- REPEATABLE READ
- SERIALIZABLE

## 锁类型
- 行级锁（Row Lock）
- 表级锁（Table Lock）
- 意向锁、共享锁、排他锁

## 死锁与检测
- 死锁产生原因：两个事务互相等待对方释放资源。
- 数据库通常有死锁检测与自动回滚机制。

## 最佳实践
- 尽量缩短事务时间，减少锁冲突。
- 合理选择隔离级别，兼顾性能与一致性。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 转账操作，保证原子性
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @param {number} fromId - 转出账户ID
 * @param {number} toId - 转入账户ID
 * @param {number} amount - 金额
 * @returns {Promise<void>}
 */
async function transfer(conn, fromId, toId, amount) {
  await conn.beginTransaction();
  try {
    await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
    await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}
``` 