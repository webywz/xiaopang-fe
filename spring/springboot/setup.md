---
title: 环境搭建
---

<!-- /**
 * SpringBoot 环境搭建
 * @description 详细介绍 SpringBoot 开发环境的准备，包括 JDK、IDE、构建工具、国内镜像、Spring Initializr、项目结构、Spring 全家桶简介、常见问题等
 */ -->

# 环境搭建

SpringBoot 项目开发环境搭建主要包括 JDK 安装、开发工具选择、构建工具配置、项目初始化等环节。以下内容适合初学者和进阶开发者。

## 1. JDK 选择与安装

- **推荐版本**：JDK 17（SpringBoot 3.x 及以上强制要求 JDK 17+）
- **下载地址**：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
  - [OpenJDK](https://jdk.java.net/)
  - [阿里云 OpenJDK 镜像](https://mirrors.aliyun.com/AdoptOpenJDK/)
- **安装验证**：
  ```bash
  java -version
  # 输出应为 17.x 或更高版本
  ```
- **环境变量配置**：
  - Windows：配置 JAVA_HOME、Path
  - macOS/Linux：编辑 ~/.bash_profile 或 ~/.zshrc

## 2. 开发工具（IDE）推荐

- **IntelliJ IDEA**（强烈推荐，支持 Spring 全家桶，插件丰富）
- Eclipse（经典 Java IDE，适合老项目）
- VS Code（轻量级，需安装 Java 扩展包）

### IDEA 常用插件
- Lombok
- Spring Assistant
- MyBatisX
- JRebel（热部署）

## 3. 构建工具与国内镜像

### Maven
- 推荐使用 3.6.0 及以上版本
- 配置国内镜像（加速依赖下载）：
  ```xml
  <mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
  ```
- 常用命令：
  ```bash
  mvn clean package
  mvn spring-boot:run
  ```

### Gradle
- 推荐使用 7.x 及以上版本
- 配置国内镜像：
  ```groovy
  repositories {
    maven { url 'https://maven.aliyun.com/repository/public' }
    mavenCentral()
  }
  ```
- 常用命令：
  ```bash
  ./gradlew build
  ./gradlew bootRun
  ```

## 4. Spring Initializr 项目生成器

- 官网：[https://start.spring.io/](https://start.spring.io/)
- 支持自定义 Group、Artifact、依赖、打包方式（jar/war）、Java 版本等
- 高级用法：
  - 选择 SNAPSHOT 版本体验最新特性
  - 生成 Kotlin、Groovy 项目
  - 通过 curl/命令行生成项目
    ```bash
    curl https://start.spring.io/starter.zip -d dependencies=web,data-jpa -d type=maven-project -d language=java -d javaVersion=17 -o demo.zip
    ```
- IDEA 内置 Spring Initializr，支持一键新建

## 5. Spring 全家桶主流框架简介

Spring 生态体系庞大，SpringBoot 可与下列主流框架无缝集成：

| 框架                | 主要用途与说明 |
|---------------------|--------------------------------------------------|
| **Spring Framework**| 依赖注入、AOP、核心容器，所有 Spring 项目的基础 |
| **Spring MVC**      | Web/MVC 层开发，RESTful API，前后端分离或模板渲染 |
| **Spring Data**     | 数据访问（JPA、MongoDB、Redis、Elasticsearch 等）|
| **Spring Security** | 认证授权、权限控制、OAuth2、JWT、单点登录        |
| **Spring Cloud**    | 微服务架构（注册中心、配置中心、网关、熔断等）   |
| **Spring Batch**    | 批量任务处理、定时任务、数据导入导出             |
| **Spring Integration**| 企业应用集成、消息驱动、工作流                |
| **Spring Session**  | 分布式会话管理，支持 Redis、JDBC 等             |
| **Spring AMQP**     | 消息队列集成（RabbitMQ 等）                     |
| **Spring WebFlux**  | 响应式编程、异步非阻塞 Web 应用                  |
| **Spring Boot Admin**| 应用监控与管理                                  |
| **Spring Cloud Alibaba**| 微服务增强（Nacos、Sentinel、RocketMQ 等）   |

### 与 SpringBoot 的集成说明
- SpringBoot 通过 Starter 机制（如 `spring-boot-starter-data-jpa`、`spring-boot-starter-security`）实现与全家桶各模块的自动装配与零配置集成。
- 推荐在 Spring Initializr 选择所需依赖，自动生成集成代码。
- SpringBoot 3.x 及以上全面支持 Jakarta EE 9+，部分老依赖需升级。

## 6. 项目结构详解

```text
├── src/
│   ├── main/
│   │   ├── java/           # Java 源码目录
│   │   ├── resources/      # 配置文件、静态资源
│   │   │   ├── application.yml
│   │   │   └── static/
│   └── test/               # 测试代码
├── pom.xml / build.gradle  # 构建脚本
```

## 7. 常见环境问题与排查

- **JDK 版本不兼容**：SpringBoot 3.x 需 JDK 17+，否则启动报错
- **依赖下载缓慢**：配置国内镜像源
- **IDEA 无法识别 SpringBoot**：检查插件、JDK 配置
- **端口被占用**：修改 `server.port` 或释放端口
- **Maven/Gradle 构建失败**：检查网络、依赖版本、代理设置

## 8. 最佳实践
- 使用 LTS 版本 JDK，定期升级
- 项目初始化后，优先配置多环境（dev/prod）
- 版本管理建议使用 Git，.gitignore 忽略 target/build 目录
- 推荐使用 IDEA 的 Spring Boot Dashboard 管理多项目

---

> 环境搭建是高效开发的基础，建议每一步都严格按照官方和社区最佳实践执行。 