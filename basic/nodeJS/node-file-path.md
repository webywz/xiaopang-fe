# Node.js 文件与路径操作

Node.js 提供了强大的文件系统（fs）和路径（path）模块，支持跨平台的文件与路径处理。本文详细介绍 Node.js 文件与路径操作的常用方法、最佳实践与常见问题。

---

## 目录
- path 模块简介与常用方法
- fs 模块简介与常用方法
- 路径拼接与解析
- 文件读写与遍历
- 文件删除与重命名
- 目录操作
- 最佳实践
- 常见问题
- 参考资料

---

## 1. path 模块简介与常用方法

`path` 模块用于处理文件和目录路径，支持跨平台路径分隔符。

```js
const path = require('path');

// 获取当前文件所在目录
console.log(path.dirname(__filename));

// 路径拼接
const fullPath = path.join(__dirname, 'data', 'file.txt');
console.log(fullPath);

// 解析路径
const parsed = path.parse(fullPath);
console.log(parsed);

// 获取文件扩展名
console.log(path.extname(fullPath));
```

### 常用 API
- `path.join([...paths])`：拼接路径
- `path.resolve([...paths])`：绝对路径
- `path.basename(path)`：文件名
- `path.dirname(path)`：目录名
- `path.extname(path)`：扩展名
- `path.parse(path)`：解析路径对象

---

## 2. fs 模块简介与常用方法

`fs` 模块用于文件的读写、遍历、删除、重命名等操作，支持同步和异步两种方式。

```js
const fs = require('fs');
const path = require('path');

// 异步读取文件
fs.readFile(path.join(__dirname, 'data.txt'), 'utf8', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});

// 同步写入文件
fs.writeFileSync('output.txt', 'Hello Node.js!');
```

### 常用 API
- `fs.readFile(path, [options], callback)`
- `fs.writeFile(path, data, [options], callback)`
- `fs.readdir(path, callback)`
- `fs.stat(path, callback)`
- `fs.unlink(path, callback)`
- `fs.rename(oldPath, newPath, callback)`
- `fs.mkdir(path, [options], callback)`
- `fs.rmdir(path, callback)`

---

## 3. 路径拼接与解析

```js
const filePath = path.join(__dirname, 'logs', 'app.log');
console.log('拼接后的路径:', filePath);

const parsed = path.parse(filePath);
console.log('解析结果:', parsed);
```

---

## 4. 文件读写与遍历

### 读取文件内容

```js
/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} 文件内容
 */
function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

### 遍历目录下所有文件

```js
/**
 * 遍历目录下所有文件
 * @param {string} dir - 目录路径
 * @returns {Promise<string[]>} 文件列表
 */
function listFiles(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}
```

---

## 5. 文件删除与重命名

```js
// 删除文件
fs.unlink('old.txt', err => {
  if (err) console.error('删除失败:', err);
  else console.log('删除成功');
});

// 重命名文件
fs.rename('old.txt', 'new.txt', err => {
  if (err) console.error('重命名失败:', err);
  else console.log('重命名成功');
});
```

---

## 6. 目录操作

```js
// 创建目录
fs.mkdir('logs', { recursive: true }, err => {
  if (err) console.error('创建目录失败:', err);
  else console.log('目录创建成功');
});

// 删除目录
fs.rmdir('logs', err => {
  if (err) console.error('删除目录失败:', err);
  else console.log('目录删除成功');
});
```

---

## 7. 最佳实践
- 路径拼接优先用 path.join，避免手写分隔符
- 文件操作优先用异步 API，避免阻塞事件循环
- 读写大文件建议用流（fs.createReadStream/createWriteStream）
- 错误处理要完善，避免程序崩溃

---

## 8. 常见问题
- 路径分隔符不一致（Windows vs Linux）
- 文件权限问题
- 文件不存在/已被占用
- 目录递归删除需用 `fs.rm`（Node.js 14+）

---

## 9. 参考资料
- [Node.js 官方文档 - path](https://nodejs.org/api/path.html)
- [Node.js 官方文档 - fs](https://nodejs.org/api/fs.html) 