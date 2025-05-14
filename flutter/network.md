---
title: 网络与数据
---

/**
 * Flutter网络与数据
 * @description 介绍Flutter中常用的网络请求与数据处理方法。
 */

# 网络与数据

## 网络请求
- 推荐使用 `http` 包

```dart
import 'package:http/http.dart' as http;

void fetchData() async {
  final response = await http.get(Uri.parse('https://api.example.com/data'));
  if (response.statusCode == 200) {
    print(response.body);
  }
}
```

## JSON 解析
- 使用 `dart:convert` 包

```dart
import 'dart:convert';

final data = jsonDecode(response.body);
```

## 其他
- 支持Dio、GraphQL等第三方库 