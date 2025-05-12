/**
 * Java 并发编程
 * @description Java 多线程与并发编程基础
 */

# Java 并发编程详解

## 1. 并发与并行的区别
- **并发（Concurrency）**：同一时间段内多个任务交替执行，宏观上"同时"，微观上轮流。
- **并行（Parallelism）**：多个任务在同一时刻真正同时执行，需多核 CPU 支持。

---

## 2. 线程与进程基础
- **进程**：操作系统资源分配的最小单位。
- **线程**：CPU 调度的最小单位，同一进程内可有多个线程共享内存。

---

## 3. Java 线程的创建与生命周期

### 3.1 创建线程的三种方式
```java
/**
 * 继承 Thread 类
 */
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("继承 Thread 创建线程");
    }
}
new MyThread().start();

/**
 * 实现 Runnable 接口
 */
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("实现 Runnable 创建线程");
    }
}
new Thread(new MyRunnable()).start();

/**
 * 使用 Lambda 表达式
 */
new Thread(() -> System.out.println("Lambda 创建线程")).start();
```

### 3.2 线程生命周期
- 新建（New）
- 就绪（Runnable）
- 运行（Running）
- 阻塞（Blocked/Waiting）
- 死亡（Terminated）

---

## 4. 同步与锁

### 4.1 synchronized 关键字
- 修饰方法或代码块，保证同一时刻只有一个线程执行。

```java
/**
 * 同步方法示例
 */
public synchronized void syncMethod() {
    // 线程安全操作
}

/**
 * 同步代码块示例
 */
public void syncBlock() {
    synchronized(this) {
        // 线程安全操作
    }
}
```

### 4.2 volatile 关键字
- 保证变量的可见性，不保证原子性。

```java
private volatile boolean running = true;
```

### 4.3 Lock 接口
- 更灵活的锁机制，支持公平锁、可重入锁、读写锁等。

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

Lock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

---

## 5. 线程通信与协作

### 5.1 wait/notify
- 用于对象监视器（synchronized），实现线程间协作。

```java
synchronized(obj) {
    obj.wait();    // 释放锁并等待
    obj.notify();  // 唤醒等待线程
}
```

### 5.2 Condition
- Lock 的配套条件变量，支持多条件等待/唤醒。

```java
import java.util.concurrent.locks.Condition;
Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();
lock.lock();
try {
    condition.await();   // 等待
    condition.signal();  // 唤醒
} finally {
    lock.unlock();
}
```

---

## 6. 线程池与并发工具类

### 6.1 线程池 Executor

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService pool = Executors.newFixedThreadPool(4);
pool.execute(() -> System.out.println("线程池任务"));
pool.shutdown();
```

### 6.2 Future
- 获取异步任务结果。

```java
import java.util.concurrent.*;
ExecutorService pool = Executors.newSingleThreadExecutor();
Future<Integer> future = pool.submit(() -> 1 + 2);
System.out.println(future.get()); // 输出 3
pool.shutdown();
```

### 6.3 CountDownLatch、Semaphore

```java
import java.util.concurrent.CountDownLatch;
CountDownLatch latch = new CountDownLatch(2);
new Thread(() -> {
    // ...
    latch.countDown();
}).start();
latch.await(); // 等待计数归零

import java.util.concurrent.Semaphore;
Semaphore sem = new Semaphore(3);
sem.acquire(); // 获取许可
sem.release(); // 释放许可
```

---

## 7. 并发容器与原子类
- ConcurrentHashMap、CopyOnWriteArrayList 等线程安全集合
- 原子类（AtomicInteger、AtomicReference 等）支持无锁原子操作

```java
import java.util.concurrent.ConcurrentHashMap;
ConcurrentHashMap<String, Integer> cmap = new ConcurrentHashMap<>();
cmap.put("A", 1);

import java.util.concurrent.atomic.AtomicInteger;
AtomicInteger ai = new AtomicInteger(0);
ai.incrementAndGet();
```

---

## 8. 常见易错点
- 死锁：多个线程互相等待对方释放资源
- 竞态条件：多个线程同时修改共享变量导致数据不一致
- 线程安全集合与普通集合混用
- 忘记释放锁导致程序卡死
- 线程池未关闭导致资源泄漏

---

## 9. 进阶拓展
- AQS（AbstractQueuedSynchronizer）原理
- CAS（Compare And Swap）机制
- 并发设计模式（生产者-消费者、读写锁、线程本地变量等）
- J.U.C 源码分析

---

## 10. 参考资料
- [Java 并发官方教程](https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html)
- 《Java 并发编程实战》
- 《Java 并发编程的艺术》
- 《Effective Java》

> 本文档持续完善，欢迎补充更多并发编程相关案例。 