---
title: 核心注解
---

<!-- /**
 * SpringBoot 核心注解
 * @description 深入讲解 SpringBoot 常用注解的原理、用法、源码、组合与元注解、冲突与优先级、最佳实践、易错点与面试高频问题
 */ -->

# 核心注解

SpringBoot 通过大量注解极大简化了开发流程。理解注解的原理和用法，是高效开发和排查问题的基础。

## 1. 注解原理与分类

- **元注解**：用于定义其他注解的注解，如 `@Target`、`@Retention`、`@Documented`、`@Inherited`
- **组合注解**：多个注解的集合，如 `@SpringBootApplication`
- **常用业务注解**：如 `@RestController`、`@Service`、`@Repository`、`@Component`
- **配置与装配注解**：如 `@Autowired`、`@Value`、`@Configuration`、`@Bean`

## 2. 常用注解详解

### @SpringBootApplication
- 组合注解，等价于 `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`
- 标记主启动类，自动开启组件扫描和自动配置
- 源码：
  ```java
  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @SpringBootConfiguration
  @EnableAutoConfiguration
  @ComponentScan
  public @interface SpringBootApplication {}
  ```

### @RestController
- 标记类为 REST 控制器，返回 JSON 数据
- 等价于 `@Controller` + `@ResponseBody`
- 常用于 API 层

### @RequestMapping/@GetMapping/@PostMapping
- 映射 HTTP 路径和方法
- 支持路径参数、请求参数、请求体等
- 示例：
  ```java
  @RestController
  @RequestMapping("/api")
  public class DemoController {
      @GetMapping("/hello")
      public String hello(@RequestParam String name) {
          return "Hello, " + name;
      }
  }
  ```

### @Autowired
- 自动注入 Spring 容器中的 Bean
- 支持构造器、字段、Setter 注入
- 推荐构造器注入（利于测试与可维护性）

### @Value
- 注入配置文件中的属性值
- 支持 SpEL 表达式
- 示例：
  ```java
  @Value("${server.port}")
  private int port;
  ```

### @Component/@Service/@Repository
- 标记类为 Spring 管理的 Bean
- `@Service` 用于业务层，`@Repository` 用于数据层，`@Component` 通用

### @Configuration/@Bean
- `@Configuration` 标记配置类，`@Bean` 声明方法返回的对象交由 Spring 容器管理
- 示例：
  ```java
  @Configuration
  public class AppConfig {
      @Bean
      public RestTemplate restTemplate() {
          return new RestTemplate();
      }
  }
  ```

### @Conditional
- 条件装配，常用于 Starter 自动配置
- 示例：`@ConditionalOnMissingBean`、`@ConditionalOnProperty`

### @Profile
- 多环境配置切换
- 示例：
  ```java
  @Profile("dev")
  @Bean
  public DataSource devDataSource() {...}
  ```

## 3. 组合注解与元注解
- 组合注解可减少重复配置，提高可维护性
- 元注解如 `@Target`、`@Retention` 决定注解的作用范围和生命周期

## 4. 注解冲突与优先级
- 多个注解作用于同一 Bean 时，优先级由 Spring 解析顺序和配置决定
- 常见冲突如 `@Primary`、`@Qualifier` 配合使用

## 5. 最佳实践
- 推荐使用构造器注入，避免循环依赖
- 业务分层时优先用 `@Service`、`@Repository`，便于 AOP 和异常处理
- 配置类建议加 `@Configuration(proxyBeanMethods = false)` 提升性能

## 6. 易错点与面试高频问题
- `@Autowired` 注入失败常见原因？（未被 Spring 扫描、类型冲突、循环依赖）
- `@ComponentScan` 默认扫描范围？（主类所在包及其子包）
- `@SpringBootApplication` 能否自定义扫描路径？（可用 `scanBasePackages`）
- `@Value` 注入 null 的原因？（属性名拼写、配置文件未加载、类型不匹配）

## 7. FAQ

### Q: 注解和 XML 配置能否混用？
A: 可以，SpringBoot 推荐注解优先，兼容 XML。

### Q: 如何自定义注解？
A: 使用 `@interface` 定义，结合元注解和 AOP 实现自定义逻辑。

---

> 注解是 SpringBoot 自动化和高效开发的核心，建议结合源码和实际项目深入理解和应用。 