# 售后与退款流程案例

## 1. 需求分析
- 支持用户针对订单发起售后（退货、退款、换货等）申请。
- 售后流程需记录申请、审核、处理、完成等状态流转。
- 支持售后与订单、用户、商品的关联，便于追溯与统计。
- 支持多维度查询与进度跟踪，便于客服处理与管理。
- 具备良好扩展性，便于后续接入更多售后类型与自动化处理。

---

## 2. 表结构设计

### 售后申请表（after_sale）
```sql
CREATE TABLE `after_sale` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '售后ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(16) NOT NULL COMMENT '售后类型（退货/退款/换货）',
  `reason` VARCHAR(255) NOT NULL COMMENT '申请原因',
  `status` VARCHAR(16) NOT NULL DEFAULT '待审核' COMMENT '状态',
  `amount` DECIMAL(10,2) DEFAULT 0 COMMENT '退款金额',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_order (`order_id`),
  INDEX idx_user (`user_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='售后申请表';
```

### 售后状态流转表（after_sale_log）
```sql
CREATE TABLE `after_sale_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `after_sale_id` BIGINT NOT NULL COMMENT '售后ID',
  `from_status` VARCHAR(16) NOT NULL COMMENT '原状态',
  `to_status` VARCHAR(16) NOT NULL COMMENT '新状态',
  `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  `remark` VARCHAR(255) COMMENT '备注',
  INDEX idx_after_sale (`after_sale_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='售后状态流转日志表';
```

---

## 3. 核心 SQL

### 3.1 创建售后申请
```sql
INSERT INTO after_sale (order_id, user_id, type, reason, amount)
VALUES (?, ?, ?, ?, ?);

INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark)
VALUES (?, '', '待审核', '用户提交售后申请');
```

### 3.2 审核售后申请
```sql
UPDATE after_sale SET status = ?, updated_at = NOW()
WHERE id = ? AND status = '待审核';

INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark)
VALUES (?, '待审核', ?, ?);
```

### 3.3 处理售后（退款/退货/换货）
```sql
UPDATE after_sale SET status = ?, updated_at = NOW()
WHERE id = ? AND status = ?;

INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark)
VALUES (?, ?, ?, ?);
```

### 3.4 查询用户售后申请
```sql
SELECT * FROM after_sale WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 创建售后申请
 * @param {object} db - 数据库连接对象
 * @param {object} afterSale - 售后申请信息
 * @returns {Promise<number>} 新售后ID
 */
async function createAfterSale(db, afterSale) {
  await db.beginTransaction();
  try {
    const result = await db.query(
      'INSERT INTO after_sale (order_id, user_id, type, reason, amount) VALUES (?, ?, ?, ?, ?)',
      [afterSale.order_id, afterSale.user_id, afterSale.type, afterSale.reason, afterSale.amount]
    );
    const afterSaleId = result.insertId;
    await db.query(
      'INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [afterSaleId, '', '待审核', '用户提交售后申请']
    );
    await db.commit();
    return afterSaleId;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 审核售后申请
 * @param {object} db - 数据库连接对象
 * @param {number} afterSaleId - 售后ID
 * @param {string} toStatus - 新状态
 * @param {string} remark - 备注
 * @returns {Promise<boolean>} 是否审核成功
 */
async function auditAfterSale(db, afterSaleId, toStatus, remark) {
  await db.beginTransaction();
  try {
    const res = await db.query(
      'UPDATE after_sale SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?',[toStatus, afterSaleId, '待审核']
    );
    if (res.affectedRows === 0) throw new Error('状态已变更或不存在');
    await db.query(
      'INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [afterSaleId, '待审核', toStatus, remark]
    );
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 处理售后（退款/退货/换货）
 * @param {object} db - 数据库连接对象
 * @param {number} afterSaleId - 售后ID
 * @param {string} fromStatus - 原状态
 * @param {string} toStatus - 新状态
 * @param {string} remark - 备注
 * @returns {Promise<boolean>} 是否处理成功
 */
async function processAfterSale(db, afterSaleId, fromStatus, toStatus, remark) {
  await db.beginTransaction();
  try {
    const res = await db.query(
      'UPDATE after_sale SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?',
      [toStatus, afterSaleId, fromStatus]
    );
    if (res.affectedRows === 0) throw new Error('状态已变更或不存在');
    await db.query(
      'INSERT INTO after_sale_log (after_sale_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [afterSaleId, fromStatus, toStatus, remark]
    );
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 查询用户售后申请
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 售后申请列表
 */
async function getUserAfterSales(db, userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM after_sale WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [userId, offset, pageSize]
  );
}
```

---

## 5. 优化与总结

- 售后申请、状态日志表均建立合理索引，提升查询与流转效率。
- 售后流程各环节均采用事务，保障状态一致性与可追溯性。
- 售后类型、状态可灵活扩展，适应多样化业务需求。
- 查询接口支持分页与多条件筛选，便于客服高效处理。
- 实践中需关注售后超时、异常处理与自动化流转能力。

---

本案例适用于电商、O2O等场景，便于团队快速搭建售后与退款管理系统。 