---
layout: doc
title: 浏览器存储机制全解析
description: 全面梳理浏览器端各类存储方式的原理、用法与最佳实践，助你高效管理前端数据。
---

# 浏览器存储机制全解析

浏览器为前端开发者提供了多种本地存储方案。本文将系统梳理各类存储方式的原理、用法与最佳实践。

## 目录

- [Cookie](#cookie)
  - [Cookie的基本特性](#cookie的基本特性)
  - [Cookie的属性与安全](#cookie的属性与安全)
  - [Cookie的操作方法](#cookie的操作方法)
  - [Cookie的使用场景](#cookie的使用场景)
- [Web Storage](#web-storage)
- [LocalStorage](#localstorage)
- [SessionStorage](#sessionstorage)
  - [Storage事件](#storage事件)
  - [存储容量与性能](#存储容量与性能)
- [IndexedDB](#indexeddb)
  - [核心概念](#核心概念)
  - [基本操作](#基本操作)
  - [事务与游标](#事务与游标)
  - [索引与查询](#索引与查询)
- [Cache Storage与Service Worker](#cache-storage与service-worker)
  - [缓存策略](#缓存策略)
  - [离线应用实现](#离线应用实现)
- [Web SQL与File System API](#web-sql与file-system-api)
- [多存储方案对比](#多存储方案对比)
- [存储安全与最佳实践](#存储安全与最佳实践)
  - [安全风险与防护](#安全风险与防护)
  - [性能优化策略](#性能优化策略)
  - [数据同步策略](#数据同步策略)

## Cookie

Cookie是浏览器存储机制中历史最悠久的技术，最初设计用于在客户端存储会话信息。

### Cookie的基本特性

Cookie是存储在浏览器中的小型文本文件，具有以下基本特性：

```js
/**
 * Cookie的基本特性
 * @returns {Object} Cookie特性列表
 */
function cookieFeatures() {
  return {
    存储容量: '每个域名下最多存储约4KB数据',
    数量限制: '每个域名下Cookie数量有限(通常为50-3000个不等)',
    过期机制: '可设置过期时间，默认为会话结束时过期',
    请求附带: '自动附加在同域HTTP请求的头部中',
    域名限制: '受同源策略影响，可通过domain/path属性调整作用范围',
    可编程访问: '可通过JavaScript的document.cookie访问（非HttpOnly）'
  };
}
```

Cookie在每次HTTP请求中都会被自动发送到服务器，这既是它的优势也是它的劣势。

### Cookie的属性与安全

Cookie可以设置多种属性来增强安全性和控制作用范围：

```js
/**
 * Cookie重要属性
 * @returns {Object} 属性说明
 */
function cookieAttributes() {
  return {
    Expires: '设置Cookie的过期时间点',
    'Max-Age': '设置Cookie的生存时间（秒）',
    Domain: '指定Cookie可用的域名范围',
    Path: '指定Cookie在哪些路径下可用',
    Secure: '只在HTTPS连接中传输Cookie',
    HttpOnly: '禁止JavaScript访问Cookie，防止XSS攻击',
    SameSite: {
      Strict: '仅在同站点请求中发送Cookie',
      Lax: '允许导航到目标网址的Get请求携带Cookie（默认值）',
      None: '允许跨站请求发送Cookie，需同时设置Secure属性'
    }
  };
}
```

下面是一个设置安全Cookie的例子：

```js
/**
 * 设置安全的Cookie
 * @param {string} name Cookie名称
 * @param {string} value Cookie值
 * @param {Object} options Cookie选项
 */
function setSecureCookie(name, value, options = {}) {
  // 默认选项
  const defaultOptions = {
    path: '/',
    secure: location.protocol === 'https:',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 86400 * 7 // 7天
  };
  
  const cookieOptions = { ...defaultOptions, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  // 添加选项
  if (cookieOptions.path) cookieString += `; Path=${cookieOptions.path}`;
  if (cookieOptions.domain) cookieString += `; Domain=${cookieOptions.domain}`;
  if (cookieOptions.maxAge) cookieString += `; Max-Age=${cookieOptions.maxAge}`;
  if (cookieOptions.expires) cookieString += `; Expires=${cookieOptions.expires.toUTCString()}`;
  if (cookieOptions.secure) cookieString += '; Secure';
  if (cookieOptions.httpOnly) cookieString += '; HttpOnly';
  if (cookieOptions.sameSite) cookieString += `; SameSite=${cookieOptions.sameSite}`;
  
  // 设置Cookie (注意:HttpOnly只能由服务器设置)
  document.cookie = cookieString;
}
```

### Cookie的操作方法

浏览器中读写Cookie可以通过`document.cookie`属性，但其操作较为繁琐：

```js
/**
 * Cookie操作工具函数
 */
const CookieUtil = {
  /**
   * 获取Cookie
   * @param {string} name Cookie名称
   * @returns {string|null} Cookie值或null
   */
  get(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (decodeURIComponent(cookieName) === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  },
  
/**
 * 设置Cookie
   * @param {string} name Cookie名称
   * @param {string} value Cookie值
   * @param {Object} options Cookie选项
   */
  set(name, value, options = {}) {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.expires instanceof Date) {
      cookieText += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.path) cookieText += `; path=${options.path}`;
    if (options.domain) cookieText += `; domain=${options.domain}`;
    if (options.secure) cookieText += '; secure';
    if (options.sameSite) cookieText += `; samesite=${options.sameSite}`;
    
    document.cookie = cookieText;
  },
  
  /**
   * 删除Cookie
   * @param {string} name Cookie名称
   * @param {Object} options Cookie选项
   */
  remove(name, options = {}) {
    options.expires = new Date(0); // 设置为过去时间，使Cookie立即过期
    this.set(name, '', options);
  },
  
  /**
   * 获取所有Cookie
   * @returns {Object} 所有Cookie键值对
   */
  getAll() {
    const result = {};
    const cookies = document.cookie.split('; ');
    
    for (const cookie of cookies) {
      if (cookie) {
        const [name, value] = cookie.split('=');
        result[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
    
    return result;
  }
};
```

### Cookie的使用场景

Cookie虽然有局限性，但在特定场景下仍有其独特价值：

```js
/**
 * Cookie适用场景
 * @returns {Object} 场景列表
 */
function cookieUseCases() {
  return {
    身份验证: {
      描述: '存储用户登录状态',
      示例: 'session_id或认证令牌'
    },
    个性化: {
      描述: '存储用户偏好设置',
      示例: '网站主题、语言选择'
    },
    追踪: {
      描述: '分析用户行为',
      示例: '访问统计、广告转化追踪'
    },
    购物车: {
      描述: '存储未登录用户的购物车信息',
      示例: '电商网站的临时购物数据'
    },
    负载均衡: {
      描述: '服务器会话粘性',
      示例: '确保用户请求定向到同一服务器'
    }
  };
}
```

实际应用示例：

```js
/**
 * Cookie应用示例：记住用户主题偏好
 * @param {string} theme 主题名称
 */
function setUserThemePreference(theme) {
  // 设置30天过期的Cookie
  CookieUtil.set('user_theme', theme, {
    path: '/',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    sameSite: 'Lax'
  });
  
  // 应用主题
  applyTheme(theme);
}

/**
 * 页面加载时读取主题设置
 */
function loadUserThemeOnInit() {
  const savedTheme = CookieUtil.get('user_theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('default');
  }
}
```

## Web Storage

Web Storage是HTML5引入的客户端存储方案，提供了比Cookie更简单、更大容量的存储方式。Web Storage分为两种：LocalStorage和SessionStorage。

### LocalStorage

LocalStorage提供了持久化的键值对存储机制，数据永久保存在浏览器中，除非手动清除。

```js
/**
 * LocalStorage基本操作
 */
function localStorageBasics() {
  // 存储数据
  localStorage.setItem('username', 'Alice');
  
  // 读取数据
  const username = localStorage.getItem('username');
  console.log(username); // 'Alice'
  
  // 更新数据
  localStorage.setItem('username', 'Bob');
  
  // 删除特定数据
  localStorage.removeItem('username');
  
  // 清空所有数据
  localStorage.clear();
  
  // 获取存储项数量
  const itemCount = localStorage.length;
  
  // 遍历所有存储项
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value}`);
  }
}
```

LocalStorage的高级用法：

```js
/**
 * 存储复杂数据结构
 * @param {string} key 存储键名
 * @param {Object|Array} data 要存储的数据对象
 */
function storeComplexData(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
}

/**
 * 获取复杂数据结构
 * @param {string} key 存储键名
 * @param {*} defaultValue 默认值(如未找到数据)
 * @returns {Object|Array|*} 解析后的数据
 */
function getComplexData(key, defaultValue = null) {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return defaultValue;
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('解析数据失败:', error);
    return defaultValue;
  }
}

/**
 * 实用的LocalStorage包装器
 */
const StorageUtil = {
  /**
   * 存储带有过期时间的数据
   * @param {string} key 存储键名
   * @param {*} value 存储值
   * @param {number} ttl 过期时间(毫秒)
   */
  setWithExpiry(key, value, ttl) {
    const item = {
      value: value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  /**
   * 获取数据，检查是否过期
   * @param {string} key 存储键名
   * @returns {*} 存储的值，如已过期则返回null
   */
  getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },
  
  /**
   * 安全存储敏感数据(简单加密)
   * @param {string} key 存储键名
   * @param {string} value 存储值
   * @param {string} secret 加密密钥
   */
  setEncrypted(key, value, secret) {
    // 注意：这是简单的加密，不适用于高安全性需求
    const encrypted = this.simpleEncrypt(value, secret);
    localStorage.setItem(key, encrypted);
  },
  
  /**
   * 获取并解密数据
   * @param {string} key 存储键名
   * @param {string} secret 解密密钥
   * @returns {string|null} 解密后的数据
   */
  getEncrypted(key, secret) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return this.simpleDecrypt(encrypted, secret);
  },
  
  /**
   * 简单的XOR加密(仅用于演示)
   * @private
   */
  simpleEncrypt(text, secret) {
    // 实际应用中应使用专业的加密库
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)
      );
    }
    return btoa(result); // Base64编码
  },
  
  /**
   * 简单的XOR解密(仅用于演示)
   * @private
   */
  simpleDecrypt(encrypted, secret) {
    try {
      const text = atob(encrypted); // Base64解码
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)
        );
      }
      return result;
    } catch (e) {
      return null;
    }
  }
};
```

### SessionStorage

SessionStorage与LocalStorage的API完全相同，但其生命周期仅限于当前会话，关闭标签页或浏览器窗口后数据会被清除。

```js
/**
 * SessionStorage使用场景
 * @returns {Object} 场景列表
 */
function sessionStorageUseCases() {
  return {
    表单数据暂存: {
      描述: '防止表单填写过程中页面刷新导致数据丢失',
      示例: '多步骤表单的中间状态'
    },
    临时用户设置: {
      描述: '当前会话的临时偏好设置',
      示例: '页面显示模式、临时筛选条件'
    },
    单次会话数据: {
      描述: '仅对当前交互会话有意义的数据',
      示例: '向导步骤、临时认证状态'
    },
    隐私数据: {
      描述: '不希望持久化的敏感信息',
      示例: '登录后的用户基本信息(页面关闭即清除)'
    }
  };
}
```

实际应用示例：

```js
/**
 * 使用SessionStorage保存表单状态
 * @param {HTMLFormElement} form 表单元素
 */
function saveFormState(form) {
  const formData = {};
  
  // 收集表单数据
  for (const element of form.elements) {
    if (element.name) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        formData[element.name] = element.checked;
      } else {
        formData[element.name] = element.value;
      }
    }
  }
  
  // 保存到SessionStorage
  sessionStorage.setItem('savedFormState', JSON.stringify(formData));
}

/**
 * 从SessionStorage恢复表单状态
 * @param {HTMLFormElement} form 表单元素
 * @returns {boolean} 是否成功恢复
 */
function restoreFormState(form) {
  const savedState = sessionStorage.getItem('savedFormState');
  if (!savedState) return false;
  
  try {
    const formData = JSON.parse(savedState);
    
    // 填充表单数据
    for (const element of form.elements) {
      if (element.name && formData.hasOwnProperty(element.name)) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = formData[element.name];
        } else {
          element.value = formData[element.name];
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('恢复表单状态失败:', error);
    return false;
  }
}
```

### Storage事件

当存储区域发生变化时，会触发storage事件，可用于在同源的不同页面间进行通信：

```js
/**
 * 使用Storage事件进行跨标签页通信
 */
function crossTabCommunication() {
  // 在一个页面中发送消息
  function broadcastMessage(message) {
    localStorage.setItem('broadcast', JSON.stringify({
      message,
      timestamp: Date.now()
    }));
    // 确保下次相同消息也能触发事件
    localStorage.removeItem('broadcast');
  }
  
  // 在其他页面监听消息
  function listenForMessages(callback) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'broadcast' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          callback(data.message, data.timestamp);
        } catch (e) {
          console.error('解析广播消息失败:', e);
        }
      }
    });
  }
  
  // 使用示例
  listenForMessages((message, timestamp) => {
    console.log(`收到消息(${new Date(timestamp).toLocaleTimeString()}): ${message}`);
  });
  
  // 在某个操作后发送
  document.getElementById('logout-btn').addEventListener('click', () => {
    // 广播消息到所有同源标签页
    broadcastMessage('USER_LOGGED_OUT');
  });
}
```

### 存储容量与性能

Web Storage的容量限制和性能特性：

```js
/**
 * Web Storage容量与性能特性
 * @returns {Object} 特性说明
 */
function storageCapacityAndPerformance() {
  return {
    容量限制: {
      通常限制: '5-10MB(取决于浏览器)',
      Chrome: '10MB左右',
      Firefox: '10MB左右',
      Safari: '5MB左右',
      IE/Edge: '10MB左右',
      检测方法: '可通过尝试存储大量数据并捕获异常来检测'
    },
    性能特性: {
      读写速度: '同步操作，速度快(比IndexedDB快)',
      阻塞: '由于是同步API，大量操作可能阻塞主线程',
      适用数据量: '适合存储小到中等量的数据(<1MB)'
    },
    注意事项: {
      存储溢出: '超出限制会抛出QuotaExceededError',
      序列化限制: 'JSON.stringify无法处理循环引用和某些特殊对象',
      隐私模式: '某些浏览器的隐私模式下可能无法写入或容量极小'
    }
  };
}
```

检测可用存储空间:

```js
/**
 * 检测LocalStorage可用空间
 * @returns {number} 可用空间(MB)
 */
function checkAvailableStorageSpace() {
  if (!window.localStorage) {
    return 0;
  }
  
  // 保存当前存储内容
  const prevData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    prevData[key] = localStorage.getItem(key);
  }
  
  // 尝试填充存储到溢出
  const testKey = '___test_key___';
  const oneKB = 'A'.repeat(1024); // 1KB的字符串
  let usedSpace = 0;
  
  try {
    // 清空之前的测试数据
    localStorage.removeItem(testKey);
    let testValue = '';
    
    // 每次添加1KB，直到存储溢出
    while (true) {
      testValue += oneKB;
      localStorage.setItem(testKey, testValue);
      usedSpace = testValue.length / 1024; // KB
    }
  } catch (e) {
    // 达到限制，溢出异常
  } finally {
    // 清理测试数据
    localStorage.removeItem(testKey);
    
    // 恢复原始数据
    for (const key in prevData) {
      localStorage.setItem(key, prevData[key]);
    }
  }
  
  // 转换为MB并返回
  return Math.round(usedSpace / 1024 * 100) / 100;
}
```

## IndexedDB

IndexedDB是一个高级客户端存储系统，允许应用程序在浏览器中存储和检索大量结构化数据。它使用索引实现高性能数据检索，并支持复杂的数据类型。

### 核心概念

IndexedDB的设计基于以下核心概念：

```js
/**
 * IndexedDB核心概念
 * @returns {Object} 概念解释
 */
function indexedDBConcepts() {
  return {
    数据库: '每个源(域名)可以创建多个命名数据库',
    对象仓库: '类似关系型数据库中的表，存储特定类型的数据',
    索引: '对数据的特定属性建立索引，提高查询性能',
    事务: '数据库操作通过事务进行，确保数据一致性',
    游标: '用于遍历对象仓库或索引中的记录',
    键范围: '定义查询的键值范围',
    请求: '异步API中的操作返回请求对象，通过事件处理结果',
    版本控制: '通过版本号管理数据库结构变更'
  };
}
```

与传统关系型数据库的比较：

```js
/**
 * IndexedDB与SQL数据库的概念对比
 * @returns {Object} 概念映射
 */
function conceptComparison() {
  return {
    Database: '数据库',
    Table: '对象仓库(Object Store)',
    Row: '数据对象',
    Column: '对象的属性',
    Primary Key: '键(Key)',
    Index: '索引'
  };
}
```

### 基本操作

IndexedDB的基本操作包括打开数据库、创建对象仓库、添加、获取、更新和删除数据：

```js
/**
 * IndexedDB基础操作包装器
 */
const IndexedDBHelper = {
  /**
   * 打开数据库
   * @param {string} dbName 数据库名称
   * @param {number} version 数据库版本
   * @param {Function} upgradeCallback 升级回调函数
   * @returns {Promise<IDBDatabase>} 数据库连接
   */
  openDB(dbName, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
      
      request.onerror = event => {
        reject(event.target.error);
      };
      
      request.onsuccess = event => {
        const db = event.target.result;
        resolve(db);
      };
      
      // 数据库升级事件(首次创建或版本更新时触发)
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (typeof upgradeCallback === 'function') {
          upgradeCallback(db, event.oldVersion, event.newVersion);
        }
      };
    });
  },
  
  /**
   * 创建对象仓库
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {Object} options 仓库选项
   * @returns {IDBObjectStore} 创建的对象仓库
   */
  createObjectStore(db, storeName, options = {}) {
    // 默认选项
    const defaultOptions = {
      keyPath: 'id',
      autoIncrement: true
    };
    
    // 合并选项
    const storeOptions = { ...defaultOptions, ...options };
    
    // 创建并返回对象仓库
    return db.createObjectStore(storeName, storeOptions);
  },
  
  /**
   * 创建索引
   * @param {IDBObjectStore} store 对象仓库
   * @param {string} indexName 索引名称
   * @param {string} keyPath 索引键路径
   * @param {Object} options 索引选项
   * @returns {IDBIndex} 创建的索引
   */
  createIndex(store, indexName, keyPath, options = {}) {
    return store.createIndex(indexName, keyPath, options);
  },
  
  /**
   * 添加数据
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {Object|Array} data 要添加的数据(对象或数组)
   * @param {string} mode 事务模式
   * @returns {Promise<any>} 操作结果
   */
  add(db, storeName, data, mode = 'readwrite') {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      // 处理事务完成和错误
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = event => reject(event.target.error);
      
      // 添加单个对象或多个对象
      if (Array.isArray(data)) {
        data.forEach(item => {
          store.add(item);
        });
      } else {
        const request = store.add(data);
        request.onsuccess = event => {
          // 返回生成的键
          resolve(event.target.result);
        };
      }
    });
  },
  
  /**
   * 获取数据
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {*} key 主键值
   * @returns {Promise<any>} 查询结果
   */
  get(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 更新数据
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {Object} data 要更新的数据
   * @returns {Promise<any>} 操作结果
   */
  put(db, storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 删除数据
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {*} key 要删除的主键
   * @returns {Promise<boolean>} 操作结果
   */
  delete(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 清空对象仓库
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @returns {Promise<boolean>} 操作结果
   */
  clear(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  }
};
```

使用示例：设置一个简单的任务管理应用程序：

```js
/**
 * 任务管理应用 - IndexedDB实现
 */
async function setupTaskManager() {
  try {
    // 1. 打开数据库
    const db = await IndexedDBHelper.openDB('TaskManager', 1, (db, oldVersion, newVersion) => {
      // 数据库初始化或升级
      if (oldVersion < 1) {
        // 创建任务仓库
        const taskStore = IndexedDBHelper.createObjectStore(db, 'tasks', {
          keyPath: 'id',
          autoIncrement: true
        });
        
        // 创建索引
        IndexedDBHelper.createIndex(taskStore, 'byTitle', 'title', { unique: false });
        IndexedDBHelper.createIndex(taskStore, 'byStatus', 'status', { unique: false });
        IndexedDBHelper.createIndex(taskStore, 'byDueDate', 'dueDate', { unique: false });
      }
    });
    
    // 2. 添加任务
    const taskId = await IndexedDBHelper.add(db, 'tasks', {
      title: '完成项目报告',
      description: '编写第一季度项目总结报告',
      status: 'pending',
      dueDate: new Date('2023-04-15').getTime(),
      createdAt: Date.now()
    });
    
    console.log(`任务已添加，ID: ${taskId}`);
    
    // 3. 获取任务
    const task = await IndexedDBHelper.get(db, 'tasks', taskId);
    console.log('获取的任务:', task);
    
    // 4. 更新任务
    task.status = 'in-progress';
    await IndexedDBHelper.put(db, 'tasks', task);
    console.log('任务状态已更新');
    
    // 5. 关闭数据库连接
    db.close();
    
    return '任务管理器设置成功';
  } catch (error) {
    console.error('任务管理器设置失败:', error);
    throw error;
  }
}
```

### 事务与游标

事务确保数据库操作的完整性，而游标允许有效遍历数据集：

```js
/**
 * 事务和游标操作
 */
const TransactionAndCursorOps = {
  /**
   * 使用事务批量操作
   * @param {IDBDatabase} db 数据库连接
   * @param {string|Array<string>} storeNames 仓库名称(单个或多个)
   * @param {Function} callback 事务回调函数
   * @param {string} mode 事务模式
   * @returns {Promise<any>} 操作结果
   */
  runTransaction(db, storeNames, callback, mode = 'readwrite') {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, mode);
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = event => {
        reject(event.target.error);
      };
      
      // 回调中可以获取对象仓库并执行操作
      const result = callback(transaction);
      
      // 如果回调返回Promise，等待其完成
      if (result instanceof Promise) {
        result.catch(reject);
      }
    });
  },
  
  /**
   * 使用游标遍历所有记录
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {Function} callback 每条记录的处理函数
   * @returns {Promise<Array>} 所有记录
   */
  getAllWithCursor(db, storeName, callback) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const results = [];
      
      const request = store.openCursor();
      
      request.onsuccess = event => {
        const cursor = event.target.result;
        
        if (cursor) {
          // 如果提供了回调，执行处理
          if (typeof callback === 'function') {
            callback(cursor.value);
          }
          
          // 收集记录
          results.push(cursor.value);
          
          // 继续下一条记录
          cursor.continue();
        } else {
          // 遍历完成
          resolve(results);
        }
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 使用键范围和游标进行范围查询
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {IDBKeyRange} range 键范围
   * @param {string} direction 遍历方向
   * @returns {Promise<Array>} 查询结果
   */
  getByKeyRange(db, storeName, indexName, range, direction = 'next') {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      let request;
      
      // 使用索引或直接使用对象仓库
      if (indexName) {
        const index = store.index(indexName);
        request = index.openCursor(range, direction);
      } else {
        request = store.openCursor(range, direction);
      }
      
      const results = [];
      
      request.onsuccess = event => {
        const cursor = event.target.result;
        
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  }
};
```

使用事务和游标的示例：

```js
/**
 * 使用事务和游标的示例
 */
async function transactionAndCursorExample() {
  try {
    const db = await IndexedDBHelper.openDB('TaskManager', 1);
    
    // 1. 使用事务批量添加任务
    await TransactionAndCursorOps.runTransaction(db, 'tasks', transaction => {
      const taskStore = transaction.objectStore('tasks');
      
      // 批量添加多个任务
      const tasks = [
        { title: '更新网站', status: 'pending', dueDate: Date.now() + 86400000 },
        { title: '编写文档', status: 'in-progress', dueDate: Date.now() + 172800000 },
        { title: '修复Bug', status: 'pending', dueDate: Date.now() + 259200000 }
      ];
      
      tasks.forEach(task => {
        taskStore.add(task);
      });
    });
    
    // 2. 使用游标获取所有任务
    const allTasks = await TransactionAndCursorOps.getAllWithCursor(db, 'tasks', task => {
      console.log(`处理任务: ${task.title}`);
    });
    
    console.log(`总共获取到 ${allTasks.length} 个任务`);
    
    // 3. 使用键范围查询即将到期的任务
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const range = IDBKeyRange.upperBound(tomorrow.getTime());
    const upcomingTasks = await TransactionAndCursorOps.getByKeyRange(db, 'tasks', 'byDueDate', range);
    
    console.log(`找到 ${upcomingTasks.length} 个即将到期的任务`);
    
    db.close();
    return '事务和游标示例完成';
  } catch (error) {
    console.error('事务和游标示例失败:', error);
    throw error;
  }
}
```

### 索引与查询

IndexedDB的索引使得高效查询成为可能：

```js
/**
 * 索引和高级查询操作
 */
const IndexAndQueryOps = {
  /**
   * 通过索引查询单个记录
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {*} value 索引值
   * @returns {Promise<any>} 查询结果
   */
  getByIndex(db, storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 通过索引查询多条记录
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {*} value 索引值
   * @returns {Promise<Array>} 查询结果
   */
  getAllByIndex(db, storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 创建复合键索引
   * @param {IDBObjectStore} store 对象仓库
   * @param {string} indexName 索引名称
   * @param {Array<string>} keyPaths 键路径数组
   * @param {Object} options 索引选项
   * @returns {IDBIndex} 创建的索引
   */
  createCompositeIndex(store, indexName, keyPaths, options = {}) {
    return store.createIndex(indexName, keyPaths, options);
  },
  
  /**
   * 使用复合键索引查询
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {string} indexName 复合索引名称
   * @param {Array} values 值数组
   * @returns {Promise<Array>} 查询结果
   */
  queryByCompositeIndex(db, storeName, indexName, values) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(values);
      
      request.onsuccess = event => {
        resolve(event.target.result);
      };
      
      request.onerror = event => {
        reject(event.target.error);
      };
    });
  },
  
  /**
   * 执行分页查询
   * @param {IDBDatabase} db 数据库连接
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称(可选)
   * @param {number} pageSize 每页记录数
   * @param {number} pageNumber 页码(从1开始)
   * @returns {Promise<Object>} 分页结果
   */
  paginatedQuery(db, storeName, indexName = null, pageSize = 10, pageNumber = 1) {
    return new Promise((resolve, reject) => {
      // 计算要跳过的记录数
      const skipCount = (pageNumber - 1) * pageSize;
      
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      
      // 先获取总记录数
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        const totalRecords = countRequest.result;
        const totalPages = Math.ceil(totalRecords / pageSize);
        
        // 如果请求的页码超出范围
        if (pageNumber > totalPages) {
          resolve({
            data: [],
            pagination: {
              pageSize,
              pageNumber,
              totalRecords,
              totalPages
            }
          });
          return;
        }
        
        // 使用游标分页查询
        const request = source.openCursor();
        let currentIndex = 0;
        const results = [];
        
        request.onsuccess = event => {
          const cursor = event.target.result;
          
          if (!cursor) {
            // 查询完成，返回结果
            resolve({
              data: results,
              pagination: {
                pageSize,
                pageNumber,
                totalRecords,
                totalPages
              }
            });
            return;
          }
          
          // 跳过前面的记录
          if (currentIndex < skipCount) {
            currentIndex++;
            cursor.advance(skipCount - currentIndex + 1);
            return;
          }
          
          // 收集当前页的记录
          if (results.length < pageSize) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            // 已获取足够的记录
            resolve({
              data: results,
              pagination: {
                pageSize,
                pageNumber,
                totalRecords,
                totalPages
              }
            });
          }
        };
        
        request.onerror = event => {
          reject(event.target.error);
        };
      };
      
      countRequest.onerror = event => {
        reject(event.target.error);
      };
    });
  }
};
```

使用索引和高级查询的示例：

```js
/**
 * 使用索引和高级查询的示例
 */
async function indexAndQueryExample() {
  try {
    // 打开数据库并升级
    const db = await IndexedDBHelper.openDB('ProductCatalog', 1, (db, oldVersion, newVersion) => {
      if (oldVersion < 1) {
        // 创建产品仓库
        const productStore = IndexedDBHelper.createObjectStore(db, 'products', {
          keyPath: 'id',
          autoIncrement: true
        });
        
        // 创建基本索引
        IndexedDBHelper.createIndex(productStore, 'byCategory', 'category', { unique: false });
        IndexedDBHelper.createIndex(productStore, 'byPrice', 'price', { unique: false });
        
        // 创建复合索引
        IndexAndQueryOps.createCompositeIndex(
          productStore, 
          'byCategoryAndPrice', 
          ['category', 'price'], 
          { unique: false }
        );
      }
    });
    
    // 添加示例产品数据
    await TransactionAndCursorOps.runTransaction(db, 'products', transaction => {
      const store = transaction.objectStore('products');
      
      const products = [
        { name: '笔记本电脑', category: '电子产品', price: 5999, stock: 10 },
        { name: '智能手机', category: '电子产品', price: 2999, stock: 20 },
        { name: '无线耳机', category: '电子产品', price: 899, stock: 30 },
        { name: '牛仔裤', category: '服装', price: 299, stock: 50 },
        { name: 'T恤', category: '服装', price: 99, stock: 100 },
        { name: '运动鞋', category: '鞋类', price: 499, stock: 40 },
        { name: '皮鞋', category: '鞋类', price: 899, stock: 25 }
      ];
      
      products.forEach(product => {
        store.add(product);
      });
    });
    
    // 1. 通过索引查询特定类别的产品
    const electronicProducts = await IndexAndQueryOps.getAllByIndex(db, 'products', 'byCategory', '电子产品');
    console.log(`找到 ${electronicProducts.length} 个电子产品`);
    
    // 2. 使用键范围查询特定价格范围的产品
    const priceRange = IDBKeyRange.bound(300, 1000);
    const midRangeProducts = await TransactionAndCursorOps.getByKeyRange(db, 'products', 'byPrice', priceRange);
    console.log(`价格在300-1000之间的产品: ${midRangeProducts.length} 个`);
    
    // 3. 分页查询产品
    const page1 = await IndexAndQueryOps.paginatedQuery(db, 'products', null, 3, 1);
    console.log(`第1页产品(每页3个):`);
    console.log(`- 总记录数: ${page1.pagination.totalRecords}`);
    console.log(`- 总页数: ${page1.pagination.totalPages}`);
    console.log(`- 当前页产品: ${page1.data.map(p => p.name).join(', ')}`);
    
    db.close();
    return '索引和查询示例完成';
  } catch (error) {
    console.error('索引和查询示例失败:', error);
    throw error;
  }
}
```

## Cache Storage与Service Worker

Cache Storage API与Service Worker一起提供了强大的离线缓存能力，使web应用可以在网络不可用时继续运行。

### Cache Storage基础

Cache Storage提供了一种存储网络请求和响应对的机制，主要用于离线缓存：

```js
/**
 * Cache Storage基本操作
 */
const CacheStorageHelper = {
  /**
   * 打开指定名称的缓存
   * @param {string} cacheName 缓存名称
   * @returns {Promise<Cache>} 缓存对象
   */
  async openCache(cacheName) {
    return await caches.open(cacheName);
  },
  
  /**
   * 缓存资源
   * @param {string} cacheName 缓存名称
   * @param {string|Array} urls 要缓存的URL或URL数组
   * @returns {Promise<boolean>} 操作结果
   */
  async cacheResources(cacheName, urls) {
    try {
      const cache = await this.openCache(cacheName);
      
      if (Array.isArray(urls)) {
        await Promise.all(urls.map(url => fetch(url).then(response => {
          if (!response.ok) {
            throw new Error(`Network error: ${response.statusText}`);
          }
          return cache.put(url, response);
        })));
      } else {
        const response = await fetch(urls);
        if (!response.ok) {
          throw new Error(`Network error: ${response.statusText}`);
        }
        await cache.put(urls, response);
      }
      
      return true;
    } catch (error) {
      console.error('缓存资源失败:', error);
      return false;
    }
  },
  
  /**
   * 从缓存中获取资源
   * @param {string} url 资源URL
   * @param {string} cacheName 指定缓存名称(可选)
   * @returns {Promise<Response|null>} 响应对象或null
   */
  async getFromCache(url, cacheName = null) {
    try {
      if (cacheName) {
        // 从指定缓存中获取
        const cache = await this.openCache(cacheName);
        return await cache.match(url);
      } else {
        // 从所有缓存中查找
        return await caches.match(url);
      }
    } catch (error) {
      console.error('从缓存获取资源失败:', error);
      return null;
    }
  },
  
  /**
   * 删除缓存中的资源
   * @param {string} cacheName 缓存名称
   * @param {string} url 要删除的资源URL
   * @returns {Promise<boolean>} 操作结果
   */
  async deleteFromCache(cacheName, url) {
    try {
      const cache = await this.openCache(cacheName);
      return await cache.delete(url);
    } catch (error) {
      console.error('删除缓存资源失败:', error);
      return false;
    }
  },
  
  /**
   * 清空指定的缓存
   * @param {string} cacheName 缓存名称
   * @returns {Promise<boolean>} 操作结果
   */
  async clearCache(cacheName) {
    try {
      return await caches.delete(cacheName);
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  },
  
  /**
   * 获取所有缓存的名称
   * @returns {Promise<Array<string>>} 缓存名称数组
   */
  async getCacheNames() {
    try {
      const cacheNames = await caches.keys();
      return cacheNames;
    } catch (error) {
      console.error('获取缓存名称失败:', error);
      return [];
    }
  }
};
```

### Service Worker与离线策略

Service Worker作为一个特殊的工作线程，可以拦截网络请求并实现各种缓存策略：

```js
/**
 * Service Worker注册与管理
 */
const ServiceWorkerManager = {
  /**
   * 注册Service Worker
   * @param {string} swPath Service Worker脚本路径
   * @param {Object} options 注册选项
   * @returns {Promise<ServiceWorkerRegistration>} 注册对象
   */
  async register(swPath, options = {}) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(swPath, options);
        console.log('Service Worker注册成功，作用域:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker注册失败:', error);
        throw error;
      }
    } else {
      throw new Error('此浏览器不支持Service Worker');
    }
  },
  
  /**
   * 检查Service Worker状态
   * @returns {Promise<Object>} Service Worker状态信息
   */
  async getStatus() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
          return { registered: false, active: false };
        }
        
        return {
          registered: true,
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          controller: !!navigator.serviceWorker.controller
        };
      } catch (error) {
        console.error('检查Service Worker状态失败:', error);
        return { error: error.message };
      }
    } else {
      return { supported: false };
    }
  },
  
  /**
   * 更新Service Worker
   * @returns {Promise<boolean>} 更新结果
   */
  async update() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          await registration.update();
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('更新Service Worker失败:', error);
        return false;
      }
    } else {
      return false;
    }
  },
  
  /**
   * 卸载Service Worker
   * @returns {Promise<boolean>} 卸载结果
   */
  async unregister() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          const success = await registration.unregister();
          return success;
        }
        
        return false;
      } catch (error) {
        console.error('卸载Service Worker失败:', error);
        return false;
      }
    } else {
      return false;
    }
  },
  
  /**
   * 发送消息到Service Worker
   * @param {any} message 要发送的消息
   * @returns {Promise<any>} 消息回复
   */
  async sendMessage(message) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        
        // 设置接收回复的处理器
        messageChannel.port1.onmessage = event => {
          resolve(event.data);
        };
        
        // 发送消息
        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
        
        // 设置超时
        setTimeout(() => {
          reject(new Error('发送消息到Service Worker超时'));
        }, 3000);
      });
    } else {
      throw new Error('Service Worker未激活或不支持');
    }
  }
};
```

Service Worker常用缓存策略示例：

```js
// service-worker.js

