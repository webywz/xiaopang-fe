# PostgreSQL 性能优化（详解）

## 1. 性能优化总览
PostgreSQL 性能优化包括 SQL 查询优化、索引设计、表结构优化、参数调整、硬件资源利用等多个层面。目标是提升响应速度、降低资源消耗、支持高并发。

## 2. 查询优化
- 避免 SELECT *，只查需要字段
- WHERE 子句优先用索引字段，避免在索引字段上做函数/运算
- 复杂查询建议分步拆解，避免一次性大查询
- 使用 EXPLAIN 分析 SQL 执行计划，定位全表扫描、索引失效等问题
- 定期分析慢查询日志（pg_stat_statements、auto_explain）

```sql
EXPLAIN ANALYZE SELECT id, name FROM users WHERE age > 18 ORDER BY created_at DESC LIMIT 10;
```

## 3. 索引优化
- 合理创建单列索引、联合索引，避免冗余和重复索引
- 支持多种索引类型：B-tree（默认）、Hash、GIN、GiST、BRIN、SP-GiST
- 覆盖索引（仅 PostgreSQL 12+ 支持 INCLUDE）可提升查询效率
- LIKE 查询建议用 GIN/GiST 全文索引
- 定期清理无用索引

## 4. 表结构与数据类型优化
- 字段类型选择要精确，能用 INT 不用 BIGINT，能用 VARCHAR(50) 不用 TEXT
- 合理拆分大表，冷热数据分离
- 使用分区表管理超大数据量
- 合理利用 JSONB、数组等复合类型

## 5. 配置参数与硬件优化
- 调整 shared_buffers（推荐占物理内存 25-40%）
- 合理设置 work_mem、maintenance_work_mem、effective_cache_size
- 使用 SSD 替代机械硬盘，提升 IO 性能
- 多核 CPU 支持高并发
- 合理配置 autovacuum，防止表膨胀

## 6. 并发与批量操作优化
- 批量插入/更新建议分批提交，防止锁表
- 大事务拆分为小事务，减少锁竞争
- 读写分离，主库写从库读，提升并发能力
- 使用连接池复用数据库连接

## 7. 常见性能问题与排查方法
- 查询慢：用 EXPLAIN、pg_stat_statements 定位
- 锁等待：pg_locks、pg_stat_activity 分析
- CPU/IO 高：top、iostat、pg_stat_bgwriter 监控
- 连接数爆满：优化连接池、调整 max_connections
- 表膨胀：定期 VACUUM、REINDEX

## 8. Node.js 性能优化代码示例（JSDoc 注释）
```js
/**
 * 批量插入用户（分批提交）
 * @param {import('pg').Pool} pool
 * @param {Array<{name: string, age: number}>} users
 * @param {number} batchSize
 * @returns {Promise<void>}
 */
async function batchInsertUsers(pool, users, batchSize = 100) {
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const values = batch.map(u => `('${u.name}', ${u.age})`).join(',');
    await pool.query(`INSERT INTO users (name, age) VALUES ${values}`);
  }
}

/**
 * 使用连接池提升并发性能
 * @returns {import('pg').Pool}
 */
function createPool() {
  const { Pool } = require('pg');
  return new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '123456',
    database: 'test',
    max: 20
  });
}
```

---

> 性能优化是持续过程，建议定期分析慢查询、监控资源瓶颈，并结合业务实际动态调整优化策略。 