# SQL Server 实战案例：数据加密与敏感信息防护

## 1. 需求描述
以"数据库层加密与敏感字段加密"为例，要求对数据库整体和关键字段进行加密，防止数据泄露，满足合规要求，支持密钥轮换与权限隔离。

## 2. 表结构与加密策略设计
```sql
-- 透明数据加密（TDE）适用于整个数据库
-- 列级加密适用于敏感字段（如身份证、银行卡号等）

-- 示例：用户表含加密字段
CREATE TABLE users (
  id INT PRIMARY KEY,
  username NVARCHAR(50),
  id_card VARBINARY(256), -- 加密存储
  created_at DATETIME
);

-- 创建主密钥、证书、对称密钥
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'StrongPass!2024';
CREATE CERTIFICATE cert_user WITH SUBJECT = 'User Data Encryption';
CREATE SYMMETRIC KEY sym_user WITH ALGORITHM = AES_256 ENCRYPTION BY CERTIFICATE cert_user;
```

## 3. 核心 SQL 加密操作
```sql
-- 加密插入身份证号
OPEN SYMMETRIC KEY sym_user DECRYPTION BY CERTIFICATE cert_user;
INSERT INTO users (id, username, id_card, created_at)
VALUES (1, '张三', EncryptByKey(Key_GUID('sym_user'), '110101199001010011'), GETDATE());
CLOSE SYMMETRIC KEY sym_user;

-- 查询并解密身份证号
OPEN SYMMETRIC KEY sym_user DECRYPTION BY CERTIFICATE cert_user;
SELECT username, CONVERT(NVARCHAR(30), DecryptByKey(id_card)) AS id_card FROM users;
CLOSE SYMMETRIC KEY sym_user;

-- 启用 TDE（需高级版）
-- 1. 创建主密钥、证书、数据库加密密钥
-- 2. 启用加密
-- 参考官方文档：https://learn.microsoft.com/zh-cn/sql/relational-databases/security/encryption/transparent-data-encryption
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 插入加密身份证号
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @param {string} username - 用户名
 * @param {string} idCard - 明文身份证号
 * @returns {Promise<void>}
 */
async function insertEncryptedUser(pool, username, idCard) {
  await pool.request().query(`
    OPEN SYMMETRIC KEY sym_user DECRYPTION BY CERTIFICATE cert_user;
    INSERT INTO users (username, id_card, created_at)
    VALUES ('${username}', EncryptByKey(Key_GUID('sym_user'), '${idCard}'), GETDATE());
    CLOSE SYMMETRIC KEY sym_user;
  `);
}

/**
 * 查询并解密身份证号
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<Array<{username: string, id_card: string}>>}
 */
async function getDecryptedUsers(pool) {
  const result = await pool.request().query(`
    OPEN SYMMETRIC KEY sym_user DECRYPTION BY CERTIFICATE cert_user;
    SELECT username, CONVERT(NVARCHAR(30), DecryptByKey(id_card)) AS id_card FROM users;
    CLOSE SYMMETRIC KEY sym_user;
  `);
  return result.recordset;
}
```

## 5. 优化与总结
- TDE 适合全库加密，列级加密适合敏感字段，建议结合使用
- 密钥、证书需妥善备份与权限隔离，防止泄露
- 加密操作有性能开销，建议评估影响
- 定期轮换密钥，提升安全性
- 生产环境建议加密备份文件，防止物理泄露
- 结合合规要求（如等保、GDPR）制定加密策略

---

本案例适合对数据安全与合规有较高要求的企业，建议结合实际业务持续完善加密与密钥管理体系。 