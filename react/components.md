---
outline: deep
---

# React 组件与生命周期

本文详细介绍 React 组件的类型和生命周期。

## 函数组件与类组件
React 支持两种类型的组件：函数组件和类组件。

```jsx
// 函数组件
function Welcome(props) {
  return <h1>你好, {props.name}</h1>;
}

// 类组件
class Welcome extends React.Component {
  render() {
    return <h1>你好, {this.props.name}</h1>;
  }
}
```

## 组件生命周期
类组件有多个生命周期方法，让你在特定的时间点执行特定的代码。

```jsx
class LifecycleDemo extends React.Component {
  constructor(props) {
    super(props);
    console.log('1. 构造函数执行');
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps 执行');
    return null;
  }

  componentDidMount() {
    console.log('4. 组件挂载完成');
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('5. shouldComponentUpdate 执行');
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('7. getSnapshotBeforeUpdate 执行');
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('8. 组件更新完成');
  }

  componentWillUnmount() {
    console.log('9. 组件即将卸载');
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    console.log('3/6. 渲染函数执行');
    return (
      <div>
        <p>点击次数: {this.state.count}</p>
        <button onClick={this.handleClick}>点击</button>
      </div>
    );
  }
}
```

## 高阶组件
高阶组件是一种基于 React 组合特性的复用组件逻辑的高级技术。

```jsx
// 高阶组件示例
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: selectData(DataSource, props)
      };
    }

    componentDidMount() {
      // 添加订阅
      DataSource.addChangeListener(this.handleChange);
    }

    componentWillUnmount() {
      // 清除订阅
      DataSource.removeChangeListener(this.handleChange);
    }

    handleChange = () => {
      this.setState({
        data: selectData(DataSource, this.props)
      });
    }

    render() {
      // 将数据作为 props 传递给被包装的组件
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
``` 