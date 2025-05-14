# SQLite 实战案例：备份与恢复自动化

## 1. 需求描述
以"生产环境数据库定时备份与自动恢复"为例，要求实现每日自动全库备份、支持一键恢复，保障数据安全，适合嵌入式、移动端、轻量级生产环境。

## 2. 备份对象说明
- 支持全库物理备份（复制 .db 文件）、逻辑备份（.dump SQL 导出）
- 备份文件可本地存储或上传云端
- 恢复对象为整个数据库文件

## 3. 核心操作命令与脚本
```bash
# 物理备份（需无写入）
cp mydb.sqlite backup/mydb_$(date +%F).sqlite

# 逻辑备份（SQL 导出）
sqlite3 mydb.sqlite ".dump" > backup/mydb_$(date +%F).sql

# 恢复数据库（SQL 导入）
sqlite3 newdb.sqlite < backup/mydb_2024-06-01.sql

# CLI 备份命令
sqlite3 mydb.sqlite ".backup backup/mydb_$(date +%F).sqlite"

# 自动化备份脚本（crontab 每日 2:00 执行）
0 2 * * * /usr/local/bin/sqlite_backup.sh

# sqlite_backup.sh 示例
#!/bin/bash
cp /data/mydb.sqlite /backup/mydb_$(date +%F).sqlite
find /backup -type f -mtime +7 -delete  # 保留7天
```

## 4. Node.js 代码示例（含 JSDoc 注释）
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

/**
 * 恢复 SQLite 数据库（SQL 导入）
 * @param {string} dumpFile - SQL 备份文件路径
 * @param {string} dbPath - 新数据库文件路径
 * @returns {Promise<void>}
 */
function restoreSqlite(dumpFile, dbPath) {
  const cmd = `sqlite3 ${dbPath} < ${dumpFile}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}
```

## 5. 优化与总结
- 建议定期全库备份，重要数据多地存储
- 备份文件加密存储，防止泄露
- 备份脚本加入日志与异常告警
- 定期测试恢复流程，确保可用性
- 备份文件可同步至云端或异地，防止单点故障
- 监控备份任务执行状态，及时发现异常

---

本案例适合嵌入式、移动端、轻量级生产环境，建议结合实际业务制定多层次备份与恢复策略。 