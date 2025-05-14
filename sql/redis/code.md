# Redis 常用命令与代码示例

## 常用命令
```shell
SET key value           # 设置键值
GET key                 # 获取键值
DEL key                 # 删除键
EXPIRE key seconds      # 设置过期时间
INCR key                # 自增
LPUSH key value         # 列表左插入
LRANGE key start stop   # 获取列表区间元素
HSET key field value    # 哈希表设置
HGET key field          # 哈希表获取
```

## Node.js 代码示例（含 JSDoc 注释）
```js
/**
 * 设置缓存中的用户信息
 * @param {import('redis').RedisClient} client - Redis 客户端实例
 * @param {string} userId - 用户ID
 * @param {Object} userInfo - 用户信息对象
 * @returns {Promise<void>} 无返回值
 */
function setUserCache(client, userId, userInfo) {
  return new Promise((resolve, reject) => {
    client.set(`user:${userId}`, JSON.stringify(userInfo), 'EX', 3600, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * 获取缓存中的用户信息
 * @param {import('redis').RedisClient} client - Redis 客户端实例
 * @param {string} userId - 用户ID
 * @returns {Promise<Object|null>} 用户信息对象或 null
 */
function getUserCache(client, userId) {
  return new Promise((resolve, reject) => {
    client.get(`user:${userId}`, (err, data) => {
      if (err) return reject(err);
      resolve(data ? JSON.parse(data) : null);
    });
  });
}
``` 