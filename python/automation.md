---
title: 自动化脚本
---

# Python 自动化脚本详解

## 1.1 主题简介
Python 在自动化领域应用广泛，可用于文件处理、办公自动化、网络操作、定时任务、自动化测试等。

---

## 1.2 自动化基础
- 自动化脚本是指用代码自动完成重复性任务，提高效率、减少人为错误。
- 常见场景：批量文件处理、Excel/Word/PDF 操作、网页自动化、接口测试、定时任务等。

---

## 1.3 常用自动化库
### 1.3.1 os、shutil、glob —— 文件与目录操作
```python
import os, shutil, glob
os.listdir('.')
shutil.copy('a.txt', 'b.txt')
for f in glob.glob('*.txt'):
    print(f)
```
### 1.3.2 openpyxl、pandas —— Excel 自动化
```python
import openpyxl
wb = openpyxl.load_workbook('a.xlsx')
ws = wb.active
ws['A1'] = 'Hello'
wb.save('a.xlsx')

import pandas as pd
df = pd.read_excel('a.xlsx')
df['新列'] = 1
df.to_excel('b.xlsx', index=False)
```
### 1.3.3 requests —— 网络自动化
```python
import requests
r = requests.get('https://httpbin.org/get')
print(r.json())
```
### 1.3.4 selenium —— 浏览器自动化
```python
from selenium import webdriver
driver = webdriver.Chrome()
driver.get('https://www.baidu.com')
```
### 1.3.5 pyautogui —— 桌面自动化
```python
import pyautogui
pyautogui.moveTo(100, 100)
pyautogui.click()
```
### 1.3.6 schedule —— 定时任务
```python
import schedule
import time
def job():
    print('定时任务')
schedule.every(10).seconds.do(job)
while True:
    schedule.run_pending()
    time.sleep(1)
```

---

## 1.4 典型自动化案例
### 1.4.1 批量重命名文件
```python
import os
for i, f in enumerate(os.listdir('.')):
    if f.endswith('.jpg'):
        os.rename(f, f'img_{i}.jpg')
```
### 1.4.2 自动整理文件夹
```python
import os, shutil
for f in os.listdir('.'):
    if f.endswith('.pdf'):
        shutil.move(f, './pdfs/'+f)
```
### 1.4.3 批量下载图片
```python
import requests
urls = ['http://xx.com/1.jpg', 'http://xx.com/2.jpg']
for url in urls:
    r = requests.get(url)
    with open(url.split('/')[-1], 'wb') as f:
        f.write(r.content)
```
### 1.4.4 Excel 自动填报
```python
import pandas as pd
df = pd.read_excel('data.xlsx')
df['状态'] = '已处理'
df.to_excel('data_new.xlsx', index=False)
```
### 1.4.5 自动化测试
```python
import pytest
@pytest.mark.parametrize('a,b', [(1,2),(3,4)])
def test_add(a, b):
    assert a + b > 0
```

---

## 1.5 常见问题与解决
- 文件路径错误：用 os.path.join 拼接路径。
- Excel 文件被占用：关闭文件或用 with 语句。
- requests 超时/失败：加 timeout 参数，重试。
- selenium 驱动报错：检查浏览器和驱动版本。
- pyautogui 坐标不准：多屏环境需指定主屏。

## 1.6 最佳实践
- 路径、配置、数据分离，便于维护。
- 用虚拟环境隔离依赖。
- 充分利用日志和异常处理。
- 自动化脚本建议加注释和文档。

## 1.7 JSDoc 注释示例
```python
# @param src {str} 源文件夹
# @param dst {str} 目标文件夹
# @returns {None}
def move_pdfs(src, dst):
    """
    批量移动 PDF 文件
    :param src: 源文件夹
    :type src: str
    :param dst: 目标文件夹
    :type dst: str
    :return: None
    """
    import os, shutil
    for f in os.listdir(src):
        if f.endswith('.pdf'):
            shutil.move(os.path.join(src, f), os.path.join(dst, f))
```

