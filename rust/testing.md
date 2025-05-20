# Rust 测试

Rust 提供了强大的测试框架，支持单元测试、集成测试和文档测试。

## 单元测试

### 基本测试

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
    
    #[test]
    fn test_string() {
        let s = String::from("hello");
        assert_eq!(s.len(), 5);
        assert!(s.contains("ell"));
    }
}
```

### 测试属性

```rust
#[cfg(test)]
mod tests {
    #[test]
    #[should_panic(expected = "divide by zero")]
    fn test_divide_by_zero() {
        divide(10, 0);
    }
    
    #[test]
    #[ignore]
    fn expensive_test() {
        // 耗时测试
    }
    
    #[test]
    #[allow(non_snake_case)]
    fn TestWithCustomName() {
        assert!(true);
    }
}
```

## 集成测试

### 测试模块

```rust
// tests/integration_test.rs
use my_crate;

#[test]
fn test_add() {
    assert_eq!(my_crate::add(2, 3), 5);
}

#[test]
fn test_subtract() {
    assert_eq!(my_crate::subtract(5, 3), 2);
}
```

### 测试辅助函数

```rust
// tests/common/mod.rs
pub fn setup() {
    // 测试环境设置
}

pub fn teardown() {
    // 测试环境清理
}

// tests/integration_test.rs
mod common;

#[test]
fn test_with_setup() {
    common::setup();
    // 执行测试
    common::teardown();
}
```

## 文档测试

### 代码示例

```rust
/// 计算两个数的和
///
/// # Examples
///
/// ```
/// let result = my_crate::add(2, 3);
/// assert_eq!(result, 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// 处理用户输入
///
/// # Examples
///
/// ```
/// use my_crate::process_input;
///
/// let input = "hello";
/// let result = process_input(input);
/// assert_eq!(result, "HELLO");
/// ```
pub fn process_input(input: &str) -> String {
    input.to_uppercase()
}
```

## 测试工具

### 断言宏

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_assertions() {
        // 相等断言
        assert_eq!(1, 1);
        assert_ne!(1, 2);
        
        // 布尔断言
        assert!(true);
        assert!(2 + 2 == 4);
        
        // 近似相等
        assert!((0.1 + 0.2 - 0.3).abs() < 0.0001);
        
        // 自定义消息
        assert!(2 + 2 == 4, "Basic math failed");
    }
}
```

### 测试模块组织

```rust
#[cfg(test)]
mod tests {
    // 测试辅助函数
    fn setup() {
        // 设置测试环境
    }
    
    // 测试子模块
    mod math_tests {
        use super::*;
        
        #[test]
        fn test_addition() {
            assert_eq!(2 + 2, 4);
        }
        
        #[test]
        fn test_subtraction() {
            assert_eq!(5 - 3, 2);
        }
    }
    
    mod string_tests {
        use super::*;
        
        #[test]
        fn test_concat() {
            let s1 = String::from("hello");
            let s2 = String::from(" world");
            assert_eq!(s1 + &s2, "hello world");
        }
    }
}
```

## 测试策略

### 测试驱动开发

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_user_creation() {
        let user = User::new("Alice", "alice@example.com");
        assert_eq!(user.name, "Alice");
        assert_eq!(user.email, "alice@example.com");
    }
    
    #[test]
    fn test_user_validation() {
        let user = User::new("", "invalid-email");
        assert!(!user.is_valid());
    }
}

// 实现代码
struct User {
    name: String,
    email: String,
}

impl User {
    fn new(name: &str, email: &str) -> Self {
        User {
            name: name.to_string(),
            email: email.to_string(),
        }
    }
    
    fn is_valid(&self) -> bool {
        !self.name.is_empty() && self.email.contains('@')
    }
}
```

### 属性测试

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_addition_commutative(a in 0..1000i32, b in 0..1000i32) {
        assert_eq!(add(a, b), add(b, a));
    }
    
    #[test]
    fn test_string_operations(s in "[a-z]{1,10}") {
        let upper = s.to_uppercase();
        assert_eq!(upper.len(), s.len());
        assert!(upper.chars().all(|c| c.is_uppercase()));
    }
}
```

## 最佳实践

1. **测试组织**
   - 按功能模块组织测试
   - 使用描述性的测试名称
   - 保持测试代码简洁

2. **测试覆盖**
   - 测试正常情况
   - 测试边界条件
   - 测试错误情况

3. **测试维护**
   - 及时更新测试
   - 保持测试独立性
   - 避免测试间的依赖

## 下一步

- 了解 [调试](/rust/debugging)
- 学习 [性能优化](/rust/performance)
- 探索 [实战项目](/rust/projects) 