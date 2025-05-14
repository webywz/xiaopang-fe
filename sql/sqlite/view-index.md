# SQLite 视图与索引

## 视图（View）基础与应用场景
- 视图是基于 SQL 查询的虚拟表，简化复杂查询、实现数据隔离与权限控制。
- 常用于多表联合、敏感字段隐藏、报表等场景。

## 视图创建与管理
```sql
-- 创建普通视图
CREATE VIEW active_users AS
SELECT id, name FROM users WHERE status = 'active';

-- 查看视图定义
SELECT sql FROM sqlite_master WHERE type = 'view' AND name = 'active_users';

-- 删除视图
DROP VIEW active_users;
```

## 视图优缺点与最佳实践
- 优点：简化查询、增强安全、便于维护
- 缺点：视图只读，不能直接更新；复杂嵌套视图性能差
- 最佳实践：视图命名规范，避免过度嵌套，定期梳理无用视图

## 索引（Index）基础与类型
- B-Tree 索引（默认，适合大多数场景）
- Unique 索引、复合索引

## 索引创建与优化
```sql
-- 创建普通索引
CREATE INDEX idx_users_status ON users(status);
-- 创建唯一索引
CREATE UNIQUE INDEX idx_orders_no ON orders(order_no);
```
- 优化建议：优先索引高频查询字段，避免低基数字段滥用索引，定期重建/分析索引

## 索引失效常见原因与排查
- WHERE 条件函数包裹、类型不匹配、数据分布变化
- 可用 EXPLAIN 查询执行计划

## Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 查询活跃用户视图
 * @param {sqlite3.Database} db
 * @returns {Promise<Array<{id:number,name:string}>>}
 */
function getActiveUsers(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM active_users', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
```

---

SQLite 视图与索引简单实用，建议结合业务场景合理设计，定期优化与维护。 