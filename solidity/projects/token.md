---
title: 代币合约开发
---

/**
 * @file 代币合约开发
 * @description 详细介绍Solidity实现ERC20、ERC721、ERC1155等主流代币合约的原理、开发流程、安全扩展与最佳实践，适合开发者参考与实战。
 */

# 代币合约开发

## 1. 代币标准概述

### 1.1 ERC20标准
- 同质化代币（Fungible Token）标准，广泛用于主流Token发行。
- 主要接口：`totalSupply`、`balanceOf`、`transfer`、`approve`、`transferFrom`、`allowance`。
- 典型应用：平台币、稳定币、DeFi流通资产。

### 1.2 ERC721标准
- 非同质化代币（NFT）标准，每个Token唯一。
- 主要接口：`ownerOf`、`safeTransferFrom`、`approve`、`tokenURI`。
- 典型应用：数字艺术、游戏资产、门票等。

### 1.3 ERC1155标准
- 多资产标准，支持同一合约下多种Token（同质/非同质）。
- 主要接口：`balanceOf`、`safeTransferFrom`、`safeBatchTransferFrom`。
- 典型应用：游戏、NFT批量发行、资产聚合。

## 2. 代币合约开发流程

### 2.1 标准接口实现
- 推荐使用OpenZeppelin等成熟库，安全可靠。
- 可通过继承ERC20/ERC721/ERC1155快速实现标准功能。

### 2.2 代币发行与销毁
- 发行（Mint）：合约部署时或后续铸造新Token。
- 销毁（Burn）：销毁指定账户的Token，减少总量。

### 2.3 代币转账与授权
- 转账：`transfer`（ERC20）、`safeTransferFrom`（ERC721/1155）。
- 授权：`approve`、`setApprovalForAll`，便于第三方合约操作Token。

## 3. 安全性与合规性

### 3.1 常见安全风险
- 溢出/下溢（Solidity 0.8+已内置检查）
- 重入攻击（如ERC777、ERC721回调）
- 授权滥用（approve/transferFrom被盗用）
- 黑名单/白名单绕过

### 3.2 合规性注意事项
- 遵守当地法律法规，防止非法集资、洗钱等风险
- 透明披露Token分配、销毁、增发等规则
- 关注KYC/AML等合规要求

## 4. 代币合约扩展功能

### 4.1 可升级代币
- 采用代理模式（如UUPS、Transparent Proxy）实现合约逻辑升级
- 注意存储布局兼容与升级权限安全

### 4.2 白名单与黑名单
- 仅允许白名单地址参与转账/铸造/销毁
- 黑名单机制可冻结或阻止特定账户操作

## 5. 示例代码

### 5.1 ERC20 代币
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title 简单ERC20代币
 */
contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```

### 5.2 ERC721 代币
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title 简单NFT合约
 */
contract MyNFT is ERC721 {
    uint256 public nextTokenId;
    constructor() ERC721("MyNFT", "MNFT") {}
    function mint(address to) external {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }
}
```

### 5.3 ERC1155 代币
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/**
 * @title 简单ERC1155合约
 */
contract My1155 is ERC1155 {
    constructor() ERC1155("https://api.example.com/metadata/{id}.json") {}
    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, "");
    }
}
```

## 6. 常见问题与注意事项
- **如何选择代币标准？** 根据业务需求选择ERC20（同质）、ERC721（NFT）、ERC1155（多资产）。
- **如何保证合约安全？** 选用成熟库、充分测试、关注授权与外部调用。
- **如何实现合约升级？** 采用代理模式，注意存储兼容与权限。
- **如何满足合规要求？** 结合白名单、黑名单、KYC等机制，遵守法律法规。
- **如何优化Gas消耗？** 合理设计存储、批量操作、事件日志等。

---

如需深入了解代币合约开发，可参考OpenZeppelin官方文档、EIP标准与主流项目源码。 