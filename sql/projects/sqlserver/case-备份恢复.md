# SQL Server 实战案例：备份与恢复自动化

## 1. 需求描述
以"生产环境数据库定时备份与自动恢复"为例，要求实现每日自动全库备份、支持一键恢复，保障数据安全，适合企业级生产环境。

## 2. 备份对象说明
- 支持全库备份、单表备份、差异备份、事务日志备份
- 备份文件可本地存储或上传云端
- 恢复对象为整个数据库或指定表

## 3. 核心操作命令与脚本
```sql
-- 全库备份
BACKUP DATABASE [mydb] TO DISK = N'/backup/mydb_full_20240601.bak' WITH INIT, COMPRESSION;

-- 差异备份
BACKUP DATABASE [mydb] TO DISK = N'/backup/mydb_diff_20240601.bak' WITH DIFFERENTIAL, INIT, COMPRESSION;

-- 事务日志备份
BACKUP LOG [mydb] TO DISK = N'/backup/mydb_log_20240601.trn' WITH INIT;

-- 恢复数据库（覆盖原库）
RESTORE DATABASE [mydb] FROM DISK = N'/backup/mydb_full_20240601.bak' WITH REPLACE;

-- 恢复差异/日志需先还原全库备份，再还原差异/日志备份

-- 自动化备份脚本（Windows 计划任务或 SQL Agent 调度）
-- 可用 PowerShell、bat 脚本或 SQL Agent Job 定时执行上述命令
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用 sqlcmd 自动备份 SQL Server 数据库
 * @param {string} dbName - 数据库名
 * @param {string} backupPath - 备份文件路径
 * @returns {Promise<void>}
 */
function backupSqlServer(dbName, backupPath) {
  const cmd = `sqlcmd -Q "BACKUP DATABASE [${dbName}] TO DISK = N'${backupPath}' WITH INIT, COMPRESSION"`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}

/**
 * 恢复 SQL Server 数据库
 * @param {string} dbName - 目标数据库名
 * @param {string} bakFile - 备份文件路径
 * @returns {Promise<void>}
 */
function restoreSqlServer(dbName, bakFile) {
  const cmd = `sqlcmd -Q "RESTORE DATABASE [${dbName}] FROM DISK = N'${bakFile}' WITH REPLACE"`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}
```

## 5. 优化与总结
- 建议定期全库+差异+日志备份，重要表可单独备份
- 备份文件加密存储，防止泄露
- 备份脚本加入日志与异常告警
- 定期测试恢复流程，确保可用性
- 备份文件可同步至异地或云端，防止单点故障
- 监控备份任务执行状态，及时发现异常

---

本案例适合企业级生产环境，建议结合实际业务制定多层次备份与恢复策略。 