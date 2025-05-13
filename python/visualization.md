---
title: 可视化
---

# Python 可视化

## 目录
- matplotlib
- seaborn
- plotly
- 常见图表
- JSDoc 注释示例

## matplotlib
- 最常用的绘图库，支持折线图、柱状图、散点图等
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.title('折线图')
plt.show()
```

## seaborn
- 基于 matplotlib，适合统计图表
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = [1,2,2,3,3,3,4]
sns.histplot(data)
plt.show()
```

## plotly
- 交互式可视化库，支持 Web 展示
```python
import plotly.express as px
df = px.data.iris()
fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species')
fig.show()
```

## 常见图表
- 折线图、柱状图、饼图、散点图、热力图等

## JSDoc 注释示例
```python
# @param data {list} 数据
# @returns {None}

def draw_bar(data):
    """
    绘制柱状图
    :param data: 数据
    :type data: list
    :return: None
    """
    import matplotlib.pyplot as plt
    plt.bar(range(len(data)), data)
    plt.show()
```

---

> 建议多用 matplotlib 和 seaborn 练习数据可视化，plotly 适合交互式展示。 