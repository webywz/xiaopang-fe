# Vue 3高级主题

本文档涵盖了Vue 3的更多高级主题和深入知识点，帮助开发者更深入地理解和使用Vue 3框架。

## 深入Vue 3响应式系统

### 响应式原理与核心API

```js
/**
 * Vue 3响应式系统深入理解
 */
import { 
  ref, reactive, effect, stop, 
  effectScope, getCurrentScope, onScopeDispose 
} from 'vue'

// effectScope - 用于统一管理和处理副作用
const scope = effectScope()

// 在作用域中创建副作用
scope.run(() => {
  const counter = ref(0)
  
  // 创建响应式副作用
  const stop1 = effect(() => {
    console.log(`Counter value: ${counter.value}`)
  })
  
  // 获取当前作用域
  const currentScope = getCurrentScope()
  
  // 在作用域销毁时执行清理
  onScopeDispose(() => {
    console.log('Scope is being disposed')
  })
  
  // 手动停止某个副作用
  stop1()
})

// 停止整个作用域内的所有副作用
scope.stop()
```

### 特殊响应式API的使用场景

```js
/**
 * 特殊响应式API深入应用
 */
import { 
  ref, shallowRef, customRef, triggerRef,
  reactive, shallowReactive, readonly, shallowReadonly
} from 'vue'

// shallowRef - 只有.value是响应式的，适合大型数据结构或外部库集成
const bigData = shallowRef({ huge: { nested: { structure: { value: 100 } } } })
// 只有直接设置.value才会触发更新
bigData.value = newBigData // 触发更新
bigData.value.huge.nested.structure.value = 200 // 不触发更新
triggerRef(bigData) // 手动触发更新

// customRef - 创建自定义ref，控制依赖追踪和更新触发
function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        // 追踪依赖
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          // 触发更新
          trigger()
        }, delay)
      }
    }
  })
}

const searchQuery = useDebouncedRef('', 300)
// 现在输入时会有300ms的防抖

// shallowReactive vs reactive
const reactiveObj = reactive({ nested: { value: 0 } })
// 整个对象树都是响应式的
reactiveObj.nested.value++ // 触发更新

const shallowObj = shallowReactive({ nested: { value: 0 } })
// 只有顶层属性是响应式的
shallowObj.nested = { value: 1 } // 触发更新
shallowObj.nested.value++ // 不触发更新
```

### 性能优化与内存管理

```js
/**
 * 响应式系统性能优化
 */
import { reactive, markRaw, toRaw, isReactive } from 'vue'

// 1. 使用markRaw阻止大型对象成为响应式
const hugeObject = markRaw({
  // 大型不需要响应式的对象
  data: new Array(10000).fill(0).map((_, i) => ({ id: i }))
})

const state = reactive({
  config: hugeObject
})
// state.config永远不会变成响应式

// 2. 使用toRaw获取原始对象，执行不需要触发更新的操作
const reactiveState = reactive({ count: 0, items: [] })
const rawState = toRaw(reactiveState)

// 对原始对象执行大批量操作
function batchUpdate() {
  for (let i = 0; i < 1000; i++) {
    rawState.items.push(i) // 不会触发更新
  }
  
  // 操作完成后再触发一次更新
  reactiveState.count++
}

// 3. 检查对象是否是响应式的
console.log(isReactive(reactiveState)) // true
console.log(isReactive(rawState)) // false
```

## 组合式API进阶技巧

### 组合式函数最佳实践

```js
/**
 * 组合式函数最佳实践
 */
import { ref, computed, watch, unref, isRef } from 'vue'

// 1. 接受ref或普通值作为参数
export function useFeature(input) {
  // unref在接收到ref时自动解包
  const processedValue = unref(input)
  
  // 或者使用以下模式，保持响应性
  const valueRef = isRef(input) ? input : ref(input)
  
  // 进一步处理...
  
  return {
    // 返回值
  }
}

// 2. 组合式函数之间的组合
export function useUserData(userId) {
  // 复用其他组合式函数
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`)
  const { saveData } = useLocalStorage('user-data')
  
  // 扩展功能
  watch(user, (newUser) => {
    if (newUser) {
      saveData(newUser)
    }
  })
  
  return {
    user,
    loading,
    error
  }
}

// 3. 提供清理函数
export function useEventListener(target, event, callback) {
  // 在组件挂载后添加事件监听
  onMounted(() => {
    target.addEventListener(event, callback)
  })
  
  // 清理函数，防止内存泄漏
  onUnmounted(() => {
    target.removeEventListener(event, callback)
  })
}
```

### 模板引用与组件实例交互

```vue
<script setup>
/**
 * 模板引用与组件实例交互
 */
import { ref, onMounted, nextTick } from 'vue'

// 创建模板引用
const inputRef = ref(null)
const childComponentRef = ref(null)

