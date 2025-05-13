---
title: HTML5中的微数据与结构化数据
date: 2024-04-28
description: 介绍HTML5微数据（Microdata）标准及其在SEO和结构化数据中的应用。
---

# HTML5中的微数据与结构化数据

HTML5 微数据（Microdata）用于在网页中嵌入结构化数据，提升搜索引擎理解能力，优化 SEO。

## 一、微数据基础

- 通过 `itemscope`、`itemtype`、`itemprop` 属性描述数据结构。
- 常与 schema.org 词汇表结合。

```html
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">HTML5微数据详解</h1>
  <span itemprop="author">小胖</span>
  <time itemprop="datePublished" datetime="2024-04-28">2024-04-28</time>
</article>
```

## 二、常见应用场景

1. **文章/产品/评论等结构化标注**。
2. **提升搜索引擎富文本展示（如星级、作者、时间等）**。

## 三、最佳实践

- 选用权威 schema.org 类型。
- 只标注对 SEO 有价值的内容。
- 保证数据与页面内容一致。

## 四、常见误区

- 滥用 itemprop，导致语义混乱。
- 标注与实际内容不符，影响搜索引擎信任。

## 五、JSDoc风格注释示例

```html
<!--
/**
 * @section Microdata
 * @description 文章结构化数据标注
 */
-->
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">HTML5微数据详解</h1>
  <span itemprop="author">小胖</span>
</article>
```

## 六、常用 schema.org 类型

| 类型   | itemtype 示例                     |
| ------ | --------------------------------- |
| 文章   | https://schema.org/Article        |
| 产品   | https://schema.org/Product        |
| 组织   | https://schema.org/Organization   |
| 事件   | https://schema.org/Event          |

## 七、多层嵌套微数据示例

```html
<div itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">小胖</span>
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="addressLocality">北京</span>
  </div>
</div>
```

## 八、与 JSON-LD、RDFa 的对比

- **Microdata**：嵌入HTML，适合结构清晰内容
- **JSON-LD**：推荐，独立于HTML，灵活易维护
- **RDFa**：语法复杂，适合语义网

## 九、SEO 效果验证

- 使用 [Google结构化数据测试工具](https://search.google.com/test/rich-results) 检查标注效果。

## 十、微数据与前端框架结合

- 在组件渲染时动态生成微数据属性，提升 SEO。

```vue
<template>
  <article itemscope itemtype="https://schema.org/Article">
    <h1 itemprop="headline">{{ title }}</h1>
    <span itemprop="author">{{ author }}</span>
  </article>
</template>
```

## 十一、微数据与 Open Graph/JSON-LD 协同

- 推荐同时使用 Open Graph、JSON-LD 和 Microdata，兼容更多平台。

```html
<meta property="og:title" content="HTML5微数据详解" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "HTML5微数据详解",
  "author": "小胖"
}
</script>
```

## 十二、微数据调试与常见错误

- 使用 Chrome 插件（如"Structured Data Testing Tool"）实时调试。
- 常见错误：itemprop 拼写错误、嵌套关系不正确、缺少必需字段。

---

合理使用微数据，有助于提升页面 SEO 和内容结构化水平。 