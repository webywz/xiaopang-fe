---
title: 本地存储
---

/**
 * Flutter本地存储
 * @description 介绍Flutter常用的本地存储方式。
 */

# 本地存储

## SharedPreferences用法
- 适合简单键值对存储，如用户设置、Token等。
```dart
import 'package:shared_preferences/shared_preferences.dart';

void saveData() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('key', 'value');
}

void loadData() async {
  final prefs = await SharedPreferences.getInstance();
  String? value = prefs.getString('key');
}
```

## 文件读写（dart:io）
- 适合存储文本、二进制文件。
```dart
import 'dart:io';

void writeFile() async {
  final file = File('/path/to/file.txt');
  await file.writeAsString('内容');
}

void readFile() async {
  final file = File('/path/to/file.txt');
  String contents = await file.readAsString();
}
```

## 路径与权限管理
- 使用 path_provider 获取应用目录。
- Android/iOS 需动态权限申请（如存储、相册）。

## 数据库（sqflite/hive等）
- 适合结构化数据存储。
- `sqflite`：SQLite数据库，支持SQL语句。
- `hive`：轻量级NoSQL数据库，适合小型数据。

## 数据加密与安全
- 可结合 encrypt、flutter_secure_storage 等库实现加密存储。

## 本地存储实战案例
- 用户登录信息、缓存数据、离线功能等。 