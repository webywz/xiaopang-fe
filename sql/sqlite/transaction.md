# SQLite 事务管理

## 1. 事务基础与应用场景
- 事务（Transaction）保证一组操作的原子性、一致性、隔离性、持久性（ACID）
- 适合资金转账、批量写入等需一致性的场景

## 2. 事务的开启、提交、回滚
```sql
-- 显式开启事务
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```

## 3. 隔离级别与并发控制
- 支持 DEFERRED、IMMEDIATE、EXCLUSIVE 三种事务模式
- 默认 SERIALIZABLE 隔离级别，防止脏读/不可重复读/幻读
- WAL 模式提升并发读写能力

## 4. 常见问题与最佳实践
- 长事务易导致锁等待，建议事务内操作精简
- 并发写入建议用 WAL 模式
- 捕获死锁异常并重试

## 5. Node.js 事务操作代码（含 JSDoc 注释）
```js
/**
 * SQLite 事务操作示例
 * @param {sqlite3.Database} db
 * @param {function(db: sqlite3.Database): Promise<void>} fn
 * @returns {Promise<void>}
 */
function runTransaction(db, fn) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN');
      fn(db)
        .then(() => {
          db.run('COMMIT', resolve);
        })
        .catch(err => {
          db.run('ROLLBACK', () => reject(err));
        });
    });
  });
}
```

---

SQLite 事务简单高效，建议精简事务范围，批量写入/并发场景优先用 WAL 模式。 