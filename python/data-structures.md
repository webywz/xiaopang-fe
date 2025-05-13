---
title: 数据结构
---

# Python 数据结构

## 1.1 主题简介
Python 提供了丰富且高效的数据结构，包括列表、元组、字典、集合和字符串，是编程和数据处理的基础。

## 1.2 列表（List）
### 1.2.1 定义与基本操作
```python
lst = [1, 2, 3, 'a', True]
```
- 支持任意类型混合，支持嵌套。
- 索引从 0 开始，支持负索引。

### 1.2.2 常用方法
```python
lst.append(4)      # 末尾添加
lst.insert(1, 'b') # 指定位置插入
lst.pop()          # 删除末尾元素
lst.remove(2)      # 删除指定值
lst.sort()         # 排序（原地）
lst.reverse()      # 反转
lst.count(1)       # 统计出现次数
lst.index('a')     # 查找索引
```

### 1.2.3 切片与遍历
```python
print(lst[1:3])
for item in lst:
    print(item)
```

## 1.3 元组（Tuple）
### 1.3.1 定义与特性
```python
tpl = (1, 2, 3)
```
- 不可变序列，适合存储只读数据。
- 单元素元组需加逗号：`(1,)`

### 1.3.2 解包与遍历
```python
a, b, c = tpl
for x in tpl:
    print(x)
```

## 1.4 字典（Dict）
### 1.4.1 定义与基本操作
```python
d = {'name': '小胖', 'age': 18}
```
- 键必须唯一且可哈希，值任意类型。

### 1.4.2 常用方法
```python
d['gender'] = '男'      # 新增/修改
v = d.get('score', 0)   # 安全获取
for k, v in d.items():
    print(k, v)
d.pop('age')            # 删除键
list(d.keys())          # 所有键
list(d.values())        # 所有值
list(d.items())         # 所有键值对
```

## 1.5 集合（Set）
### 1.5.1 定义与特性
```python
s = {1, 2, 3, 2}
```
- 元素唯一、无序。
- 可用于去重、集合运算。

### 1.5.2 常用操作
```python
s.add(4)
s.remove(2)
s1 = {1, 2, 3}
s2 = {3, 4, 5}
print(s1 | s2)  # 并集
print(s1 & s2)  # 交集
print(s1 - s2)  # 差集
print(s1 ^ s2)  # 对称差集
```

## 1.6 字符串（String）
### 1.6.1 定义与不可变性
```python
s = 'hello world'
```
- 字符串不可变，支持切片、遍历。

### 1.6.2 常用方法
```python
s.upper()
s.lower()
s.title()
s.split(' ')
s.replace('l', 'L')
s.find('o')
s.count('l')
'abc'.join(['1', '2', '3'])
```

## 1.7 性能对比与选择
- 列表适合频繁增删改查。
- 元组适合只读、不可变数据。
- 字典适合映射关系、查找快。
- 集合适合去重、集合运算。

## 1.8 典型案例
### 1.8.1 列表去重
```python
lst = [1, 2, 2, 3]
lst2 = list(set(lst))
```
### 1.8.2 字典统计词频
```python
text = 'hello world hello'
d = {}
for word in text.split():
    d[word] = d.get(word, 0) + 1
```
### 1.8.3 集合交集
```python
s1 = {1, 2, 3}
s2 = {2, 3, 4}
print(s1 & s2)
```

## 1.9 常见问题与解决
- 列表和字典的浅拷贝与深拷贝：用 copy.deepcopy 处理嵌套结构。
- 字典键不可变，否则报错。
- 集合不能包含可变对象（如列表）。

## 1.10 最佳实践
- 优先用字典存储映射关系。
- 只读数据用元组，避免误改。
- 字符串拼接推荐用 join。
- 遍历字典用 items()。

## 1.11 JSDoc 注释示例
```python
# @param lst {list} 输入列表
# @returns {list} 去重后的新列表

def dedup(lst):
    """
    列表去重
    :param lst: 输入列表
    :type lst: list
    :return: 去重后的新列表
    :rtype: list
    """
    return list(set(lst))
```

## 1.12 相关资源
- [官方数据结构文档](https://docs.python.org/zh-cn/3/tutorial/datastructures.html)
- [廖雪峰 Python 教程-数据结构](https://www.liaoxuefeng.com/wiki/1016959663602400/1017329962603680)

---

> 掌握数据结构是高效编程的基础，建议多练习、多比较。 