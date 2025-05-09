# Go语言安装和环境配置

## 下载和安装

1. 访问Go官方网站下载页面: [https://golang.org/dl/](https://golang.org/dl/)
2. 根据您的操作系统下载适当的安装包
3. 按照安装向导完成安装

## 验证安装

安装完成后，打开终端或命令提示符并输入:

```bash
go version
```

应显示类似于以下内容的输出:

```
go version go1.20.3 windows/amd64
```

## 配置环境变量

### Windows

1. 右键点击"这台电脑"，选择"属性"
2. 点击"高级系统设置"
3. 点击"环境变量"
4. 在"系统变量"部分，找到并编辑"Path"变量
5. 添加Go安装目录的bin文件夹路径（通常是 `C:\Go\bin`）

### macOS/Linux

编辑 `~/.bash_profile` 或 `~/.zshrc` 文件，添加以下行:

```bash
export GOPATH=$HOME/go
export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin
```

然后运行:

```bash
source ~/.bash_profile  # 或 source ~/.zshrc
```

## 配置GOPATH

GOPATH是Go工作空间的路径，用于存储Go代码和依赖项。

1. 创建一个Go工作空间目录（例如 `~/go` 或 `C:\Users\YourName\go`）
2. 在工作空间中创建以下子目录:
   - `src`: 存放源代码
   - `pkg`: 存放编译后的包
   - `bin`: 存放可执行文件

## 测试环境配置

创建并运行一个简单的Go程序:

```go
// hello.go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

编译并运行:

```bash
go run hello.go
```

如果一切设置正确，您应该看到输出: `Hello, Go!`

## Go模块配置

从Go 1.11开始，Go引入了模块系统，使依赖管理更加简单:

```bash
# 初始化一个新模块
go mod init example.com/myproject

# 添加、更新或删除依赖项
go get github.com/some/dependency
go get -u github.com/some/dependency  # 更新
go mod tidy  # 清理未使用的依赖
```

## IDE和工具推荐

- Visual Studio Code + Go扩展
- GoLand
- Vim/Neovim + Go插件
- Delve (调试器)
- golint (代码检查)
- gofmt (代码格式化) 