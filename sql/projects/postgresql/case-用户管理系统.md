# PostgreSQL 实战案例：用户管理系统

## 1. 需求描述
实现一个基础的用户管理系统，支持用户注册、登录、信息修改、权限分级。要求数据安全、唯一性约束、常用性能优化。

## 2. 表结构设计
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  email VARCHAR(100) UNIQUE,
  role VARCHAR(16) DEFAULT 'user',
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_status ON users(status);
```

## 3. 核心 SQL 示例
```sql
-- 注册（插入用户）
INSERT INTO users (username, password, email) VALUES ($1, $2, $3);

-- 登录（校验用户名/邮箱+密码）
SELECT id, username, role FROM users WHERE (username = $1 OR email = $1) AND password = $2 AND status = 1;

-- 修改信息
UPDATE users SET email = $1 WHERE id = $2;

-- 权限变更
UPDATE users SET role = 'admin' WHERE id = $1;

-- 查询所有正常用户
SELECT id, username, email, role FROM users WHERE status = 1;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 注册新用户
 * @param {import('pg').Pool} pool
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} email
 * @returns {Promise<void>}
 */
async function registerUser(pool, username, passwordHash, email) {
  await pool.query(
    'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
    [username, passwordHash, email]
  );
}

/**
 * 用户登录校验
 * @param {import('pg').Pool} pool
 * @param {string} usernameOrEmail
 * @param {string} passwordHash
 * @returns {Promise<{id:number, username:string, role:string}|null>}
 */
async function loginUser(pool, usernameOrEmail, passwordHash) {
  const res = await pool.query(
    'SELECT id, username, role FROM users WHERE (username = $1 OR email = $1) AND password = $2 AND status = 1',
    [usernameOrEmail, passwordHash]
  );
  return res.rows[0] || null;
}

/**
 * 修改用户邮箱
 * @param {import('pg').Pool} pool
 * @param {number} userId
 * @param {string} newEmail
 * @returns {Promise<void>}
 */
async function updateUserEmail(pool, userId, newEmail) {
  await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, userId]);
}
```

## 5. 优化与总结
- 用户名、邮箱均加唯一索引，防止重复注册
- 密码需加密存储（如 bcrypt），严禁明文
- 重要操作建议加事务与日志
- 查询、登录等高频操作字段加索引
- 权限字段用 VARCHAR，便于扩展
- 定期清理无用账号，防止安全隐患

---

> 本案例适合各类后台管理、SaaS 平台、B2C 网站等用户体系搭建的参考模板。 