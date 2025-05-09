---
layout: doc
title: Node.js线程与进程管理
description: 全面解析Node.js线程模型、进程管理、worker_threads与child_process实战，助你提升并发与稳定性。
---

# Node.js线程与进程管理

Node.js采用单线程事件循环，但通过多进程与多线程机制可实现高并发与任务隔离。本文将系统讲解Node.js线程模型、进程管理、worker_threads与child_process实战。

## 目录

- [Node.js线程模型概述](#nodejs线程模型概述)
- [child_process模块用法](#child_process模块用法)
- [worker_threads模块用法](#worker_threads模块用法)
- [线程与进程的适用场景](#线程与进程的适用场景)
- [实战建议与最佳实践](#实战建议与最佳实践)

## Node.js线程模型概述

Node.js采用单线程事件循环架构，这是其高性能的关键所在，但同时也带来了一些限制。理解Node.js的线程模型对于构建高性能应用至关重要。

### 单线程事件循环

Node.js的核心是基于V8引擎和libuv库构建的：

- **单线程执行JavaScript**：所有JavaScript代码都在一个主线程中执行
- **事件驱动**：通过事件和回调函数处理并发
- **非阻塞I/O**：I/O操作不会阻塞主线程，而是注册回调后立即返回

```js
/**
 * 演示Node.js单线程特性
 */
function demonstrateSingleThread() {
  // 全局变量作为计数器
  let counter = 0;
  
  console.log('主线程开始执行');
  
  // 模拟耗时操作
  const simulateHeavyTask = (id) => {
    console.log(`任务${id}开始执行，当前计数器: ${counter}`);
    
    // 阻塞主线程的操作（在实际应用中应避免）
    const start = Date.now();
    while (Date.now() - start < 1000) {
      // 空循环，模拟CPU密集型操作
      counter++;
    }
    
    console.log(`任务${id}完成，当前计数器: ${counter}`);
  };
  
  // 这些任务会依次执行，而非并行
  simulateHeavyTask(1);
  simulateHeavyTask(2);
  simulateHeavyTask(3);
  
  console.log('所有任务已完成');
}

// demonstrateSingleThread();
```

### libuv线程池

虽然JavaScript代码在单线程中执行，但Node.js通过libuv的线程池处理I/O操作：

- **线程池大小**：默认4个线程，可通过环境变量`UV_THREADPOOL_SIZE`调整（最大128）
- **适用场景**：文件系统操作、DNS解析、加密/解密操作等

```js
/**
 * 演示libuv线程池
 */
const fs = require('fs');
const crypto = require('crypto');

function demonstrateThreadPool() {
  console.time('全部任务完成');
  
  // 线程池默认大小为4，这里创建5个繁重任务以展示线程池特性
  for (let i = 0; i < 5; i++) {
    crypto.pbkdf2('密码', '盐值', 100000, 512, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      console.log(`任务${i+1}完成: ${Date.now()}`);
    });
    console.log(`任务${i+1}已提交: ${Date.now()}`);
  }
  
  // 文件I/O也使用线程池
  fs.readFile(__filename, 'utf8', (err, data) => {
    if (err) throw err;
    console.log(`文件读取完成: ${Date.now()}`);
  });
  
  console.timeEnd('全部任务完成');
  console.log('主线程继续执行其他代码');
  
  // 查看当前线程池大小（仅供参考，这不是官方API）
  console.log(`当前线程池大小: ${process.env.UV_THREADPOOL_SIZE || '默认(4)'}`);
}

// 增加线程池大小并重新运行测试
function increaseThreadPoolSize() {
  process.env.UV_THREADPOOL_SIZE = 8;
  console.log(`已将线程池大小设置为: ${process.env.UV_THREADPOOL_SIZE}`);
  demonstrateThreadPool();
}

// demonstrateThreadPool();
// increaseThreadPoolSize();
```

### JavaScript与C++之间的交互

Node.js的架构涉及JavaScript与C++之间的复杂交互：

- **JavaScript层**：提供应用开发API
- **C++绑定层**：连接JavaScript与C++代码
- **V8**：执行JavaScript代码
- **libuv**：处理事件循环和异步I/O

```js
/**
 * 演示Node.js异步非阻塞I/O模型
 */
function demonstrateAsyncModel() {
  console.log('1. 程序开始执行');
  
  // 定时器操作 - 由事件循环管理
  setTimeout(() => {
    console.log('4. 定时器回调执行');
  }, 0);
  
  // 文件I/O操作 - 由libuv线程池处理
  fs.readFile('./package.json', 'utf8', (err, data) => {
    if (err) {
      console.error('文件读取失败:', err);
      return;
    }
    console.log('5. 文件异步读取完成');
  });
  
  // 网络I/O - 由操作系统处理
  if (require('http').globalAgent.sockets['example.com:80']) {
    const req = require('http').get('http://example.com', (res) => {
      console.log('6. 网络请求完成');
      
      // 收集响应数据
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('7. 响应数据接收完毕');
      });
    });
    
    req.on('error', (err) => {
      console.error('请求失败:', err);
    });
  }
  
  // 同步操作直接执行
  console.log('2. 同步代码执行');
  
  // 使用process.nextTick加入微任务队列
  process.nextTick(() => {
    console.log('3. nextTick回调执行');
  });
  
  console.log('主线程代码执行完毕，开始事件循环');
}

// demonstrateAsyncModel();
```

### Node.js线程模型优缺点

理解Node.js线程模型的优缺点有助于我们做出合理的架构决策：

#### 优点

1. **内存效率高**：单线程模型避免了线程上下文切换和锁定开销
2. **开发简易**：无需处理复杂的多线程同步问题
3. **适合I/O密集型**：异步I/O模型对网络应用非常高效

#### 缺点

1. **不适合CPU密集型**：长时间计算会阻塞事件循环
2. **错误隔离性差**：未捕获的异常可能导致整个程序崩溃
3. **无法充分利用多核**：单线程无法原生利用多核CPU优势

```js
/**
 * 演示Node.js单线程模型的局限性
 */
function demonstrateLimitations() {
  // 1. CPU密集型任务会阻塞事件循环
  function blockingOperation() {
    console.time('CPU密集型操作');
    
    // 计算斐波那契数列（效率极低的实现方式，仅用于演示）
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    // 执行耗时计算
    const result = fibonacci(40);
    console.log(`计算结果: ${result}`);
    
    console.timeEnd('CPU密集型操作');
  }
  
  // 2. 设置一个HTTP服务器来测试响应能力
  const http = require('http');
  const server = http.createServer((req, res) => {
    console.log(`收到请求: ${new Date().toISOString()}`);
    res.writeHead(200);
    res.end('Hello World\n');
  });
  
  server.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000/');
    
    // 现在，如果运行阻塞操作，服务器将无法响应新请求
    console.log('开始执行阻塞操作，服务器将无法响应请求...');
    blockingOperation();
    console.log('阻塞操作完成，服务器恢复响应能力');
  });
  
  // 使用以下命令测试服务器响应能力:
  // curl http://localhost:3000/
}

// 如需演示，请解除注释
// demonstrateLimitations();
```

### 解决单线程局限性的策略

Node.js提供了几种解决单线程局限性的方法：

1. **子进程 (child_process)**：在独立进程中执行任务
2. **工作线程 (worker_threads)**：在共享内存的线程中执行任务
3. **集群 (cluster)**：创建多个Node.js实例来扩展应用

```js
/**
 * 演示使用子进程解决CPU密集型问题
 */
function solveCpuIntensiveTask() {
  const { fork } = require('child_process');
  
  // 定义主进程逻辑
  function runMainProcess() {
    console.log('主进程: 启动');
    
    // 创建HTTP服务器
    const http = require('http');
    const server = http.createServer((req, res) => {
      console.log(`主进程: 收到请求 ${req.url}`);
      
      if (req.url === '/compute') {
        // 将计算任务委托给子进程
        const compute = fork('./compute-worker.js');
        
        compute.on('message', (result) => {
          res.writeHead(200);
          res.end(`计算结果: ${result}\n`);
          compute.kill();
        });
        
        compute.on('error', (error) => {
          console.error('子进程错误:', error);
          res.writeHead(500);
          res.end('计算错误\n');
        });
        
        // 发送计算指令
        compute.send({ cmd: 'compute', num: 40 });
      } else {
        // 常规请求快速响应
        res.writeHead(200);
        res.end('Hello World\n');
      }
    });
    
    server.listen(3000, () => {
      console.log('服务器运行在 http://localhost:3000/');
      console.log('访问 /compute 执行耗时计算');
      console.log('访问 / 获取快速响应');
    });
  }
  
  // 定义计算工作进程
  function defineComputeWorker() {
    // 将下面的代码保存为 compute-worker.js
    /*
    process.on('message', (msg) => {
      if (msg.cmd === 'compute') {
        const result = fibonacci(msg.num);
        process.send(result);
      }
    });
    
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    */
  }
  
  // 实际运行时，需要创建compute-worker.js文件
  console.log('示例代码：请创建compute-worker.js文件并运行');
}

// solveCpuIntensiveTask();
```

理解Node.js的线程模型有助于我们更好地设计应用架构，合理利用单线程优势，并通过多进程或多线程策略克服其局限性。

## child_process模块用法

child_process是Node.js中用于创建子进程的核心模块，它提供了多种方式来执行外部应用或Node.js脚本，实现多进程并行处理。

### 进程创建的基本方法

Node.js提供了四种创建子进程的主要方法：

#### 1. spawn(): 启动命令

适合长时间运行的进程，以流的方式处理大量数据：

```js
/**
 * 使用spawn启动子进程
 */
const { spawn } = require('child_process');

/**
 * 运行命令并将输出流式传输到控制台
 * @param {string} command 要执行的命令
 * @param {string[]} args 命令参数数组
 */
function runCommand(command, args) {
  console.log(`运行命令: ${command} ${args.join(' ')}`);
  
  // 创建子进程
  const childProcess = spawn(command, args, {
    stdio: 'pipe', // 默认值，建立管道
    shell: false,  // 直接执行命令，不通过shell
    env: process.env // 继承父进程环境变量
  });
  
  // 处理标准输出
  childProcess.stdout.on('data', (data) => {
    console.log(`输出: ${data}`);
  });
  
  // 处理标准错误
  childProcess.stderr.on('data', (data) => {
    console.error(`错误: ${data}`);
  });
  
  // 进程结束事件
  childProcess.on('close', (code) => {
    console.log(`子进程退出，退出码: ${code}`);
  });
  
  // 进程错误事件
  childProcess.on('error', (err) => {
    console.error(`启动进程失败: ${err}`);
  });
  
  return childProcess;
}

// 示例：列出目录内容
// runCommand('ls', ['-la']);

// 示例：运行长时间进程
function runLongProcess() {
  // 在Windows上使用 findstr "^" 或在Unix上使用 cat
  const isWin = process.platform === 'win32';
  const childProcess = isWin 
    ? spawn('findstr', ['^'], { shell: true })
    : spawn('cat', []);
    
  console.log('长时间运行的进程已启动，PID:', childProcess.pid);
  console.log('输入将被回显，按Ctrl+C退出');
  
  // 将标准输入连接到子进程的标准输入
  process.stdin.pipe(childProcess.stdin);
  
  // 将子进程的输出连接到标准输出
  childProcess.stdout.pipe(process.stdout);
  
  // 监听进程退出
  childProcess.on('exit', () => {
    console.log('子进程已退出');
    process.exit();
  });
}

// runLongProcess();
```

#### 2. exec(): 执行shell命令

适合需要执行shell命令并获取输出结果的场景：

```js
/**
 * 使用exec执行shell命令
 */
const { exec } = require('child_process');

/**
 * 执行shell命令并返回结果
 * @param {string} command 要执行的命令
 * @returns {Promise<string>} 命令执行结果
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`执行命令: ${command}`);
    
    // 执行shell命令
    exec(command, {
      maxBuffer: 1024 * 1024, // 增加默认缓冲区大小到1MB
      timeout: 30000,         // 设置超时时间为30秒
      env: process.env        // 继承环境变量
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`命令输出到stderr: ${stderr}`);
      }
      
      resolve(stdout);
    });
  });
}

// 使用async/await调用
async function runCommandsInSequence() {
  try {
    // 获取系统信息
    const osInfo = await executeCommand('node -v && npm -v');
    console.log('Node.js和NPM版本信息:\n', osInfo);
    
    // 列出当前目录
    const files = await executeCommand('dir || ls -la');
    console.log('目录内容:\n', files);
    
    // 注意：exec执行有风险，避免直接使用用户输入
    // 反面示例（存在注入风险）：
    // const userInput = '/ && rm -rf /';
    // await executeCommand(`ls ${userInput}`);
    
  } catch (error) {
    console.error('命令执行失败:', error);
  }
}

// runCommandsInSequence();
```

#### 3. execFile(): 执行可执行文件

适合直接运行可执行文件，不通过shell：

```js
/**
 * 使用execFile执行可执行文件
 */
const { execFile } = require('child_process');

/**
 * 执行可执行文件
 * @param {string} file 要执行的文件路径
 * @param {string[]} args 参数数组
 * @returns {Promise<string>} 执行结果
 */
function runExecutable(file, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`执行文件: ${file} ${args.join(' ')}`);
    
    execFile(file, args, {
      maxBuffer: 1024 * 1024, // 1MB缓冲区
      timeout: 30000,         // 30秒超时
      env: process.env
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`输出到stderr: ${stderr}`);
      }
      
      resolve(stdout);
    });
  });
}

// 示例：执行Node.js脚本
async function runNodeScripts() {
  try {
    // 创建一个简单的脚本文件
    const fs = require('fs');
    const scriptContent = `
      console.log('这是从子进程输出的');
      console.log('当前进程ID:', process.pid);
      console.log('参数:', process.argv.slice(2));
    `;
    
    fs.writeFileSync('temp-script.js', scriptContent);
    
    // 执行脚本
    const result = await runExecutable('node', ['temp-script.js', 'arg1', 'arg2']);
    console.log('脚本执行结果:\n', result);
    
    // 清理临时文件
    fs.unlinkSync('temp-script.js');
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

// runNodeScripts();
```

#### 4. fork(): 创建Node.js子进程

专门用于创建新的Node.js进程，并建立IPC通道：

```js
/**
 * 使用fork创建Node.js子进程
 */
const { fork } = require('child_process');

/**
 * 启动一个Node.js子进程并与之通信
 * @param {string} modulePath 模块路径
 * @param {string[]} args 参数数组
 * @param {Object} options 选项
 */
function forkNodeProcess(modulePath, args = [], options = {}) {
  console.log(`Fork进程: ${modulePath}`);
  
  // 默认选项
  const defaultOptions = {
    // 不以新窗口运行子进程
    detached: false,
    // 只传递主进程的stdin, stdout, stderr和ipc
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  };
  
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 创建子进程
  const child = fork(modulePath, args, mergedOptions);
  
  console.log(`子进程已启动，PID: ${child.pid}`);
  
  // 设置消息监听器
  child.on('message', (message) => {
    console.log(`从子进程接收到消息:`, message);
  });
  
  // 监听退出事件
  child.on('exit', (code, signal) => {
    console.log(`子进程退出，退出码: ${code}, 信号: ${signal || 'none'}`);
  });
  
  return child;
}

// 示例：创建一个执行CPU密集型任务的子进程
function createWorkerProcessExample() {
  // 先创建worker.js文件
  const fs = require('fs');
  const workerCode = `
    // worker.js - 子进程代码
    process.on('message', (message) => {
      console.log('Worker: 收到消息', message);
      
      if (message.cmd === 'start') {
        // 执行CPU密集型任务
        const start = Date.now();
        
        // 计算斐波那契数列
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        const result = fibonacci(message.num || 40);
        const duration = Date.now() - start;
        
        // 发送结果回主进程
        process.send({
          result: result,
          duration: duration,
          pid: process.pid
        });
      }
    });
    
    // 通知主进程已准备好
    process.send({ status: 'ready' });
  `;
  
  fs.writeFileSync('worker.js', workerCode);
  
  // 创建一个子进程
  const worker = forkNodeProcess('worker.js');
  
  // 当收到子进程准备好的消息后发送任务
  worker.on('message', (message) => {
    if (message.status === 'ready') {
      console.log('子进程已准备好，发送任务...');
      worker.send({ cmd: 'start', num: 40 });
    } else if (message.result) {
      console.log(`计算结果: ${message.result}`);
      console.log(`计算耗时: ${message.duration}ms`);
      
      // 任务完成后终止子进程
      worker.kill();
      
      // 清理文件
      fs.unlinkSync('worker.js');
    }
  });
}

// createWorkerProcessExample();
```

### 进程间通信(IPC)

在多进程架构中，进程间通信是至关重要的：

```js
/**
 * 进程间通信示例
 */
function demonstrateIPC() {
  const { fork } = require('child_process');
  const path = require('path');
  
  // 创建IPC服务器脚本
  const serverCode = `
    // ipc-server.js
    console.log('IPC服务器启动，PID:', process.pid);
    
    // 监听来自主进程的消息
    process.on('message', (message) => {
      console.log('服务器收到消息:', message);
      
      // 处理请求
      if (message.cmd === 'compute') {
        // 模拟耗时计算
        const result = message.a + message.b;
        
        // 发送结果回主进程
        process.send({ 
          cmd: 'result', 
          result: result,
          requestId: message.requestId 
        });
      }
    });
    
    // 定期发送状态更新
    let counter = 0;
    const interval = setInterval(() => {
      process.send({ 
        cmd: 'status', 
        uptime: process.uptime(),
        counter: counter++
      });
      
      // 10次后停止发送
      if (counter > 10) {
        clearInterval(interval);
      }
    }, 1000);
  `;
  
  const fs = require('fs');
  fs.writeFileSync('ipc-server.js', serverCode);
  
  // 启动IPC服务器进程
  const server = fork('ipc-server.js');
  
  // 追踪请求
  const requests = new Map();
  let requestId = 0;
  
  // 监听来自服务器的消息
  server.on('message', (message) => {
    if (message.cmd === 'result') {
      // 查找对应的请求
      const resolver = requests.get(message.requestId);
      if (resolver) {
        resolver(message.result);
        requests.delete(message.requestId);
      }
    } else if (message.cmd === 'status') {
      console.log(`服务器状态: 已运行${message.uptime.toFixed(1)}秒，计数: ${message.counter}`);
    }
  });
  
  // 创建RPC风格的请求函数
  function requestComputation(a, b) {
    return new Promise((resolve) => {
      const id = requestId++;
      
      // 存储请求对应的resolve函数
      requests.set(id, resolve);
      
      // 发送请求到服务器
      server.send({
        cmd: 'compute',
        a: a,
        b: b,
        requestId: id
      });
    });
  }
  
  // 发送多个计算请求
  async function runRequests() {
    console.log('发送计算请求...');
    
    // 并行发送多个请求
    const results = await Promise.all([
      requestComputation(10, 20),
      requestComputation(30, 40),
      requestComputation(50, 60)
    ]);
    
    console.log('计算结果:', results);
    
    // 5秒后终止服务器
    setTimeout(() => {
      console.log('终止服务器进程');
      server.kill();
      fs.unlinkSync('ipc-server.js');
    }, 5000);
  }
  
  runRequests();
}

// demonstrateIPC();
```

### 管理子进程生命周期

正确管理子进程的生命周期对于稳定运行的应用至关重要：

```js
/**
 * 子进程生命周期管理示例
 */
function processLifecycleManagement() {
  const { spawn } = require('child_process');
  
  /**
   * 创建可靠的长时间运行子进程
   * @param {string} command 命令
   * @param {string[]} args 参数
   * @param {Object} options 选项
   */
  function createResilientProcess(command, args, options = {}) {
    // 状态跟踪
    const state = {
      restartCount: 0,
      lastStartTime: Date.now(),
      isShuttingDown: false
    };
    
    // 进程创建函数
    function startProcess() {
      if (state.isShuttingDown) return null;
      
      console.log(`启动进程: ${command} ${args.join(' ')}`);
      state.lastStartTime = Date.now();
      state.restartCount++;
      
      const childProcess = spawn(command, args, {
        stdio: 'pipe',
        ...options
      });
      
      console.log(`进程已启动, PID: ${childProcess.pid}, 这是第 ${state.restartCount} 次启动`);
      
      // 设置日志
      childProcess.stdout.on('data', (data) => {
        console.log(`[子进程输出] ${data}`);
      });
      
      childProcess.stderr.on('data', (data) => {
        console.error(`[子进程错误] ${data}`);
      });
      
      // 处理退出
      childProcess.on('exit', (code, signal) => {
        console.log(`子进程退出: 代码=${code}, 信号=${signal || 'none'}`);
        
        if (!state.isShuttingDown) {
          // 计算重启延迟时间 - 使用指数退避策略
          const timeSinceStart = Date.now() - state.lastStartTime;
          let delay = 0;
          
          if (timeSinceStart < 1000) {
            // 如果进程启动后立即崩溃，使用指数延迟避免重启风暴
            delay = Math.min(1000 * Math.pow(2, state.restartCount - 1), 30000);
            console.log(`进程快速崩溃，将在 ${delay}ms 后重启`);
          } else {
            // 正常运行一段时间后崩溃，立即重启
            console.log('进程将立即重启');
          }
          
          setTimeout(() => {
            childProcess.replacement = startProcess();
          }, delay);
        }
      });
      
      return childProcess;
    }
    
    // 启动初始进程
    const initialProcess = startProcess();
    
    // 返回控制对象
    return {
      process: initialProcess,
      
      // 获取当前活动进程
      getCurrentProcess() {
        let current = initialProcess;
        while (current.replacement) {
          current = current.replacement;
        }
        return current;
      },
      
      // 终止进程及其所有替代进程
      shutdown() {
        state.isShuttingDown = true;
        let current = initialProcess;
        
        while (current) {
          try {
            console.log(`终止进程 PID: ${current.pid}`);
            current.kill();
          } catch (err) {
            console.error(`终止进程错误:`, err);
          }
          current = current.replacement;
        }
      },
      
      // 获取状态信息
      getState() {
        return { ...state };
      }
    };
  }
  
  // 示例：创建一个模拟不稳定的进程
  function createUnstableProcess() {
    // 创建一个随机崩溃的脚本
    const fs = require('fs');
    const unstableScript = `
      // unstable-process.js
      console.log('不稳定进程已启动，PID:', process.pid);
      
      let counter = 0;
      
      // 每秒输出一次
      const interval = setInterval(() => {
        counter++;
        console.log(\`进程正在运行: \${counter}s\`);
        
        // 随机崩溃
        if (Math.random() < 0.2) {
          console.log('模拟进程崩溃!');
          throw new Error('随机崩溃');
        }
        
        // 随机退出
        if (Math.random() < 0.1) {
          console.log('模拟进程退出!');
          process.exit(1);
        }
      }, 1000);
      
      // 保持进程运行
      process.on('uncaughtException', (err) => {
        console.error('捕获到未处理异常:', err.message);
        // 正常情况下不应该捕获未处理异常继续运行，这里仅作演示
        clearInterval(interval);
        process.exit(1);
      });
    `;
    
    fs.writeFileSync('unstable-process.js', unstableScript);
    
    // 创建有弹性的进程管理器
    const processManager = createResilientProcess('node', ['unstable-process.js']);
    
    // 30秒后关闭
    setTimeout(() => {
      console.log('关闭进程管理器');
      processManager.shutdown();
      
      // 清理
      fs.unlinkSync('unstable-process.js');
    }, 30000);
    
    return processManager;
  }
  
  // createUnstableProcess();
  console.log('执行示例需要解除注释');
}

// processLifecycleManagement();
```

### 负载均衡与集群

使用cluster模块可以实现基本的负载均衡：

```js
/**
 * 使用cluster模块的基本负载均衡示例
 */
function clusterExample() {
  const cluster = require('cluster');
  const http = require('http');
  const numCPUs = require('os').cpus().length;
  
  if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
    
    // 追踪工作进程
    const workers = new Map();
    
    // 创建工作进程
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      console.log(`已创建工作进程 ${worker.process.pid}`);
      workers.set(worker.id, worker);
      
      // 监听来自工作进程的消息
      worker.on('message', (message) => {
        console.log(`主进程收到工作进程 ${worker.process.pid} 消息:`, message);
      });
    }
    
    // 监听工作进程退出事件
    cluster.on('exit', (worker, code, signal) => {
      console.log(`工作进程 ${worker.process.pid} 退出，代码: ${code}, 信号: ${signal || 'none'}`);
      
      // 删除跟踪
      workers.delete(worker.id);
      
      // 创建新工作进程替换退出的进程
      const newWorker = cluster.fork();
      console.log(`创建新工作进程 ${newWorker.process.pid} 替换退出的进程`);
      workers.set(newWorker.id, newWorker);
    });
    
    // 定期发送状态更新到所有工作进程
    let counter = 0;
    setInterval(() => {
      const status = { counter: counter++, timestamp: Date.now() };
      
      for (const worker of workers.values()) {
        worker.send({ cmd: 'status', ...status });
      }
    }, 5000);
    
    // 处理信号
    process.on('SIGINT', () => {
      console.log('收到SIGINT信号，优雅关闭中...');
      
      for (const worker of workers.values()) {
        worker.send({ cmd: 'shutdown' });
      }
      
      // 给工作进程一些时间优雅关闭
      setTimeout(() => {
        console.log('强制终止所有工作进程');
        for (const worker of workers.values()) {
          worker.kill('SIGTERM');
        }
        process.exit(0);
      }, 5000);
    });
    
  } else {
    // 工作进程代码
    console.log(`工作进程 ${process.pid} 已启动`);
    
    // 创建HTTP服务器
    const server = http.createServer((req, res) => {
      // 模拟一些工作
      let sum = 0;
      for(let i = 0; i < 1000000; i++) {
        sum += i;
      }
      
      // 发送响应
      res.writeHead(200);
      res.end(`Hello from worker ${process.pid}\n`);
      
      // 通知主进程
      process.send({
        event: 'request',
        url: req.url,
        pid: process.pid,
        timestamp: Date.now()
      });
    });
    
    // 监听来自主进程的消息
    process.on('message', (message) => {
      if (message.cmd === 'status') {
        console.log(`工作进程 ${process.pid} 收到状态更新:`, message);
      } else if (message.cmd === 'shutdown') {
        console.log(`工作进程 ${process.pid} 收到关闭命令，优雅关闭中...`);
        
        // 停止接受新连接
        server.close(() => {
          console.log(`工作进程 ${process.pid} 已关闭服务器，正在退出`);
          process.exit(0);
        });
        
        // 确保在超时后强制关闭
        setTimeout(() => {
          console.log(`工作进程 ${process.pid} 超时，强制退出`);
          process.exit(1);
        }, 3000);
      }
    });
    
    // 启动服务器
    server.listen(8000, () => {
      console.log(`工作进程 ${process.pid} 正在监听端口 8000`);
    });
  }
}

// 运行集群示例
// clusterExample();
```

通过使用child_process模块，我们可以有效地利用多核CPU，隔离不同任务，提高应用的稳定性和性能。

## worker_threads模块用法

worker_threads是Node.js提供的原生多线程模块，允许在同一进程中运行多个JavaScript线程，共享内存，实现真正的并行计算。这对于CPU密集型任务尤其有价值。

### worker_threads基础

Node.js 10.5.0引入了worker_threads模块，为Node.js带来真正的多线程能力：

```js
/**
 * worker_threads基础用法示例
 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

/**
 * 在主线程中创建和管理工作线程
 */
function workerThreadsBasics() {
  if (isMainThread) {
    // 主线程代码
    console.log('主线程运行中，PID:', process.pid);
    
    // 创建一个工作线程
    const worker = new Worker(__filename, {
      workerData: { name: '线程1', value: 42 }
    });
    
    // 监听工作线程的消息
    worker.on('message', (message) => {
      console.log('主线程收到消息:', message);
    });
    
    // 监听工作线程退出
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`工作线程退出，退出码: ${code}`);
      } else {
        console.log('工作线程正常退出');
      }
    });
    
    // 向工作线程发送消息
    worker.postMessage({ cmd: 'start', timestamp: Date.now() });
    
    // 5秒后终止线程
    setTimeout(() => {
      console.log('终止工作线程');
      worker.terminate();
    }, 5000);
  } else {
    // 工作线程代码
    console.log('工作线程启动，线程ID:', workerData);
    
    // 接收来自主线程的消息
    parentPort.on('message', (message) => {
      console.log('工作线程收到消息:', message);
      
      // 执行一些计算
      const result = performComputation();
      
      // 将结果发送回主线程
      parentPort.postMessage({
        result: result,
        receivedData: workerData,
        processTime: Date.now() - message.timestamp
      });
    });
    
    // 模拟计算任务
    function performComputation() {
      let sum = 0;
      for (let i = 0; i < 10000000; i++) {
        sum += i;
      }
      return sum;
    }
  }
}

