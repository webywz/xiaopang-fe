# Rust 系统编程

Rust 作为系统级编程语言，提供了强大的底层编程能力。

## 内存管理

### 堆与栈

```rust
fn main() {
    // 栈分配
    let x = 42;
    
    // 堆分配
    let y = Box::new(42);
    
    // 字符串（堆分配）
    let s = String::from("hello");
}
```

### 手动内存管理

```rust
use std::alloc::{alloc, dealloc, Layout};

unsafe fn allocate_memory() -> *mut u8 {
    let layout = Layout::new::<u32>();
    let ptr = alloc(layout);
    ptr
}

unsafe fn deallocate_memory(ptr: *mut u8) {
    let layout = Layout::new::<u32>();
    dealloc(ptr, layout);
}
```

## 指针操作

### 原始指针

```rust
fn main() {
    let mut x = 42;
    
    // 创建原始指针
    let raw_ptr = &mut x as *mut i32;
    
    // 解引用（不安全）
    unsafe {
        *raw_ptr = 100;
        println!("Value: {}", *raw_ptr);
    }
}
```

### 智能指针

```rust
use std::rc::Rc;
use std::sync::Arc;

fn main() {
    // 引用计数
    let data = Rc::new(vec![1, 2, 3]);
    let data2 = Rc::clone(&data);
    
    // 原子引用计数
    let shared_data = Arc::new(vec![1, 2, 3]);
    let shared_data2 = Arc::clone(&shared_data);
}
```

## 系统调用

### 文件操作

```rust
use std::fs::File;
use std::os::unix::fs::FileExt;

fn main() -> std::io::Result<()> {
    let file = File::open("data.bin")?;
    
    // 直接读取
    let mut buffer = [0u8; 1024];
    file.read_at(&mut buffer, 0)?;
    
    Ok(())
}
```

### 进程管理

```rust
use std::process::Command;

fn main() -> std::io::Result<()> {
    // 创建子进程
    let output = Command::new("ls")
        .arg("-l")
        .output()?;
    
    println!("Status: {}", output.status);
    println!("Stdout: {}", String::from_utf8_lossy(&output.stdout));
    
    Ok(())
}
```

## 并发编程

### 线程

```rust
use std::thread;
use std::sync::{Arc, Mutex};

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

fn main() {
    let counter = AtomicUsize::new(0);
    
    // 原子操作
    counter.fetch_add(1, Ordering::SeqCst);
    counter.fetch_sub(1, Ordering::SeqCst);
    
    println!("Counter: {}", counter.load(Ordering::SeqCst));
}
```

## 底层优化

### SIMD

```rust
#[cfg(target_arch = "x86_64")]
use std::arch::x86_64::*;

#[cfg(target_arch = "x86_64")]
unsafe fn simd_add(a: &[f32], b: &[f32], result: &mut [f32]) {
    for i in (0..a.len()).step_by(4) {
        let va = _mm_loadu_ps(&a[i]);
        let vb = _mm_loadu_ps(&b[i]);
        let vc = _mm_add_ps(va, vb);
        _mm_storeu_ps(&mut result[i], vc);
    }
}
```

### 内联汇编

```rust
#[cfg(target_arch = "x86_64")]
fn get_cpu_id() -> u32 {
    let result: u32;
    unsafe {
        asm!(
            "cpuid",
            out("eax") result,
            in("eax") 0,
            options(nomem, nostack)
        );
    }
    result
}
```

## 系统接口

### FFI

```rust
#[link(name = "c")]
extern "C" {
    fn printf(format: *const u8, ...) -> i32;
}

fn main() {
    unsafe {
        printf(b"Hello, %s!\0".as_ptr() as *const u8, b"World\0".as_ptr());
    }
}
```

### 系统调用

```rust
#[cfg(target_os = "linux")]
use std::os::unix::io::RawFd;

#[cfg(target_os = "linux")]
fn get_system_info() -> std::io::Result<()> {
    let mut info = libc::sysinfo {
        uptime: 0,
        loads: [0; 3],
        totalram: 0,
        freeram: 0,
        sharedram: 0,
        bufferram: 0,
        totalswap: 0,
        freeswap: 0,
        procs: 0,
        pad: 0,
        totalhigh: 0,
        freehigh: 0,
        mem_unit: 0,
        _f: [0; 0],
    };
    
    unsafe {
        if libc::sysinfo(&mut info) == 0 {
            println!("Uptime: {} seconds", info.uptime);
            println!("Total RAM: {} bytes", info.totalram);
            Ok(())
        } else {
            Err(std::io::Error::last_os_error())
        }
    }
}
```

## 最佳实践

1. **内存安全**
   - 使用 RAII
   - 避免内存泄漏
   - 正确处理资源

2. **性能优化**
   - 使用适当的抽象
   - 避免不必要的复制
   - 利用编译器优化

3. **系统兼容性**
   - 处理平台差异
   - 使用条件编译
   - 考虑可移植性

## 下一步

- 探索 [性能优化](/rust/performance)
- 学习 [安全编程](/rust/safety)
- 了解 [实战项目](/rust/projects) 