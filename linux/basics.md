# Linux基础

## 什么是Linux

Linux是一个开源的操作系统内核，由Linus Torvalds在1991年创建。它遵循GNU通用公共许可证（GPL）发布，是一个类Unix的操作系统。

### Linux的主要特点

- 开源免费
- 多用户、多任务
- 安全性高
- 稳定性好
- 可移植性强
- 丰富的软件生态

## Linux发行版

### 主流发行版

1. **Debian系列**
   - Ubuntu
   - Linux Mint
   - Kali Linux

2. **Red Hat系列**
   - CentOS
   - Fedora
   - RHEL

3. **SUSE系列**
   - openSUSE
   - SUSE Linux Enterprise

4. **其他发行版**
   - Arch Linux
   - Gentoo
   - Slackware

## 系统架构

### 内核架构
- 进程管理
- 内存管理
- 文件系统
- 设备驱动
- 网络协议栈

### 用户空间
- Shell
- 系统工具
- 应用程序
- 图形界面

## 基本命令

### 文件操作
```bash
# 列出文件
ls -la

# 创建目录
mkdir dirname

# 复制文件
cp source destination

# 移动文件
mv source destination

# 删除文件
rm filename
```

### 系统信息
```bash
# 查看系统信息
uname -a

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看进程
ps aux
```

## 文件系统

### 目录结构
- `/` - 根目录
- `/bin` - 基本命令
- `/boot` - 启动文件
- `/dev` - 设备文件
- `/etc` - 配置文件
- `/home` - 用户目录
- `/lib` - 系统库
- `/mnt` - 挂载点
- `/opt` - 可选应用
- `/proc` - 进程信息
- `/root` - root用户目录
- `/sbin` - 系统命令
- `/tmp` - 临时文件
- `/usr` - 用户程序
- `/var` - 可变文件

### 文件权限
```bash
# 修改权限
chmod 755 filename

# 修改所有者
chown user:group filename
```

## 用户管理

### 用户操作
```bash
# 添加用户
useradd username

# 设置密码
passwd username

# 删除用户
userdel username
```

### 组操作
```bash
# 添加组
groupadd groupname

# 添加用户到组
usermod -aG groupname username
```

## 包管理

### Debian/Ubuntu
```bash
# 更新包列表
apt update

# 安装包
apt install package_name

# 升级系统
apt upgrade
```

### Red Hat/CentOS
```bash
# 更新包列表
yum update

# 安装包
yum install package_name

# 升级系统
yum upgrade
```

## 系统服务

### 服务管理
```bash
# 启动服务
systemctl start service_name

# 停止服务
systemctl stop service_name

# 重启服务
systemctl restart service_name

# 查看服务状态
systemctl status service_name
```

## 网络基础

### 网络配置
```bash
# 查看网络接口
ifconfig
ip addr

# 配置网络
nmtui
```

### 网络工具
```bash
# 测试连通性
ping host

# 查看路由
route -n

# 网络连接
netstat -tuln
```

## 安全基础

### 防火墙
```bash
# 查看防火墙状态
ufw status

# 配置防火墙
ufw allow port
```

### SSH安全
```bash
# 生成密钥对
ssh-keygen

# 配置SSH
vim /etc/ssh/sshd_config
```

## 系统监控

### 性能监控
```bash
# 实时监控
top
htop

# 系统负载
uptime
```

### 日志查看
```bash
# 系统日志
journalctl

# 查看日志文件
tail -f /var/log/syslog
```

## 常见问题解决

### 系统故障
1. 无法启动
2. 网络连接问题
3. 磁盘空间不足
4. 权限问题

### 性能问题
1. CPU使用率高
2. 内存不足
3. 磁盘IO瓶颈
4. 网络延迟

## 最佳实践

### 系统维护
1. 定期更新系统
2. 备份重要数据
3. 监控系统资源
4. 日志分析

### 安全建议
1. 及时更新安全补丁
2. 使用强密码
3. 限制root访问
4. 配置防火墙

## 进阶学习

### 推荐资源
1. Linux Documentation Project
2. Arch Wiki
3. Ubuntu Documentation
4. Red Hat Documentation

### 认证考试
1. LPIC
2. RHCE
3. CompTIA Linux+
4. Linux Foundation Certified System Administrator 