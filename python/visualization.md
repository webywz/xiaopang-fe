---
title: 可视化
---

# Python 数据可视化详解

## 1.1 主题简介
数据可视化是数据分析和科学计算的重要环节，Python 拥有丰富的可视化库，支持静态和交互式图表。

---

## 1.2 常用可视化库
### 1.2.1 matplotlib —— 基础绘图库
```python
import matplotlib.pyplot as plt
plt.plot([1,2,3],[4,5,6])
plt.title('折线图')
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.show()
```
### 1.2.2 seaborn —— 统计可视化
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = [1,2,2,3,3,3,4]
sns.histplot(data)
plt.show()
```
### 1.2.3 plotly —— 交互式可视化
```python
import plotly.express as px
fig = px.scatter(x=[1,2,3], y=[4,5,6])
fig.show()
```
### 1.2.4 pyecharts —— 中国风交互可视化
```python
from pyecharts.charts import Bar
from pyecharts import options as opts
bar = Bar().add_xaxis(['A','B','C']).add_yaxis('销量',[10,20,30])
bar.set_global_opts(title_opts=opts.TitleOpts(title='柱状图'))
bar.render('bar.html')
```

---

## 1.3 基本图表类型
### 1.3.1 折线图
```python
plt.plot([1,2,3],[4,5,6])
plt.show()
```
### 1.3.2 柱状图
```python
plt.bar(['A','B','C'], [10,20,15])
plt.show()
```
### 1.3.3 饼图
```python
plt.pie([30,40,30], labels=['A','B','C'], autopct='%1.1f%%')
plt.show()
```
### 1.3.4 散点图
```python
plt.scatter([1,2,3],[4,5,6])
plt.show()
```
### 1.3.5 箱线图
```python
plt.boxplot([1,2,2,3,4,5,6])
plt.show()
```
### 1.3.6 直方图
```python
plt.hist([1,2,2,3,3,3,4,5,6], bins=5)
plt.show()
```
### 1.3.7 热力图
```python
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
data = np.random.rand(5,5)
sns.heatmap(data)
plt.show()
```

---

## 1.4 高级可视化
### 1.4.1 多子图
```python
fig, axs = plt.subplots(2,2)
axs[0,0].plot([1,2,3],[4,5,6])
axs[1,1].bar(['A','B'], [10,20])
plt.tight_layout()
plt.show()
```
### 1.4.2 双轴图
```python
fig, ax1 = plt.subplots()
ax2 = ax1.twinx()
ax1.plot([1,2,3],[4,5,6], 'g-')
ax2.bar([1,2,3],[7,8,9], alpha=0.3)
plt.show()
```
### 1.4.3 交互式图表
- plotly、pyecharts 支持缩放、悬浮提示、导出图片等。

---

## 1.5 样式美化与中文支持
- 设置主题：plt.style.use('ggplot')
- 字体设置（中文）：
```python
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
```
- seaborn 主题：sns.set_theme(style='darkgrid')

---

## 1.6 图表保存与导出
```python
plt.savefig('figure.png', dpi=300)
# plotly/pyecharts 可导出为 html/svg/png
```

---

## 1.7 案例实战
### 1.7.1 销售趋势分析
- 读取销售数据，绘制月度趋势折线图。
### 1.7.2 类别分布可视化
- 用柱状图/饼图展示各类别占比。
### 1.7.3 相关性热力图
- 用 seaborn 绘制变量相关性热力图。

---

## 1.8 常见问题与解决
- 中文乱码：设置字体。
- 图表显示不全：plt.tight_layout()。
- 交互式图表无法显示：用 Jupyter 或浏览器打开 html。
- 保存图片模糊：提高 dpi。

## 1.9 最佳实践
- 图表简洁明了，突出重点。
- 合理选择图表类型，避免误导。
- 多用交互式图表提升体验。
- 代码结构清晰，便于复用。

## 1.10 JSDoc 注释示例
```python
# @param x {list} 横坐标
# @param y {list} 纵坐标
# @returns {None}
def plot_line(x, y):
    """
    绘制折线图
    :param x: 横坐标
    :type x: list
    :param y: 纵坐标
    :type y: list
    :return: None
    """
    import matplotlib.pyplot as plt
    plt.plot(x, y)
    plt.show()
```

## 1.11 相关资源
- [matplotlib 官方文档](https://matplotlib.org/stable/contents.html)
- [seaborn 官方文档](https://seaborn.pydata.org/)
- [plotly 官方文档](https://plotly.com/python/)
- [pyecharts 官方文档](https://pyecharts.org/)
- [廖雪峰 matplotlib 教程](https://www.liaoxuefeng.com/wiki/1016959663602400/1017763871903904)

---

> 可视化是数据分析的窗口，建议多尝试不同图表、多查官方文档、多做美化。

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