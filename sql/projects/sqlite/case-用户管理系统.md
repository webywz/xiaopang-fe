# SQLite 实战案例：用户管理系统

## 1. 需求描述
实现基础用户管理系统，支持用户注册、登录、信息修改、权限分级，要求数据安全、唯一性约束，适合轻量级应用。

## 2. 表结构设计
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_status ON users(status);
```

## 3. 核心 SQL 示例
```sql
-- 注册用户
INSERT INTO users(username, password, email) VALUES('alice', ?, 'alice@example.com');

-- 登录校验
SELECT id, username, role FROM users WHERE username = ? AND password = ? AND status = 'active';

-- 修改信息
UPDATE users SET email = ?, updated_at = datetime('now') WHERE id = ?;

-- 权限变更
UPDATE users SET role = 'admin' WHERE id = ?;

-- 查询活跃用户
SELECT id, username, email FROM users WHERE status = 'active';
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 注册新用户
 * @param {sqlite3.Database} db
 * @param {object} user {username:string, password:string, email:string}
 * @returns {Promise<void>}
 */
function registerUser(db, user) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users(username, password, email) VALUES(?, ?, ?)',
      [user.username, user.password, user.email],
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

/**
 * 校验登录
 * @param {sqlite3.Database} db
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object|null>}
 */
function login(db, username, password) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, role FROM users WHERE username = ? AND password = ? AND status = ''active''',
      [username, password],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}
```

## 5. 优化与总结
- 密码建议加密存储，避免明文
- 重要操作建议加日志表记录
- 索引 status 字段提升活跃用户查询效率
- 定期清理无效账号，保障数据安全

---

本案例适合轻量级后台、桌面/移动端、嵌入式等基础用户体系场景。 