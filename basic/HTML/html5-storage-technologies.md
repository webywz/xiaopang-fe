---
layout: doc
title: HTML5存储技术全解析
description: 深入解析HTML5的Web Storage、IndexedDB和Cache API等客户端存储技术的实现与最佳实践
date: 2024-03-08
head:
  - - meta
    - name: keywords
      content: HTML5, 存储技术, localStorage, sessionStorage, IndexedDB, Cache API, 离线应用
---

# HTML5存储技术全解析

随着Web应用程序变得越来越复杂，客户端存储技术变得日益重要。HTML5引入了多种客户端存储方案，使开发者能够在浏览器中存储数据，实现离线功能、提升性能并改善用户体验。本文将深入解析HTML5的各种存储技术，包括Web Storage、IndexedDB和Cache API等。

## 目录

[[toc]]

## HTML5存储技术概览

HTML5提供了以下主要的客户端存储技术：

1. **Web Storage**：包括localStorage和sessionStorage，用于存储简单的键值对
2. **IndexedDB**：强大的客户端数据库系统，适合存储大量结构化数据
3. **Cache API**：与Service Worker配合使用，用于缓存网络请求和响应
4. **Web SQL Database**：已废弃，不推荐使用
5. **File API和FileSystem API**：用于处理文件和文件系统

这些技术各有优缺点，适用于不同的场景。本文将详细介绍每种技术的使用方法、适用场景及最佳实践。

## Web Storage技术

Web Storage是HTML5中最简单也是最广泛使用的客户端存储技术，它提供了两种机制：

- **localStorage**：数据永久存储，除非显式删除
- **sessionStorage**：数据在会话期间存储，关闭页面后自动清除

### localStorage基础用法

```javascript
// 存储数据
localStorage.setItem('username', 'Zhang San');
localStorage.setItem('theme', 'dark');

// 读取数据
const username = localStorage.getItem('username');
console.log(username); // 输出: Zhang San

// 删除特定数据
localStorage.removeItem('theme');

// 清除所有数据
localStorage.clear();
```

### sessionStorage基础用法

```javascript
// 存储数据
sessionStorage.setItem('cartItems', JSON.stringify([
  { id: 1, name: 'Product 1', price: 29.99 },
  { id: 2, name: 'Product 2', price: 19.99 }
]));

// 读取数据
const cartItems = JSON.parse(sessionStorage.getItem('cartItems'));
console.log(cartItems);

// 删除特定数据
sessionStorage.removeItem('cartItems');

// 清除所有数据
sessionStorage.clear();
```

### Web Storage的注意事项与限制

1. **存储容量限制**：通常每个域名下限制为5MB
2. **仅支持字符串**：需要使用JSON.stringify和JSON.parse处理复杂数据
3. **同步操作**：可能阻塞UI线程
4. **隐私模式**：在浏览器的隐私模式下可能无法写入或抛出异常
5. **安全考虑**：不要存储敏感信息，容易受到XSS攻击

### Web Storage使用场景

- 存储用户偏好设置（如主题、语言）
- 保存表单数据以防页面刷新丢失
- 缓存不经常变化的小型数据
- 实现简单的购物车功能

### Web Storage最佳实践

1. **检查兼容性**：

```javascript
/**
 * 检查特定存储类型是否可用
 * @param {string} type - 存储类型，'localStorage'或'sessionStorage'
 * @returns {boolean} 是否可用
 */
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

if (storageAvailable('localStorage')) {
  // 使用localStorage
} else {
  // 提供替代方案
}
```

2. **处理异常**：

```javascript
try {
  localStorage.setItem('key', 'value');
} catch (e) {
  console.error('存储失败: ', e);
  // 处理存储失败情况
}
```

3. **使用包装函数简化JSON处理**：

```javascript
/**
 * 本地存储操作包装器
 */
const Storage = {
  /**
   * 获取存储的值
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值（如果键不存在）
   * @returns {*} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  },
  
  /**
   * 设置存储值
   * @param {string} key - 键名
   * @param {*} value - 要存储的值
   * @returns {boolean} 是否成功存储
   */
  set(key, value) {
    try {
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (e) {
      console.error('存储错误: ', e);
      return false;
    }
  },
  
  /**
   * 删除特定键
   * @param {string} key - 要删除的键
   */
  remove(key) {
    localStorage.removeItem(key);
  },
  
  /**
   * 清除所有存储
   */
  clear() {
    localStorage.clear();
  }
};

// 使用示例
Storage.set('user', { id: 1, name: 'Zhang San' });
const user = Storage.get('user');
```

