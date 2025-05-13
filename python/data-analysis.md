---
title: 数据分析
---

# Python 数据分析详解

## 1.1 主题简介
Python 是数据分析领域的主流语言，拥有强大的数据处理、统计分析和可视化能力。

---

## 1.2 数据分析流程
1. 明确分析目标
2. 数据采集与读取
3. 数据清洗与预处理
4. 数据探索与统计分析
5. 数据可视化
6. 结果解读与报告

---

## 1.3 常用数据分析库
### 1.3.1 pandas —— 数据处理与分析
```python
import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())
```
### 1.3.2 numpy —— 数值计算
```python
import numpy as np
a = np.array([1,2,3])
print(a.mean())
```
### 1.3.3 scipy —— 科学计算
```python
from scipy import stats
print(stats.ttest_1samp([1,2,3], 2))
```

---

## 1.4 数据读取与清洗
### 1.4.1 读取常见数据格式
```python
df = pd.read_csv('data.csv')
df2 = pd.read_excel('data.xlsx')
df3 = pd.read_json('data.json')
```
### 1.4.2 缺失值处理
```python
df.isnull().sum()
df = df.fillna(0)
df = df.dropna()
```
### 1.4.3 重复值处理
```python
df = df.drop_duplicates()
```
### 1.4.4 数据类型转换
```python
df['col'] = df['col'].astype(int)
```

---

## 1.5 数据探索与统计分析
### 1.5.1 描述性统计
```python
print(df.describe())
print(df['col'].value_counts())
```
### 1.5.2 分组与聚合
```python
grouped = df.groupby('type')['value'].mean()
```
### 1.5.3 相关性分析
```python
print(df.corr())
```
### 1.5.4 透视表
```python
pivot = df.pivot_table(index='A', columns='B', values='C', aggfunc='sum')
```

---

## 1.6 数据可视化
### 1.6.1 matplotlib
```python
import matplotlib.pyplot as plt
df['col'].hist()
plt.show()
```
### 1.6.2 seaborn
```python
import seaborn as sns
sns.boxplot(x='type', y='value', data=df)
plt.show()
```

---

## 1.7 缺失值与异常值处理
### 1.7.1 缺失值检测与填充
```python
df.isnull().sum()
df.fillna(df.mean(), inplace=True)
```
### 1.7.2 异常值检测
```python
q1 = df['col'].quantile(0.25)
q3 = df['col'].quantile(0.75)
iqr = q3 - q1
outliers = df[(df['col'] < q1 - 1.5*iqr) | (df['col'] > q3 + 1.5*iqr)]
```

---

## 1.8 时间序列分析
```python
df['date'] = pd.to_datetime(df['date'])
df.set_index('date', inplace=True)
df.resample('M').mean()
```

---

## 1.9 案例实战
### 1.9.1 销售数据分析
- 读取销售数据，统计每月销售额，绘制趋势图。
```python
df = pd.read_csv('sales.csv')
df['date'] = pd.to_datetime(df['date'])
df.set_index('date', inplace=True)
monthly = df['amount'].resample('M').sum()
monthly.plot()
plt.show()
```
### 1.9.2 用户行为分析
- 分析用户活跃度、留存率、转化率等。

---

## 1.10 常见问题与解决
- 读取中文路径文件报错：加 encoding='utf-8'。
- 数据类型不一致：用 astype 转换。
- 缺失值导致统计异常：先处理缺失值。
- 可视化中文乱码：设置字体。

## 1.11 最佳实践
- 数据清洗优先，保证数据质量。
- 多用 describe、info、value_counts 探索数据。
- 可视化辅助理解数据分布。
- 代码分层组织，便于复用和维护。

## 1.12 JSDoc 注释示例
```python
# @param path {str} 文件路径
# @returns {DataFrame} 数据表

def load_csv(path):
    """
    读取 CSV 文件为 DataFrame
    :param path: 文件路径
    :type path: str
    :return: 数据表
    :rtype: pandas.DataFrame
    """
    import pandas as pd
    return pd.read_csv(path)
```

