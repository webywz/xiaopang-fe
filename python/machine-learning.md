---
title: 机器学习
---

# Python 机器学习

## 目录
- 机器学习基础流程
- scikit-learn 入门与进阶
- TensorFlow 简介
- PyTorch 简介
- 数据预处理与特征工程
- 模型训练与评估
- 超参数调优
- 常见机器学习案例
- 常见坑与最佳实践
- FAQ
- 扩展阅读

## 机器学习基础流程
1. 明确任务（分类、回归、聚类等）
2. 数据采集与探索
3. 数据预处理与特征工程
4. 模型选择与训练
5. 模型评估与调优
6. 结果解释与上线

## scikit-learn 入门与进阶
- 经典机器学习库，API 统一，适合入门与原型开发
```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
X = [[1], [2], [3], [4]]
y = [1, 2, 3, 4]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
model = LinearRegression()
model.fit(X_train, y_train)
pred = model.predict(X_test)
print(mean_squared_error(y_test, pred))
```
- 常用模块：model_selection, preprocessing, metrics, ensemble, svm, tree, pipeline

## TensorFlow 简介
- Google 推出的深度学习框架，支持自动微分、动态图、分布式训练
```python
import tensorflow as tf
x = tf.constant([[1.0, 2.0]])
print(tf.reduce_sum(x))
```
- 适合大规模神经网络、生产部署

## PyTorch 简介
- Facebook 推出的深度学习框架，动态图、易于调试
```python
import torch
x = torch.tensor([[1.0, 2.0]])
print(torch.sum(x))
```
- 适合学术研究、原型开发

## 数据预处理与特征工程
- 标准化、归一化、缺失值处理、编码、特征选择、降维
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

## 模型训练与评估
- 训练集/测试集划分、交叉验证、评估指标（准确率、召回率、F1、AUC、MSE等）
- 支持管道（pipeline）自动化流程

## 超参数调优
- 网格搜索、随机搜索、贝叶斯优化
```python
from sklearn.model_selection import GridSearchCV
params = {'fit_intercept': [True, False]}
gs = GridSearchCV(LinearRegression(), params, cv=3)
gs.fit(X, y)
print(gs.best_params_)
```

## 常见机器学习案例
- 房价预测、手写数字识别、文本分类、图片识别、异常检测

## 常见坑与最佳实践
- 数据泄漏：训练集/测试集混用
- 特征分布不一致、类别不均衡
- 过拟合/欠拟合：需正则化、交叉验证
- 建议用 pipeline 串联预处理与建模
- 深度学习建议用 GPU
- 建议用虚拟环境隔离依赖

## FAQ
- Q: scikit-learn 支持深度学习吗？
  A: 不支持，推荐用 TensorFlow/PyTorch
- Q: 如何保存/加载模型？
  A: `joblib.dump(model, 'm.pkl')`，`joblib.load('m.pkl')`
- Q: 如何处理类别特征？
  A: 用 `OneHotEncoder` 或 `LabelEncoder`

## JSDoc 注释示例
```python
# @param X {array} 特征数据
# @param y {array} 标签
# @returns {object} 训练好的模型

def train_model(X, y):
    """
    训练线性回归模型
    :param X: 特征数据
    :type X: array
    :param y: 标签
    :type y: array
    :return: 训练好的模型
    :rtype: object
    """
    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    model.fit(X, y)
    return model
```

## 扩展阅读
- [scikit-learn 官方文档](https://scikit-learn.org/stable/)
- [TensorFlow 官方文档](https://tensorflow.google.cn/)
- [PyTorch 官方文档](https://pytorch.org/docs/stable/index.html)
- [Kaggle 机器学习竞赛](https://www.kaggle.com/)

---

> 建议先用 scikit-learn 入门，再学习 TensorFlow、PyTorch 等深度学习框架，实际项目中重视数据质量和评估方法。 