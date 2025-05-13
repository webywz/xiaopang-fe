# SQL 视图与索引

视图和索引是提升数据库可维护性和查询性能的重要工具。

## 视图（View）
- 视图是基于 SQL 查询的虚拟表，不存储实际数据。
- 用于简化复杂查询、权限隔离、数据抽象。

### 创建视图
```sql
CREATE VIEW active_users AS SELECT * FROM users WHERE status = 'active';
```

### 使用视图
```sql
SELECT name FROM active_users WHERE age > 18;
```

## 索引（Index）
- 索引加速数据检索，常见类型有 B+Tree、哈希、全文索引等。
- 过多或不合理的索引会影响写入性能。

### 创建索引
```sql
CREATE INDEX idx_age ON users(age);
```

### 索引优化建议
- 只为高频查询字段建索引。
- 避免在低基数字段（如性别）上建索引。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询所有激活且年龄大于 18 岁的用户（基于视图）
 * @param {import('mysql').Connection} conn
 * @returns {Promise<Array<{name: string, age: number}>>}
 */
function getActiveAdultUsers(conn) {
  return conn.query('SELECT name, age FROM active_users WHERE age > 18');
}
``` 