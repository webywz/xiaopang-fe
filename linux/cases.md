# Linux实战案例

## 系统部署案例

### 高可用Web服务器集群
```bash
# 负载均衡配置（Nginx）
cat > /etc/nginx/nginx.conf << EOF
http {
    upstream backend {
        server 192.168.1.10:80;
        server 192.168.1.11:80;
        server 192.168.1.12:80;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

# 配置Keepalived
cat > /etc/keepalived/keepalived.conf << EOF
vrrp_script check_nginx {
    script "pidof nginx"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.1.100
    }
    track_script {
        check_nginx
    }
}
EOF
```

### 数据库主从复制
```bash
# MySQL主库配置
cat > /etc/mysql/mysql.conf.d/mysqld.cnf << EOF
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_do_db = mydb
EOF

# MySQL从库配置
cat > /etc/mysql/mysql.conf.d/mysqld.cnf << EOF
[mysqld]
server-id = 2
relay_log = /var/log/mysql/mysql-relay-bin.log
read_only = 1
EOF

# 配置主从复制
mysql -u root -p << EOF
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
EOF

mysql -u root -p << EOF
CHANGE MASTER TO
    MASTER_HOST='192.168.1.10',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=0;
START SLAVE;
EOF
```

## 性能优化案例

### Web服务器优化
```bash
# Nginx性能优化
cat > /etc/nginx/nginx.conf << EOF
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# PHP-FPM优化
cat > /etc/php/7.4/fpm/pool.d/www.conf << EOF
[www]
user = www-data
group = www-data
listen = /run/php/php7.4-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
EOF
```

### 数据库优化
```bash
# MySQL优化配置
cat > /etc/mysql/mysql.conf.d/mysqld.cnf << EOF
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_thread_concurrency = 0
max_connections = 1000
thread_cache_size = 128
query_cache_size = 128M
query_cache_limit = 2M
EOF
```

## 安全加固案例

### 系统安全加固
```bash
# 系统安全配置
cat > /etc/sysctl.conf << EOF
# 禁用IP转发
net.ipv4.ip_forward = 0

# 启用SYN洪水保护
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# 启用源地址验证
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# 禁用ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
EOF

# 应用安全配置
cat > /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF
```

### 防火墙配置
```bash
# iptables防火墙规则
cat > /etc/iptables/rules.v4 << EOF
*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]

# 允许已建立的连接
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许本地回环接口
-A INPUT -i lo -j ACCEPT

# 允许SSH连接
-A INPUT -p tcp --dport 22 -j ACCEPT

# 允许HTTP/HTTPS
-A INPUT -p tcp --dport 80 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT

# 允许DNS查询
-A INPUT -p udp --dport 53 -j ACCEPT

# 记录被拒绝的连接
-A INPUT -j LOG --log-prefix "IPTables-Dropped: " --log-level 4

COMMIT
EOF
```

## 自动化运维案例

### 自动化部署脚本
```bash
#!/bin/bash
# deploy.sh

# 配置变量
APP_NAME="myapp"
DEPLOY_PATH="/var/www/$APP_NAME"
BACKUP_PATH="/var/backups/$APP_NAME"
REPO_URL="git@github.com:user/$APP_NAME.git"

# 创建备份
backup() {
    echo "Creating backup..."
    tar -czf "$BACKUP_PATH/$(date +%Y%m%d_%H%M%S).tar.gz" "$DEPLOY_PATH"
}

# 拉取代码
pull_code() {
    echo "Pulling latest code..."
    cd "$DEPLOY_PATH"
    git pull origin master
}

# 安装依赖
install_deps() {
    echo "Installing dependencies..."
    cd "$DEPLOY_PATH"
    npm install
    composer install
}

# 构建应用
build_app() {
    echo "Building application..."
    cd "$DEPLOY_PATH"
    npm run build
}

# 重启服务
restart_services() {
    echo "Restarting services..."
    systemctl restart nginx
    systemctl restart php7.4-fpm
}

# 主函数
main() {
    backup
    pull_code
    install_deps
    build_app
    restart_services
    echo "Deployment completed successfully!"
}

main
```

