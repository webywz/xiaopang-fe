# MySQL 性能优化（详解）

## 1. 性能优化总览
MySQL 性能优化包括 SQL 查询优化、索引设计、表结构优化、服务器参数调整、硬件资源利用等多个层面。优化目标是提升响应速度、降低资源消耗、支持高并发。

## 2. 查询优化
- **避免 SELECT ***，只查需要的字段。
- WHERE 子句优先使用索引字段，避免在索引字段上做函数/运算。
- 使用 LIMIT 分页时推荐 keyset 分页（如 where id > ? limit n）。
- 复杂查询建议分步拆解，避免一次性大查询。
- 使用 EXPLAIN 分析 SQL 执行计划，定位全表扫描、索引失效等问题。
- 定期分析慢查询日志（slow query log）。

```sql
EXPLAIN SELECT id, name FROM users WHERE age > 18 ORDER BY created_at DESC LIMIT 10;
```

## 3. 索引优化
- 合理创建单列索引、联合索引，避免冗余和重复索引。
- 覆盖索引（查询字段全部在索引中）可提升查询效率。
- 避免在频繁更新的字段上建索引。
- LIKE 查询尽量避免前置通配符（如 LIKE '%abc'），可用全文索引。
- 定期清理无用索引。

## 4. 表结构与数据类型优化
- 字段类型选择要精确，能用 INT 不用 BIGINT，能用 VARCHAR(50) 不用 VARCHAR(255)。
- 尽量避免 NULL 字段，影响索引效率。
- 合理拆分大表，冷热数据分离。
- 使用分区表管理超大数据量。

## 5. 服务器参数与硬件优化
- 调整 innodb_buffer_pool_size（推荐占物理内存 60-80%）。
- 合理设置 max_connections、query_cache_size、tmp_table_size 等参数。
- 使用 SSD 替代机械硬盘，提升 IO 性能。
- 多核 CPU 支持高并发。

## 6. 批量与并发操作优化
- 批量插入/更新建议分批提交，防止锁表。
- 大事务拆分为小事务，减少锁竞争。
- 读写分离，主库写从库读，提升并发能力。
- 使用连接池复用数据库连接。

## 7. 常见性能问题与排查方法
- 查询慢：用 EXPLAIN、慢查询日志定位。
- 锁等待：SHOW PROCESSLIST、INFORMATION_SCHEMA 分析。
- CPU/IO 高：top、iostat、MySQL status 监控。
- 连接数爆满：优化连接池、调整 max_connections。

## 8. Node.js 性能优化代码示例（JSDoc 注释）
```js
/**
 * 批量插入用户（分批提交）
 * @param {import('mysql2/promise').Connection} conn
 * @param {Array<{name: string, age: number}>} users
 * @param {number} batchSize
 * @returns {Promise<void>}
 */
async function batchInsertUsers(conn, users, batchSize = 100) {
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const values = batch.map(u => [u.name, u.age]);
    await conn.query('INSERT INTO users (name, age) VALUES ?', [values]);
  }
}

/**
 * 使用连接池提升并发性能
 * @returns {import('mysql2/promise').Pool}
 */
function createPool() {
  const mysql = require('mysql2/promise');
  return mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 10
  });
}
```

---

> 性能优化是持续过程，建议定期分析慢查询、监控资源瓶颈，并结合业务实际动态调整优化策略。 