# Linux安全配置

## 系统安全基础

### 用户管理
```bash
# 用户管理命令
useradd username
userdel username
usermod -aG sudo username

# 密码策略
chage -l username
chage -M 90 username  # 设置密码有效期90天
chage -m 7 username   # 设置最小密码期限7天
```

### 权限管理
```bash
# 文件权限
chmod 755 file
chmod u+x file
chmod g-w file

# 目录权限
chmod 750 directory
chmod -R 755 directory

# 特殊权限
chmod u+s file      # SUID
chmod g+s directory # SGID
chmod +t directory  # Sticky Bit
```

### 文件系统安全
```bash
# 文件系统挂载选项
mount -o remount,noexec /tmp
mount -o remount,nosuid /home

# 文件系统检查
fsck /dev/sda1
e2fsck -f /dev/sda1
```

## 网络安全

### 防火墙配置
```bash
# iptables基本规则
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许特定端口
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### SSH安全
```bash
# SSH配置
vim /etc/ssh/sshd_config

# 禁用root登录
PermitRootLogin no

# 更改默认端口
Port 2222

# 限制登录用户
AllowUsers user1 user2

# 使用密钥认证
PubkeyAuthentication yes
PasswordAuthentication no
```

### 网络服务安全
```bash
# 禁用不必要的服务
systemctl disable telnet
systemctl disable rsh
systemctl disable rlogin

# 配置服务访问控制
vim /etc/hosts.allow
vim /etc/hosts.deny
```

## 系统加固

### 系统更新
```bash
# 更新系统
apt update && apt upgrade
yum update

# 自动更新配置
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

### 安全补丁
```bash
# 检查安全更新
apt list --upgradable
yum check-update

# 安装安全补丁
apt install --only-upgrade package
yum update --security
```

### 系统审计
```bash
# 安装审计工具
apt install auditd
yum install audit

# 配置审计规则
auditctl -w /etc/passwd -p wa -k passwd_changes
auditctl -w /etc/shadow -p wa -k shadow_changes

# 查看审计日志
ausearch -k passwd_changes
```

## 入侵检测

### 文件完整性检查
```bash
# 安装AIDE
apt install aide
yum install aide

# 初始化数据库
aideinit

# 检查文件完整性
aide --check
```

### 日志监控
```bash
# 配置日志轮转
vim /etc/logrotate.conf

# 监控系统日志
tail -f /var/log/auth.log
tail -f /var/log/syslog

# 使用logwatch
apt install logwatch
logwatch --detail High
```

### 安全扫描
```bash
# 使用Lynis进行安全扫描
apt install lynis
lynis audit system

# 使用OpenVAS进行漏洞扫描
apt install openvas
openvas-setup
```

## 加密与认证

### 文件加密
```bash
# 使用GPG加密
gpg --gen-key
gpg --encrypt file
gpg --decrypt file.gpg

# 使用openssl加密
openssl enc -aes-256-cbc -in file -out file.enc
openssl enc -aes-256-cbc -d -in file.enc -out file
```

### 磁盘加密
```bash
# 使用LUKS加密
cryptsetup luksFormat /dev/sda1
cryptsetup luksOpen /dev/sda1 encrypted
mkfs.ext4 /dev/mapper/encrypted
```

### 证书管理
```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out certificate.crt

# 配置SSL/TLS
vim /etc/ssl/openssl.cnf
```

## 安全工具

### 漏洞扫描
```bash
# 使用Nmap
nmap -sV -sC target

# 使用Nikto
nikto -h target

# 使用OWASP ZAP
zaproxy
```

### 网络监控
```bash
# 使用Snort
snort -dev

# 使用Wireshark
wireshark

# 使用tcpdump
tcpdump -i eth0 -w capture.pcap
```

## 应急响应

### 事件处理
1. 确认安全事件
2. 隔离受影响系统
3. 收集证据
4. 分析原因
5. 修复漏洞
6. 恢复系统

### 备份恢复
```bash
# 创建备份
tar -czf backup.tar.gz /important/data

# 恢复备份
tar -xzf backup.tar.gz -C /restore/path
```

## 安全策略

### 密码策略
```bash
# 配置PAM密码策略
vim /etc/pam.d/common-password

# 密码复杂度要求
password requisite pam_pwquality.so retry=3 minlen=12 dcredit=-1 ucredit=-1 ocredit=-1 lcredit=-1
```

### 访问控制
```bash
# 配置sudo权限
visudo

# 限制用户访问
usermod -s /sbin/nologin username
```

### 安全基线
1. 最小化安装
2. 及时更新
3. 禁用不必要的服务
4. 配置防火墙
5. 启用审计
6. 加密敏感数据

## 最佳实践

### 日常维护
1. 定期更新系统
2. 检查安全日志
3. 监控系统资源
4. 备份重要数据
5. 测试恢复流程

### 安全建议
1. 使用强密码
2. 启用双因素认证
3. 定期安全扫描
4. 及时打补丁
5. 限制网络访问

### 合规要求
1. 符合安全标准
2. 记录安全事件
3. 定期安全评估
4. 制定安全策略
5. 员工安全培训 