/**
 * JPA 深入详解
 * @description JPA 配置、实体映射、CRUD、复杂查询、事务、性能优化、Spring集成、常见问题
 */

# JPA 深入详解

## 1. 配置与环境搭建

### Maven 依赖
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
  <version>2.7.0</version>
</dependency>
```

### persistence.xml 详解
```xml
<persistence>
  <persistence-unit name="myJpaUnit">
    <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
    <class>com.example.User</class>
    <properties>
      <property name="javax.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/test"/>
      <property name="javax.persistence.jdbc.user" value="root"/>
      <property name="javax.persistence.jdbc.password" value="password"/>
      <property name="hibernate.hbm2ddl.auto" value="update"/>
    </properties>
  </persistence-unit>
</persistence>
```

### Spring Data JPA 配置
- application.yml 配置数据源、JPA 属性
- 支持多数据源与多 EntityManager

---

## 2. 实体映射与注解详解

### 基本注解
```java
@Entity
@Table(name = "user")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column(nullable = false, length = 32)
  private String name;
  @Enumerated(EnumType.STRING)
  private Gender gender;
}
```

### 关联关系
```java
// 一对多
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<Role> roles;

// 多对一
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "dept_id")
private Department department;

// 多对多
@ManyToMany
@JoinTable(
  name = "user_role",
  joinColumns = @JoinColumn(name = "user_id"),
  inverseJoinColumns = @JoinColumn(name = "role_id")
)
private Set<Role> roles;
```

### 继承映射
```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Animal { ... }
```

### 复合主键
```java
@Embeddable
public class OrderId implements Serializable {
  private Integer userId;
  private Integer productId;
}
@Entity
public class Order {
  @EmbeddedId
  private OrderId id;
}
```

### 枚举、集合、Map、嵌套对象、级联、FetchType
- @ElementCollection、@Enumerated、@Embedded、CascadeType、FetchType

---

## 3. CRUD 操作

### Repository 接口
```java
public interface UserRepository extends JpaRepository<User, Integer> {
  List<User> findByName(String name);
  @Query("select u from User u where u.name like %:name%")
  List<User> searchByName(@Param("name") String name);
}
```

### 批量操作与 @Modifying
```java
@Modifying
@Query("update User u set u.name = :name where u.id = :id")
int updateName(@Param("id") Integer id, @Param("name") String name);
```

---

## 4. 复杂查询

### JPQL 进阶
```java
@Query("select u from User u where u.name = :name and u.age > :age")
List<User> findByNameAndAge(@Param("name") String name, @Param("age") int age);
```

### 原生 SQL 查询
```java
@Query(value = "SELECT * FROM user WHERE name = ?1", nativeQuery = true)
List<User> findByNameNative(String name);
```

### Specification 动态查询
```java
Specification<User> spec = (root, query, cb) -> cb.equal(root.get("name"), "小胖");
List<User> users = userRepository.findAll(spec);
```

### 分页、排序、聚合
```java
Page<User> page = userRepository.findAll(PageRequest.of(0, 10, Sort.by("id").descending()));
```

---

## 5. 事务与并发

### @Transactional
- 方法/类级别事务，支持传播行为、隔离级别

### 乐观锁/悲观锁
```java
@Version
private Integer version;
```
- 悲观锁：`@Lock(LockModeType.PESSIMISTIC_WRITE)`

---

## 6. 性能优化与调优
- 缓存、懒加载、抓取策略、查询优化
- 批量操作与性能陷阱

---

## 7. 与 Spring/Spring Boot 集成
- 自动 Repository 注入、事务管理、配置简化
- Spring Data JPA 扩展与自定义实现

---

## 8. 常见问题与调试
- 查询无结果、懒加载异常、事务失效、主键冲突
- SQL 注入与安全防护

---

> 本文档持续完善，欢迎补充更多 JPA 实战案例与最佳实践。 