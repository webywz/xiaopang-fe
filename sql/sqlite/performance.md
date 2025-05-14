# SQLite 性能优化

## 1. 性能调优总览与常见瓶颈
- 常见瓶颈：全表扫描、索引未命中、慢查询、锁等待、磁盘 IO、并发冲突
- 优化思路：优先分析 SQL 执行计划，定位慢点，逐步优化

## 2. 索引优化
- 合理选择 B-Tree、唯一索引、复合索引
- WHERE、JOIN、ORDER BY、GROUP BY 字段优先考虑加索引
- 避免在低基数字段上滥用索引
- 定期重建/分析索引，清理无用索引

## 3. 查询优化
- 使用 EXPLAIN 分析执行计划
- 避免 SELECT *，明确字段名
- WHERE 条件避免函数包裹、类型不匹配
- 合理拆分/合并 SQL，减少网络往返

## 4. 批量与分页优化
- 批量插入/更新建议分批处理，减少单次数据量
- 大表分页优先用主键游标法，避免 OFFSET 大量跳过
```sql
-- 主键游标分页
SELECT * FROM orders WHERE id > ? ORDER BY id ASC LIMIT 20;
```

## 5. 事务与并发控制优化
- 事务范围尽量小，减少锁持有时间
- WAL 模式提升并发读写能力
- 捕获死锁异常并重试

## 6. 数据库参数与硬件优化
- 合理配置缓存、内存、磁盘 IO
- SSD 替代机械硬盘提升 IO 性能
- 定期 VACUUM 优化数据库文件

## 7. 典型代码片段（含 JSDoc 注释）
```js
/**
 * 使用 EXPLAIN 分析 SQL 执行计划
 * @param {sqlite3.Database} db
 * @param {string} sql - 需分析的 SQL
 * @returns {Promise<Array>} 执行计划
 */
function explainQuery(db, sql) {
  return new Promise((resolve, reject) => {
    db.all('EXPLAIN ' + sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * 主键游标分页查询
 * @param {sqlite3.Database} db
 * @param {number} lastId
 * @param {number} limit
 * @returns {Promise<Array>} 订单列表
 */
function getOrdersByKeyset(db, lastId, limit) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders WHERE id > ? ORDER BY id ASC LIMIT ?', [lastId, limit], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
```

## 8. 性能调优工具推荐
- sqlite3 CLI（EXPLAIN、ANALYZE）
- DB Browser for SQLite（可视化分析）
- 数据库自带监控与日志

---

性能调优是持续过程，建议定期分析、监控与总结，团队协作提升整体数据服务能力。 