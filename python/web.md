---
title: Web开发
---

# Python Web开发

## 目录
- 主流框架对比
- Flask 入门与进阶
- Django 入门与进阶
- FastAPI 简介
- 路由与视图
- 模板渲染
- 表单与请求参数
- 数据库操作
- 用户认证与安全
- RESTful API
- 部署与上线
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 主流框架对比
| 框架    | 适用场景     | 特点           |
| ------- | ------------ | -------------- |
| Flask   | 小型/中型API | 轻量、灵活     |
| Django  | 大型网站     | 全家桶、ORM强  |
| FastAPI | 高性能API    | 异步、类型注解 |

## Flask 入门与进阶
- 轻量级 Web 框架，适合 API、小型网站
```python
from flask import Flask, request, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello Flask!'

@app.route('/user/<name>')
def user(name):
    return f'你好, {name}'

# 启动：flask run
```
- 支持模板渲染、表单、Session、蓝图、扩展（如 Flask-Login、Flask-Migrate）

## Django 入门与进阶
- 全功能 Web 框架，适合大型项目，内置 ORM、后台、认证
```python
# 创建项目：django-admin startproject mysite
# 创建应用：python manage.py startapp blog
# 路由配置：urls.py
from django.urls import path
from . import views
urlpatterns = [
    path('', views.index),
]
# 视图：views.py
def index(request):
    return HttpResponse('Hello Django!')
```
- 支持模板、表单、ORM、Admin、认证、国际化、缓存、信号等

## FastAPI 简介
- 新一代高性能异步 Web 框架，自动生成文档，类型安全
```python
from fastapi import FastAPI
app = FastAPI()

@app.get('/')
def read_root():
    return {'msg': 'Hello FastAPI!'}
# 启动：uvicorn main:app --reload
```

## 路由与视图
- Flask/Django/FastAPI 都有自己的路由机制
- 支持路径参数、查询参数、方法限制

## 模板渲染
- Flask 用 Jinja2，Django 用自带模板引擎
- 支持变量、控制流、模板继承

## 表单与请求参数
- Flask: `request.form`、`request.args`
- Django: `request.POST`、`request.GET`
- FastAPI: 类型注解自动解析

## 数据库操作
- Django 内置 ORM，Flask 推荐 SQLAlchemy
- 支持增删改查、事务、迁移

## 用户认证与安全
- Django 内置认证系统，Flask 推荐 Flask-Login
- 常见安全措施：CSRF、XSS、加密、权限

## RESTful API
- Flask/Django/FastAPI 都可用于 API 开发
- 推荐用 Flask-RESTful、Django REST framework、FastAPI

## 部署与上线
- 常用部署：Gunicorn+Nginx、uWSGI、Docker、云平台
- 静态文件、环境变量、日志、反向代理

## 常见坑与最佳实践
- 路由冲突、模板路径错误、数据库迁移遗漏
- 推荐分层组织代码（视图、模型、路由、模板分离）
- 配置文件与密钥不要写死在代码里
- 推荐用虚拟环境和 requirements.txt 管理依赖
- 生产环境关闭 debug，开启日志

## FAQ
- Q: Flask 如何返回 JSON？
  A: `from flask import jsonify; return jsonify(data)`
- Q: Django 如何自定义 404 页面？
  A: 在项目根目录新建 404.html 模板
- Q: FastAPI 如何自动生成接口文档？
  A: 访问 `/docs` 或 `/redoc`

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

## 扩展阅读
- [Flask 官方文档](https://dormousehole.readthedocs.io/en/latest/)
- [Django 官方文档](https://docs.djangoproject.com/zh-hans/stable/)
- [FastAPI 官方文档](https://fastapi.tiangolo.com/zh/)
- [Jinja2 模板文档](https://jinja.palletsprojects.com/zh-cn/latest/)
- [Django REST framework](https://www.django-rest-framework.org/)

---

> 建议先用 Flask 入门，再学习 Django、FastAPI 等进阶框架，生产环境务必注意安全和配置管理。 