# SQLite 数据类型

内容建设中，敬请期待。

# SQLite 常用数据类型

## 数值类型
- INTEGER：整型，支持自增（PRIMARY KEY AUTOINCREMENT）
- REAL：浮点数
- NUMERIC：高精度数值，自动适配存储

## 字符串类型
- TEXT：变长字符串，无长度限制
- VARCHAR(n)：等价于 TEXT（SQLite 不强制长度）

## 日期与时间类型
- SQLite 无专用日期类型，推荐用 TEXT（ISO8601）、REAL（Julian day）、INTEGER（Unix 时间戳）存储
- 常用函数：date()、datetime()、strftime()

## 布尔与特殊类型
- BOOLEAN：实际存储为 0/1（INTEGER）
- BLOB：二进制大对象

## 类型转换与兼容性
- SQLite 类型系统宽松，字段可存储任意类型（类型亲和性）
- 跨库迁移需注意类型严格性差异

## 设计建议与常见误区
- 主键建议用 INTEGER PRIMARY KEY，自动 ROWID
- 日期统一格式存储，便于查询与迁移
- 避免依赖类型约束，应用层需做校验

## 典型 SQL 示例
```sql
-- 创建表
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT,
  created_at TEXT  -- 推荐存储为 ISO8601 字符串
);
```

## Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 插入日志数据
 * @param {sqlite3.Database} db
 * @param {object} log {message:string,created_at:string}
 * @returns {Promise<void>}
 */
function insertLog(db, log) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO logs (message, created_at) VALUES (?, ?)', [log.message, log.created_at], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

---

SQLite 类型宽松，建议统一字段格式，关键数据应用层校验，便于后续迁移与维护。 