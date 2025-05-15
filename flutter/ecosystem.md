---
title: 生态与插件
---

/**
 * Flutter生态与插件
 * @description 介绍Flutter主流生态与常用插件。
 */

# 生态与插件

## 插件市场与查找
- 官方插件市场：[pub.dev](https://pub.dev/)
- 可通过关键词、评分、下载量筛选插件。

## 插件安装与管理
- 在 pubspec.yaml 添加依赖，执行 `flutter pub get`。
```yaml
dependencies:
  http: ^1.0.0
  provider: ^6.0.0
```

## 常用插件分类推荐
### 网络
- http、dio
### 状态管理
- provider、riverpod、bloc、getx
### 本地存储
- shared_preferences、hive、sqflite
### 图片与多媒体
- cached_network_image、image_picker、video_player
### 地图与定位
- amap_flutter_map、location
### 推送与消息
- firebase_messaging、flutter_local_notifications
### 支付与第三方集成
- alipay_kit、wechat_kit

## 插件开发与贡献
- 可自定义插件，扩展原生能力。
- 发布到 pub.dev，需完善文档与示例。

## 插件兼容性与升级
- 关注插件的 Flutter 版本兼容性。
- 定期升级依赖，避免安全隐患。

## 插件使用实战
- 结合官方文档和 pub.dev 示例，快速集成常用功能。 