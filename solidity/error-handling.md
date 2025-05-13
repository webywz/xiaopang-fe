---
title: 错误处理
---

/**
 * @file 错误处理
 * @description 详细介绍Solidity中的异常处理、require、assert、revert、自定义错误及最佳实践，适合初学者和有经验开发者查阅。
 */

# 错误处理

Solidity 提供了多种错误处理机制，保障合约安全性和健壮性。合理使用错误处理，有助于防止攻击和业务逻辑漏洞。

## 1. 错误处理机制概述

- Solidity 支持 require、assert、revert 三种主要的错误处理方式。
- 0.8.x 及以上版本支持自定义错误（custom error），更节省 gas。

## 2. require、assert、revert 的区别与用法

### 2.1 require
- 用于参数校验、权限检查、外部调用等。
- 条件不成立时回滚并返还剩余 gas，可自定义错误信息。

```solidity
function transfer(address to, uint amount) public {
  require(to != address(0), "收款地址不能为空");
  require(amount > 0, "转账金额需大于0");
  // ... 业务逻辑 ...
}
```

### 2.2 assert
- 用于检查内部不变量（如状态变量不应被破坏）。
- 条件不成立时回滚，消耗所有 gas，不建议用于参数校验。

```solidity
function safeAdd(uint a, uint b) public pure returns (uint) {
  uint c = a + b;
  assert(c >= a); // 检查溢出
  return c;
}
```

### 2.3 revert
- 主动回滚事务，可自定义错误信息。
- 适合复杂条件下的多分支回滚。

```solidity
function doSomething(bool ok) public pure {
  if (!ok) {
    revert("操作未通过校验");
  }
}
```

## 3. 自定义错误（Solidity 0.8.x+）

- 使用 `error` 关键字声明错误类型，配合 `revert` 使用。
- 比字符串更省 gas，适合大规模合约。

```solidity
error Unauthorized(address caller);

function onlyOwner() public view {
  if (msg.sender != owner) {
    revert Unauthorized(msg.sender);
  }
}
```

## 4. 错误处理最佳实践

- 参数校验优先用 require，内部不变量用 assert。
- 错误信息应简洁明了，便于前端和用户理解。
- 合理使用自定义错误，提升 gas 效率。
- 避免捕获和吞掉错误，保持合约透明性。
- 业务流程复杂时，建议分步校验并及时回滚。

## 5. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error Unauthorized(address caller);

contract ErrorDemo {
  address public owner;

  constructor() {
    owner = msg.sender;
  }

  function setOwner(address newOwner) public {
    require(newOwner != address(0), "新owner不能为空");
    if (msg.sender != owner) {
      revert Unauthorized(msg.sender);
    }
    owner = newOwner;
  }

  function safeAdd(uint a, uint b) public pure returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
}
```

## 6. 常见问题与注意事项

- **require和assert的区别**：require用于外部输入校验，assert用于内部不变量检查。
- **错误信息过长会增加gas消耗**，自定义错误可优化。
- **所有错误处理都会回滚状态**，但事件不会被记录。
- **Solidity不支持try/catch捕获本地函数异常**，仅支持外部合约调用。
- **0.8.x以下版本不支持自定义错误**，建议升级。

---

如需深入了解错误处理的底层实现和高级用法，可参考官方文档或本教程后续章节。 