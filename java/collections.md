/**
 * Java 集合框架
 * @description Java 常用集合类及其使用方法
 */

# Java 集合框架详解

## 1. 集合框架概述

Java 集合框架（Collection Framework）是用于存储、操作和传递数据对象的标准结构，主要包括 List、Set、Map 三大体系。

- **Collection**：集合根接口，子接口有 List、Set、Queue。
- **Map**：键值对集合，独立于 Collection。

集合框架结构图：

```
Collection
 ├── List（有序可重复）
 │    ├── ArrayList
 │    ├── LinkedList
 │    └── Vector
 └── Set（无序不重复）
      ├── HashSet
      ├── LinkedHashSet
      └── TreeSet
Map
 ├── HashMap
 ├── LinkedHashMap
 ├── TreeMap
 └── Hashtable
```

---

## 2. List 接口与实现类

- **ArrayList**：基于动态数组，查询快，增删慢，线程不安全。
- **LinkedList**：基于双向链表，增删快，查询慢。
- **Vector**：线程安全，性能较低。

```java
import java.util.ArrayList;
import java.util.List;

/**
 * 添加与遍历 List
 */
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
for (String s : list) {
    System.out.println(s);
}
```

---

## 3. Set 接口与实现类

- **HashSet**：基于哈希表，无序不重复，允许 null。
- **LinkedHashSet**：有序（插入顺序），不重复。
- **TreeSet**：基于红黑树，自动排序，不重复。

```java
import java.util.HashSet;
import java.util.Set;

/**
 * Set 示例
 */
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.add(1); // 重复元素不会添加
for (int i : set) {
    System.out.println(i);
}
```

---

## 4. Map 接口与实现类

- **HashMap**：基于哈希表，允许 null 键值，线程不安全。
- **LinkedHashMap**：有序（插入顺序），允许 null。
- **TreeMap**：基于红黑树，自动排序，不允许 null 键。
- **Hashtable**：线程安全，不允许 null。

```java
import java.util.HashMap;
import java.util.Map;

/**
 * Map 示例
 */
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);
map.put("A", 3); // 覆盖旧值
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```

---

## 5. 迭代器与 foreach

- **Iterator**：统一遍历集合元素，支持安全删除。
- **foreach**：简化遍历语法。

```java
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

List<String> list = new ArrayList<>();
list.add("A");
list.add("B");

/**
 * 使用 Iterator 遍历
 */
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    System.out.println(s);
}

/**
 * foreach 遍历
 */
for (String s : list) {
    System.out.println(s);
}
```

---

## 6. 泛型与集合

- 泛型保证类型安全，避免强制类型转换。

```java
/**
 * 泛型 List 示例
 */
List<Integer> nums = new ArrayList<>();
nums.add(10);
// nums.add("str"); // 编译错误
```

---

## 7. 线程安全集合与并发包

- **Vector、Hashtable**：早期线程安全集合，性能较低。
- **Collections.synchronizedList/Map/Set**：包装同步集合。
- **java.util.concurrent 包**：高性能并发集合，如 ConcurrentHashMap、CopyOnWriteArrayList。

```java
import java.util.concurrent.ConcurrentHashMap;

/**
 * 并发 Map 示例
 */
ConcurrentHashMap<String, Integer> cmap = new ConcurrentHashMap<>();
cmap.put("A", 1);
```

---

## 8. 常见易错点
- List、Set、Map 区别混淆。
- HashSet/HashMap 元素需重写 `hashCode` 和 `equals`。
- 线程不安全集合在多线程下数据错乱。
- 遍历集合时修改元素需用 Iterator 的 `remove` 方法。

---

## 9. 进阶拓展
- 集合源码分析（如 ArrayList 扩容机制、HashMap 哈希算法）
- 自定义集合类
- Stream API 与集合操作
- 不可变集合（Collections.unmodifiableXXX、List.of 等）

---

## 10. 参考资料
- [Java 官方集合文档](https://docs.oracle.com/javase/tutorial/collections/index.html)
- 《Java 编程思想》
- 《Effective Java》

```java/collections.md
# Java 集合框架

Java 集合框架（Collection Framework）为数据存储、操作和管理提供了丰富的数据结构和算法支持。本章节将介绍 List、Set、Map、Queue 等常用集合接口与实现类，集合的遍历、排序及常用工具类。

## 目录
- [集合框架概述](#集合框架概述)
- [List 接口](#list-接口)
- [Set 接口](#set-接口)
- [Map 接口](#map-接口)
- [Queue 接口](#queue-接口)
- [集合遍历方式](#集合遍历方式)
- [集合排序](#集合排序)
- [常用工具类](#常用工具类)
- [常见问题 FAQ](#常见问题-faq)

---

## 集合框架概述

- 集合用于存储、操作一组数据。
- 常用接口：`List`、`Set`、`Map`、`Queue`
- 集合类位于 `java.util` 包下。

| 接口  | 主要实现类           | 特点           |
|-------|---------------------|----------------|
| List  | ArrayList, LinkedList | 有序、可重复   |
| Set   | HashSet, TreeSet      | 无序、不可重复 |
| Map   | HashMap, TreeMap      | 键值对存储     |
| Queue | LinkedList, PriorityQueue | 队列结构   |

---

## List 接口

- 有序、可重复元素。
- 常用实现：`ArrayList`、`LinkedList`

```java
import java.util.*;
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("A");
System.out.println(list); // [A, B, A]
```

---

## Set 接口

- 无序、不可重复元素。
- 常用实现：`HashSet`、`TreeSet`

```java
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.add(1);
System.out.println(set); // [1, 2]
```

---

## Map 接口

- 键值对存储，键唯一。
- 常用实现：`HashMap`、`TreeMap`

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);
map.put("A", 3);
System.out.println(map); // {A=3, B=2}
```

---

## Queue 接口

- 队列结构，先进先出（FIFO）。
- 常用实现：`LinkedList`、`PriorityQueue`

```java
Queue<String> queue = new LinkedList<>();
queue.offer("A");
queue.offer("B");
System.out.println(queue.poll()); // A
System.out.println(queue); // [B]
```

---

## 集合遍历方式

- for-each 循环
- 迭代器 Iterator
- Java 8 Stream

```java
List<String> list = Arrays.asList("A", "B", "C");
for (String s : list) {
    System.out.println(s);
}

Iterator<String> it = list.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}

list.stream().forEach(System.out::println);
```

---

## 集合排序

- Collections.sort(List)
- 自定义 Comparator

```java
List<Integer> nums = Arrays.asList(3, 1, 2);
Collections.sort(nums);
System.out.println(nums); // [1, 2, 3]

Collections.sort(nums, (a, b) -> b - a);
System.out.println(nums); // [3, 2, 1]
```

---

## 常用工具类

- `Collections`：集合操作工具类（排序、查找、同步等）
- `Arrays`：数组与集合互转、数组操作

```java
List<String> list = Arrays.asList("A", "B");
Collections.reverse(list);
System.out.println(list); // [B, A]
```

---

## 常见问题 FAQ

### Q1: List 和 Set 有什么区别？
A: List 有序可重复，Set 无序不可重复。

### Q2: HashMap 和 TreeMap 区别？
A: HashMap 无序，TreeMap 有序（按键排序）。

### Q3: 如何遍历 Map？
A: 可用 entrySet、keySet、values，推荐 entrySet。

```java
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ":" + entry.getValue());
}
```

---

> 本文档持续完善，欢迎补充更多集合框架相关案例。 