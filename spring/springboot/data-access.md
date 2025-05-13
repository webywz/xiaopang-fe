---
title: 数据访问
---

/**
 * SpringBoot 数据访问
 * @description 深入讲解 SpringBoot 数据访问，包括 JPA、MyBatis、Redis、JDBC、多数据源、事务、分页、连接池、性能优化、主从分离、分库分表、常见问题与最佳实践
 */

# 数据访问

SpringBoot 支持多种数据访问方式，涵盖关系型数据库、NoSQL、缓存、分布式数据等，适合各种业务场景。

## 1. 数据访问方式概览
- **Spring Data JPA**：基于 ORM，开发效率高，适合大多数业务系统
- **MyBatis**：灵活 SQL，适合复杂查询和性能优化
- **JDBC Template**：轻量级，适合简单场景
- **Redis/MongoDB/Elasticsearch**：NoSQL 支持

## 2. Spring Data JPA

### 依赖与配置
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
</dependency>
```

application.yml 示例：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    username: root
    password: 123456
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate.format_sql: true
```

### 实体与 Repository
```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String name;
    // getter/setter
}

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);
}
```

### 常用注解
- `@Entity`、`@Table`、`@Id`、`@GeneratedValue`、`@Column`
- `@Query` 自定义 JPQL/SQL
- `@Modifying` 更新/删除操作

### 复杂查询
- 方法命名规则自动生成 SQL
- `@Query` 注解自定义查询
- 分页与排序：`Pageable`、`Sort`

### 性能优化
- 批量插入/更新：`saveAll`、`@Modifying`
- 只查询需要的字段：投影接口、DTO
- 缓存：二级缓存、Redis 集成

## 3. MyBatis

### 依赖与配置
```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>3.0.2</version>
</dependency>
```

application.yml 示例：
```yaml
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.demo.entity
```

### Mapper 与 XML
```java
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
    int insert(User user);
}
```

mapper/UserMapper.xml 示例：
```xml
<mapper namespace="com.example.demo.mapper.UserMapper">
  <select id="selectById" resultType="User">
    SELECT * FROM user WHERE id = #{id}
  </select>
</mapper>
```

### 动态 SQL
- `<if>` `<choose>` `<foreach>` 等标签
- 适合复杂查询和批量操作

### 分页插件
- 推荐 PageHelper、MyBatis-Plus
- 示例：
  ```java
  PageHelper.startPage(page, size);
  List<User> users = userMapper.selectAll();
  ```

## 4. Redis 数据访问

### 依赖与配置
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

application.yml 示例：
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: 123456
    database: 0
```

### 基本用法
```java
@Autowired
private StringRedisTemplate stringRedisTemplate;

stringRedisTemplate.opsForValue().set("key", "value");
String value = stringRedisTemplate.opsForValue().get("key");
```

### 进阶用法
- 对象序列化、分布式锁、消息队列、缓存穿透防护

## 5. 多数据源配置

### 多数据源场景
- 读写分离、主从分库、业务隔离

### 配置方式
- 配置多个 DataSource Bean，配合 @Primary、@Qualifier
- 使用 MyBatis-Plus、Druid、ShardingSphere 等中间件

### 示例
```java
@Configuration
public class DataSourceConfig {
    @Bean(name = "primaryDataSource")
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() { return DataSourceBuilder.create().build(); }

    @Bean(name = "secondaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() { return DataSourceBuilder.create().build(); }
}
```

## 6. 事务管理

### 注解与原理
- `@Transactional` 支持方法/类级别事务
- 支持回滚、只读、传播机制、隔离级别

### 示例
```java
@Transactional(rollbackFor = Exception.class)
public void transfer() {
    // ...
}
```

### 事务传播与隔离级别
- 传播：REQUIRED、REQUIRES_NEW、NESTED 等
- 隔离：DEFAULT、READ_COMMITTED、REPEATABLE_READ、SERIALIZABLE

## 7. 连接池与性能优化

### 常用连接池
- HikariCP（默认）、Druid、C3P0
- 配置最大连接数、超时、监控

### SQL 性能优化
- 慎用 N+1 查询，优先用 join、in 查询
- 合理建索引，避免全表扫描
- 慢 SQL 日志与分析

## 8. 主从分离、分库分表
- 读写分离：主库写、从库读，提升性能与可用性
- 分库分表：ShardingSphere、MyCat 等中间件
- 分布式事务：Seata、TCC 等

## 9. 常见问题与排查
- 连接超时：检查数据库网络、连接池配置
- 事务不生效：检查 @Transactional 作用范围、AOP 代理
- 数据丢失/脏读：检查事务隔离级别
- MyBatis/JPA 映射异常：检查实体、Mapper、SQL

## 10. 最佳实践
- 推荐用 JPA 简化开发，复杂场景用 MyBatis
- 统一数据访问层接口，便于维护与扩展
- 事务边界清晰，避免嵌套调用
- 连接池参数根据 QPS 调优
- 读写分离、缓存预热提升性能

## 11. FAQ

### Q: JPA 和 MyBatis 如何选择？
A: JPA 适合标准 CRUD 和快速开发，MyBatis 适合复杂 SQL 和性能优化。

### Q: 如何优雅处理分布式事务？
A: 推荐用 Seata、TCC 等分布式事务中间件，避免手动补偿。

### Q: Redis 如何防止缓存穿透？
A: 可用布隆过滤器、空值缓存、限流等手段。

---

> SpringBoot 数据访问体系完善，建议结合业务场景选择合适方案，关注性能与数据一致性。 