# MySQL 实战案例：备份与恢复自动化

## 1. 需求描述
生产环境数据库需定期自动备份，支持一键恢复，防止数据丢失。要求备份安全、可校验、恢复流程可自动化演练。

## 2. 备份策略与工具选型
- 备份类型：全量+增量，定期归档
- 工具选型：
  - 小型/结构变更频繁：mysqldump
  - 大数据量/热备：Percona XtraBackup
- 自动化：crontab 定时任务 + 备份脚本
- 备份文件加密存储，定期校验可用性

## 3. 备份与恢复核心操作
```bash
# 全量备份（mysqldump）
mysqldump -u root -p mydb > /backup/mydb_$(date +%F).sql

# 恢复数据
mysql -u root -p mydb < /backup/mydb_2024-06-01.sql

# 备份加密
mysqldump -u root -p mydb | gzip | openssl enc -aes-256-cbc -e -k 密码 > /backup/mydb_$(date +%F).sql.gz.enc

# 定时任务（crontab）
0 2 * * * /usr/bin/mysqldump -u root -p123456 mydb > /backup/mydb_$(date +\%F).sql
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 自动化备份数据库
 * @param {string} dbName
 * @param {string} user
 * @param {string} password
 * @param {string} outFile
 * @returns {Promise<void>}
 */
function backupDatabase(dbName, user, password, outFile) {
  return new Promise((resolve, reject) => {
    const cmd = `mysqldump -u ${user} -p${password} ${dbName} > ${outFile}`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * 自动化恢复数据库
 * @param {string} dbName
 * @param {string} user
 * @param {string} password
 * @param {string} inFile
 * @returns {Promise<void>}
 */
function restoreDatabase(dbName, user, password, inFile) {
  return new Promise((resolve, reject) => {
    const cmd = `mysql -u ${user} -p${password} ${dbName} < ${inFile}`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

## 5. 优化与总结
- 备份文件加密存储，防止泄露
- 定期校验备份文件可用性，恢复前先在测试库演练
- 备份脚本加入日志、异常处理、空间检查
- 生产环境建议用专用账号备份，权限最小化
- 定期清理过期备份，节省存储空间
- 结合监控系统，备份失败及时告警

---

> 本案例适合各类生产环境数据库安全保障，建议团队制定完善的备份策略并定期演练恢复流程。 