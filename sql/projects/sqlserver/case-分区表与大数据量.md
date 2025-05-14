# SQL Server 实战案例：分区表与大数据量

## 1. 需求描述
以"订单历史归档"为例，要求在订单量极大时，提升查询与维护效率，支持按月分区、快速归档与清理历史数据，适合金融、电商、日志等大数据量场景。

## 2. 表结构设计
```sql
-- 创建分区函数
CREATE PARTITION FUNCTION pf_orders_by_month (DATE)
AS RANGE LEFT FOR VALUES ('2024-02-01', '2024-03-01');

-- 创建分区方案
CREATE PARTITION SCHEME ps_orders_by_month
AS PARTITION pf_orders_by_month ALL TO ([PRIMARY]);

-- 创建分区表
CREATE TABLE orders (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  order_no NVARCHAR(32) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status NVARCHAR(16) NOT NULL,
  created_at DATE NOT NULL,
  CONSTRAINT uq_order_no UNIQUE(order_no)
)
ON ps_orders_by_month(created_at);
```

## 3. 核心 SQL 示例
```sql
-- 插入数据自动路由到分区
INSERT INTO orders (user_id, order_no, amount, status, created_at)
VALUES (1, 'ORD20240101001', 100.00, 'paid', '2024-01-01');

-- 查询指定月份订单
SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- 归档/清理历史分区（拆分/合并分区）
ALTER PARTITION FUNCTION pf_orders_by_month() SPLIT RANGE ('2024-04-01');
-- 删除分区数据可用分区切换或分批删除

-- 查看分区表结构
SELECT * FROM sys.partitions WHERE object_id = OBJECT_ID('orders');
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 查询指定月份订单
 * @param {import('mssql').ConnectionPool} pool
 * @param {string} start - 开始日期 '2024-01-01'
 * @param {string} end - 结束日期 '2024-02-01'
 * @returns {Promise<Array>}
 */
async function getOrdersByMonth(pool, start, end) {
  const result = await pool.request()
    .input('start', start)
    .input('end', end)
    .query('SELECT * FROM orders WHERE created_at >= @start AND created_at < @end');
  return result.recordset;
}

/**
 * 自动归档历史分区（分批删除历史数据）
 * @param {import('mssql').ConnectionPool} pool
 * @param {string} beforeDate - 删除该日期前的数据
 * @returns {Promise<void>}
 */
async function archiveOldOrders(pool, beforeDate) {
  await pool.request()
    .input('beforeDate', beforeDate)
    .query('DELETE FROM orders WHERE created_at < @beforeDate');
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

本案例适合金融、电商、日志等大数据量场景，建议结合业务需求灵活调整分区策略。 