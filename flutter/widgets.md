---
title: 核心组件
---

/**
 * Flutter核心组件
 * @description 介绍Flutter常用的核心组件及其用法。
 */

# 核心组件

## 文本与图片组件
### Text
```dart
Text('Hello Flutter', style: TextStyle(fontSize: 20, color: Colors.blue));
```
### RichText
```dart
RichText(
  text: TextSpan(
    text: 'Hello ',
    style: TextStyle(color: Colors.black),
    children: [TextSpan(text: 'Flutter', style: TextStyle(color: Colors.blue))],
  ),
)
```
### Image
```dart
Image.network('https://flutter.dev/images/flutter-logo-sharing.png', width: 100);
```

## 容器与装饰
### Container
```dart
Container(
  padding: EdgeInsets.all(8),
  margin: EdgeInsets.symmetric(vertical: 8),
  decoration: BoxDecoration(
    color: Colors.amber,
    borderRadius: BorderRadius.circular(8),
  ),
  child: Text('容器示例'),
)
```
### Card
```dart
Card(
  elevation: 4,
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Text('卡片组件'),
  ),
)
```

## 布局组件
### Row/Column
```dart
Row(
  children: [Icon(Icons.star), Text('星星')],
)
```
### Stack
```dart
Stack(
  children: [
    Container(width: 100, height: 100, color: Colors.red),
    Positioned(top: 10, left: 10, child: Icon(Icons.star)),
  ],
)
```
### ListView/GridView
```dart
ListView(
  children: [Text('item1'), Text('item2')],
)
```

## 按钮与交互
### ElevatedButton
```dart
ElevatedButton(onPressed: () {}, child: Text('按钮'))
```
### IconButton
```dart
IconButton(icon: Icon(Icons.thumb_up), onPressed: () {})
```

## 表单与输入
### TextField
```dart
TextField(
  decoration: InputDecoration(labelText: '请输入内容'),
)
```
### Checkbox/Radio/Switch
```dart
Checkbox(value: true, onChanged: (v) {})
Radio(value: 1, groupValue: 1, onChanged: (v) {})
Switch(value: true, onChanged: (v) {})
```

## 进度与反馈
### CircularProgressIndicator
```dart
CircularProgressIndicator()
```
### SnackBar
```dart
ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('提示')));
```

## 其他常用组件
- Image、Icon、Divider、AppBar、BottomNavigationBar 等

> 更多组件详见官方文档：https://flutter.dev/docs/development/ui/widgets 