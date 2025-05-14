# Redis 数据结构详解

## 字符串（String）
- 最基本的数据类型，最大 512MB
- 应用：计数器、缓存简单对象、分布式锁

```shell
SET key value
GET key
INCR key
```

```js
/**
 * 设置字符串类型的键值
 * @param {import('redis').RedisClient} client
 * @param {string} key
 * @param {string} value
 * @returns {Promise<void>}
 */
function setString(client, key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

## 哈希（Hash）
- 适合存储对象（如用户信息）
- 应用：用户资料、配置项

```shell
HSET user:1 name Alice
HGET user:1 name
```

```js
/**
 * 设置哈希表字段
 * @param {import('redis').RedisClient} client
 * @param {string} key
 * @param {string} field
 * @param {string} value
 * @returns {Promise<void>}
 */
function setHashField(client, key, field, value) {
  return new Promise((resolve, reject) => {
    client.hset(key, field, value, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
```

## 列表（List）
- 有序集合，支持两端插入和弹出
- 应用：消息队列、任务列表

```shell
LPUSH queue task1
RPOP queue
```

## 集合（Set）
- 无序且唯一，支持集合运算
- 应用：标签、去重、共同好友

```shell
SADD tags redis
SISMEMBER tags redis
```

## 有序集合（Sorted Set）
- 每个元素有分数，自动排序
- 应用：排行榜、带权重的队列

```shell
ZADD rank 100 user1
ZRANGE rank 0 -1 WITHSCORES
```

## 位图（Bitmap）
- 位级操作，适合大规模布尔统计
- 应用：签到、活跃用户统计

## HyperLogLog
- 基数统计，节省内存
- 应用：UV 统计

## 地理空间（Geo）
- 存储地理坐标，支持范围和距离查询
- 应用：附近的人、LBS 