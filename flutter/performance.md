---
title: 性能优化
---

/**
 * Flutter性能优化
 * @description 介绍Flutter常见的性能优化方法与建议。
 */

# 性能优化

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