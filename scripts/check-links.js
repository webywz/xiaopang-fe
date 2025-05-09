/**
 * 链接检查脚本
 * 用于检查网站中的所有链接是否有效
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// 查找所有markdown文件
const markdownFiles = glob.sync('**/*.md', {
  ignore: ['node_modules/**', '.vitepress/cache/**']
});

// 提取所有链接
const linkRegex = /\[.*?\]\((.*?)\)/g;
const hrefRegex = /href="([^"]+)"/g;

let brokenLinks = [];
let totalLinks = 0;

// 检查链接是否有效
function checkLink(link, sourceFile) {
  totalLinks++;
  
  // 跳过外部链接和锚点链接
  if (link.startsWith('http') || link.startsWith('#')) {
    return;
  }
  
  // 处理相对路径
  let targetPath = link;
  if (!link.startsWith('/')) {
    targetPath = path.join(path.dirname(sourceFile), link);
  } else {
    targetPath = path.join('.', link);
  }
  
  // 检查文件是否存在
  if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.md')) {
    brokenLinks.push({
      source: sourceFile,
      link: link,
      targetPath: targetPath
    });
  }
}

// 处理所有文件
markdownFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // 检查Markdown链接
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    checkLink(match[1], file);
  }
  
  // 检查HTML链接
  while ((match = hrefRegex.exec(content)) !== null) {
    checkLink(match[1], file);
  }
});

// 输出结果
console.log(chalk.blue(`\n链接检查完成! 共检查了 ${totalLinks} 个链接\n`));

if (brokenLinks.length === 0) {
  console.log(chalk.green('✓ 所有链接都有效!\n'));
} else {
  console.log(chalk.red(`✗ 发现 ${brokenLinks.length} 个问题链接:\n`));
  
  brokenLinks.forEach(({ source, link, targetPath }) => {
    console.log(chalk.yellow(`在文件 ${source} 中:`));
    console.log(`  链接 ${chalk.red(link)} 指向的目标 ${chalk.red(targetPath)} 不存在\n`);
  });
  
  process.exit(1);
} 