## 1.13 相关资源
- [pandas 官方文档](https://pandas.pydata.org/docs/)
- [廖雪峰 Pandas 教程](https://www.liaoxuefeng.com/wiki/1016959663602400/1017763871903904)
- [Kaggle 数据分析实战](https://www.kaggle.com/)

---

> 数据分析重在实践，建议多用真实数据、多做可视化、多查官方文档。

---

# Python 数据分析

## 目录
- 数据分析流程概览
- Numpy 进阶
- Pandas 进阶
- Matplotlib 可视化
- 数据读取与导出
- 数据清洗与变换
- 分组与聚合
- 常见数据分析案例
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 数据分析流程概览
1. 明确分析目标
2. 数据采集与读取
3. 数据清洗与预处理
4. 数据探索与可视化
5. 特征工程与建模
6. 结果解读与报告

## Numpy 进阶
- 支持高效数组运算、广播、切片、掩码、线性代数
```python
import numpy as np
a = np.arange(10).reshape(2, 5)
print(a.mean(axis=0))
print(a[a > 5])  # 布尔索引
```
- 常用函数：np.mean, np.std, np.dot, np.linalg.inv, np.concatenate

## Pandas 进阶
- DataFrame/Series，支持索引、切片、缺失值处理、分组、透视表、合并
```python
import pandas as pd
df = pd.DataFrame({'a': [1, 2, None], 'b': [3, 4, 5]})
df = df.fillna(0)
grouped = df.groupby('a').sum()
print(df.describe(), grouped)
```
- 常用方法：fillna, dropna, groupby, pivot_table, merge, apply, map, astype

## Matplotlib 可视化
- 支持折线图、柱状图、散点图、直方图、子图、样式美化
```python
import matplotlib.pyplot as plt
plt.figure(figsize=(6,4))
plt.plot([1,2,3],[4,5,6], label='折线')
plt.bar([1,2,3],[4,5,6], alpha=0.5)
plt.legend()
plt.title('示例图')
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.show()
```

## 数据读取与导出
- 支持 CSV、Excel、SQL、JSON 等多种格式
```python
df = pd.read_csv('data.csv')
df.to_excel('out.xlsx')
```

## 数据清洗与变换
- 缺失值处理、去重、类型转换、字符串处理、重命名、排序
```python
df = df.drop_duplicates()
df['a'] = df['a'].astype(int)
df = df.rename(columns={'a': 'A'})
```

## 分组与聚合
- groupby、agg、pivot_table
```python
grouped = df.groupby('A').agg({'b': 'mean'})
pivot = df.pivot_table(index='A', values='b', aggfunc='sum')
```

## 常见数据分析案例
- 销售数据分析、用户行为分析、异常检测、数据可视化报告

## 常见坑与最佳实践
- Numpy/Pandas 索引从 0 开始，切片不含右端点
- DataFrame 赋值建议用 .loc/.iloc，避免链式赋值警告
- 读写大文件建议分块处理
- Matplotlib 中文显示需配置字体
- 建议用虚拟环境隔离依赖

## FAQ
- Q: Pandas 如何合并多个表？
  A: `pd.merge(df1, df2, on='key')` 或 `pd.concat([df1, df2])`
- Q: 如何处理缺失值？
  A: `df.fillna(0)` 或 `df.dropna()`
- Q: 如何画多子图？
  A: `plt.subplot(行,列,编号)`

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

## 扩展阅读
- [Pandas 官方文档](https://pandas.pydata.org/docs/)
- [Numpy 官方文档](https://numpy.org/doc/stable/)
- [Matplotlib 官方文档](https://matplotlib.org/stable/contents.html)
- [数据分析实战案例](https://www.kaggle.com/)

---

> 数据分析是数据驱动决策的基础，建议多练习 Pandas、Numpy、Matplotlib，结合实际案例提升能力。 