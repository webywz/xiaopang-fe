# SQL 设计模式与架构模式

## 1. 数据库范式（Normalization）
- **第一范式（1NF）**：字段不可再分。
- **第二范式（2NF）**：消除部分依赖。
- **第三范式（3NF）**：消除传递依赖。
- **BCNF**：更严格的 3NF。
- **优点**：减少冗余，提升一致性。
- **缺点**：高并发下多表 JOIN 性能下降。

## 2. 反范式（Denormalization）
- **适用场景**：读多写少、对性能要求高的场景。
- **做法**：冗余部分字段，减少 JOIN。
- **优点**：查询快，结构简单。
- **缺点**：数据冗余，维护复杂。

## 3. 分表分库
- **水平分表**：按主键范围、哈希等拆分大表。
- **垂直分表**：按字段拆分，冷热数据分离。
- **分库**：按业务或数据量拆分数据库。
- **优点**：提升性能，缓解单库压力。
- **缺点**：跨表/库事务复杂，开发成本高。

## 4. 读写分离
- **主从架构**：主库写，从库读。
- **适用场景**：读多写少，提升读性能。
- **注意**：主从延迟、数据一致性。

## 5. 索引优化模式
- **单列索引、多列联合索引**。
- **覆盖索引**：查询字段全部在索引中，无需回表。
- **前缀索引**：对长字符串字段优化。
- **注意**：索引过多影响写入性能。

## 6. 分区表与分区索引
- **分区表**：按时间、范围、哈希等分区。
- **优点**：提升大表管理和查询效率。
- **缺点**：分区键选择需谨慎。

## 7. 物化视图
- **定义**：存储查询结果的视图，定期刷新。
- **适用场景**：复杂聚合、报表。
- **优点**：查询快。
- **缺点**：数据延迟、维护成本。

## 8. 主从复制与分布式数据库
- **主从复制**：提升读性能，容灾。
- **分布式数据库**：如 TiDB、CockroachDB，支持弹性扩展。
- **注意**：分布式事务、CAP 理论权衡。

## 9. 业务场景模式
### 9.1 审计日志
- **做法**：操作表 + 审计表，记录变更。
- **代码示例**：
```sql
-- 审计表设计
CREATE TABLE user_audit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(32),
  old_value JSON,
  new_value JSON,
  operated_at DATETIME
);
```

### 9.2 软删除
- **做法**：表加 deleted 字段，删除时仅标记。
- **优点**：可恢复，便于审计。
- **缺点**：查询需加条件，索引设计需注意。
- **代码示例**：
```sql
ALTER TABLE users ADD COLUMN deleted TINYINT(1) DEFAULT 0;
-- 查询未删除用户
SELECT * FROM users WHERE deleted = 0;
```

### 9.3 多租户设计
- **做法**：表加 tenant_id 字段，所有查询带租户条件。
- **优点**：数据隔离，易扩展。
- **缺点**：索引需包含 tenant_id，防止全表扫描。
- **代码示例**：
```sql
SELECT * FROM orders WHERE tenant_id = ? AND order_id = ?;
```

## 10. 查询优化与性能提升模式
- **分页优化**：大数据量分页用 keyset 分页（如 where id > ? limit n）。
- **批量操作**：分批提交，防止锁表。
- **异步写入**：日志、统计等可异步。
- **Explain 分析**：定期分析慢 SQL。

## 11. JSDoc 代码示例
```js
/**
 * 软删除用户
 * @param {import('mysql').Connection} conn
 * @param {number} userId
 * @returns {Promise<void>}
 */
function softDeleteUser(conn, userId) {
  return conn.query('UPDATE users SET deleted = 1 WHERE id = ?', [userId]);
}

/**
 * 多租户安全查询
 * @param {import('mysql').Connection} conn
 * @param {number} tenantId
 * @param {number} orderId
 * @returns {Promise<Object|null>}
 */
function getOrderByTenant(conn, tenantId, orderId) {
  return conn.query('SELECT * FROM orders WHERE tenant_id = ? AND order_id = ?', [tenantId, orderId]);
}
```

---

> 设计模式的选择需结合业务需求、数据规模和团队能力，建议优先选用主流、社区验证的模式。 