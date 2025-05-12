import { defineConfig } from 'vitepress'
import { setupMarkdownPlugins } from './markdown-plugins'
import { createShikiLoader } from './shiki-loader'
import { createReactHighlightFix } from './react-highlight-fix'
import { createHtmlTemplateFix } from './html-template-fix'
import { createHtmlSpecialTagsFix } from './html-special-tags-fix'

/**
 * 配置 VitePress 代码高亮主题，支持亮/暗模式自动切换
 * @see https://vitepress.dev/zh/reference/site-config#markdown-theme
 */

/**
 * Java 相关导航与侧边栏配置
 * @description 为 VitePress 文档新增 Java 相关的导航和侧边栏入口，并细化内容
 */

/**
 * SpringBoot 相关导航与侧边栏配置
 * @description 为 VitePress 文档新增 SpringBoot 相关的导航和侧边栏入口，并细化内容
 */

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "小胖",
  description: "前端小胖的技术之路",
  lang: 'zh-CN',
  lastUpdated: true,
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: '前端小胖' }],
    ['meta', { name: 'keywords', content: '前端, Vue, React, TypeScript, Next.js, Nest.js, 前端工程化, 性能优化' }],
    ['meta', { name: 'description', content: '前端小胖的技术之路，专注于前端开发、工程化、性能优化等内容。' }],
    // SEO 相关
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '小胖的前端技术之路' }],
    ['meta', { property: 'og:description', content: '前端小胖的技术之路，专注于前端开发、工程化、性能优化等内容。' }],
    ['meta', { property: 'og:site_name', content: '小胖' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:image', content: '/logo.png' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: '小胖的前端技术之路' }],
    ['meta', { name: 'twitter:description', content: '前端小胖的技术之路，专注于前端开发、工程化、性能优化等内容。' }],
    ['meta', { name: 'twitter:image', content: '/logo.png' }],
    // 结构化数据
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "小胖的前端技术之路",
      "url": "http://blog.66688.store/"
    })]
  ],
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { 
        text: '基础进阶', 
        items: [
          { text: 'JavaScript深入', link: '/basic/tags/javascript' },
          { text: 'CSS高级技巧', link: '/basic/tags/css/' },
          { text: 'HTML5新特性', link: '/basic/tags/html/' },
          { text: '浏览器原理', link: '/basic/tags/browser/' },
        ]
      },
      { 
        text: '前端框架', 
        items: [
          { text: 'Vue', link: '/vue/' },
          { text: 'React', link: '/react/' },
          { text: 'TypeScript', link: '/typescript/' },
        ]
      },
      { 
        text: '全栈开发', 
        items: [
          { text: 'nodeJs开发', link: '/basic/tags/nodejs/' },
          { text: 'Next.js', link: '/nextjs/' },
          { text: 'Nest.js', link: '/nestjs/' },
        ]
      },
      {
        text: 'Go语言',
        items: [
          { text: 'Go语言介绍', link: '/golang/' },
          { text: '基础语法', link: '/golang/basics' },
          { text: '数据结构', link: '/golang/data-structures' },
          { text: '并发编程', link: '/golang/concurrency' },
          { text: '标准库', link: '/golang/standard-library' },
          { text: '数据库与ORM', link: '/golang/database' },
          { text: '实战项目', link: '/golang/projects' },
        ]
      },
      { 
        text: 'Vue专题', 
        items: [
          { text: 'Vue源码分析', link: '/vue-source-code/' },
          { text: 'Vue实践指南', link: '/vue-practical/' },
        ]
      },
      {
        text: 'Java',
        items: [
          { text: '环境搭建', link: '/java/setup' },
          { text: '基础语法', link: '/java/basics' },
          { text: '包与模块', link: '/java/packages-modules' },
          { text: '面向对象', link: '/java/oop' },
          { text: '集合框架', link: '/java/collections' },
          { text: '异常处理', link: '/java/exception-handling' },
          { text: 'IO流', link: '/java/io' },
          { text: '并发编程', link: '/java/concurrency' },
          { text: 'JVM与性能调优', link: '/java/jvm-performance' },
          { text: '标准库', link: '/java/standard-library' },
          { text: '常用工具类', link: '/java/utils' },
          { text: '数据库与ORM', link: '/java/database' },
          { text: '测试与Mock', link: '/java/testing' },
          { text: '实战项目', link: '/java/projects' }
        ]
      },
      {
        text: 'Spring',
        items: [
          { text: '环境搭建', link: '/springboot/setup' },
          { text: '核心注解', link: '/springboot/annotations' },
          { text: '配置文件', link: '/springboot/configuration' },
          { text: 'Web开发', link: '/springboot/web' },
          { text: '数据访问', link: '/springboot/data-access' },
          { text: '安全与认证', link: '/springboot/security' },
          { text: '测试', link: '/springboot/testing' },
          { text: '部署', link: '/springboot/deployment' },
          { text: '实战项目', link: '/springboot/projects' },
          { text: 'Spring Cloud Alibaba', link: '/spring/spring-cloud-alibaba' },
          { text: 'Spring Boot Admin', link: '/spring/spring-boot-admin' },
          { text: 'Spring WebFlux', link: '/spring/spring-webflux' },
          { text: 'Spring AMQP', link: '/spring/spring-amqp' },
          { text: 'Spring Session', link: '/spring/spring-session' },
          { text: 'Spring Integration', link: '/spring/spring-integration' },
          { text: 'Spring Batch', link: '/spring/spring-batch' },
          { text: 'Spring MVC', link: '/spring/spring-mvc' },
          { text: 'Spring Cloud', link: '/spring/spring-cloud' },
          { text: 'Spring Security', link: '/spring/spring-security' },
          { text: 'Spring Data', link: '/spring/spring-data' },
          { text: 'Spring Framework', link: '/spring/spring-framework' }
        ]
      },
    ],

    sidebar: {
      '/blog/': [
        {
          text: '技术博客',
          items: [
            { text: '博客首页', link: '/blog/' },
            {
              text: 'React系列',
              collapsed: false,
              items: [
                { text: 'React 18中的Suspense与并发特性', link: '/blog/react-18-concurrent' },
              ]
            },
            {
              text: 'Vue系列',
              collapsed: false,
              items: [
                { text: 'Vue 3性能优化实战', link: '/blog/vue3-performance' },
              ]
            },
            {
              text: '状态管理系列',
              collapsed: false,
              items: [
                { text: '现代前端状态管理最佳实践', link: '/blog/modern-state-management' },
              ]
            },
            {
              text: 'TypeScript系列',
              collapsed: false,
              items: [
                { text: 'TypeScript 5.0新特性详解', link: '/blog/typescript-5-features' },
              ]
            },
            {
              text: '工程化系列',
              collapsed: false,
              items: [
                { text: '大型前端项目的Monorepo实践指南', link: '/blog/frontend-monorepo' },
              ]
            },
            {
              text: '实战项目系列',
              collapsed: false,
              items: [
                { text: '从零搭建React+TypeScript项目', link: '/blog/project-react-typescript' },
                { text: '基于Vue3的企业级中后台实战', link: '/blog/project-vue3-admin' },
                { text: 'Next.js全栈应用开发实践', link: '/blog/project-nextjs-fullstack' },
              ]
            },
            {
              text: '源码解析系列',
              collapsed: false,
              items: [
                { text: 'Vue 3响应式系统源码解析', link: '/blog/vue3-reactivity-source-code' },
                { text: 'React Fiber架构源码解析', link: '/blog/react-fiber-source-code' },
                { text: 'Vite插件系统源码解析', link: '/blog/vite-plugin-system-source-code' },
              ]
            }
          ]
        }
      ],
      '/vue/': [
        {
          text: 'Vue 教程',
          items: [
            { text: 'Vue 3基础', link: '/vue/' },
            { text: '组件化开发', link: '/vue/components' },
            { text: '状态管理', link: '/vue/state-management' },
            { text: '路由管理', link: '/vue/routing' },
            { text: '高级进阶', link: '/vue/advanced' },
            { text: '高级主题', link: '/vue/advanced-topics' },
            { text: '性能优化', link: '/vue/performance-optimization' },
            { text: '测试策略', link: '/vue/testing-strategies' },
            { text: '应用架构', link: '/vue/application-architecture' }
          ]
        }
      ],
      '/vue-source-code/': [
        {
          text: 'Vue源码分析',
          items: [
            { text: '源码分析概述', link: '/vue-source-code/' },
            { text: '响应式系统', link: '/vue-source-code/reactivity' },
            { text: '渲染机制', link: '/vue-source-code/render-mechanism' },
            { text: '组件化实现', link: '/vue-source-code/component-system' },
            { text: '编译优化', link: '/vue-source-code/compiler-optimization' }
          ]
        }
      ],
      '/vue-practical/': [
        {
          text: 'Vue实践指南',
          items: [
            { text: '实践指南概述', link: '/vue-practical/' },
            { text: '大型应用架构', link: '/vue-practical/large-scale-app' },
            { text: '组件设计模式', link: '/vue-practical/component-patterns' },
            { text: '状态管理实践', link: '/vue-practical/state-management' },
            { text: '路由最佳实践', link: '/vue-practical/routing-practices' },
            { text: '单元测试模式', link: '/vue-practical/unit-test-patterns' }
          ]
        }
      ],
      '/react/': [
        {
          text: 'React 教程',
          items: [
            { text: 'React 基础', link: '/react/' },
            { text: '组件与生命周期', link: '/react/components' },
            { text: 'Hooks 使用指南', link: '/react/hooks' },
            { text: '路由', link: '/react/router' },
            { text: '状态管理', link: '/react/state-management' },
            { text: '表单处理', link: '/react/form' },
            { text: '样式方案', link: '/react/style' },
            { text: '数据请求', link: '/react/data-fetching' },
            { text: '动画与 SEO', link: '/react/animation-seo' },
            { text: '测试工具', link: '/react/testing' },
            { text: '性能优化', link: '/react/performance-optimization' },
            { text: 'TypeScript与React', link: '/react/typescript' },
            { text: '服务端渲染', link: '/react/ssr' },
            { text: 'React设计模式', link: '/react/design-patterns' },
            { text: '最佳实践指南', link: '/react/best-practices' },
            { text: 'React生态系统', link: '/react/ecosystem' },
            { text: '实战项目', link: '/react/projects' },
            { text: 'React 18新特性', link: '/react/react18' }
          ]
        }
      ],
      '/nextjs/': [
        {
          text: 'Next.js 教程',
          items: [
            { text: 'Next.js 入门', link: '/nextjs/' },
            { text: '路由系统', link: '/nextjs/routing' },
            { text: 'App Router', link: '/nextjs/app-router' },
            { text: '服务器组件与客户端组件', link: '/nextjs/server-components' },
            { text: '数据获取', link: '/nextjs/data-fetching' },
            { text: 'API 路由开发', link: '/nextjs/api-routes' },
            { text: '中间件', link: '/nextjs/middleware' },
            { text: '国际化 (i18n)', link: '/nextjs/i18n' },
            { text: 'SEO 优化', link: '/nextjs/seo' },
            { text: '部署与优化', link: '/nextjs/deployment' },
            { text: '测试指南', link: '/nextjs/testing' },
            { text: '安全最佳实践', link: '/nextjs/security' },
            { text: '状态管理', link: '/nextjs/state-management' },
            { text: 'Next.js 14 新特性', link: '/nextjs/next14-features' }
          ]
        }
      ],
      '/nestjs/': [
        {
          text: 'Nest.js 教程',
          items: [
            { text: 'Nest.js 入门', link: '/nestjs/' },
            { text: '控制器', link: '/nestjs/controllers' },
            { text: '提供者', link: '/nestjs/providers' },
            { text: '模块', link: '/nestjs/modules' },
            { text: '中间件', link: '/nestjs/middleware' },
            { text: '管道', link: '/nestjs/pipes' },
            { text: '守卫', link: '/nestjs/guards' },
            { text: '拦截器', link: '/nestjs/interceptors' },
            { text: '异常过滤器', link: '/nestjs/exception-filters' },
            { text: '数据库集成', link: '/nestjs/database' },
            { text: '微服务', link: '/nestjs/microservices' },
            { text: 'GraphQL', link: '/nestjs/graphql' },
            { text: 'WebSocket', link: '/nestjs/websockets' },
            { text: '任务调度', link: '/nestjs/scheduled-tasks' },
            { text: '文件上传', link: '/nestjs/file-upload' },
            { text: '测试', link: '/nestjs/testing' },
            { text: '配置管理', link: '/nestjs/configuration' },
            { text: '缓存管理', link: '/nestjs/caching' },
            { text: '日志系统', link: '/nestjs/logging' },
            { text: '安全最佳实践', link: '/nestjs/security' }
          ]
        }
      ],
      '/typescript/': [
        {
          text: 'TypeScript 基础',
          items: [
            { text: 'TypeScript 入门', link: '/typescript/' },
            { text: '基本类型', link: '/typescript/basic-types' },
            { text: '接口', link: '/typescript/interfaces' },
            { text: '函数', link: '/typescript/functions' },
            { text: '类', link: '/typescript/classes' },
            { text: '泛型', link: '/typescript/generics' },
            { text: '高级类型', link: '/typescript/advanced-types' },
            { text: '命名空间与模块', link: '/typescript/namespaces-modules' }
          ]
        },
        {
          text: 'TypeScript 实战',
          items: [
            { text: '配置管理', link: '/typescript/configuration' },
            { text: '类型声明文件', link: '/typescript/declaration-files' },
            { text: '与JavaScript集成', link: '/typescript/javascript-integration' },
            { text: '工程实践', link: '/typescript/project-practices' },
            { text: 'React与TypeScript', link: '/typescript/react-typescript' },
            { text: 'Vue与TypeScript', link: '/typescript/vue-typescript' },
            { text: '装饰器', link: '/typescript/decorators' },
            { text: '工具类型', link: '/typescript/utility-types' },
            { text: '性能优化', link: '/typescript/performance' },
            { text: '测试策略', link: '/typescript/testing' }
          ]
        }
      ],
      '/golang/': [
        {
          text: 'Go语言基础',
          items: [
            { text: 'Go语言介绍', link: '/golang/' },
            { text: '环境搭建', link: '/golang/setup' },
            { text: '基础语法', link: '/golang/basics' },
            { text: '数据结构', link: '/golang/data-structures' },
            { text: '并发编程', link: '/golang/concurrency' },
            { text: '标准库', link: '/golang/standard-library' },
            { text: '数据库与ORM', link: '/golang/database' },
            { text: '实战项目', link: '/golang/projects' }
          ]
        }
      ],
      '/java/': [
        {
          text: 'Java 基础',
          items: [
            { text: '环境搭建', link: '/java/setup' },
            { text: '基础语法', link: '/java/basics' },
            { text: '包与模块', link: '/java/packages-modules' },
            { text: '面向对象', link: '/java/oop' },
            { text: '集合框架', link: '/java/collections' },
            { text: '异常处理', link: '/java/exception-handling' },
            { text: 'IO流', link: '/java/io' },
            { text: '并发编程', link: '/java/concurrency' },
            { text: 'JVM与性能调优', link: '/java/jvm-performance' },
            { text: '标准库', link: '/java/standard-library' },
            { text: '常用工具类', link: '/java/utils' },
            { text: '数据库与ORM', link: '/java/database' },
            { text: '测试与Mock', link: '/java/testing' },
            { text: '实战项目', link: '/java/projects' }
          ]
        }
      ],
      '/springboot/': [
        {
          text: 'SpringBoot 教程',
          items: [
            { text: 'SpringBoot简介', link: '/springboot/' },
            { text: '环境搭建', link: '/springboot/setup' },
            { text: '核心注解', link: '/springboot/annotations' },
            { text: '配置文件', link: '/springboot/configuration' },
            { text: 'Web开发', link: '/springboot/web' },
            { text: '数据访问', link: '/springboot/data-access' },
            { text: '安全与认证', link: '/springboot/security' },
            { text: '测试', link: '/springboot/testing' },
            { text: '部署', link: '/springboot/deployment' },
            { text: '实战项目', link: '/springboot/projects' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiaopang-fe' }
    ],
    
    footer: {
      message: '使用 VitePress 构建',
      copyright: 'Copyright © 2024 前端小胖'
    },
    
    outline: {
      level: 'deep',
      label: '页面导航'
    },
    
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    lastUpdatedText: '最后更新',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
  },
  
  // 添加重定向配置
  rewrites: {
    // 旧路径重定向到新路径
    '/old-blog-path/:article': '/blog/:article',
    '/vue-guide/:page': '/vue/:page',
    '/react-guide/:page': '/react/:page',
    
    // 常见拼写错误的处理
    '/blogs/:article': '/blog/:article',
    '/reactjs/:page': '/react/:page',
    '/vuejs/:page': '/vue/:page',
    '/typescrip/:page': '/typescript/:page'
  },
  
  // 添加特殊处理规则，把有问题的文件视为纯文本，不做Vue解析
  ignoreDeadLinks: true,
  
  // 修改 markdown 配置部分，使用简单配置避免错误
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    config: (md) => {
      setupMarkdownPlugins(md);
    }
  },
  
  // 添加一个新的插件直接解决问题文件
  vite: {
    plugins: [
      // 添加通用的HTML特殊标签修复插件，最高优先级
      createHtmlSpecialTagsFix(),
      // 添加 HTML 模板修复插件，高优先级处理模板标签
      createHtmlTemplateFix(),
      // 添加 Shiki 加载器插件，确保稳定性
      createShikiLoader(),
      // 添加 React 代码高亮修复插件
      createReactHighlightFix(),
      // 添加处理 Shiki 错误的插件
      {
        name: 'fix-shiki-errors',
        enforce: 'pre',
        configureServer(server) {
          // 在服务器错误时提供更友好的错误处理
          return () => {
            server.middlewares.use((err, req, res, next) => {
              if (err && err.message && err.message.includes('Shiki instance has been disposed')) {
                console.log('捕获到 Shiki 错误，尝试恢复...');
                // 尝试恢复或提供友好错误信息
                if (next) next();
              } else if (next) {
                next(err);
              }
            });
          };
        }
      },
      // 在原有插件之前添加一个专门处理问题文件的插件
      {
        name: 'fix-jsdoc-syntax',
        enforce: 'pre',
        transform(code, id) {
          // 只处理特定的问题文件
          if (id.includes('nodejs-module-system.md')) {
            return code.replace(/@returns\s+\{Promise<([^>]+)>\}/g, '@returns {Promise< $1 >}');
          }
          return null;
        }
      },
      {
        // 自定义插件，处理特定文件
        name: 'fix-typescript-syntax',
        enforce: 'pre',
        transform(code, id) {
          // 处理任何包含TypeScript代码的Markdown文件
          if (id.endsWith('.md') && (
            id.includes('/typescript') || 
            id.includes('/react') || 
            code.includes('```ts') || 
            code.includes('```tsx')
          )) {
            // 预处理代码，避免Vue解析器对TypeScript泛型的错误解析
            // 在 <T> 这样的泛型语法中添加空格，避免被识别为HTML标签
            return code
              // 处理function List<T>这样的泛型函数定义
              .replace(/function\s+(\w+)<(\w+)>/g, 'function $1< $2 >')
              // 处理const App = <T,>这样的泛型组件定义
              .replace(/(\w+)\s*=\s*<(\w+)([,>])/g, '$1 = < $2$3')
              // 处理type Name<T>这样的泛型类型定义
              .replace(/type\s+(\w+)<(\w+)>/g, 'type $1< $2 >')
              // 处理interface Name<T>这样的泛型接口定义
              .replace(/interface\s+(\w+)<(\w+)>/g, 'interface $1< $2 >')
              // 处理function name<T extends>这样的泛型约束
              .replace(/<(\w+)\s+extends/g, '< $1 extends')
              // 处理<T>()这样的泛型函数调用
              .replace(/<(\w+)>\(/g, '< $1 >(')
              // 处理React.FC<Props>这样的React类型
              .replace(/(\w+)<(\w+)>/g, '$1< $2 >');
          }
          
          // 处理JSDoc中可能被误识别为HTML标签的情况
          if (id.endsWith('.md') && (
            code.includes('@param {') || 
            code.includes('@returns {') || 
            code.includes('@throws {')
          )) {
            return code
              // 在JSDoc类型标签中添加额外空格避免被识别为HTML标签
              .replace(/@(\w+)\s+\{([^}]+)\}/g, '@$1 { $2 }')
              // 处理Promise<Type>的情况
              .replace(/Promise<([^>]+)>/g, 'Promise< $1 >');
          }
          
          return null;
        }
      },
    ]
  }
})