## IndexedDB技术

IndexedDB是一个强大的客户端数据库系统，提供了比Web Storage更多的功能：

- 存储几乎无限量的结构化数据
- 支持事务操作
- 支持索引查询
- 异步API设计，不阻塞UI

### IndexedDB基础概念

1. **数据库**：每个域名可以创建多个数据库
2. **对象存储空间**：类似于关系数据库的表
3. **索引**：提高查询性能
4. **事务**：确保数据完整性
5. **游标**：用于遍历对象存储空间中的数据

### 创建IndexedDB数据库

```javascript
/**
 * 打开并初始化IndexedDB数据库
 * @returns {Promise} 返回数据库连接
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyAppDatabase', 1);
    
    // 首次创建或版本升级时触发
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建对象存储空间
      if (!db.objectStoreNames.contains('customers')) {
        const store = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
        
        // 创建索引
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('email', 'email', { unique: true });
      }
      
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'id' });
        store.createIndex('price', 'price', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      reject('数据库打开错误: ' + event.target.error);
    };
  });
}
```

### 基本的CRUD操作

#### 添加数据

```javascript
/**
 * 添加客户数据
 * @param {Object} customer - 客户信息对象
 * @returns {Promise} 返回添加结果
 */
async function addCustomer(customer) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.add(customer);
    
    request.onsuccess = () => {
      resolve(request.result); // 返回生成的ID
    };
    
    request.onerror = () => {
      reject('添加客户失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
addCustomer({
  name: 'Zhang San',
  email: 'zhang.san@example.com',
  phone: '123-456-7890',
  joinDate: new Date()
})
.then(id => console.log('客户已添加，ID:', id))
.catch(error => console.error(error));
```

#### 获取数据

```javascript
/**
 * 通过ID获取客户信息
 * @param {number} id - 客户ID
 * @returns {Promise} 返回客户数据
 */
async function getCustomer(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject('获取客户失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
getCustomer(1)
.then(customer => {
  if (customer) {
    console.log('找到客户:', customer);
  } else {
    console.log('未找到客户');
  }
})
.catch(error => console.error(error));
```

#### 更新数据

```javascript
/**
 * 更新客户信息
 * @param {Object} customer - 含有ID的客户信息对象
 * @returns {Promise} 返回更新结果
 */
async function updateCustomer(customer) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.put(customer);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = () => {
      reject('更新客户失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
getCustomer(1)
.then(customer => {
  if (customer) {
    customer.phone = '987-654-3210';
    return updateCustomer(customer);
  }
})
.then(success => {
  if (success) console.log('客户更新成功');
})
.catch(error => console.error(error));
```

#### 删除数据

```javascript
/**
 * 删除客户信息
 * @param {number} id - 客户ID
 * @returns {Promise} 返回删除结果
 */
async function deleteCustomer(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readwrite');
    const store = transaction.objectStore('customers');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = () => {
      reject('删除客户失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
deleteCustomer(1)
.then(success => {
  if (success) console.log('客户删除成功');
})
.catch(error => console.error(error));
```

### 使用索引进行查询

```javascript
/**
 * 通过电子邮箱查找客户
 * @param {string} email - 客户邮箱
 * @returns {Promise} 返回客户数据
 */
async function findCustomerByEmail(email) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const index = store.index('email');
    const request = index.get(email);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject('查找客户失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
findCustomerByEmail('zhang.san@example.com')
.then(customer => {
  if (customer) {
    console.log('找到客户:', customer);
  } else {
    console.log('未找到客户');
  }
})
.catch(error => console.error(error));
```

### 使用游标遍历数据

```javascript
/**
 * 获取所有客户
 * @returns {Promise} 返回客户数组
 */
async function getAllCustomers() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const customers = [];
    const transaction = db.transaction(['customers'], 'readonly');
    const store = transaction.objectStore('customers');
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        customers.push(cursor.value);
        cursor.continue();
      } else {
        resolve(customers);
      }
    };
    
    request.onerror = () => {
      reject('获取客户列表失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
getAllCustomers()
.then(customers => {
  console.log('所有客户:', customers);
})
.catch(error => console.error(error));
```

