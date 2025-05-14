# MySQL 实战案例：用户管理系统

## 1. 需求描述
实现一个基础的用户管理系统，支持用户注册、登录、信息修改、权限分级。要求数据安全、唯一性约束、常用性能优化。

## 2. 表结构设计
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(32) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(64) NOT NULL COMMENT '加密密码',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  role ENUM('user','admin') DEFAULT 'user' COMMENT '角色',
  status TINYINT(1) DEFAULT 1 COMMENT '状态(1正常,0禁用)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
```

## 3. 核心 SQL 示例
```sql
-- 注册（插入用户）
INSERT INTO users (username, password, email) VALUES (?, ?, ?);

-- 登录（校验用户名/邮箱+密码）
SELECT id, username, role FROM users WHERE (username = ? OR email = ?) AND password = ? AND status = 1;

-- 修改信息
UPDATE users SET email = ? WHERE id = ?;

-- 权限变更
UPDATE users SET role = 'admin' WHERE id = ?;

-- 查询所有正常用户
SELECT id, username, email, role FROM users WHERE status = 1;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 注册新用户
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} email
 * @returns {Promise<void>}
 */
async function registerUser(conn, username, passwordHash, email) {
  await conn.execute(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, passwordHash, email]
  );
}

/**
 * 用户登录校验
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} usernameOrEmail
 * @param {string} passwordHash
 * @returns {Promise<{id:number, username:string, role:string}|null>}
 */
async function loginUser(conn, usernameOrEmail, passwordHash) {
  const [rows] = await conn.execute(
    'SELECT id, username, role FROM users WHERE (username = ? OR email = ?) AND password = ? AND status = 1',
    [usernameOrEmail, usernameOrEmail, passwordHash]
  );
  return rows[0] || null;
}

/**
 * 修改用户邮箱
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} userId
 * @param {string} newEmail
 * @returns {Promise<void>}
 */
async function updateUserEmail(conn, userId, newEmail) {
  await conn.execute('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
}
```

## 5. 优化与总结
- 用户名、邮箱均加唯一索引，防止重复注册
- 密码需加密存储（如 bcrypt），严禁明文
- 重要操作建议加事务与日志
- 查询、登录等高频操作字段加索引
- 权限字段用 ENUM，便于扩展
- 定期清理无用账号，防止安全隐患

---

> 本案例适合各类后台管理、SaaS 平台、B2C 网站等用户体系搭建的参考模板。 