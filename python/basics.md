---
title: 基础语法
---

# Python 基础语法

## 目录
- 变量与数据类型
- 运算符
- 流程控制
- 函数与作用域
- 内置函数与常用语法糖
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 变量与数据类型
- 动态类型，无需声明类型，变量名区分大小写
- 常见类型：int、float、str、bool、list、tuple、dict、set、NoneType

```python
x = 10      # int
y = 3.14    # float
name = '小胖'  # str
flag = True # bool
lst = [1, 2, 3]  # list
tpl = (1, 2)     # tuple
dct = {'a': 1}   # dict
s = {1, 2, 3}    # set
n = None         # NoneType
```

## 运算符
- 算术：+ - * / // % **
- 比较：== != > < >= <=
- 逻辑：and or not
- 成员：in, not in
- 身份：is, is not

```python
print(1 + 2, 3 ** 2, 5 // 2)
print('a' in 'abc')
```

## 流程控制
- 条件判断：if/elif/else
- 循环：for、while、break、continue、else
- 列表推导式、字典推导式

```python
if x > 0:
    print('正数')
elif x == 0:
    print('零')
else:
    print('负数')

for i in range(3):
    print(i)

lst = [i*i for i in range(5)]
```

## 函数与作用域
- 使用 def 定义函数，支持默认参数、可变参数、关键字参数
- 局部变量、全局变量、nonlocal

```python
# @param name {str} 用户名
# @returns {str} 问候语

def greet(name='小胖'):
    """
    打招呼
    :param name: 用户名
    :type name: str
    :return: 问候语
    :rtype: str
    """
    return f'你好, {name}!'

global_var = 1

def foo():
    local_var = 2
    print(global_var)
```

## 内置函数与常用语法糖
- 常用内置函数：len, type, range, print, input, sum, max, min, sorted, map, filter, zip, enumerate
- lambda 表达式、三元表达式、解包赋值

```python
squares = list(map(lambda x: x*x, range(5)))
max_val = max([1, 2, 3])
a, b = 1, 2
small = a if a < b else b
```

## 常见坑与最佳实践
- 不要用可变对象做默认参数（如 def foo(lst=[])）
- 注意缩进（建议 4 空格）
- 字符串拼接推荐用 f-string
- 推荐用 enumerate 遍历带索引的序列
- 推荐用列表推导式代替 for+append

## FAQ
- Q: Python 如何交换两个变量？
  A: `a, b = b, a`
- Q: 如何判断变量类型？
  A: `type(x)` 或 `isinstance(x, 类型)`
- Q: 如何格式化字符串？
  A: 推荐用 f-string，如 `f"hello {name}"`

## 扩展阅读
- [官方教程](https://docs.python.org/zh-cn/3/tutorial/index.html)
- [内置函数列表](https://docs.python.org/zh-cn/3/library/functions.html)
- [PEP8 编码规范](https://peps.python.org/pep-0008/)

---

> 建议多练习基础语法，为后续进阶打好基础。 