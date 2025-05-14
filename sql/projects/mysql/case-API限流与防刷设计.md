# API限流与防刷设计案例

## 1. 需求分析
- 支持对API接口调用频率进行限流，防止恶意刷接口。
- 支持按用户、IP、接口等多维度灵活限流。
- 支持黑名单、白名单、风控日志等机制。
- 支持限流规则动态配置与实时生效。
- 具备良好扩展性，便于后续接入更多风控策略。

---

## 2. 表结构设计

### 限流规则表（rate_limit_rule）
```sql
CREATE TABLE `rate_limit_rule` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规则ID',
  `target_type` VARCHAR(16) NOT NULL COMMENT '对象类型（user/ip/api）',
  `target_value` VARCHAR(64) NOT NULL COMMENT '对象值（如用户ID、IP、接口名）',
  `limit_count` INT NOT NULL COMMENT '限流次数',
  `time_window` INT NOT NULL COMMENT '时间窗口（秒）',
  `status` VARCHAR(16) NOT NULL DEFAULT '启用' COMMENT '状态',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uniq_target (`target_type`, `target_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='限流规则表';
```

### 限流日志表（rate_limit_log）
```sql
CREATE TABLE `rate_limit_log` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `target_type` VARCHAR(16) NOT NULL COMMENT '对象类型',
  `target_value` VARCHAR(64) NOT NULL COMMENT '对象值',
  `api` VARCHAR(64) NOT NULL COMMENT '接口名',
  `ip` VARCHAR(64) NOT NULL COMMENT '请求IP',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '请求时间',
  INDEX idx_target (`target_type`, `target_value`),
  INDEX idx_api (`api`),
  INDEX idx_ip (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='限流日志表';
```

### 黑名单表（blacklist）
```sql
CREATE TABLE `blacklist` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `target_type` VARCHAR(16) NOT NULL COMMENT '对象类型',
  `target_value` VARCHAR(64) NOT NULL COMMENT '对象值',
  `reason` VARCHAR(255) COMMENT '拉黑原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '拉黑时间',
  UNIQUE KEY uniq_target (`target_type`, `target_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='黑名单表';
```

---

## 3. 核心 SQL

### 3.1 查询限流规则
```sql
SELECT * FROM rate_limit_rule WHERE target_type = ? AND target_value = ? AND status = '启用';
```

### 3.2 统计时间窗口内请求次数
```sql
SELECT COUNT(*) FROM rate_limit_log
WHERE target_type = ? AND target_value = ? AND api = ?
  AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND);
```

### 3.3 写入限流日志
```sql
INSERT INTO rate_limit_log (target_type, target_value, api, ip) VALUES (?, ?, ?, ?);
```

### 3.4 查询黑名单
```sql
SELECT * FROM blacklist WHERE target_type = ? AND target_value = ?;
```

---

## 4. Node.js 代码实现

```js
/**
 * 检查是否命中限流规则
 * @param {object} db - 数据库连接对象
 * @param {string} targetType - 对象类型
 * @param {string} targetValue - 对象值
 * @param {string} api - 接口名
 * @param {string} ip - 请求IP
 * @returns {Promise<boolean>} 是否被限流
 */
async function checkRateLimit(db, targetType, targetValue, api, ip) {
  // 查询限流规则
  const [rule] = await db.query(
    'SELECT * FROM rate_limit_rule WHERE target_type = ? AND target_value = ? AND status = \'启用\'',
    [targetType, targetValue]
  );
  if (!rule) return false;
  // 查询时间窗口内请求次数
  const [row] = await db.query(
    'SELECT COUNT(*) AS cnt FROM rate_limit_log WHERE target_type = ? AND target_value = ? AND api = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
    [targetType, targetValue, api, rule.time_window]
  );
  if (row.cnt >= rule.limit_count) return true;
  // 写入限流日志
  await db.query(
    'INSERT INTO rate_limit_log (target_type, target_value, api, ip) VALUES (?, ?, ?, ?)',
    [targetType, targetValue, api, ip]
  );
  return false;
}

/**
 * 检查是否在黑名单
 * @param {object} db - 数据库连接对象
 * @param {string} targetType - 对象类型
 * @param {string} targetValue - 对象值
 * @returns {Promise<boolean>} 是否在黑名单
 */
async function isBlacklisted(db, targetType, targetValue) {
  const [row] = await db.query(
    'SELECT * FROM blacklist WHERE target_type = ? AND target_value = ?',
    [targetType, targetValue]
  );
  return !!row;
}
```

---

## 5. 优化与总结

- 限流规则、日志、黑名单表均建立合理索引，提升高并发下的查询与写入性能。
- 限流判断建议结合缓存（如Redis）提升实时性，MySQL用于持久化与审计。
- 支持多维度灵活限流，便于应对多种风控场景。
- 查询接口支持参数化与分页，适应大数据量场景。
- 实践中需关注限流误判、规则动态调整与风控策略演进。

---

本案例适用于API服务、开放平台等场景，便于团队快速搭建限流与防刷体系。 