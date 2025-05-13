---
title: Web开发
---

# Python Web开发

## 目录
- Flask
- Django
- FastAPI
- 路由与视图
- 模板渲染
- 数据库操作
- JSDoc 注释示例

## Flask
- 轻量级 Web 框架，适合小型项目
```python
from flask import Flask
app = Flask(__name__)
@app.route('/')
def index():
    return 'Hello Flask!'
```

## Django
- 全功能 Web 框架，适合大型项目
```python
# 创建项目：django-admin startproject mysite
# 创建应用：python manage.py startapp blog
```

## FastAPI
- 新一代高性能异步 Web 框架
```python
from fastapi import FastAPI
app = FastAPI()
@app.get('/')
def read_root():
    return {'msg': 'Hello FastAPI!'}
```

## 路由与视图
- 路由即 URL 到函数的映射
- Flask、Django、FastAPI 都有自己的路由机制

## 模板渲染
- Flask 用 Jinja2，Django 用自带模板引擎

## 数据库操作
- Django 内置 ORM，Flask 推荐 SQLAlchemy

## JSDoc 注释示例
```python
# @route /hello
# @returns {str} 问候语

@app.route('/hello')
def hello():
    """
    问候接口
    :return: 问候语
    :rtype: str
    """
    return 'Hello!'
```

---

> 建议先用 Flask 入门，再学习 Django、FastAPI 等进阶框架。 