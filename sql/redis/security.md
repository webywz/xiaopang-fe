# Redis 安全配置与风险防护

## 安全配置建议
- 设置访问密码（requirepass）
- 绑定本地 IP（bind 127.0.0.1）
- 禁用危险命令（如 FLUSHALL、CONFIG）
- 只读模式（replica-read-only）
- 限制客户端最大连接数
- 配置持久化文件权限

## 常见安全风险
- 未授权访问：未设置密码或对外暴露端口
- 命令注入：通过 eval、config set 等命令执行恶意操作
- 数据泄露：持久化文件被非法访问

## 防护措施
- 生产环境禁止公网直接访问 Redis
- 配置防火墙，仅允许可信主机访问
- 定期更换密码，监控异常登录
- 升级 Redis 版本，修复已知漏洞
- 备份持久化文件并加密存储 