// 开启示例
// workerThreadsBasics();
```

### 线程间共享内存

worker_threads的一个重要特性是能够使用SharedArrayBuffer在线程间共享内存：

```js
/**
 * 使用SharedArrayBuffer共享内存
 */
function sharedMemoryExample() {
  const { Worker, isMainThread, parentPort } = require('worker_threads');
  
  if (isMainThread) {
    // 创建共享内存
    const sharedBuffer = new SharedArrayBuffer(4 * 10); // 10个Int32值
    const sharedArray = new Int32Array(sharedBuffer);
    
    // 初始化共享数组
    for (let i = 0; i < sharedArray.length; i++) {
      Atomics.store(sharedArray, i, 0);
    }
    
    console.log('主线程初始化共享内存:', Array.from(sharedArray));
    
    // 创建4个工作线程，每个负责计算一部分
    const workers = [];
    const numWorkers = 4;
    
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__filename, {
        workerData: {
          sharedBuffer,
          workerId: i,
          workersCount: numWorkers
        }
      });
      
      worker.on('exit', () => {
        console.log(`工作线程 ${i} 已退出`);
        
        // 检查是否所有线程都已完成
        if (workers.every(w => w.threadId === -1 || !w.threadId)) {
          console.log('所有线程已完成，最终结果:');
          console.log(Array.from(sharedArray));
        }
      });
      
      workers.push(worker);
    }
    
    // 发送开始信号给所有线程
    workers.forEach(worker => {
      worker.postMessage('start');
    });
    
  } else {
    // 工作线程代码
    const { sharedBuffer, workerId, workersCount } = workerData;
    const sharedArray = new Int32Array(sharedBuffer);
    
    // 监听来自主线程的消息
    parentPort.on('message', (message) => {
      if (message === 'start') {
        console.log(`工作线程 ${workerId} 开始处理`);
        
        // 计算线程负责处理的数组部分
        const itemsPerWorker = Math.ceil(sharedArray.length / workersCount);
        const start = workerId * itemsPerWorker;
        const end = Math.min(start + itemsPerWorker, sharedArray.length);
        
        // 在共享内存中更新值
        for (let i = start; i < end; i++) {
          // 模拟一些计算
          const value = (i + 1) * 10;
          
          // 使用Atomics确保操作的原子性
          Atomics.add(sharedArray, i, value);
          
          // 模拟不同的处理时间
          const delay = Math.random() * 500;
          Atomics.wait(sharedArray, i, value, delay);
        }
        
        console.log(`工作线程 ${workerId} 完成处理，范围: [${start}-${end})`);
        
        // 通知主线程并退出
        parentPort.postMessage('done');
        process.exit(0);
      }
    });
  }
}

