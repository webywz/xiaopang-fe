---
title: 基础语法
---

/**
 * Flutter基础语法
 * @description 介绍Dart语言基础与Flutter常用语法。
 */

# 基础语法

## Dart语言基础
### 变量与常量
```dart
var name = '小胖';
final age = 18;
const pi = 3.14;
```
- `var` 自动推断类型，`final` 运行时常量，`const` 编译时常量。

### 数据类型
- int、double、String、bool、List、Map、Set、dynamic

### 运算符
- 算术、关系、逻辑、赋值、条件、类型判断等

### 控制流
```dart
if (age > 18) {
  print('成年人');
} else {
  print('未成年人');
}

for (var i = 0; i < 3; i++) {
  print(i);
}
```

### 函数与方法
```dart
double add(double a, double b) => a + b;
```

### 类与对象
```dart
class Person {
  String name;
  Person(this.name);
}
var p = Person('小胖');
```

### 异常处理
```dart
try {
  throw Exception('错误');
} catch (e) {
  print(e);
}
```

## Flutter项目结构
- lib/main.dart 入口文件
- pubspec.yaml 配置依赖
- assets/ 资源目录

## main函数与入口
```dart
void main() => runApp(const MyApp());
```

## 热重载与热重启
- `flutter run` 启动项目，保存文件自动热重载。
- 热重启会重置应用状态。

## 常用代码规范
- 文件命名用下划线
- 类名大驼峰，变量小驼峰
- 注释使用JSDoc风格

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