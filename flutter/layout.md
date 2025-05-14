---
title: 布局与样式
---

/**
 * Flutter布局与样式
 * @description 介绍Flutter常用布局方式与样式设置方法。
 */

# 布局与样式

## 布局方式
- `Row`、`Column`：水平/垂直线性布局
- `Stack`：层叠布局
- `Expanded`、`Flexible`：弹性布局
- `GridView`：网格布局

## 示例
```dart
Row(
  children: const [
    Icon(Icons.home),
    Text('首页'),
  ],
)
```

## 样式设置
- `Container` 支持 `padding`、`margin`、`color`、`decoration` 等
- `TextStyle` 控制字体样式

```dart
Container(
  padding: const EdgeInsets.all(8),
  color: Colors.blue,
  child: const Text('样式示例', style: TextStyle(color: Colors.white)),
)
``` 