// sharedMemoryExample();
```

### 线程池实现

在实际应用中，创建一个线程池可以有效管理多个工作线程：

```js
/**
 * 工作线程池实现
 */
function threadPoolImplementation() {
  const { Worker } = require('worker_threads');
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  
  // 首先创建工作线程脚本
  const workerScript = `
    // worker.js
    const { parentPort, workerData } = require('worker_threads');
    
    // 初始化
    console.log(\`工作线程 #\${workerData.workerId} 已启动\`);
    
    // 监听任务
    parentPort.on('message', (task) => {
      console.log(\`线程 #\${workerData.workerId} 收到任务: \${task.id}\`);
      
      // 任务类型
      switch (task.type) {
        case 'fibonacci':
          calculateFibonacci(task);
          break;
        case 'prime':
          checkPrime(task);
          break;
        default:
          parentPort.postMessage({
            taskId: task.id,
            error: 'Unknown task type'
          });
      }
    });
    
    // 计算斐波那契数列
    function calculateFibonacci(task) {
      const { number } = task.data;
      
      function fib(n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
      }
      
      try {
        const result = fib(number);
        parentPort.postMessage({
          taskId: task.id,
          result: result
        });
      } catch (error) {
        parentPort.postMessage({
          taskId: task.id,
          error: error.message
        });
      }
    }
    
    // 检查素数
    function checkPrime(task) {
      const { number } = task.data;
      
      function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        let i = 5;
        while (i * i <= n) {
          if (n % i === 0 || n % (i + 2) === 0) return false;
          i += 6;
        }
        return true;
      }
      
      try {
        const result = isPrime(number);
        parentPort.postMessage({
          taskId: task.id,
          result: result
        });
      } catch (error) {
        parentPort.postMessage({
          taskId: task.id,
          error: error.message
        });
      }
    }
  `;
  
  // 写入工作线程脚本
  fs.writeFileSync('worker.js', workerScript);
  
  // 线程池类
  class ThreadPool {
    constructor(size = os.cpus().length) {
      this.size = size;
      this.workers = [];
      this.taskQueue = [];
      this.taskCallbacks = new Map();
      this.taskIdCounter = 0;
      this.initialize();
    }
    
    // 初始化线程池
    initialize() {
      console.log(`初始化线程池，大小: ${this.size}`);
      
      for (let i = 0; i < this.size; i++) {
        const worker = new Worker('./worker.js', {
          workerData: { workerId: i }
        });
        
        worker.on('message', (response) => {
          this.handleResponse(response);
        });
        
        worker.on('error', (error) => {
          console.error(`工作线程 #${i} 错误:`, error);
          this.replaceWorker(i);
        });
        
        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`工作线程 #${i} 异常退出，代码: ${code}`);
            this.replaceWorker(i);
          }
        });
        
        this.workers.push({
          worker,
          busy: false
        });
      }
    }
    
    // 替换崩溃的工作线程
    replaceWorker(index) {
      const newWorker = new Worker('./worker.js', {
        workerData: { workerId: index }
      });
      
      newWorker.on('message', (response) => {
        this.handleResponse(response);
      });
      
      newWorker.on('error', (error) => {
        console.error(`工作线程 #${index} 错误:`, error);
        this.replaceWorker(index);
      });
      
      newWorker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`工作线程 #${index} 异常退出，代码: ${code}`);
          this.replaceWorker(index);
        }
      });
      
      this.workers[index] = {
        worker: newWorker,
        busy: false
      };
      
      // 如果有等待的任务，立即执行
      this.processQueue();
    }
    
    // 提交任务
    submitTask(type, data) {
      return new Promise((resolve, reject) => {
        const taskId = this.taskIdCounter++;
        
        // 存储任务回调
        this.taskCallbacks.set(taskId, { resolve, reject });
        
        // 创建任务对象
        const task = { id: taskId, type, data };
        
        // 加入队列并尝试处理
        this.taskQueue.push(task);
        this.processQueue();
      });
    }
    
    // 处理任务队列
    processQueue() {
      // 如果队列为空，直接返回
      if (this.taskQueue.length === 0) return;
      
      // 寻找空闲的工作线程
      const availableWorkerIndex = this.workers.findIndex(w => !w.busy);
      
      if (availableWorkerIndex !== -1) {
        // 获取一个任务
        const task = this.taskQueue.shift();
        
        // 标记工作线程为忙碌状态
        this.workers[availableWorkerIndex].busy = true;
        
        // 分配任务
        this.workers[availableWorkerIndex].worker.postMessage(task);
      }
    }
    
    // 处理工作线程的响应
    handleResponse(response) {
      const { taskId, result, error } = response;
      
      // 获取任务回调
      const callbacks = this.taskCallbacks.get(taskId);
      
      if (callbacks) {
        if (error) {
          callbacks.reject(new Error(error));
        } else {
          callbacks.resolve(result);
        }
        
        // 删除任务回调
        this.taskCallbacks.delete(taskId);
      }
      
      // 找到完成任务的工作线程
      const workerIndex = this.workers.findIndex(w => w.worker.threadId === response.workerId);
      
      if (workerIndex !== -1) {
        // 标记工作线程为空闲状态
        this.workers[workerIndex].busy = false;
        
        // 处理下一个任务
        this.processQueue();
      }
    }
    
    // 关闭线程池
    shutdown() {
      console.log('关闭线程池...');
      
      // 终止所有工作线程
      for (const { worker } of this.workers) {
        worker.terminate();
      }
      
      // 清空任务队列并拒绝所有未完成的任务
      for (const task of this.taskQueue) {
        const callbacks = this.taskCallbacks.get(task.id);
        if (callbacks) {
          callbacks.reject(new Error('线程池已关闭'));
          this.taskCallbacks.delete(task.id);
        }
      }
      
      this.taskQueue = [];
      console.log('线程池已关闭');
    }
  }
  
  // 使用线程池的示例
  async function useThreadPool() {
    // 创建线程池，大小为CPU核心数
    const pool = new ThreadPool();
    
    try {
      // 提交多个计算任务
      console.log('提交多个任务...');
      
      const results = await Promise.all([
        pool.submitTask('fibonacci', { number: 40 }),
        pool.submitTask('fibonacci', { number: 42 }),
        pool.submitTask('fibonacci', { number: 41 }),
        pool.submitTask('fibonacci', { number: 39 }),
        pool.submitTask('prime', { number: 2147483647 }),
        pool.submitTask('prime', { number: 100000000 })
      ]);
      
      console.log('所有任务完成, 结果:', results);
    } catch (error) {
      console.error('任务执行错误:', error);
    } finally {
      // 关闭线程池
      pool.shutdown();
      
      // 清理工作线程脚本
      fs.unlinkSync('worker.js');
    }
  }
  
  // useThreadPool();
}

