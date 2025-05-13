# Web3.js 深入详解

## 简介

Web3.js 是以太坊生态中最常用的 JavaScript 库之一，主要用于与以太坊区块链进行交互。它支持账户管理、交易签名、合约调用、事件监听等功能，是开发 DApp 的基础工具。

## 安装与初始化（进阶）

### 多种安装方式

#### 1. npm/yarn 安装（推荐）
```bash
npm install web3
# 或
yarn add web3
```

#### 2. 浏览器直接引入 CDN
```html
<script src="https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js"></script>
<script>
  // window.Web3 可用
</script>
```

#### 3. Node.js 环境
```js
const Web3 = require('web3');
```

#### 4. TypeScript 支持
```bash
npm install --save-dev @types/web3
```

### Provider 配置

- HTTPProvider 适合简单请求，WebSocketProvider 适合事件监听和实时性要求高的场景。
- 可配置超时、自动重连等参数。

```js
/**
 * 初始化 Web3，支持 HTTP/WebSocket Provider
 * @param {string} url 节点地址
 * @param {object} [options] 可选配置
 * @returns {Web3} Web3 实例
 */
function createWeb3(url, options = {}) {
  let provider;
  if (url.startsWith('ws')) {
    provider = new Web3.providers.WebsocketProvider(url, {
      timeout: 30000,
      reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
      },
      ...options
    });
  } else {
    provider = new Web3.providers.HttpProvider(url, options);
  }
  return new Web3(provider);
}
```

### 浏览器与 Node.js 环境差异
- 浏览器环境通常通过 window.ethereum（如 MetaMask）注入 Provider。
- Node.js 需手动指定 Provider。

```js
// 浏览器环境
if (typeof window !== 'undefined' && window.ethereum) {
  const web3 = new Web3(window.ethereum);
}
// Node.js 环境
else {
  const web3 = new Web3('https://mainnet.infura.io/v3/xxx');
}
```

### 常见初始化错误与排查
- Provider 地址错误：检查 URL 拼写和端口
- 网络不可达：检查本地网络和节点状态
- 浏览器未安装钱包插件：提示用户安装
- 版本不兼容：建议使用 web3.js 1.x 及以上

```js
try {
  const web3 = new Web3('https://mainnet.infura.io/v3/xxx');
  // 测试连接
  web3.eth.net.isListening().then(() => console.log('连接成功')).catch(console.error);
} catch (e) {
  console.error('Web3 初始化失败:', e);
}
```

## 核心 API 详解

### 1. 账户管理

#### 1. 助记词生成与恢复

