<!-- /**
 * Java 常用工具类
 * @description Java 常用工具类与第三方工具库
 */ -->

# Java 常用工具类详解

## 1. 工具类概述

Java 提供了丰富的工具类，极大提升了开发效率。常用工具类主要分为字符串处理、集合操作、数学与随机数、对象与类型、反射等。

## 目录
- [字符串工具类](#字符串工具类)
- [日期工具类](#日期工具类)
- [集合工具类](#集合工具类)
- [对象工具类](#对象工具类)
- [第三方工具库简介](#第三方工具库简介)
- [常见问题 FAQ](#常见问题-faq)

---

## 2. 字符串处理工具

### 2.1 StringBuilder
- 用于高效拼接字符串，避免频繁创建新对象。

```java
/**
 * 使用 StringBuilder 拼接字符串
 */
StringBuilder sb = new StringBuilder();
sb.append("Hello, ");
sb.append("World!");
System.out.println(sb.toString());
```

### 2.2 StringUtils（Apache Commons Lang）
- 提供丰富的字符串处理方法，如判空、截取、替换等。

```java
import org.apache.commons.lang3.StringUtils;
/**
 * 判断字符串是否为空
 */
boolean empty = StringUtils.isEmpty(""); // true
```

---

## 3. 集合工具类

### 3.1 Arrays
- 提供数组排序、查找、填充、转换等静态方法。

```java
import java.util.Arrays;
/**
 * 数组排序与查找
 */
int[] arr = {3, 1, 2};
Arrays.sort(arr);
int idx = Arrays.binarySearch(arr, 2);
System.out.println(Arrays.toString(arr)); // [1, 2, 3]
System.out.println(idx); // 1
```

### 3.2 Collections
- 集合的排序、同步、不可变包装等工具方法。

```java
import java.util.*;
/**
 * 集合反转与同步
 */
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
Collections.reverse(list);
List<String> syncList = Collections.synchronizedList(list);
System.out.println(list); // [C, B, A]
```

### 3.3 Objects
- 对象判空、比较、哈希等工具方法。

```java
import java.util.Objects;
/**
 * 判空与比较
 */
String a = null;
System.out.println(Objects.isNull(a)); // true
System.out.println(Objects.equals("x", "x")); // true
```

---

## 4. 数学与随机数工具

### 4.1 Math
- 数学运算、取整、三角函数、随机数等。

```java
/**
 * 数学运算
 */
double pow = Math.pow(2, 3); // 8.0
double sqrt = Math.sqrt(16); // 4.0
double random = Math.random(); // 0.0~1.0
```

### 4.2 Random
- 生成伪随机数。

```java
import java.util.Random;
/**
 * 生成随机整数
 */
Random rand = new Random();
int n = rand.nextInt(100); // 0~99
```

### 4.3 UUID
- 生成唯一标识符。

```java
import java.util.UUID;
/**
 * 生成 UUID
 */
String uuid = UUID.randomUUID().toString();
System.out.println(uuid);
```

---

## 5. 反射与类型工具

### 5.1 Class
- 获取类信息、动态创建对象。

```java
/**
 * 获取类名
 */
String className = String.class.getName();
System.out.println(className); // java.lang.String
```

### 5.2 java.lang.reflect
- 动态获取字段、方法、构造器，操作对象属性。

```java
import java.lang.reflect.Field;
/**
 * 反射获取字段
 */
class Person {
    public String name = "小胖";
}
Person p = new Person();
Field f = p.getClass().getField("name");
System.out.println(f.get(p)); // 小胖
```

---

## 6. 常见易错点
- String 拼接建议用 StringBuilder
- Arrays.binarySearch 需先排序
- Collections.synchronizedXXX 仅保证集合本身线程安全
- 反射操作需处理异常，注意访问权限
- UUID 不是绝对唯一，仅概率极低重复

---

## 7. 进阶拓展
- Google Guava、Apache Commons 等第三方工具包
- Stream API 与 Lambda 表达式结合工具类
- BeanUtils、PropertyUtils 属性操作
- 反射性能优化与安全限制

---

## 8. 参考资料
- [Java 官方 API 文档](https://docs.oracle.com/javase/8/docs/api/)
- [Apache Commons 官方文档](https://commons.apache.org/)
- [Google Guava 官方文档](https://guava.dev/)
- 《Effective Java》

---

## 常见问题 FAQ

### Q1: 工具类和工具方法的区别？
A: 工具类是封装常用静态方法的类，工具方法是具体的静态方法。

### Q2: Apache Commons 和 Guava 有什么区别？
A: Commons 更偏向基础工具，Guava 功能更丰富，支持缓存、并发等。

### Q3: 如何引入第三方工具库？
A: 使用 Maven/Gradle 添加依赖即可。

---

> 本文档持续完善，欢迎补充更多工具类相关案例。 