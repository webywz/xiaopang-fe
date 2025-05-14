# SQLite 实战案例：全文检索

## 1. 需求描述
以"日志内容搜索"为例，要求支持对大量文本内容进行高效关键词检索、相关性排序，适合日志、文章、商品等场景。

## 2. 表结构设计
```sql
-- 使用 FTS5 创建全文索引表
CREATE VIRTUAL TABLE logs_fts USING fts5(message, content='logs', content_rowid='id');

-- 触发器同步原表与 FTS 表
CREATE TRIGGER logs_ai AFTER INSERT ON logs BEGIN
  INSERT INTO logs_fts(rowid, message) VALUES (new.id, new.message);
END;
CREATE TRIGGER logs_ad AFTER DELETE ON logs BEGIN
  DELETE FROM logs_fts WHERE rowid = old.id;
END;
CREATE TRIGGER logs_au AFTER UPDATE ON logs BEGIN
  UPDATE logs_fts SET message = new.message WHERE rowid = new.id;
END;
```

## 3. 核心 SQL 示例
```sql
-- 全文检索关键词
SELECT l.id, l.message
FROM logs_fts f
JOIN logs l ON l.id = f.rowid
WHERE logs_fts MATCH ?
ORDER BY rank
LIMIT 20;

-- 维护 FTS 索引（重建）
INSERT INTO logs_fts(logs_fts) VALUES('rebuild');
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 全文检索日志内容
 * @param {sqlite3.Database} db
 * @param {string} keywords - 检索关键词
 * @param {number} [limit=20]
 * @returns {Promise<Array<{id:number,message:string}>>}
 */
function searchLogs(db, keywords, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT l.id, l.message FROM logs_fts f JOIN logs l ON l.id = f.rowid WHERE logs_fts MATCH ? ORDER BY rank LIMIT ?`,
      [keywords, limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
```

## 5. 优化与总结
- 推荐使用 FTS5 提升全文检索性能
- 查询时优先用 MATCH，避免 LIKE 全表扫描
- 需用触发器保持原表与 FTS 表同步
- 定期重建 FTS 索引，保证检索效率
- 注意 FTS 不支持所有 SQL 语法，需查阅官方文档

---

本案例适合日志、文章、商品等全文检索场景，建议结合实际业务调整分词与索引策略。 