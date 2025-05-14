# SQLite 数据库基础

## 简介与应用场景
SQLite 是轻量级嵌入式关系型数据库，广泛应用于移动端、桌面应用、嵌入式设备、测试环境等对资源占用和部署便捷性有高要求的场景。

## 基本结构与常用语法
```sql
-- 查询示例
SELECT name, age FROM users WHERE age > 18;

-- 创建表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  age INTEGER
);

-- 插入数据
INSERT INTO users (name, age) VALUES ('Alice', 20);

-- 更新数据
UPDATE users SET age = 21 WHERE id = 1;

-- 删除数据
DELETE FROM users WHERE id = 1;
```

## 连接方式与开发建议
- 直接读写本地 .db 文件，无需独立服务进程
- 推荐使用 sqlite3 官方 CLI 或 Node.js sqlite3/ better-sqlite3 等驱动
- 适合单机/小型应用，不建议高并发写入场景

## 典型 Node.js 代码示例（含 JSDoc 注释）
```js
const sqlite3 = require('sqlite3').verbose();

/**
 * 查询所有成年用户
 * @param {sqlite3.Database} db - SQLite 数据库对象
 * @returns {Promise<Array<{id:number,name:string,age:number}>>}
 */
function getAdultUsers(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name, age FROM users WHERE age > 18', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
```

---

SQLite 适合轻量级、嵌入式、单机场景，建议团队熟悉其特性与限制，合理选型与使用。 