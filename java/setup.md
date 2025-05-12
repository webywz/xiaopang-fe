/**
 * Java 环境搭建
 * @description 介绍如何在不同操作系统下安装和配置 Java 开发环境
 */

# Java 环境搭建

Java 开发环境的搭建是学习 Java 编程的第一步。本章节将介绍如何在 Windows、macOS 和 Linux 系统下安装 JDK、配置环境变量，并推荐常用开发工具。

## 目录
- [JDK 介绍与下载](#jdk-介绍与下载)
- [Windows 下安装与配置](#windows-下安装与配置)
- [macOS 下安装与配置](#macos-下安装与配置)
- [Linux 下安装与配置](#linux-下安装与配置)
- [常用 IDE 推荐](#常用-ide-推荐)
- [第一个 Java 程序](#第一个-java-程序)
- [常见问题 FAQ](#常见问题-faq)

---

## JDK 介绍与下载

JDK（Java Development Kit）是 Java 开发的基础工具包，包含 JRE、编译器、调试工具等。

- 官方下载地址：[https://www.oracle.com/java/technologies/downloads/](https://www.oracle.com/java/technologies/downloads/)
- 推荐使用 LTS 版本（如 JDK 8、JDK 11、JDK 17）。

| 版本 | 支持情况 | 适用场景 |
| ---- | -------- | -------- |
| JDK 8  | 长期支持 | 老项目、兼容性好 |
| JDK 11 | 长期支持 | 新项目推荐 |
| JDK 17 | 长期支持 | 最新 LTS，建议新项目 |

---

## Windows 下安装与配置

1. 下载 JDK 安装包并安装。
2. 配置环境变量：
   - 新建 `JAVA_HOME`，指向 JDK 安装目录。
   - 在 `Path` 变量中添加 `%JAVA_HOME%\bin`。
3. 验证安装：

```shell
java -version
javac -version
```

---

## macOS 下安装与配置

1. 推荐使用 Homebrew 安装：

```shell
brew install openjdk@17
```

2. 配置环境变量（以 zsh 为例）：

```shell
echo 'export JAVA_HOME="$(/usr/libexec/java_home -v17)"' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

3. 验证安装：

```shell
java -version
javac -version
```

---

## Linux 下安装与配置

1. 以 Ubuntu 为例：

```shell
sudo apt update
sudo apt install openjdk-17-jdk
```

2. 配置环境变量（可选）：

```shell
echo 'export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"' >> ~/.bashrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

3. 验证安装：

```shell
java -version
javac -version
```

---

## 常用 IDE 推荐

| IDE            | 官网地址                                 | 说明           |
| -------------- | ---------------------------------------- | -------------- |
| IntelliJ IDEA  | https://www.jetbrains.com/idea/          | 功能强大，推荐 |
| Eclipse        | https://www.eclipse.org/                 | 经典老牌       |
| VS Code        | https://code.visualstudio.com/           | 需装 Java 插件 |

---

## 第一个 Java 程序

新建 `HelloWorld.java` 文件，内容如下：

```java
/**
 * 第一个 Java 程序
 * @author 你的名字
 */
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

编译并运行：

```shell
javac HelloWorld.java
java HelloWorld
```

---

## 常见问题 FAQ

### Q1: 安装后 `java -version` 无法识别？
A: 检查环境变量 `JAVA_HOME` 和 `Path` 是否配置正确，重启终端。

### Q2: JDK 版本太多，如何切换？
A: 推荐使用 [jEnv](https://www.jenv.be/)（macOS/Linux）或手动修改环境变量。

### Q3: IDEA 无法识别 JDK？
A: 在 IDEA 设置中手动指定 JDK 路径。

---

> 本文档持续完善，欢迎补充更多环境搭建经验。 