---
title: 可视化
---

# Python 可视化

## 目录
- 可视化基础与流程
- matplotlib 进阶
- seaborn 进阶
- plotly 交互式可视化
- 常见图表类型
- 图表美化与中文支持
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 可视化基础与流程
1. 明确可视化目标（展示趋势、分布、对比、结构等）
2. 选择合适的图表类型
3. 数据预处理与聚合
4. 绘制与美化图表
5. 交互与导出

## matplotlib 进阶
- 最常用的绘图库，支持折线、柱状、散点、直方、饼图、子图、双轴等
- 支持样式美化、坐标轴、图例、标题、注释、保存图片
```python
import matplotlib.pyplot as plt
import numpy as np
x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)
plt.figure(figsize=(8,4))
plt.plot(x, y, label='sin(x)', color='b', linestyle='--')
plt.title('正弦曲线')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.grid(True)
plt.savefig('sin.png')
plt.show()
```

## seaborn 进阶
- 基于 matplotlib，适合统计图表和美化，支持主题、调色板、分面
- 常用图表：箱线图、热力图、分布图、回归图、成对关系图
```python
import seaborn as sns
import matplotlib.pyplot as plt
df = sns.load_dataset('iris')
sns.boxplot(x='species', y='sepal_length', data=df)
sns.set_theme(style='whitegrid')
plt.show()
```

## plotly 交互式可视化
- 支持 Web 交互、缩放、悬浮提示、导出 HTML
- 常用图表：折线、柱状、散点、饼图、地图、3D 图
```python
import plotly.express as px
df = px.data.iris()
fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species', title='Iris 散点图')
fig.show()
```

## 常见图表类型
- 折线图、柱状图、饼图、散点图、箱线图、热力图、直方图、雷达图、地图、3D 图

## 图表美化与中文支持
- 设置主题、调色板、字体、注释、透明度、线型、点型
- matplotlib 中文支持：
```python
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimHei']  # 设置中文字体
plt.rcParams['axes.unicode_minus'] = False    # 正常显示负号
```

## 常见坑与最佳实践
- 中文乱码：需设置字体
- 坐标轴/图例遮挡：调整布局、用 tight_layout()
- 大数据量建议采样或分层展示
- 推荐用 seaborn/plotly 美化和交互
- 图表保存建议用 svg/png 格式

## FAQ
- Q: 如何画多子图？
  A: `plt.subplot(行,列,编号)` 或 `plt.subplots()`
- Q: 如何导出高分辨率图片？
  A: `plt.savefig('a.png', dpi=300)`
- Q: plotly 如何导出为 HTML？
  A: `fig.write_html('a.html')`

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

## 扩展阅读
- [matplotlib 官方文档](https://matplotlib.org/stable/contents.html)
- [seaborn 官方文档](https://seaborn.pydata.org/)
- [plotly 官方文档](https://plotly.com/python/)
- [可视化案例与灵感](https://www.kaggle.com/datasets?search=visualization)

---

> 建议多用 matplotlib、seaborn 练习数据可视化，plotly 适合交互式展示和 Web 应用，注意中文支持和图表美观性。 