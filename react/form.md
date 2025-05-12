 # React 表单处理详解

表单是前端开发中最常见的场景之一。React 社区有多种高效的表单管理方案，如 Formik、react-hook-form 等。

## 目录
- 表单管理简介
- 受控与非受控表单
- Formik 基础与进阶
- react-hook-form 基础与进阶
- 表单校验与错误处理
- 性能优化与大表单
- 表单最佳实践
- 常见问题与解决方案

---

## 表单管理简介

React 原生表单管理依赖 state，适合简单场景。复杂表单推荐使用专业库，提升开发效率和可维护性。

---

## 受控与非受控表单

### 受控组件

```jsx
/**
 * @file ControlledInput.jsx
 * @description 受控组件示例，表单值由 state 控制。
 */
import React, { useState } from 'react';

function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input value={value} onChange={e => setValue(e.target.value)} />
  );
}
```

### 非受控组件

```jsx
/**
 * @file UncontrolledInput.jsx
 * @description 非受控组件示例，直接操作 DOM。
 */
import React, { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef();
  const handleClick = () => {
    alert(inputRef.current.value);
  };
  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>获取值</button>
    </>
  );
}
```

---

## Formik 基础与进阶

Formik 是 React 最流行的表单库之一，支持表单状态、校验、提交等。

### 基础用法

```jsx
/**
 * @file FormikBasic.jsx
 * @description Formik 基础用法。
 */
import { Formik, Form, Field, ErrorMessage } from 'formik';

function SignupForm() {
  return (
    <Formik
      initialValues={{ email: '' }}
      validate={values => {
        const errors = {};
        if (!values.email) {
          errors.email = '必填';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
          errors.email = '邮箱格式无效';
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field type="email" name="email" />
          <ErrorMessage name="email" component="div" />
          <button type="submit" disabled={isSubmitting}>提交</button>
        </Form>
      )}
    </Formik>
  );
}
```

### 进阶用法：多字段、嵌套对象、动态表单

```jsx
/**
 * @file FormikAdvanced.jsx
 * @description Formik 进阶用法，动态字段。
 */
import { Formik, Form, Field, FieldArray } from 'formik';

function FriendsForm() {
  return (
    <Formik
      initialValues={{ friends: [''] }}
      onSubmit={values => alert(JSON.stringify(values))}
    >
      {({ values }) => (
        <Form>
          <FieldArray name="friends">
            {({ push, remove }) => (
              <div>
                {values.friends.map((_, i) => (
                  <div key={i}>
                    <Field name={`friends.${i}`} />
                    <button type="button" onClick={() => remove(i)}>删除</button>
                  </div>
                ))}
                <button type="button" onClick={() => push('')}>添加朋友</button>
              </div>
            )}
          </FieldArray>
          <button type="submit">提交</button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## react-hook-form 基础与进阶

react-hook-form 以 hooks 方式管理表单，性能极高，API 简洁。

### 基础用法

```jsx
/**
 * @file RHFBasic.jsx
 * @description react-hook-form 基础用法。
 */
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => alert(JSON.stringify(data));
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: '用户名必填' })} />
      {errors.username && <span>{errors.username.message}</span>}
      <input type="password" {...register('password', { required: '密码必填' })} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">登录</button>
    </form>
  );
}
```

### 进阶用法：动态表单、嵌套、联动

```jsx
/**
 * @file RHFAdvanced.jsx
 * @description react-hook-form 动态表单与联动。
 */
import { useForm, useFieldArray } from 'react-hook-form';

function DynamicForm() {
  const { control, register, handleSubmit } = useForm({
    defaultValues: { items: [{ value: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const onSubmit = data => alert(JSON.stringify(data));
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(`items.${i}.value`)} />
          <button type="button" onClick={() => remove(i)}>删除</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: '' })}>添加项</button>
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 表单校验与错误处理

- Formik 支持自定义校验函数和 Yup 校验库
- react-hook-form 支持内联校验和第三方校验（如 Yup）

```js
/**
 * @file YupValidation.js
 * @description 使用 Yup 进行表单校验。
 */
import * as Yup from 'yup';

const schema = Yup.object().shape({
  email: Yup.string().email('邮箱格式无效').required('必填'),
  password: Yup.string().min(6, '至少6位').required('必填')
});
```

---

## 性能优化与大表单

- react-hook-form 性能优于 Formik，适合大表单
- 避免每次输入都 setState，减少渲染
- 使用虚拟化（如 react-window）优化超大表单

---

## 表单最佳实践

- 优先使用受控组件，便于状态同步
- 简单表单可用原生，复杂表单推荐专业库
- 校验逻辑集中管理，提升可维护性
- 合理拆分表单组件，复用性高
- 结合 UI 库（如 Ant Design、MUI）提升体验

---

## 常见问题与解决方案

### 1. 表单值不同步
- 检查受控组件 value/onChange 是否正确绑定

### 2. 校验不生效
- 检查校验规则、依赖项、第三方库版本

### 3. 性能卡顿
- 优化渲染、减少不必要的 state 更新，优先选择 react-hook-form

---

/**
 * @module FormManagement
 * @description 本文极致细化了 React 表单管理方案，适合新手和进阶开发者参考。
 */
