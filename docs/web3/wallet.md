/**
 * 钱包与签名极致细化
 * @description 详细介绍区块链钱包原理、类型、助记词/私钥/Keystore标准、签名机制、DApp交互、硬件钱包、多签钱包、EIP-712、账户抽象、常见攻击与防护、开发与集成最佳实践、术语表等，配合代码示例。
 * @author 前端小胖
 */

# 钱包与签名

## 1. 钱包基本原理与类型
区块链钱包用于管理用户的私钥、公钥和地址，是用户与区块链交互的核心工具。

### 1.1 钱包类型
- **热钱包**（软件钱包）：如 MetaMask、imToken，便于日常使用，安全性依赖设备环境
- **冷钱包**（硬件钱包）：如 Ledger、Trezor，私钥离线存储，适合大额资产
- **多签钱包**：如 Gnosis Safe，多方共同签名，提升安全性
- **智能合约钱包**：支持账户抽象、社交恢复、批量操作等高级功能

### 1.2 钱包核心原理
- 助记词（Mnemonic）：BIP39 标准，12/24 个英文单词
- 私钥（Private Key）：控制资产的唯一凭证
- 公钥（Public Key）：由私钥推导，用于生成地址
- 地址（Address）：区块链账户标识
- Keystore：加密存储私钥的 JSON 文件，需密码解锁

## 2. 助记词/私钥/Keystore 标准与操作
### 2.1 助记词生成与导入
```js
/**
 * 生成助记词
 * @returns {string} 助记词
 */
import { ethers } from "ethers";
const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
console.log("助记词:", mnemonic);
```

### 2.2 私钥与 Keystore 导入导出
```js
// 私钥导入
const wallet = new ethers.Wallet(privateKey);
// Keystore 导出
wallet.encrypt(password).then(json => console.log(json));
// Keystore 导入
ethers.Wallet.fromEncryptedJson(json, password).then(console.log);
```

### 2.3 助记词/私钥兼容性
- 建议遵循 BIP39（助记词）、BIP44（路径）、BIP32（分层确定性钱包）标准
- 助记词/私钥可跨钱包导入，注意路径一致性

## 3. 多签钱包与硬件钱包
### 3.1 多签钱包原理与代码（Gnosis Safe）
- 多签钱包需多方签名才能转账，提高安全性
- 推荐使用 Gnosis Safe
- 典型应用：DAO 金库、企业资金管理

### 3.2 硬件钱包
- 私钥存储于硬件芯片，操作需物理确认
- 支持主流链与多种钱包软件集成
- 适合长期大额资产存储

## 4. 钱包签名机制与 EIP-712
### 4.1 签名机制
- 私钥签名，公钥验证
- 支持消息签名、交易签名、结构化数据签名

### 4.2 EIP-712 结构化数据签名
```js
/**
 * EIP-712 签名
 */
const domain = { name: 'DApp', version: '1', chainId: 1, verifyingContract: '0x...' };
const types = { Mail: [ { name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'contents', type: 'string' } ] };
const value = { from: '0x...', to: '0x...', contents: 'Hello' };
const signature = await signer._signTypedData(domain, types, value);
```
- EIP-712 可防止签名钓鱼，提升安全性

## 5. 钱包与 DApp 交互流程
1. 用户在 DApp 前端点击"连接钱包"按钮
2. 前端调用 `window.ethereum.request({ method: 'eth_requestAccounts' })`
3. 用户在钱包中确认
4. DApp 获取用户地址并可发起链上操作
5. 用户签名或发起交易，DApp 监听回执

## 6. 钱包常见安全攻击与防护
- 钓鱼网站：只在官网或可信链接下载钱包
- 恶意 DApp：仔细核查授权内容
- 助记词/私钥泄露：永不在不可信环境输入助记词
- 恶意插件/病毒：定期查杀，避免安装未知插件
- 建议：使用硬件钱包、开启多签、定期更换密码、分层管理资产

## 7. 钱包开发与集成最佳实践
- 遵循 BIP39/BIP44/BIP32 标准，提升兼容性
- 前端集成推荐使用 ethers.js、web3.js
- 钱包连接建议用 WalletConnect、RainbowKit
- 支持 EIP-1193 钱包标准接口，兼容多钱包
- 重要操作需二次确认，敏感信息不落地
- 钱包 UI 需提示风险、授权范围、签名内容

## 8. 账户抽象与智能钱包
- 账户抽象（Account Abstraction，AA）：如 ERC-4337，支持合约钱包、批量操作、Gas 代付、社交恢复等
- 智能钱包：如 Safe、Argent，支持权限管理、自动化操作
- 未来趋势：提升安全性与用户体验，降低私钥丢失风险

## 9. 钱包常见问题与解答（FAQ）
- 助记词/私钥格式不兼容：建议使用 BIP39/BIP44 标准
- 钱包与 DApp 连接失败：检查网络、MetaMask 状态、浏览器兼容性
- 签名不一致：注意消息格式、编码方式、链ID
- Keystore 解密失败：确认密码、文件完整性
- 钱包余额不显示：检查网络、节点同步状态

## 10. 术语表与缩略语
| 术语 | 解释 |
|------|------|
| 助记词 | 记忆型私钥备份，BIP39 标准 |
| Keystore | 加密私钥文件，需密码解锁 |
| BIP39/BIP44 | 助记词/路径标准 |
| EIP-712 | 结构化数据签名标准 |
| EIP-1193 | 钱包与 DApp 通用接口标准 |
| 多签 | 多重签名钱包 |
| 账户抽象 | Account Abstraction，智能钱包新范式 |
| AA | 账户抽象缩写 |
| 硬件钱包 | 离线存储私钥的物理设备 |
| 热钱包 | 在线软件钱包 |
| 冷钱包 | 离线硬件钱包 |

## 11. 参考资料与延伸阅读
- [MetaMask 官方文档](https://docs.metamask.io/)
- [Ethers.js 钱包文档](https://docs.ethers.org/v5/api/signer/)
- [Gnosis Safe](https://safe.global/)
- [Ledger 官方文档](https://www.ledger.com/academy)
- [EIP-712 说明](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-4337 账户抽象](https://eips.ethereum.org/EIPS/eip-4337)

---

后续将介绍 DApp 开发与常用工具。 