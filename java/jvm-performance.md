<!-- /**
 * JVM与性能调优
 * @description Java 虚拟机原理与性能优化方法
 */ -->

# Java JVM 与性能调优详解

## 1. JVM 体系结构

JVM（Java Virtual Machine，Java 虚拟机）是 Java 程序运行的核心，主要包括：
- **类加载器（ClassLoader）**：负责加载 .class 字节码文件。
- **运行时数据区**：包括方法区、堆、虚拟机栈、本地方法栈、程序计数器。
- **执行引擎**：解释执行字节码，或通过 JIT 编译成本地代码。
- **本地方法接口（JNI）**：调用本地（C/C++）库。

```
+---------------------+
|    类加载器子系统     |
+---------------------+
|   运行时数据区       |
|  ├─ 方法区           |
|  ├─ 堆               |
|  ├─ 虚拟机栈         |
|  ├─ 本地方法栈       |
|  └─ 程序计数器       |
+---------------------+
|   执行引擎           |
+---------------------+
|   本地方法接口 JNI    |
+---------------------+
```

---

## 2. 垃圾回收（GC）原理与常见算法

- **GC 目标**：自动回收无用对象，释放内存。
- **常见算法**：
  - 标记-清除（Mark-Sweep）
  - 复制算法（Copying）
  - 标记-整理（Mark-Compact）
  - 分代收集（新生代/老年代）
- **常见收集器**：Serial、ParNew、Parallel、CMS、G1、ZGC、Shenandoah

```java
// 手动触发 GC（不推荐，仅用于测试）
System.gc();
```

---

## 3. JVM 参数与调优

### 3.1 堆与栈内存设置
- `-Xms`：初始堆大小
- `-Xmx`：最大堆大小
- `-Xss`：每个线程的栈大小

### 3.2 GC 日志与分析
- `-XX:+PrintGCDetails`：打印 GC 详细日志
- `-XX:+PrintGCDateStamps`：打印 GC 时间戳
- `-Xlog:gc*`：JDK 9+ 新日志格式

### 3.3 其他常用参数
- `-XX:MetaspaceSize`、`-XX:MaxMetaspaceSize`：方法区（元空间）大小
- `-XX:+UseG1GC`：使用 G1 收集器

---

## 4. 性能分析与调优工具

- **jps**：查看 Java 进程
- **jstack**：线程堆栈快照，排查死锁
- **jmap**：内存映像、堆转储
- **jstat**：JVM 运行时统计
- **VisualVM**：图形化分析工具
- **Java Mission Control (JMC)**：JDK 自带性能分析工具

```shell
jps                # 查看所有 Java 进程
jstack <pid>       # 导出线程快照
jmap -heap <pid>   # 查看堆信息
jstat -gc <pid> 1000 10  # 每秒输出 GC 信息
```

---

## 5. 代码示例与调优实战

```java
/**
 * 模拟内存泄漏示例
 */
import java.util.ArrayList;
import java.util.List;

public class MemoryLeakDemo {
    private static List<byte[]> list = new ArrayList<>();
    public static void main(String[] args) {
        while (true) {
            list.add(new byte[1024 * 1024]); // 持续分配内存
        }
    }
}
```

- 运行时可用 `-Xmx32m` 限制最大堆，观察 OOM（OutOfMemoryError）

---

## 6. 常见易错点
- 堆/栈设置过小导致 OOM 或 StackOverflowError
- 忽视 GC 日志，未及时发现内存泄漏
- 频繁 Full GC，应用卡顿
- 误用强引用导致对象无法回收
- 只关注吞吐量忽略延迟

---

## 7. 进阶拓展
- JVM 类加载机制与双亲委派模型
- JIT 编译与逃逸分析
- GC 调优实战（G1、ZGC、CMS 等）
- 内存泄漏排查与 MAT 工具
- 性能基准测试（JMH）

---

## 8. 参考资料
- [Java 官方 JVM 文档](https://docs.oracle.com/javase/specs/jvms/se17/html/index.html)
- [Java 性能调优官方指南](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/performance-enhancements-7.html)
- 《深入理解 Java 虚拟机》
- 《Java 性能权威指南》
- 《Effective Java》
