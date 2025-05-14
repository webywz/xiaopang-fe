---
title: 状态管理
---

/**
 * Flutter状态管理
 * @description 介绍Flutter常用的状态管理方式及其适用场景。
 */

# 状态管理

## 常用方式
- `setState`：适用于简单局部状态
- `InheritedWidget`/`InheritedModel`：适合全局状态传递
- `Provider`：社区主流，简单易用
- `Riverpod`：更灵活的Provider升级版
- `Bloc`/`Cubit`：适合大型项目，响应式编程
- `GetX`、`MobX` 等

## 示例
```dart
// setState 示例
setState(() {
  count++;
});
```

## 选择建议
- 小型项目可用 setState/Provider
- 大型项目推荐 Bloc/Riverpod 