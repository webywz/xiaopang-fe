# MySQL 实战案例：高并发事务处理

## 1. 需求描述
以"账户转账"为例，要求在高并发下保证资金安全、数据一致性，防止超发、脏读、死锁等问题。适用于金融、电商、游戏等场景。

## 2. 表结构设计
```sql
CREATE TABLE accounts (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '账户ID',
  user_id INT NOT NULL COMMENT '用户ID',
  balance DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '余额',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_user (user_id)
);

CREATE TABLE transfer_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_id INT,
  to_id INT,
  amount DECIMAL(18,2),
  status ENUM('success','fail') DEFAULT 'success',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 3. 核心 SQL 示例
```sql
-- 转账事务伪代码
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (1, 2, 100, 'success');
COMMIT;

-- 查询账户余额
SELECT balance FROM accounts WHERE id = ? FOR UPDATE;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 账户转账（高并发事务安全）
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<boolean>} 是否成功
 */
async function transfer(conn, fromId, toId, amount) {
  await conn.beginTransaction();
  try {
    // 查询并锁定转出账户
    const [[from]] = await conn.execute('SELECT balance FROM accounts WHERE id = ? FOR UPDATE', [fromId]);
    if (!from || from.balance < amount) throw new Error('余额不足');
    // 扣减转出账户
    await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
    // 增加转入账户
    await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);
    // 记录流水
    await conn.execute('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (?, ?, ?, ?)', [fromId, toId, amount, 'success']);
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    await conn.execute('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (?, ?, ?, ?)', [fromId, toId, amount, 'fail']);
    return false;
  }
}
```

## 5. 优化与总结
- 关键更新用 `FOR UPDATE` 加行锁，防止并发超发
- 事务内操作尽量精简，避免长事务
- 记录流水便于审计与追溯
- 建议捕获死锁异常并重试
- 余额字段用 DECIMAL，防止精度丢失
- 定期归档 transfer_log，防止表膨胀

---

> 本案例适合金融、电商、游戏等高并发资金/库存场景，建议结合业务实际完善风控与异常处理。 