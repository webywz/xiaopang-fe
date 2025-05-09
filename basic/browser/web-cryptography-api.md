---
layout: doc
title: Web加密API与安全通信
description: 全面解析Web加密API的原理、常用算法、实际用法与安全通信实践，助你构建安全的前端应用。
---

# Web加密API与安全通信

Web加密API（Web Cryptography API）为前端应用提供了原生的加密、解密、签名与验证能力。本文将系统讲解Web加密API的原理、常用算法、实际用法与安全通信实践。

## 目录

- [Web加密API简介](#web加密api简介)
- [常用加密算法与用途](#常用加密算法与用途)
- [加密与解密代码示例](#加密与解密代码示例)
- [数字签名与验证](#数字签名与验证)
- [安全通信实践](#安全通信实践)

## Web加密API简介

- 通过`window.crypto.subtle`提供加密、解密、签名、验证、密钥生成等功能
- 支持对称加密（AES）、非对称加密（RSA、ECDSA）、哈希（SHA-256）等

## 常用加密算法与用途

| 算法      | 类型   | 典型用途         |
|-----------|--------|------------------|
| AES-GCM   | 对称   | 数据加密         |
| RSA-OAEP  | 非对称 | 密钥交换/加密    |
| ECDSA     | 非对称 | 数字签名         |
| SHA-256   | 哈希   | 数据完整性校验   |

## 加密与解密代码示例

```js
/**
 * 使用AES-GCM加密数据
 * @param {string} plainText 明文
 * @param {CryptoKey} key 密钥
 * @param {Uint8Array} iv 初始向量
 * @returns {Promise<ArrayBuffer>} 密文
 */
async function encryptAES(plainText, key, iv) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  return await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
}
```

## 数字签名与验证

```js
/**
 * 使用ECDSA签名数据
 * @param {CryptoKey} privateKey 私钥
 * @param {ArrayBuffer} data 待签名数据
 * @returns {Promise<ArrayBuffer>} 签名
 */
async function signData(privateKey, data) {
  return await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, data);
}
```

## 安全通信实践

- 始终使用HTTPS，防止中间人攻击
- 密钥仅在受信任环境生成与存储，避免前端明文传递
- 配合CSP、SameSite Cookie等机制提升通信安全
- 定期更新依赖库与浏览器，防范已知漏洞

---

> 参考资料：[MDN Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API) 