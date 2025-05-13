---
title: 数据类型与变量
---

<!-- /**
 * @file 数据类型与变量
 * @description 详细介绍Solidity中的基本数据类型、变量声明、作用域、类型转换及相关最佳实践，适合初学者和有经验开发者查阅。
 */ -->

# 数据类型与变量

Solidity 提供了丰富的数据类型，分为值类型和引用类型。理解这些类型及其用法，是编写安全高效合约的基础。

## 1. 基本数据类型

### 1.1 整型（int/uint）
- `uint`/`int`：无符号/有符号整数，支持 8~256 位（如 `uint8`、`int256`），默认 `uint`/`int` 为 256 位。
- 默认值为 0。

```solidity
uint256 public total = 100;
int8 public temperature = -10;
```

### 1.2 布尔型（bool）
- 取值为 `true` 或 `false`，默认值为 `false`。

```solidity
bool public isActive = true;
```

### 1.3 地址类型（address）
- 以太坊地址，20 字节长度。
- `address payable` 可接收以太币。

```solidity
address public owner;
address payable public wallet;
```

### 1.4 字节数组与字符串（bytes, string）
- `bytes1`~`bytes32`：定长字节数组。
- `bytes`：变长字节数组。
- `string`：UTF-8 编码字符串。

```solidity
bytes32 public hash;
string public name = "XiaoPang";
```

### 1.5 枚举与结构体
- `enum`：枚举类型，定义有限集合。
- `struct`：结构体，自定义复合类型。

```solidity
enum Status { Pending, Active, Inactive }
Status public status;

struct User {
  address addr;
  uint balance;
}
User public user;
```

## 2. 变量声明与作用域

### 2.1 状态变量
- 合约级变量，存储在区块链上，生命周期与合约一致。

### 2.2 局部变量
- 仅在函数或代码块内有效，函数执行完即销毁。

### 2.3 全局变量
- 由 EVM 提供，如 `msg.sender`、`block.timestamp`、`tx.origin` 等。

```solidity
function demo() public view returns (address, uint) {
  uint localVar = 1; // 局部变量
  return (msg.sender, block.number); // 全局变量
}
```

## 3. 类型转换

- 显式转换：`uint8 x = uint8(y);`
- 隐式转换：低位向高位可自动转换，高位向低位需显式转换。
- 地址与 `uint160` 可互转。

```solidity
uint8 a = 10;
uint256 b = a; // 隐式转换
uint8 c = uint8(b); // 显式转换
address addr = address(uint160(123));
```

## 4. 示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataTypeDemo {
  uint256 public total = 100;
  bool public isActive = true;
  address public owner;
  string public name = "小胖";

  enum Status { Pending, Active, Inactive }
  Status public status;

  struct User {
    address addr;
    uint balance;
  }
  User public user;

  constructor() {
    owner = msg.sender;
    status = Status.Pending;
    user = User(msg.sender, 0);
  }

  function setStatus(Status _status) public {
    status = _status;
  }
}
```

## 5. 常见问题与最佳实践

- **类型安全**：尽量避免类型不匹配，显式转换可提升安全性。
- **整数溢出**：Solidity 0.8.x 及以上自动检测溢出，低版本需用 SafeMath。
- **字符串与字节数组**：`string` 适合文本，`bytes` 适合二进制数据。
- **全局变量**：合理使用 `msg.sender`、`block.timestamp` 等全局变量，注意安全性。
- **结构体与枚举**：有助于提升代码可读性和可维护性。

---

如需深入了解每种类型的底层实现和高级用法，可参考官方文档或本教程后续章节。 