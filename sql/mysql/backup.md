# MySQL 备份与恢复（详解）

## 1. 备份类型与策略
- **逻辑备份**：导出 SQL 文件（如 mysqldump），可跨平台恢复，适合小型/结构变更频繁场景。
- **物理备份**：直接拷贝数据文件（如 xtrabackup），速度快，适合大数据量。
- **全量备份**：备份所有数据。
- **增量备份**：只备份自上次备份以来有变更的数据。
- **差异备份**：只备份自上次全量备份以来有变更的数据。
- 建议定期全量+高频增量，结合自动化脚本。

## 2. 常用备份工具
- **mysqldump**：最常用逻辑备份工具，支持表/库/全库导出。
- **mysqlpump**：多线程逻辑备份，速度更快。
- **Percona XtraBackup**：开源物理热备工具，支持 InnoDB 热备。
- **物理拷贝**：停库后直接拷贝数据目录，适合紧急场景。

## 3. 备份与恢复操作详解
### 3.1 使用 mysqldump 备份
```bash
# 备份单库
mysqldump -u root -p mydb > mydb_backup.sql
# 备份所有库
mysqldump -u root -p --all-databases > all_backup.sql
# 备份表结构
mysqldump -u root -p -d mydb > mydb_schema.sql
```

### 3.2 恢复数据
```bash
mysql -u root -p mydb < mydb_backup.sql
```

### 3.3 使用 xtrabackup 物理热备
```bash
# 全量备份
xtrabackup --backup --target-dir=/data/backup/full
# 增量备份
xtrabackup --backup --target-dir=/data/backup/inc --incremental-basedir=/data/backup/full
# 恢复
xtrabackup --prepare --target-dir=/data/backup/full
xtrabackup --copy-back --target-dir=/data/backup/full
```

## 4. 备份自动化与定时任务
- 可用 crontab 定时执行备份脚本
```bash
# 每天凌晨2点自动备份
0 2 * * * /usr/bin/mysqldump -u root -p123456 mydb > /backup/mydb_$(date +\%F).sql
```
- 建议备份脚本中加入日志、异常处理、空间检查

## 5. 备份安全与加密
- 备份文件应加密存储，防止泄露
- 可用 openssl/gpg 加密 SQL 文件
```bash
mysqldump -u root -p mydb | gzip | openssl enc -aes-256-cbc -e -k 密码 > mydb_backup.sql.gz.enc
```
- 备份文件应妥善归档，定期校验可用性

## 6. 常见问题与最佳实践
- 恢复前建议在测试环境先验证备份文件有效性
- 备份期间避免大事务，防止数据不一致
- 生产环境建议用专用账号备份，权限最小化
- 定期清理过期备份，节省存储空间

## 7. Node.js 调用备份脚本代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 通过 Node.js 调用 mysqldump 备份数据库
 * @param {string} dbName 数据库名
 * @param {string} user 用户名
 * @param {string} password 密码
 * @param {string} outFile 输出文件路径
 * @returns {Promise<void>}
 */
function backupDatabase(dbName, user, password, outFile) {
  return new Promise((resolve, reject) => {
    const cmd = `mysqldump -u ${user} -p${password} ${dbName} > ${outFile}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

---

> 备份是数据安全的最后防线，建议团队制定完善的备份策略，定期演练恢复流程，确保关键数据可随时恢复。 