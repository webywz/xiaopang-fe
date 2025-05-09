---
outline: deep
---

# Nest.js 任务调度

Nest.js 提供了强大的任务调度功能，允许开发者以声明式的方式安排定期执行的任务。

## 安装

首先安装必要的依赖：

```bash
npm install @nestjs/schedule
npm install @types/cron --save-dev
```

## 基本设置

首先，需要在应用程序中导入 `ScheduleModule`：

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ScheduleModule.forRoot() // 注册调度模块
  ],
  providers: [TasksService],
})
export class AppModule {}
```

## 声明式计划任务

### Cron 任务

使用 `@Cron()` 装饰器创建 cron 任务：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.logger.debug('每30秒执行一次');
  }
  
  // 使用标准的 cron 表达式
  @Cron('0 0 * * *') // 每天午夜执行
  handleMidnightTask() {
    this.logger.debug('午夜任务执行');
  }
  
  // 带有时区的 cron 表达式
  @Cron('0 0 8 * * *', {
    name: 'morningTask',
    timeZone: 'Asia/Shanghai'
  })
  handleMorningTask() {
    this.logger.debug('早上8点执行');
  }
}
```

### 内置 CronExpression

`@nestjs/schedule` 提供了一些常用的 cron 表达式常量：

```typescript
enum CronExpression {
  EVERY_SECOND = '* * * * * *',
  EVERY_5_SECONDS = '*/5 * * * * *',
  EVERY_10_SECONDS = '*/10 * * * * *',
  EVERY_30_SECONDS = '*/30 * * * * *',
  EVERY_MINUTE = '0 * * * * *',
  EVERY_5_MINUTES = '0 */5 * * * *',
  EVERY_10_MINUTES = '0 */10 * * * *',
  EVERY_30_MINUTES = '0 */30 * * * *',
  EVERY_HOUR = '0 0 * * * *',
  EVERY_2_HOURS = '0 0 */2 * * *',
  EVERY_DAY = '0 0 0 * * *',
  EVERY_DAY_AT_1AM = '0 0 1 * * *',
  EVERY_DAY_AT_2AM = '0 0 2 * * *',
  EVERY_WEEK = '0 0 0 * * 0',
  EVERY_WEEKDAY = '0 0 0 * * 1-5',
  EVERY_WEEKEND = '0 0 0 * * 0,6',
  EVERY_MONTH = '0 0 0 1 * *',
  EVERY_QUARTER = '0 0 0 1 */3 *',
  EVERY_6_MONTHS = '0 0 0 1 */6 *',
  EVERY_YEAR = '0 0 0 1 1 *'
}
```

### 间隔任务

使用 `@Interval()` 装饰器按固定时间间隔执行任务：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // 每隔 5 秒执行一次
  @Interval(5000)
  handleInterval() {
    this.logger.debug('每 5 秒执行一次');
  }
  
  // 命名间隔任务
  @Interval('intervalTask', 10000)
  handleNamedInterval() {
    this.logger.debug('每 10 秒执行一次的命名任务');
  }
}
```

### 定时任务

使用 `@Timeout()` 装饰器在应用程序启动后的指定时间执行一次任务：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // 应用启动后 5 秒执行
  @Timeout(5000)
  handleTimeout() {
    this.logger.debug('应用启动 5 秒后执行一次');
  }
  
  // 命名的定时任务
  @Timeout('initialSetupTask', 10000)
  handleNamedTimeout() {
    this.logger.debug('应用启动 10 秒后执行一次的初始化任务');
  }
}
```

## 动态调度任务

可以使用 `SchedulerRegistry` 动态管理计划任务：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private schedulerRegistry: SchedulerRegistry) {
    this.addCronJob();
  }

  addCronJob() {
    const job = new CronJob('0 * * * * *', () => {
      this.logger.debug('每分钟执行一次的动态创建的任务');
    });

    this.schedulerRegistry.addCronJob('dynamicCron', job);
    job.start();
    
    this.logger.debug('动态 cron 任务已添加');
  }
  
  // 动态添加间隔任务
  addInterval() {
    const intervalId = setInterval(() => {
      this.logger.debug('动态间隔任务执行');
    }, 2000);
    
    this.schedulerRegistry.addInterval('dynamicInterval', intervalId);
  }
  
  // 动态添加超时任务
  addTimeout() {
    const timeoutId = setTimeout(() => {
      this.logger.debug('动态超时任务执行');
    }, 5000);
    
    this.schedulerRegistry.addTimeout('dynamicTimeout', timeoutId);
  }
  
  // 删除任务
  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.debug(`任务 ${name} 已删除`);
  }
  
  // 获取所有 cron 任务
  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((job, name) => {
      const next = job.nextDates().toJSDate();
      this.logger.debug(`任务: ${name} -> 下次执行: ${next}`);
    });
  }
}
```

## 任务处理与优化

### 错误处理

在计划任务中处理异常：

```typescript
@Cron(CronExpression.EVERY_10_MINUTES)
async handleDatabaseCleanup() {
  try {
    await this.databaseService.cleanupOldRecords();
    this.logger.log('数据库清理任务成功完成');
  } catch (error) {
    this.logger.error('数据库清理任务失败', error.stack);
    // 可以添加通知或重试逻辑
  }
}
```

### 任务锁定（分布式环境）

在多实例环境中避免重复执行任务：

```typescript
@Injectable()
export class DistributedTasksService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private redisService: RedisService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDistributedTask() {
    const lockKey = 'task:hourly:lock';
    const identifier = uuid();
    
