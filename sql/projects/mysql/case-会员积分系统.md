# 会员积分系统案例

## 1. 需求分析
- 支持用户积分的获取、消费、查询与明细记录。
- 支持多种积分获取方式（下单、签到、活动等）。
- 支持积分有效期、冻结、过期等管理。
- 支持积分与订单、用户的关联，便于统计与分析。
- 具备良好扩展性，便于后续接入更多积分玩法。

---

## 2. 表结构设计

### 积分账户表（point_account）
```sql
CREATE TABLE `point_account` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '账户ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total` INT NOT NULL DEFAULT 0 COMMENT '总积分',
  `available` INT NOT NULL DEFAULT 0 COMMENT '可用积分',
  `frozen` INT NOT NULL DEFAULT 0 COMMENT '冻结积分',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uniq_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分账户表';
```

### 积分明细表（point_log）
```sql
CREATE TABLE `point_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `change` INT NOT NULL COMMENT '变动积分（正为获取，负为消费）',
  `type` VARCHAR(32) NOT NULL COMMENT '类型（获取/消费/冻结/解冻/过期）',
  `order_id` BIGINT COMMENT '关联订单ID',
  `remark` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变动时间',
  INDEX idx_user (`user_id`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分明细表';
```

---

## 3. 核心 SQL

### 3.1 获取积分（如下单奖励）
```sql
INSERT INTO point_log (user_id, `change`, type, order_id, remark)
VALUES (?, ?, '获取', ?, ?);

UPDATE point_account SET total = total + ?, available = available + ?
WHERE user_id = ?;
```

### 3.2 消费积分
```sql
INSERT INTO point_log (user_id, `change`, type, order_id, remark)
VALUES (?, ?, '消费', ?, ?);

UPDATE point_account SET available = available - ?
WHERE user_id = ? AND available >= ?;
```

### 3.3 查询积分账户与明细
```sql
SELECT * FROM point_account WHERE user_id = ?;
SELECT * FROM point_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 获取积分（如下单奖励）
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} amount - 获取积分数
 * @param {number|null} orderId - 关联订单ID
 * @param {string} remark - 备注
 * @returns {Promise<void>}
 */
async function addPoints(db, userId, amount, orderId, remark) {
  await db.beginTransaction();
  try {
    await db.query(
      'INSERT INTO point_log (user_id, `change`, type, order_id, remark) VALUES (?, ?, ?, ?, ?)',
      [userId, amount, '获取', orderId, remark]
    );
    await db.query(
      'UPDATE point_account SET total = total + ?, available = available + ? WHERE user_id = ?',
      [amount, amount, userId]
    );
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 消费积分
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} amount - 消费积分数
 * @param {number|null} orderId - 关联订单ID
 * @param {string} remark - 备注
 * @returns {Promise<void>}
 */
async function usePoints(db, userId, amount, orderId, remark) {
  await db.beginTransaction();
  try {
    await db.query(
      'INSERT INTO point_log (user_id, `change`, type, order_id, remark) VALUES (?, ?, ?, ?, ?)',
      [userId, -amount, '消费', orderId, remark]
    );
    const res = await db.query(
      'UPDATE point_account SET available = available - ? WHERE user_id = ? AND available >= ?',
      [amount, userId, amount]
    );
    if (res.affectedRows === 0) throw new Error('可用积分不足');
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 查询积分账户
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @returns {Promise<object>} 积分账户信息
 */
async function getPointAccount(db, userId) {
  const [account] = await db.query('SELECT * FROM point_account WHERE user_id = ?', [userId]);
  return account;
}

/**
 * 查询积分明细
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 积分明细列表
 */
async function getPointLogs(db, userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM point_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [userId, offset, pageSize]
  );
}
```

---

## 5. 优化与总结

- 积分账户、明细表均建立合理索引，提升查询与并发处理性能。
- 获取、消费等操作均采用事务，保障积分一致性。
- 支持多种积分类型与状态扩展，便于灵活运营。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注积分过期、冻结、异常处理与安全防刷。

---

本案例适用于电商、会员体系等场景，便于团队快速搭建积分管理系统。 