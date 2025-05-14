# Prompt 设计

## 1. 概述
Prompt（提示词）设计是驱动大模型和 AI Agent 正确理解与执行任务的关键。优秀的 Prompt 能极大提升智能体的表现力、稳定性和可控性。

## 2. Prompt 工程基础
- **任务驱动**：明确任务目标，聚焦核心需求。
- **角色扮演**：指定智能体身份或风格，提升输出一致性。
- **上下文注入**：补充背景信息、历史对话、知识点等。
- **输出格式约束**：要求输出特定格式（如 JSON、Markdown、代码等）。
- **多轮对话管理**：通过上下文串联，实现复杂交互。

## 3. 常见 Prompt 设计模式
- **链式思维（Chain-of-Thought, CoT）**：引导模型分步推理，提升复杂任务表现。
- **树状推理（Tree-of-Thought, ToT）**：多路径并行推理，适合开放性问题。
- **反思式（Reflection）**：让模型自我检查和修正输出。
- **模板化 Prompt**：预设模板，批量生成高质量提示词。

## 4. 典型应用场景
- 智能问答与对话系统
- 自动化办公与流程机器人
- 代码生成与审查
- 数据分析与报告生成
- 多智能体协作任务

## 5. JSDoc 代码示例
```js
/**
 * 构建带有角色和格式约束的 Prompt
 * @param {string} role - 智能体角色描述
 * @param {string} task - 任务说明
 * @param {string} format - 输出格式要求
 * @returns {string} 构建好的 Prompt
 */
function buildPrompt(role, task, format) {
  return `你是${role}。请完成如下任务：${task}。\n请以如下格式输出：${format}`;
}

/**
 * 链式思维 Prompt 示例
 * @param {string} question - 用户问题
 * @returns {string} CoT Prompt
 */
function chainOfThoughtPrompt(question) {
  return `请一步步详细推理并回答：${question}`;
}
```

## 6. 实践技巧
- 明确指令，避免歧义
- 适当分步引导，提升复杂任务表现
- 利用示例（Few-shot）提升泛化能力
- 结合上下文与记忆，增强连续对话体验

---
Prompt 设计是 AI Agent 成功的基石，持续优化和实验是提升智能体能力的关键。 