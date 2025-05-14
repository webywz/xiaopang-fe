# Oracle 数据类型

内容建设中，敬请期待。 

# Oracle 常用数据类型

## 数值类型
- NUMBER(p,s)：高精度数值，p为总位数，s为小数位
- INTEGER/INT：等价于 NUMBER(38)
- FLOAT/BINARY_FLOAT/BINARY_DOUBLE：浮点数，适合科学计算

## 字符串类型
- VARCHAR2(n)：变长字符串，最大 4000 字节
- CHAR(n)：定长字符串
- CLOB：大文本，最大 4GB

## 日期与时间类型
- DATE：日期+时间（精确到秒）
- TIMESTAMP[(n)]：高精度时间戳（可到微秒）
- INTERVAL：时间间隔

## 布尔与特殊类型
- Oracle 无原生 BOOLEAN（PL/SQL 支持）
- BLOB：二进制大对象
- RAW(n)：定长二进制

## 类型转换与兼容性
- 隐式转换易导致性能问题，建议显式 TO_CHAR/TO_DATE/TO_NUMBER
- 跨库迁移需注意类型映射（如 VARCHAR2 与 VARCHAR、DATE 精度差异）

## 设计建议与常见误区
- 金额等高精度用 NUMBER，不建议用 FLOAT
- 字符串长度按实际需求分配，避免浪费
- 日期存储统一时区，避免混乱
- 大字段（CLOB/BLOB）建议分表或归档

## 典型 SQL 示例
```sql
-- 创建表
CREATE TABLE orders (
  id NUMBER PRIMARY KEY,
  order_no VARCHAR2(32) UNIQUE,
  amount NUMBER(12,2),
  created_at DATE
);
```

## Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 插入订单数据
 * @param {oracledb.Connection} conn
 * @param {object} order {id:number,order_no:string,amount:number}
 * @returns {Promise<void>}
 */
async function insertOrder(conn, order) {
  await conn.execute(
    'INSERT INTO orders (id, order_no, amount, created_at) VALUES (:id, :order_no, :amount, SYSDATE)',
    order
  );
}
```

---

Oracle 类型丰富，建议根据业务需求合理选型，避免隐式转换和精度丢失。 