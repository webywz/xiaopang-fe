# TypeScript 类

TypeScript提供了完整的面向对象编程支持，包括类、接口、继承等特性。本文将详细介绍TypeScript中类的使用方法和高级特性。

## 类的基本语法

类的基本结构包括属性、构造函数和方法。

```typescript
class Person {
  // 属性
  name: string;
  age: number;

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet(): void {
    console.log(`你好，我是${this.name}，今年${this.age}岁`);
  }
}

// 创建类的实例
const alice = new Person("Alice", 28);
alice.greet(); // 输出：你好，我是Alice，今年28岁
```

## 访问修饰符

TypeScript提供了三种访问修饰符来控制类成员的可见性：

- `public`：默认，可以在任何地方访问
- `private`：只能在类内部访问
- `protected`：只能在类内部和子类中访问

```typescript
class Employee {
  public name: string;        // 公共属性，任何地方都可访问
  private salary: number;     // 私有属性，只能在类内部访问
  protected department: string; // 受保护属性，只能在类及其子类中访问

  constructor(name: string, salary: number, department: string) {
    this.name = name;
    this.salary = salary;
    this.department = department;
  }

  // 公共方法
  public displayName(): void {
    console.log(`Name: ${this.name}`);
  }

  // 私有方法
  private calculateBonus(): number {
    return this.salary * 0.1;
  }

  // 受保护方法
  protected getDetails(): string {
    return `${this.name}, Dept: ${this.department}, Salary: ${this.salary}`;
  }

  // 公共方法可以访问私有成员
  public displayInfo(): void {
    console.log(this.getDetails());
    console.log(`Bonus: ${this.calculateBonus()}`);
  }
}

// 创建实例
const john = new Employee("John", 50000, "IT");
john.displayName();   // 正常工作
john.displayInfo();   // 正常工作
// john.salary        // 错误：属性'salary'是私有的
// john.getDetails()  // 错误：方法'getDetails'受保护
// john.calculateBonus() // 错误：方法'calculateBonus'是私有的
```

## 参数属性

TypeScript提供了一个简洁的方式，在构造函数参数中声明和初始化类成员。

```typescript
class Person {
  // 使用访问修饰符直接在构造函数参数中声明属性
  constructor(
    public name: string,
    private age: number,
    protected address: string
  ) {
    // 不需要额外的赋值语句
  }

  getDetails(): string {
    return `${this.name}, ${this.age} years old, ${this.address}`;
  }
}

const person = new Person("Tom", 30, "Beijing");
console.log(person.name);       // 正常访问
console.log(person.getDetails()); // Tom, 30 years old, Beijing
// console.log(person.age);     // 错误：'age'是私有的
// console.log(person.address); // 错误：'address'是受保护的
```

## 只读属性

可以使用`readonly`关键字将属性设为只读，只读属性必须在声明时或在构造函数中初始化。

```typescript
class User {
  readonly id: number;
  readonly name: string;
  age: number;

  constructor(id: number, name: string, age: number) {
    this.id = id;       // 可以在构造函数中初始化
    this.name = name;   // 可以在构造函数中初始化
    this.age = age;
  }

  updateProfile(newAge: number) {
    // this.id = 2;     // 错误：无法分配到"id"，因为它是只读属性
    // this.name = "Bob"; // 错误：无法分配到"name"，因为它是只读属性
    this.age = newAge;  // 正常，age不是只读的
  }
}
```

## 存取器（Getters/Setters）

TypeScript支持通过getters/setters来截取对对象成员的访问。

```typescript
class Product {
  private _price: number = 0;

  // getter
  get price(): number {
    return this._price;
  }

  // setter
  set price(value: number) {
    if (value < 0) {
      throw new Error("价格不能为负数");
    }
    this._price = value;
  }
}

const product = new Product();
product.price = 100;    // 使用setter
console.log(product.price); // 使用getter，输出100

// product.price = -10; // 抛出错误：价格不能为负数
```

## 静态成员

静态成员属于类本身而不是实例，使用`static`关键字声明。

```typescript
class MathUtils {
  // 静态属性
  static PI: number = 3.14159;

  // 静态方法
  static square(x: number): number {
    return x * x;
  }

  // 静态方法可以访问静态属性
  static calculateCircleArea(radius: number): number {
    return MathUtils.PI * MathUtils.square(radius);
  }
}

// 直接通过类访问静态成员
console.log(MathUtils.PI);  // 3.14159
console.log(MathUtils.square(5));  // 25
console.log(MathUtils.calculateCircleArea(2));  // 12.56636
```

## 抽象类

抽象类作为其他派生类的基类使用，不能直接实例化。使用`abstract`关键字定义抽象类和抽象方法。

