---
title: 标准库
---

# Python 标准库详解

## 1.1 主题简介
Python 标准库内置了大量高效实用的模块，涵盖文件操作、系统管理、数据处理、网络通信、并发编程、测试等各类场景。

---

## 1.2 常用标准库模块

### 1.2.1 os —— 操作系统接口
- 用于文件/目录操作、环境变量、进程管理等。
```python
import os
os.getcwd()           # 获取当前工作目录
os.listdir('.')        # 列出目录内容
os.makedirs('test')    # 创建多级目录
os.remove('file.txt')  # 删除文件
os.environ['PATH']     # 访问环境变量
```

### 1.2.2 sys —— 解释器相关
- 获取命令行参数、退出程序、操作模块路径等。
```python
import sys
print(sys.argv)        # 命令行参数列表
sys.exit(0)            # 正常退出
sys.path.append('lib') # 添加模块搜索路径
```

### 1.2.3 datetime —— 日期与时间
```python
from datetime import datetime, timedelta
now = datetime.now()
print(now.strftime('%Y-%m-%d %H:%M:%S'))
tomorrow = now + timedelta(days=1)
```

### 1.2.4 math —— 数学运算
```python
import math
print(math.pi, math.sqrt(16), math.sin(math.radians(30)))
```

### 1.2.5 random —— 随机数
```python
import random
print(random.randint(1, 10))
print(random.choice(['A', 'B', 'C']))
random.shuffle([1,2,3])
```

### 1.2.6 re —— 正则表达式
```python
import re
m = re.match(r'\d+', '123abc')
print(m.group())
re.findall(r'\w+', 'hello world!')
```

### 1.2.7 json —— JSON 处理
```python
import json
data = {'a': 1}
s = json.dumps(data)
print(json.loads(s))
```

### 1.2.8 csv —— CSV 文件读写
```python
import csv
with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['name', 'age'])
    writer.writerow(['小胖', 18])
```

### 1.2.9 collections —— 容器数据类型
```python
from collections import Counter, defaultdict, namedtuple
c = Counter('aabbcc')
d = defaultdict(int)
Point = namedtuple('Point', ['x', 'y'])
```

### 1.2.10 itertools —— 迭代器工具
```python
import itertools
for x in itertools.permutations([1,2,3]):
    print(x)
```

### 1.2.11 functools —— 高阶函数工具
```python
from functools import reduce, lru_cache
@lru_cache
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
```

### 1.2.12 subprocess —— 子进程管理
```python
import subprocess
subprocess.run(['ls', '-l'])
```

### 1.2.13 logging —— 日志记录
```python
import logging
logging.basicConfig(level=logging.INFO)
logging.info('信息日志')
```

### 1.2.14 argparse —— 命令行参数解析
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--name')
args = parser.parse_args()
print(args.name)
```

### 1.2.15 pathlib —— 路径操作
```python
from pathlib import Path
p = Path('.')
print(list(p.glob('*.py')))
```

### 1.2.16 shutil —— 文件与目录操作
```python
import shutil
shutil.copy('a.txt', 'b.txt')
shutil.rmtree('testdir')
```

### 1.2.17 threading —— 多线程
```python
import threading
def worker():
    print('线程工作')
t = threading.Thread(target=worker)
t.start()
```

### 1.2.18 multiprocessing —— 多进程
```python
from multiprocessing import Process
def worker():
    print('进程工作')
p = Process(target=worker)
p.start()
```

### 1.2.19 http —— HTTP 相关
```python
from http.server import HTTPServer, BaseHTTPRequestHandler
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'Hello')
# HTTPServer(('localhost', 8000), Handler).serve_forever()
```

### 1.2.20 socket —— 网络通信
```python
import socket
s = socket.socket()
s.connect(('www.baidu.com', 80))
```

### 1.2.21 unittest —— 单元测试
```python
import unittest
class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(1+1, 2)
# unittest.main()
```

---

## 1.3 常见问题与解决
- 路径分隔符跨平台问题：推荐用 pathlib。
- 子进程/多线程资源竞争：用锁、队列等同步机制。
- 日志配置混乱：统一用 logging.basicConfig。
- 正则表达式贪婪/非贪婪匹配易错。

## 1.4 最佳实践
- 优先用标准库，减少第三方依赖。
- 读写文件推荐 with 语句，自动关闭。
- 日志、异常、参数解析等建议统一封装。
- 充分利用 collections、itertools、functools 提高代码简洁性。

## 1.5 JSDoc 注释示例
```python
# @param path {str} 文件路径
# @returns {str} 文件内容

def read_file(path):
    """
    读取文件内容
    :param path: 文件路径
    :type path: str
    :return: 文件内容
    :rtype: str
    """
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()
```

## 1.6 相关资源
- [官方标准库文档](https://docs.python.org/zh-cn/3/library/index.html)
- [廖雪峰 Python 教程-标准库](https://www.liaoxuefeng.com/wiki/1016959663602400/1017793865137184)

---

> 善用标准库能极大提升开发效率和代码质量，建议多查官方文档、多实践。 