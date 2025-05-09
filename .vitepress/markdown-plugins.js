/**
 * 自定义 Markdown 插件，增强代码块处理能力
 * @param {import('markdown-it')} md - markdown-it 实例
 */
export function setupMarkdownPlugins(md) {
  // 保存原始的 fence 渲染器
  const originalFence = md.renderer.rules.fence;

  // 增强 fence 渲染器
  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    try {
      // 尝试使用原始渲染器
      return originalFence(tokens, idx, options, env, slf);
    } catch (error) {
      console.error('代码块渲染错误:', error);
      
      // 获取代码块内容和语言
      const token = tokens[idx];
      const lang = token.info.trim();
      const content = token.content;
      
      // 提供基础的回退渲染方案
      return `<pre class="language-${lang}"><code>${escapeHtml(content)}</code></pre>`;
    }
  };
}

/**
 * 转义HTML特殊字符
 * @param {string} html - 需要转义的HTML字符串
 * @returns {string} 转义后的字符串
 */
function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 