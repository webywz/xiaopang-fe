---
title: 第三方库
---

# Python 第三方库

## 目录
- pip 安装
- requests
- numpy
- pandas
- matplotlib
- flask
- django
- JSDoc 注释示例

## pip 安装
- 使用 pip 安装第三方库
```bash
pip install requests numpy pandas matplotlib flask django
```

## requests
- 网络请求库
```python
import requests
r = requests.get('https://www.example.com')
print(r.status_code)
```

## numpy
- 科学计算库
```python
import numpy as np
a = np.array([1, 2, 3])
print(a.mean())
```

## pandas
- 数据分析库
```python
import pandas as pd
df = pd.DataFrame({'a': [1, 2], 'b': [3, 4]})
print(df.head())
```

## matplotlib
- 绘图库
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.show()
```

## flask
- 轻量级 Web 框架
```python
from flask import Flask
app = Flask(__name__)
@app.route('/')
def hello():
    return 'Hello, World!'
```

## django
- 全功能 Web 框架
```python
# 通过 django-admin startproject 创建项目
```

## JSDoc 注释示例
```python
# @param url {str} 请求地址
# @returns {str} 响应内容

def fetch(url):
    """
    获取网页内容
    :param url: 请求地址
    :type url: str
    :return: 响应内容
    :rtype: str
    """
    import requests
    return requests.get(url).text
```

---

> 推荐多了解 PyPI 上的热门库，提升开发效率。 