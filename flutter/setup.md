---
title: 环境搭建
---

/**
 * Flutter环境搭建
 * @description 介绍Flutter开发环境的安装与配置流程，涵盖多平台。
 */

# 环境搭建

## Flutter SDK下载与安装
- 访问 [Flutter官网](https://flutter.dev/) 下载对应平台的SDK。
- 解压并配置环境变量（如 `PATH`）。

## 配置环境变量
- 将 `flutter/bin` 路径加入系统 PATH。
- 终端输入 `flutter --version` 验证。

## 常用IDE与插件
- 推荐 VS Code、Android Studio、IntelliJ IDEA。
- 安装 Flutter 和 Dart 插件。

## Android开发环境配置
- 安装 Android Studio。
- 配置 Android SDK、AVD 模拟器。
- 设置 ANDROID_HOME 环境变量。

## iOS开发环境配置
- 仅限 macOS，需安装 Xcode。
- 配置 Xcode 命令行工具。
- 通过 Xcode 管理模拟器。

## Web/桌面开发环境配置
- Web：需 Chrome 浏览器。
- 桌面：需开启桌面支持（`flutter config --enable-windows-desktop` 等）。

## flutter doctor常见问题与解决
- 运行 `flutter doctor` 检查依赖。
- 根据提示安装缺失依赖。
- 常见问题如 Android license、Xcode 版本等。

## 第一个Flutter项目创建
```bash
flutter create my_app
cd my_app
flutter run
```
- 选择设备运行，体验热重载。 