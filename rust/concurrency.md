# Rust 并发编程

Rust 提供了强大的并发编程支持，包括线程、消息传递、共享状态等机制。

## 线程

### 创建线程

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap();
}
```

### 线程与所有权

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    handle.join().unwrap();
}
```

## 消息传递

### 通道

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

### 多生产者

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
    let tx1 = tx.clone();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_millis(200));
        }
    });

    thread::spawn(move || {
        let vals = vec![
            String::from("more"),
            String::from("messages"),
            String::from("for"),
            String::from("you"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_millis(200));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

## 共享状态

### Mutex

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

### RwLock

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));

    let mut handles = vec![];

    // 多个读取者
    for i in 0..3 {
        let data = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            let data = data.read().unwrap();
            println!("Reader {} sees: {:?}", i, *data);
        }));
    }

    // 一个写入者
    let data = Arc::clone(&data);
    handles.push(thread::spawn(move || {
        let mut data = data.write().unwrap();
        data.push(4);
    }));

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 原子类型

```rust
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn main() {
    let counter = AtomicUsize::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = &counter;
        handles.push(thread::spawn(move || {
            counter.fetch_add(1, Ordering::SeqCst);
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", counter.load(Ordering::SeqCst));
}
```

## 并发模式

### 工作池

```rust
use std::sync::{Arc, Mutex};
use std::thread;

struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(Message::NewJob(job)).unwrap();
    }
}
```

### 屏障同步

```rust
use std::sync::{Arc, Barrier};
use std::thread;

fn main() {
    let barrier = Arc::new(Barrier::new(3));
    let mut handles = vec![];

    for i in 0..3 {
        let barrier = Arc::clone(&barrier);
        handles.push(thread::spawn(move || {
            println!("Thread {} is waiting", i);
            barrier.wait();
            println!("Thread {} has passed the barrier", i);
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 并发安全

### Send 和 Sync 特征

```rust
// 实现 Send 特征
unsafe impl Send for MyStruct {}

// 实现 Sync 特征
unsafe impl Sync for MyStruct {}
```

### 内部可变性

```rust
use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let data = Rc::new(RefCell::new(5));

    let data1 = Rc::clone(&data);
    let data2 = Rc::clone(&data);

    *data1.borrow_mut() += 10;
    *data2.borrow_mut() += 20;

    println!("Final value: {}", *data.borrow());
}
```

## 最佳实践

1. **线程安全**
   - 优先使用消息传递而不是共享状态
   - 使用适当的同步原语
   - 避免死锁和竞态条件

2. **性能考虑**
   - 合理使用线程池
   - 避免过度同步
   - 使用原子操作代替锁

3. **错误处理**
   - 正确处理线程错误
   - 实现优雅的关闭机制
   - 处理资源清理

## 下一步

- 学习 [智能指针](/rust/smart-pointers)
- 了解 [异步编程](/rust/async)
- 探索 [标准库](/rust/standard-library) 