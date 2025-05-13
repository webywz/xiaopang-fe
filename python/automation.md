---
title: 自动化脚本
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