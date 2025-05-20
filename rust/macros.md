# Rust 宏编程

Rust 的宏系统提供了强大的元编程能力，让我们能够在编译时生成代码。

## 声明宏

### 基本语法

```rust
macro_rules! say_hello {
    () => {
        println!("Hello!");
    };
}

macro_rules! create_function {
    ($func_name:ident) => {
        fn $func_name() {
            println!("You called {:?}()", stringify!($func_name));
        }
    };
}

// 使用宏
say_hello!();
create_function!(foo);
```

### 模式匹配

```rust
macro_rules! print_values {
    ($($x:expr),*) => {
        $(
            println!("{}", $x);
        )*
    };
}

macro_rules! vector {
    ($($x:expr),*) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}

// 使用宏
print_values!(1, 2, 3);
let v = vector![1, 2, 3];
```

## 过程宏

### 派生宏

```rust
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as DeriveInput);
    let name = &ast.ident;
    
    let gen = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    
    gen.into()
}

// 使用派生宏
#[derive(HelloMacro)]
struct Pancakes;
```

### 属性宏

```rust
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as syn::ItemFn);
    let name = &input.sig.ident;
    let path = parse_macro_input!(attr as syn::LitStr);
    
    let gen = quote! {
        fn #name() {
            println!("Route: {}", #path);
            // 原始函数实现
            #input
        }
    };
    
    gen.into()
}

// 使用属性宏
#[route("/users")]
fn get_users() {
    println!("Getting users...");
}
```

### 函数式宏

```rust
#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as syn::LitStr);
    let query = input.value();
    
    let gen = quote! {
        {
            println!("Executing SQL: {}", #query);
            // 执行 SQL 查询
            #query
        }
    };
    
    gen.into()
}

// 使用函数式宏
let result = sql!("SELECT * FROM users");
```

## 宏的最佳实践

### 错误处理

```rust
macro_rules! expect {
    ($expr:expr, $msg:expr) => {
        match $expr {
            Ok(val) => val,
            Err(e) => panic!("{}: {}", $msg, e),
        }
    };
}

// 使用宏
let file = expect!(File::open("config.txt"), "Failed to open config file");
```

### 代码生成

```rust
macro_rules! impl_getter {
    ($field:ident: $type:ty) => {
        fn get_$field(&self) -> $type {
            self.$field.clone()
        }
    };
}

struct Person {
    name: String,
    age: u32,
}

impl Person {
    impl_getter!(name: String);
    impl_getter!(age: u32);
}
```

## 高级特性

### 递归宏

```rust
macro_rules! calculate {
    (eval $e:expr) => {{
        let val: usize = $e;
        println!("{} = {}", stringify!($e), val);
    }};
    
    (eval $e:expr, $(eval $es:expr),+) => {{
        calculate!(eval $e);
        calculate!($(eval $es),+);
    }};
}

// 使用递归宏
calculate!(eval 1 + 2, eval 3 * 4, eval 5 + 6);
```

### 卫生宏

```rust
macro_rules! create_counter {
    ($name:ident) => {
        let mut $name = 0;
        $name += 1;
        println!("Counter: {}", $name);
    };
}

// 使用卫生宏
create_counter!(count);
```

## 调试技巧

### 宏展开

```rust
// 使用 cargo expand 查看宏展开
// cargo install cargo-expand
// cargo expand

macro_rules! debug_print {
    ($($arg:tt)*) => {
        println!("[DEBUG] {}", format!($($arg)*));
    };
}

// 使用调试宏
debug_print!("Value: {}", 42);
```

### 错误信息

```rust
macro_rules! assert_type {
    ($expr:expr, $type:ty) => {
        let _: $type = $expr;
    };
}

// 使用类型检查宏
assert_type!(42, i32);
// assert_type!("hello", i32); // 编译错误
```

## 最佳实践

1. **宏设计**
   - 保持简单性
   - 提供清晰的文档
   - 考虑错误处理

2. **性能考虑**
   - 避免过度使用
   - 优化展开结果
   - 减少编译时间

3. **可维护性**
   - 使用有意义的名称
   - 添加注释说明
   - 遵循命名约定

## 下一步

- 学习 [测试](/rust/testing)
- 了解 [调试](/rust/debugging)
- 探索 [实战项目](/rust/projects) 