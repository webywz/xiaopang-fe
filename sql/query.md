# SQL 查询与操作

SQL 查询是数据分析和开发的核心。常见操作包括单表查询、多表连接、聚合、子查询和分页。

## 单表查询
```sql
SELECT * FROM users WHERE age > 18;
```

## 多表连接（JOIN）
```sql
SELECT u.name, o.amount FROM users u
JOIN orders o ON u.id = o.user_id;
```

## 聚合查询
```sql
SELECT status, COUNT(*) FROM users GROUP BY status;
```

## 子查询
```sql
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 100);
```

## 分页查询
```sql
SELECT * FROM users LIMIT 10 OFFSET 20;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询有大额订单的用户姓名
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @returns {Promise<Array<{name: string}>>}
 */
function getUsersWithBigOrders(conn) {
  return conn.query('SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 100)');
}
``` 