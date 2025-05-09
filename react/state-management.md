---
outline: deep
---

# React 状态管理

本文介绍 React 中常用的状态管理方案。

## Context API
Context 提供了一种通过组件树传递数据的方法，而不必在每一个层级手动传递 props。

```jsx
// 创建一个 Context
const ThemeContext = React.createContext('light');

// 提供者组件
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 中间组件
function Toolbar() {
  return <ThemedButton />;
}

// 消费者组件
function ThemedButton() {
  // 使用 useContext Hook 来获取 Context 值
  const theme = React.useContext(ThemeContext);
  return <button className={theme}>按钮</button>;
}
```

## Redux
Redux 是 JavaScript 应用的状态容器，提供可预测的状态管理。

```jsx
// 定义 reducer
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// 创建 Redux store
import { createStore } from 'redux'
const store = createStore(counterReducer)

// 在 React 中使用 Redux
import { Provider, useSelector, useDispatch } from 'react-redux'

function Counter() {
  const count = useSelector(state => state.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => dispatch({ type: 'counter/incremented' })}>+</button>
      <button onClick={() => dispatch({ type: 'counter/decremented' })}>-</button>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

## MobX
MobX 是一个简单、可扩展的状态管理库，通过透明的函数响应式编程使状态管理变得简单。

```jsx
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

// 定义状态存储
class CounterStore {
  count = 0

  constructor() {
    makeAutoObservable(this)
  }

  increment() {
    this.count++
  }

  decrement() {
    this.count--
  }
}

// 创建 store 实例
const counterStore = new CounterStore()

// 观察者组件
const Counter = observer(() => {
  return (
    <div>
      <p>计数: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>+</button>
      <button onClick={() => counterStore.decrement()}>-</button>
    </div>
  )
})
``` 