# SQL Server 实战案例：数据同步到大数据平台与实时分析

## 1. 需求描述
以"SQL Server 订单数据同步到大数据平台并实现实时分析"为例，要求将订单表数据准实时同步到大数据平台（如 Hadoop、Hive、Spark、ClickHouse、Azure Synapse 等），支持流式分析和多维报表。

## 2. 方案设计
- **CDC（变更数据捕获）**：捕获 SQL Server 数据变更，推送到中间件（如 Kafka、DataX、Azure Data Factory）。
- **ETL/ELT 工具**：定时批量同步（如 DataX、Sqoop、ADF Pipeline）。
- **流式同步**：通过 Kafka Connect、Debezium、Azure Stream Analytics 实现实时同步。
- **实时分析**：大数据平台支持 SQL 查询、流式聚合、报表等。

## 3. 核心配置与操作
```sql
-- 启用 CDC（需管理员权限）
EXEC sys.sp_cdc_enable_db;
EXEC sys.sp_cdc_enable_table @source_schema = N'dbo', @source_name = N'orders', @role_name = NULL;

-- 查看变更数据
SELECT * FROM cdc.dbo_orders_CT;

-- DataX/Kafka/Spark 等工具配置详见官方文档
```

## 4. Node.js 代码示例（含 JSDoc 注释）
```js
const sql = require('mssql');
const { Kafka } = require('kafkajs');

/**
 * 读取 CDC 变更数据并推送到 Kafka
 * @param {sql.ConnectionPool} pool - SQL Server 连接池
 * @param {Kafka} kafka - Kafka 客户端实例
 * @returns {Promise<void>}
 */
async function syncCdcToKafka(pool, kafka) {
  const producer = kafka.producer();
  await producer.connect();
  const result = await pool.request().query('SELECT * FROM cdc.dbo_orders_CT WHERE __$start_lsn > @lastLsn');
  for (const row of result.recordset) {
    await producer.send({
      topic: 'orders_cdc',
      messages: [{ value: JSON.stringify(row) }]
    });
  }
  await producer.disconnect();
}

/**
 * 实时查询大数据平台（以 ClickHouse 为例）
 * @param {import('clickhouse').ClickHouse} clickhouse - ClickHouse 客户端
 * @param {string} sqlStr - 查询SQL
 * @returns {Promise<Array>}
 */
async function queryClickHouse(clickhouse, sqlStr) {
  return await clickhouse.query(sqlStr).toPromise();
}
```

## 5. 优化与总结
- CDC 适合准实时同步，ETL 适合批量全量/增量同步，流式同步适合高频变更场景
- 同步链路建议加断点续传、幂等处理，防止数据丢失或重复
- 监控同步延迟与异常，及时告警
- 大数据平台表结构建议与源库兼容，便于数据映射
- 实时分析建议结合物化视图、流式聚合提升性能

---

本案例适合企业级数据集成与实时分析场景，建议结合实际业务选择合适的同步与分析方案。 