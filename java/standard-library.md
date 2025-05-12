/**
 * Java 标准库
 * @description Java 标准库常用类与方法
 */

# Java 标准库详解

## 1. Java 标准库（JDK）概述

Java 标准库（JDK）是 Java 语言自带的基础类库，涵盖了开发中常用的各种功能模块。掌握标准库的使用是高效开发 Java 程序的基础。

---

## 2. 常用包与核心类

### 2.1 java.lang
- **Object**：所有类的基类
- **String**：字符串处理
- **Math**：数学运算
- **System**：系统相关操作
- **Thread、Runnable**：多线程支持

```java
/**
 * 字符串拼接与数学运算
 */
String s = "Hello, " + "World!";
int max = Math.max(10, 20);
System.out.println(s + " 最大值：" + max);
```

### 2.2 java.util
- **List、Set、Map**：集合框架
- **Date、Calendar**：日期时间（推荐用 java.time）
- **Random**：随机数
- **Arrays、Collections**：集合工具类

```java
import java.util.*;
/**
 * 集合与工具类示例
 */
List<String> list = Arrays.asList("A", "B", "C");
Collections.shuffle(list);
System.out.println(list);
```

### 2.3 java.io
- **File**：文件与目录操作
- **InputStream/OutputStream**：字节流
- **Reader/Writer**：字符流

```java
import java.io.*;
/**
 * 文件写入示例
 * @throws IOException IO异常
 */
public void writeFile(String path) throws IOException {
    try (BufferedWriter bw = new BufferedWriter(new FileWriter(path))) {
        bw.write("标准库 IO 示例");
    }
}
```

### 2.4 java.math
- **BigInteger**：任意精度整数
- **BigDecimal**：高精度浮点数

```java
import java.math.BigDecimal;
/**
 * 高精度计算
 */
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
BigDecimal sum = a.add(b);
System.out.println(sum); // 0.3
```

### 2.5 java.time（Java 8+）
- **LocalDate、LocalTime、LocalDateTime**：现代日期时间 API
- **DateTimeFormatter**：格式化

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
/**
 * 日期时间格式化
 */
LocalDateTime now = LocalDateTime.now();
String formatted = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
System.out.println(formatted);
```

### 2.6 java.net
- **URL、URLConnection**：网络资源访问
- **Socket、ServerSocket**：网络通信

```java
import java.net.URL;
import java.util.Scanner;
/**
 * 读取网页内容
 * @throws Exception 网络异常
 */
public void readWeb(String urlStr) throws Exception {
    URL url = new URL(urlStr);
    try (Scanner sc = new Scanner(url.openStream(), "UTF-8")) {
        while (sc.hasNextLine()) {
            System.out.println(sc.nextLine());
        }
    }
}
```

---

## 3. 常见易错点
- String 拼接频繁建议用 StringBuilder
- Date/Calendar 已过时，推荐 java.time
- BigDecimal 构造需用字符串避免精度丢失
- IO 流未关闭导致资源泄漏
- 集合操作注意线程安全

---

## 4. 进阶拓展
- 反射（java.lang.reflect）与动态代理
- 并发包（java.util.concurrent）
- 注解（java.lang.annotation）与元注解
- 国际化（java.util.ResourceBundle）
- 安全与加密（java.security、javax.crypto）

---

## 5. 参考资料
- [Java 官方 API 文档](https://docs.oracle.com/javase/8/docs/api/)
- 《Java 编程思想》
- 《Effective Java》

> 本文档持续完善，欢迎补充更多标准库相关案例。 