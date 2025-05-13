# MySQL 实战项目

MySQL 是最流行的开源关系型数据库，广泛应用于各类互联网项目。以下以用户管理和订单系统为例，介绍实战中的表结构设计、索引优化、事务处理等。

## 典型业务场景
- 用户管理系统
- 订单管理系统

## 表结构设计
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 索引优化
- 为外键、查询频繁字段建索引。
- 避免冗余和重复索引。

## 事务处理
```js
/**
 * 创建订单并扣减用户余额（事务）
 * @param {import('mysql').Connection} conn
 * @param {number} userId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function createOrderAndDeduct(conn, userId, amount) {
  await conn.beginTransaction();
  try {
    await conn.query('INSERT INTO orders (user_id, amount, status) VALUES (?, ?, ?)', [userId, amount, 'pending']);
    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}
```

## 备份与恢复
- 使用 `mysqldump` 工具定期备份。
- 恢复时注意数据一致性和完整性。

## 性能调优
- 定期分析慢查询日志，优化 SQL。
- 合理配置连接池和缓存。 