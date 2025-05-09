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
      link: /typescript/
    - theme: alt
      text: Go语言教程
      link: /golang/

features:
  - icon: 🛠️
    title: 全栈技术体系
    details: 深入剖析Vue、React、TypeScript、Next.js、Nest.js等主流技术栈，系统化学习前端开发的同时拓展Go后端技能
  - icon: ⚡
    title: 性能优化专题
    details: 网站性能优化策略、前端加载速度提升、React/Vue组件优化及实际项目性能调优案例分析
  - icon: 📚
    title: 架构设计模式
    details: 前端架构设计原则、组件设计模式、大型应用架构实践和最佳开发范式
  - icon: 🔍
    title: 源码解析
    details: 深入解读Vue、React等框架核心源码，理解底层实现原理，提升技术深度
  - icon: 🌐
    title: 工程化实践
    details: 现代前端工程化工具链、自动化构建部署、微前端架构和模块化设计
  - icon: 🐹
    title: Go语言开发
    details: 从入门到进阶的Go语言学习路径，包括基础语法、并发编程、Web服务开发和项目实战

footer: MIT Licensed | Copyright © 2024 前端小胖
---

<style>
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

.custom-section.courses .course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.custom-section.courses .course-card {
  display: block;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.custom-section.courses .course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.custom-section.courses .course-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.custom-section.courses .course-card h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  color: var(--vp-c-brand);
  text-align: center;
}

