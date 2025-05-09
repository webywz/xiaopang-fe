---
layout: doc
title: Vue渲染器源码分析
---

# Vue渲染器源码分析

## 渲染器概述

渲染器是Vue中负责将虚拟DOM渲染为实际DOM的核心模块。它建立了声明式UI与底层DOM操作之间的桥梁，处理了DOM元素的创建、更新和销毁。

## 渲染器的设计

Vue 3的渲染器采用了模块化设计，主要分为以下几个部分：

1. **核心渲染API**: 如`render`、`createApp`等
2. **虚拟节点处理**: 创建和处理VNode
3. **挂载与更新**: 首次渲染和后续更新
4. **DOM操作API**: 抽象DOM操作，支持跨平台渲染

### 核心渲染API

```js
/**
 * 创建渲染器
 * @param {Object} options - 渲染器选项，包含DOM操作方法
 * @returns {Object} - 渲染器API
 */
export function createRenderer(options) {
  // 解构渲染器选项
  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setText: hostSetText,
    // ...其他DOM操作API
  } = options

  /**
   * 渲染函数 - 将虚拟节点渲染到容器中
   * @param {Object} vnode - 虚拟节点
   * @param {Element} container - 容器元素
   */
  const render = (vnode, container) => {
    if (vnode == null) {
      // 如果没有新的vnode，则执行卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 否则执行打补丁操作（创建或更新）
      patch(container._vnode || null, vnode, container)
    }
    // 保存当前vnode作为下次的旧vnode
    container._vnode = vnode
  }

  /**
   * 创建应用实例
   * @param {Object} rootComponent - 根组件
   * @returns {Object} - 应用实例API
   */
  const createApp = (rootComponent) => {
    const app = {
      mount(rootContainer) {
        // 如果是字符串，则获取对应的DOM元素
        if (typeof rootContainer === 'string') {
          rootContainer = document.querySelector(rootContainer)
        }
        
        // 清空容器
        rootContainer.innerHTML = ''
        
        // 创建根组件的VNode
        const vnode = createVNode(rootComponent)
        
        // 渲染
        render(vnode, rootContainer)
        
        return app
      }
    }
    
    return app
  }

  return {
    render,
    createApp
  }
}
```

### 虚拟节点 (VNode)

虚拟节点是对实际DOM节点的轻量级表示：

```js
/**
 * 创建虚拟节点
 * @param {string|Object} type - 节点类型，可以是标签名或组件对象
 * @param {Object} props - 节点属性
 * @param {Array|null} children - 子节点
 * @returns {Object} - 虚拟节点
 */
export function createVNode(type, props = null, children = null) {
  const vnode = {
    type,
    props,
    key: props?.key || null,
    children,
    el: null,           // 对应的实际DOM元素
    shapeFlag: getShapeFlag(type), // 节点类型标记
  }
  
  // 处理子节点标记
  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }
  
  // 如果是组件且children是对象，则可能是插槽
  if (vnode.shapeFlag & ShapeFlags.COMPONENT && typeof children === 'object') {
    vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
  }
  
  return vnode
}

/**
 * 获取节点的形状标记
 * @param {string|Object} type - 节点类型
 * @returns {number} - 形状标记
 */
function getShapeFlag(type) {
  return typeof type === 'string' 
    ? ShapeFlags.ELEMENT
    : ShapeFlags.COMPONENT
}
```

### Patch算法

patch是渲染器的核心，负责比较新旧虚拟节点并更新DOM：

```js
/**
 * 更新操作
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 * @param {Element} container - 容器元素
 */
const patch = (n1, n2, container, anchor = null) => {
  // 如果新旧节点类型不同，则卸载旧节点
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1)
    n1 = null
  }
  
  const { type, shapeFlag } = n2
  
  // 根据不同节点类型进行处理
  switch (type) {
    case Text:
      processText(n1, n2, container, anchor)
      break
    case Comment:
      processComment(n1, n2, container, anchor)
      break
    case Fragment:
      processFragment(n1, n2, container, anchor)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理普通元素
        processElement(n1, n2, container, anchor)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 处理组件
        processComponent(n1, n2, container, anchor)
      }
  }
}
```

### 元素处理

处理普通DOM元素的创建和更新：

```js
/**
 * 处理元素节点
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 * @param {Element} container - 容器元素
 * @param {Element} anchor - 锚点元素
 */
const processElement = (n1, n2, container, anchor) => {
  if (n1 == null) {
    // 挂载元素
    mountElement(n2, container, anchor)
  } else {
    // 更新元素
    patchElement(n1, n2)
  }
}

/**
 * 挂载元素
 * @param {Object} vnode - 虚拟节点
 * @param {Element} container - 容器元素
 * @param {Element} anchor - 锚点元素
 */
const mountElement = (vnode, container, anchor) => {
  const { type, props, children, shapeFlag } = vnode
  
  // 创建DOM元素
  const el = (vnode.el = hostCreateElement(type))
  
  // 设置属性
  if (props) {
    for (const key in props) {
      hostPatchProp(el, key, null, props[key])
    }
  }
  
  // 处理子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本子节点
    hostSetElementText(el, children)
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 数组子节点
    mountChildren(children, el)
  }
  
  // 插入DOM
  hostInsert(el, container, anchor)
}

/**
 * 更新元素
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 */
const patchElement = (n1, n2) => {
  // 复用DOM元素
  const el = (n2.el = n1.el)
  
  // 获取新旧属性
  const oldProps = n1.props || {}
  const newProps = n2.props || {}
  
  // 更新属性
  patchProps(el, oldProps, newProps)
  
  // 更新子节点
  patchChildren(n1, n2, el)
}
```

