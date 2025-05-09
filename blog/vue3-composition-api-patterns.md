---
title: Vue 3组合式API设计模式
date: 2024-04-15
author: 前端小胖
tags: ['Vue', '组件设计', '前端开发']
description: 探索Vue 3组合式API的高级设计模式、代码组织策略和最佳实践
prerequisites: 
  - title: Vue 3基础入门
    link: /blog/vue3-basics
  - title: 深入理解Vue 3响应式系统
    link: /blog/vue3-reactivity-deep-dive
follow_up:
  - title: Vue 3性能优化实战
    link: /blog/vue3-performance
  - title: Vue 3与TypeScript实战指南
    link: /blog/vue3-typescript-guide
---

# Vue 3组合式API设计模式

组合式API (Composition API) 是Vue 3的核心特性，它彻底改变了Vue组件的编写方式。与Options API相比，组合式API提供了更灵活的代码组织方式，使逻辑复用和类型推导变得更加自然。本文将探索组合式API的高级设计模式，帮助你编写出更健壮、可维护的Vue 3应用。

## 目录

- [基础模式回顾](#基础模式回顾)
- [逻辑复用模式](#逻辑复用模式)
- [状态管理模式](#状态管理模式)
- [组件通信模式](#组件通信模式)
- [生命周期管理模式](#生命周期管理模式)
- [异步操作模式](#异步操作模式)
- [组合函数设计模式](#组合函数设计模式)
- [测试与可维护性](#测试与可维护性)
- [实际案例分析](#实际案例分析)

## 基础模式回顾

在深入高级模式前，让我们简要回顾组合式API的基础用法和概念。

### setup函数与组合式API入口

组合式API的核心是`setup`函数，它在组件实例创建之前执行，是所有组合式API的入口点。

```vue
<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    // 响应式状态
    const count = ref(0);
    
    // 方法
    function increment() {
      count.value++;
    }
    
    // 生命周期
    onMounted(() => {
      console.log('组件已挂载');
    });
    
    // 返回需要暴露给模板的内容
    return {
      count,
      increment
    };
  }
}
</script>
```

### `<script setup>`语法糖

Vue 3.2引入的`<script setup>`是组合式API的语法糖，进一步简化了代码结构，自动暴露顶层变量和导入。

```vue
<script setup>
import { ref, onMounted } from 'vue';

// 响应式状态
const count = ref(0);

// 方法
function increment() {
  count.value++;
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载');
});

// 无需显式返回，顶层变量自动暴露给模板
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### 响应式系统基础

组合式API的响应式原语分类：

- **ref**: 创建任何类型的响应式引用
- **reactive**: 创建对象的响应式代理
- **computed**: 创建基于响应式状态的派生值
- **watch/watchEffect**: 侦听响应式状态变化执行副作用

```vue
<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue';

// ref适用于简单类型
const count = ref(0);

// reactive适用于对象
const user = reactive({
  name: '张三',
  age: 30
});

// computed用于派生状态
const doubleCount = computed(() => count.value * 2);

// watch用于侦听特定状态
watch(count, (newVal, oldVal) => {
  console.log(`count从${oldVal}变为${newVal}`);
});

// watchEffect会自动追踪依赖的响应式状态
watchEffect(() => {
  console.log(`当前计数: ${count.value}`);
  console.log(`用户名: ${user.name}`);
});
</script>
```

## 逻辑复用模式

组合式API的一个主要优势是能够轻松提取和复用逻辑，下面介绍几种常见的逻辑复用模式。

### 可组合函数(Composables)

可组合函数是Vue 3中逻辑复用的推荐方式，它们是利用组合式API抽取状态逻辑的函数。

```js
// composables/useCounter.js
import { ref } from 'vue';

/**
 * 计数器逻辑
 * @param {number} initialValue 初始值
 * @returns {Object} 包含计数状态和操作方法
 */
export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  function reset() {
    count.value = initialValue;
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  };
}
```

组件中使用：

```vue
<script setup>
import { useCounter } from '@/composables/useCounter';

// 解构使用组合函数返回的状态和方法
const { count, increment, decrement, reset } = useCounter(10);
</script>

<template>
  <div>
    <p>当前计数: {{ count }}</p>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
    <button @click="reset">重置</button>
  </div>
</template>
```

### 组合多个可组合函数

可组合函数的一个强大特性是可以相互组合，构建更复杂的逻辑。

```js
// composables/useFetch.js
import { ref } from 'vue';

/**
 * 通用数据获取组合函数
 * @param {Function} fetchFunc 获取数据的函数
 * @returns {Object} 包含数据状态和加载状态
 */
export function useFetch(fetchFunc) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  
  async function execute(...args) {
    loading.value = true;
    data.value = null;
    error.value = null;
    
    try {
      const result = await fetchFunc(...args);
      data.value = result;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    data,
    error,
    loading,
    execute
  };
}

// composables/useUserData.js
import { useFetch } from './useFetch';

/**
 * 获取用户数据的组合函数
 * @param {number} userId 用户ID
 * @returns {Object} 用户数据和状态
 */
export function useUserData(userId) {
  const fetchUserData = async (id) => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('获取用户数据失败');
    return response.json();
  };
  
  const { data: userData, error, loading, execute } = useFetch(fetchUserData);
  
  // 初始执行获取数据
  execute(userId);
  
  return {
    userData,
    error,
    loading,
    refreshUserData: () => execute(userId)
  };
}
```

组件中使用：

```vue
<script setup>
import { useUserData } from '@/composables/useUserData';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const { userData, error, loading, refreshUserData } = useUserData(props.userId);
</script>

<template>
  <div>
    <button @click="refreshUserData">刷新数据</button>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">出错了: {{ error.message }}</div>
    <div v-else-if="userData">
      <h3>{{ userData.name }}</h3>
      <p>{{ userData.email }}</p>
    </div>
  </div>
</template>
```

### 可参数化组合函数

可组合函数可以接受参数，使其更具灵活性和可复用性。

```js
// composables/useStorage.js
import { ref, watch } from 'vue';

/**
 * 本地存储管理组合函数
 * @param {string} key 存储键名
 * @param {any} defaultValue 默认值
 * @param {Storage} storage 存储对象(默认localStorage)
 * @returns {Object} 响应式值和操作方法
 */
export function useStorage(key, defaultValue, storage = localStorage) {
  // 尝试从存储中读取初始值
  const storedValue = storage.getItem(key);
  // 创建响应式引用
  const value = ref(
    storedValue !== null 
      ? JSON.parse(storedValue) 
      : defaultValue
  );
  
  // 监听值变化，自动更新存储
  watch(value, (newVal) => {
    if (newVal === null || newVal === undefined) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(newVal));
    }
  }, { deep: true });
  
  // 提供重置和手动移除方法
  function reset() {
    value.value = defaultValue;
  }
  
  function remove() {
    value.value = null;
    storage.removeItem(key);
  }
  
  return {
    value,
    reset,
    remove
  };
}
```

使用示例：

```vue
<script setup>
import { useStorage } from '@/composables/useStorage';

// 持久化主题
const { value: theme } = useStorage('theme', 'light');

// 持久化用户设置
const { value: settings, reset: resetSettings } = useStorage('user-settings', {
  notifications: true,
  fontSize: 'medium'
});

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
</script>

<template>
  <div :class="theme">
    <button @click="toggleTheme">切换主题</button>
    <div>
      <h3>设置</h3>
      <label>
        <input 
          type="checkbox" 
          v-model="settings.notifications" 
        /> 启用通知
      </label>
      <select v-model="settings.fontSize">
        <option value="small">小号</option>
        <option value="medium">中号</option>
        <option value="large">大号</option>
      </select>
      <button @click="resetSettings">重置设置</button>
    </div>
  </div>
</template>
```

## 状态管理模式

随着应用规模的增长，状态管理变得越来越重要。在Vue 3中，组合式API为状态管理提供了新的可能性。

### 本地状态管理

对于简单应用，组件内部状态管理是最直接的方式：

```vue
<script setup>
import { reactive } from 'vue';

// 本地状态管理
const state = reactive({
  todos: [],
  filter: 'all'
});

function addTodo(text) {
  state.todos.push({
    id: Date.now(),
    text,
    completed: false
  });
}

function toggleTodo(id) {
  const todo = state.todos.find(todo => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
}

function removeTodo(id) {
  const index = state.todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    state.todos.splice(index, 1);
  }
}
</script>
```

### 使用provide/inject共享状态

对于跨组件但范围有限的状态共享，`provide`和`inject`提供了一种简洁的解决方案：

```js
// composables/useTodoState.js
import { reactive, provide, inject } from 'vue';

const TodoKey = Symbol('todo-state');

/**
 * 创建并提供Todo状态
 * @returns {Object} Todo状态和操作方法
 */
export function createTodoState() {
  // 创建响应式状态
  const state = reactive({
    todos: [],
    filter: 'all'
  });
  
  // 添加Todo
  function addTodo(text) {
    state.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
  }
  
  // 切换Todo完成状态
  function toggleTodo(id) {
    const todo = state.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }
  
  // 删除Todo
  function removeTodo(id) {
    const index = state.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      state.todos.splice(index, 1);
    }
  }
  
  const todoState = {
    state,
    addTodo,
    toggleTodo,
    removeTodo
  };
  
  // 提供给后代组件
  provide(TodoKey, todoState);
  
  return todoState;
}

/**
 * 在后代组件中使用Todo状态
 * @returns {Object} Todo状态和操作方法
 */
export function useTodoState() {
  const todoState = inject(TodoKey);
  if (!todoState) {
    throw new Error('useTodoState必须在createTodoState提供的上下文中使用');
  }
  
  return todoState;
}
```

使用示例：

```vue
<!-- App.vue -->
<script setup>
import { createTodoState } from './composables/useTodoState';
import TodoList from './components/TodoList.vue';
import TodoForm from './components/TodoForm.vue';
import TodoFilter from './components/TodoFilter.vue';

// 在根组件创建状态并提供给后代组件
createTodoState();
</script>

<template>
  <div>
    <h1>Todo应用</h1>
    <TodoForm />
    <TodoFilter />
    <TodoList />
  </div>
</template>

<!-- TodoList.vue -->
<script setup>
import { useTodoState } from '../composables/useTodoState';

// 注入状态和方法
const { filteredTodos, toggleTodo, removeTodo } = useTodoState();
</script>

<template>
  <ul>
    <li v-for="todo in filteredTodos" :key="todo.id">
      <input 
        type="checkbox" 
        :checked="todo.completed" 
        @change="toggleTodo(todo.id)" 
      />
      <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
      <button @click="removeTodo(todo.id)">删除</button>
    </li>
  </ul>
</template>
```

### 可组合的全局状态

对于复杂应用，可以创建更强大的状态管理解决方案，结合Pinia或自定义方案：

```js
// stores/useUserStore.js
import { reactive, readonly } from 'vue';
import { useFetch } from '../composables/useFetch';

// 创建单例状态
const state = reactive({
  user: null,
  isLoggedIn: false,
  permissions: []
});

/**
 * 用户状态存储
 * @returns {Object} 用户状态和操作方法
 */
export function useUserStore() {
  const { execute: fetchUser, loading: isLoading } = useFetch(async () => {
    const response = await fetch('/api/user');
    const data = await response.json();
    state.user = data;
    state.isLoggedIn = true;
    state.permissions = data.permissions || [];
  });
  
  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('登录失败');
    }
    
    return fetchUser();
  }
  
  function logout() {
    state.user = null;
    state.isLoggedIn = false;
    state.permissions = [];
    // ... 可能还需要调用API
  }
  
  function hasPermission(permission) {
    return state.permissions.includes(permission);
  }
  
  // 返回只读状态，防止直接修改
  return {
    // 状态 - 只读
    state: readonly(state),
    // 加载状态
    isLoading,
    // 方法
    login,
    logout,
    refreshUser: fetchUser,
    hasPermission
  };
}
```

使用示例：

```vue
<script setup>
import { useUserStore } from '@/stores/useUserStore';
import { ref } from 'vue';

const { state, login, logout, isLoading } = useUserStore();
const username = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await login({ username: username.value, password: password.value });
    username.value = '';
    password.value = '';
  } catch (error) {
    alert(error.message);
  }
}
</script>

