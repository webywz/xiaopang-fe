# SQLite 实战案例：大数据量与批量操作

## 1. 需求描述
以"日志归档与批量写入"为例，要求高效插入大量日志数据，支持历史数据快速查询与归档，适合嵌入式、移动端、轻量级大数据场景。

## 2. 表结构设计
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT,
  level TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_created_at ON logs(created_at);
```

## 3. 核心 SQL 示例
```sql
-- 批量插入日志（事务包裹）
BEGIN;
INSERT INTO logs(message, level) VALUES('系统启动', 'info');
INSERT INTO logs(message, level) VALUES('异常警告', 'warn');
-- ...
COMMIT;

-- 查询指定时间段日志
SELECT * FROM logs WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC LIMIT 100;

-- 归档历史日志
DELETE FROM logs WHERE created_at < date('now', '-30 day');

-- VACUUM 优化数据库文件
VACUUM;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 批量插入日志（事务包裹）
 * @param {sqlite3.Database} db
 * @param {Array<{message:string,level:string}>} logs
 * @returns {Promise<void>}
 */
function batchInsertLogs(db, logs) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN');
      for (const log of logs) {
        db.run('INSERT INTO logs(message, level) VALUES(?, ?)', [log.message, log.level]);
      }
      db.run('COMMIT', err => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

/**
 * 查询最近 N 条指定级别日志
 * @param {sqlite3.Database} db
 * @param {string} level
 * @param {number} limit
 * @returns {Promise<Array>}
 */
function getRecentLogs(db, level, limit) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM logs WHERE level = ? ORDER BY created_at DESC LIMIT ?',
      [level, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
```

## 5. 优化与总结
- 批量写入建议用事务包裹，显著提升性能
- 合理建索引，提升查询效率，避免过多无用索引
- 定期归档/清理历史数据，防止表膨胀
- 定期执行 VACUUM 优化数据库文件
- 查询大表时优先用索引字段过滤，避免全表扫描

---

本案例适合日志归档、批量写入、历史数据分析等大数据量场景，建议结合业务需求灵活调整表结构与归档策略。 