## 1.8 相关资源
- [openpyxl 官方文档](https://openpyxl.readthedocs.io/)
- [pandas 官方文档](https://pandas.pydata.org/docs/)
- [requests 官方文档](https://requests.readthedocs.io/zh_CN/latest/)
- [selenium 官方文档](https://selenium-python.readthedocs.io/)
- [pyautogui 官方文档](https://pyautogui.readthedocs.io/)
- [schedule 官方文档](https://schedule.readthedocs.io/)

---

> 自动化脚本能极大提升效率，建议多用标准库和主流三方库，注意异常处理和日志记录。

---

# Python 自动化脚本

## 目录
- 文件与目录自动化
- 批量处理与重命名
- 定时任务与调度
- 自动化办公（Excel/Word/邮件）
- 网络自动化
- 常用自动化库
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 文件与目录自动化
- 文件读写、遍历、批量复制/移动/删除
```python
import os, shutil
for filename in os.listdir('.'):
    if filename.endswith('.txt'):
        shutil.copy(filename, f'backup_{filename}')
```
- 推荐用 pathlib 进行跨平台路径操作

## 批量处理与重命名
- 遍历文件夹、批量重命名、内容替换
```python
import os
for i, filename in enumerate(os.listdir('imgs')):
    os.rename(f'imgs/{filename}', f'imgs/img_{i}.jpg')
```

## 定时任务与调度
- 使用 schedule、APScheduler、crontab 实现定时自动化
```python
import schedule, time

def job():
    print('定时任务')

schedule.every(1).minutes.do(job)
while True:
    schedule.run_pending()
    time.sleep(1)
```

## 自动化办公（Excel/Word/邮件）
- Excel：openpyxl、pandas 读写
- Word：python-docx
- 邮件：smtplib、email
```python
import pandas as pd
df = pd.read_excel('data.xlsx')
df.to_csv('data.csv')

import smtplib
from email.mime.text import MIMEText
msg = MIMEText('Hello!')
smtp = smtplib.SMTP('smtp.example.com')
smtp.login('user', 'pass')
smtp.sendmail('from@example.com', 'to@example.com', msg.as_string())
smtp.quit()
```

## 网络自动化
- requests 抓取网页，selenium/pyautogui 自动化浏览器/桌面操作
```python
import requests
r = requests.get('https://www.example.com')
print(r.text)
```

## 常用自动化库
- os、shutil、pathlib：文件与目录操作
- schedule、APScheduler：定时任务
- openpyxl、pandas：Excel
- python-docx：Word
- smtplib、email：邮件
- requests、selenium、pyautogui：网络与桌面自动化

## 常见坑与最佳实践
- 路径拼接推荐用 pathlib/ os.path.join，避免硬编码
- 文件操作建议加异常处理，防止误删
- 定时任务建议用日志记录执行情况
- 邮件发送需注意编码和安全
- 自动化脚本建议用虚拟环境隔离依赖

## FAQ
- Q: 如何批量处理大文件？
  A: 推荐用生成器/分块读取，避免内存溢出
- Q: 如何自动发送带附件的邮件？
  A: 用 email.mime.multipart 组装邮件
- Q: 如何自动化网页操作？
  A: 推荐用 selenium 或 pyautogui

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

## 扩展阅读
- [schedule 文档](https://schedule.readthedocs.io/en/stable/)
- [openpyxl 文档](https://openpyxl.readthedocs.io/en/stable/)
- [python-docx 文档](https://python-docx.readthedocs.io/en/latest/)
- [smtplib 文档](https://docs.python.org/zh-cn/3/library/smtplib.html)
- [pyautogui 文档](https://pyautogui.readthedocs.io/en/latest/)

---

> 自动化脚本可极大提升日常工作效率，建议多实践并注意安全与异常处理。 