<template>
  <div>
    <div v-if="state.isLoggedIn">
      <p>欢迎, {{ state.user.name }}</p>
      <button @click="logout">退出登录</button>
    </div>
    <form v-else @submit.prevent="handleLogin">
      <h2>用户登录</h2>
      <div>
        <label for="username">用户名:</label>
        <input 
          id="username"
          v-model="username" 
          type="text" 
          required 
        />
      </div>
      <div>
        <label for="password">密码:</label>
        <input 
          id="password"
          v-model="password" 
          type="password" 
          required 
        />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>
```

## 组件通信模式

Vue 3组合式API提供了多种组件间通信的方式，可以根据场景选择最合适的方式。

### Props和Emits

最基本的组件通信方式是通过props向下传递数据，通过emits向上发送事件：

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const message = ref('从父组件传递的消息');
function handleChildEvent(data) {
  console.log('子组件事件:', data);
}
</script>

<template>
  <ChildComponent 
    :message="message" 
    @child-event="handleChildEvent" 
  />
</template>

<!-- 子组件 ChildComponent.vue -->
<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['child-event']);

function sendToParent() {
  emit('child-event', { text: '子组件发送的数据' });
}
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <button @click="sendToParent">发送事件到父组件</button>
  </div>
</template>
```

### v-model与组件双向绑定

使用`v-model`可以实现父子组件间的双向绑定：

```vue
<!-- 父组件 -->
<script setup>
import { ref } from 'vue';
import CustomInput from './CustomInput.vue';

const username = ref('');
</script>

<template>
  <div>
    <p>用户名: {{ username }}</p>
    <CustomInput v-model="username" />
  </div>
</template>

<!-- 子组件 CustomInput.vue -->
<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

function updateValue(e) {
  emit('update:modelValue', e.target.value);
}
</script>

<template>
  <input 
    :value="modelValue" 
    @input="updateValue" 
    class="custom-input" 
  />
</template>
```

### 多个v-model绑定

Vue 3支持在一个组件上使用多个`v-model`，实现多个属性的双向绑定：

```vue
<!-- 父组件 -->
<script setup>
import { reactive } from 'vue';
import UserForm from './UserForm.vue';

const userData = reactive({
  name: '',
  email: ''
});
</script>

<template>
  <div>
    <UserForm
      v-model:name="userData.name"
      v-model:email="userData.email"
    />
    <div>
      <p>名称: {{ userData.name }}</p>
      <p>邮箱: {{ userData.email }}</p>
    </div>
  </div>
</template>

<!-- 子组件 UserForm.vue -->
<script setup>
const props = defineProps({
  name: String,
  email: String
});

const emit = defineEmits(['update:name', 'update:email']);
</script>

<template>
  <form>
    <div>
      <label>名称:</label>
      <input 
        :value="name" 
        @input="e => emit('update:name', e.target.value)" 
      />
    </div>
    <div>
      <label>邮箱:</label>
      <input 
        :value="email" 
        @input="e => emit('update:email', e.target.value)" 
      />
    </div>
  </form>
</template>
```

### 使用provide/inject进行深层通信

当组件层级较深时，使用`provide`/`inject`可以避免"prop drilling"问题：

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue';

const theme = ref('light');
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

// 提供给后代组件
provide('theme', {
  theme,
  toggleTheme
});
</script>

<!-- 深层次子组件 -->
<script setup>
import { inject } from 'vue';

// 注入祖先组件提供的值
const { theme, toggleTheme } = inject('theme');
</script>

<template>
  <div :class="theme">
    <button @click="toggleTheme">
      切换到{{ theme === 'light' ? '深色' : '浅色' }}主题
    </button>
  </div>
</template>
```

### 组合式函数间通信

组合式函数可以通过共享状态或回调进行通信：

```js
// composables/useTheme.js
import { ref, readonly } from 'vue';

// 创建共享状态
const theme = ref('light');

/**
 * 主题管理组合函数
 * @returns {Object} 主题状态和切换方法
 */
export function useTheme() {
  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    // 应用主题到文档
    document.documentElement.setAttribute('data-theme', theme.value);
  }
  
  // 设置特定主题
  function setTheme(newTheme) {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme;
      document.documentElement.setAttribute('data-theme', theme.value);
    }
  }
  
  return {
    // 只读主题，防止直接修改
    theme: readonly(theme),
    toggleTheme,
    setTheme
  };
}

