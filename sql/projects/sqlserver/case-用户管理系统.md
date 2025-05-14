# SQL Server 实战案例：用户管理系统

## 1. 需求描述
实现基础用户管理系统，支持用户注册、登录、信息修改、权限分级，要求数据安全、唯一性约束，适合企业、SaaS、B2C 等场景。

## 2. 表结构设计
```sql
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  password NVARCHAR(100) NOT NULL,
  email NVARCHAR(100) UNIQUE,
  role NVARCHAR(20) DEFAULT 'user',
  status NVARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_users_status ON users(status);
```

## 3. 核心 SQL 示例
```sql
-- 注册用户
INSERT INTO users(username, password, email) VALUES('alice', @pwd, 'alice@example.com');

-- 登录校验
SELECT id, username, role FROM users WHERE username = @username AND password = @pwd AND status = 'active';

-- 修改信息
UPDATE users SET email = @email, updated_at = GETDATE() WHERE id = @id;

-- 权限变更
UPDATE users SET role = 'admin' WHERE id = @id;

-- 查询活跃用户
SELECT id, username, email FROM users WHERE status = 'active';
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 注册新用户
 * @param {import('mssql').ConnectionPool} pool
 * @param {object} user {username:string, password:string, email:string}
 * @returns {Promise<void>}
 */
async function registerUser(pool, user) {
  await pool.request()
    .input('username', user.username)
    .input('password', user.password)
    .input('email', user.email)
    .query('INSERT INTO users(username, password, email) VALUES(@username, @password, @email)');
}

/**
 * 校验登录
 * @param {import('mssql').ConnectionPool} pool
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object|null>}
 */
async function login(pool, username, password) {
  const result = await pool.request()
    .input('username', username)
    .input('password', password)
    .query('SELECT id, username, role FROM users WHERE username = @username AND password = @password AND status = ''active''');
  return result.recordset[0] || null;
}
```

## 5. 优化与总结
- 密码建议加密存储，避免明文
- 重要操作建议加日志表记录
- 索引 status 字段提升活跃用户查询效率
- 定期清理无效账号，保障数据安全

---

本案例适合企业后台、SaaS 平台、B2C 网站等基础用户体系场景。 