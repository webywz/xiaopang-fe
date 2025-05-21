# Rust 环境搭建

本文将指导您完成 Rust 开发环境的搭建过程。

## 安装 Rust

### Windows 系统

1. **使用 rustup 安装**

   ```powershell
   # 方法1：使用 rustup-init.exe
   # 访问 https://rustup.rs 下载 rustup-init.exe
   # 运行安装程序，按照提示完成安装

   # 方法2：使用 PowerShell 安装
   Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe
   .\rustup-init.exe
   ```

2. **配置环境变量**
   - 将 `%USERPROFILE%\.cargo\bin` 添加到 PATH 环境变量
   - 重启终端使环境变量生效

3. **设置默认工具链**

   ```powershell
   # 设置 stable 版本为默认工具链
   rustup default stable
   ```

4. **验证安装**

   ```powershell
   rustc --version
   cargo --version
   rustup --version
   ```

### macOS/Linux 系统

1. **使用 rustup 安装**

   ```bash
   # 方法1：使用 curl
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # 方法2：使用 wget
   wget https://sh.rustup.rs -O rustup-init.sh
   chmod +x rustup-init.sh
   ./rustup-init.sh
   ```

2. **配置环境变量**

   ```bash
   # 添加到 ~/.bashrc 或 ~/.zshrc
   source "$HOME/.cargo/env"
   ```

3. **设置默认工具链**

   ```bash
   # 设置 stable 版本为默认工具链
   rustup default stable
   ```

4. **验证安装**

   ```bash
   rustc --version
   cargo --version
   rustup --version
   ```

## 配置开发环境

### 1. 安装 IDE 和编辑器

#### VS Code 配置

1. **安装必要扩展**
   - Rust Analyzer（语言服务器）
   - CodeLLDB（调试器）
   - Even Better TOML（TOML 文件支持）
   - crates（依赖管理）
   - Error Lens（错误提示增强）

2. **配置 settings.json**

   ```json
   {
     "rust-analyzer.checkOnSave.command": "clippy",
     "rust-analyzer.cargo.features": "all",
     "rust-analyzer.procMacro.enable": true,
     "rust-analyzer.inlayHints.enable": true,
     "rust-analyzer.inlayHints.typeHints.enable": true,
     "rust-analyzer.inlayHints.chainingHints.enable": true,
     "rust-analyzer.inlayHints.parameterHints.enable": true
   }
   ```