// composables/useDarkMode.js
import { useTheme } from './useTheme';
import { usePreferredDark } from '@vueuse/core';
import { watch } from 'vue';

/**
 * 深色模式组合函数
 * @param {boolean} autoDetect 是否自动检测系统偏好
 * @returns {Object} 深色模式状态和方法
 */
export function useDarkMode(autoDetect = true) {
  const { theme, setTheme } = useTheme();
  const prefersDark = usePreferredDark();
  
  // 如果开启自动检测，监听系统主题变化
  if (autoDetect) {
    watch(prefersDark, (isDark) => {
      setTheme(isDark ? 'dark' : 'light');
    }, { immediate: true });
  }
  
  // 计算当前是否为深色模式
  const isDarkMode = computed(() => theme.value === 'dark');
  
  return {
    isDarkMode,
    toggleDarkMode: () => setTheme(isDarkMode.value ? 'light' : 'dark'),
    enableDarkMode: () => setTheme('dark'),
    disableDarkMode: () => setTheme('light')
  };
}
```

使用示例：

```vue
<script setup>
import { useTheme } from '@/composables/useTheme';
import { useDarkMode } from '@/composables/useDarkMode';

// 直接使用主题
const { theme, toggleTheme } = useTheme();

// 使用深色模式
const { isDarkMode, toggleDarkMode } = useDarkMode(true);
</script>

<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <button @click="toggleTheme">切换主题</button>
    
    <p>是否深色模式: {{ isDarkMode }}</p>
    <button @click="toggleDarkMode">切换深色模式</button>
  </div>
</template>
```

## 生命周期管理模式

组合式API提供了一系列生命周期钩子函数，用于在组件生命周期的不同阶段执行代码。了解这些钩子的使用模式对于资源管理和性能优化至关重要。

### 基本生命周期钩子使用

在组合式API中，生命周期钩子被转换为可以在`setup`函数或`<script setup>`中使用的独立函数：

```vue
<script setup>
import { 
  onMounted, 
  onBeforeMount, 
  onBeforeUpdate, 
  onUpdated, 
  onBeforeUnmount, 
  onUnmounted, 
  onErrorCaptured 
} from 'vue';

// 组件被挂载前
onBeforeMount(() => {
  console.log('组件挂载前');
});

// 组件挂载完成
onMounted(() => {
  console.log('组件已挂载');
  fetchUserData();
});

// 组件更新前
onBeforeUpdate(() => {
  console.log('组件更新前');
});

// 组件更新后
onUpdated(() => {
  console.log('组件已更新');
});

// 组件卸载前
onBeforeUnmount(() => {
  console.log('组件卸载前');
  // 清理资源
  clearInterval(timer);
});

// 组件卸载后
onUnmounted(() => {
  console.log('组件已卸载');
});

// 捕获后代组件错误
onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err);
  console.log('来源组件:', instance);
  console.log('错误信息:', info);
  
  // 返回false可以阻止错误继续向上冒泡
  return false;
});

// 示例计时器
let timer = null;
function startTimer() {
  timer = setInterval(() => {
    console.log('计时器运行中');
  }, 1000);
}

function fetchUserData() {
  // 模拟数据获取
}

// 组件挂载后启动计时器
onMounted(startTimer);
</script>
```

### 资源注册和清理模式

在组件卸载时正确清理资源是避免内存泄漏的关键：

```js
// composables/useEventListener.js
import { onMounted, onBeforeUnmount } from 'vue';

/**
 * 事件监听器组合函数
 * @param {string|Window|Document|HTMLElement} target 目标元素或选择器
 * @param {string} event 事件名称
 * @param {Function} handler 事件处理函数
 * @param {Object} options 事件选项
 */
export function useEventListener(target, event, handler, options = {}) {
  // 处理目标可能是选择器字符串的情况
  let element;
  
  onMounted(() => {
    // 处理不同类型的目标
    if (typeof target === 'string') {
      element = document.querySelector(target);
    } else {
      element = target || window;
    }
    
    if (!element) {
      console.warn(`找不到目标元素: ${target}`);
      return;
    }
    
    // 添加事件监听器
    element.addEventListener(event, handler, options);
  });
  
  // 在组件卸载前清理事件监听器
  onBeforeUnmount(() => {
    if (element) {
      element.removeEventListener(event, handler, options);
    }
  });
}
```

使用示例：

```vue
<script setup>
import { ref } from 'vue';
import { useEventListener } from '@/composables/useEventListener';

const mousePosition = ref({ x: 0, y: 0 });

// 跟踪鼠标位置
function updateMousePosition(event) {
  mousePosition.value.x = event.clientX;
  mousePosition.value.y = event.clientY;
}

// 监听全局鼠标移动事件
// 当组件卸载时，事件监听器会自动被移除
useEventListener(window, 'mousemove', updateMousePosition);

// 监听按钮点击
useEventListener('#myButton', 'click', () => {
  alert('按钮被点击了');
});
</script>

<template>
  <div>
    <p>鼠标位置: {{ mousePosition.x }}, {{ mousePosition.y }}</p>
    <button id="myButton">点击我</button>
  </div>
</template>
```

### 条件生命周期

通过条件语句动态应用生命周期钩子：

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const enableTracking = ref(false);
let trackingInterval = null;

// 条件生命周期管理
watch(enableTracking, (enabled) => {
  if (enabled) {
    // 启动追踪
    startTracking();
  } else if (trackingInterval) {
    // 停止追踪
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
});

function startTracking() {
  trackingInterval = setInterval(() => {
    console.log('追踪数据...');
  }, 1000);
}

// 确保组件卸载时清理资源
onUnmounted(() => {
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
});
</script>

<template>
  <div>
    <label>
      <input type="checkbox" v-model="enableTracking" />
      启用数据追踪
    </label>
  </div>
</template>
```

### 组合函数中的生命周期合并

在不同组合函数中使用相同的生命周期钩子时，所有钩子都会保留并按声明顺序执行：

```js
// composables/usePageView.js
import { onMounted, onUnmounted } from 'vue';

/**
 * 页面访问追踪组合函数
 * @param {string} pageName 页面名称
 */
export function usePageView(pageName) {
  onMounted(() => {
    console.log(`页面[${pageName}]访问开始`);
    recordPageView(pageName);
  });
  
  onUnmounted(() => {
    console.log(`页面[${pageName}]访问结束`);
    recordPageExit(pageName);
  });
  
  function recordPageView(page) {
    // 发送统计请求
  }
  
  function recordPageExit(page) {
    // 记录退出时间
  }
}

// composables/usePerformanceMonitor.js
import { onMounted, onUpdated } from 'vue';

/**
 * 性能监控组合函数
 */
export function usePerformanceMonitor() {
  let startTime = 0;
  
  onMounted(() => {
    startTime = performance.now();
    console.log('开始性能监控');
  });
  
  onUpdated(() => {
    const duration = performance.now() - startTime;
    console.log(`组件更新耗时: ${duration.toFixed(2)}ms`);
  });
}
```

使用示例：

```vue
<script setup>
import { usePageView } from '@/composables/usePageView';
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor';

// 所有的生命周期钩子都会被保留
usePageView('用户档案');
usePerformanceMonitor();

// 这里的onMounted会在上面两个组合函数的onMounted之后执行
onMounted(() => {
  console.log('组件自身的onMounted');
});
</script>
```

### 生命周期依赖注入

通过依赖注入进行特定上下文的生命周期管理：

```js
// plugins/lifecycle.js
import { provide, inject, onMounted, onBeforeUnmount } from 'vue';

const LifecycleSymbol = Symbol('lifecycle');

/**
 * 创建生命周期上下文
 * @returns {Object} 生命周期上下文对象
 */
export function createLifecycleContext() {
  const handlers = {
    mounted: [],
    beforeUnmount: []
  };
  
  // 注册生命周期回调
  function registerMounted(fn) {
    handlers.mounted.push(fn);
    return () => {
      const index = handlers.mounted.indexOf(fn);
      if (index !== -1) handlers.mounted.splice(index, 1);
    };
  }
  
  function registerBeforeUnmount(fn) {
    handlers.beforeUnmount.push(fn);
    return () => {
      const index = handlers.beforeUnmount.indexOf(fn);
      if (index !== -1) handlers.beforeUnmount.splice(index, 1);
    };
  }
  
  // 执行所有已注册的回调
  onMounted(() => {
    handlers.mounted.forEach(fn => fn());
  });
  
  onBeforeUnmount(() => {
    handlers.beforeUnmount.forEach(fn => fn());
  });
  
  const context = {
    registerMounted,
    registerBeforeUnmount
  };
  
  provide(LifecycleSymbol, context);
  
  return context;
}

/**
 * 使用生命周期上下文
 * @returns {Object} 生命周期上下文对象
 */
export function useLifecycle() {
  const context = inject(LifecycleSymbol);
  if (!context) {
    throw new Error('useLifecycle必须在createLifecycleContext提供的上下文中使用');
  }
  
  return context;
}
```

