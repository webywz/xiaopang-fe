# Rust 生命周期

生命周期是 Rust 中一个重要的概念，它确保引用在使用时是有效的。

## 生命周期基础

### 生命周期标注语法

```rust
&i32        // 引用
&'a i32     // 带有显式生命周期的引用
&'a mut i32 // 带有显式生命周期的可变引用
```

### 函数中的生命周期

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

## 生命周期规则

### 生命周期省略规则

1. 每个引用参数都有自己的生命周期参数
2. 如果只有一个输入生命周期参数，它被赋给所有输出生命周期参数
3. 如果有多个输入生命周期参数，但其中一个是 `&self` 或 `&mut self`，则 `self` 的生命周期被赋给所有输出生命周期参数

### 示例

```rust
// 规则 1
fn first<'a>(x: &'a i32) -> &'a i32 { x }

// 规则 2
fn second(x: &str) -> &str { x }

// 规则 3
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

## 结构体中的生命周期

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

## 生命周期约束

### 泛型生命周期约束

```rust
use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

## 静态生命周期

```rust
let s: &'static str = "I have a static lifetime.";
```

## 生命周期与特征

```rust
trait Red {}

struct Ball<'a> {
    diameter: &'a i32,
}

impl<'a> Red for Ball<'a> {}
```

## 生命周期与闭包

```rust
fn main() {
    let closure = |x: &i32| -> &i32 { x };
    let result = closure(&5);
}
```

## 常见问题

### 1. 生命周期不匹配

```rust
fn main() {
    let r;                // ---------+-- 'a
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
    println!("r: {}", r); //          |
}                         // ---------+
```

### 2. 悬垂引用

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {  // 错误！
    let s = String::from("hello");
    &s  // 返回 s 的引用
}  // s 离开作用域并被丢弃
```

## 最佳实践

1. **合理使用生命周期标注**
   - 只在必要时使用显式生命周期标注
   - 优先使用生命周期省略规则

2. **避免生命周期冲突**
   - 确保引用的生命周期足够长
   - 避免创建悬垂引用

3. **使用生命周期约束**
   - 在需要时使用生命周期约束
   - 确保约束的合理性

## 下一步

- 学习 [泛型与特征](/rust/generics-traits)
- 了解 [错误处理](/rust/error-handling)
- 探索 [并发编程](/rust/concurrency) 