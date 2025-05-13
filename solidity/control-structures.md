---
title: 控制结构
---

<!-- /**
 * @file 控制结构
 * @description 详细介绍Solidity中的条件语句、循环语句、跳转与中断等控制结构，适合初学者和有经验开发者查阅。
 */ -->

# 控制结构

Solidity 支持多种常见的流程控制结构，包括条件判断、循环、跳转等，帮助开发者实现复杂的业务逻辑。

## 1. 条件语句

### 1.1 if/else语句
- 用于条件分支判断，语法与JavaScript类似。

```solidity
function check(uint x) public pure returns (string memory) {
  if (x > 100) {
    return "大于100";
  } else if (x == 100) {
    return "等于100";
  } else {
    return "小于100";
  }
}
```

### 1.2 三元运算符
- 语法：`条件 ? 表达式1 : 表达式2`，适合简单条件赋值。

```solidity
function min(uint a, uint b) public pure returns (uint) {
  return a < b ? a : b;
}
```

## 2. 循环语句

### 2.1 for循环
- 适合已知次数的循环。

```solidity
function sum(uint n) public pure returns (uint) {
  uint s = 0;
  for (uint i = 0; i < n; i++) {
    s += i;
  }
  return s;
}
```

### 2.2 while循环
- 适合条件驱动的循环。

```solidity
function countDown(uint n) public pure returns (uint) {
  uint c = 0;
  while (n > 0) {
    n--;
    c++;
  }
  return c;
}
```

### 2.3 do...while循环
- 至少执行一次。

```solidity
function atLeastOnce(uint n) public pure returns (uint) {
  uint c = 0;
  do {
    c++;
    n--;
  } while (n > 0);
  return c;
}
```

## 3. 跳转与中断

### 3.1 break与continue
- `break` 跳出当前循环。
- `continue` 跳过本次循环，进入下次。

```solidity
function findFirstEven(uint[] memory arr) public pure returns (uint) {
  for (uint i = 0; i < arr.length; i++) {
    if (arr[i] % 2 == 0) {
      return arr[i]; // 找到第一个偶数直接返回
    }
    // continue 可省略
  }
  return 0;
}
```

### 3.2 return语句
- 用于函数返回，立即终止函数执行。

```solidity
function getFirst(uint[] memory arr) public pure returns (uint) {
  if (arr.length == 0) return 0;
  return arr[0];
}
```

## 4. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ControlDemo {
  function check(uint x) public pure returns (string memory) {
    if (x > 100) {
      return "大于100";
    } else if (x == 100) {
      return "等于100";
    } else {
      return "小于100";
    }
  }

  function sum(uint n) public pure returns (uint) {
    uint s = 0;
    for (uint i = 0; i < n; i++) {
      s += i;
    }
    return s;
  }

  function findFirstEven(uint[] memory arr) public pure returns (uint) {
    for (uint i = 0; i < arr.length; i++) {
      if (arr[i] % 2 == 0) {
        return arr[i];
      }
    }
    return 0;
  }
}
```

## 5. 常见问题与最佳实践

- **循环次数应有限**，避免gas消耗过大导致交易失败。
- **尽量避免在循环中写入区块链状态**，以减少gas消耗。
- **return可提前终止函数执行**，适合查找、验证等场景。
- **break/continue** 仅用于循环体内。
- **Solidity不支持goto语句**，所有流程控制需用上述结构实现。

---

如需深入了解控制结构的底层实现和高级用法，可参考官方文档或本教程后续章节。 