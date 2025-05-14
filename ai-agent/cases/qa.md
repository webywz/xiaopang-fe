# 智能问答

## 1. 场景简介
智能问答（Question Answering, QA）是 AI Agent 最常见的应用场景之一，广泛用于客服、知识库检索、智能助手等领域。通过自然语言理解和知识检索，智能体能够自动理解用户问题并给出准确答案。

## 2. 主要流程
1. 用户输入问题
2. 智能体进行意图识别与问题解析
3. 检索知识库或调用大模型生成答案
4. 结果整理与格式化输出
5. 支持多轮对话与上下文追踪

## 3. 关键技术
- 自然语言理解（NLU）
- 信息检索（IR）与知识库集成
- 大型语言模型（LLM）生成
- 上下文管理与多轮对话
- 输出格式化与后处理

## 4. JSDoc 代码示例
```js
/**
 * 智能问答主流程
 * @param {string} question - 用户问题
 * @param {object} knowledgeBase - 知识库接口
 * @param {object} llm - 大型语言模型接口
 * @param {object} context - 上下文管理器
 * @returns {Promise<string>} 答案
 */
async function qaAgent(question, knowledgeBase, llm, context) {
  // 解析意图
  const intent = await nlpParse(question);
  // 检索知识库
  let answer = await knowledgeBase.search(intent);
  // 若知识库无结果，调用大模型生成
  if (!answer) {
    answer = await llm.generateAnswer(question, context);
  }
  // 上下文更新
  await context.save(question, answer);
  return answer;
}
```

## 5. 实践要点与扩展建议
- 结合知识库检索与大模型生成（RAG）提升准确率
- 加强上下文管理，支持多轮连续问答
- 输出格式可定制（如表格、代码、摘要等）
- 可扩展为多模态问答（支持图片、语音等输入）

---
智能问答是 AI Agent 的基础能力，适合各类智能助手、企业知识库、自动客服等场景。 