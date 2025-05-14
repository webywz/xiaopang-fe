# PostgreSQL 视图与索引（详解）

## 1. 视图（View）基础
- 视图是基于 SQL 查询结果的虚拟表，不存储实际数据。
- 适合封装复杂查询、权限隔离、简化多表操作。
- 支持普通视图和物化视图（Materialized View）。

## 2. 视图的创建与管理
```sql
-- 创建普通视图
CREATE VIEW active_users AS SELECT id, name FROM users WHERE status = 'active';
-- 查询视图
SELECT * FROM active_users;
-- 修改视图
CREATE OR REPLACE VIEW active_users AS SELECT id, name, age FROM users WHERE status = 'active';
-- 删除视图
DROP VIEW active_users;
```

## 3. 物化视图（Materialized View）
- 存储查询结果，支持索引，需定期刷新
```sql
CREATE MATERIALIZED VIEW user_stats AS SELECT status, COUNT(*) FROM users GROUP BY status;
REFRESH MATERIALIZED VIEW user_stats;
```

## 4. 视图的优缺点与最佳实践
- **优点**：
  - 简化复杂 SQL，提升可读性
  - 权限隔离，限制字段/行访问
  - 便于代码复用
- **缺点**：
  - 普通视图不能加索引，部分场景性能较差
  - 物化视图需手动刷新，数据有延迟
- **最佳实践**：
  - 只读视图优先，避免在视图上做 DML 操作
  - 复杂视图建议分层设计
  - 频繁聚合用物化视图+索引

## 5. 索引（Index）基础与类型
- 索引是加速数据检索的数据结构，常用 B-tree 实现
- **主键索引（PRIMARY KEY）**：唯一且非空
- **唯一索引（UNIQUE）**：唯一但可空
- **普通索引（INDEX）**：加速查询
- **部分索引**：带 WHERE 条件的索引
- **表达式索引**：基于表达式的索引
- **多种索引类型**：B-tree、Hash、GIN、GiST、BRIN、SP-GiST

## 6. 索引的创建与管理
```sql
-- 创建普通索引
CREATE INDEX idx_users_age ON users(age);
-- 创建唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);
-- 创建部分索引
CREATE INDEX idx_active_users ON users(age) WHERE status = 'active';
-- 创建表达式索引
CREATE INDEX idx_lower_email ON users(LOWER(email));
-- 删除索引
DROP INDEX idx_users_age;
-- 查看表索引
\di users*
```

## 7. 索引优化建议
- 优先为高频查询的 WHERE、ORDER BY、JOIN 字段建索引
- 部分索引、表达式索引可提升特定场景性能
- GIN/GiST 适合 JSONB、数组、全文检索
- 避免在频繁更新的字段上建索引
- 避免冗余、重复索引
- 覆盖索引（INCLUDE）可提升查询效率（PostgreSQL 12+）

## 8. 索引失效常见原因与排查
- WHERE 字段做函数/运算，索引失效（可用表达式索引）
- LIKE '%abc' 前置通配符，B-tree 索引失效（可用 GIN）
- 隐式类型转换导致索引失效
- 查询未命中联合索引的最左前缀
- 排查方法：EXPLAIN 分析执行计划

## 9. SQL 及 Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询活跃用户视图
 * @param {import('pg').Pool} pool
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function getActiveUsers(pool) {
  const res = await pool.query('SELECT * FROM active_users');
  return res.rows;
}

/**
 * 查询带索引优化的订单
 * @param {import('pg').Pool} pool
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function getUserOrders(pool, userId) {
  const res = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return res.rows;
}
```

---

> 视图和索引是数据库设计与性能优化的重要工具，建议团队合理规划、定期复查索引和视图的使用效果。 