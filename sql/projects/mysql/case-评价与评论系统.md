# 评价与评论系统案例

## 1. 需求分析
- 支持用户对商品、订单等对象进行评价与评论。
- 支持多级评论（如追评、回复），并可按时间、热度等排序。
- 支持评论状态管理（审核、屏蔽、删除等）。
- 支持评论与用户、商品、订单的关联，便于统计与分析。
- 具备良好扩展性，便于后续接入更多互动玩法。

---

## 2. 表结构设计

### 评论表（comment）
```sql
CREATE TABLE `comment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `target_id` BIGINT NOT NULL COMMENT '被评对象ID（如商品ID、订单ID）',
  `target_type` VARCHAR(32) NOT NULL COMMENT '对象类型（product/order等）',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID（0为一级评论）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `score` INT DEFAULT NULL COMMENT '评分（如1-5星）',
  `status` VARCHAR(16) NOT NULL DEFAULT '待审核' COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_target (`target_id`, `target_type`),
  INDEX idx_parent (`parent_id`),
  INDEX idx_user (`user_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

---

## 3. 核心 SQL

### 3.1 新增评论
```sql
INSERT INTO comment (user_id, target_id, target_type, parent_id, content, score, status)
VALUES (?, ?, ?, ?, ?, ?, '待审核');
```

### 3.2 审核评论
```sql
UPDATE comment SET status = '已通过', updated_at = NOW() WHERE id = ? AND status = '待审核';
```

### 3.3 查询对象评论（分页、按时间/热度排序）
```sql
SELECT * FROM comment
WHERE target_id = ? AND target_type = ? AND status = '已通过' AND parent_id = 0
ORDER BY created_at DESC
LIMIT ?, ?;

-- 查询子评论
SELECT * FROM comment WHERE parent_id = ? AND status = '已通过' ORDER BY created_at ASC;
```

### 3.4 统计评分与评论数
```sql
SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM comment
WHERE target_id = ? AND target_type = ? AND status = '已通过' AND score IS NOT NULL;
```

---

## 4. Node.js 代码实现

```js
/**
 * 新增评论
 * @param {object} db - 数据库连接对象
 * @param {object} comment - 评论信息
 * @returns {Promise<number>} 新评论ID
 */
async function addComment(db, comment) {
  const result = await db.query(
    'INSERT INTO comment (user_id, target_id, target_type, parent_id, content, score, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [comment.user_id, comment.target_id, comment.target_type, comment.parent_id || 0, comment.content, comment.score, '待审核']
  );
  return result.insertId;
}

/**
 * 审核评论
 * @param {object} db - 数据库连接对象
 * @param {number} commentId - 评论ID
 * @returns {Promise<boolean>} 是否审核成功
 */
async function approveComment(db, commentId) {
  const res = await db.query(
    'UPDATE comment SET status = \'已通过\', updated_at = NOW() WHERE id = ? AND status = \'待审核\'',
    [commentId]
  );
  return res.affectedRows > 0;
}

/**
 * 查询对象评论（分页、按时间排序）
 * @param {object} db - 数据库连接对象
 * @param {number} targetId - 被评对象ID
 * @param {string} targetType - 对象类型
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 评论列表
 */
async function getComments(db, targetId, targetType, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM comment WHERE target_id = ? AND target_type = ? AND status = \'已通过\' AND parent_id = 0 ORDER BY created_at DESC LIMIT ?, ?',
    [targetId, targetType, offset, pageSize]
  );
}

/**
 * 查询子评论
 * @param {object} db - 数据库连接对象
 * @param {number} parentId - 父评论ID
 * @returns {Promise<Array>} 子评论列表
 */
async function getSubComments(db, parentId) {
  return db.query(
    'SELECT * FROM comment WHERE parent_id = ? AND status = \'已通过\' ORDER BY created_at ASC',
    [parentId]
  );
}

/**
 * 统计评分与评论数
 * @param {object} db - 数据库连接对象
 * @param {number} targetId - 被评对象ID
 * @param {string} targetType - 对象类型
 * @returns {Promise<object>} 统计结果
 */
async function getCommentStats(db, targetId, targetType) {
  const [row] = await db.query(
    'SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM comment WHERE target_id = ? AND target_type = ? AND status = \'已通过\' AND score IS NOT NULL',
    [targetId, targetType]
  );
  return row;
}
```

---

## 5. 优化与总结

- 评论表建立多维索引，提升对象、用户、状态等多条件查询效率。
- 评论新增、审核等操作支持状态流转，便于内容安全与管理。
- 支持多级评论结构，便于丰富互动场景。
- 查询接口支持分页与排序，适应大数据量场景。
- 实践中需关注评论审核、敏感词过滤与防刷机制。

---

本案例适用于电商、内容社区等场景，便于团队快速搭建评价与评论系统。 