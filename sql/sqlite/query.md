# SQLite 查询与操作

# SQLite 查询进阶

## 多表联结（JOIN）
```sql
-- 内联结
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 左外联结
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

## 子查询与相关子查询
```sql
-- 子查询
SELECT name FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 100);

-- 相关子查询
SELECT name FROM users u WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.amount > 100
);
```

## 聚合与分组
```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 1000;
```

## 窗口函数（3.25+）
```sql
SELECT id, amount, ROW_NUMBER() OVER (ORDER BY amount DESC) AS rn
FROM orders;
```

## 分页查询
```sql
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 10;
```

## 性能优化建议
- WHERE 条件优先用索引字段，避免函数包裹
- 大表分页建议用主键游标法
- 合理拆分复杂 SQL，减少嵌套

## Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 查询用户订单总额
 * @param {sqlite3.Database} db
 * @param {number} userId
 * @returns {Promise<number>}
 */
function getUserOrderTotal(db, userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(amount) AS total FROM orders WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row?.total || 0);
    });
  });
}
```

---

SQLite 查询灵活，建议结合索引优化性能，复杂查询建议分步调试。 