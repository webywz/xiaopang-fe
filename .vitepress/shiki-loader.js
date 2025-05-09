import { enhanceShikiInstance } from './shiki-shim';

/**
 * 创建 Shiki 加载器插件
 * 用于监控和增强 Shiki 的加载过程，防止实例被过早销毁
 * @returns {import('vite').Plugin} Vite 插件
 */
export function createShikiLoader() {
  return {
    name: 'vitepress:shiki-loader',
    enforce: 'pre',
    
    /**
     * 将自定义 Shiki 加载逻辑注入到 VitePress 服务器中
     */
    configureServer(server) {
      // 监听服务器启动事件
      server.httpServer?.once('listening', () => {
        // 延迟执行，确保 VitePress 已加载 Shiki
        setTimeout(() => {
          monitorAndEnhanceShiki();
        }, 1000);
      });
    },
    
    /**
     * 客户端注入
     */
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `
            // 在客户端也尝试增强 Shiki 实例
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                if (window.shiki) {
                  console.log('增强客户端 Shiki 实例');
                  // 在客户端防止 Shiki 实例被处理
                  const originalDispose = window.shiki.dispose;
                  if (originalDispose) {
                    window.shiki.dispose = function() {
                      console.log('拦截客户端 Shiki dispose');
                      // 不执行实际的 dispose
                    };
                  }
                }
              }, 500);
            });
          `
        }
      ];
    }
  };
}

/**
 * 监控并增强 Shiki 实例
 * 通过全局监控识别注入的 Shiki 实例并应用增强
 */
function monitorAndEnhanceShiki() {
  try {
    // 尝试在 Node.js 模块缓存中查找 Shiki
    const moduleCache = require.cache;
    for (const key in moduleCache) {
      if (key.includes('@shikijs/core') || key.includes('shiki')) {
        const mod = moduleCache[key];
        if (mod && mod.exports) {
          // 识别可能的 Shiki 实例并增强
          if (mod.exports.getLoadedLanguages) {
            enhanceShikiInstance(mod.exports);
            console.log('成功增强 Shiki 实例 (通过模块缓存)');
          }
        }
      }
    }
  } catch (error) {
    console.error('监控 Shiki 错误:', error);
  }
} 