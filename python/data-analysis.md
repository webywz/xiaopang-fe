---
title: 数据分析
---

# Python 数据分析

## 目录
- Numpy
- Pandas
- Matplotlib
- 数据读取
- 数据清洗
- 可视化
- JSDoc 注释示例

## Numpy
- 科学计算基础库，支持高效数组运算
```python
import numpy as np
a = np.array([1, 2, 3])
print(a.mean())
```

## Pandas
- 数据分析与处理库，DataFrame 是核心结构
```python
import pandas as pd
df = pd.DataFrame({'a': [1, 2], 'b': [3, 4]})
print(df.describe())
```

## Matplotlib
- 可视化绘图库
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.show()
```

## 数据读取
- 支持 CSV、Excel、SQL 等多种格式
```python
df = pd.read_csv('data.csv')
```

## 数据清洗
- 缺失值处理、去重、类型转换等
```python
df = df.dropna()
df = df.drop_duplicates()
```

## 可视化
- 折线图、柱状图、散点图等

## JSDoc 注释示例
```python
# @param path {str} 文件路径
# @returns {DataFrame} 数据表

def load_csv(path):
    """
    加载 CSV 文件为 DataFrame
    :param path: 文件路径
    :type path: str
    :return: 数据表
    :rtype: pandas.DataFrame
    """
    import pandas as pd
    return pd.read_csv(path)
```

---

> 数据分析是数据驱动决策的基础，建议多练习 Pandas 和 Numpy。 