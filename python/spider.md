---
title: 爬虫开发
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