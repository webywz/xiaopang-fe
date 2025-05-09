# Vue 3高级进阶

本章节涵盖了Vue 3的高级特性和进阶技巧，帮助开发者充分利用Vue 3的强大功能和性能优势。

## Vue 3核心模块解析

### 响应式系统 (Reactivity)

Vue 3使用基于Proxy的响应式系统，性能和灵活性大幅提升：

```js
/**
 * Vue 3响应式系统深入理解
 */
import { 
  ref, reactive, readonly, shallowRef, shallowReactive,
  toRaw, markRaw, isProxy, isReactive, isReadonly, isRef
} from 'vue'

// 完全响应式
const user = reactive({
  name: '张三',
  profile: { age: 30 }
})
// user和user.profile都是响应式的

// 浅层响应式 - 只有第一层属性响应式
const shallowUser = shallowReactive({
  name: '李四',
  profile: { age: 25 }
})
// shallowUser响应式，但shallowUser.profile不是

// 禁止特定值成为响应式
const rawObj = markRaw({ count: 1 })
const state = reactive({
  someObj: rawObj
})
// state.someObj永远不会成为响应式对象

// 获取原始数据，脱离响应式
const raw = toRaw(user)
// raw是普通JavaScript对象

// 检查对象状态
console.log(isReactive(user)) // true
console.log(isReadonly(readonly(user))) // true
console.log(isRef(ref(0))) // true
console.log(isProxy(user)) // true
```

### 组合式函数的高级用法

```js
/**
 * 创建自定义组合式函数
 * @returns {Object} 返回多个组合式API的状态和函数
 */
import { ref, computed, watch, watchEffect, nextTick, onMounted } from 'vue'

export function useAdvancedFeature() {
  // 状态
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  
  // 计算属性
  const isEmpty = computed(() => !data.value || data.value.length === 0)
  
  // 方法
  async function fetchData(id) {
    loading.value = true
    error.value = null
    
    try {
      await nextTick() // 等待DOM更新
      const response = await fetch(`/api/data/${id}`)
      data.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // 侦听器
  watch(data, (newValue) => {
    console.log('数据已更新:', newValue)
  })
  
  // 自动执行的侦听器
  const stop = watchEffect(() => {
    console.log(`加载状态: ${loading.value}, 数据: ${data.value}`)
    
    // 清理副作用
    return () => {
      console.log('清理副作用')
    }
  })
  
  // 停止侦听
  function stopWatching() {
    stop()
  }
  
  // 生命周期钩子
  onMounted(() => {
    console.log('组件已挂载，可以初始化数据')
  })
  
  return {
    loading,
    error,
    data,
    isEmpty,
    fetchData,
    stopWatching
  }
}
```

## Vue 3高级组件模式

### 异步组件和Suspense

```vue
<script setup>
/**
 * 异步组件和Suspense示例
 */
import { ref } from 'vue'
import { defineAsyncComponent } from 'vue'

// 定义异步组件
const AsyncComponent = defineAsyncComponent({
  // 工厂函数
  loader: () => import('./components/HeavyComponent.vue'),
  // 加载中显示的组件
  loadingComponent: LoadingComponent,
  // 出错时显示的组件
  errorComponent: ErrorComponent,
  // 显示加载组件前的延迟 | 默认200ms
  delay: 200,
  // 超时时间 | 默认无限制
  timeout: 3000,
  // 失败回调
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      // 重试
      retry()
    } else {
      // 失败
      fail()
    }
  }
})

// 或简化版
const SimpleAsyncComponent = defineAsyncComponent(
  () => import('./components/SimpleComponent.vue')
)
</script>

<template>
  <div>
    <!-- 使用Suspense处理异步组件 -->
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <div>数据加载中...</div>
      </template>
    </Suspense>
  </div>
</template>
```

### 函数式组件

```js
/**
 * Vue 3函数式组件
 * @param {Object} props - 组件属性
 * @param {Object} context - 上下文对象
 * @returns {VNode} 虚拟DOM节点
 */
import { h } from 'vue'

const FunctionalButton = (props, { slots, emit, attrs }) => {
  const onClick = () => {
    emit('click')
  }
  
  return h('button', {
    ...attrs,
    class: ['btn', props.type && `btn-${props.type}`],
    onClick
  }, slots.default?.())
}

// 定义props
FunctionalButton.props = {
  type: {
    type: String,
    default: 'default'
  }
}

export default FunctionalButton
```

