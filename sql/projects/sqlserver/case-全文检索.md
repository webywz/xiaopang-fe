# SQL Server 实战案例：全文检索

## 1. 需求描述
以"文章内容搜索"为例，要求支持对大量文本内容进行高效关键词检索、相关性排序，适合内容管理、商品搜索、日志分析等场景。

## 2. 表结构设计
```sql
CREATE TABLE articles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);

-- 创建全文索引（需先启用全文检索组件）
CREATE FULLTEXT CATALOG ftc_articles;
CREATE FULLTEXT INDEX ON articles(content) KEY INDEX PK__articles__ID ON ftc_articles;
```

## 3. 核心 SQL 示例
```sql
-- 基于 CONTAINS 的全文检索
SELECT id, title, RANK
FROM FREETEXTTABLE(articles, content, @keywords) AS ft
JOIN articles a ON a.id = ft.[KEY]
ORDER BY RANK DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

-- 维护全文索引（重建）
ALTER FULLTEXT INDEX ON articles START FULL POPULATION;
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 全文检索文章内容
 * @param {import('mssql').ConnectionPool} pool
 * @param {string} keywords - 检索关键词
 * @param {number} [limit=10]
 * @returns {Promise<Array<{id:number,title:string,rank:number}>>}
 */
async function searchArticles(pool, keywords, limit = 10) {
  const sql = `
    SELECT a.id, a.title, ft.RANK
    FROM FREETEXTTABLE(articles, content, @keywords) AS ft
    JOIN articles a ON a.id = ft.[KEY]
    ORDER BY ft.RANK DESC
    OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
  `;
  const result = await pool.request()
    .input('keywords', keywords)
    .input('limit', limit)
    .query(sql);
  return result.recordset;
}
```

## 5. 优化与总结
- 推荐使用全文索引提升检索性能，避免 LIKE 全表扫描
- 查询时优先用 CONTAINS/FREETEXT，支持分词与相关性排序
- 定期维护全文索引，保证检索效率
- 注意 NVARCHAR(MAX) 字段需专用全文索引，检索语法与普通 SQL 有差异
- 可结合 title 字段做联合检索与权重排序

---

本案例适合内容管理、商品搜索、日志分析等场景，建议结合实际业务调整分词与索引策略。 