// 暴露组件方法给父组件
defineExpose({
  focus() {
    inputRef.value?.focus()
  },
  reset() {
    // 重置组件状态
  }
})

onMounted(async () => {
  // 访问DOM元素
  inputRef.value.focus()
  
  // 等待下一个DOM更新周期
  await nextTick()
  
  // 访问子组件暴露的方法
  childComponentRef.value.someMethod()
})
</script>

<template>
  <div>
    <input ref="inputRef" />
    <ChildComponent ref="childComponentRef" />
  </div>
</template>
```

## Vue 3服务端渲染(SSR)

### 基本原理与设置

```js
/**
 * Vue 3 SSR基本设置
 */
// server.js
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export async function render() {
  const app = createSSRApp(App)
  
  // 处理路由和状态管理
  // app.use(router)
  // app.use(store)
  
  // 将Vue应用渲染为HTML字符串
  const appHtml = await renderToString(app)
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue 3 SSR App</title>
      </head>
      <body>
        <div id="app">${appHtml}</div>
        <script src="/assets/entry-client.js"></script>
      </body>
    </html>
  `
}
```

### Nuxt 3框架

```js
/**
 * Nuxt 3基本结构
 */
// app.vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

// pages/index.vue
<script setup>
// 基于文件系统的路由
const { data } = await useFetch('/api/data')
</script>

<template>
  <div>
    <h1>Nuxt 3 Page</h1>
    <div v-for="item in data" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

// server/api/data.ts - 服务器API路由
export default defineEventHandler(async (event) => {
  // 服务器端数据处理
  return [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
})
```

## Vue 3与TypeScript深度集成

### 组件类型定义

```ts
/**
 * Vue 3组件与TypeScript深度集成
 */
import { defineComponent, PropType, ref, computed } from 'vue'

// 定义接口
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    callback: {
      type: Function as PropType<(id: number) => Promise<void>>,
      required: true
    }
  },
  
  setup(props) {
    // TypeScript会自动推导props.user为User类型
    const isAdmin = computed(() => props.user.role === 'admin')
    
    // 定义带类型的函数
    async function handleAction(id: number): Promise<void> {
      await props.callback(id)
    }
    
    return {
      isAdmin,
      handleAction
    }
  }
})
```

### script setup与TypeScript

```vue
<script setup lang="ts">
/**
 * 使用TypeScript的script setup
 */
import { ref, computed } from 'vue'

// 定义props类型
interface Props {
  items: Array<{
    id: number
    name: string
  }>
  initialIndex?: number
}

// 使用defineProps声明带有TS类型的props
const props = defineProps<Props>()

// 使用withDefaults提供默认值
// const props = withDefaults(defineProps<Props>(), {
//   initialIndex: 0
// })

// 定义事件类型
interface Emits {
  (e: 'select', id: number): void
  (e: 'create', name: string): void
}

// 使用defineEmits声明带类型的事件
const emit = defineEmits<Emits>()

// 带有类型的响应式状态
const selectedId = ref<number | null>(props.initialIndex ?? null)

// 类型安全的计算属性
const selectedItem = computed(() => {
  if (selectedId.value === null) return null
  return props.items.find(item => item.id === selectedId.value) || null
})

// 类型安全的函数
function select(id: number): void {
  selectedId.value = id
  emit('select', id)
}

// 暴露给父组件的方法
defineExpose({
  reset(): void {
    selectedId.value = null
  }
})
</script>
```

## Vue 3动画与过渡

### 高级过渡效果

```vue
<template>
  <div>
    <!-- 基本过渡 -->
    <Transition name="fade">
      <div v-if="show">Content</div>
    </Transition>
    
    <!-- 列表过渡 -->
    <TransitionGroup name="list" tag="ul">
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </TransitionGroup>
    
    <!-- 动态过渡 -->
    <Transition :name="transitionName">
      <component :is="currentView" />
    </Transition>
    
    <!-- JavaScript钩子控制的过渡 -->
    <Transition
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      :css="false"
    >
      <div v-if="show" class="animated-box"></div>
    </Transition>
  </div>
</template>

<script setup>
/**
 * Vue 3高级动画与过渡
 */
import { ref } from 'vue'
import gsap from 'gsap' // 外部动画库

const show = ref(true)
const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

// JavaScript过渡钩子
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.height = '0px'
}

function onEnter(el, done) {
  gsap.to(el, {
    opacity: 1,
    height: '100px',
    duration: 0.6,
    onComplete: done
  })
}

function onAfterEnter(el) {
  console.log('Transition complete')
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: 0.6,
    onComplete: done
  })
}
</script>

<style>
/* CSS过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 列表过渡 */
.list-move, /* 应用于移动中的元素 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保离开的项目被移除出DOM流，以便正确计算移动中的元素 */
.list-leave-active {
  position: absolute;
}
</style>
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶) 