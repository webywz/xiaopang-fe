---
title: 机器学习
---

# Python 机器学习

## 目录
- 机器学习简介
- scikit-learn
- TensorFlow
- PyTorch
- 数据预处理
- 模型训练与评估
- JSDoc 注释示例

## 机器学习简介
- 机器学习是让计算机自动从数据中学习规律并做出预测的技术。

## scikit-learn
- 经典机器学习库，适合入门
```python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
X = [[1], [2], [3]]
y = [1, 2, 3]
model.fit(X, y)
print(model.predict([[4]]))
```

## TensorFlow
- Google 推出的深度学习框架
```python
import tensorflow as tf
print(tf.__version__)
```

## PyTorch
- Facebook 推出的深度学习框架
```python
import torch
print(torch.__version__)
```

## 数据预处理
- 标准化、归一化、特征选择等

## 模型训练与评估
- 拆分训练集/测试集、训练、预测、评估

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

---

> 建议先用 scikit-learn 入门，再学习 TensorFlow、PyTorch 等深度学习框架。 