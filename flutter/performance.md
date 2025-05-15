---
title: 性能优化
---

/**
 * Flutter性能优化
 * @description 介绍Flutter常见的性能优化方法与建议。
 */

# 性能优化

## 构建优化
- 使用 const 构造函数，减少不必要的重建。
- 合理拆分 Widget，避免大组件树。
- 使用 const Text、const Widget 提升性能。

## 渲染优化
- 避免在 build 方法中执行耗时操作。
- 使用 ListView.builder 优化长列表。
- 使用 RepaintBoundary 隔离重绘区域。

## 内存优化
- 及时释放不再使用的资源（如图片、控制器）。
- 避免内存泄漏，关注 Stream、Controller 的关闭。

## 启动速度优化
- 精简依赖，减少包体积。
- 使用延迟加载（deferred import）按需加载模块。
- 首页尽量只渲染必要内容，异步加载次要内容。

## 图片与资源优化
- 使用合适分辨率的图片，避免过大。
- 图片懒加载与缓存（如 cached_network_image）。
- SVG、矢量图优先。

## 代码分包与按需加载
- 使用 Flutter 的 deferred import 实现代码分包。
- 按需加载大模块，提升首屏速度。

## 性能监控与分析工具
- DevTools 性能分析、帧率监控、内存检测。
- 使用 Flutter Inspector 检查 Widget 树。

## 性能优化实战建议
- 定期分析性能瓶颈，持续优化。
- 关注官方性能优化文档与社区最佳实践。

## 常见优化点
- 避免不必要的重建（如合理使用 const、Key）
- 使用 ListView.builder 优化长列表
- 图片懒加载与缓存
- 合理拆分组件，减少 Widget 层级
- 使用 DevTools 进行性能分析

## 示例
```dart
const Text('常量文本');
```

## 工具推荐
- DevTools
- Flutter Inspector 