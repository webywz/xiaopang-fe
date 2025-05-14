# 实时库存监控案例

## 1. 需求分析
- 支持商品库存的实时变更、查询与预警。
- 支持高并发下的安全扣减与库存一致性保障。
- 支持库存变动日志，便于追溯与分析。
- 支持库存预警（如低于阈值自动通知）。
- 具备良好扩展性，便于后续接入多仓库、多渠道等场景。

---

## 2. 表结构设计

### 商品表（product）
```sql
CREATE TABLE `product` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `stock` INT NOT NULL COMMENT '当前库存',
  `stock_threshold` INT DEFAULT 0 COMMENT '库存预警阈值',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_name (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 库存变动日志表（stock_log）
```sql
CREATE TABLE `stock_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `change` INT NOT NULL COMMENT '变动数量（正为入库，负为出库）',
  `type` VARCHAR(32) NOT NULL COMMENT '变动类型（入库/出库/订单/盘点等）',
  `remark` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变动时间',
  INDEX idx_product (`product_id`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存变动日志表';
```

---

## 3. 核心 SQL

### 3.1 安全扣减库存（防止超卖）
```sql
UPDATE product SET stock = stock - ?
WHERE id = ? AND stock >= ?;

INSERT INTO stock_log (product_id, `change`, type, remark)
VALUES (?, -?, '订单', ?);
```

### 3.2 入库操作
```sql
UPDATE product SET stock = stock + ? WHERE id = ?;

INSERT INTO stock_log (product_id, `change`, type, remark)
VALUES (?, ?, '入库', ?);
```

### 3.3 查询库存与预警
```sql
SELECT * FROM product WHERE stock <= stock_threshold;
```

### 3.4 查询库存变动日志
```sql
SELECT * FROM stock_log WHERE product_id = ? ORDER BY created_at DESC LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 安全扣减库存（下单）
 * @param {object} db - 数据库连接对象
 * @param {number} productId - 商品ID
 * @param {number} quantity - 扣减数量
 * @param {string} remark - 备注
 * @returns {Promise<boolean>} 是否扣减成功
 */
async function deductStock(db, productId, quantity, remark) {
  await db.beginTransaction();
  try {
    const res = await db.query(
      'UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity]
    );
    if (res.affectedRows === 0) throw new Error('库存不足');
    await db.query(
      'INSERT INTO stock_log (product_id, `change`, type, remark) VALUES (?, ?, ?, ?)',
      [productId, -quantity, '订单', remark]
    );
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 入库操作
 * @param {object} db - 数据库连接对象
 * @param {number} productId - 商品ID
 * @param {number} quantity - 入库数量
 * @param {string} remark - 备注
 * @returns {Promise<void>}
 */
async function addStock(db, productId, quantity, remark) {
  await db.beginTransaction();
  try {
    await db.query(
      'UPDATE product SET stock = stock + ? WHERE id = ?',
      [quantity, productId]
    );
    await db.query(
      'INSERT INTO stock_log (product_id, `change`, type, remark) VALUES (?, ?, ?, ?)',
      [productId, quantity, '入库', remark]
    );
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 查询库存预警商品
 * @param {object} db - 数据库连接对象
 * @returns {Promise<Array>} 预警商品列表
 */
async function getStockWarnings(db) {
  return db.query('SELECT * FROM product WHERE stock <= stock_threshold');
}

/**
 * 查询库存变动日志
 * @param {object} db - 数据库连接对象
 * @param {number} productId - 商品ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 日志列表
 */
async function getStockLogs(db, productId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM stock_log WHERE product_id = ? ORDER BY created_at DESC LIMIT ?, ?',
    [productId, offset, pageSize]
  );
}
```

---

## 5. 优化与总结

- 商品表、库存日志表均建立合理索引，提升高并发下的查询与写入性能。
- 扣减、入库等操作均采用事务，保障库存一致性。
- 支持库存预警与自动通知，便于及时补货。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注库存超卖、并发冲突与多仓库扩展。

---

本案例适用于电商、仓储等场景，便于团队快速搭建实时库存监控系统。 