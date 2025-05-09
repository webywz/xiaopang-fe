/**
 * React 代码高亮修复工具
 * 
 * 这个模块专门处理 React 文档中可能导致 Shiki 崩溃的代码格式问题
 */

/**
 * 创建 React 代码高亮修复插件
 * @returns {import('vite').Plugin} Vite 插件
 */
export function createReactHighlightFix() {
  return {
    name: 'vitepress:react-highlight-fix',
    enforce: 'pre',
    
    /**
     * 转换 Markdown 文件内容
     * @param {string} code - 文件内容
     * @param {string} id - 文件路径
     */
    transform(code, id) {
      // 只处理 React 相关的 Markdown 文件
      if (id.endsWith('.md') && (
        id.includes('/react/') || 
        id.includes('/jsx/') || 
        id.includes('/tsx/')
      )) {
        return processReactMarkdown(code);
      }
      return null;
    }
  };
}

/**
 * 处理 React Markdown 内容，修复可能导致高亮问题的模式
 * @param {string} content - Markdown 内容
 * @returns {string} 处理后的内容
 */
function processReactMarkdown(content) {
  let modified = content;
  
  // 1. 处理 JSX 代码块中的尖括号
  modified = modified.replace(
    /```(jsx|tsx)([\s\S]*?)```/g, 
    (match, lang, code) => {
      // 在 JSX 表达式中添加空格，避免被误识别为 HTML 标签
      const fixedCode = code
        // 处理 React 组件的尖括号
        .replace(/<([A-Z][A-Za-z0-9]*)/g, '< $1')
        .replace(/\/>/g, '/ >')
        // 处理泛型
        .replace(/<([A-Za-z]+)>/g, '< $1 >')
        // 处理 React fragments
        .replace(/<>/g, '< >')
        .replace(/<\/>/g, '</ >');
      
      return '```' + lang + fixedCode + '```';
    }
  );
  
  // 2. 修复代码块前后的空行，确保 markdown-it 正确处理
  modified = modified.replace(/```([\w-]+)\n/g, '```$1\n\n');
  modified = modified.replace(/\n```/g, '\n\n```');
  
  return modified;
} 