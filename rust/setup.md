# Rust 环境搭建

本文将指导您完成 Rust 开发环境的搭建过程。

## 安装 Rust

### Windows 系统

1. **使用 rustup 安装**

   ```powershell
   # 下载并运行 rustup-init.exe
   # 访问 https://rustup.rs 下载
   ```

2. **验证安装**

   ```powershell
   rustup default stable
   rustc --version
   cargo --version
   ```

### macOS/Linux 系统

1. **使用 rustup 安装**

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **验证安装**

   ```bash
   rustc --version
   cargo --version
   ```

## 配置开发环境

### 1. 安装 IDE 和编辑器

推荐使用以下工具：

- **VS Code**
  - 安装 "rust-analyzer" 扩展
  - 安装 "CodeLLDB" 扩展用于调试

- **IntelliJ IDEA**
  - 安装 "Rust" 插件

- **CLion**
  - 内置 Rust 支持

### 2. 配置 Cargo

1. **创建配置文件**

   ```bash
   mkdir ~/.cargo
   touch ~/.cargo/config.toml
   ```

2. **配置镜像源（可选）**

   ```toml
   [source.crates-io]
   replace-with = 'ustc'

   [source.ustc]
   registry = "git://mirrors.ustc.edu.cn/crates.io-index"
   ```

### 3. 安装常用工具

1. **rustfmt（代码格式化）**

   ```bash
   rustup component add rustfmt
   ```

2. **clippy（代码检查）**

   ```bash
   rustup component add clippy
   ```

3. **rust-analyzer（语言服务器）**

   ```bash
   rustup component add rust-analyzer
   ```

## 创建第一个项目

1. **创建新项目**

   ```bash
   cargo new hello_rust
   cd hello_rust
   ```

2. **项目结构**

   ```
   hello_rust/
   ├── Cargo.toml
   └── src/
       └── main.rs
   ```

3. **运行项目**

   ```bash
   cargo run
   ```

## 常用命令

1. **项目相关**

   ```bash
   cargo new <project_name>    # 创建新项目
   cargo build                 # 编译项目
   cargo run                   # 运行项目
   cargo test                  # 运行测试
   cargo doc                   # 生成文档
   ```

2. **依赖管理**

   ```bash
   cargo add <package>         # 添加依赖
   cargo update                # 更新依赖
   cargo clean                 # 清理构建文件
   ```

## 调试工具

1. **LLDB 调试器**

   ```bash
   rustup component add lldb
   ```

2. **VS Code 调试配置**

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "lldb",
         "request": "launch",
         "name": "Debug Rust",
         "cargo": {
           "args": ["build", "--bin=hello_rust"]
         },
         "args": [],
         "cwd": "${workspaceFolder}"
       }
     ]
   }
   ```

## 常见问题

1. **安装失败**
   - 检查网络连接
   - 尝试使用镜像源
   - 检查系统要求

2. **编译错误**
   - 确保 Rust 工具链完整
   - 检查依赖版本兼容性
   - 查看错误信息

3. **IDE 问题**
   - 确保安装了正确的扩展
   - 检查语言服务器状态
   - 重新加载 IDE

## 下一步

- 学习 [基础语法](/rust/basics)
- 了解 [所有权系统](/rust/ownership)
- 探索 [Cargo 包管理](/rust/cargo)
