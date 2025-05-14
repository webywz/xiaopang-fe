# MySQL 视图与索引（详解）

## 1. 视图（View）基础
- 视图是基于 SQL 查询结果的虚拟表，不存储实际数据。
- 适合封装复杂查询、权限隔离、简化多表操作。

## 2. 视图的创建与管理
```sql
-- 创建视图
CREATE VIEW active_users AS SELECT id, name FROM users WHERE status = 'active';
-- 查询视图
SELECT * FROM active_users;
-- 修改视图
CREATE OR REPLACE VIEW active_users AS SELECT id, name, age FROM users WHERE status = 'active';
-- 删除视图
DROP VIEW active_users;
```

## 3. 视图的优缺点与最佳实践
- **优点**：
  - 简化复杂 SQL，提升可读性
  - 权限隔离，限制字段/行访问
  - 便于代码复用
- **缺点**：
  - 不能加索引，部分场景性能较差
  - 视图嵌套、更新受限
- **最佳实践**：
  - 只读视图优先，避免在视图上做 DML 操作
  - 复杂视图建议分层设计

## 4. 索引（Index）基础与类型
- 索引是加速数据检索的数据结构，常用 B+Tree 实现
- **主键索引（PRIMARY KEY）**：唯一且非空
- **唯一索引（UNIQUE）**：唯一但可空
- **普通索引（INDEX/KEY）**：加速查询
- **全文索引（FULLTEXT）**：适合大文本搜索
- **空间索引（SPATIAL）**：地理空间数据
- **联合索引**：多字段组合索引

## 5. 索引的创建与管理
```sql
-- 创建普通索引
CREATE INDEX idx_users_age ON users(age);
-- 创建唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);
-- 创建联合索引
CREATE INDEX idx_orders_userid_status ON orders(user_id, status);
-- 删除索引
DROP INDEX idx_users_age ON users;
-- 查看表索引
SHOW INDEX FROM users;
```

## 6. 索引优化建议
- 优先为高频查询的 WHERE、ORDER BY、JOIN 字段建索引
- 联合索引字段顺序需结合查询条件
- 避免在频繁更新的字段上建索引
- 避免冗余、重复索引
- 覆盖索引可提升查询效率

## 7. 索引失效常见原因与排查
- WHERE 字段做函数/运算，索引失效
- LIKE '%abc' 前置通配符，索引失效
- 隐式类型转换导致索引失效
- 查询未命中联合索引的最左前缀
- 排查方法：EXPLAIN 分析执行计划

## 8. 视图与索引结合用法
- 视图本身不能加索引，但可通过物化视图（定期生成表）+索引提升性能
- 复杂聚合、报表场景可用物化视图

## 9. SQL 及 Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询活跃用户视图
 * @param {import('mysql2/promise').Connection} conn
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function getActiveUsers(conn) {
  const [rows] = await conn.execute('SELECT * FROM active_users');
  return rows;
}

/**
 * 查询带索引优化的订单
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function getUserOrders(conn, userId) {
  const [rows] = await conn.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
}
```

---

> 视图和索引是数据库设计与性能优化的重要工具，建议团队合理规划、定期复查索引和视图的使用效果。 