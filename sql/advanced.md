# SQL 复杂查询

SQL 支持多种高级查询特性，适用于复杂的数据分析和处理。

## 窗口函数（Window Function）
```sql
SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rank FROM employees;
```

## 公共表表达式（CTE）
```sql
WITH high_salary AS (
  SELECT * FROM employees WHERE salary > 10000
)
SELECT * FROM high_salary;
```

## 递归查询
```sql
WITH RECURSIVE nums AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 5
)
SELECT * FROM nums;
```

## 分区聚合
```sql
SELECT department, name, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询每个部门工资最高的前 3 名员工
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @returns {Promise<Array<{department: string, name: string, salary: number, dept_rank: number}>>}
 */
function getTop3ByDepartment(conn) {
  return conn.query(`
    SELECT department, name, salary, dept_rank FROM (
      SELECT department, name, salary,
        RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
      FROM employees
    ) t WHERE dept_rank <= 3
  `);
}
``` 