### 高级索引查询 - 范围和过滤

```javascript
/**
 * 根据价格范围查询产品
 * @param {number} minPrice - 最低价格
 * @param {number} maxPrice - 最高价格
 * @returns {Promise} 返回产品数组
 */
async function getProductsByPriceRange(minPrice, maxPrice) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const products = [];
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const index = store.index('price');
    
    // 创建范围
    const range = IDBKeyRange.bound(minPrice, maxPrice);
    
    // 打开游标
    const request = index.openCursor(range);
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        products.push(cursor.value);
        cursor.continue();
      } else {
        resolve(products);
      }
    };
    
    request.onerror = () => {
      reject('查询产品失败: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// 使用示例
getProductsByPriceRange(10, 50)
.then(products => {
  console.log('价格在10-50之间的产品:', products);
})
.catch(error => console.error(error));
```

### IndexedDB最佳实践

1. **使用Promise封装**：简化异步操作
2. **版本控制**：在schema更改时增加数据库版本号
3. **错误处理**：捕获并处理所有可能的异常
4. **关闭连接**：在操作完成后记得关闭数据库连接
5. **分片存储**：对于大型二进制数据，考虑分片存储

```javascript
/**
 * 存储大型文件(分片)
 * @param {File} file - 要存储的文件
 * @returns {Promise} 存储结果
 */
async function storeFileInChunks(file) {
  const CHUNK_SIZE = 1024 * 1024; // 1MB分片
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  const db = await openDatabase();
  const transaction = db.transaction(['files', 'fileChunks'], 'readwrite');
  
  // 存储文件元数据
  const fileStore = transaction.objectStore('files');
  const fileId = await new Promise((resolve, reject) => {
    const fileRequest = fileStore.add({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      totalChunks: totalChunks
    });
    
    fileRequest.onsuccess = () => resolve(fileRequest.result);
    fileRequest.onerror = () => reject('存储文件元数据失败');
  });
  
  // 存储分片
  const chunkStore = transaction.objectStore('fileChunks');
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);
    
    await new Promise((resolve, reject) => {
      const chunkRequest = chunkStore.add({
        fileId: fileId,
        index: i,
        data: chunk
      });
      
      chunkRequest.onsuccess = () => resolve();
      chunkRequest.onerror = () => reject(`存储分片${i}失败`);
    });
  }
  
  return fileId;
}
```

## Cache API与Service Worker

Cache API结合Service Worker可以实现强大的网络缓存和离线功能。

### Cache API基础

```javascript
/**
 * 缓存网络资源
 * @param {string} cacheName - 缓存名称
 * @param {Array<string>} urls - 要缓存的URL数组
 * @returns {Promise} 缓存操作结果
 */
async function cacheResources(cacheName, urls) {
  const cache = await caches.open(cacheName);
  return cache.addAll(urls);
}

// 使用示例：缓存关键应用资源
const CACHE_NAME = 'app-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png',
  '/offline.html'
];

cacheResources(CACHE_NAME, CACHE_URLS)
.then(() => console.log('静态资源缓存成功'))
.catch(error => console.error('缓存资源失败:', error));
```

### 访问和更新缓存

```javascript
/**
 * 从缓存中获取响应
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function getFromCache(request) {
  const cacheResponse = await caches.match(request);
  return cacheResponse || fetch(request);
}

/**
 * 将响应添加到缓存
 * @param {string} cacheName - 缓存名称
 * @param {Request} request - 请求对象
 * @param {Response} response - 响应对象
 * @returns {Promise} 操作结果
 */
async function addToCache(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  return cache.put(request, response.clone());
}

/**
 * 删除旧缓存
 * @param {string} currentCacheName - 当前缓存名称
 * @returns {Promise} 操作结果
 */
async function clearOldCaches(currentCacheName) {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => name !== currentCacheName);
  return Promise.all(oldCaches.map(name => caches.delete(name)));
}
```

### Service Worker基础

Service Worker是一种运行在浏览器后台的脚本，可以拦截网络请求、管理缓存和提供推送通知等功能。

