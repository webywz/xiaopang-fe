# 优惠券与活动管理案例

## 1. 需求分析
- 支持多种类型优惠券（满减、折扣、现金券等）及活动的创建、发放与核销。
- 支持优惠券与用户、订单的关联，防止重复领取与超额使用。
- 支持活动有效期、使用规则、状态流转等管理。
- 支持多维度查询与统计，便于活动效果分析。
- 具备良好扩展性，便于后续接入更多营销玩法。

---

## 2. 表结构设计

### 优惠券表（coupon）
```sql
CREATE TABLE `coupon` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '优惠券ID',
  `name` VARCHAR(64) NOT NULL COMMENT '优惠券名称',
  `type` VARCHAR(16) NOT NULL COMMENT '类型（满减/折扣/现金）',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '面额/折扣',
  `min_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛',
  `start_time` DATETIME NOT NULL COMMENT '生效时间',
  `end_time` DATETIME NOT NULL COMMENT '失效时间',
  `total` INT NOT NULL COMMENT '发放总量',
  `issued` INT DEFAULT 0 COMMENT '已发放数量',
  `status` VARCHAR(16) NOT NULL DEFAULT '启用' COMMENT '状态',
  INDEX idx_type (`type`),
  INDEX idx_time (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';
```

### 用户优惠券表（user_coupon）
```sql
CREATE TABLE `user_coupon` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `coupon_id` BIGINT NOT NULL COMMENT '优惠券ID',
  `status` VARCHAR(16) NOT NULL DEFAULT '未使用' COMMENT '状态',
  `received_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `used_at` DATETIME COMMENT '使用时间',
  UNIQUE KEY uniq_user_coupon (`user_id`, `coupon_id`),
  INDEX idx_user (`user_id`),
  INDEX idx_coupon (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';
```

### 活动表（promotion）
```sql
CREATE TABLE `promotion` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
  `name` VARCHAR(64) NOT NULL COMMENT '活动名称',
  `description` VARCHAR(255) COMMENT '活动描述',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` VARCHAR(16) NOT NULL DEFAULT '进行中' COMMENT '状态',
  INDEX idx_time (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';
```

---

## 3. 核心 SQL

### 3.1 创建优惠券
```sql
INSERT INTO coupon (name, type, amount, min_amount, start_time, end_time, total, status)
VALUES (?, ?, ?, ?, ?, ?, ?, '启用');
```

### 3.2 用户领取优惠券
```sql
INSERT INTO user_coupon (user_id, coupon_id)
SELECT ?, ? FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM user_coupon WHERE user_id = ? AND coupon_id = ?
) AND (
  SELECT issued FROM coupon WHERE id = ?
) < (
  SELECT total FROM coupon WHERE id = ?
);

UPDATE coupon SET issued = issued + 1 WHERE id = ?;
```

### 3.3 优惠券核销（下单使用）
```sql
UPDATE user_coupon SET status = '已使用', used_at = NOW()
WHERE user_id = ? AND coupon_id = ? AND status = '未使用';
```

### 3.4 查询用户可用优惠券
```sql
SELECT c.* FROM coupon c
JOIN user_coupon uc ON c.id = uc.coupon_id
WHERE uc.user_id = ? AND uc.status = '未使用'
  AND c.status = '启用'
  AND NOW() BETWEEN c.start_time AND c.end_time;
```

---

## 4. Node.js 代码实现

```js
/**
 * 创建优惠券
 * @param {object} db - 数据库连接对象
 * @param {object} coupon - 优惠券信息
 * @returns {Promise<number>} 新优惠券ID
 */
async function createCoupon(db, coupon) {
  const result = await db.query(
    'INSERT INTO coupon (name, type, amount, min_amount, start_time, end_time, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [coupon.name, coupon.type, coupon.amount, coupon.min_amount, coupon.start_time, coupon.end_time, coupon.total, '启用']
  );
  return result.insertId;
}

/**
 * 用户领取优惠券
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} couponId - 优惠券ID
 * @returns {Promise<boolean>} 是否领取成功
 */
async function receiveCoupon(db, userId, couponId) {
  await db.beginTransaction();
  try {
    const [coupon] = await db.query('SELECT * FROM coupon WHERE id = ? FOR UPDATE', [couponId]);
    if (!coupon || coupon.issued >= coupon.total) {
      throw new Error('优惠券已领完');
    }
    const [exist] = await db.query('SELECT 1 FROM user_coupon WHERE user_id = ? AND coupon_id = ?', [userId, couponId]);
    if (exist) {
      throw new Error('已领取过该优惠券');
    }
    await db.query('INSERT INTO user_coupon (user_id, coupon_id) VALUES (?, ?)', [userId, couponId]);
    await db.query('UPDATE coupon SET issued = issued + 1 WHERE id = ?', [couponId]);
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 优惠券核销（下单使用）
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} couponId - 优惠券ID
 * @returns {Promise<boolean>} 是否核销成功
 */
async function useCoupon(db, userId, couponId) {
  const res = await db.query(
    'UPDATE user_coupon SET status = \'已使用\', used_at = NOW() WHERE user_id = ? AND coupon_id = ? AND status = \'未使用\'',
    [userId, couponId]
  );
  return res.affectedRows > 0;
}

/**
 * 查询用户可用优惠券
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>} 可用优惠券列表
 */
async function getAvailableCoupons(db, userId) {
  return db.query(
    `SELECT c.* FROM coupon c
     JOIN user_coupon uc ON c.id = uc.coupon_id
     WHERE uc.user_id = ? AND uc.status = '未使用'
       AND c.status = '启用'
       AND NOW() BETWEEN c.start_time AND c.end_time`,
    [userId]
  );
}
```

---

## 5. 优化与总结

- 优惠券、用户优惠券表均建立合理索引，提升查询与并发发放性能。
- 领取、核销等关键操作采用事务与行级锁，防止超发、重复领取。
- 支持多种优惠券类型与活动扩展，便于灵活营销。
- 查询接口支持多条件筛选，便于活动效果分析。
- 实践中需关注并发一致性、优惠券滥用与数据统计准确性。

---

本案例适用于电商、O2O等场景，便于团队快速搭建优惠券与活动管理系统。 