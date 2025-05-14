# 多活容灾与故障恢复案例

## 1. 需求分析
- 支持多地多中心部署，实现业务多活与高可用。
- 支持主备切换、自动故障转移，保障业务连续性。
- 支持数据同步、冲突检测与一致性保障。
- 支持故障演练、恢复流程与切换日志记录。
- 具备良好扩展性，便于后续接入更多容灾策略。

---

## 2. 表结构设计

### 数据同步状态表（sync_status）
```sql
CREATE TABLE `sync_status` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `region` VARCHAR(32) NOT NULL COMMENT '数据中心/地域',
  `last_sync_time` DATETIME COMMENT '最近同步时间',
  `status` VARCHAR(16) NOT NULL COMMENT '同步状态',
  `remark` VARCHAR(255) COMMENT '备注',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_region (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据同步状态表';
```

### 故障切换日志表（failover_log）
```sql
CREATE TABLE `failover_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `from_region` VARCHAR(32) NOT NULL COMMENT '原主中心',
  `to_region` VARCHAR(32) NOT NULL COMMENT '切换目标中心',
  `switch_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '切换时间',
  `operator` VARCHAR(64) COMMENT '操作人',
  `reason` VARCHAR(255) COMMENT '切换原因',
  `status` VARCHAR(16) NOT NULL COMMENT '切换状态',
  INDEX idx_time (`switch_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='故障切换日志表';
```

---

## 3. 核心 SQL

### 3.1 记录数据同步状态
```sql
INSERT INTO sync_status (region, last_sync_time, status, remark)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE last_sync_time = VALUES(last_sync_time), status = VALUES(status), remark = VALUES(remark), updated_at = NOW();
```

### 3.2 查询各中心同步状态
```sql
SELECT * FROM sync_status ORDER BY region;
```

### 3.3 记录故障切换日志
```sql
INSERT INTO failover_log (from_region, to_region, operator, reason, status)
VALUES (?, ?, ?, ?, ?);
```

### 3.4 查询切换历史
```sql
SELECT * FROM failover_log ORDER BY switch_time DESC LIMIT ?, ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 记录数据同步状态
 * @param {object} db - 数据库连接对象
 * @param {object} status - 同步状态信息
 * @returns {Promise<void>}
 */
async function upsertSyncStatus(db, status) {
  await db.query(
    `INSERT INTO sync_status (region, last_sync_time, status, remark)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE last_sync_time = VALUES(last_sync_time), status = VALUES(status), remark = VALUES(remark), updated_at = NOW()`,
    [status.region, status.last_sync_time, status.status, status.remark]
  );
}

/**
 * 查询各中心同步状态
 * @param {object} db - 数据库连接对象
 * @returns {Promise<Array>} 同步状态列表
 */
async function getAllSyncStatus(db) {
  return db.query('SELECT * FROM sync_status ORDER BY region');
}

/**
 * 记录故障切换日志
 * @param {object} db - 数据库连接对象
 * @param {object} log - 切换日志信息
 * @returns {Promise<void>}
 */
async function addFailoverLog(db, log) {
  await db.query(
    'INSERT INTO failover_log (from_region, to_region, operator, reason, status) VALUES (?, ?, ?, ?, ?)',
    [log.from_region, log.to_region, log.operator, log.reason, log.status]
  );
}

/**
 * 查询切换历史
 * @param {object} db - 数据库连接对象
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Array>} 切换日志列表
 */
async function getFailoverLogs(db, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return db.query(
    'SELECT * FROM failover_log ORDER BY switch_time DESC LIMIT ?, ?',
    [offset, pageSize]
  );
}
```

---

## 5. 优化与总结

- 同步状态、切换日志表均建立合理索引，提升查询与写入性能。
- 关键操作建议采用分布式事务或幂等设计，保障一致性。
- 故障切换流程建议自动化、可回溯，便于演练与追责。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注数据一致性、切换时延与多活冲突处理。

---

本案例适用于金融、电商等对高可用要求极高的场景，便于团队快速搭建多活容灾与故障恢复体系。 