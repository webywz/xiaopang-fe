# 日志分析与归档案例

## 1. 需求分析
- 支持高并发写入的业务日志采集与存储。
- 支持按时间、类型、关键字等多维度高效查询日志。
- 定期归档历史日志，降低主库压力，提升查询性能。
- 归档日志可单独存储，支持后续分析与审计。
- 具备良好扩展性，便于接入多种日志类型与归档策略。

---

## 2. 表结构设计

### 业务日志表（biz_log）
```sql
CREATE TABLE `biz_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `log_type` VARCHAR(32) NOT NULL COMMENT '日志类型',
  `log_level` VARCHAR(16) NOT NULL COMMENT '日志级别',
  `content` TEXT NOT NULL COMMENT '日志内容',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '日志时间',
  INDEX idx_type_time (`log_type`, `created_at`),
  INDEX idx_level (`log_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务日志表';
```

### 日志归档表（biz_log_archive）
```sql
CREATE TABLE `biz_log_archive` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '归档日志ID',
  `log_type` VARCHAR(32) NOT NULL COMMENT '日志类型',
  `log_level` VARCHAR(16) NOT NULL COMMENT '日志级别',
  `content` TEXT NOT NULL COMMENT '日志内容',
  `created_at` DATETIME COMMENT '日志时间',
  `archived_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '归档时间',
  INDEX idx_type_time (`log_type`, `created_at`),
  INDEX idx_archived (`archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务日志归档表';
```

---

## 3. 核心 SQL

### 3.1 写入业务日志
```sql
INSERT INTO biz_log (log_type, log_level, content) VALUES (?, ?, ?);
```

### 3.2 查询日志（多条件、分页）
```sql
SELECT * FROM biz_log
WHERE 1=1
  AND (log_type = ? OR ? IS NULL)
  AND (log_level = ? OR ? IS NULL)
  AND (created_at BETWEEN ? AND ?)
  AND (content LIKE CONCAT('%', ?, '%') OR ? IS NULL)
ORDER BY created_at DESC
LIMIT ?, ?;
```

### 3.3 归档历史日志（如归档30天前日志）
```sql
-- 1. 插入归档表
INSERT INTO biz_log_archive (log_type, log_level, content, created_at)
SELECT log_type, log_level, content, created_at
FROM biz_log
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 2. 删除主表中已归档日志
DELETE FROM biz_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 4. Node.js 代码实现

```js
/**
 * 写入业务日志
 * @param {object} db - 数据库连接对象
 * @param {string} logType - 日志类型
 * @param {string} logLevel - 日志级别
 * @param {string} content - 日志内容
 * @returns {Promise<void>}
 */
async function writeBizLog(db, logType, logLevel, content) {
  await db.query(
    'INSERT INTO biz_log (log_type, log_level, content) VALUES (?, ?, ?)',
    [logType, logLevel, content]
  );
}

/**
 * 查询业务日志（多条件、分页）
 * @param {object} db - 数据库连接对象
 * @param {object} params - 查询参数
 * @param {string|null} params.logType - 日志类型
 * @param {string|null} params.logLevel - 日志级别
 * @param {string|null} params.keyword - 关键字
 * @param {string} params.startTime - 起始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<Array>} 日志列表
 */
async function queryBizLog(db, {logType, logLevel, keyword, startTime, endTime, page, pageSize}) {
  const offset = (page - 1) * pageSize;
  return db.query(
    `SELECT * FROM biz_log
     WHERE 1=1
       AND (log_type = ? OR ? IS NULL)
       AND (log_level = ? OR ? IS NULL)
       AND (created_at BETWEEN ? AND ?)
       AND (content LIKE CONCAT('%', ?, '%') OR ? IS NULL)
     ORDER BY created_at DESC
     LIMIT ?, ?`,
    [logType, logType, logLevel, logLevel, startTime, endTime, keyword, keyword, offset, pageSize]
  );
}

/**
 * 归档历史日志（如归档30天前日志）
 * @param {object} db - 数据库连接对象
 * @returns {Promise<void>}
 */
async function archiveOldLogs(db) {
  await db.beginTransaction();
  try {
    await db.query(
      `INSERT INTO biz_log_archive (log_type, log_level, content, created_at)
       SELECT log_type, log_level, content, created_at
       FROM biz_log
       WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    await db.query(
      'DELETE FROM biz_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  }
}
```

---

## 5. 优化与总结

- 日志主表、归档表均建立合理索引，提升查询与归档效率。
- 归档操作建议定时批量执行，避免影响主库性能。
- 查询接口支持多条件、分页，适应大数据量场景。
- 归档表可单独分库，便于历史日志的长期存储与分析。
- 实践中需关注归档一致性、主表性能与归档策略的平衡。

---

本案例适用于高并发日志采集、分析与归档场景，便于团队快速搭建日志管理与分析系统。 