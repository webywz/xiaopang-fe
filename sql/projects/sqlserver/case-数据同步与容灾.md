# SQL Server 实战案例：数据同步与异地容灾

## 1. 需求描述
以"企业级数据库主备同步与异地容灾"为例，要求实现主库与备库实时/准实时同步，支持故障自动切换，保障业务连续性。

## 2. 方案类型说明
- **数据库镜像**：主备自动同步，支持手动/自动故障切换，适合中小型场景。
- **Always On 可用性组**：多副本高可用，支持读写分离，适合企业级高可用需求。
- **日志传送**：定期将主库日志备份还原到备库，适合异地灾备。
- **快照/复制**：适合只读分析或历史数据同步。

## 3. 核心配置与操作命令
```sql
-- 以日志传送为例：
-- 1. 主库定期备份事务日志
BACKUP LOG [mydb] TO DISK = N'/backup/mydb_log.trn' WITH INIT;

-- 2. 将日志文件复制到备库服务器（可用 robocopy、rsync 等工具）

-- 3. 备库还原日志
RESTORE LOG [mydb] FROM DISK = N'/backup/mydb_log.trn' WITH NORECOVERY;

-- Always On 可用性组、数据库镜像等可通过 SQL Server Management Studio 图形界面配置，或用 T-SQL 脚本实现。
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');

/**
 * 检查 SQL Server Always On 副本同步状态
 * @param {sql.ConnectionPool} pool - 数据库连接池
 * @returns {Promise<Array<{replica: string, state: string, role: string}>>} 副本状态列表
 */
async function checkAlwaysOnStatus(pool) {
  const result = await pool.request().query(`
    SELECT ag.name AS replica, ars.synchronization_state_desc AS state, arstates.role_desc AS role
    FROM sys.availability_groups ag
    JOIN sys.dm_hadr_availability_replica_states ars ON ag.group_id = ars.group_id
    JOIN sys.dm_hadr_availability_replica_states arstates ON ars.replica_id = arstates.replica_id
  `);
  return result.recordset;
}

/**
 * 触发主备手动切换（需有权限）
 * @param {sql.ConnectionPool} pool - 连接池
 * @param {string} agName - 可用性组名
 * @returns {Promise<void>}
 */
async function failoverAvailabilityGroup(pool, agName) {
  await pool.request().query(`ALTER AVAILABILITY GROUP [${agName}] FAILOVER`);
}
```

## 5. 优化与总结
- 推荐 Always On 可用性组，支持多副本、读写分离、自动故障切换
- 日志传送适合异地灾备，延迟可控，配置简单
- 定期监控同步延迟与状态，异常及时告警
- 切换流程需演练，确保业务不中断
- 备库可只读，防止误操作
- 网络带宽、磁盘性能影响同步效率，建议专线或高速链路

---

本案例适合对业务连续性要求高的企业，建议结合实际场景选择合适的同步与容灾方案。 