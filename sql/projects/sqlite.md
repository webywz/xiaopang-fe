# SQLite 实战项目

SQLite 是轻量级、零配置的嵌入式关系型数据库，广泛应用于移动端、桌面端和小型 Web 项目。

## 典型应用场景
- 移动 App 本地存储（如微信、支付宝）
- 桌面软件数据管理
- 小型 Web 服务或原型开发

## 表结构设计
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 事务支持
- SQLite 支持原子性事务，适合批量写入和数据一致性要求高的场景。

```js
/**
 * 批量插入笔记（事务）
 * @param {import('sqlite3').Database} db
 * @param {Array<{title: string, content: string}>} notes
 * @returns {Promise<void>}
 */
function insertNotesBatch(db, notes) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      for (const note of notes) {
        db.run('INSERT INTO notes (title, content) VALUES (?, ?)', [note.title, note.content]);
      }
      db.run('COMMIT', err => {
        if (err) reject(err); else resolve();
      });
    });
  });
}
```

## 数据迁移与兼容性
- 可通过 `.dump` 命令导出 SQL 脚本，便于迁移到 MySQL/PostgreSQL。
- 注意数据类型兼容性和主键自增语法差异。

## 性能优化
- 合理使用索引，避免频繁 VACUUM。
- 批量写入时开启事务，显著提升性能。

## 常见问题
- 并发写入有限制，适合单用户或低并发场景。
- 文件损坏时可通过备份恢复。 