# SQL 常用语法

SQL 提供了丰富的语法用于数据的增删查改。以下是最常用的 SQL 语句及其用法。

## SELECT 查询
```sql
SELECT 列1, 列2 FROM 表名 WHERE 条件;
```

## INSERT 插入
```sql
INSERT INTO 表名 (列1, 列2) VALUES (值1, 值2);
```

## UPDATE 更新
```sql
UPDATE 表名 SET 列1=新值1 WHERE 条件;
```

## DELETE 删除
```sql
DELETE FROM 表名 WHERE 条件;
```

## WHERE 条件
```sql
SELECT * FROM users WHERE age > 18 AND status = 'active';
```

## ORDER BY 排序
```sql
SELECT * FROM users ORDER BY age DESC;
```

## GROUP BY 分组
```sql
SELECT status, COUNT(*) FROM users GROUP BY status;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询所有激活状态的成年用户并按年龄降序排列
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @returns {Promise<Array<{name: string, age: number, status: string}>>}
 */
function getActiveAdults(conn) {
  return conn.query("SELECT name, age, status FROM users WHERE age > 18 AND status = 'active' ORDER BY age DESC");
}
``` 