# Linux系统管理

## 进程管理

### 进程基础
```bash
# 查看所有进程
ps aux

# 查看特定进程
ps aux | grep process_name

# 实时查看进程
top
htop
```

### 进程控制
```bash
# 启动进程
./program &

# 后台运行
nohup command &

# 终止进程
kill PID
killall process_name

# 强制终止
kill -9 PID
```

### 进程优先级
```bash
# 设置优先级
nice -n 10 command

# 修改运行中进程优先级
renice -n 10 -p PID
```

## 内存管理

### 内存监控
```bash
# 查看内存使用
free -h

# 详细内存信息
cat /proc/meminfo

# 内存使用率
vmstat 1
```

### 内存优化
```bash
# 清理缓存
sync; echo 3 > /proc/sys/vm/drop_caches

# 调整交换空间
swapon /swapfile
swapoff /swapfile
```

## 磁盘管理

### 磁盘信息
```bash
# 查看磁盘使用
df -h

# 查看目录大小
du -sh /path

# 查看磁盘信息
fdisk -l
lsblk
```

### 磁盘操作
```bash
# 创建分区
fdisk /dev/sdX

# 格式化分区
mkfs.ext4 /dev/sdX1

# 挂载分区
mount /dev/sdX1 /mnt

# 自动挂载
vim /etc/fstab
```

### LVM管理
```bash
# 创建物理卷
pvcreate /dev/sdX

# 创建卷组
vgcreate vg_name /dev/sdX

# 创建逻辑卷
lvcreate -L 10G -n lv_name vg_name

# 扩展逻辑卷
lvextend -L +5G /dev/vg_name/lv_name
```

## 用户和权限管理

### 用户管理
```bash
# 创建用户
useradd -m username

# 设置密码
passwd username

# 修改用户信息
usermod -c "Full Name" username

# 删除用户
userdel -r username
```

### 组管理
```bash
# 创建组
groupadd groupname

# 添加用户到组
usermod -aG groupname username

# 删除组
groupdel groupname
```

### 权限管理
```bash
# 修改权限
chmod 755 file
chmod u+x file

# 修改所有者
chown user:group file

# 递归修改
chmod -R 755 directory
chown -R user:group directory
```

## 服务管理

### systemd服务
```bash
# 启动服务
systemctl start service

# 停止服务
systemctl stop service

# 重启服务
systemctl restart service

# 查看状态
systemctl status service

# 设置开机启动
systemctl enable service
```

### 服务配置
```bash
# 编辑服务配置
systemctl edit service

# 重载配置
systemctl daemon-reload

# 查看服务日志
journalctl -u service
```

## 系统监控

### 系统状态
```bash
# 系统负载
uptime

# CPU信息
lscpu
cat /proc/cpuinfo

# 内存使用
free -h

# 磁盘使用
df -h
```

### 性能监控
```bash
# 实时监控
top
htop

# IO监控
iostat -x 1

# 网络监控
iftop
nethogs
```

### 日志管理
```bash
# 系统日志
journalctl

# 查看特定日志
tail -f /var/log/syslog

# 日志轮转
logrotate -d /etc/logrotate.conf
```

## 备份与恢复

### 文件备份
```bash
# 创建备份
tar -czf backup.tar.gz /path

# 恢复备份
tar -xzf backup.tar.gz

# 增量备份
rsync -avz source/ destination/
```

### 系统备份
```bash
# 创建系统镜像
dd if=/dev/sdX of=system.img bs=4M

# 恢复系统镜像
dd if=system.img of=/dev/sdX bs=4M
```

## 系统维护

### 系统更新
```bash
# Debian/Ubuntu
apt update
apt upgrade

# Red Hat/CentOS
yum update
```

### 系统清理
```bash
# 清理包缓存
apt clean
yum clean all

# 清理日志
find /var/log -type f -name "*.log" -exec truncate -s 0 {} \;
```

### 系统优化
```bash
# 调整内核参数
sysctl -w parameter=value

# 永久修改
echo "parameter=value" >> /etc/sysctl.conf
sysctl -p
```

## 故障排除

### 系统启动问题
```bash
# 查看启动日志
dmesg
journalctl -b

# 修复文件系统
fsck /dev/sdX
```

### 性能问题
```bash
# 查看系统负载
top
htop

# 查看IO等待
iostat -x 1

# 查看网络连接
netstat -tuln
```

### 日志分析
```bash
# 查看错误日志
grep ERROR /var/log/syslog

# 查看特定时间日志
journalctl --since "2024-01-01" --until "2024-01-02"
```

## 安全加固

### 系统安全
```bash
# 更新安全补丁
apt update && apt upgrade
yum update

# 检查开放端口
netstat -tuln
```

### 防火墙配置
```bash
# 查看防火墙状态
ufw status
firewall-cmd --list-all

# 配置防火墙规则
ufw allow 22/tcp
firewall-cmd --permanent --add-port=22/tcp
```

### 安全审计
```bash
# 检查系统日志
ausearch -i

# 查看登录记录
last
lastb

# 检查文件完整性
aide --check
``` 