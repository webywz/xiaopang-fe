---
title: 机器学习
---

# Python 机器学习详解

## 1.1 主题简介
Python 是机器学习领域的主流语言，拥有丰富的算法库和工具，支持从数据预处理到模型部署的全流程。

---

## 1.2 机器学习基础
- 机器学习类型：监督学习（分类、回归）、无监督学习（聚类、降维）、强化学习。
- 典型流程：数据准备 → 特征工程 → 模型选择 → 训练 → 评估 → 调优 → 部署。

---

## 1.3 常用机器学习库
### 1.3.1 scikit-learn —— 经典机器学习
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier().fit(X_train, y_train)
pred = model.predict(X_test)
print('准确率:', accuracy_score(y_test, pred))
```
### 1.3.2 tensorflow —— 深度学习
```python
import tensorflow as tf
x = tf.constant([[1.0, 2.0]])
layer = tf.keras.layers.Dense(1)
print(layer(x))
```
### 1.3.3 pytorch —— 深度学习
```python
import torch
import torch.nn as nn
x = torch.tensor([[1.0, 2.0]])
layer = nn.Linear(2, 1)
print(layer(x))
```
### 1.3.4 xgboost —— 集成学习
```python
import xgboost as xgb
dtrain = xgb.DMatrix([[1,2],[3,4]], label=[0,1])
params = {'objective':'binary:logistic'}
model = xgb.train(params, dtrain, num_boost_round=2)
```

---

## 1.4 数据预处理与特征工程
### 1.4.1 缺失值与异常值处理
```python
from sklearn.impute import SimpleImputer
imp = SimpleImputer(strategy='mean')
X_new = imp.fit_transform(X)
```
### 1.4.2 特征缩放与归一化
```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler
X_std = StandardScaler().fit_transform(X)
X_minmax = MinMaxScaler().fit_transform(X)
```
### 1.4.3 特征选择
```python
from sklearn.feature_selection import SelectKBest, f_classif
X_new = SelectKBest(f_classif, k=2).fit_transform(X, y)
```

---

## 1.5 模型训练与评估
### 1.5.1 分类
```python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression().fit(X_train, y_train)
print(model.score(X_test, y_test))
```
### 1.5.2 回归
```python
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X_train, y_train)
print(model.score(X_test, y_test))
```
### 1.5.3 聚类
```python
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3).fit(X)
print(kmeans.labels_)
```
### 1.5.4 降维
```python
from sklearn.decomposition import PCA
X_pca = PCA(n_components=2).fit_transform(X)
```
### 1.5.5 交叉验证
```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(scores.mean())
```
### 1.5.6 模型调优
```python
from sklearn.model_selection import GridSearchCV
params = {'n_estimators':[10,50]}
gs = GridSearchCV(RandomForestClassifier(), params, cv=3)
gs.fit(X, y)
print(gs.best_params_)
```

---

## 1.6 模型保存与部署
```python
import joblib
joblib.dump(model, 'model.pkl')
model2 = joblib.load('model.pkl')
```
- TensorFlow/PyTorch 支持 SavedModel、TorchScript、ONNX 等格式。

---

## 1.7 案例实战
### 1.7.1 鸢尾花分类
- 用 scikit-learn 加载数据，训练模型，评估准确率。
### 1.7.2 房价预测
- 用线性回归/树模型预测房价。
### 1.7.3 图像识别
- 用 TensorFlow/PyTorch 构建简单神经网络。

---

## 1.8 常见问题与解决
- 过拟合：增加数据、正则化、交叉验证。
- 数据不平衡：采样、加权、评价指标调整。
- 训练慢：特征降维、用 GPU。
- 依赖冲突：用虚拟环境隔离。

## 1.9 最佳实践
- 数据清洗和特征工程优先。
- 多用交叉验证和网格搜索。
- 关注模型可解释性和泛化能力。
- 代码结构清晰，便于复现和部署。

## 1.10 JSDoc 注释示例
```python
# @param X {array} 特征矩阵
# @param y {array} 标签
# @returns {object} 训练好的模型

def train_rf(X, y):
    """
    训练随机森林分类器
    :param X: 特征矩阵
    :type X: array
    :param y: 标签
    :type y: array
    :return: 训练好的模型
    :rtype: RandomForestClassifier
    """
    from sklearn.ensemble import RandomForestClassifier
    return RandomForestClassifier().fit(X, y)
```

## 1.11 相关资源
- [scikit-learn 官方文档](https://scikit-learn.org.cn/)
- [TensorFlow 官方文档](https://tensorflow.google.cn/)
- [PyTorch 官方文档](https://pytorch.org/docs/stable/index.html)
- [Kaggle 机器学习实战](https://www.kaggle.com/)

---

> 机器学习重在实践，建议多用真实数据、多做实验、多查官方文档。

---

> 建议先用 scikit-learn 入门，再学习 TensorFlow、PyTorch 等深度学习框架，实际项目中重视数据质量和评估方法。 