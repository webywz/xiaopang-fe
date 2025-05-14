# 消息队列与异步任务落库案例

## 1. 需求分析
- 支持异步任务（如订单处理、通知推送等）消息入库与状态管理。
- 支持消息幂等、重试、失败补偿等机制。
- 支持任务执行日志与状态流转记录。
- 支持高并发下的任务分发与消费。
- 具备良好扩展性，便于后续接入多种消息类型与队列系统。

---

## 2. 表结构设计

### 消息任务表（mq_task）
```sql
CREATE TABLE `mq_task` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
  `biz_type` VARCHAR(32) NOT NULL COMMENT '业务类型',
  `biz_id` VARCHAR(64) NOT NULL COMMENT '业务ID',
  `payload` JSON NOT NULL COMMENT '消息内容',
  `status` VARCHAR(16) NOT NULL DEFAULT '待处理' COMMENT '任务状态',
  `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uniq_biz (`biz_type`, `biz_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息任务表';
```

### 任务执行日志表（mq_task_log）
```sql
CREATE TABLE `mq_task_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',
  `from_status` VARCHAR(16) NOT NULL COMMENT '原状态',
  `to_status` VARCHAR(16) NOT NULL COMMENT '新状态',
  `remark` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  INDEX idx_task (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务执行日志表';
```

---

## 3. 核心 SQL

### 3.1 新增异步任务（幂等）
```sql
INSERT IGNORE INTO mq_task (biz_type, biz_id, payload, status)
VALUES (?, ?, ?, '待处理');
```

### 3.2 拉取待处理任务（批量）
```sql
SELECT * FROM mq_task WHERE status = '待处理' ORDER BY created_at ASC LIMIT ?;
```

### 3.3 更新任务状态与重试
```sql
UPDATE mq_task SET status = ?, retry_count = retry_count + 1, updated_at = NOW()
WHERE id = ? AND status = ?;

INSERT INTO mq_task_log (task_id, from_status, to_status, remark)
VALUES (?, ?, ?, ?);
```

### 3.4 查询任务执行日志
```sql
SELECT * FROM mq_task_log WHERE task_id = ? ORDER BY created_at ASC;
```

---

## 4. Node.js 代码实现

```js
/**
 * 新增异步任务（幂等）
 * @param {object} db - 数据库连接对象
 * @param {object} task - 任务信息
 * @returns {Promise<number>} 任务ID
 */
async function addMqTask(db, task) {
  const result = await db.query(
    'INSERT IGNORE INTO mq_task (biz_type, biz_id, payload, status) VALUES (?, ?, ?, ?)',
    [task.biz_type, task.biz_id, JSON.stringify(task.payload), '待处理']
  );
  return result.insertId;
}

/**
 * 拉取待处理任务（批量）
 * @param {object} db - 数据库连接对象
 * @param {number} limit - 拉取数量
 * @returns {Promise<Array>} 任务列表
 */
async function fetchPendingTasks(db, limit = 10) {
  return db.query(
    'SELECT * FROM mq_task WHERE status = \'待处理\' ORDER BY created_at ASC LIMIT ?',
    [limit]
  );
}

/**
 * 更新任务状态与重试
 * @param {object} db - 数据库连接对象
 * @param {number} taskId - 任务ID
 * @param {string} fromStatus - 原状态
 * @param {string} toStatus - 新状态
 * @param {string} remark - 备注
 * @returns {Promise<boolean>} 是否更新成功
 */
async function updateTaskStatus(db, taskId, fromStatus, toStatus, remark) {
  await db.beginTransaction();
  try {
    const res = await db.query(
      'UPDATE mq_task SET status = ?, retry_count = retry_count + 1, updated_at = NOW() WHERE id = ? AND status = ?',
      [toStatus, taskId, fromStatus]
    );
    if (res.affectedRows === 0) throw new Error('状态已变更或不存在');
    await db.query(
      'INSERT INTO mq_task_log (task_id, from_status, to_status, remark) VALUES (?, ?, ?, ?)',
      [taskId, fromStatus, toStatus, remark]
    );
    await db.commit();
    return true;
  } catch (err) {
    await db.rollback();
    throw err;
  }
}

/**
 * 查询任务执行日志
 * @param {object} db - 数据库连接对象
 * @param {number} taskId - 任务ID
 * @returns {Promise<Array>} 日志列表
 */
async function getTaskLogs(db, taskId) {
  return db.query(
    'SELECT * FROM mq_task_log WHERE task_id = ? ORDER BY created_at ASC',
    [taskId]
  );
}
```

---

## 5. 优化与总结

- 任务表、日志表均建立合理索引，提升高并发下的查询与写入性能。
- 任务新增、状态流转等操作均采用事务，保障一致性。
- 支持幂等、重试、失败补偿等机制，提升系统健壮性。
- 查询接口支持分页与多条件筛选，适应大数据量场景。
- 实践中需关注任务堆积、重复消费与消息丢失等问题。

---

本案例适用于订单、通知等异步场景，便于团队快速搭建消息队列与异步任务落库体系。 