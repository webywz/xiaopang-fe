---
title: 常见设计模式
---

/**
 * @file 常见设计模式
 * @description 详细介绍Solidity智能合约开发中的常见设计模式，包括所有权、代理、支付、紧急停止、单例、工厂等，适合初学者和有经验开发者查阅。
 */

# 常见设计模式

Solidity 合约开发中，合理运用设计模式可以提升代码安全性、可维护性和可扩展性。以下为常用模式及其实现方式。

## 1. 所有权模式

### 1.1 Ownable合约
- 通过 owner 状态变量和 onlyOwner 修饰符实现权限控制。
- 推荐使用 OpenZeppelin 的 Ownable 合约。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ownable {
  address public owner;
  constructor() { owner = msg.sender; }
  modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), "新owner不能为空");
    owner = newOwner;
  }
}
```

### 1.2 权限控制
- 可扩展多级权限（如管理员、操作员等）。
- 推荐使用 OpenZeppelin 的 AccessControl。

## 2. 代理与升级模式

### 2.1 代理合约原理
- 通过 delegatecall 将调用转发到逻辑合约，实现合约升级。
- 推荐使用 OpenZeppelin 的 Transparent Proxy 或 UUPS Proxy。

### 2.2 升级合约实现
- 逻辑合约升级时，数据保留在代理合约，逻辑可替换。
- 升级需严格权限控制，防止被恶意升级。

## 3. 拉取支付与推送支付

### 3.1 Pull Payment（拉取支付）
- 用户主动提取资金，降低重入攻击风险。

```solidity
mapping(address => uint) public pending;

function withdraw() public {
  uint amount = pending[msg.sender];
  require(amount > 0, "无可提取余额");
  pending[msg.sender] = 0;
  payable(msg.sender).transfer(amount);
}
```

### 3.2 Push Payment（推送支付）
- 合约主动向用户转账，需注意重入风险。

## 4. 紧急停止（Pausable）模式
- 通过 paused 状态变量和 whenNotPaused 修饰符实现合约暂停。
- 推荐使用 OpenZeppelin 的 Pausable 合约。

```solidity
bool public paused;
modifier whenNotPaused() { require(!paused, "已暂停"); _; }
function pause() public onlyOwner { paused = true; }
function unpause() public onlyOwner { paused = false; }
```

## 5. 其他常用设计模式

### 5.1 单例模式
- 通过合约工厂限制同一地址只能部署一个实例。

### 5.2 工厂模式
- 工厂合约批量部署和管理子合约。

```solidity
contract Child { address public owner; constructor(address _owner) { owner = _owner; } }
contract Factory {
  Child[] public children;
  function createChild() public {
    Child child = new Child(msg.sender);
    children.push(child);
  }
}
```

## 6. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PausableDemo {
  bool public paused;
  address public owner;
  constructor() { owner = msg.sender; }
  modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
  modifier whenNotPaused() { require(!paused, "已暂停"); _; }
  function pause() public onlyOwner { paused = true; }
  function unpause() public onlyOwner { paused = false; }
  function doSomething() public whenNotPaused {
    // 业务逻辑
  }
}
```

## 7. 常见问题与最佳实践
- **优先使用开源实现（如OpenZeppelin）**，避免重复造轮子。
- **权限和升级相关操作需严格控制**，建议多签或延时机制。
- **拉取支付优于推送支付**，可防止重入攻击。
- **紧急停止功能建议所有重要合约都实现**。
- **设计模式应配合注释和文档**，便于团队协作和安全审计。

---

如需深入了解各类设计模式的高级用法和实战案例，可参考官方文档或本教程后续章节。 