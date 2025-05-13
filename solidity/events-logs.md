---
title: 事件与日志
---

/**
 * @file 事件与日志
 * @description 详细介绍Solidity中事件的定义、触发、链上日志的作用及前端监听方法，适合初学者和有经验开发者查阅。
 */

# 事件与日志

Solidity 事件（Event）是智能合约与区块链外部世界（如前端DApp）通信的重要机制。事件会在区块链日志中记录，便于前端监听和响应。

## 1. 事件的定义与声明

- 使用 `event` 关键字声明事件。
- 事件参数可加 `indexed` 修饰，便于按参数过滤。

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event StatusChanged(uint indexed id, string status);
```

## 2. 事件的触发与监听

- 使用 `emit` 关键字触发事件。
- 事件会被记录在区块链日志中，供前端或后端监听。

```solidity
function transfer(address to, uint256 value) public {
  // ... 业务逻辑 ...
  emit Transfer(msg.sender, to, value);
}
```

## 3. 日志的作用与应用场景

- 事件日志不会影响链上状态，主要用于通知、追踪、前端交互。
- 常见场景：转账通知、状态变更、合约操作记录等。
- 日志可通过区块浏览器、Web3.js/Ethers.js等工具查询。

## 4. 事件与前端交互

- 前端可通过 Web3.js、Ethers.js 等库监听合约事件。
- 监听方式示例（Ethers.js）：

```js
// 假设已获取合约实例 contract
contract.on('Transfer', (from, to, value) => {
  console.log(`转账事件: ${from} -> ${to}, 金额: ${value}`);
});
```

- 也可通过区块浏览器（如Etherscan）查看事件日志。

## 5. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventDemo {
  event Transfer(address indexed from, address indexed to, uint256 value);
  event StatusChanged(uint indexed id, string status);

  function transfer(address to, uint256 value) public {
    emit Transfer(msg.sender, to, value);
  }

  function setStatus(uint id, string memory status) public {
    emit StatusChanged(id, status);
  }
}
```

## 6. 常见问题与最佳实践

- **事件参数建议加indexed**，便于前端按条件过滤。
- **事件不会回滚**，但只有事务成功提交才会被记录。
- **事件日志不可直接被合约读取**，仅供链下系统监听。
- **避免事件参数过多**，每个事件最多3个indexed参数。
- **事件命名应简洁明了**，便于前端开发和维护。

---

如需深入了解事件与日志的底层实现和高级用法，可参考官方文档或本教程后续章节。 