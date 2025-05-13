---
title: 数据结构
---

# Python 数据结构

## 目录
- 列表（List）
- 元组（Tuple）
- 字典（Dict）
- 集合（Set）
- 数据结构性能对比
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 列表（List）
- 有序可变，支持增删改查，元素可重复
- 常用操作：append、extend、insert、pop、remove、sort、reverse、切片

```python
fruits = ['苹果', '香蕉', '橙子']
fruits.append('葡萄')
fruits[1] = '梨'
print(fruits[0:2])  # 切片
fruits.remove('梨')
fruits.sort()
```

## 元组（Tuple）
- 有序不可变，元素可重复，适合存储只读数据
- 支持嵌套、解包、count、index

```python
point = (1, 2)
x, y = point  # 解包
t = (1, 2, 3, 2)
print(t.count(2), t.index(3))
```

## 字典（Dict）
- 键值对，无序（3.7+为插入有序），键唯一
- 常用操作：get、setdefault、update、pop、keys、values、items、字典推导式

```python
person = {'name': '小胖', 'age': 18}
print(person.get('name'))
person['age'] = 20
for k, v in person.items():
    print(k, v)
# 字典推导式
d = {i: i*i for i in range(5)}
```

## 集合（Set）
- 无序不重复，支持集合运算（交、并、差、对称差）
- 常用操作：add、remove、update、union、intersection、difference、symmetric_difference

```python
nums = {1, 2, 3, 2}
nums.add(4)
nums.remove(1)
print(nums | {5, 6})  # 并集
print(nums & {2, 3})  # 交集
```

## 数据结构性能对比
| 操作         | list   | tuple  | dict   | set    |
| ------------ | ------ | ------ | ------ | ------ |
| 查找         | O(n)   | O(n)   | O(1)   | O(1)   |
| 插入/删除    | O(n)   | 不支持 | O(1)   | O(1)   |
| 是否可变     | 可变   | 不可变 | 可变   | 可变   |

## 常见坑与最佳实践
- 列表/字典的浅拷贝与深拷贝：`copy`、`deepcopy`
- 字典键必须可哈希（如 list 不能做 key）
- 集合去重不保证顺序
- 推荐用推导式简化代码
- 遍历字典推荐用 items()

## FAQ
- Q: 如何快速去重并保持顺序？
  A: `list(dict.fromkeys(lst))`
- Q: 元组能否包含可变对象？
  A: 可以，但元组本身不可变
- Q: 字典如何合并？
  A: Python 3.5+ 可用 `{**d1, **d2}`，3.9+ 可用 `d1 | d2`

## JSDoc 注释示例
```python
# @param items {list} 输入列表
# @returns {list} 去重后的新列表

def deduplicate(items):
    """
    列表去重
    :param items: 输入列表
    :type items: list
    :return: 去重后的新列表
    :rtype: list
    """
    return list(set(items))
```

## 扩展阅读
- [官方数据结构文档](https://docs.python.org/zh-cn/3/tutorial/datastructures.html)
- [collections 模块](https://docs.python.org/zh-cn/3/library/collections.html)
- [深拷贝与浅拷贝](https://docs.python.org/zh-cn/3/library/copy.html)

---

> 熟练掌握数据结构是高效编程的基础，建议多用推导式和内置方法。 