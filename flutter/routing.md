---
title: 路由与导航
---

/**
 * Flutter路由与导航
 * @description 介绍Flutter页面路由与导航的基本用法。
 */

# 路由与导航

## 基本用法
- 使用 `Navigator` 进行页面跳转

```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const SecondPage()),
);
```

- 返回上一页：
```dart
Navigator.pop(context);
```

## 命名路由
```dart
MaterialApp(
  routes: {
    '/': (context) => const HomePage(),
    '/second': (context) => const SecondPage(),
  },
)
```

## 路由传参
- 通过构造函数传递参数
- 通过 `settings.arguments` 获取参数 