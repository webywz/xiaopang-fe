---
title: 动画与交互
---

/**
 * Flutter动画与交互
 * @description 介绍Flutter常用动画实现方式与交互技巧。
 */

# 动画与交互

## 基础动画组件
- AnimatedContainer、AnimatedOpacity、AnimatedAlign 等，适合简单动画。
```dart
AnimatedContainer(
  duration: Duration(seconds: 1),
  color: Colors.blue,
  width: 100,
  height: 100,
)
```

## 显式动画
- 通过 AnimationController、Tween、AnimatedBuilder 实现复杂动画。
```dart
AnimationController controller = AnimationController(
  duration: const Duration(seconds: 2),
  vsync: this,
);
Animation<double> animation = Tween(begin: 0.0, end: 1.0).animate(controller);
AnimatedBuilder(
  animation: animation,
  builder: (context, child) {
    return Opacity(opacity: animation.value, child: child);
  },
  child: Text('动画'),
)
```

## 交互动画
- Hero 动画：页面间共享元素过渡。
```dart
Hero(
  tag: 'logo',
  child: Image.asset('logo.png'),
)
```
- PageRouteBuilder：自定义页面切换动画。

## 手势识别与交互
- GestureDetector 监听点击、滑动、长按等事件。
```dart
GestureDetector(
  onTap: () => print('点击'),
  onLongPress: () => print('长按'),
  child: Text('点我'),
)
```
- Draggable/LongPressDraggable 支持拖拽交互。

## 自定义动画与曲线
- 可自定义动画曲线（Curves），实现弹性、缓动等效果。

## 动画性能优化
- 合理拆分动画组件，避免不必要的重绘。
- 使用 RepaintBoundary 优化复杂动画。 