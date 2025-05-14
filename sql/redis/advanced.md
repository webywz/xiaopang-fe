# Redis 高级特性

## 发布订阅（Pub/Sub）
- 用于消息广播、实时通知

```shell
PUBLISH channel message
SUBSCRIBE channel
```

```js
/**
 * 订阅频道消息
 * @param {import('redis').RedisClient} client
 * @param {string} channel
 */
function subscribeChannel(client, channel) {
  client.subscribe(channel);
  client.on('message', (ch, msg) => {
    if (ch === channel) {
      console.log('收到消息:', msg);
    }
  });
}
```

## 事务（MULTI/EXEC）
- 一组命令原子执行

```shell
MULTI
SET key1 val1
SET key2 val2
EXEC
```

## Lua 脚本
- 原子性、复杂逻辑

```shell
EVAL "return redis.call('set', KEYS[1], ARGV[1])" 1 mykey myval
```

## 持久化
- RDB：定期快照，适合灾备
- AOF：追加日志，适合高可靠

## 主从复制
- 数据同步，读写分离

## 哨兵（Sentinel）
- 自动故障转移与监控

## 集群（Cluster）
- 分片扩展，支持大规模数据 