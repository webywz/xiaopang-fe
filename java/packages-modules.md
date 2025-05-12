/**
 * Java 包与模块
 * @description Java 包和模块的基本概念与用法
 */

# Java 包与模块详解

## 1. 包（Package）基础

包（package）是 Java 用于组织类、接口的机制，类似于文件夹。合理使用包有助于代码分层、避免命名冲突、提升可维护性。

### 1.1 包的声明与使用

- 包声明必须是 Java 文件的第一条非注释语句。
- 包名建议全小写，通常采用公司域名倒序加项目名。

```java
/**
 * 包声明示例
 */
package com.xiaopang.demo;

public class HelloWorld {
    public void sayHello() {
        System.out.println("Hello, world!");
    }
}
```

### 1.2 导入其他包的类

```java
import java.util.List;
import com.xiaopang.demo.HelloWorld;

List<String> list = new ArrayList<>();
HelloWorld hw = new HelloWorld();
```

### 1.3 包的访问控制
- `public`：包外可见
- 默认（无修饰符）：仅包内可见

---

## 2. 模块（Module）基础（Java 9+）

模块是 Java 9 引入的新特性，用于更大粒度地组织包和类，提升项目的可维护性和安全性。

### 2.1 module-info.java

每个模块根目录下可有一个 `module-info.java` 文件，声明模块名、依赖和导出包。

```java
/**
 * module-info.java 示例
 */
module com.xiaopang.demo {
    exports com.xiaopang.demo.api; // 导出包
    requires java.sql;            // 依赖其他模块
}
```

### 2.2 模块的依赖与导出
- `exports`：声明哪些包可被外部访问
- `requires`：声明依赖的其他模块

---

## 3. 实践案例

### 3.1 多包项目结构示例
```
com/
 └── xiaopang/
      ├── demo/
      │    └── HelloWorld.java
      └── util/
           └── StringUtils.java
```

### 3.2 跨包访问
```java
// com/xiaopang/util/StringUtils.java
package com.xiaopang.util;

/**
 * 字符串工具类
 */
public class StringUtils {
    /**
     * 判断字符串是否为空
     * @param str 待判断字符串
     * @return 是否为空
     */
    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }
}

// com/xiaopang/demo/HelloWorld.java
package com.xiaopang.demo;
import com.xiaopang.util.StringUtils;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println(StringUtils.isEmpty("")); // true
    }
}
```

---

## 4. 常见易错点
- 包声明与文件夹结构不一致会导致编译错误。
- 同一包下不能有同名类。
- 模块未正确导出包或声明依赖会导致访问失败。
- 默认访问权限（无修饰符）仅包内可见，跨包访问需用 `public`。

---

## 5. 进阶拓展
- 模块间的循环依赖问题
- 使用 `opens` 关键字支持反射访问
- 自动模块与未命名模块兼容性
- 多模块项目的构建与管理（Maven/Gradle）

---

## 6. 参考资料
- [Java 官方包与模块文档](https://docs.oracle.com/javase/specs/jls/se17/html/jls-7.html)
- [Java 9 模块系统官方教程](https://openjdk.org/projects/jigsaw/quick-start)
- 《Effective Java》第三版

## 目录
- [包的概念与作用](#包的概念与作用)
- [包的定义与使用](#包的定义与使用)
- [包的命名规范](#包的命名规范)
- [包的访问控制](#包的访问控制)
- [模块系统简介（Java 9+）](#模块系统简介java-9)
- [module-info.java 文件](#module-infojava-文件)
- [常见问题 FAQ](#常见问题-faq)

---

## 包的概念与作用

- 用于组织类和接口，避免命名冲突。
- 提高代码的可维护性和可读性。

---

## 包的定义与使用

- 使用 `package` 关键字声明包。
- 包名建议与文件夹结构一致。

```java
package com.xiaopang.demo;

public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello from package!");
    }
}
```

- 导入其它包的类：

```java
import java.util.List;
import com.xiaopang.demo.Hello;
```

---

## 包的命名规范

- 一般采用公司域名倒写加项目名，如 `com.example.project`。
- 包名全部小写，多个单词用点分隔。

| 示例包名                | 说明         |
|------------------------|--------------|
| com.xiaopang.blog      | 推荐         |
| org.apache.commons     | 推荐         |
| com.example.myapp.util | 推荐         |

---

## 包的访问控制

- `public`：对所有类可见
- `protected`：同包或子类可见
- 默认（无修饰符）：同包可见
- `private`：仅类内部可见

```java
package com.xiaopang.demo;

public class A {
    int x = 1; // 默认，同包可见
    public int y = 2; // 所有可见
    private int z = 3; // 仅类内可见
}
```

---

## 模块系统简介（Java 9+）

- Java 9 引入模块系统（JPMS），用于更大粒度的代码组织。
- 每个模块有自己的 `module-info.java` 文件。
- 模块可导出包、声明依赖。

---

## module-info.java 文件

```java
module com.xiaopang.demo {
    exports com.xiaopang.demo.api;
    requires java.sql;
}
```
- `exports`：导出包
- `requires`：声明依赖模块

---

## 常见问题 FAQ

### Q1: 包名和文件夹结构必须一致吗？
A: 必须一致，否则编译器无法正确识别。

### Q2: 一个文件可以有多个包声明吗？
A: 不可以，每个 Java 文件只能有一个 package 声明。

### Q3: 模块和包的区别？
A: 包是类的集合，模块是包的集合，模块有更强的封装和依赖管理能力。

---

> 本文档持续完善，欢迎补充更多包与模块相关案例。 