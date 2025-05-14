# SQLite 常用工具

## 1. 官方命令行工具
- **sqlite3 CLI**：官方命令行工具，支持 SQL 执行、备份、恢复、导入导出、性能分析

## 2. 图形化管理工具
- **DB Browser for SQLite**（免费，跨平台，功能强大）
- **DBeaver**、**DataGrip**、**Navicat**（多数据库支持，适合团队协作）

## 3. 性能分析与监控工具
- **sqlite3 CLI**：EXPLAIN、ANALYZE、.stats
- **DB Browser for SQLite**：可视化分析表结构与索引

## 4. 备份与恢复工具
- **sqlite3 CLI**：.backup、.dump、.restore 命令
- 直接复制数据库文件

## 5. 数据迁移与同步工具
- **.dump/.import**：SQL 导出与导入，便于迁移
- **DB Browser for SQLite**：可视化迁移、数据导入导出

## 6. 工具对比与使用建议
| 工具                   | 主要用途         | 优点           | 缺点           |
|------------------------|------------------|----------------|----------------|
| sqlite3 CLI            | SQL 执行/管理    | 轻量、脚本化   | 交互体验一般   |
| DB Browser for SQLite  | 图形化管理       | 免费、易用     | 功能有限       |
| DBeaver/DataGrip/Navicat| 多库协作         | 跨平台、强大   | 商业授权/体积大 |

## 7. Node.js 自动化实践代码（含 JSDoc 注释）
```js
const { exec } = require('child_process');

/**
 * 调用 sqlite3 CLI 执行 SQL 脚本
 * @param {string} dbPath - 数据库文件路径
 * @param {string} scriptPath - SQL 脚本路径
 * @returns {Promise<void>}
 */
function runSqliteScript(dbPath, scriptPath) {
  const cmd = `sqlite3 ${dbPath} < ${scriptPath}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve();
    });
  });
}
```

---

SQLite 工具简单高效，建议结合命令行与图形化工具，自动化脚本提升运维效率。 