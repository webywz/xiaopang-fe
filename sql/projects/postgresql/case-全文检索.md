# PostgreSQL 实战案例：全文检索

## 1. 需求描述
以"文章内容搜索"为例，要求支持对大量文本内容进行高效关键词检索、相关性排序，适用于内容管理、商品搜索、日志分析等场景。

## 2. 表结构设计
```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 创建全文索引（GIN）
CREATE INDEX idx_articles_content_fts ON articles USING GIN (to_tsvector('simple', content));
```

## 3. 核心 SQL 示例
```sql
-- 基于 to_tsvector/to_tsquery 的全文检索
SELECT id, title, ts_rank(to_tsvector('simple', content), to_tsquery('simple', 'postgres & 性能')) AS rank
FROM articles
WHERE to_tsvector('simple', content) @@ to_tsquery('simple', 'postgres & 性能')
ORDER BY rank DESC
LIMIT 10;

-- 维护索引（如内容变更后自动更新）
REINDEX INDEX idx_articles_content_fts;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 全文检索文章内容
 * @param {import('pg').Pool} pool
 * @param {string} keywords - 检索关键词（如 'postgres 性能'）
 * @param {number} [limit=10] - 返回条数
 * @returns {Promise<Array<{id:number,title:string,rank:number}>>}
 */
async function searchArticles(pool, keywords, limit = 10) {
  // 简单分词处理，空格分隔并用 & 连接
  const query = keywords.trim().split(/\s+/).join(' & ');
  const sql = `
    SELECT id, title, ts_rank(to_tsvector('simple', content), to_tsquery('simple', $1)) AS rank
    FROM articles
    WHERE to_tsvector('simple', content) @@ to_tsquery('simple', $1)
    ORDER BY rank DESC
    LIMIT $2
  `;
  const { rows } = await pool.query(sql, [query, limit]);
  return rows;
}
```

## 5. 优化与总结
- 推荐使用 GIN 索引提升全文检索性能
- 选择合适的分词字典（如 simple、english、zhparser 等）
- 查询时优先用 to_tsquery，避免 ILIKE/LIKE 全表扫描
- 可结合 title 字段做联合检索与权重排序
- 定期维护索引，保证检索效率
- 注意中文分词需安装扩展（如 zhparser）

---

> 本案例适合内容管理、商品搜索、日志分析等场景，建议结合实际业务调整分词与索引策略。 