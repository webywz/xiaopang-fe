# Rust 智能指针

智能指针是 Rust 中管理内存的重要工具，它们提供了比普通引用更多的功能和安全性。

## Box\`T\`

`Box<T>` 是最简单的智能指针，它允许在堆上分配数据。

```rust
fn main() {
    // 在堆上分配数据
    let b = Box::new(5);
    println!("b = {}", b);
    
    // 递归类型
    #[derive(Debug)]
    enum List {
        Cons(i32, Box<List>),
        Nil,
    }
    
    let list = List::Cons(1,
        Box::new(List::Cons(2,
            Box::new(List::Cons(3,
                Box::new(List::Nil))))));
    println!("list = {:?}", list);
}
```

## Rc\`T\`

`Rc<T>` 是引用计数智能指针，允许多个所有者共享数据。

```rust
use std::rc::Rc;

fn main() {
    let data = Rc::new(vec![1, 2, 3]);
    
    // 克隆引用
    let data1 = Rc::clone(&data);
    let data2 = Rc::clone(&data);
    
    println!("引用计数: {}", Rc::strong_count(&data));
    
    // 使用数据
    println!("data1: {:?}", data1);
    println!("data2: {:?}", data2);
}
```

## RefCell\`T\`

`RefCell<T>` 提供内部可变性，允许在不可变引用时修改数据。

```rust
use std::cell::RefCell;

fn main() {
    let data = RefCell::new(5);
    
    // 借用数据
    {
        let mut borrow = data.borrow_mut();
        *borrow += 1;
    }
    
    // 读取数据
    println!("data = {}", data.borrow());
    
    // 运行时借用检查
    let mut borrow1 = data.borrow_mut();
    // 这会导致 panic
    // let borrow2 = data.borrow();
    *borrow1 += 1;
}
```

## 组合使用

### Rc\`RefCell\`T\`\`

```rust
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    next: Option<Rc<RefCell<Node>>>,
}

fn main() {
    // 创建节点
    let node1 = Rc::new(RefCell::new(Node {
        value: 1,
        next: None,
    }));
    
    let node2 = Rc::new(RefCell::new(Node {
        value: 2,
        next: Some(Rc::clone(&node1)),
    }));
    
    // 修改节点
    node1.borrow_mut().value = 10;
    
    println!("node2 = {:?}", node2);
}
```

## Cell\`T\`

`Cell<T>` 提供内部可变性，但只能用于实现了 `Copy` trait 的类型。

```rust
use std::cell::Cell;

fn main() {
    let data = Cell::new(5);
    
    // 获取值
    let value = data.get();
    println!("value = {}", value);
    
    // 设置值
    data.set(10);
    println!("new value = {}", data.get());
}
```

## Mutex\`T\`

`Mutex<T>` 提供线程安全的内部可变性。

```rust
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];
    
    for _ in 0..10 {
        let counter = Mutex::clone(&counter);
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

## Arc\`T\`

`Arc<T>` 是线程安全的引用计数智能指针。

```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(vec![1, 2, 3]);
    let mut handles = vec![];
    
    for i in 0..3 {
        let data = Arc::clone(&data);
        let handle = thread::spawn(move || {
            println!("线程 {}: {:?}", i, data);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 最佳实践

1. **选择适当的智能指针**
   - 单一所有权：使用 `Box<T>`
   - 共享所有权：使用 `Rc<T>` 或 `Arc<T>`
   - 内部可变性：使用 `RefCell<T>` 或 `Cell<T>`
   - 线程安全：使用 `Mutex<T>` 或 `Arc<T>`

2. **内存管理**
   - 避免循环引用
   - 及时释放资源
   - 注意引用计数

3. **性能考虑**
   - 优先使用 `Box<T>`
   - 避免过度使用 `Rc<T>`
   - 合理使用 `RefCell<T>`

## 下一步

- 学习 [所有权系统](/rust/ownership)
- 了解 [并发编程](/rust/concurrency)
- 探索 [内存管理](/rust/memory) 