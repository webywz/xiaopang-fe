# Prompt 工程常用模式

Prompt 工程中有多种经典设计模式，适用于不同的智能体任务和场景。

## 常见模式
- **指令模式（Instruction Pattern）**：直接给出明确指令，引导模型完成任务。
- **示例模式（Few-shot Pattern）**：提供输入输出示例，帮助模型学习任务格式。
- **角色扮演模式（Role Pattern）**：让模型以特定身份/风格输出。
- **链式思维模式（Chain-of-Thought, CoT）**：引导模型分步推理，提升复杂任务表现。
- **反事实模式（Counterfactual Pattern）**：引导模型思考"如果……会怎样"。

## 适用场景
- 问答、摘要、翻译、代码生成、推理等

## 设计技巧
- 明确分隔输入与输出
- 多轮对话中保留上下文
- 结合工具调用与动态 Prompt

## 实战案例
```js
/**
 * 链式思维 Prompt 示例
 * @param {string} question - 复杂问题
 * @returns {Promise<string>} 推理过程与答案
 */
async function chainOfThoughtPrompt(question) {
  const prompt = `请分步推理并回答：${question}\n请详细写出每一步。`;
  return await callLLM(prompt);
}
``` 