---
title: 爬虫开发
---

# Python 爬虫开发详解

## 1.1 主题简介
Python 是网络爬虫开发的主流语言，拥有丰富的爬虫与解析库，适合从简单采集到分布式爬虫的各种场景。

---

## 1.2 爬虫基础
- 爬虫是自动化获取网页数据的程序。
- 基本流程：发送请求 → 获取响应 → 解析数据 → 存储数据。
- 遵守 robots.txt，尊重网站版权和访问频率。

---

## 1.3 常用爬虫库
### 1.3.1 requests —— HTTP 请求
```python
import requests
r = requests.get('https://httpbin.org/get')
print(r.text)
```
### 1.3.2 beautifulsoup4 —— HTML 解析
```python
from bs4 import BeautifulSoup
soup = BeautifulSoup('<p>Hello</p>', 'html.parser')
print(soup.p.text)
```
### 1.3.3 lxml —— 高性能解析
```python
from lxml import etree
html = etree.HTML('<div><p>Hi</p></div>')
print(html.xpath('//p/text()'))
```
### 1.3.4 scrapy —— 爬虫框架
- 支持异步、分布式、数据管道、自动去重。
```python
# scrapy startproject myspider
# scrapy genspider example example.com
```
### 1.3.5 selenium —— 动态页面爬取
```python
from selenium import webdriver
driver = webdriver.Chrome()
driver.get('https://www.baidu.com')
print(driver.page_source)
```

---

## 1.4 HTTP 基础与反爬机制
- HTTP 方法：GET、POST、HEAD、PUT、DELETE。
- 常用请求头：User-Agent、Cookie、Referer。
- 反爬措施：验证码、IP封禁、UA检测、JS渲染、频率限制。
- 应对方法：伪装UA、代理池、验证码识别、selenium 动态渲染、限速。

---

## 1.5 数据解析与提取
### 1.5.1 正则表达式
```python
import re
re.findall(r'<title>(.*?)</title>', '<title>Test</title>')
```
### 1.5.2 BeautifulSoup
```python
soup = BeautifulSoup('<a href="url">link</a>', 'html.parser')
print(soup.a['href'])
```
### 1.5.3 lxml XPath
```python
from lxml import etree
html = etree.HTML('<div><span>1</span></div>')
print(html.xpath('//span/text()'))
```

---

## 1.6 数据存储
- 文本/CSV/JSON：open、csv、json
- 数据库：sqlite3、pymysql、MongoDB
```python
import json
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump({'a': 1}, f)
```

---

## 1.7 分布式与高性能爬虫
- scrapy-redis、scrapy-cluster、消息队列、代理池、断点续爬。
- 多进程/多线程/协程（threading、multiprocessing、asyncio、aiohttp）。

---

## 1.8 典型案例
### 1.8.1 批量抓取图片
```python
import requests
from bs4 import BeautifulSoup
r = requests.get('https://example.com')
soup = BeautifulSoup(r.text, 'html.parser')
for img in soup.find_all('img'):
    url = img['src']
    with open(url.split('/')[-1], 'wb') as f:
        f.write(requests.get(url).content)
```
### 1.8.2 动态页面数据采集
```python
from selenium import webdriver
driver = webdriver.Chrome()
driver.get('https://example.com')
print(driver.page_source)
```
### 1.8.3 scrapy 爬取多页
- 用 scrapy.Spider 实现多页递归爬取。

---

## 1.9 常见问题与解决
- 403/被封禁：更换 UA、用代理、降低频率。
- 数据提取不到：检查网页结构、用 selenium。
- 动态加载：用 selenium 或抓包分析接口。
- 编码问题：加 encoding 参数，或用 r.encoding = r.apparent_encoding。

## 1.10 最佳实践
- 遵守 robots.txt，尊重网站规则。
- 合理设置请求头和延时，避免高频访问。
- 用 try/except 捕获异常，记录日志。
- 数据存储建议结构化，便于后续分析。
- 推荐用虚拟环境隔离依赖。