web3.js 本身不直接支持助记词（Mnemonic），推荐结合 [bip39](https://github.com/bitcoinjs/bip39) 和 [ethereumjs-wallet](https://github.com/ethereumjs/ethereumjs-wallet) 使用。

```js
/**
 * 通过助记词生成以太坊账户
 * @param {string} mnemonic 助记词
 * @param {number} index 派生路径索引
 * @returns {object} 账户对象
 */
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

function getAccountFromMnemonic(mnemonic, index = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdWallet = hdkey.fromMasterSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = hdWallet.derivePath(path).getWallet();
  return {
    address: '0x' + wallet.getAddress().toString('hex'),
    privateKey: wallet.getPrivateKey().toString('hex')
  };
}
```

#### 2. Keystore 加密与解密

```js
/**
 * 通过密码加密私钥生成 keystore
 * @param {string} privateKey 私钥
 * @param {string} password 密码
 * @returns {object} keystore JSON
 */
function encryptToKeystore(privateKey, password) {
  return web3.eth.accounts.encrypt(privateKey, password);
}

/**
 * 通过 keystore 和密码恢复账户
 * @param {object} keystore keystore JSON
 * @param {string} password 密码
 * @returns {object} 账户对象
 */
function decryptFromKeystore(keystore, password) {
  return web3.eth.accounts.decrypt(keystore, password);
}
```

#### 3. 私钥导入与导出

```js
/**
 * 通过私钥导入账户
 * @param {string} privateKey 私钥
 * @returns {object} 账户对象
 */
function importAccount(privateKey) {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
}

/**
 * 导出账户私钥
 * @param {object} account 账户对象
 * @returns {string} 私钥
 */
function exportPrivateKey(account) {
  return account.privateKey;
}
```

#### 4. 批量账户管理

```js
/**
 * 批量创建账户
 * @param {number} count 数量
 * @returns {object[]} 账户数组
 */
function createAccountsBatch(count) {
  return Array.from({ length: count }, () => web3.eth.accounts.create());
}
```

#### 5. 账户安全建议
- 助记词和私钥请勿明文存储，建议使用硬件钱包或安全环境变量
- Keystore 文件请妥善备份，密码强度要高
- 不要在前端暴露私钥、助记词等敏感信息
- 生产环境建议仅用公钥地址，签名操作在安全环境完成

### 2. 查询余额

#### 查询余额（进阶）

```js
/**
 * 查询账户余额并自动转换为 Ether 单位
 * @param {string} address 以太坊地址
 * @returns {Promise<string>} 余额（单位：ETH）
 */
async function getBalanceInEth(address) {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei, 'ether');
}

/**
 * 批量查询多个账户余额
 * @param {string[]} addresses 地址数组
 * @returns {Promise<object[]>} 余额数组 [{address, balanceWei, balanceEth}]
 */
async function getBalancesBatch(addresses) {
  return Promise.all(addresses.map(async addr => {
    const balanceWei = await web3.eth.getBalance(addr);
    return {
      address: addr,
      balanceWei,
      balanceEth: web3.utils.fromWei(balanceWei, 'ether')
    };
  }));
}

/**
 * 监听账户余额变化（需 WebSocketProvider）
 * @param {string} address 以太坊地址
 * @param {function} callback 回调函数
 */
function watchBalance(address, callback) {
  let last = null;
  setInterval(async () => {
    const balance = await web3.eth.getBalance(address);
    if (balance !== last) {
      last = balance;
      callback(balance);
    }
  }, 10000); // 每 10 秒检查一次
}
```

### 3. 发送交易

#### 发送交易（进阶）

```js
/**
 * 获取账户当前 nonce
 * @param {string} address 以太坊地址
 * @returns {Promise<number>} nonce
 */
async function getNonce(address) {
  return await web3.eth.getTransactionCount(address, 'pending');
}

/**
 * 估算转账所需 gas
 * @param {object} tx 交易对象
 * @returns {Promise<number>} gas 估算值
 */
async function estimateGas(tx) {
  return await web3.eth.estimateGas(tx);
}

/**
 * 发送 EIP-1559 动态手续费交易
 * @param {object} tx 交易对象（含 maxFeePerGas, maxPriorityFeePerGas, type: '0x2'）
 * @param {string} privateKey 私钥
 * @returns {Promise<object>} 交易回执
 */
async function sendEIP1559Transaction(tx, privateKey) {
  const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
}

/**
 * 交易失败常见原因排查
 * 1. nonce 重复或过低：请获取最新 nonce
 * 2. gas 不足：请用 estimateGas 预估
 * 3. 余额不足：请先查询余额
 * 4. 合约 revert：请检查合约逻辑和参数
 */
```

### 4. 智能合约交互

#### 智能合约交互（进阶）

##### 1. ABI 结构说明
- ABI（Application Binary Interface）是合约与外部交互的接口描述文件，通常为 JSON 格式。
- 包含函数、事件、构造器等定义。

```js
/**
 * 载入合约 ABI 并创建实例
 * @param {object[]} abi 合约 ABI
 * @param {string} address 合约地址
 * @returns {object} 合约实例
 */
function loadContract(abi, address) {
  return new web3.eth.Contract(abi, address);
}
```

##### 2. 复杂参数与返回值解码

```js
/**
 * 调用带数组、结构体等复杂参数的合约方法
 * @param {object} contract 合约实例
 * @param {any[]} params 参数数组
 * @returns {Promise<any>} 返回值
 */
async function callComplexMethod(contract, params) {
  return await contract.methods.complexMethod(...params).call();
}

/**
 * 解码合约返回的结构体
 * @param {object} abi 合约 ABI
 * @param {string} data 返回的十六进制数据
 * @returns {object} 解码后的对象
 */
function decodeStruct(abi, data) {
  const methodAbi = abi.find(item => item.name === 'methodName');
  return web3.eth.abi.decodeParameters(methodAbi.outputs, data);
}
```

##### 3. 合约部署

```js
/**
 * 部署智能合约
 * @param {object[]} abi 合约 ABI
 * @param {string} bytecode 合约字节码
 * @param {any[]} args 构造参数
 * @param {string} from 部署账户
 * @returns {Promise<object>} 部署回执
 */
async function deployContract(abi, bytecode, args, from) {
  const contract = new web3.eth.Contract(abi);
  return await contract.deploy({ data: bytecode, arguments: args })
    .send({ from });
}
```

#### 事件监听（进阶）

##### 1. 历史事件查询

```js
/**
 * 查询合约历史事件
 * @param {object} contract 合约实例
 * @param {string} eventName 事件名
 * @param {object} [options] 过滤参数（fromBlock, toBlock, filter）
 * @returns {Promise<object[]>} 事件数组
 */
async function getPastEvents(contract, eventName, options = { fromBlock: 0, toBlock: 'latest' }) {
  return await contract.getPastEvents(eventName, options);
}
```

##### 2. 事件过滤器

```js
/**
 * 监听指定参数的事件
 * @param {object} contract 合约实例
 * @param {string} eventName 事件名
 * @param {object} filter 过滤条件
 * @param {function} callback 回调
 */
function watchFilteredEvent(contract, eventName, filter, callback) {
  contract.events[eventName]({ filter })
    .on('data', callback)
    .on('error', console.error);
}
```

##### 3. 断线重连与健壮性
- WebSocketProvider 断线后可自动重连（见 Provider 配置部分）。
- 建议监听 'error' 和 'end' 事件，必要时手动重建连接。

```js
const wsProvider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/xxx');
wsProvider.on('end', e => {
  console.error('WebSocket 断开，尝试重连...', e);
  // 可在此处自动重建 provider
});
```

## 账户与签名

### 账户与签名（进阶）

#### 1. EIP-712 结构化数据签名

EIP-712 支持结构化数据签名，常用于 DApp 授权。

```js
/**
 * EIP-712 结构化数据签名
 * @param {object} typedData EIP-712 数据结构
 * @param {string} privateKey 私钥
 * @returns {string} 签名
 */
const ethSigUtil = require('eth-sig-util');
function signTypedData(typedData, privateKey) {
  return ethSigUtil.signTypedData_v4(Buffer.from(privateKey.replace('0x', ''), 'hex'), { data: typedData });
}
```

#### 2. 签名验证

```js
/**
 * 验证签名
 * @param {string} message 原始消息
 * @param {string} signature 签名
 * @returns {string} 恢复出的地址
 */
function recoverSigner(message, signature) {
  return web3.eth.accounts.recover(message, signature);
}
```

#### 3. 离线签名与广播

```js
/**
 * 离线签名交易并广播
 * @param {object} tx 交易对象
 * @param {string} privateKey 私钥
 * @returns {Promise<object>} 交易回执
 */
async function offlineSignAndSend(tx, privateKey) {
  const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
}
```

## 常见用法

### 常见用法（实战）

#### 1. 查询区块信息

```js
/**
 * 获取最新区块号
 * @returns {Promise<number>} 区块号
 */
async function getLatestBlockNumber() {
  return await web3.eth.getBlockNumber();
}

/**
 * 获取指定区块详细信息
 * @param {number|string} blockNumber 区块号或 'latest'
 * @returns {Promise<object>} 区块对象
 */
async function getBlockInfo(blockNumber) {
  return await web3.eth.getBlock(blockNumber);
}
```

#### 2. 监听新区块

```js
/**
 * 监听新区块（需 WebSocketProvider）
 * @param {function} callback 区块回调
 */
function watchNewBlocks(callback) {
  web3.eth.subscribe('newBlockHeaders', (err, blockHeader) => {
    if (!err) callback(blockHeader);
  });
}
```

#### 3. 批量请求（BatchRequest）

```js
/**
 * 批量查询多个账户余额（BatchRequest 版）
 * @param {string[]} addresses 地址数组
 * @param {function} callback 回调
 */
function batchGetBalances(addresses, callback) {
  const batch = new web3.BatchRequest();
  const results = [];
  addresses.forEach((addr, i) => {
    batch.add(web3.eth.getBalance.request(addr, 'latest', (err, balance) => {
      results[i] = { address: addr, balance };
      if (results.filter(Boolean).length === addresses.length) callback(results);
    }));
  });
  batch.execute();
}
```

## 进阶技巧

### 进阶技巧（实战）

#### 1. 多节点容灾切换

```js
/**
 * 多节点自动切换 Provider
 * @param {string[]} urls 节点地址列表
 * @returns {Web3} Web3 实例
 */
function resilientWeb3(urls) {
  let idx = 0;
  let web3 = createWeb3(urls[idx]);
  web3.currentProvider.on('error', () => {
    idx = (idx + 1) % urls.length;
    web3 = createWeb3(urls[idx]);
    console.warn('切换到备用节点:', urls[idx]);
  });
  return web3;
}
```

#### 2. Gas 优化

- 使用 web3.eth.estimateGas 预估 gas，避免浪费
- 关注 EIP-1559 的 maxFeePerGas、maxPriorityFeePerGas
- 可用 eth_gasPrice API 获取当前网络均价

```js
/**
 * 获取当前网络推荐 gasPrice
 * @returns {Promise<string>} gasPrice（Wei）
 */
async function getRecommendedGasPrice() {
  return await web3.eth.getGasPrice();
}
```

#### 3. 处理链上 Revert 错误

- 捕获 send/sendSignedTransaction 的 error 回调，解析 error.message
- 可用 try/catch 捕获 call/estimateGas 的异常

```js
/**
 * 处理链上 Revert 错误
 * @param {function} fn 异步函数
 * @returns {Promise<any>} 返回值或错误信息
 */
async function handleRevert(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e && e.message && e.message.includes('revert')) {
      console.error('链上 Revert:', e.message);
    }
    throw e;
  }
}
```

## 安全注意事项（进阶）

- 私钥严禁泄露，建议使用硬件钱包、冷钱包或安全环境变量管理。
- 助记词、Keystore 文件请加密存储，切勿上传至云盘或代码仓库。
- 交易前务必核对合约地址、方法参数，防止钓鱼合约和参数注入。
- 谨防重放攻击：主网与测试网私钥、nonce 不可混用。
- 生产环境建议仅用公钥地址，签名操作在安全环境完成。
- 监听事件时注意防止内存泄漏，及时移除无用监听器。
- 处理链上数据时注意 BigNumber 精度，避免溢出。
- 关注依赖库安全公告，及时升级 web3.js 及相关依赖。

## 最佳实践（进阶）

- 使用 dotenv 或专用密钥管理服务（如 AWS KMS、HashiCorp Vault）管理敏感信息。
- 采用 async/await 统一异步逻辑，避免回调地狱。
- 充分利用 ABI 类型检查，避免参数类型错误。
- 结合 TypeScript 增强类型安全，推荐使用 web3.js 的类型声明文件。
- 前端与后端分离，私钥、助记词等敏感操作仅在后端或安全环境执行。
- 自动化部署与测试：结合 Hardhat、Truffle、CI 工具实现一键部署与回归测试。
- 代码审计与单元测试：合约与 DApp 代码均需覆盖充分的测试用例。
- 关注 gas 费用，优化合约与前端交互逻辑，减少不必要的链上操作。
- 充分利用 web3.js 的事件和错误回调，提升用户体验。

## 常见问题与解答（进阶）

### Q: 交易一直 pending，如何排查？
A: 检查 nonce 是否正确、gasPrice 是否过低、网络是否拥堵，可通过 Etherscan 查询交易状态。

### Q: 如何防止前端泄露私钥？
A: 前端绝不应存储或处理私钥，所有签名操作应在后端或钱包插件（如 MetaMask）中完成。

### Q: 合约调用 revert 如何定位原因？
A: 使用 try/catch 捕获异常，解析 error.message，或在合约中使用 require/assert 提供详细 revert 信息。

### Q: 如何监听多个合约或事件？
A: 可为每个合约/事件分别创建监听器，或用 allEvents() 统一监听并在回调中区分事件类型。

### Q: 如何高效批量查询链上数据？
A: 使用 BatchRequest 或多线程并发请求，注意控制速率防止节点限流。

### Q: web3.js 报错"Returned values aren't valid, did it run Out of Gas?"
A: 说明合约方法执行失败，可能参数错误、合约逻辑 revert 或 gas 设置过低。

### Q: 如何获取官方文档和社区资源？
A: 
- 官方文档：https://web3js.readthedocs.io/
- GitHub：https://github.com/web3/web3.js/
- 以太坊开发者文档：https://ethereum.org/developers/
- Stack Overflow、Discord、Telegram 等社区活跃讨论区。

---

> 本文档持续更新，建议结合实际开发需求查阅官方文档与社区资源，保持对 web3.js 及以太坊生态的关注。

## Web3.js 架构与模块

Web3.js 主要由以下几个模块组成：
- web3-eth：以太坊主模块，账户、区块、交易、合约等
- web3-shh：Whisper 协议（消息通信）
- web3-bzz：Swarm 协议（去中心化存储）
- web3-utils：常用工具函数
- web3-net：网络信息
- web3-eth-abi：ABI 编解码
- web3-eth-contract：合约交互

## Provider 类型与切换

Web3.js 支持多种 Provider：
- HTTPProvider
- WebsocketProvider
- IPCProvider（Node.js 环境）

```js
/**
 * 切换 Provider
 * @param {string} type 类型: 'http' | 'ws' | 'ipc'
 * @param {string} url 连接地址
 * @returns {Web3} 新的 Web3 实例
 */
function switchProvider(type, url) {
  let provider;
  if (type === 'http') provider = new Web3.providers.HttpProvider(url);
  else if (type === 'ws') provider = new Web3.providers.WebsocketProvider(url);
  else throw new Error('仅支持 http 或 ws');
  return new Web3(provider);
}
```

## 复杂合约交互

### 多参数与结构体

```js
/**
 * 调用带有结构体参数的合约方法
 * @param {object} contract 合约实例
 * @param {object} structParam 结构体参数
 * @returns {Promise<any>} 返回值
 */
async function callStructMethod(contract, structParam) {
  return await contract.methods.complexMethod(structParam).call();
}
```

### 解析复杂事件

```js
/**
 * 解析合约复杂事件
 * @param {object} contract 合约实例
 */
contract.events.ComplexEvent({})
  .on('data', event => {
    /** @type {object} */
    const { returnValues } = event;
    // 处理 returnValues
  });
```

## 交易生命周期与回执

```js
/**
 * 发送交易并监听生命周期
 * @param {object} tx 交易对象
 * @param {string} privateKey 私钥
 */
async function sendTxWithLifecycle(tx, privateKey) {
  const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
  web3.eth.sendSignedTransaction(signed.rawTransaction)
    .on('transactionHash', hash => console.log('交易哈希:', hash))
    .on('receipt', receipt => console.log('区块确认:', receipt))
    .on('confirmation', (conf, receipt) => console.log('确认数:', conf))
    .on('error', err => console.error('交易失败:', err));
}
```

## EIP-1559 交易与 Gas 机制

```js
/**
 * 构造 EIP-1559 交易
 * @param {string} from 发送者
 * @param {string} to 接收者
 * @param {string} value 金额（Wei）
 * @param {string} privateKey 私钥
 */
async function sendEIP1559Tx(from, to, value, privateKey) {
  const tx = {
    from,
    to,
    value,
    maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'),
    maxFeePerGas: web3.utils.toWei('100', 'gwei'),
    type: '0x2',
    chainId: 1
  };
  const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
  return await web3.eth.sendSignedTransaction(signed.rawTransaction);
}
```

## 钱包集成

### MetaMask 连接

```js
/**
 * 检查并连接 MetaMask
 * @returns {Promise<string[]>} 用户授权的账户地址
 */
async function connectMetaMask() {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } else {
    throw new Error('请安装 MetaMask');
  }
}
```

### 硬件钱包（如 Ledger）

建议结合 web3-provider-engine、@ledgerhq/web3-subprovider 等库实现。

## 前端框架集成

### React 示例

```js
/**
 * React 中使用 Web3.js
 */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

export default function Web3Demo() {
  const [account, setAccount] = useState('');
  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => setAccount(accounts[0]));
    }
  }, []);
  return <div>当前账户: {account}</div>;
}
```

## 单元测试与模拟链

- 推荐使用 Ganache 或 Hardhat 本地链进行开发和测试。
- 可用 web3.js 直接连接本地节点。

```js
/**
 * 连接本地 Ganache
 */
const web3 = new Web3('http://127.0.0.1:8545');
```

## 性能优化与常见陷阱（进阶）

### 1. 批量请求与缓存
- 使用 BatchRequest 批量查询，减少网络延迟和节点压力。
- 对频繁查询的数据（如代币余额、区块信息）可做本地缓存，定期刷新。

```js
/**
 * 批量获取多个地址的余额并缓存
 * @param {string[]} addresses 地址数组
 * @param {Map<string, string>} cache 缓存对象
 * @param {function} callback 回调
 */
function batchGetBalancesWithCache(addresses, cache, callback) {
  const batch = new web3.BatchRequest();
  const results = [];
  addresses.forEach((addr, i) => {
    if (cache.has(addr)) {
      results[i] = { address: addr, balance: cache.get(addr) };
      if (results.filter(Boolean).length === addresses.length) callback(results);
    } else {
      batch.add(web3.eth.getBalance.request(addr, 'latest', (err, balance) => {
        cache.set(addr, balance);
        results[i] = { address: addr, balance };
        if (results.filter(Boolean).length === addresses.length) callback(results);
      }));
    }
  });
  batch.execute();
}
```

### 2. 事件监听陷阱
- 长时间监听事件需注意内存泄漏，建议在组件卸载或页面离开时移除监听。
- 监听大量事件时建议分批处理，避免回调阻塞。

```js
/**
 * 安全移除事件监听
 * @param {object} contract 合约实例
 * @param {string} eventName 事件名
 * @param {function} handler 事件处理函数
 */
function removeEventListener(contract, eventName, handler) {
  contract.events[eventName]().off('data', handler);
}
```

### 3. BigNumber 精度陷阱
- 以太坊上的数值通常为大整数（BigNumber），直接用 JS Number 可能丢失精度。
- 推荐使用 web3.utils.BN 或 bignumber.js 处理大数。

```js
/**
 * 安全加法（BN）
 * @param {string} a 数字字符串
 * @param {string} b 数字字符串
 * @returns {string} 求和结果
 */
function safeAdd(a, b) {
  const BN = web3.utils.BN;
  return new BN(a).add(new BN(b)).toString();
}
```

### 4. pending 交易处理
- 监听 pending 交易时，需注意处理重复广播、nonce 冲突等问题。
- 建议为每笔交易单独追踪状态，避免遗漏。

---

## 生态工具推荐（进阶）

### 1. Remix IDE
- 在线 Solidity 合约开发、编译、部署与调试。
- 支持与 web3.js 交互，可导出 ABI/Bytecode 直接用于前端。

### 2. Hardhat/Truffle
- 本地开发、测试、部署一体化框架。
- 可通过 hardhat node 或 truffle develop 启动本地链，web3.js 直接连接。

### 3. web3modal
- 多钱包连接组件，支持 MetaMask、WalletConnect、Coinbase Wallet 等。
- 适合 React/Vue 前端集成。

```js
// 以 React 为例集成 web3modal
import Web3Modal from 'web3modal';
import Web3 from 'web3';

async function connectWallet() {
  const web3Modal = new Web3Modal();
  const provider = await web3Modal.connect();
  const web3 = new Web3(provider);
  // 后续可用 web3 进行链上操作
}
```

### 4. Etherscan API
- 用于链上数据查询、交易追踪、合约验证等。
- 可结合 web3.js 查询不到的数据补充使用。

---

## 调试技巧（进阶）

### 1. 常见报错排查
- "Returned values aren't valid, did it run Out of Gas?"：合约方法执行失败，参数或 gas 设置错误。
- "Invalid JSON RPC response"：节点网络异常或 provider 配置错误。
- "nonce too low/too high"：nonce 获取不及时，需用 'pending' 选项获取最新。

### 2. 日志与断点
- 充分利用 console.log、debugger 断点调试链上交互流程。
- 可用 web3.eth.subscribe 监听链上事件，辅助定位问题。

### 3. 工具函数
- web3.utils.hexToUtf8、toWei、fromWei、isAddress 等常用工具函数可辅助数据格式转换与校验。

```js
/**
 * 校验以太坊地址格式
 * @param {string} address 地址
 * @returns {boolean} 是否有效
 */
function isValidAddress(address) {
  return web3.utils.isAddress(address);
}
```

### 4. 浏览器与 Node.js 调试
- 浏览器可用开发者工具 Network/Console 面板追踪请求与响应。
- Node.js 可用 node --inspect 或 VSCode 调试链上交互脚本。

---
