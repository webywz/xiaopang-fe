# PostgreSQL 备份与恢复（详解）

## 1. 备份类型与策略
- **逻辑备份**：导出 SQL 文件（如 pg_dump、pg_dumpall），可跨平台恢复，适合小型/结构变更频繁场景。
- **物理备份**：直接拷贝数据文件（如 pg_basebackup），速度快，适合大数据量。
- **全量备份**：备份所有数据。
- **增量/归档备份**：基于 WAL 日志归档，支持时间点恢复（PITR）。
- 建议定期全量+高频增量，结合自动化脚本。

## 2. 常用备份工具
- **pg_dump**：单库逻辑备份，支持表/库/全库导出。
- **pg_dumpall**：所有数据库逻辑备份，含全局对象（角色、表空间等）。
- **pg_basebackup**：物理热备工具，适合大数据量、主从搭建。
- **WAL 归档**：增量备份与时间点恢复（PITR）核心。

## 3. 备份与恢复操作详解
### 3.1 使用 pg_dump 备份
```bash
# 备份单库
pg_dump -U postgres -F c -b -v -f mydb.backup mydb
# 备份表结构
pg_dump -U postgres -s mydb > mydb_schema.sql
```

### 3.2 恢复数据
```bash
# 恢复到新库
pg_restore -U postgres -d newdb -v mydb.backup
# SQL 文件恢复
psql -U postgres -d mydb -f mydb_schema.sql
```

### 3.3 使用 pg_basebackup 物理热备
```bash
pg_basebackup -U repluser -D /data/backup/full -Fp -Xs -P
```

### 3.4 WAL 归档与时间点恢复
- 配置 `archive_mode=on`，`archive_command`，定期归档 WAL 日志
- 恢复时指定 `recovery_target_time`

## 4. 备份自动化与定时任务
- 可用 crontab 定时执行备份脚本
```bash
# 每天凌晨2点自动备份
0 2 * * * pg_dump -U postgres -F c -b -v -f /backup/mydb_$(date +\%F).backup mydb
```
- 建议备份脚本中加入日志、异常处理、空间检查

## 5. 备份安全与加密
- 备份文件应加密存储，防止泄露
- 可用 openssl/gpg 加密备份文件
```bash
pg_dump -U postgres mydb | gzip | openssl enc -aes-256-cbc -e -k 密码 > mydb_backup.sql.gz.enc
```
- 备份文件应妥善归档，定期校验可用性

## 6. 常见问题与最佳实践
- 恢复前建议在测试环境先验证备份文件有效性
- 备份期间避免大事务，防止数据不一致
- 生产环境建议用专用账号备份，权限最小化
- 定期清理过期备份，节省存储空间
- 配置 WAL 归档，支持时间点恢复

## 7. Node.js 调用备份脚本代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 通过 Node.js 调用 pg_dump 备份数据库
 * @param {string} dbName 数据库名
 * @param {string} user 用户名
 * @param {string} outFile 输出文件路径
 * @returns {Promise<void>}
 */
function backupDatabase(dbName, user, outFile) {
  return new Promise((resolve, reject) => {
    const cmd = `pg_dump -U ${user} -F c -b -v -f ${outFile} ${dbName}`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

---

> 备份是数据安全的最后防线，建议团队制定完善的备份策略，定期演练恢复流程，确保关键数据可随时恢复。 