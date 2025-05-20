# Rust 基础语法

本文将介绍 Rust 的基础语法知识。

## 变量与常量

### 变量声明

```rust
// 变量声明
let x = 5;              // 不可变变量
let mut y = 10;         // 可变变量

// 类型注解
let z: i32 = 15;        // 显式类型注解
let mut w: f64 = 3.14;  // 浮点数类型
```

### 常量

```rust
const MAX_POINTS: u32 = 100_000;  // 常量必须指定类型
static PROGRAM_NAME: &str = "Rust Demo";  // 静态变量
```

## 基本数据类型

### 标量类型

1. **整数类型**
   ```rust
   let a: i8 = 127;     // 有符号 8 位整数
   let b: u8 = 255;     // 无符号 8 位整数
   let c: i32 = 1000;   // 有符号 32 位整数
   let d: u64 = 1000;   // 无符号 64 位整数
   ```

2. **浮点类型**
   ```rust
   let x: f32 = 3.14;   // 32 位浮点数
   let y: f64 = 3.14;   // 64 位浮点数
   ```

3. **布尔类型**
   ```rust
   let t = true;
   let f: bool = false;
   ```

4. **字符类型**
   ```rust
   let c = 'z';
   let z: char = 'ℤ';
   let heart_eyed_cat = '😻';
   ```

### 复合类型

1. **元组**
   ```rust
   let tup: (i32, f64, u8) = (500, 6.4, 1);
   let (x, y, z) = tup;  // 解构
   let first = tup.0;    // 访问元素
   ```

2. **数组**
   ```rust
   let a = [1, 2, 3, 4, 5];
   let b: [i32; 5] = [1, 2, 3, 4, 5];
   let c = [3; 5];       // [3, 3, 3, 3, 3]
   ```

## 函数

### 函数定义

```rust
fn main() {
    println!("Hello, world!");
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // 隐式返回
}

fn calculate(x: i32, y: i32) -> i32 {
    let result = x + y;
    return result;  // 显式返回
}
```

### 函数参数

```rust
fn print_sum(a: i32, b: i32) {
    println!("sum is: {}", a + b);
}

fn get_square(num: i32) -> i32 {
    num * num
}
```

## 控制流

### if 表达式

```rust
fn main() {
    let number = 7;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }

    // if 作为表达式
    let condition = true;
    let number = if condition { 5 } else { 6 };
}
```

### 循环

1. **loop**
   ```rust
   loop {
       println!("again!");
       break;  // 退出循环
   }
   ```

2. **while**
   ```rust
   let mut number = 3;
   while number != 0 {
       println!("{}!", number);
       number -= 1;
   }
   ```

3. **for**
   ```rust
   let a = [10, 20, 30, 40, 50];
   for element in a.iter() {
       println!("the value is: {}", element);
   }

   // 范围循环
   for number in 1..4 {
       println!("{}!", number);
   }
   ```

## 注释

```rust
// 这是单行注释

/* 这是
   多行注释 */

/// 这是文档注释
/// 用于生成文档
fn documented_function() {
    // 函数实现
}
```

## 模块系统

### 模块定义

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

// 使用模块
use crate::front_of_house::hosting;
```

## 错误处理

### Result 类型

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => {
            panic!("Problem opening the file: {:?}", error)
        },
    };
}
```

### Option 类型

```rust
fn find_item(index: usize) -> Option<&'static str> {
    let items = ["apple", "banana", "orange"];
    if index < items.len() {
        Some(items[index])
    } else {
        None
    }
}
```

## 下一步

- 学习 [所有权系统](/rust/ownership)
- 了解 [生命周期](/rust/lifetimes)
- 探索 [泛型与特征](/rust/generics-traits) 