# AutoGen 框架详解

AutoGen 是微软开源的多智能体协作开发框架，专注于自动任务分解、Agent 间通信与反馈机制。

## 架构与核心特性
- **多 Agent 协作**：支持多个智能体分工协作，自动分配子任务。
- **自动任务分解**：根据目标自动拆解为可执行子任务。
- **反馈机制**：Agent 间可互相评价、修正结果，提升整体智能。

## 典型用法
- 自动化代码生成与评审
- 多 Agent 协作科研、文档写作
- 智能办公自动化

## 生态扩展
- 支持主流大模型（OpenAI、Azure、百度等）
- 可扩展自定义 Agent、工具链

## 实战案例
```js
/**
 * AutoGen 多 Agent 协作示例
 * @param {string} task - 任务描述
 * @returns {Promise<string>} 结果
 */
async function autogenMultiAgent(task) {
  // 伪代码：实际需用 autogen.js API
  const agents = [new ReviewerAgent(), new WriterAgent()];
  return await AutoGen.run(task, agents);
}
``` 