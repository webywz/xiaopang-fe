---
layout: doc
title: 深入理解浏览器的事件循环
description: 全面解析浏览器事件循环机制、宏任务与微任务队列、异步执行原理与调试技巧。
---

# 深入理解浏览器的事件循环

事件循环（Event Loop）是JavaScript异步编程的核心机制。本文将系统讲解浏览器事件循环的原理、任务队列、异步执行与调试技巧。

## 目录

- [事件循环基本原理](#事件循环基本原理)
  - [JavaScript的单线程模型](#javascript的单线程模型)
  - [执行栈与调用栈](#执行栈与调用栈)
  - [浏览器的多线程架构](#浏览器的多线程架构)
  - [事件循环的运行机制](#事件循环的运行机制)
- [宏任务与微任务队列](#宏任务与微任务队列)
  - [宏任务（MacroTask）](#宏任务macrotask)
  - [微任务（MicroTask）](#微任务microtask)
  - [任务优先级与执行顺序](#任务优先级与执行顺序)
  - [任务调度策略](#任务调度策略)
- [异步执行流程](#异步执行流程)
  - [从代码到执行](#从代码到执行)
  - [定时器的工作原理](#定时器的工作原理)
  - [Promise执行机制](#promise执行机制)
  - [动画帧与渲染时机](#动画帧与渲染时机)
- [事件循环与浏览器渲染](#事件循环与浏览器渲染)
  - [渲染时机与视觉更新](#渲染时机与视觉更新)
  - [避免渲染阻塞](#避免渲染阻塞)
- [Node.js与浏览器事件循环的差异](#nodejs与浏览器事件循环的差异)
- [常见面试题与陷阱](#常见面试题与陷阱)
- [调试与可视化工具](#调试与可视化工具)

## 事件循环基本原理

事件循环是JavaScript实现异步编程的核心机制，它使单线程的JavaScript能够非阻塞地处理I/O操作和用户交互。

### JavaScript的单线程模型

JavaScript是一门单线程语言，这意味着它只有一个主线程来执行代码。这种设计主要是因为JavaScript最初是为处理网页交互而设计的。

```js
/**
 * JavaScript单线程模型示例
 * 一次只能执行一个任务
 */
function singleThreadDemo() {
  console.log("任务1开始");
  
  // 模拟耗时操作
  const startTime = Date.now();
  while (Date.now() - startTime < 1000) {
    // 阻塞主线程1秒
  }
  
  console.log("任务1结束");
  console.log("任务2开始");
  // 只有任务1完成后才会执行任务2
}
```

单线程模型的优缺点：

- **优点**：简化编程模型，避免多线程同步问题
- **缺点**：耗时任务会阻塞主线程，导致页面无响应

### 执行栈与调用栈

执行栈（也称调用栈）是JavaScript引擎追踪函数调用的数据结构，遵循后进先出（LIFO）原则。

```js
/**
 * 调用栈示例
 * @returns {number} 计算结果
 */
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

function calculate(n) {
  // 调用栈：calculate -> square -> multiply
  return square(n);
}

// 调用栈的变化过程：
// 1. 空栈
// 2. 推入 calculate(5)
// 3. 推入 square(5)
// 4. 推入 multiply(5, 5)
// 5. multiply 返回 25，弹出 multiply
// 6. square 返回 25，弹出 square
// 7. calculate 返回 25，弹出 calculate
// 8. 空栈
```

当调用栈中的函数执行时间过长时，就会导致"调用栈阻塞"，浏览器无法处理其他任务，表现为页面卡顿或无响应。

### 浏览器的多线程架构

虽然JavaScript是单线程的，但浏览器是多线程的，主要包括：

1. **JavaScript引擎线程**：解析执行JavaScript代码
2. **渲染线程**：负责页面渲染
3. **定时器线程**：处理setTimeout/setInterval
4. **网络请求线程**：处理AJAX/Fetch请求
5. **Web Workers线程**：执行耗时的后台计算

```js
/**
 * Web Worker示例
 * 在后台线程执行耗时计算
 */
function webWorkerDemo() {
  // 创建Worker线程
  const worker = new Worker('worker.js');
  
  // 发送数据给Worker
  worker.postMessage({data: 1000000});
  
  // 接收Worker的计算结果
  worker.onmessage = function(e) {
    console.log('计算结果: ' + e.data);
  };
  
  // 主线程不会被阻塞
  console.log('Worker已启动，主线程继续执行');
}
```

### 事件循环的运行机制

事件循环是协调执行栈、任务队列和浏览器API的核心机制，它持续监控执行栈和任务队列，并按照一定规则调度任务执行。

```js
/**
 * 事件循环基本流程
 */
function eventLoopBasic() {
  while (true) {
    // 1. 检查执行栈是否为空
    if (executionStackIsEmpty()) {
      // 2. 检查微任务队列是否有任务
      while (microTaskQueue.length > 0) {
        // 执行所有微任务
        executeMicroTask(microTaskQueue.dequeue());
      }
      
      // 3. 选择一个宏任务执行
      if (macroTaskQueue.length > 0) {
        executeMacroTask(macroTaskQueue.dequeue());
      }
      
      // 4. 执行渲染更新（如需要）
      if (shouldRender()) {
        render();
      }
    }
  }
}
```

事件循环的关键步骤：

1. 执行当前执行栈中的所有同步代码
2. 一旦执行栈清空，检查微任务队列并执行所有微任务
3. 执行一个宏任务，该宏任务可能会生成新的微任务
4. 执行完宏任务后，再次执行所有新产生的微任务
5. 考虑是否需要渲染更新
6. 重复以上步骤

## 宏任务与微任务队列

JavaScript的异步任务分为宏任务（MacroTask）和微任务（MicroTask）两种类型，它们分别在不同的队列中排队等待执行。

### 宏任务（MacroTask）

宏任务代表一个独立的工作单元，包括：

```js
/**
 * 常见的宏任务类型
 * @returns {Object} 宏任务类型及示例
 */
function macroTaskTypes() {
  return {
    script: "整体script代码",
    setTimeout: "setTimeout(() => {}, 1000)",
    setInterval: "setInterval(() => {}, 1000)",
    setImmediate: "setImmediate(() => {}) (Node.js环境)",
    requestAnimationFrame: "requestAnimationFrame(() => {})",
    I/O: "网络请求、文件操作等",
    UI交互事件: "click, scroll, resize等DOM事件",
    postMessage: "window.postMessage()",
    MessageChannel: "new MessageChannel()"
  };
}
```

宏任务示例：

```js
/**
 * 宏任务示例
 */
function macroTaskDemo() {
  console.log('1 - 同步代码开始');
  
  // setTimeout创建宏任务
  setTimeout(() => {
    console.log('4 - 第一个宏任务执行');
  }, 0);
  
  // 又一个宏任务
  setTimeout(() => {
    console.log('5 - 第二个宏任务执行');
  }, 0);
  
  console.log('2 - 同步代码结束');
  
  // 输出顺序: 1, 2, 4, 5
}
```

### 微任务（MicroTask）

微任务是在当前宏任务结束后、下一个宏任务开始前执行的任务，包括：

```js
/**
 * 常见的微任务类型
 * @returns {Object} 微任务类型及示例
 */
function microTaskTypes() {
  return {
    Promise回调: "Promise.then/catch/finally",
    queueMicrotask: "queueMicrotask(() => {})",
    MutationObserver: "观察DOM变动的回调",
    IntersectionObserver: "元素可见性变化的回调",
    process.nextTick: "Node.js环境特有"
  };
}
```

微任务示例：

```js
/**
 * 微任务示例
 */
function microTaskDemo() {
  console.log('1 - 同步代码开始');
  
  // 创建微任务
  Promise.resolve().then(() => {
    console.log('3 - 第一个微任务执行');
  });
  
  // 创建微任务
  queueMicrotask(() => {
    console.log('4 - 第二个微任务执行');
  });
  
  // 创建宏任务
  setTimeout(() => {
    console.log('5 - 宏任务执行');
  }, 0);
  
  console.log('2 - 同步代码结束');
  
  // 输出顺序: 1, 2, 3, 4, 5
}
```

### 任务优先级与执行顺序

事件循环中的任务执行顺序遵循以下规则：

1. 同步代码优先执行
2. 微任务队列优先于宏任务队列
3. 同一队列中的任务按照先进先出（FIFO）原则执行

```js
/**
 * 任务执行顺序演示
 */
function taskOrderDemo() {
  console.log('1 - 脚本开始');
  
  setTimeout(() => console.log('6 - 宏任务1'), 0);
  
  Promise.resolve()
    .then(() => {
      console.log('3 - 微任务1');
      
      // 在微任务中创建新的微任务
      Promise.resolve().then(() => {
        console.log('4 - 微任务中的微任务');
      });
      
      // 在微任务中创建宏任务
      setTimeout(() => console.log('7 - 微任务中的宏任务'), 0);
    });
  
  Promise.resolve().then(() => console.log('5 - 微任务2'));
  
  console.log('2 - 脚本结束');
  
  // 输出顺序: 1, 2, 3, 4, 5, 6, 7
}
```

重要规则：**当前宏任务执行完毕后，会立即执行所有在微任务队列中的任务，然后才会执行下一个宏任务**。

### 任务调度策略

浏览器根据以下策略调度任务：

```js
/**
 * 任务调度策略
 * @returns {Object} 调度策略说明
 */
function schedulingStrategies() {
  return {
    效率优化: "微任务比宏任务执行更快，无需等待新的事件循环轮次",
    优先级控制: "高优先级任务可放入微任务队列优先执行",
    渲染时机控制: "微任务执行完毕后才会考虑渲染",
    用户体验优化: "可以在UI渲染前完成相关的DOM操作"
  };
}
```

以下是更复杂的任务调度示例：

```js
/**
 * 复杂调度示例
 */
function complexSchedulingDemo() {
  // 页面初始数据
  let data = { value: 0 };
  let element = document.getElementById('output');
  
  // 点击事件处理（宏任务）
  element.addEventListener('click', () => {
    console.log('宏任务: 点击事件开始处理');
    
    // 同步修改数据
    data.value++;
    console.log(`数据更新为: ${data.value}`);
    
    // 创建微任务 - DOM更新前的数据处理
    Promise.resolve().then(() => {
      console.log('微任务: 处理更新后的数据');
      data.value = data.value * 2;
      
      // 再创建一个微任务 - 准备DOM更新
      queueMicrotask(() => {
        console.log('内部微任务: 准备更新DOM');
        element.textContent = `当前值: ${data.value}`;
      });
    });
    
    // 创建宏任务 - 数据持久化
    setTimeout(() => {
      console.log('下一个宏任务: 数据持久化');
      localStorage.setItem('savedValue', data.value);
      
      // 动画帧渲染前的准备
      requestAnimationFrame(() => {
        console.log('动画帧: 为下一次渲染做准备');
        element.style.backgroundColor = data.value > 10 ? 'red' : 'green';
      });
    }, 0);
    
    console.log('宏任务: 点击事件处理结束');
  });
}
```

## 异步执行流程

JavaScript中异步代码的执行流程是事件循环机制的核心应用，理解这一流程对于编写高效的异步代码至关重要。

### 从代码到执行

当JavaScript代码被加载时，会经历以下阶段：

```js
/**
 * 代码执行流程
 * @param {string} code JavaScript代码
 */
function codeExecutionFlow(code) {
  // 1. 解析阶段 - 生成AST和执行上下文
  const ast = parse(code);
  const context = createExecutionContext();
  
  // 2. 执行阶段 - 同步代码立即执行
  executeSync(ast, context);
  
  // 3. 异步任务注册阶段 - 遇到异步API时注册回调
  // 例如：setTimeout、fetch、Promise等
  
  // 4. 事件循环阶段 - 根据任务类型和优先级执行异步任务
}
```

异步任务注册示例：

```js
/**
 * 异步任务注册示例
 */
function asyncTaskRegistration() {
  console.log('同步代码开始');
  
  // 注册一个setTimeout回调(宏任务)
  setTimeout(() => {
    console.log('定时器回调执行');
  }, 1000);
  
  // 注册一个网络请求回调(宏任务)
  fetch('https://api.example.com/data')
    .then(response => {
      // 注册一个Promise回调(微任务)
      return response.json();
    })
    .then(data => {
      console.log('数据获取成功:', data);
    });
  
  console.log('同步代码结束');
}
```

### 定时器的工作原理

`setTimeout`和`setInterval`是最常用的异步API，其工作原理如下：

```js
/**
 * 定时器工作原理
 */
function timerMechanism() {
  console.log('开始');
  
  // 设置一个10ms的定时器
  const startTime = Date.now();
  setTimeout(() => {
    const delay = Date.now() - startTime;
    console.log(`实际延迟: ${delay}ms`); // 可能大于10ms
  }, 10);
  
  // 执行一个耗时操作
  const blockUntil = Date.now() + 100;
  while(Date.now() < blockUntil) {
    // 阻塞主线程100ms
  }
}
```

定时器的几个重要特性：

1. **最小延迟时间**：浏览器通常有4ms左右的最小延迟
2. **不精确的执行时间**：定时器只能保证在指定时间后将回调添加到任务队列，而非立即执行
3. **嵌套定时器限制**：浏览器会对嵌套层级深的定时器进行限流(最小间隔为4ms)
4. **未激活标签页限制**：后台标签页中的定时器可能被限制为1000ms最小间隔

### Promise执行机制

Promise提供了一种更优雅的异步编程模式，其执行机制如下：

```js
/**
 * Promise执行机制示例
 */
function promiseExecutionDemo() {
  console.log('1 - 同步代码开始');
  
  // Promise构造函数中的代码是同步执行的
  const promise = new Promise((resolve, reject) => {
    console.log('2 - Promise内部同步代码');
    resolve('成功结果');
  });
  
  // then回调会被注册为微任务
  promise.then(result => {
    console.log('4 - Promise成功回调: ' + result);
  });
  
  console.log('3 - 同步代码结束');
  
  // 输出顺序: 1, 2, 3, 4
}
```

Promise链式调用的执行顺序：

```js
/**
 * Promise链式调用
 */
function promiseChaining() {
  Promise.resolve('初始值')
    .then(value => {
      console.log('第一个then: ' + value);
      return '链式值1';
    })
    .then(value => {
      console.log('第二个then: ' + value);
      // 返回一个新的Promise
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('异步链式值');
        }, 1000);
      });
    })
    .then(value => {
      // 等待前一个Promise解决后才执行
      console.log('第三个then: ' + value);
    });
  
  console.log('Promise链创建完成');
}
```

### 动画帧与渲染时机

`requestAnimationFrame`是一个特殊的API，它在浏览器下一次重绘之前调用指定的回调函数：

```js
/**
 * requestAnimationFrame示例
 */
function animationFrameDemo() {
  let count = 0;
  
  function animate() {
    count++;
    console.log(`动画帧 #${count}`);
    
    // 修改DOM
    const element = document.getElementById('animation');
    element.style.transform = `translateX(${count}px)`;
    
    // 请求下一帧
    if (count < 100) {
      requestAnimationFrame(animate);
    }
  }
  
  // 开始动画循环
  requestAnimationFrame(animate);
}
```

`requestAnimationFrame`的关键特性：

1. 回调执行时机与浏览器的刷新率同步(通常是60Hz，约16.7ms一次)
2. 在视觉更新前执行，理想用于实现流畅动画
3. 当标签页不可见时，回调会被暂停，节省资源
4. 它是一个宏任务，但有特殊的调度机制

## 事件循环与浏览器渲染

事件循环与浏览器的渲染过程密切相关，理解两者的关系有助于优化页面性能。

### 渲染时机与视觉更新

浏览器渲染过程通常在宏任务之间进行，具体流程如下：

```js
/**
 * 事件循环与渲染的关系
 */
function eventLoopWithRendering() {
  // 渲染步骤在宏任务之后、下一个宏任务之前执行
  // 简化的事件循环流程:
  function simplifiedEventLoop() {
    while (true) {
      // 1. 执行一个宏任务
      executeMacroTask();
      
      // 2. 执行所有微任务
      while (microTaskQueue.length > 0) {
        executeMicroTask();
      }
      
      // 3. 如果需要渲染，执行以下步骤:
      if (shouldRender()) {
        // a. 计算样式
        style();
        
        // b. 计算布局
        layout();
        
        // c. 绘制
        paint();
        
        // d. 合成
        composite();
      }
    }
  }
}
```

渲染的触发条件：

1. **浏览器判断需要进行渲染**（通常以屏幕刷新率为基准）
2. **DOM或CSSOM发生变化**
3. **没有被渲染节流所限制**

### 避免渲染阻塞

为了提高页面性能，应该避免阻塞渲染过程：

```js
/**
 * 渲染优化策略
 * @returns {Object} 优化技巧
 */
function renderingOptimizationTips() {
  return {
    批量DOM操作: "使用DocumentFragment或一次性修改classList",
    避免强制同步布局: "先读取所有布局属性，然后再修改样式",
    使用合适的CSS属性: "优先使用transform和opacity进行动画",
    合理使用requestAnimationFrame: "将视觉更新放在rAF回调中",
    使用web workers: "将耗时计算放入后台线程",
    任务分割: "将长任务分解为多个小任务，允许渲染穿插其中"
  };
}
```

下面是一个优化渲染的示例：

```js
/**
 * 优化渲染的示例
 */
function optimizedRendering() {
  const items = Array.from({ length: 10000 }, (_, i) => i);
  const container = document.getElementById('container');
  
  // 不好的方式 - 会导致多次重排重绘
  function badRendering() {
    items.forEach(item => {
      const div = document.createElement('div');
      div.textContent = `Item ${item}`;
      // 每次添加都会触发布局计算
      container.appendChild(div);
    });
  }
  
  // 好的方式 - 批量DOM操作
  function goodRendering() {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
      const div = document.createElement('div');
      div.textContent = `Item ${item}`;
      fragment.appendChild(div);
    });
    
    // 只触发一次布局计算
    container.appendChild(fragment);
  }
  
  // 更好的方式 - 分批处理允许渲染穿插
  function betterRendering() {
    const batchSize = 500;
    let index = 0;
    
    function processBatch() {
      const fragment = document.createDocumentFragment();
      
      // 处理一批数据
      const limit = Math.min(index + batchSize, items.length);
      for (let i = index; i < limit; i++) {
        const div = document.createElement('div');
        div.textContent = `Item ${items[i]}`;
        fragment.appendChild(div);
      }
      
      container.appendChild(fragment);
      index += batchSize;
      
      // 如果还有数据，在下一帧继续处理
      if (index < items.length) {
        requestAnimationFrame(processBatch);
      }
    }
    
    // 开始处理第一批
    requestAnimationFrame(processBatch);
  }
}
```

## Node.js与浏览器事件循环的差异

虽然Node.js和浏览器都基于V8引擎，但它们的事件循环机制存在一些差异：

```js
/**
 * Node.js与浏览器事件循环的主要区别
 * @returns {Array} 差异点列表
 */
function nodeVsBrowserEventLoop() {
  return [
    {
      area: "实现机制",
      browser: "由浏览器实现，遵循HTML规范",
      node: "由libuv库实现，更关注I/O操作"
    },
    {
      area: "微任务执行时机",
      browser: "每个宏任务执行后立即执行所有微任务",
      node: "在不同阶段之间执行微任务（较新版本趋同于浏览器）"
    },
    {
      area: "任务优先级",
      browser: "任务优先级相对简单",
      node: "有更复杂的优先级队列和阶段"
    },
    {
      area: "Timer精度",
      browser: "通常最小为4ms",
      node: "可以达到1ms"
    },
    {
      area: "特有API",
      browser: "requestAnimationFrame等与渲染相关的API",
      node: "process.nextTick, setImmediate等Node特有API"
    }
  ];
}
```

Node.js事件循环的阶段：

1. **timers**: 执行setTimeout()和setInterval()的回调
2. **pending callbacks**: 执行某些系统操作的回调
3. **idle, prepare**: 内部使用
4. **poll**: 检索新的I/O事件，执行I/O相关回调
5. **check**: 执行setImmediate()回调
6. **close callbacks**: 执行关闭事件的回调

## 常见面试题与陷阱

事件循环相关的面试题常常检验对异步执行顺序的理解：

```js
/**
 * 经典面试题1：Promise与setTimeout
 */
function interviewQuestion1() {
  console.log('script start');
  
  setTimeout(function() {
    console.log('setTimeout');
  }, 0);
  
  Promise.resolve()
    .then(function() {
      console.log('promise1');
    })
    .then(function() {
      console.log('promise2');
    });
  
  console.log('script end');
  
  // 输出顺序：
  // script start
  // script end
  // promise1
  // promise2
  // setTimeout
}

/**
 * 经典面试题2：async/await执行顺序
 */
function interviewQuestion2() {
  async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
  }
  
  async function async2() {
    console.log('async2');
  }
  
  console.log('script start');
  
  setTimeout(function() {
    console.log('setTimeout');
  }, 0);
  
  async1();
  
  new Promise(function(resolve) {
    console.log('promise1');
    resolve();
  }).then(function() {
    console.log('promise2');
  });
  
  console.log('script end');
  
  // 输出顺序：
  // script start
  // async1 start
  // async2
  // promise1
  // script end
  // async1 end
  // promise2
  // setTimeout
}
```

常见陷阱与误解：

```js
/**
 * 常见的事件循环误解
 * @returns {Object} 错误理解及纠正
 */
function commonMisconceptions() {
  return {
    "setTimeout(fn, 0)会立即执行": {
      reality: "它会在下一轮事件循环中执行，且有最小延时",
      correction: "如需更快执行，考虑使用queueMicrotask或Promise.resolve().then()"
    },
    "Promise.resolve()是异步的": {
      reality: "Promise构造函数内的代码是同步执行的，只有then/catch回调是异步的",
      correction: "new Promise(r => r()).then() 中，Promise构造器内代码同步执行，then回调异步执行"
    },
    "await立即暂停函数执行": {
      reality: "await后面的表达式会同步执行，只是其结果的处理和后续代码会异步执行",
      correction: "await promise相当于promise.then的语法糖"
    },
    "requestAnimationFrame是微任务": {
      reality: "它是一个特殊的宏任务，在重绘之前执行",
      correction: "理解为特殊调度的宏任务更准确"
    }
  };
}
```

## 调试与可视化工具

利用现代开发工具可以更直观地理解和调试事件循环相关问题：

```js
/**
 * 事件循环调试工具
 * @returns {Object} 工具列表及功能
 */
function eventLoopDebuggingTools() {
  return {
    "Chrome DevTools": {
      Performance面板: "记录运行时性能，查看任务执行情况",
      JavaScript分析器: "分析长任务和阻塞",
      任务管理器: "监控页面和框架的CPU使用情况"
    },
    "可视化工具": {
      "Loupe": "http://latentflip.com/loupe/",
      "JavaScript Visualizer": "https://ui.dev/javascript-visualizer",
      "Event Loop Visualizer": "https://www.jsv9000.app/"
    },
    "代码调试技巧": {
      "async/await调试": "使用async函数简化Promise链调试",
      "任务分组": "使用console.group()分组相关日志",
      "性能标记": "使用performance.mark()和measure()测量代码段执行时间"
    }
  };
}
```

调试示例：

```js
/**
 * 使用Performance API进行性能调试
 */
function performanceDebugging() {
  // 开始标记
  performance.mark('taskStart');
  
  // 执行一些操作
  processData();
  
  // 结束标记
  performance.mark('taskEnd');
  
  // 测量两个标记之间的时间
  performance.measure('任务执行时间', 'taskStart', 'taskEnd');
  
  // 获取并输出测量结果
  const measures = performance.getEntriesByType('measure');
  console.table(measures);
  
  // 清除标记
  performance.clearMarks();
  performance.clearMeasures();
}

/**
 * 使用Chrome DevTools调试事件循环问题
 */
function chromeDevToolsDebugging() {
  // 1. 打开DevTools > Performance面板
  // 2. 点击"Record"开始记录
  // 3. 执行要分析的操作
  // 4. 点击"Stop"停止记录
  // 5. 分析Main部分的火焰图:
  //    - 蓝色: 加载事件
  //    - 黄色: 脚本执行
  //    - 紫色: 渲染事件
  //    - 绿色: 绘制事件
}
```

---

> 参考资料：
> - [MDN 事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)
> - [HTML规范：事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop)
> - [Jake Archibald: 深入理解事件循环](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
> - [Philip Roberts: 事件循环解释](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
> - [Node.js事件循环文档](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)