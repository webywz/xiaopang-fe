# LangChain 框架详解

LangChain 是当前最流行的 LLM 智能体开发框架之一，专注于将大模型与外部工具、数据源、记忆等能力无缝集成。

## 架构与核心模块
- **链（Chain）**：将多个 LLM 调用、工具调用串联为任务流程。
- **工具（Tool）**：可扩展的 API、数据库、搜索等外部能力。
- **记忆（Memory）**：支持上下文记忆、对话历史。
- **代理（Agent）**：具备自主决策、动态调用工具的智能体。

## 典型用法
- 问答系统、RAG 检索增强生成
- 多步推理与自动化办公
- 多智能体协作

## 生态扩展
- 支持 OpenAI、Anthropic、百度文心等主流大模型
- 丰富的工具链与插件生态

## 实战案例
```js
/**
 * LangChain Agent 问答示例
 * @param {string} question - 用户问题
 * @returns {Promise<string>} 答案
 */
async function langchainQA(question) {
  // 伪代码：实际需用 langchain.js API
  const agent = new LangChainAgent({ tools: [searchTool, calcTool] });
  return await agent.run(question);
}
``` 