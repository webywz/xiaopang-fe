# Rust 性能优化

Rust 提供了多种性能优化技术，让我们能够编写高效的代码。

## 编译优化

### 发布模式

```rust
// Cargo.toml
[profile.release]
opt-level = 3        // 最高优化级别
lto = true          // 链接时优化
codegen-units = 1   // 减少代码生成单元
panic = 'abort'     // 禁用 panic 展开
```

### 内联优化

```rust
#[inline(always)]
fn fast_calculation(x: i32) -> i32 {
    x * x + 1
}

#[inline(never)]
fn complex_calculation(x: i32) -> i32 {
    // 复杂计算
    x * x * x
}
```

## 内存优化

### 零成本抽象

```rust
// 编译时多态
fn process<T: AsRef<str>>(input: T) {
    let s = input.as_ref();
    // 处理字符串
}

// 运行时多态
fn process_dyn(input: &dyn AsRef<str>) {
    let s = input.as_ref();
    // 处理字符串
}
```

### 内存布局

```rust
#[repr(C)]
struct Optimized {
    a: u32,    // 4 字节
    b: u8,     // 1 字节
    c: u16,    // 2 字节
    // 编译器会自动对齐
}

#[repr(packed)]
struct Packed {
    a: u32,    // 4 字节
    b: u8,     // 1 字节
    c: u16,    // 2 字节
    // 紧密打包，无填充
}
```

## 算法优化

### 迭代器优化

```rust
fn optimized_sum(numbers: &[i32]) -> i32 {
    numbers.iter()
        .filter(|&n| n > &0)
        .map(|&n| n * n)
        .sum()
}

// 使用 rayon 进行并行计算
use rayon::prelude::*;

fn parallel_sum(numbers: &[i32]) -> i32 {
    numbers.par_iter()
        .filter(|&n| n > &0)
        .map(|&n| n * n)
        .sum()
}
```

### 缓存优化

```rust
use std::collections::HashMap;

struct Cache {
    data: HashMap<String, Vec<u8>>,
}

impl Cache {
    fn new() -> Self {
        Cache {
            data: HashMap::new(),
        }
    }
    
    fn get_or_compute(&mut self, key: &str) -> &Vec<u8> {
        if !self.data.contains_key(key) {
            let value = self.compute_value(key);
            self.data.insert(key.to_string(), value);
        }
        self.data.get(key).unwrap()
    }
    
    fn compute_value(&self, key: &str) -> Vec<u8> {
        // 复杂计算
        key.as_bytes().to_vec()
    }
}
```

## 并发优化

### 线程池

```rust
use rayon::ThreadPoolBuilder;

fn main() {
    let pool = ThreadPoolBuilder::new()
        .num_threads(4)
        .build()
        .unwrap();
        
    pool.install(|| {
        // 在线程池中执行任务
        (0..1000).into_par_iter()
            .for_each(|i| {
                // 处理任务
            });
    });
}
```

### 无锁数据结构

```rust
use crossbeam::queue::ArrayQueue;
use std::sync::atomic::{AtomicUsize, Ordering};

struct LockFreeQueue {
    queue: ArrayQueue<u32>,
    count: AtomicUsize,
}

impl LockFreeQueue {
    fn new(capacity: usize) -> Self {
        LockFreeQueue {
            queue: ArrayQueue::new(capacity),
            count: AtomicUsize::new(0),
        }
    }
    
    fn push(&self, value: u32) -> bool {
        if self.queue.push(value).is_ok() {
            self.count.fetch_add(1, Ordering::SeqCst);
            true
        } else {
            false
        }
    }
    
    fn pop(&self) -> Option<u32> {
        self.queue.pop().map(|value| {
            self.count.fetch_sub(1, Ordering::SeqCst);
            value
        })
    }
}
```

## 性能分析

### 基准测试

```rust
#[cfg(test)]
mod tests {
    use test::Bencher;
    
    #[bench]
    fn bench_fast_calculation(b: &mut Bencher) {
        b.iter(|| {
            fast_calculation(42)
        });
    }
    
    #[bench]
    fn bench_complex_calculation(b: &mut Bencher) {
        b.iter(|| {
            complex_calculation(42)
        });
    }
}
```

### 性能分析工具

```rust
// 使用 perf 进行性能分析
// 编译时启用调试信息
// Cargo.toml
[profile.release]
debug = true

// 使用 flamegraph 进行火焰图分析
use flame;

fn main() {
    flame::start("main");
    // 执行代码
    flame::end("main");
    
    flame::dump_html(&mut std::fs::File::create("flamegraph.html").unwrap()).unwrap();
}
```

## 最佳实践

1. **编译优化**
   - 使用发布模式
   - 合理使用内联
   - 优化链接设置

2. **内存管理**
   - 避免不必要的分配
   - 使用适当的数据结构
   - 注意内存对齐

3. **算法选择**
   - 使用迭代器
   - 实现并行计算
   - 优化缓存使用

4. **并发处理**
   - 使用线程池
   - 实现无锁算法
   - 避免锁竞争

## 下一步

- 学习 [安全编程](/rust/safety)
- 了解 [实战项目](/rust/projects)
- 探索 [系统编程](/rust/systems-programming) 