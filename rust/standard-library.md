# Rust 标准库

Rust 标准库提供了丰富的功能，包括集合、I/O、并发等。

## 集合

### Vec T>

```rust
Vec <T>
fn main() {
    // 创建向量
    let mut v = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);

    // 使用宏创建
    let v = vec![1, 2, 3];

    // 访问元素
    let third = &v[2];
    println!("The third element is {}", third);

    // 迭代
    for i in &v {
        println!("{}", i);
    }
}
```

### HashMap<K, V>

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);

    // 获取值
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);

    // 迭代
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
}
```

### HashSet T>

```rust
HashSet <T>
use std::collections::HashSet;

fn main() {
    let mut fruits = HashSet::new();
    fruits.insert("apple");
    fruits.insert("banana");
    fruits.insert("orange");

    // 检查元素
    if fruits.contains("apple") {
        println!("We have apples!");
    }

    // 集合操作
    let mut other_fruits = HashSet::new();
    other_fruits.insert("pear");
    other_fruits.insert("apple");

    let intersection: HashSet<_> = fruits.intersection(&other_fruits).collect();
    println!("Intersection: {:?}", intersection);
}
```

## I/O 操作

### 文件操作

```rust
use std::fs::File;
use std::io::{self, Read, Write};

fn main() -> io::Result<()> {
    // 写入文件
    let mut file = File::create("foo.txt")?;
    file.write_all(b"Hello, world!")?;

    // 读取文件
    let mut file = File::open("foo.txt")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    println!("File contents: {}", contents);

    Ok(())
}
```

### 标准输入输出

```rust
use std::io::{self, Write};

fn main() -> io::Result<()> {
    // 标准输出
    print!("Enter your name: ");
    io::stdout().flush()?;

    // 标准输入
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    println!("Hello, {}!", input.trim());

    Ok(())
}
```

## 错误处理

### Result<T, E>

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?;
    let mut username = String::new();
    file.read_to_string(&mut username)?;
    Ok(username)
}

fn main() {
    match read_username_from_file() {
        Ok(username) => println!("Username: {}", username),
        Err(e) => println!("Error: {}", e),
    }
}
```

### Option T>

```rust
Option <T>
fn find_item(index: usize) -> Option<&'static str> {
    let items = ["apple", "banana", "orange"];
    if index < items.len() {
        Some(items[index])
    } else {
        None
    }
}

fn main() {
    match find_item(1) {
        Some(item) => println!("Found: {}", item),
        None => println!("Item not found"),
    }
}
```

## 迭代器

### 基本用法

```rust
fn main() {
    let v1 = vec![1, 2, 3];
    let v1_iter = v1.iter();

    for val in v1_iter {
        println!("Got: {}", val);
    }
}
```

### 迭代器适配器

```rust
fn main() {
    let v1 = vec![1, 2, 3];
    
    // map
    let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();
    
    // filter
    let v3: Vec<_> = v1.iter().filter(|x| *x % 2 == 0).collect();
    
    // fold
    let sum: i32 = v1.iter().sum();
    
    println!("v2: {:?}", v2);
    println!("v3: {:?}", v3);
    println!("sum: {}", sum);
}
```

## 时间操作

### 时间测量

```rust
use std::time::{Duration, Instant};

fn main() {
    let start = Instant::now();
    
    // 执行一些操作
    std::thread::sleep(Duration::from_secs(1));
    
    let duration = start.elapsed();
    println!("Time elapsed: {:?}", duration);
}
```

### 日期时间

```rust
use chrono::{DateTime, Utc, Local};

fn main() {
    let utc: DateTime<Utc> = Utc::now();
    let local: DateTime<Local> = Local::now();
    
    println!("UTC: {}", utc);
    println!("Local: {}", local);
}
```

## 随机数

```rust
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();
    
    // 生成随机数
    let n1: u8 = rng.gen();
    let n2: u16 = rng.gen();
    
    // 生成范围随机数
    let n3 = rng.gen_range(0..100);
    
    println!("Random u8: {}", n1);
    println!("Random u16: {}", n2);
    println!("Random range: {}", n3);
}
```

## 最佳实践

1. **集合选择**
   - 根据使用场景选择合适的集合
   - 注意性能特征
   - 合理使用迭代器

2. **错误处理**
   - 使用 Result 和 Option 处理错误
   - 提供有意义的错误信息
   - 实现适当的错误转换

3. **I/O 操作**
   - 使用缓冲 I/O
   - 正确处理资源
   - 实现错误处理

## 下一步

- 学习 [包管理](/rust/cargo)
- 了解 [Web开发](/rust/web)
- 探索 [系统编程](/rust/systems-programming) 