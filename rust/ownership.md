# Rust 所有权系统

所有权是 Rust 最独特的特性，它让 Rust 无需垃圾回收器就能保证内存安全。

## 所有权规则

1. Rust 中的每个值都有一个所有者（owner）
2. 同一时刻只能有一个所有者
3. 当所有者离开作用域，值将被丢弃

## 变量作用域

```rust
{                      // s 在这里无效
    let s = String::from("hello");   // s 从这里开始有效
    // 使用 s
}                      // 作用域结束，s 不再有效
```

## 移动语义

### 基本类型

```rust
let x = 5;
let y = x;  // 复制，因为整数实现了 Copy trait
```

### 复杂类型

```rust
let s1 = String::from("hello");
let s2 = s1;  // s1 的所有权移动到 s2
// println!("{}", s1);  // 错误！s1 已经无效
```

## 克隆

```rust
let s1 = String::from("hello");
let s2 = s1.clone();  // 深拷贝
println!("s1 = {}, s2 = {}", s1, s2);  // 都有效
```

## 所有权与函数

### 参数传递

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);  // s 的所有权移动到函数
    // println!("{}", s);  // 错误！s 已经无效
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
}  // some_string 离开作用域并被丢弃
```

### 返回值

```rust
fn main() {
    let s1 = gives_ownership();  // 函数返回值所有权移动到 s1
    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2);  // s2 移动到函数，返回值移动到 s3
}

fn gives_ownership() -> String {
    let some_string = String::from("hello");
    some_string  // 返回所有权
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string  // 返回所有权
}
```

## 引用与借用

### 不可变引用

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);  // 传递引用
    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 离开作用域，但因为它只是引用，不会丢弃它指向的值
```

### 可变引用

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

### 引用规则

1. 在任意给定时刻，只能有以下之一：
   - 一个可变引用
   - 任意数量的不可变引用
2. 引用必须总是有效的

## 切片类型

### 字符串切片

```rust
let s = String::from("hello world");
let hello = &s[0..5];
let world = &s[6..11];
```

### 数组切片

```rust
let a = [1, 2, 3, 4, 5];
let slice = &a[1..3];  // 包含 2, 3
```

## 常见问题

### 1. 悬垂引用

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {  // 错误！
    let s = String::from("hello");
    &s  // 返回 s 的引用
}  // s 离开作用域并被丢弃
```

### 2. 数据竞争

```rust
let mut s = String::from("hello");
let r1 = &mut s;
let r2 = &mut s;  // 错误！不能同时有多个可变引用
```

## 最佳实践

1. **使用引用而不是移动**
   - 当只需要读取数据时使用不可变引用
   - 当需要修改数据时使用可变引用

2. **避免不必要的克隆**
   - 只在必要时使用 clone()
   - 优先使用引用

3. **合理使用作用域**
   - 让变量的作用域尽可能小
   - 及时释放不需要的资源

## 下一步

- 学习 [生命周期](/rust/lifetimes)
- 了解 [智能指针](/rust/smart-pointers)
- 探索 [并发编程](/rust/concurrency) 