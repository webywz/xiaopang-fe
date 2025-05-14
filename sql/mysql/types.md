# MySQL 数据类型（详解）

## 1. 数值类型
- **整数**：TINYINT（1字节）、SMALLINT（2字节）、MEDIUMINT（3字节）、INT（4字节）、BIGINT（8字节）
  - 取值范围：有符号/无符号
  - 建议：主键自增常用 INT/BIGINT，计数/状态用 TINYINT/SMALLINT
- **浮点数**：FLOAT（4字节）、DOUBLE（8字节）
- **定点数**：DECIMAL(精度,小数位)，适合金额等高精度场景

## 2. 字符串类型
- **CHAR(n)**：定长字符串，适合长度固定（如身份证号）
- **VARCHAR(n)**：变长字符串，适合大多数文本
- **TEXT**：大文本，最大 64KB，不能建索引
- **MEDIUMTEXT/LONGTEXT**：更大文本，适合日志、文章等
- **BINARY/VARBINARY/BLOB**：二进制数据，适合图片、文件等

## 3. 日期与时间类型
- **DATE**：'YYYY-MM-DD'
- **TIME**：'HH:MM:SS'
- **DATETIME**：'YYYY-MM-DD HH:MM:SS'，常用
- **TIMESTAMP**：自动记录当前时间，受时区影响
- **YEAR**：年份

## 4. JSON 类型
- **JSON**：MySQL 5.7+ 支持，适合存储结构化数据，支持索引和查询

## 5. 枚举与集合类型
- **ENUM**：枚举类型，适合状态、性别等有限取值
- **SET**：集合类型，可多选，实际应用较少

## 6. 类型选择与性能优化建议
- 能用小类型不用大类型，节省存储、提升索引效率
- 金额用 DECIMAL，避免浮点误差
- 文本优先用 VARCHAR，超大文本用 TEXT
- 时间建议用 DATETIME，跨时区用 TIMESTAMP
- JSON 适合灵活扩展，但不宜滥用

## 7. 类型转换与兼容性
- 隐式转换可能导致索引失效，如 WHERE 字段=数字，字段为字符串类型
- 显式转换：CAST(expr AS type)
- 注意不同数据库间类型兼容性（如 Oracle 的 NUMBER、PostgreSQL 的 SERIAL）

## 8. 常见误区与最佳实践
- 不要用字符串存储数值、日期
- 不要用 TEXT 存主键、索引字段
- 枚举值变更需谨慎，建议用 TINYINT+字典表
- 二进制大对象（如图片）建议存储于对象存储，表中仅存路径

## 9. SQL 及 Node.js 代码示例（JSDoc 注释）
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('on_sale', 'off_sale') DEFAULT 'on_sale',
  tags JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

```js
/**
 * 插入商品数据
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} name
 * @param {number} price
 * @param {string[]} tags
 * @returns {Promise<void>}
 */
async function addProduct(conn, name, price, tags) {
  await conn.execute(
    'INSERT INTO products (name, price, tags) VALUES (?, ?, ?)',
    [name, price, JSON.stringify(tags)]
  );
}
```

---

> 数据类型设计影响数据库性能与可维护性，建议团队统一规范，定期复查表结构，避免类型滥用。 