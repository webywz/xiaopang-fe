---
layout: doc
title: HTML5地理定位API实战指南
description: 深入解析HTML5地理定位API的工作原理、实际应用场景与最佳实践
date: 2024-04-02
head:
  - - meta
    - name: keywords
      content: HTML5, Geolocation API, 地理定位, 位置服务, 地图应用, 定位精度, 前端开发
---

# HTML5地理定位API实战指南

HTML5地理定位API使Web应用能够获取用户的地理位置信息，为提供位置相关服务创造了可能。本文将深入解析地理定位API的工作原理、使用方法、实际应用场景及最佳实践，帮助开发者构建基于位置的优质Web应用。

## 目录

[[toc]]

## 地理定位API基础

HTML5 Geolocation API是一个允许Web应用访问用户地理位置的JavaScript接口。它已被广泛支持并整合到现代浏览器中，为开发者提供了一种标准化的定位方式。

### 工作原理

地理定位API支持多种定位方法，浏览器会根据可用性和精度要求选择最合适的方式：

1. **GPS**：最精确的定位方法，但仅在支持GPS的设备上可用
2. **网络定位**：通过WiFi网络、蜂窝网络或IP地址进行定位
3. **用户自主输入**：部分浏览器允许用户手动设置位置

### 隐私与安全考虑

位置信息属于敏感个人数据，因此地理定位API有严格的安全措施：

1. **用户许可**：浏览器会要求用户明确授权才能获取位置信息
2. **HTTPS要求**：许多现代浏览器只在HTTPS环境下提供地理定位功能
3. **可撤销权限**：用户可以随时撤销已授予的位置权限

## 基本用法

### 检查浏览器支持

```javascript
/**
 * 检查浏览器是否支持地理定位API
 * @returns {boolean} 是否支持地理定位
 */
function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

if (isGeolocationSupported()) {
  // 浏览器支持地理定位
  console.log('您的浏览器支持地理定位功能');
} else {
  // 浏览器不支持地理定位
  console.warn('您的浏览器不支持地理定位功能');
}
```

### 获取当前位置

```javascript
/**
 * 获取用户当前位置
 */
function getCurrentPosition() {
  if (!isGeolocationSupported()) {
    console.error('地理定位不可用');
    return;
  }

  // 成功回调
  function successCallback(position) {
    const latitude = position.coords.latitude;    // 纬度
    const longitude = position.coords.longitude;  // 经度
    const accuracy = position.coords.accuracy;    // 精度（米）
    
    console.log(`位置：${latitude}, ${longitude}，精确度：${accuracy}米`);
    
    // 在这里处理位置信息
    displayLocation(latitude, longitude);
  }

  // 错误回调
  function errorCallback(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error('用户拒绝了地理定位请求');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('位置信息不可用');
        break;
      case error.TIMEOUT:
        console.error('获取用户位置超时');
        break;
      case error.UNKNOWN_ERROR:
        console.error('发生未知错误');
        break;
    }
  }

  // 选项
  const options = {
    enableHighAccuracy: true,  // 尝试获取最精确的位置
    timeout: 5000,             // 超时时间（毫秒）
    maximumAge: 0              // 不使用缓存位置
  };

  // 获取位置
  navigator.geolocation.getCurrentPosition(
    successCallback,
    errorCallback,
    options
  );
}
```

### 监视位置变化

```javascript
/**
 * 监视用户位置变化
 * @returns {number} 监视器ID，用于停止监视
 */
function watchPosition() {
  if (!isGeolocationSupported()) {
    console.error('地理定位不可用');
    return;
  }

  // 成功回调
  function successCallback(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    console.log(`更新位置：${latitude}, ${longitude}`);
    
    // 处理更新的位置
    updateUserLocation(latitude, longitude);
  }

  // 错误回调
  function errorCallback(error) {
    console.error('获取位置发生错误:', error.message);
  }

  // 选项
  const options = {
    enableHighAccuracy: true,  // 高精度
    timeout: 10000,            // 超时时间
    maximumAge: 60000          // 位置缓存有效期（毫秒）
  };

  // 开始监视并返回监视器ID
  return navigator.geolocation.watchPosition(
    successCallback,
    errorCallback,
    options
  );
}

// 停止位置监视
function stopWatchingPosition(watchId) {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    console.log('已停止位置监视');
  }
}

// 使用方法
const watchId = watchPosition();

// 稍后停止监视
// stopWatchingPosition(watchId);
```

