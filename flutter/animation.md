---
title: 动画与交互
---

/**
 * Flutter动画与交互
 * @description 介绍Flutter常用动画实现方式与交互技巧。
 */

# 动画与交互

## 基础动画
- 使用 `AnimatedContainer`、`AnimatedOpacity` 等内置动画组件

```dart
AnimatedContainer(
  duration: const Duration(seconds: 1),
  color: Colors.blue,
  width: 100,
  height: 100,
)
```

## 高级动画
- 使用 `AnimationController`、`Tween`、`AnimatedBuilder`

## 手势交互
- `GestureDetector` 监听点击、滑动等事件

```dart
GestureDetector(
  onTap: () => print('点击'),
  child: const Text('点我'),
)
``` 