### 组件处理

处理组件的挂载和更新：

```js
/**
 * 处理组件
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 * @param {Element} container - 容器元素
 * @param {Element} anchor - 锚点元素
 */
const processComponent = (n1, n2, container, anchor) => {
  if (n1 == null) {
    // 挂载组件
    mountComponent(n2, container, anchor)
  } else {
    // 更新组件
    updateComponent(n1, n2)
  }
}

/**
 * 挂载组件
 * @param {Object} vnode - 虚拟节点
 * @param {Element} container - 容器元素
 * @param {Element} anchor - 锚点元素
 */
const mountComponent = (vnode, container, anchor) => {
  // 创建组件实例
  const instance = (vnode.component = createComponentInstance(vnode))
  
  // 设置组件实例
  setupComponent(instance)
  
  // 设置并运行带有副作用的渲染函数
  setupRenderEffect(instance, container, anchor)
}

/**
 * 设置渲染副作用
 * @param {Object} instance - 组件实例
 * @param {Element} container - 容器元素
 * @param {Element} anchor - 锚点元素
 */
const setupRenderEffect = (instance, container, anchor) => {
  // 创建带有响应式副作用的渲染函数
  instance.update = effect(() => {
    if (!instance.isMounted) {
      // 首次挂载
      const subTree = (instance.subTree = instance.render())
      
      // 渲染子树
      patch(null, subTree, container, anchor)
      
      // 保存DOM元素
      instance.vnode.el = subTree.el
      
      // 标记为已挂载
      instance.isMounted = true
    } else {
      // 更新
      const nextTree = instance.render()
      const prevTree = instance.subTree
      
      instance.subTree = nextTree
      
      // 更新子树
      patch(prevTree, nextTree, container, anchor)
      
      // 更新DOM引用
      instance.vnode.el = nextTree.el
    }
  })
}
```

## 渲染器优化

Vue 3渲染器的优化主要体现在以下几个方面：

### 1. 快速路径 (Fast Path)

对常见操作进行特殊处理，提高性能：

```js
function patchChildren(n1, n2, container) {
  const c1 = n1.children
  const c2 = n2.children
  
  // 优化1：如果新节点是文本节点，直接设置文本内容
  if (typeof c2 === 'string') {
    if (Array.isArray(c1)) {
      unmountChildren(c1)
    }
    hostSetElementText(container, c2)
    return
  }
  
  // 优化2：如果新子节点是数组，旧子节点是文本，先清空再挂载
  if (Array.isArray(c2)) {
    if (typeof c1 === 'string') {
      hostSetElementText(container, '')
      mountChildren(c2, container)
      return
    }
    // 其他情况...
  }
}
```

### 2. 双端Diff算法

Vue 3采用了更高效的双端Diff算法：

```js
/**
 * 对比两个子节点数组
 * @param {Array} c1 - 旧的子节点数组
 * @param {Array} c2 - 新的子节点数组
 * @param {Element} container - 容器元素
 */
function patchKeyedChildren(c1, c2, container) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1 // 旧子节点的尾部索引
  let e2 = l2 - 1        // 新子节点的尾部索引
  
  // 1. 从头部开始同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    i++
  }
  
  // 2. 从尾部开始同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    e1--
    e2--
  }
  
  // 3. 剩余新增节点
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : null
      while (i <= e2) {
        patch(null, c2[i++], container, anchor)
      }
    }
  } 
  // 4. 剩余需要删除的节点
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i++])
    }
  } 
  // 5. 未知序列处理
  else {
    // 中间部分处理...
  }
}
```

### 3. 块级树结构 (Block Tree)

利用编译器标记的动态节点，减少比较：

```js
/**
 * 处理块节点
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 * @param {Element} container - 容器元素
 */
function processBlock(n1, n2, container) {
  if (n1 == null) {
    mountBlock(n2, container)
  } else {
    patchBlock(n1, n2)
  }
}

/**
 * 更新块节点
 * @param {Object} n1 - 旧的虚拟节点
 * @param {Object} n2 - 新的虚拟节点
 */
function patchBlock(n1, n2) {
  // 复用DOM元素
  const el = (n2.el = n1.el)
  
  // 只更新动态子节点
  const dynamicChildren = n2.dynamicChildren
  if (dynamicChildren) {
    patchBlockChildren(n1.dynamicChildren, dynamicChildren, el)
  } else {
    // 如果没有优化信息，则回退到全量对比
    patchChildren(n1, n2, el)
  }
}

/**
 * 更新块的动态子节点
 * @param {Array} oldChildren - 旧的动态子节点
 * @param {Array} newChildren - 新的动态子节点
 * @param {Element} container - 容器元素
 */
function patchBlockChildren(oldChildren, newChildren, container) {
  for (let i = 0; i < newChildren.length; i++) {
    const oldVNode = oldChildren[i]
    const newVNode = newChildren[i]
    // 直接更新对应位置的节点，无需关心顺序变化
    patch(oldVNode, newVNode, container)
  }
}
```

## 总结

Vue 3的渲染器通过虚拟DOM和高效的patch算法，实现了声明式UI的高效渲染。它的模块化设计使得渲染逻辑清晰，同时也为跨平台渲染提供了可能性。结合编译器的优化，渲染器能够智能地减少不必要的DOM操作，在保持框架易用性的同时提供了出色的性能。 