# TypeScript 接口

接口是TypeScript中一个强大的特性，它定义了对象的结构和契约，提供了代码的类型检查。本文将详细介绍TypeScript接口的使用。

## 接口基础

接口描述了一个对象应有的属性和方法，但不提供实现。使用`interface`关键字定义接口。

```typescript
interface Person {
  name: string;
  age: number;
}

const person: Person = {
  name: "Alice",
  age: 30
};

// 错误示例：缺少必要属性
// const invalidPerson: Person = {
//   name: "Bob"
// };
```

## 可选属性

接口中的某些属性可能不是必需的，可以使用`?`标记为可选属性。

```typescript
interface Car {
  brand: string;
  model: string;
  year?: number;  // 可选属性
}

const car1: Car = { brand: "Toyota", model: "Corolla" };  // 不包含year也可以
const car2: Car = { brand: "Tesla", model: "Model S", year: 2022 };  // 包含year也可以
```

## 只读属性

使用`readonly`关键字定义只读属性，该属性在创建后不能被修改。

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 10, y: 20 };
// point.x = 5;  // 错误：x是只读属性
```

## 函数类型接口

接口也可以描述函数类型。

```typescript
interface MathFunc {
  (x: number, y: number): number;
}

const add: MathFunc = (x, y) => x + y;
const subtract: MathFunc = (x, y) => x - y;
```

## 索引签名

当你不确定对象具有哪些属性，但知道属性值的类型时，可以使用索引签名。

```typescript
interface StringArray {
  [index: number]: string;  // 数字索引返回字符串
}

const myArray: StringArray = ["Apple", "Banana", "Cherry"];
const item: string = myArray[1];  // Banana

interface Dictionary {
  [key: string]: any;  // 字符串索引返回任意类型
}

const dict: Dictionary = {
  name: "John",
  age: 30,
  isActive: true
};
```

## 接口继承

接口可以继承一个或多个其他接口。

```typescript
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

// 继承多个接口
interface Square extends Shape, PenStroke {
  sideLength: number;
}

const square: Square = {
  color: "blue",
  penWidth: 2.5,
  sideLength: 10
};
```

## 混合类型

JavaScript中的对象可以同时具有多种类型，接口可以描述这种复杂对象。

```typescript
interface Counter {
  (start: number): string;  // 函数
  interval: number;         // 属性
  reset(): void;            // 方法
}

function getCounter(): Counter {
  const counter = function(start: number): string {
    return `计数器从 ${start} 开始`;
  } as Counter;
  
  counter.interval = 123;
  counter.reset = function() {
    console.log("重置计数器");
  };
  
  return counter;
}

const c = getCounter();
c(10);          // 调用函数
c.reset();      // 调用方法
c.interval = 5; // 设置属性
```

## 接口与类

接口可以用来约束类的实现。使用`implements`关键字表示类实现接口。

```typescript
interface Vehicle {
  brand: string;
  speed: number;
  accelerate(speed: number): void;
  brake(): void;
}

class Car implements Vehicle {
  brand: string;
  speed: number = 0;
  
  constructor(brand: string) {
    this.brand = brand;
  }
  
  accelerate(speedIncrement: number): void {
    this.speed += speedIncrement;
    console.log(`速度增加到 ${this.speed}km/h`);
  }
  
  brake(): void {
    this.speed = 0;
    console.log('车辆已停止');
  }
}

const myCar = new Car('Honda');
myCar.accelerate(50);  // 速度增加到 50km/h
myCar.brake();         // 车辆已停止
```

## 接口的合并

TypeScript允许定义多个同名接口，它们会自动合并。

```typescript
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

// 合并后等同于
// interface Box {
//   height: number;
//   width: number;
//   scale: number;
// }

const box: Box = { height: 5, width: 6, scale: 10 };
```

## 接口vs类型别名

接口和类型别名有许多相似之处，但也有一些不同：

```typescript
// 接口
interface Person {
  name: string;
}

// 类型别名
type PersonType = {
  name: string;
};

// 类型别名可以表示基本类型、联合类型、元组等
type ID = number | string;
type Point = [number, number];

// 接口可以被合并，而类型别名不能
interface Person {
  age: number;  // 合法
}

// type PersonType = {  // 错误：重复定义
//   age: number;
// };
```

接口适合定义对象的形状，而类型别名则更加灵活，可以表示更多类型。

## 实际应用示例

在实际开发中，接口常用于：

1. **API响应类型定义**:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

// 使用泛型接口定义API响应
function fetchUsers(): Promise<ApiResponse<User[]>> {
  return fetch('/api/users')
    .then(response => response.json());
}
```

2. **组件属性类型**：

```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function Button(props: ButtonProps) {
  return (
    <button 
      onClick={props.onClick}
      disabled={props.disabled}
      style={props.style}
    >
      {props.text}
    </button>
  );
}
```

3. **状态管理**：

```typescript
interface AppState {
  user: {
    id: string;
    name: string;
    isLoggedIn: boolean;
  };
  theme: 'light' | 'dark';
  preferences: {
    notifications: boolean;
    language: string;
  };
}
```

掌握接口是TypeScript高效开发的关键，它可以帮助你定义清晰的数据结构，实现更好的类型检查和代码提示。 