---
title: 面向对象
---

# Python 面向对象编程（OOP）

## 目录
- 类与对象
- 封装与属性
- 继承与多态
- 魔法方法与特殊用法
- 类方法与静态方法
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 类与对象
- 使用 `class` 定义类，实例化对象
- 构造方法 `__init__`，实例属性、实例方法

```python
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f'{self.name} 在叫')

cat = Animal('小猫')
cat.speak()
```

## 封装与属性
- 私有属性/方法：以 `_` 或 `__` 开头（如 `self._age`、`self.__secret`）
- 属性装饰器 `@property` 实现 getter/setter

```python
class Person:
    def __init__(self, age):
        self._age = age
    @property
    def age(self):
        return self._age
    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError('年龄不能为负')
        self._age = value
```

## 继承与多态
- 子类继承父类，重写方法，`super()` 调用父类方法
- 多态：不同子类实现同一接口

```python
class Dog(Animal):
    def speak(self):
        print(f'{self.name} 汪汪叫')

def animal_speak(animal: Animal):
    animal.speak()

d = Dog('小狗')
animal_speak(d)
```

## 魔法方法与特殊用法
- 常用魔法方法：`__init__`、`__str__`、`__repr__`、`__len__`、`__getitem__`、`__setitem__`、`__call__`、`__iter__`、`__next__`

```python
class Counter:
    def __init__(self, n):
        self.n = n
    def __len__(self):
        return self.n
    def __str__(self):
        return f'Counter({self.n})'

c = Counter(5)
print(len(c), str(c))
```

## 类方法与静态方法
- `@classmethod` 第一个参数为类本身 `cls`
- `@staticmethod` 无默认参数

```python
class Tool:
    count = 0
    @classmethod
    def how_many(cls):
        return cls.count
    @staticmethod
    def add(a, b):
        return a + b
```

## 常见坑与最佳实践
- 实例属性与类属性区分，避免误用
- 私有属性只是名称改写，并非真正私有
- 推荐用 `super()` 调用父类方法
- 推荐用 `@property` 管理属性
- 魔法方法需按约定实现，避免滥用

## FAQ
- Q: Python 支持多重继承吗？
  A: 支持，采用 C3 线性化算法（MRO）
- Q: 如何判断对象类型？
  A: `isinstance(obj, Class)`
- Q: 类变量和实例变量有何区别？
  A: 类变量所有实例共享，实例变量每个对象独有

## JSDoc 注释示例
```python
# @class Animal 动物类
# @param name {str} 名字
# @method speak 发声

class Animal:
    """
    动物类
    :param name: 名字
    :type name: str
    """
    def __init__(self, name):
        self.name = name
    def speak(self):
        print(f'{self.name} 在叫')
```

## 扩展阅读
- [官方 OOP 教程](https://docs.python.org/zh-cn/3/tutorial/classes.html)
- [魔法方法大全](https://rszalski.github.io/magicmethods/)
- [PEP8 类风格规范](https://peps.python.org/pep-0008/#class-names)

---

> 面向对象思想有助于组织大型项目结构，建议多用 @property、super()、魔法方法等高级特性。 