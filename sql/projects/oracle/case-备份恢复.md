# Oracle 实战案例：备份与恢复自动化

## 1. 需求描述
以"生产环境数据库定时备份与自动恢复"为例，要求实现每日自动全库备份、支持一键恢复，保障数据安全，适合企业级生产环境。

## 2. 备份对象说明
- 支持全库物理备份（RMAN）、逻辑备份（Data Pump expdp/impdp）
- 支持单表、增量、归档日志等多种备份
- 备份文件可本地存储或上传云端
- 恢复对象为整个数据库或指定表

## 3. 核心操作命令与脚本
```bash
# 全库物理备份（RMAN）
rman target / <<EOF
BACKUP DATABASE PLUS ARCHIVELOG;
EOF

# 逻辑备份（Data Pump 导出全库）
expdp system/password@service FULL=Y DIRECTORY=backup_dir DUMPFILE=full_20240601.dmp LOGFILE=full_20240601.log

# 恢复数据库（RMAN）
RMAN> RESTORE DATABASE;
RMAN> RECOVER DATABASE;

# 恢复数据泵导出
impdp system/password@service FULL=Y DIRECTORY=backup_dir DUMPFILE=full_20240601.dmp LOGFILE=imp_20240601.log

# 自动化备份脚本（crontab 每日 2:00 执行）
0 2 * * * /usr/local/bin/oracle_backup.sh

# oracle_backup.sh 示例
#!/bin/bash
export ORACLE_SID=ORCL
rman target / <<EOF
BACKUP DATABASE PLUS ARCHIVELOG;
EOF
find /backup -type f -mtime +7 -delete  # 保留7天
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用系统命令自动备份 Oracle 数据库（Data Pump）
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @param {string} service - 服务名
 * @param {string} dumpFile - 备份文件名
 * @returns {Promise<void>}
 */
function backupOracle(user, password, service, dumpFile) {
  const cmd = `expdp ${user}/${password}@${service} FULL=Y DIRECTORY=backup_dir DUMPFILE=${dumpFile}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}

/**
 * 恢复 Oracle 数据库（Data Pump）
 * @param {string} user
 * @param {string} password
 * @param {string} service
 * @param {string} dumpFile
 * @returns {Promise<void>}
 */
function restoreOracle(user, password, service, dumpFile) {
  const cmd = `impdp ${user}/${password}@${service} FULL=Y DIRECTORY=backup_dir DUMPFILE=${dumpFile}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
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

本案例适合企业级生产环境，建议结合实际业务制定多层次备份与恢复策略。 