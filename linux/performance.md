# Linux性能优化

## 系统监控

### 基础监控命令
```bash
# CPU监控
top
htop
mpstat -P ALL 1

# 内存监控
free -h
vmstat 1
cat /proc/meminfo

# 磁盘监控
iostat -x 1
iotop
df -h

# 网络监控
netstat -tulpn
iftop
nethogs
```

### 系统负载分析
```bash
# 查看系统负载
uptime
w
cat /proc/loadavg

# 进程分析
ps aux
ps -ef
pstree

# 系统资源使用
sar -u 1 3
sar -r 1 3
sar -b 1 3
```

## CPU优化

### CPU调度优化
```bash
# 查看CPU信息
lscpu
cat /proc/cpuinfo

# 调整CPU调度策略
echo performance > /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 设置CPU亲和性
taskset -pc 0,1 pid
```

### 进程优先级
```bash
# 调整进程优先级
nice -n -10 command
renice -n -10 -p pid

# 实时进程调度
chrt -f 99 command
chrt -p pid
```

## 内存优化

### 内存管理
```bash
# 查看内存使用
free -m
cat /proc/meminfo

# 清理缓存
sync; echo 3 > /proc/sys/vm/drop_caches

# 调整swap使用
swapon -s
swapon /swapfile
swapoff /swapfile
```

### 内存参数调优
```bash
# 调整内核参数
sysctl -w vm.swappiness=10
sysctl -w vm.vfs_cache_pressure=50

# 永久生效
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
sysctl -p
```

## 磁盘优化

### 文件系统优化
```bash
# 文件系统检查
fsck -f /dev/sda1
e2fsck -f /dev/sda1

# 调整文件系统参数
tune2fs -m 1 /dev/sda1
tune2fs -o journal_data_writeback /dev/sda1
```

### IO调度优化
```bash
# 查看当前IO调度器
cat /sys/block/sda/queue/scheduler

# 修改IO调度器
echo deadline > /sys/block/sda/queue/scheduler
echo "elevator=deadline" >> /etc/default/grub
```

## 网络优化

### 网络参数调优
```bash
# 调整网络参数
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sysctl -w net.core.netdev_max_backlog=65535

# 永久生效
echo "net.core.somaxconn=65535" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog=65535" >> /etc/sysctl.conf
echo "net.core.netdev_max_backlog=65535" >> /etc/sysctl.conf
sysctl -p
```

### 网络缓冲区优化
```bash
# 调整TCP缓冲区
sysctl -w net.ipv4.tcp_rmem="4096 87380 16777216"
sysctl -w net.ipv4.tcp_wmem="4096 87380 16777216"

# 调整网络接口缓冲区
ifconfig eth0 txqueuelen 10000
```

## 应用优化

### Web服务器优化
```bash
# Nginx优化
worker_processes auto;
worker_rlimit_nofile 65535;
events {
    worker_connections 65535;
    multi_accept on;
    use epoll;
}

# Apache优化
MaxClients 150
MaxRequestsPerChild 10000
```

### 数据库优化
```bash
# MySQL优化
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# PostgreSQL优化
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
```

## 系统调优

### 内核参数优化
```bash
# 系统限制
ulimit -n 65535
ulimit -u 65535

# 内核参数
sysctl -w fs.file-max=65535
sysctl -w kernel.pid_max=65535
```

### 系统服务优化
```bash
# 禁用不必要的服务
systemctl disable bluetooth
systemctl disable cups
systemctl disable avahi-daemon

# 优化服务启动
systemctl enable --now tuned
tuned-adm profile throughput-performance
```

## 性能测试

### 基准测试
```bash
# CPU测试
sysbench cpu --cpu-max-prime=20000 run

# 内存测试
sysbench memory --memory-block-size=1K --memory-total-size=10G run

# 磁盘测试
sysbench fileio --file-total-size=10G prepare
sysbench fileio --file-total-size=10G --file-test-mode=rndrw run
```

### 压力测试
```bash
# 使用stress进行压力测试
stress --cpu 4 --io 2 --vm 2 --vm-bytes 128M --timeout 60s

# 使用ab进行Web压力测试
ab -n 1000 -c 100 http://localhost/
```

## 监控工具

### 系统监控
```bash
# 安装监控工具
apt install sysstat iotop htop iftop

# 配置sar数据收集
systemctl enable sysstat
systemctl start sysstat
```

### 日志分析
```bash
# 分析系统日志
journalctl -f
tail -f /var/log/syslog

# 使用logwatch
logwatch --detail High
```

## 最佳实践

### 性能优化建议
1. 定期监控系统性能
2. 及时更新系统和应用
3. 合理配置系统参数
4. 优化应用程序代码
5. 使用性能分析工具

### 资源管理
1. 合理分配系统资源
2. 设置资源使用限制
3. 监控资源使用情况
4. 及时处理资源瓶颈
5. 优化资源调度策略

### 维护建议
1. 定期清理系统垃圾
2. 优化文件系统
3. 更新系统补丁
4. 检查系统日志
5. 备份重要数据 