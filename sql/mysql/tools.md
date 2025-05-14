# MySQL 工具大全（详解）

## 1. 官方命令行工具
- **mysql**：命令行客户端，支持 SQL 执行、脚本批处理
- **mysqladmin**：管理工具，支持状态查询、重载、关闭等
- **mysqldump**：逻辑备份工具，支持表/库/全库导出
- **mysqlpump**：多线程逻辑备份，速度更快
- **mysqlimport**：批量导入工具，适合大数据量
- **mysqlslap**：压力测试工具

## 2. 图形化管理工具
- **DBeaver**：开源，跨平台，支持多种数据库
- **Navicat**：商业软件，界面友好，功能强大
- **DataGrip**：JetBrains 出品，智能补全，支持多库
- **HeidiSQL**：轻量级，适合 MySQL/MariaDB
- **MySQL Workbench**：官方出品，支持建模、管理、迁移

## 3. 性能分析与监控工具
- **Percona Toolkit**：pt-query-digest、pt-online-schema-change 等，适合慢查询分析、在线变更
- **MySQL Enterprise Monitor**：官方企业版监控
- **Prometheus + Grafana**：开源监控方案，配合 mysqld_exporter
- **INFORMATION_SCHEMA/Performance_Schema**：内置性能视图

## 4. 备份与恢复工具
- **mysqldump/mysqlpump**：逻辑备份，适合小型/结构变更场景
- **Percona XtraBackup**：物理热备，适合大数据量
- **MySQL Enterprise Backup**：官方企业版热备

## 5. 数据迁移与同步工具
- **MySQL Workbench**：支持数据迁移、结构同步
- **DataX**：阿里开源，支持多源异构数据同步
- **Canal/Maxwell**：基于 binlog 的实时同步，适合大数据/消息队列
- **mysqldump + source**：逻辑迁移

## 6. 工具对比与选型建议
| 工具类型   | 推荐场景           | 优点           | 缺点           |
|------------|--------------------|----------------|----------------|
| DBeaver    | 多库管理、开发     | 免费、跨平台   | 部分功能需插件 |
| Navicat    | 商业项目、团队协作 | 界面好、功能全 | 收费           |
| pt-query-digest | 慢查询分析     | 细粒度分析     | 需命令行操作   |
| xtrabackup | 热备、恢复         | 无锁、快       | 配置略复杂     |
| Canal      | 实时同步           | 支持大数据     | 需 binlog 支持 |

## 7. Node.js 自动化实践代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * Node.js 自动调用 pt-query-digest 分析慢查询日志
 * @param {string} slowLogPath 慢查询日志路径
 * @param {string} outFile 输出报告路径
 * @returns {Promise<void>}
 */
function analyzeSlowQuery(slowLogPath, outFile) {
  return new Promise((resolve, reject) => {
    const cmd = `pt-query-digest ${slowLogPath} > ${outFile}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

---

> 工具的合理选型和自动化集成能大幅提升开发、运维效率，建议团队定期评估工具链并持续优化。 