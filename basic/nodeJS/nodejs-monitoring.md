---
layout: doc
title: Node.js应用监控与性能分析
description: 全面解析Node.js应用的监控体系、性能分析工具、日志采集与告警实践，助你保障系统稳定与高可用。
---

# Node.js应用监控与性能分析

监控与性能分析是保障Node.js应用稳定、高可用的关键。本文将系统讲解Node.js应用的监控体系、性能分析工具、日志采集与告警实践。

## 目录

- [监控体系与指标设计](#监控体系与指标设计)
- [性能分析与瓶颈定位](#性能分析与瓶颈定位)
- [日志采集与可观测性](#日志采集与可观测性)
- [告警与自动化运维](#告警与自动化运维)
- [监控工具与平台](#监控工具与平台)
- [实战建议与最佳实践](#实战建议与最佳实践)

## 监控体系与指标设计

建立完善的监控体系是运维Node.js应用的基础，合理的指标设计可提供系统健康状态的全面视图：

### 关键监控指标

```js
/**
 * Node.js应用监控指标体系
 */
const monitoringMetrics = {
  // 系统级指标
  system: {
    cpu: {
      description: 'CPU使用率及负载',
      importance: 'critical',
      thresholds: {
        warning: '70%',
        critical: '85%'
      },
      collection: 'os-level metrics',
      source: 'process.cpuUsage() 或 OS 指标'
    },
    memory: {
      description: '内存使用情况',
      importance: 'critical',
      metrics: [
        'rss (常驻集大小)',
        'heapTotal (V8分配的总内存)',
        'heapUsed (V8实际使用的内存)',
        'external (绑定到V8管理的对象的C++内存)'
      ],
      thresholds: {
        warning: '70% 堆限制',
        critical: '85% 堆限制'
      },
      source: 'process.memoryUsage()'
    },
    eventLoop: {
      description: '事件循环延迟',
      importance: 'critical',
      thresholds: {
        warning: '100ms',
        critical: '500ms'
      },
      source: 'node:perf_hooks 模块'
    },
    gc: {
      description: '垃圾回收指标',
      importance: 'high',
      metrics: [
        'gc频率',
        'gc停顿时间',
        'gc类型分布'
      ],
      source: '--trace-gc 或 perf_hooks'
    }
  },

  // 应用级指标
  application: {
    throughput: {
      description: '请求吞吐量',
      importance: 'critical',
      metrics: [
        'RPS (每秒请求数)',
        '请求速率变化'
      ],
      source: '应用中间件统计'
    },
    latency: {
      description: '响应时间',
      importance: 'critical',
      metrics: [
        '平均响应时间',
        'p50/p90/p95/p99响应时间',
        '尾部延迟'
      ],
      thresholds: {
        warning: 'p95 > 500ms',
        critical: 'p95 > 1000ms'
      },
      source: '请求处理中间件'
    },
    errorRate: {
      description: '错误率',
      importance: 'critical',
      metrics: [
        '5xx错误率',
        '4xx错误率',
        '未捕获异常数'
      ],
      thresholds: {
        warning: '1%',
        critical: '5%'
      },
      source: '错误处理中间件'
    },
    saturation: {
      description: '系统饱和度',
      importance: 'high',
      metrics: [
        '并发连接数',
        '请求队列长度',
        '线程池利用率'
      ],
      source: '自定义指标或系统监控'
    }
  },

  // 业务级指标
  business: {
    transactions: {
      description: '业务事务指标',
      importance: 'high',
      examples: [
        '登录成功率',
        '订单完成率',
        '支付转化率'
      ]
    },
    users: {
      description: '用户相关指标',
      importance: 'high',
      examples: [
        '活跃用户数',
        '并发用户数',
        '用户会话持续时间'
      ]
    },
    custom: {
      description: '自定义业务指标',
      importance: 'medium',
      examples: [
        '推荐系统点击率',
        '搜索结果质量分',
        '购物车放弃率'
      ]
    }
  },

  // 依赖服务指标
  dependencies: {
    database: {
      description: '数据库性能指标',
      importance: 'critical',
      metrics: [
        '查询响应时间',
        '连接池状态',
        '查询错误率',
        '死锁次数'
      ],
      source: '数据库驱动或ORM'
    },
    cache: {
      description: '缓存性能指标',
      importance: 'high',
      metrics: [
        '命中率',
        '延迟',
        '逐出率',
        '内存使用'
      ],
      source: '缓存客户端'
    },
    externalApi: {
      description: '外部API指标',
      importance: 'high',
      metrics: [
        '调用延迟',
        '错误率',
        '超时率'
      ],
      source: 'HTTP客户端装饰器'
    }
  }
};
```

### 指标收集与上报

```js
/**
 * 健康指标收集中间件
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
function metricsMiddleware(req, res, next) {
  // 记录请求开始时间
  const startTime = process.hrtime();
  
  // 记录请求计数
  incrementCounter('http_requests_total', {
    method: req.method,
    path: req.route?.path || req.path,
  });
  
  // 增加当前活跃请求计数
  incrementGauge('http_requests_active', 1, {
    method: req.method,
  });
  
  // 响应结束后记录指标
  res.on('finish', () => {
    // 计算响应时间
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
    
    // 记录响应时间直方图
    observeHistogram('http_request_duration_milliseconds', responseTimeMs, {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
    
    // 记录状态码
    incrementCounter('http_responses_total', {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
    
    // 减少活跃请求计数
    decrementGauge('http_requests_active', 1, {
      method: req.method,
    });
    
    // 记录响应大小
    const contentLength = res.getHeader('content-length');
    if (contentLength) {
      observeHistogram('http_response_size_bytes', parseInt(contentLength, 10), {
        method: req.method,
        path: req.route?.path || req.path,
      });
    }
  });
  
  // 处理请求异常
  const originalEnd = res.end;
  res.end = function() {
    res.end = originalEnd;
    return originalEnd.apply(this, arguments);
  };
  
  next();
}

/**
 * 系统资源指标收集器
 */
class SystemMetricsCollector {
  constructor(interval = 15000) {
    this.interval = interval;
    this.timer = null;
  }
  
  /**
   * 启动指标收集
   */
  start() {
    this.collectMetrics();
    this.timer = setInterval(() => this.collectMetrics(), this.interval);
    this.timer.unref(); // 不阻止进程退出
  }
  
  /**
   * 停止指标收集
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  /**
   * 收集系统指标
   */
  collectMetrics() {
    try {
      // 内存指标
      const memoryUsage = process.memoryUsage();
      setGauge('nodejs_memory_rss_bytes', memoryUsage.rss);
      setGauge('nodejs_memory_heap_total_bytes', memoryUsage.heapTotal);
      setGauge('nodejs_memory_heap_used_bytes', memoryUsage.heapUsed);
      setGauge('nodejs_memory_external_bytes', memoryUsage.external);
      
      // CPU指标
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const userCpuUsagePercent = endUsage.user / 1000 / 100;
        const systemCpuUsagePercent = endUsage.system / 1000 / 100;
        setGauge('nodejs_cpu_usage_user_percent', userCpuUsagePercent);
        setGauge('nodejs_cpu_usage_system_percent', systemCpuUsagePercent);
      }, 100);
      
      // 事件循环延迟指标
      const start = Date.now();
      setTimeout(() => {
        const delay = Date.now() - start;
        observeHistogram('nodejs_eventloop_lag_milliseconds', delay);
      }, 0);
      
      // 活跃句柄指标
      setGauge('nodejs_active_handles', process._getActiveHandles().length);
      setGauge('nodejs_active_requests', process._getActiveRequests().length);
      
      // 垃圾回收指标(如果有Node.js GC钩子)
      if (global.gc) {
        const gcStartHeap = process.memoryUsage().heapUsed;
        global.gc();
        const gcEndHeap = process.memoryUsage().heapUsed;
        setGauge('nodejs_gc_reclaimed_bytes', Math.max(0, gcStartHeap - gcEndHeap));
      }
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }
}

/**
 * 通过Prometheus格式导出指标
 * @param {Express} app Express应用实例
 */
function setupPrometheusExporter(app) {
  const prometheus = require('prom-client');
  
  // 创建指标注册表
  const register = new prometheus.Registry();
  prometheus.collectDefaultMetrics({ register });
  
  // 添加自定义指标
  const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_milliseconds',
    help: 'HTTP请求持续时间',
    labelNames: ['method', 'path', 'status'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
  });
  
  const httpRequestsTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'HTTP请求总数',
    labelNames: ['method', 'path']
  });
  
  const httpResponsesTotal = new prometheus.Counter({
    name: 'http_responses_total',
    help: 'HTTP响应总数',
    labelNames: ['method', 'path', 'status']
  });
  
  register.registerMetric(httpRequestDuration);
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(httpResponsesTotal);
  
  // 全局函数用于记录指标
  global.incrementCounter = (name, labels) => {
    const metric = register.getSingleMetric(name);
    if (metric) {
      metric.inc(labels);
    }
  };
  
  global.setGauge = (name, value, labels = {}) => {
    const metric = register.getSingleMetric(name);
    if (metric) {
      metric.set(labels, value);
    }
  };
  
  global.incrementGauge = (name, value, labels = {}) => {
    const metric = register.getSingleMetric(name);
    if (metric) {
      metric.inc(labels, value);
    }
  };
  
  global.decrementGauge = (name, value, labels = {}) => {
    const metric = register.getSingleMetric(name);
    if (metric) {
      metric.dec(labels, value);
    }
  };
  
  global.observeHistogram = (name, value, labels = {}) => {
    const metric = register.getSingleMetric(name);
    if (metric) {
      metric.observe(labels, value);
    }
  };
  
  // 提供Prometheus指标端点
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  
  // 启动系统指标收集
  const systemMetricsCollector = new SystemMetricsCollector();
  systemMetricsCollector.start();
  
  return {
    register,
    systemMetricsCollector,
    middleware: metricsMiddleware
  };
}
```

### 健康检查与就绪探针

```js
/**
 * 健康检查与就绪探针路由
 * @param {Express} app Express应用实例
 * @param {Object} dependencies 依赖服务列表
 */
function setupHealthChecks(app, dependencies = {}) {
  /**
   * 健康检查 - 简单检查服务是否在运行
   */
  app.get('/health', (req, res) => {
    // 简单的存活检查，只检查服务是否在运行
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });
  
  /**
   * 就绪探针 - 检查服务是否准备好处理请求
   */
  app.get('/ready', async (req, res) => {
    const checks = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    let isReady = true;
    
    // 检查数据库连接
    if (dependencies.database) {
      try {
        const startTime = Date.now();
        await dependencies.database.ping();
        const endTime = Date.now();
        
        checks.checks.database = {
          status: 'UP',
          responseTime: `${endTime - startTime}ms`
        };
      } catch (error) {
        isReady = false;
        checks.checks.database = {
          status: 'DOWN',
          error: error.message
        };
      }
    }
    
    // 检查缓存服务
    if (dependencies.cache) {
      try {
        const startTime = Date.now();
        await dependencies.cache.ping();
        const endTime = Date.now();
        
        checks.checks.cache = {
          status: 'UP',
          responseTime: `${endTime - startTime}ms`
        };
      } catch (error) {
        isReady = false;
        checks.checks.cache = {
          status: 'DOWN',
          error: error.message
        };
      }
    }
    
    // 检查消息队列
    if (dependencies.messageQueue) {
      try {
        const startTime = Date.now();
        await dependencies.messageQueue.checkConnection();
        const endTime = Date.now();
        
        checks.checks.messageQueue = {
          status: 'UP',
          responseTime: `${endTime - startTime}ms`
        };
      } catch (error) {
        isReady = false;
        checks.checks.messageQueue = {
          status: 'DOWN',
          error: error.message
        };
      }
    }
    
    // 检查文件系统
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const tempFile = path.join(process.cwd(), '.health-check-temp');
      
      await fs.writeFile(tempFile, 'health check');
      await fs.unlink(tempFile);
      
      checks.checks.fileSystem = {
        status: 'UP'
      };
    } catch (error) {
      isReady = false;
      checks.checks.fileSystem = {
        status: 'DOWN',
        error: error.message
      };
    }
    
    // 检查内存使用
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (heapUsedPercentage > 85) {
      isReady = false;
      checks.checks.memory = {
        status: 'DOWN',
        usage: `${heapUsedPercentage.toFixed(2)}%`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
      };
    } else {
      checks.checks.memory = {
        status: 'UP',
        usage: `${heapUsedPercentage.toFixed(2)}%`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
      };
    }
    
    // 总体状态
    if (!isReady) {
      checks.status = 'DOWN';
      return res.status(503).json(checks);
    }
    
    res.status(200).json(checks);
  });
  
  /**
   * 详细服务状态
   */
  app.get('/status', async (req, res) => {
    const readyResponse = await new Promise((resolve) => {
      app._router.handle(
        { method: 'GET', url: '/ready', headers: {} }, 
        { 
          json: (data) => resolve(data),
          status: () => ({ json: (data) => resolve(data) })
        }
      );
    });
    
    // 添加额外详细信息
    const status = {
      ...readyResponse,
      version: process.env.npm_package_version || '未知',
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV
    };
    
    res.status(readyResponse.status === 'UP' ? 200 : 503).json(status);
  });
}
```

## 性能分析与瓶颈定位

Node.js性能分析是优化应用的关键步骤，通过定位性能瓶颈，开发者能针对性地进行优化：

### CPU分析与火焰图

```js
/**
 * CPU分析工具集成
 * @param {Express} app Express应用实例
 */
function setupCpuProfiler(app) {
  const fs = require('fs');
  const path = require('path');
  const v8Profiler = require('v8-profiler-next');
  
  // 设置性能分析目录
  const profilesDir = path.join(process.cwd(), 'profiles');
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
  }
  
  /**
   * 启动CPU分析
   * @param {number} duration 采样持续时间(ms)
   * @returns {Promise<string>} 分析文件路径
   */
  async function startCpuProfiling(duration = 30000) {
    const timestamp = Date.now();
    const profileName = `cpu-profile-${timestamp}`;
    
    // 启动性能分析
    v8Profiler.startProfiling(profileName, true);
    
    // 设置定时器停止分析
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = v8Profiler.stopProfiling(profileName);
        
        const profileFilePath = path.join(profilesDir, `${profileName}.cpuprofile`);
        fs.writeFileSync(profileFilePath, JSON.stringify(profile));
        
        profile.delete(); // 释放内存
        
        resolve(profileFilePath);
      }, duration);
    });
  }
  
  // 添加性能分析API端点
  app.post('/debug/cpu-profile', async (req, res) => {
    try {
      const duration = parseInt(req.query.duration || '30000', 10);
      const profilePath = await startCpuProfiling(duration);
      
      res.json({
        success: true,
        message: `CPU profile saved to ${profilePath}`,
        path: profilePath,
        duration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return {
    startCpuProfiling
  };
}

/**
 * 生成火焰图
 * @param {string} cpuProfilePath CPU分析文件路径
 * @returns {Promise<string>} 火焰图HTML文件路径
 */
async function generateFlameGraph(cpuProfilePath) {
  const fs = require('fs');
  const path = require('path');
  const { promisify } = require('util');
  const exec = promisify(require('child_process').exec);
  
  // 假设已安装flamegraph工具
  try {
    const profilesDir = path.dirname(cpuProfilePath);
    const basename = path.basename(cpuProfilePath, '.cpuprofile');
    const outputPath = path.join(profilesDir, `${basename}.html`);
    
    // 使用0x或speedscope等工具转换为火焰图
    await exec(`npx 0x --visualize-only ${cpuProfilePath} -o ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Failed to generate flame graph:', error);
    throw error;
  }
}
```

### 内存分析与堆快照

```js
/**
 * 内存分析工具集成
 * @param {Express} app Express应用实例
 */
function setupMemoryProfiler(app) {
  const fs = require('fs');
  const path = require('path');
  const v8Profiler = require('v8-profiler-next');
  
  // 设置性能分析目录
  const profilesDir = path.join(process.cwd(), 'profiles');
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
  }
  
  /**
   * 生成堆快照
   * @param {string} [label] 快照标签
   * @returns {Promise<string>} 快照文件路径
   */
  async function takeHeapSnapshot(label = '') {
    const timestamp = Date.now();
    const snapshotName = `heap-snapshot-${label}-${timestamp}`;
    
    return new Promise((resolve, reject) => {
      try {
        const snapshot = v8Profiler.takeSnapshot(snapshotName);
        const snapshotFilePath = path.join(profilesDir, `${snapshotName}.heapsnapshot`);
        
        // 将快照写入文件
        const fileStream = fs.createWriteStream(snapshotFilePath);
        
        snapshot.export()
          .pipe(fileStream)
          .on('finish', () => {
            snapshot.delete(); // 释放内存
            resolve(snapshotFilePath);
          })
          .on('error', (err) => {
            snapshot.delete();
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 监控内存泄漏
   * @param {number} intervalMs 采样间隔(ms)
   * @param {number} samples 采样次数
   * @returns {Promise<string[]>} 快照文件路径数组
   */
  async function detectMemoryLeaks(intervalMs = 60000, samples = 3) {
    const snapshotPaths = [];
    
    // 执行初始垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    for (let i = 1; i <= samples; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      
      // 每次快照前执行GC
      if (global.gc) {
        global.gc();
      }
      
      const snapshotPath = await takeHeapSnapshot(`leak-detection-${i}`);
      snapshotPaths.push(snapshotPath);
    }
    
    return snapshotPaths;
  }
  
  // 添加内存分析API端点
  app.post('/debug/heap-snapshot', async (req, res) => {
    try {
      const label = req.query.label || '';
      const snapshotPath = await takeHeapSnapshot(label);
      
      res.json({
        success: true,
        message: `Heap snapshot saved to ${snapshotPath}`,
        path: snapshotPath
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  app.post('/debug/detect-memory-leaks', async (req, res) => {
    try {
      const intervalMs = parseInt(req.query.interval || '60000', 10);
      const samples = parseInt(req.query.samples || '3', 10);
      
      res.json({
        success: true,
        message: `Memory leak detection started. Taking ${samples} snapshots with ${intervalMs}ms intervals.`,
        intervalMs,
        samples
      });
      
      // 异步执行泄漏检测
      detectMemoryLeaks(intervalMs, samples)
        .then((snapshotPaths) => {
          console.log(`Memory leak detection completed. Snapshots saved at: ${snapshotPaths.join(', ')}`);
        })
        .catch((err) => {
          console.error('Memory leak detection failed:', err);
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return {
    takeHeapSnapshot,
    detectMemoryLeaks
  };
}

/**
 * 分析内存泄漏
 * @param {string[]} snapshotPaths 快照文件路径数组
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeMemoryLeaks(snapshotPaths) {
  const { compareSnapshots } = require('heapdump-analyzer');
  
  // 比较第一个和最后一个快照
  const firstSnapshot = snapshotPaths[0];
  const lastSnapshot = snapshotPaths[snapshotPaths.length - 1];
  
  const result = await compareSnapshots(firstSnapshot, lastSnapshot);
  
  return {
    leakCandidates: result.filter(item => 
      item.sizeDiff > 1000000 && // 大于1MB的增长
      item.countDiff > 100      // 对象数量增加超过100
    ),
    summary: {
      totalLeakSize: result.reduce((sum, item) => sum + Math.max(0, item.sizeDiff), 0),
      largestGrowth: result.reduce((max, item) => Math.max(max, item.sizeDiff), 0),
      objectTypes: [...new Set(result.map(item => item.type))],
      retainerPaths: result
        .filter(item => item.sizeDiff > 1000000)
        .map(item => item.retainers.slice(0, 3)) // 取前3个持有路径
    }
  };
}
```

### 事件循环和异步性能分析

```js
/**
 * 事件循环延迟监控器
 */
class EventLoopMonitor {
  constructor(options = {}) {
    this.sampleInterval = options.sampleInterval || 1000;
    this.historySize = options.historySize || 60;
    this.highLatencyThreshold = options.highLatencyThreshold || 100;
    
    this.metrics = {
      current: 0,
      min: Number.MAX_SAFE_INTEGER,
      max: 0,
      history: []
    };
    
    this.isRunning = false;
    this.timer = null;
  }
  
  /**
   * 启动监控
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.measure();
    
    this.timer = setInterval(() => this.measure(), this.sampleInterval);
    this.timer.unref(); // 不阻止进程退出
  }
  
  /**
   * 停止监控
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
  }
  
  /**
   * 测量事件循环延迟
   */
  measure() {
    const start = Date.now();
    
    setImmediate(() => {
      const latency = Date.now() - start;
      
      // 更新指标
      this.metrics.current = latency;
      this.metrics.min = Math.min(this.metrics.min, latency);
      this.metrics.max = Math.max(this.metrics.max, latency);
      
      // 添加到历史记录
      this.metrics.history.push(latency);
      if (this.metrics.history.length > this.historySize) {
        this.metrics.history.shift();
      }
      
      // 计算平均值和百分位数
      if (this.metrics.history.length > 0) {
        const sorted = [...this.metrics.history].sort((a, b) => a - b);
        this.metrics.avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
        this.metrics.median = sorted[Math.floor(sorted.length / 2)];
        this.metrics.p95 = sorted[Math.floor(sorted.length * 0.95)];
      }
      
      // 高延迟检测
      if (latency > this.highLatencyThreshold) {
        console.warn(`[EventLoopMonitor] High event loop latency detected: ${latency}ms`);
        this.captureHighLatency(latency);
      }
    });
  }
  
  /**
   * 记录高延迟事件的相关信息
   * @param {number} latency 延迟时间(ms)
   */
  captureHighLatency(latency) {
    // 捕获当前活跃的请求、连接等信息
    const snapshot = {
      timestamp: new Date().toISOString(),
      latency,
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // 可以将快照保存到日志或指标系统
    // 也可以触发堆快照或CPU分析
  }
  
  /**
   * 获取指标报告
   */
  getMetrics() {
    return {
      ...this.metrics,
      health: this.getHealth()
    };
  }
  
  /**
   * 获取事件循环健康状态
   */
  getHealth() {
    if (!this.metrics.p95) return 'unknown';
    
    if (this.metrics.p95 < 20) return 'excellent';
    if (this.metrics.p95 < 50) return 'good';
    if (this.metrics.p95 < 100) return 'fair';
    if (this.metrics.p95 < 200) return 'poor';
    return 'critical';
  }
}

/**
 * 异步操作追踪器
 */
class AsyncTracker {
  constructor() {
    this.operations = new Map();
    this.longestOperations = [];
    this.maxTracked = 20;
  }
  
  /**
   * 开始追踪操作
   * @param {string} name 操作名称
   * @param {Object} metadata 元数据
   * @returns {string} 操作ID
   */
  start(name, metadata = {}) {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.operations.set(id, {
      id,
      name,
      startTime: Date.now(),
      metadata
    });
    
    return id;
  }
  
  /**
   * 结束追踪操作
   * @param {string} id 操作ID
   * @param {Object} result 操作结果
   */
  end(id, result = {}) {
    const operation = this.operations.get(id);
    if (!operation) return;
    
    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    
    operation.endTime = endTime;
    operation.duration = duration;
    operation.result = result;
    
    this.operations.delete(id);
    
    // 保存长时间操作记录
    if (this.longestOperations.length < this.maxTracked || 
        duration > this.longestOperations[this.longestOperations.length - 1].duration) {
      
      this.longestOperations.push(operation);
      this.longestOperations.sort((a, b) => b.duration - a.duration);
      
      if (this.longestOperations.length > this.maxTracked) {
        this.longestOperations.pop();
      }
    }
    
    return operation;
  }
  
  /**
   * 获取当前正在进行的操作
   */
  getPendingOperations() {
    const now = Date.now();
    return Array.from(this.operations.values()).map(op => ({
      ...op,
      pendingTime: now - op.startTime
    }));
  }
  
  /**
   * 获取最长时间的操作
   */
  getLongestOperations() {
    return this.longestOperations;
  }
  
  /**
   * 装饰异步函数以进行跟踪
   * @param {Function} fn 目标函数
   * @param {string} name 操作名称
   * @returns {Function} 装饰后的函数
   */
  trackFunction(fn, name) {
    const tracker = this;
    
    return async function(...args) {
      const id = tracker.start(name, { args });
      
      try {
        const result = await fn.apply(this, args);
        tracker.end(id, { success: true });
        return result;
      } catch (error) {
        tracker.end(id, { success: false, error: error.message });
        throw error;
      }
    };
  }
}
```

### Node.js内置性能计时器

```js
/**
 * 性能计时API封装
 */
class PerformanceTimer {
  constructor() {
    this.perf = require('perf_hooks').performance;
    this.PerformanceObserver = require('perf_hooks').PerformanceObserver;
    
    // 启动性能观察者
    this.setupObserver();
  }
  
  /**
   * 设置性能观察者
   */
  setupObserver() {
    const obs = new this.PerformanceObserver((items) => {
      const entries = items.getEntries();
      
      for (const entry of entries) {
        if (entry.duration > 100) { // 记录超过100ms的操作
          console.log(`Slow operation detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    // 订阅所有类型的性能条目
    obs.observe({ entryTypes: ['measure'], buffered: true });
  }
  
  /**
   * 标记开始点
   * @param {string} name 标记名称
   */
  mark(name) {
    this.perf.mark(name);
  }
  
  /**
   * 测量两个标记点之间的性能
   * @param {string} name 测量名称
   * @param {string} startMark 开始标记
   * @param {string} endMark 结束标记
   * @returns {number} 持续时间(ms)
   */
  measure(name, startMark, endMark) {
    try {
      this.perf.measure(name, startMark, endMark);
      const entries = this.perf.getEntriesByName(name, 'measure');
      return entries.length > 0 ? entries[0].duration : 0;
    } catch (error) {
      console.error(`Error measuring ${name}:`, error);
      return 0;
    }
  }
  
  /**
   * 计时函数执行
   * @param {Function} fn 要计时的函数
   * @param {string} name 计时名称
   * @returns {*} 函数结果
   */
  timeFunction(fn, name) {
    const startMark = `${name}_start`;
    const endMark = `${name}_end`;
    
    this.mark(startMark);
    const result = fn();
    this.mark(endMark);
    
    const duration = this.measure(name, startMark, endMark);
    return { result, duration };
  }
  
  /**
   * 计时异步函数执行
   * @param {Function} fn 要计时的异步函数
   * @param {string} name 计时名称
   * @returns {Promise<*>} 函数结果
   */
  async timeAsync(fn, name) {
    const startMark = `${name}_start`;
    const endMark = `${name}_end`;
    
    this.mark(startMark);
    const result = await fn();
    this.mark(endMark);
    
    const duration = this.measure(name, startMark, endMark);
    return { result, duration };
  }
  
  /**
   * 清理特定名称的标记和测量
   * @param {string} name 名称前缀
   */
  clearMarks(name) {
    try {
      this.perf.clearMarks(`${name}_start`);
      this.perf.clearMarks(`${name}_end`);
      this.perf.clearMeasures(name);
    } catch (error) {
      // 忽略不存在的标记错误
    }
  }
  
  /**
   * 获取所有性能条目
   * @returns {PerformanceEntry[]} 性能条目数组
   */
  getAllEntries() {
    return this.perf.getEntries();
  }
}
```

### 集成Node.js应用检查器

```js
/**
 * Node.js应用诊断服务
 * @param {Express} app Express应用实例
 * @param {number} port 诊断服务端口
 */
function setupDiagnosticsServer(app, port = 9229) {
  // 检查是否已启用Inspector
  const inspector = require('inspector');
  let isInspectorEnabled = false;
  
  try {
    inspector.url();
    isInspectorEnabled = true;
  } catch (error) {
    // Inspector未启用
    isInspectorEnabled = false;
  }
  
  // 添加诊断API端点
  app.get('/debug/inspector-status', (req, res) => {
    res.json({
      isEnabled: isInspectorEnabled,
      url: isInspectorEnabled ? inspector.url() : null,
      nodeVersion: process.version,
      diagnosticsPort: port
    });
  });
  
  // 提供启动Inspector的指南
  app.get('/debug/inspector-guide', (req, res) => {
    if (isInspectorEnabled) {
      return res.json({
        status: 'enabled',
        message: 'Inspector已启用',
        url: inspector.url(),
        chromeDevToolsUrl: `chrome-devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=${inspector.url().replace('ws://', '')}`
      });
    }
    
    res.json({
      status: 'disabled',
      message: 'Inspector未启用',
      enableInstructions: [
        `重启Node.js进程并添加 --inspect=${port} 参数:`,
        `node --inspect=${port} yourapp.js`,
        '或者在运行中的进程中发送SIGUSR1信号:',
        `kill -USR1 ${process.pid}`
      ]
    });
  });
  
  // 添加更多诊断工具API端点
  if (isInspectorEnabled) {
    app.post('/debug/break-on-exception', (req, res) => {
      const enabled = req.query.enabled === 'true';
      
      try {
        const session = new inspector.Session();
        session.connect();
        
        session.post('Debugger.setPauseOnExceptions', {
          state: enabled ? 'all' : 'none'
        });
        
        session.disconnect();
        
        res.json({
          success: true,
          message: `断点${enabled ? '已' : '未'}设置在异常处`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
  
  return {
    isInspectorEnabled,
    inspectorUrl: isInspectorEnabled ? inspector.url() : null
  };
}
```

## 日志采集与可观测性

构建可观测性系统是监控Node.js应用的重要环节，合理的日志采集与追踪分析可以提高问题排查效率。

### 结构化日志系统

```js
/**
 * 结构化日志系统
 */
class StructuredLogger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'nodejs-app';
    this.serviceVersion = options.serviceVersion || process.env.npm_package_version || '1.0.0';
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    
    this.winston = require('winston');
    this.setupLogger(options);
  }
  
  /**
   * 配置日志记录器
   * @param {Object} options 配置选项
   */
  setupLogger(options) {
    // 标准格式
    const standardFormat = this.winston.format.combine(
      this.winston.format.timestamp(),
      this.winston.format.errors({ stack: true }),
      this.winston.format.json()
    );
    
    // 开发环境格式
    const developmentFormat = this.winston.format.combine(
      this.winston.format.timestamp(),
      this.winston.format.colorize(),
      this.winston.format.printf(({ level, message, timestamp, ...rest }) => {
        const meta = Object.keys(rest).length ? 
          `\n${JSON.stringify(rest, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${meta}`;
      })
    );
    
    // 默认的传输配置
    const transports = [
      new this.winston.transports.Console({
        level: this.environment === 'production' ? 'info' : 'debug',
        format: this.environment === 'development' ? developmentFormat : standardFormat
      })
    ];
    
    // 添加文件传输
    if (options.logToFile) {
      transports.push(
        new this.winston.transports.File({
          filename: options.errorLogPath || 'logs/error.log',
          level: 'error',
          format: standardFormat
        }),
        new this.winston.transports.File({
          filename: options.combinedLogPath || 'logs/combined.log',
          format: standardFormat
        })
      );
    }
    
    // 创建日志记录器
    this.logger = this.winston.createLogger({
      level: options.level || 'info',
      defaultMeta: {
        service: this.serviceName,
        version: this.serviceVersion,
        environment: this.environment
      },
      transports
    });
    
    // 添加插件
    if (options.plugins) {
      options.plugins.forEach(plugin => this.logger.add(plugin));
    }
  }
  
  /**
   * 添加请求上下文
   * @param {object} context 上下文信息
   * @returns {StructuredLogger} this实例
   */
  withContext(context) {
    // 创建子日志记录器，包含额外元数据
    const childLogger = this.logger.child(context);
    
    const logger = new StructuredLogger();
    logger.logger = childLogger;
    
    return logger;
  }
  
  /**
   * 记录信息日志
   * @param {string} message 日志消息
   * @param {Object} meta 元数据
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }
  
  /**
   * 记录警告日志
   * @param {string} message 日志消息
   * @param {Object} meta 元数据
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }
  
  /**
   * 记录错误日志
   * @param {string|Error} messageOrError 日志消息或错误对象
   * @param {Object} meta 元数据
   */
  error(messageOrError, meta = {}) {
    if (messageOrError instanceof Error) {
      const { message, name, stack, ...rest } = messageOrError;
      this.logger.error(message, {
        error_name: name,
        error_stack: stack,
        ...rest,
        ...meta
      });
    } else {
      this.logger.error(messageOrError, meta);
    }
  }
  
  /**
   * 记录调试日志
   * @param {string} message 日志消息
   * @param {Object} meta 元数据
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
  
  /**
   * 记录HTTP请求日志
   * @param {Request} req 请求对象
   * @param {Response} res 响应对象
   * @param {number} responseTime 响应时间(ms)
   */
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      response_time: responseTime,
      content_length: res.getHeader('content-length'),
      user_agent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      request_id: req.id || req.headers['x-request-id']
    };
    
    // 对于错误响应，记录更多信息
    if (res.statusCode >= 400) {
      meta.request_headers = req.headers;
      meta.request_body = req.body;
      meta.request_query = req.query;
      
      if (res.statusCode >= 500) {
        this.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`, meta);
      } else {
        this.warn(`HTTP ${res.statusCode} ${req.method} ${req.url}`, meta);
      }
    } else {
      this.info(`HTTP ${res.statusCode} ${req.method} ${req.url}`, meta);
    }
  }
  
  /**
   * 创建Express请求日志中间件
   * @returns {Function} Express中间件
   */
  expressMiddleware() {
    return (req, res, next) => {
      // 生成请求ID
      req.id = req.headers['x-request-id'] || 
               req.id || 
               `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 添加响应头
      res.setHeader('X-Request-ID', req.id);
      
      // 记录开始时间
      const start = Date.now();
      
      // 记录响应
      const originalEnd = res.end;
      res.end = function() {
        res.end = originalEnd;
        const result = originalEnd.apply(this, arguments);
        
        const responseTime = Date.now() - start;
        this.logRequest(req, res, responseTime);
        
        return result;
      }.bind(this);
      
      next();
    };
  }
}

/**
 * 配置日志系统
 * @param {Express} app Express应用实例
 */
function setupLogging(app) {
  // 创建日志目录
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // 创建结构化日志记录器
  const logger = new StructuredLogger({
    serviceName: 'my-nodejs-service',
    environment: process.env.NODE_ENV,
    logToFile: true,
    errorLogPath: path.join(logsDir, 'error.log'),
    combinedLogPath: path.join(logsDir, 'combined.log')
  });
  
  // 添加请求日志中间件
  app.use(logger.expressMiddleware());
  
  // 错误处理中间件
  app.use((err, req, res, next) => {
    logger.error(err, {
      method: req.method,
      url: req.originalUrl || req.url,
      request_id: req.id
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      request_id: req.id
    });
  });
  
  // 导出全局日志实例
  global.logger = logger;
  
  return logger;
}
```

### 分布式追踪与OpenTelemetry集成

```js
/**
 * 分布式追踪系统集成
 * @param {Express} app Express应用实例
 */
function setupDistributedTracing(app) {
  const opentelemetry = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
  const { Resource } = require('@opentelemetry/resources');
  const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
  
  // 配置采样器 - 生产环境可设置为基于概率的采样
  const samplingRatio = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;
  
  // 创建OpenTelemetry SDK
  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'my-nodejs-service',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
    }),
    traceExporter: new OTLPTraceExporter({
      // 配置导出器，连接到Jaeger、Zipkin或其他兼容OTLP的系统
      url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {}
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // 启用/禁用特定模块的自动检测
        '@opentelemetry/instrumentation-fs': {
          enabled: false // 文件系统操作通常产生大量噪音
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true
        },
        '@opentelemetry/instrumentation-mongodb': {
          enabled: true
        }
      })
    ],
    samplingRatio
  });
  
  // 启动SDK
  sdk.start()
    .then(() => console.log('Tracing initialized'))
    .catch((error) => console.error('Error initializing tracing', error));
  
  // 优雅关闭
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
  
  // 添加手动追踪工具
  const { trace, context } = require('@opentelemetry/api');
  
  /**
   * 创建手动追踪Span
   * @param {string} name Span名称
   * @param {Function} fn 要追踪的函数
   * @param {Object} attributes 附加属性
   * @returns {*} 函数结果
   */
  function traceFunction(name, fn, attributes = {}) {
    const tracer = trace.getTracer('manual-instrumentation');
    
    return tracer.startActiveSpan(name, async (span) => {
      try {
        // 添加属性
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
        
        const result = await fn();
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message }); // ERROR status
        span.end();
        throw error;
      }
    });
  }
  
  // 为应用添加手动追踪API
  app.set('traceFunction', traceFunction);
  
  return {
    sdk,
    traceFunction
  };
}
```

### 应用性能监控(APM)集成

```js
/**
 * 集成应用性能监控(APM)
 */
function setupAPM() {
  if (process.env.ELASTIC_APM_SERVER_URL) {
    // Elastic APM 集成
    const apm = require('elastic-apm-node').start({
      // APM服务器URL
      serverUrl: process.env.ELASTIC_APM_SERVER_URL,
      
      // 服务信息
      serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'my-nodejs-service',
      serviceVersion: process.env.npm_package_version,
      environment: process.env.NODE_ENV || 'development',
      
      // 配置项
      logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      captureBody: 'errors',
      captureErrorLogStackTraces: 'always',
      captureSpanStackTraces: false, // 生产环境设为false以减少开销
      metricsInterval: '30s',
      transactionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    });
    
    return { provider: 'elastic', instance: apm };
  } else if (process.env.NEWRELIC_LICENSE_KEY) {
    // New Relic 集成
    const newrelic = require('newrelic');
    
    return { provider: 'newrelic', instance: newrelic };
  } else if (process.env.DD_API_KEY) {
    // Datadog 集成
    const tracer = require('dd-trace').init({
      // 全局配置
      env: process.env.NODE_ENV,
      service: 'my-nodejs-service',
      version: process.env.npm_package_version,
      logInjection: true,
      runtimeMetrics: true,
      
      // 采样配置
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // 调试选项
      debug: process.env.NODE_ENV !== 'production',
      logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
    });
    
    return { provider: 'datadog', instance: tracer };
  } else {
    console.warn('No APM provider detected. Set up environment variables for APM integration.');
    return { provider: 'none', instance: null };
  }
}
```

### 错误监控与崩溃报告

```js
/**
 * 错误监控与异常捕获
 * @param {Express} app Express应用实例
 */
function setupErrorMonitoring(app) {
  // 初始化第三方错误监控服务(Sentry示例)
  let errorReporter = null;
  
  if (process.env.SENTRY_DSN) {
    const Sentry = require('@sentry/node');
    const Tracing = require('@sentry/tracing');
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
      
      // 调整采样率 - 生产环境使用较低的值
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // 性能跟踪集成
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app })
      ],
      
      // 配置事件处理
      beforeSend(event, hint) {
        // 可以在这里过滤特定错误
        const error = hint.originalException;
        if (error && error.name === 'ValidationError') {
          // 不上报验证错误
          return null;
        }
        return event;
      }
    });
    
    // 添加Sentry中间件
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    
    // 错误处理中间件 - 必须在其他路由之后，错误处理之前
    app.use(Sentry.Handlers.errorHandler());
    
    errorReporter = {
      provider: 'sentry',
      instance: Sentry,
      captureException: Sentry.captureException.bind(Sentry),
      captureMessage: Sentry.captureMessage.bind(Sentry)
    };
  } else {
    // 无第三方服务时的简单实现
    errorReporter = {
      provider: 'internal',
      captureException: (error, context = {}) => {
        console.error('UNCAUGHT EXCEPTION:', error, context);
      },
      captureMessage: (message, level = 'info', context = {}) => {
        console[level === 'error' ? 'error' : 'log'](message, context);
      }
    };
  }
  
  // 捕获未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    errorReporter.captureException(reason, {
      level: 'error',
      tags: { type: 'unhandledRejection' }
    });
  });
  
  // 捕获未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    errorReporter.captureException(error, {
      level: 'fatal',
      tags: { type: 'uncaughtException' }
    });
    
    // 优雅关闭
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
  
  // 导出全局错误上报工具
  global.errorReporter = errorReporter;
  
  return errorReporter;
}
```

## 告警与自动化运维

实现有效的告警机制和自动化运维可以帮助开发团队快速响应问题并保障系统稳定性。

### 告警系统实现

```js
/**
 * 告警系统
 */
class AlertSystem {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'nodejs-service';
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    
    // 配置告警阈值
    this.thresholds = {
      cpu: options.cpuThreshold || 80, // CPU使用率阈值(%)
      memory: options.memoryThreshold || 85, // 内存使用率阈值(%)
      diskSpace: options.diskThreshold || 90, // 磁盘使用率阈值(%)
      responseTime: options.responseTimeThreshold || 1000, // 响应时间阈值(ms)
      errorRate: options.errorRateThreshold || 5, // 错误率阈值(%)
      deadlockTimeout: options.deadlockTimeout || 60000 // 死锁检测超时(ms)
    };
    
    // 配置告警通知渠道
    this.notifiers = options.notifiers || [];
    
    // 告警状态记录
    this.alertState = new Map();
    
    // 告警冷却期（防止告警风暴）
    this.cooldownPeriod = options.cooldownPeriod || 5 * 60 * 1000; // 默认5分钟
  }
  
  /**
   * 添加告警通知渠道
   * @param {Function} notifier 通知函数
   */
  addNotifier(notifier) {
    if (typeof notifier === 'function') {
      this.notifiers.push(notifier);
    }
  }
  
  /**
   * 发送告警通知
   * @param {Object} alert 告警信息
   */
  async notify(alert) {
    const alertId = `${alert.type}-${alert.resource}`;
    const now = Date.now();
    
    // 检查冷却期
    const lastAlertTime = this.alertState.get(alertId);
    if (lastAlertTime && now - lastAlertTime < this.cooldownPeriod) {
      console.log(`Alert ${alertId} in cooldown period, skipping notification`);
      return false;
    }
    
    // 更新告警状态
    this.alertState.set(alertId, now);
    
    // 添加元数据
    const enrichedAlert = {
      ...alert,
      serviceName: this.serviceName,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      id: alertId
    };
    
    // 发送到所有通知渠道
    const results = await Promise.allSettled(
      this.notifiers.map(notifier => notifier(enrichedAlert))
    );
    
    // 检查通知结果
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    return successCount > 0;
  }
  
  /**
   * 检查系统资源使用情况并触发告警
   */
  async checkSystemResources() {
    const os = require('os');
    
    // CPU使用率
    const cpuUsage = await this.getCpuUsage();
    if (cpuUsage > this.thresholds.cpu) {
      this.notify({
        type: 'system',
        resource: 'cpu',
        severity: 'warning',
        title: `高CPU使用率: ${cpuUsage.toFixed(2)}%`,
        value: cpuUsage,
        threshold: this.thresholds.cpu,
        metadata: {
          cpus: os.cpus().length,
          load: os.loadavg()
        }
      });
    }
    
    // 内存使用率
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    if (memUsage > this.thresholds.memory) {
      this.notify({
        type: 'system',
        resource: 'memory',
        severity: 'warning',
        title: `高内存使用率: ${memUsage.toFixed(2)}%`,
        value: memUsage,
        threshold: this.thresholds.memory,
        metadata: {
          total: formatBytes(totalMem),
          free: formatBytes(freeMem),
          process: formatBytes(process.memoryUsage().rss)
        }
      });
    }
    
    // 磁盘空间检查可以通过Node.js调用系统命令来实现
  }
  
  /**
   * 获取CPU使用率
   * @returns {Promise<number>} CPU使用率百分比
   */
  async getCpuUsage() {
    return new Promise((resolve) => {
      const os = require('os');
      
      // 第一次测量
      const cpus1 = os.cpus();
      const idle1 = cpus1.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const total1 = cpus1.reduce((acc, cpu) => 
        acc + Object.values(cpu.times).reduce((sum, t) => sum + t, 0), 0);
      
      // 间隔后再测量
      setTimeout(() => {
        const cpus2 = os.cpus();
        const idle2 = cpus2.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const total2 = cpus2.reduce((acc, cpu) => 
          acc + Object.values(cpu.times).reduce((sum, t) => sum + t, 0), 0);
        
        const idleDiff = idle2 - idle1;
        const totalDiff = total2 - total1;
        
        const cpuUsage = 100 - (100 * idleDiff / totalDiff);
        resolve(cpuUsage);
      }, 1000);
    });
  }
  
  /**
   * 监控API性能指标
   * @param {Object} metrics API指标
   */
  monitorApiPerformance(metrics) {
    // 响应时间监控
    if (metrics.responseTime > this.thresholds.responseTime) {
      this.notify({
        type: 'api',
        resource: metrics.endpoint,
        severity: metrics.responseTime > this.thresholds.responseTime * 2 ? 'critical' : 'warning',
        title: `API响应缓慢: ${metrics.endpoint}`,
        value: metrics.responseTime,
        threshold: this.thresholds.responseTime,
        metadata: {
          method: metrics.method,
          statusCode: metrics.statusCode,
          timestamp: metrics.timestamp
        }
      });
    }
    
    // 错误率监控
    if (metrics.errorRate > this.thresholds.errorRate) {
      this.notify({
        type: 'api',
        resource: 'error-rate',
        severity: 'critical',
        title: `API错误率过高: ${metrics.errorRate.toFixed(2)}%`,
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate,
        metadata: {
          endpoints: metrics.errorEndpoints,
          period: metrics.period
        }
      });
    }
  }
  
  /**
   * 创建死锁检测器
   */
  createDeadlockDetector() {
    const activeOperations = new Map();
    
    return {
      /**
       * 开始跟踪操作
       * @param {string} operationId 操作ID
       * @param {Object} details 操作详情
       */
      trackOperation(operationId, details) {
        activeOperations.set(operationId, {
          startTime: Date.now(),
          details
        });
      },
      
      /**
       * 完成操作跟踪
       * @param {string} operationId 操作ID
       */
      completeOperation(operationId) {
        activeOperations.delete(operationId);
      },
      
      /**
       * 检测潜在死锁
       */
      detectDeadlocks: () => {
        const now = Date.now();
        const deadlockThreshold = this.thresholds.deadlockTimeout;
        
        for (const [operationId, operation] of activeOperations.entries()) {
          const duration = now - operation.startTime;
          
          if (duration > deadlockThreshold) {
            this.notify({
              type: 'process',
              resource: 'deadlock',
              severity: 'critical',
              title: '检测到潜在死锁或长时间运行操作',
              value: duration,
              threshold: deadlockThreshold,
              metadata: {
                operationId,
                ...operation.details,
                startTime: new Date(operation.startTime).toISOString(),
                duration: `${(duration / 1000).toFixed(2)}s`
              }
            });
            
            // 记录可能出现问题的操作但不自动移除
            // 在某些情况下可能需要人工干预
          }
        }
      },
      
      getActiveOperations() {
        return Array.from(activeOperations.entries()).map(([id, op]) => ({
          id,
          duration: Date.now() - op.startTime,
          ...op.details
        }));
      }
    };
  }
}

/**
 * 格式化字节数为人类可读格式
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 创建Slack通知渠道
 * @param {string} webhookUrl Slack Webhook URL
 * @returns {Function} 通知函数
 */
function createSlackNotifier(webhookUrl) {
  const https = require('https');
  const url = require('url');
  
  return async function notifySlack(alert) {
    const { title, severity, value, threshold, metadata } = alert;
    
    // 构建Slack消息
    const message = {
      text: `🚨 *${title}*`,
      attachments: [
        {
          color: severity === 'critical' ? '#FF0000' : '#FFA500',
          fields: [
            {
              title: '严重程度',
              value: severity.toUpperCase(),
              short: true
            },
            {
              title: '当前值',
              value: `${value}`,
              short: true
            },
            {
              title: '阈值',
              value: `${threshold}`,
              short: true
            },
            {
              title: '服务',
              value: alert.serviceName,
              short: true
            },
            {
              title: '环境',
              value: alert.environment,
              short: true
            },
            {
              title: '时间',
              value: alert.timestamp,
              short: true
            },
            {
              title: '详细信息',
              value: `\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``,
              short: false
            }
          ]
        }
      ]
    };
    
    // 发送HTTP请求
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(webhookUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            reject(new Error(`Failed to send Slack notification: ${res.statusCode} ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      
      req.write(JSON.stringify(message));
      req.end();
    });
  };
}

/**
 * 配置告警系统
 * @param {Express} app Express应用实例
 */
function setupAlertSystem(app) {
  // 创建告警系统
  const alertSystem = new AlertSystem({
    serviceName: 'my-nodejs-service',
    environment: process.env.NODE_ENV,
    cpuThreshold: 80,
    memoryThreshold: 85,
    responseTimeThreshold: 2000,
    errorRateThreshold: 5
  });
  
  // 添加通知渠道
  if (process.env.SLACK_WEBHOOK_URL) {
    alertSystem.addNotifier(createSlackNotifier(process.env.SLACK_WEBHOOK_URL));
  }
  
  // 添加邮件通知
  if (process.env.EMAIL_ALERTS_ENABLED === 'true') {
    // 这里实现邮件通知渠道
  }
  
  // 设置定期检查
  const checkInterval = process.env.ALERT_CHECK_INTERVAL || 60000; // 默认1分钟
  
  setInterval(() => {
    alertSystem.checkSystemResources();
  }, checkInterval);
  
  // 创建死锁检测器
  const deadlockDetector = alertSystem.createDeadlockDetector();
  
  setInterval(() => {
    deadlockDetector.detectDeadlocks();
  }, 30000); // 每30秒检测一次
  
  // 暴露API端点用于手动触发告警
  app.post('/debug/trigger-alert', (req, res) => {
    const { type, title, severity, value, threshold, metadata } = req.body;
    
    alertSystem.notify({
      type: type || 'manual',
      resource: 'api',
      severity: severity || 'info',
      title: title || '手动触发告警',
      value: value || 0,
      threshold: threshold || 0,
      metadata: metadata || {}
    });
    
    res.json({ success: true, message: 'Alert triggered' });
  });
  
  // 导出全局实例
  global.alertSystem = alertSystem;
  global.deadlockDetector = deadlockDetector;
  
  return { alertSystem, deadlockDetector };
}

### 自动化运维

```js
/**
 * 自动化运维系统
 */
class AutomationSystem {
  constructor(options = {}) {
    this.actions = new Map();
    this.history = [];
    this.maxHistorySize = options.maxHistorySize || 100;
  }
  
  /**
   * 注册自动化操作
   * @param {string} actionId 操作ID
   * @param {Function} actionFn 操作函数
   * @param {Object} metadata 操作元数据
   */
  registerAction(actionId, actionFn, metadata = {}) {
    this.actions.set(actionId, {
      fn: actionFn,
      metadata: {
        description: metadata.description || '',
        parameters: metadata.parameters || [],
        isDestructive: !!metadata.isDestructive,
        requiresApproval: metadata.requiresApproval !== false, // 默认需要审批
        category: metadata.category || 'general'
      }
    });
  }
  
  /**
   * 执行自动化操作
   * @param {string} actionId 操作ID
   * @param {Object} params 操作参数
   * @param {string} triggeredBy 触发者
   * @returns {Promise<Object>} 执行结果
   */
  async executeAction(actionId, params = {}, triggeredBy = 'system') {
    const action = this.actions.get(actionId);
    
    if (!action) {
      throw new Error(`Unknown action: ${actionId}`);
    }
    
    const executionId = `${actionId}-${Date.now()}`;
    
    // 记录执行历史
    const historyEntry = {
      id: executionId,
      actionId,
      params,
      triggeredBy,
      timestamp: new Date().toISOString(),
      status: 'running'
    };
    
    this.history.unshift(historyEntry);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
    
    try {
      const result = await action.fn(params);
      
      // 更新历史记录
      historyEntry.status = 'completed';
      historyEntry.result = result;
      historyEntry.endTime = new Date().toISOString();
      
      return { success: true, executionId, result };
    } catch (error) {
      // 更新历史记录
      historyEntry.status = 'failed';
      historyEntry.error = error.message;
      historyEntry.endTime = new Date().toISOString();
      
      throw error;
    }
  }
  
  /**
   * 获取可用操作列表
   * @returns {Array} 操作列表
   */
  getAvailableActions() {
    return Array.from(this.actions.entries()).map(([id, action]) => ({
      id,
      ...action.metadata
    }));
  }
  
  /**
   * 获取执行历史
   * @param {number} limit 限制返回数量
   * @returns {Array} 历史记录
   */
  getExecutionHistory(limit = 10) {
    return this.history.slice(0, limit);
  }
}

/**
 * 配置自动化运维系统
 * @param {Express} app Express应用实例
 */
function setupAutomationSystem(app) {
  const fs = require('fs').promises;
  const path = require('path');
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  // 创建自动化系统
  const automationSystem = new AutomationSystem();
  
  // 注册日志归档操作
  automationSystem.registerAction(
    'archive-logs',
    async ({ olderThan = 7 }) => {
      const logsDir = path.join(process.cwd(), 'logs');
      const archiveDir = path.join(logsDir, 'archives');
      
      // 确保归档目录存在
      await fs.mkdir(archiveDir, { recursive: true });
      
      // 获取日志文件
      const files = await fs.readdir(logsDir);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const cutoffTime = now - (olderThan * oneDayMs);
      
      const archivedFiles = [];
      
      for (const file of files) {
        if (file === 'archives' || !file.endsWith('.log')) continue;
        
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && stats.mtimeMs < cutoffTime) {
          const archiveDate = new Date().toISOString().split('T')[0];
          const archiveName = `${path.basename(file, '.log')}-${archiveDate}.log.gz`;
          const archivePath = path.join(archiveDir, archiveName);
          
          // 使用gzip压缩
          await execPromise(`gzip -c "${filePath}" > "${archivePath}"`);
          
          // 删除原文件
          await fs.unlink(filePath);
          
          archivedFiles.push({
            originalPath: filePath,
            archivePath
          });
        }
      }
      
      return {
        archivedFiles,
        count: archivedFiles.length
      };
    },
    {
      description: '归档超过指定天数的日志文件',
      parameters: [
        {
          name: 'olderThan',
          type: 'number',
          description: '归档超过多少天的日志',
          default: 7
        }
      ],
      category: 'maintenance'
    }
  );
  
  // 注册清理缓存操作
  automationSystem.registerAction(
    'clear-temp-files',
    async () => {
      const tempDir = path.join(process.cwd(), 'temp');
      
      try {
        const files = await fs.readdir(tempDir);
        let deletedCount = 0;
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
        
        return {
          deletedCount,
          tempDir
        };
      } catch (error) {
        if (error.code === 'ENOENT') {
          return {
            deletedCount: 0,
            tempDir,
            message: 'Temp directory does not exist'
          };
        }
        throw error;
      }
    },
    {
      description: '清理临时文件',
      category: 'maintenance'
    }
  );
  
  // 注册重启应用操作
  automationSystem.registerAction(
    'restart-app',
    async ({ gracePeriodSeconds = 10 }) => {
      // 记录准备重启
      console.log(`Application restart requested, grace period: ${gracePeriodSeconds}s`);
      
      // 在真实环境中，这可能需要与进程管理器(如PM2)集成
      // 或触发Kubernetes滚动更新等
      
      // 这里实现一个简单的延迟重启
      setTimeout(() => {
        console.log('Application restarting now...');
        process.exit(0); // 进程管理器会重新启动应用
      }, gracePeriodSeconds * 1000);
      
      return {
        scheduled: true,
        restartTime: new Date(Date.now() + gracePeriodSeconds * 1000).toISOString()
      };
    },
    {
      description: '重启应用程序',
      parameters: [
        {
          name: 'gracePeriodSeconds',
          type: 'number',
          description: '等待时间(秒)',
          default: 10
        }
      ],
      isDestructive: true,
      category: 'operations'
    }
  );
  
  // 注册健康检查修复操作
  automationSystem.registerAction(
    'fix-health-check',
    async ({ checkType }) => {
      let result = {
        actions: []
      };
      
      switch (checkType) {
        case 'memory-leak':
          // 强制GC
          if (global.gc) {
            global.gc();
            result.actions.push('Forced garbage collection');
          }
          break;
          
        case 'database-connections':
          // 重置数据库连接池
          if (global.dbPool) {
            await global.dbPool.drain();
            await global.dbPool.clear();
            result.actions.push('Reset database connection pool');
          }
          break;
          
        case 'disk-space':
          // 执行日志归档
          const archiveResult = await automationSystem.executeAction('archive-logs', { olderThan: 1 });
          result.actions.push(`Archived old logs: ${archiveResult.result.count} files`);
          
          // 清理临时文件
          const cleanResult = await automationSystem.executeAction('clear-temp-files');
          result.actions.push(`Cleaned temp files: ${cleanResult.result.deletedCount} files`);
          break;
          
        default:
          throw new Error(`Unknown health check type: ${checkType}`);
      }
      
      return result;
    },
    {
      description: '自动修复常见健康检查失败',
      parameters: [
        {
          name: 'checkType',
          type: 'string',
          description: '健康检查类型',
          enum: ['memory-leak', 'database-connections', 'disk-space']
        }
      ],
      category: 'remediation'
    }
  );
  
  // 暴露API端点
  app.get('/ops/actions', (req, res) => {
    const actions = automationSystem.getAvailableActions();
    res.json({ actions });
  });
  
  app.get('/ops/history', (req, res) => {
    const limit = parseInt(req.query.limit || '10', 10);
    const history = automationSystem.getExecutionHistory(limit);
    res.json({ history });
  });
  
  app.post('/ops/execute', (req, res) => {
    const { actionId, params } = req.body;
    const triggeredBy = req.user ? req.user.username : 'api';
    
    automationSystem.executeAction(actionId, params, triggeredBy)
      .then(result => {
        res.json(result);
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
  });
  
  // 导出全局实例
  global.automationSystem = automationSystem;
  
  return automationSystem;
}
```

## 告警与自动化运维

- 关键指标异常自动告警（如钉钉、邮件、短信）
- 支持自愈脚本、自动扩容与重启
- 定期回归测试与健康检查

## 监控工具与平台

- 推荐Prometheus、Grafana等开源监控方案

## 实战建议与最佳实践

- 监控与日志采集全链路覆盖，便于问题追踪
- 性能分析常态化，及时发现瓶颈
- 结合CI/CD实现自动化运维与回滚

---

> 参考资料：[Node.js官方性能分析文档](https://nodejs.org/en/docs/guides/simple-profiling/)、[Prometheus官方文档](https://prometheus.io/docs/) 