使用示例：

```vue
<!-- 根组件 -->
<script setup>
import { createLifecycleContext } from './plugins/lifecycle';
import ChildComponent from './ChildComponent.vue';

// 创建生命周期上下文
createLifecycleContext();
</script>

<!-- 子组件 -->
<script setup>
import { useLifecycle } from '../plugins/lifecycle';

const { registerMounted, registerBeforeUnmount } = useLifecycle();

// 注册到父组件的生命周期
registerMounted(() => {
  console.log('子组件已准备就绪');
});

registerBeforeUnmount(() => {
  console.log('子组件即将卸载');
});
</script>
```

## 异步操作模式

在Vue组件中，异步操作是常见的场景，包括数据加载、表单提交等。组合式API提供了多种处理异步的模式。

### 基础异步加载模式

使用`ref`和`reactive`管理异步加载状态：

```vue
<script setup>
import { ref } from 'vue';

const users = ref([]);
const loading = ref(false);
const error = ref(null);

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('获取用户数据失败');
    }
    
    users.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// 组件挂载后加载数据
onMounted(fetchUsers);
</script>

<template>
  <div>
    <button @click="fetchUsers" :disabled="loading">
      刷新用户列表
    </button>
    
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>
```

### 异步组合函数

将异步逻辑封装到可重用的组合函数中：

```js
// composables/useAsync.js
import { ref, shallowRef } from 'vue';

/**
 * 通用异步操作管理
 * @param {Function} asyncFunction 异步函数
 * @param {Object} options 配置选项
 * @returns {Object} 异步状态和执行方法
 */
export function useAsync(asyncFunction, options = {}) {
  const {
    immediate = false,
    initialData = null,
    onSuccess = null,
    onError = null
  } = options;
  
  const data = shallowRef(initialData);
  const loading = ref(false);
  const error = ref(null);
  
  // 保存最新执行的承诺，用于处理竞态条件
  let latestPromise = null;
  
  async function execute(...args) {
    loading.value = true;
    error.value = null;
    
    // 创建当前执行的承诺标识
    const currentPromise = latestPromise = Symbol('promise');
    
    try {
      const result = await asyncFunction(...args);
      
      // 检查这是否是最新的承诺
      if (currentPromise === latestPromise) {
        data.value = result;
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      // 检查这是否是最新的承诺
      if (currentPromise === latestPromise) {
        error.value = err;
        if (onError) {
          onError(err);
        }
      }
      
      throw err;
    } finally {
      // 检查这是否是最新的承诺
      if (currentPromise === latestPromise) {
        loading.value = false;
      }
    }
  }
  
  // 如果配置为立即执行，则自动开始
  if (immediate) {
    execute();
  }
  
  // 返回只读响应式状态与方法
  return {
    data,
    loading,
    error,
    execute
  };
}
```

使用示例：

```vue
<script setup>
import { useAsync } from '@/composables/useAsync';

// 定义API调用函数
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('获取用户数据失败');
  }
  return response.json();
}

// 使用异步组合函数
const { 
  data: userData, 
  loading, 
  error, 
  execute: loadUser 
} = useAsync(fetchUserData, {
  immediate: false,
  onSuccess: (data) => console.log('加载成功', data),
  onError: (err) => console.error('加载失败', err)
});

// 加载特定用户数据
function loadUserProfile(id) {
  loadUser(id).catch(e => {
    // 异常已经被useAsync处理，这里可以添加额外处理
  });
}

// 组件挂载后加载默认用户
onMounted(() => {
  loadUserProfile(1);
});
</script>

<template>
  <div>
    <div v-if="loading">加载用户资料中...</div>
    <div v-else-if="error">加载失败: {{ error.message }}</div>
    <div v-else-if="userData">
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.email }}</p>
    </div>
    <button @click="loadUserProfile(1)" :disabled="loading">
      加载用户1
    </button>
    <button @click="loadUserProfile(2)" :disabled="loading">
      加载用户2
    </button>
  </div>
</template>
```

### 异步组件加载

通过`defineAsyncComponent`懒加载组件：

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue';

// 基本异步组件
const AsyncComponent = defineAsyncComponent(() => 
  import('./HeavyComponent.vue')
);

// 带加载和错误状态的异步组件
const AsyncComponentWithLoading = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: () => import('./LoadingComponent.vue'),
  errorComponent: () => import('./ErrorComponent.vue'),
  delay: 200,      // 显示加载组件前的延迟
  timeout: 10000,  // 超时时间
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      // 重试
      retry();
    } else {
      // 放弃重试
      fail();
    }
  }
});

// 控制异步组件显示
const showHeavyComponent = ref(false);
</script>

<template>
  <div>
    <button @click="showHeavyComponent = !showHeavyComponent">
      {{ showHeavyComponent ? '隐藏' : '显示' }}重型组件
    </button>
    
    <AsyncComponentWithLoading v-if="showHeavyComponent" />
  </div>
</template>
```

### 异步状态共享

使用组合函数在多个组件间共享异步状态：

```js
// composables/useProducts.js
import { ref, computed, readonly } from 'vue';
import { useAsync } from './useAsync';

// 创建单例状态
const products = ref([]);
const productCategories = ref([]);
const isInitialized = ref(false);

/**
 * 商品数据管理组合函数
 * @returns {Object} 商品数据和操作方法
 */
export function useProducts() {
  // 初始化数据加载
  async function fetchInitialData() {
    if (isInitialized.value) return;
    
    await Promise.all([
      fetchAllProducts(),
      fetchCategories()
    ]);
    
    isInitialized.value = true;
  }
  
  // 获取所有商品
  const {
    loading: loadingProducts,
    error: productsError,
    execute: fetchAllProducts
  } = useAsync(async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    products.value = data;
    return data;
  });
  
  // 获取所有分类
  const {
    loading: loadingCategories,
    error: categoriesError,
    execute: fetchCategories
  } = useAsync(async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    productCategories.value = data;
    return data;
  });
  
  // 计算属性：按分类过滤商品
  function productsByCategory(categoryId) {
    return computed(() => 
      products.value.filter(p => p.categoryId === categoryId)
    );
  }
  
  // 计算整体加载状态
  const isLoading = computed(() => 
    loadingProducts.value || loadingCategories.value
  );
  
  // 计算是否有错误
  const hasError = computed(() => 
    !!productsError.value || !!categoriesError.value
  );
  
  // 清除产品数据（例如用户退出登录时）
  function clearProducts() {
    products.value = [];
    isInitialized.value = false;
  }
  
  return {
    // 状态
    products: readonly(products),
    categories: readonly(productCategories),
    isLoading,
    hasError,
    isInitialized: readonly(isInitialized),
    // 方法
    fetchInitialData,
    refreshProducts: fetchAllProducts,
    refreshCategories: fetchCategories,
    productsByCategory,
    clearProducts
  };
}
```

使用示例：

```vue
<!-- ProductList.vue -->
<script setup>
import { useProducts } from '@/composables/useProducts';
import { onMounted } from 'vue';

// 获取商品状态和方法
const { 
  products, 
  categories, 
  isLoading, 
  hasError, 
  isInitialized,
  fetchInitialData,
  productsByCategory
} = useProducts();

// 组件挂载时初始化数据
onMounted(async () => {
  if (!isInitialized.value) {
    await fetchInitialData();
  }
});

// 按分类ID获取产品列表
const electronicsProducts = productsByCategory(1);
</script>

