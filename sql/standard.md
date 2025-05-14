# SQL 书写规范（进阶与细则）

## 1. 语句书写规范
- 每条 SQL 语句建议单独一行，便于阅读和维护。
- 关键字全部大写，表名、字段名小写。
- 复杂语句建议分段缩进，子句（如 WHERE、GROUP BY、ORDER BY）单独成行。
- 多表关联时，每个 JOIN 单独一行，并对齐 ON 子句。
- 长 SQL 语句建议按逻辑分块换行，提升可读性。
- SELECT 字段较多时，每个字段单独一行，并对齐逗号。
- 避免 SELECT *，明确列出所需字段。
- SQL 语句结尾加分号。

```sql
SELECT
  u.id,
  u.name,
  u.email,
  o.order_id,
  o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND o.created_at >= '2024-01-01'
ORDER BY o.amount DESC;
```

## 2. 命名规范
- 表名、字段名使用小写字母，单词间用下划线分隔（snake_case）。
- 表名建议为复数，字段名为单数。
- 索引、约束等对象命名建议加前缀（如 idx_、pk_、fk_、uniq_）。
- 避免使用数据库保留字、拼音、缩写不明的单词。
- 命名应简洁明了，体现业务含义。
- 国际化建议：如有多语言需求，统一使用英文。
- 命名冲突处理：如有同名字段，建议加表前缀（如 user_id, order_id）。
- 反例：不要用 a1、b2、data1、test 等无意义命名。

| 类型   | 正例           | 反例         |
|--------|----------------|--------------|
| 表     | users          | userTbl      |
| 字段   | created_at     | createtime   |
| 索引   | idx_users_age  | index1       |
| 主键   | pk_users       | id           |
| 外键   | fk_users_role  | role         |

## 3. 注释规范
- 单行注释使用 `--`，多行注释使用 `/* ... */`。
- 重要 SQL 建议写明用途、作者、修改时间。
- 复杂 SQL 建议分段注释，说明每一步的作用。
- 变更记录建议写在文件头部。
- 团队协作建议：每次修改 SQL，补充变更说明。

```sql
-- 查询所有成年用户
SELECT * FROM users WHERE age >= 18;

/*
  统计每个部门的员工数
  author: 张三
  date: 2024-06-01
  desc: 用于人力资源报表
*/
SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;

-- 复杂 SQL 分段注释
-- 1. 过滤活跃用户
WITH active_users AS (
  SELECT id FROM users WHERE status = 'active'
)
-- 2. 统计订单数
SELECT u.id, COUNT(o.id) AS order_count
FROM active_users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

## 4. SQL 代码安全规范
- 禁止拼接 SQL，必须使用参数化查询，防止 SQL 注入。
- 不在 SQL 中暴露敏感信息（如明文密码、密钥等）。
- 对用户输入严格校验。
- 生产环境禁止使用 DROP、TRUNCATE 等高危操作。
- 权限最小化原则，业务账号仅授予所需权限。

```js
/**
 * 安全的参数化查询示例
 * @param {import('mysql').Connection} conn
 * @param {string} username
 * @returns {Promise<Object|null>} 用户信息
 */
function getUserByUsername(conn, username) {
  return conn.query('SELECT id, name FROM users WHERE username = ?', [username]);
}
```

## 5. SQL 性能优化规范
- 合理设计索引，避免全表扫描。
- WHERE 子句优先使用索引字段。
- 避免在 WHERE、JOIN、ORDER BY 中对字段做函数运算。
- 大批量操作建议分批提交，防止锁表。
- 使用 EXPLAIN 分析 SQL 执行计划。
- 定期清理无用索引、碎片。
- 慢查询日志定期分析。

```sql
-- 使用 EXPLAIN 分析 SQL
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

## 6. 事务与并发控制规范
- 明确事务边界，避免长事务。
- 选择合适的隔离级别（如 READ COMMITTED、REPEATABLE READ）。
- 避免在事务中进行大量交互或等待。
- 及时提交或回滚事务，防止死锁。
- 记录事务操作日志，便于排查问题。

```js
/**
 * 事务操作示例
 * @param {import('mysql').Connection} conn
 * @returns {Promise<void>}
 */
async function transfer(conn, fromId, toId, amount) {
  await conn.beginTransaction();
  try {
    await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, fromId]);
    await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, toId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}
```

## 7. JSDoc 代码示例（多场景）
```js
/**
 * 分页查询用户
 * @param {import('mysql').Connection} conn
 * @param {number} page
 * @param {number} pageSize
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
function getUsersByPage(conn, page, pageSize) {
  return conn.query('SELECT id, name FROM users LIMIT ? OFFSET ?', [pageSize, (page - 1) * pageSize]);
}

/**
 * 批量插入用户
 * @param {import('mysql').Connection} conn
 * @param {Array<{name: string, age: number}>} users
 * @returns {Promise<void>}
 */
function batchInsertUsers(conn, users) {
  const values = users.map(u => [u.name, u.age]);
  return conn.query('INSERT INTO users (name, age) VALUES ?', [values]);
}
```

## 8. 团队协作与代码评审建议
- 每次提交 SQL 需自查：
  - 是否有注释、命名规范
  - 是否有安全隐患（如拼接 SQL）
  - 是否有性能隐患（如全表扫描）
  - 是否有事务边界
- 推荐 SQL Review Checklist：
  1. 语句是否易读、易维护？
  2. 命名是否规范、无歧义？
  3. 是否有必要的注释？
  4. 是否使用参数化查询？
  5. 是否有索引优化？
  6. 是否有事务控制？
  7. 是否有异常处理？
  8. 是否有变更记录？

---

如需更详细的数据库专属规范，请参考各数据库子目录文档。 