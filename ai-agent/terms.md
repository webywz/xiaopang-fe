# AI Agent 常用术语

本页汇总 AI Agent 领域常见术语及其解释，帮助快速理解相关概念。

## 术语表
- **Agent（智能体）**：具备自主感知、决策、执行能力的 AI 系统。
- **LLM（大语言模型）**：如 GPT-4、文心一言等，负责理解、推理和生成。
- **Tool（工具）**：Agent 可调用的外部能力，如 API、数据库、插件等。
- **Prompt（提示词）**：与 LLM 交互的输入文本，决定模型行为。
- **Memory（记忆）**：Agent 的上下文存储与历史记录能力。
- **Planner（规划器）**：负责任务分解与行动规划的模块。
- **Executor（执行器）**：负责具体执行计划、调用工具的模块。
- **Multi-Agent（多智能体）**：多个 Agent 协作完成复杂任务。
- **AgentOps**：智能体的运维、监控、评估与持续优化体系。

## 代码示例（带 JSDoc 注释）
```js
/**
 * Agent 调用工具的伪代码
 * @param {string} prompt - 用户输入
 * @param {Function} tool - 工具函数
 * @returns {Promise<string>} 工具调用结果
 */
async function agentWithTool(prompt, tool) {
  const plan = await planTask(prompt);
  return await tool(plan);
}
``` 