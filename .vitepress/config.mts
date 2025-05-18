import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
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

/**
 * 基础进阶侧边栏配置
 * @type {import('vitepress').DefaultTheme.Sidebar}
 */

/**
 * Solidity 开发侧边栏配置
 * @type {import('vitepress').DefaultTheme.Sidebar}
 */

/**
 * Python 相关导航与侧边栏配置
 * @description 为 VitePress 文档新增 Python 相关的导航和侧边栏入口，并细化内容
 */

/**
 * SQL 相关导航配置
 * @description 为 VitePress 文档新增 SQL 相关的导航入口
 */

/**
 * AI Agent 相关导航配置
 * @description 为 VitePress 文档新增 AI Agent 相关的导航入口
 */

/**
 * Flutter 相关导航与侧边栏配置
 * @description 为 VitePress 文档新增 Flutter 相关的导航和侧边栏入口，涵盖基础、进阶、生态、实战、工具等内容
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
        text: '前端开发', 
        items: [
          { 
            text: '基础进阶', 
            items: [
              { text: 'JavaScript深入', link: '/basic/JavaScript/' },
              { text: 'CSS高级技巧', link: '/basic/css/' },
              { text: 'HTML5新特性', link: '/basic/HTML/' },
              { text: '浏览器原理', link: '/basic/browser/' },
            ]
          },
          { 
            text: '前端框架', 
            items: [
              { text: 'Vue', link: '/vue/' },
              { text: 'React', link: '/react/' },
              { text: 'TypeScript', link: '/typescript/' },
              { text: 'uniapp', link: '/uniapp/uniapp-pitfalls/' },
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
            text: '全栈开发', 
            items: [
              { text: 'nodeJs开发', link: '/basic/nodeJS/' },
              { text: 'Next.js', link: '/nextjs/' },
              { text: 'Nest.js', link: '/nestjs/' },
            ]
          }
        ]
      },
      {
        text: '后端开发',
        items: [
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
              { text: '环境搭建', link: '/spring/springboot/setup' },
              { text: '核心注解', link: '/spring/springboot/annotations' },
              { text: '配置文件', link: '/spring/springboot/configuration' },
              { text: 'Web开发', link: '/spring/springboot/web' },
              { text: '数据访问', link: '/spring/springboot/data-access' },
              { text: '安全与认证', link: '/spring/springboot/security' },
              { text: '测试', link: '/spring/springboot/testing' },
              { text: '部署', link: '/spring/springboot/deployment' },
              { text: '实战项目', link: '/spring/springboot/projects' },
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
            text: 'Python',
            items: [
              { text: 'Python简介', link: '/python/python/' },
              { text: '环境搭建', link: '/python/setup' },
              { text: '基础语法', link: '/python/basics' },
              { text: '数据结构', link: '/python/data-structures' },
              { text: '面向对象', link: '/python/oop' },
              { text: '标准库', link: '/python/standard-library' },
              { text: '第三方库', link: '/python/third-party' },
              { text: 'Web开发', link: '/python/web' },
              { text: '数据分析', link: '/python/data-analysis' },
              { text: '机器学习', link: '/python/machine-learning' },
              { text: '可视化', link: '/python/visualization' },
              { text: '自动化脚本', link: '/python/automation' },
              { text: '爬虫开发', link: '/python/spider' },
              { text: '实战项目', link: '/python/projects' }
            ]
          }
        ]
      },
      {
        text: '数据库',
        items: [
          {
            text: 'SQL',
            items: [
              { text: 'SQL 标准与历史', link: '/sql/standard' },
              { text: 'SQL 设计模式', link: '/sql/patterns' },
              { text: 'SQL 工具与生态', link: '/sql/tools' },
              {
                text: 'MySQL',
                items: [
                  { text: '基础语法', link: '/sql/mysql/basics' },
                  { text: '数据类型', link: '/sql/mysql/types' },
                  { text: '查询与操作', link: '/sql/mysql/query' },
                  { text: '事务与锁', link: '/sql/mysql/transaction' },
                  { text: '视图与索引', link: '/sql/mysql/view-index' },
                  { text: '存储过程与函数', link: '/sql/mysql/procedure' },
                  { text: '性能优化', link: '/sql/mysql/performance' },
                  { text: '安全与权限', link: '/sql/mysql/security' },
                  { text: '备份与恢复', link: '/sql/mysql/backup' },
                  { text: '实战案例', link: '/sql/projects/mysql' },
                  { text: '工具链', link: '/sql/mysql/tools' }
                ]
              },
              {
                text: 'PostgreSQL',
                items: [
                  { text: '基础语法', link: '/sql/postgresql/basics' },
                  { text: '数据类型', link: '/sql/postgresql/types' },
                  { text: '查询与操作', link: '/sql/postgresql/query' },
                  { text: '事务与锁', link: '/sql/postgresql/transaction' },
                  { text: '视图与索引', link: '/sql/postgresql/view-index' },
                  { text: '存储过程与函数', link: '/sql/postgresql/procedure' },
                  { text: '性能优化', link: '/sql/postgresql/performance' },
                  { text: '安全与权限', link: '/sql/postgresql/security' },
                  { text: '备份与恢复', link: '/sql/postgresql/backup' },
                  { text: '实战案例', link: '/sql/projects/postgresql' },
                  { text: '工具链', link: '/sql/postgresql/tools' }
                ]
              },
              {
                text: 'SQLite',
                items: [
                  { text: '基础语法', link: '/sql/sqlite/basics' },
                  { text: '数据类型', link: '/sql/sqlite/types' },
                  { text: '查询与操作', link: '/sql/sqlite/query' },
                  { text: '事务与锁', link: '/sql/sqlite/transaction' },
                  { text: '视图与索引', link: '/sql/sqlite/view-index' },
                  { text: '存储过程与函数', link: '/sql/sqlite/procedure' },
                  { text: '性能优化', link: '/sql/sqlite/performance' },
                  { text: '安全与权限', link: '/sql/sqlite/security' },
                  { text: '备份与恢复', link: '/sql/sqlite/backup' },
                  { text: '实战案例', link: '/sql/projects/sqlite' },
                  { text: '工具链', link: '/sql/sqlite/tools' }
                ]
              },
              {
                text: 'Oracle',
                items: [
                  { text: '基础语法', link: '/sql/oracle/basics' },
                  { text: '数据类型', link: '/sql/oracle/types' },
                  { text: '查询与操作', link: '/sql/oracle/query' },
                  { text: '事务与锁', link: '/sql/oracle/transaction' },
                  { text: '视图与索引', link: '/sql/oracle/view-index' },
                  { text: '存储过程与函数', link: '/sql/oracle/procedure' },
                  { text: '性能优化', link: '/sql/oracle/performance' },
                  { text: '安全与权限', link: '/sql/oracle/security' },
                  { text: '备份与恢复', link: '/sql/oracle/backup' },
                  { text: '实战案例', link: '/sql/projects/oracle' },
                  { text: '工具链', link: '/sql/oracle/tools' }
                ]
              },
              {
                text: 'SQL Server',
                items: [
                  { text: '基础语法', link: '/sql/sqlserver/basics' },
                  { text: '数据类型', link: '/sql/sqlserver/types' },
                  { text: '查询与操作', link: '/sql/sqlserver/query' },
                  { text: '事务与锁', link: '/sql/sqlserver/transaction' },
                  { text: '视图与索引', link: '/sql/sqlserver/view-index' },
                  { text: '存储过程与函数', link: '/sql/sqlserver/procedure' },
                  { text: '性能优化', link: '/sql/sqlserver/performance' },
                  { text: '安全与权限', link: '/sql/sqlserver/security' },
                  { text: '备份与恢复', link: '/sql/sqlserver/backup' },
                  { text: '实战案例', link: '/sql/projects/sqlserver' },
                  { text: '工具链', link: '/sql/sqlserver/tools' }
                ]
              },
              {
                text: 'Redis',
                items: [
                  { text: 'Redis 简介', link: '/sql/redis/' },
                  { text: '数据结构', link: '/sql/redis/data-structure' },
                  { text: '高级特性', link: '/sql/redis/advanced' },
                  { text: '实践指南', link: '/sql/redis/practice' },
                  { text: '代码示例', link: '/sql/redis/code' },
                  { text: '安全配置', link: '/sql/redis/security' },
                  { text: '常见问题', link: '/sql/redis/faq' },
                  { text: '实战案例', link: '/sql/redis/cases' }
                ]
              }
            ]
          }
        ]
      },
      {
        text: '移动开发',
        items: [
          {
            text: 'Flutter',
            items: [
              { text: 'Flutter简介', link: '/flutter/' },
              { text: '环境搭建', link: '/flutter/setup' },
              { text: '开发工具链', link: '/flutter/tooling' },
              { text: '基础语法', link: '/flutter/basics' },
              { text: '核心组件', link: '/flutter/widgets' },
              { text: '布局与样式', link: '/flutter/layout' },
              { text: '路由与导航', link: '/flutter/routing' },
              { text: '状态管理', link: '/flutter/state-management' },
              { text: '网络与数据', link: '/flutter/network' },
              { text: '本地存储', link: '/flutter/storage' },
              { text: '动画与交互', link: '/flutter/animation' },
              { text: '平台集成', link: '/flutter/platform' },
              { text: '测试与调试', link: '/flutter/testing' },
              { text: '性能优化', link: '/flutter/performance' },
              { text: '生态与插件', link: '/flutter/ecosystem' },
              { text: '实战项目', link: '/flutter/projects' }
            ]
          }
        ]
      },
      {
        text: '区块链',
        items: [
          {
            text: 'Web3',
            items: [
              { text: 'Web3简介', link: '/web3/' },
              { text: '以太坊基础', link: '/web3/ethereum' },
              { text: '智能合约', link: '/web3/smart-contract' },
              { text: '钱包与签名', link: '/web3/wallet' },
              { text: 'DApp开发', link: '/web3/dapp' },
              { text: '常见工具', link: '/web3/tools' },
              { text: 'Web3.js', link: '/web3/web3js' }
            ]
          },
          {
            text: 'Solidity开发',
            items: [
              { text: '基础语法', link: '/solidity/basics' },
              { text: '合约开发', link: '/solidity/contract-development' },
              { text: '常用工具链', link: '/solidity/tooling' },
              { text: '测试与调试', link: '/solidity/testing' },
              { text: '安全与漏洞', link: '/solidity/security' },
              { text: '性能与优化', link: '/solidity/optimization' },
              { text: '主流开发框架', link: '/solidity/frameworks' },
              { text: '实战项目', link: '/solidity/projects' }
            ]
          }
        ]
      },
      {
        text: 'AI开发',
        items: [
          {
            text: 'AI Agent',
            items: [
              { text: 'AI Agent 简介', link: '/ai-agent/' },
              { text: '核心原理', link: '/ai-agent/principle' },
              { text: '常用术语', link: '/ai-agent/terms' },
              {
                text: '主流框架',
                items: [
                  { text: 'LangChain', link: '/ai-agent/frameworks/langchain' },
                  { text: 'AutoGen', link: '/ai-agent/frameworks/autogen' },
                  { text: 'CrewAI', link: '/ai-agent/frameworks/crewai' },
                  { text: 'MetaGPT', link: '/ai-agent/frameworks/metagpt' },
                  { text: 'Haystack', link: '/ai-agent/frameworks/haystack' },
                  { text: 'Flowise', link: '/ai-agent/frameworks/flowise' },
                  { text: 'AgentVerse', link: '/ai-agent/frameworks/agentverse' },
                  { text: '其他框架', link: '/ai-agent/frameworks/others' }
                ]
              },
              {
                text: '能力与组件',
                items: [
                  { text: '感知与解析', link: '/ai-agent/abilities/perception' },
                  { text: '规划与决策', link: '/ai-agent/abilities/planning' },
                  { text: '行动与执行', link: '/ai-agent/abilities/action' },
                  { text: '自主学习', link: '/ai-agent/abilities/learning' },
                  { text: '多智能体协作', link: '/ai-agent/abilities/multi-agent' },
                  { text: '工具集成', link: '/ai-agent/abilities/tools' },
                  { text: '记忆与知识库', link: '/ai-agent/abilities/memory' },
                  { text: '环境交互', link: '/ai-agent/abilities/environment' }
                ]
              },
              {
                text: 'AgentOps',
                items: [
                  { text: 'AgentOps 概述', link: '/ai-agent/agentops' },
                  { text: '监控与评估', link: '/ai-agent/agentops/monitor' },
                  { text: '持续优化', link: '/ai-agent/agentops/optimize' },
                  { text: '安全与合规', link: '/ai-agent/agentops/security' },
                  { text: '部署与运维', link: '/ai-agent/agentops/deploy' }
                ]
              },
              {
                text: 'Prompt 工程',
                items: [
                  { text: 'Prompt 设计', link: '/ai-agent/prompt' },
                  { text: '提示词模式', link: '/ai-agent/prompt/patterns' },
                  { text: '实战案例', link: '/ai-agent/prompt/cases' },
                  { text: '多轮对话', link: '/ai-agent/prompt/multi-turn' },
                  { text: '上下文管理', link: '/ai-agent/prompt/context' }
                ]
              },
              {
                text: '应用案例',
                items: [
                  { text: '智能问答', link: '/ai-agent/cases/qa' },
                  { text: '自动化办公', link: '/ai-agent/cases/office' },
                  { text: '多智能体协作', link: '/ai-agent/cases/multi-agent' },
                  { text: '自动编程', link: '/ai-agent/cases/code' },
                  { text: '自动化科研', link: '/ai-agent/cases/research' },
                  { text: '智能搜索与推荐', link: '/ai-agent/cases/search' },
                  { text: 'RPA 流程机器人', link: '/ai-agent/cases/rpa' },
                  { text: '其他应用', link: '/ai-agent/cases/others' }
                ]
              }
            ]
          }
        ]
      }
    ] as DefaultTheme.NavItem[],

    sidebar: {
      /**
       * 基础进阶侧边栏配置
       * @type {import('vitepress').DefaultTheme.Sidebar}
       */
      '/basic/JavaScript/': [
        {
          text: 'JavaScript深入系列文章',
          collapsed: false,
          items: [
            {
              text: '精选文章',
              collapsed: false,
              items: [
                { text: 'JavaScript异步编程全解析', link: '/basic/JavaScript/' },
                { text: 'JavaScript设计模式实战指南', link: '/basic/JavaScript/javascript-design-patterns' },
                { text: '深入理解JavaScript原型链', link: '/basic/JavaScript/javascript-prototype-chain' },
                { text: 'JavaScript内存管理与垃圾回收机制', link: '/basic/JavaScript/javascript-memory-management' },
                { text: 'JavaScript函数式编程指南', link: '/basic/JavaScript/javascript-functional-programming' }
              ]
            },
            {
              text: '核心概念',
              collapsed: false,
              items: [
                { text: 'JavaScript执行上下文与作用域详解', link: '/basic/JavaScript/javascript-execution-context' },
                { text: '深入理解JavaScript闭包', link: '/basic/JavaScript/javascript-closures' },
                { text: 'JavaScript中的this指向完全指南', link: '/basic/JavaScript/javascript-this-keyword' },
                { text: 'JavaScript模块化开发历史与实践', link: '/basic/JavaScript/javascript-modules' }
              ]
            },
            {
              text: '高级特性',
              collapsed: false,
              items: [
                { text: 'ES2022/ES2023新特性解析', link: '/basic/JavaScript/javascript-es2023-features' },
                { text: 'JavaScript中的元编程技术', link: '/basic/JavaScript/javascript-metaprogramming' },
                { text: 'JavaScript装饰器实战指南', link: '/basic/JavaScript/javascript-decorators' },
                { text: 'JavaScript迭代器与生成器深度解析', link: '/basic/JavaScript/javascript-iterators-generators' }
              ]
            },
            {
              text: '性能优化',
              collapsed: false,
              items: [
                { text: 'JavaScript高性能编程实践', link: '/basic/JavaScript/javascript-performance-best-practices' },
                { text: 'JavaScript内存泄漏排查与优化', link: '/basic/JavaScript/javascript-memory-leaks' },
                { text: '大型JavaScript应用性能优化策略', link: '/basic/JavaScript/large-scale-javascript-optimization' }
              ]
            },
            {
              text: '进阶主题',
              collapsed: false,
              items: [
                { text: '深入WebAssembly：与JavaScript协同工作', link: '/basic/JavaScript/webassembly-javascript-integration' },
                { text: 'JavaScript并发模型与事件循环详解', link: '/basic/JavaScript/javascript-concurrency-event-loop' },
                { text: 'JavaScript安全编程最佳实践', link: '/basic/JavaScript/javascript-security-best-practices' },
                { text: '构建高性能Web Worker应用', link: '/basic/JavaScript/javascript-web-workers' }
              ]
            }
          ]
        }
      ],
      '/basic/browser/': [
        {
          text: '浏览器原理系列文章',
          collapsed: false,
          items: [
            {
              text: '精选文章',
              collapsed: false,
              items: [
                { text: '浏览器渲染流水线深度解析', link: '/basic/browser/' },
                { text: '深入理解浏览器的事件循环', link: '/basic/browser/browser-event-loop' },
                { text: '浏览器存储机制全解析', link: '/basic/browser/browser-storage-mechanisms' },
                { text: '浏览器网络通信原理', link: '/basic/browser/browser-network-communication' }
              ]
            },
            {
              text: '渲染原理',
              collapsed: false,
              items: [
                { text: 'Chromium渲染架构详解', link: '/basic/browser/chromium-rendering-architecture' },
                { text: '关键渲染路径与性能优化', link: '/basic/browser/critical-rendering-path' },
                { text: '浏览器布局与绘制过程深度解析', link: '/basic/browser/browser-layout-painting' },
                { text: '浏览器中的图层与合成机制', link: '/basic/browser/browser-layers-compositing' },
                { text: '浏览器动画性能优化原理', link: '/basic/browser/browser-animation-performance' }
              ]
            },
            {
              text: 'JavaScript引擎',
              collapsed: false,
              items: [
                { text: 'V8引擎工作原理与优化策略', link: '/basic/browser/v8-engine-internals' },
                { text: 'JavaScript JIT编译原理', link: '/basic/javascript/javascript-jit-compilation' },
                { text: '浏览器中的内存管理与垃圾回收', link: '/basic/browser/browser-memory-management' },
                { text: 'JavaScript引擎如何优化执行速度', link: '/basic/javascript/javascript-engine-optimization' }
              ]
            },
            {
              text: '网络通信',
              collapsed: false,
              items: [
                { text: '浏览器资源加载优先级解析', link: '/basic/browser/browser-resource-priorities' },
                { text: 'HTTP/2与HTTP/3在浏览器中的实现', link: '/basic/browser/http2-http3-browser-implementation' },
                { text: '浏览器缓存机制详解', link: '/basic/browser/browser-caching-mechanisms' },
                { text: 'WebSocket与Server-Sent Events原理', link: '/basic/browser/websocket-sse-principles' },
                { text: '跨域资源共享(CORS)完全指南', link: '/basic/browser/cors-complete-guide' }
              ]
            },
            {
              text: '安全机制',
              collapsed: false,
              items: [
                { text: '浏览器同源策略详解', link: '/basic/browser/same-origin-policy' },
                { text: '内容安全策略(CSP)实践指南', link: '/basic/browser/content-security-policy' },
                { text: '浏览器沙箱机制与安全架构', link: '/basic/browser/browser-sandbox-security' },
                { text: 'Web加密API与安全通信', link: '/basic/browser/web-cryptography-api' },
                { text: 'XSS与CSRF防御最佳实践', link: '/basic/browser/xss-csrf-prevention' }
              ]
            }
          ]
        }
      ],
      '/basic/HTML/': [
        {
          text: 'HTML5新特性系列文章',
          collapsed: false,
          items: [
            {
              text: '精选文章',
              collapsed: false,
              items: [
                { text: 'HTML5 Web组件开发实战', link: '/basic/HTML/' },
                { text: 'HTML5语义化标签最佳实践', link: '/basic/HTML/html5-semantic-elements' },
                { text: 'HTML5表单新特性与验证技术', link: '/basic/HTML/html5-forms-validation' },
                { text: 'HTML5存储技术全解析', link: '/basic/HTML/html5-storage-technologies' },
                { text: 'HTML5多媒体处理技术', link: '/basic/HTML/html5-multimedia' }
              ]
            },
            {
              text: '基础特性',
              collapsed: false,
              items: [
                { text: 'HTML5文档结构与最佳实践', link: '/basic/HTML/html5-document-structure' },
                { text: 'HTML5数据属性的高级应用', link: '/basic/HTML/html5-data-attributes' },
                { text: 'HTML5中的微数据与结构化数据', link: '/basic/HTML/html5-microdata' },
                { text: 'HTML5表单控件深度解析', link: '/basic/HTML/html5-form-controls' }
              ]
            },
            {
              text: 'Web API',
              collapsed: false,
              items: [
                { text: '使用Intersection Observer优化滚动体验', link: '/basic/HTML/intersection-observer-api' },
                { text: 'HTML5地理定位API实战指南', link: '/basic/HTML/geolocation-api' },
                { text: 'HTML5 Canvas高级绘图技术', link: '/basic/HTML/html5-canvas-advanced' },
                { text: 'WebSockets实时通信实战', link: '/basic/HTML/websockets-real-time' },
                { text: 'Service Workers与离线Web应用', link: '/basic/HTML/service-workers-offline' }
              ]
            },
            {
              text: '性能与优化',
              collapsed: false,
              items: [
                { text: 'HTML性能优化最佳实践', link: '/basic/HTML/html-performance-optimization' },
                { text: '资源预加载与性能优化', link: '/basic/HTML/resource-preloading' },
                { text: 'HTML文档的关键渲染路径优化', link: '/basic/HTML/critical-rendering-path-html' },
                { text: '图片懒加载与响应式图片技术', link: '/basic/HTML/lazy-loading-responsive-images' }
              ]
            },
            {
              text: '前沿技术',
              collapsed: false,
              items: [
                { text: 'Web组件与Shadow DOM实战', link: '/basic/HTML/web-components-shadow-dom' },
                { text: 'PWA开发实战指南', link: '/basic/HTML/progressive-web-apps' },
                { text: 'HTML模板技术与虚拟DOM', link: '/basic/HTML/html-templates-virtual-dom' },
                { text: 'WebXR：构建VR/AR Web体验', link: '/basic/HTML/webxr-development' },
                { text: 'Web视频与音频处理高级技术', link: '/basic/HTML/web-video-audio-processing' }
              ]
            }
          ]
        }
      ],
      '/basic/css/': [
        {
          text: 'CSS高级技巧系列文章',
          collapsed: false,
          items: [
            {
              text: '精选文章',
              collapsed: false,
              items: [
                { text: 'CSS Grid布局完全指南', link: '/basic/css/' },
                { text: 'CSS变量（自定义属性）实战应用', link: '/basic/css/css-custom-properties' },
                { text: 'CSS动画性能优化实战', link: '/basic/css/css-animation-performance' },
                { text: 'CSS架构设计：组织大型项目的CSS', link: '/basic/css/css-architecture' },
                { text: '现代响应式设计最佳实践', link: '/basic/css/modern-responsive-design' }
              ]
            },
            {
              text: '布局技术',
              collapsed: false,
              items: [
                { text: 'Flexbox与Grid：如何选择合适的布局方案', link: '/basic/css/flexbox-vs-grid' },
                { text: '多列布局与瀑布流实现技巧', link: '/basic/css/css-multi-column-layout' },
                { text: 'CSS容器查询：响应式设计的未来', link: '/basic/css/css-container-queries' },
                { text: 'Subgrid深度解析与应用案例', link: '/basic/css/css-subgrid' }
              ]
            },
            {
              text: '视觉效果',
              collapsed: false,
              items: [
                { text: '高级CSS动画与过渡效果', link: '/basic/css/advanced-css-animations' },
                { text: 'CSS滤镜与混合模式实战', link: '/basic/css/css-filters-blend-modes' },
                { text: '使用CSS创建沉浸式3D效果', link: '/basic/css/css-3d-effects' },
                { text: 'CSS渐变高级技巧与应用', link: '/basic/css/css-gradients' }
              ]
            },
            {
              text: '性能与优化',
              collapsed: false,
              items: [
                { text: 'CSS性能优化策略', link: '/basic/css/css-performance-optimization' },
                { text: '关键渲染路径与CSS优化', link: '/basic/css/critical-rendering-path-css' },
                { text: '如何减少CSS重排与重绘', link: '/basic/css/css-reflow-repaint' },
                { text: 'CSS代码分割与按需加载', link: '/basic/css/css-code-splitting' }
              ]
            },
            {
              text: '工具与方法论',
              collapsed: false,
              items: [
                { text: '现代CSS工具链与最佳实践', link: '/basic/css/modern-css-tooling' },
                { text: 'CSS-in-JS解决方案对比', link: '/basic/css/css-in-js-comparison' },
                { text: 'CSS模块化开发实践', link: '/basic/css/css-modules' },
                { text: 'PostCSS插件开发指南', link: '/basic/css/postcss-plugin-development' }
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
      '/spring/springboot/': [
        {
          text: 'SpringBoot 教程',
          items: [
            { text: 'SpringBoot简介', link: '/spring/springboot/' },
            { text: '环境搭建', link: '/spring/springboot/setup' },
            { text: '核心注解', link: '/spring/springboot/annotations' },
            { text: '配置文件', link: '/spring/springboot/configuration' },
            { text: 'Web开发', link: '/spring/springboot/web' },
            { text: '数据访问', link: '/spring/springboot/data-access' },
            { text: '安全与认证', link: '/spring/springboot/security' },
            { text: '测试', link: '/spring/springboot/testing' },
            { text: '部署', link: '/spring/springboot/deployment' },
            { text: '实战项目', link: '/spring/springboot/projects' }
          ]
        }
      ],
      '/spring/': [
        {
          text: 'Spring 专题',
          collapsed: false,
          items: [
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
        }
      ],
      '/web3/': [
        {
          text: 'Web3 教程',
          items: [
            { text: 'Web3简介', link: '/web3/' },
            { text: '以太坊基础', link: '/web3/ethereum' },
            { text: '智能合约', link: '/web3/smart-contract' },
            { text: '钱包与签名', link: '/web3/wallet' },
            { text: 'DApp开发', link: '/web3/dapp' },
            { text: '常见工具', link: '/web3/tools' },
            { text: 'Web3.js', link: '/web3/web3js' }
          ]
        }
      ],
      '/basic/nodejs/': [
        {
          text: 'Node.js 专题',
          collapsed: false,
          items: [
            { text: 'Node.js 简介', link: '/basic/nodejs/' },
            { text: '模块系统', link: '/basic/nodejs/module-system' },
            { text: '文件与路径操作', link: '/basic/nodejs/file-path' },
            { text: '异步与事件循环', link: '/basic/nodejs/async-event-loop' },
            { text: '进程与线程', link: '/basic/nodejs/process-thread' },
            { text: '网络编程', link: '/basic/nodejs/network' },
            { text: '流与缓冲区', link: '/basic/nodejs/stream-buffer' },
            { text: '包管理与npm', link: '/basic/nodejs/npm' },
            { text: '常用内置模块', link: '/basic/nodejs/built-in-modules' },
            { text: '测试与调试', link: '/basic/nodejs/testing-debugging' },
            { text: 'Node.js 性能优化', link: '/basic/nodejs/performance' },
            { text: 'Node.js 实战项目', link: '/basic/nodejs/projects' }
          ]
        }
      ],
      '/solidity/': [
        {
          text: 'Solidity开发全系列',
          collapsed: false,
          items: [
            {
              text: 'Solidity基础',
              collapsed: false,
              items: [
                { text: '基础语法', link: '/solidity/basics' },
                { text: '数据类型与变量', link: '/solidity/data-types' },
                { text: '函数与修饰符', link: '/solidity/functions-modifiers' },
                { text: '控制结构', link: '/solidity/control-structures' },
                { text: '事件与日志', link: '/solidity/events-logs' },
                { text: '错误处理', link: '/solidity/error-handling' }
              ]
            },
            {
              text: '合约开发进阶',
              collapsed: false,
              items: [
                { text: '合约结构与继承', link: '/solidity/contract-structure' },
                { text: '接口与库', link: '/solidity/interfaces-libraries' },
                { text: '合约部署与升级', link: '/solidity/deployment-upgrade' },
                { text: '与以太坊交互', link: '/solidity/ethereum-interaction' },
                { text: '常见设计模式', link: '/solidity/design-patterns' }
              ]
            },
            {
              text: '工具链与测试',
              collapsed: false,
              items: [
                { text: '开发环境与工具链', link: '/solidity/tooling' },
                { text: '主流开发框架', link: '/solidity/frameworks' },
                { text: '合约测试与调试', link: '/solidity/testing' },
                { text: '自动化部署', link: '/solidity/automation' }
              ]
            },
            {
              text: '安全与优化',
              collapsed: false,
              items: [
                { text: '常见安全漏洞', link: '/solidity/security' },
                { text: '安全开发最佳实践', link: '/solidity/security-best-practices' },
                { text: '合约审计流程', link: '/solidity/audit' },
                { text: '性能优化技巧', link: '/solidity/optimization' }
              ]
            },
            {
              text: '实战项目',
              collapsed: false,
              items: [
                { text: '代币合约开发', link: '/solidity/projects/' },
                { text: 'NFT合约开发', link: '/solidity/projects/nft' },
                { text: 'DAO与治理合约', link: '/solidity/projects/dao' },
                { text: 'DeFi合约实战', link: '/solidity/projects/defi' },
                { text: '综合实战案例', link: '/solidity/projects/cases' }
              ]
            }
          ]
        }
      ],
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
      /**
       * Python 侧边栏配置
       * @type {import('vitepress').DefaultTheme.Sidebar}
       */
      '/python/': [
        {
          text: 'Python 基础',
          items: [
            { text: 'Python简介', link: '/python/python/' },
            { text: '环境搭建', link: '/python/setup' },
            { text: '基础语法', link: '/python/basics' },
            { text: '数据结构', link: '/python/data-structures' },
            { text: '面向对象', link: '/python/oop' },
            { text: '标准库', link: '/python/standard-library' }
          ]
        },
        {
          text: 'Python 进阶',
          items: [
            { text: '第三方库', link: '/python/third-party' },
            { text: 'Web开发', link: '/python/web' },
            { text: '数据分析', link: '/python/data-analysis' },
            { text: '机器学习', link: '/python/machine-learning' },
            { text: '可视化', link: '/python/visualization' },
            { text: '自动化脚本', link: '/python/automation' },
            { text: '爬虫开发', link: '/python/spider' }
          ]
        },
        {
          text: '实战项目',
          items: [
            { text: '实战项目', link: '/python/projects' }
          ]
        }
      ],
      /**
       * SQL 侧边栏配置（超级详细版）
       * @type {import('vitepress').DefaultTheme.Sidebar}
       * @description 覆盖所有主流 SQL 数据库，细分基础、进阶、性能、安全、工具、设计模式等
       */
      '/sql/': [
        {
          text: 'SQL 通用',
          items: [
            { text: 'SQL 标准与历史', link: '/sql/standard' },
            { text: 'SQL 设计模式', link: '/sql/patterns' },
            { text: 'SQL 工具与生态', link: '/sql/tools' }
          ]
        },
        {
          text: 'MySQL',
          items: [
            { text: '基础语法', link: '/sql/mysql/basics' },
            { text: '数据类型', link: '/sql/mysql/types' },
            { text: '查询与操作', link: '/sql/mysql/query' },
            { text: '事务与锁', link: '/sql/mysql/transaction' },
            { text: '视图与索引', link: '/sql/mysql/view-index' },
            { text: '存储过程与函数', link: '/sql/mysql/procedure' },
            { text: '性能优化', link: '/sql/mysql/performance' },
            { text: '安全与权限', link: '/sql/mysql/security' },
            { text: '备份与恢复', link: '/sql/mysql/backup' },
            { text: '实战案例', link: '/sql/projects/mysql' },
            { text: '工具链', link: '/sql/mysql/tools' }
          ]
        },
        {
          text: 'PostgreSQL',
          items: [
            { text: '基础语法', link: '/sql/postgresql/basics' },
            { text: '数据类型', link: '/sql/postgresql/types' },
            { text: '查询与操作', link: '/sql/postgresql/query' },
            { text: '事务与锁', link: '/sql/postgresql/transaction' },
            { text: '视图与索引', link: '/sql/postgresql/view-index' },
            { text: '存储过程与函数', link: '/sql/postgresql/procedure' },
            { text: '性能优化', link: '/sql/postgresql/performance' },
            { text: '安全与权限', link: '/sql/postgresql/security' },
            { text: '备份与恢复', link: '/sql/postgresql/backup' },
            { text: '实战案例', link: '/sql/projects/postgresql' },
            { text: '工具链', link: '/sql/postgresql/tools' }
          ]
        },
        {
          text: 'SQLite',
          items: [
            { text: '基础语法', link: '/sql/sqlite/basics' },
            { text: '数据类型', link: '/sql/sqlite/types' },
            { text: '查询与操作', link: '/sql/sqlite/query' },
            { text: '事务与锁', link: '/sql/sqlite/transaction' },
            { text: '视图与索引', link: '/sql/sqlite/view-index' },
            { text: '存储过程与函数', link: '/sql/sqlite/procedure' },
            { text: '性能优化', link: '/sql/sqlite/performance' },
            { text: '安全与权限', link: '/sql/sqlite/security' },
            { text: '备份与恢复', link: '/sql/sqlite/backup' },
            { text: '实战案例', link: '/sql/projects/sqlite' },
            { text: '工具链', link: '/sql/sqlite/tools' }
          ]
        },
        {
          text: 'Oracle',
          items: [
            { text: '基础语法', link: '/sql/oracle/basics' },
            { text: '数据类型', link: '/sql/oracle/types' },
            { text: '查询与操作', link: '/sql/oracle/query' },
            { text: '事务与锁', link: '/sql/oracle/transaction' },
            { text: '视图与索引', link: '/sql/oracle/view-index' },
            { text: '存储过程与函数', link: '/sql/oracle/procedure' },
            { text: '性能优化', link: '/sql/oracle/performance' },
            { text: '安全与权限', link: '/sql/oracle/security' },
            { text: '备份与恢复', link: '/sql/oracle/backup' },
            { text: '实战案例', link: '/sql/projects/oracle' },
            { text: '工具链', link: '/sql/oracle/tools' }
          ]
        },
        {
          text: 'SQL Server',
          items: [
            { text: '基础语法', link: '/sql/sqlserver/basics' },
            { text: '数据类型', link: '/sql/sqlserver/types' },
            { text: '查询与操作', link: '/sql/sqlserver/query' },
            { text: '事务与锁', link: '/sql/sqlserver/transaction' },
            { text: '视图与索引', link: '/sql/sqlserver/view-index' },
            { text: '存储过程与函数', link: '/sql/sqlserver/procedure' },
            { text: '性能优化', link: '/sql/sqlserver/performance' },
            { text: '安全与权限', link: '/sql/sqlserver/security' },
            { text: '备份与恢复', link: '/sql/sqlserver/backup' },
            { text: '实战案例', link: '/sql/projects/sqlserver' },
            { text: '工具链', link: '/sql/sqlserver/tools' }
          ]
        },
        {
          text: 'Redis',
          items: [
            { text: 'Redis 简介', link: '/sql/redis/' },
            { text: '数据结构', link: '/sql/redis/data-structure' },
            { text: '高级特性', link: '/sql/redis/advanced' },
            { text: '实践指南', link: '/sql/redis/practice' },
            { text: '代码示例', link: '/sql/redis/code' },
            { text: '安全配置', link: '/sql/redis/security' },
            { text: '常见问题', link: '/sql/redis/faq' },
            { text: '实战案例', link: '/sql/redis/cases' }
          ]
        }
      ],
      /**
       * AI Agent 侧边栏配置（超级详细版）
       * @type {import('vitepress').DefaultTheme.Sidebar}
       * @description 覆盖主流 AI Agent 框架、能力、Ops、Prompt 工程、应用等
       */
      '/ai-agent/': [
        {
          text: 'AI Agent 基础',
          items: [
            { text: 'AI Agent 简介', link: '/ai-agent/' },
            { text: '核心原理', link: '/ai-agent/principle' },
            { text: '常用术语', link: '/ai-agent/terms' }
          ]
        },
        {
          text: '主流框架',
          items: [
            { text: 'LangChain', link: '/ai-agent/frameworks/langchain' },
            { text: 'AutoGen', link: '/ai-agent/frameworks/autogen' },
            { text: 'CrewAI', link: '/ai-agent/frameworks/crewai' },
            { text: 'MetaGPT', link: '/ai-agent/frameworks/metagpt' },
            { text: 'Haystack', link: '/ai-agent/frameworks/haystack' },
            { text: 'Flowise', link: '/ai-agent/frameworks/flowise' },
            { text: 'AgentVerse', link: '/ai-agent/frameworks/agentverse' },
            { text: '其他框架', link: '/ai-agent/frameworks/others' }
          ]
        },
        {
          text: '能力与组件',
          items: [
            { text: '感知与解析', link: '/ai-agent/abilities/perception' },
            { text: '规划与决策', link: '/ai-agent/abilities/planning' },
            { text: '行动与执行', link: '/ai-agent/abilities/action' },
            { text: '自主学习', link: '/ai-agent/abilities/learning' },
            { text: '多智能体协作', link: '/ai-agent/abilities/multi-agent' },
            { text: '工具集成', link: '/ai-agent/abilities/tools' },
            { text: '记忆与知识库', link: '/ai-agent/abilities/memory' },
            { text: '环境交互', link: '/ai-agent/abilities/environment' }
          ]
        },
        {
          text: 'AgentOps',
          items: [
            { text: 'AgentOps 概述', link: '/ai-agent/agentops' },
            { text: '监控与评估', link: '/ai-agent/agentops/monitor' },
            { text: '持续优化', link: '/ai-agent/agentops/optimize' },
            { text: '安全与合规', link: '/ai-agent/agentops/security' },
            { text: '部署与运维', link: '/ai-agent/agentops/deploy' }
          ]
        },
        {
          text: 'Prompt 工程',
          items: [
            { text: 'Prompt 设计', link: '/ai-agent/prompt' },
            { text: '提示词模式', link: '/ai-agent/prompt/patterns' },
            { text: '实战案例', link: '/ai-agent/prompt/cases' },
            { text: '多轮对话', link: '/ai-agent/prompt/multi-turn' },
            { text: '上下文管理', link: '/ai-agent/prompt/context' }
          ]
        },
        {
          text: '应用案例',
          items: [
            { text: '智能问答', link: '/ai-agent/cases/qa' },
            { text: '自动化办公', link: '/ai-agent/cases/office' },
            { text: '多智能体协作', link: '/ai-agent/cases/multi-agent' },
            { text: '自动编程', link: '/ai-agent/cases/code' },
            { text: '自动化科研', link: '/ai-agent/cases/research' },
            { text: '智能搜索与推荐', link: '/ai-agent/cases/search' },
            { text: 'RPA 流程机器人', link: '/ai-agent/cases/rpa' },
            { text: '其他应用', link: '/ai-agent/cases/others' }
          ]
        }
      ],
      /**
       * Flutter 侧边栏配置
       * @type {import('vitepress').DefaultTheme.Sidebar}
       * @description 覆盖Flutter基础、进阶、生态、实战、工具等内容，结构与其他技术栈一致
       */
      '/flutter/': [
        {
          text: 'Flutter 基础',
          items: [
            { text: 'Flutter简介', link: '/flutter/' },
            { text: '环境搭建', link: '/flutter/setup' },
            { text: '开发工具链', link: '/flutter/tooling' },
            { text: '基础语法', link: '/flutter/basics' },
            { text: '核心组件', link: '/flutter/widgets' },
            { text: '布局与样式', link: '/flutter/layout' },
            { text: '路由与导航', link: '/flutter/routing' },
            { text: '状态管理', link: '/flutter/state-management' },
            { text: '网络与数据', link: '/flutter/network' },
            { text: '本地存储', link: '/flutter/storage' },
            { text: '动画与交互', link: '/flutter/animation' },
            { text: '平台集成', link: '/flutter/platform' }
          ]
        },
        {
          text: '进阶与生态',
          items: [
            { text: '测试与调试', link: '/flutter/testing' },
            { text: '性能优化', link: '/flutter/performance' },
            { text: '生态与插件', link: '/flutter/ecosystem' }
          ]
        },
        {
          text: '实战项目',
          items: [
            { text: '实战项目', link: '/flutter/projects' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/webywz/xiaopang-fe' }
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