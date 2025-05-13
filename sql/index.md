# SQL 简介

SQL（Structured Query Language，结构化查询语言）是一种用于管理和操作关系型数据库的标准语言。它广泛应用于数据查询、数据操作、数据定义和数据控制等场景。

## 发展历史
- 1970 年，E.F. Codd 提出关系模型理论。
- 1974 年，IBM 开发出 SEQUEL，后更名为 SQL。
- 1986 年，SQL 成为 ANSI 标准。

## 主流数据库
- MySQL
- PostgreSQL
- SQLite
- Oracle
- SQL Server

## 应用场景
- 网站后台数据管理
- 金融、医疗等行业数据分析
- 大数据 ETL 处理

## SQL 基本结构
```sql
-- 查询示例
SELECT name, age FROM users WHERE age > 18;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询用户表中所有年龄大于 18 岁的用户
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @returns {Promise<Array<{name: string, age: number}>>} 用户列表
 */
function getAdultUsers(conn) {
  return conn.query('SELECT name, age FROM users WHERE age > 18');
}
```

---

SQL 作为数据世界的通用语言，是每一位开发者和数据分析师的必备技能。 