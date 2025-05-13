---
title: 面向对象
---

# Python 面向对象编程（OOP）

## 1.1 主题简介
面向对象编程（OOP）是 Python 的核心特性之一，强调用"类"和"对象"来组织代码，实现封装、继承和多态。

## 1.2 类与对象
### 1.2.1 类的定义
```python
class Person:
    pass
```
### 1.2.2 对象的创建
```python
p = Person()
```

## 1.3 属性与方法
### 1.3.1 实例属性与方法
```python
class Dog:
    def __init__(self, name):
        self.name = name  # 实例属性
    def bark(self):
        print(f'{self.name} 汪汪!')

d = Dog('旺财')
d.bark()
```
### 1.3.2 类属性与类方法
```python
class Cat:
    species = '猫'  # 类属性
    @classmethod
    def get_species(cls):
        return cls.species
print(Cat.get_species())
```
### 1.3.3 静态方法
```python
class Math:
    @staticmethod
    def add(a, b):
        return a + b
print(Math.add(1, 2))
```

## 1.4 构造方法与析构方法
```python
class User:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f'{self.name} 被销毁')
```

## 1.5 继承与多态
### 1.5.1 单继承
```python
class Animal:
    def speak(self):
        print('动物叫')
class Dog(Animal):
    def speak(self):
        print('狗叫')
d = Dog()
d.speak()
```
### 1.5.2 多继承
```python
class A:
    def foo(self): print('A')
class B:
    def bar(self): print('B')
class C(A, B):
    pass
c = C()
c.foo(); c.bar()
```
### 1.5.3 多态
- 子类重写父类方法，调用时自动分派。

## 1.6 封装与私有属性
```python
class Account:
    def __init__(self, balance):
        self.__balance = balance  # 私有属性
    def get_balance(self):
        return self.__balance
```
- 私有属性以双下划线开头，外部不可直接访问。

## 1.7 特殊方法（魔法方法）
```python
class Book:
    def __init__(self, title):
        self.title = title
    def __str__(self):
        return f'Book: {self.title}'
    def __len__(self):
        return len(self.title)

b = Book('Python')
print(b)
print(len(b))
```
- 常用魔法方法：`__init__`、`__str__`、`__repr__`、`__len__`、`__eq__`、`__lt__`、`__getitem__`、`__setitem__` 等。

## 1.8 组合与聚合
```python
class Engine:
    pass
class Car:
    def __init__(self):
        self.engine = Engine()  # 组合
```

## 1.9 常见设计模式
- 单例模式、工厂模式、装饰器模式、观察者模式等。
- 示例：单例模式
```python
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance
```

## 1.10 典型案例
### 1.10.1 学生类
```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def show(self):
        print(f'{self.name}: {self.score}')
```
### 1.10.2 动物多态
```python
def animal_speak(animal):
    animal.speak()

animal_speak(Dog())
```

## 1.11 常见问题与解决
- 忘记 self 参数：实例方法第一个参数必须是 self。
- 私有属性实际可通过 _类名__属性名 访问。
- 多继承时注意 MRO（方法解析顺序）。

## 1.12 最佳实践
- 类名用大驼峰，方法/属性用小写加下划线。
- 只暴露必要接口，内部细节用私有属性。
- 合理使用继承与组合，避免多重继承。
- 多用文档字符串和类型注解。

## 1.13 JSDoc 注释示例
```python
# @class Student
# @param name {str} 学生姓名
# @param score {int} 学生成绩
class Student:
    """
    学生类
    :param name: 学生姓名
    :type name: str
    :param score: 学生成绩
    :type score: int
    """
    def __init__(self, name, score):
        self.name = name
        self.score = score
```

## 1.14 相关资源
- [官方 OOP 文档](https://docs.python.org/zh-cn/3/tutorial/classes.html)
- [廖雪峰 Python 教程-面向对象](https://www.liaoxuefeng.com/wiki/1016959663602400/1017323134763904)

---

> 面向对象思想有助于组织复杂代码，建议多写类、多用多态。 