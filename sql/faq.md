# SQL 常见问题 FAQ

## 1. 语法与兼容性
**Q1：为什么同一 SQL 在不同数据库报错？**  
A：SQL 标准各数据库实现有差异，常见如字符串拼接、日期函数、分页语法等。建议查阅目标数据库官方文档，避免使用专有语法。

**Q2：如何安全拼接 SQL？**  
A：严禁字符串拼接参数，必须使用参数化查询，防止 SQL 注入。

## 2. 性能与慢查询
**Q3：SQL 查询很慢怎么办？**  
A：优先检查是否命中索引，使用 EXPLAIN 分析执行计划，避免全表扫描。可通过加索引、优化 SQL、分区表等手段提升性能。

**Q4：如何定位慢 SQL？**  
A：开启慢查询日志，定期分析日志，重点关注扫描行数多、执行时间长的语句。

## 3. 事务与锁
**Q5：为什么出现死锁？如何排查？**  
A：多事务并发更新同一资源顺序不一致易导致死锁。建议统一操作顺序，捕获死锁异常并重试。可用数据库自带工具（如 PostgreSQL 的 pg_locks）排查。

**Q6：事务未提交导致表被锁住怎么办？**  
A：及时提交或回滚事务，避免长事务。可通过管理工具查看并终止异常会话。

## 4. 安全与数据保护
**Q7：如何防止 SQL 注入？**  
A：所有输入参数必须参数化，严禁拼接。定期安全审计，限制数据库账户权限。

**Q8：如何加密敏感数据？**  
A：可用数据库内置加密函数或应用层加密，备份文件也应加密存储。

## 5. 备份恢复与数据丢失
**Q9：误删数据如何恢复？**  
A：如有定期备份可通过备份恢复。建议所有生产环境定期全量+增量备份，重要操作前手动备份。

**Q10：备份文件如何管理？**  
A：备份文件应异地存储、加密、定期校验，定期测试恢复流程。

## 6. 其他高频问题
**Q11：NULL 和空字符串有何区别？**  
A：NULL 表示未知，空字符串为长度为0的已知值。判断 NULL 用 IS NULL。

**Q12：如何防止表结构频繁变更带来的风险？**  
A：表结构变更前充分评估，建议版本化管理，生产环境变更需灰度或离线操作。

## 7. 典型代码片段（含 JSDoc 注释）
```js
/**
 * 参数化查询防止 SQL 注入
 * @param {import('pg').Pool} pool
 * @param {string} username
 * @returns {Promise<object|null>} 用户信息
 */
async function getUserByName(pool, username) {
  const sql = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(sql, [username]);
  return rows[0] || null;
}

/**
 * 查询慢 SQL（以 MySQL 为例）
 * @param {import('mysql').Connection} conn
 * @returns {Promise<Array>} 慢查询列表
 */
function getSlowQueries(conn) {
  return conn.query('SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10');
}
```

---

如有更多问题，建议查阅官方文档或团队内部知识库，持续总结与分享经验。 