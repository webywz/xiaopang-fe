/**
 * Java 基础语法
 * @description Java 语言的基本语法规则和常用语法结构
 */

# Java 基础语法详解

## 1. 语法概述

Java 是一种强类型、面向对象的编程语言，具有良好的跨平台能力。Java 程序以类为基本单位，所有代码都必须写在类中。Java 采用严格的语法规则，强调类型安全和结构化编程。

## 2. 变量与数据类型

Java 变量分为基本数据类型和引用数据类型。

### 2.1 基本数据类型
- 整型：`byte`、`short`、`int`、`long`
- 浮点型：`float`、`double`
- 字符型：`char`
- 布尔型：`boolean`

```java
/**
 * 整型变量示例
 */
int age = 25;
long population = 8000000000L;

/**
 * 浮点型变量示例
 */
double price = 19.99;
float rate = 0.85f;

/**
 * 字符型与布尔型变量示例
 */
char grade = 'A';
boolean isActive = true;
```

### 2.2 引用数据类型
- 类（如 `String`、自定义类）
- 数组
- 接口
- 枚举

```java
/**
 * 字符串和数组示例
 */
String name = "小胖";
int[] scores = {90, 85, 100};
```

## 3. 运算符

- 算术运算符：`+`、`-`、`*`、`/`、`%`
- 赋值运算符：`=`、`+=`、`-=` 等
- 比较运算符：`==`、`!=`、`>`、`<`、`>=`、`<=`
- 逻辑运算符：`&&`、`||`、`!`

```java
/**
 * 算术与逻辑运算符示例
 */
int a = 10, b = 3;
int sum = a + b; // 13
boolean result = (a > b) && (b > 0); // true
```

## 4. 流程控制

### 4.1 条件语句

```java
/**
 * if-else 语句示例
 */
int score = 85;
if (score >= 90) {
  System.out.println("优秀");
} else if (score >= 60) {
  System.out.println("及格");
} else {
  System.out.println("不及格");
}

/**
 * switch 语句示例
 */
char level = 'B';
switch (level) {
  case 'A':
    System.out.println("优秀");
    break;
  case 'B':
    System.out.println("良好");
    break;
  default:
    System.out.println("其他");
}
```

### 4.2 循环语句

```java
/**
 * for 循环示例
 */
for (int i = 0; i < 5; i++) {
  System.out.println("第" + i + "次循环");
}

/**
 * while 循环示例
 */
int n = 3;
while (n > 0) {
  System.out.println(n);
  n--;
}

/**
 * do-while 循环示例
 */
int m = 0;
do {
  System.out.println(m);
  m++;
} while (m < 3);
```

## 5. 方法与参数

Java 方法必须定义在类中，支持参数和返回值。

```java
/**
 * 计算两个整数之和
 * @param a 第一个整数
 * @param b 第二个整数
 * @return 两数之和
 */
public int add(int a, int b) {
  return a + b;
}

/**
 * 无返回值方法示例
 * @param name 用户名
 */
public void greet(String name) {
  System.out.println("你好，" + name);
}
```

## 6. 数组

数组是存储同类型数据的容器，长度固定。

```java
/**
 * 一维数组声明与遍历
 */
int[] arr = {1, 2, 3, 4};
for (int i = 0; i < arr.length; i++) {
  System.out.println(arr[i]);
}

/**
 * 二维数组声明与访问
 */
int[][] matrix = new int[2][3];
matrix[0][1] = 5;
```

## 7. 常见易错点
- 变量未初始化直接使用会报错。
- 数组越界（访问不存在的下标）。
- 基本类型与引用类型的区别（如 `int` 与 `Integer`）。
- `==` 比较引用类型时比较的是地址。

## 8. 进阶拓展
- 自动装箱与拆箱
- 可变参数方法（varargs）
- 方法重载与重写
- 基本类型的默认值

## 9. 参考资料
- [Java 官方文档](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/index.html)
- 《Java 编程思想》
- 《Head First Java》

---

## 目录
- [变量与数据类型](#变量与数据类型)
- [运算符](#运算符)
- [流程控制](#流程控制)
- [方法定义与调用](#方法定义与调用)
- [注释](#注释)
- [输入输出](#输入输出)
- [常见问题 FAQ](#常见问题-faq)

---

## 变量与数据类型

Java 是强类型语言，所有变量都必须先声明类型。

```java
int age = 18;
double price = 99.5;
char gender = 'M';
boolean isActive = true;
String name = "小胖";
```

| 类型      | 关键字   | 示例         |
| --------- | -------- | ------------ |
| 整数      | int      | int a = 10;  |
| 浮点数    | double   | double b=1.2;|
| 字符      | char     | char c='A';  |
| 布尔      | boolean  | boolean f;   |
| 字符串    | String   | String s;    |

---

## 运算符

- 算术运算符：`+ - * / % ++ --`
- 关系运算符：`== != > < >= <=`
- 逻辑运算符：`&& || !`
- 赋值运算符：`= += -= *= /= %=`

```java
int a = 5, b = 2;
System.out.println(a + b); // 7
System.out.println(a / b); // 2
System.out.println(a > b && b > 0); // true
```

---

## 流程控制

### 条件语句
```java
if (age >= 18) {
    System.out.println("成年人");
} else {
    System.out.println("未成年人");
}
```

### switch 语句
```java
int day = 2;
switch (day) {
    case 1:
        System.out.println("星期一");
        break;
    case 2:
        System.out.println("星期二");
        break;
    default:
        System.out.println("其他");
}
```

### 循环语句
```java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}

int j = 0;
while (j < 3) {
    System.out.println(j);
    j++;
}
```

---

## 方法定义与调用

```java
/**
 * 计算两个整数的和
 * @param a 第一个整数
 * @param b 第二个整数
 * @return 两数之和
 */
public static int sum(int a, int b) {
    return a + b;
}

// 调用方法
int result = sum(3, 5);
System.out.println(result); // 8
```

---

## 注释

- 单行注释：`// 这是单行注释`
- 多行注释：
  ```java
  /* 这是多行注释 */
  ```
- 文档注释（JSDoc）：
  ```java
  /**
   * 这是文档注释
   * @author 小胖
   */
  ```

---

## 输入输出

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
System.out.print("请输入姓名：");
String name = sc.nextLine();
System.out.println("你好，" + name);
```

---

## 常见问题 FAQ

### Q1: Java 变量必须先声明吗？
A: 是的，Java 是强类型语言，变量必须声明类型。

### Q2: Java 支持类型自动转换吗？
A: 支持部分自动类型转换（如 int -> double），但高精度转低精度需强制转换。

### Q3: main 方法必须是 static 吗？
A: 是的，main 方法是程序入口，必须声明为 static。

---

> 本文档持续完善，欢迎补充更多基础语法案例。 