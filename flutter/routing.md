---
title: 路由与导航
---

/**
 * Flutter路由与导航
 * @description 介绍Flutter页面路由与导航的基本用法。
 */

# 路由与导航

## Navigator基础
- 使用 `Navigator` 进行页面跳转和返回。
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const SecondPage()),
);
Navigator.pop(context);
```

## 路由栈与页面管理
- Flutter 采用栈结构管理页面，push/pushNamed 入栈，pop 出栈。
- 可通过 `Navigator.canPop(context)` 判断是否可返回。

## 命名路由与参数传递
- 在 `MaterialApp` 中配置 routes。
```dart
MaterialApp(
  routes: {
    '/': (context) => const HomePage(),
    '/second': (context) => const SecondPage(),
  },
)
Navigator.pushNamed(context, '/second', arguments: {'id': 1});
```
- 在目标页面通过 `ModalRoute.of(context)?.settings.arguments` 获取参数。

## 路由动画与自定义过渡
- 可自定义页面切换动画。
```dart
Navigator.push(
  context,
  PageRouteBuilder(
    pageBuilder: (c, a1, a2) => const SecondPage(),
    transitionsBuilder: (c, a1, a2, child) => FadeTransition(opacity: a1, child: child),
  ),
);
```

## 嵌套路由与Tab导航
- 使用 `BottomNavigationBar`、`TabBar` 实现多页面切换。

## 路由守卫与权限控制
- 可在跳转前判断权限，未授权可拦截跳转。

## 深度链接与URL Scheme
- 支持通过 url_launcher、uni_links 等插件实现外部唤起和深链跳转。
