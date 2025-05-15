---
title: 平台集成
---

/**
 * Flutter平台集成
 * @description 介绍Flutter与原生平台集成的常见方式。
 */

# 平台集成

## Platform Channels原理
- 用于 Dart 与原生(Android/iOS)代码互调。
- 支持 MethodChannel、EventChannel、BasicMessageChannel。

## 与Android原生交互
- 在 Android 端实现 MethodChannel 处理方法。
- 可调用原生 API、第三方 SDK。
```kotlin
class MainActivity: FlutterActivity() {
  private val CHANNEL = "samples.flutter.dev/battery"
  override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
      call, result ->
      // 处理方法调用
    }
  }
}
```

## 与iOS原生交互
- 在 iOS 端实现 MethodChannel 处理方法。
```swift
let controller : FlutterViewController = window?.rootViewController as! FlutterViewController
let batteryChannel = FlutterMethodChannel(name: "samples.flutter.dev/battery", binaryMessenger: controller.binaryMessenger)
batteryChannel.setMethodCallHandler {
  (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
  // 处理方法调用
}
```

## 插件开发与发布
- 可自定义插件扩展原生能力。
- 发布到 [pub.dev](https://pub.dev/) 供社区使用。

## Web/桌面平台适配
- Flutter 支持 Web、Windows、macOS、Linux 多端部署。
- 可通过条件编译适配不同平台。

## 第三方原生插件集成
- 通过 pubspec.yaml 添加依赖，自动适配原生平台。

## 常见平台兼容性问题
- 不同平台 API 差异、权限申请、UI 适配等。
- 建议多端测试，关注官方 issue。

## 示例
```dart
// 调用原生方法示例
// 详见官方文档 platform channels
``` 