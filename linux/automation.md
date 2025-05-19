# Linux自动化运维

## Ansible基础

### 安装与配置
```bash
# 安装Ansible
pip install ansible

# 创建配置文件
mkdir -p /etc/ansible
cat > /etc/ansible/ansible.cfg << EOF
[defaults]
inventory = /etc/ansible/hosts
remote_user = root
host_key_checking = False
EOF

# 配置主机清单
cat > /etc/ansible/hosts << EOF
[webservers]
web1 ansible_host=192.168.1.101
web2 ansible_host=192.168.1.102

[dbservers]
db1 ansible_host=192.168.1.201
db2 ansible_host=192.168.1.202
EOF
```

### 基本使用
```bash
# 测试连接
ansible all -m ping

# 执行命令
ansible webservers -m shell -a "uptime"

# 复制文件
ansible webservers -m copy -a "src=/etc/hosts dest=/etc/hosts"
```

## Ansible Playbook

### 基本语法
```yaml
# playbook示例
---
- name: 配置Web服务器
  hosts: webservers
  become: yes
  tasks:
    - name: 安装Nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: 启动Nginx服务
      service:
        name: nginx
        state: started
        enabled: yes

    - name: 配置防火墙
      ufw:
        rule: allow
        port: 80
        proto: tcp
```

### 变量使用
```yaml
# 变量定义
---
- name: 使用变量
  hosts: webservers
  vars:
    http_port: 80
    max_clients: 200
  tasks:
    - name: 创建配置文件
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
```

### 条件判断
```yaml
# 条件示例
---
- name: 条件判断
  hosts: all
  tasks:
    - name: 安装Apache
      apt:
        name: apache2
        state: present
      when: ansible_os_family == "Debian"

    - name: 安装httpd
      yum:
        name: httpd
        state: present
      when: ansible_os_family == "RedHat"
```

## 自动化部署

### 应用部署
```yaml
# 部署Playbook
---
- name: 部署Web应用
  hosts: webservers
  tasks:
    - name: 拉取代码
      git:
        repo: https://github.com/example/app.git
        dest: /var/www/app
        version: master

    - name: 安装依赖
      pip:
        requirements: /var/www/app/requirements.txt
        state: present

    - name: 配置服务
      template:
        src: templates/app.service.j2
        dest: /etc/systemd/system/app.service

    - name: 启动服务
      systemd:
        name: app
        state: started
        enabled: yes
```

### 数据库部署
```yaml
# 数据库Playbook
---
- name: 配置MySQL
  hosts: dbservers
  tasks:
    - name: 安装MySQL
      apt:
        name: mysql-server
        state: present

    - name: 配置MySQL
      template:
        src: templates/my.cnf.j2
        dest: /etc/mysql/my.cnf

    - name: 创建数据库
      mysql_db:
        name: app_db
        state: present

    - name: 创建用户
      mysql_user:
        name: app_user
        password: "{{ db_password }}"
        priv: "app_db.*:ALL"
        host: "%"
        state: present
```

## 配置管理

### 系统配置
```yaml
# 系统配置Playbook
---
- name: 系统配置
  hosts: all
  tasks:
    - name: 更新系统
      apt:
        update_cache: yes
        upgrade: yes
      when: ansible_os_family == "Debian"

    - name: 配置时区
      timezone:
        name: Asia/Shanghai

    - name: 配置NTP
      apt:
        name: ntp
        state: present
      when: ansible_os_family == "Debian"

    - name: 启动NTP服务
      service:
        name: ntp
        state: started
        enabled: yes
```

### 安全配置
```yaml
# 安全配置Playbook
---
- name: 安全加固
  hosts: all
  tasks:
    - name: 配置SSH
      template:
        src: templates/sshd_config.j2
        dest: /etc/ssh/sshd_config
      notify: restart ssh

    - name: 配置防火墙
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      with_items:
        - 22
        - 80
        - 443

    - name: 安装安全更新
      apt:
        name: "*"
        state: latest
        update_cache: yes
      when: ansible_os_family == "Debian"
```

## 监控自动化

### 监控配置
```yaml
# 监控配置Playbook
---
- name: 配置监控
  hosts: all
  tasks:
    - name: 安装Node Exporter
      get_url:
        url: https://github.com/prometheus/node_exporter/releases/download/v1.0.1/node_exporter-1.0.1.linux-amd64.tar.gz
        dest: /tmp/node_exporter.tar.gz

    - name: 解压Node Exporter
      unarchive:
        src: /tmp/node_exporter.tar.gz
        dest: /opt
        remote_src: yes

    - name: 配置Node Exporter服务
      template:
        src: templates/node_exporter.service.j2
        dest: /etc/systemd/system/node_exporter.service

    - name: 启动Node Exporter
      systemd:
        name: node_exporter
        state: started
        enabled: yes
```

### 日志配置
```yaml
# 日志配置Playbook
---
- name: 配置日志
  hosts: all
  tasks:
    - name: 安装Filebeat
      apt:
        name: filebeat
        state: present
      when: ansible_os_family == "Debian"

    - name: 配置Filebeat
      template:
        src: templates/filebeat.yml.j2
        dest: /etc/filebeat/filebeat.yml

    - name: 启动Filebeat
      service:
        name: filebeat
        state: started
        enabled: yes
```

## 最佳实践

### 自动化建议
1. 使用版本控制
2. 模块化设计
3. 变量管理
4. 错误处理
5. 文档维护

### 安全建议
1. 使用Vault加密敏感数据
2. 最小权限原则
3. 定期更新
4. 审计日志
5. 备份策略

### 维护建议
1. 定期测试
2. 监控告警
3. 故障演练
4. 文档更新
5. 团队协作 