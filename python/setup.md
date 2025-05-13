---
title: 环境搭建
---

# Python 环境搭建

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