```typescript
abstract class Shape {
  // 普通属性
  color: string;

  constructor(color: string) {
    this.color = color;
  }

  // 普通方法
  displayColor(): void {
    console.log(`颜色: ${this.color}`);
  }

  // 抽象方法（没有实现）
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
}

class Circle extends Shape {
  radius: number;

  constructor(color: string, radius: number) {
    super(color);  // 调用基类构造函数
    this.radius = radius;
  }

  // 实现抽象方法
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  width: number;
  height: number;

  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }

  // 实现抽象方法
  calculateArea(): number {
    return this.width * this.height;
  }

  calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// const shape = new Shape("red");  // 错误：无法创建抽象类的实例

const circle = new Circle("红色", 5);
circle.displayColor();  // 颜色: 红色
console.log(`圆面积: ${circle.calculateArea()}`);  // 圆面积: 78.53981633974483
console.log(`圆周长: ${circle.calculatePerimeter()}`);  // 圆周长: 31.41592653589793

const rectangle = new Rectangle("蓝色", 4, 6);
rectangle.displayColor();  // 颜色: 蓝色
console.log(`矩形面积: ${rectangle.calculateArea()}`);  // 矩形面积: 24
console.log(`矩形周长: ${rectangle.calculatePerimeter()}`);  // 矩形周长: 20
```

## 继承

类可以通过`extends`关键字继承其他类的属性和方法。

```typescript
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  move(distance: number = 0): void {
    console.log(`${this.name} 移动了 ${distance} 米。`);
  }
}

class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }

  // 重写父类方法
  move(distance: number = 5): void {
    console.log(`${this.breed}狗`);
    super.move(distance);  // 调用父类方法
  }

  // 添加新方法
  bark(): void {
    console.log("汪汪汪！");
  }
}

const dog = new Dog("小黑", "拉布拉多");
dog.move();  // 输出：拉布拉多狗 小黑 移动了 5 米。
dog.bark();  // 输出：汪汪汪！
```

## 类实现接口

类可以通过`implements`关键字实现一个或多个接口。

```typescript
// 定义接口
interface Movable {
  speed: number;
  move(): void;
}

interface Resizable {
  resize(width: number, height: number): void;
}

// 类实现多个接口
class GameObject implements Movable, Resizable {
  // 实现Movable接口的属性
  speed: number;
  
  // 自有属性
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  constructor(speed: number, width: number, height: number) {
    this.speed = speed;
    this.width = width;
    this.height = height;
  }

  // 实现Movable接口的方法
  move(): void {
    this.x += this.speed;
    this.y += this.speed;
    console.log(`物体移动到 (${this.x}, ${this.y})`);
  }

  // 实现Resizable接口的方法
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    console.log(`物体大小调整为 ${width}x${height}`);
  }
}

const gameObject = new GameObject(5, 100, 100);
gameObject.move();      // 物体移动到 (5, 5)
gameObject.resize(150, 150);  // 物体大小调整为 150x150
```

## 类作为类型

在TypeScript中，类不仅定义了类的实例结构，也定义了类的类型。

```typescript
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceFromOrigin(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

// 使用类作为类型
function logPoint(p: Point): void {
  console.log(`坐标: (${p.x}, ${p.y})`);
  console.log(`到原点距离: ${p.distanceFromOrigin()}`);
}

// 正常使用类的实例
const point1 = new Point(3, 4);
logPoint(point1);  // 正常工作

// 使用结构兼容的对象（鸭子类型）
const point2 = { x: 5, y: 12, distanceFromOrigin: () => 13 };
logPoint(point2);  // 也能正常工作，因为结构匹配
```

## 混入（Mixins）

混入是一种设计模式，可以将多个类的功能组合到一个类中。TypeScript通过类继承和交叉类型实现混入。

```typescript
// 混入类 - 添加日志功能
class Loggable {
  log(message: string): void {
    console.log(`日志: ${message}`);
  }
}

// 混入类 - 添加版本控制功能
class Versioned {
  version: number = 1;

  updateVersion(): void {
    this.version++;
    console.log(`版本更新至 ${this.version}`);
  }
}

// 目标类
class Document {
  content: string = "";

  constructor(content: string) {
    this.content = content;
  }
}

// 应用混入
interface Document extends Loggable, Versioned {}

// 实现混入
function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
        Object.create(null)
      );
    });
  });
}

// 应用混入
applyMixins(Document, [Loggable, Versioned]);

// 使用混入后的类
const doc = new Document("Hello, TypeScript Mixins!");
(doc as any).log("文档已创建");  // 日志: 文档已创建
(doc as any).updateVersion();    // 版本更新至 2
console.log(doc.content);        // Hello, TypeScript Mixins!
```

## 泛型类

泛型类使类能够处理多种类型，增加代码的可重用性。

```typescript
class Box<T> {
  private content: T;

  constructor(content: T) {
    this.content = content;
  }

  getContent(): T {
    return this.content;
  }

  setContent(content: T): void {
    this.content = content;
  }
}

// 使用字符串类型
const stringBox = new Box<string>("Hello, TypeScript");
console.log(stringBox.getContent());  // Hello, TypeScript

// 使用数字类型
const numberBox = new Box<number>(42);
console.log(numberBox.getContent());  // 42

// 使用自定义类型
interface Product {
  id: number;
  name: string;
}

const productBox = new Box<Product>({ id: 1, name: "Laptop" });
const product = productBox.getContent();
console.log(`${product.name} (ID: ${product.id})`);  // Laptop (ID: 1)
```

TypeScript的类系统提供了强大的工具来创建基于面向对象编程原则的应用程序。正确理解和使用类特性可以让你的代码更加结构化和可维护。 