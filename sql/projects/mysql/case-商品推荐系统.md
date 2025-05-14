# 商品推荐系统案例

## 1. 需求分析
- 支持基于用户行为（浏览、购买、收藏等）进行个性化商品推荐。
- 推荐结果可按实时性、热门度、用户兴趣等多维度生成。
- 支持推荐日志记录，便于效果分析与优化。
- 推荐数据需支持高并发读写，保障推荐响应速度。
- 具备良好扩展性，便于后续接入更多推荐算法。

---

## 2. 表结构设计

### 用户行为表（user_action）
```sql
CREATE TABLE `user_action` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '行为ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `action_type` VARCHAR(32) NOT NULL COMMENT '行为类型（浏览/购买/收藏）',
  `action_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '行为时间',
  INDEX idx_user (`user_id`),
  INDEX idx_product (`product_id`),
  INDEX idx_type_time (`action_type`, `action_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行为表';
```

### 推荐结果表（recommend_result）
```sql
CREATE TABLE `recommend_result` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '推荐ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '推荐商品ID',
  `score` DECIMAL(10,4) NOT NULL COMMENT '推荐分数',
  `reason` VARCHAR(255) COMMENT '推荐理由',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  INDEX idx_user (`user_id`),
  INDEX idx_product (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐结果表';
```

### 推荐日志表（recommend_log）
```sql
CREATE TABLE `recommend_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `action` VARCHAR(32) NOT NULL COMMENT '操作类型（展示/点击/购买）',
  `log_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '日志时间',
  INDEX idx_user (`user_id`),
  INDEX idx_product (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐日志表';
```

---

## 3. 核心 SQL

### 3.1 记录用户行为
```sql
INSERT INTO user_action (user_id, product_id, action_type) VALUES (?, ?, ?);
```

### 3.2 生成推荐结果（示例：基于热门商品）
```sql
INSERT INTO recommend_result (user_id, product_id, score, reason)
SELECT ?, p.id, COUNT(a.id) AS score, '热门商品推荐'
FROM product p
LEFT JOIN user_action a ON p.id = a.product_id AND a.action_type = '浏览'
GROUP BY p.id
ORDER BY score DESC
LIMIT 10;
```

### 3.3 查询用户推荐结果
```sql
SELECT * FROM recommend_result WHERE user_id = ? ORDER BY score DESC LIMIT 10;
```

### 3.4 记录推荐日志
```sql
INSERT INTO recommend_log (user_id, product_id, action) VALUES (?, ?, ?);
```

---

## 4. Node.js 代码实现

```js
/**
 * 记录用户行为
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} productId - 商品ID
 * @param {string} actionType - 行为类型
 * @returns {Promise<void>}
 */
async function recordUserAction(db, userId, productId, actionType) {
  await db.query(
    'INSERT INTO user_action (user_id, product_id, action_type) VALUES (?, ?, ?)',
    [userId, productId, actionType]
  );
}

/**
 * 生成热门商品推荐结果
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @returns {Promise<void>}
 */
async function generateHotRecommend(db, userId) {
  await db.query(
    `INSERT INTO recommend_result (user_id, product_id, score, reason)
     SELECT ?, p.id, COUNT(a.id) AS score, '热门商品推荐'
     FROM product p
     LEFT JOIN user_action a ON p.id = a.product_id AND a.action_type = '浏览'
     GROUP BY p.id
     ORDER BY score DESC
     LIMIT 10`,
    [userId]
  );
}

/**
 * 查询用户推荐结果
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>}
 */
async function getUserRecommend(db, userId) {
  return db.query(
    'SELECT * FROM recommend_result WHERE user_id = ? ORDER BY score DESC LIMIT 10',
    [userId]
  );
}

/**
 * 记录推荐日志
 * @param {object} db - 数据库连接对象
 * @param {number} userId - 用户ID
 * @param {number} productId - 商品ID
 * @param {string} action - 操作类型
 * @returns {Promise<void>}
 */
async function recordRecommendLog(db, userId, productId, action) {
  await db.query(
    'INSERT INTO recommend_log (user_id, product_id, action) VALUES (?, ?, ?)',
    [userId, productId, action]
  );
}
```

---

## 5. 优化与总结

- 用户行为表、推荐结果表、推荐日志表均建立合理索引，提升查询与写入性能。
- 推荐结果可定时批量生成，避免实时计算带来的性能压力。
- 推荐算法可根据业务需求灵活扩展，如协同过滤、内容推荐等。
- 推荐日志便于效果追踪与A/B测试。
- 高并发场景下可采用缓存（如Redis）提升推荐结果响应速度。
- 实践中需关注数据一致性、推荐准确性与系统可扩展性。

---

本案例适用于电商、内容平台等场景，便于团队快速搭建个性化推荐系统。 