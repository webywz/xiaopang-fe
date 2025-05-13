# 数据库调优

数据库调优是保障系统高可用、高性能的核心环节，涉及参数配置、硬件资源、架构设计等多方面。

## 参数调优
- 合理设置 `innodb_buffer_pool_size`、`max_connections`、`query_cache_size` 等参数。
- 根据业务负载动态调整参数。

## 硬件优化
- 提升磁盘 IOPS，优先使用 SSD。
- 增加内存，提升缓存命中率。
- 多核 CPU 提升并发处理能力。

## 分库分表
- 水平分表：按主键范围或哈希分散大表数据。
- 垂直分库：将不同业务表分布到不同数据库。

## 连接池与缓存
- 使用连接池（如 `mysql2`、`pg-pool`）减少连接开销。
- 结合 Redis/Memcached 缓存热点数据，减轻数据库压力。

## 监控与报警
- 监控 QPS、TPS、慢查询、锁等待等关键指标。
- 配置自动报警，及时发现异常。

## 最佳实践
- 定期巡检数据库健康状况。
- 备份与恢复策略完善，防止数据丢失。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 使用连接池查询用户
 * @param {import('mysql').Pool} pool - 连接池对象
 * @param {number} id - 用户ID
 * @returns {Promise<{id: number, name: string, age: number}>}
 */
function getUserById(pool, id) {
  return pool.query('SELECT id, name, age FROM users WHERE id = ?', [id]);
}
``` 