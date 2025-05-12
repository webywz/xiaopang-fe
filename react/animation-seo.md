# React 动画与 SEO 详解

动画和 SEO 是提升用户体验和搜索可见性的关键环节。React 生态有丰富的动画库和 SEO 方案。

## 目录
- 动画与 SEO 简介
- Framer Motion 基础与进阶
- React Spring 简介
- React Transition Group 用法
- 动画性能优化与最佳实践
- React Helmet 基础与进阶（SEO 头部管理）
- Next.js/SSR 与 SEO 进阶
- 常见问题与解决方案

---

## 动画与 SEO 简介

- 动画提升交互体验，常用于过渡、提示、吸引注意力
- SEO（搜索引擎优化）提升页面在搜索引擎的可见性
- React 支持多种动画库和 SEO 头部管理方案

---

## Framer Motion 基础与进阶

Framer Motion 是最流行的 React 动画库，API 简洁，支持物理动画、拖拽、布局动画等。

### 基础用法

```jsx
/**
 * @file MotionBasic.jsx
 * @description Framer Motion 基础动画。
 */
import { motion } from 'framer-motion';

function FadeInBox() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      渐入动画
    </motion.div>
  );
}
```

### 交互与拖拽

```jsx
/**
 * @file MotionDrag.jsx
 * @description Framer Motion 拖拽与交互。
 */
import { motion } from 'framer-motion';

function DraggableBox() {
  return (
    <motion.div drag whileHover={{ scale: 1.1 }}>
      可拖拽盒子
    </motion.div>
  );
}
```

### 路由与布局动画

```jsx
/**
 * @file MotionLayout.jsx
 * @description Framer Motion 布局动画。
 */
import { motion, AnimatePresence } from 'framer-motion';

function List({ items }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div key={item} layout exit={{ opacity: 0 }}>
          {item}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

---

## React Spring 简介

React Spring 是物理驱动的动画库，适合复杂交互和弹性动画。

```jsx
/**
 * @file SpringBasic.jsx
 * @description React Spring 基础用法。
 */
import { useSpring, animated } from '@react-spring/web';

function SpringBox() {
  const styles = useSpring({ opacity: 1, from: { opacity: 0 } });
  return <animated.div style={styles}>弹性动画</animated.div>;
}
```

---

## React Transition Group 用法

React Transition Group 适合简单的进入/离开动画。

```jsx
/**
 * @file TransitionGroupBasic.jsx
 * @description React Transition Group 用法。
 */
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './fade.css';

function FadeList({ items }) {
  return (
    <TransitionGroup>
      {items.map(item => (
        <CSSTransition key={item} timeout={300} classNames="fade">
          <div>{item}</div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}
```

---

## 动画性能优化与最佳实践

- 避免大面积重排，优先使用 transform/opacity
- 合理拆分动画组件，减少渲染压力
- 使用 requestAnimationFrame 优化自定义动画
- 动画只在必要时启用，移动端注意性能

---

## React Helmet 基础与进阶（SEO 头部管理）

React Helmet 用于动态管理页面 <head> 内容，提升 SEO。

```jsx
/**
 * @file HelmetBasic.jsx
 * @description React Helmet 基础用法。
 */
import { Helmet } from 'react-helmet';

function SEOPage() {
  return (
    <>
      <Helmet>
        <title>自定义标题 - 我的站点</title>
        <meta name="description" content="页面描述" />
        <meta property="og:title" content="自定义标题" />
      </Helmet>
      <h1>内容</h1>
    </>
  );
}
```

---

## Next.js/SSR 与 SEO 进阶

- Next.js 支持服务端渲染（SSR），天然利于 SEO
- 使用 next/head 管理 <head> 内容
- SSR 可提升首屏速度与爬虫可见性

```jsx
/**
 * @file NextHeadBasic.jsx
 * @description Next.js SEO 头部管理。
 */
import Head from 'next/head';

function Page() {
  return (
    <>
      <Head>
        <title>Next.js SEO 页面</title>
        <meta name="description" content="Next.js SEO 示例" />
      </Head>
      <h1>内容</h1>
    </>
  );
}
```

---

## 常见问题与解决方案

### 1. 动画卡顿
- 优化动画属性，减少重排，使用 transform/opacity

### 2. SEO 不生效
- 检查 <head> 是否正确渲染，SSR 是否开启

### 3. 动画与路由切换冲突
- 使用 AnimatePresence 管理路由动画

---

/**
 * @module AnimationSEO
 * @description 本文极致细化了 React 动画与 SEO 方案，适合新手和进阶开发者参考。
 */ 