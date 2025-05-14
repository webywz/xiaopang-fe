# Redis 实战案例

## 1. 用户登录态（Session）存储与验证

```js
/**
 * 设置用户 Session
 * @param {import('redis').RedisClient} client - Redis 客户端
 * @param {string} sessionId - 会话ID
 * @param {Object} sessionData - 会话数据
 * @returns {Promise<void>}
 */
function setSession(client, sessionId, sessionData) {
  return new Promise((resolve, reject) => {
    client.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 3600, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * 验证用户 Session
 * @param {import('redis').RedisClient} client
 * @param {string} sessionId
 * @returns {Promise<Object|null>} 会话数据或 null
 */
function getSession(client, sessionId) {
  return new Promise((resolve, reject) => {
    client.get(`session:${sessionId}`, (err, data) => {
      if (err) return reject(err);
      resolve(data ? JSON.parse(data) : null);
    });
  });
}
```

---

## 2. 分布式锁实现

```js
/**
 * 获取分布式锁
 * @param {import('redis').RedisClient} client
 * @param {string} lockKey - 锁名
 * @param {string} lockVal - 锁值（唯一标识）
 * @param {number} ttl - 锁过期时间（秒）
 * @returns {Promise<boolean>} 是否加锁成功
 */
function acquireLock(client, lockKey, lockVal, ttl) {
  return new Promise((resolve, reject) => {
    client.set(lockKey, lockVal, 'NX', 'EX', ttl, (err, res) => {
      if (err) return reject(err);
      resolve(res === 'OK');
    });
  });
}

/**
 * 释放分布式锁
 * @param {import('redis').RedisClient} client
 * @param {string} lockKey
 * @param {string} lockVal
 * @returns {Promise<boolean>} 是否释放成功
 */
function releaseLock(client, lockKey, lockVal) {
  const lua = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`;
  return new Promise((resolve, reject) => {
    client.eval(lua, 1, lockKey, lockVal, (err, res) => {
      if (err) return reject(err);
      resolve(res === 1);
    });
  });
}
```

---

## 3. 排行榜系统（有序集合）

```js
/**
 * 更新用户分数
 * @param {import('redis').RedisClient} client
 * @param {string} boardKey - 排行榜 key
 * @param {number} score - 分数
 * @param {string} userId - 用户ID
 * @returns {Promise<void>}
 */
function updateScore(client, boardKey, score, userId) {
  return new Promise((resolve, reject) => {
    client.zadd(boardKey, score, userId, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * 获取排行榜前 N 名
 * @param {import('redis').RedisClient} client
 * @param {string} boardKey
 * @param {number} topN
 * @returns {Promise<Array<string>>}
 */
function getTopN(client, boardKey, topN) {
  return new Promise((resolve, reject) => {
    client.zrevrange(boardKey, 0, topN - 1, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}
```

---

## 4. 消息队列（列表）

```js
/**
 * 推送消息到队列
 * @param {import('redis').RedisClient} client
 * @param {string} queueKey
 * @param {string} message
 * @returns {Promise<void>}
 */
function pushMessage(client, queueKey, message) {
  return new Promise((resolve, reject) => {
    client.lpush(queueKey, message, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * 消费队列消息
 * @param {import('redis').RedisClient} client
 * @param {string} queueKey
 * @returns {Promise<string|null>} 消息内容或 null
 */
function popMessage(client, queueKey) {
  return new Promise((resolve, reject) => {
    client.rpop(queueKey, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}
```

---

## 5. 限流器（计数器+过期）

```js
/**
 * 简单限流器：单位时间内最大访问次数
 * @param {import('redis').RedisClient} client
 * @param {string} key
 * @param {number} limit - 最大次数
 * @param {number} windowSec - 时间窗口（秒）
 * @returns {Promise<boolean>} 是否允许访问
 */
function rateLimiter(client, key, limit, windowSec) {
  return new Promise((resolve, reject) => {
    client.multi()
      .incr(key)
      .expire(key, windowSec)
      .exec((err, replies) => {
        if (err) return reject(err);
        resolve(replies[0] <= limit);
      });
  });
}
```

---

## 6. 热点数据缓存（Cache Aside Pattern）

```js
/**
 * 旁路缓存模式：先查缓存，未命中查数据库并写入缓存
 * @param {import('redis').RedisClient} client
 * @param {string} key
 * @param {Function} dbQuery - 查询数据库的函数，返回 Promise
 * @param {number} ttl - 缓存过期时间（秒）
 * @returns {Promise<any>} 数据
 */
async function cacheAside(client, key, dbQuery, ttl) {
  return new Promise((resolve, reject) => {
    client.get(key, async (err, data) => {
      if (err) return reject(err);
      if (data) return resolve(JSON.parse(data));
      // 未命中，查数据库
      try {
        const result = await dbQuery();
        client.set(key, JSON.stringify(result), 'EX', ttl);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });
}
```

---

## 7. 布隆过滤器防缓存穿透（伪代码）

```js
/**
 * 判断 key 是否可能存在（布隆过滤器）
 * @param {Object} bloomFilter - 布隆过滤器实例
 * @param {string} key
 * @returns {boolean}
 */
function mightExist(bloomFilter, key) {
  return bloomFilter.test(key);
}
// 查询前先用布隆过滤器判断，减少无效请求
``` 