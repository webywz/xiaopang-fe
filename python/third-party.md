---
title: 第三方库
---

# Python 第三方库

## 目录
- pip 基础与进阶
- requests
- numpy
- pandas
- matplotlib
- flask
- django
- pytest
- jupyter notebook
- scipy
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## pip 基础与进阶
- 安装：`pip install 包名`，升级：`pip install --upgrade 包名`
- 卸载：`pip uninstall 包名`，查看：`pip list`
- requirements.txt 管理依赖：`pip freeze > requirements.txt`
- 国内加速：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple 包名`
- 升级 pip：`python -m pip install --upgrade pip`

## requests
- 网络请求库，支持 GET/POST、文件上传、会话、超时、代理等
```python
import requests
r = requests.get('https://www.example.com', timeout=5)
print(r.status_code, r.text)
```

## numpy
- 科学计算库，支持高效数组、矩阵、广播、线性代数
```python
import numpy as np
a = np.array([1, 2, 3])
print(a.mean(), a.shape)
```

## pandas
- 数据分析库，DataFrame/Series、数据清洗、分组、透视表
```python
import pandas as pd
df = pd.DataFrame({'a': [1, 2], 'b': [3, 4]})
print(df.describe(), df['a'].mean())
```

## matplotlib
- 绘图库，支持折线图、柱状图、散点图、子图、样式美化
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.title('折线图')
plt.show()
```

## flask
- 轻量级 Web 框架，适合 API、小型网站
```python
from flask import Flask
app = Flask(__name__)
@app.route('/')
def hello():
    return 'Hello, World!'
```

## django
- 全功能 Web 框架，适合大型项目，内置 ORM、后台、认证
```python
# 创建项目：django-admin startproject mysite
# 创建应用：python manage.py startapp blog
```

## pytest
- 测试框架，支持断言、参数化、夹具、自动发现
```python
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
```

## jupyter notebook
- 交互式文档，适合数据分析、可视化、教学
```bash
pip install notebook
jupyter notebook
```

## scipy
- 科学计算扩展库，数值积分、优化、信号处理等
```python
import scipy.integrate as integrate
result, _ = integrate.quad(lambda x: x**2, 0, 1)
print(result)
```

## 常见坑与最佳实践
- 建议用虚拟环境隔离依赖
- requirements.txt 固化依赖，便于迁移
- requests 建议加超时参数，防止阻塞
- pandas/numpy 版本兼容性需注意
- matplotlib 中文显示需配置字体
- flask/django 项目建议分层组织

## FAQ
- Q: 如何升级所有已安装包？
  A: `pip list --outdated` + `pip install --upgrade 包名`
- Q: requests 如何设置代理？
  A: `requests.get(url, proxies={'http': 'http://ip:port'})`
- Q: pandas 如何读写 Excel？
  A: `pd.read_excel('a.xlsx')`，`df.to_excel('b.xlsx')`

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

## 扩展阅读
- [PyPI 官方](https://pypi.org/)
- [requests 文档](https://requests.readthedocs.io/zh_CN/latest/)
- [numpy 文档](https://numpy.org/doc/stable/)
- [pandas 文档](https://pandas.pydata.org/docs/)
- [matplotlib 文档](https://matplotlib.org/stable/contents.html)
- [flask 文档](https://dormousehole.readthedocs.io/en/latest/)
- [django 文档](https://docs.djangoproject.com/zh-hans/stable/)
- [pytest 文档](https://docs.pytest.org/zh/latest/)
- [jupyter 文档](https://jupyter.org/documentation)
- [scipy 文档](https://docs.scipy.org/doc/scipy/)

---

> 推荐多了解 PyPI 上的热门库，结合虚拟环境和 requirements.txt 管理依赖，提升开发效率和项目可维护性。 