### 定制化渲染（render函数和JSX）

```jsx
/**
 * 使用JSX的组件
 */
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    title: String,
    items: Array
  },
  setup(props) {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    return () => (
      <div class="container">
        <h1>{props.title}</h1>
        <p>Count: {count.value}</p>
        <button onClick={increment}>增加</button>
        
        <ul>
          {props.items?.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        
        {count.value > 5 ? (
          <p class="warning">计数超过5!</p>
        ) : null}
      </div>
    )
  }
})
```

## Vue 3性能优化技巧

### 组件实例缓存 (KeepAlive)

```vue
<template>
  <div class="app">
    <button @click="currentTab = 'TabA'">Tab A</button>
    <button @click="currentTab = 'TabB'">Tab B</button>
    <button @click="currentTab = 'TabC'">Tab C</button>
    
    <!-- 使用keep-alive缓存组件状态 -->
    <keep-alive :include="['TabA', 'TabB']" :max="5">
      <component :is="currentTab" />
    </keep-alive>
  </div>
</template>

<script setup>
/**
 * 使用KeepAlive优化性能
 */
import { ref, shallowRef } from 'vue'
import TabA from './components/TabA.vue'
import TabB from './components/TabB.vue'
import TabC from './components/TabC.vue'

// 使用shallowRef优化大型组件引用
const tabs = shallowRef({
  TabA,
  TabB,
  TabC
})

const currentTab = ref('TabA')
</script>
```

### 大型列表渲染优化

```vue
<script setup>
/**
 * 大型列表优化技巧
 */
import { ref, computed } from 'vue'

// 1. 使用本地分页
const allItems = ref(Array.from({ length: 10000 }).map((_, i) => ({
  id: i,
  name: `项目 ${i}`,
  description: `这是项目 ${i} 的描述`
})))

const currentPage = ref(1)
const pageSize = ref(50)

// 计算当前页的数据
const currentPageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allItems.value.slice(start, end)
})

// 2. 使用虚拟列表库
// 如vue-virtual-scroller, vue-virtual-scroll-grid
</script>

<template>
  <div>
    <!-- 只渲染当前页的数据 -->
    <div v-for="item in currentPageItems" :key="item.id" class="item">
      {{ item.name }}
    </div>
    
    <!-- 简单分页控件 -->
    <div class="pagination">
      <button @click="currentPage--" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ Math.ceil(allItems.length / pageSize) }}</span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage >= Math.ceil(allItems.length / pageSize)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
```

### 使用v-once和v-memo提高性能

```vue
<template>
  <div>
    <!-- 一次性渲染，永不更新 -->
    <header v-once>
      <h1>{{ appTitle }}</h1>
      <div class="logo"></div>
    </header>
    
    <!-- 带条件的记忆化 -->
    <div v-for="item in items" :key="item.id" v-memo="[item.id, item.active]">
      <!-- 只有当item.id或item.active改变时才会重新渲染 -->
      <ExpensiveComponent :item="item" />
    </div>
  </div>
</template>

<script setup>
/**
 * 使用v-once和v-memo优化性能
 */
import { ref } from 'vue'
import ExpensiveComponent from './components/ExpensiveComponent.vue'

const appTitle = 'My Dashboard App'

const items = ref([
  { id: 1, name: '项目1', active: true },
  { id: 2, name: '项目2', active: false },
  // ...
])
</script>
```

## Vue 3与TypeScript高级集成

