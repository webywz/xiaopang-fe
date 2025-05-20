# Rust 泛型与特征

泛型和特征是 Rust 中实现代码复用和抽象的重要机制。

## 泛型

### 泛型函数

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}
```

### 泛型结构体

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

// 为特定类型实现方法
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

### 泛型枚举

```rust
enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

## 特征（Traits）

### 特征定义

```rust
pub trait Summary {
    fn summarize(&self) -> String;
    
    // 默认实现
    fn default_summary(&self) -> String {
        String::from("(Read more...)")
    }
}
```

### 特征实现

```rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

### 特征作为参数

```rust
// 特征约束语法
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// 特征约束语法（完整形式）
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}

// 多重特征约束
pub fn notify(item: &(impl Summary + Display)) {
    println!("Breaking news! {}", item.summarize());
}
```

### 特征约束

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    // 函数实现
}
```

## 特征对象

### 使用特征对象

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

### 特征对象限制

1. 特征对象必须是对象安全的
2. 方法不能返回 Self
3. 方法不能使用泛型参数

## 关联类型

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // 实现
    }
}
```

## 默认泛型类型参数

```rust
trait Add<Rhs=Self> {
    type Output;

    fn add(self, rhs: Rhs) -> Self::Output;
}
```

## 运算符重载

```rust
use std::ops::Add;

#[derive(Debug, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}
```

## 常见问题

### 1. 特征对象与泛型

```rust
// 使用泛型
fn process<T: Summary>(item: &T) {
    // 编译时确定具体类型
}

// 使用特征对象
fn process(item: &dyn Summary) {
    // 运行时动态分发
}
```

### 2. 特征约束冲突

```rust
trait A {
    fn test(&self);
}

trait B {
    fn test(&self);
}

struct MyType;

impl A for MyType {
    fn test(&self) {
        println!("A::test");
    }
}

impl B for MyType {
    fn test(&self) {
        println!("B::test");
    }
}

// 使用时需要明确指定使用哪个特征的方法
fn main() {
    let t = MyType;
    A::test(&t);
    B::test(&t);
}
```

## 最佳实践

1. **合理使用泛型**
   - 在需要类型抽象时使用泛型
   - 避免过度使用泛型导致代码复杂化

2. **特征设计**
   - 保持特征简单和专注
   - 提供合理的默认实现
   - 考虑特征的对象安全性

3. **性能考虑**
   - 在性能关键路径上优先使用静态分发
   - 在需要运行时多态时使用特征对象

## 下一步

- 学习 [错误处理](/rust/error-handling)
- 了解 [并发编程](/rust/concurrency)
- 探索 [智能指针](/rust/smart-pointers) 