<template>
  <div>
    <div v-if="isLoading">加载商品数据中...</div>
    <div v-else-if="hasError">加载商品数据失败</div>
    <div v-else>
      <h2>所有商品 ({{ products.length }})</h2>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }} - ¥{{ product.price }}
        </li>
      </ul>
      
      <h2>电子产品</h2>
      <ul>
        <li v-for="product in electronicsProducts" :key="product.id">
          {{ product.name }} - ¥{{ product.price }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

### 结合异步与状态管理

通过组合函数创建具有异步操作能力的状态管理：

```js
// stores/useAuthStore.js
import { reactive, readonly, computed } from 'vue';
import { useAsync } from '../composables/useAsync';

// 创建响应式状态
const state = reactive({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoggedIn: !!localStorage.getItem('auth_token')
});

/**
 * 身份验证状态管理
 * @returns {Object} 身份验证状态和方法
 */
export function useAuthStore() {
  // 登录操作
  const {
    loading: isLoggingIn,
    error: loginError,
    execute: performLogin
  } = useAsync(async (credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '登录失败');
    }
    
    const { user, token } = await response.json();
    
    // 更新状态
    state.user = user;
    state.token = token;
    state.isLoggedIn = true;
    
    // 存储令牌
    localStorage.setItem('auth_token', token);
    
    return user;
  });
  
  // 注销
  const {
    loading: isLoggingOut,
    error: logoutError,
    execute: performLogout
  } = useAsync(async () => {
    if (state.token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });
      } catch (error) {
        console.error('注销请求失败，但仍将清除本地状态', error);
      }
    }
    
    // 清除状态
    state.user = null;
    state.token = null;
    state.isLoggedIn = false;
    
    // 移除令牌
    localStorage.removeItem('auth_token');
  });
  
  // 加载用户资料
  const {
    loading: isLoadingProfile,
    error: profileError,
    execute: fetchUserProfile
  } = useAsync(async () => {
    if (!state.token) {
      throw new Error('未授权');
    }
    
    const response = await fetch('/api/me', {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // 令牌无效，清除状态
        await performLogout();
        throw new Error('会话已过期，请重新登录');
      }
      throw new Error('获取用户资料失败');
    }
    
    const user = await response.json();
    state.user = user;
    
    return user;
  });
  
  // 登录方法
  async function login(username, password) {
    return performLogin({ username, password });
  }
  
  // 注销方法
  async function logout() {
    return performLogout();
  }
  
  // 初始化方法：如果有令牌则加载用户资料
  async function initialize() {
    if (state.token && !state.user) {
      try {
        await fetchUserProfile();
      } catch (error) {
        // 如果加载资料失败，清除无效令牌
        await performLogout();
      }
    }
  }
  
  // 计算总体加载状态
  const isLoading = computed(() => 
    isLoggingIn.value || isLoggingOut.value || isLoadingProfile.value
  );
  
  // 合并错误信息
  const error = computed(() => 
    loginError.value || logoutError.value || profileError.value
  );
  
  return {
    // 状态 - 只读
    state: readonly(state),
    isLoading,
    error,
    // 方法
    login,
    logout,
    initialize,
    refreshProfile: fetchUserProfile
  };
}
```

使用示例：

```vue
<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { onMounted, ref } from 'vue';

const { state, isLoading, error, login, logout, initialize } = useAuthStore();

// 登录表单数据
const username = ref('');
const password = ref('');

// 处理登录提交
async function handleLogin() {
  try {
    await login(username.value, password.value);
    username.value = '';
    password.value = '';
  } catch (error) {
    // 错误已在状态中处理
  }
}

// 处理注销
async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    // 错误已在状态中处理
  }
}

// 组件挂载时初始化认证状态
onMounted(initialize);
</script>

<template>
  <div>
    <div v-if="isLoading">处理中...</div>
    <div v-else-if="error" class="error">{{ error.message }}</div>
    
    <div v-if="state.isLoggedIn">
      <h2>欢迎, {{ state.user?.name }}</h2>
      <button @click="handleLogout" :disabled="isLoading">
        退出登录
      </button>
    </div>
    <form v-else @submit.prevent="handleLogin">
      <h2>用户登录</h2>
      <div>
        <label for="username">用户名:</label>
        <input 
          id="username"
          v-model="username" 
          type="text" 
          required 
        />
      </div>
      <div>
        <label for="password">密码:</label>
        <input 
          id="password"
          v-model="password" 
          type="password" 
          required 
        />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>
```

## 组合函数设计模式

组合函数是Vue 3组合式API中逻辑复用的主要方式。以下是一些常见的组合函数设计模式。

### 单一职责模式

组合函数应遵循单一职责原则，每个函数只负责一个明确的功能：

```js
// 不好的示例：一个组合函数做太多事情
function useUserDashboard() {
  // 获取用户资料
  // 处理认证
  // 管理表单状态
  // 处理路由导航
  // ...太多职责
}

// 好的示例：拆分为多个单一职责的组合函数
function useUserProfile() { /* 专注于用户资料 */ }
function useAuthentication() { /* 专注于认证 */ }
function useUserForm() { /* 专注于表单管理 */ }
function useNavigation() { /* 专注于导航 */ }
```

### 参数化设计模式

通过参数使组合函数更灵活：

```js
// composables/useTimeoutFn.js
import { ref } from 'vue';

/**
 * 延迟执行函数的组合函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间(毫秒)
 * @returns {Object} 包含执行和取消方法的对象
 */
export function useTimeoutFn(fn, delay = 1000) {
  const isPending = ref(false);
  let timer = null;
  
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      isPending.value = false;
    }
  }
  
  function execute(...args) {
    clear();
    isPending.value = true;
    
    timer = setTimeout(() => {
      fn(...args);
      isPending.value = false;
      timer = null;
    }, delay);
  }
  
  // 组件卸载时自动清理
  onBeforeUnmount(clear);
  
  return {
    isPending,
    execute,
    clear
  };
}
```

使用示例：

```vue
<script setup>
import { ref } from 'vue';
import { useTimeoutFn } from '@/composables/useTimeoutFn';

const message = ref('');

// 创建延迟保存功能
const { isPending, execute: saveWithDelay } = useTimeoutFn(() => {
  saveToAPI(message.value);
}, 500);

function saveToAPI(text) {
  console.log('保存到API:', text);
}

// 文本变化时延迟保存
function handleInput(e) {
  message.value = e.target.value;
  saveWithDelay(); // 自动防抖
}
</script>

<template>
  <div>
    <input 
      type="text" 
      :value="message" 
      @input="handleInput" 
      placeholder="输入文本..." 
    />
    <span v-if="isPending">正在保存...</span>
  </div>
</template>
```

### 可组合的副作用清理模式

利用生命周期钩子和返回清理函数实现资源自动清理：

```js
// composables/useInterval.js
import { ref, onBeforeUnmount } from 'vue';

/**
 * 定时执行函数的组合函数
 * @param {Function} fn 要执行的函数
 * @param {number} interval 间隔时间(毫秒)
 * @param {boolean} immediate 是否立即执行一次
 * @returns {Object} 包含控制方法的对象
 */
export function useInterval(fn, interval = 1000, immediate = false) {
  const isRunning = ref(false);
  let timer = null;
  
  function clean() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isRunning.value = false;
  }
  
  function start() {
    if (isRunning.value) return;
    
    isRunning.value = true;
    if (immediate) fn();
    
    timer = setInterval(fn, interval);
  }
  
  function stop() {
    clean();
  }
  
  function restart() {
    stop();
    start();
  }
  
  // 组件卸载时自动清理
  onBeforeUnmount(clean);
  
  return {
    isRunning,
    start,
    stop,
    restart
  };
}
```

使用示例：

```vue
<script setup>
import { ref } from 'vue';
import { useInterval } from '@/composables/useInterval';

const count = ref(0);

// 计数器功能
const { isRunning, start, stop } = useInterval(() => {
  count.value++;
}, 1000);

// 默认不自动启动
</script>

<template>
  <div>
    <p>计数: {{ count }}</p>
    <button @click="start" :disabled="isRunning">开始</button>
    <button @click="stop" :disabled="!isRunning">停止</button>
  </div>
</template>
```

### 工厂模式

使用工厂函数为每个组件实例创建独立的状态：

```js
// composables/createCounter.js
import { ref } from 'vue';

/**
 * 创建独立计数器的工厂函数
 * @param {number} initialValue 初始值
 * @returns {Object} 计数器对象
 */
export function createCounter(initialValue = 0) {
  // 每次调用都创建新的状态
  const count = ref(initialValue);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  function reset() {
    count.value = initialValue;
  }
  
  return {
    count,
    increment,
    decrement,
    reset
  };
}
```

使用示例：

```vue
<script setup>
import { createCounter } from '@/composables/createCounter';

// 创建两个独立的计数器实例
const counter1 = createCounter(0);
const counter2 = createCounter(10);

// counter1和counter2拥有各自独立的状态
</script>

<template>
  <div>
    <div>
      <p>计数器1: {{ counter1.count }}</p>
      <button @click="counter1.increment">+</button>
      <button @click="counter1.decrement">-</button>
    </div>
    <div>
      <p>计数器2: {{ counter2.count }}</p>
      <button @click="counter2.increment">+</button>
      <button @click="counter2.decrement">-</button>
    </div>
  </div>
</template>
```

### 适配器模式

创建适配器组合函数统一不同API的接口：

```js
// composables/useStorage.js
import { ref, watch } from 'vue';

/**
 * 存储适配器组合函数
 * @param {string} key 存储键名
 * @param {any} defaultValue 默认值
 * @param {Object} options 选项
 * @returns {Object} 包含存储值和方法的对象
 */
export function useStorage(key, defaultValue, options = {}) {
  const {
    storage = localStorage, // 默认使用localStorage
    serializer = JSON,      // 默认使用JSON序列化
    deep = true             // 深度监听
  } = options;
  
  // 从存储中读取初始值
  const rawValue = storage.getItem(key);
  const value = ref(
    rawValue ? serializer.parse(rawValue) : defaultValue
  );
  
  // 监听值变化，同步到存储
  watch(value, (newValue) => {
    if (newValue === null || newValue === undefined) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, serializer.stringify(newValue));
    }
  }, { deep });
  
  return {
    value,
    clear: () => storage.removeItem(key)
  };
}

/**
 * localStorage适配器组合函数
 */
export function useLocalStorage(key, defaultValue) {
  return useStorage(key, defaultValue, { storage: localStorage });
}

/**
 * sessionStorage适配器组合函数
 */
export function useSessionStorage(key, defaultValue) {
  return useStorage(key, defaultValue, { storage: sessionStorage });
}

/**
 * 自定义存储适配器
 * @param {Object} customStorage 自定义存储对象
 * @returns {Function} 存储组合函数
 */
export function createStorageAdapter(customStorage) {
  return (key, defaultValue, options = {}) => {
    return useStorage(key, defaultValue, {
      ...options,
      storage: customStorage
    });
  };
}
```

使用示例：

```vue
<script setup>
import { useLocalStorage, useSessionStorage } from '@/composables/useStorage';

// 使用localStorage
const { value: theme } = useLocalStorage('theme', 'light');
// 使用sessionStorage
const { value: userData } = useSessionStorage('user-data', { name: '' });

function updateUserName(name) {
  userData.value.name = name;
  // 自动保存到sessionStorage
}
</script>
```

### 抽象核心逻辑模式

创建核心逻辑组合函数，然后在其基础上构建更高级的组合函数：

```js
// 核心的HTTP请求组合函数
function useHttp() {
  // 核心HTTP逻辑
  
  return {
    get, post, put, delete: del
    // 其他功能
  };
}

// 构建在核心功能之上的更高级组合函数
function useUsers() {
  const http = useHttp();
  
  return {
    getUser: (id) => http.get(`/users/${id}`),
    createUser: (data) => http.post('/users', data),
    // 特定领域的方法
  };
}

function useProducts() {
  const http = useHttp();
  
  return {
    getProducts: () => http.get('/products'),
    // 其他产品相关方法
  };
}
```

### 插件式设计模式

设计可扩展的组合函数，支持插件或中间件机制：

```js
// composables/createStore.js
import { reactive, readonly } from 'vue';

/**
 * 创建简单状态存储的工厂函数
 * @param {Object} options 选项配置
 * @returns {Object} 状态存储对象
 */
export function createStore(options = {}) {
  // 初始状态
  const state = reactive(options.state || {});
  
  // 中间件列表
  const middlewares = [];
  
  // 添加中间件
  function use(middleware) {
    if (typeof middleware === 'function') {
      middlewares.push(middleware);
    }
    return store; // 链式调用
  }
  
  // 修改状态的方法
  function commit(action, payload) {
    if (!options.mutations || !options.mutations[action]) {
      console.warn(`未知的mutation: ${action}`);
      return;
    }
    
    // 执行所有前置中间件
    for (const middleware of middlewares) {
      if (middleware.before) {
        middleware.before(action, payload, state);
      }
    }
    
    // 执行状态变更
    options.mutations[action](state, payload);
    
    // 执行所有后置中间件
    for (const middleware of middlewares) {
      if (middleware.after) {
        middleware.after(action, payload, state);
      }
    }
  }
  
  // 构建store对象
  const store = {
    state: readonly(state),
    commit,
    use
  };
  
  // 添加getter
  if (options.getters) {
    for (const [key, getter] of Object.entries(options.getters)) {
      Object.defineProperty(store, key, {
        get: () => getter(state)
      });
    }
  }
  
  return store;
}

// 日志中间件
export function loggerMiddleware() {
  return {
    before(action, payload) {
      console.log(`执行 ${action} 之前，payload:`, payload);
    },
    after(action, payload, state) {
      console.log(`执行 ${action} 之后，state:`, state);
    }
  };
}

// 本地存储中间件
export function persistMiddleware(key = 'vue-store') {
  // 从localStorage恢复状态
  let savedState;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      savedState = JSON.parse(saved);
    }
  } catch (e) {
    console.error('从localStorage恢复状态失败', e);
  }
  
  return {
    // 返回初始状态
    getInitialState() {
      return savedState;
    },
    // 状态变更后保存
    after(action, payload, state) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.error('保存状态到localStorage失败', e);
      }
    }
  };
}
```

使用示例：

```vue
<script setup>
import { createStore, loggerMiddleware, persistMiddleware } from '@/composables/createStore';

// 创建一个简单的计数器存储
const store = createStore({
  state: {
    count: 0,
    todos: []
  },
  mutations: {
    increment(state, amount = 1) {
      state.count += amount;
    },
    decrement(state, amount = 1) {
      state.count -= amount;
    },
    addTodo(state, text) {
      state.todos.push({
        id: Date.now(),
        text,
        completed: false
      });
    }
  },
  getters: {
    doubleCount(state) {
      return state.count * 2;
    },
    todoCount(state) {
      return state.todos.length;
    }
  }
});

// 添加中间件
store.use(loggerMiddleware())
     .use(persistMiddleware('my-counter'));

function increment() {
  store.commit('increment');
}

function addNewTodo() {
  store.commit('addTodo', 'New task ' + Date.now());
}
</script>

<template>
  <div>
    <p>Count: {{ store.state.count }}</p>
    <p>Double: {{ store.doubleCount }}</p>
    <p>Todos: {{ store.todoCount }}</p>
    <button @click="increment">+1</button>
    <button @click="addNewTodo">添加任务</button>
  </div>
</template>
```

### 组合函数最佳实践

总结一些组合函数的最佳实践：

1. **命名约定**: 组合函数名称应以`use`开头，如`useX`
2. **返回对象**: 始终返回一个普通对象，包含状态和方法
3. **类型定义**: 为组合函数添加TypeScript类型定义
4. **资源清理**: 在`onBeforeUnmount`中清理所有资源
5. **文档注释**: 使用JSDoc注释记录参数和返回值
6. **单一职责**: 每个组合函数只做一件事情
7. **状态隔离**: 避免使用全局变量跨组件共享状态，除非有意为之
8. **响应式传递**: 传递响应式对象时保持其响应性

```js
/**
 * 计数器组合函数
 * @param {Object} options 配置选项
 * @param {number} options.initialValue 初始值
 * @param {number} options.min 最小值
 * @param {number} options.max 最大值
 * @returns {Object} 计数器状态和方法
 */
export function useCounter(options = {}) {
  const {
    initialValue = 0,
    min = -Infinity,
    max = Infinity
  } = options;
  
  const count = ref(initialValue);
  
  // 计算是否达到限制
  const isMinValue = computed(() => count.value <= min);
  const isMaxValue = computed(() => count.value >= max);
  
  // 确保值在限制范围内
  function ensureValueInRange(value) {
    return Math.min(Math.max(value, min), max);
  }
  
  // 设置值
  function setValue(value) {
    count.value = ensureValueInRange(value);
  }
  
  // 增加值
  function increment(delta = 1) {
    setValue(count.value + delta);
  }
  
  // 减少值
  function decrement(delta = 1) {
    setValue(count.value - delta);
  }
  
  // 重置为初始值
  function reset() {
    count.value = initialValue;
  }
  
  return {
    // 状态
    count,
    isMinValue,
    isMaxValue,
    // 方法
    increment,
    decrement,
    reset,
    setValue
  };
}
```

## 测试与可维护性

组合式API不仅改变了组件的编写方式，也影响了测试和代码维护的策略。本节探讨如何测试组合式API代码并提高其可维护性。

### 组合函数的单元测试

由于组合函数是普通的JavaScript函数，它们可以独立于组件进行单元测试：

```js
// composables/useCounter.js
import { ref } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  return { count, increment, decrement };
}

// tests/useCounter.test.js
import { useCounter } from '@/composables/useCounter';
import { describe, it, expect } from 'vitest';

describe('useCounter', () => {
  it('should initialize with the given value', () => {
    const { count } = useCounter(5);
    expect(count.value).toBe(5);
  });
  
  it('should increment the counter', () => {
    const { count, increment } = useCounter(0);
    increment();
    expect(count.value).toBe(1);
  });
  
  it('should decrement the counter', () => {
    const { count, decrement } = useCounter(5);
    decrement();
    expect(count.value).toBe(4);
  });
});
```

### 模拟依赖

测试组合函数时，可能需要模拟其依赖：

```js
// composables/useUserProfile.js
import { ref } from 'vue';
import { apiClient } from '@/api';

export function useUserProfile(userId) {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  async function fetchUserProfile() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await apiClient.getUser(userId);
      user.value = data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }
  
  return { user, loading, error, fetchUserProfile };
}

// tests/useUserProfile.test.js
import { useUserProfile } from '@/composables/useUserProfile';
import { apiClient } from '@/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟API客户端
vi.mock('@/api', () => ({
  apiClient: {
    getUser: vi.fn()
  }
}));

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should fetch user profile successfully', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    apiClient.getUser.mockResolvedValue(mockUser);
    
    const { user, loading, error, fetchUserProfile } = useUserProfile(1);
    
    expect(loading.value).toBe(false);
    expect(user.value).toBeNull();
    
    const promise = fetchUserProfile();
    
    expect(loading.value).toBe(true);
    
    await promise;
    
    expect(loading.value).toBe(false);
    expect(user.value).toEqual(mockUser);
    expect(error.value).toBeNull();
    expect(apiClient.getUser).toHaveBeenCalledWith(1);
  });
  
  it('should handle errors', async () => {
    const mockError = new Error('Failed to fetch');
    apiClient.getUser.mockRejectedValue(mockError);
    
    const { user, loading, error, fetchUserProfile } = useUserProfile(1);
    
    await fetchUserProfile();
    
    expect(loading.value).toBe(false);
    expect(user.value).toBeNull();
    expect(error.value).toBe(mockError);
  });
});
```

### 组合式组件的测试

测试使用组合式API的组件：

```vue
<!-- components/UserProfile.vue -->
<script setup>
import { useUserProfile } from '@/composables/useUserProfile';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const { user, loading, error, fetchUserProfile } = useUserProfile(props.userId);

// 组件挂载时获取用户资料
onMounted(fetchUserProfile);
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">出错: {{ error.message }}</div>
    <div v-else-if="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
    <button @click="fetchUserProfile">刷新</button>
  </div>
</template>
```

测试代码：

```js
// tests/components/UserProfile.test.js
import { mount } from '@vue/test-utils';
import UserProfile from '@/components/UserProfile.vue';
import { useUserProfile } from '@/composables/useUserProfile';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟组合函数
vi.mock('@/composables/useUserProfile');

describe('UserProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should display loading state', () => {
    useUserProfile.mockReturnValue({
      user: ref(null),
      loading: ref(true),
      error: ref(null),
      fetchUserProfile: vi.fn()
    });
    
    const wrapper = mount(UserProfile, {
      props: {
        userId: 1
      }
    });
    
    expect(wrapper.text()).toContain('加载中');
    expect(useUserProfile).toHaveBeenCalledWith(1);
  });
  
  it('should display user data', () => {
    const mockUser = { name: 'Test User', email: 'test@example.com' };
    
    useUserProfile.mockReturnValue({
      user: ref(mockUser),
      loading: ref(false),
      error: ref(null),
      fetchUserProfile: vi.fn()
    });
    
    const wrapper = mount(UserProfile, {
      props: {
        userId: 1
      }
    });
    
    expect(wrapper.text()).toContain('Test User');
    expect(wrapper.text()).toContain('test@example.com');
  });
  
  it('should display error', () => {
    useUserProfile.mockReturnValue({
      user: ref(null),
      loading: ref(false),
      error: ref(new Error('获取用户失败')),
      fetchUserProfile: vi.fn()
    });
    
    const wrapper = mount(UserProfile, {
      props: {
        userId: 1
      }
    });
    
    expect(wrapper.text()).toContain('出错: 获取用户失败');
  });
  
  it('should fetch user profile on button click', async () => {
    const fetchUserProfile = vi.fn();
    
    useUserProfile.mockReturnValue({
      user: ref(null),
      loading: ref(false),
      error: ref(null),
      fetchUserProfile
    });
    
    const wrapper = mount(UserProfile, {
      props: {
        userId: 1
      }
    });
    
    await wrapper.find('button').trigger('click');
    
    expect(fetchUserProfile).toHaveBeenCalled();
  });
});
```

### 提高可维护性的最佳实践

以下是使用组合式API编写可维护代码的一些最佳实践：

1. **组织结构**：按功能或领域组织组合函数，而不是按技术类型

```
src/
└── composables/
    ├── auth/            # 认证相关
    │   ├── useAuth.js
    │   ├── usePermissions.js
    │   └── ...
    ├── ui/              # UI相关
    │   ├── useBreakpoints.js
    │   ├── useModal.js
    │   └── ...
    └── data/            # 数据管理相关
        ├── useApi.js
        ├── useUsers.js
        └── ...
```

2. **命名**：使用清晰的命名约定

- 组合函数: `useX`
- 工厂函数: `createX`
- 事件处理器: `handleX`
- 普通函数: 动词开头，如`getX`, `setX`, `checkX`

3. **错误处理**：明确错误处理策略

```js
// 明确处理错误的组合函数
export function useSafeAsync(asyncFn) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('操作失败:', error);
      // 可以在这里添加全局错误处理，如通知系统
      return null;
    }
  };
}
```

4. **文档**：为组合函数添加全面的文档

```js
/**
 * 分页数据加载组合函数
 * 
 * @param {Object} options - 配置选项
 * @param {Function} options.fetchFn - 获取数据的函数，接收 page 和 pageSize 参数
 * @param {number} options.initialPage - 初始页码，默认为 1
 * @param {number} options.pageSize - 每页数据条数，默认为 10
 * @param {boolean} options.immediate - 是否立即加载数据，默认为 true
 * 
 * @returns {Object} 分页状态和控制方法
 * @property {Ref<Array>} items - 当前页数据
 * @property {Ref<number>} page - 当前页码
 * @property {Ref<number>} total - 总数据条数
 * @property {Ref<boolean>} loading - 加载状态
 * @property {Ref<Error|null>} error - 错误状态
 * @property {Function} loadPage - 加载指定页数据的方法
 * @property {Function} nextPage - 加载下一页数据的方法
 * @property {Function} prevPage - 加载上一页数据的方法
 * 
 * @example
 * ```js
 * const { items, page, loadPage, nextPage } = usePagination({
 *   fetchFn: async (page, pageSize) => {
 *     const response = await fetch(`/api/users?page=${page}&size=${pageSize}`);
 *     return response.json();
 *   }
 * });
 * ```
 */
export function usePagination(options) {
  // 实现...
}
```

## 实际案例分析

通过一个实际案例来展示组合式API的威力。我们将构建一个简化版的任务管理应用，结合前面介绍的多种设计模式。

### 应用概述

这个任务管理应用将包含以下功能：
- 任务列表显示
- 添加、编辑和删除任务
- 过滤和排序任务
- 持久化存储

### 核心组合函数

首先，我们定义任务管理的核心组合函数：

```js
// composables/useTasks.js
import { ref, computed, watch } from 'vue';
import { useStorage } from './useStorage';

/**
 * 任务管理组合函数
 * @param {Object} options 配置选项
 * @returns {Object} 任务管理状态和方法
 */
export function useTasks(options = {}) {
  const {
    storageKey = 'vue-tasks',
    defaultFilter = 'all'
  } = options;
  
  // 使用本地存储持久化任务列表
  const { value: tasks } = useStorage(storageKey, []);
  
  // 过滤条件
  const filter = ref(defaultFilter);
  
  // 编辑中的任务
  const editingTask = ref(null);
  
  // 过滤后的任务列表
  const filteredTasks = computed(() => {
    if (filter.value === 'all') return tasks.value;
    const completed = filter.value === 'completed';
    return tasks.value.filter(task => task.completed === completed);
  });
  
  // 添加任务
  function addTask(title) {
    if (!title.trim()) return;
    
    tasks.value.push({
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: new Date()
    });
  }
  
  // 删除任务
  function removeTask(id) {
    const index = tasks.value.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks.value.splice(index, 1);
    }
  }
  
  // 切换任务完成状态
  function toggleTask(id) {
    const task = tasks.value.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
    }
  }
  
  // 开始编辑任务
  function startEditing(id) {
    const task = tasks.value.find(task => task.id === id);
    if (task) {
      editingTask.value = { ...task };
    }
  }
  
  // 保存编辑的任务
  function saveEditing() {
    if (!editingTask.value) return;
    
    const index = tasks.value.findIndex(
      task => task.id === editingTask.value.id
    );
    
    if (index !== -1) {
      // 使用解构确保保留原始字段
      tasks.value[index] = {
        ...tasks.value[index],
        ...editingTask.value,
        updatedAt: new Date()
      };
    }
    
    editingTask.value = null;
  }
  
  // 取消编辑
  function cancelEditing() {
    editingTask.value = null;
  }
  
  // 设置过滤条件
  function setFilter(newFilter) {
    filter.value = newFilter;
  }
  
  // 清除已完成任务
  function clearCompleted() {
    tasks.value = tasks.value.filter(task => !task.completed);
  }
  
  // 统计信息
  const stats = computed(() => {
    const total = tasks.value.length;
    const completed = tasks.value.filter(task => task.completed).length;
    const active = total - completed;
    
    return { total, completed, active };
  });
  
  return {
    // 状态
    tasks,
    filteredTasks,
    filter,
    editingTask,
    stats,
    // 方法
    addTask,
    removeTask,
    toggleTask,
    startEditing,
    saveEditing,
    cancelEditing,
    setFilter,
    clearCompleted
  };
}
```

### 相关UI组合函数

接下来，添加一些UI相关的组合函数：

```js
// composables/useConfirmDialog.js
import { ref } from 'vue';

/**
 * 确认对话框组合函数
 * @returns {Object} 对话框状态和方法
 */
export function useConfirmDialog() {
  const isOpen = ref(false);
  const resolvePromise = ref(null);
  const message = ref('');
  
  // 打开确认对话框
  function confirm(confirmMessage) {
    message.value = confirmMessage;
    isOpen.value = true;
    
    return new Promise(resolve => {
      resolvePromise.value = resolve;
    });
  }
  
  // 确认操作
  function handleConfirm() {
    if (resolvePromise.value) {
      resolvePromise.value(true);
      resolvePromise.value = null;
    }
    isOpen.value = false;
  }
  
  // 取消操作
  function handleCancel() {
    if (resolvePromise.value) {
      resolvePromise.value(false);
      resolvePromise.value = null;
    }
    isOpen.value = false;
  }
  
  return {
    isOpen,
    message,
    confirm,
    handleConfirm,
    handleCancel
  };
}
```

### 应用组件

现在，我们可以构建应用的主要组件：

```vue
<!-- App.vue -->
<script setup>
import { ref } from 'vue';
import { useTasks } from './composables/useTasks';
import { useConfirmDialog } from './composables/useConfirmDialog';
import TaskItem from './components/TaskItem.vue';
import TaskForm from './components/TaskForm.vue';
import TaskFilter from './components/TaskFilter.vue';

// 使用任务管理组合函数
const {
  filteredTasks,
  stats,
  addTask,
  removeTask,
  toggleTask,
  startEditing,
  saveEditing,
  cancelEditing,
  setFilter,
  clearCompleted
} = useTasks();

// 使用确认对话框
const {
  isOpen: isConfirmOpen,
  message: confirmMessage,
  confirm,
  handleConfirm,
  handleCancel
} = useConfirmDialog();

// 处理删除任务
async function handleRemoveTask(id) {
  const confirmed = await confirm('确定要删除此任务吗？');
  if (confirmed) {
    removeTask(id);
  }
}

// 处理清除已完成
async function handleClearCompleted() {
  if (stats.value.completed === 0) return;
  
  const confirmed = await confirm(`确定要清除全部 ${stats.value.completed} 个已完成任务吗？`);
  if (confirmed) {
    clearCompleted();
  }
}
</script>

<template>
  <div class="task-app">
    <h1>任务管理器</h1>
    
    <TaskForm @add-task="addTask" />
    
    <TaskFilter 
      @change-filter="setFilter" 
      :stats="stats"
      @clear-completed="handleClearCompleted"
    />
    
    <div class="task-list">
      <TaskItem
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @toggle="toggleTask(task.id)"
        @edit="startEditing(task.id)"
        @delete="handleRemoveTask(task.id)"
      />
      
      <p v-if="filteredTasks.length === 0" class="empty-message">
        暂无任务
      </p>
    </div>
    
    <!-- 确认对话框 -->
    <div v-if="isConfirmOpen" class="confirm-dialog">
      <div class="confirm-content">
        <p>{{ confirmMessage }}</p>
        <div class="confirm-actions">
          <button @click="handleCancel">取消</button>
          <button @click="handleConfirm" class="primary">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### TaskItem组件

```vue
<!-- components/TaskItem.vue -->
<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle', 'edit', 'delete']);
</script>

<template>
  <div class="task-item" :class="{ completed: task.completed }">
    <input
      type="checkbox"
      :checked="task.completed"
      @change="emit('toggle')"
    />
    <span class="title">{{ task.title }}</span>
    <div class="actions">
      <button @click="emit('edit')" class="edit">编辑</button>
      <button @click="emit('delete')" class="delete">删除</button>
    </div>
  </div>
</template>
```

这个案例展示了如何使用组合式API构建具有多个组件和功能的应用。通过将逻辑分解为可组合的函数，我们实现了清晰的代码组织，并提高了代码的可重用性。

## 总结

组合式API是Vue 3的核心特性，它提供了一种新的组件逻辑组织方式，使得代码更具可读性、可测试性和可维护性。在本文中，我们探讨了各种组合式API设计模式，从基本使用到复杂场景。

核心要点总结：

1. **基础使用**：理解`setup`函数和`<script setup>`语法糖，以及响应式系统的基础知识。

2. **逻辑复用**：通过可组合函数实现逻辑复用，替代了Vue 2中的mixins和高阶组件。

3. **状态管理**：组合式API提供了多种状态管理方式，从本地状态到全局状态。

4. **组件通信**：使用props/emits、provide/inject等方式实现组件间通信。

5. **生命周期管理**：合理使用生命周期钩子进行资源管理和清理。

6. **异步操作**：处理异步数据加载和状态管理的最佳实践。

7. **测试与可维护性**：测试组合式API代码的策略和提高代码可维护性的技巧。

随着对组合式API的深入理解，你将能够构建更加模块化、可维护的Vue应用。无论是小型项目还是大型企业应用，组合式API都能满足你的需求，并带来更好的开发体验。

组合式API的引入是Vue进化过程中的重要一步，它借鉴了React Hooks的思想，但同时保持了Vue的特性和优势。随着生态系统的不断发展，我们可以期待看到更多创新的组合式API设计模式和最佳实践。

组合式API的引入是Vue进化过程中的重要一步，它借鉴了React Hooks的思想，但同时保持了Vue的特性和优势。随着生态系统的不断发展，我们可以期待看到更多创新的组合式API设计模式和最佳实践。 