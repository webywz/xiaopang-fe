# SQL 性能优化

SQL 性能优化是保障数据库高效运行的关键。合理的优化策略能显著提升查询速度和系统吞吐量。

## 优化原则
- 优先优化慢 SQL，关注高频慢查询。
- 合理设计表结构和索引。
- 避免全表扫描，减少不必要的嵌套查询。

## 执行计划分析
- 使用 `EXPLAIN` 查看 SQL 执行计划，定位瓶颈。

```sql
EXPLAIN SELECT * FROM users WHERE age > 18;
```

## 常见慢点
- 未命中索引导致全表扫描。
- 复杂的 JOIN、子查询。
- 大量数据的排序、分组。

## 索引优化
- 只为高选择性字段建索引。
- 组合索引顺序需与查询条件匹配。

## 分库分表
- 大表可按业务分区、分表，提升并发能力。

## 最佳实践
- 定期分析慢查询日志。
- 监控数据库负载，及时调整参数。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 获取执行计划
 * @param {import('mysql').Connection} conn
 * @param {string} sql
 * @returns {Promise<any>}
 */
function getExplain(conn, sql) {
  return conn.query('EXPLAIN ' + sql);
}
``` 