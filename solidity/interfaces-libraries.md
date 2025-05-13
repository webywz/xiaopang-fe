---
title: 接口与库
---

<!-- /**
 * @file 接口与库
 * @description 详细介绍Solidity中接口与库的定义、语法、继承、应用场景、最佳实践，适合初学者和有经验开发者查阅。
 */ -->

# 接口与库

Solidity 的接口（interface）和库（library）是实现合约解耦、代码复用和安全性的关键工具。

## 1. 接口（Interface）

### 1.1 接口的定义与语法
- 使用 `interface` 关键字定义。
- 只能声明函数、事件，不能实现逻辑、不能声明状态变量。
- 所有函数默认 external 且不能有实现体。

```solidity
interface IERC20 {
  function totalSupply() external view returns (uint256);
  function balanceOf(address account) external view returns (uint256);
  function transfer(address to, uint256 amount) external returns (bool);
}
```

### 1.2 接口的实现与继承
- 合约通过 `is` 关键字实现接口。
- 支持接口继承，便于扩展标准。

```solidity
contract MyToken is IERC20 {
  // 必须实现所有接口函数
}

interface IChild is IERC20 {
  function burn(uint256 amount) external;
}
```

### 1.3 接口的应用场景
- 标准化合约交互（如ERC20、ERC721）。
- 多合约协作、解耦。
- 便于第三方集成和安全审计。

## 2. 库（Library）

### 2.1 库的定义与语法
- 使用 `library` 关键字定义。
- 不能存储状态变量，不能接收以太币。
- 支持内部函数（internal）和外部函数（public/external）。

```solidity
library Math {
  function add(uint a, uint b) internal pure returns (uint) {
    return a + b;
  }
}
```

### 2.2 使用库的方式（using for）
- `using LibraryName for Type;` 可为类型扩展库函数。

```solidity
using Math for uint;
uint a = 1;
uint b = a.add(2); // 等价于 Math.add(a, 2)
```

### 2.3 库的应用场景
- 复用通用算法（如SafeMath、Strings）。
- 复杂数据结构操作（如EnumerableSet）。
- 提升代码安全性和可维护性。

## 3. 接口与库的最佳实践
- 优先使用社区标准接口（如OpenZeppelin）。
- 库函数应尽量声明为 `internal`，减少外部调用gas消耗。
- 接口和库应单独文件管理，便于复用和维护。
- 合约间交互建议通过接口，提升解耦性和安全性。

## 4. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICounter {
  function count() external view returns (uint);
}

library Math {
  function add(uint a, uint b) internal pure returns (uint) {
    return a + b;
  }
}

contract Demo {
  using Math for uint;
  uint public total;

  function increase(uint value) public {
    total = total.add(value);
  }
}
```

## 5. 常见问题与注意事项
- **接口不能包含实现和状态变量**，只能声明函数和事件。
- **库不能存储状态变量**，不能接收以太币。
- **using for** 语法可提升代码可读性和安全性。
- **优先使用开源库**，如OpenZeppelin的SafeMath、Strings等。
- **接口和库应有良好注释和文档**，便于团队协作。

---

如需深入了解接口与库的高级用法，可参考官方文档或本教程后续章节。 