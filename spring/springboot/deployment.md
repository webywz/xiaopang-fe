---
title: 部署
---

/**
 * SpringBoot 部署
 * @description 深入讲解 SpringBoot 项目的打包、传统服务器部署、Nginx 反向代理、Docker 容器化、K8s 云原生、CI/CD 自动化、配置安全、日志与监控、常见问题与最佳实践、FAQ
 */

# 部署

SpringBoot 支持多种部署方式，适合本地开发、测试、生产、云原生等多场景。

## 1. JAR/WAR 打包与运行

### JAR 打包
- 默认打包为可执行 JAR，内嵌 Tomcat/Jetty/Undertow
- 命令：
  ```bash
  mvn clean package
  java -jar target/demo-0.0.1-SNAPSHOT.jar
  ```
- 支持 `application.yml`、`application-prod.yml` 等外部配置

### WAR 打包
- 适合传统 Servlet 容器（如 Tomcat、WebLogic）
- pom.xml 配置：
  ```xml
  <packaging>war</packaging>
  ```
- 主类继承 `SpringBootServletInitializer`
- 部署到 webapps 目录

## 2. 传统服务器部署
- 购买云服务器（如阿里云、腾讯云、AWS）
- 安装 JDK、配置环境变量
- 上传 JAR 包，后台运行：
  ```bash
  nohup java -jar app.jar --spring.profiles.active=prod > app.log 2>&1 &
  ```
- 配置防火墙、开放端口
- 日志分离与轮转（logrotate）

## 3. Nginx 反向代理与负载均衡
- 推荐前置 Nginx，做反向代理、SSL 终端、负载均衡
- 配置示例：
  ```nginx
  server {
    listen 80;
    server_name blog.66688.store;
    location / {
      proxy_pass http://127.0.0.1:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
  ```
- 支持 HTTPS，推荐使用 Let's Encrypt 免费证书

## 4. Docker 容器化部署

### Dockerfile 示例
```dockerfile
FROM openjdk:17-jdk-alpine
VOLUME /tmp
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

### 构建与运行
```bash
# 构建镜像
docker build -t my-springboot-app .
# 运行容器
docker run -d -p 8080:8080 --name springboot-demo my-springboot-app
```

### 配置挂载与环境变量
- 推荐用 `-v` 挂载配置文件，用 `-e` 注入环境变量
- 支持多实例部署、灰度发布

## 5. Kubernetes（K8s）云原生部署
- 推荐用 K8s 管理大规模微服务
- 编写 Deployment、Service、ConfigMap、Secret、Ingress 等 YAML
- 支持自动扩缩容、滚动升级、健康检查
- 示例：
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: springboot-demo
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: springboot-demo
    template:
      metadata:
        labels:
          app: springboot-demo
      spec:
        containers:
        - name: app
          image: my-springboot-app:latest
          ports:
          - containerPort: 8080
          env:
          - name: SPRING_PROFILES_ACTIVE
            value: prod
  ```
- 推荐配合 Helm、Kustomize 管理多环境

## 6. CI/CD 自动化部署
- 推荐 GitHub Actions、Jenkins、GitLab CI
- 自动化测试、打包、推送镜像、远程部署
- 示例（GitHub Actions）：
  ```yaml
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Set up JDK 17
          uses: actions/setup-java@v3
          with:
            java-version: '17'
        - name: Build with Maven
          run: mvn clean package
        - name: Build Docker image
          run: docker build -t my-springboot-app .
        - name: Push Docker image
          run: docker push my-springboot-app
  ```
- 支持自动回滚、蓝绿/金丝雀发布

## 7. 配置安全与敏感信息管理
- 配置文件不入镜像，敏感信息用环境变量/Secret
- 推荐用 KMS、Vault、K8s Secret 管理密钥
- 日志脱敏，防止泄露

## 8. 日志与监控
- 推荐用 ELK（Elasticsearch+Logstash+Kibana）、Prometheus+Grafana
- 集成 Spring Boot Actuator，暴露健康检查、指标、监控端点
- 示例：
  ```yaml
  management:
    endpoints:
      web:
        exposure:
          include: health,info,metrics,prometheus
  ```
- 支持自定义监控指标、报警

## 9. 常见问题与排查
- 启动失败：检查 JDK 版本、端口占用、依赖缺失
- 端口冲突：修改 server.port 或 Nginx 配置
- 配置不生效：检查挂载路径、环境变量、profile
- 容器重启：检查内存/CPU 限制、健康检查
- 日志丢失：配置持久化、集中采集

## 10. 最佳实践
- 生产环境强制 HTTPS，关闭调试端口
- 配置、日志、数据分离，便于迁移与扩容
- 镜像最小化，定期扫描漏洞
- 自动化部署，回滚机制完善
- 监控与报警全覆盖，定期演练故障恢复

## 11. FAQ

### Q: JAR 和 WAR 部署有何区别？
A: JAR 内嵌服务器，独立运行；WAR 需外部 Servlet 容器，适合老系统集成。

### Q: 如何优雅重启服务？
A: 推荐用 kill -15 发送 SIGTERM，容器/K8s 支持优雅下线。

### Q: 如何实现多实例负载均衡？
A: 配合 Nginx、K8s Service、云负载均衡器实现。

---

> 部署是保障服务稳定运行的关键环节，建议结合云原生与自动化工具，提升效率与可靠性。 