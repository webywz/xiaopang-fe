---
layout: doc
title: Vue虚拟DOM实现与Diff算法
---

# Vue虚拟DOM实现与Diff算法

## 虚拟DOM概述

虚拟DOM(Virtual DOM)是Vue框架的核心部分，它是真实DOM的JavaScript对象表示。Vue使用虚拟DOM作为中间层，通过对比新旧虚拟DOM的差异(diff)，最小化真实DOM操作，从而提高性能。本文将深入分析Vue 3中虚拟DOM的实现原理及其diff算法。

## VNode结构设计

Vue 3中，虚拟DOM节点称为VNode，其核心实现如下：

```js
// packages/runtime-core/src/vnode.ts
export interface VNode {
  __v_isVNode: true           // 标识为VNode
  type: VNodeTypes             // 节点类型
  props: VNodeProps | null    // 节点属性
  key: string | number | null // 节点key
  ref: VNodeRef | null        // 引用
  children: VNodeNormalizedChildren // 子节点
  component: ComponentInternalInstance | null // 组件实例
  shapeFlag: ShapeFlags       // 节点类型标记
  patchFlag: PatchFlags       // patch标记，用于优化
  dynamicProps: string[] | null // 动态属性
  // ...其他属性
}
```

Vue 3的VNode结构增加了`shapeFlag`和`patchFlag`，用于优化渲染和patch过程：

```js
// packages/shared/src/shapeFlags.ts
export const enum ShapeFlags {
  ELEMENT = 1,                  // 普通HTML元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_COMPONENT = 1 << 2,   // 有状态组件
  TEXT_CHILDREN = 1 << 3,        // 子节点是文本
  ARRAY_CHILDREN = 1 << 4,       // 子节点是数组
  SLOTS_CHILDREN = 1 << 5,       // 子节点是插槽
  TELEPORT = 1 << 6,             // Teleport组件
  SUSPENSE = 1 << 7,             // Suspense组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 需要keepAlive的组件
  COMPONENT_KEPT_ALIVE = 1 << 9, // 已经keepAlive的组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
```

## 创建VNode

Vue 3中创建VNode的核心函数为`createVNode`：

```js
// packages/runtime-core/src/vnode.ts
export function createVNode(
  type: VNodeTypes,
  props: VNodeProps | null = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null
): VNode {
  // 规范化class和style属性
  if (props) {
    // 处理class
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
    
    // 处理style
    if (isObject(style)) {
      props.style = normalizeStyle(style)
    }
  }
  
  // 编码VNode类型信息
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : 0
      
  const vnode: VNode = {
    __v_isVNode: true,
    type,
    props,
    key: props && normalizeKey(props),
    children: null,
    component: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    shapeFlag,
    patchFlag,
    dynamicProps,
    // ...其他初始化
  }
  
  // 规范化子节点
  normalizeChildren(vnode, children)
  
  return vnode
}
```

## Diff算法实现

Vue 3的diff算法是其渲染系统的核心，主要在`patchChildren`函数中实现：

```js
// packages/runtime-core/src/renderer.ts
function patchChildren(
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  optimized: boolean = false
) {
  const c1 = n1 && n1.children
  const prevShapeFlag = n1 ? n1.shapeFlag : 0
  const c2 = n2.children
  const { shapeFlag } = n2
  
  // 子节点有三种可能: 文本、数组或无子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 新的子节点是文本
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 旧的子节点是数组，需要卸载
      unmountChildren(c1 as VNode[], parentComponent, parentSuspense)
    }
    if (c2 !== c1) {
      // 文本内容变化，直接设置
      hostSetElementText(container, c2 as string)
    }
  } else {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 旧的子节点是数组
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的子节点也是数组，需要完整的diff
        patchKeyedChildren(
          c1 as VNode[],
          c2 as VNodeArrayChildren,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        )
      } else {
        // 新的子节点不是数组，卸载旧节点
        unmountChildren(c1 as VNode[], parentComponent, parentSuspense, true)
      }
    } else {
      // 旧的子节点是文本或无子节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 清空文本
        hostSetElementText(container, '')
      }
      // 挂载新的数组子节点
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(
          c2 as VNodeArrayChildren,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        )
      }
    }
  }
}
```

### 核心Diff算法

Vue 3的核心diff算法在`patchKeyedChildren`函数中，它使用了多种优化策略：

