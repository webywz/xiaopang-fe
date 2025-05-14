# Oracle 事务管理

## 1. 事务基础与应用场景
- 事务（Transaction）保证一组操作的原子性、一致性、隔离性、持久性（ACID）
- 适合资金转账、库存扣减等需强一致性的场景

## 2. 事务的开启、提交、回滚
```sql
-- 显式开启事务
BEGIN;
-- 或 SET TRANSACTION;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```

## 3. 隔离级别与并发控制
- READ COMMITTED（默认）：防止脏读，允许不可重复读
- SERIALIZABLE：最高隔离，防止幻读，但并发性差
- 可用 SET TRANSACTION ISOLATION LEVEL 设置

## 4. 常见问题与最佳实践
- 长事务易导致锁等待、回滚段膨胀，建议事务内操作精简
- 捕获死锁异常并重试
- 重要操作建议加乐观/悲观锁

## 5. Node.js 事务操作代码（含 JSDoc 注释）
```js
/**
 * Oracle 事务操作示例
 * @param {oracledb.Connection} conn
 * @param {function(conn: oracledb.Connection): Promise<void>} fn
 * @returns {Promise<void>}
 */
async function runTransaction(conn, fn) {
  try {
    await conn.execute('BEGIN');
    await fn(conn);
    await conn.execute('COMMIT');
  } catch (e) {
    await conn.execute('ROLLBACK');
    throw e;
  }
}
```

---

Oracle 事务机制强大，建议合理选择隔离级别，精简事务范围，定期复盘死锁与性能问题。 