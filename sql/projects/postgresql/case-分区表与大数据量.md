# PostgreSQL 实战案例：分区表与大数据量

## 1. 需求描述
以"订单历史归档"为例，要求在订单量极大时，提升查询与维护效率，支持按月分区、快速归档与清理历史数据，适用于电商、金融、日志等大数据量场景。

## 2. 表结构设计
```sql
-- 创建主分区表
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  order_no VARCHAR(32) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  -- 其他字段
  UNIQUE (order_no)
) PARTITION BY RANGE (created_at);

-- 创建按月分区
CREATE TABLE orders_2024_01 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE orders_2024_02 PARTITION OF orders
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- 可按需自动化创建更多分区
```

## 3. 核心 SQL 示例
```sql
-- 插入数据自动路由到分区
INSERT INTO orders (user_id, order_no, amount, status, created_at)
VALUES (1, 'ORD20240101001', 100.00, 'paid', '2024-01-01 10:00:00');

-- 查询指定月份订单
SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- 归档/清理历史分区
DROP TABLE orders_2023_12;

-- 查看分区表结构
\d+ orders
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询指定月份订单（分区表自动优化）
 * @param {import('pg').Pool} pool
 * @param {string} month - 形如 '2024-01'
 * @returns {Promise<Array>} 订单列表
 */
async function getOrdersByMonth(pool, month) {
  const start = `${month}-01`;
  const end = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString().slice(0, 10);
  const sql = 'SELECT * FROM orders WHERE created_at >= $1 AND created_at < $2';
  const { rows } = await pool.query(sql, [start, end]);
  return rows;
}

/**
 * 自动归档历史分区（删除指定分区表）
 * @param {import('pg').Pool} pool
 * @param {string} partitionName - 分区表名，如 'orders_2023_12'
 * @returns {Promise<void>}
 */
async function dropOrderPartition(pool, partitionName) {
  await pool.query(`DROP TABLE IF EXISTS ${partitionName}`);
}
```

## 5. 优化与总结
- 合理选择分区键（如时间、ID范围），避免数据倾斜
- 定期创建新分区、归档旧分区，提升维护效率
- 分区表可单独建索引，提升分区内查询性能
- 查询时带分区键条件，充分利用分区裁剪
- 注意分区数量过多可能影响元数据管理
- 可结合自动化脚本定期维护分区

---

> 本案例适合电商、金融、日志等大数据量场景，建议结合业务需求灵活调整分区策略。 