```js
// packages/runtime-core/src/renderer.ts
function patchKeyedChildren(
  c1: VNode[],
  c2: VNodeArrayChildren,
  container: RendererElement,
  parentAnchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  optimized: boolean
) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1 // 旧节点数组最后一个索引
  let e2 = l2 - 1 // 新节点数组最后一个索引
  
  // 1. 从前向后同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      // 相同类型，递归patch
      patch(
        n1,
        n2,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        optimized
      )
    } else {
      break
    }
    i++
  }
  
  // 2. 从后向前同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(
        n1,
        n2,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        optimized
      )
    } else {
      break
    }
    e1--
    e2--
  }
  
  // 3. 处理新增节点
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
      while (i <= e2) {
        patch(
          null,
          c2[i],
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG
        )
        i++
      }
    }
  }
  
  // 4. 处理移除节点
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i], parentComponent, parentSuspense, true)
      i++
    }
  }
  
  // 5. 未知序列：处理移动/更新/移除
  else {
    const s1 = i
    const s2 = i
    
    // 5.1 创建新节点的key -> 索引映射
    const keyToNewIndexMap = new Map()
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i]
      if (nextChild.key != null) {
        keyToNewIndexMap.set(nextChild.key, i)
      }
    }
    
    // 5.2 循环旧节点，更新/移除
    let j
    let patched = 0
    const toBePatched = e2 - s2 + 1
    let moved = false
    let maxNewIndexSoFar = 0
    
    // 旧位置索引 -> 新位置索引的映射
    const newIndexToOldIndexMap = new Array(toBePatched)
    for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
    
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i]
      
      if (patched >= toBePatched) {
        // 所有新节点都已更新，剩余的旧节点直接移除
        unmount(prevChild, parentComponent, parentSuspense, true)
        continue
      }
      
      let newIndex
      if (prevChild.key != null) {
        // 通过key找到新位置
        newIndex = keyToNewIndexMap.get(prevChild.key)
      } else {
        // 遍历查找相同节点
        for (j = s2; j <= e2; j++) {
          if (
            newIndexToOldIndexMap[j - s2] === 0 &&
            isSameVNodeType(prevChild, c2[j])
          ) {
            newIndex = j
            break
          }
        }
      }
      
      if (newIndex === undefined) {
        // 找不到对应节点，移除
        unmount(prevChild, parentComponent, parentSuspense, true)
      } else {
        // 标记当前节点在新数组的位置
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        
        // 检查是否有移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }
        
        // 更新节点
        patch(
          prevChild,
          c2[newIndex],
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          optimized
        )
        patched++
      }
    }
    
    // 5.3 移动和挂载
    // 如果有节点需要移动，生成最长递增子序列
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : []
    j = increasingNewIndexSequence.length - 1
    
    // 从后向前遍历，确保正确的节点顺序
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex]
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor
      
      if (newIndexToOldIndexMap[i] === 0) {
        // 挂载新节点
        patch(
          null,
          nextChild,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG
        )
      } else if (moved) {
        // 移动节点
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          move(nextChild, container, anchor)
        } else {
          j--
        }
      }
    }
  }
}
```

### 最长递增子序列算法

Vue 3 diff算法中的关键优化是使用最长递增子序列(Longest Increasing Subsequence)算法，它能够最小化DOM移动操作：

```js
// packages/runtime-core/src/renderer.ts
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    
    // 跳过已移除的节点
    if (arrI !== 0) {
      j = result[result.length - 1]
      
      if (arr[j] < arrI) {
        // 如果当前值大于最后一个结果值，直接追加
        p[i] = j
        result.push(i)
        continue
      }
      
      // 二分查找，找到第一个大于arrI的位置
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  
  // 回溯计算最终序列
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  
  return result
}
```

## Vue 3的Diff算法优化

Vue 3相比Vue 2在虚拟DOM实现和Diff算法上有显著优化：

### 1. 静态节点提升(Static Hoisting)

```js
// 编译后的渲染函数
const _hoisted_1 = /*#__PURE__*/createVNode("div", { class: "static" }, "Static content", -1)

function render() {
  return (_ctx, _cache) => {
    return (_openBlock(), _createBlock("div", null, [
      _hoisted_1, // 静态节点在render之外创建，提升为常量
      createVNode("div", { class: _ctx.dynamic }, toDisplayString(_ctx.message), 2 /* CLASS, TEXT */)
    ]))
  }
}
```

### 2. Patch标记和动态属性追踪

```js
// PatchFlags枚举
export const enum PatchFlags {
  TEXT = 1,          // 动态文本内容
  CLASS = 2,         // 动态类名
  STYLE = 4,         // 动态样式
  PROPS = 8,         // 动态属性
  FULL_PROPS = 16,   // 具有动态key的属性
  // ...其他标记
}

// 带有明确标记的VNode
createVNode("div", { class: dynamic }, text, PatchFlags.CLASS | PatchFlags.TEXT, ["class"])
```

### 3. 块树(Block Tree)结构

```js
// 包装动态节点的块结构
const block = (_openBlock(), _createBlock("div", null, [
  _hoisted_1, // 静态节点
  createVNode("div", { class: dynamic }, text, PatchFlags.CLASS | PatchFlags.TEXT)
]))
```

## 与Vue 2 Diff算法的对比

Vue 2和Vue 3的Diff算法有以下主要区别：

1. **双端比较 vs 快速路径优化**：
   - Vue 2: 使用"双端比较"算法，同时比较两个列表的头尾节点
   - Vue 3: 先进行前后序列的快速检查，然后使用更优化的中间部分处理

2. **静态标记**：
   - Vue 3: 通过编译器生成的PatchFlags，运行时可以跳过静态内容的比较

3. **最长递增子序列**：
   - Vue 3: 更高效的实现方式，减少了DOM移动操作

4. **事件缓存**：
   - Vue 3: 事件处理函数的缓存，避免不必要的更新

## 性能及优化实践

基于Vue 3的虚拟DOM实现，可采用以下优化实践：

1. **使用唯一key**：确保列表渲染时使用稳定且唯一的key
   ```html
   <div v-for="item in items" :key="item.id">{{ item.text }}</div>
   ```

2. **避免深层嵌套**：扁平化组件结构，减少Diff复杂度

3. **使用PatchFlags标记**：在手写render函数时，提供PatchFlags加速渲染
   ```js
   h('div', { class: dynamic }, text, PatchFlags.CLASS | PatchFlags.TEXT)
   ```

4. **局部更新**：利用Vue 3的细粒度响应式系统，确保只有必要的组件重新渲染

## 总结

Vue 3的虚拟DOM实现和Diff算法在保持Vue 2核心思想的基础上，通过编译优化、静态提升、块树结构等创新，显著提升了渲染性能。理解这些实现细节，可以帮助开发者编写更高效的Vue应用，也为扩展Vue功能提供了坚实基础。 