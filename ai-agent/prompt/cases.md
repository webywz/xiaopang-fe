# Prompt 工程实战案例

本页展示 Prompt 工程在实际智能体应用中的典型案例，涵盖问答、代码生成、摘要、推理等场景。

## 典型场景与设计思路
- **问答**：明确问题、限定输出格式，提升准确率
- **代码生成**：提供输入输出示例，指定语言和风格
- **摘要**：要求简明扼要，限定字数
- **推理**：引导分步思考，提升复杂任务表现

## 效果对比
- 优化前：Prompt 不明确，输出易跑偏
- 优化后：Prompt 明确、分步、示例丰富，输出更稳定

## 优化技巧
- 多轮实验，持续微调
- 结合上下文与历史对话
- 动态生成 Prompt 适应不同任务

## 实战代码
```js
/**
 * 问答 Prompt 实战
 * @param {string} question - 用户问题
 * @returns {Promise<string>} 答案
 */
async function qaPromptCase(question) {
  const prompt = `请用简洁的语言回答：${question}`;
  return await callLLM(prompt);
}

/**
 * 代码生成 Prompt 实战
 * @param {string} desc - 需求描述
 * @returns {Promise<string>} 代码
 */
async function codeGenPromptCase(desc) {
  const prompt = `请用 JavaScript 实现如下功能：${desc}\n请只输出代码，不要解释。`;
  return await callLLM(prompt);
}
``` 