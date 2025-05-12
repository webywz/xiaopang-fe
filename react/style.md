# React 样式方案详解

React 项目可选用多种样式管理方式，包括 CSS-in-JS、原子化 CSS、传统 CSS/SCSS 等。不同方案适合不同场景。

## 目录
- 样式管理简介
- CSS-in-JS 方案概述
- styled-components 基础与进阶
- emotion 基础与进阶
- Tailwind CSS 基础与进阶
- 传统 CSS/SCSS 与 CSS Modules
- 方案对比与选型建议
- 样式最佳实践
- 常见问题与解决方案

---

## 样式管理简介

React 支持多种样式方案：
- 传统 CSS/SCSS
- CSS Modules
- CSS-in-JS（如 styled-components、emotion）
- 原子化 CSS（如 Tailwind CSS）

---

## CSS-in-JS 方案概述

CSS-in-JS 允许在 JS/TS 文件中直接编写样式，支持动态样式、主题切换、作用域隔离。

常见库：styled-components、emotion、@mui/system 等。

---

## styled-components 基础与进阶

styled-components 是最流行的 CSS-in-JS 库之一，支持标签模板语法、props 动态样式、主题等。

### 基础用法

```jsx
/**
 * @file StyledButton.jsx
 * @description styled-components 基础用法。
 */
import styled from 'styled-components';

const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
`;

function App() {
  return <Button>按钮</Button>;
}
```

### 动态样式与主题

```jsx
/**
 * @file StyledDynamic.jsx
 * @description styled-components 动态样式与主题。
 */
import styled, { ThemeProvider } from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#ccc'};
  color: white;
`;

const theme = {
  borderRadius: '8px'
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button primary>主按钮</Button>
      <Button>次按钮</Button>
    </ThemeProvider>
  );
}
```

---

## emotion 基础与进阶

emotion 是另一主流 CSS-in-JS 库，API 与 styled-components 类似，支持 css prop、ClassName 合成等。

### 基础用法

```jsx
/**
 * @file EmotionBasic.jsx
 * @description emotion 基础用法。
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

function App() {
  return (
    <button
      css={css`
        background: #e91e63;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
      `}
    >
      Emotion 按钮
    </button>
  );
}
```

### styled API

```jsx
/**
 * @file EmotionStyled.jsx
 * @description emotion styled API 用法。
 */
import styled from '@emotion/styled';

const Button = styled.button`
  background: #673ab7;
  color: white;
`;

function App() {
  return <Button>Emotion 按钮</Button>;
}
```

---

## Tailwind CSS 基础与进阶

Tailwind CSS 是原子化 CSS 框架，所有样式通过类名组合实现，极致灵活。

### 基础用法

```jsx
/**
 * @file TailwindBasic.jsx
 * @description Tailwind CSS 基础用法。
 */
function App() {
  return (
    <button className="bg-green-500 text-white px-4 py-2 rounded">
      Tailwind 按钮
    </button>
  );
}
```

### 响应式与主题

```jsx
/**
 * @file TailwindResponsive.jsx
 * @description Tailwind CSS 响应式与主题。
 */
function Card() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 md:p-8">
      <h2 className="text-lg font-bold">标题</h2>
      <p className="text-gray-600 dark:text-gray-300">内容</p>
    </div>
  );
}
```

---

## 传统 CSS/SCSS 与 CSS Modules

- 传统 CSS/SCSS 适合全局样式、简单项目
- CSS Modules 支持样式隔离，推荐中大型项目

```css
/* Button.module.css */
.button {
  background: #2196f3;
  color: white;
  border-radius: 4px;
}
```

```jsx
/**
 * @file CSSModuleButton.jsx
 * @description CSS Modules 用法。
 */
import styles from './Button.module.css';

function App() {
  return <button className={styles.button}>模块按钮</button>;
}
```

---

## 方案对比与选型建议

| 特性         | styled-components | emotion      | Tailwind CSS | CSS Modules | 传统 CSS/SCSS |
|--------------|------------------|--------------|--------------|-------------|---------------|
| 动态样式     | 支持             | 支持         | 不支持       | 部分支持    | 不支持        |
| 主题         | 支持             | 支持         | 支持         | 不支持      | 不支持        |
| 作用域隔离   | 支持             | 支持         | 支持         | 支持        | 不支持        |
| 体积         | 中等             | 中等         | 小           | 小          | 小            |
| 学习曲线     | 平缓             | 平缓         | 略高         | 低          | 低            |
| 适用场景     | 中大型项目       | 中大型项目   | 各类项目     | 中大型项目  | 小型/全局     |

- 复杂交互、动态主题推荐 CSS-in-JS
- 追求极致性能、团队协作推荐 Tailwind CSS
- 传统项目可用 CSS Modules 或 SCSS

---

## 样式最佳实践

- 样式与组件解耦，提升复用性
- 主题、变量集中管理
- 避免全局样式污染，优先使用作用域方案
- 合理拆分样式文件，便于维护
- 结合 UI 库（如 Ant Design、MUI）提升开发效率

---

## 常见问题与解决方案

### 1. 样式冲突
- 使用 CSS Modules/CSS-in-JS 隔离作用域

### 2. 动态样式难以维护
- 统一用 props/变量管理，避免硬编码

### 3. 体积过大
- Tailwind CSS 配置 purge，CSS-in-JS 按需加载

---

/**
 * @module StyleManagement
 * @description 本文极致细化了 React 样式管理方案，适合新手和进阶开发者参考。
 */ 