// threadPoolImplementation();
```

### 使用MessageChannel处理线程间通信

对于更复杂的线程间通信，可以使用MessageChannel：

```js
/**
 * 使用MessageChannel实现线程间通信
 */
function messageChannelExample() {
  const { Worker, isMainThread, parentPort, MessageChannel, workerData } = require('worker_threads');
  
  if (isMainThread) {
    // 创建工作线程1
    const worker1 = new Worker(__filename, {
      workerData: { id: 1 }
    });
    
    // 创建工作线程2
    const worker2 = new Worker(__filename, {
      workerData: { id: 2 }
    });
    
    // 创建直接通信通道
    const { port1, port2 } = new MessageChannel();
    
    // 将端口发送给工作线程
    worker1.postMessage({ port: port1 }, [port1]);
    worker2.postMessage({ port: port2 }, [port2]);
    
    // 从工作线程接收消息
    worker1.on('message', (message) => {
      console.log(`主线程从工作线程1收到消息:`, message);
    });
    
    worker2.on('message', (message) => {
      console.log(`主线程从工作线程2收到消息:`, message);
    });
    
    // 监听工作线程退出
    worker1.on('exit', () => {
      console.log('工作线程1已退出');
    });
    
    worker2.on('exit', () => {
      console.log('工作线程2已退出');
    });
    
    // 5秒后关闭
    setTimeout(() => {
      worker1.terminate();
      worker2.terminate();
    }, 5000);
  } else {
    // 工作线程代码
    const workerId = workerData.id;
    console.log(`工作线程${workerId}已启动`);
    
    // 接收端口
    parentPort.once('message', (message) => {
      if (message.port) {
        const port = message.port;
        
        // 监听来自其他工作线程的消息
        port.on('message', (message) => {
          console.log(`工作线程${workerId}收到消息:`, message);
          
          // 回复
          port.postMessage({
            from: workerId,
            reply: `回复消息从线程${workerId}`,
            timestamp: Date.now()
          });
        });
        
        // 发送消息到另一个线程
        port.postMessage({
          from: workerId,
          text: `你好，我是线程${workerId}`,
          timestamp: Date.now()
        });
        
        // 通知主线程
        parentPort.postMessage({
          status: `工作线程${workerId}已建立通信通道`
        });
      }
    });
  }
}

