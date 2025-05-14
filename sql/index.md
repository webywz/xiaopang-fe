# SQL 简介

SQL（Structured Query Language，结构化查询语言）是一种用于管理和操作关系型数据库的标准语言。它广泛应用于数据查询、数据操作、数据定义和数据控制等场景。

## 发展历史
- 1970 年，E.F. Codd 提出关系模型理论。
- 1974 年，IBM 开发出 SEQUEL，后更名为 SQL。
- 1986 年，SQL 成为 ANSI 标准。

## 主流数据库
- MySQL
- PostgreSQL
- SQLite
- Oracle
- SQL Server

## 应用场景
- 网站后台数据管理
- 金融、医疗等行业数据分析
- 大数据 ETL 处理

## SQL 基本结构
```sql
-- 查询示例
SELECT name, age FROM users WHERE age > 18;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询用户表中所有年龄大于 18 岁的用户
 * @param {import('mysql').Connection} conn - 数据库连接对象
 * @returns {Promise<Array<{name: string, age: number}>>} 用户列表
 */
function getAdultUsers(conn) {
  return conn.query('SELECT name, age FROM users WHERE age > 18');
}
```

## SQL 标准与方言
SQL 标准由 ANSI/ISO 制定，不同数据库（如 MySQL、PostgreSQL、Oracle、SQL Server）在语法、函数、数据类型等方面存在差异，开发时需注意兼容性。

- ANSI SQL：标准语法，跨数据库通用
- MySQL/PostgreSQL/Oracle/SQL Server：各有扩展与特性

## 常用 SQL 语法速查
```sql
-- 创建表
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT
);

-- 插入数据
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 20);

-- 更新数据
UPDATE users SET age = 21 WHERE id = 1;

-- 删除数据
DELETE FROM users WHERE id = 1;

-- 查询数据
SELECT * FROM users WHERE age > 18 ORDER BY age DESC LIMIT 10;
```

## 开发规范与最佳实践
- 字段命名统一小写、下划线分隔，避免保留字
- 主键建议用自增ID或UUID，保证唯一性
- 重要字段加唯一索引，提升查询与约束能力
- 表结构变更需评估影响，建议版本化管理
- 复杂业务建议用事务，保证数据一致性
- 定期备份，测试恢复流程
- SQL 语句避免 SELECT *，明确字段名
- 查询条件加索引，避免全表扫描
- 生产环境禁用危险操作（如 DROP/DELETE 无 WHERE）

## 常见陷阱与注意事项
- NULL 与空字符串、0 不等价，判断需用 IS NULL
- SQL 注入风险，参数化查询防止攻击
- 隐式类型转换可能导致索引失效
- 事务未提交或未回滚易造成锁表
- 大表频繁变更结构影响性能，建议分批或离线操作
- 时间/时区处理需统一，避免数据混乱

## 进阶阅读与工具推荐
- [SQL Style Guide](https://www.sqlstyle.guide/)
- [explain.depesz.com](https://explain.depesz.com/)（PostgreSQL 执行计划分析）
- [SQL Fiddle](http://sqlfiddle.com/)（在线 SQL 测试）

---

SQL 作为数据世界的通用语言，是每一位开发者和数据分析师的必备技能。

SQL 规范与最佳实践是高质量数据开发的基础，建议团队统一规范、持续学习与总结。 