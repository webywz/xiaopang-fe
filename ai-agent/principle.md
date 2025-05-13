# AI Agent 核心原理

AI Agent 的核心原理在于"感知-决策-执行"三段式架构，以及多智能体协作与自适应能力。

## 智能体三段式架构
- **感知（Perception）**：采集和理解环境信息（如文本、图像、语音等）。
- **决策（Decision/Planning）**：基于感知结果进行推理、规划和任务分解。
- **执行（Action/Execution）**：调用工具、API 或与环境交互，完成目标。

## 多智能体协作
- 多个 Agent 可分工协作，互相通信，完成复杂任务。
- 典型模式：专家型 Agent、调度型 Agent、工具型 Agent。

## 规划与自适应
- 任务分解、动态规划、上下文记忆。
- 能根据环境和反馈自我调整行为。

## 与大模型结合
- LLM 负责理解、推理和生成，Agent 负责决策与行动。
- 通过 Prompt、工具调用、插件机制等实现闭环。

## 典型算法
- 基于规则/专家系统
- 基于强化学习（RL）
- 基于大模型的推理与规划

## 代码示例（带 JSDoc 注释）
```js
/**
 * 智能体三段式架构伪代码
 * @param {any} env - 环境输入
 * @returns {Promise<any>} 执行结果
 */
async function agentCore(env) {
  const perception = await perceive(env);
  const plan = await decide(perception);
  return await act(plan);
}
``` 