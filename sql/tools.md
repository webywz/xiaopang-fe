# SQL 工具大全

## 1. 图形化客户端工具
- **DBeaver**：跨平台，支持多种数据库，开源，插件丰富。
- **Navicat**：商业软件，界面友好，支持 MySQL、PostgreSQL、Oracle、SQL Server 等。
- **DataGrip**：JetBrains 出品，智能补全，支持多种数据库。
- **HeidiSQL**：轻量级，适合 MySQL、MariaDB、SQL Server。
- **SQLyog**：MySQL 专用，界面简洁，功能全面。

## 2. 命令行工具
- **mysql / mysqlsh**：MySQL 官方命令行工具，支持脚本、批量操作。
- **psql**：PostgreSQL 官方命令行，支持历史、补全、脚本。
- **sqlcmd**：SQL Server 命令行，适合自动化和批处理。
- **sqlite3**：SQLite 官方命令行，轻量易用。
- **sqlplus**：Oracle 官方命令行，支持脚本和批量。

## 3. SQL 代码生成与格式化工具
- **SQL Formatter**：如 [sqlformat.org](https://sqlformat.org/)、DBeaver 内置格式化。
- **Prettier SQL 插件**：前端项目常用，自动格式化 SQL 片段。
- **SQLFluff**：支持 lint、格式化、风格检查，适合团队协作。

## 4. 静态分析与安全工具
- **SQLFluff**：支持多种 SQL 方言的静态分析。
- **SonarQube**：可集成 SQL 代码扫描。
- **SchemaSpy**：数据库结构分析与文档生成。

## 5. 数据库迁移、备份与同步工具
- **mysqldump / mysqlpump**：MySQL 备份与恢复。
- **pg_dump / pg_restore**：PostgreSQL 备份与恢复。
- **exp/imp, expdp/impdp**：Oracle 备份与迁移。
- **SQL Server Management Studio (SSMS)**：图形化迁移与备份。
- **Flyway / Liquibase**：数据库版本管理与迁移，支持多种数据库。

## 6. 工具对比与选型建议
| 工具类型   | 推荐场景           | 优点           | 缺点           |
|------------|--------------------|----------------|----------------|
| DBeaver    | 多库管理、开发     | 免费、跨平台   | 部分功能需插件 |
| Navicat    | 商业项目、团队协作 | 界面好、功能全 | 收费           |
| DataGrip   | 智能补全、开发     | JetBrains 生态 | 收费           |
| SQLFluff   | 团队规范、CI/CD    | 规则丰富       | 配置略复杂     |
| Flyway     | 版本管理、自动化   | 易集成         | 需脚本规范     |

## 7. 典型工具使用示例

### 7.1 Node.js 连接数据库（以 mysql2 为例）
```js
/**
 * 使用 mysql2 连接数据库并执行查询
 * @param {import('mysql2/promise').Connection} conn
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function getAllUsers(conn) {
  const [rows] = await conn.execute('SELECT id, name FROM users');
  return rows;
}
```

### 7.2 使用 SQLFluff 进行 SQL 代码检查
```bash
# 安装
pip install sqlfluff
# 检查 SQL 文件风格
sqlfluff lint my_query.sql
# 自动修复
sqlfluff fix my_query.sql
```

### 7.3 使用 mysqldump 备份数据库
```bash
mysqldump -u root -p mydb > mydb_backup.sql
```

### 7.4 使用 Flyway 进行数据库迁移
```bash
# 初始化
flyway init
# 执行迁移
flyway migrate
```

---

> 工具的选择应结合实际业务需求、团队协作方式和预算，建议优先选用主流、社区活跃的工具。 