    try {
      // 尝试获取锁，60秒超时
      const locked = await this.redisService.acquireLock(lockKey, identifier, 60);
      
      if (!locked) {
        this.logger.debug('另一个实例正在执行此任务，跳过');
        return;
      }
      
      // 执行任务
      await this.performTask();
      
    } catch (error) {
      this.logger.error('分布式任务执行失败', error.stack);
    } finally {
      // 释放锁
      await this.redisService.releaseLock(lockKey, identifier);
    }
  }
  
  private async performTask() {
    // 任务实现
  }
}
```

### 任务并发控制

对于资源密集型任务，可以限制并发执行：

```typescript
@Injectable()
export class ResourceIntensiveTasksService {
  private semaphore = new Semaphore(3); // 最多3个并发任务
  
  @Cron('*/5 * * * *') // 每5分钟
  async handleResourceIntensiveTask() {
    try {
      await this.semaphore.acquire();
      await this.processHeavyTask();
    } finally {
      this.semaphore.release();
    }
  }
  
  private async processHeavyTask() {
    // 资源密集型任务实现
  }
}

// 简单的信号量实现
class Semaphore {
  private currentValue: number;
  private queue: (() => void)[] = [];
  
  constructor(private readonly maxConcurrency: number) {
    this.currentValue = maxConcurrency;
  }
  
  async acquire(): Promise<void> {
    if (this.currentValue > 0) {
      this.currentValue--;
      return Promise.resolve();
    }
    
    return new Promise<void>(resolve => {
      this.queue.push(resolve);
    });
  }
  
  release(): void {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.currentValue++;
    }
  }
}
```

## 高级用例

### 批处理任务

对大型批处理任务进行分割：

```typescript
@Injectable()
export class BatchProcessingService {
  private readonly logger = new Logger(BatchProcessingService.name);
  
  constructor(private dataService: DataService) {}
  
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleBatchProcessing() {
    this.logger.log('开始每日批处理任务');
    
    // 找出需要处理的记录总数
    const totalCount = await this.dataService.getUnprocessedCount();
    const batchSize = 1000;
    const batches = Math.ceil(totalCount / batchSize);
    
    this.logger.log(`共有 ${totalCount} 条记录需要处理，分为 ${batches} 批`);
    
    for (let i = 0; i < batches; i++) {
      try {
        const offset = i * batchSize;
        const records = await this.dataService.getUnprocessedBatch(offset, batchSize);
        
        // 处理这一批记录
        await this.processRecords(records);
        
        this.logger.log(`批次 ${i + 1}/${batches} 处理完成`);
      } catch (error) {
        this.logger.error(`批次 ${i + 1} 处理失败`, error.stack);
        // 可以决定是继续下一批还是中止整个处理
      }
    }
    
    this.logger.log('每日批处理任务完成');
  }
  
  private async processRecords(records: any[]) {
    // 处理记录的逻辑
  }
}
```

### 任务链

实现依赖链式执行的任务：

```typescript
@Injectable()
export class TaskChainService {
  private readonly logger = new Logger(TaskChainService.name);
  
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async executeTaskChain() {
    this.logger.log('开始执行任务链');
    
    try {
      // 步骤 1: 数据收集
      this.logger.log('步骤 1: 开始数据收集');
      const data = await this.collectData();
      
      // 步骤 2: 数据处理
      this.logger.log('步骤 2: 开始数据处理');
      const processedData = await this.processData(data);
      
      // 步骤 3: 报告生成
      this.logger.log('步骤 3: 开始生成报告');
      await this.generateReport(processedData);
      
      // 步骤 4: 通知
      this.logger.log('步骤 4: 发送通知');
      await this.sendNotifications();
      
      this.logger.log('任务链执行完成');
    } catch (error) {
      this.logger.error('任务链执行失败', error.stack);
      // 处理失败情况，可能的恢复策略
    }
  }
  