## 1.11 JSDoc 注释示例
```python
# @param url {str} 目标网址
# @returns {str} 网页内容

def fetch_html(url):
    """
    获取网页 HTML 内容
    :param url: 目标网址
    :type url: str
    :return: 网页内容
    :rtype: str
    """
    import requests
    return requests.get(url).text
```

## 1.12 相关资源
- [requests 官方文档](https://requests.readthedocs.io/zh_CN/latest/)
- [BeautifulSoup4 官方文档](https://beautifulsoup.readthedocs.io/zh_CN/latest/)
- [lxml 官方文档](https://lxml.de/)
- [scrapy 官方文档](https://docs.scrapy.org/zh_CN/latest/)
- [selenium 官方文档](https://selenium-python.readthedocs.io/)

---

> 爬虫开发需遵守法律法规和网站规则，建议多查官方文档、多做实战、多注意反爬机制。

---

# Python 爬虫开发

## 目录
- 爬虫基础流程
- requests 进阶
- BeautifulSoup 进阶
- Scrapy 框架
- 反爬虫与应对
- 数据存储
- 分布式爬虫
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 爬虫基础流程
1. 明确目标网站与数据结构
2. 发送请求获取网页内容
3. 解析网页提取数据
4. 数据清洗与存储
5. 反爬虫应对与异常处理

## requests 进阶
- 支持 GET/POST、headers、cookies、代理、超时、会话
```python
import requests
headers = {'User-Agent': 'Mozilla/5.0'}
proxies = {'http': 'http://127.0.0.1:8080'}
s = requests.Session()
r = s.get('https://www.example.com', headers=headers, proxies=proxies, timeout=5)
print(r.status_code, r.text)
```

## BeautifulSoup 进阶
- 解析 HTML/XML，支持多种解析器（lxml、html.parser）
- 常用方法：find、find_all、select、get_text、attrs
```python
from bs4 import BeautifulSoup
soup = BeautifulSoup(r.text, 'lxml')
titles = [tag.get_text() for tag in soup.select('h2.title')]
print(titles)
```

## Scrapy 框架
- 强大、异步、分层结构，适合大规模抓取
- 支持中间件、管道、分布式、断点续爬
```python
# 创建项目：scrapy startproject myspider
# 定义 Item、Spider、Pipeline
# 运行：scrapy crawl spider_name
```

## 反爬虫与应对
- 常见手段：User-Agent、IP封禁、验证码、JS加密、限速
- 应对策略：
  - 伪造 headers、cookies
  - 使用代理池、IP轮换
  - 加入延时、随机等待
  - 破解验证码（如打码平台、OCR）
  - selenium/pyppeteer 模拟浏览器

## 数据存储
- CSV、Excel、数据库（MySQL、MongoDB）、Redis、Elasticsearch
```python
import pandas as pd
df = pd.DataFrame([{'title': '示例'}])
df.to_csv('data.csv', index=False)
```

## 分布式爬虫
- Scrapy-Redis、分布式队列、去重、断点续爬
- 推荐用 Redis/MQ 管理任务队列

## 常见坑与最佳实践
- 合理设置请求头和延时，避免被封
- 数据解析建议用 CSS 选择器优先，正则次之
- 大量数据建议分批存储，防止内存溢出
- 推荐用 try/except 捕获异常，记录日志
- 遵守 robots.txt，尊重网站版权

## FAQ
- Q: 如何绕过 JS 渲染？
  A: 用 selenium/pyppeteer 等浏览器自动化工具
- Q: 如何批量抓取多页？
  A: 构造翻页 URL，循环请求
- Q: 如何防止 IP 被封？
  A: 用代理池、降低频率、分布式爬虫

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

## 扩展阅读
- [requests 文档](https://requests.readthedocs.io/zh_CN/latest/)
- [BeautifulSoup 文档](https://beautifulsoup.readthedocs.io/zh_CN/latest/)
- [Scrapy 官方文档](https://docs.scrapy.org/zh_CN/latest/)
- [爬虫实战案例](https://cuiqingcai.com/)

---

> 建议先用 requests+BeautifulSoup 入门，进阶可学习 Scrapy、分布式爬虫，务必注意反爬虫和合规性。 