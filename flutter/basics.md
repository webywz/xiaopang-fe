---
title: 基础语法
---

/**
 * Flutter基础语法
 * @description 介绍Dart语言基础与Flutter常用语法。
 */

# 基础语法

## Dart 基础
```dart
void main() {
  print('Hello, Flutter!');
}
```
- 变量声明：`var`、`final`、`const`
- 函数定义、条件、循环、类与对象

## Flutter 入口
```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Hello Flutter')),
        body: const Center(child: Text('欢迎学习Flutter!')),
      ),
    );
  }
}
```

## 热重载
- 使用 `flutter run` 启动项目，保存文件即可热重载。 