### 监控告警脚本
```bash
#!/bin/bash
# monitor.sh

# 配置变量
ALERT_EMAIL="admin@example.com"
THRESHOLD_CPU=80
THRESHOLD_MEMORY=80
THRESHOLD_DISK=80

# 检查CPU使用率
check_cpu() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
    if [ $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc) -eq 1 ]; then
        echo "High CPU usage: $CPU_USAGE%" | mail -s "CPU Alert" $ALERT_EMAIL
    fi
}

# 检查内存使用率
check_memory() {
    MEMORY_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    if [ $(echo "$MEMORY_USAGE > $THRESHOLD_MEMORY" | bc) -eq 1 ]; then
        echo "High memory usage: $MEMORY_USAGE%" | mail -s "Memory Alert" $ALERT_EMAIL
    fi
}

# 检查磁盘使用率
check_disk() {
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt $THRESHOLD_DISK ]; then
        echo "High disk usage: $DISK_USAGE%" | mail -s "Disk Alert" $ALERT_EMAIL
    fi
}

# 主函数
main() {
    check_cpu
    check_memory
    check_disk
}

main
```

## 容器化部署案例

### Docker Compose配置
```yaml
# docker-compose.yml
version: '3'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./www:/var/www/html
    depends_on:
      - php
      - mysql

  php:
    image: php:7.4-fpm
    volumes:
      - ./www:/var/www/html
    depends_on:
      - mysql

  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: myapp
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Kubernetes部署配置
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## 日志分析案例

### ELK日志分析系统
```bash
# Elasticsearch配置
cat > /etc/elasticsearch/elasticsearch.yml << EOF
cluster.name: my-cluster
node.name: node-1
network.host: 0.0.0.0
http.port: 9200
discovery.zen.ping.unicast.hosts: ["192.168.1.10", "192.168.1.11"]
EOF

# Logstash配置
cat > /etc/logstash/conf.d/nginx.conf << EOF
input {
  file {
    path => "/var/log/nginx/access.log"
    type => "nginx-access"
    start_position => "beginning"
  }
}

filter {
  if [type] == "nginx-access" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "nginx-logs-%{+YYYY.MM.dd}"
  }
}
EOF

# Kibana配置
cat > /etc/kibana/kibana.yml << EOF
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://localhost:9200"]
EOF
```

### 日志轮转配置
```bash
# 配置logrotate
cat > /etc/logrotate.d/nginx << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
EOF
```

## 备份恢复案例

### 数据库备份脚本
```bash
#!/bin/bash
# backup_mysql.sh

# 配置变量
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_USER="root"
MYSQL_PASSWORD="password"
DATABASES="db1 db2 db3"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
for DB in $DATABASES
do
    echo "Backing up $DB..."
    mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD --single-transaction --routines --triggers --events $DB | gzip > $BACKUP_DIR/${DB}_${DATE}.sql.gz
done

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 文件系统备份
```bash
#!/bin/bash
# backup_files.sh

# 配置变量
BACKUP_DIR="/var/backups/files"
SOURCE_DIR="/var/www"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
tar -czf $BACKUP_DIR/www_$DATE.tar.gz $SOURCE_DIR

# 同步到远程服务器
rsync -avz $BACKUP_DIR/ backup_user@backup_server:/backups/

# 清理旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## 故障处理案例

### 系统资源耗尽处理
```bash
#!/bin/bash
# handle_resource_exhaustion.sh

# 检查系统资源
check_resources() {
    # CPU使用率
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
    
    # 内存使用率
    MEMORY_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    
    # 磁盘使用率
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    # 检查进程数
    PROCESS_COUNT=$(ps aux | wc -l)
    
    # 记录到日志
    echo "$(date) - CPU: $CPU_USAGE%, Memory: $MEMORY_USAGE%, Disk: $DISK_USAGE%, Processes: $PROCESS_COUNT" >> /var/log/system_resources.log
}

