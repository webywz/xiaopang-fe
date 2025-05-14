# SQL 团队开发规范与数据安全

## 1. 命名规范与表结构设计
- 表名、字段名统一小写、下划线分隔，避免缩写与保留字
- 主键建议用自增ID或UUID，外键命名为 xxx_id
- 字段类型选择需兼顾存储与性能，避免过度冗余
- 重要字段加唯一索引，提升约束与查询效率
- 表结构变更需评估影响，建议版本化管理

## 2. 代码规范与团队协作
- 所有 SQL 语句、脚本、迁移文件需版本控制（如 Git）
- 复杂 SQL 建议注释说明业务意图
- 统一使用参数化查询，严禁拼接 SQL
- 代码评审需包含 SQL 审查环节
- 团队定期分享最佳实践与踩坑案例

## 3. 权限管理与安全控制
- 生产、测试、开发环境分离，权限最小化
- 只授予必要的表/视图/函数权限，禁用高危操作
- 定期审计数据库账户与权限变更
- 重要操作建议二次确认与日志记录

## 4. 数据脱敏与隐私保护
- 敏感字段（如手机号、身份证、邮箱）存储前加密或脱敏
- 查询接口返回前做数据脱敏处理
- 备份文件加密存储，防止泄露
- 遵循相关法律法规（如GDPR、网络安全法）

## 5. 备份策略与容灾
- 生产环境定期全量+增量备份，异地/云端存储
- 定期测试恢复流程，确保备份可用
- 关键业务建议多地多活、主备切换

## 6. 变更管理与上线流程
- 表结构/索引/权限变更需走评审与灰度流程
- 生产变更建议业务低峰期执行，做好回滚预案
- 变更前后监控性能与数据一致性

## 7. 典型代码片段（含 JSDoc 注释）
```js
/**
 * 查询并脱敏手机号
 * @param {import('pg').Pool} pool
 * @returns {Promise<Array<{id:number,phone:string}>>}
 */
async function getMaskedPhones(pool) {
  const sql = "SELECT id, regexp_replace(phone, '(\\d{3})\\d{4}(\\d{4})', '\\1****\\2') AS phone FROM users";
  const { rows } = await pool.query(sql);
  return rows;
}

/**
 * 仅授予只读权限
 * @param {import('pg').Pool} pool
 * @param {string} user
 * @returns {Promise<void>}
 */
async function grantReadOnly(pool, user) {
  await pool.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`);
}
```

## 8. 团队协作与知识共享建议
- 建立团队 SQL 规范文档，定期更新
- 组织技术分享、代码走查，沉淀最佳实践
- 复盘线上事故，持续改进流程与规范

---

规范与安全是高质量数据开发的基石，建议团队持续学习、协作与总结。 