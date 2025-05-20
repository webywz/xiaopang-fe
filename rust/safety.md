# Rust 安全编程

Rust 的安全机制是其核心特性之一，让我们能够编写安全且可靠的代码。

## 内存安全

### 所有权系统

```rust
fn main() {
    // 所有权转移
    let s1 = String::from("hello");
    let s2 = s1;  // s1 的所有权移动到 s2
    // println!("{}", s1);  // 错误：s1 已经被移动
    
    // 克隆
    let s3 = String::from("world");
    let s4 = s3.clone();  // 深拷贝
    println!("{} {}", s3, s4);  // 都可用
}
```

### 借用检查

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 不可变借用
    let r1 = &s;
    let r2 = &s;
    println!("{} {}", r1, r2);
    
    // 可变借用
    let r3 = &mut s;
    r3.push_str(" world");
    // println!("{}", r1);  // 错误：r1 已被 r3 借用
}
```

## 类型安全

### 类型系统

```rust
// 强类型
fn process_number(n: i32) -> i32 {
    n * 2
}

// 类型推断
let x = 42;  // 类型为 i32
let y = 42.0;  // 类型为 f64

// 类型别名
type Kilometers = i32;
let distance: Kilometers = 100;
```

### 泛型约束

```rust
use std::fmt::Display;

fn print_item<T: Display>(item: T) {
    println!("{}", item);
}

// 多重约束
fn process<T: Display + Clone>(item: T) {
    let item_clone = item.clone();
    println!("{}", item_clone);
}
```

## 错误处理

### Result 类型

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

fn main() -> Result<(), io::Error> {
    match read_file("example.txt") {
        Ok(contents) => println!("{}", contents),
        Err(e) => eprintln!("Error: {}", e),
    }
    Ok(())
}
```

### Option 类型

```rust
fn find_user(id: u32) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice"))
    } else {
        None
    }
}

fn main() {
    match find_user(1) {
        Some(name) => println!("Found user: {}", name),
        None => println!("User not found"),
    }
}
```

## 并发安全

### 线程安全

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    println!("Result: {}", *counter.lock().unwrap());
}
```

### 原子操作

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

struct SafeCounter {
    count: AtomicUsize,
}

impl SafeCounter {
    fn new() -> Self {
        SafeCounter {
            count: AtomicUsize::new(0),
        }
    }
    
    fn increment(&self) {
        self.count.fetch_add(1, Ordering::SeqCst);
    }
    
    fn get(&self) -> usize {
        self.count.load(Ordering::SeqCst)
    }
}
```

## 安全最佳实践

### 输入验证

```rust
fn validate_input(input: &str) -> Result<(), String> {
    if input.is_empty() {
        return Err("Input cannot be empty".to_string());
    }
    
    if input.len() > 100 {
        return Err("Input too long".to_string());
    }
    
    if !input.chars().all(|c| c.is_alphanumeric()) {
        return Err("Input contains invalid characters".to_string());
    }
    
    Ok(())
}
```

### 资源管理

```rust
use std::fs::File;
use std::io::Write;

struct Resource {
    file: File,
}

impl Resource {
    fn new(path: &str) -> std::io::Result<Self> {
        let file = File::create(path)?;
        Ok(Resource { file })
    }
    
    fn write(&mut self, data: &[u8]) -> std::io::Result<()> {
        self.file.write_all(data)
    }
}

impl Drop for Resource {
    fn drop(&mut self) {
        // 资源清理
        println!("Resource dropped");
    }
}
```

## 安全工具

### 静态分析

```rust
// 使用 clippy 进行代码检查
// Cargo.toml
[package]
name = "my_project"
version = "0.1.0"

[dependencies]
# 依赖项

[dev-dependencies]
clippy = "0.1"

// 运行 clippy
// cargo clippy
```

### 测试

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_validate_input() {
        assert!(validate_input("valid").is_ok());
        assert!(validate_input("").is_err());
        assert!(validate_input("a".repeat(101)).is_err());
    }
    
    #[test]
    fn test_safe_counter() {
        let counter = SafeCounter::new();
        counter.increment();
        assert_eq!(counter.get(), 1);
    }
}
```

## 最佳实践

1. **内存安全**
   - 遵循所有权规则
   - 使用适当的借用
   - 避免悬垂引用

2. **类型安全**
   - 使用强类型
   - 实现必要的 trait
   - 避免类型转换

3. **错误处理**
   - 使用 Result 和 Option
   - 实现错误传播
   - 提供有意义的错误信息

4. **并发安全**
   - 使用线程安全类型
   - 实现原子操作
   - 避免数据竞争

## 下一步

- 了解 [实战项目](/rust/projects)
- 探索 [系统编程](/rust/systems-programming)
- 学习 [性能优化](/rust/performance) 