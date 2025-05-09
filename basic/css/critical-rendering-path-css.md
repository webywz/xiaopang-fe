---
layout: doc
title: 关键渲染路径与CSS优化
description: 深入解析浏览器关键渲染路径、CSS对渲染性能的影响及优化策略，助你提升页面首屏速度。
---

# 关键渲染路径与CSS优化

关键渲染路径（Critical Rendering Path, CRP）决定了页面首屏渲染速度。本文将系统讲解CRP的流程、CSS对渲染的影响及优化策略。

## 目录

- [关键渲染路径简介](#关键渲染路径简介)
- [CSS在渲染路径中的作用](#css在渲染路径中的作用)
- [阻塞渲染与非阻塞加载](#阻塞渲染与非阻塞加载)
- [优化关键CSS的策略](#优化关键css的策略)
- [实战案例与工具](#实战案例与工具)

## 关键渲染路径简介

关键渲染路径包括HTML解析、CSSOM生成、DOM生成、合成渲染树、布局与绘制。

```js
/**
 * 关键渲染路径主要阶段
 * @returns {string[]}
 */
function getCRPStages() {
  return ['HTML解析', 'CSSOM生成', 'DOM生成', '渲染树合成', '布局', '绘制'];
}
```

## CSS在渲染路径中的作用

- CSS会阻塞DOM渲染，直到所有样式表下载并解析完成
- 外链CSS、@import均会延迟首屏渲染

## 阻塞渲染与非阻塞加载

- `<link rel="stylesheet">`为阻塞渲染资源
- 可通过`media`属性、异步加载等方式优化

```html
<!-- 非关键CSS异步加载 -->
<link rel="stylesheet" href="print.css" media="print" onload="this.media='all'">
```

## 优化关键CSS的策略

- 提取首屏关键CSS，内联到HTML中
- 非关键CSS异步或延迟加载
- 合理拆分样式表，减少体积

```html
<!-- 关键CSS内联 -->
<style>
  .header { min-height: 60px; }
</style>
```

## 实战案例与工具

- 使用Lighthouse、Chrome DevTools分析渲染路径
- 利用Critical、PurgeCSS等工具自动提取关键CSS

---

> 参考资料：[MDN 关键渲染路径](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Critical_rendering_path) 