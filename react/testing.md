# React 测试工具详解

高质量的 React 应用离不开自动化测试。主流测试工具有 Jest、React Testing Library、Cypress 等。

## 目录
- 测试基础与重要性简介
- Jest 基础与进阶
- React Testing Library 基础与进阶
- 端到端测试（E2E）简介
- Mock、覆盖率与快照测试
- 测试最佳实践
- 常见问题与解决方案

---

## 测试基础与重要性简介

- 单元测试：验证函数/组件的最小单元
- 集成测试：验证多个模块协作
- 端到端测试（E2E）：模拟真实用户操作
- 自动化测试提升代码质量、可维护性、回归效率

---

## Jest 基础与进阶

Jest 是 Facebook 推出的测试框架，支持断言、Mock、覆盖率、快照等。

### 基础用法

```js
/**
 * @file sum.test.js
 * @description Jest 基础单元测试。
 */
function sum(a, b) { return a + b; }

test('1 + 2 = 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

### Mock 与异步测试

```js
/**
 * @file fetchUser.test.js
 * @description Jest Mock 与异步测试。
 */
import axios from 'axios';

jest.mock('axios');

test('fetch user', async () => {
  axios.get.mockResolvedValue({ data: { name: 'Tom' } });
  const res = await axios.get('/api/user');
  expect(res.data.name).toBe('Tom');
});
```

### 覆盖率与快照

```js
/**
 * @file snapshot.test.js
 * @description Jest 快照测试。
 */
import React from 'react';
import renderer from 'react-test-renderer';
import Button from './Button';

test('Button 快照', () => {
  const tree = renderer.create(<Button>按钮</Button>).toJSON();
  expect(tree).toMatchSnapshot();
});
```

---

## React Testing Library 基础与进阶

React Testing Library 主张"以用户视角测试"，API 简洁，适合组件测试。

### 基础用法

```js
/**
 * @file Button.test.js
 * @description React Testing Library 基础用法。
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('渲染按钮并点击', () => {
  render(<Button>点击我</Button>);
  const btn = screen.getByText('点击我');
  fireEvent.click(btn);
  expect(btn).toBeInTheDocument();
});
```

### 表单与异步交互

```js
/**
 * @file Form.test.js
 * @description 表单与异步交互测试。
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

test('表单提交', async () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('用户名'), { target: { value: 'Tom' } });
  fireEvent.change(screen.getByLabelText('密码'), { target: { value: '123456' } });
  fireEvent.click(screen.getByText('登录'));
  await waitFor(() => expect(screen.getByText('登录成功')).toBeInTheDocument());
});
```

---

## 端到端测试（E2E）简介

E2E 测试模拟真实用户操作，常用工具有 Cypress、Playwright。

### Cypress 示例

```js
/**
 * @file cypress/e2e/login.cy.js
 * @description Cypress E2E 测试。
 */
describe('登录流程', () => {
  it('用户可以登录', () => {
    cy.visit('/login');
    cy.get('input[name=username]').type('Tom');
    cy.get('input[name=password]').type('123456');
    cy.get('button[type=submit]').click();
    cy.contains('欢迎，Tom').should('be.visible');
  });
});
```

---

## Mock、覆盖率与快照测试

- Jest 支持全局 Mock、模块 Mock、函数 Mock
- 覆盖率报告：`jest --coverage`
- 快照测试适合 UI 组件回归

---

## 测试最佳实践

- 以用户视角编写测试用例，关注行为而非实现
- 保持测试独立、可重复
- 充分利用 Mock 隔离外部依赖
- 持续集成中自动运行测试
- 关注覆盖率但不唯覆盖率

---

## 常见问题与解决方案

### 1. 组件依赖外部模块难以测试
- 使用 Mock 隔离依赖

### 2. 异步测试不稳定
- 使用 waitFor、findBy 等异步断言

### 3. 覆盖率低
- 检查未覆盖分支，补充测试

---

/**
 * @module ReactTesting
 * @description 本文极致细化了 React 测试工具与最佳实践，适合新手和进阶开发者参考。
 */ 