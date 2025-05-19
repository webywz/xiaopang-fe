# Linux容器技术

## Docker基础

### 安装与配置
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 配置Docker服务
systemctl enable docker
systemctl start docker

# 配置镜像加速
cat > /etc/docker/daemon.json << EOF
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
EOF
```

### 基本操作
```bash
# 镜像管理
docker pull nginx:latest
docker images
docker rmi nginx:latest

# 容器管理
docker run -d -p 80:80 nginx
docker ps
docker stop container_id
docker rm container_id
```

## Docker进阶

### 镜像构建
```dockerfile
# Dockerfile示例
FROM ubuntu:20.04
LABEL maintainer="your-email@example.com"

RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 网络配置
```bash
# 创建网络
docker network create my-network

# 连接容器到网络
docker run --network my-network -d nginx
docker network connect my-network container_id

# 查看网络信息
docker network inspect my-network
```

### 数据管理
```bash
# 创建数据卷
docker volume create my-volume

# 使用数据卷
docker run -v my-volume:/data -d nginx

# 备份数据卷
docker run --rm -v my-volume:/source -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz /source
```

## Docker Compose

### 基本使用
```yaml
# docker-compose.yml示例
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - db
  
  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: example
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

### 常用命令
```bash
# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f
```

## Kubernetes基础

### 安装与配置
```bash
# 安装kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# 配置kubeconfig
mkdir -p ~/.kube
cp kubeconfig ~/.kube/config
```

### 基本概念
```yaml
# Pod示例
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
```

### 资源管理
```yaml
# Deployment示例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
```

## 容器编排

### 服务发现
```yaml
# Service示例
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 配置管理
```yaml
# ConfigMap示例
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  nginx.conf: |
    server {
      listen 80;
      server_name localhost;
      location / {
        root /usr/share/nginx/html;
        index index.html;
      }
    }
```

### 存储管理
```yaml
# PersistentVolume示例
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nginx-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/nginx
```

## 容器安全

### 安全配置
```bash
# 启用安全特性
docker run --security-opt=no-new-privileges \
           --cap-drop=ALL \
           --cap-add=NET_BIND_SERVICE \
           -d nginx

# 资源限制
docker run --memory=512m \
           --cpus=0.5 \
           -d nginx
```

### 镜像安全
```bash
# 扫描镜像
docker scan nginx:latest

# 签名镜像
docker trust sign nginx:latest

# 验证镜像
docker trust inspect nginx:latest
```

## 监控与日志

### 容器监控
```bash
# 使用cAdvisor
docker run -d \
  --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor:latest
```

### 日志管理
```bash
# 配置日志驱动
docker run --log-driver=json-file \
           --log-opt max-size=10m \
           --log-opt max-file=3 \
           -d nginx

# 查看容器日志
docker logs -f container_id
```

## 最佳实践

### 容器化建议
1. 使用官方基础镜像
2. 多阶段构建
3. 最小化镜像大小
4. 合理使用缓存
5. 遵循安全最佳实践

### 编排建议
1. 合理规划资源
2. 使用健康检查
3. 配置自动扩缩容
4. 实现服务发现
5. 做好监控告警

### 运维建议
1. 定期更新镜像
2. 备份重要数据
3. 监控容器状态
4. 记录操作日志
5. 制定应急预案 