# 清理临时文件
cleanup_temp() {
    find /tmp -type f -mtime +7 -delete
    find /var/tmp -type f -mtime +7 -delete
}

# 清理日志文件
cleanup_logs() {
    find /var/log -type f -name "*.gz" -delete
    find /var/log -type f -name "*.old" -delete
}

# 主函数
main() {
    check_resources
    cleanup_temp
    cleanup_logs
}

main
```

### 网络故障诊断
```bash
#!/bin/bash
# network_diagnosis.sh

# 检查网络连接
check_connectivity() {
    # 测试DNS解析
    nslookup google.com
    
    # 测试网络连通性
    ping -c 4 8.8.8.8
    
    # 检查路由
    traceroute 8.8.8.8
    
    # 检查网络接口
    ip addr show
    
    # 检查路由表
    ip route show
}

# 检查网络服务
check_services() {
    # 检查SSH服务
    systemctl status ssh
    
    # 检查Web服务
    systemctl status nginx
    
    # 检查防火墙状态
    iptables -L
    
    # 检查端口监听
    netstat -tulpn
}

# 收集网络日志
collect_logs() {
    # 系统日志
    journalctl -u NetworkManager
    
    # 防火墙日志
    tail -n 100 /var/log/iptables.log
    
    # DNS日志
    tail -n 100 /var/log/named/named.log
}

# 主函数
main() {
    echo "开始网络诊断..."
    check_connectivity
    check_services
    collect_logs
    echo "网络诊断完成"
}

main
```

## 性能调优案例

### 系统调优脚本
```bash
#!/bin/bash
# system_tuning.sh

# 调整系统参数
tune_system() {
    # 调整文件描述符限制
    echo "* soft nofile 65535" >> /etc/security/limits.conf
    echo "* hard nofile 65535" >> /etc/security/limits.conf
    
    # 调整内核参数
    cat > /etc/sysctl.d/99-sysctl.conf << EOF
# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 65535

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2

# 文件系统优化
fs.file-max = 65535
fs.aio-max-nr = 1048576
EOF
    
    # 应用内核参数
    sysctl -p /etc/sysctl.d/99-sysctl.conf
}

# 调整磁盘I/O调度器
tune_disk_io() {
    for disk in /sys/block/sd*/queue/scheduler; do
        echo "deadline" > $disk
    done
}

# 主函数
main() {
    tune_system
    tune_disk_io
    echo "系统调优完成"
}

main
```

## 最佳实践总结

### 部署建议
1. 使用版本控制管理配置
2. 实施自动化部署流程
3. 保持环境一致性
4. 做好备份和回滚机制
5. 监控部署过程

### 优化建议
1. 定期性能评估
2. 根据负载调整配置
3. 优化资源使用
4. 实施缓存策略
5. 监控性能指标

### 安全建议
1. 定期安全审计
2. 及时更新补丁
3. 实施最小权限原则
4. 加密敏感数据
5. 记录安全事件

### 运维建议
1. 建立标准操作流程
2. 保持文档更新
3. 定期系统维护
4. 做好应急预案
5. 持续改进流程

### 监控建议
1. 实施全面的监控系统
2. 设置合理的告警阈值
3. 建立监控仪表板
4. 定期检查监控数据
5. 及时响应告警信息

### 日志管理建议
1. 统一日志格式
2. 实施日志轮转
3. 集中化日志存储
4. 建立日志分析系统
5. 定期审计日志

### 备份策略建议
1. 制定备份计划
2. 实施增量备份
3. 定期测试恢复
4. 异地备份存储
5. 加密备份数据

### 故障处理建议
1. 建立故障响应流程
2. 准备应急预案
3. 保持故障记录
4. 定期演练
5. 持续改进流程 