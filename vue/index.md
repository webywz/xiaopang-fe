---
layout: doc
title: Vue开发指南
description: 从入门到精通的Vue开发教程
---

# Vue开发指南

欢迎来到Vue开发指南！本教程将带你从基础概念到高级应用，全面掌握Vue开发技术栈。

## 学习路径

1. [Vue 3基础知识](/vue/basics)
2. [组件化开发](/vue/components)
3. [状态管理](/vue/state-management)
4. [路由管理](/vue/routing)
5. [高级进阶](/vue/advanced)

## 最新Vue文章

- [Vue 3性能优化实战](/blog/vue3-performance)
- [Vue 3组合式API设计模式](/blog/vue3-composition-api-patterns)
- [深入理解Vue 3响应式系统](/blog/vue3-reactivity-deep-dive)

[查看全部Vue文章 →](/blog/#vue)

# Vue 3基础

Vue 3是一个用于构建用户界面的渐进式JavaScript框架。与Vue 2相比，Vue 3进行了全面重构，提供了更好的性能、更小的包体积和更好的TypeScript支持。

## Vue 3核心特性

- **Composition API**：全新的逻辑组织方式，解决大型组件的逻辑复用和组织问题
- **响应式系统升级**：基于Proxy的全新响应式系统，提供更好的性能和类型推断
- **Teleport组件**：允许将组件的一部分模板"传送"到DOM的另一个部分
- **Fragments**：组件可以有多个根节点
- **更小的包体积**：通过摇树优化，核心包体积相比Vue 2减少了41%

## 开始使用Vue 3

### 安装

```bash
# 使用npm
npm init vue@latest

# 使用yarn
yarn create vue

# 使用pnpm
pnpm create vue
```

### 创建Vue 3应用

```js
/**
 * Vue 3应用创建示例
 */
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
// 注册全局组件或插件
// app.component('MyComponent', MyComponent)
// app.use(router)
app.mount('#app')
```

## Vue 3的主要变化

### 从选项式API到组合式API

```js
/**
 * 组合式API基础示例
 */
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 响应式状态
    const count = ref(0)
    
    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    
    // 方法
    function increment() {
      count.value++
    }
    
    // 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    // 返回给模板使用
    return {
      count,
      doubleCount,
      increment
    }
  }
}
```

### &lt;script setup&gt;语法糖

```vue
<script setup>
/**
 * <script setup>语法糖示例
 */
import { ref, computed, onMounted } from 'vue'

// 状态自动暴露给模板
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

## 相关链接

- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶)
