/**
 * HTML特殊标签修复工具
 * 
 * 这个模块处理Markdown文件中可能导致Vue解析错误的HTML标签
 */

/**
 * 创建HTML特殊标签修复插件
 * @returns {import('vite').Plugin} Vite插件
 */
export function createHtmlSpecialTagsFix() {
  return {
    name: 'vitepress:html-special-tags-fix',
    enforce: 'pre',
    
    /**
     * 转换Markdown文件内容
     * @param {string} code - 文件内容
     * @param {string} id - 文件路径
     */
    transform(code, id) {
      // 只处理Markdown文件
      if (id.endsWith('.md')) {
        return processHtmlSpecialTags(code);
      }
      return null;
    }
  };
}

/**
 * 处理HTML特殊标签
 * @param {string} content - Markdown内容
 * @returns {string} 处理后的内容
 */
function processHtmlSpecialTags(content) {
  let modified = content;
  
  // 1. 处理常见的Vue解析错误标签
  const problematicTags = [
    'template', 'slot', 'component', 'transition', 'keep-alive',
    'teleport', 'suspense'
  ];
  
  // 文本中的标签（非代码块内）
  problematicTags.forEach(tag => {
    // 正则匹配标签
    const pattern = new RegExp(`</?${tag}[^\\s>]*>`, 'g');
    // 执行替换
    modified = modified.replace(pattern, match => {
      // 如果已经在代码块中，不处理
      if (match.startsWith('`') && match.endsWith('`')) return match;
      return '`' + match + '`';
    });
  });
  
  // 2. 处理代码块中的特殊字符
  // 在```html和```之间的代码块中添加转义
  modified = modified.replace(
    /(```html[\s\S]*?)({{|}})(?!\/)([\s\S]*?```)/g,
    (match, codeStart, specialChars, codeEnd) => {
      return codeStart + '\\' + specialChars + codeEnd;
    }
  );
  
  // 3. 处理单行代码中相邻的尖括号（可能被误解为HTML标签）
  modified = modified.replace(
    /`([^`]*)<([A-Za-z][^>]*?)>([^`]*)`/g,
    (match, before, content, after) => {
      return '`' + before + '&lt;' + content + '&gt;' + after + '`';
    }
  );
  
  // 4. 处理特殊的Vue指令形式，比如v-if、:prop等
  modified = modified.replace(
    /(v-[a-z]+|:[a-z][a-z0-9-]*)=["'][^"']*["']/g,
    (match) => {
      if (match.includes('`')) return match;
      return '`' + match + '`';
    }
  );
  
  // 5. 修复Vue双大括号语法
  modified = modified.replace(
    /{{([^{}]+)}}/g,
    (match) => {
      if (match.includes('`')) return match;
      return '`' + match + '`';
    }
  );
  
  // 6. 处理自闭合标签
  modified = modified.replace(
    /<[a-z][a-z0-9]*[^>]*\/>/gi,
    (match) => {
      if (match.includes('`') || match.includes('\\')) return match;
      return '`' + match + '`';
    }
  );
  
  return modified;
} 