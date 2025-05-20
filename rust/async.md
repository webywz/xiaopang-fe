# Rust 异步编程

Rust 的异步编程模型基于 Future trait，提供了高效的非阻塞 I/O 操作。

## Future 基础

### 基本概念

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct MyFuture {
    value: i32,
}

impl Future for MyFuture {
    type Output = i32;

    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(self.value)
    }
}
```

### 异步函数

```rust
async fn hello_world() {
    println!("hello, world!");
}

async fn learn_and_sing() {
    let song = learn_song().await;
    sing_song(song).await;
}

async fn dance() {
    println!("dancing!");
}

async fn async_main() {
    let f1 = learn_and_sing();
    let f2 = dance();

    futures::join!(f1, f2);
}
```

## 异步运行时

### Tokio

```rust
use tokio;

#[tokio::main]
async fn main() {
    println!("Hello from async main!");
    
    let handle = tokio::spawn(async {
        println!("Hello from spawned task!");
    });
    
    handle.await.unwrap();
}
```

### 异步任务

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        sleep(Duration::from_secs(1)).await;
        println!("Task completed!");
    });

    println!("Waiting for task...");
    handle.await.unwrap();
}
```

## 异步 I/O

### 文件操作

```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut file = File::create("foo.txt").await?;
    file.write_all(b"Hello, world!").await?;
    
    let mut file = File::open("foo.txt").await?;
    let mut contents = vec![];
    file.read_to_end(&mut contents).await?;
    
    println!("File contents: {}", String::from_utf8_lossy(&contents));
    Ok(())
}
```

### 网络操作

```rust
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;

    loop {
        let (mut socket, _) = listener.accept().await?;

        tokio::spawn(async move {
            let mut buf = [0; 1024];

            loop {
                match socket.read(&mut buf).await {
                    Ok(0) => return,
                    Ok(n) => {
                        if socket.write_all(&buf[..n]).await.is_err() {
                            return;
                        }
                    }
                    Err(_) => return,
                }
            }
        });
    }
}
```

## 异步流

### Stream trait

```rust
use futures::stream::{self, StreamExt};

#[tokio::main]
async fn main() {
    let mut stream = stream::iter(1..=3);
    
    while let Some(x) = stream.next().await {
        println!("Got: {}", x);
    }
}
```

### 自定义流

```rust
use futures::stream::{Stream, StreamExt};
use std::pin::Pin;
use std::task::{Context, Poll};

struct Counter {
    count: u32,
    max: u32,
}

impl Stream for Counter {
    type Item = u32;

    fn poll_next(mut self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        if self.count < self.max {
            self.count += 1;
            Poll::Ready(Some(self.count))
        } else {
            Poll::Ready(None)
        }
    }
}
```

## 异步同步原语

### Mutex

```rust
use tokio::sync::Mutex;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(tokio::spawn(async move {
            let mut lock = counter.lock().await;
            *lock += 1;
        }));
    }

    for handle in handles {
        handle.await.unwrap();
    }

    println!("Result: {}", *counter.lock().await);
}
```

### 通道

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel(32);
    
    tokio::spawn(async move {
        tx.send("hello").await.unwrap();
    });
    
    if let Some(message) = rx.recv().await {
        println!("Got: {}", message);
    }
}
```

## 错误处理

### 异步错误传播

```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};

async fn read_file() -> io::Result<String> {
    let mut file = File::open("foo.txt").await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    Ok(contents)
}

#[tokio::main]
async fn main() {
    match read_file().await {
        Ok(contents) => println!("File contents: {}", contents),
        Err(e) => println!("Error: {}", e),
    }
}
```

## 最佳实践

1. **异步设计**
   - 合理使用异步函数
   - 避免阻塞操作
   - 正确处理错误

2. **性能优化**
   - 使用适当的缓冲区大小
   - 避免过度创建任务
   - 合理使用同步原语

3. **资源管理**
   - 正确处理资源释放
   - 使用超时机制
   - 实现优雅关闭

## 下一步

- 学习 [标准库](/rust/standard-library)
- 了解 [包管理](/rust/cargo)
- 探索 [Web开发](/rust/web) 