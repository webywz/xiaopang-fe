# 数据归档自动化与冷热分离案例

## 1. 需求分析
- 支持大表历史数据自动归档，降低主库压力。
- 支持冷热数据分区，提升查询与写入性能。
- 支持归档策略配置、归档日志记录与归档数据查询。
- 支持归档数据的安全存储与快速恢复。
- 具备良好扩展性，便于后续接入多表、多策略归档。

---

## 2. 表结构设计

### 业务主表（order）
```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `status` VARCHAR(32) NOT NULL COMMENT '订单状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  INDEX idx_user (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

### 归档表（order_archive）
```sql
CREATE TABLE `order_archive` (
  `id` BIGINT PRIMARY KEY COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `status` VARCHAR(32) NOT NULL COMMENT '订单状态',
  `created_at` DATETIME COMMENT '下单时间',
  `archived_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '归档时间',
  INDEX idx_user (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_created (`created_at`),
  INDEX idx_archived (`archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单归档表';
```

### 归档日志表（archive_log）
```sql
CREATE TABLE `archive_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `table_name` VARCHAR(64) NOT NULL COMMENT '归档表名',
  `start_time` DATETIME COMMENT '归档起始时间',
  `end_time` DATETIME COMMENT '归档结束时间',
  `row_count` INT NOT NULL COMMENT '归档行数',
  `status` VARCHAR(16) NOT NULL COMMENT '归档状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '归档时间',
  INDEX idx_table (`table_name`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='归档日志表';
```

---

## 3. 核心 SQL

### 3.1 归档历史订单（如归档一年以前数据）
```sql
-- 1. 插入归档表
INSERT INTO order_archive (id, user_id, amount, status, created_at)
SELECT id, user_id, amount, status, created_at
FROM `order`
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- 2. 删除主表中已归档数据
DELETE FROM `order` WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 3.2 写入归档日志
```sql
INSERT INTO archive_log (table_name, start_time, end_time, row_count, status)
VALUES (?, ?, ?, ?, ?);
```

### 3.3 查询归档数据
```sql
SELECT * FROM order_archive WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 归档历史订单（如归档一年以前数据）
 * @param {object} db - 数据库连接对象
 * @returns {Promise<number>} 归档行数
 */
async function archiveOldOrders(db) {
  await db.beginTransaction();
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS cnt FROM `order` WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)'
    );
    const rowCount = rows.cnt;
    await db.query(
      `INSERT INTO order_archive (id, user_id, amount, status, created_at)
       SELECT id, user_id, amount, status, created_at FROM \\`order\\`
       WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)`
    );
    await db.query(
      'DELETE FROM `order` WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)'
    );
    await db.query(
      'INSERT INTO archive_log (table_name, start_time, end_time, row_count, status) VALUES (?, ?, ?, ?, ?)',
      ['order_archive', null, null, rowCount, '成功']
    );
    await db.commit();
    return rowCount;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 查询归档订单
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 归档订单列表
 */
async function getArchivedOrders(db, userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM order_archive WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [userId, offset, pageSize]
  );
}
```

---

## 5. 优化与总结

- 主表、归档表均建立合理索引，提升归档与查询性能。
- 归档操作建议定时批量执行，避免影响主库性能。
- 支持多表、多策略归档，便于灵活扩展。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注归档一致性、数据安全与恢复效率。

---

本案例适用于电商、金融等大数据量场景，便于团队快速搭建自动归档与冷热分离体系。 