# Prompt 工程实战案例

## 1. 简介
本节汇总典型的 Prompt 工程实战案例，涵盖智能问答、代码生成、数据分析、自动化办公等场景，帮助开发者快速掌握高效 Prompt 设计与应用技巧。

## 2. 典型案例

### 案例一：智能问答 Prompt
- **场景描述**：用户向智能体提问，期望获得准确、简明的答案。
- **Prompt 设计**：
  - "请用简明扼要的语言回答下列问题：{question}"
- **JSDoc 代码示例**：
```js
/**
 * 智能问答 Prompt 构建
 * @param {string} question - 用户问题
 * @returns {string} Prompt
 */
function buildQAPrompt(question) {
  return `请用简明扼要的语言回答下列问题：${question}`;
}
```

### 案例二：代码生成 Prompt
- **场景描述**：用户描述开发需求，智能体自动生成代码片段。
- **Prompt 设计**：
  - "请根据如下需求生成符合规范的 JavaScript 代码，并添加 JSDoc 注释：{requirement}"
- **JSDoc 代码示例**：
```js
/**
 * 代码生成 Prompt 构建
 * @param {string} requirement - 需求描述
 * @returns {string} Prompt
 */
function buildCodeGenPrompt(requirement) {
  return `请根据如下需求生成符合规范的 JavaScript 代码，并添加 JSDoc 注释：${requirement}`;
}
```

### 案例三：数据分析 Prompt
- **场景描述**：用户上传数据，智能体自动分析并输出结论。
- **Prompt 设计**：
  - "请对以下数据进行分析，并用条理清晰的语言总结主要发现：{data}"
- **JSDoc 代码示例**：
```js
/**
 * 数据分析 Prompt 构建
 * @param {string} data - 数据内容
 * @returns {string} Prompt
 */
function buildDataAnalysisPrompt(data) {
  return `请对以下数据进行分析，并用条理清晰的语言总结主要发现：${data}`;
}
```

### 案例四：自动化办公 Prompt
- **场景描述**：用户希望智能体自动整理表格、生成报告等。
- **Prompt 设计**：
  - "请根据下列表格内容生成一份简明的周报：{table}"
- **JSDoc 代码示例**：
```js
/**
 * 自动化办公 Prompt 构建
 * @param {string} table - 表格内容
 * @returns {string} Prompt
 */
function buildOfficePrompt(table) {
  return `请根据下列表格内容生成一份简明的周报：${table}`;
}
```

## 3. 实践要点与扩展建议
- 针对不同场景定制 Prompt 模板，提升任务适配性
- 明确输出格式与风格，便于后续处理与集成
- 可结合上下文管理与多轮对话，增强复杂任务能力
- 持续优化 Prompt 设计，积累高质量案例库

---
Prompt 工程实战案例有助于开发者快速上手和持续优化，建议结合实际业务需求灵活应用。 