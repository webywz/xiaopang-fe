---
title: 标准库
---

# Python 标准库

## 目录
- os
- sys
- datetime
- json
- re
- math
- collections
- itertools
- pathlib
- subprocess
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## os
- 操作系统接口，文件/目录操作、环境变量、进程管理
```python
import os
print(os.getcwd())  # 获取当前工作目录
os.mkdir('testdir')
os.environ['MY_ENV'] = '123'
```

## sys
- Python 解释器相关，命令行参数、路径、退出、标准输入输出
```python
import sys
print(sys.version)
print(sys.argv)
sys.exit(0)
```

## datetime
- 日期与时间处理，获取当前时间、格式化、时间差
```python
from datetime import datetime, timedelta
dt = datetime.now()
print(dt.strftime('%Y-%m-%d %H:%M:%S'))
print(dt + timedelta(days=1))
```

## json
- JSON 编解码，序列化与反序列化
```python
import json
data = {'name': '小胖'}
s = json.dumps(data)
print(json.loads(s))
```

## re
- 正则表达式，字符串匹配、提取、替换
```python
import re
m = re.match(r'\d+', '123abc')
print(m.group())
print(re.sub(r'\d+', 'X', '123abc456'))
```

## math
- 数学运算，常用常量、函数
```python
import math
print(math.sqrt(16), math.pi, math.sin(math.radians(30)))
```

## collections
- 高级数据结构：Counter、defaultdict、deque、namedtuple、OrderedDict
```python
from collections import Counter, defaultdict, deque
c = Counter('aabbcc')
d = defaultdict(int)
d['x'] += 1
q = deque([1,2,3])
q.appendleft(0)
print(c, d, q)
```

## itertools
- 高效迭代器工具：count、cycle、chain、combinations、permutations
```python
import itertools
for i in itertools.count(10):
    if i > 12:
        break
    print(i)
```

## pathlib
- 面向对象的文件路径操作，推荐替代 os.path
```python
from pathlib import Path
p = Path('.')
print([x for x in p.iterdir() if x.is_file()])
```

## subprocess
- 子进程管理，执行外部命令
```python
import subprocess
result = subprocess.run(['echo', 'hello'], capture_output=True, text=True)
print(result.stdout)
```

## 常见坑与最佳实践
- 路径拼接推荐用 pathlib/ os.path.join，避免硬编码斜杠
- json.dumps 默认不支持中文，需加 ensure_ascii=False
- datetime 需注意时区问题
- 正则表达式建议用原始字符串 r''
- collections.defaultdict 默认工厂函数不能带参数

## FAQ
- Q: 如何列出目录下所有文件？
  A: `os.listdir()` 或 `Path('.').iterdir()`
- Q: 如何安全删除文件？
  A: `os.remove(path)`，建议先判断文件是否存在
- Q: 如何格式化时间戳？
  A: `datetime.fromtimestamp(ts).strftime('%Y-%m-%d')`

## JSDoc 注释示例
```python
# @returns {str} 当前时间字符串

def get_time_str():
    """
    获取当前时间字符串
    :return: 当前时间
    :rtype: str
    """
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
```

## 扩展阅读
- [官方标准库文档](https://docs.python.org/zh-cn/3/library/index.html)
- [collections 官方文档](https://docs.python.org/zh-cn/3/library/collections.html)
- [itertools 官方文档](https://docs.python.org/zh-cn/3/library/itertools.html)
- [pathlib 官方文档](https://docs.python.org/zh-cn/3/library/pathlib.html)

---

> 善用标准库可大幅提升开发效率，建议多查官方文档和用 pathlib 替代 os.path。 