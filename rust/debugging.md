# Rust 调试

Rust 提供了多种调试工具和技术，帮助我们快速定位和解决问题。

## 打印调试

### 基本打印

```rust
fn main() {
    let x = 42;
    println!("x = {}", x);
    
    // 调试格式
    println!("{:?}", vec![1, 2, 3]);
    println!("{:#?}", vec![1, 2, 3]);
    
    // 自定义调试格式
    #[derive(Debug)]
    struct Point {
        x: i32,
        y: i32,
    }
    
    let p = Point { x: 10, y: 20 };
    println!("Point: {:?}", p);
}
```

### 日志记录

```rust
use log::{info, warn, error, debug};

fn main() {
    // 初始化日志
    env_logger::init();
    
    // 不同级别的日志
    debug!("调试信息");
    info!("普通信息");
    warn!("警告信息");
    error!("错误信息");
    
    // 带上下文的日志
    let user_id = 123;
    info!("用户 {} 登录成功", user_id);
}
```

## 调试器

### GDB/LLDB

```rust
// 编译时启用调试信息
// Cargo.toml
[profile.dev]
debug = true

// 使用 GDB
// gdb target/debug/my_program

// 使用 LLDB
// lldb target/debug/my_program

fn main() {
    let mut sum = 0;
    for i in 1..=10 {
        sum += i;
        // 设置断点
        // break main.rs:10
    }
    println!("Sum: {}", sum);
}
```

### VS Code 调试

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Debug Rust",
            "cargo": {
                "args": ["build", "--bin=my_program"]
            },
            "args": [],
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

## 错误处理

### 错误追踪

```rust
use std::error::Error;
use std::fs::File;

fn read_file() -> Result<String, Box<dyn Error>> {
    let file = File::open("config.txt")?;
    // 错误会自动包含文件位置信息
    Ok(String::new())
}

fn main() {
    if let Err(e) = read_file() {
        eprintln!("错误: {}", e);
        // 打印错误链
        let mut source = e.source();
        while let Some(s) = source {
            eprintln!("原因: {}", s);
            source = s.source();
        }
    }
}
```

### 自定义错误

```rust
use std::error::Error;
use std::fmt;

#[derive(Debug)]
struct CustomError {
    message: String,
    line: u32,
    file: String,
}

impl Error for CustomError {}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "错误: {} (在 {}:{} 处)", 
            self.message, self.file, self.line)
    }
}

fn main() -> Result<(), CustomError> {
    Err(CustomError {
        message: "测试错误".to_string(),
        line: line!(),
        file: file!().to_string(),
    })
}
```

## 性能分析

### 火焰图

```rust
use flame;

fn main() {
    // 开始记录
    flame::start("main");
    
    // 执行代码
    for i in 0..1000 {
        flame::start("loop");
        // 耗时操作
        flame::end("loop");
    }
    
    // 结束记录
    flame::end("main");
    
    // 生成火焰图
    flame::dump_html(&mut std::fs::File::create("flamegraph.html").unwrap()).unwrap();
}
```

### 性能计数器

```rust
use std::time::Instant;

fn main() {
    let start = Instant::now();
    
    // 执行代码
    for i in 0..1000 {
        // 耗时操作
    }
    
    let duration = start.elapsed();
    println!("执行时间: {:?}", duration);
}
```

## 内存调试

### 内存泄漏检测

```rust
use std::rc::Rc;

fn main() {
    // 使用 Rc 跟踪引用计数
    let data = Rc::new(vec![1, 2, 3]);
    let data2 = Rc::clone(&data);
    
    println!("引用计数: {}", Rc::strong_count(&data));
    
    // 使用 drop 显式释放
    drop(data2);
    println!("引用计数: {}", Rc::strong_count(&data));
}
```

### 堆栈跟踪

```rust
use backtrace::Backtrace;

fn main() {
    // 捕获堆栈跟踪
    let bt = Backtrace::new();
    println!("堆栈跟踪:\n{:?}", bt);
    
    // 在 panic 时打印堆栈跟踪
    std::panic::set_hook(Box::new(|panic_info| {
        let bt = Backtrace::new();
        eprintln!("panic: {:?}\n{:?}", panic_info, bt);
    }));
}
```

## 最佳实践

1. **调试策略**
   - 使用适当的日志级别
   - 添加有意义的上下文
   - 保持调试信息简洁

2. **错误处理**
   - 提供详细的错误信息
   - 实现错误链
   - 使用自定义错误类型

3. **性能分析**
   - 使用性能分析工具
   - 监控关键指标
   - 优化热点代码

## 下一步

- 学习 [性能优化](/rust/performance)
- 了解 [安全编程](/rust/safety)
- 探索 [实战项目](/rust/projects) 