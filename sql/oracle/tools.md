# Oracle 常用工具

## 1. 官方命令行工具
- **sqlplus**：Oracle 官方交互式 SQL 命令行工具，支持脚本批量执行、管理数据库
- **expdp/impdp**（Data Pump）：逻辑备份与恢复
- **rman**：企业级物理备份与恢复
- **adrci**：故障诊断与日志管理

## 2. 图形化管理工具
- **SQL Developer**（官方，免费，功能强大）
- **Toad for Oracle**（商业，开发/运维常用）
- **DBeaver**、**Navicat**（多数据库支持，跨平台）

## 3. 性能分析与监控工具
- **AWR/ASH/ADDM**：性能报告与分析（需企业版）
- **OEM/Cloud Control**：全方位监控与告警
- **SQL*Plus**：可查看执行计划、锁等待等

## 4. 备份与恢复工具
- **rman**：物理备份/恢复、增量备份、归档管理
- **expdp/impdp**：逻辑备份/恢复、数据迁移

## 5. 数据迁移与同步工具
- **Data Pump**（expdp/impdp）：跨库迁移
- **GoldenGate**：实时数据同步（需授权）
- **SQL*Loader**：批量数据导入

## 6. 工具对比与使用建议
| 工具         | 主要用途         | 优点           | 缺点           |
|--------------|------------------|----------------|----------------|
| sqlplus      | SQL 执行/管理    | 轻量、脚本化   | 交互体验一般   |
| SQL Developer| 图形化管理       | 免费、强大     | 需安装 Java    |
| rman         | 物理备份/恢复    | 企业级、可靠   | 学习曲线略高   |
| expdp/impdp  | 逻辑备份/迁移    | 高效、灵活     | 需配置目录     |
| GoldenGate   | 实时同步         | 高可用         | 商业授权       |

## 7. Node.js 自动化实践代码（含 JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用 sqlplus 执行 SQL 脚本
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @param {string} service - 服务名
 * @param {string} scriptPath - SQL 脚本路径
 * @returns {Promise<void>}
 */
function runSqlplusScript(user, password, service, scriptPath) {
  const cmd = `sqlplus ${user}/${password}@${service} @${scriptPath}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}
```

---

Oracle 工具体系丰富，建议结合业务场景选型，自动化脚本提升运维效率。 