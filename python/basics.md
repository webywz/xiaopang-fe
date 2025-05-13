---
title: 基础语法
---

# Python 基础语法

## 1.1 主题简介
Python 基础语法是学习 Python 编程的第一步，涵盖变量、数据类型、运算符、流程控制、函数、作用域、异常处理等内容。

## 1.2 注释与缩进
### 1.2.1 单行注释
```python
# 这是单行注释
```
### 1.2.2 多行注释
```python
'''
这是多行注释
'''
```
### 1.2.3 缩进规则
- Python 用缩进表示代码块，通常为 4 个空格。
- 缩进错误会导致语法错误。

## 1.3 变量与数据类型
### 1.3.1 变量命名规范
- 只能以字母、下划线开头，区分大小写。
- 不可用关键字命名。

### 1.3.2 常用数据类型
- int（整数）、float（浮点数）、str（字符串）、bool（布尔）、None
- list（列表）、tuple（元组）、dict（字典）、set（集合）

### 1.3.3 类型转换
```python
x = 10
s = str(x)  # int 转 str
y = int('20')  # str 转 int
```

## 1.4 运算符
- 算术运算符：+ - * / // % **
- 赋值运算符：= += -=
- 比较运算符：== != > < >= <=
- 逻辑运算符：and or not
- 位运算符：& | ^ ~ << >>
- 成员运算符：in, not in
- 身份运算符：is, is not

## 1.5 输入与输出
### 1.5.1 输入
```python
name = input('请输入姓名：')
```
### 1.5.2 输出
```python
print('Hello,', name)
print('%.2f' % 3.1415)
print('{}, {}'.format('A', 'B'))
print(f'你好, {name}')
```

## 1.6 流程控制
### 1.6.1 条件语句
```python
if x > 0:
    print('正数')
elif x == 0:
    print('零')
else:
    print('负数')
```
### 1.6.2 循环语句
```python
for i in range(5):
    print(i)

n = 0
while n < 5:
    print(n)
    n += 1
```
### 1.6.3 break、continue、else
```python
for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print('循环正常结束')
```
### 1.6.4 列表推导式
```python
squares = [x * x for x in range(10)]
```

## 1.7 函数与作用域
### 1.7.1 函数定义与调用
```python
def add(a, b=0, *args, **kwargs):
    """
    求和函数
    :param a: 第一个加数
    :param b: 第二个加数，默认0
    :param args: 可变参数
    :param kwargs: 关键字参数
    :return: 总和
    """
    return a + b + sum(args) + sum(kwargs.values())

print(add(1, 2, 3, 4, x=5, y=6))
```
### 1.7.2 返回值
- 可返回任意类型，支持多值返回（元组）。
### 1.7.3 文档字符串
- 用三引号写在函数首行。
### 1.7.4 作用域与命名空间
- 局部变量、全局变量
- global、nonlocal 关键字
```python
g_var = 10
def foo():
    global g_var
    g_var = 20
```

## 1.8 错误与异常处理
```python
try:
    x = 1 / 0
except ZeroDivisionError as e:
    print('除零错误:', e)
finally:
    print('无论如何都会执行')
```
- 常见异常：ValueError、TypeError、IndexError、KeyError
- 自定义异常：
```python
class MyError(Exception):
    pass
```

## 1.9 典型案例
### 1.9.1 斐波那契数列
```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a + b
```
### 1.9.2 九九乘法表
```python
for i in range(1, 10):
    for j in range(1, i+1):
        print(f'{j}*{i}={i*j}', end='\t')
    print()
```
### 1.9.3 简单计算器
```python
def calc():
    a = float(input('a='))
    op = input('运算符(+ - * /)：')
    b = float(input('b='))
    if op == '+':
        print(a + b)
    elif op == '-':
        print(a - b)
    elif op == '*':
        print(a * b)
    elif op == '/':
        print(a / b)
    else:
        print('不支持的运算符')
```

## 1.10 常见问题与解决
- 缩进错误：统一用4空格，不要混用Tab。
- 类型错误：注意 input 返回 str，需类型转换。
- 变量未定义：先声明后使用。

## 1.11 最佳实践
- 遵循 PEP8 代码规范。
- 变量、函数命名见名知意。
- 多用文档字符串和注释。
- 每个文件加 `if __name__ == '__main__':` 入口。

## 1.12 JSDoc 注释示例
```python
# @param a {int} 第一个加数
# @param b {int} 第二个加数
# @returns {int} 和

def add(a, b):
    """
    计算两个数之和
    :param a: 第一个加数
    :type a: int
    :param b: 第二个加数
    :type b: int
    :return: 两数之和
    :rtype: int
    """
    return a + b
```

## 1.13 相关资源
- [官方教程](https://docs.python.org/zh-cn/3/tutorial/index.html)
- [PEP8 规范](https://peps.python.org/pep-0008/)
- [廖雪峰 Python 教程](https://www.liaoxuefeng.com/wiki/1016959663602400)

---

> 基础语法是 Python 编程的基石，建议多练习、多思考。 