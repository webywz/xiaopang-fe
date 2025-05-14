---
title: 本地存储
---

/**
 * Flutter本地存储
 * @description 介绍Flutter常用的本地存储方式。
 */

# 本地存储

## SharedPreferences
- 适合简单键值对存储

```dart
import 'package:shared_preferences/shared_preferences.dart';

void saveData() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('key', 'value');
}
```

## 文件存储
- 使用 `dart:io` 进行文件读写

## 数据库
- 推荐 `sqflite`、`hive` 等第三方库 