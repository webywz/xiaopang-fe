# Oracle 备份与恢复

## 1. 备份类型与策略
- 物理备份：数据文件、控制文件、归档日志（适合生产环境）
- 逻辑备份：导出表/库结构与数据（exp/expdp）
- 支持全库、单表、增量、差异、快照等多种备份
- 建议定期全量+增量备份，重要表单独备份

## 2. 常用备份与恢复工具
- RMAN（推荐，企业级物理备份/恢复工具）
- Data Pump（expdp/impdp，逻辑备份/恢复）
- 传统 exp/imp（老版本）

## 3. 详细备份与恢复操作
```bash
# 使用 RMAN 全库备份
rman target / <<EOF
BACKUP DATABASE PLUS ARCHIVELOG;
EOF

# 使用 Data Pump 导出全库
expdp system/password@service FULL=Y DIRECTORY=backup_dir DUMPFILE=full_20240601.dmp LOGFILE=full_20240601.log

# 恢复数据库（RMAN）
RMAN> RESTORE DATABASE;
RMAN> RECOVER DATABASE;

# 恢复数据泵导出
impdp system/password@service FULL=Y DIRECTORY=backup_dir DUMPFILE=full_20240601.dmp LOGFILE=imp_20240601.log
```

## 4. 自动化与调度建议
- 生产环境建议用 crontab/调度平台定时执行备份脚本
- 备份文件定期归档、异地/云端存储，保留多份

## 5. 备份安全与加密
- 备份文件建议加密存储，限制访问权限
- 可用 RMAN/expdp 自带加密参数

## 6. 常见问题与最佳实践
- 定期测试恢复流程，确保备份可用
- 备份前后监控空间与性能，避免高峰期操作
- 重要操作前手动备份，防止误操作丢失数据

## 7. Node.js 代码示例（含 JSDoc 注释）
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
```

---

Oracle 备份与恢复建议结合物理+逻辑方案，定期演练恢复，保障数据安全。 