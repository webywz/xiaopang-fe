# Rust 异步编程

Rust 的异步编程模型基于 Future trait，提供了高效的并发处理能力。

## Future 基础

### Future Trait

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

async fn example() {
    let future = MyFuture { value: 42 };
    let result = future.await;
    println!("Result: {}", result);
}
```

### 异步函数

```rust
async fn hello_world() {
    println!("Hello, world!");
}

async fn learn_and_sing() {
    let song = learn_song().await;
    sing_song(song).await;
}

async fn dance() {
    println!("Dancing...");
}

async fn async_main() {
    let f1 = learn_and_sing();
    let f2 = dance();
    
    // 并发执行
    futures::join!(f1, f2);
}
```

## 异步运行时

### Tokio 运行时

```rust
use tokio;

#[tokio::main]
async fn main() {
    // 创建任务
    let handle = tokio::spawn(async {
        println!("Task started");
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        println!("Task completed");
    });
    
    // 等待任务完成
    handle.await.unwrap();
}
```

### 异步 I/O

```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};

async fn read_file() -> io::Result<String> {
    let mut file = File::open("example.txt").await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    Ok(contents)
}

async fn write_file(contents: &str) -> io::Result<()> {
    let mut file = File::create("output.txt").await?;
    file.write_all(contents.as_bytes()).await?;
    Ok(())
}
```

## 异步流

### Stream Trait

```rust
use futures::stream::{self, StreamExt};

async fn process_stream() {
    let stream = stream::iter(1..=5);
    
    let sum = stream
        .map(|x| x * x)
        .filter(|x| x % 2 == 0)
        .fold(0, |acc, x| async move { acc + x })
        .await;
        
    println!("Sum: {}", sum);
}
```

### 自定义流

```rust
use futures::stream::Stream;
use std::pin::Pin;
use std::task::{Context, Poll};

struct Counter {
    count: i32,
    max: i32,
}

impl Stream for Counter {
    type Item = i32;
    
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

### 异步互斥锁

```rust
use tokio::sync::Mutex;
use std::sync::Arc;

struct SharedState {
    data: Arc<Mutex<Vec<i32>>>,
}

impl SharedState {
    async fn add_value(&self, value: i32) {
        let mut data = self.data.lock().await;
        data.push(value);
    }
    
    async fn get_values(&self) -> Vec<i32> {
        let data = self.data.lock().await;
        data.clone()
    }
}
```

### 异步通道

```rust
use tokio::sync::mpsc;

async fn producer(mut tx: mpsc::Sender<i32>) {
    for i in 0..5 {
        tx.send(i).await.unwrap();
    }
}

async fn consumer(mut rx: mpsc::Receiver<i32>) {
    while let Some(value) = rx.recv().await {
        println!("Received: {}", value);
    }
}

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel(32);
    
    tokio::spawn(producer(tx));
    tokio::spawn(consumer(rx));
}
```

## 错误处理

### 异步错误传播

```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};

async fn read_config() -> io::Result<String> {
    let mut file = File::open("config.txt").await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    Ok(contents)
}

async fn process_config() -> Result<(), Box<dyn std::error::Error>> {
    let config = read_config().await?;
    // 处理配置
    Ok(())
}
```

## 最佳实践

1. **异步设计**
   - 避免阻塞操作
   - 使用适当的并发模型
   - 合理使用任务调度

2. **性能优化**
   - 减少任务切换
   - 使用工作窃取
   - 优化内存使用

3. **资源管理**
   - 正确处理生命周期
   - 避免内存泄漏
   - 管理并发资源

## 下一步

- 学习 [性能优化](/rust/performance)
- 了解 [安全编程](/rust/safety)
- 探索 [实战项目](/rust/projects) 