  private async collectData() {
    // 实现数据收集逻辑
    return { /* 收集的数据 */ };
  }
  
  private async processData(data: any) {
    // 实现数据处理逻辑
    return { /* 处理后的数据 */ };
  }
  
  private async generateReport(data: any) {
    // 实现报告生成逻辑
  }
  
  private async sendNotifications() {
    // 实现通知发送逻辑
  }
}
```

### 条件性任务执行

根据环境或配置条件决定是否执行任务：

```typescript
@Injectable()
export class ConditionalTasksService {
  private readonly logger = new Logger(ConditionalTasksService.name);
  
  constructor(
    private configService: ConfigService,
    private environmentService: EnvironmentService
  ) {}
  
  @Cron(CronExpression.EVERY_HOUR)
  async handleConditionalTask() {
    // 检查是否应该执行此任务
    if (!this.shouldRunTask()) {
      this.logger.debug('任务条件不满足，跳过执行');
      return;
    }
    
    this.logger.log('执行条件任务');
    // 实际任务实现
  }
  
  private shouldRunTask(): boolean {
    // 仅在生产环境运行
    if (this.environmentService.getEnvironment() !== 'production') {
      return false;
    }
    
    // 检查功能标志是否启用
    if (!this.configService.get('features.hourlyTask.enabled')) {
      return false;
    }
    
    // 检查是否是主节点（在集群环境中）
    if (!this.environmentService.isPrimaryNode()) {
      return false;
    }
    
    return true;
  }
}
```

## 最佳实践

### 任务监控

实现任务执行监控：

```typescript
@Injectable()
export class MonitoredTasksService {
  private readonly logger = new Logger(MonitoredTasksService.name);
  
  constructor(private metricsService: MetricsService) {}
  
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleMonitoredTask() {
    const startTime = Date.now();
    const taskName = 'periodic-data-sync';
    
    try {
      // 记录任务开始
      this.metricsService.incrementTaskCount(taskName);
      this.metricsService.recordTaskStart(taskName);
      
      // 执行实际任务
      await this.performTask();
      
      // 记录成功完成
      const duration = Date.now() - startTime;
      this.metricsService.recordTaskDuration(taskName, duration);
      this.metricsService.incrementTaskSuccess(taskName);
      
      this.logger.log(`任务 ${taskName} 成功完成，耗时 ${duration}ms`);
    } catch (error) {
      // 记录失败
      this.metricsService.incrementTaskFailure(taskName);
      
      this.logger.error(`任务 ${taskName} 执行失败`, error.stack);
      throw error; // 重新抛出错误或处理它
    }
  }
  
  private async performTask() {
    // 实际任务实现
  }
}
```

### 任务超时处理

为长时间运行的任务实现超时机制：

```typescript
@Injectable()
export class TimeoutAwareTasksService {
  private readonly logger = new Logger(TimeoutAwareTasksService.name);
  
  @Cron(CronExpression.EVERY_HOUR)
  async handleTaskWithTimeout() {
    // 设置 20 分钟的超时
    const timeoutMs = 20 * 60 * 1000;
    
    try {
      await this.executeWithTimeout(this.performLongRunningTask.bind(this), timeoutMs);
      this.logger.log('长时间运行的任务成功完成');
    } catch (error) {
      if (error.message === 'TASK_TIMEOUT') {
        this.logger.error('任务超时');
        // 可能需要清理操作或通知
      } else {
        this.logger.error('任务执行出错', error.stack);
      }
    }
  }
  
  private async performLongRunningTask() {
    // 长时间运行的任务实现
  }
  
  private executeWithTimeout(fn: () => Promise<any>, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('TASK_TIMEOUT'));
      }, timeoutMs);
      
      fn().then(
        (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }
}
```

### 失败重试机制

为失败的任务实现重试机制：

```typescript
@Injectable()
export class RetryAwareTasksService {
  private readonly logger = new Logger(RetryAwareTasksService.name);
  
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleTaskWithRetry() {
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      try {
        await this.performTask();
        success = true;
        this.logger.log(`任务成功完成，尝试次数: ${retries + 1}`);
      } catch (error) {
        retries++;
        this.logger.warn(`任务失败，尝试 ${retries}/${maxRetries}`, error.stack);
        
        if (retries < maxRetries) {
          // 指数退避重试
          const backoffMs = 1000 * Math.pow(2, retries);
          this.logger.log(`等待 ${backoffMs}ms 后重试`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    if (!success) {
      this.logger.error(`任务在 ${maxRetries} 次尝试后仍然失败`);
      // 可能发送警报或通知
    }
  }
  
  private async performTask() {
    // 任务实现
  }
} 