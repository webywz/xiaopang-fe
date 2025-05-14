# PostgreSQL 数据类型（详解）

## 1. 数值类型
- **整数**：SMALLINT（2字节）、INTEGER（4字节）、BIGINT（8字节）
  - 取值范围：有符号
  - 建议：主键自增常用 SERIAL/BIGSERIAL，计数/状态用 SMALLINT/INTEGER
- **浮点数**：REAL（4字节）、DOUBLE PRECISION（8字节）
- **定点数**：NUMERIC(精度,小数位)，适合金额等高精度场景

## 2. 字符串类型
- **CHAR(n)**：定长字符串，适合长度固定（如身份证号）
- **VARCHAR(n)**：变长字符串，适合大多数文本
- **TEXT**：大文本，无长度限制，适合日志、文章等
- **BYTEA**：二进制数据，适合图片、文件等

## 3. 日期与时间类型
- **DATE**：'YYYY-MM-DD'
- **TIME [WITHOUT TIME ZONE]**：'HH:MM:SS'
- **TIMESTAMP [WITH/WITHOUT TIME ZONE]**：'YYYY-MM-DD HH:MM:SS'，常用
- **INTERVAL**：时间间隔

## 4. JSON 与数组类型
- **JSON/JSONB**：原生支持，JSONB 性能更优，支持索引与查询
- **ARRAY**：任意类型数组，适合多值字段

## 5. 枚举与复合类型
- **ENUM**：自定义枚举类型，适合状态、性别等有限取值
- **Composite Type**：自定义复合类型，适合结构化数据

## 6. 类型选择与性能优化建议
- 能用小类型不用大类型，节省存储、提升索引效率
- 金额用 NUMERIC，避免浮点误差
- 文本优先用 VARCHAR，超大文本用 TEXT
- 时间建议用 TIMESTAMP WITH TIME ZONE，便于时区处理
- JSONB 适合灵活扩展，支持索引
- 数组适合多值但不宜滥用，复杂结构建议拆表

## 7. 类型转换与兼容性
- 隐式转换可能导致索引失效，如 WHERE 字段=数字，字段为字符串类型
- 显式转换：CAST(expr AS type) 或 expr::type
- 注意不同数据库间类型兼容性（如 MySQL 的 DATETIME、Oracle 的 NUMBER）

## 8. 常见误区与最佳实践
- 不要用字符串存储数值、日期
- 不要用 TEXT 存主键、索引字段
- 枚举值变更需谨慎，建议用 SMALLINT+字典表
- 二进制大对象（如图片）建议存储于对象存储，表中仅存路径
- JSON 字段建议加 GIN 索引，提升查询效率

## 9. SQL 及 Node.js 代码示例（JSDoc 注释）
```sql
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'done');

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  tags TEXT[],
  extra JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

```js
/**
 * 插入订单数据
 * @param {import('pg').Pool} pool
 * @param {number} userId
 * @param {number} amount
 * @param {string[]} tags
 * @param {Object} extra
 * @returns {Promise<void>}
 */
async function addOrder(pool, userId, amount, tags, extra) {
  await pool.query(
    'INSERT INTO orders (user_id, amount, tags, extra) VALUES ($1, $2, $3, $4)',
    [userId, amount, tags, extra]
  );
}
```

---

> 数据类型设计影响数据库性能与可维护性，建议团队统一规范，定期复查表结构，避免类型滥用。 