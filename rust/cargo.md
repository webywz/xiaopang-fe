# Rust 包管理

Cargo 是 Rust 的包管理工具，负责构建项目、下载依赖、编译代码等。

## 项目结构

### 创建新项目

```bash
# 创建二进制项目
cargo new my_project

# 创建库项目
cargo new my_lib --lib
```

### 项目结构

```
my_project/
├── Cargo.toml      # 项目配置文件
├── Cargo.lock      # 依赖版本锁定文件
└── src/            # 源代码目录
    └── main.rs     # 主程序入口
```

## Cargo.toml 配置

### 基本配置

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "A sample Rust project"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
```

### 依赖管理

```toml
[dependencies]
# 指定版本
serde = "1.0"

# 指定版本范围
tokio = ">=1.0, <2.0"

# 指定特性
serde_json = { version = "1.0", features = ["preserve_order"] }

# 从 Git 仓库
my_crate = { git = "https://github.com/user/my_crate" }

# 从本地路径
my_local_crate = { path = "../my_local_crate" }
```

### 开发依赖

```toml
[dev-dependencies]
mockall = "0.11"
```

## 常用命令

### 构建命令

```bash
# 编译项目
cargo build

# 编译并运行
cargo run

# 检查代码（不生成二进制文件）
cargo check

# 清理构建产物
cargo clean
```

### 测试命令

```bash
# 运行所有测试
cargo test

# 运行特定测试
cargo test test_name

# 运行文档测试
cargo test --doc
```

### 发布命令

```bash
# 发布到 crates.io
cargo publish

# 更新依赖
cargo update

# 生成文档
cargo doc --open
```

## 工作空间

### 创建工作空间

```toml
# Cargo.toml
[workspace]
members = [
    "crates/foo",
    "crates/bar",
]
```

### 工作空间结构

```
my_workspace/
├── Cargo.toml
├── crates/
│   ├── foo/
│   │   ├── Cargo.toml
│   │   └── src/
│   └── bar/
│       ├── Cargo.toml
│       └── src/
└── src/
```

## 特性管理

### 定义特性

```toml
[features]
default = ["std"]
std = []
no_std = []
```

### 使用特性

```toml
[dependencies]
my_crate = { version = "1.0", features = ["std"] }
```

## 发布配置

### 发布设置

```toml
[package]
publish = false  # 禁止发布
license = "MIT"
repository = "https://github.com/user/my_crate"
```

### 元数据

```toml
[package.metadata]
docs.rs = { targets = ["x86_64-unknown-linux-gnu"] }
```

## 最佳实践

1. **依赖管理**
   - 使用语义化版本
   - 定期更新依赖
   - 最小化依赖数量

2. **项目组织**
   - 合理使用工作空间
   - 模块化设计
   - 清晰的目录结构

3. **发布准备**
   - 完善文档
   - 添加测试
   - 设置合适的许可证

## 常见问题

1. **依赖冲突**
   - 使用 cargo tree 检查依赖树
   - 更新到兼容版本
   - 使用特性控制依赖

2. **构建优化**
   - 使用 release 模式
   - 配置构建缓存
   - 优化依赖特性

## 下一步

- 学习 [Web开发](/rust/web)
- 了解 [系统编程](/rust/systems-programming)
- 探索 [性能优化](/rust/performance) 