// messageChannelExample();
```

### worker_threads性能优化

在实际应用中，可以通过一些技巧优化worker_threads的性能：

```js
/**
 * worker_threads性能优化
 */
function optimizeWorkerThreads() {
  const { Worker, isMainThread } = require('worker_threads');
  const os = require('os');
  
  if (isMainThread) {
    console.log(`主线程运行在PID: ${process.pid}`);
    console.log(`系统有 ${os.cpus().length} 个CPU核心`);
    
    // 最佳实践1: 根据CPU核心数量创建适当数量的线程
    const numThreads = os.cpus().length;
    console.log(`创建 ${numThreads} 个工作线程`);
    
    // 线程性能测试
    function runPerfTest() {
      // 测试不同数量的线程
      [1, 2, 4, 8, os.cpus().length].forEach(threadCount => {
        if (threadCount > os.cpus().length * 2) return; // 避免创建过多线程
        
        console.time(`${threadCount} 线程`);
        
        const workers = [];
        const tasks = 100; // 总任务数
        let completedTasks = 0;
        
        return new Promise(resolve => {
          for (let i = 0; i < threadCount; i++) {
            const worker = new Worker(__filename, {
              workerData: { workerId: i, totalThreads: threadCount }
            });
            
            workers.push(worker);
            
            worker.on('message', () => {
              completedTasks++;
              if (completedTasks === tasks) {
                console.timeEnd(`${threadCount} 线程`);
                
                // 终止所有线程
                workers.forEach(w => w.terminate());
                resolve();
              }
            });
          }
          
          // 均匀分配任务
          for (let i = 0; i < tasks; i++) {
            const worker = workers[i % threadCount];
            worker.postMessage({ 
              taskId: i,
              data: { value: Math.floor(Math.random() * 40) + 5 }
            });
          }
        });
      });
    }
    
    // 运行性能测试
    // runPerfTest();
    
    // 最佳实践2: 减少数据复制开销
    function demonstrateDataTransfer() {
      const worker = new Worker(__filename, {
        workerData: { testMode: 'dataTransfer' }
      });
      
      // 创建一个大的数据缓冲区
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
      
      console.time('Transfer by copy');
      worker.postMessage({ type: 'copy', data: largeBuffer });
      
      worker.once('message', () => {
        console.timeEnd('Transfer by copy');
        
        // 使用转移方式
        const transferBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
        
        console.time('Transfer by reference');
        worker.postMessage(
          { type: 'transfer', data: transferBuffer.buffer },
          [transferBuffer.buffer]
        );
        
        worker.once('message', () => {
          console.timeEnd('Transfer by reference');
          worker.terminate();
        });
      });
    }
    
    // demonstrateDataTransfer();
    
  } else {
    // 工作线程代码
    const { workerData, parentPort } = require('worker_threads');
    
    if (workerData.testMode === 'dataTransfer') {
      // 数据传输测试
      parentPort.on('message', (message) => {
        if (message.type === 'copy') {
          // 接收到的数据会被完整复制
          parentPort.postMessage('received');
        } else if (message.type === 'transfer') {
          // 转移的buffer在主线程已不可用
          parentPort.postMessage('transferred');
        }
      });
    } else {
      // 性能测试工作线程代码
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      parentPort.on('message', (task) => {
        const result = fibonacci(task.data.value);
        parentPort.postMessage({
          taskId: task.taskId,
          result: result
        });
      });
    }
  }
}

// optimizeWorkerThreads();
```

worker_threads模块为Node.js应用提供了真正的多线程能力，适合CPU密集型任务、并行数据处理等场景。通过合理使用工作线程，可以充分利用多核CPU资源，提高应用性能。

## 线程与进程的适用场景

Node.js提供了多种并发处理选项，在设计应用架构时，合理选择线程或进程模型至关重要。本节分析不同场景下的最佳选择。

### 场景对比分析

以下表格比较了不同场景中线程与进程的适用性：

| 特性/需求 | 子进程 (child_process) | 工作线程 (worker_threads) | 集群 (cluster) |
|---------|----------------------|------------------------|---------------|
| 内存隔离 | ✅ 完全隔离 | ❌ 共享内存 | ✅ 完全隔离 |
| 崩溃影响 | ✅ 单进程崩溃不影响其他 | ❌ 可能影响整个进程 | ✅ 单进程崩溃不影响其他 |
| 内存消耗 | ❌ 较高 | ✅ 较低 | ❌ 较高 |
| 启动开销 | ❌ 较高 | ✅ 较低 | ❌ 较高 |
| IPC性能 | ❌ 需序列化/反序列化 | ✅ 可直接共享内存 | ❌ 需序列化/反序列化 |
| 适合负载均衡 | ⚠️ 需额外实现 | ❌ 不适合 | ✅ 内置支持 |

### CPU密集型任务

对于计算密集型操作，工作线程通常是最佳选择：

```js
/**
 * CPU密集型任务对比：线程 vs 进程
 */
