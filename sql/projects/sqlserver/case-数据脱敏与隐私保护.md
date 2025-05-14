# SQL Server 实战案例：数据脱敏与隐私保护

## 1. 需求描述
以"敏感数据脱敏与合规展示"为例，要求对手机号、身份证、邮箱等敏感字段进行脱敏处理，保障开发、测试、数据分析等场景下的隐私安全，满足合规要求。

## 2. 表结构与脱敏策略设计
```sql
-- 用户信息表，含敏感字段
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY,
  username NVARCHAR(50) NOT NULL,
  phone NVARCHAR(20),
  id_card NVARCHAR(30),
  email NVARCHAR(100),
  created_at DATETIME DEFAULT GETDATE()
);

-- 动态数据掩码（SQL Server 2016+ 支持）
ALTER TABLE users ALTER COLUMN phone ADD MASKED WITH (FUNCTION = 'partial(3,"****",4)');
ALTER TABLE users ALTER COLUMN id_card ADD MASKED WITH (FUNCTION = 'partial(2,"******",2)');
ALTER TABLE users ALTER COLUMN email ADD MASKED WITH (FUNCTION = 'email()');
```

## 3. 核心 SQL 脱敏操作
```sql
-- 查询时自动脱敏（需普通权限用户）
SELECT username, phone, id_card, email FROM users;

-- 通过视图自定义脱敏规则
CREATE VIEW v_users_masked AS
SELECT 
  username,
  LEFT(phone,3)+'****'+RIGHT(phone,4) AS phone_masked,
  LEFT(id_card,2)+'******'+RIGHT(id_card,2) AS id_card_masked,
  STUFF(email,2,INSTR(email,'@')-2,'****') AS email_masked
FROM users;

-- 查询脱敏视图
SELECT * FROM v_users_masked;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 查询脱敏后的用户信息
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<Array<{username: string, phone_masked: string, id_card_masked: string, email_masked: string}>>}
 */
async function getMaskedUsers(pool) {
  const result = await pool.request().query('SELECT * FROM v_users_masked');
  return result.recordset;
}

/**
 * 导出脱敏数据到 CSV
 * @param {Array<Object>} data - 脱敏数据
 * @param {string} filePath - 导出文件路径
 * @returns {Promise<void>}
 */
const fs = require('fs').promises;
async function exportMaskedDataToCSV(data, filePath) {
  const header = Object.keys(data[0]).join(',') + '\n';
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  await fs.writeFile(filePath, header + rows, 'utf8');
}
```

## 5. 优化与总结
- 推荐动态数据掩码+视图双重脱敏，防止敏感信息泄露
- 生产环境严禁开发/测试账号访问明文敏感数据
- 定期审计敏感字段访问与导出操作
- 静态脱敏适合数据脱敏后导出，动态脱敏适合在线查询
- 结合权限隔离、加密、合规流程提升数据安全

---

本案例适合对隐私保护有较高要求的企业，建议结合实际业务持续完善数据脱敏与合规体系。 