3. **调试配置**

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "lldb",
         "request": "launch",
         "name": "Debug Rust",
         "cargo": {
           "args": ["build", "--bin=${workspaceFolderBasename}"]
         },
         "args": [],
         "cwd": "${workspaceFolder}",
         "sourceLanguages": ["rust"]
       }
     ]
   }
   ```

#### IntelliJ IDEA/CLion 配置

1. **安装 Rust 插件**
   - 打开 Settings/Preferences
   - 转到 Plugins
   - 搜索并安装 "Rust" 插件

2. **配置 Rust 工具链**
   - 打开 Settings/Preferences
   - 转到 Languages & Frameworks > Rust
   - 设置 Rust 工具链路径
   - 配置 Cargo 路径

3. **配置代码风格**
   - 启用 rustfmt 格式化
   - 配置 clippy 检查

### 2. 配置 Cargo

1. **创建配置文件**

   ```bash
   # Windows
   mkdir %USERPROFILE%\.cargo
   # Linux/macOS
   mkdir ~/.cargo
   ```

2. **配置镜像源**

   ```toml
   # ~/.cargo/config.toml
   [source.crates-io]
   # 使用 USTC 镜像
   replace-with = 'ustc'

   [source.ustc]
   registry = "git://mirrors.ustc.edu.cn/crates.io-index"
   # 或者使用 tsinghua 镜像
   # registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"

   [registries.ustc]
   index = "https://mirrors.ustc.edu.cn/crates.io-index"

   [build]
   # 设置编译目标
   target = "x86_64-pc-windows-msvc"  # Windows
   # target = "x86_64-apple-darwin"   # macOS
   # target = "x86_64-unknown-linux-gnu"  # Linux

   [profile.dev]
   # 开发模式配置
   opt-level = 0
   debug = true
   debug-assertions = true
   overflow-checks = true
   lto = false
   panic = 'unwind'
   incremental = true
   codegen-units = 256
   rpath = false

   [profile.release]
   # 发布模式配置
   opt-level = 3
   debug = false
   debug-assertions = false
   overflow-checks = false
   lto = true
   panic = 'abort'
   incremental = false
   codegen-units = 16
   rpath = false
   ```

### 3. 安装常用工具

1. **rustfmt（代码格式化）**

   ```bash
   rustup component add rustfmt
   # 配置 rustfmt
   # ~/.rustfmt.toml
   edition = "2021"
   max_width = 100
   tab_spaces = 4
   newline_style = "Unix"
   ```

2. **clippy（代码检查）**

   ```bash
   rustup component add clippy
   # 配置 clippy
   # ~/.clippy.toml
   cognitive-complexity-threshold = 25
   too-many-arguments-threshold = 10
   ```

3. **rust-analyzer（语言服务器）**

   ```bash
   rustup component add rust-analyzer
   ```

4. **其他工具**

   ```bash
   # 安装 cargo-edit（依赖管理工具）
   cargo install cargo-edit

   # 安装 cargo-watch（文件监视工具）
   cargo install cargo-watch

   # 安装 cargo-expand（宏展开工具）
   cargo install cargo-expand

   # 安装 cargo-udeps（未使用依赖检查）
   cargo install cargo-udeps
   ```

## 创建第一个项目

1. **创建新项目**

   ```bash
   # 创建二进制项目
   cargo new hello_rust
   # 创建库项目
   cargo new hello_rust --lib
   ```

2. **项目结构**

   ```
   hello_rust/
   ├── Cargo.toml          # 项目配置文件
   ├── .gitignore         # Git 忽略文件
   ├── src/               # 源代码目录
   │   ├── main.rs        # 主程序（二进制项目）
   │   └── lib.rs         # 库代码（库项目）
   ├── tests/             # 集成测试目录
   ├── examples/          # 示例代码目录
   └── benches/           # 基准测试目录
   ```

3. **配置 Cargo.toml**

   ```toml
   [package]
   name = "hello_rust"
   version = "0.1.0"
   edition = "2021"
   authors = ["Your Name <your.email@example.com>"]
   description = "A sample Rust project"
   license = "MIT"
   repository = "https://github.com/username/hello_rust"
   documentation = "https://docs.rs/hello_rust"
   readme = "README.md"
   keywords = ["example", "rust"]
   categories = ["example"]

   [dependencies]
   # 添加项目依赖
   serde = { version = "1.0", features = ["derive"] }
   tokio = { version = "1.0", features = ["full"] }

   [dev-dependencies]
   # 添加开发依赖
   pretty_assertions = "1.0"

   [profile.dev]
   # 开发模式配置
   opt-level = 0
   debug = true

   [profile.release]
   # 发布模式配置
   opt-level = 3
   lto = true
   ```

4. **运行项目**

   ```bash
   # 开发模式运行
   cargo run

   # 发布模式运行
   cargo run --release

   # 运行测试
   cargo test

   # 生成文档
   cargo doc --open
   ```

## 常用命令

1. **项目相关**

   ```bash
   cargo new <project_name>    # 创建新项目
   cargo init                  # 在当前目录初始化项目
   cargo build                 # 编译项目
   cargo run                   # 运行项目
   cargo test                  # 运行测试
   cargo doc                   # 生成文档
   cargo clean                 # 清理构建文件
   cargo check                 # 检查代码
   cargo fmt                   # 格式化代码
   cargo clippy                # 运行代码检查
   ```

2. **依赖管理**

   ```bash
   cargo add <package>         # 添加依赖
   cargo add <package> --dev   # 添加开发依赖
   cargo update                # 更新依赖
   cargo tree                  # 显示依赖树
   cargo outdated              # 检查过时的依赖
   cargo audit                 # 检查依赖的安全问题
   ```

3. **发布相关**

   ```bash
   cargo publish               # 发布到 crates.io
   cargo login                 # 登录到 crates.io
   cargo package               # 打包项目
   cargo verify-project        # 验证项目
   ```

## 调试工具

1. **LLDB 调试器**

   ```bash
   # 安装 LLDB
   rustup component add lldb

   # 使用 LLDB 调试
   rust-lldb target/debug/hello_rust
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
         "cwd": "${workspaceFolder}",
         "sourceLanguages": ["rust"],
         "env": {
           "RUST_BACKTRACE": "1"
         }
       }
     ]
   }
   ```

3. **性能分析工具**

   ```bash
   # 安装 perf
   cargo install perf

   # 安装 flamegraph
   cargo install flamegraph

   # 生成火焰图
   cargo flamegraph
   ```

## 常见问题

1. **安装失败**
   - 检查网络连接
   - 尝试使用镜像源
   - 检查系统要求
   - 检查磁盘空间
   - 检查权限设置

2. **编译错误**
   - 确保 Rust 工具链完整
   - 检查依赖版本兼容性
   - 查看错误信息
   - 检查系统库依赖
   - 更新 rustup 和工具链

3. **IDE 问题**
   - 确保安装了正确的扩展
   - 检查语言服务器状态
   - 重新加载 IDE
   - 清除 IDE 缓存
   - 更新 IDE 和扩展

4. **性能问题**
   - 使用 release 模式编译
   - 启用 LTO 优化
   - 检查依赖项
   - 使用性能分析工具
   - 优化代码结构

## 下一步

- 学习 [基础语法](/rust/basics)
- 了解 [所有权系统](/rust/ownership)
- 探索 [Cargo 包管理](/rust/cargo)
- 查看 [标准库文档](https://doc.rust-lang.org/std/)
- 参与 [Rust 社区](https://www.rust-lang.org/community) 