function cpuIntensiveComparison() {
  const { fork } = require('child_process');
  const { Worker } = require('worker_threads');
  const os = require('os');
  const fs = require('fs');
  
  // 创建测试脚本
  const createTestScript = () => {
    const threadScript = `
      // cpu-worker-thread.js
      const { parentPort, workerData } = require('worker_threads');
      
      function calculatePrimes(max) {
        const primes = [];
        for (let i = 2; i <= max; i++) {
          let isPrime = true;
          for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
              isPrime = false;
              break;
            }
          }
          if (isPrime) {
            primes.push(i);
          }
        }
        return primes.length;
      }
      
      parentPort.once('message', ({ maxNumber }) => {
        const start = Date.now();
        const count = calculatePrimes(maxNumber);
        const duration = Date.now() - start;
        
        parentPort.postMessage({
          count,
          duration,
          workerType: 'thread'
        });
      });
    `;
    
    const processScript = `
      // cpu-worker-process.js
      function calculatePrimes(max) {
        const primes = [];
        for (let i = 2; i <= max; i++) {
          let isPrime = true;
          for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
              isPrime = false;
              break;
            }
          }
          if (isPrime) {
            primes.push(i);
          }
        }
        return primes.length;
      }
      
      process.on('message', ({ maxNumber }) => {
        const start = Date.now();
        const count = calculatePrimes(maxNumber);
        const duration = Date.now() - start;
        
        process.send({
          count,
          duration,
          workerType: 'process'
        });
      });
    `;
    
    fs.writeFileSync('cpu-worker-thread.js', threadScript);
    fs.writeFileSync('cpu-worker-process.js', processScript);
  };
  
  // 运行对比测试
  const runComparisonTest = async () => {
    createTestScript();
    
    const maxNumber = 1000000; // 计算100万以内的素数
    const concurrentWorkers = os.cpus().length; // 使用CPU核心数量的工作单元
    
    console.log(`CPU核心数: ${concurrentWorkers}`);
    console.log(`计算 ${maxNumber} 以内的素数`);
    
    // 使用工作线程的测试
    console.time('工作线程总耗时');
    
    const runThreadTest = () => {
      return new Promise((resolve) => {
        const workers = [];
        let completedWorkers = 0;
        const results = [];
        
        for (let i = 0; i < concurrentWorkers; i++) {
          const worker = new Worker('./cpu-worker-thread.js');
          workers.push(worker);
          
          worker.on('message', (result) => {
            results.push(result);
            completedWorkers++;
            
            if (completedWorkers === concurrentWorkers) {
              // 所有工作线程已完成
              const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
              console.log(`工作线程平均耗时: ${totalDuration}ms`);
              
              // 终止所有线程
              workers.forEach(w => w.terminate());
              resolve();
            }
          });
          
          // 发送任务
          worker.postMessage({ maxNumber });
        }
      });
    };
    
    await runThreadTest();
    console.timeEnd('工作线程总耗时');
    
    // 使用子进程的测试
    console.time('子进程总耗时');
    
    const runProcessTest = () => {
      return new Promise((resolve) => {
        const processes = [];
        let completedProcesses = 0;
        const results = [];
        
        for (let i = 0; i < concurrentWorkers; i++) {
          const childProcess = fork('./cpu-worker-process.js');
          processes.push(childProcess);
          
          childProcess.on('message', (result) => {
            results.push(result);
            completedProcesses++;
            
            if (completedProcesses === concurrentWorkers) {
              // 所有子进程已完成
              const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
              console.log(`子进程平均耗时: ${totalDuration}ms`);
              
              // 终止所有进程
              processes.forEach(p => p.kill());
              resolve();
            }
          });
          
          // 发送任务
          childProcess.send({ maxNumber });
        }
      });
    };
    
    await runProcessTest();
    console.timeEnd('子进程总耗时');
    
    // 清理测试文件
    fs.unlinkSync('cpu-worker-thread.js');
    fs.unlinkSync('cpu-worker-process.js');
  };
  
  // 运行对比测试
  // runComparisonTest();
  console.log('取消注释以运行性能对比测试');
}

// cpuIntensiveComparison();
```

### I/O密集型任务

对于I/O密集型任务，子进程通常更合适：

```js
/**
 * I/O密集型任务示例
 */
function ioIntensiveExample() {
  const { fork } = require('child_process');
  const { Worker } = require('worker_threads');
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  
  // 创建测试目录和文件
  const setupTestFiles = () => {
    const testDir = path.join(os.tmpdir(), 'node-io-test');
    
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    // 创建10个测试文件，每个1MB
    for (let i = 0; i < 10; i++) {
      const filePath = path.join(testDir, `test-file-${i}.txt`);
      const buffer = Buffer.alloc(1024 * 1024, `测试内容 ${i}`);
      fs.writeFileSync(filePath, buffer);
    }
    
    return testDir;
  };
  
  // 创建工作线程脚本
  const createThreadScript = () => {
    const script = `
      // io-worker-thread.js
      const fs = require('fs');
      const { parentPort, workerData } = require('worker_threads');
      
      parentPort.once('message', ({ filePaths }) => {
        const start = Date.now();
        const results = [];
        
        // 处理所有分配的文件
        for (const filePath of filePaths) {
          try {
            // 读取文件内容
            const content = fs.readFileSync(filePath);
            
            // 计算简单的校验和
            let checksum = 0;
            for (let i = 0; i < content.length; i++) {
              checksum += content[i];
            }
            
            results.push({
              filePath,
              size: content.length,
              checksum
            });
          } catch (error) {
            results.push({
              filePath,
              error: error.message
            });
          }
        }
        
        parentPort.postMessage({
          results,
          duration: Date.now() - start
        });
      });
    `;
    
    fs.writeFileSync('io-worker-thread.js', script);
  };
  
  // 创建子进程脚本
  const createProcessScript = () => {
    const script = `
      // io-worker-process.js
      const fs = require('fs');
      
      process.on('message', ({ filePaths }) => {
        const start = Date.now();
        const results = [];
        
        // 处理所有分配的文件
        for (const filePath of filePaths) {
          try {
            // 读取文件内容
            const content = fs.readFileSync(filePath);
            
            // 计算简单的校验和
            let checksum = 0;
            for (let i = 0; i < content.length; i++) {
              checksum += content[i];
            }
            
            results.push({
              filePath,
              size: content.length,
              checksum
            });
          } catch (error) {
            results.push({
              filePath,
              error: error.message
            });
          }
        }
        
        process.send({
          results,
          duration: Date.now() - start
        });
      });
    `;
    
    fs.writeFileSync('io-worker-process.js', script);
  };
  
  // 运行对比测试
  const runIoComparisonTest = async () => {
    const testDir = setupTestFiles();
    createThreadScript();
    createProcessScript();
    
    // 获取所有测试文件
    const filePaths = fs.readdirSync(testDir)
      .filter(file => file.startsWith('test-file-'))
      .map(file => path.join(testDir, file));
    
    console.log(`准备处理 ${filePaths.length} 个文件`);
    
    // 使用工作线程测试
    console.time('工作线程IO测试');
    
    const runThreadIOTest = () => {
      return new Promise((resolve) => {
        const worker = new Worker('./io-worker-thread.js');
        
        worker.on('message', (result) => {
          console.log(`工作线程处理完成，耗时: ${result.duration}ms`);
          worker.terminate();
          resolve(result);
        });
        
        // 发送所有文件路径
        worker.postMessage({ filePaths });
      });
    };
    
    await runThreadIOTest();
    console.timeEnd('工作线程IO测试');
    
    // 使用子进程测试
    console.time('子进程IO测试');
    
    const runProcessIOTest = () => {
      return new Promise((resolve) => {
        const childProcess = fork('./io-worker-process.js');
        
        childProcess.on('message', (result) => {
          console.log(`子进程处理完成，耗时: ${result.duration}ms`);
          childProcess.kill();
          resolve(result);
        });
        
        // 发送所有文件路径
        childProcess.send({ filePaths });
      });
    };
    
    await runProcessIOTest();
    console.timeEnd('子进程IO测试');
    
    // 清理测试文件
    for (const filePath of filePaths) {
      fs.unlinkSync(filePath);
    }
    
    fs.rmdirSync(testDir);
    fs.unlinkSync('io-worker-thread.js');
    fs.unlinkSync('io-worker-process.js');
  };
  
  // runIoComparisonTest();
  console.log('取消注释以运行I/O性能对比测试');
}

// ioIntensiveExample();
```

### 网络应用负载均衡

对于HTTP服务器负载均衡，cluster模块是最佳选择：

```js
/**
 * 网络应用负载均衡示例
 */
