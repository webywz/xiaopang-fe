---
title: 状态管理
---

/**
 * Flutter状态管理
 * @description 介绍Flutter常用的状态管理方式及其适用场景。
 */

# 状态管理

## setState原理与用法
- 适用于局部状态更新，简单高效。
```dart
setState(() {
  count++;
});
```
- 仅影响当前 Widget 及其子树。

## InheritedWidget/InheritedModel
- 用于全局状态传递，适合小型全局数据。
- 需手动实现依赖关系和通知机制。

## Provider详解
- 社区主流方案，基于 InheritedWidget 封装，简单易用。
```dart
ChangeNotifierProvider(
  create: (_) => CounterModel(),
  child: Consumer<CounterModel>(
    builder: (context, model, child) => Text('${model.count}'),
  ),
)
```
- 支持依赖注入、响应式更新。

## Riverpod用法
- Provider 的升级版，支持无Context、类型安全、全局管理。
- 支持 StateProvider、FutureProvider、StreamProvider 等。

## Bloc/Cubit模式
- 适合大型项目，响应式编程思想。
- Bloc 通过事件驱动状态流转，解耦 UI 与业务。

## GetX、MobX等第三方方案
- GetX：极简、性能高、API丰富。
- MobX：响应式、自动依赖追踪。

## 状态管理选型建议
- 小型项目可用 setState/Provider
- 大型项目推荐 Bloc/Riverpod
- 需考虑团队熟悉度与社区活跃度

## 状态管理实战案例
- 计数器、TodoList、登录状态等 