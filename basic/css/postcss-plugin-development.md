---
layout: doc
title: PostCSS插件开发指南
description: 深入解析PostCSS插件开发的原理、API与实战技巧，助你定制高效的CSS处理流程。
---

# PostCSS插件开发指南

PostCSS是现代前端工程中强大的CSS处理工具。本文将系统讲解PostCSS插件开发的原理、API与实战技巧，助你定制高效的CSS工作流。

## 目录

- [PostCSS简介与原理](#postcss简介与原理)
- [插件开发基础](#插件开发基础)
- [AST遍历与节点操作](#ast遍历与节点操作)
- [实用插件案例](#实用插件案例)
- [发布与调试](#发布与调试)

## PostCSS简介与原理

- PostCSS基于AST（抽象语法树）处理CSS
- 插件可对CSS进行分析、转换、优化

## 插件开发基础

- 插件本质是一个函数，接收Root、result等参数
- 可通过`postcss.plugin`或直接导出函数

```js
// 简单的PostCSS插件
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'my-plugin',
    Once(root, { result }) {
      // 处理CSS AST
    }
  };
};
module.exports.postcss = true;
```

## AST遍历与节点操作

- Root、Rule、Decl、AtRule等节点类型
- 遍历、查找、修改、插入节点

```js
/**
 * 遍历所有规则并添加前缀
 * @param {Root} root CSS AST根节点
 */
function addPrefix(root) {
  root.walkRules(rule => {
    rule.selector = `.my-prefix ${rule.selector}`;
  });
}
```

## 实用插件案例

### 自动添加自定义属性前缀

```js
module.exports = () => ({
  postcssPlugin: 'prefix-vars',
  Declaration(decl) {
    if (decl.prop.startsWith('--')) {
      decl.prop = `--my-${decl.prop.slice(2)}`;
    }
  }
});
module.exports.postcss = true;
```

## 发布与调试

- 使用npm发布插件，添加`keywords: ['postcss', 'plugin']`
- 利用PostCSS官方测试工具进行单元测试
- 在本地项目中通过`postcss.config.js`集成调试

---

> 参考资料：[PostCSS插件开发文档](https://postcss.org/api/) 