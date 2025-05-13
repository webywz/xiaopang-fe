---
title: 环境搭建
---

# Python 环境搭建

## 1.1 安装 Python

### 1.1.1 官方安装包
- 访问 [Python 官网](https://www.python.org/downloads/) 下载对应操作系统的安装包。
- Windows 用户建议勾选"Add Python to PATH"。
- macOS 可直接下载安装包或使用 Homebrew。
- Linux 可通过包管理器（如 apt、yum）安装。

### 1.1.2 Anaconda 发行版
- 适合数据科学、科学计算用户。
- 集成大量常用库和包管理工具（conda）。
- [Anaconda 官网](https://www.anaconda.com/products/individual)

### 1.1.3 源码安装
- 适合有特殊需求或服务器环境。
- 下载源码包，解压后：
  ```bash
  ./configure
  make
  sudo make install
  ```

## 1.2 版本管理

### 1.2.1 多版本共存
- Windows 可通过安装不同目录实现。
- 推荐使用 pyenv（Linux/macOS）或 pyenv-win（Windows）进行多版本管理。
- pyenv 安装示例：
  ```bash
  # macOS/Linux
  curl https://pyenv.run | bash
  pyenv install 3.11.0
  pyenv global 3.11.0
  ```

### 1.2.2 检查 Python 版本
```bash
python --version
python3 --version
```

## 1.3 虚拟环境管理

### 1.3.1 venv（标准库自带）
- 创建虚拟环境：
  ```bash
  python -m venv venv_name
  ```
- 激活虚拟环境：
  - Windows: `venv_name\Scripts\activate`
  - macOS/Linux: `source venv_name/bin/activate`
- 退出虚拟环境：`deactivate`

### 1.3.2 virtualenv
- 支持更多 Python 版本，兼容性好。
- 安装：`pip install virtualenv`
- 用法同 venv。

### 1.3.3 conda 环境
- 适合 Anaconda 用户。
- 创建环境：`conda create -n env_name python=3.11`
- 激活环境：`conda activate env_name`

## 1.4 包管理工具

### 1.4.1 pip
- Python 官方推荐包管理工具。
- 常用命令：
  ```bash
  pip install 包名
  pip uninstall 包名
  pip list
  pip freeze > requirements.txt
  pip install -r requirements.txt
  ```

### 1.4.2 conda
- 适合科学计算、数据分析。
- 支持包和环境统一管理。

## 1.5 常见问题与解决

### 1.5.1 pip 安装慢/失败
- 更换国内镜像源（如清华、阿里）：
  ```bash
  pip install -i https://pypi.tuna.tsinghua.edu.cn/simple 包名
  ```

### 1.5.2 PATH 配置问题
- 检查 python、pip 是否在环境变量中。
- Windows 可用"系统属性-环境变量"配置。

### 1.5.3 版本冲突
- 推荐每个项目使用独立虚拟环境。

## 1.6 工具推荐
- VSCode/PyCharm（主流 Python IDE）
- Jupyter Notebook（交互式开发）
- Git（版本控制）
- PowerShell/Terminal（命令行工具）

## 1.7 相关资源
- [Python 官方下载](https://www.python.org/downloads/)
- [Anaconda 下载](https://www.anaconda.com/products/individual)
- [pyenv 文档](https://github.com/pyenv/pyenv)
- [清华 PyPI 镜像](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)

## 目录
- 多平台安装
- 配置环境变量
- 虚拟环境管理
- 包管理与加速
- 常见环境问题与解决
- 最佳实践与常见坑
- FAQ
- 扩展阅读

## 多平台安装
### Windows
- 官网下载安装包：[python.org](https://www.python.org/downloads/)
- 安装时务必勾选"Add Python to PATH"
- 可用 Microsoft Store 安装最新版

### macOS
- 推荐用 Homebrew 安装：
  ```bash
  brew install python3
  ```
- 也可官网下载 pkg 安装包

### Linux
- Ubuntu/Debian：`sudo apt update && sudo apt install python3 python3-pip`
- CentOS：`sudo yum install python3 python3-pip`

## 配置环境变量
- Windows 安装时建议自动添加 PATH
- macOS/Linux 可在 `~/.bashrc` 或 `~/.zshrc` 添加：
  ```bash
  export PATH="/usr/local/bin:$PATH"
  ```

## 虚拟环境管理
- 推荐用 venv（内置）、virtualenv、conda
- 创建虚拟环境：
  ```bash
  python3 -m venv venv
  source venv/bin/activate  # Mac/Linux
  venv\Scripts\activate    # Windows
  ```
- 退出虚拟环境：`deactivate`
- conda 用于科学计算环境，适合多版本管理

## 包管理与加速
- 推荐用 pip 安装包：`pip install 包名`
- 更换国内源（如清华）：
  ```bash
  pip install -i https://pypi.tuna.tsinghua.edu.cn/simple 包名
  ```
- requirements.txt 管理依赖：`pip freeze > requirements.txt`

## 常见环境问题与解决
- pip 安装慢/失败：更换国内源
- 多版本冲突：用 pyenv/conda/venv 隔离
- "找不到 python/pip 命令"：检查 PATH
- VSCode/PyCharm 解释器未识别：手动指定 Python 路径

## 最佳实践与常见坑
- 每个项目都用虚拟环境，避免依赖污染
- 不要用 root 用户全局 pip 安装
- requirements.txt/conda.yaml 固化依赖，便于迁移
- 避免 Python 2/3 混用

## FAQ
- Q: 如何升级 pip？
  A: `python -m pip install --upgrade pip`
- Q: 如何查看已安装包？
  A: `pip list`
- Q: 如何卸载包？
  A: `pip uninstall 包名`

## JSDoc 注释示例
```python
# @param a {int} 第一个加数
# @param b {int} 第二个加数
# @returns {int} 和

def add(a, b):
    """
    计算两个数之和
    :param a: 第一个加数
    :type a: int
    :param b: 第二个加数
    :type b: int
    :return: 两数之和
    :rtype: int
    """
    return a + b
```

## 扩展阅读
- [官方安装文档](https://docs.python.org/zh-cn/3/using/index.html)
- [PyPI 镜像列表](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)
- [conda 官方文档](https://docs.conda.io/zh/latest/)

---

> 环境管理是高效开发的基础，建议每个项目都用虚拟环境。 