---
layout: doc
title: 在Node.js中实现缓存策略
description: 全面解析Node.js中的本地缓存、分布式缓存、缓存失效与一致性策略，助你提升系统性能与可扩展性。
---

# 在Node.js中实现缓存策略

缓存是提升Node.js应用性能与可扩展性的关键手段。本文将系统讲解本地缓存、分布式缓存、缓存失效与一致性策略。

## 目录

- [缓存的基本原理](#缓存的基本原理)
- [本地缓存实现方式](#本地缓存实现方式)
- [分布式缓存与Redis集成](#分布式缓存与redis集成)
- [缓存失效与一致性策略](#缓存失效与一致性策略)
- [实战建议与最佳实践](#实战建议与最佳实践)

## 缓存的基本原理

- 缓存通过存储热点数据，减少数据库和I/O压力
- 常见策略：LRU、LFU、TTL等

缓存是一种临时存储机制，它将频繁访问的数据存储在快速访问的存储介质中，从而减少对原始数据源的访问，提高应用程序性能。在Node.js应用中，合理使用缓存可以显著降低数据库负载、减少网络请求、提升响应速度。

### 缓存的工作原理

缓存的基本工作流程遵循以下模式：

```js
/**
 * 缓存的基本工作流程示例
 * @param {string} key 缓存键
 * @param {Function} dataFetcher 数据获取函数
 * @returns {Promise<any>} 数据结果
 */
async function getCachedData(key, dataFetcher) {
  // 1. 检查缓存中是否存在数据
  const cachedData = cache.get(key);
  
  // 2. 如果存在且有效，直接返回缓存数据
  if (cachedData !== undefined) {
    console.log('缓存命中!');
    return cachedData;
  }
  
  // 3. 如果缓存未命中，从数据源获取数据
  console.log('缓存未命中，从数据源获取数据...');
  const freshData = await dataFetcher();
  
  // 4. 将新获取的数据存入缓存
  cache.set(key, freshData);
  
  // 5. 返回数据
  return freshData;
}
```

### 缓存性能指标

评估缓存效率的关键指标包括：

```js
/**
 * 缓存性能监控类
 */
class CacheMetrics {
  /**
   * 构造函数
   */
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.totalRequests = 0;
    this.latencies = [];
  }

  /**
   * 记录缓存访问
   * @param {boolean} isHit 是否命中缓存
   * @param {number} latency 延迟时间(毫秒)
   */
  recordAccess(isHit, latency) {
    this.totalRequests++;
    isHit ? this.hits++ : this.misses++;
    this.latencies.push(latency);
  }

  /**
   * 获取缓存命中率
   * @returns {number} 命中率百分比
   */
  getHitRate() {
    if (this.totalRequests === 0) return 0;
    return (this.hits / this.totalRequests) * 100;
  }

  /**
   * 获取平均延迟
   * @returns {number} 平均延迟(毫秒)
   */
  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return sum / this.latencies.length;
  }
  
  /**
   * 生成性能报告
   * @returns {Object} 性能报告
   */
  generateReport() {
    return {
      hitRate: `${this.getHitRate().toFixed(2)}%`,
      totalRequests: this.totalRequests,
      hits: this.hits,
      misses: this.misses,
      avgLatency: `${this.getAverageLatency().toFixed(2)}ms`
    };
  }
}
```

### 常见的缓存替换策略

缓存容量有限，当达到容量上限时，需要决定哪些数据应该被移除。以下是几种常见的替换策略：

```js
/**
 * 1. LRU (Least Recently Used) - 最近最少使用策略
 * 移除最长时间未被访问的数据
 */
class LRUCache {
  /**
   * 构造函数
   * @param {number} capacity 缓存容量
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // 使用Map保持插入顺序
  }

  /**
   * 获取数据
   * @param {string} key 键
   * @returns {any} 值或undefined
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // 获取值
    const value = this.cache.get(key);
    
    // 更新访问顺序（删除后重新插入到末尾）
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  /**
   * 设置数据
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最旧的项（Map中的第一项）
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // 添加新项到末尾
    this.cache.set(key, value);
  }
}

/**
 * 2. LFU (Least Frequently Used) - 最不经常使用策略
 * 移除访问次数最少的数据
 */
class LFUCache {
  /**
   * 构造函数
   * @param {number} capacity 缓存容量
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // 存储键值对
    this.frequencies = new Map(); // 存储访问频率
  }

  /**
   * 获取数据
   * @param {string} key 键
   * @returns {any} 值或undefined
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // 获取值
    const value = this.cache.get(key);
    
    // 更新访问频率
    const frequency = this.frequencies.get(key) || 0;
    this.frequencies.set(key, frequency + 1);
    
    return value;
  }

  /**
   * 设置数据
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    // 如果键已存在，更新值和频率
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      const frequency = this.frequencies.get(key) || 0;
      this.frequencies.set(key, frequency + 1);
      return;
    }
    
    // 如果缓存已满，删除访问频率最低的项
    if (this.cache.size >= this.capacity) {
      let lowestFreq = Infinity;
      let lowestKey = null;
      
      // 找出频率最低的项
      for (const [k, freq] of this.frequencies.entries()) {
        if (freq < lowestFreq && this.cache.has(k)) {
          lowestFreq = freq;
          lowestKey = k;
        }
      }
      
      // 删除频率最低的项
      if (lowestKey) {
        this.cache.delete(lowestKey);
        this.frequencies.delete(lowestKey);
      }
    }
    
    // 添加新项
    this.cache.set(key, value);
    this.frequencies.set(key, 1); // 初始频率为1
  }
}

/**
 * 3. FIFO (First In First Out) - 先进先出策略
 * 移除最先添加的数据
 */
class FIFOCache {
  /**
   * 构造函数
   * @param {number} capacity 缓存容量
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // 使用Map保持插入顺序
  }

  /**
   * 获取数据
   * @param {string} key 键
   * @returns {any} 值或undefined
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * 设置数据
   * @param {string} key 键
   * @param {any} value 值
   */
  set(key, value) {
    // 如果缓存已满且键不存在，删除最先插入的项
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // 添加或更新项
    this.cache.set(key, value);
  }
}

/**
 * 4. TTL (Time To Live) - 基于过期时间的策略
 * 数据在特定时间后过期
 */
class TTLCache {
  /**
   * 构造函数
   * @param {number} defaultTTL 默认过期时间(毫秒)
   */
  constructor(defaultTTL = 60000) {
    this.cache = new Map();
    this.expirations = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * 获取数据
   * @param {string} key 键
   * @returns {any} 值或undefined
   */
  get(key) {
    // 检查是否过期
    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }
    
    return this.cache.get(key);
  }

  /**
   * 设置数据
   * @param {string} key 键
   * @param {any} value 值
   * @param {number} ttl 过期时间(毫秒)，不指定则使用默认值
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    const expiration = Date.now() + ttl;
    this.expirations.set(key, expiration);
  }

  /**
   * 检查键是否过期
   * @param {string} key 键
   * @returns {boolean} 是否过期
   */
  isExpired(key) {
    const expiration = this.expirations.get(key);
    return expiration !== undefined && expiration < Date.now();
  }

  /**
   * 删除缓存项
   * @param {string} key 键
   */
  delete(key) {
    this.cache.delete(key);
    this.expirations.delete(key);
  }

  /**
   * 清理所有过期项
   */
  purgeExpired() {
    const now = Date.now();
    for (const [key, expiration] of this.expirations.entries()) {
      if (expiration < now) {
        this.delete(key);
      }
    }
  }
}
```

### 缓存使用场景分析

不同场景适合不同的缓存策略：

```js
/**
 * 缓存策略选择器 - 根据场景选择合适的缓存策略
 */
class CacheStrategySelector {
  /**
   * 获取基于查询频率的推荐策略
   * @param {Object} params 参数对象
   * @returns {string} 推荐策略
   */
  static getStrategyByQueryPattern(params) {
    const { readFrequency, writeFrequency, dataSize, itemCount } = params;
    
    // 读多写少，数据量大 - 适合LRU
    if (readFrequency === 'high' && writeFrequency === 'low' && dataSize === 'large') {
      return 'LRU';
    }
    
    // 某些项访问频率远高于其他项 - 适合LFU
    if (readFrequency === 'uneven') {
      return 'LFU';
    }
    
    // 数据定期完全更新 - 适合FIFO
    if (writeFrequency === 'periodic' && writeFrequency === 'batch') {
      return 'FIFO';
    }
    
    // 数据有明确的有效期 - 适合TTL
    if (params.hasExpiryTime) {
      return 'TTL';
    }
    
    // 默认策略
    return 'LRU';
  }
  
  /**
   * 创建推荐的缓存实例
   * @param {string} strategy 策略名称
   * @param {Object} options 缓存选项
   * @returns {Object} 缓存实例
   */
  static createCache(strategy, options = {}) {
    const { capacity = 100, ttl = 60000 } = options;
    
    switch (strategy) {
      case 'LRU':
        return new LRUCache(capacity);
      case 'LFU':
        return new LFUCache(capacity);
      case 'FIFO':
        return new FIFOCache(capacity);
      case 'TTL':
        return new TTLCache(ttl);
      default:
        return new LRUCache(capacity); // 默认使用LRU
    }
  }
}
```

### 缓存的成本与收益

缓存虽然能提升性能，但也带来额外复杂性和资源消耗：

```js
/**
 * 缓存成本收益分析器
 */
class CacheCostBenefitAnalyzer {
  /**
   * 分析缓存的ROI(投资回报率)
   * @param {Object} params 参数对象
   * @returns {Object} 分析结果
   */
  static analyzeROI(params) {
    const {
      avgDatabaseQueryTime, // 平均数据库查询时间(ms)
      avgCacheAccessTime,   // 平均缓存访问时间(ms)
      cacheHitRate,         // 缓存命中率(0-1)
      queriesPerSecond,     // 每秒查询数
      cacheSizeBytes,       // 缓存大小(字节)
      memoryCostPerGB       // 内存成本(每GB)
    } = params;
    
    // 计算时间节省
    const timeWithoutCache = avgDatabaseQueryTime * queriesPerSecond;
    const timeWithCache = (avgCacheAccessTime * cacheHitRate + 
                          avgDatabaseQueryTime * (1 - cacheHitRate)) * 
                          queriesPerSecond;
    const timeSaved = timeWithoutCache - timeWithCache;
    
    // 计算内存成本
    const memoryCostPerSecond = (cacheSizeBytes / (1024 * 1024 * 1024)) * 
                                memoryCostPerGB / (30 * 24 * 60 * 60);
    
    // 计算ROI
    const roi = timeSaved / memoryCostPerSecond;
    
    return {
      timeSavedPerSecond: timeSaved,
      memoryCostPerSecond,
      roi,
      recommendation: roi > 1 ? 
        '缓存有正面ROI，建议实施' : 
        '缓存ROI不足，可能不值得实施'
    };
  }
  
  /**
   * 评估缓存策略的内存使用效率
   * @param {Object} cache 缓存实例
   * @param {Function} sizeCalculator 大小计算函数
   * @returns {Object} 分析结果
   */
  static analyzeMemoryEfficiency(cache, sizeCalculator) {
    let totalSize = 0;
    let itemCount = 0;
    
    // 计算每个缓存项的大小
    for (const [key, value] of cache.cache.entries()) {
      const itemSize = sizeCalculator(key, value);
      totalSize += itemSize;
      itemCount++;
    }
    
    // 计算平均大小和效率指标
    const averageSize = itemCount > 0 ? totalSize / itemCount : 0;
    
    return {
      totalSizeBytes: totalSize,
      itemCount,
      averageSizeBytes: averageSize,
      efficiencyScore: this._calculateEfficiencyScore(
        cache.hit || 0,
        cache.miss || 0,
        totalSize
      )
    };
  }
  
  /**
   * 计算缓存效率得分
   * @param {number} hits 命中次数
   * @param {number} misses 未命中次数
   * @param {number} sizeBytes 大小(字节)
   * @returns {number} 效率得分(0-100)
   */
  static _calculateEfficiencyScore(hits, misses, sizeBytes) {
    if (hits + misses === 0) return 0;
    
    const hitRate = hits / (hits + misses);
    const normalizedSize = Math.min(sizeBytes / (50 * 1024 * 1024), 1); // 归一化大小，最大50MB
    
    // 效率得分 = 命中率 * (1 - 归一化大小) * 100
    return hitRate * (1 - normalizedSize * 0.5) * 100;
  }
}
```

## 本地缓存实现方式

本地缓存存储在应用程序的内存中，适用于单实例应用或会话级数据缓存。Node.js中实现本地缓存有多种方式，从简单的内置数据结构到专业的缓存库。

### 使用原生JavaScript对象

最简单的本地缓存实现可以使用JavaScript的`Map`和`Object`：

```js
/**
 * 简单的内存缓存实现
 */
class SimpleMemoryCache {
  /**
   * 构造函数
   */
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0
    };
  }

  /**
   * 获取缓存数据
   * @param {string} key 缓存键
   * @returns {any} 缓存值或undefined
   */
  get(key) {
    const item = this.cache.get(key);
    
    // 如果项不存在
    if (!item) {
      this.stats.misses++;
      return undefined;
    }
    
    // 如果项已过期
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return item.value;
  }

  /**
   * 设置缓存数据
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} ttl 过期时间(毫秒)，0表示永不过期
   */
  set(key, value, ttl = 0) {
    const item = {
      value,
      created: Date.now(),
      expiry: ttl > 0 ? Date.now() + ttl : null
    };
    
    this.cache.set(key, item);
    return true;
  }

  /**
   * 删除缓存项
   * @param {string} key 缓存键
   * @returns {boolean} 是否成功删除
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
    return true;
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      total: totalRequests,
      hitRate: `${hitRate.toFixed(2)}%`,
      size: this.cache.size
    };
  }
  
  /**
   * 清理过期项
   * @returns {number} 清理的项数量
   */
  purgeExpired() {
    let purged = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
        purged++;
      }
    }
    
    return purged;
  }
}

// 用法示例
const cache = new SimpleMemoryCache();
cache.set('user:1', { name: 'Zhang San', role: 'admin' }, 60000); // 60秒过期
cache.set('config', { theme: 'dark', language: 'zh-CN' }); // 永不过期

console.log(cache.get('user:1')); // 输出用户数据
console.log(cache.getStats()); // 输出缓存统计信息
```

### 使用Node.js缓存库

对于更复杂的需求，可以使用专业的缓存库如`node-cache`、`lru-cache`等：

```js
/**
 * 使用lru-cache库实现本地缓存
 * @module cacheService
 */

const LRU = require('lru-cache');

/**
 * 创建并配置LRU缓存实例
 * @param {Object} options 缓存配置选项
 * @returns {LRU} 配置好的LRU缓存实例
 */
function createCache(options = {}) {
  const defaultOptions = {
    // 最大缓存项数量
    max: 500,
    
    // 默认TTL (30分钟)
    ttl: 1000 * 60 * 30,
    
    // 是否在访问时更新项的新鲜度
    updateAgeOnGet: true,
    
    // 自定义项大小计算函数(默认每项大小为1)
    sizeCalculation: (value, key) => {
      // 字符串按字节数计算大小
      if (typeof value === 'string') {
        return Buffer.byteLength(value, 'utf8');
      }
      // 对象按JSON字符串大小计算
      else if (typeof value === 'object' && value !== null) {
        return Buffer.byteLength(JSON.stringify(value), 'utf8');
      }
      // 其他类型默认大小为1
      return 1;
    },
    
    // 缓存最大字节数(50MB)
    maxSize: 50 * 1024 * 1024,
    
    // 当项被逐出缓存时调用
    dispose: (value, key) => {
      console.log(`缓存项被移除: ${key}`);
    }
  };
  
  // 合并默认选项和用户提供的选项
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new LRU(mergedOptions);
}

// 创建缓存服务单例
const cacheService = {
  cache: createCache(),
  
  /**
   * 获取缓存项
   * @param {string} key 缓存键
   * @returns {any} 缓存值或undefined
   */
  get(key) {
    return this.cache.get(key);
  },
  
  /**
   * 设置缓存项
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {Object} options 选项(ttl等)
   * @returns {boolean} 操作是否成功
   */
  set(key, value, options = {}) {
    return this.cache.set(key, value, options);
  },
  
  /**
   * 删除缓存项
   * @param {string} key 缓存键
   * @returns {boolean} 操作是否成功
   */
  delete(key) {
    return this.cache.delete(key);
  },
  
  /**
   * 检查键是否存在
   * @param {string} key 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    return this.cache.has(key);
  },
  
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  },
  
  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      itemCount: this.cache.itemCount,
      maxSize: this.cache.maxSize,
      currentSize: this.cache.calculatedSize
    };
  }
};

module.exports = cacheService;
```

### 内存分层缓存

针对不同类型数据的访问频率和重要性，可以实现分层缓存策略：

```js
/**
 * 分层缓存管理器
 * 管理多个不同配置的缓存层，适合不同类型和优先级的数据
 */
class TieredCacheManager {
  /**
   * 构造函数
   */
  constructor() {
    const LRU = require('lru-cache');
    
    // 第一层: 高速小容量缓存，适合热点数据
    this.hotCache = new LRU({
      max: 100,
      ttl: 1000 * 60 * 5, // 5分钟
      updateAgeOnGet: true
    });
    
    // 第二层: 中等容量和速度的缓存，适合常规访问数据
    this.warmCache = new LRU({
      max: 1000,
      ttl: 1000 * 60 * 30, // 30分钟
      updateAgeOnGet: true
    });
    
    // 第三层: 大容量缓存，适合不太频繁访问的数据
    this.coldCache = new LRU({
      max: 10000,
      ttl: 1000 * 60 * 120, // 2小时
      updateAgeOnGet: false
    });
    
    // 访问统计
    this.stats = {
      hits: { hot: 0, warm: 0, cold: 0 },
      misses: 0,
      promotions: { toHot: 0, toWarm: 0 }
    };
  }

  /**
   * 获取缓存数据，自动在各层查找
   * @param {string} key 缓存键
   * @returns {any} 缓存值或undefined
   */
  get(key) {
    // 1. 先在热缓存中查找
    let value = this.hotCache.get(key);
    if (value !== undefined) {
      this.stats.hits.hot++;
      return value;
    }
    
    // 2. 再在温缓存中查找
    value = this.warmCache.get(key);
    if (value !== undefined) {
      // 将数据提升到热缓存
      this.hotCache.set(key, value);
      this.stats.hits.warm++;
      this.stats.promotions.toHot++;
      return value;
    }
    
    // 3. 最后在冷缓存中查找
    value = this.coldCache.get(key);
    if (value !== undefined) {
      // 将数据提升到温缓存
      this.warmCache.set(key, value);
      this.stats.hits.cold++;
      this.stats.promotions.toWarm++;
      return value;
    }
    
    // 未找到数据
    this.stats.misses++;
    return undefined;
  }

  /**
   * 设置缓存数据，根据参数决定放在哪一层
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {string} tier 目标缓存层级('hot','warm','cold')
   * @param {number} ttl 可选的TTL覆盖
   */
  set(key, value, tier = 'warm', ttl) {
    const options = ttl ? { ttl } : undefined;
    
    switch (tier) {
      case 'hot':
        this.hotCache.set(key, value, options);
        break;
      case 'warm':
        this.warmCache.set(key, value, options);
        break;
      case 'cold':
      default:
        this.coldCache.set(key, value, options);
        break;
    }
  }

  /**
   * 从所有缓存层中删除项
   * @param {string} key 缓存键
   */
  delete(key) {
    this.hotCache.delete(key);
    this.warmCache.delete(key);
    this.coldCache.delete(key);
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    const totalHits = this.stats.hits.hot + this.stats.hits.warm + this.stats.hits.cold;
    const totalRequests = totalHits + this.stats.misses;
    
    return {
      hits: this.stats.hits,
      totalHits,
      misses: this.stats.misses,
      hitRate: totalRequests ? (totalHits / totalRequests * 100).toFixed(2) + '%' : '0%',
      promotions: this.stats.promotions,
      sizes: {
        hot: this.hotCache.size,
        warm: this.warmCache.size,
        cold: this.coldCache.size
      }
    };
  }
  
  /**
   * 智能放置策略 - 根据数据特性自动决定放在哪一层
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {Object} metadata 数据元信息
   */
  smartSet(key, value, metadata = {}) {
    const { priority, frequency, size } = metadata;
    
    // 高优先级或高频访问的小数据放入热缓存
    if ((priority === 'high' || frequency === 'high') && (size === 'small' || !size)) {
      this.set(key, value, 'hot');
    }
    // 中等优先级或频率的数据放入温缓存
    else if ((priority === 'medium' || frequency === 'medium') || 
             (priority === 'high' && size === 'medium')) {
      this.set(key, value, 'warm');
    }
    // 其他数据放入冷缓存
    else {
      this.set(key, value, 'cold');
    }
  }
}

// 用法示例
const tieredCache = new TieredCacheManager();

// 存储用户配置(高优先级、小数据)
tieredCache.smartSet('userPrefs:1001', { theme: 'dark' }, { priority: 'high', size: 'small' });

// 存储产品目录(中等优先级、中等数据量)
tieredCache.smartSet('products:electronics', [...productsArray], { priority: 'medium', size: 'medium' });

// 存储历史记录(低优先级、大数据量)
tieredCache.smartSet('userHistory:1001', [...historyArray], { priority: 'low', size: 'large' });

// 查询数据将自动从合适的缓存层获取，并根据访问模式进行层级提升
const userPrefs = tieredCache.get('userPrefs:1001');
```

### 缓存包装器模式

封装数据访问逻辑和缓存操作，简化代码并确保一致性：

```js
/**
 * 缓存包装器 - 用于简化数据访问与缓存操作
 */
class CacheWrapper {
  /**
   * 构造函数
   * @param {Object} cache 缓存实例
   * @param {Object} options 配置选项
   */
  constructor(cache, options = {}) {
    this.cache = cache;
    this.options = {
      defaultTTL: 1000 * 60 * 15, // 默认TTL为15分钟
      keyPrefix: '',              // 键前缀
      logging: false,             // 是否启用日志
      ...options
    };
  }

  /**
   * 获取带前缀的完整键名
   * @param {string} key 原始键名
   * @returns {string} 带前缀的键名
   */
  _getFullKey(key) {
    return this.options.keyPrefix ? `${this.options.keyPrefix}:${key}` : key;
  }

  /**
   * 记录日志信息
   * @param {string} message 日志消息
   * @param {string} level 日志级别
   */
  _log(message, level = 'info') {
    if (this.options.logging) {
      console[level](`[CacheWrapper] ${message}`);
    }
  }

  /**
   * 使用缓存执行数据获取函数
   * @param {string} key 缓存键
   * @param {Function} dataFetcher 数据获取函数
   * @param {Object} options 选项
   * @returns {Promise<any>} 数据结果
   */
  async getOrFetch(key, dataFetcher, options = {}) {
    const fullKey = this._getFullKey(key);
    const ttl = options.ttl || this.options.defaultTTL;
    
    // 尝试从缓存获取
    const cachedData = this.cache.get(fullKey);
    if (cachedData !== undefined) {
      this._log(`缓存命中: ${fullKey}`);
      return cachedData;
    }
    
    // 缓存未命中，执行数据获取函数
    this._log(`缓存未命中: ${fullKey}, 从数据源获取`);
    try {
      const freshData = await dataFetcher();
      
      // 存入缓存
      if (freshData !== undefined && freshData !== null) {
        this.cache.set(fullKey, freshData, ttl);
        this._log(`数据存入缓存: ${fullKey}, TTL: ${ttl}ms`);
      }
      
      return freshData;
    } catch (error) {
      this._log(`数据获取错误: ${fullKey}, ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 批量获取或加载数据
   * @param {Array<string>} keys 缓存键数组
   * @param {Function} batchFetcher 批量数据获取函数
   * @param {Object} options 选项
   * @returns {Promise<Object>} 键值对结果
   */
  async mgetOrFetch(keys, batchFetcher, options = {}) {
    const fullKeys = keys.map(key => this._getFullKey(key));
    const ttl = options.ttl || this.options.defaultTTL;
    
    // 检查哪些键存在于缓存中
    const result = {};
    const missingKeys = [];
    const missingIndices = [];
    
    for (let i = 0; i < fullKeys.length; i++) {
      const fullKey = fullKeys[i];
      const value = this.cache.get(fullKey);
      
      if (value !== undefined) {
        result[keys[i]] = value;
        this._log(`缓存命中: ${fullKey}`);
      } else {
        missingKeys.push(keys[i]);
        missingIndices.push(i);
        this._log(`缓存未命中: ${fullKey}`);
      }
    }
    
    // 如果所有键都在缓存中，直接返回
    if (missingKeys.length === 0) {
      return result;
    }
    
    // 获取缺失的数据
    try {
      const fetchedData = await batchFetcher(missingKeys);
      
      // 将获取的数据存入缓存并合并到结果中
      for (const key in fetchedData) {
        const fullKey = this._getFullKey(key);
        const value = fetchedData[key];
        
        if (value !== undefined && value !== null) {
          this.cache.set(fullKey, value, ttl);
          result[key] = value;
          this._log(`数据存入缓存: ${fullKey}`);
        }
      }
      
      return result;
    } catch (error) {
      this._log(`批量数据获取错误: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * 移除缓存项
   * @param {string} key 缓存键
   */
  invalidate(key) {
    const fullKey = this._getFullKey(key);
    this.cache.delete(fullKey);
    this._log(`缓存项已失效: ${fullKey}`);
  }

  /**
   * 批量移除缓存项
   * @param {Array<string>} keys 缓存键数组
   */
  invalidateMany(keys) {
    for (const key of keys) {
      this.invalidate(key);
    }
  }

  /**
   * 使用模式匹配移除缓存项
   * @param {string} pattern 匹配模式(前缀)
   */
  invalidatePattern(pattern) {
    const prefix = this._getFullKey(pattern);
    let count = 0;
    
    // 注意：这个实现依赖于能够迭代缓存键的能力
    // 对于某些缓存库可能需要调整
    if (this.cache instanceof Map || this.cache.keys) {
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
          count++;
        }
      }
    }
    
    this._log(`模式失效: ${prefix}, 移除了${count}个缓存项`);
  }
}

// 用法示例
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000 });
const userCache = new CacheWrapper(cache, { 
  keyPrefix: 'user', 
  logging: true 
});

// 数据获取函数
async function fetchUserFromDatabase(id) {
  // 模拟数据库查询
  return { id, name: '张三', email: 'zhangsan@example.com' };
}

// 使用缓存包装器获取数据
async function getUser(id) {
  return await userCache.getOrFetch(
    id, 
    () => fetchUserFromDatabase(id),
    { ttl: 1000 * 60 * 30 } // 30分钟过期
  );
}

// 调用示例
getUser('1001').then(user => {
  console.log('获取到的用户:', user);
});

// 第二次调用将使用缓存
setTimeout(() => {
  getUser('1001').then(user => {
    console.log('再次获取用户(来自缓存):', user);
  });
}, 1000);

// 失效缓存
setTimeout(() => {
  userCache.invalidate('1001');
  console.log('用户缓存已失效');
}, 2000);
```

## 分布式缓存与Redis集成

分布式缓存适用于多实例、集群环境，可实现跨服务共享缓存数据。Redis是最常用的分布式缓存解决方案，性能优异且功能丰富。

### Redis基础集成

使用`ioredis`库实现Redis缓存集成：

```js
/**
 * Redis缓存服务
 * @module redisCacheService
 */
const Redis = require('ioredis');

class RedisCache {
  /**
   * 构造函数 
   * @param {Object} config Redis配置
   */
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || null,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'app:',
      reconnectOnError: true,
      ...config
    };
    
    // 创建Redis客户端
    this.client = new Redis(this.config);
    
    // 设置错误处理
    this.client.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });
    
    this.client.on('connect', () => {
      console.log('Redis连接成功');
    });
  }

  /**
   * 获取缓存数据
   * @param {string} key 缓存键
   * @returns {Promise<any>} 缓存数据
   */
  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis获取数据错误 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} ttl 过期时间(秒)
   * @returns {Promise<boolean>} 操作是否成功
   */
  async set(key, value, ttl = 0) {
    try {
      const stringValue = JSON.stringify(value);
      
      if (ttl > 0) {
        await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        await this.client.set(key, stringValue);
      }
      
      return true;
    } catch (error) {
      console.error(`Redis设置数据错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 删除缓存数据
   * @param {string} key 缓存键
   * @returns {Promise<boolean>} 操作是否成功
   */
  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis删除数据错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key 缓存键
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis检查键错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 设置过期时间
   * @param {string} key 缓存键
   * @param {number} seconds 过期秒数
   * @returns {Promise<boolean>} 操作是否成功
   */
  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Redis设置过期错误 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取键的剩余生存时间(秒)
   * @param {string} key 缓存键
   * @returns {Promise<number>} 剩余秒数，-1表示永不过期，-2表示键不存在
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis获取TTL错误 [${key}]:`, error);
      return -2;
    }
  }
}

// 用法示例
const redisCache = new RedisCache({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'myapp:'
});

// 使用Redis缓存用户数据
async function cacheUserExample() {
  // 设置数据，30分钟过期
  await redisCache.set('user:1001', { name: '张三', role: 'admin' }, 1800);
  
  // 获取数据
  const userData = await redisCache.get('user:1001');
  console.log('用户数据:', userData);
  
  // 检查TTL
  const ttl = await redisCache.ttl('user:1001');
  console.log(`过期时间: ${ttl}秒`);
}

cacheUserExample();
```

### 高级Redis缓存策略

Redis不仅可以作为简单的键值存储，还可以利用其丰富的数据结构和功能实现更复杂的缓存策略：

```js
/**
 * 高级Redis缓存管理器
 */
class AdvancedRedisCache {
  /**
   * 构造函数
   * @param {Object} config Redis配置
   */
  constructor(config = {}) {
    this.redis = new Redis(config);
    this.keyPrefix = config.keyPrefix || 'cache:';
  }

  /**
   * 获取完整键名
   * @param {string} key 原始键名
   * @returns {string} 带前缀的键名
   */
  _getKey(key) {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * 使用哈希结构存储对象字段
   * @param {string} key 缓存键
   * @param {Object} data 要存储的对象
   * @param {number} ttl 过期时间(秒)
   */
  async hashSet(key, data, ttl = 0) {
    const fullKey = this._getKey(key);
    const pipeline = this.redis.pipeline();
    
    // 存储为哈希结构
    for (const [field, value] of Object.entries(data)) {
      pipeline.hset(fullKey, field, typeof value === 'object' ? 
        JSON.stringify(value) : String(value));
    }
    
    // 设置过期时间(如有)
    if (ttl > 0) {
      pipeline.expire(fullKey, ttl);
    }
    
    return await pipeline.exec();
  }

  /**
   * 获取哈希结构的所有字段
   * @param {string} key 缓存键
   * @returns {Promise<Object>} 对象数据
   */
  async hashGetAll(key) {
    const fullKey = this._getKey(key);
    const data = await this.redis.hgetall(fullKey);
    
    // 尝试将JSON字符串解析回对象
    const result = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value);
      } catch (e) {
        result[field] = value;
      }
    }
    
    return result;
  }

  /**
   * 获取哈希结构的特定字段
   * @param {string} key 缓存键
   * @param {string} field 字段名
   * @returns {Promise<any>} 字段值
   */
  async hashGet(key, field) {
    const fullKey = this._getKey(key);
    const value = await this.redis.hget(fullKey, field);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  /**
   * 使用有序集合实现排行榜
   * @param {string} key 排行榜名称
   * @param {string} member 成员名称
   * @param {number} score 分数
   */
  async leaderboardAdd(key, member, score) {
    const fullKey = this._getKey(key);
    return await this.redis.zadd(fullKey, score, member);
  }

  /**
   * 获取排行榜前N名
   * @param {string} key 排行榜名称
   * @param {number} count 获取数量
   * @returns {Promise<Array>} 排行榜数据
   */
  async getTopLeaderboard(key, count = 10) {
    const fullKey = this._getKey(key);
    // 按分数从高到低排序
    return await this.redis.zrevrange(fullKey, 0, count - 1, 'WITHSCORES');
  }

  /**
   * 使用列表实现最近访问记录
   * @param {string} key 列表名称
   * @param {string} item 项目值
   * @param {number} maxItems 最大项目数
   */
  async addToRecentList(key, item, maxItems = 10) {
    const fullKey = this._getKey(key);
    const pipeline = this.redis.pipeline();
    
    // 将项目添加到列表头部
    pipeline.lpush(fullKey, JSON.stringify(item));
    // 保持列表长度不超过maxItems
    pipeline.ltrim(fullKey, 0, maxItems - 1);
    
    return await pipeline.exec();
  }

  /**
   * 获取最近列表
   * @param {string} key 列表名称
   * @param {number} count 获取数量
   * @returns {Promise<Array>} 列表数据
   */
  async getRecentList(key, count = 10) {
    const fullKey = this._getKey(key);
    const items = await this.redis.lrange(fullKey, 0, count - 1);
    
    return items.map(item => {
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    });
  }

  /**
   * 使用位图实现用户在线状态跟踪
   * @param {string} key 位图键名
   * @param {number} userId 用户ID
   * @param {boolean} online 是否在线
   */
  async setUserOnlineStatus(key, userId, online) {
    const fullKey = this._getKey(key);
    return await this.redis.setbit(fullKey, userId, online ? 1 : 0);
  }

  /**
   * 检查用户在线状态
   * @param {string} key 位图键名
   * @param {number} userId 用户ID
   * @returns {Promise<boolean>} 是否在线
   */
  async isUserOnline(key, userId) {
    const fullKey = this._getKey(key);
    const result = await this.redis.getbit(fullKey, userId);
    return result === 1;
  }

  /**
   * 计算在线用户数量
   * @param {string} key 位图键名
   * @returns {Promise<number>} 在线用户数
   */
  async countOnlineUsers(key) {
    const fullKey = this._getKey(key);
    return await this.redis.bitcount(fullKey);
  }
}

// 用法示例
const advancedCache = new AdvancedRedisCache({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'app:'
});

// 使用哈希存储用户资料
advancedCache.hashSet('user:profile:1001', {
  name: '张三',
  email: 'zhangsan@example.com',
  preferences: { theme: 'dark', notifications: true }
}, 3600);

// 查询用户设置
advancedCache.hashGet('user:profile:1001', 'preferences')
  .then(prefs => console.log('用户偏好设置:', prefs));

// 添加积分到排行榜
advancedCache.leaderboardAdd('game:scores', 'player1', 1250);
advancedCache.leaderboardAdd('game:scores', 'player2', 1800);
advancedCache.leaderboardAdd('game:scores', 'player3', 950);

// 获取排行榜
advancedCache.getTopLeaderboard('game:scores', 10)
  .then(leaderboard => console.log('排行榜:', leaderboard));

// 记录最近访问的商品
advancedCache.addToRecentList('user:1001:recent_products', { id: 'p123', name: '智能手表' });

// 获取最近访问列表
advancedCache.getRecentList('user:1001:recent_products')
  .then(items => console.log('最近访问:', items));

// 设置用户在线状态
advancedCache.setUserOnlineStatus('users:online:today', 1001, true);

// 检查用户是否在线
advancedCache.isUserOnline('users:online:today', 1001)
  .then(isOnline => console.log('用户1001是否在线:', isOnline));
```

### Redis集群与哨兵模式

在高可用环境中，可以使用Redis集群或哨兵模式提高缓存服务的可靠性：

```js
/**
 * Redis高可用缓存客户端
 */
class HighAvailabilityRedisCache {
  /**
   * 构造函数
   * @param {string} mode 模式: 'sentinel'或'cluster'
   * @param {Object} config 配置
   */
  constructor(mode = 'sentinel', config = {}) {
    this.mode = mode;
    
    if (mode === 'sentinel') {
      // 哨兵模式配置
      this.client = new Redis({
        sentinels: config.sentinels || [
          { host: 'sentinel-1', port: 26379 },
          { host: 'sentinel-2', port: 26379 },
          { host: 'sentinel-3', port: 26379 }
        ],
        name: config.name || 'mymaster',
        password: config.password,
        db: config.db || 0,
        keyPrefix: config.keyPrefix || '',
        sentinelPassword: config.sentinelPassword
      });
    } else if (mode === 'cluster') {
      // 集群模式配置
      this.client = new Redis.Cluster(
        config.nodes || [
          { host: 'redis-1', port: 6379 },
          { host: 'redis-2', port: 6379 },
          { host: 'redis-3', port: 6379 }
        ],
        {
          redisOptions: {
            password: config.password
          },
          scaleReads: config.scaleReads || 'all', // 读取策略: all, master, slave
          clusterRetryStrategy: (times) => Math.min(times * 100, 3000), // 重试策略
          ...config.options
        }
      );
    } else {
      throw new Error(`不支持的Redis模式: ${mode}`);
    }
    
    // 事件监听
    this.client.on('error', (err) => {
      console.error(`Redis ${mode} 错误:`, err);
    });
    
    this.client.on('connect', () => {
      console.log(`Redis ${mode} 连接成功`);
    });
    
    if (mode === 'cluster') {
      this.client.on('node error', (err, node) => {
        console.error(`Redis集群节点 ${node.options.host}:${node.options.port} 错误:`, err);
      });
    }
  }

  /**
   * 设置缓存
   * @param {string} key 键
   * @param {any} value 值
   * @param {number} ttl 过期时间(秒)
   */
  async set(key, value, ttl = 0) {
    try {
      const stringValue = JSON.stringify(value);
      
      if (ttl > 0) {
        return await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        return await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Redis ${this.mode} 设置错误:`, error);
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param {string} key 键
   * @returns {Promise<any>} 缓存值
   */
  async get(key) {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`Redis ${this.mode} 获取错误:`, error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param {string} key 键
   */
  async delete(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Redis ${this.mode} 删除错误:`, error);
      throw error;
    }
  }

  /**
   * 获取客户端状态信息
   */
  async getStatus() {
    if (this.mode === 'cluster') {
      return await this.client.cluster('info');
    } else {
      return await this.client.info();
    }
  }

  /**
   * 关闭连接
   */
  async close() {
    try {
      await this.client.quit();
      console.log(`Redis ${this.mode} 连接已关闭`);
    } catch (error) {
      console.error(`Redis ${this.mode} 关闭错误:`, error);
    }
  }
}

// 用法示例 - 哨兵模式
const sentinelCache = new HighAvailabilityRedisCache('sentinel', {
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 }
  ],
  name: 'mymaster',
  password: 'secret'
});

// 用法示例 - 集群模式
const clusterCache = new HighAvailabilityRedisCache('cluster', {
  nodes: [
    { host: 'redis-cluster-1', port: 6379 },
    { host: 'redis-cluster-2', port: 6379 },
    { host: 'redis-cluster-3', port: 6379 }
  ],
  options: {
    scaleReads: 'slave' // 读取优先从从节点获取
  }
});

// 使用方式相同
async function testHACache() {
  await sentinelCache.set('test-key', { value: 'test-data' }, 300);
  const data = await sentinelCache.get('test-key');
  console.log('从哨兵模式获取:', data);
}
```

## 缓存失效与一致性策略

缓存虽然能提升性能，但也带来了数据一致性的挑战。缓存数据与数据源可能产生不一致，需要采用合适的策略确保数据有效性。

### 缓存过期策略

```js
/**
 * 缓存过期策略管理器
 */
class CacheExpirationManager {
  /**
   * 构造函数
   * @param {Object} cache 缓存实例
   */
  constructor(cache) {
    this.cache = cache;
    this.expirationTimes = new Map(); // 存储手动设置的过期时间
  }

  /**
   * 设置项目，带过期时间
   * @param {string} key 键
   * @param {any} value 值
   * @param {Object} options 选项
   */
  set(key, value, options = {}) {
    // 支持的过期策略
    const {
      ttl = 0,              // 简单过期时间(毫秒)
      slidingExpiration = false,  // 是否使用滑动过期
      absoluteExpiration = null,  // 绝对过期时间(Date对象)
      dependsOn = []        // 依赖的其他键(级联过期)
    } = options;
    
    // 存储值到缓存
    this.cache.set(key, {
      value,
      created: Date.now(),
      lastAccessed: Date.now(),
      dependsOn
    });
    
    // 记录过期信息
    if (ttl > 0 || absoluteExpiration) {
      this.expirationTimes.set(key, {
        ttl,
        slidingExpiration,
        absoluteExpiration: absoluteExpiration ? absoluteExpiration.getTime() : null
      });
    }
    
    return true;
  }

  /**
   * 获取项目，考虑过期规则
   * @param {string} key 键
   * @returns {any} 值或null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (this.isExpired(key, item)) {
      this.remove(key);
      return null;
    }
    
    // 更新最后访问时间(用于滑动过期)
    if (this.expirationTimes.has(key) && this.expirationTimes.get(key).slidingExpiration) {
      item.lastAccessed = Date.now();
      this.cache.set(key, item);
    }
    
    return item.value;
  }

  /**
   * 检查项目是否过期
   * @param {string} key 键
   * @param {Object} item 缓存项
   * @returns {boolean} 是否过期
   */
  isExpired(key, item) {
    if (!this.expirationTimes.has(key)) return false;
    
    const expInfo = this.expirationTimes.get(key);
    const now = Date.now();
    
    // 检查绝对过期时间
    if (expInfo.absoluteExpiration && now > expInfo.absoluteExpiration) {
      return true;
    }
    
    // 检查滑动过期时间
    if (expInfo.slidingExpiration && expInfo.ttl > 0) {
      return (now - item.lastAccessed) > expInfo.ttl;
    }
    
    // 检查标准TTL
    if (expInfo.ttl > 0 && !expInfo.slidingExpiration) {
      return (now - item.created) > expInfo.ttl;
    }
    
    return false;
  }

  /**
   * 移除缓存项及依赖关系
   * @param {string} key 键
   */
  remove(key) {
    const item = this.cache.get(key);
    if (!item) return;
    
    // 删除项目
    this.cache.delete(key);
    this.expirationTimes.delete(key);
    
    // 级联删除：查找依赖于此键的其他项
    for (const [otherKey, otherItem] of this.cache.entries()) {
      if (otherItem.dependsOn && otherItem.dependsOn.includes(key)) {
        this.remove(otherKey);
      }
    }
  }

  /**
   * 手动设置过期时间
   * @param {string} key 键
   * @param {number} ttl 毫秒数
   * @param {boolean} sliding 是否为滑动过期
   */
  setExpiration(key, ttl, sliding = false) {
    if (!this.cache.has(key)) return false;
    
    this.expirationTimes.set(key, {
      ttl,
      slidingExpiration: sliding,
      absoluteExpiration: null
    });
    
    return true;
  }

  /**
   * 清理所有过期项目
   * @returns {number} 清理的项目数
   */
  purgeExpired() {
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(key, item)) {
        this.remove(key);
        count++;
      }
    }
    
    return count;
  }
}

// 用法示例
const cache = new Map();
const expirationManager = new CacheExpirationManager(cache);

// 设置带有不同过期策略的缓存项
expirationManager.set('user:1', { name: '张三' }, { 
  ttl: 60 * 1000 // 60秒后过期
});

expirationManager.set('session:abc123', { userId: 1 }, { 
  slidingExpiration: true, 
  ttl: 30 * 60 * 1000 // 30分钟无活动后过期
});

expirationManager.set('derived:stats', { count: 42 }, { 
  dependsOn: ['user:1'] // 当user:1过期时，这个也会过期
});

// 使用滑动过期的项目
const session = expirationManager.get('session:abc123'); // 每次访问都会刷新过期时间

// 设置绝对过期时间(第二天零点)
const tomorrow = new Date();
tomorrow.setHours(24, 0, 0, 0);
expirationManager.set('dailyReport', { stats: '...' }, { 
  absoluteExpiration: tomorrow
});

// 定期清理过期项
setInterval(() => {
  const purged = expirationManager.purgeExpired();
  if (purged > 0) {
    console.log(`已清理${purged}个过期缓存项`);
  }
}, 60000); // 每分钟清理一次
```

### 缓存一致性策略

缓存与数据源的一致性是缓存系统的重要挑战，以下是几种常见的一致性策略：

```js
/**
 * 缓存一致性管理器
 */
class CacheConsistencyManager {
  /**
   * 构造函数
   * @param {Object} cache 缓存实例
   * @param {Object} options 配置选项
   */
  constructor(cache, options = {}) {
    this.cache = cache;
    this.options = {
      consistencyMode: options.consistencyMode || 'write-through',
      logUpdates: options.logUpdates || false,
      ...options
    };
    
    this.updateLog = [];
  }

  /**
   * 写入数据到缓存和数据源
   * @param {string} key 键
   * @param {any} value 值
   * @param {Function} dataSourceWriter 数据源写入函数
   */
  async write(key, value, dataSourceWriter) {
    switch (this.options.consistencyMode) {
      case 'write-through':
        // 先写数据源，再更新缓存
        await dataSourceWriter(key, value);
        this.cache.set(key, value);
        break;
        
      case 'write-behind':
        // 先写缓存，异步写数据源
        this.cache.set(key, value);
        this._logUpdate(key, value, dataSourceWriter);
        this._processWriteBehindQueue();
        break;
        
      case 'write-around':
        // 只写数据源，不更新缓存
        await dataSourceWriter(key, value);
        this.cache.delete(key); // 删除可能存在的旧缓存
        break;
        
      default:
        throw new Error(`不支持的一致性模式: ${this.options.consistencyMode}`);
    }
  }

  /**
   * 记录待处理的写操作
   * @param {string} key 键
   * @param {any} value 值
   * @param {Function} writer 写入函数
   */
  _logUpdate(key, value, writer) {
    if (this.options.logUpdates) {
      this.updateLog.push({
        key,
        value,
        writer,
        timestamp: Date.now(),
        processed: false
      });
    }
  }

  /**
   * 处理待写入队列(write-behind模式)
   */
  async _processWriteBehindQueue() {
    // 简单实现，实际可能需要批处理、重试等机制
    if (!this.options.logUpdates) return;
    
    const pendingUpdates = this.updateLog.filter(update => !update.processed);
    
    for (const update of pendingUpdates) {
      try {
        await update.writer(update.key, update.value);
        update.processed = true;
      } catch (error) {
        console.error(`写入数据源失败: ${update.key}`, error);
        // 实际应用中可能需要重试逻辑
      }
    }
  }

  /**
   * 使用读取时更新(Read-Through)策略获取数据
   * @param {string} key 键
   * @param {Function} dataSourceReader 数据源读取函数
   */
  async read(key, dataSourceReader) {
    // 尝试从缓存获取
    let value = this.cache.get(key);
    
    // 缓存未命中，从数据源获取
    if (value === undefined || value === null) {
      value = await dataSourceReader(key);
      
      // 如果数据源返回了值，更新缓存
      if (value !== undefined && value !== null) {
        this.cache.set(key, value);
      }
    }
    
    return value;
  }

  /**
   * 使用缓存键前缀实现分组失效
   * @param {string} prefix 键前缀
   */
  invalidateByPrefix(prefix) {
    // 注意：这需要能够遍历缓存键的能力
    if (this.cache instanceof Map || this.cache.keys) {
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 使用标签系统实现有选择的失效
   * @param {string} tag 标签
   */
  invalidateByTag(tag) {
    // 这个实现假设缓存项有tags属性
    if (this.cache instanceof Map) {
      for (const [key, value] of this.cache.entries()) {
        if (value && value.tags && value.tags.includes(tag)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 实现两阶段更新确保一致性
   * @param {string} key 键
   * @param {any} value 新值
   */
  async twoPhaseUpdate(key, value, dataSourceWriter) {
    // 第一阶段：标记缓存项为更新中
    const oldValue = this.cache.get(key);
    this.cache.set(key, { 
      value: oldValue ? oldValue.value : null, 
      updating: true,
      updated: Date.now()
    });
    
    try {
      // 第二阶段：更新数据源
      await dataSourceWriter(key, value);
      
      // 更新成功，更新缓存
      this.cache.set(key, {
        value,
        updating: false,
        updated: Date.now()
      });
      
      return true;
    } catch (error) {
      // 更新失败，恢复原值
      this.cache.set(key, {
        value: oldValue ? oldValue.value : null,
        updating: false,
        updated: Date.now(),
        updateFailed: true
      });
      
      throw error;
    }
  }
}

// 用法示例
const consistencyManager = new CacheConsistencyManager(new Map(), {
  consistencyMode: 'write-through',
  logUpdates: true
});

// 模拟数据源写入函数
async function writeToDatabase(key, value) {
  console.log(`写入数据库: ${key} = ${JSON.stringify(value)}`);
  // 实际中这里会是数据库操作
  return true;
}

// 模拟数据源读取函数
async function readFromDatabase(key) {
  console.log(`从数据库读取: ${key}`);
  // 实际中这里会是数据库查询
  return { id: key, name: '数据库中的值' };
}

// 使用Write-Through模式写入
consistencyManager.write('user:2', { name: '李四' }, writeToDatabase)
  .then(() => console.log('数据已写入'));

// 使用Read-Through模式读取
consistencyManager.read('user:3', readFromDatabase)
  .then(data => console.log('读取到数据:', data));

// 使用两阶段更新
consistencyManager.twoPhaseUpdate('user:4', { name: '王五' }, writeToDatabase)
  .then(() => console.log('两阶段更新完成'));
```

### 缓存同步与更新模式

在多服务或分布式环境中，缓存需要与其他实例保持同步：

```js
/**
 * 缓存同步管理器 - 处理分布式环境中的缓存同步
 */
class CacheSyncManager {
  /**
   * 构造函数
   * @param {Object} cache 本地缓存实例
   * @param {Object} pubsub 发布订阅客户端(如Redis)
   * @param {string} channel 同步通道名称
   */
  constructor(cache, pubsub, channel = 'cache:sync') {
    this.cache = cache;
    this.pubsub = pubsub;
    this.channel = channel;
    this.nodeId = `node-${Math.random().toString(36).substring(2, 10)}`;
    
    // 设置消息处理
    this._setupMessageHandling();
  }

  /**
   * 设置消息处理
   */
  _setupMessageHandling() {
    // 订阅同步通道
    this.pubsub.subscribe(this.channel);
    
    // 处理接收到的消息
    this.pubsub.on('message', (channel, message) => {
      if (channel !== this.channel) return;
      
      try {
        const syncMessage = JSON.parse(message);
        
        // 忽略自己发送的消息
        if (syncMessage.sender === this.nodeId) return;
        
        this._handleSyncMessage(syncMessage);
      } catch (error) {
        console.error('处理同步消息出错:', error);
      }
    });
  }

  /**
   * 处理同步消息
   * @param {Object} message 同步消息
   */
  _handleSyncMessage(message) {
    const { action, key, value, pattern, tag, sender, timestamp } = message;
    
    switch (action) {
      case 'set':
        console.log(`[${this.nodeId}] 收到set同步: ${key}`);
        this.cache.set(key, value);
        break;
        
      case 'delete':
        console.log(`[${this.nodeId}] 收到delete同步: ${key}`);
        this.cache.delete(key);
        break;
        
      case 'clear':
        console.log(`[${this.nodeId}] 收到clear同步`);
        this.cache.clear();
        break;
        
      case 'invalidate_pattern':
        console.log(`[${this.nodeId}] 收到pattern失效同步: ${pattern}`);
        this._invalidatePattern(pattern);
        break;
        
      case 'invalidate_tag':
        console.log(`[${this.nodeId}] 收到tag失效同步: ${tag}`);
        this._invalidateTag(tag);
        break;
    }
  }

  /**
   * 使用模式失效缓存
   * @param {string} pattern 键模式
   */
  _invalidatePattern(pattern) {
    // 这需要能够遍历缓存键的能力
    if (this.cache instanceof Map || this.cache.keys) {
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 使用标签失效缓存
   * @param {string} tag 标签
   */
  _invalidateTag(tag) {
    // 这个实现假设缓存项有tags属性
    if (this.cache instanceof Map) {
      for (const [key, value] of this.cache.entries()) {
        if (value && value.tags && value.tags.includes(tag)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * 设置缓存并同步
   * @param {string} key 键
   * @param {any} value 值
   * @param {Object} options 选项
   */
  set(key, value, options = {}) {
    // 本地更新
    this.cache.set(key, value);
    
    // 发布同步消息
    this._publishMessage({
      action: 'set',
      key,
      value,
      sender: this.nodeId,
      timestamp: Date.now(),
      tags: options.tags
    });
  }

  /**
   * 删除缓存并同步
   * @param {string} key 键
   */
  delete(key) {
    // 本地删除
    this.cache.delete(key);
    
    // 发布同步消息
    this._publishMessage({
      action: 'delete',
      key,
      sender: this.nodeId,
      timestamp: Date.now()
    });
  }

  /**
   * 清空缓存并同步
   */
  clear() {
    // 本地清空
    this.cache.clear();
    
    // 发布同步消息
    this._publishMessage({
      action: 'clear',
      sender: this.nodeId,
      timestamp: Date.now()
    });
  }

  /**
   * 使用模式失效所有匹配的缓存
   * @param {string} pattern 键模式
   */
  invalidatePattern(pattern) {
    // 本地失效
    this._invalidatePattern(pattern);
    
    // 发布同步消息
    this._publishMessage({
      action: 'invalidate_pattern',
      pattern,
      sender: this.nodeId,
      timestamp: Date.now()
    });
  }

  /**
   * 使用标签失效缓存
   * @param {string} tag 标签
   */
  invalidateTag(tag) {
    // 本地失效
    this._invalidateTag(tag);
    
    // 发布同步消息
    this._publishMessage({
      action: 'invalidate_tag',
      tag,
      sender: this.nodeId,
      timestamp: Date.now()
    });
  }

  /**
   * 发布同步消息
   * @param {Object} message 消息对象
   */
  _publishMessage(message) {
    try {
      const messageString = JSON.stringify(message);
      this.pubsub.publish(this.channel, messageString);
    } catch (error) {
      console.error('发布同步消息失败:', error);
    }
  }
}

// 用法示例 (需要Redis或其他发布订阅机制)
const Redis = require('ioredis');
const localCache = new Map();

// 创建Redis客户端用于发布订阅
const pubsub = new Redis();

// 创建同步管理器
const syncManager = new CacheSyncManager(localCache, pubsub, 'app:cache:sync');

// 使用同步管理器操作缓存
syncManager.set('user:5', { name: '赵六', tags: ['user', 'active'] }, { 
  tags: ['user', 'active'] 
});

// 失效所有用户缓存
syncManager.invalidatePattern('user:');

// 失效所有带有'active'标签的缓存
syncManager.invalidateTag('active');
```

## 实战建议与最佳实践

合理的缓存策略能显著提升应用性能，但需要考虑数据一致性、内存消耗等因素。以下是一些实用的最佳实践：

### 缓存优化策略

```js
/**
 * 缓存最佳实践演示
 */
class CacheBestPractices {
  /**
   * 缓存预热 - 提前加载热点数据到缓存
   * @param {Object} cache 缓存实例
   * @param {Array<Function>} loaders 数据加载函数数组
   */
  static async warmupCache(cache, loaders) {
    console.log('开始缓存预热...');
    const startTime = Date.now();
    
    const results = await Promise.all(loaders.map(loader => loader()));
    
    let count = 0;
    for (const result of results) {
      if (Array.isArray(result)) {
        // 批量数据结果
        for (const { key, value, ttl } of result) {
          if (ttl) {
            cache.set(key, value, ttl);
          } else {
            cache.set(key, value);
          }
          count++;
        }
      } else if (result && result.key) {
        // 单个数据结果
        const { key, value, ttl } = result;
        if (ttl) {
          cache.set(key, value, ttl);
        } else {
          cache.set(key, value);
        }
        count++;
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`缓存预热完成: 加载了${count}个项目, 耗时${duration}ms`);
    return count;
  }

  /**
   * 防止缓存穿透 - 对空结果也进行缓存
   * @param {Object} cache 缓存实例
   * @param {string} key 缓存键
   * @param {Function} fetcher 数据获取函数
   * @param {Object} options 选项
   */
  static async guardAgainstCachePenetration(cache, key, fetcher, options = {}) {
    const {
      ttl = 60 * 1000,          // 正常数据缓存1分钟
      nullTtl = 30 * 1000,      // 空结果缓存30秒
      nullValue = null,         // 空结果的表示值
      logMisses = false         // 是否记录缓存未命中
    } = options;
    
    // 检查是否在缓存中(包括空值缓存)
    const cachedValue = cache.get(key);
    
    // 如果在缓存中，直接返回(可能是null)
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    if (logMisses) {
      console.log(`缓存未命中: ${key}`);
    }
    
    // 从数据源获取
    try {
      const result = await fetcher();
      
      // 数据存在，正常缓存
      if (result !== null && result !== undefined) {
        cache.set(key, result, ttl);
        return result;
      }
      
      // 数据不存在，缓存空值(防止穿透)
      cache.set(key, nullValue, nullTtl);
      return nullValue;
    } catch (error) {
      console.error(`获取数据错误: ${key}`, error);
      throw error;
    }
  }

  /**
   * 防止缓存雪崩 - 使用随机TTL
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} baseTtl 基础TTL(毫秒)
   * @param {number} variance TTL变化范围(0-1)
   */
  static setWithJitteredExpiration(cache, key, value, baseTtl, variance = 0.2) {
    // 计算一个在baseTtl基础上有随机偏差的TTL
    const minJitter = 1 - variance;
    const maxJitter = 1 + variance;
    const jitterMultiplier = minJitter + Math.random() * (maxJitter - minJitter);
    const ttl = Math.floor(baseTtl * jitterMultiplier);
    
    // 设置缓存
    return cache.set(key, value, ttl);
  }

  /**
   * 缓存降级 - 出错时返回旧数据
   * @param {Object} cache 缓存实例
   * @param {string} key 缓存键
   * @param {Function} fetcher 数据获取函数
   */
  static async cacheWithGracefulDegradation(cache, key, fetcher) {
    // 尝试从缓存获取(包括过期数据)
    let cachedItem = null;
    
    // 假设缓存项有value和metadata两部分
    try {
      cachedItem = cache.get(`${key}:full`);
    } catch (e) {
      console.error('缓存读取错误:', e);
    }
    
    try {
      // 尝试获取新数据
      const freshData = await fetcher();
      
      // 更新缓存
      cache.set(`${key}:full`, {
        value: freshData,
        metadata: {
          cached: Date.now(),
          fresh: true
        }
      });
      
      return freshData;
    } catch (error) {
      console.error(`获取新数据失败: ${key}`, error);
      
      // 如果有旧数据，降级使用旧数据
      if (cachedItem && cachedItem.value) {
        console.log(`降级使用缓存数据: ${key}`);
        
        // 标记数据为非新鲜
        if (cachedItem.metadata) {
          cachedItem.metadata.fresh = false;
          cachedItem.metadata.degraded = true;
          cache.set(`${key}:full`, cachedItem);
        }
        
        return cachedItem.value;
      }
      
      // 没有旧数据可用，抛出错误
      throw error;
    }
  }

  /**
   * 分层缓存访问模式 - 按顺序查询多个缓存层
   * @param {Array<Object>} cacheLayers 缓存层数组，从快到慢排序
   * @param {string} key 缓存键
   * @param {Function} fetcher 数据获取函数
   * @param {Object} options 选项
   */
  static async getFromTieredCache(cacheLayers, key, fetcher, options = {}) {
    const {
      ttlByLayer = [],  // 各层的TTL
      backfill = true   // 是否回填到所有缓存层
    } = options;
    
    // 1. 从各缓存层依次查找
    for (let i = 0; i < cacheLayers.length; i++) {
      const layer = cacheLayers[i];
      const value = await layer.get(key);
      
      if (value !== null && value !== undefined) {
        // 找到数据，如果不是最快的缓存层，回填到更快的层
        if (i > 0 && backfill) {
          // 回填到更快的缓存层
          for (let j = 0; j < i; j++) {
            const ttl = ttlByLayer[j] || 0;
            await cacheLayers[j].set(key, value, ttl);
          }
        }
        
        return value;
      }
    }
    
    // 2. 所有缓存层都未命中，从数据源获取
    const data = await fetcher();
    
    // 3. 将数据写入所有缓存层
    if (data !== null && data !== undefined) {
      for (let i = 0; i < cacheLayers.length; i++) {
        const ttl = ttlByLayer[i] || 0;
        await cacheLayers[i].set(key, data, ttl);
      }
    }
    
    return data;
  }
}

// 示例使用
const memoryCache = new Map();
const redisCache = new RedisClient();

// 1. 缓存预热
async function warmupDatabaseCache() {
  // 加载热门产品
  const loadHotProducts = async () => {
    const products = await db.query('SELECT * FROM products WHERE hot=1');
    return products.map(p => ({
      key: `product:${p.id}`,
      value: p,
      ttl: 3600000 // 1小时
    }));
  };
  
  // 加载系统配置
  const loadConfig = async () => {
    const config = await db.query('SELECT * FROM system_config');
    return {
      key: 'system:config',
      value: config,
      ttl: 86400000 // 24小时
    };
  };
  
  // 执行预热
  await CacheBestPractices.warmupCache(redisCache, [
    loadHotProducts,
    loadConfig
  ]);
}

// 2. 防止缓存穿透
async function getUser(userId) {
  return CacheBestPractices.guardAgainstCachePenetration(
    redisCache,
    `user:${userId}`,
    async () => {
      // 从数据库查询用户
      return await db.findUserById(userId);
    },
    {
      ttl: 1800000,      // 正常用户缓存30分钟
      nullTtl: 300000,   // 不存在的用户缓存5分钟
      logMisses: true
    }
  );
}

// 3. 防止缓存雪崩
function cacheSearchResults(query, results) {
  // 使用带抖动的过期时间，防止同时过期
  CacheBestPractices.setWithJitteredExpiration(
    redisCache,
    `search:${query}`,
    results,
    600000,        // 基础缓存时间10分钟
    0.15           // 上下15%的随机波动
  );
}
```

### 缓存监控与性能评估

有效监控缓存性能对于优化和维护至关重要：

```js
/**
 * 缓存监控与分析工具
 */
class CacheMonitoring {
  /**
   * 构造函数
   * @param {Object} cache 缓存实例
   * @param {string} cacheName 缓存名称
   */
  constructor(cache, cacheName = 'default') {
    this.cache = cache;
    this.cacheName = cacheName;
    
    // 监控指标
    this.metrics = {
      gets: 0,
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    
    // 响应时间记录
    this.latencies = {
      get: [],
      set: [],
      delete: []
    };
    
    // 最大延迟样本数
    this.maxLatencySamples = 100;
    
    // 监控开始时间
    this.startTime = Date.now();
  }

  /**
   * 包装缓存操作并收集指标
   */
  wrapCache() {
    const self = this;
    const originalGet = this.cache.get;
    const originalSet = this.cache.set;
    const originalDelete = this.cache.delete;
    
    // 包装get方法
    this.cache.get = async function(key) {
      const start = Date.now();
      self.metrics.gets++;
      
      try {
        const value = await originalGet.call(this, key);
        const duration = Date.now() - start;
        
        // 记录延迟
        self._recordLatency('get', duration);
        
        // 记录命中/未命中
        if (value === undefined || value === null) {
          self.metrics.misses++;
        } else {
          self.metrics.hits++;
        }
        
        return value;
      } catch (error) {
        self.metrics.errors++;
        throw error;
      }
    };
    
    // 包装set方法
    this.cache.set = async function(key, value, ttl) {
      const start = Date.now();
      self.metrics.sets++;
      
      try {
        const result = await originalSet.call(this, key, value, ttl);
        const duration = Date.now() - start;
        self._recordLatency('set', duration);
        return result;
      } catch (error) {
        self.metrics.errors++;
        throw error;
      }
    };
    
    // 包装delete方法
    this.cache.delete = async function(key) {
      const start = Date.now();
      self.metrics.deletes++;
      
      try {
        const result = await originalDelete.call(this, key);
        const duration = Date.now() - start;
        self._recordLatency('delete', duration);
        return result;
      } catch (error) {
        self.metrics.errors++;
        throw error;
      }
    };
    
    return this.cache;
  }

  /**
   * 记录延迟
   * @param {string} operation 操作类型
   * @param {number} duration 持续时间(毫秒)
   */
  _recordLatency(operation, duration) {
    const latencies = this.latencies[operation];
    latencies.push(duration);
    
    // 限制样本数量
    if (latencies.length > this.maxLatencySamples) {
      latencies.shift();
    }
  }

  /**
   * 获取缓存命中率
   * @returns {number} 命中率(0-100)
   */
  getHitRate() {
    const { hits, gets } = this.metrics;
    if (gets === 0) return 0;
    return (hits / gets) * 100;
  }

  /**
   * 获取平均延迟
   * @param {string} operation 操作类型
   * @returns {number} 平均延迟(毫秒)
   */
  getAverageLatency(operation) {
    const latencies = this.latencies[operation];
    if (latencies.length === 0) return 0;
    
    const sum = latencies.reduce((a, b) => a + b, 0);
    return sum / latencies.length;
  }

  /**
   * 生成性能报告
   * @returns {Object} 性能报告对象
   */
  generateReport() {
    const uptime = Date.now() - this.startTime;
    const hitRate = this.getHitRate();
    
    return {
      cacheName: this.cacheName,
      uptime: `${(uptime / 1000 / 60).toFixed(2)} 分钟`,
      metrics: {
        ...this.metrics,
        hitRate: `${hitRate.toFixed(2)}%`
      },
      averageLatencies: {
        get: `${this.getAverageLatency('get').toFixed(2)}ms`,
        set: `${this.getAverageLatency('set').toFixed(2)}ms`,
        delete: `${this.getAverageLatency('delete').toFixed(2)}ms`
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 性能健康检查
   * @returns {Object} 健康状态评估
   */
  healthCheck() {
    const hitRate = this.getHitRate();
    const getLatency = this.getAverageLatency('get');
    
    // 评估缓存健康状况
    const health = {
      status: 'healthy',
      issues: []
    };
    
    // 命中率检查
    if (hitRate < 50) {
      health.status = 'warning';
      health.issues.push({
        type: 'low_hit_rate',
        message: `低命中率 (${hitRate.toFixed(2)}%), 建议检查缓存策略`
      });
    }
    
    // 延迟检查
    if (getLatency > 10) { // 假设10ms是可接受的最大延迟
      health.status = health.status === 'warning' ? 'critical' : 'warning';
      health.issues.push({
        type: 'high_latency',
        message: `高延迟 (${getLatency.toFixed(2)}ms), 建议检查缓存实现`
      });
    }
    
    // 错误率检查
    const errorRate = (this.metrics.errors / 
                      (this.metrics.gets + this.metrics.sets + this.metrics.deletes)) * 100;
    if (errorRate > 1) { // 错误率超过1%
      health.status = 'critical';
      health.issues.push({
        type: 'high_error_rate',
        message: `高错误率 (${errorRate.toFixed(2)}%), 建议检查缓存连接`
      });
    }
    
    return health;
  }
}
```

### 缓存使用的最佳实践总结

1. **缓存设计原则**
   - 为热点数据建立缓存，非热点数据直接查询数据源
   - 根据数据更新频率设置合理的TTL
   - 避免缓存过大对象，可能导致序列化/反序列化开销大于收益

2. **常见陷阱与解决方案**
   - 缓存穿透：对空结果也进行缓存
   - 缓存雪崩：使用随机过期时间
   - 缓存击穿：对热点数据使用互斥锁或提前刷新

3. **缓存一致性考量**
   - 对一致性要求高的场景，使用较短TTL或主动失效机制
   - 考虑使用Write-Through或Cache-Aside模式
   - 使用版本号或时间戳解决竞态条件

4. **性能优化技巧**
   - 使用压缩算法减少缓存占用空间
   - 考虑使用二级缓存策略(内存+Redis)
   - 定期分析缓存命中率和使用模式，调整缓存策略

5. **部署与运维**
   - 确保缓存节点有足够内存
   - 设置监控和告警机制
   - 定期备份重要缓存数据
   - 考虑使用Redis集群或哨兵模式提高可用性

### 参考资源

- [Redis官方文档](https://redis.io/documentation)
- [Node-Cache库](https://github.com/node-cache/node-cache)
- [LRU-Cache库](https://github.com/isaacs/node-lru-cache)
- [ioredis库](https://github.com/luin/ioredis)
- [缓存设计模式](https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/)

## 总结

通过本文的学习，你已经掌握了Node.js中实现各种缓存策略的方法，从简单的本地内存缓存到复杂的分布式缓存系统。合理使用缓存可以显著提升应用性能、减轻数据库负载并改善用户体验。

关键是要根据应用特性选择合适的缓存策略，并注意平衡性能与数据一致性。缓存虽然强大，但不当使用可能导致数据不一致甚至系统故障，因此必须遵循最佳实践并持续监控缓存性能。

---

> 参考资料：[Node.js缓存最佳实践](https://nodejs.org/en/knowledge/HTTP/servers/how-to-cache/) 