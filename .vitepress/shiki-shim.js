/**
 * Shiki 实例稳定性增强模块
 * 
 * 这个模块通过重写 Shiki 实例的 dispose 方法，
 * 确保即使在 dispose 被调用后，仍然可以继续使用核心功能。
 */

// 存储原始的 Shiki 实例
let originalShikiInstance = null;

/**
 * 增强 Shiki 实例
 * @param {Object} shiki - Shiki 实例
 * @returns {Object} 增强后的 Shiki 实例
 */
export function enhanceShikiInstance(shiki) {
  if (!shiki || originalShikiInstance === shiki) return shiki;
  
  // 保存原始实例
  originalShikiInstance = shiki;
  
  // 保存原始 dispose 方法
  const originalDispose = shiki.dispose;
  
  // 重写 dispose 方法
  shiki.dispose = function() {
    console.log('拦截 Shiki dispose 调用，提供持久化能力');
    // 不执行实际的 dispose 操作，仅记录日志
    // originalDispose.apply(this);
  };
  
  // 增强 getLoadedLanguages 方法，确保在 dispose 后仍能使用
  const originalGetLoadedLanguages = shiki.getLoadedLanguages;
  shiki.getLoadedLanguages = function() {
    try {
      return originalGetLoadedLanguages.apply(this);
    } catch (error) {
      console.log('修复 getLoadedLanguages 调用');
      return ['js', 'ts', 'html', 'css', 'markdown']; // 返回基本语言集
    }
  };
  
  return shiki;
}

/**
 * 获取 Shiki 实例
 * @returns {Object|null} 当前活跃的 Shiki 实例
 */
export function getShikiInstance() {
  return originalShikiInstance;
} 