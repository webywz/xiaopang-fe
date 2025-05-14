# MySQL 安全与权限（详解）

## 1. 安全基础与原则
- 遵循最小权限原则（只授予必要权限）
- 定期审计用户和权限，及时清理无用账号
- 生产环境禁止使用 root 账号直接操作

## 2. 用户与权限管理
### 2.1 创建用户
```sql
CREATE USER 'appuser'@'%' IDENTIFIED BY 'StrongP@ssw0rd!';
```

### 2.2 授权与回收权限
```sql
-- 授权
GRANT SELECT, INSERT, UPDATE ON mydb.* TO 'appuser'@'%';
-- 回收权限
REVOKE UPDATE ON mydb.* FROM 'appuser'@'%';
-- 刷新权限
FLUSH PRIVILEGES;
```

### 2.3 查看权限
```sql
SHOW GRANTS FOR 'appuser'@'%';
```

### 2.4 删除用户
```sql
DROP USER 'olduser'@'%';
```

## 3. 密码安全与账户策略
- 强制使用复杂密码，定期更换
- 禁止空密码、弱密码账号
- 可设置密码过期策略（MySQL 5.7+）
```sql
ALTER USER 'appuser'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
```

## 4. SQL 注入防护与参数化查询
- 禁止拼接 SQL，必须使用参数化查询
- 严格校验用户输入，过滤特殊字符
- 应用层使用 ORM/驱动自带的参数绑定

```js
/**
 * 安全的参数化查询示例
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function getUserByUsername(conn, username) {
  const [rows] = await conn.execute('SELECT id, name FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}
```

## 5. 数据加密
- **传输加密**：启用 SSL/TLS，防止数据在网络中被窃听
  - 配置 my.cnf：`require_secure_transport = ON`
  - 客户端连接参数加 `ssl: {}`
- **存储加密**：启用 InnoDB 表空间加密、加密备份文件
- **敏感字段加密**：如手机号、身份证号等，应用层加密存储

## 6. 审计与日志
- 启用通用查询日志、慢查询日志、错误日志
- 企业版可用审计插件，记录敏感操作
- 定期分析日志，发现异常访问

## 7. 常见安全风险与最佳实践
- 禁止使用 % 通配符授予所有主机访问权限，建议指定 IP
- 生产环境关闭远程 root 登录
- 定期升级 MySQL，修复安全漏洞
- 备份文件妥善加密与存储
- 及时修复弱口令、空口令账号

## 8. Node.js 连接安全实践代码示例（JSDoc 注释）
```js
/**
 * 创建安全的 MySQL 连接（启用 SSL）
 * @returns {Promise<import('mysql2/promise').Connection>}
 */
async function connectSecureMySQL() {
  const mysql = require('mysql2/promise');
  return mysql.createConnection({
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