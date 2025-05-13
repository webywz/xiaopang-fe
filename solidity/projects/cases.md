---
title: Solidity 项目案例精选
---

/**
 * @file Solidity 项目案例精选
 * @description 精选Token、NFT、DeFi、DAO等Solidity项目案例，配合关键代码、设计要点与实战分析，适合开发者参考与实战。
 */

# Solidity 项目案例精选

本章精选多种典型Solidity项目案例，涵盖主流应用场景，助力开发者理解实际项目结构与关键实现。

## 1. 案例简介与应用场景
- ERC-20代币发行与管理
- NFT铸造与市场
- 简易AMM去中心化交易所
- DAO治理与投票

## 2. 典型案例与关键代码

### 2.1 ERC-20代币发行
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

### 2.2 NFT铸造与市场
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

### 2.3 简易AMM去中心化交易所
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title 简化版AMM流动性池
 */
contract SimpleAMM {
    uint256 public reserve0;
    uint256 public reserve1;
    address public token0;
    address public token1;
    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        reserve0 += amount0;
        reserve1 += amount1;
    }
    function swap(uint256 amountIn, address fromToken) external returns (uint256 amountOut) {
        require(fromToken == token0 || fromToken == token1, "无效Token");
        bool isToken0 = fromToken == token0;
        (uint256 reserveIn, uint256 reserveOut) = isToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        uint256 amountInWithFee = amountIn * 997 / 1000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        if (isToken0) {
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
    }
}
```

### 2.4 DAO治理与投票
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 * @title 简化版DAO治理合约
 */
contract SimpleDAO {
    struct Proposal {
        string description;
        uint256 voteCount;
        bool executed;
    }
    Proposal[] public proposals;
    mapping(address => uint256) public votes;
    address public owner;
    constructor() { owner = msg.sender; }
    function propose(string memory desc) external {
        proposals.push(Proposal(desc, 0, false));
    }
    function vote(uint256 proposalId) external {
        require(votes[msg.sender] == 0, "已投票");
        proposals[proposalId].voteCount++;
        votes[msg.sender] = proposalId + 1;
    }
    function execute(uint256 proposalId) external {
        require(msg.sender == owner, "仅限管理员");
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "已执行");
        require(p.voteCount > 1, "票数不足");
        p.executed = true;
        // 执行提案逻辑（如转账、参数变更等）
    }
}
```

## 3. 设计要点与实战分析
- **合约结构清晰，功能单一，便于维护与扩展**
- **优先选用OpenZeppelin等成熟库，减少安全风险**
- **所有外部输入需校验，防止重入、溢出等攻击**
- **充分测试与审计，关注主流攻击案例与最佳实践**

## 4. 常见问题与注意事项
- **如何选择合适的标准与库？** 优先选用社区主流实现，便于集成与安全。
- **如何保证合约安全？** 关注权限、输入校验、外部调用、升级兼容等。
- **如何优化Gas消耗？** 合理设计存储、批量操作、事件日志等。
- **如何持续学习？** 关注主流项目源码、社区动态与新标准。

---

如需更多案例与实战分析，可参考OpenZeppelin、Uniswap、Aave等主流项目源码与官方文档。 