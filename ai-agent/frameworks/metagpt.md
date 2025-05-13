# MetaGPT 框架详解

MetaGPT 是面向自动化软件开发的多智能体协作框架，强调知识型分工与流水线式开发，适合复杂系统的自动生成与协作。

## 架构与核心特性
- **多智能体分工**：如产品经理、架构师、开发、测试等角色协作。
- **自动化软件开发**：支持需求分析、设计、编码、测试、文档全流程自动化。
- **知识协作**：智能体间共享知识、上下文与中间产物。

## 典型用法
- 自动生成完整软件项目
- 多角色协作式代码评审与优化
- 智能文档与知识库建设

## 生态扩展
- 支持主流大模型与自定义插件
- 可集成外部代码库、API、CI/CD 工具

## 实战案例
```js
/**
 * MetaGPT 自动化软件开发示例
 * @param {string} requirement - 需求描述
 * @returns {Promise<string>} 项目结果
 */
async function metagptDev(requirement) {
  // 伪代码：实际需用 metagpt.js API
  const team = new MetaGPT({ roles: ["pm", "dev", "qa"] });
  return await team.run(requirement);
}
``` 