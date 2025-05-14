# SQL 性能调优专题

## 1. 性能调优总览与常见瓶颈
- 常见瓶颈：全表扫描、索引未命中、慢查询、锁等待、网络延迟、硬件资源不足
- 优化思路：优先分析 SQL 执行计划，定位慢点，逐步优化

## 2. 索引优化
- 合理选择主键、唯一索引、联合索引
- 常用类型：B-Tree、Hash、GIN、GiST（PostgreSQL）
- WHERE、JOIN、ORDER BY、GROUP BY 字段优先考虑加索引
- 避免在频繁变更字段、低基数字段上建索引
- 注意索引覆盖与冗余，定期清理无用索引

## 3. 查询优化
- 使用 EXPLAIN/EXPLAIN ANALYZE 分析执行计划
- 避免 SELECT *，明确字段名
- WHERE 条件写法影响索引命中（如函数包裹、隐式转换）
- 优化 JOIN 顺序，减少嵌套子查询
- 合理拆分/合并 SQL，减少网络往返

## 4. 批量与分页优化
- 批量插入/更新建议分批处理，减少单次数据量
- 大数据分页优先用 keyset/游标分页，避免 OFFSET 大量跳过
- 示例：
```sql
-- keyset 分页
SELECT * FROM orders WHERE id > $lastId ORDER BY id ASC LIMIT 20;
```

## 5. 事务与并发控制优化
- 事务范围尽量小，减少锁持有时间
- 合理选择隔离级别，避免不必要的串行化
- 捕获死锁异常并重试
- 读多写少场景可用只读副本分担压力

## 6. 数据库参数与硬件优化
- 合理配置连接池、缓存、内存、磁盘 IO
- 定期监控慢查询、锁等待、资源利用率
- SSD 替代机械硬盘提升 IO 性能
- 分库分表/分区表应对超大数据量

## 7. 典型代码片段（含 JSDoc 注释）
```js
/**
 * 使用 EXPLAIN 分析 SQL 执行计划
 * @param {import('pg').Pool} pool
 * @param {string} sql - 需分析的 SQL
 * @returns {Promise<Array>} 执行计划
 */
async function explainQuery(pool, sql) {
  const { rows } = await pool.query('EXPLAIN ' + sql);
  return rows;
}

/**
 * Keyset 分页查询
 * @param {import('pg').Pool} pool
 * @param {number} lastId
 * @param {number} limit
 * @returns {Promise<Array>} 订单列表
 */
async function getOrdersByKeyset(pool, lastId, limit) {
  const sql = 'SELECT * FROM orders WHERE id > $1 ORDER BY id ASC LIMIT $2';
  const { rows } = await pool.query(sql, [lastId, limit]);
  return rows;
}
```

## 8. 性能调优工具推荐
- [explain.depesz.com](https://explain.depesz.com/)（PostgreSQL 执行计划分析）
- [pt-query-digest](https://www.percona.com/software/database-tools/percona-toolkit)（MySQL 慢查询分析）
- [pgBadger](https://github.com/dalibo/pgbadger)（PostgreSQL 日志分析）
- 数据库自带监控与慢查询日志

---

性能调优是持续过程，建议定期分析、监控与总结，团队协作提升整体数据服务能力。 