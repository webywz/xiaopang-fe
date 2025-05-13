---
title: 合约测试与调试
---

<!-- /**
 * @file 合约测试与调试
 * @description 详细介绍Solidity合约的测试方法、调试技巧与常用工具，适合初学者和有经验开发者查阅。
 */ -->

# 合约测试与调试

合约测试是保障智能合约安全与正确性的关键环节。科学的测试和调试流程能有效发现潜在漏洞和业务逻辑缺陷。

## 1. 测试的重要性与原则
- 智能合约一旦部署不可更改，测试是防止资金损失和安全事故的最后防线。
- 测试应覆盖所有核心业务逻辑、边界条件和异常分支。
- 推荐TDD（测试驱动开发）和持续集成。

## 2. 测试框架与工具

### 2.1 Truffle测试框架
- 使用Mocha/Chai编写测试，支持JS/TS。
- 可与Ganache本地区块链配合。

### 2.2 Hardhat测试框架
- 支持Mocha/Chai，集成Ethers.js，调试能力强。
- 支持本地链、自动化测试、事件断言。

### 2.3 Foundry测试工具
- 使用Forge，支持Solidity原生测试，极快的测试速度。
- 支持Fuzzing、属性测试、主流EVM链。

## 3. 编写测试用例

### 3.1 单元测试
- 针对单个函数或模块，验证输入输出和边界条件。

### 3.2 集成测试
- 多合约协作、复杂业务流程的整体测试。

### 3.3 模拟攻击与安全测试
- 测试重入攻击、权限绕过、整数溢出等安全场景。
- 可用Echidna、MythX等工具辅助。

## 4. 调试技巧与常用方法

### 4.1 事件与日志调试
- 通过事件断言和日志输出，追踪合约执行流程。

### 4.2 断点与回溯
- Remix内置调试器支持断点、变量查看、回溯。
- Hardhat支持console.log调试，Tenderly支持链上回溯。

## 5. 持续集成与自动化测试
- 可集成GitHub Actions、GitLab CI等，实现自动化测试和部署。
- 推荐每次提交和合并前自动运行全部测试。

## 6. 示例代码

```js
// Hardhat测试示例 test/demo.js
const { expect } = require("chai");

describe("Demo", function () {
  it("should set value", async function () {
    const Demo = await ethers.getContractFactory("Demo");
    const demo = await Demo.deploy();
    await demo.setValue(42);
    expect(await demo.value()).to.equal(42);
  });
});
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Demo {
  uint public value;
  function setValue(uint _v) public { value = _v; }
}
```

## 7. 常见问题与最佳实践
- **测试应覆盖所有核心逻辑和异常分支**，避免遗漏。
- **事件断言有助于追踪合约状态变化**。
- **安全测试不可或缺**，建议模拟常见攻击场景。
- **持续集成可提升团队协作效率**。
- **测试代码应有详细注释和文档**，便于维护和扩展。

---

如需深入了解合约测试与调试的高级用法，可参考官方文档或本教程后续章节。 