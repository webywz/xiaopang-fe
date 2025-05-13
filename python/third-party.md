---
title: 第三方库
---

# Python 第三方库详解

## 1.1 主题简介
Python 拥有极其丰富的第三方库生态，涵盖科学计算、数据分析、Web开发、自动化、爬虫、机器学习等各类场景。

---

## 1.2 包管理工具
### 1.2.1 pip
- 官方推荐包管理工具。
- 常用命令：
  ```bash
  pip install 包名
  pip uninstall 包名
  pip list
  pip show 包名
  pip install -r requirements.txt
  ```
### 1.2.2 conda
- 适合科学计算、数据分析。
- 支持包和环境统一管理。

---

## 1.3 科学计算与数据分析
### 1.3.1 numpy —— 数值计算
```python
import numpy as np
a = np.array([1,2,3])
print(a.mean(), a.shape)
```
### 1.3.2 scipy —— 科学计算
```python
from scipy import stats
print(stats.norm.cdf(0))
```
### 1.3.3 pandas —— 数据分析
```python
import pandas as pd
df = pd.DataFrame({'a':[1,2],'b':[3,4]})
print(df.describe())
```

---

## 1.4 可视化
### 1.4.1 matplotlib —— 基础绘图
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.show()
```
### 1.4.2 seaborn —— 统计可视化
```python
import seaborn as sns
sns.histplot([1,2,2,3])
plt.show()
```
### 1.4.3 plotly —— 交互式可视化
```python
import plotly.express as px
fig = px.scatter(x=[1,2,3], y=[4,5,6])
fig.show()
```

---

## 1.5 机器学习与深度学习
### 1.5.1 scikit-learn —— 机器学习
```python
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit([[1],[2]], [1,2])
print(model.coef_)
```
### 1.5.2 tensorflow —— 深度学习
```python
import tensorflow as tf
x = tf.constant([1,2,3])
print(tf.reduce_sum(x))
```
### 1.5.3 pytorch —— 深度学习
```python
import torch
t = torch.tensor([1,2,3])
print(t.sum())
```
### 1.5.4 xgboost —— 集成学习
```python
import xgboost as xgb
# xgb.DMatrix, xgb.train 等
```

---

## 1.6 Web开发
### 1.6.1 flask —— 轻量级 Web 框架
```python
from flask import Flask
app = Flask(__name__)
@app.route('/')
def hello():
    return 'Hello, Flask!'
# app.run()
```
### 1.6.2 django —— 全功能 Web 框架
```python
# Django 需命令行创建项目和应用
# python manage.py runserver
```
### 1.6.3 fastapi —— 高性能异步 Web 框架
```python
from fastapi import FastAPI
app = FastAPI()
@app.get('/')
def read_root():
    return {'msg': 'Hello, FastAPI!'}
# uvicorn main:app --reload
```

---

## 1.7 网络爬虫
### 1.7.1 requests —— HTTP 请求
```python
import requests
r = requests.get('https://httpbin.org/get')
print(r.json())
```
### 1.7.2 beautifulsoup4 —— HTML 解析
```python
from bs4 import BeautifulSoup
soup = BeautifulSoup('<p>Hello</p>', 'html.parser')
print(soup.p.text)
```
### 1.7.3 scrapy —— 爬虫框架
```python
# scrapy startproject myspider
```

---

## 1.8 自动化与运维
### 1.8.1 selenium —— 浏览器自动化
```python
from selenium import webdriver
driver = webdriver.Chrome()
driver.get('https://www.baidu.com')
```
### 1.8.2 pyautogui —— 桌面自动化
```python
import pyautogui
pyautogui.moveTo(100, 100)
```
### 1.8.3 paramiko —— SSH 远程运维
```python
import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('host', username='user', password='pwd')
```
### 1.8.4 fabric —— 自动化运维
```python
from fabric import Connection
c = Connection('host')
c.run('ls')
```

---

## 1.9 测试
### 1.9.1 pytest —— 单元测试
```python
import pytest
@pytest.mark.parametrize('a,b', [(1,2),(3,4)])
def test_add(a, b):
    assert a + b > 0
```

---

## 1.10 常见问题与解决
- 安装失败：检查 pip/conda 源，或更换国内镜像。
- 依赖冲突：建议用虚拟环境隔离项目。
- 版本不兼容：查阅官方文档，选择合适版本。
- 速度慢：科学计算建议用 numpy、pandas，深度学习建议用 GPU。

## 1.11 最佳实践
- 优先用官方和主流库，关注社区活跃度。
- 每个项目用独立虚拟环境。
- 及时更新依赖，关注安全公告。
- 多查官方文档和 issues。

## 1.12 JSDoc 注释示例
```python
# @param url {str} 请求地址
# @returns {dict} 响应数据

def get_json(url):
    """
    发送 GET 请求并返回 JSON 数据
    :param url: 请求地址
    :type url: str
    :return: 响应数据
    :rtype: dict
    """
    import requests
    return requests.get(url).json()
```

## 1.13 相关资源
- [PyPI 官方库](https://pypi.org/)
- [Anaconda 官网](https://www.anaconda.com/)
- [Awesome Python](https://awesome-python.com/)
- [廖雪峰 Python 教程-第三方库](https://www.liaoxuefeng.com/wiki/1016959663602400/1017793865137184)

---

> 合理选择第三方库能极大提升开发效率和项目质量，建议多查官方文档、多实践。 