// 定义缓存名称
const CACHE_NAME = 'app-v1';

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png'
];

// 安装事件处理 - 预缓存静态资源
self.addEventListener('install', event => {
  console.log('Service Worker安装中...');
  
  // 确保Service Worker不会在安装完成前终止
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('静态资源缓存中...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('预缓存完成');
        // 立即激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件处理 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('Service Worker激活中...');
  
  event.waitUntil(
    // 获取所有缓存名称
    caches.keys()
      .then(cacheNames => {
        // 删除旧版本缓存
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log(`删除旧缓存: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('Service Worker现在控制页面');
        return self.clients.claim();
      })
  );
});

/**
 * 网络优先策略
 * 先尝试网络请求，失败时回退到缓存
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // 请求成功，则复制响应并存入缓存
      const clonedResponse = response.clone();
      
      caches.open(CACHE_NAME)
        .then(cache => cache.put(request, clonedResponse));
      
      return response;
    })
    .catch(() => {
      // 网络请求失败，尝试从缓存获取
      return caches.match(request);
    });
}

/**
 * 缓存优先策略
 * 先尝试从缓存获取，未命中时从网络获取
 */
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // 返回缓存响应或从网络获取
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then(response => {
          // 请求成功，则复制响应并存入缓存
          const clonedResponse = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, clonedResponse));
          
          return response;
        });
    });
}

/**
 * 仅缓存策略
 * 只从缓存获取，缓存中不存在则返回自定义离线响应
 */
function cacheOnlyStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 返回自定义离线响应
      return caches.match('/offline.html');
    });
}

/**
 * 仅网络策略
 * 仅从网络获取，网络失败则返回自定义离线响应
 */
function networkOnlyStrategy(request) {
  return fetch(request)
    .catch(() => {
      return caches.match('/offline.html');
    });
}

/**
 * 缓存并网络策略
 * 同时从缓存和网络获取，先返回缓存结果，然后用网络响应更新缓存
 */
function staleWhileRevalidateStrategy(request) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      // 先尝试从缓存获取
      return cache.match(request)
        .then(cachedResponse => {
          // 同时发起网络请求
          const fetchPromise = fetch(request)
            .then(networkResponse => {
              // 将网络响应存入缓存
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          
          // 优先返回缓存响应，没有则等待网络响应
          return cachedResponse || fetchPromise;
        });
    });
}

// 应用策略函数
function applyStrategy(request) {
  const url = new URL(request.url);
  
  // 静态资源使用缓存优先策略
  if (STATIC_CACHE_URLS.includes(url.pathname) || 
      url.pathname.startsWith('/styles/') || 
      url.pathname.startsWith('/scripts/') || 
      url.pathname.startsWith('/images/')) {
    return cacheFirstStrategy(request);
  }
  
  // API请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    return networkFirstStrategy(request);
  }
  
  // HTML页面使用stale-while-revalidate策略
  if (request.headers.get('Accept').includes('text/html')) {
    return staleWhileRevalidateStrategy(request);
  }
  
  // 默认使用网络优先策略
  return networkFirstStrategy(request);
}

// 拦截fetch事件
self.addEventListener('fetch', event => {
  event.respondWith(applyStrategy(event.request));
});

// 处理从页面发来的消息
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  // 响应消息
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({
      result: 'success',
      message: '已收到消息: ' + JSON.stringify(event.data)
    });
  }
});
```

使用示例：

```js
// 在主应用中注册Service Worker
async function setupOfflineSupport() {
  try {
    // 1. 注册Service Worker
    const registration = await ServiceWorkerManager.register('/service-worker.js');
    
    // 2. 检查Service Worker状态
    const status = await ServiceWorkerManager.getStatus();
    console.log('Service Worker状态:', status);
    
    // 3. 使用Cache Storage手动缓存额外资源
    const dynamicCache = await CacheStorageHelper.openCache('dynamic-content-v1');
    
    // 缓存某些重要资源
    await CacheStorageHelper.cacheResources('dynamic-content-v1', [
      '/data/user-settings.json',
      '/data/app-config.json'
    ]);
    
    // 4. 列出所有缓存
    const cacheNames = await CacheStorageHelper.getCacheNames();
    console.log('当前活跃的缓存:', cacheNames);
    
    // 5. 消息通信
    if (status.controller) {
      const response = await ServiceWorkerManager.sendMessage({
        action: 'prefetchContent',
        urls: ['/api/latest-news']
      });
      
      console.log('来自Service Worker的响应:', response);
    }
    
    return '离线支持设置成功';
  } catch (error) {
    console.error('设置离线支持失败:', error);
    throw error;
  }
}
```

## Web SQL

Web SQL是一种已被废弃但仍被某些浏览器支持的客户端数据库技术，它基于SQLite，提供了关系型数据库能力。

> **注意**: Web SQL已被W3C废弃，不推荐在新项目中使用。IndexedDB是目前推荐的替代方案。

### 基本操作

尽管不再推荐使用，但了解Web SQL的基本操作仍然有助于理解浏览器存储的演变：

```js
/**
 * Web SQL数据库基本操作
 * 注意: Web SQL已被废弃，仅作为历史参考
 */
const WebSQLHelper = {
  /**
   * 打开数据库
   * @param {string} dbName 数据库名称
   * @param {string} version 版本号(字符串)
   * @param {string} description 数据库描述
   * @param {number} size 数据库大小(字节)
   * @returns {Database} 数据库对象
   */
  openDatabase(dbName, version = '1.0', description = '', size = 2 * 1024 * 1024) {
    try {
      return window.openDatabase(dbName, version, description, size);
    } catch (error) {
      console.error('打开Web SQL数据库失败:', error);
      throw error;
    }
  },
  
  /**
   * 执行SQL查询
   * @param {Database} db 数据库对象
   * @param {string} sql SQL语句
   * @param {Array} params 查询参数
   * @returns {Promise<Object>} 查询结果
   */
  executeSql(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(sql, params, 
          (tx, results) => {
            resolve(results);
          },
          (tx, error) => {
            reject(error);
            return false; // 回滚事务
          }
        );
      });
    });
  },
  
  /**
   * 创建表
   * @param {Database} db 数据库对象
   * @param {string} tableName 表名
   * @param {string} columns 列定义字符串
   * @returns {Promise<Object>} 执行结果
   */
  createTable(db, tableName, columns) {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    return this.executeSql(db, sql);
  },
  
  /**
   * 插入数据
   * @param {Database} db 数据库对象
   * @param {string} tableName 表名
   * @param {Object} data 要插入的数据对象
   * @returns {Promise<Object>} 执行结果
   */
  insert(db, tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return this.executeSql(db, sql, values);
  },
  
  /**
   * 查询数据
   * @param {Database} db 数据库对象
   * @param {string} sql SQL查询语句
   * @param {Array} params 查询参数
   * @returns {Promise<Array>} 查询结果数组
   */
  query(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      this.executeSql(db, sql, params)
        .then(results => {
          const rows = [];
          
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          
          resolve(rows);
        })
        .catch(reject);
    });
  },
  
  /**
   * 更新数据
   * @param {Database} db 数据库对象
   * @param {string} tableName 表名
   * @param {Object} data 要更新的数据对象
   * @param {string} whereClause WHERE子句
   * @param {Array} whereParams WHERE参数
   * @returns {Promise<Object>} 执行结果
   */
  update(db, tableName, data, whereClause, whereParams = []) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereParams];
    
    const sql = `UPDATE ${tableName} SET ${sets} WHERE ${whereClause}`;
    return this.executeSql(db, sql, values);
  },
  
  /**
   * 删除数据
   * @param {Database} db 数据库对象
   * @param {string} tableName 表名
   * @param {string} whereClause WHERE子句
   * @param {Array} whereParams WHERE参数
   * @returns {Promise<Object>} 执行结果
   */
  delete(db, tableName, whereClause, whereParams = []) {
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    return this.executeSql(db, sql, whereParams);
  }
};
```

使用Web SQL的简单示例：

```js
/**
 * Web SQL使用示例
 * 注意: 仅作为历史参考，不建议在新项目中使用
 */
async function webSQLExample() {
  try {
    // 1. 打开数据库
    const db = WebSQLHelper.openDatabase('NotesDB', '1.0', '用户笔记数据库', 2 * 1024 * 1024);
    
    // 2. 创建笔记表
    await WebSQLHelper.createTable(db, 'notes', `
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    `);
    
    // 3. 插入笔记
    const insertResult = await WebSQLHelper.insert(db, 'notes', {
      title: '会议纪要',
      content: '讨论了项目进度和下一步计划'
    });
    
    console.log(`插入的笔记ID: ${insertResult.insertId}`);
    
    // 4. 查询所有笔记
    const notes = await WebSQLHelper.query(db, 'SELECT * FROM notes ORDER BY created_at DESC');
    console.log(`共查询到 ${notes.length} 条笔记`);
    
    // 5. 更新笔记
    await WebSQLHelper.update(db, 'notes', 
      { title: '更新后的会议纪要', content: '包含更多详细信息' },
      'id = ?', [insertResult.insertId]
    );
    
    // 6. 查询更新后的笔记
    const updatedNote = await WebSQLHelper.query(db, 'SELECT * FROM notes WHERE id = ?', [insertResult.insertId]);
    console.log('更新后的笔记:', updatedNote[0]);
    
    return '示例执行完成';
  } catch (error) {
    console.error('Web SQL示例执行失败:', error);
    throw error;
  }
}
```

### Web SQL的局限性

Web SQL作为一项已废弃的技术，存在以下局限性：

1. **标准化问题**: W3C已停止维护Web SQL规范，没有统一标准
2. **浏览器支持**: Safari和基于Chromium的浏览器仍支持，但Firefox从未实现支持
3. **依赖SQLite**: 实现过度依赖特定的SQL引擎
4. **异步API设计**: 使用回调风格API，而非现代Promise或async/await
5. **数据库结构更新**: 升级数据库结构的机制不够优雅

## File System API

File System API允许网页应用直接读写用户设备上的文件和目录。该API有几个不同的版本，包括更现代的File System Access API。

### 传统File API

基础的File API允许读取用户通过`<input type="file">`选择的文件：

```js
/**
 * 文件操作辅助工具
 */
const FileHelper = {
  /**
   * 从文件输入元素读取文件
   * @param {HTMLInputElement} fileInput 文件输入元素
   * @returns {File|null} 文件对象或null
   */
  getSelectedFile(fileInput) {
    if (fileInput.files && fileInput.files.length > 0) {
      return fileInput.files[0];
    }
    return null;
  },
  
  /**
   * 读取文件内容为文本
   * @param {File} file 文件对象
   * @returns {Promise<string>} 文件文本内容
   */
  readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  },
  
  /**
   * 读取文件内容为数据URL
   * @param {File} file 文件对象
   * @returns {Promise<string>} 数据URL
   */
  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * 读取文件内容为ArrayBuffer
   * @param {File} file 文件对象
   * @returns {Promise<ArrayBuffer>} ArrayBuffer对象
   */
  readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  },
  
  /**
   * 创建Blob文件并下载
   * @param {string|ArrayBuffer|Blob} content 文件内容
   * @param {string} filename 文件名
   * @param {string} mimeType MIME类型
   */
  downloadFile(content, filename, mimeType = 'text/plain') {
    let blob;
    
    // 根据内容类型创建Blob
    if (content instanceof Blob) {
      blob = content;
    } else if (content instanceof ArrayBuffer) {
      blob = new Blob([content], { type: mimeType });
    } else {
      // 默认作为字符串处理
      blob = new Blob([content], { type: mimeType });
    }
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    // 添加到文档中并触发点击
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
};
```

### 文件系统访问API

现代的File System Access API允许Web应用直接与用户设备上的文件交互：

```js
/**
 * 现代文件系统访问API
 * 注意: 此API仅在支持的浏览器中可用，如Chrome和Edge
 */
const FSAccessHelper = {
  /**
   * 检查浏览器是否支持文件系统访问API
   * @returns {boolean} 是否支持
   */
  isSupported() {
    return 'showOpenFilePicker' in window;
  },
  
  /**
   * 显示打开文件选择器
   * @param {Object} options 选择器选项
   * @returns {Promise<FileSystemFileHandle>} 文件句柄
   */
  async showOpenFilePicker(options = {}) {
    if (!this.isSupported()) {
      throw new Error('此浏览器不支持文件系统访问API');
    }
    
    // 默认选项
    const defaultOptions = {
      types: [
        {
          description: '文本文件',
          accept: {
            'text/plain': ['.txt']
          }
        }
      ],
      multiple: false
    };
    
    // 合并选项
    const pickerOptions = { ...defaultOptions, ...options };
    
    try {
      const handles = await window.showOpenFilePicker(pickerOptions);
      return pickerOptions.multiple ? handles : handles[0];
    } catch (error) {
      // 用户取消选择不抛出错误
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * 显示保存文件选择器
   * @param {Object} options 选择器选项
   * @returns {Promise<FileSystemFileHandle>} 文件句柄
   */
  async showSaveFilePicker(options = {}) {
    if (!this.isSupported()) {
      throw new Error('此浏览器不支持文件系统访问API');
    }
    
    // 默认选项
    const defaultOptions = {
      types: [
        {
          description: '文本文件',
          accept: {
            'text/plain': ['.txt']
          }
        }
      ],
      suggestedName: 'untitled.txt'
    };
    
    // 合并选项
    const pickerOptions = { ...defaultOptions, ...options };
    
    try {
      return await window.showSaveFilePicker(pickerOptions);
    } catch (error) {
      // 用户取消选择不抛出错误
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * 显示目录选择器
   * @param {Object} options 选择器选项
   * @returns {Promise<FileSystemDirectoryHandle>} 目录句柄
   */
  async showDirectoryPicker(options = {}) {
    if (!this.isSupported()) {
      throw new Error('此浏览器不支持文件系统访问API');
    }
    
    try {
      return await window.showDirectoryPicker(options);
    } catch (error) {
      // 用户取消选择不抛出错误
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * 从文件句柄读取文件内容
   * @param {FileSystemFileHandle} fileHandle 文件句柄
   * @returns {Promise<string>} 文件内容
   */
  async readFile(fileHandle) {
    // 获取文件对象
    const file = await fileHandle.getFile();
    
    // 读取文件内容
    return await FileHelper.readAsText(file);
  },
  
  /**
   * 写入内容到文件
   * @param {FileSystemFileHandle} fileHandle 文件句柄
   * @param {string|ArrayBuffer|Blob} content 文件内容
   * @returns {Promise<void>} 完成Promise
   */
  async writeFile(fileHandle, content) {
    // 获取可写流
    const writable = await fileHandle.createWritable();
    
    try {
      // 写入内容
      await writable.write(content);
      
      // 关闭流
      await writable.close();
    } catch (error) {
      // 确保关闭流
      await writable.close();
      throw error;
    }
  },
  
  /**
   * 递归列出目录内容
   * @param {FileSystemDirectoryHandle} dirHandle 目录句柄
   * @param {string} path 当前路径
   * @returns {Promise<Array>} 文件和目录列表
   */
  async listDirectory(dirHandle, path = '') {
    const entries = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      const entryPath = path ? `${path}/${name}` : name;
      
      if (handle.kind === 'file') {
        const file = await handle.getFile();
        entries.push({
          kind: 'file',
          name,
          path: entryPath,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          handle
        });
      } else if (handle.kind === 'directory') {
        const subEntries = await this.listDirectory(handle, entryPath);
        
        entries.push({
          kind: 'directory',
          name,
          path: entryPath,
          entries: subEntries,
          handle
        });
      }
    }
    
    return entries;
  }
};
```

使用现代File System Access API的示例：

```js
/**
 * 文本编辑器示例 - 使用文件系统访问API
 */
async function textEditorExample() {
  // 检查API支持
  if (!FSAccessHelper.isSupported()) {
    console.error('此浏览器不支持文件系统访问API');
    return '不支持文件系统访问API';
  }
  
  try {
    // 1. 打开文件
    const fileHandle = await FSAccessHelper.showOpenFilePicker({
      types: [
        {
          description: '文本文件',
          accept: {
            'text/plain': ['.txt', '.md', '.js', '.html', '.css']
          }
        }
      ]
    });
    
    if (!fileHandle) {
      return '用户取消了文件选择';
    }
    
    // 2. 读取文件内容
    const content = await FSAccessHelper.readFile(fileHandle);
    console.log(`已读取文件: ${fileHandle.name}, 大小: ${content.length} 字符`);
    
    // 3. 修改内容(在实际应用中，这里会显示编辑器UI)
    const modifiedContent = content + '\n// 编辑于 ' + new Date().toLocaleString();
    
    // 4. 保存修改
    await FSAccessHelper.writeFile(fileHandle, modifiedContent);
    console.log('文件保存成功');
    
    // 5. 选择目录并列出内容
    const dirHandle = await FSAccessHelper.showDirectoryPicker();
    
    if (dirHandle) {
      const entries = await FSAccessHelper.listDirectory(dirHandle);
      console.log('目录内容:', entries);
    }
    
    return '文本编辑器示例完成';
  } catch (error) {
    console.error('文本编辑器示例失败:', error);
    throw error;
  }
}
```

## 多存储方案对比

不同存储方案各有特点，适合不同的应用场景：

```js
/**
 * 各存储方案特性对比
 * @returns {Object} 对比结果
 */
function storageComparison() {
  return {
    Cookie: {
      存储限制: '~4KB/域名',
      过期机制: '支持自定义',
      作用域: 'domain+path定义',
      服务器通信: '自动随请求发送',
      请求性能影响: '显著(每次请求都携带)',
      API复杂度: '中等',
      安全特性: '多种安全属性',
      适用场景: '身份验证、个性化设置'
    },
    LocalStorage: {
      存储限制: '~5-10MB/域名',
      过期机制: '永久(手动删除)',
      作用域: '同源策略',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '简单',
      安全特性: '有限',
      适用场景: '持久化用户偏好、缓存'
    },
    SessionStorage: {
      存储限制: '~5-10MB/域名',
      过期机制: '会话结束时过期',
      作用域: '当前窗口/标签页',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '简单',
      安全特性: '有限',
      适用场景: '表单暂存、单页应用状态'
    },
    IndexedDB: {
      存储限制: '一般>250MB，取决于设备存储',
      过期机制: '永久(手动删除)',
      作用域: '同源策略',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '复杂',
      安全特性: '有限',
      适用场景: '大型应用数据、离线应用'
    },
    CacheStorage: {
      存储限制: '一般>1GB，取决于设备存储',
      过期机制: '永久(手动删除)',
      作用域: '同源策略',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '中等',
      安全特性: '有限',
      适用场景: '资源缓存、离线应用'
    },
    WebSQL: {
      存储限制: '一般~50MB',
      过期机制: '永久(手动删除)',
      作用域: '同源策略',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '复杂',
      安全特性: '有限',
      适用场景: '已废弃，不建议使用'
    },
    FileSystemAPI: {
      存储限制: '取决于用户授权',
      过期机制: '永久',
      作用域: '用户授权的文件/目录',
      服务器通信: '不自动发送',
      请求性能影响: '无',
      API复杂度: '复杂',
      安全特性: '基于用户授权',
      适用场景: '文件操作、编辑器应用'
    }
  };
}
```

### 存储方案选择流程图

以下是选择合适存储方案的决策流程：

```js
/**
 * 存储方案选择流程
 * @param {Object} params 应用需求参数
 * @returns {string} 推荐的存储方案
 */
function chooseStorageSolution(params) {
  // 需要与服务器自动同步
  if (params.autoSyncWithServer) {
    return 'Cookie';
  }
  
  // 需要存储大量结构化数据
  if (params.dataSize === 'large' && params.structuredData) {
    return 'IndexedDB';
  }
  
  // 需要离线访问网络资源
  if (params.offlineResourcesNeeded) {
    return 'CacheStorage with Service Worker';
  }
  
  // 需要跨浏览器窗口共享
  if (params.crossWindowSharing) {
    return 'LocalStorage';
  }
  
  // 仅在当前会话期间有效
  if (params.sessionOnly) {
    return 'SessionStorage';
  }
  
  // 需要直接操作用户文件系统
  if (params.needsFileSystemAccess) {
    return 'File System Access API';
  }
  
  // 默认简单存储
  return 'LocalStorage';
}
```

### 存储方案组合策略

实际应用中，往往需要结合多种存储方案：

```js
/**
 * 多级存储策略示例
 */
const MultiTierStorageStrategy = {
  /**
   * 根据数据特性选择存储方式
   * @param {string} dataKey 数据键
   * @param {*} data 要存储的数据
   * @param {Object} options 选项
   * @returns {Promise<boolean>} 存储结果
   */
  async store(dataKey, data, options = {}) {
    const dataSize = JSON.stringify(data).length;
    
    // 分类处理
    if (options.auth || options.critical) {
      // 认证信息、关键数据
      if (options.serverSync) {
        // 需要与服务器同步的重要数据
        this._storeCookie(dataKey, data, options);
      } else {
        // 本地关键数据，使用加密存储
        await this._storeEncryptedLocalStorage(dataKey, data, options);
      }
    } else if (dataSize > 1024 * 1024) {
      // 大型数据集
      await this._storeIndexedDB(dataKey, data, options);
    } else if (options.temporary) {
      // 临时数据
      this._storeSessionStorage(dataKey, data);
    } else {
      // 一般持久数据
      this._storeLocalStorage(dataKey, data);
    }
    
    return true;
  },
  
  /**
   * 从适当的存储中检索数据
   * @param {string} dataKey 数据键
   * @param {Object} options 选项
   * @returns {Promise<*>} 检索的数据
   */
  async retrieve(dataKey, options = {}) {
    let data = null;
    
    // 按优先级检索
    if (options.temporary) {
      // 先检查会话存储
      data = this._retrieveSessionStorage(dataKey);
    }
    
    if (!data && (options.auth || options.critical)) {
      if (options.serverSync) {
        // 检查Cookie
        data = this._retrieveCookie(dataKey);
      } else {
        // 检查加密存储
        data = await this._retrieveEncryptedLocalStorage(dataKey);
      }
    }
    
    if (!data) {
      // 检查本地存储
      data = this._retrieveLocalStorage(dataKey);
    }
    
    if (!data) {
      // 最后检查IndexedDB
      data = await this._retrieveIndexedDB(dataKey);
    }
    
    return data;
  },
  
  // 各种存储方法的实现...
  _storeCookie(key, value, options) {
    // 实现Cookie存储
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    CookieUtil.set(key, serialized, options);
  },
  
  _storeLocalStorage(key, value) {
    // 实现LocalStorage存储
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, serialized);
  },
  
  // ...更多实现方法
}
```

### 使用场景最佳实践

根据不同的数据类型和应用需求，推荐的存储方案：

```js
/**
 * 不同数据类型的推荐存储方案
 */
function recommendedStorageByDataType() {
  return {
    认证数据: {
      方案: 'HttpOnly Cookie(服务端设置)',
      说明: '安全性最高，防止XSS攻击窃取凭证'
    },
    用户偏好设置: {
      方案: 'LocalStorage',
      说明: '持久化存储，无需每次请求传输'
    },
    表单暂存数据: {
      方案: 'SessionStorage',
      说明: '会话期间有效，关闭页面自动清除'
    },
    应用状态: {
      方案: 'Redux + LocalStorage持久化',
      说明: '结合状态管理与持久化'
    },
    大型数据集: {
      方案: 'IndexedDB',
      说明: '支持索引和高效查询的结构化存储'
    },
    离线资源: {
      方案: 'Cache Storage + Service Worker',
      说明: '实现离线应用和性能优化'
    },
    临时会话ID: {
      方案: 'Cookie(无HttpOnly)',
      说明: '需要在客户端和服务器都可访问的标识'
    }
  };
}
```

## 存储安全与最佳实践

在实际开发中，合理使用浏览器存储机制需要特别注意安全性和性能优化。

### 安全风险与防护

浏览器存储面临的主要安全威胁：

```js
/**
 * 浏览器存储安全风险
 * @returns {Object} 风险与防护措施
 */
function storageSecurityRisks() {
  return {
    XSS攻击: {
      风险: '跨站脚本攻击可能读取存储内容',
      防护: [
        '敏感数据使用HttpOnly Cookie',
        '输入输出过滤与转义',
        '实施内容安全策略(CSP)',
        '避免在LocalStorage存储敏感信息'
      ]
    },
    CSRF攻击: {
      风险: '跨站请求伪造利用Cookie自动发送机制',
      防护: [
        '使用SameSite属性限制Cookie发送',
        '实施CSRF令牌验证',
        '检查Referer/Origin请求头'
      ]
    },
    中间人攻击: {
      风险: '网络拦截可能窃取未加密存储数据',
      防护: [
        '使用HTTPS',
        '为Cookie设置Secure标志',
        '敏感数据进行客户端加密存储'
      ]
    },
    本地数据窃取: {
      风险: '物理访问设备或恶意软件获取存储数据',
      防护: [
        '敏感数据加密存储',
        '最小化存储敏感信息',
        '定期清理不需要的数据'
      ]
    }
  };
}
```

#### 数据加密实践

对于需要在客户端存储的敏感数据，可以采用加密措施：

```js
/**
 * 客户端存储加密工具
 */
const StorageEncryption = {
  /**
   * 使用密码生成加密密钥
   * @param {string} password 密码
   * @returns {Promise<CryptoKey>} 生成的密钥
   */
  async generateKey(password) {
    // 从密码中派生密钥
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // 创建盐值(实际应用中应存储盐值)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // 导入密码作为原始密钥材料
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // 派生实际加密密钥
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  },
  
  /**
   * 加密数据
   * @param {*} data 要加密的数据
   * @param {CryptoKey} key 加密密钥
   * @returns {Promise<string>} 加密后的字符串
   */
  async encrypt(data, key) {
    try {
      const encoder = new TextEncoder();
      const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      const plaintext = encoder.encode(dataString);
      
      // 创建初始化向量
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // 加密数据
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        plaintext
      );
      
      // 将IV和密文合并并转换为Base64
      const result = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(ciphertext))
      };
      
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('加密失败:', error);
      throw error;
    }
  },
  
  /**
   * 解密数据
   * @param {string} encryptedData 加密的数据
   * @param {CryptoKey} key 解密密钥
   * @returns {Promise<*>} 解密后的数据
   */
  async decrypt(encryptedData, key) {
    try {
      // 解析存储的加密数据
      const parsedData = JSON.parse(atob(encryptedData));
      const iv = new Uint8Array(parsedData.iv);
      const ciphertext = new Uint8Array(parsedData.data);
      
      // 解密数据
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        ciphertext
      );
      
      // 解析解密后的文本
      const decoder = new TextDecoder();
      const decodedText = decoder.decode(decrypted);
      
      // 尝试解析JSON
      try {
        return JSON.parse(decodedText);
      } catch {
        // 不是JSON，返回字符串
        return decodedText;
      }
    } catch (error) {
      console.error('解密失败:', error);
      throw error;
    }
  },
  
  /**
   * 安全存储加密数据
   * @param {string} key 存储键
   * @param {*} data 要存储的数据
   * @param {string} password 加密密码
   * @returns {Promise<boolean>} 存储结果
   */
  async secureStore(key, data, password) {
    try {
      const encryptionKey = await this.generateKey(password);
      const encryptedData = await this.encrypt(data, encryptionKey);
      
      localStorage.setItem(key, encryptedData);
      return true;
    } catch (error) {
      console.error('安全存储失败:', error);
      return false;
    }
  },
  
  /**
   * 从安全存储获取数据
   * @param {string} key 存储键
   * @param {string} password 解密密码
   * @returns {Promise<*>} 检索的数据
   */
  async secureRetrieve(key, password) {
    try {
      const encryptedData = localStorage.getItem(key);
      
      if (!encryptedData) {
        return null;
      }
      
      const encryptionKey = await this.generateKey(password);
      return await this.decrypt(encryptedData, encryptionKey);
    } catch (error) {
      console.error('安全检索失败:', error);
      return null;
    }
  }
};
```

### 性能优化策略

合理使用浏览器存储可以优化应用性能：

```js
/**
 * 存储性能优化策略
 */
const StoragePerformance = {
  /**
   * 分批处理大数据集
   * @param {Array} items 要处理的数据项
   * @param {Function} processItem 处理单个项的函数
   * @param {number} batchSize 批大小
   * @returns {Promise<void>} 完成Promise
   */
  async batchProcess(items, processItem, batchSize = 100) {
    const total = items.length;
    
    for (let i = 0; i < total; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // 处理当前批次
      await Promise.all(batch.map(processItem));
      
      // 允许UI更新
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  },
  
  /**
   * 优化LocalStorage写入
   * @param {Object} data 大量键值对数据
   */
  bulkLocalStorageUpdate(data) {
    // 防止频繁读写，先在内存中合并
    const existingData = {};
    
    // 读取现有数据
    for (const key in data) {
      try {
        existingData[key] = localStorage.getItem(key);
      } catch (e) {
        console.warn(`读取${key}失败`, e);
      }
    }
    
    // 执行批量更新
    try {
      for (const key in data) {
        const value = typeof data[key] === 'object' ? 
          JSON.stringify(data[key]) : String(data[key]);
        
        // 只在数据发生变化时写入
        if (existingData[key] !== value) {
          localStorage.setItem(key, value);
        }
      }
    } catch (e) {
      console.error('批量更新存储失败', e);
      
      // 存储可能已满，尝试清理
      if (e.name === 'QuotaExceededError') {
        this.cleanupStorage();
      }
    }
  },
  
  /**
   * 清理不重要的存储项
   */
  cleanupStorage() {
    // 按优先级定义可清理的键列表
    const lowPriorityKeys = [];
    const cachePrefixKeys = [];
    
    // 识别低优先级和缓存项
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key.startsWith('cache_')) {
        cachePrefixKeys.push(key);
      } else if (key.startsWith('temp_') || key.startsWith('log_')) {
        lowPriorityKeys.push(key);
      }
    }
    
    // 首先清理缓存项
    cachePrefixKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`清理缓存项${key}失败`, e);
      }
    });
    
    // 如果还需要，清理低优先级项
    if (cachePrefixKeys.length === 0) {
      lowPriorityKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`清理低优先级项${key}失败`, e);
        }
      });
    }
  },
  
  /**
   * 延迟加载非关键数据
   * @param {Array<string>} keys 要加载的键
   * @param {Function} callback 完成回调
   */
  lazyLoadData(keys, callback) {
    // 在浏览器空闲时加载数据
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const data = {};
        
        keys.forEach(key => {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                data[key] = JSON.parse(item);
              } catch {
                data[key] = item;
              }
            }
          } catch (e) {
            console.warn(`延迟加载${key}失败`, e);
          }
        });
        
        callback(data);
      });
    } else {
      // 回退机制
      setTimeout(() => {
        const data = {};
        
        keys.forEach(key => {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                data[key] = JSON.parse(item);
              } catch {
                data[key] = item;
              }
            }
          } catch (e) {
            console.warn(`延迟加载${key}失败`, e);
          }
        });
        
        callback(data);
      }, 100);
    }
  }
};
```

### 数据同步策略

在多设备、多窗口环境中，确保数据同步至关重要：

```js
/**
 * 客户端数据同步策略
 */
const StorageSyncStrategy = {
  /**
   * 使用BroadcastChannel在同源窗口间同步
   * @param {string} channelName 频道名称
   * @returns {Object} 同步控制器
   */
  createBroadcastSync(channelName = 'app_data_sync') {
    // 确保浏览器支持
    if (!('BroadcastChannel' in window)) {
      console.warn('此浏览器不支持BroadcastChannel');
      
      // 回退到消息事件
      return this.createStorageEventSync();
    }
    
    const channel = new BroadcastChannel(channelName);
    
    return {
      /**
       * 发送数据更新通知
       * @param {string} key 数据键
       * @param {*} data 更新的数据
       */
      broadcast(key, data) {
        channel.postMessage({
          key,
          data,
          timestamp: Date.now()
        });
      },
      
      /**
       * 监听数据更新
       * @param {Function} callback 数据更新回调
       */
      subscribe(callback) {
        channel.addEventListener('message', event => {
          callback(event.data.key, event.data.data, event.data.timestamp);
        });
      },
      
      /**
       * 清理资源
       */
      cleanup() {
        channel.close();
      }
    };
  },
  
  /**
   * 使用localStorage事件在同源窗口间同步
   * @returns {Object} 同步控制器
   */
  createStorageEventSync() {
    // 特殊键前缀，用于区分
    const SYNC_PREFIX = '__sync__';
    
    return {
      /**
       * 发送数据更新通知
       * @param {string} key 数据键
       * @param {*} data 更新的数据
       */
      broadcast(key, data) {
        const syncKey = `${SYNC_PREFIX}${key}`;
        const syncData = JSON.stringify({
          key,
          data,
          timestamp: Date.now()
        });
        
        try {
          // 先移除可能存在的同名键
          localStorage.removeItem(syncKey);
          
          // 设置新值触发事件
          localStorage.setItem(syncKey, syncData);
          
          // 清理，避免存储膨胀
          setTimeout(() => {
            localStorage.removeItem(syncKey);
          }, 1000);
        } catch (e) {
          console.error('广播数据更新失败', e);
        }
      },
      
      /**
       * 监听数据更新
       * @param {Function} callback 数据更新回调
       */
      subscribe(callback) {
        const handler = event => {
          // 只处理同步前缀的键
          if (event.key && event.key.startsWith(SYNC_PREFIX)) {
            try {
              const syncData = JSON.parse(event.newValue);
              
              if (syncData && syncData.key) {
                callback(syncData.key, syncData.data, syncData.timestamp);
              }
            } catch (e) {
              console.warn('处理同步数据失败', e);
            }
          }
        };
        
        window.addEventListener('storage', handler);
        
        // 返回清理函数
        return () => {
          window.removeEventListener('storage', handler);
        };
      },
      
      /**
       * 清理资源
       */
      cleanup() {
        // 无需额外清理
      }
    };
  },
  
  /**
   * 使用IndexedDB存储离线修改并在上线后同步
   * @param {string} dbName 数据库名称
   * @returns {Promise<Object>} 同步控制器
   */
  async createOfflineSync(dbName = 'offline_changes') {
    // 确保IndexedDB可用
    if (!('indexedDB' in window)) {
      throw new Error('此浏览器不支持IndexedDB');
    }
    
    // 打开/创建数据库
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // 创建存储修改的仓库
        if (!db.objectStoreNames.contains('changes')) {
          const store = db.createObjectStore('changes', { keyPath: 'id', autoIncrement: true });
          
          // 建立索引
          store.createIndex('by_timestamp', 'timestamp', { unique: false });
          store.createIndex('by_key', 'key', { unique: false });
          store.createIndex('by_synced', 'synced', { unique: false });
        }
      };
    });
    
    return {
      /**
       * 记录离线修改
       * @param {string} key 数据键
       * @param {*} data 更新的数据
       * @param {string} operation 操作类型
       * @returns {Promise<number>} 记录ID
       */
      async recordChange(key, data, operation = 'update') {
        return new Promise((resolve, reject) => {
          const tx = db.transaction('changes', 'readwrite');
          const store = tx.objectStore('changes');
          
          const change = {
            key,
            data,
            operation,
            timestamp: Date.now(),
            synced: false
          };
          
          const request = store.add(change);
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      
      /**
       * 获取未同步的修改
       * @returns {Promise<Array>} 未同步的修改列表
       */
      async getUnsynced() {
        return new Promise((resolve, reject) => {
          const tx = db.transaction('changes', 'readonly');
          const store = tx.objectStore('changes');
          const index = store.index('by_synced');
          
          const request = index.getAll(false);
          
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      
      /**
       * 标记修改为已同步
       * @param {number} id 修改记录ID
       * @returns {Promise<boolean>} 操作结果
       */
      async markSynced(id) {
        return new Promise((resolve, reject) => {
          const tx = db.transaction('changes', 'readwrite');
          const store = tx.objectStore('changes');
          
          // 先获取记录
          const getRequest = store.get(id);
          
          getRequest.onsuccess = () => {
            const change = getRequest.result;
            
            if (!change) {
              return resolve(false);
            }
            
            // 更新同步状态
            change.synced = true;
            
            const updateRequest = store.put(change);
            
            updateRequest.onsuccess = () => resolve(true);
            updateRequest.onerror = () => reject(updateRequest.error);
          };
          
          getRequest.onerror = () => reject(getRequest.error);
        });
      },
      
      /**
       * 清理已同步的修改
       * @param {number} olderThan 清理此时间戳之前的记录
       * @returns {Promise<number>} 清理的记录数
       */
      async cleanupSynced(olderThan = Date.now() - 86400000) { // 默认1天
        return new Promise((resolve, reject) => {
          const tx = db.transaction('changes', 'readwrite');
          const store = tx.objectStore('changes');
          const index = store.index('by_synced');
          
          // 获取已同步的记录
          const request = index.openCursor(true);
          let count = 0;
          
          request.onsuccess = event => {
            const cursor = event.target.result;
            
            if (cursor) {
              if (cursor.value.timestamp < olderThan) {
                // 删除旧记录
                cursor.delete();
                count++;
              }
              
              cursor.continue();
            } else {
              resolve(count);
            }
          };
          
          request.onerror = () => reject(request.error);
        });
      },
      
      /**
       * 清理资源
       */
      cleanup() {
        db.close();
      }
    };
  }
};
```

## 结语

浏览器存储机制为Web应用提供了丰富的客户端数据管理能力。通过合理选择和组合不同的存储方案，可以提升应用性能、增强用户体验并确保数据安全。在实际开发中，应根据数据特性、安全需求和应用场景，灵活运用这些机制，同时密切关注Web标准的发展和浏览器兼容性情况。

通过本文的系统梳理，希望开发者能够全面了解浏览器存储机制的核心原理、使用方法和最佳实践，从而更加高效地管理前端数据，打造出性能优异、体验流畅的现代Web应用。

---

> 参考资料：[MDN 浏览器存储](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API) 