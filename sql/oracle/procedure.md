# Oracle 存储过程与函数

## 1. 基础与应用场景
- 存储过程（PROCEDURE）和函数（FUNCTION）用于封装业务逻辑，提升复用性和安全性
- 适合批量处理、复杂校验、定时任务等场景

## 2. 创建与调用存储过程
```sql
-- 创建存储过程
CREATE OR REPLACE PROCEDURE add_user(p_name VARCHAR2, p_age NUMBER) AS
BEGIN
  INSERT INTO users(name, age) VALUES(p_name, p_age);
END;
/

-- 调用存储过程
BEGIN
  add_user('Alice', 20);
END;
/

-- 创建函数
CREATE OR REPLACE FUNCTION get_user_count RETURN NUMBER AS
  cnt NUMBER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM users;
  RETURN cnt;
END;
/

-- 调用函数
SELECT get_user_count() FROM dual;
```

## 3. 参数、返回值与异常处理
- 支持 IN/OUT/IN OUT 参数
- 可用 EXCEPTION 块捕获异常

## 4. 性能与安全注意事项
- 复杂逻辑建议分步调试，避免长事务
- 授权执行权限，防止越权调用

## 5. Node.js 调用存储过程代码（含 JSDoc 注释）
```js
/**
 * 调用 Oracle 存储过程
 * @param {oracledb.Connection} conn
 * @param {string} name
 * @param {number} age
 * @returns {Promise<void>}
 */
async function callAddUser(conn, name, age) {
  await conn.execute('BEGIN add_user(:name, :age); END;', { name, age });
}
```

---

Oracle 存储过程适合封装复杂业务逻辑，建议规范命名、分层设计、定期优化。 