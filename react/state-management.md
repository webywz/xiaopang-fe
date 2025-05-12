# React 状态管理详解

React 应用随着规模增长，组件间状态共享和管理变得复杂。主流状态管理方案有 Redux、MobX、Recoil、Zustand 等，各有优劣。

## 目录
- 状态管理简介
- Redux 基础与进阶
- MobX 基础与进阶
- Recoil 基础与进阶
- Zustand 基础与进阶
- 方案对比与选型建议
- 状态管理最佳实践
- 常见问题与解决方案

---

## 状态管理简介

React 组件有本地 state，但跨组件通信、全局状态管理需借助外部库。常见场景：用户登录信息、主题、购物车、全局消息等。

---

## Redux 基础与进阶

Redux 是最流行的状态管理库，数据流单向、可预测，配合 Redux Toolkit 简化开发。

### Redux 基础

```js
/**
 * @file redux-basic.js
 * @description Redux 基础用法，计数器示例。
 */
import { createStore } from 'redux';

// Action 类型
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// Action 创建函数
function increment() { return { type: INCREMENT }; }
function decrement() { return { type: DECREMENT }; }

// Reducer
function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
}

// 创建 store
const store = createStore(counter);

store.subscribe(() => console.log(store.getState()));
store.dispatch(increment());
store.dispatch(decrement());
```

### Redux Toolkit

Redux Toolkit 是官方推荐的开发工具包，简化 reducer、action、store 配置。

```js
/**
 * @file redux-toolkit.js
 * @description Redux Toolkit 用法，计数器示例。
 */
import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: state => state + 1,
    decrement: state => state - 1
  }
});

export const { increment, decrement } = counterSlice.actions;

const store = configureStore({
  reducer: counterSlice.reducer
});

store.subscribe(() => console.log(store.getState()));
store.dispatch(increment());
```

### React-Redux 结合

```jsx
/**
 * @file Counter.jsx
 * @description React 组件结合 Redux。
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store';

function Counter() {
  const count = useSelector(state => state);
  const dispatch = useDispatch();
  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

---

## MobX 基础与进阶

MobX 采用响应式编程思想，使用装饰器和 observable 自动追踪依赖，代码简洁。

```js
/**
 * @file mobx-basic.js
 * @description MobX 基础用法。
 */
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class CounterStore {
  count = 0;
  constructor() {
    makeAutoObservable(this);
  }
  increment() { this.count++; }
  decrement() { this.count--; }
}

const counterStore = new CounterStore();

const Counter = observer(() => (
  <div>
    <button onClick={() => counterStore.decrement()}>-</button>
    <span>{counterStore.count}</span>
    <button onClick={() => counterStore.increment()}>+</button>
  </div>
));
```

---

## Recoil 基础与进阶

Recoil 是 Facebook 推出的原生 React 状态管理库，API 直观，支持原子化状态和派生状态。

```jsx
/**
 * @file recoil-basic.jsx
 * @description Recoil 基础用法。
 */
import { atom, selector, useRecoilState, useRecoilValue, RecoilRoot } from 'recoil';

const countState = atom({
  key: 'countState',
  default: 0
});

const doubleCount = selector({
  key: 'doubleCount',
  get: ({ get }) => get(countState) * 2
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  const double = useRecoilValue(doubleCount);
  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}（双倍：{double}）</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

function App() {
  return (
    <RecoilRoot>
      <Counter />
    </RecoilRoot>
  );
}
```

---

## Zustand 基础与进阶

Zustand 是轻量级状态管理库，API 极简，天然支持 hooks。

```js
/**
 * @file zustand-basic.js
 * @description Zustand 基础用法。
 */
import create from 'zustand';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 }))
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

---

## 方案对比与选型建议

| 特性         | Redux           | MobX         | Recoil        | Zustand      |
|--------------|-----------------|--------------|---------------|--------------|
| 学习曲线     | 较陡峭          | 平缓         | 平缓          | 极低         |
| 代码冗余     | 多              | 少           | 少            | 极少         |
| 社区生态     | 极其活跃        | 较活跃       | 新兴          | 新兴         |
| 性能         | 优秀            | 优秀         | 优秀          | 优秀         |
| 类型支持     | 完善            | 完善         | 完善          | 完善         |
| 适用场景     | 大型/中型项目   | 中小型项目   | 中小型项目    | 小型/中型项目|

- Redux 适合大型项目，团队协作，调试工具丰富
- MobX 适合响应式开发，代码简洁
- Recoil 适合原子化状态需求，天然 React 风格
- Zustand 适合极简、快速开发

---

## 状态管理最佳实践

- 状态拆分原子化，避免全局大对象
- 只在必要组件订阅全局状态，减少无关渲染
- 使用 Redux Toolkit/MobX 自动化工具简化代码
- 结合 React Context 管理全局配置
- 合理利用持久化（如 localStorage）

---

## 常见问题与解决方案

### 1. 状态更新组件未刷新
- 检查是否正确订阅（useSelector/useRecoilState/useStore）
- MobX 需用 observer 包裹组件

### 2. 状态丢失
- 检查组件卸载/重建，或未持久化

### 3. Redux Action/Reducer 过多
- 推荐使用 Redux Toolkit 简化

---

/**
 * @module StateManagement
 * @description 本文极致细化了 React 主流状态管理方案，适合新手和进阶开发者参考。
 */ 