# TypeScript 基本类型

TypeScript提供了多种数据类型，可以帮助你编写更加安全、可维护的代码。这里我们将介绍TypeScript中的基本类型。

## 基本类型概览

TypeScript支持以下基本类型：

- 布尔值（boolean）
- 数字（number）
- 字符串（string）
- 数组（array）
- 元组（tuple）
- 枚举（enum）
- any
- void
- null 和 undefined
- never
- object
- 类型断言

## 布尔值（Boolean）

最基本的数据类型是布尔值，只有`true`和`false`两个值。

```typescript
let isDone: boolean = false;
let isActive: boolean = true;
```

## 数字（Number）

TypeScript中的所有数字都是浮点数，类型是`number`。支持十进制、十六进制、二进制和八进制字面量。

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let big: bigint = 100n;  // ES2020引入的BigInt
```

## 字符串（String）

使用双引号（"）或单引号（'）表示字符串类型，也支持模板字符串。

```typescript
let color: string = "blue";
let name: string = 'Bob';
let sentence: string = `Hello, my name is ${name}`;
```

## 数组（Array）

TypeScript有两种方式定义数组：

```typescript
// 方式1：类型后跟[]
let list1: number[] = [1, 2, 3];

// 方式2：使用泛型数组类型
let list2: Array<number> = [1, 2, 3];
```

## 元组（Tuple）

元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。

```typescript
// 声明一个元组类型
let x: [string, number];
// 赋值正确的类型
x = ["hello", 10]; // 正确
// 赋值错误的类型会报错
// x = [10, "hello"]; // 错误
```

## 枚举（Enum）

枚举是一种为一组值赋予友好名称的方式。

```typescript
enum Color {Red, Green, Blue}
let c: Color = Color.Green;  // 值为1

// 可以手动设置成员的值
enum Status {
  Success = 200,
  NotFound = 404,
  Error = 500
}
let statusCode: Status = Status.Success;  // 值为200
```

## Any类型

当我们不清楚类型时，可以使用`any`类型，但这会失去类型检查的好处。

```typescript
let notSure: any = 4;
notSure = "maybe a string";
notSure = false; // 也OK
```

## Void类型

`void`表示没有任何类型，通常用作函数返回值的类型标注。

```typescript
function warnUser(): void {
  console.log("This is a warning message");
}

// void类型的变量只能赋值为undefined或null
let unusable: void = undefined;
```

## Null和Undefined

在TypeScript中，`undefined`和`null`有自己的类型。

```typescript
let u: undefined = undefined;
let n: null = null;
```

## Never类型

`never`类型表示永不存在的值的类型，用于表示抛出异常或永不返回的函数返回值类型。

```typescript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

// 推断返回类型为never
function fail() {
  return error("Something failed");
}

// 无限循环的函数也返回never
function infiniteLoop(): never {
  while (true) {}
}
```

## Object类型

`object`表示非原始类型，即除了`number`、`string`、`boolean`、`bigint`、`symbol`、`null`或`undefined`的类型。

```typescript
let obj: object = { name: 'John' };
```

## 类型断言

类型断言类似于类型转换，告诉编译器你比它更了解这个值的类型。

```typescript
// 尖括号语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// as语法（在JSX中只能使用这种语法）
let someValue2: any = "this is a string";
let strLength2: number = (someValue2 as string).length;
```

## 类型推断

TypeScript能够根据初始值自动推断变量的类型。

```typescript
// 不需要指定类型，自动推断为number类型
let age = 25;
// age = "twenty-five"; // 错误：不能将string类型赋值给number类型
```

## 联合类型

联合类型表示一个值可以是几种类型之一。

```typescript
let score: number | string;
score = 98;      // OK
score = "A+";    // 也OK
// score = true; // 错误：boolean不是number或string
```

## 类型别名

类型别名用来给一个类型起个新名字。

```typescript
type ID = number | string;
let studentId: ID = 12345;
let employeeId: ID = "E-12345";
```

理解并正确使用这些基本类型是TypeScript编程的基础，合理的类型使用可以让你的代码更加健壮。 