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
- JSDoc 注释示例

## os
- 操作系统接口
```python
import os
print(os.getcwd())  # 获取当前工作目录
```

## sys
- Python 解释器相关
```python
import sys
print(sys.version)
```

## datetime
- 日期与时间处理
```python
from datetime import datetime
dt = datetime.now()
print(dt)
```

## json
- JSON 编解码
```python
import json
data = {'name': '小胖'}
s = json.dumps(data)
print(json.loads(s))
```

## re
- 正则表达式
```python
import re
m = re.match(r'\d+', '123abc')
print(m.group())
```

## math
- 数学运算
```python
import math
print(math.sqrt(16))
```

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

---

> 善用标准库可大幅提升开发效率。 