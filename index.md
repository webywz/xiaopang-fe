---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "前端小胖"
  text: "技术成长之路"
  tagline: 探索前端开发与Go语言的无限可能，分享实战经验与最佳实践
  image:
    src: /logo.png
    alt: 前端小胖
  actions:
    - theme: brand
      text: 开始学习
      link: /basic/JavaScript/
    - theme: alt
      text: Go语言教程
      link: /golang/

features:
  - icon: 🛠️
    title: 全栈技术体系
    details: 深入剖析Vue、React、TypeScript、Next.js、Nest.js等主流技术栈，系统化学习前端开发的同时拓展Go后端技能
  - icon: 🔍
    title: 源码解析
    details: 深入解读Vue、React等框架核心源码，理解底层实现原理，提升技术深度
  - icon: 🌐
    title: 工程化实践
    details: 现代前端工程化工具链、自动化构建部署、微前端架构和模块化设计

footer: MIT Licensed | Copyright © 2024 前端小胖
---


<style>
/**
 * @file index.md
 * @description 首页自定义样式优化，去除技术专题，增强移动端体验
 */
.hero-extra {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-2);
}
.social-links a {
  margin: 0 0.5rem;
  font-size: 1.3rem;
  text-decoration: none;
  transition: color 0.2s;
}
.social-links a:hover {
  color: var(--vp-c-brand);
}
.article .meta {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}
.custom-section {
  padding: 4rem 0;
  background-color: var(--vp-c-bg);
}
.custom-section .container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.custom-section .title {
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2.5rem;
  color: var(--vp-c-text-1);
}
.custom-section .articles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.custom-section .article {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  transition: transform 0.2s, box-shadow 0.2s;
}
.custom-section .article:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.custom-section .article h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: var(--vp-c-brand);
}
.custom-section .article p {
  margin: 0.8rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
.custom-section .article a {
  display: inline-block;
  margin-top: 1rem;
  color: var(--vp-c-brand);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.custom-section .article a:hover {
  color: var(--vp-c-brand-dark);
}
.custom-section .view-all {
  text-align: center;
  margin-top: 2rem;
}
.custom-section .view-all a {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  background-color: var(--vp-c-brand-dimm);
  color: var(--vp-c-brand);
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}
.custom-section .view-all a:hover {
  background-color: var(--vp-c-brand-dimm-dark);
}
.custom-section.about {
  background-color: var(--vp-c-bg-soft);
}
.custom-section.about .content {
  max-width: 800px;
  margin: 0 auto;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}
@media (max-width: 640px) {
  .custom-section .articles {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 641px) and (max-width: 960px) {
  .custom-section .articles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
