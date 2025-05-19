# Linux网络管理

## 网络基础

### 网络模型
- OSI七层模型
- TCP/IP四层模型
- 网络协议栈

### 网络接口
```bash
# 查看网络接口
ip addr
ifconfig

# 查看网络接口状态
ip link show
ethtool eth0
```

### 网络配置
```bash
# 临时配置IP
ip addr add 192.168.1.100/24 dev eth0

# 永久配置（Debian/Ubuntu）
vim /etc/network/interfaces

# 永久配置（Red Hat/CentOS）
vim /etc/sysconfig/network-scripts/ifcfg-eth0
```

## 网络工具

### 基本工具
```bash
# 测试连通性
ping host
ping6 host

# 路由跟踪
traceroute host
mtr host

# DNS查询
nslookup domain
dig domain
host domain
```

### 网络诊断
```bash
# 查看网络连接
netstat -tuln
ss -tuln

# 查看路由表
route -n
ip route show

# 查看ARP表
arp -n
ip neigh show
```

### 网络监控
```bash
# 实时监控
iftop
nethogs

# 带宽测试
iperf3 -s
iperf3 -c server
```

## 网络服务

### DHCP服务
```bash
# 安装DHCP服务器
apt install isc-dhcp-server
yum install dhcp

# 配置DHCP
vim /etc/dhcp/dhcpd.conf

# 启动服务
systemctl start isc-dhcp-server
```

### DNS服务
```bash
# 安装DNS服务器
apt install bind9
yum install bind

# 配置DNS
vim /etc/bind/named.conf

# 启动服务
systemctl start named
```

### Web服务器
```bash
# 安装Apache
apt install apache2
yum install httpd

# 安装Nginx
apt install nginx
yum install nginx

# 配置服务
vim /etc/apache2/apache2.conf
vim /etc/nginx/nginx.conf
```

## 网络安全

### 防火墙配置
```bash
# iptables基本操作
iptables -L
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 保存规则
iptables-save > /etc/iptables/rules.v4
```

### 安全工具
```bash
# 端口扫描
nmap localhost
nmap -p 1-1000 target

# 网络抓包
tcpdump -i eth0
tcpdump -i eth0 port 80

# 网络监控
wireshark
```

## 网络优化

### 性能调优
```bash
# 调整内核参数
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535

# 永久修改
echo "net.core.somaxconn=65535" >> /etc/sysctl.conf
sysctl -p
```

### 带宽控制
```bash
# 使用tc进行流量控制
tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# 使用iptables限制连接数
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
```

## 网络故障排除

### 常见问题
1. 网络连接失败
2. DNS解析问题
3. 路由问题
4. 防火墙阻止

### 故障诊断
```bash
# 检查网络接口
ip link show
ethtool eth0

# 检查DNS解析
dig @8.8.8.8 domain
nslookup domain

# 检查路由
traceroute host
mtr host

# 检查防火墙
iptables -L
ufw status
```

## 网络监控

### 系统监控
```bash
# 查看网络统计
netstat -s
ss -s

# 查看网络接口统计
ip -s link show eth0
```

### 日志分析
```bash
# 查看系统日志
journalctl -u NetworkManager
tail -f /var/log/syslog

# 分析网络日志
grep "network" /var/log/syslog
```

## 网络配置示例

### 静态IP配置
```bash
# Debian/Ubuntu
auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4

# Red Hat/CentOS
TYPE=Ethernet
BOOTPROTO=static
IPADDR=192.168.1.100
NETMASK=255.255.255.0
GATEWAY=192.168.1.1
DNS1=8.8.8.8
DNS2=8.8.4.4
```

### 网络服务配置
```bash
# Apache虚拟主机
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/html
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# Nginx虚拟主机
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 最佳实践

### 安全建议
1. 及时更新系统补丁
2. 配置防火墙规则
3. 使用强密码
4. 限制远程访问
5. 监控网络流量

### 性能优化
1. 调整内核参数
2. 优化网络配置
3. 使用合适的MTU值
4. 配置适当的缓冲区大小

### 维护建议
1. 定期检查日志
2. 监控网络性能
3. 备份配置文件
4. 制定应急预案 