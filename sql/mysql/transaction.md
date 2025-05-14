# MySQL 事务与锁（详解）

## 1. 事务基础
事务（Transaction）是一组操作的集合，这些操作要么全部成功，要么全部失败回滚。MySQL 默认 InnoDB 存储引擎支持事务。

## 2. ACID 特性
- **原子性（Atomicity）**：事务中的所有操作要么全部完成，要么全部不做。
- **一致性（Consistency）**：事务前后数据完整性保持一致。
- **隔离性（Isolation）**：并发事务之间互不影响。
- **持久性（Durability）**：事务提交后数据永久保存。

## 3. 事务的使用方法
### 3.1 基本语法
```sql
START TRANSACTION; -- 或 BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- 提交
-- ROLLBACK; -- 回滚
```

### 3.2 自动提交
- MySQL 默认 autocommit=1，每条语句自动提交。
- 关闭自动提交：`SET autocommit = 0;`

## 4. 事务隔离级别
MySQL 支持四种隔离级别：
| 级别                | 脏读 | 不可重复读 | 幻读 |
|---------------------|------|------------|------|
| READ UNCOMMITTED    | √    | √          | √    |
| READ COMMITTED      | ×    | √          | √    |
| REPEATABLE READ*    | ×    | ×          | √    |
| SERIALIZABLE        | ×    | ×          | ×    |
> *InnoDB 默认 REPEATABLE READ，并通过间隙锁防止幻读。

- 设置隔离级别：
```sql
SET [SESSION|GLOBAL] TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

## 5. 死锁与并发控制
- **死锁**：两个或多个事务互相等待对方释放锁，导致永久阻塞。
- **检测与解决**：InnoDB 会自动检测死锁并回滚其中一个事务。
- **避免死锁建议**：
  - 保持一致的操作顺序
  - 控制事务粒度，缩短事务时间
  - 合理设计索引，减少锁冲突

## 6. 锁机制
- **行级锁**：InnoDB 支持，锁定单行，支持高并发。
- **表级锁**：MyISAM 支持，锁定整张表，适合读多写少。
- **意向锁**：InnoDB 自动加锁，辅助行锁与表锁兼容。
- **间隙锁/临键锁**：防止幻读。

## 7. 常见问题与最佳实践
- 避免长事务，及时提交或回滚
- 尽量使用默认的 InnoDB 存储引擎
- 只在必要时使用显式事务
- 事务中避免交互等待（如用户输入）
- 监控死锁日志，定期优化 SQL

## 8. Node.js 事务操作代码示例（JSDoc 注释）
```js
/**
 * 转账操作（带事务）
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function transfer(conn, fromId, toId, amount) {
  await conn.beginTransaction();
  try {
    await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
    await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}
```

---

> 事务是保障数据一致性和可靠性的核心机制，建议团队严格遵循最佳实践，定期复盘死锁和并发问题。 