## 位置数据详解

Position对象包含丰富的位置信息，不仅限于经纬度：

```javascript
/**
 * 获取并显示详细位置信息
 */
function getDetailedPosition() {
  navigator.geolocation.getCurrentPosition(position => {
    console.log('位置信息详情:');
    console.log('纬度:', position.coords.latitude);
    console.log('经度:', position.coords.longitude);
    console.log('精度:', position.coords.accuracy, '米');
    
    // 可选属性（设备可能不提供）
    if (position.coords.altitude !== null) {
      console.log('海拔:', position.coords.altitude, '米');
      console.log('海拔精度:', position.coords.altitudeAccuracy, '米');
    }
    
    if (position.coords.heading !== null) {
      console.log('方向:', position.coords.heading, '度'); // 相对于正北的角度
    }
    
    if (position.coords.speed !== null) {
      console.log('速度:', position.coords.speed, '米/秒');
    }
    
    console.log('时间戳:', new Date(position.timestamp));
  });
}
```

## 实际应用场景

### 1. 地图定位与导航

结合地图API显示用户位置和提供导航服务是最常见的应用场景。

```javascript
/**
 * 使用百度地图API显示用户位置
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
function showUserLocationOnBaiduMap(latitude, longitude) {
  // 创建地图实例
  const map = new BMap.Map('map-container');
  const point = new BMap.Point(longitude, latitude);
  
  // 设置中心点和缩放级别
  map.centerAndZoom(point, 15);
  
  // 添加地图控件
  map.addControl(new BMap.NavigationControl());
  map.addControl(new BMap.ScaleControl());
  
  // 添加用户位置标记
  const marker = new BMap.Marker(point);
  map.addOverlay(marker);
  
  // 添加信息窗口
  const infoWindow = new BMap.InfoWindow('您的当前位置');
  marker.addEventListener('click', function() {
    map.openInfoWindow(infoWindow, point);
  });
}
```

### 2. 基于位置的社交功能

在社交应用中显示附近的用户或活动：

```javascript
/**
 * 获取附近的用户
 * @param {number} latitude - 用户纬度
 * @param {number} longitude - 用户经度
 * @param {number} radius - 搜索半径（千米）
 */
async function getNearbyUsers(latitude, longitude, radius = 5) {
  try {
    // 向服务器发送请求获取附近用户
    const response = await fetch('/api/nearby-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radius
      })
    });
    
    if (!response.ok) {
      throw new Error('获取附近用户失败');
    }
    
    const users = await response.json();
    
    // 显示附近用户
    displayNearbyUsers(users);
  } catch (error) {
    console.error('获取附近用户出错:', error);
  }
}

/**
 * 计算两点之间的距离（Haversine公式）
 * @param {number} lat1 - 第一点纬度
 * @param {number} lon1 - 第一点经度
 * @param {number} lat2 - 第二点纬度
 * @param {number} lon2 - 第二点经度
 * @returns {number} 距离（千米）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（千米）
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}
```

### 3. 本地化内容与服务

根据用户位置提供相关内容和服务：

```javascript
/**
 * 根据用户位置获取本地化内容
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 */
async function getLocalizedContent(latitude, longitude) {
  try {
    // 首先进行反向地理编码，获取用户所在城市
    const cityName = await reverseGeocode(latitude, longitude);
    
    // 获取本地化内容
    const response = await fetch(`/api/content?city=${encodeURIComponent(cityName)}`);
    const content = await response.json();
    
    // 更新UI
    updateContentBasedOnLocation(content);
  } catch (error) {
    console.error('获取本地化内容失败:', error);
    // 加载默认内容
    loadDefaultContent();
  }
}

/**
 * 反向地理编码，将坐标转换为地址
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Promise<string>} 城市名称
 */
async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://api.map.baidu.com/reverse_geocoding/v3/?ak=YOUR_API_KEY&output=json&coordtype=wgs84ll&location=${latitude},${longitude}`
  );
  
  const data = await response.json();
  
  if (data.status === 0) {
    return data.result.addressComponent.city;
  } else {
    throw new Error('反向地理编码失败');
  }
}
```

### 4. 位置打卡和签到功能

用于跟踪用户到访特定地点：

```javascript
/**
 * 检查用户是否在指定位置附近
 * @param {number} userLat - 用户纬度
 * @param {number} userLon - 用户经度
 * @param {number} targetLat - 目标位置纬度
 * @param {number} targetLon - 目标位置经度
 * @param {number} radius - 允许的最大距离（米）
 * @returns {boolean} 用户是否在范围内
 */
