# 提示词模式

## 1. 简介
提示词（Prompt）设计模式是提升大模型智能体表现力、可控性和稳定性的关键。通过不同的模式，可以引导模型分步推理、结构化输出、反思自查等，适应多样化任务需求。

## 2. 常见设计模式
- **链式思维（Chain-of-Thought, CoT）**：引导模型分步推理，适合复杂推理与多步骤任务。
- **树状推理（Tree-of-Thought, ToT）**：多路径并行推理，适合开放性、发散性问题。
- **反思式（Reflection）**：让模型自我检查、修正和优化输出。
- **模板化 Prompt**：通过参数化模板批量生成高质量提示词，提升一致性。
- **Few-shot Learning**：给出多个示例，提升模型泛化能力。
- **角色扮演（Role Play）**：指定模型身份或风格，提升输出一致性。

## 3. JSDoc 代码示例
```js
/**
 * 链式思维 Prompt 构建示例
 * @param {string} question - 用户问题
 * @returns {string} CoT Prompt
 */
function buildCoTPrompt(question) {
  return `请一步步详细推理并回答：${question}`;
}

/**
 * 模板化 Prompt 构建示例
 * @param {string} template - Prompt 模板
 * @param {object} params - 参数对象
 * @returns {string} 填充后的 Prompt
 */
function buildTemplatePrompt(template, params) {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] || '');
}
```

## 4. 实践要点与扩展建议
- 根据任务类型选择合适的 Prompt 设计模式
- 善用链式/树状推理提升复杂任务表现
- 模板化与 Few-shot 结合，提升泛化与一致性
- 结合角色扮演与上下文注入，优化多轮对话体验

---
提示词模式是 Prompt 工程的核心，建议结合实际场景灵活选用与组合。 