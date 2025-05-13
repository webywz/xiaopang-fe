---
title: 自动化脚本
---

# Python 自动化脚本

## 目录
- 文件操作
- 批量处理
- 定时任务
- 自动化办公
- JSDoc 注释示例

## 文件操作
- 读写文件、遍历目录
```python
with open('test.txt', 'w') as f:
    f.write('Hello, world!')
```

## 批量处理
- 遍历文件、批量重命名
```python
import os
for filename in os.listdir('.'):
    print(filename)
```

## 定时任务
- 使用 schedule、APScheduler 等库
```python
import schedule
import time

def job():
    print('定时任务')

schedule.every(1).minutes.do(job)
while True:
    schedule.run_pending()
    time.sleep(1)
```

## 自动化办公
- 操作 Excel、Word、邮件等
```python
import pandas as pd
df = pd.read_excel('data.xlsx')
df.to_csv('data.csv')
```

## JSDoc 注释示例
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
    with open(path, 'r') as f:
        return f.read()
```

---

> 自动化脚本可极大提升日常工作效率，建议多实践。 