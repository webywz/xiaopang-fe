---
title: 网络与数据
---

/**
 * Flutter网络与数据
 * @description 介绍Flutter中常用的网络请求与数据处理方法。
 */

# 网络与数据

## http包基础用法
- 适合简单网络请求。
```dart
import 'package:http/http.dart' as http;

void fetchData() async {
  final response = await http.get(Uri.parse('https://api.example.com/data'));
  if (response.statusCode == 200) {
    print(response.body);
  }
}
```

## Dio高级用法
- 支持拦截器、全局配置、文件上传下载等。
```dart
import 'package:dio/dio.dart';

final dio = Dio();
final response = await dio.get('https://api.example.com/data');
```

## 网络请求封装
- 推荐将请求逻辑封装为独立类，便于管理和测试。

## 异步与Future/Stream
- Future 适合一次性异步操作，Stream 适合多次/持续数据流。

## JSON解析与数据模型
- 使用 `dart:convert` 解析 JSON。
```dart
import 'dart:convert';
final data = jsonDecode(response.body);
```
- 建议定义数据模型类，提升类型安全。

## 数据缓存与本地化
- 可结合本地存储（如 shared_preferences、hive）缓存数据。

## 网络异常与重试机制
- 建议统一处理异常，必要时自动重试。

## GraphQL/Socket等高级用法
- 支持 graphql_flutter、web_socket_channel 等第三方库实现实时通信。

## 其他
- 支持Dio、GraphQL等第三方库 