.custom-section.courses .course-card p {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  font-size: 0.9rem;
  text-align: center;
  margin: 0.5rem 0 0;
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
  
  .custom-section.courses .course-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 960px) {
  .custom-section .articles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<div class="custom-section">
  <div class="container">
    <div class="title">最新技术文章</div>
    <div class="articles">
      <div class="article">
        <h3>TypeScript 5.0新特性详解</h3>
        <p>探索TypeScript 5.0带来的重要变化，包括装饰器、const类型参数等新特性的使用案例。</p>
        <a href="/blog/typescript-5-features">阅读全文 →</a>
      </div>
      <div class="article">
        <h3>Go语言并发编程实践</h3>
        <p>深入理解Go协程与通道机制，掌握并发模式与最佳实践，打造高性能的Go应用。</p>
        <a href="/golang/concurrency">阅读全文 →</a>
      </div>
      <div class="article">
        <h3>React 18中的Suspense与并发特性</h3>
        <p>深入理解React 18带来的并发渲染模式，以及如何使用Suspense提升用户体验。</p>
        <a href="/blog/react-18-concurrent">阅读全文 →</a>
      </div>
    </div>
    <div class="view-all">
      <a href="/blog/">查看全部文章 →</a>
    </div>
  </div>
</div>

<div class="custom-section courses">
  <div class="container">
    <div class="title">技术专题</div>
    <div class="course-grid">
      <a href="/vue/" class="course-card">
        <div class="course-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 128 128">
            <path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z" />
            <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" />
          </svg>
        </div>
        <h3>Vue专题</h3>
        <p>从入门到精通Vue生态系统，包括组件化、状态管理、性能优化等核心知识</p>
      </a>
      <a href="/react/" class="course-card">
        <div class="course-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 128 128">
            <g fill="#61DAFB"><circle cx="64" cy="64" r="11.4"/><path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-1.6 5-3.6 10.3-6 15.6-2.4-5.3-4.5-10.5-6-15.6 1.6-5.1 3.7-10.3 6-15.6 2.4 5.2 4.5 10.4 6 15.6zm-29.2 32.6c-1.8.8-3.5 1.2-5.1 1.2-5.3 0-11.8-3.5-18.5-10 3.4-3.6 6.8-7.8 10.1-12.4 5.8-.5 11.3-1.5 16.5-3 1.4 5.9 1.9 11.3 1.5 15.9-.3 2.9-1.7 5.9-4.5 8.3z"/></g>
          </svg>
        </div>
        <h3>React专题</h3>
        <p>React核心概念与最佳实践，涵盖Hooks、并发模式、性能优化和大型应用架构</p>
      </a>
      <a href="/typescript/" class="course-card">
        <div class="course-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 128 128">
            <path fill="#007acc" d="M2,63.91v62.5H127V1.41H2Zm100.73-5a15.56,15.56,0,0,1,7.82,4.5,20.58,20.58,0,0,1,3,4c0,.16-5.4,3.81-8.69,5.85-.12.08-.6-.44-1.13-1.23a7.09,7.09,0,0,0-5.87-3.53c-3.79-.26-6.23,1.73-6.21,5a4.58,4.58,0,0,0,.54,2.34c.83,1.73,2.38,2.76,7.24,4.86,8.95,3.85,12.78,6.39,15.16,10,2.66,4,3.25,10.46,1.45,15.24-2,5.2-6.9,8.73-13.83,9.9a38.32,38.32,0,0,1-9.52-.1A23,23,0,0,1,80,109.19c-1.15-1.27-3.39-4.58-3.25-4.82a9.34,9.34,0,0,1,1.15-.73L82.5,101l3.59-2.08.75,1.11a16.78,16.78,0,0,0,4.74,4.54c4,2.1,9.46,1.81,12.16-.62a5.43,5.43,0,0,0,.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48,16.48,0,0,1-3.43-6.25,25,25,0,0,1-.22-8c1.33-6.23,6-10.58,12.82-11.87A31.66,31.66,0,0,1,102.73,58.93ZM73.39,64.15l0,5.12H57.16V115.5H45.65V69.26H29.38v-5a49.19,49.19,0,0,1,.14-5.16c.06-.08,10-.12,22-.1L73.33,59Z" />
          </svg>
        </div>
        <h3>TypeScript专题</h3>
        <p>从零掌握TypeScript，类型系统、高级类型、工程实践和与主流框架的结合</p>
      </a>
      <a href="/golang/" class="course-card">
        <div class="course-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 128 128">
            <g fill="#00acd7">
              <path d="M51.3,20.4c-0.4,0-0.5-0.2-0.3-0.5l2.1-2.7c0.2-0.3,0.7-0.5,1.1-0.5h35.7c0.4,0,0.5,0.3,0.3,0.6l-1.7,2.6 c-0.2,0.3-0.7,0.6-1,0.6L51.3,20.4z"/>
              <path d="M30.4,28.5c-0.4,0-0.5-0.2-0.3-0.5l2.1-2.7c0.2-0.3,0.7-0.5,1.1-0.5h45.6c0.4,0,0.6,0.3,0.5,0.6l-0.8,2.4 c-0.1,0.4-0.5,0.6-0.9,0.6L30.4,28.5z"/>
              <path d="M45.3,36.7c-0.4,0-0.5-0.3-0.3-0.6l1.4-2.5c0.2-0.3,0.6-0.6,1-0.6h20c0.4,0,0.6,0.3,0.6,0.7l-0.2,2.4 c0,0.4-0.4,0.7-0.7,0.7L45.3,36.7z"/>
              <path d="M101.5,55.3c-6.1,1.5-10.3,2.6-16.4,4.1c-1.5,0.4-1.6,0.5-2.9-1c-1.5-1.7-2.6-2.8-4.7-3.8c-6.3-3.1-12.4-2.2-18.1,1.5 c-6.8,4.4-10.3,10.9-10.2,19c0.1,8,5.6,14.6,13.5,15.7c6.8,0.9,12.5-1.5,17-6.6c0.9-1.1,1.7-2.3,2.7-3.7h-19.3 c-2.1,0-2.6-1.3-1.9-3c1.3-3.1,3.7-8.3,5.1-10.9c0.3-0.6,1-1.6,2.5-1.6h36.4c-0.2,2.7-0.2,5.4-0.6,8.1c-1.1,7.2-3.8,13.8-8.2,19.6c-7.2,9.5-16.6,15.4-28.5,17c-9.8,1.3-18.9-0.6-26.9-6.6c-7.7-5.8-12.3-13.4-13.4-23c-1.2-11,1.9-20.9,9.3-29.3c6.7-7.6,15.2-12,25.2-13.3c8.8-1.1,17,0.1,24.5,5c4.3,2.8,7.6,6.6,10,11.1C101.8,54.2,101.8,54.5,101.5,55.3z"/>
            </g>
          </svg>
        </div>
        <h3>Go语言专题</h3>
        <p>从基础语法到高级特性，掌握Go语言并发编程、标准库使用和Web服务开发</p>
      </a>
    </div>
  </div>
</div>

<div class="custom-section about">
  <div class="container">
    <div class="title">关于小胖</div>
    <div class="content">
      <p>「前端小胖」是一个专注于前端技术分享的个人博客，致力于提供高质量的开发教程、实战经验和技术解析。作为一名拥有3年以上大型项目经验的全栈工程师，我希望通过这个平台记录学习心得，分享技术积累，与大家一起在技术的道路上不断成长。</p>
      <p>如果您有任何问题或建议，欢迎与我联系！</p>
    </div>
  </div>
</div>
