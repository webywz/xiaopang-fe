# Linux监控与日志

## 系统监控

### 基础监控命令
```bash
# CPU监控
top
htop
mpstat -P ALL 1
vmstat 1

# 内存监控
free -h
vmstat 1
cat /proc/meminfo

# 磁盘监控
df -h
iostat -x 1
iotop

# 网络监控
netstat -tunlp
iftop
nethogs
```

### 进程监控
```bash
# 进程状态
ps aux
ps -ef
pstree

# 进程资源使用
pidstat 1
pidstat -d 1
pidstat -r 1

# 进程跟踪
strace -p <pid>
ltrace -p <pid>
```

## 监控工具

### Prometheus

#### 安装配置
```bash
# 下载Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.30.0/prometheus-2.30.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# 配置Prometheus
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
EOF

# 启动Prometheus
./prometheus --config.file=prometheus.yml
```

#### 监控指标
```yaml
# 常用监控指标
- node_cpu_seconds_total
- node_memory_MemTotal_bytes
- node_filesystem_size_bytes
- node_network_receive_bytes_total
- node_network_transmit_bytes_total
```

### Grafana

#### 安装配置
```bash
# 安装Grafana
wget https://dl.grafana.com/oss/release/grafana_8.2.0_amd64.deb
sudo dpkg -i grafana_8.2.0_amd64.deb

# 启动服务
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

#### 仪表板配置
```json
{
  "dashboard": {
    "id": null,
    "title": "Linux系统监控",
    "panels": [
      {
        "title": "CPU使用率",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
          }
        ]
      }
    ]
  }
}
```

## 日志管理

### 系统日志

#### 日志文件
```bash
# 系统日志
/var/log/syslog
/var/log/messages
/var/log/auth.log
/var/log/kern.log

# 应用日志
/var/log/nginx/access.log
/var/log/nginx/error.log
/var/log/mysql/error.log
```

#### 日志轮转
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

### ELK Stack

#### Elasticsearch配置
```yaml
# elasticsearch.yml
cluster.name: my-cluster
node.name: node-1
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
```

#### Logstash配置
```ruby
# logstash.conf
input {
  file {
    path => "/var/log/nginx/access.log"
    type => "nginx-access"
  }
}

filter {
  if [type] == "nginx-access" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "nginx-logs-%{+YYYY.MM.dd}"
  }
}
```

#### Kibana配置
```yaml
# kibana.yml
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://localhost:9200"]
```

## 告警系统

### Prometheus告警

#### 告警规则
```yaml
# alert.rules
groups:
- name: example
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for 5 minutes"
```

#### 告警通知
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email-notifications'

receivers:
- name: 'email-notifications'
  email_configs:
  - to: 'admin@example.com'
    from: 'alertmanager@example.com'
    smarthost: 'smtp.example.com:587'
```

## 性能分析

### 性能工具
```bash
# 系统性能
perf stat
perf record
perf report

# 内存分析
valgrind --tool=memcheck
valgrind --tool=massif

# 系统调用分析
strace -c
ltrace -c
```

### 性能优化
```bash
# 系统调优
sysctl -w vm.swappiness=10
sysctl -w vm.dirty_ratio=60
sysctl -w vm.dirty_background_ratio=2

# 文件系统优化
tune2fs -o journal_data_writeback /dev/sda1
```

## 最佳实践

### 监控建议
1. 设置合理的监控指标
2. 配置适当的告警阈值
3. 定期检查监控系统
4. 保持监控数据备份
5. 优化监控性能

### 日志建议
1. 统一日志格式
2. 合理设置日志级别
3. 定期清理旧日志
4. 保护敏感日志信息
5. 建立日志分析流程

### 告警建议
1. 避免告警风暴
2. 设置告警升级机制
3. 定期测试告警系统
4. 记录告警处理流程
5. 分析告警趋势 