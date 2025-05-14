# MySQL 查询进阶（详解）

## 1. 多表联结（JOIN）
- **INNER JOIN**：内连接，返回两表匹配的记录
- **LEFT/RIGHT JOIN**：左/右连接，返回一侧全部及另一侧匹配
- **CROSS JOIN**：笛卡尔积
- **SELF JOIN**：自连接

```sql
SELECT u.id, u.name, o.order_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

## 2. 子查询与相关子查询
- **子查询**：查询中嵌套 SELECT
- **相关子查询**：子查询依赖外层查询的值

```sql
-- 查询有订单的用户
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
-- 查询每个用户的最新订单
SELECT u.id, u.name, (
  SELECT MAX(order_id) FROM orders o WHERE o.user_id = u.id
) AS latest_order FROM users u;
```

## 3. 聚合与分组
- **聚合函数**：COUNT、SUM、AVG、MAX、MIN
- **GROUP BY**：分组统计
- **HAVING**：分组后过滤
- **ROLLUP/CUBE**：多维汇总（MySQL 支持 ROLLUP）

```sql
SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING cnt > 5
WITH ROLLUP;
```

## 4. 窗口函数（MySQL 8.0+）
- **ROW_NUMBER()**：行号
- **RANK()/DENSE_RANK()**：排名
- **LEAD()/LAG()**：前后行取值
- **SUM()/AVG() OVER()**：分组内聚合

```sql
SELECT id, name, salary,
  RANK() OVER(PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;
```

## 5. 分页查询与优化
- **LIMIT offset, size**：常规分页
- **Keyset 分页**：大数据量推荐，性能更优

```sql
-- 常规分页
SELECT * FROM users ORDER BY id LIMIT 20, 10;
-- Keyset 分页
SELECT * FROM users WHERE id > 100 ORDER BY id LIMIT 10;
```

## 6. 复杂查询性能优化建议
- 优先用 JOIN 替代子查询，提升性能
- WHERE、JOIN、ORDER BY 字段加索引
- 避免 SELECT *，只查必要字段
- 用 EXPLAIN 分析执行计划，定位慢点
- 大批量分页用 Keyset 分页

## 7. SQL 及 Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询每个部门工资最高的员工
 * @param {import('mysql2/promise').Connection} conn
 * @returns {Promise<Array<{department: string, name: string, salary: number}>>}
 */
async function getTopSalaryByDept(conn) {
  const [rows] = await conn.execute(`
    SELECT department, name, salary
    FROM (
      SELECT department, name, salary,
        ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) AS rn
      FROM employees
    ) t WHERE rn = 1
  `);
  return rows;
}

/**
 * Keyset 分页查询用户
 * @param {import('mysql2/promise').Connection} conn
 * @param {number} lastId
 * @param {number} pageSize
 * @returns {Promise<Array>}
 */
async function getUsersByKeyset(conn, lastId, pageSize) {
  const [rows] = await conn.execute(
    'SELECT * FROM users WHERE id > ? ORDER BY id LIMIT ?',
    [lastId, pageSize]
  );
  return rows;
}
```

---

> 进阶查询能力是高效数据分析和业务开发的基础，建议团队持续学习新特性并结合实际场景优化查询。 