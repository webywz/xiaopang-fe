---
title: 布局与样式
---

/**
 * Flutter布局与样式
 * @description 介绍Flutter常用布局方式与样式设置方法。
 */

# 布局与样式

## 布局基础
### Row/Column
- 水平/垂直线性布局，常用于排列子组件。
```dart
Row(
  children: [Text('A'), Text('B')],
)
Column(
  children: [Text('A'), Text('B')],
)
```

### Stack/Positioned
- 层叠布局，可实现绝对定位。
```dart
Stack(
  children: [
    Container(width: 100, height: 100, color: Colors.red),
    Positioned(top: 10, left: 10, child: Icon(Icons.star)),
  ],
)
```

### Expanded/Flexible
- 弹性布局，按比例分配空间。
```dart
Row(
  children: [
    Expanded(child: Container(color: Colors.red)),
    Flexible(child: Container(color: Colors.blue)),
  ],
)
```

### Align/Center
- 对齐与居中。
```dart
Align(alignment: Alignment.topRight, child: Text('右上'))
Center(child: Text('居中'))
```

## 复杂布局
### GridView
- 网格布局，适合图片墙等场景。
```dart
GridView.count(
  crossAxisCount: 2,
  children: [Text('A'), Text('B')],
)
```

### CustomScrollView/Sliver
- 高级滚动视图，支持自定义滚动效果。

### Wrap/Flow
- 自动换行布局。
```dart
Wrap(
  children: [Chip(label: Text('标签1')), Chip(label: Text('标签2'))],
)
```

## 响应式布局
### MediaQuery
- 获取屏幕尺寸，适配不同设备。
```dart
MediaQuery.of(context).size.width
```

### LayoutBuilder
- 根据父容器约束自适应布局。
```dart
LayoutBuilder(
  builder: (context, constraints) {
    return Text('宽度: \\${constraints.maxWidth}');
  },
)
```

## 样式与主题
### 颜色与渐变
```dart
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(colors: [Colors.red, Colors.blue]),
  ),
)
```

### 边框与圆角
```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.black),
    borderRadius: BorderRadius.circular(8),
  ),
)
```

### 阴影与装饰
```dart
Container(
  decoration: BoxDecoration(
    boxShadow: [BoxShadow(color: Colors.grey, blurRadius: 4)],
  ),
)
```

### 全局主题ThemeData
```dart
MaterialApp(
  theme: ThemeData(primarySwatch: Colors.blue),
)
```

## 自定义组件样式
- 通过继承 StatelessWidget/StatefulWidget 实现自定义样式组件。

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