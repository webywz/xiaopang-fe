# PostgreSQL 事务与锁（详解）

## 1. 事务基础
事务（Transaction）是一组操作的集合，这些操作要么全部成功，要么全部失败回滚。PostgreSQL 默认支持强 ACID 事务。

## 2. ACID 特性
- **原子性（Atomicity）**：事务中的所有操作要么全部完成，要么全部不做。
- **一致性（Consistency）**：事务前后数据完整性保持一致。
- **隔离性（Isolation）**：并发事务之间互不影响。
- **持久性（Durability）**：事务提交后数据永久保存。

## 3. 事务的使用方法
### 3.1 基本语法
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 或 ROLLBACK;
```

### 3.2 自动提交
- PostgreSQL 默认每条语句自动提交。
- 显式事务需用 `BEGIN`/`COMMIT` 包裹。

## 4. 事务隔离级别
PostgreSQL 支持四种隔离级别：
| 级别                | 脏读 | 不可重复读 | 幻读 |
|---------------------|------|------------|------|
| READ UNCOMMITTED    | √    | √          | √    |
| READ COMMITTED*     | ×    | √          | √    |
| REPEATABLE READ     | ×    | ×          | √    |
| SERIALIZABLE        | ×    | ×          | ×    |
> *PostgreSQL 默认 READ COMMITTED。

- 设置隔离级别：
```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

## 5. 并发控制与死锁
- PostgreSQL 采用多版本并发控制（MVCC），高并发下性能优越。
- 支持行级锁、表级锁、共享锁、排他锁等。
- 死锁检测自动进行，遇到死锁会回滚其中一个事务。
- 避免死锁建议：
  - 保持一致的操作顺序
  - 控制事务粒度，缩短事务时间
  - 合理设计索引，减少锁冲突

## 6. 常见问题与最佳实践
- 避免长事务，及时提交或回滚
- 只在必要时使用显式事务
- 事务中避免交互等待（如用户输入）
- 监控死锁日志，定期优化 SQL
- 充分利用 MVCC，减少锁竞争

## 7. Node.js 事务操作代码示例（JSDoc 注释）
```js
/**
 * 转账操作（带事务）
 * @param {import('pg').Pool} pool
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function transfer(pool, fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromId]);
    if (!rows[0] || rows[0].balance < amount) throw new Error('余额不足');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

---

> 事务是保障数据一致性和可靠性的核心机制，建议团队严格遵循最佳实践，定期复盘死锁和并发问题。 