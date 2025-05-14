# PostgreSQL 实战案例：高并发事务处理

## 1. 需求描述
以"账户转账"为例，要求在高并发下保证资金安全、数据一致性，防止超发、脏读、死锁等问题。适用于金融、电商、游戏等场景。

## 2. 表结构设计
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id)
);

CREATE TABLE transfer_log (
  id SERIAL PRIMARY KEY,
  from_id INT,
  to_id INT,
  amount NUMERIC(18,2),
  status VARCHAR(16) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## 3. 核心 SQL 示例
```sql
-- 转账事务伪代码
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (1, 2, 100, 'success');
COMMIT;

-- 查询账户余额
SELECT balance FROM accounts WHERE id = $1 FOR UPDATE;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 账户转账（高并发事务安全）
 * @param {import('pg').Pool} pool
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<boolean>} 是否成功
 */
async function transfer(pool, fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // 查询并锁定转出账户
    const { rows } = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromId]);
    if (!rows[0] || rows[0].balance < amount) throw new Error('余额不足');
    // 扣减转出账户
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    // 增加转入账户
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    // 记录流水
    await client.query('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES ($1, $2, $3, $4)', [fromId, toId, amount, 'success']);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    await client.query('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES ($1, $2, $3, $4)', [fromId, toId, amount, 'fail']);
    return false;
  } finally {
    client.release();
  }
}
```

## 5. 优化与总结
- 关键更新用 `FOR UPDATE` 加行锁，防止并发超发
- 事务内操作尽量精简，避免长事务
- 记录流水便于审计与追溯
- 建议捕获死锁异常并重试
- 余额字段用 NUMERIC，防止精度丢失
- 定期归档 transfer_log，防止表膨胀

---

> 本案例适合金融、电商、游戏等高并发资金/库存场景，建议结合业务实际完善风控与异常处理。 