# SQL 存储过程与触发器

存储过程和触发器是数据库中实现业务逻辑和自动化操作的重要工具。

## 存储过程（Procedure）
- 存储过程是预编译的 SQL 语句集合，可重复调用。
- 用于封装复杂逻辑、批量处理、权限控制。

### 创建存储过程
```sql
DELIMITER //
CREATE PROCEDURE add_user(IN userName VARCHAR(50), IN userAge INT)
BEGIN
  INSERT INTO users(name, age) VALUES(userName, userAge);
END //
DELIMITER ;
```

### 调用存储过程
```sql
CALL add_user('小明', 20);
```

## 触发器（Trigger）
- 触发器是在特定事件（如 INSERT、UPDATE、DELETE）发生时自动执行的 SQL 代码。

### 创建触发器
```sql
CREATE TRIGGER before_insert_user
BEFORE INSERT ON users
FOR EACH ROW SET NEW.created_at = NOW();
```

## 最佳实践
- 存储过程适合封装复杂业务逻辑，减少前端与数据库交互次数。
- 触发器适合自动维护数据一致性，但不宜过多，避免调试困难。

## 代码示例（带 JSDoc 注释）
```js
/**
 * 调用 add_user 存储过程插入新用户
 * @param {import('mysql').Connection} conn
 * @param {string} name
 * @param {number} age
 * @returns {Promise<void>}
 */
function callAddUser(conn, name, age) {
  return conn.query('CALL add_user(?, ?)', [name, age]);
}
``` 