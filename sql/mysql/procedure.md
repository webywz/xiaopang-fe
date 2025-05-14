# MySQL 存储过程与函数（详解）

## 1. 存储过程与函数基础
- **存储过程（Procedure）**：一组预编译的 SQL 语句集合，可带输入/输出参数。
- **函数（Function）**：有返回值的存储过程，常用于表达式和查询中。
- 适用于批量处理、复杂业务逻辑、数据封装等场景。

## 2. 创建与调用存储过程
### 2.1 创建存储过程
```sql
DELIMITER //
CREATE PROCEDURE add_user(IN uname VARCHAR(50), IN uage INT)
BEGIN
  INSERT INTO users(name, age) VALUES (uname, uage);
END //
DELIMITER ;
```

### 2.2 调用存储过程
```sql
CALL add_user('李四', 30);
```

### 2.3 创建函数
```sql
DELIMITER //
CREATE FUNCTION get_user_count() RETURNS INT
BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt FROM users;
  RETURN cnt;
END //
DELIMITER ;
```

### 2.4 调用函数
```sql
SELECT get_user_count();
```

## 3. 变量与流程控制
- **变量声明**：DECLARE 变量名 类型 [DEFAULT 默认值];
- **赋值**：SET 变量 = 值; 或 SELECT ... INTO 变量;
- **流程控制**：IF、CASE、LOOP、WHILE、REPEAT、LEAVE、ITERATE

```sql
DELIMITER //
CREATE PROCEDURE demo_loop()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 5 DO
    INSERT INTO logs(msg) VALUES (CONCAT('第', i, '次循环'));
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;
```

## 4. 存储过程与事务
- 存储过程内部可使用 START TRANSACTION、COMMIT、ROLLBACK 控制事务。
- 注意：部分客户端（如 Navicat）默认自动提交，需手动设置。

```sql
DELIMITER //
CREATE PROCEDURE transfer(IN fromId INT, IN toId INT, IN amount DECIMAL(10,2))
BEGIN
  DECLARE exit handler for SQLEXCEPTION
    BEGIN
      ROLLBACK;
    END;
  START TRANSACTION;
  UPDATE accounts SET balance = balance - amount WHERE id = fromId;
  UPDATE accounts SET balance = balance + amount WHERE id = toId;
  COMMIT;
END //
DELIMITER ;
```

## 5. 优缺点与适用场景
- **优点**：
  - 预编译，执行效率高
  - 降低网络交互，适合批量处理
  - 封装业务逻辑，提升安全性
- **缺点**：
  - 维护和调试不如应用层灵活
  - 复杂逻辑建议放在应用层
  - 跨库/跨平台兼容性差

## 6. 常见问题与最佳实践
- 参数类型需明确，避免隐式转换
- 注意 SQL 注入风险，参数化处理
- 存储过程/函数建议加注释，便于维护
- 复杂流程建议分步调试
- 定期清理无用存储过程

## 7. Node.js 调用存储过程代码示例（JSDoc 注释）
```js
/**
 * 调用 add_user 存储过程
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} name
 * @param {number} age
 * @returns {Promise<void>}
 */
async function callAddUser(conn, name, age) {
  await conn.query('CALL add_user(?, ?)', [name, age]);
}

/**
 * 查询用户总数（调用函数）
 * @param {import('mysql2/promise').Connection} conn
 * @returns {Promise<number>}
 */
async function getUserCount(conn) {
  const [[row]] = await conn.query('SELECT get_user_count() AS cnt');
  return row.cnt;
}
```

---

> 存储过程适合数据批量处理、数据封装等场景，建议与应用层逻辑合理分工，提升系统整体可维护性。 