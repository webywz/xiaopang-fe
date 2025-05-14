# SQLite 数据库安全

## 1. 账户与权限管理
- SQLite 无内置账户体系，依赖操作系统文件权限
- 建议仅授权应用进程读写，其他用户只读或无权限

## 2. 数据加密与脱敏
- 可用 SQLCipher 等扩展实现数据库文件加密
- 敏感字段建议应用层加密或脱敏存储

## 3. 审计与日志
- 无内置审计功能，可通过应用层日志记录关键操作

## 4. 防 SQL 注入与安全开发
- 所有输入参数必须参数化，严禁拼接 SQL
- 定期安全审计，限制数据库文件访问

## 5. 备份文件安全
- 备份文件加密存储，限制访问权限
- 备份文件定期归档、异地存储

## 6. 常见安全风险与最佳实践
- 数据库文件被恶意复制或篡改
- 生产环境数据库文件权限最小化
- 定期安全加固与漏洞修复

## 7. Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 参数化查询防止 SQL 注入
 * @param {sqlite3.Database} db
 * @param {string} username
 * @returns {Promise<object|null>}
 */
function getUserByName(db, username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}
```

---

SQLite 安全依赖操作系统权限与应用层加固，建议定期审计与加密关键数据。 