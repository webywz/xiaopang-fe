# Vue 3组件化开发

Vue 3的组件系统是其核心特性之一，相比Vue 2有了更强大和灵活的组件化开发能力，特别是通过Composition API提供了更好的代码复用性和类型支持。

## Vue 3组件基础

### 组件注册

```js
/**
 * Vue 3全局组件注册
 * @param {string} name - 组件名称
 * @param {Object} component - 组件定义
 */
import { createApp } from 'vue'
import App from './App.vue'
import MyComponent from './components/MyComponent.vue'

const app = createApp(App)
// 全局组件注册
app.component('MyComponent', MyComponent)
app.mount('#app')

/**
 * 局部组件注册 - 选项式API
 */
import MyComponent from './components/MyComponent.vue'

export default {
  components: {
    MyComponent
  }
}

/**
 * 使用script setup自动注册组件
 */
// MyPage.vue
<script setup>
import MyComponent from './components/MyComponent.vue'
// 无需注册，直接使用<MyComponent/>
</script>
```

### 单文件组件与script setup

Vue 3推荐使用`<script setup>`语法的单文件组件：

```vue
<script setup>
/**
 * Vue 3的<script setup>组件
 * @param {string} msg - 从父组件传递的消息
 */
import { ref, computed } from 'vue'

// 组件props定义
const props = defineProps({
  msg: {
    type: String,
    required: true
  }
})

// 响应式状态
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 定义触发事件
const emit = defineEmits(['increment', 'reset'])

// 触发事件
function handleClick() {
  emit('increment', count.value)
}
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">内部增加</button>
    <button @click="handleClick">通知父组件</button>
  </div>
</template>

<style scoped>
.hello {
  margin: 20px;
}
</style>
```

## Vue 3组件通信

### Props向下传递

```vue
<template>
  <!-- 传递静态prop -->
  <child-component title="静态标题" />
  
  <!-- 传递动态prop -->
  <child-component :title="dynamicTitle" />
  
  <!-- 传递多个props -->
  <user-profile
    :name="user.name"
    :age="user.age"
    :is-admin="user.role === 'admin'"
  />
</template>

<script setup>
/**
 * 父组件向子组件传递props
 */
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'
import UserProfile from './UserProfile.vue'

const dynamicTitle = ref('从父组件传递的动态标题')
const user = ref({
  name: '张三',
  age: 30,
  role: 'admin'
})
</script>
```

### 子组件事件

```vue
<!-- 子组件 -->
<script setup>
/**
 * 子组件触发事件给父组件
 */
const emit = defineEmits(['update', 'delete'])

function updateItem(item) {
  emit('update', item)
}

function deleteItem(id) {
  emit('delete', id)
}
</script>

<template>
  <div>
    <button @click="updateItem({id: 1, name: '新名称'})">更新</button>
    <button @click="deleteItem(1)">删除</button>
  </div>
</template>

<!-- 父组件 -->
<template>
  <child-component 
    @update="handleUpdate" 
    @delete="handleDelete" 
  />
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

function handleUpdate(item) {
  console.log('更新项目:', item)
}

function handleDelete(id) {
  console.log('删除项目ID:', id)
}
</script>
```

### 依赖注入 (Provide/Inject)

```js
/**
 * Vue 3的依赖注入系统
 */
// 在父组件中提供数据
// ParentComponent.vue
<script setup>
import { ref, provide } from 'vue'

const theme = ref('dark')
// 提供响应式状态
provide('theme', theme)

// 提供方法
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
provide('toggleTheme', toggleTheme)
</script>

// 在后代组件中注入
// ChildComponent.vue
<script setup>
import { inject } from 'vue'

// 注入响应式状态
const theme = inject('theme')
// 注入方法
const toggleTheme = inject('toggleTheme')
</script>

<template>
  <div :class="theme">
    当前主题: {{ theme }}
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>
```

## Vue 3插槽系统

### 默认插槽与具名插槽

```vue
<!-- 父组件 -->
<template>
  <layout-component>
    <!-- 默认插槽内容 -->
    <p>这是默认内容</p>
    
    <!-- 具名插槽 -->
    <template #header>
      <h1>页面标题</h1>
    </template>
    
    <!-- 具名插槽缩写 -->
    <template v-slot:footer>
      <p>页面底部内容</p>
    </template>
  </layout-component>
</template>

<!-- 子组件 LayoutComponent.vue -->
<template>
  <div class="container">
    <header>
      <slot name="header"><!-- 默认内容 --></slot>
    </header>
    
    <main>
      <slot><!-- 默认插槽 --></slot>
    </main>
    
    <footer>
      <slot name="footer"><!-- 默认内容 --></slot>
    </footer>
  </div>
</template>
```

### 作用域插槽

```vue
<!-- 列表组件 -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <slot :item="item" :index="index" :remove="removeItem">
        <!-- 默认内容 -->
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<script setup>
/**
 * 带作用域插槽的列表组件
 */
import { ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['remove'])

function removeItem(id) {
  emit('remove', id)
}
</script>

<!-- 使用组件 -->
<template>
  <list-component :items="users" @remove="handleRemove">
    <template #default="{ item, index, remove }">
      <div class="user-item">
        <span>{{ index + 1 }}. {{ item.name }}</span>
        <button @click="remove(item.id)">删除</button>
      </div>
    </template>
  </list-component>
</template>
```

## Vue 3组件生命周期

Vue 3的组件生命周期钩子在Composition API中：

```js
/**
 * Vue 3组件生命周期钩子
 */
import { 
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated, 
  onBeforeUnmount, 
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured 
} from 'vue'

export default {
  setup() {
    // 创建阶段
    onBeforeMount(() => {
      console.log('组件挂载前')
    })
    
    onMounted(() => {
      console.log('组件挂载完成')
    })
    
    // 更新阶段
    onBeforeUpdate(() => {
      console.log('组件更新前')
    })
    
    onUpdated(() => {
      console.log('组件更新完成')
    })
    
    // 卸载阶段
    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })
    
    onUnmounted(() => {
      console.log('组件卸载完成')
    })
    
    // keep-alive相关
    onActivated(() => {
      console.log('被缓存的组件激活')
    })
    
    onDeactivated(() => {
      console.log('被缓存的组件停用')
    })
    
    // 错误处理
    onErrorCaptured((err, instance, info) => {
      console.log('捕获到后代组件错误')
      return false // 阻止错误继续传播
    })
  }
}
```

## 相关链接

- [Vue 3基础](/vue/)
- [状态管理](/vue/state-management)
- [路由管理](/vue/routing)
- [高级进阶](/vue/高级进阶) 