# SQL Server 实战案例：数据治理与主数据管理（MDM）

## 1. 需求描述
以"企业多系统主数据统一"为例，要求实现客户、产品等主数据的唯一性、标准化、跨系统同步与一致性保障，支持主数据变更追踪与冲突检测。

## 2. 主数据模型与治理策略设计
```sql
-- 客户主数据表
CREATE TABLE mdm_customer (
  id INT PRIMARY KEY,
  customer_code NVARCHAR(50) UNIQUE NOT NULL, -- 全局唯一编码
  name NVARCHAR(100) NOT NULL,
  phone NVARCHAR(20),
  email NVARCHAR(100),
  source_system NVARCHAR(50), -- 来源系统
  created_at DATETIME,
  updated_at DATETIME
);

-- 主数据变更日志表
CREATE TABLE mdm_customer_log (
  log_id INT PRIMARY KEY IDENTITY,
  customer_id INT,
  action NVARCHAR(20),
  old_value NVARCHAR(200),
  new_value NVARCHAR(200),
  changed_at DATETIME DEFAULT GETDATE()
);
```

## 3. 核心 SQL 与治理操作
```sql
-- 插入主数据（唯一性校验）
INSERT INTO mdm_customer (id, customer_code, name, phone, email, source_system, created_at, updated_at)
SELECT 1001, 'CUST2024001', '张三', '13800000000', 'zhangsan@example.com', 'CRM', GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM mdm_customer WHERE customer_code = 'CUST2024001');

-- 检查主数据冲突（如同名同手机号）
SELECT name, phone, COUNT(*) FROM mdm_customer GROUP BY name, phone HAVING COUNT(*) > 1;

-- 标准化手机号（去除空格、统一格式）
UPDATE mdm_customer SET phone = REPLACE(phone, ' ', '');

-- 记录主数据变更
INSERT INTO mdm_customer_log (customer_id, action, old_value, new_value)
VALUES (1001, 'UPDATE', '张三,13800000000', '张三,13900000000');
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 同步主数据（如从外部系统导入客户）
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @param {Object} customer - 客户主数据对象
 * @returns {Promise<void>}
 */
async function syncCustomer(pool, customer) {
  await pool.request()
    .input('id', sql.Int, customer.id)
    .input('code', sql.NVarChar, customer.customer_code)
    .input('name', sql.NVarChar, customer.name)
    .input('phone', sql.NVarChar, customer.phone)
    .input('email', sql.NVarChar, customer.email)
    .input('source', sql.NVarChar, customer.source_system)
    .query(`
      IF NOT EXISTS (SELECT 1 FROM mdm_customer WHERE customer_code = @code)
      INSERT INTO mdm_customer (id, customer_code, name, phone, email, source_system, created_at, updated_at)
      VALUES (@id, @code, @name, @phone, @email, @source, GETDATE(), GETDATE())
    `);
}

/**
 * 检查主数据冲突（同名同手机号）
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<Array>} 冲突客户列表
 */
async function checkCustomerConflict(pool) {
  const result = await pool.request().query(`
    SELECT name, phone, COUNT(*) AS cnt FROM mdm_customer GROUP BY name, phone HAVING COUNT(*) > 1
  `);
  return result.recordset;
}
```

## 5. 优化与总结
- 主数据唯一性依赖全局唯一编码，建议加唯一索引
- 变更日志便于追溯主数据历史，支持合规审计
- 标准化处理（如手机号、邮箱）提升数据一致性
- 跨系统同步建议有数据血缘与映射表，便于追踪
- 定期检测冲突与异常，自动修复或人工审核

---

本案例适合多系统主数据统一与治理场景，建议结合实际业务持续完善主数据管理体系。 