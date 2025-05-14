# SQL Server 实战案例：权限管理与安全审计

## 1. 需求描述
以"企业级多角色权限分级与操作审计"为例，要求实现用户、角色、权限分离，支持最小权限原则，所有关键操作需有审计记录，便于安全合规。

## 2. 表结构与权限模型设计
```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY,
  username NVARCHAR(50) UNIQUE NOT NULL,
  password NVARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);

-- 角色表
CREATE TABLE roles (
  id INT PRIMARY KEY IDENTITY,
  role_name NVARCHAR(50) UNIQUE NOT NULL
);

-- 用户-角色关联表
CREATE TABLE user_roles (
  user_id INT REFERENCES users(id),
  role_id INT REFERENCES roles(id),
  PRIMARY KEY(user_id, role_id)
);

-- 审计日志表
CREATE TABLE audit_logs (
  id INT PRIMARY KEY IDENTITY,
  user_id INT,
  action NVARCHAR(100),
  detail NVARCHAR(200),
  created_at DATETIME DEFAULT GETDATE()
);
```

## 3. 核心 SQL 操作
```sql
-- 创建登录和数据库用户
CREATE LOGIN user1 WITH PASSWORD = 'StrongPass!2024';
CREATE USER user1 FOR LOGIN user1;

-- 创建角色并授权
CREATE ROLE db_operator;
GRANT SELECT, UPDATE ON dbo.users TO db_operator;
EXEC sp_addrolemember 'db_operator', 'user1';

-- 收回权限
REVOKE UPDATE ON dbo.users FROM db_operator;

-- 插入审计日志
INSERT INTO audit_logs (user_id, action, detail) VALUES (1, 'UPDATE', '修改用户邮箱');
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 授权用户角色
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @param {string} username - 用户名
 * @param {string} role - 角色名
 * @returns {Promise<void>}
 */
async function grantUserRole(pool, username, role) {
  await pool.request().query(`EXEC sp_addrolemember '${role}', '${username}'`);
}

/**
 * 写入审计日志
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @param {number} userId - 用户ID
 * @param {string} action - 操作类型
 * @param {string} detail - 操作详情
 * @returns {Promise<void>}
 */
async function insertAuditLog(pool, userId, action, detail) {
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('action', sql.NVarChar, action)
    .input('detail', sql.NVarChar, detail)
    .query('INSERT INTO audit_logs (user_id, action, detail) VALUES (@userId, @action, @detail)');
}
```

## 5. 优化与总结
- 严格按最小权限原则分配角色与权限，敏感操作需双人复核
- 审计日志表建议定期归档，防止膨胀
- 关键操作建议触发告警，异常行为及时发现
- 定期审计权限分配，防止权限漂移
- 结合数据库加密、强密码策略提升安全性

---

本案例适合对安全合规有较高要求的企业，建议结合实际业务持续完善权限与审计体系。 