/**
 * HTML模板标签修复工具
 * 
 * 这个模块专门处理Markdown文件中的HTML模板标签，防止Vue解析器将其误识别为Vue模板
 */

/**
 * 创建HTML模板标签修复插件
 * @returns {import('vite').Plugin} Vite插件
 */
export function createHtmlTemplateFix() {
  return {
    name: 'vitepress:html-template-fix',
    enforce: 'pre',
    
    /**
     * 转换Markdown文件内容
     * @param {string} code - 文件内容
     * @param {string} id - 文件路径
     */
    transform(code, id) {
      // 只处理HTML相关的Markdown文件
      if (id.endsWith('.md') && (
        id.includes('/HTML/') || 
        id.includes('/html/') ||
        code.includes('<template') ||
        code.includes('</template>')
      )) {
        return processHtmlTemplateMarkdown(code);
      }
      return null;
    }
  };
}

/**
 * 处理含有HTML模板标签的Markdown内容
 * @param {string} content - Markdown内容
 * @returns {string} 处理后的内容
 */
function processHtmlTemplateMarkdown(content) {
  let modified = content;
  
  // 1. 处理Markdown文本中的template标签描述（非代码块内）
  modified = modified.replace(
    /(<template>|<\/template>)/g, 
    '`$1`'
  );
  
  // 2. 在代码块内的template标签前添加转义标记
  modified = modified.replace(
    /(```html[\s\S]*?)(<template)/g,
    '$1\\$2'
  );
  modified = modified.replace(
    /(```html[\s\S]*?)(<\/template>)/g,
    '$1\\$2'
  );
  
  // 3. 处理特殊情况：行内代码中的template标签
  modified = modified.replace(
    /`(<template[^`]*>|<\/template>)`/g, 
    '`\\$1`'
  );
  
  return modified;
} 