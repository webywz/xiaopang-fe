---
title: 主流ERC标准
---

<!-- /**
 * @file 主流ERC标准
 * @description 详细介绍Solidity主流ERC标准（ERC-20、ERC-721、ERC-1155等）的原理、接口、实现、扩展与最佳实践，适合开发者参考。
 */ -->

# 主流ERC标准

以太坊生态中，ERC（Ethereum Request for Comments）标准定义了通用的合约接口，促进了代币、NFT等资产的互操作性。

## 1. ERC标准简介
- ERC标准由社区提出，经过EIP流程审核。
- 统一接口便于钱包、交易所、DApp等集成。

## 2. ERC-20 标准
### 2.1 原理与接口
- 定义了同质化代币（Fungible Token）的基本操作，如转账、授权、余额查询等。

```solidity
/**
 * @dev ERC-20 标准接口
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

### 2.2 典型实现
- 推荐使用OpenZeppelin的ERC20合约。
- 常见扩展：Ownable、Pausable、Burnable、Mintable等。

## 3. ERC-721 标准
### 3.1 原理与接口
- 定义了非同质化代币（NFT）的基本操作，如唯一ID、所有权转移、元数据等。

```solidity
/**
 * @dev ERC-721 标准接口
 */
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}
```

### 3.2 典型实现与扩展
- 推荐使用OpenZeppelin的ERC721合约。
- 常见扩展：ERC721Metadata、ERC721Enumerable、Ownable等。

## 4. ERC-1155 标准
### 4.1 原理与接口
- 支持同一合约下多种代币（同质化与非同质化）管理，适合游戏、NFT批量发行等场景。

```solidity
/**
 * @dev ERC-1155 标准接口
 */
interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external;
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);
}
```

### 4.2 典型实现与应用
- 推荐使用OpenZeppelin的ERC1155合约。
- 适合NFT批量发行、游戏资产等场景。

## 5. 其他常见ERC标准
- **ERC-777**：高级同质化代币标准，支持钩子（hook）机制。
- **ERC-4626**：金库（Vault）标准，便于DeFi协议集成。
- **ERC-2981**：NFT版税标准。

## 6. 代码示例

```solidity
// ERC-20 典型实现（OpenZeppelin）
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

// ERC-721 典型实现（OpenZeppelin）
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    constructor() ERC721("MyNFT", "MNFT") {
        _mint(msg.sender, 1);
    }
}
```

## 7. 最佳实践与常见问题
- **优先选用社区成熟的标准实现**，如OpenZeppelin。
- **扩展功能时保持接口兼容性**，便于集成。
- **注意授权与安全性**，防止approve/transferFrom被滥用。
- **NFT合约建议支持元数据扩展**，提升用户体验。
- **多代币合约需关注批量操作的Gas消耗与安全性**。

---

如需深入了解ERC标准的高级用法，可参考EIP官方文档或本教程后续章节。 