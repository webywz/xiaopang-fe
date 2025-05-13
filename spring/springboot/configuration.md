---
title: 配置文件
---

/**
 * SpringBoot 配置文件
 * @description 深入讲解 application.properties/yml、分环境配置、外部化配置、加载顺序、类型安全、加密、热更新、常见问题与最佳实践
 */

# 配置文件

SpringBoot 支持多种配置方式，核心为 `application.properties` 和 `application.yml`，并支持多环境、外部化、类型安全、加密等高级特性。

## 1. 配置文件格式

- `application.properties`：传统的 key=value 格式，适合简单配置
- `application.yml`：YAML 层级结构，适合复杂配置

### 示例
```properties
server.port=8080
spring.application.name=demo
spring.datasource.url=jdbc:mysql://localhost:3306/demo
spring.datasource.username=root
spring.datasource.password=123456
```

```yaml
server:
  port: 8080
spring:
  application:
    name: demo
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    username: root
    password: 123456
```

## 2. 分环境配置（Profile）

- 支持多环境文件：`application-dev.yml`、`application-prod.yml` 等
- 激活环境：
  - 配置文件：`spring.profiles.active=dev`
  - 启动参数：`--spring.profiles.active=prod`
- 多环境合并加载，默认配置优先，环境配置覆盖

## 3. 外部化配置

- 支持命令行参数、环境变量、外部文件、JNDI、系统属性等
- 优先级（从高到低）：
  1. 命令行参数
  2. `application-{profile}.yml`
  3. `application.yml`
  4. @PropertySource 注解
  5. 默认值
- 示例：
  ```bash
  java -jar app.jar --server.port=9000
  export SPRING_DATASOURCE_USERNAME=produser
  ```

## 4. 类型安全配置（@ConfigurationProperties）

- 推荐用法：将配置映射为类型安全的 Java Bean
- 示例：
  ```java
  @Component
  @ConfigurationProperties(prefix = "myapp")
  public class MyAppProperties {
      private String name;
      private int timeout;
      // getter/setter
  }
  ```
- 配置文件：
  ```yaml
  myapp:
    name: "小胖博客"
    timeout: 30
  ```
- 支持嵌套、校验（@Validated）、默认值

## 5. 配置加密与安全

- 敏感信息（如密码、密钥）建议加密存储
- 常用方案：jasypt、Spring Cloud Config 加密
- 示例：
  ```properties
  spring.datasource.password=ENC(加密串)
  ```
- 配合环境变量、密钥管理服务（KMS）提升安全性

## 6. 配置热更新

- 开发环境推荐使用 Spring DevTools，支持配置文件热加载
- IDEA 可自动重启或手动触发

## 7. 常见问题与排查

- 配置未生效：检查文件名、路径、激活环境、拼写
- 类型转换异常：检查配置类型、@ConfigurationProperties 映射
- 多环境冲突：优先级理解不清，建议明确 active
- 密码明文泄露：建议加密或用环境变量

## 8. 最佳实践
- 推荐使用 yml 格式，结构清晰
- 多环境配置拆分，避免混用
- 敏感信息不入库/代码仓库，优先用环境变量
- 配置类加 @Validated，提升健壮性
- 配置项命名规范，统一前缀

## 9. FAQ

### Q: application.yml 和 application.properties 有什么区别？
A: yml 支持层级结构，适合复杂配置；properties 适合简单场景。

### Q: 如何动态切换环境？
A: 启动参数 `--spring.profiles.active=xxx` 或配置文件设置。

### Q: 配置文件能否分模块管理？
A: 可用 @PropertySource、@ImportResource、Spring Cloud Config 等实现。

---

> 配置文件是 SpringBoot 项目的灵魂，建议深入理解加载顺序、类型安全和安全加密等高级特性。 