```ts
/**
 * Vue 3的TypeScript高级类型支持
 */
import { defineComponent, PropType, computed, ref } from 'vue'

// 定义复杂类型
interface User {
  id: number
  name: string
  role: 'admin' | 'user' | 'guest'
  profile: {
    email: string
    avatar?: string
  }
}

type Theme = 'light' | 'dark' | 'system'

export default defineComponent({
  props: {
    // 基本类型
    title: String,
    
    // 带默认值的类型
    count: {
      type: Number,
      default: 0
    },
    
    // 复杂对象类型
    user: {
      type: Object as PropType<User>,
      required: true
    },
    
    // 联合类型
    theme: {
      type: String as PropType<Theme>,
      default: 'system',
      validator: (value: string): boolean => {
        return ['light', 'dark', 'system'].includes(value)
      }
    },
    
    // 函数类型
    formatter: {
      type: Function as PropType<(value: number) => string>,
      default: (value: number) => `$${value.toFixed(2)}`
    },
    
    // 数组类型
    items: {
      type: Array as PropType<User[]>,
      default: () => []
    }
  },
  
  emits: {
    // 带类型验证的事件
    'update': (user: User) => !!user.id,
    'select': (id: number) => typeof id === 'number',
    'change-theme': (theme: Theme) => true
  },
  
  setup(props, { emit }) {
    // 带类型的ref
    const selectedId = ref<number | null>(null)
    
    // 带类型的computed
    const isAdmin = computed<boolean>(() => 
      props.user?.role === 'admin'
    )
    
    // 带类型的函数
    function selectUser(id: number): void {
      selectedId.value = id
      emit('select', id)
    }
    
    return {
      selectedId,
      isAdmin,
      selectUser
    }
  }
})
```

## Vue 3自定义指令与插件系统

### 高级自定义指令

```js
/**
 * Vue 3自定义指令系统
 */
// 导入指令钩子
import { ObjectDirective } from 'vue'

// 封装一个响应式resize指令
export const vResize: ObjectDirective = {
  // 创建时
  created(el, binding) {
    // 指令初始化逻辑
  },
  // 挂载到DOM时
  mounted(el, binding) {
    const handler = binding.value
    
    el._resizeObserver = new ResizeObserver(entries => {
      if (typeof handler === 'function') {
        // 获取元素尺寸数据
        const { width, height } = entries[0].contentRect
        // 调用回调函数
        handler(width, height)
      }
    })
    
    el._resizeObserver.observe(el)
  },
  // 更新时
  updated(el, binding) {
    // 更新处理逻辑
  },
  // 卸载前
  beforeUnmount(el) {
    // 清理资源
    if (el._resizeObserver) {
      el._resizeObserver.disconnect()
      delete el._resizeObserver
    }
  }
}

// 使用指令
/*
<template>
  <div v-resize="handleResize" class="box">
    调整我的大小
  </div>
</template>

<script setup>
function handleResize(width, height) {
  console.log(`新尺寸: ${width}x${height}`)
}
</script>
*/
```

### 创建高级插件

```js
/**
 * Vue 3高级插件开发
 * @param {Object} options - 插件选项
 */
// 插件主文件 (myPlugin.js)
import MyButton from './components/MyButton.vue'
import MyDialog from './components/MyDialog.vue'
import { vVisible } from './directives/vVisible'
import { useMyHook } from './composables/useMyHook'

export default {
  install(app, options = {}) {
    // 全局属性
    app.config.globalProperties.$myFeature = {
      version: '1.0.0',
      doSomething: (text) => console.log(text)
    }
    
    // 注册全局组件
    app.component('MyButton', MyButton)
    app.component('MyDialog', MyDialog)
    
    // 注册自定义指令
    app.directive('visible', vVisible)
    
    // 添加全局实例方法
    app.mixin({
      methods: {
        $transformText(text) {
          return options.uppercase ? text.toUpperCase() : text
        }
      }
    })
    
    // 提供依赖注入的值
    app.provide('myPlugin', {
      name: options.name || 'Default Plugin Name',
      theme: options.theme || 'light'
    })
    
    // 扩展Vue全局API
    app.config.globalProperties.$create = (component, props) => {
      // 动态创建组件实例
      const vnode = h(component, props)
      render(vnode, document.createElement('div'))
      return vnode.component.proxy
    }
    
    // 暴露组合式API
    if (options.exposeComposables !== false) {
      window.MyPlugin = {
        useMyHook
      }
    }
  }
}

// 使用插件
/*
import { createApp } from 'vue'
import App from './App.vue'
import MyPlugin from './plugins/myPlugin'

const app = createApp(App)
app.use(MyPlugin, {
  uppercase: true,
  name: 'Custom Plugin',
  theme: 'dark',
  exposeComposables: true
})
app.mount('#app')
*/
```

## 相关链接

- [Vue 3基础](/vue/)
- [组件化开发](/vue/components)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing) 