```javascript
// service-worker.js
const CACHE_NAME = 'app-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png',
  '/offline.html'
];

// 安装服务工作线程
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活服务工作线程
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存的响应
        if (response) {
          return response;
        }
        
        // 复制请求，因为请求只能使用一次
        const fetchRequest = event.request.clone();
        
        // 网络请求
        return fetch(fetchRequest).then(response => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 复制响应，因为响应只能使用一次
          const responseToCache = response.clone();
          
          // 将响应添加到缓存
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // 离线时返回离线页面
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
```

### 注册Service Worker

```javascript
// 在主应用中注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker注册成功，作用域:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker注册失败:', error);
      });
  });
}
```

### 缓存策略

不同的应用需求可能需要不同的缓存策略：

1. **缓存优先，网络回退**：先尝试从缓存获取，失败时从网络获取
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

2. **网络优先，缓存回退**：先尝试从网络获取，失败时从缓存获取
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

3. **Stale-While-Revalidate**：先返回缓存，同时更新缓存
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
```

## 实际应用案例

### 案例1：离线优先Web应用

结合使用IndexedDB和Cache API实现完全离线功能的应用：

1. 使用Cache API缓存静态资源和页面
2. 使用IndexedDB存储应用数据
3. 使用Service Worker实现网络请求拦截和离线处理
4. 实现数据同步策略，在网络恢复时同步本地更改

```javascript
// 离线待办事项应用的Service Worker
self.addEventListener('fetch', (event) => {
  // API请求处理
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      // 尝试从网络获取
      fetch(event.request.clone())
        .then(response => {
          // 存储成功的响应到IndexedDB（通过消息传递）
          if (response.ok) {
            const responseClone = response.clone();
            responseClone.json().then(data => {
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'API_RESPONSE',
                    url: event.request.url,
                    data: data
                  });
                });
              });
            });
          }
          return response;
        })
        .catch(() => {
          // 离线时，发送消息给客户端使用IndexedDB数据
          return new Response(JSON.stringify({
            error: 'offline',
            message: '您处于离线状态，应用正在使用本地数据'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  } else {
    // 静态资源处理 - 缓存优先
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request)
          .then(fetchResponse => {
            // 添加到缓存
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return fetchResponse;
          })
        )
        .catch(() => {
          // 如果是HTML请求，返回离线页面
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
    );
  }
});
```

### 案例2：性能优化

使用HTML5存储技术优化应用性能：

1. 缓存API响应和资源以减少网络请求
2. 预先缓存关键资源加快应用加载速度
3. 存储用户数据减少服务器请求
4. 实现渐进式加载和缓存策略

```javascript
/**
 * 渐进式图片加载
 * 首先加载低质量图片从缓存，然后在后台加载高质量图片
 */
class ProgressiveImageLoader {
  constructor() {
    // 在页面加载时预缓存低质量图片
    this.precacheThumbnails();
    
    // 监听可见元素
    this.observeImages();
  }
  
  async precacheThumbnails() {
    const cache = await caches.open('image-thumbnails');
    // 获取当前页面所有图片的低质量版本URL
    const thumbnailUrls = Array.from(document.querySelectorAll('img[data-src-full]'))
      .map(img => img.src);
    
    await cache.addAll(thumbnailUrls);
    console.log('缩略图已预缓存');
  }
  
  observeImages() {
    // 使用交叉观察器检测图片何时进入视口
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadFullImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' }); // 提前100px加载
    
    // 观察所有具有完整图片URL的图片
    document.querySelectorAll('img[data-src-full]').forEach(img => {
      observer.observe(img);
    });
  }
  
  async loadFullImage(imgElement) {
    const fullImageUrl = imgElement.dataset.srcFull;
    
    try {
      // 尝试从缓存获取完整图片
      const cache = await caches.open('image-full');
      let response = await cache.match(fullImageUrl);
      
      // 如果缓存中没有，从网络获取并缓存
      if (!response) {
        response = await fetch(fullImageUrl);
        const responseClone = response.clone();
        cache.put(fullImageUrl, responseClone);
      }
      
      // 创建blob URL并设置图片源
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // 平滑过渡到高质量图片
      imgElement.style.transition = 'opacity 0.3s';
      imgElement.style.opacity = '0';
      
      // 图片加载完成后显示
      imgElement.onload = () => {
        imgElement.style.opacity = '1';
      };
      
      imgElement.src = blobUrl;
    } catch (error) {
      console.error('加载完整图片失败:', error);
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ProgressiveImageLoader();
});
```

### 案例3：本地数据持久化

为用户提供无缝体验：

1. 在IndexedDB中存储用户进度和数据
2. 在localStorage中保存用户偏好
3. 实现自动保存功能防止数据丢失
4. 提供数据导出和备份功能

```javascript
/**
 * 文档编辑器自动保存功能
 */
class DocumentAutoSave {
  constructor(editorElement, saveInterval = 5000) {
    this.editor = editorElement;
    this.documentId = this.editor.dataset.documentId;
    this.saveInterval = saveInterval;
    this.lastContent = '';
    
    // 初始化数据库
    this.initDatabase();
    
    // 加载上次保存的内容
    this.loadSavedContent();
    
    // 设置自动保存
    this.setupAutoSave();
    
    // 设置离开页面前保存
    this.setupBeforeUnload();
  }
  
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DocumentsDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('初始化数据库失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  async loadSavedContent() {
    try {
      await this.initDatabase();
      
      // 从IndexedDB加载内容
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.get(this.documentId);
      
      request.onsuccess = () => {
        if (request.result) {
          this.editor.value = request.result.content;
          this.lastContent = request.result.content;
          
          // 显示恢复消息
          this.showMessage('文档已从上次编辑恢复');
        }
      };
    } catch (error) {
      console.error('加载保存内容失败:', error);
    }
  }
  
  setupAutoSave() {
    // 定期保存
    setInterval(() => this.saveContent(), this.saveInterval);
    
    // 编辑器内容变更时保存
    this.editor.addEventListener('input', () => {
      // 防抖动 - 只在用户停止输入500ms后保存
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.saveContent(), 500);
    });
  }
  
  setupBeforeUnload() {
    window.addEventListener('beforeunload', (event) => {
      if (this.editor.value !== this.lastContent) {
        this.saveContent(true); // 立即保存
        
        // 显示提示信息
        event.preventDefault();
        event.returnValue = '文档有未保存的更改，确定要离开吗？';
      }
    });
  }
  
  async saveContent(immediate = false) {
    const content = this.editor.value;
    
    // 如果内容没有变化，不保存
    if (content === this.lastContent && !immediate) {
      return;
    }
    
    try {
      const transaction = this.db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      
      // 保存文档
      store.put({
        id: this.documentId,
        content: content,
        lastModified: new Date()
      });
      
      this.lastContent = content;
      
      // 成功保存后显示状态
      transaction.oncomplete = () => {
        this.showMessage('文档已自动保存', 2000);
        
        // 备份到localStorage作为额外保险
        localStorage.setItem(`doc_backup_${this.documentId}`, content);
      };
    } catch (error) {
      console.error('保存内容失败:', error);
      
      // 在IndexedDB失败时使用localStorage作为回退
      localStorage.setItem(`doc_backup_${this.documentId}`, content);
    }
  }
  
  showMessage(message, duration = 3000) {
    // 创建或更新消息元素
    let messageElement = document.getElementById('auto-save-message');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'auto-save-message';
      messageElement.style.position = 'fixed';
      messageElement.style.bottom = '20px';
      messageElement.style.right = '20px';
      messageElement.style.padding = '10px 15px';
      messageElement.style.background = '#4CAF50';
      messageElement.style.color = 'white';
      messageElement.style.borderRadius = '4px';
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.3s';
      document.body.appendChild(messageElement);
    }
    
    // 更新消息内容并显示
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    
    // 清除现有的超时调用
    clearTimeout(this.messageTimeout);
    
    // 设置隐藏消息的超时
    this.messageTimeout = setTimeout(() => {
      messageElement.style.opacity = '0';
    }, duration);
  }
}

