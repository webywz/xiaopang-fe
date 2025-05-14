# SQL Server 实战案例：高并发事务处理

## 1. 需求描述
以"账户转账"为例，要求在高并发下保证资金安全、数据一致性，防止超发、脏读、死锁等问题，适合金融、电商、库存等场景。

## 2. 表结构设计
```sql
CREATE TABLE accounts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  balance DECIMAL(18,2) NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT uq_user UNIQUE(user_id)
);

CREATE TABLE transfer_log (
  id INT IDENTITY(1,1) PRIMARY KEY,
  from_id INT,
  to_id INT,
  amount DECIMAL(18,2),
  status NVARCHAR(16) DEFAULT 'success',
  created_at DATETIME DEFAULT GETDATE()
);
```

## 3. 核心 SQL 示例
```sql
-- 转账事务伪代码
BEGIN TRAN;
SELECT balance FROM accounts WITH (UPDLOCK) WHERE id = @from_id;
UPDATE accounts SET balance = balance - @amount WHERE id = @from_id AND balance >= @amount;
UPDATE accounts SET balance = balance + @amount WHERE id = @to_id;
INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (@from_id, @to_id, @amount, 'success');
COMMIT TRAN;

-- 查询账户余额
SELECT balance FROM accounts WITH (UPDLOCK) WHERE id = @id;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 账户转账（高并发事务安全）
 * @param {import('mssql').ConnectionPool} pool
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<boolean>} 是否成功
 */
async function transfer(pool, fromId, toId, amount) {
  const tx = pool.transaction();
  await tx.begin();
  try {
    const req = tx.request();
    const { recordset } = await req.input('id', fromId).query('SELECT balance FROM accounts WITH (UPDLOCK) WHERE id = @id');
    if (!recordset[0] || recordset[0].balance < amount) throw new Error('余额不足');
    await req.input('amount', amount).input('id', fromId).query('UPDATE accounts SET balance = balance - @amount WHERE id = @id');
    await req.input('amount', amount).input('id', toId).query('UPDATE accounts SET balance = balance + @amount WHERE id = @id');
    await req.input('fromId', fromId).input('toId', toId).input('amount', amount).input('status', 'success')
      .query('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (@fromId, @toId, @amount, @status)');
    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    await pool.request().input('fromId', fromId).input('toId', toId).input('amount', amount).input('status', 'fail')
      .query('INSERT INTO transfer_log (from_id, to_id, amount, status) VALUES (@fromId, @toId, @amount, @status)');
    return false;
  }
}
```

## 5. 优化与总结
- 关键更新用 WITH (UPDLOCK) 加行锁，防止并发超发
- 事务内操作精简，避免长事务
- 记录流水便于审计与追溯
- 建议捕获死锁异常并重试
- 余额字段用 DECIMAL，防止精度丢失
- 定期归档 transfer_log，防止表膨胀

---

本案例适合金融、电商、库存等高并发资金/库存场景，建议结合业务实际完善风控与异常处理。 