function isUserNearLocation(userLat, userLon, targetLat, targetLon, radius = 100) {
  // 计算距离（千米）
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  
  // 转换为米并比较
  return (distance * 1000) <= radius;
}

/**
 * 执行位置签到
 * @param {Object} location - 签到地点信息
 */
async function checkIn(location) {
  try {
    // 获取用户当前位置
    navigator.geolocation.getCurrentPosition(async position => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      
      // 检查用户是否在签到地点附近
      if (isUserNearLocation(userLat, userLon, location.latitude, location.longitude, location.radius)) {
        // 执行签到
        const response = await fetch('/api/check-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locationId: location.id,
            latitude: userLat,
            longitude: userLon,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          showSuccessMessage('签到成功！');
        } else {
          showErrorMessage('签到失败，请重试');
        }
      } else {
        showErrorMessage('您不在签到范围内');
      }
    }, error => {
      showErrorMessage('无法获取位置信息');
      console.error(error);
    }, { enableHighAccuracy: true });
  } catch (error) {
    console.error('签到过程中发生错误:', error);
  }
}
```

## 高级技巧与最佳实践

### 优化定位体验

#### 1. 平衡精度与速度

```javascript
/**
 * 分阶段获取位置，先快速获取粗略位置，再获取精确位置
 */
function progressiveGeolocation() {
  // 第一阶段：快速定位（低精度）
  navigator.geolocation.getCurrentPosition(
    position => {
      // 立即使用粗略位置
      const roughLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // 立即更新UI
      updateUIWithLocation(roughLocation);
      
      // 第二阶段：精确定位
      navigator.geolocation.getCurrentPosition(
        position => {
          // 获取高精度位置
          const preciseLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // 更新UI
          updateUIWithLocation(preciseLocation);
        },
        error => {
          console.warn('无法获取高精度位置:', error);
          // 继续使用粗略位置
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
    error => {
      console.error('无法获取位置:', error);
      showLocationError();
    },
    { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
  );
}
```

#### 2. 处理定位服务不可用的情况

```javascript
/**
 * 提供位置回退策略
 */
function getLocationWithFallback() {
  // 尝试使用HTML5地理定位
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      fallbackToIPLocation,
      { timeout: 5000 }
    );
  } else {
    // HTML5地理定位不可用
    fallbackToIPLocation();
  }
  
  /**
   * 处理成功获取位置
   */
  function handleSuccess(position) {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      source: 'browser-geolocation'
    };
    
    processLocation(location);
  }
  
  /**
   * 回退到IP定位
   */
  async function fallbackToIPLocation() {
    try {
      // 使用IP定位服务
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const location = {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 5000, // IP定位通常精度较低，约5km
        source: 'ip-geolocation'
      };
      
      processLocation(location);
    } catch (error) {
      console.error('IP定位失败:', error);
      
      // 最终回退：使用默认位置或让用户手动输入
      handleNoLocation();
    }
  }
}
```

### 位置缓存策略

有效利用缓存可以提高应用性能并减少电池消耗：

```javascript
/**
 * 智能位置缓存管理
 */
const LocationCache = {
  storageKey: 'cached_location',
  
  /**
   * 保存位置到缓存
   * @param {Object} position - 位置对象
   */
  savePosition(position) {
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(locationData));
  },
  
  /**
   * 获取缓存的位置
   * @param {number} maxAge - 缓存最大有效期（毫秒）
   * @returns {Object|null} 缓存的位置或null
   */
  getCachedPosition(maxAge = 5 * 60 * 1000) { // 默认5分钟
    try {
      const cached = localStorage.getItem(this.storageKey);
      
      if (!cached) return null;
      
      const locationData = JSON.parse(cached);
      const age = Date.now() - locationData.timestamp;
      
      // 检查缓存是否过期
      if (age > maxAge) {
        this.clearCache();
        return null;
      }
      
      return locationData;
    } catch (e) {
      this.clearCache();
      return null;
    }
  },
  
  /**
   * 清除位置缓存
   */
  clearCache() {
    localStorage.removeItem(this.storageKey);
  },
  
  /**
   * 智能获取位置（优先使用缓存）
   * @param {Object} options - 配置选项
   * @returns {Promise<Object>} 位置对象
   */
  async getLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      cacheTTL: 5 * 60 * 1000, // 缓存有效期5分钟
      forceRefresh: false // 是否强制刷新
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // 如果不强制刷新，尝试使用缓存
    if (!opts.forceRefresh) {
      const cachedPosition = this.getCachedPosition(opts.cacheTTL);
      
      if (cachedPosition) {
        return cachedPosition;
      }
    }
    
    // 获取新位置
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          // 缓存新位置
          this.savePosition(position);
          
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        reject,
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          timeout: opts.timeout,
          maximumAge: opts.maximumAge
        }
      );
    });
  }
};

