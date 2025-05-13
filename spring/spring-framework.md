---
title: Spring Framework 核心详解
---

<!-- /**
 * Spring Framework 核心详解
 * @description 深入讲解 Spring Framework 的核心原理、IoC、AOP、Bean 生命周期、配置方式、常用注解、与 SpringBoot 的关系、源码剖析、最佳实践、FAQ
 */ -->

# Spring Framework 核心详解

Spring Framework 是 Java 企业级开发的基石，提供了依赖注入（IoC）、面向切面编程（AOP）、声明式事务、数据访问、Web 框架等核心能力。

## 1. 框架简介
- 2002 年诞生，极大简化了 Java EE 开发
- 采用分层架构，核心容器、AOP、数据访问、Web、消息、测试等模块
- SpringBoot、SpringCloud、SpringData 等均基于 Spring Framework

## 2. 核心原理

### 2.1 IoC（控制反转）与 DI（依赖注入）
- IoC 容器负责对象的创建、管理、依赖注入
- 支持构造器注入、Setter 注入、字段注入
- Bean 通过配置文件、注解、JavaConfig 注册到容器

#### 典型代码
```java
@Component
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

### 2.2 AOP（面向切面编程）
- 通过切面（Aspect）实现横切关注点（如日志、事务、安全）
- 支持声明式事务、日志、权限校验等
- 基于 JDK 动态代理、CGLIB 字节码增强

#### 典型代码
```java
@Aspect
@Component
public class LogAspect {
    @Before("execution(* com.example.service.*.*(..))")
    public void before() {
        // ...
    }
}
```

### 2.3 Bean 生命周期
- 实例化 -> 属性注入 -> 初始化 -> 使用 -> 销毁
- 支持自定义初始化/销毁方法、BeanPostProcessor、Aware 接口

#### 生命周期回调
```java
@Component
public class DemoBean implements InitializingBean, DisposableBean {
    @Override
    public void afterPropertiesSet() { /* 初始化逻辑 */ }
    @Override
    public void destroy() { /* 销毁逻辑 */ }
}
```

## 3. 配置方式

### 3.1 XML 配置
```xml
<bean id="userService" class="com.example.UserService">
    <property name="userRepository" ref="userRepository"/>
</bean>
```

### 3.2 注解配置
- `@Component`、`@Service`、`@Repository`、`@Controller`
- `@Autowired`、`@Qualifier`、`@Value`
- `@Configuration`、`@Bean`

### 3.3 JavaConfig
```java
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService();
    }
}
```

## 4. 常用注解
- `@Component`：通用组件
- `@Service`：业务层
- `@Repository`：数据层
- `@Controller`：Web 层
- `@Autowired`：自动注入
- `@Qualifier`：指定 Bean 名称
- `@Value`：注入配置值
- `@Scope`：Bean 作用域
- `@PostConstruct`、`@PreDestroy`：生命周期回调
- `@Configuration`、`@Bean`：JavaConfig
- `@Aspect`、`@Before`、`@After`：AOP

## 5. 与 SpringBoot 的关系
- SpringBoot 基于 Spring Framework，自动装配、约定优于配置
- SpringBoot 推荐注解+JavaConfig，极少用 XML
- SpringBoot Starter 机制简化依赖管理

## 6. 典型应用场景
- 企业级 Web 应用、微服务、REST API
- 复杂业务系统的解耦、扩展、测试
- 统一事务、日志、安全、缓存等横切关注点

## 7. 源码剖析（简要）
- ApplicationContext：IoC 容器核心接口
- BeanDefinition：Bean 元数据描述
- BeanFactoryPostProcessor、BeanPostProcessor：扩展点
- AopProxy、Advisor、JoinPoint：AOP 核心

## 8. 最佳实践
- 推荐注解+JavaConfig，减少 XML
- 依赖注入优先用构造器，便于测试
- 合理拆分配置类，分层管理 Bean
- 善用 AOP 实现日志、权限、事务等横切逻辑
- 配置文件与代码分离，便于环境切换

## 9. 常见问题与 FAQ

### Q: Bean 循环依赖如何解决？
A: Spring 支持构造器注入时检测循环依赖，Setter/字段注入可通过三级缓存解决。

### Q: 如何自定义 Bean 生命周期？
A: 实现 InitializingBean/DisposableBean 或用 @PostConstruct/@PreDestroy 注解。

### Q: SpringBoot 项目还能用 XML 配置吗？
A: 可以，推荐注解+JavaConfig，兼容 XML。

### Q: 如何调试 IoC/AOP 问题？
A: 开启日志、使用 ApplicationContext#getBeanDefinitionNames、AOP 代理调试工具。

---

> Spring Framework 是 Java 后端开发的基石，建议深入理解 IoC、AOP、生命周期与配置方式，打好后续 SpringBoot/SpringCloud 的基础。 