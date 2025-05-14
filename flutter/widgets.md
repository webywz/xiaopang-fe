---
title: 核心组件
---

/**
 * Flutter核心组件
 * @description 介绍Flutter常用的核心组件及其用法。
 */

# 核心组件

## 常用组件
- `Text`：文本显示
- `Container`：容器，支持样式、布局
- `Row`、`Column`：线性布局
- `Stack`：层叠布局
- `ListView`：滚动列表
- `Image`：图片显示
- `Icon`：图标
- `Button` 系列：如 `ElevatedButton`、`TextButton`

## 示例
```dart
Column(
  children: const [
    Text('Hello'),
    Icon(Icons.star),
    ElevatedButton(onPressed: null, child: Text('按钮')),
  ],
)
```

更多组件详见官方文档。 