// 使用示例
async function getDynamicLocationWithCache() {
  try {
    // 根据需求使用不同缓存策略
    
    // 地图初始加载，可以使用较长的缓存
    const initialLocation = await LocationCache.getLocation({
      cacheTTL: 30 * 60 * 1000, // 30分钟缓存
      enableHighAccuracy: false // 不需要高精度
    });
    
    // 用户请求导航，需要最新位置
    const navigationLocation = await LocationCache.getLocation({
      forceRefresh: true, // 强制刷新
      enableHighAccuracy: true // 需要高精度
    });
    
  } catch (error) {
    console.error('获取位置失败:', error);
  }
}
```

### 电池与性能优化

位置服务可能显著消耗电池，特别是在高精度模式下：

```javascript
/**
 * 根据应用状态优化位置监视
 */
class LocationTracker {
  constructor() {
    this.watchId = null;
    this.highAccuracyWatchId = null;
    this.isMoving = false;
    this.lastPosition = null;
  }
  
  /**
   * 开始跟踪位置
   */
  startTracking() {
    // 初始使用低精度追踪
    this.watchId = navigator.geolocation.watchPosition(
      this.handlePositionUpdate.bind(this),
      this.handleError.bind(this),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
    );
  }
  
  /**
   * 处理位置更新
   */
  handlePositionUpdate(position) {
    const currentPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    // 检测用户是否在移动
    if (this.lastPosition) {
      const distance = calculateDistance(
        this.lastPosition.latitude, this.lastPosition.longitude,
        currentPosition.latitude, currentPosition.longitude
      );
      
      const isNowMoving = distance > 0.05; // 移动超过50米
      
      // 如果用户开始移动，切换到高精度模式
      if (isNowMoving && !this.isMoving) {
        this.switchToHighAccuracy();
      }
      // 如果用户停止移动，切换回低精度模式
      else if (!isNowMoving && this.isMoving) {
        this.switchToLowAccuracy();
      }
      
      this.isMoving = isNowMoving;
    }
    
    this.lastPosition = currentPosition;
    this.updateUI(currentPosition);
  }
  
