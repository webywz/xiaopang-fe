# TypeScript 函数

函数是JavaScript中的基本构建块，TypeScript通过添加类型为函数提供了更强大的类型检查能力。本文将详细介绍TypeScript中函数的使用。

## 函数类型基础

在TypeScript中，可以为函数的参数和返回值指定类型。

```typescript
// 基本函数定义
function add(x: number, y: number): number {
  return x + y;
}

// 箭头函数
const multiply = (x: number, y: number): number => x * y;
```

## 函数类型表达式

你可以使用函数类型表达式来描述函数类型。

```typescript
// 定义函数类型
type MathFunction = (x: number, y: number) => number;

// 使用函数类型
const add: MathFunction = (x, y) => x + y;
const subtract: MathFunction = (x, y) => x - y;
```

## 可选参数和默认参数

TypeScript支持可选参数和默认参数值。

```typescript
// 可选参数（使用?标记）
function buildName(firstName: string, lastName?: string): string {
  if (lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName;
}

// 默认参数
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// 调用函数
buildName("Tom");            // 返回 "Tom"
buildName("Tom", "Smith");   // 返回 "Tom Smith"
greet("John");               // 返回 "Hello, John!"
greet("John", "Hi");         // 返回 "Hi, John!"
```

## 剩余参数

使用展开运算符`...`可以接受多个参数作为数组。

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2);           // 返回 3
sum(1, 2, 3, 4, 5);  // 返回 15
```

## 函数重载

TypeScript支持函数重载，允许一个函数根据不同参数类型有不同的返回类型。

```typescript
// 重载签名
function process(x: number): number;
function process(x: string): string;

// 实现签名（不对外暴露）
function process(x: number | string): number | string {
  if (typeof x === "number") {
    return x * 2;
  } else {
    return x.repeat(2);
  }
}

// 使用重载函数
const num = process(10);     // 类型为number，值为20
const str = process("hi");   // 类型为string，值为"hihi"
```

## This参数

TypeScript可以显式指定函数中`this`的类型。

```typescript
interface Person {
  name: string;
  greet(this: Person): void;
}

const person: Person = {
  name: "Alice",
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

person.greet();  // 输出 "Hello, my name is Alice"

// TypeScript可以防止错误的this绑定
// const wrongGreet = person.greet;
// wrongGreet();  // 错误：'this' 上下文为'void'类型
```

## 泛型函数

泛型允许函数处理多种类型，同时保持类型安全。

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 明确指定类型参数
const output1 = identity<string>("myString");  // 类型为string
// 类型推断
const output2 = identity(123);  // 类型为number

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair<string, number>("hello", 42);  // 类型为[string, number]
const p2 = pair(true, [1, 2, 3]);              // 类型为[boolean, number[]]
```

## 回调函数参数

当函数接受回调函数作为参数时，可以指定回调函数的类型。

```typescript
// 定义回调函数类型
type CallbackFunction = (error: Error | null, result: string) => void;

// 使用回调函数
function fetchData(callback: CallbackFunction): void {
  try {
    // 模拟异步操作
    setTimeout(() => {
      callback(null, "Data fetched successfully");
    }, 1000);
  } catch (error) {
    callback(error as Error, "");
  }
}

// 使用回调函数
fetchData((error, result) => {
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Result:", result);
  }
});
```

## 构造函数类型

TypeScript可以描述构造函数类型。

```typescript
// 定义构造函数类型
interface PersonConstructor {
  new (name: string, age: number): Person;
}

interface Person {
  name: string;
  age: number;
  greet(): void;
}

// 实现Person
class PersonImpl implements Person {
  constructor(public name: string, public age: number) {}
  
  greet() {
    console.log(`Hi, I'm ${this.name} and I'm ${this.age} years old.`);
  }
}

// 工厂函数接受构造函数类型
function createPerson(ctor: PersonConstructor, name: string, age: number): Person {
  return new ctor(name, age);
}

const john = createPerson(PersonImpl, "John", 30);
john.greet();  // 输出 "Hi, I'm John and I'm 30 years old."
```

## 函数柯里化

TypeScript能够类型安全地表达柯里化函数。

```typescript
// 柯里化函数类型
type CurriedAdd = (a: number) => (b: number) => number;

// 柯里化函数实现
const curriedAdd: CurriedAdd = (a) => (b) => a + b;

// 使用柯里化函数
const add5 = curriedAdd(5);  // 返回一个接受一个参数的函数
console.log(add5(3));        // 输出 8
```

## 函数重写和继承

在类中使用函数重写时，TypeScript会进行类型检查。

```typescript
class Animal {
  move(distance: number = 0): void {
    console.log(`Animal moved ${distance}m.`);
  }
}

class Dog extends Animal {
  // 重写父类方法
  move(distance: number = 5): void {
    console.log("Dog is running...");
    super.move(distance);  // 调用父类方法
  }
  
  // 添加新方法
  bark(): void {
    console.log("Woof! Woof!");
  }
}

const dog = new Dog();
dog.move();  // 输出 "Dog is running..." 然后 "Animal moved 5m."
dog.bark();  // 输出 "Woof! Woof!"
```

## 异步函数和Promise

TypeScript可以很好地处理异步函数和Promise。

```typescript
// 返回Promise的异步函数
async function fetchUserData(userId: string): Promise<{ name: string; email: string }> {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "John Doe",
        email: "john@example.com"
      });
    }, 1000);
  });
}

// 使用异步函数
async function displayUserInfo(userId: string): Promise<void> {
  try {
    const user = await fetchUserData(userId);
    console.log(`用户名: ${user.name}, 邮箱: ${user.email}`);
  } catch (error) {
    console.error("获取用户数据时出错:", error);
  }
}

displayUserInfo("user123");  // 最终输出 "用户名: John Doe, 邮箱: john@example.com"
```

## 函数类型兼容性

TypeScript使用结构化类型系统，函数类型的兼容性基于参数类型和返回类型。

```typescript
// 目标函数类型
type Logger = (message: string) => void;

// 源函数
function log(message: string, level: string = "info"): void {
  console.log(`[${level}] ${message}`);
}

// 具有更多参数的函数可以赋值给具有更少参数的函数类型
const logger: Logger = log;  // 有效

// 参数类型必须兼容
function stringToNumber(s: string): number {
  return s.length;
}

// 返回类型必须兼容，参数类型必须相同或更宽松
const strLogger: (msg: string) => string = (msg) => {
  console.log(msg);
  return msg;
};

// 函数可以返回更具体的类型
const myLogger: Logger = strLogger;  // 有效，返回string可以赋给期望void的类型
```

函数是TypeScript中最基本的构建块之一，理解如何正确使用函数类型可以极大提高代码的类型安全性和可维护性。 