// 初始化自动保存
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('document-editor');
  if (editor) {
    new DocumentAutoSave(editor);
  }
});
```

## 安全最佳实践

使用客户端存储技术时，需要注意以下安全问题：

### 1. 数据敏感性与存储选择

不要在客户端存储敏感信息，包括：
- 用户密码（即使是哈希值）
- 支付信息和信用卡详情
- 个人身份信息
- 访问令牌（长期有效的）
- 业务关键数据

```javascript
// 错误的做法
localStorage.setItem('userPassword', 'hashed_password');

// 正确的做法
localStorage.setItem('userColorTheme', 'dark');
localStorage.setItem('lastVisitedPage', '/products');
```

### 2. XSS防护措施

由于客户端存储容易受到跨站脚本(XSS)攻击，应采取以下防护措施：

```javascript
// 存储数据前进行验证和清理
function safeSetItem(key, value) {
  // 验证键名是否合法
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    throw new Error('存储键名包含非法字符');
  }
  
  // 如果是对象，确保安全序列化
  if (typeof value === 'object') {
    try {
      value = JSON.stringify(value);
    } catch (error) {
      console.error('无法序列化对象', error);
      return false;
    }
  }
  
  // 清理字符串值
  if (typeof value === 'string') {
    // 基本的HTML转义
    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  localStorage.setItem(key, value);
  return true;
}

