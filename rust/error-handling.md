# Rust 错误处理

Rust 提供了强大的错误处理机制，主要通过 `Result` 和 `Option` 类型来实现。

## Result 类型

### 基本用法

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

### 错误传播

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

### 链式调用

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}
```

## Option 类型

### 基本用法

```rust
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

### Option 方法

```rust
fn main() {
    let x = Some(5);
    
    // map
    let y = x.map(|i| i + 1);
    
    // and_then
    let z = x.and_then(|i| Some(i + 1));
    
    // unwrap_or
    let a = None.unwrap_or(0);
    
    // filter
    let b = x.filter(|i| *i > 3);
}
```

## 自定义错误类型

```rust
use std::error::Error;
use std::fmt;

#[derive(Debug)]
struct CustomError {
    message: String,
}

impl Error for CustomError {}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

fn process_data() -> Result<(), CustomError> {
    Err(CustomError {
        message: String::from("Something went wrong"),
    })
}
```

## 错误处理最佳实践

### 1. 使用 ? 运算符

```rust
fn process_file() -> Result<String, io::Error> {
    let mut file = File::open("data.txt")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
```

### 2. 错误类型转换

```rust
use std::error::Error;
use std::fmt;

#[derive(Debug)]
enum AppError {
    IoError(io::Error),
    ParseError(ParseError),
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::IoError(error)
    }
}
```

### 3. 错误处理模式

```rust
fn process_data() -> Result<(), AppError> {
    // 使用 ? 运算符传播错误
    let data = read_file()?;
    
    // 使用 map_err 转换错误类型
    let parsed = parse_data(&data).map_err(AppError::ParseError)?;
    
    // 使用 ok_or 将 Option 转换为 Result
    let value = get_optional_value().ok_or(AppError::MissingValue)?;
    
    Ok(())
}
```

## 常见错误处理模式

### 1. 链式错误处理

```rust
fn process() -> Result<(), AppError> {
    File::open("file.txt")
        .map_err(AppError::IoError)?
        .read_to_string(&mut String::new())
        .map_err(AppError::IoError)?;
    Ok(())
}
```

### 2. 错误类型转换

```rust
fn convert_errors() -> Result<(), AppError> {
    let result = process_data()
        .map_err(|e| match e {
            ErrorType::Io(e) => AppError::IoError(e),
            ErrorType::Parse(e) => AppError::ParseError(e),
            _ => AppError::Unknown,
        })?;
    Ok(())
}
```

## 错误处理工具

### 1. anyhow

```rust
use anyhow::{Context, Result};

fn process() -> Result<()> {
    let file = File::open("file.txt")
        .context("Failed to open file")?;
    Ok(())
}
```

### 2. thiserror

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DataStoreError {
    #[error("data store disconnected")]
    Disconnect(#[from] io::Error),
    #[error("the data for key `{0}` is not available")]
    Redaction(String),
    #[error("invalid header (expected {expected:?}, found {found:?})")]
    InvalidHeader {
        expected: String,
        found: String,
    },
}
```

## 最佳实践

1. **错误类型设计**
   - 使用具体的错误类型而不是通用错误
   - 实现 Error 和 Display trait
   - 提供有意义的错误信息

2. **错误处理策略**
   - 在适当的地方使用 ? 运算符
   - 合理使用错误类型转换
   - 提供清晰的错误上下文

3. **错误传播**
   - 在函数签名中明确错误类型
   - 使用 Result 而不是 panic
   - 提供错误恢复机制

## 下一步

- 学习 [并发编程](/rust/concurrency)
- 了解 [智能指针](/rust/smart-pointers)
- 探索 [异步编程](/rust/async) 