# PostgreSQL 简介

PostgreSQL（简称 PG）是功能最强大的开源关系型数据库之一，以高扩展性、标准兼容性和企业级特性著称，被广泛应用于金融、电信、互联网等行业。

## 发展历史
- 1986 年，UC Berkeley 开发 POSTGRES 项目
- 1996 年，正式更名为 PostgreSQL
- 现为全球活跃社区主导，持续快速迭代

## 核心特性
- 完全 ACID 支持，强一致性
- 丰富的数据类型（JSON、数组、地理空间等）
- 支持存储过程、触发器、窗口函数、CTE
- 支持多版本并发控制（MVCC）
- 强大的扩展机制（插件、FDW、定制类型）
- 原生支持全文检索、分区表、逻辑/物理复制
- 跨平台，支持多种操作系统

## 应用场景
- 金融、证券等高一致性场景
- 复杂数据分析、报表、地理信息系统（GIS）
- 互联网、SaaS、数据中台

## 与 MySQL 对比
| 特性         | PostgreSQL         | MySQL           |
|--------------|--------------------|-----------------|
| 事务隔离     | 完全支持           | 部分实现         |
| JSON 支持    | 原生、强大         | 有但功能有限     |
| 扩展性       | 插件丰富、可定制   | 较弱            |
| 分区表       | 原生支持           | 8.0+ 支持       |
| 复制         | 物理+逻辑复制      | 物理复制为主     |
| 存储过程     | PL/pgSQL/多语言    | SQL/PSM         |

## 基本结构示例
```sql
-- 查询示例
SELECT name, age FROM users WHERE age > 18;
```

## 代码示例（带 JSDoc 注释）
```js
/**
 * 查询所有成年用户（PostgreSQL）
 * @param {import('pg').Pool} pool - 数据库连接池
 * @returns {Promise<Array<{name: string, age: number}>>} 用户列表
 */
async function getAdultUsers(pool) {
  const res = await pool.query('SELECT name, age FROM users WHERE age > $1', [18]);
  return res.rows;
}
```

---

PostgreSQL 以其强大功能和高可靠性，成为企业级应用和数据分析的首选数据库之一。 