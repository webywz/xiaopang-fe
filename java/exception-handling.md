<!-- /**
 * Java 异常处理
 * @description Java 异常机制与最佳实践
 */ -->

# Java 异常处理详解

## 1. 异常体系结构

Java 异常体系分为三大类：
- **Error**：严重错误，程序无法处理（如 OutOfMemoryError）。
- **Exception**：可处理的异常。
  - **受检异常（Checked Exception）**：编译器强制检查，必须处理（如 IOException）。
  - **非受检异常（Unchecked Exception）**：运行时异常，编译器不强制处理（如 NullPointerException）。

```
Throwable
 ├── Error
 └── Exception
      ├── RuntimeException
      └── 其他受检异常
```

---

## 2. 异常的捕获与处理

- 使用 `try-catch-finally` 结构捕获和处理异常。
- `finally` 块总会执行（即使有 return），常用于资源释放。

```java
/**
 * 文件读取异常处理示例
 */
try {
    // 可能抛出异常的代码
    int a = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("发生算术异常: " + e.getMessage());
} finally {
    System.out.println("无论如何都会执行");
}
```

---

## 3. throws 与 throw 关键字

- `throws`：声明方法可能抛出的异常，交由调用者处理。
- `throw`：主动抛出异常对象。

```java
/**
 * 声明抛出异常
 * @throws IOException IO异常
 */
public void readFile(String path) throws IOException {
    // ...
}

/**
 * 主动抛出异常
 * @throws IllegalArgumentException 参数非法
 */
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("年龄不能为负数");
    }
}
```

---

## 4. 自定义异常

- 继承 Exception 或 RuntimeException 实现自定义异常。

```java
/**
 * 自定义业务异常
 */
public class BusinessException extends Exception {
    public BusinessException(String message) {
        super(message);
    }
}

// 使用自定义异常
public void doBusiness() throws BusinessException {
    throw new BusinessException("业务异常");
}
```

---

## 5. 常见标准异常类型
- NullPointerException
- ArrayIndexOutOfBoundsException
- IllegalArgumentException
- IOException
- ClassNotFoundException
- NumberFormatException

---

## 6. 异常链与异常传播

- 异常链：一个异常因另一个异常引发，可用构造方法传递 cause。
- 异常传播：异常未捕获时会沿调用栈向上传递，直到被捕获或导致程序终止。

```java
/**
 * 异常链示例
 */
try {
    try {
        throw new IOException("IO错误");
    } catch (IOException e) {
        throw new RuntimeException("运行时异常", e);
    }
} catch (RuntimeException e) {
    e.printStackTrace();
}
```

---

## 7. 常见易错点
- 只写 try 没有 catch 或 finally 会编译错误。
- 捕获异常后未处理直接忽略。
- 捕获过于宽泛（如 Exception），不利于定位问题。
- finally 中 return 会覆盖 try/catch 的 return。
- 受检异常未声明或未捕获会编译失败。

---

## 8. 进阶拓展
- try-with-resources 自动关闭资源（Java 7+）
- 日志与异常结合（如 log.error(e)）
- 全局异常处理（如 Spring @ControllerAdvice）
- 异常与断言（assert）

---

## 9. 参考资料
- [Java 官方异常处理文档](https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html)
- 《Effective Java》
- 《Java 编程思想》

---

## 目录
- [异常体系结构](#异常体系结构)
- [try-catch-finally](#try-catch-finally)
- [throws 与 throw](#throws-与-throw)
- [常见异常类型](#常见异常类型)
- [自定义异常](#自定义异常)
- [异常链](#异常链)
- [常见问题 FAQ](#常见问题-faq)

---

## 异常体系结构

- 所有异常继承自 `Throwable` 类。
- 主要分为 `Error`、`Exception` 两大类。
- `Exception` 又分为**受检异常**（Checked）和**非受检异常**（Unchecked）。

| 类型         | 说明           | 示例                   |
| ------------ | -------------- | ---------------------- |
| Error        | 严重错误，程序无法处理 | OutOfMemoryError      |
| 受检异常     | 编译期必须处理   | IOException, SQLException |
| 非受检异常   | 运行时异常      | NullPointerException, ArithmeticException |

---

## try-catch-finally

- 用于捕获和处理异常，`finally` 块总会执行。

```java
try {
    int a = 1 / 0;
} catch (ArithmeticException e) {
    System.out.println("发生算术异常: " + e.getMessage());
} finally {
    System.out.println("无论如何都会执行");
}
```

---

## throws 与 throw

- `throws` 用于方法声明，抛出受检异常。
- `throw` 用于方法体内，主动抛出异常。

```java
public void readFile(String path) throws IOException {
    if (path == null) {
        throw new IOException("路径不能为空");
    }
    // 读取文件逻辑
}
```

---

## 常见异常类型

- `NullPointerException`：空指针异常
- `ArrayIndexOutOfBoundsException`：数组越界
- `ClassCastException`：类型转换异常
- `NumberFormatException`：数字格式异常
- `IOException`：IO异常

---

## 自定义异常

- 继承 `Exception` 或 `RuntimeException` 实现自定义异常。

```java
/**
 * 自定义业务异常
 */
public class BizException extends Exception {
    public BizException(String msg) {
        super(msg);
    }
}

// 使用自定义异常
throw new BizException("业务错误");
```

---

## 异常链

- 异常链用于保留原始异常信息，便于排查。

```java
try {
    // 可能抛出异常的代码
} catch (IOException e) {
    throw new RuntimeException("包装异常", e);
}
```

---

## 常见问题 FAQ

### Q1: 受检异常和非受检异常区别？
A: 受检异常必须显式处理（try-catch 或 throws），非受检异常可不处理。

### Q2: finally 一定会执行吗？
A: 除非 JVM 退出或 System.exit，否则 finally 总会执行。

### Q3: 自定义异常用 Exception 还是 RuntimeException？
A: 业务异常建议继承 Exception，程序性异常可继承 RuntimeException。

---

> 本文档持续完善，欢迎补充更多异常处理相关案例。 