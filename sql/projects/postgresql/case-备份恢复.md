 # PostgreSQL 实战案例：备份与恢复自动化

## 1. 需求描述
以“生产环境数据库定时备份与自动恢复”为例，要求实现每日自动全库备份、支持一键恢复，保障数据安全，适用于企业级生产环境。

## 2. 备份对象说明
- 支持全库备份、单表备份、增量备份（WAL 日志归档）
- 备份文件可本地存储或上传云端
- 恢复对象可为整个数据库或指定表

## 3. 核心操作命令与脚本
```bash
# 全库备份（每日定时）
pg_dump -U postgres -F c -b -f /backup/pgdb_$(date +%F).dump mydb

# 单表备份
pg_dump -U postgres -t users -F c -b -f /backup/users_$(date +%F).dump mydb

# 恢复数据库
pg_restore -U postgres -d mydb_restore /backup/pgdb_2024-06-01.dump

# 自动化备份脚本（crontab 每日 2:00 执行）
0 2 * * * /usr/local/bin/pg_backup.sh

# pg_backup.sh 示例
#!/bin/bash
export PGPASSWORD=yourpassword
pg_dump -U postgres -F c -b -f /backup/pgdb_$(date +%F).dump mydb
find /backup -type f -mtime +7 -delete  # 保留7天
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用系统命令自动备份 PostgreSQL 数据库
 * @param {string} dbName - 数据库名
 * @param {string} backupPath - 备份文件路径
 * @returns {Promise<void>}
 */
function backupDatabase(dbName, backupPath) {
  return new Promise((resolve, reject) => {
    const cmd = `pg_dump -U postgres -F c -b -f ${backupPath} ${dbName}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr);
      resolve();
    });
  });
}

/**
 * 恢复 PostgreSQL 数据库
 * @param {string} dbName - 目标数据库名
 * @param {string} dumpFile - 备份文件路径
 * @returns {Promise<void>}
 */
function restoreDatabase(dbName, dumpFile) {
  return new Promise((resolve, reject) => {
    const cmd = `pg_restore -U postgres -d ${dbName} ${dumpFile}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr);
      resolve();
    });
  });
}
```

## 5. 优化与总结
- 建议定期全库+增量备份，重要表可单独备份
- 备份文件加密存储，防止泄露
- 备份脚本加入日志与异常告警
- 定期测试恢复流程，确保可用性
- 备份文件可同步至异地或云端，防止单点故障
- 监控备份任务执行状态，及时发现异常

---

> 本案例适合企业级生产环境，建议结合实际业务制定多层次备份与恢复策略。