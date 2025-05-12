/**
 * Java 面向对象
 * @description Java 面向对象编程核心思想与语法
 */

# Java 面向对象编程（OOP）详解

## 1. 面向对象基本概念

面向对象编程（OOP）是 Java 的核心思想，主要包括四大特性：封装、继承、多态、抽象。

- **封装**：将数据和操作数据的方法绑定在一起，隐藏实现细节。
- **继承**：子类自动拥有父类的属性和方法，实现代码复用。
- **多态**：同一方法调用在不同对象上表现出不同的行为。
- **抽象**：抽取共性，定义抽象类或接口，约束子类实现。

---

## 2. 类与对象的定义与使用

```java
/**
 * 学生类
 */
public class Student {
    /** 学号 */
    private String id;
    /** 姓名 */
    private String name;

    /**
     * 构造方法
     * @param id 学号
     * @param name 姓名
     */
    public Student(String id, String name) {
        this.id = id;
        this.name = name;
    }

    /**
     * 获取学生姓名
     * @return 姓名
     */
    public String getName() {
        return name;
    }
}

// 创建对象
Student stu = new Student("001", "小胖");
System.out.println(stu.getName());
```

---

## 3. 构造方法与 this/super 关键字

- `this`：指向当前对象
- `super`：指向父类对象

```java
/**
 * 父类 Person
 */
public class Person {
    protected String name;
    public Person(String name) {
        this.name = name;
    }
}

/**
 * 子类 Student 继承 Person
 */
public class Student extends Person {
    private String id;
    public Student(String id, String name) {
        super(name); // 调用父类构造方法
        this.id = id;
    }
}
```

---

## 4. 继承与方法重写

- 子类通过 `extends` 继承父类。
- 子类可重写（Override）父类方法，需加 `@Override` 注解。

```java
public class Animal {
    public void speak() {
        System.out.println("动物叫声");
    }
}

public class Dog extends Animal {
    /**
     * 重写父类 speak 方法
     */
    @Override
    public void speak() {
        System.out.println("汪汪汪");
    }
}

Animal a = new Dog();
a.speak(); // 输出：汪汪汪
```

---

## 5. 多态与接口

- 多态：父类引用指向子类对象，方法调用表现为子类实现。
- 接口（interface）：定义规范，类用 `implements` 实现接口。

```java
/**
 * 动物接口
 */
public interface Animal {
    /** 发声方法 */
    void speak();
}

/**
 * 狗类实现 Animal 接口
 */
public class Dog implements Animal {
    @Override
    public void speak() {
        System.out.println("汪汪汪");
    }
}

Animal animal = new Dog();
animal.speak(); // 输出：汪汪汪
```

---

## 6. 抽象类与抽象方法

- 抽象类不能实例化，只能被继承。
- 抽象方法无方法体，子类必须实现。

```java
/**
 * 抽象动物类
 */
public abstract class Animal {
    /**
     * 抽象方法：发声
     */
    public abstract void speak();
}

public class Cat extends Animal {
    @Override
    public void speak() {
        System.out.println("喵喵喵");
    }
}

Animal cat = new Cat();
cat.speak(); // 输出：喵喵喵
```

---

## 7. 常见易错点
- 构造方法没有返回值类型。
- 子类重写方法时，方法签名必须一致。
- 抽象类不能直接实例化。
- 接口中的方法默认是 `public abstract`。
- 多态下只能访问父类/接口声明的方法。

---

## 8. 进阶拓展
- 接口的默认方法（default method）与静态方法
- 多重继承与接口多实现
- 抽象类与接口的选择
- 设计模式中的 OOP 应用（如工厂、策略、模板方法等）

---

## 9. 参考资料
- [Java 官方 OOP 文档](https://docs.oracle.com/javase/tutorial/java/concepts/index.html)
- 《Java 编程思想》
- 《Head First Java》

## 目录
- [类与对象](#类与对象)
- [封装](#封装)
- [继承](#继承)
- [多态](#多态)
- [抽象类与接口](#抽象类与接口)
- [方法重载与重写](#方法重载与重写)
- [this 与 super 关键字](#this-与-super-关键字)
- [对象的创建与销毁](#对象的创建与销毁)
- [常见问题 FAQ](#常见问题-faq)

---

## 类与对象

- 类是对象的模板，对象是类的实例。

```java
/**
 * 学生类
 */
public class Student {
    String name;
    int age;

    public void study() {
        System.out.println(name + " 正在学习");
    }
}

// 创建对象
Student stu = new Student();
stu.name = "小胖";
stu.age = 20;
stu.study();
```

---

## 封装

- 通过访问修饰符隐藏实现细节，只暴露必要接口。

```java
public class Person {
    private String name;
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    private int age;
}
```

---

## 继承

- 使用 `extends` 关键字实现类的继承。

```java
public class Animal {
    public void eat() { System.out.println("吃饭"); }
}

public class Dog extends Animal {
    public void bark() { System.out.println("汪汪"); }
}

Dog dog = new Dog();
dog.eat(); // 继承自 Animal
dog.bark();
```

---

## 多态

- 父类引用指向子类对象，方法调用表现不同。

```java
Animal a = new Dog();
a.eat(); // 调用的是 Dog 的 eat 方法（如果重写了）
```

---

## 抽象类与接口

- 抽象类用 `abstract` 修饰，接口用 `interface` 定义。

```java
public abstract class Shape {
    public abstract double area();
}

public interface Drawable {
    void draw();
}

public class Circle extends Shape implements Drawable {
    public double area() { return 3.14 * r * r; }
    public void draw() { System.out.println("画圆"); }
    private double r;
}
```

---

## 方法重载与重写

- **重载**：同类中方法名相同，参数不同。
- **重写**：子类重写父类方法，需 `@Override` 注解。

```java
public class MathUtil {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
}

public class Animal {
    public void eat() { System.out.println("吃饭"); }
}
public class Dog extends Animal {
    @Override
    public void eat() { System.out.println("狗吃骨头"); }
}
```

---

## this 与 super 关键字

- `this`：指向当前对象
- `super`：指向父类对象

```java
public class Parent {
    public void hello() { System.out.println("父类方法"); }
}
public class Child extends Parent {
    public void hello() {
        super.hello(); // 调用父类方法
        System.out.println("子类方法");
    }
}
```

---

## 对象的创建与销毁

- 使用 `new` 创建对象
- 对象销毁由垃圾回收器自动完成，可重写 `finalize()` 方法（不推荐）

---

## 常见问题 FAQ

### Q1: Java 支持多继承吗？
A: 类不支持多继承，但接口可以多实现。

### Q2: 抽象类和接口的区别？
A: 抽象类可有实现方法，接口只能有抽象方法（Java 8+ 接口可有默认方法）。

### Q3: 如何实现多态？
A: 父类引用指向子类对象，重写方法实现多态。

---

> 本文档持续完善，欢迎补充更多面向对象相关案例。 