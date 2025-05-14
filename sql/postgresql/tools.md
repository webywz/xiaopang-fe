# PostgreSQL 工具大全（详解）

## 1. 官方命令行工具
- **psql**：命令行客户端，支持 SQL 执行、脚本批处理、元命令
- **pg_dump/pg_restore**：逻辑备份与恢复工具，支持表/库/全库导出
- **pg_basebackup**：物理热备工具，适合主从搭建、大数据量备份
- **pg_isready**：数据库健康检查
- **pg_ctl**：服务管理工具，启动/停止/重载

## 2. 图形化管理工具
- **pgAdmin**：官方出品，功能全面，支持多种管理与监控
- **DBeaver**：开源，跨平台，支持多种数据库
- **DataGrip**：JetBrains 出品，智能补全，支持多库
- **Navicat**：商业软件，界面友好，功能强大

## 3. 性能分析与监控工具
- **pg_stat_statements**：内置扩展，SQL 统计与慢查询分析
- **auto_explain**：自动记录慢 SQL 执行计划
- **pgBadger**：日志分析与可视化报告
- **Prometheus + Grafana**：开源监控方案，配合 postgres_exporter
- **pg_top/htop**：进程与资源监控

## 4. 备份与恢复工具
- **pg_dump/pg_restore**：逻辑备份，适合小型/结构变更场景
- **pg_basebackup**：物理热备，适合大数据量
- **Barman/pgBackRest**：企业级备份、归档与恢复

## 5. 数据迁移与同步工具
- **pg_dump/pg_restore**：逻辑迁移，跨版本/跨平台
- **FDW（Foreign Data Wrapper）**：跨库/异构数据访问
- **pglogical**：逻辑复制，适合在线迁移、分库分表
- **Slony-I**：主从同步，适合高可用

## 6. 工具对比与选型建议
| 工具类型   | 推荐场景           | 优点           | 缺点           |
|------------|--------------------|----------------|----------------|
| pgAdmin    | 日常管理、监控     | 免费、功能全   | 界面略复杂     |
| DBeaver    | 多库管理、开发     | 免费、跨平台   | 部分功能需插件 |
| pgBadger   | 日志分析           | 可视化强       | 需日志配置     |
| Barman     | 企业备份           | 自动归档、恢复 | 配置略复杂     |
| pglogical  | 在线迁移、同步     | 无中断         | 需扩展安装     |

## 7. Node.js 自动化实践代码示例（JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * Node.js 自动调用 pgBadger 生成慢查询报告
 * @param {string} logPath PostgreSQL 日志路径
 * @param {string} outFile 输出报告路径
 * @returns {Promise<void>}
 */
function analyzeLogWithPgBadger(logPath, outFile) {
  return new Promise((resolve, reject) => {
    const cmd = `pgbadger ${logPath} -o ${outFile}`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

---

> 工具的合理选型和自动化集成能大幅提升开发、运维效率，建议团队定期评估工具链并持续优化。 