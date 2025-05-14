# SQLite 实战案例：高并发事务处理

## 1. 需求描述
以"账户转账"为例，要求在高并发下保证资金安全、数据一致性，防止超发、脏读、死锁等问题，适合轻量级转账、库存等场景。

## 2. 表结构设计
```sql
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id)
);

CREATE TABLE transfer_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id INTEGER,
  to_id INTEGER,
  amount REAL,
  status TEXT DEFAULT 'success',
  created_at TEXT DEFAULT (datetime('now'))
);
```

## 3. 核心 SQL 示例
```sql
-- 转账事务伪代码
BEGIN;
SELECT balance FROM accounts WHERE id = 1;
UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (1, 2, 100, 'success');
COMMIT;

-- 查询账户余额
SELECT balance FROM accounts WHERE id = ?;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 账户转账（高并发事务安全）
 * @param {sqlite3.Database} db
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<boolean>} 是否成功
 */
function transfer(db, fromId, toId, amount) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN');
      db.get('SELECT balance FROM accounts WHERE id = ?', [fromId], (err, row) => {
        if (err || !row || row.balance < amount) {
          db.run('ROLLBACK');
          return resolve(false);
        }
        db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId], function(err) {
          if (err) { db.run('ROLLBACK'); return resolve(false); }
          db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId], function(err) {
            if (err) { db.run('ROLLBACK'); return resolve(false); }
            db.run('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (?, ?, ?, ?)', [fromId, toId, amount, 'success'], function(err) {
              if (err) { db.run('ROLLBACK'); return resolve(false); }
              db.run('COMMIT', err => {
                if (err) return resolve(false);
                resolve(true);
              });
            });
          });
        });
      });
    });
  });
}
```

## 5. 优化与总结
- 建议开启 WAL 模式提升并发写入能力
- 事务内操作精简，避免长事务
- 记录流水便于审计与追溯
- 捕获死锁/锁等待异常并重试
- balance 字段用 REAL/NUMERIC，防止精度丢失
- 定期归档 transfer_log，防止表膨胀

---

本案例适合轻量级转账、库存等高并发场景，建议结合业务实际完善风控与异常处理。 