# 分布式ID生成与唯一性保障案例

## 1. 需求分析
- 支持高并发下的全局唯一ID生成，满足分布式系统需求。
- 支持多种ID生成方案（自增ID、雪花算法、号段模式等）。
- 支持ID分配状态追踪与冲突检测。
- 支持ID生成服务的高可用与扩展性。
- 具备良好扩展性，便于后续接入更多ID生成策略。

---

## 2. 表结构设计

### 号段分配表（id_segment）
```sql
CREATE TABLE `id_segment` (
  `biz_tag` VARCHAR(64) PRIMARY KEY COMMENT '业务标识',
  `max_id` BIGINT NOT NULL COMMENT '当前最大ID',
  `step` INT NOT NULL COMMENT '号段步长',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='号段分配表';
```

### ID分配日志表（id_alloc_log）
```sql
CREATE TABLE `id_alloc_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `biz_tag` VARCHAR(64) NOT NULL COMMENT '业务标识',
  `start_id` BIGINT NOT NULL COMMENT '分配起始ID',
  `end_id` BIGINT NOT NULL COMMENT '分配结束ID',
  `allocated_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  INDEX idx_biz_tag (`biz_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ID分配日志表';
```

---

## 3. 核心 SQL

### 3.1 号段模式分配ID（获取新号段）
```sql
-- 1. 原子性更新号段
UPDATE id_segment SET max_id = max_id + step WHERE biz_tag = ?;

-- 2. 查询新号段
SELECT max_id - step + 1 AS start_id, max_id AS end_id FROM id_segment WHERE biz_tag = ?;

-- 3. 写入分配日志
INSERT INTO id_alloc_log (biz_tag, start_id, end_id) VALUES (?, ?, ?);
```

### 3.2 雪花算法ID（由服务端生成，无需SQL）

---

## 4. Node.js 代码实现

```js
/**
 * 号段模式分配ID
 * @param {object} db - 数据库连接对象
 * @param {string} bizTag - 业务标识
 * @returns {Promise<{startId: number, endId: number}>} 分配的号段
 */
async function allocateIdSegment(db, bizTag) {
  await db.beginTransaction();
  try {
    await db.query('UPDATE id_segment SET max_id = max_id + step WHERE biz_tag = ?', [bizTag]);
    const [row] = await db.query(
      'SELECT max_id - step + 1 AS start_id, max_id AS end_id FROM id_segment WHERE biz_tag = ?',
      [bizTag]
    );
    await db.query(
      'INSERT INTO id_alloc_log (biz_tag, start_id, end_id) VALUES (?, ?, ?)',
      [bizTag, row.start_id, row.end_id]
    );
    await db.commit();
    return { startId: row.start_id, endId: row.end_id };
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 雪花算法ID生成（示例，需引入第三方库）
 * @param {object} snowflake - 雪花算法实例
 * @returns {string} 新ID
 */
function generateSnowflakeId(snowflake) {
  return snowflake.nextId();
}
```

---

## 5. 优化与总结

- 号段表采用原子性更新，保障高并发下ID唯一性。
- 分配日志便于追溯与冲突检测。
- 雪花算法适合高并发、分布式场景，需关注时钟回拨等问题。
- 支持多种ID生成策略，便于灵活扩展。
- 实践中需关注ID分配服务的高可用、性能瓶颈与数据一致性。

---

本案例适用于电商、金融等高并发分布式场景，便于团队快速搭建全局唯一ID生成体系。 