---
title: Web开发
---

# Python Web开发详解

## 1.1 主题简介
Python 在 Web 开发领域有着广泛应用，支持从轻量级 API 到大型网站的全栈开发。

---

## 1.2 Web 基础原理
- HTTP 协议、请求与响应、状态码、Cookie/Session、RESTful API。
- WSGI（Web Server Gateway Interface）：Python Web 应用与服务器的标准接口。

---

## 1.3 主流 Web 框架
### 1.3.1 Flask —— 轻量级 Web 框架
```python
from flask import Flask, request, render_template
app = Flask(__name__)
@app.route('/')
def index():
    return 'Hello, Flask!'
# app.run()
```
- 支持路由、模板、表单、会话、扩展丰富。

### 1.3.2 Django —— 全功能 Web 框架
- 内置 ORM、后台管理、认证、模板、路由、表单等。
```python
# 创建项目：django-admin startproject mysite
# 启动服务：python manage.py runserver
```

### 1.3.3 FastAPI —— 高性能异步 Web 框架
- 支持异步、自动文档、类型注解。
```python
from fastapi import FastAPI
app = FastAPI()
@app.get('/')
def read_root():
    return {'msg': 'Hello, FastAPI!'}
# uvicorn main:app --reload
```

---

## 1.4 路由与视图
- 路由：URL 到函数的映射。
- 视图函数：处理请求并返回响应。
- Flask 示例：
```python
@app.route('/user/<name>')
def user(name):
    return f'用户：{name}'
```

---

## 1.5 模板渲染
- Jinja2（Flask/Django 默认模板引擎）。
```python
from flask import render_template
# templates/hello.html: <h1>Hello, {{ name }}!</h1>
@app.route('/hello/<name>')
def hello(name):
    return render_template('hello.html', name=name)
```

---

## 1.6 表单与验证
- Flask-WTF、Django forms。
```python
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired
class MyForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
```

---

## 1.7 数据库与 ORM
- Django ORM、SQLAlchemy（Flask）、Tortoise ORM（FastAPI）。
```python
from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
```

---

## 1.8 会话与认证
- Flask session、Django auth、JWT。
```python
from flask import session
session['user_id'] = 123
```

---

## 1.9 中间件与钩子
- Flask before_request/after_request，Django middleware。
```python
@app.before_request
def before():
    print('请求前')
```

---

## 1.10 API开发与异步Web
- Flask-RESTful、Django REST framework、FastAPI。
- FastAPI 支持 async/await。
```python
@app.get('/items/{item_id}')
async def read_item(item_id: int):
    return {"item_id": item_id}
```

---

## 1.11 部署与运维
- 常用部署：Gunicorn+Nginx、uWSGI、Docker、云平台。
- 静态文件、日志、反向代理、安全加固。

---

## 1.12 常见问题与解决
- 端口被占用：更换端口或释放进程。
- 数据库连接失败：检查配置和权限。
- 跨域问题：使用 CORS 中间件。
- 模板找不到：确认模板路径和文件名。

## 1.13 最佳实践
- 路由、视图、模型分层组织。
- 配置分离，敏感信息用环境变量。
- 日志、异常、认证等统一处理。
- 推荐用虚拟环境和 requirements.txt 管理依赖。

## 1.14 JSDoc 注释示例
```python
# @param name {str} 用户名
# @returns {str} 欢迎语

def greet(name):
    """
    返回欢迎语
    :param name: 用户名
    :type name: str
    :return: 欢迎语
    :rtype: str
    """
    return f'欢迎, {name}!'
```

## 1.15 相关资源
- [Flask 官方文档](https://flask.palletsprojects.com/zh/)
- [Django 官方文档](https://docs.djangoproject.com/zh-hans/)
- [FastAPI 官方文档](https://fastapi.tiangolo.com/zh/)
- [廖雪峰 Flask 教程](https://www.liaoxuefeng.com/wiki/1016959663602400/1017785454945888)

---

> Web开发是 Python 的重要应用场景，建议多实践、多查官方文档。

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