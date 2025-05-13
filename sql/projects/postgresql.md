# PostgreSQL 实战项目

PostgreSQL 以其强大的功能和高扩展性，广泛应用于金融、数据分析等高要求场景。以下以博客系统和财务系统为例，介绍实战中的表结构设计、索引、事务与并发等。

## 典型业务场景
- 博客内容管理系统
- 财务流水管理系统

## 表结构设计
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  author_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  balance NUMERIC(18,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 索引与约束
- 使用 `UNIQUE`、`CHECK`、`FOREIGN KEY` 保证数据一致性。
- 利用 `GIN`、`BTREE` 索引提升检索效率。

## 事务与并发
- PostgreSQL 支持多版本并发控制（MVCC），高并发下数据一致性强。

```js
/**
 * 新增博客文章（带事务）
 * @param {import('pg').Pool} pool
 * @param {string} title
 * @param {string} content
 * @param {number} authorId
 * @returns {Promise<void>}
 */
async function addPost(pool, title, content, authorId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3)', [title, content, authorId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

## 备份与恢复
- 使用 `pg_dump`、`pg_restore` 工具进行逻辑备份与恢复。
- 支持物理热备、流复制等高可用方案。

## 性能调优
- 合理使用分区表、并行查询。
- 定期 `VACUUM` 清理无效数据行。 