// 读取时也要验证
function safeGetItem(key, defaultValue = null) {
  // 验证键名是否合法
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return defaultValue;
  }
  
  const value = localStorage.getItem(key);
  if (value === null) return defaultValue;
  
  // 尝试作为JSON解析
  try {
    return JSON.parse(value);
  } catch (e) {
    // 不是JSON，返回原始值
    return value;
  }
}
```

### 3. 实施内容安全策略(CSP)

通过设置内容安全策略限制JavaScript的执行，可以降低XSS攻击风险：

```html
<!-- 在HTML头部添加CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted-cdn.com">
```

或在HTTP头部设置：

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com
```

### 4. 安全配置Service Worker

确保Service Worker的安全配置：

```javascript
// 只缓存来自相同域的资源
self.addEventListener('fetch', (event) => {
  // 只处理同源请求
  if (new URL(event.request.url).origin !== location.origin) {
    return;
  }
  
  // 处理同源请求...
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 5. 定期数据清理

实现定期清理机制，避免无限制存储数据：

```javascript
/**
 * 清理过期的缓存数据
 * @param {number} maxAge - 最大有效期(毫秒)
 */
async function cleanupExpiredCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    // 解析缓存名称中的时间戳 (格式: name-timestamp)
    const parts = cacheName.split('-');
    if (parts.length > 1) {
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (now - timestamp > maxAge) {
        await caches.delete(cacheName);
        console.log(`已删除过期缓存: ${cacheName}`);
      }
    }
  }
}

// 对IndexedDB也进行类似的清理
async function cleanupExpiredDocs(maxAge = 30 * 24 * 60 * 60 * 1000) {
  const db = await openDatabase();
  const transaction = db.transaction(['documents'], 'readwrite');
  const store = transaction.objectStore('documents');
  const now = new Date();
  
  // 使用游标遍历所有文档
  const request = store.openCursor();
  
  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const doc = cursor.value;
      // 检查是否过期
      if (doc.lastModified && (now - new Date(doc.lastModified) > maxAge)) {
        store.delete(cursor.key);
        console.log(`已删除过期文档: ${cursor.key}`);
      }
      cursor.continue();
    }
  };
}
```

## 支持性和兼容性

不同浏览器对HTML5存储技术的支持情况：

| 技术 | Chrome | Firefox | Safari | Edge | IE |
|-----|--------|---------|--------|------|-----|
| localStorage | ✓ | ✓ | ✓ | ✓ | 8+ |
| sessionStorage | ✓ | ✓ | ✓ | ✓ | 8+ |
| IndexedDB | ✓ | ✓ | ✓ | ✓ | 10+ |
| Cache API | ✓ | ✓ | ✓ | ✓ | ✗ |
| Service Worker | ✓ | ✓ | ✓ | ✓ | ✗ |

### 兼容性解决方案

针对不同浏览器，可以实现兼容性层，根据可用性选择合适的存储方式：

```javascript
/**
 * 检测IndexedDB支持并提供回退
 * @returns {Object} 存储接口
 */
function getStorageInterface() {
  if ('indexedDB' in window) {
    return new IndexedDBStorage();
  } else if ('localStorage' in window) {
    return new LocalStorageWrapper();
  } else {
    return new MemoryStorage(); // 内存中的临时存储
  }
}

/**
 * IndexedDB存储实现
 */
