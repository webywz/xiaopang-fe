---
title: 函数与修饰符
---

/**
 * @file 函数与修饰符
 * @description 详细介绍Solidity中函数的定义、参数、返回值、可见性、状态修饰符、自定义modifier、特殊函数等内容，适合初学者和有经验开发者查阅。
 */

# 函数与修饰符

Solidity 函数是智能合约的核心组成部分，支持丰富的修饰符和灵活的参数、返回值设计。理解函数与修饰符的用法，是编写安全、可维护合约的基础。

## 1. 函数定义

Solidity 使用 `function` 关键字定义函数，支持参数、返回值、可见性、状态修饰符等。

### 1.1 普通函数

```solidity
function add(uint a, uint b) public pure returns (uint) {
  return a + b;
}
```
- 参数类型需显式声明。
- 返回值类型需用 `returns` 指定。

### 1.2 构造函数

- 使用 `constructor()` 定义，仅在合约部署时执行一次。

```solidity
constructor() {
  // 初始化逻辑
}
```

### 1.3 fallback与receive函数

- `fallback()`：接收未知调用或数据时触发。
- `receive()`：仅接收以太币时触发。

```solidity
receive() external payable {}
fallback() external {}
```

## 2. 参数与返回值

### 2.1 参数类型
- 支持值类型、引用类型、结构体、枚举等。
- 支持多参数和多返回值。

```solidity
function swap(uint a, uint b) public pure returns (uint, uint) {
  return (b, a);
}
```

### 2.2 返回值类型
- 返回值需用 `returns` 明确声明类型。
- 支持命名返回值。

```solidity
function getInfo() public view returns (address owner, uint balance) {
  owner = msg.sender;
  balance = address(this).balance;
}
```

## 3. 可见性与修饰符

### 3.1 可见性修饰符
- `public`：任何人和合约可调用。
- `external`：仅外部调用（合约外部或其他合约）。
- `internal`：仅本合约及继承合约可调用。
- `private`：仅本合约可调用。

### 3.2 状态修饰符
- `view`：只读，不修改状态。
- `pure`：不读也不写状态。
- `payable`：可接收以太币。

### 3.3 自定义修饰符（modifier）
- 用于复用权限控制、前置/后置检查等逻辑。

```solidity
modifier onlyOwner() {
  require(msg.sender == owner, "Not owner");
  _;
}

function withdraw() public onlyOwner {
  // 只有owner能调用
}
```

## 4. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FunctionDemo {
  address public owner;
  uint public value;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  function setValue(uint _v) public onlyOwner {
    value = _v;
  }

  function getValue() public view returns (uint) {
    return value;
  }

  function add(uint a, uint b) public pure returns (uint) {
    return a + b;
  }

  receive() external payable {}
}
```

## 5. 常见问题与最佳实践

- **所有函数和变量都应显式声明可见性**，避免默认 public 带来的安全隐患。
- **payable** 仅用于需要接收以太币的函数。
- **modifier** 可极大提升权限控制和代码复用性。
- **external** 适合大数组参数，gas 更低。
- **view/pure** 可节省 gas，建议合理使用。
- **构造函数不可重载**，且仅执行一次。
- **fallback/receive** 建议都实现，提升合约健壮性。

---

如需深入了解函数与修饰符的底层实现和高级用法，可参考官方文档或本教程后续章节。 