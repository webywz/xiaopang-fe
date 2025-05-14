# SQLite 备份与恢复

## 1. 备份类型与策略
- 文件级物理备份（直接复制 .db 文件，适合绝大多数场景）
- SQL 导出（.dump 逻辑备份，便于迁移与版本管理）
- 建议定期全量备份，重要数据可多地存储

## 2. 常用备份与恢复工具
- sqlite3 CLI（.backup、.dump、.restore 命令）
- 直接复制数据库文件（需确保无写入操作）

## 3. 详细备份与恢复操作
```bash
# 物理备份（推荐，需无写入）
cp mydb.sqlite backup/mydb_20240601.sqlite

# 逻辑备份（SQL 导出）
sqlite3 mydb.sqlite ".dump" > backup/mydb_20240601.sql

# 恢复数据库（SQL 导入）
sqlite3 newdb.sqlite < backup/mydb_20240601.sql

# CLI 备份命令
sqlite3 mydb.sqlite ".backup backup/mydb_20240601.sqlite"
```

## 4. 自动化与调度建议
- 可用 crontab/定时任务自动执行备份脚本
- 备份文件定期归档、异地/云端存储，保留多份

## 5. 备份安全与加密
- 备份文件建议加密存储，限制访问权限
- 可结合 zip/gpg 等工具加密

## 6. 常见问题与最佳实践
- 备份时确保无写入操作，避免文件损坏
- 定期测试恢复流程，确保备份可用
- 重要操作前手动备份，防止误操作丢失数据

## 7. Node.js 代码示例（含 JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用系统命令自动备份 SQLite 数据库
 * @param {string} dbPath - 数据库文件路径
 * @param {string} backupPath - 备份文件路径
 * @returns {Promise<void>}
 */
function backupSqlite(dbPath, backupPath) {
  const cmd = `sqlite3 ${dbPath} ".backup ${backupPath}"`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}
```

---

SQLite 备份与恢复简单高效，建议定期自动化备份，重要数据多地存储，定期演练恢复。 