class IndexedDBStorage {
  constructor() {
    this.dbName = 'AppStorage';
    this.storeName = 'data';
    this.dbPromise = this.openDB();
  }
  
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(key, defaultValue = null) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result !== undefined ? request.result : defaultValue);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB获取失败:', error);
      return defaultValue;
    }
  }
  
  async set(key, value) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put(value, key);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('IndexedDB存储失败:', error);
      return false;
    }
  }
  
  async remove(key) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.delete(key);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('IndexedDB删除失败:', error);
      return false;
    }
  }
}

/**
 * localStorage包装器
 */
class LocalStorageWrapper {
  async get(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  
  async set(key, value) {
    try {
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (e) {
      console.error('localStorage存储失败:', e);
      return false;
    }
  }
  
  async remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('localStorage删除失败:', e);
      return false;
    }
  }
}

/**
 * 内存存储实现(会话级别)
 */
class MemoryStorage {
  constructor() {
    this.storage = new Map();
  }
  
  async get(key, defaultValue = null) {
    return this.storage.has(key) ? this.storage.get(key) : defaultValue;
  }
  
  async set(key, value) {
    this.storage.set(key, value);
    return true;
  }
  
  async remove(key) {
    this.storage.delete(key);
    return true;
  }
}

// 使用统一接口进行存储操作
const storage = getStorageInterface();

// 示例
storage.set('user', { id: 1, name: 'Zhang San' })
  .then(() => storage.get('user'))
  .then(user => console.log('用户数据:', user));
```

### 特性检测与优雅降级

始终进行特性检测，为不支持的功能提供替代方案：

```javascript
// Service Worker支持检测
if ('serviceWorker' in navigator) {
  // 使用Service Worker和Cache API
  registerServiceWorker();
} else {
  // 回退到传统的浏览器缓存或AppCache
  setupTraditionalCaching();
}

// IndexedDB支持检测
let useIndexedDB = false;
try {
  useIndexedDB = !!window.indexedDB;
} catch (e) {
  console.log('IndexedDB不可用');
}

if (useIndexedDB) {
  // 使用IndexedDB
  setupIndexedDB();
} else if ('localStorage' in window) {
  // 回退到localStorage
  setupLocalStorage();
} else {
  // 内存存储警告
  alert('您的浏览器不支持本地存储，应用数据将在页面刷新后丢失');
}
```

## 总结

HTML5存储技术为Web应用提供了强大的客户端存储能力，使应用能够更高效、更可靠地运行。合理选择和组合使用这些技术，可以显著提高应用性能和用户体验。

### 关键要点

- **Web Storage** 适合简单的键值对存储，易于使用但容量有限
- **IndexedDB** 适合存储大量结构化数据，功能强大但API相对复杂
- **Cache API** 与Service Worker结合使用，实现资源缓存和离线功能
- 客户端存储技术可以组合使用，根据不同数据类型选择合适的方案
- 必须考虑安全性和隐私问题，避免存储敏感信息
- 实施正确的错误处理和兼容性策略，提供优雅的降级方案

### 选择指南

| 存储需求 | 推荐技术 | 优势 |
|--------|--------|------|
| 简单键值对 | localStorage | 简单易用，广泛支持 |
| 会话数据 | sessionStorage | 安全性更高，页面关闭自动清除 |
| 大量结构化数据 | IndexedDB | 强大的查询功能，几乎无限容量 |
| 网络资源缓存 | Cache API | 精细控制HTTP缓存，支持离线访问 |
| 离线应用 | ServiceWorker + IndexedDB | 完整的离线功能支持 |

通过合理使用这些HTML5存储技术，可以构建更快速、更可靠、更友好的Web应用，为用户提供接近原生应用的体验。

## 参考资源

- [MDN Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [MDN IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [MDN Cache API](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache)
- [MDN Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [Web存储安全最佳实践](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [IndexedDB事务详解](https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices)
- [离线优先Web应用](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/Offline_Service_workers)

<style>
.custom-block.tip {
  border-color: #42b983;
}

.custom-block.warning {
  border-color: #e7c000;
}

.custom-block.danger {
  border-color: #cc0000;
}

table {
  width: 100%;
  margin: 1em 0;
}

th, td {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

code {
  padding: 2px 5px;
  border-radius: 3px;
}
</style>
