# CrewAI 框架详解

CrewAI 是专注于多角色协作的智能体开发框架，强调团队智能体的分工与流程编排，适合复杂任务的自动化与协作。

## 架构与核心特性
- **多角色协作**：支持多种角色（如专家、执行者、协调者）共同完成任务。
- **任务分配**：根据角色能力自动分配子任务。
- **流程编排**：支持任务流的动态调整与优化。

## 典型用法
- 多角色文档写作与评审
- 团队式自动化办公
- 智能项目管理与协作

## 生态扩展
- 支持主流大模型与自定义工具链
- 可与外部 API、数据库等集成

## 实战案例
```js
/**
 * CrewAI 多角色协作示例
 * @param {string} project - 项目描述
 * @returns {Promise<string>} 结果
 */
async function crewaiProject(project) {
  // 伪代码：实际需用 crewai.js API
  const crew = new CrewAI({ roles: ["writer", "reviewer", "manager"] });
  return await crew.run(project);
}
``` 