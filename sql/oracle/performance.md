# Oracle 性能优化

## 1. 性能调优总览与常见瓶颈
- 常见瓶颈：全表扫描、索引未命中、慢查询、锁等待、网络延迟、硬件资源不足
- 优化思路：优先分析 SQL 执行计划，定位慢点，逐步优化

## 2. 索引优化
- 合理选择 B-Tree、Bitmap、Function-based 索引
- WHERE、JOIN、ORDER BY、GROUP BY 字段优先考虑加索引
- 避免在频繁变更字段、低基数字段上滥用索引
- 定期重建/分析索引，清理无用索引

## 3. 查询优化
- 使用 EXPLAIN PLAN 分析执行计划
- 避免 SELECT *，明确字段名
- WHERE 条件避免函数包裹、隐式类型转换
- 优化 JOIN 顺序，减少嵌套子查询
- 合理拆分/合并 SQL，减少网络往返

## 4. 批量与分页优化
- 批量插入/更新建议分批处理，减少单次数据量
- 大表分页优先用主键游标法，避免 OFFSET 大量跳过
```sql
-- 主键游标分页
SELECT * FROM orders WHERE id > :lastId ORDER BY id ASC FETCH NEXT 20 ROWS ONLY;
```

## 5. 事务与并发控制优化
- 事务范围尽量小，减少锁持有时间
- 合理选择隔离级别，避免不必要的串行化
- 捕获死锁异常并重试
- 读多写少场景可用只读副本分担压力

## 6. 数据库参数与硬件优化
- 合理配置 SGA/PGA、连接池、内存、磁盘 IO
- 定期监控慢查询、锁等待、资源利用率
- SSD 替代机械硬盘提升 IO 性能
- 分区表/分区索引应对超大数据量

## 7. 典型代码片段（含 JSDoc 注释）
```js
/**
 * 使用 EXPLAIN PLAN 分析 SQL 执行计划
 * @param {oracledb.Connection} conn
 * @param {string} sql - 需分析的 SQL
 * @returns {Promise<Array>} 执行计划
 */
async function explainQuery(conn, sql) {
  await conn.execute('EXPLAIN PLAN FOR ' + sql);
  const result = await conn.execute('SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY())');
  return result.rows;
}

/**
 * 主键游标分页查询
 * @param {oracledb.Connection} conn
 * @param {number} lastId
 * @param {number} limit
 * @returns {Promise<Array>} 订单列表
 */
async function getOrdersByKeyset(conn, lastId, limit) {
  const result = await conn.execute(
    'SELECT * FROM orders WHERE id > :lastId ORDER BY id ASC FETCH NEXT :limit ROWS ONLY',
    { lastId, limit }
  );
  return result.rows;
}
```

## 8. 性能调优工具推荐
- AWR/ASH/ADDM（Oracle 性能分析工具）
- SQL*Plus、SQL Developer（执行计划分析）
- OEM/Cloud Control（监控与告警）
- 数据库自带监控与慢查询日志

---

性能调优是持续过程，建议定期分析、监控与总结，团队协作提升整体数据服务能力。 