---
outline: deep
---

# React 基础教程

React 是一个用于构建用户界面的 JavaScript 库。本文介绍 React 的基础概念。

## React 介绍
React 使创建交互式 UI 变得轻而易举。为应用的每个状态设计简洁的视图，当数据变动时 React 能高效更新渲染正确的组件。

## JSX 语法
JSX 是 JavaScript 的语法扩展，看起来像模板语言，但具有 JavaScript 的全部功能。

```jsx
const element = <h1>你好，世界！</h1>;
```

## 组件与 Props
组件允许你将 UI 拆分为独立可复用的代码片段，并对每个片段进行独立构思。

```jsx
function Welcome(props) {
  return <h1>你好, {props.name}</h1>;
}

// 使用组件
const element = <Welcome name="小明" />;
```

## 状态与生命周期
React 组件可以通过 state 维护内部状态，并通过生命周期方法在特定时间执行代码。

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>当前时间</h1>
        <h2>{this.state.date.toLocaleTimeString()}</h2>
      </div>
    );
  }
}
```

## React 周边生态

React 生态系统非常丰富，涵盖了路由、状态管理、表单处理、样式方案、数据请求、测试等多个方面。常见的生态库有：

- **路由**：react-router
- **状态管理**：Redux、MobX、Recoil、Zustand 等
- **表单处理**：Formik、react-hook-form
- **样式方案**：styled-components、emotion、Tailwind CSS
- **数据请求**：axios、react-query、SWR
- **测试工具**：Jest、React Testing Library
- **动画与 SEO**：Framer Motion、React Helmet 等

详细用法与示例请参考 [React 生态系统](./ecosystem.md)。

/**
 * @module React生态
 * @description 本节简要介绍了 React 生态常用库，帮助开发者选择合适的配套工具。
 */ 