function networkLoadBalancingExample() {
  const cluster = require('cluster');
  const http = require('http');
  const os = require('os');
  
  if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    
    console.log(`主进程 ${process.pid} 正在运行`);
    console.log(`启动 ${numCPUs} 个工作进程...`);
    
    // 追踪工作进程状态
    const workers = new Map();
    let totalRequests = 0;
    
    // 创建工作进程
    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      workers.set(worker.id, {
        process: worker,
        id: worker.id,
        pid: worker.process.pid,
        requests: 0,
        startTime: Date.now()
      });
      
      // 处理工作进程消息
      worker.on('message', (message) => {
        if (message.cmd === 'REQUEST_PROCESSED') {
          // 更新请求计数
          const workerState = workers.get(worker.id);
          if (workerState) {
            workerState.requests++;
            totalRequests++;
            
            // 周期性打印状态报告
            if (totalRequests % 100 === 0) {
              console.log(`总请求数: ${totalRequests}`);
              for (const [id, state] of workers.entries()) {
                const uptime = Math.round((Date.now() - state.startTime) / 1000);
                console.log(`工作进程 ${state.pid}: ${state.requests} 请求, 运行时间: ${uptime}s`);
              }
            }
          }
        }
      });
    }
    
    // 处理工作进程退出
    cluster.on('exit', (worker, code, signal) => {
      console.log(`工作进程 ${worker.process.pid} 退出：${code} (${signal || 'no signal'})`);
      workers.delete(worker.id);
      
      // 创建新的工作进程替换退出的进程
      const newWorker = cluster.fork();
      workers.set(newWorker.id, {
        process: newWorker,
        id: newWorker.id,
        pid: newWorker.process.pid,
        requests: 0,
        startTime: Date.now()
      });
    });
    
    // 处理信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 优雅关闭
    function gracefulShutdown(signal) {
      console.log(`收到 ${signal}，开始优雅关闭...`);
      
      // 通知所有工作进程关闭
      for (const [id, state] of workers.entries()) {
        state.process.send({ cmd: 'SHUTDOWN' });
      }
      
      // 设置超时以防止永久挂起
      setTimeout(() => {
        console.log('强制关闭所有工作进程');
        for (const [id, state] of workers.entries()) {
          state.process.kill('SIGKILL');
        }
        process.exit(1);
      }, 5000);
    }
    
  } else {
    // 工作进程代码
    console.log(`工作进程 ${process.pid} 已启动`);
    
    // 创建HTTP服务器
    const server = http.createServer((req, res) => {
      // 模拟一些工作
      let sum = 0;
      for(let i = 0; i < 1000000; i++) {
        sum += i;
      }
      
      // 发送响应
      res.writeHead(200);
      res.end(`工作进程 ${process.pid} 处理了请求，耗时: ${sum.toFixed(2)}ms\n`);
      
      // 通知主进程
      process.send({
        event: 'REQUEST_PROCESSED',
        pid: process.pid,
        timestamp: Date.now()
      });
    });
    
    // 监听消息
    process.on('message', (message) => {
      if (message.cmd === 'SHUTDOWN') {
        console.log(`工作进程 ${process.pid} 收到关闭命令`);
        
        // 停止接受新连接
        server.close(() => {
          console.log(`工作进程 ${process.pid} 已关闭连接`);
          process.exit(0);
        });
        
        // 设置超时
        setTimeout(() => {
          console.log(`工作进程 ${process.pid} 超时，强制退出`);
          process.exit(1);
        }, 3000);
      }
    });
    
    // 监听端口
    server.listen(8000, () => {
      console.log(`工作进程 ${process.pid} 正在监听端口 8000`);
    });
    
    // 处理未捕获异常
    process.on('uncaughtException', (err) => {
      console.error(`工作进程 ${process.pid} 未捕获异常:`, err);
      server.close(() => process.exit(1));
    });
  }
}

// networkLoadBalancingExample();
```

### 线程与进程实际应用决策

在选择线程还是进程时，可以遵循以下决策流程：

```js
/**
 * 多线程/多进程决策助手
 * @param {Object} requirements 应用需求
 * @returns {string} 推荐方案
 */
function decisionHelper(requirements) {
  const {
    isCpuIntensive,     // 是否CPU密集型
    isIoIntensive,      // 是否I/O密集型
    needsIsolation,     // 是否需要内存隔离
    isWebServer,        // 是否Web服务器
    dataSize,           // 处理数据大小(MB)
    expectedCrashes,    // 预期崩溃频率(1-10)
    needsSharedMemory   // 是否需要共享内存
  } = requirements;
  
  // 决策逻辑
  if (isWebServer) {
    return "使用cluster模块实现负载均衡";
  }
  
  if (isCpuIntensive) {
    if (needsIsolation || expectedCrashes > 7) {
      return "使用child_process模块，每个CPU核心一个进程";
    } else {
      return "使用worker_threads模块，每个CPU核心一个线程";
    }
  }
  
  if (isIoIntensive) {
    if (needsSharedMemory && dataSize > 100) {
      return "使用worker_threads以共享大型内存缓冲区";
    } else {
      return "使用child_process以获得更好的隔离性";
    }
  }
  
  if (needsSharedMemory) {
    return "使用worker_threads以高效共享内存";
  }
  
  if (needsIsolation || expectedCrashes > 5) {
    return "使用child_process以获得更好的隔离性和错误恢复";
  }
  
  // 默认情况
  return "使用worker_threads以获得更低的资源消耗";
}

// 示例用法
function demonstrateDecisionHelper() {
  const scenarios = [
    {
      name: "CPU密集型数据分析",
      requirements: {
        isCpuIntensive: true,
        isIoIntensive: false,
        needsIsolation: false,
        isWebServer: false,
        dataSize: 50,
        expectedCrashes: 3,
        needsSharedMemory: true
      }
    },
    {
      name: "高流量Web API服务器",
      requirements: {
        isCpuIntensive: false,
        isIoIntensive: true,
        needsIsolation: true,
        isWebServer: true,
        dataSize: 10,
        expectedCrashes: 2,
        needsSharedMemory: false
      }
    },
    {
      name: "大文件处理服务",
      requirements: {
        isCpuIntensive: false,
        isIoIntensive: true,
        needsIsolation: false,
        isWebServer: false,
        dataSize: 2000,
        expectedCrashes: 4,
        needsSharedMemory: true
      }
    },
    {
      name: "实验性代码执行环境",
      requirements: {
        isCpuIntensive: true,
        isIoIntensive: true,
        needsIsolation: true,
        isWebServer: false,
        dataSize: 5,
        expectedCrashes: 9,
        needsSharedMemory: false
      }
    }
  ];
  
  console.log("线程与进程决策助手:");
  console.log("------------------------");
  
  scenarios.forEach(scenario => {
    const decision = decisionHelper(scenario.requirements);
    console.log(`场景: ${scenario.name}`);
    console.log(`推荐: ${decision}`);
    console.log("------------------------");
  });
}

// demonstrateDecisionHelper();
```

通过理解不同场景下线程与进程的优缺点，可以为应用选择最合适的并发模型，优化性能和资源利用。

## 实战建议与最佳实践

基于前面的讨论，这里总结一些在实际项目中使用Node.js线程和进程的最佳实践和建议。

### 进程与线程管理策略

在生产环境中，有效管理线程和进程对于应用的稳定性至关重要：

```js
/**
 * 进程管理最佳实践示例
 */
function processManagementPractices() {
  const { fork } = require('child_process');
  const os = require('os');
  const numCPUs = os.cpus().length;
  
  /**
   * 创建进程池
   * @param {string} scriptPath 脚本路径
   * @param {number} poolSize 池大小
   * @param {Object} options 选项
   */
  function createProcessPool(scriptPath, poolSize = numCPUs, options = {}) {
    const pool = [];
    const taskQueue = [];
    const busyProcesses = new Set();
    
    // 创建进程
    for (let i = 0; i < poolSize; i++) {
      const child = fork(scriptPath, [], options);
      
      child.on('message', (message) => {
        if (message.type === 'task_complete') {
          // 进程已完成任务，可以接受新任务
          busyProcesses.delete(child);
          
          // 如果队列中有等待的任务，立即分配
          if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift();
            assignTaskToProcess(child, nextTask);
          }
        }
      });
      
      child.on('exit', (code) => {
        console.log(`进程 ${child.pid} 退出，代码: ${code}`);
        
        // 从池中移除
        const index = pool.indexOf(child);
        if (index !== -1) {
          pool.splice(index, 1);
          busyProcesses.delete(child);
        }
        
        // 创建新进程替换
        const newChild = fork(scriptPath, [], options);
        pool.push(newChild);
        
        // 设置相同的事件处理器
        newChild.on('message', (message) => {
          // 与上面相同的处理逻辑
        });
        
        newChild.on('exit', (code) => {
          // 递归处理退出事件
        });
      });
      
      pool.push(child);
    }
    
    // 分配任务给进程
    function assignTaskToProcess(process, task) {
      busyProcesses.add(process);
      process.send({
        type: 'task',
        payload: task
      });
    }
    
    // 提交任务
    function submitTask(task) {
      return new Promise((resolve, reject) => {
        // 创建带有回调的任务对象
        const taskWithCallback = {
          ...task,
          callback: (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        };
        
        // 查找空闲进程
        const availableProcess = pool.find(p => !busyProcesses.has(p));
        
        if (availableProcess) {
          // 立即分配
          assignTaskToProcess(availableProcess, taskWithCallback);
        } else {
          // 加入等待队列
          taskQueue.push(taskWithCallback);
        }
      });
    }
    
    // 关闭所有进程
    function shutdown() {
      for (const child of pool) {
        child.kill();
      }
    }
    
    return {
      submitTask,
      shutdown,
      getStats: () => ({
        poolSize: pool.length,
        busyProcesses: busyProcesses.size,
        queuedTasks: taskQueue.length
      })
    };
  }
  
  // 示例工作进程脚本
  // work-processor.js
  /*
  process.on('message', (message) => {
    if (message.type === 'task') {
      const task = message.payload;
      
      // 执行任务
      setTimeout(() => {
        // 模拟任务完成
        const result = { success: true, data: `已处理: ${task.id}` };
        
        // 发送任务完成通知
        process.send({ 
          type: 'task_complete',
          taskId: task.id,
          result: result 
        });
      }, 1000);
    }
  });
  */
  
  // 使用进程池
  async function useProcessPool() {
    // 创建进程池
    const pool = createProcessPool('./work-processor.js');
    
    // 提交多个任务
    const results = await Promise.all([
      pool.submitTask({ id: 1, data: '任务1' }),
      pool.submitTask({ id: 2, data: '任务2' }),
      pool.submitTask({ id: 3, data: '任务3' }),
      pool.submitTask({ id: 4, data: '任务4' }),
      pool.submitTask({ id: 5, data: '任务5' }),
    ]);
    
    console.log('所有任务结果:', results);
    
    // 获取池状态
    console.log('池状态:', pool.getStats());
    
    // 关闭池
    pool.shutdown();
  }
}
```

### 资源监控与自动恢复

生产环境中的关键是要监控资源使用并实现自动恢复机制：

```js
/**
 * 资源监控与自动恢复示例
 */
