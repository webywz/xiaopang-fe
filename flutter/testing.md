---
title: 测试与调试
---

/**
 * Flutter测试与调试
 * @description 介绍Flutter常用的测试与调试方法。
 */

# 测试与调试

## 单元测试
- 使用 `test` 包进行Dart代码单元测试

```dart
test('加法测试', () {
  expect(1 + 1, 2);
});
```

## Widget测试
- 使用 `flutter_test` 包

```dart
testWidgets('文本显示', (WidgetTester tester) async {
  await tester.pumpWidget(const Text('Hello'));
  expect(find.text('Hello'), findsOneWidget);
});
```

## 调试技巧
- 使用 `debugPrint` 输出日志
- DevTools 性能分析、内存检测等 