  /**
   * 切换到高精度模式
   */
  switchToHighAccuracy() {
    console.log('切换到高精度模式');
    
    // 清除低精度监视
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    // 启动高精度监视
    this.highAccuracyWatchId = navigator.geolocation.watchPosition(
      this.handlePositionUpdate.bind(this),
      this.handleError.bind(this),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }
  
  /**
   * 切换回低精度模式
   */
  switchToLowAccuracy() {
    console.log('切换到低精度模式');
    
    // 清除高精度监视
    if (this.highAccuracyWatchId !== null) {
      navigator.geolocation.clearWatch(this.highAccuracyWatchId);
      this.highAccuracyWatchId = null;
    }
    
    // 恢复低精度监视
    this.watchId = navigator.geolocation.watchPosition(
      this.handlePositionUpdate.bind(this),
      this.handleError.bind(this),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
    );
  }
  
  /**
   * 处理错误
   */
  handleError(error) {
    console.error('位置跟踪错误:', error);
  }
  
  /**
   * 更新UI
   */
  updateUI(position) {
    // 更新应用UI
    console.log('位置更新:', position);
  }
  
  /**
   * 停止跟踪
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.highAccuracyWatchId !== null) {
      navigator.geolocation.clearWatch(this.highAccuracyWatchId);
      this.highAccuracyWatchId = null;
    }
    
    console.log('已停止位置跟踪');
  }
}
```

## 安全和隐私最佳实践

### 实施最小权限原则

```javascript
/**
 * 根据需要有选择地请求位置信息
 */
function requestLocationOnlyWhenNeeded() {
  // 只在用户主动触发相关功能时请求位置
  document.getElementById('findNearbyButton').addEventListener('click', () => {
    // 向用户解释为什么需要位置信息
    if (confirm('为了找到您附近的商店，我们需要访问您的位置信息。您允许吗？')) {
      // 用户同意后获取位置
      navigator.geolocation.getCurrentPosition(
        position => {
          findNearbyStores(position.coords.latitude, position.coords.longitude);
        },
        error => {
          console.error('无法获取位置:', error);
          // 提供替代方案
          askForManualLocationInput();
        }
      );
    } else {
      // 用户拒绝，提供替代方案
      askForManualLocationInput();
    }
  });
}

/**
 * 提供手动输入位置的替代方案
 */
function askForManualLocationInput() {
  // 显示让用户输入城市或邮编的表单
  document.getElementById('manualLocationInput').style.display = 'block';
}
```

### 适当处理和存储位置数据

```javascript
/**
 * 安全处理位置数据
 * @param {Object} position - 位置对象
 */
function securelyHandleLocationData(position) {
  // 1. 只收集必要的位置数据
  const essentialData = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
    // 不包含不必要的信息，如高度、速度等
  };
  
  // 2. 应用适当的精度降级（如对公开分享的位置）
  const reducedPrecisionData = {
    latitude: Math.round(essentialData.latitude * 100) / 100, // 保留两位小数
    longitude: Math.round(essentialData.longitude * 100) / 100
  };
  
  // 3. 仅在需要时向服务器发送数据
  if (shouldSendToServer()) {
    sendToServer(essentialData);
  }
  
  // 4. 加密存储本地缓存的位置数据
  if (window.crypto && window.crypto.subtle) {
    // 使用Web Crypto API加密数据
    encryptAndStoreData(JSON.stringify(essentialData))
      .then(() => console.log('位置数据已安全存储'));
  } else {
    // 回退到较简单的保护措施
    const obfuscatedData = obfuscateLocationData(essentialData);
    localStorage.setItem('user_location', JSON.stringify(obfuscatedData));
  }
}
```

## 浏览器兼容性与降级处理

尽管大多数现代浏览器都支持地理定位API，但提供降级方案仍然很重要：

```javascript
/**
 * 全面的位置服务兼容性处理
 */
function getLocationWithComprehensiveFallbacks() {
  // 检查原生地理定位API
  if ('geolocation' in navigator) {
    try {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleGeolocationError,
        { timeout: 10000 }
      );
    } catch (e) {
      console.error('地理定位API异常:', e);
      fallbackToAlternatives();
    }
  } else {
    console.warn('浏览器不支持地理定位API');
    fallbackToAlternatives();
  }
  
  /**
   * 处理成功获取位置
   */
  function handleSuccess(position) {
    processLocation({
      source: 'geolocation-api',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    });
  }
  
  /**
   * 处理地理定位错误
   */
  function handleGeolocationError(error) {
    console.warn('地理定位错误:', error.message);
    fallbackToAlternatives();
  }
  
  /**
   * 使用替代方法获取位置
   */
  function fallbackToAlternatives() {
    // 尝试使用IP地理定位
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        processLocation({
          source: 'ip-geolocation',
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 5000, // 大约5公里的精度
          city: data.city,
          region: data.region,
          country: data.country_name
        });
      })
      .catch(error => {
        console.error('IP定位失败:', error);
        // 最终回退：请求用户手动输入
        requestManualLocationInput();
      });
  }
}
```

## 总结

HTML5地理定位API为Web开发者提供了强大而灵活的位置服务能力，使Web应用能够提供与原生应用相媲美的位置相关功能。通过本文介绍的基础知识、实际应用场景和最佳实践，开发者能够构建既功能丰富又尊重用户隐私的位置感知Web应用。

在实际开发中，请记住：
1. 始终遵循最小权限原则，只在必要时请求位置信息
2. 提供清晰的隐私政策，解释如何使用位置数据
3. 实现优雅的降级方案，确保在各种环境下提供良好体验
4. 优化位置服务的性能和电池使用情况
5. 妥善处理和保护用户的位置数据

随着隐私法规的不断完善和用户隐私意识的提高，负责任地使用地理定位API将成为Web开发者的重要责任。

## 参考资源

- [MDN Web Docs: Geolocation API](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation_API)
- [W3C Geolocation API 规范](https://w3c.github.io/geolocation-api/)
- [Can I Use: Geolocation](https://caniuse.com/?search=geolocation)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [百度地图 JavaScript API](https://lbsyun.baidu.com/index.php?title=jspopular3.0) 