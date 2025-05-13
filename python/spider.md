---
title: 爬虫开发
---

# Python 爬虫开发

## 目录
- requests
- BeautifulSoup
- Scrapy
- 反爬虫与应对
- 数据存储
- JSDoc 注释示例

## requests
- 发送 HTTP 请求，获取网页内容
```python
import requests
r = requests.get('https://www.example.com')
print(r.text)
```

## BeautifulSoup
- 解析 HTML，提取数据
```python
from bs4 import BeautifulSoup
soup = BeautifulSoup(r.text, 'html.parser')
print(soup.title.string)
```

## Scrapy
- 强大的爬虫框架，适合大规模抓取
```python
# scrapy startproject myspider
```

## 反爬虫与应对
- User-Agent、IP代理、验证码、限速等

## 数据存储
- 保存为 CSV、数据库、Excel 等
```python
import pandas as pd
df = pd.DataFrame([{'title': '示例'}])
df.to_csv('data.csv')
```

## JSDoc 注释示例
```python
# @param url {str} 网页地址
# @returns {str} 网页标题

def get_title(url):
    """
    获取网页标题
    :param url: 网页地址
    :type url: str
    :return: 网页标题
    :rtype: str
    """
    import requests
    from bs4 import BeautifulSoup
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    return soup.title.string
```

---

> 建议先用 requests+BeautifulSoup 入门，进阶可学习 Scrapy 框架。 