function resourceMonitoringExample() {
  const { fork } = require('child_process');
  const os = require('os');
  
  /**
   * 创建带监控的工作进程
   * @param {string} scriptPath 脚本路径
   * @param {Object} options 选项
   */
  function createMonitoredWorker(scriptPath, options = {}) {
    // 默认选项
    const defaults = {
      memoryLimit: 200, // MB
      cpuLimit: 90,     // % CPU使用率
      checkInterval: 10000, // 10秒
      restartDelay: 1000,   // 1秒
      maxRestarts: 5,       // 最大重启次数
      restartWindow: 60000, // 1分钟内
    };
    
    const settings = { ...defaults, ...options };
    let worker = null;
    let monitoring = null;
    const restarts = [];
    
    function startWorker() {
      worker = fork(scriptPath);
      
      console.log(`工作进程已启动, PID: ${worker.pid}`);
      
      // 设置事件处理器
      worker.on('exit', (code, signal) => {
        console.log(`工作进程退出，代码: ${code}, 信号: ${signal || 'none'}`);
        worker = null;
        
        // 检查是否需要自动重启
        if (!shouldAutoRestart()) {
          console.log('达到重启限制，不再自动重启');
          stopMonitoring();
          return;
        }
        
        console.log(`将在 ${settings.restartDelay}ms 后重启工作进程`);
        setTimeout(startWorker, settings.restartDelay);
      });
      
      // 启动监控
      startMonitoring();
    }
    
    // 判断是否应该自动重启
    function shouldAutoRestart() {
      const now = Date.now();
      
      // 记录重启时间
      restarts.push(now);
      
      // 清理旧的重启记录
      while (restarts.length > 0 && restarts[0] < now - settings.restartWindow) {
        restarts.shift();
      }
      
      // 检查一定时间窗口内的重启次数
      return restarts.length <= settings.maxRestarts;
    }
    
    // 启动资源监控
    function startMonitoring() {
      if (monitoring) {
        clearInterval(monitoring);
      }
      
      monitoring = setInterval(() => {
        if (!worker) return;
        
        // 获取进程资源使用情况
        try {
          // 注意：这需要安装额外的npm包如pidusage
          // const stats = pidusage.stat(worker.pid);
          
          // 模拟检查结果
          const memoryUsage = worker.process.memoryUsage
            ? worker.process.memoryUsage().rss / (1024 * 1024)
            : process.memoryUsage().rss / (1024 * 1024);
          
          // 检查内存使用
          if (memoryUsage > settings.memoryLimit) {
            console.log(`内存使用超过限制: ${memoryUsage.toFixed(2)}MB > ${settings.memoryLimit}MB`);
            restartWorker();
          }
          
          // 检查CPU使用在真实环境中需要使用工具如pidusage
        } catch (err) {
          console.error('监控错误:', err);
        }
      }, settings.checkInterval);
    }
    
    // 停止监控
    function stopMonitoring() {
      if (monitoring) {
        clearInterval(monitoring);
        monitoring = null;
      }
    }
    
    // 重启工作进程
    function restartWorker() {
      if (!worker) return;
      
      console.log(`正在重启工作进程 ${worker.pid}...`);
      
      // 发送信号，优雅关闭
      worker.send({ cmd: 'shutdown' });
      
      // 设置强制终止超时
      const forceKillTimeout = setTimeout(() => {
        if (worker) {
          console.log('工作进程未能优雅关闭，强制终止');
          worker.kill('SIGKILL');
        }
      }, 5000);
      
      // 一旦进程退出，清除定时器
      worker.once('exit', () => {
        clearTimeout(forceKillTimeout);
      });
    }
    
    // 对外API
    return {
      start: startWorker,
      restart: restartWorker,
      stop: () => {
        stopMonitoring();
        if (worker) {
          worker.kill();
          worker = null;
        }
      },
      isRunning: () => !!worker,
      getProcess: () => worker
    };
  }
  
  // 使用示例
  function useMonitoredWorker() {
    // 创建监控工作进程
    const monitoredWorker = createMonitoredWorker('./resource-worker.js', {
      memoryLimit: 100,
      checkInterval: 5000
    });
    
    // 启动工作进程
    monitoredWorker.start();
    
    // 30秒后停止
    setTimeout(() => {
      console.log('停止工作进程');
      monitoredWorker.stop();
    }, 30000);
  }
}
```

### 混合架构设计模式

在复杂应用中，常常需要混合使用进程和线程来优化性能：

```js
/**
 * 混合架构设计模式
 */
function hybridArchitecturePattern() {
  // 分层架构示例
  function layeredArchitecture() {
    /*
    ┌─────────────────────────────────────────┐
    │             主进程 (Master)             │
    │  - 处理请求路由                         │
    │  - 管理工作进程                         │
    │  - 监控系统状态                         │
    └─────────────────┬───────────────────────┘
            ┌─────────┴─────────┐
            ▼                   ▼
    ┌───────────────┐   ┌───────────────┐
    │  API进程      │   │  工作进程     │   ...
    │  (Express)    │   │  (任务处理)  │
    └───────┬───────┘   └───────┬───────┘
            │                   │
      ┌─────▼────┐        ┌─────▼────┐
      │ 线程池   │        │ 线程池   │
      │ CPU密集型│        │ CPU密集型│
      └──────────┘        └──────────┘
    */
    
    // 实现代码需要根据具体应用场景定制
  }
  
  // 微服务架构示例
  function microserviceArchitecture() {
    /*
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ 用户服务    │  │ 产品服务    │  │ 订单服务    │
    │ (进程集群)  │  │ (进程集群)  │  │ (进程集群)  │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────┬───────┴────────┬───────┘
                    │                │
           ┌────────▼───────┐ ┌──────▼────────┐
           │ 消息队列      │ │ 服务发现      │
           │ (Redis/Kafka) │ │ (Consul/etcd) │
           └────────────────┘ └───────────────┘
    */
    
    // 实现代码需要根据具体应用场景定制
  }
}
```

### 部署与运维策略

生产环境部署需要特别注意进程管理、日志收集和监控：

```js
/**
 * 部署与运维最佳实践
 */
function deploymentPractices() {
  // PM2配置示例
  const pm2Config = {
    name: "node-app",
    script: "./server.js",
    instances: "max", // 使用所有可用CPUs
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 8000
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    merge_logs: true,
    // 自动重启设置
    autorestart: true,
    // 崩溃延迟
    restart_delay: 1000,
    // 最大重启次数
    max_restarts: 10
  };
  
  // 输出PM2配置文件
  function generatePM2Config() {
    console.log('PM2生产环境配置:');
    console.log(JSON.stringify(pm2Config, null, 2));
    
    // 保存为ecosystem.config.js文件
    // const fs = require('fs');
    // fs.writeFileSync('ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)};`);
  }
  
  // 健康检查端点示例
  function healthCheckExample() {
    const express = require('express');
    const app = express();
    
    app.get('/health', (req, res) => {
      const status = {
        service: 'node-app',
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        connections: req.connection.server._connections,
        timestamp: new Date()
      };
      
      res.json(status);
    });
    
    app.listen(3001, () => {
      console.log('健康检查服务运行在端口3001');
    });
  }
  
  // Kubernetes部署示例
  const k8sDeployment = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
      - name: node-app
        image: node-app:latest
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
  `;
}
```

### 关键性能优化建议

最后，总结一些性能优化的关键点：

1. **找出CPU瓶颈**: 使用性能分析工具定位瓶颈，将计算密集型任务移至工作线程
   ```js
   // 使用0x生成火焰图分析CPU瓶颈
   // npm install -g 0x
   // 0x -o server.js
   ```

2. **合理使用线程池大小**: 避免创建过多线程导致上下文切换开销
   ```js
   // 推荐线程池大小为CPU核心数的1-2倍
   const numThreads = Math.min(os.cpus().length * 2, 16);
   ```

3. **优化进程间通信**: 减少数据序列化/反序列化开销
   ```js
   // 仅传输必要数据，避免大对象
   // 考虑使用专用序列化格式如Protocol Buffers
   ```

4. **适当的任务分解**: 将大任务分解为小块，避免阻塞事件循环
   ```js
   // 例如，处理大文件时按块处理
   const chunkSize = 64 * 1024; // 64KB
   ```

5. **监控内存泄漏**: 定期检查进程内存使用
   ```js
   // 定期记录内存使用
   setInterval(() => {
     const memUsage = process.memoryUsage();
     console.log(`RSS: ${memUsage.rss / 1024 / 1024} MB`);
   }, 30000);
   ```

6. **实现优雅关闭**: 确保进程可以干净地关闭，不丢失数据
   ```js
   // 在主进程中
   process.on('SIGTERM', gracefulShutdown);
   process.on('SIGINT', gracefulShutdown);
   
   function gracefulShutdown() {
     console.log('优雅关闭中...');
     // 停止接受新连接
     server.close(() => {
       // 关闭数据库连接
       // 完成进行中的任务
       process.exit(0);
     });
   }
   ```

通过综合应用这些最佳实践，可以构建出高性能、稳定可靠的Node.js应用，充分发挥多核CPU的优势。

---

> 参考资料：[Node.js child_process官方文档](https://nodejs.org/api/child_process.html) 、[Node.js worker_threads官方文档](https://nodejs.org/api/worker_threads.html) 