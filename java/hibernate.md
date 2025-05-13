<!-- /**
 * Hibernate 深入详解
 * @description Hibernate 配置、实体映射、CRUD、复杂查询、缓存、性能优化、Spring集成、常见问题
 */ -->

# Hibernate 深入详解

## 1. 配置与环境搭建

### Maven 依赖
```xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-core</artifactId>
  <version>5.6.15.Final</version>
</dependency>
```

### hibernate.cfg.xml 详解
```xml
<hibernate-configuration>
  <session-factory>
    <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
    <property name="hibernate.hbm2ddl.auto">update</property>
    <property name="hibernate.show_sql">true</property>
    <property name="hibernate.format_sql">true</property>
    <property name="hibernate.connection.username">root</property>
    <property name="hibernate.connection.password">password</property>
    <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/test</property>
    <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
  </session-factory>
</hibernate-configuration>
```

### 多数据源与多 SessionFactory
- 可通过 Spring 配置多个 SessionFactory，分别管理不同数据源。

### 日志与 SQL 输出
- 推荐集成 log4j2/slf4j，配置 SQL 日志格式化。

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

### 枚举、集合、Map、嵌套对象映射
- @ElementCollection、@Enumerated、@Embedded

---

## 3. CRUD 操作

### Session API
```java
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();
User user = new User();
user.setName("小胖");
session.save(user);
tx.commit();
session.close();
```

### saveOrUpdate、merge、detach、refresh、flush
- saveOrUpdate：有主键则更新，无主键则插入
- merge：合并游离对象
- detach：脱管实体
- refresh：刷新实体状态
- flush：强制同步到数据库

### 批量操作
- 推荐分批提交，避免内存溢出

---

## 4. 复杂查询

### HQL 进阶
```java
List<User> users = session.createQuery(
  "from User u where u.name=:name and u.age>:age")
  .setParameter("name", "小胖")
  .setParameter("age", 18)
  .list();
```

### Criteria API 动态查询
```java
CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<User> cq = cb.createQuery(User.class);
Root<User> root = cq.from(User.class);
cq.select(root).where(cb.equal(root.get("name"), "小胖"));
List<User> users = session.createQuery(cq).getResultList();
```

### 原生 SQL 查询
```java
List<Object[]> result = session.createNativeQuery("SELECT * FROM user").list();
```

### 分页、排序、窗口函数
```java
Query q = session.createQuery("from User");
q.setFirstResult(0);
q.setMaxResults(10);
List<User> page = q.list();
```

---

## 5. 缓存与性能优化

### 一级缓存
- 默认开启，Session 级别

### 二级缓存
- 需配置 `<property name="hibernate.cache.use_second_level_cache" value="true"/>`
- 常用 Ehcache、Redis

### 查询缓存
- 需配置 `<property name="hibernate.cache.use_query_cache" value="true"/>`
- 查询时 `.setCacheable(true)`

### 懒加载与抓取策略
- FetchType.LAZY/EAGER
- @Fetch(FetchMode.JOIN/SUBSELECT/SELECT)

### 性能调优参数
- hibernate.jdbc.batch_size
- hibernate.order_inserts/updates

---

## 6. 事务与并发

### 事务管理
```java
session.beginTransaction();
// ...
session.getTransaction().commit();
```

### 乐观锁/悲观锁
```java
@Version
private Integer version;
```
- 悲观锁：`session.lock(entity, LockMode.PESSIMISTIC_WRITE);`

### 事务传播与隔离级别
- Spring @Transactional 支持传播行为和隔离级别

---

## 7. 与 Spring/Spring Boot 集成
- @EnableTransactionManagement、@Transactional、SessionFactory 注入
- Spring Data JPA 与 Hibernate 的关系
- 事务边界与异常回滚

---

## 8. 常见问题与调试
- 懒加载异常、N+1 问题、实体状态转换
- SQL 注入与安全防护

---

> 本文档持续完善，欢迎补充更多 Hibernate 实战案例与最佳实践。 