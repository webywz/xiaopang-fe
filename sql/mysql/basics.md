# MySQL 基础知识详解

## 1. MySQL 简介
MySQL 是最流行的开源关系型数据库管理系统之一，广泛应用于网站、企业级应用、云服务等场景。其高性能、易用性和强大的社区支持，使其成为开发者首选。

- 支持 ACID 事务
- 多存储引擎（InnoDB、MyISAM 等）
- 跨平台，支持多种操作系统
- 丰富的工具和生态

## 2. 安装与连接方式
### 2.1 安装
- Windows/macOS/Linux 可通过官网下载或包管理器安装
- Docker 安装示例：
```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql:8.0
```

### 2.2 连接方式
- 命令行：
```bash
mysql -u root -p -h 127.0.0.1 -P 3306
```
- 图形化工具：DBeaver、Navicat、DataGrip 等
- Node.js 连接示例：
```js
/**
 * 连接 MySQL 数据库
 * @returns {Promise<import('mysql2/promise').Connection>}
 */
async function connectMySQL() {
  const mysql = require('mysql2/promise');
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test'
  });
}
```

## 3. 基本 SQL 语法与常用操作
### 3.1 创建表
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  age INT,
  email VARCHAR(100) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 增删改查（CRUD）
```sql
-- 插入数据
INSERT INTO users (name, age, email) VALUES ('张三', 25, 'zhangsan@example.com');

-- 查询数据
SELECT id, name, age FROM users WHERE age > 18;

-- 更新数据
UPDATE users SET age = 26 WHERE name = '张三';

-- 删除数据
DELETE FROM users WHERE id = 1;
```

### 3.3 事务操作
```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 3.4 索引与视图
```sql
-- 创建索引
CREATE INDEX idx_users_age ON users(age);

-- 创建视图
CREATE VIEW active_users AS SELECT * FROM users WHERE age >= 18;
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询所有成年用户
 * @param {import('mysql2/promise').Connection} conn
 * @returns {Promise<Array<{id: number, name: string, age: number}>>}
 */
async function getAdultUsers(conn) {
  const [rows] = await conn.execute('SELECT id, name, age FROM users WHERE age >= 18');
  return rows;
}

/**
 * 新增用户
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} name
 * @param {number} age
 * @param {string} email
 * @returns {Promise<void>}
 */
async function addUser(conn, name, age, email) {
  await conn.execute('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', [name, age, email]);
}
```

## 实战案例
- [MySQL 实战案例](/sql/projects/mysql)

---

> 更多进阶内容请参考本目录下其他文档（如 transaction.md、performance.md、procedure.md 等）。 