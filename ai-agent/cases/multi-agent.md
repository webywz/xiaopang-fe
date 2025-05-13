# 多智能体协作案例

多智能体协作（Multi-Agent）是指多个 AI Agent 分工协作、互相通信，共同完成复杂任务。

## 场景介绍
- 自动化软件开发流水线
- 多角色文档写作与评审
- 智能科研与知识发现

## 系统架构
- 用户输入 → 调度 Agent 分配任务 → 各子 Agent 协作 → 汇总结果

## 核心流程
1. 任务分解与分配
2. 各 Agent 独立执行子任务
3. Agent 间通信与结果共享
4. 汇总与反馈最终结果

## 关键技术点
- Agent 分工与角色设定
- Agent 间通信协议（如消息队列、共享内存）
- 协作机制与冲突解决

## 实战代码
```js
/**
 * 多智能体协作主流程
 * @param {string} task - 总任务描述
 * @returns {Promise<string>} 协作结果
 */
async function multiAgentWorkflow(task) {
  const subTasks = await splitTask(task);
  const results = await Promise.all(subTasks.map(agentDispatch));
  return await aggregateResults(results);
}
``` 