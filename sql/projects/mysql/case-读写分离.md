# MySQL 实战案例：读写分离部署

## 1. 需求描述
随着业务量增长，单库读压力大，主库易成为瓶颈。通过主从复制实现读写分离，主库负责写入，从库负责查询，提升系统吞吐与可用性。

## 2. 架构设计与部署要点
- 主库（Master）：负责所有写操作（INSERT/UPDATE/DELETE）
- 从库（Slave/Replica）：负责读操作（SELECT），通过复制主库数据
- 部署要点：
  - 配置主从复制（binlog、server-id、replicate-do-db等）
  - 读写分离中间件（如 MyCat、ShardingSphere-Proxy、应用层自实现）
  - 监控主从延迟，支持故障切换

## 3. 读写分离核心 SQL 与路由策略
- 写操作全部路由主库，读操作优先路由从库
- 事务内建议全部走主库，防止主从延迟导致脏读
- 重要查询（如登录、支付）可强制走主库

```js
/**
 * 简单读写分离路由
 * @param {'read'|'write'} type
 * @returns {import('mysql2/promise').Connection}
 */
function getConnection(type) {
  if (type === 'write') return masterConn;
  // 可实现负载均衡
  const slaves = [slaveConn1, slaveConn2];
  return slaves[Math.floor(Math.random() * slaves.length)];
}
```

## 4. Node.js 代码示例（JSDoc 注释）
```js
/**
 * 查询用户信息（走从库）
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
async function getUserInfo(userId) {
  const conn = getConnection('read');
  const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
}

/**
 * 更新用户信息（走主库）
 * @param {number} userId
 * @param {string} email
 * @returns {Promise<void>}
 */
async function updateUserEmail(userId, email) {
  const conn = getConnection('write');
  await conn.execute('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
}
```

## 5. 优化与总结
- 读写分离可大幅提升读性能，适合读多写少场景
- 需关注主从延迟，重要读操作建议走主库
- 事务内操作建议全部走主库，防止一致性问题
- 可用中间件实现自动路由、负载均衡、故障切换
- 定期监控主从同步状态，及时处理延迟与故障

---

> 本案例适合中大型网站、SaaS 平台等高并发读场景，建议结合业务一致性需求合理设计路由策略。 