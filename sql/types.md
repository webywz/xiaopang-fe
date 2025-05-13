# SQL 数据类型

SQL 支持多种数据类型，常见于不同数据库系统。合理选择数据类型有助于提升性能和数据一致性。

## 常见数据类型
- `INT`：整数类型
- `FLOAT/DOUBLE`：浮点数类型
- `CHAR/VARCHAR`：定长/变长字符串
- `TEXT`：大文本
- `DATE/DATETIME/TIMESTAMP`：日期与时间
- `BOOLEAN`：布尔值（MySQL 实际为 TINYINT(1)）

## 各数据库差异
- MySQL 的 `DATETIME` 精度为秒，PostgreSQL 支持微秒。
- SQLite 不区分 `VARCHAR` 和 `TEXT`，均为动态类型。

## 最佳实践
- 优先使用合适长度的 `VARCHAR`，避免浪费空间。
- 日期时间建议统一为 `TIMESTAMP` 并设置时区。

## 代码示例（带 JSDoc 注释）
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```js
/**
 * 插入新用户
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @param {string} name - 用户名
 * @param {number} age - 年龄
 * @returns {Promise<void>}
 */
function insertUser(conn, name, age) {
  return conn.query('INSERT INTO users (name, age) VALUES (?, ?)', [name, age]);
}
``` 