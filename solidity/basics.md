---
title: Solidity 基础语法
---

/**
 * @file Solidity 基础语法
 * @description 详细介绍Solidity的基本语法，包括变量声明、数据类型、函数定义、可见性修饰符、特殊函数等内容，适合初学者和有经验开发者查阅。
 */

# Solidity 基础语法

Solidity 是以太坊等区块链平台的主流智能合约开发语言，其语法类似于 JavaScript 和 C++，但又有独特的区块链特性。本章将系统讲解 Solidity 的基础语法，为后续深入开发打下坚实基础。

## 1. 变量与类型

Solidity 支持多种变量类型，主要分为：
- **值类型**：包括 `uint`、`int`、`bool`、`address`、`bytes`、`enum` 等。
- **引用类型**：包括 `array`（数组）、`struct`（结构体）、`mapping`（映射）。
- **特殊类型**：如 `function` 类型。

### 1.1 整型与布尔型

- `uint`/`int`：无符号/有符号整数，支持 8~256 位（如 `uint8`、`uint256`）。
- `bool`：布尔类型，取值为 `true` 或 `false`。

```solidity
uint256 public totalSupply = 10000;
bool public isActive = true;
```

### 1.2 地址类型

- `address`：以太坊地址类型，20 字节长度。
- `address payable`：可接收以太币的地址。

```solidity
address public owner;
address payable public wallet;
```

### 1.3 数组与结构体

- 数组：`uint[] public numbers;`
- 结构体：
```solidity
struct User {
  address addr;
  uint balance;
}
User public user;
```

## 2. 函数定义

Solidity 函数由 `function` 关键字声明，支持参数、返回值、可见性修饰符、状态修饰符等。

### 2.1 函数声明与参数

```solidity
function add(uint a, uint b) public pure returns (uint) {
  return a + b;
}
```
- 参数类型需显式声明。
- 返回值类型需用 `returns` 指定。

### 2.2 返回值与可见性

- 可见性修饰符：`public`、`external`、`internal`、`private`。
- 状态修饰符：`view`（只读）、`pure`（不读不写状态）、`payable`（可接收以太币）。

### 2.3 特殊函数（构造函数、fallback、receive）

- 构造函数：`constructor()`，仅在合约部署时执行。
- fallback：接收未知调用或数据时触发。
- receive：仅接收以太币时触发。

```solidity
constructor() {
  owner = msg.sender;
}

receive() external payable {}

fallback() external {}
```

## 3. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BasicDemo {
  address public owner;
  uint256 public total;

  constructor() {
    owner = msg.sender;
    total = 0;
  }

  function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a + b;
  }

  function deposit() public payable {
    total += msg.value;
  }

  receive() external payable {
    total += msg.value;
  }
}
```

## 4. 常见问题与注意事项

- **变量作用域**：局部变量只在函数内有效，状态变量在合约内全局有效。
- **整数溢出**：Solidity 0.8.x 及以上自动检测溢出，低版本需用 SafeMath。
- **可见性修饰符**：建议所有函数和状态变量都显式声明可见性。
- **payable**：只有标记为 `payable` 的函数才能接收以太币。
- **合约部署者**：`msg.sender` 在构造函数中为部署者地址。

---

如需深入了解每个类型、函数或语法细节，可参考官方文档或本教程后续章节。 