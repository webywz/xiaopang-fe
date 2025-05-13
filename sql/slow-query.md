# SQL 慢查询分析

慢查询是数据库性能瓶颈的主要来源。及时发现和优化慢查询对系统稳定性至关重要。

## 什么是慢查询
- 执行时间超过设定阈值（如 1 秒）的 SQL 语句。
- 频繁出现的慢查询会拖慢整体数据库性能。

## 常见原因
- 未命中索引，导致全表扫描。
- 复杂的多表 JOIN 或嵌套子查询。
- 大量数据排序、分组。
- 网络延迟或锁等待。

## 慢查询日志
- MySQL 可通过 `slow_query_log` 记录慢查询。
- 日志内容包括 SQL 语句、执行时间、扫描行数等。

## 分析方法
- 使用 `mysqldumpslow`、`pt-query-digest` 等工具聚合分析慢日志。
- 结合 `EXPLAIN` 分析执行计划。

## 优化技巧
- 为高频慢查询字段加索引。
- 拆分复杂 SQL，减少嵌套。
- 优化表结构，避免大表全表扫描。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询慢查询日志（MySQL 5.6+）
 * @param {import('mysql').Connection} conn
 * @returns {Promise<Array<{start_time: string, user_host: string, query_time: string, sql_text: string}>>}
 */
function getSlowQueries(conn) {
  return conn.query('SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10');
}
``` 