# PostgreSQL 存储过程与函数（详解）

## 1. 存储过程与函数基础
- **函数（Function）**：有返回值，可用于查询、表达式、触发器等
- **存储过程（Procedure）**：PostgreSQL 11+ 支持，支持事务控制，无返回值
- 主要用 PL/pgSQL 语言，也支持 SQL、PL/Python、PL/Perl 等

## 2. 创建与调用
### 2.1 创建函数
```sql
CREATE OR REPLACE FUNCTION add_user(uname VARCHAR, uage INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users(name, age) VALUES (uname, uage);
END;
$$ LANGUAGE plpgsql;
```

### 2.2 调用函数
```sql
SELECT add_user('李四', 30);
```

### 2.3 创建存储过程（PostgreSQL 11+）
```sql
CREATE PROCEDURE transfer(from_id INT, to_id INT, amount NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
END;
$$;
```

### 2.4 调用存储过程
```sql
CALL transfer(1, 2, 100);
```

## 3. 变量与流程控制
- **变量声明**：DECLARE 变量名 类型 [DEFAULT 默认值];
- **赋值**：变量 := 值; 或 SELECT ... INTO 变量;
- **流程控制**：IF、CASE、LOOP、WHILE、FOR、EXIT、RETURN

```sql
CREATE OR REPLACE FUNCTION demo_loop()
RETURNS VOID AS $$
DECLARE
  i INT := 0;
BEGIN
  FOR i IN 1..5 LOOP
    INSERT INTO logs(msg) VALUES ('第' || i || '次循环');
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## 4. 存储过程与事务
- 存储过程（CALL）可在内部使用 BEGIN/COMMIT/ROLLBACK 控制子事务
- 函数（SELECT 调用）不能显式提交/回滚事务

```sql
CREATE PROCEDURE safe_transfer(from_id INT, to_id INT, amount NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    UPDATE accounts SET balance = balance - amount WHERE id = from_id;
    UPDATE accounts SET balance = balance + amount WHERE id = to_id;
    -- 可用 EXCEPTION 捕获错误并回滚
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '转账失败';
    ROLLBACK;
  END;
END;
$$;
```

## 5. PL/pgSQL 语言特性
- 支持复杂流程控制、异常处理、游标、批量操作
- 可嵌套调用、递归、动态 SQL（EXECUTE）
- 支持 OUT/INOUT 参数、返回表（RETURNS TABLE）

## 6. 优缺点与适用场景
- **优点**：
  - 预编译，执行效率高
  - 降低网络交互，适合批量处理
  - 封装业务逻辑，提升安全性
- **缺点**：
  - 维护和调试不如应用层灵活
  - 复杂逻辑建议放在应用层
  - 跨库/跨平台兼容性差

## 7. 常见问题与最佳实践
- 参数类型需明确，避免隐式转换
- 注意 SQL 注入风险，参数化处理
- 存储过程/函数建议加注释，便于维护
- 复杂流程建议分步调试
- 定期清理无用存储过程/函数

## 8. Node.js 调用存储过程/函数代码示例（JSDoc 注释）
```js
/**
 * 调用 add_user 函数
 * @param {import('pg').Pool} pool
 * @param {string} name
 * @param {number} age
 * @returns {Promise<void>}
 */
async function callAddUser(pool, name, age) {
  await pool.query('SELECT add_user($1, $2)', [name, age]);
}

/**
 * 调用 transfer 存储过程
 * @param {import('pg').Pool} pool
 * @param {number} fromId
 * @param {number} toId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function callTransfer(pool, fromId, toId, amount) {
  await pool.query('CALL transfer($1, $2, $3)', [fromId, toId, amount]);
}
```

---

> 存储过程适合数据批量处理、数据封装等场景，建议与应用层逻辑合理分工，提升系统整体可维护性。 