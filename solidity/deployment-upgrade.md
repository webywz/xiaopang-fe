---
title: 合约部署与升级
---

<!-- /**
 * @file 合约部署与升级
 * @description 详细介绍Solidity合约的部署流程、升级模式、自动化部署与常用工具，适合初学者和有经验开发者查阅。
 */ -->

# 合约部署与升级

合约部署与升级是智能合约开发生命周期中的重要环节，直接关系到项目的安全性、可维护性和可扩展性。

## 1. 合约部署流程

### 1.1 部署前准备
- 编写和测试合约代码，确保无漏洞。
- 配置好钱包（如MetaMask）、节点（如Infura）、测试网环境。
- 选择合适的部署工具（Remix、Truffle、Hardhat、Foundry等）。

### 1.2 部署到测试网与主网
- 推荐先在测试网（如Goerli、Sepolia）部署，验证合约逻辑。
- 部署到主网前需再次审计和测试。
- 部署命令示例（Hardhat）：

```bash
npx hardhat run scripts/deploy.js --network goerli
```

### 1.3 部署工具
- **Remix**：适合小型项目和快速原型。
- **Truffle/Hardhat/Foundry**：适合团队协作、自动化部署和复杂项目。

## 2. 合约升级模式

### 2.1 代理合约模式（Proxy）
- 通过代理合约与逻辑合约分离，实现合约升级。
- 常用实现：OpenZeppelin的Transparent Proxy、UUPS Proxy。

```solidity
// 伪代码示例
contract Proxy {
  address implementation;
  function upgrade(address newImpl) public { implementation = newImpl; }
  fallback() external { /* delegatecall到implementation */ }
}
```

### 2.2 数据分离与逻辑分离
- 状态变量存储在代理合约，逻辑代码在实现合约。
- 升级时只需更换逻辑合约地址，数据不变。

### 2.3 升级的风险与注意事项
- 升级合约需严格权限控制，防止被恶意升级。
- 逻辑合约升级需兼容原有存储结构，避免数据丢失。
- 推荐使用OpenZeppelin Upgrades插件，减少人为失误。

## 3. 自动化部署实践
- 使用脚本（如Hardhat、Truffle）实现一键部署和升级。
- 可集成CI/CD流程，自动化测试和部署。

## 4. 示例代码

```js
// scripts/deploy.js (Hardhat自动化部署示例)
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Demo = await ethers.getContractFactory("Demo");
  const proxy = await upgrades.deployProxy(Demo, [/* 构造参数 */], { initializer: 'initialize' });
  await proxy.deployed();
  console.log("Proxy合约地址:", proxy.address);
}

main();
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Demo is Initializable {
  uint public value;
  function initialize(uint _v) public initializer {
    value = _v;
  }
  function setValue(uint _v) public {
    value = _v;
  }
}
```

## 5. 常见问题与注意事项
- **升级合约需严格权限控制**，建议仅owner或多签可升级。
- **升级逻辑需兼容原有存储结构**，避免变量顺序变动。
- **自动化部署脚本应充分测试**，防止误操作。
- **主网部署前务必多轮审计和测试**。
- **升级合约后应及时验证新逻辑**，并通知用户。

---

如需深入了解合约升级原理和自动化部署实践，可参考OpenZeppelin官方文档或本教程后续章节。 