---
title: Spring Data 详解
---

/**
 * Spring Data 详解
 * @description 深入讲解 Spring Data 家族（JPA、MongoDB、Redis、Elasticsearch等）的核心原理、Repository、自动实现、查询方法、注解、配置、分页排序、复杂查询、事务、与SpringBoot集成、源码剖析、最佳实践、FAQ
 */

# Spring Data 详解

Spring Data 是 Spring 生态下的数据访问家族，极大简化了关系型数据库、NoSQL、搜索引擎等的数据访问开发。

## 1. 框架简介
- Spring Data 提供统一的 Repository 抽象，支持 JPA、MongoDB、Redis、Elasticsearch、Cassandra、Neo4j 等
- 通过接口定义和方法命名规则自动实现数据访问
- 与 SpringBoot 无缝集成，自动配置数据源、事务、缓存等

## 2. 核心原理

### 2.1 Repository 接口体系
- `CrudRepository`：基础增删改查
- `PagingAndSortingRepository`：分页与排序
- `JpaRepository`：JPA 扩展
- `MongoRepository`、`ElasticsearchRepository` 等 NoSQL 扩展

### 2.2 自动实现与查询方法
- 通过接口方法命名自动生成 SQL/查询语句
- 支持 `findByXxx`、`countByXxx`、`deleteByXxx`、`existsByXxx` 等
- 支持 `@Query` 注解自定义 JPQL/SQL/DSL

#### 示例
```java
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByUsernameAndStatus(String username, Integer status);
    @Query("select u from User u where u.email like %:email%")
    List<User> searchByEmail(@Param("email") String email);
}
```

## 3. 常用注解
- `@Entity`、`@Table`、`@Id`、`@GeneratedValue`（JPA）
- `@Document`（MongoDB/Elasticsearch）
- `@Query`、`@Modifying`、`@Transactional`
- `@EnableJpaRepositories`、`@EnableMongoRepositories` 等

## 4. 配置与集成

### 4.1 JPA 配置
- 依赖：`spring-boot-starter-data-jpa`
- application.yml 配置数据源、JPA 属性
- 支持多数据源、主从分离

### 4.2 MongoDB/Redis/Elasticsearch 配置
- 依赖：`spring-boot-starter-data-mongodb`、`spring-boot-starter-data-redis`、`spring-boot-starter-data-elasticsearch`
- application.yml 配置主机、端口、认证、连接池等

### 4.3 事务管理
- JPA 默认支持声明式事务（@Transactional）
- MongoDB/Redis/ES 支持部分事务特性

## 5. 分页与排序
- `Pageable`、`Sort` 接口
- 支持方法参数自动注入
- 示例：
  ```java
  Page<User> findByStatus(Integer status, Pageable pageable);
  ```

## 6. 复杂查询与动态查询
- `@Query` 注解自定义 JPQL/SQL/DSL
- `Specification` 动态条件查询（JPA）
- QueryDSL、Criteria API 支持复杂查询

### 示例
```java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {}

// Service 层
Specification<User> spec = (root, query, cb) -> cb.equal(root.get("status"), 1);
List<User> users = userRepository.findAll(spec);
```

## 7. 缓存与性能优化
- 支持二级缓存（EhCache、Redis）
- 查询投影、DTO 映射、只查必要字段
- 批量操作、懒加载、分页优化

## 8. 与 SpringBoot 的集成
- SpringBoot 自动装配数据源、事务、Repository
- application.yml 配置即可，无需 XML
- 支持多数据源、分库分表、读写分离

## 9. 源码剖析（简要）
- RepositoryFactoryBean：自动实现接口
- SimpleJpaRepository：JPA 默认实现
- QueryLookupStrategy：方法名解析
- MappingContext：实体映射元数据

## 10. 最佳实践
- Repository 只做数据访问，业务逻辑下沉到 Service
- 方法命名规范，复杂查询用 @Query 或 Specification
- 合理分页、排序、缓存，提升性能
- 事务边界清晰，避免嵌套事务
- 多数据源/分库分表用专用中间件

## 11. 常见问题与 FAQ

### Q: findByXxx 方法支持哪些关键字？
A: 支持 And、Or、Between、LessThan、Like、In、Not、OrderBy 等，详见官方文档。

### Q: 如何实现多表关联查询？
A: JPA 用 @Query + JPQL，或用 Specification/QueryDSL；MongoDB/ES 用聚合管道/DSL。

### Q: 如何优化大表分页？
A: 推荐用游标分页（keyset pagination）、只查必要字段、加索引。

### Q: 如何自定义 Repository 实现？
A: 接口继承 + 实现类命名规范（Impl），或用 @Repository 注解。

---

> Spring Data 极大提升了数据访问开发效率，建议熟练掌握 Repository、查询方法、事务与性能优化，结合业务场景灵活选型。 