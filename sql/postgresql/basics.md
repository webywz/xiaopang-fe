# PostgreSQL 基础语法与常用操作

## 1. 数据库与表管理
### 1.1 创建数据库
```sql
CREATE DATABASE mydb;
```

### 1.2 创建表
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  age INT,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 创建索引
```sql
CREATE INDEX idx_users_age ON users(age);
```

## 2. 增删改查（CRUD）
```sql
-- 插入数据
INSERT INTO users (name, age, email) VALUES ('张三', 25, 'zhangsan@example.com');

-- 查询数据
SELECT id, name, age FROM users WHERE age > 18;

-- 更新数据
UPDATE users SET age = 26 WHERE name = '张三';

-- 删除数据
DELETE FROM users WHERE id = 1;
```

## 3. 事务基础
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 或 ROLLBACK;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询所有成年用户
 * @param {import('pg').Pool} pool
 * @returns {Promise<Array<{id: number, name: string, age: number}>>}
 */
async function getAdultUsers(pool) {
  const res = await pool.query('SELECT id, name, age FROM users WHERE age > $1', [18]);
  return res.rows;
}

/**
 * 新增用户
 * @param {import('pg').Pool} pool
 * @param {string} name
 * @param {number} age
 * @param {string} email
 * @returns {Promise<void>}
 */
async function addUser(pool, name, age, email) {
  await pool.query('INSERT INTO users (name, age, email) VALUES ($1, $2, $3)', [name, age, email]);
}
```

---

> 更多进阶内容请参考本目录下其他文档（如 transaction.md、performance.md、procedure.md 等）。 