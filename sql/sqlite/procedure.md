# SQLite 存储过程与函数

## 1. 基础与应用场景
- SQLite 不支持传统存储过程，但支持触发器（TRIGGER）和自定义函数（UDF）
- 适合自动化操作、数据校验、业务逻辑下推等场景

## 2. 触发器实现批量逻辑
```sql
-- 创建插入触发器
CREATE TRIGGER log_insert AFTER INSERT ON users
BEGIN
  INSERT INTO logs(message, created_at) VALUES('新用户插入', datetime('now'));
END;

-- 删除触发器
DROP TRIGGER log_insert;
```

## 3. 自定义函数（UDF）
- 可用 Node.js/sqlite3/better-sqlite3 注册 JS 函数为 SQL 函数

## 4. 性能与安全注意事项
- 触发器逻辑应简洁，避免递归和死循环
- 复杂业务建议在应用层实现

## 5. Node.js 代码示例（含 JSDoc 注释）
```js
const sqlite3 = require('sqlite3').verbose();

/**
 * 注册自定义函数（UDF）
 * @param {sqlite3.Database} db
 */
function registerUDF(db) {
  db.create_function('add_prefix', (str) => 'prefix_' + str);
}
```

---

SQLite 不支持传统存储过程，建议结合触发器与应用层逻辑实现复杂业务。 