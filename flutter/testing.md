---
title: 测试与调试
---

/**
 * Flutter测试与调试
 * @description 介绍Flutter常用的测试与调试方法。
 */

# 测试与调试

## 单元测试（Unit Test）
- 使用 `test` 包进行 Dart 代码逻辑测试。
```dart
test('加法测试', () {
  expect(1 + 1, 2);
});
```
- 适合纯 Dart 逻辑、数据处理等。

## Widget测试
- 使用 `flutter_test` 包，测试 UI 组件渲染与交互。
```dart
testWidgets('文本显示', (WidgetTester tester) async {
  await tester.pumpWidget(const Text('Hello'));
  expect(find.text('Hello'), findsOneWidget);
});
```
- 可模拟点击、输入、滚动等操作。

## 集成测试（Integration Test）
- 测试完整App的功能流程，适合自动化回归。
- 推荐使用 integration_test 包。

## Mock与依赖注入
- 通过 mockito、mocktail 等库模拟依赖，隔离外部影响。

## 调试技巧
- 使用 `debugPrint` 输出日志。
- 断点调试：VS Code/Android Studio 支持断点、变量监控。
- DevTools：性能分析、内存检测、Widget树可视化。

## 性能分析与内存检测
- DevTools 提供 CPU、内存、帧率等分析工具。
- 可定位性能瓶颈与内存泄漏。

## 常见测试用例与最佳实践
- 逻辑分层、单一职责、可测试性设计。
- 保持测试独立、可重复。
- 持续集成（CI）自动化测试。 