# 复杂报表与多维分析案例

## 1. 需求分析
- 支持订单、用户、商品等多维度的统计与分析。
- 支持按时间、地区、品类等多条件灵活聚合。
- 支持多种报表类型（如销售额、用户活跃、商品排行等）。
- 支持大数据量下的高效查询与分页。
- 具备良好扩展性，便于后续接入更多分析维度与报表类型。

---

## 2. 表结构设计

### 订单表（order）
```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `region` VARCHAR(32) COMMENT '地区',
  `category` VARCHAR(32) COMMENT '商品品类',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  INDEX idx_user (`user_id`),
  INDEX idx_product (`product_id`),
  INDEX idx_region (`region`),
  INDEX idx_category (`category`),
  INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

---

## 3. 核心 SQL

### 3.1 按天/周/月统计销售额
```sql
SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, SUM(amount) AS total_amount, COUNT(*) AS order_count
FROM `order`
WHERE created_at BETWEEN ? AND ?
GROUP BY day
ORDER BY day;
```

### 3.2 按地区、品类统计销售额
```sql
SELECT region, category, SUM(amount) AS total_amount, COUNT(*) AS order_count
FROM `order`
WHERE created_at BETWEEN ? AND ?
GROUP BY region, category
ORDER BY total_amount DESC;
```

### 3.3 商品销售排行
```sql
SELECT product_id, SUM(amount) AS total_amount, COUNT(*) AS order_count
FROM `order`
WHERE created_at BETWEEN ? AND ?
GROUP BY product_id
ORDER BY total_amount DESC
LIMIT 10;
```

### 3.4 用户活跃度统计
```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM `order`
WHERE created_at BETWEEN ? AND ?
GROUP BY user_id
ORDER BY order_count DESC
LIMIT 10;
```

---

## 4. Node.js 代码实现

```js
/**
 * 按天统计销售额
 * @param {object} db - 数据库连接对象
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise<Array>} 统计结果
 */
async function getDailySales(db, startDate, endDate) {
  return db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, SUM(amount) AS total_amount, COUNT(*) AS order_count
     FROM \\`order\\`
     WHERE created_at BETWEEN ? AND ?
     GROUP BY day
     ORDER BY day`,
    [startDate, endDate]
  );
}

/**
 * 按地区、品类统计销售额
 * @param {object} db - 数据库连接对象
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 结束日期
 * @returns {Promise<Array>} 统计结果
 */
async function getRegionCategorySales(db, startDate, endDate) {
  return db.query(
    `SELECT region, category, SUM(amount) AS total_amount, COUNT(*) AS order_count
     FROM \\`order\\`
     WHERE created_at BETWEEN ? AND ?
     GROUP BY region, category
     ORDER BY total_amount DESC`,
    [startDate, endDate]
  );
}

/**
 * 商品销售排行
 * @param {object} db - 数据库连接对象
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 结束日期
 * @param {number} limit - 排行榜数量
 * @returns {Promise<Array>} 排行榜
 */
async function getProductRanking(db, startDate, endDate, limit = 10) {
  return db.query(
    `SELECT product_id, SUM(amount) AS total_amount, COUNT(*) AS order_count
     FROM \\`order\\`
     WHERE created_at BETWEEN ? AND ?
     GROUP BY product_id
     ORDER BY total_amount DESC
     LIMIT ?`,
    [startDate, endDate, limit]
  );
}

/**
 * 用户活跃度统计
 * @param {object} db - 数据库连接对象
 * @param {string} startDate - 起始日期
 * @param {string} endDate - 结束日期
 * @param {number} limit - 排行榜数量
 * @returns {Promise<Array>} 用户活跃度排行
 */
async function getUserActivity(db, startDate, endDate, limit = 10) {
  return db.query(
    `SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
     FROM \\`order\\`
     WHERE created_at BETWEEN ? AND ?
     GROUP BY user_id
     ORDER BY order_count DESC
     LIMIT ?`,
    [startDate, endDate, limit]
  );
}
```

---

## 5. 优化与总结

- 订单表建立多维索引，提升多条件聚合与统计性能。
- 报表查询建议异步化、分批处理，避免影响主业务库。
- 支持多维度灵活扩展，适应复杂业务分析需求。
- 查询接口支持分页与参数化，适应大数据量场景。
- 实践中需关注统计准确性、性能瓶颈与数据安全。

---

本案例适用于电商、SaaS等场景，便于团队快速搭建复杂报表与多维分析系统。 