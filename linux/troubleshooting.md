# Linux故障排查

## 系统故障排查

### 系统启动问题
```bash
# 查看启动日志
dmesg | less
journalctl -b
cat /var/log/boot.log

# 检查启动服务状态
systemctl list-units --type=service --state=failed
systemctl status <service-name>

# 检查启动配置
cat /etc/fstab
cat /etc/default/grub
```

### 系统资源问题
```bash
# CPU问题排查
top
htop
mpstat -P ALL 1
pidstat 1

# 内存问题排查
free -h
vmstat 1
cat /proc/meminfo
ps aux --sort=-%mem | head

# 磁盘问题排查
df -h
iostat -x 1
iotop
lsof | grep deleted
```

### 系统日志分析
```bash
# 查看系统日志
tail -f /var/log/syslog
tail -f /var/log/messages
journalctl -f

# 查看安全日志
tail -f /var/log/auth.log
tail -f /var/log/secure

# 查看内核日志
dmesg | tail
cat /var/log/kern.log
```

## 网络故障排查

### 网络连接问题
```bash
# 检查网络接口
ip addr show
ifconfig
nmcli device show

# 检查网络连接
netstat -tunlp
ss -tunlp
lsof -i

# 检查路由
ip route show
route -n
traceroute <host>
```

### 网络性能问题
```bash
# 带宽测试
iperf3 -s
iperf3 -c <server>

# 网络延迟测试
ping <host>
mtr <host>

# 网络抓包
tcpdump -i eth0
tcpdump -i eth0 port 80
```

### DNS问题
```bash
# DNS解析测试
nslookup <domain>
dig <domain>
host <domain>

# DNS配置检查
cat /etc/resolv.conf
cat /etc/hosts
```

## 应用故障排查

### 进程问题
```bash
# 进程状态检查
ps aux | grep <process>
ps -ef | grep <process>
pstree -p

# 进程资源使用
pidstat 1
pidstat -d 1
pidstat -r 1

# 进程跟踪
strace -p <pid>
ltrace -p <pid>
```

### 服务问题
```bash
# 服务状态检查
systemctl status <service>
service <service> status

# 服务日志查看
journalctl -u <service>
tail -f /var/log/<service>/error.log

# 服务配置检查
cat /etc/<service>/<service>.conf
```

### 数据库问题
```bash
# MySQL问题排查
mysqladmin status
mysqladmin processlist
mysql -e "SHOW ENGINE INNODB STATUS\G"

# PostgreSQL问题排查
pg_isready
psql -c "SELECT * FROM pg_stat_activity;"
```

## 安全故障排查

### 系统安全
```bash
# 检查系统安全
chkrootkit
rkhunter --check
lynis audit system

# 检查文件完整性
aide --check
tripwire --check

# 检查系统日志
grep "Failed password" /var/log/auth.log
grep "Invalid user" /var/log/auth.log
```

### 网络安全
```bash
# 检查开放端口
nmap localhost
netstat -tunlp
ss -tunlp

# 检查防火墙规则
iptables -L
ufw status
firewall-cmd --list-all

# 检查网络连接
netstat -an | grep ESTABLISHED
ss -o state established
```

## 性能故障排查

### CPU性能
```bash
# CPU使用率分析
top
htop
mpstat -P ALL 1

# CPU负载分析
uptime
cat /proc/loadavg
vmstat 1

# CPU调度分析
pidstat 1
pidstat -d 1
```

### 内存性能
```bash
# 内存使用分析
free -h
vmstat 1
cat /proc/meminfo

# 内存泄漏检测
valgrind --tool=memcheck
valgrind --tool=massif

# 内存页面分析
cat /proc/vmstat
cat /proc/pagetypeinfo
```

### 磁盘性能
```bash
# 磁盘使用分析
df -h
du -sh /*
iostat -x 1

# 磁盘IO分析
iotop
pidstat -d 1
iostat -d -x 1

# 文件系统检查
fsck /dev/sda1
tune2fs -l /dev/sda1
```

## 故障排查流程

### 问题诊断
1. 收集系统信息
2. 分析错误日志
3. 检查系统状态
4. 验证配置正确性
5. 测试功能可用性

### 问题解决
1. 确定问题根源
2. 制定解决方案
3. 实施修复措施
4. 验证修复效果
5. 记录解决方案

### 预防措施
1. 定期系统检查
2. 监控系统状态
3. 备份重要数据
4. 更新系统补丁
5. 优化系统配置

## 最佳实践

### 排查建议
1. 保持冷静，按步骤排查
2. 记录所有操作和结果
3. 使用合适的工具
4. 注意系统安全
5. 及时总结经验

### 工具使用
1. 熟悉常用命令
2. 掌握日志分析
3. 了解性能工具
4. 善用监控系统
5. 建立工具集

### 文档管理
1. 记录故障现象
2. 保存排查过程
3. 总结解决方案
4. 更新知识库
5. 分享经验教训 