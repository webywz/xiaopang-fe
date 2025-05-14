# 多轮对话

## 1. 简介
多轮对话是 Prompt 工程中实现复杂交互、连续任务和上下文理解的核心能力。通过上下文串联、轮次管理和意图追踪，智能体能够与用户进行自然、连贯的多轮交流，适应实际业务场景。

## 2. 主要原理与关键技术
- **上下文串联**：将历史对话与当前输入拼接，保持对话连贯性
- **轮次管理**：记录对话轮次，支持多步任务拆解与跟进
- **意图追踪**：识别用户多轮输入中的核心意图与目标
- **槽位填充（Slot Filling）**：逐步收集关键信息，完成复杂任务
- **多轮记忆与状态管理**：结合短期/长期记忆，追踪对话状态

## 3. JSDoc 代码示例
```js
/**
 * 多轮对话上下文管理示例
 * @param {Array<{role: string, content: string}>} history - 历史对话数组
 * @param {string} userInput - 当前用户输入
 * @param {number} maxLen - 最大上下文长度
 * @returns {string} 拼接后的多轮上下文
 */
function buildMultiTurnContext(history, userInput, maxLen) {
  const context = history.map(h => `${h.role}: ${h.content}`).join('\n') + `\n用户: ${userInput}`;
  return context.length > maxLen ? context.slice(-maxLen) : context;
}

/**
 * 槽位填充示例
 * @param {object} slots - 当前已收集槽位
 * @param {object} input - 当前输入信息
 * @returns {object} 更新后的槽位
 */
function fillSlots(slots, input) {
  return { ...slots, ...input };
}
```

## 4. 实践要点与扩展建议
- 合理设计上下文拼接与轮次管理，防止信息丢失或冗余
- 动态追踪用户意图，支持任务中断与恢复
- 结合槽位填充与状态管理，提升复杂任务完成率
- 可与知识库、记忆模块协同，增强多轮对话智能

---
多轮对话是智能体实现自然交互和复杂任务自动化的基础，建议与上下文管理、记忆等能力协同设计。 