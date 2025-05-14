# PostgreSQL 安全与权限（详解）

## 1. 安全基础与原则
- 遵循最小权限原则（只授予必要权限）
- 定期审计用户和角色，及时清理无用账号
- 生产环境禁止使用超级用户（如 postgres）直接操作

## 2. 用户与角色管理
### 2.1 创建用户与角色
```sql
CREATE ROLE appuser WITH LOGIN PASSWORD 'StrongP@ssw0rd!';
CREATE ROLE readonly;
```

### 2.2 授权与回收权限
```sql
-- 授权
GRANT CONNECT ON DATABASE mydb TO appuser;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO appuser;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
-- 回收权限
REVOKE UPDATE ON ALL TABLES IN SCHEMA public FROM appuser;
```

### 2.3 角色继承与分组
```sql
GRANT readonly TO appuser;
```

### 2.4 删除用户
```sql
DROP ROLE olduser;
```

## 3. 密码安全与账户策略
- 强制使用复杂密码，定期更换
- 禁止空密码、弱密码账号
- 可设置密码有效期（需扩展插件如 pgaudit）
- 建议启用 `password_encryption = scram-sha-256`（PostgreSQL 10+）

## 4. SQL 注入防护与参数化查询
- 禁止拼接 SQL，必须使用参数化查询
- 严格校验用户输入，过滤特殊字符
- 应用层使用 ORM/驱动自带的参数绑定

```js
/**
 * 安全的参数化查询示例
 * @param {import('pg').Pool} pool
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function getUserByUsername(pool, username) {
  const res = await pool.query('SELECT id, name FROM users WHERE username = $1', [username]);
  return res.rows[0] || null;
}
```

## 5. 数据加密
- **传输加密**：启用 SSL/TLS，防止数据在网络中被窃听
  - 配置 postgresql.conf：`ssl = on`
  - 配置 pg_hba.conf：`hostssl`
  - 客户端连接参数加 `ssl: true`
- **存储加密**：可用文件系统加密（如 LUKS）、第三方插件（如 pgcrypto）
- **列级加密**：敏感字段用 pgcrypto 加密存储

```sql
-- 列加密示例
INSERT INTO users (name, email) VALUES ('张三', pgp_sym_encrypt('zhangsan@example.com', '密钥'));
SELECT pgp_sym_decrypt(email::bytea, '密钥') FROM users;
```

## 6. 审计与日志
- 启用日志（logging_collector、log_statement、log_connections 等）
- 企业级可用 pgaudit 插件，记录敏感操作
- 定期分析日志，发现异常访问

## 7. 常见安全风险与最佳实践
- 禁止使用 trust 认证方式，建议用 md5/scram-sha-256
- 生产环境关闭远程超级用户登录
- 定期升级 PostgreSQL，修复安全漏洞
- 备份文件妥善加密与存储
- 及时修复弱口令、空口令账号

## 8. Node.js 连接安全实践代码示例（JSDoc 注释）
```js
/**
 * 创建安全的 PostgreSQL 连接（启用 SSL）
 * @returns {import('pg').Pool}
 */
function createSecurePool() {
  const { Pool } = require('pg');
  return new Pool({
    host: 'db.example.com',
    user: 'appuser',
    password: 'StrongP@ssw0rd!',
    database: 'mydb',
    ssl: {
      rejectUnauthorized: true,
      ca: require('fs').readFileSync('/path/to/ca.pem')
    }
  });
}
```

---

> 数据库安全是系统安全的基石，建议团队定期审计权限、加固配置、监控异常访问，防止数据泄露和破坏。 