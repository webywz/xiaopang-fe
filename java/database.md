<!-- /**
 * Java 数据库与ORM
 * @description Java 数据库开发与主流 ORM 框架（JDBC、连接池、MyBatis、Hibernate、JPA、事务、迁移、安全、最佳实践）
 */ -->

# Java 数据库与 ORM 详解

## 1. 数据库基础与 JDBC 简介

- **数据库**：用于持久化存储和管理数据，常见有 MySQL、PostgreSQL、Oracle、SQL Server 等。
- **JDBC（Java Database Connectivity）**：Java 官方提供的数据库访问 API，支持主流关系型数据库。

---

## 2. JDBC 连接与操作

### 2.1 加载驱动与建立连接

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * 获取数据库连接
 * @return 数据库连接对象
 * @throws SQLException 数据库异常
 */
public Connection getConnection() throws SQLException {
    String url = "jdbc:mysql://localhost:3306/test";
    String user = "root";
    String password = "123456";
    return DriverManager.getConnection(url, user, password);
}
```

### 2.2 增删改查（CRUD）操作

```java
import java.sql.*;
/**
 * 查询数据示例
 * @throws SQLException 数据库异常
 */
public void query() throws SQLException {
    try (Connection conn = getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery("SELECT id, name FROM user")) {
        while (rs.next()) {
            int id = rs.getInt("id");
            String name = rs.getString("name");
            System.out.println(id + ":" + name);
        }
    }
}
```

### 2.3 事务管理

```java
/**
 * 事务操作示例
 * @throws SQLException 数据库异常
 */
public void transfer() throws SQLException {
    Connection conn = getConnection();
    try {
        conn.setAutoCommit(false); // 开启事务
        // ... 执行多条 SQL ...
        conn.commit(); // 提交事务
    } catch (SQLException e) {
        conn.rollback(); // 回滚事务
        throw e;
    } finally {
        conn.close();
    }
}
```

---

## 3. 常见异常与资源释放
- 连接未关闭导致资源泄漏
- SQL 注入风险，建议用 PreparedStatement
- 捕获 SQLException 需详细处理

---

## 4. ORM 原理与优势

- **ORM（Object-Relational Mapping）**：对象与关系数据库表之间的自动映射。
- 优势：简化数据操作、提升开发效率、屏蔽 SQL 差异、支持事务和缓存。

---

## 5. 主流 ORM 框架简介与对比

### 5.1 MyBatis
- 半自动 ORM，SQL 灵活、易于调优
- 需手写 SQL 与 XML 映射

### 5.2 Hibernate
- 全自动 ORM，支持 HQL、自动建表、缓存
- 配置复杂，学习曲线较高

### 5.3 JPA（Java Persistence API）
- Java 官方 ORM 规范，常见实现有 Hibernate、EclipseLink
- 注解驱动，易于集成 Spring

| 框架      | 自动化程度 | SQL 灵活性 | 学习曲线 | 生态集成 |
|-----------|------------|------------|----------|----------|
| MyBatis   | 中         | 高         | 低       | 好       |
| Hibernate | 高         | 中         | 高       | 好       |
| JPA       | 高         | 中         | 中       | 极好     |

---

## 6. 典型代码示例

### 6.1 MyBatis 查询示例
```xml
<!-- UserMapper.xml -->
<select id="selectUser" resultType="User">
  SELECT id, name FROM user WHERE id = #{id}
</select>
```

```java
// UserMapper.java
User user = userMapper.selectUser(1);
```

### 6.2 Hibernate 注解实体
```java
import javax.persistence.*;
/**
 * 用户实体
 */
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    // getter/setter
}
```

---

## 7. 常见易错点
- 连接未关闭导致数据库连接池耗尽
- SQL 注入风险，参数拼接不安全
- ORM 映射不一致导致运行时异常
- 事务未正确提交或回滚

---

## 8. 进阶拓展
- 分布式事务与 XA 协议
- 数据库连接池（如 Druid、HikariCP）
- 动态 SQL 与批量操作
- ORM 性能调优与缓存机制
- Spring Data JPA 与 Spring Boot 集成

---

## 9. 参考资料
- [JDBC 官方文档](https://docs.oracle.com/javase/tutorial/jdbc/)
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/zh/index.html)
- [Hibernate 官方文档](https://hibernate.org/orm/documentation/)
- [Spring Data JPA 官方文档](https://spring.io/projects/spring-data-jpa)
- 《深入浅出 MyBatis》
- 《Java 持久层技术内幕》

## 目录
- [JDBC 基础与进阶](#jdbc-基础与进阶)
- [主流数据库支持](#主流数据库支持)
- [数据库连接池详解](#数据库连接池详解)
- [ORM 框架对比与选择](#orm-框架对比与选择)
- [MyBatis 全面细化](#mybatis-全面细化)
- [Hibernate 全面细化](#hibernate-全面细化)
- [JPA 全面细化](#jpa-全面细化)
- [事务管理与传播机制](#事务管理与传播机制)
- [数据库迁移与版本管理](#数据库迁移与版本管理)
- [数据库开发最佳实践](#数据库开发最佳实践)
- [数据库安全性](#数据库安全性)
- [常见问题 FAQ](#常见问题-faq)

---

## JDBC 基础与进阶

- JDBC（Java Database Connectivity）是 Java 操作数据库的标准 API。
- 步骤：加载驱动、建立连接、执行 SQL、处理结果、关闭资源。
- 支持预编译、批量操作、事务控制。

```java
import java.sql.*;
// 1. 加载驱动（新版可省略）
// Class.forName("com.mysql.cj.jdbc.Driver");
// 2. 建立连接
Connection conn = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC", "root", "password");
// 3. 创建 Statement
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM user");
while (rs.next()) {
    System.out.println(rs.getString("name"));
}
rs.close();
stmt.close();
conn.close();
```

### 预编译与防注入

```java
String sql = "SELECT * FROM user WHERE name = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, "小胖");
ResultSet rs = ps.executeQuery();
```

### 批量操作

```java
PreparedStatement ps = conn.prepareStatement("INSERT INTO user(name) VALUES(?)");
for (String name : names) {
    ps.setString(1, name);
    ps.addBatch();
}
ps.executeBatch();
```

### 事务控制

```java
conn.setAutoCommit(false);
try {
    // ...多条SQL
    conn.commit();
} catch (Exception e) {
    conn.rollback();
}
```

---

## 主流数据库支持

| 数据库      | JDBC 驱动包                  | 连接字符串示例                                  |
| ----------- | ---------------------------- | ------------------------------------------------ |
| MySQL       | mysql-connector-java         | jdbc:mysql://host:port/db                        |
| PostgreSQL  | postgresql                   | jdbc:postgresql://host:port/db                   |
| Oracle      | ojdbc8/ojdbc11               | jdbc:oracle:thin:@host:port:db                   |
| SQL Server  | mssql-jdbc                   | jdbc:sqlserver://host:port;databaseName=db       |
| SQLite      | sqlite-jdbc                  | jdbc:sqlite:path/to/dbfile                       |

---

## 数据库连接池详解

- 连接池提升数据库访问性能，常用有 Druid、HikariCP、C3P0、DBCP。
- 连接池配置参数：最大/最小连接数、超时、检测、SQL 日志等。

### Druid 配置示例
```java
import com.alibaba.druid.pool.DruidDataSource;
DruidDataSource ds = new DruidDataSource();
ds.setUrl("jdbc:mysql://localhost:3306/test");
ds.setUsername("root");
ds.setPassword("password");
ds.setMaxActive(10);
ds.setInitialSize(2);
Connection conn = ds.getConnection();
```

### HikariCP 配置示例
```java
import com.zaxxer.hikari.HikariDataSource;
HikariDataSource ds = new HikariDataSource();
ds.setJdbcUrl("jdbc:mysql://localhost:3306/test");
ds.setUsername("root");
ds.setPassword("password");
Connection conn = ds.getConnection();
```

---

## ORM 框架对比与选择

| 框架      | 特点                   | 适用场景           |
|-----------|------------------------|--------------------|
| MyBatis   | SQL 灵活、易集成       | 复杂 SQL、老项目   |
| Hibernate | 全自动映射、功能强大   | 新项目、快速开发   |
| JPA       | Java 官方标准          | 规范化、可移植性   |

- MyBatis 适合对 SQL 有高度控制需求的场景。
- Hibernate/JPA 适合快速开发、自动建表、对象关系映射。

---

## MyBatis 全面细化

### 1. 配置与环境搭建
- Maven 依赖、mybatis-config.xml、数据源配置、Spring/Spring Boot 集成
```xml
<!-- pom.xml 依赖 -->
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>2.3.1</version>
</dependency>
```
```xml
<!-- mybatis-config.xml -->
<configuration>
  <settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
  </settings>
</configuration>
```

### 2. 实体映射与注解详解
- resultMap、association、collection、@Results、@One、@Many
```xml
<resultMap id="userMap" type="User">
  <id property="id" column="id"/>
  <result property="name" column="name"/>
  <association property="address" javaType="Address"/>
  <collection property="roles" ofType="Role"/>
</resultMap>
```
```java
@Mapper
public interface UserMapper {
  @Results({
    @Result(property = "id", column = "id"),
    @Result(property = "name", column = "name"),
    @Result(property = "address", column = "address_id",
      one = @One(select = "com.example.AddressMapper.selectById")),
    @Result(property = "roles", column = "id",
      many = @Many(select = "com.example.RoleMapper.selectByUserId"))
  })
  @Select("SELECT * FROM user WHERE id = #{id}")
  User selectUser(int id);
}
```

### 3. CRUD 操作
- XML/注解单表增删改查、批量操作
```xml
<insert id="insertUser" parameterType="User">
  INSERT INTO user(name) VALUES(#{name})
</insert>
<update id="updateUser" parameterType="User">
  UPDATE user SET name=#{name} WHERE id=#{id}
</update>
<delete id="deleteUser" parameterType="int">
  DELETE FROM user WHERE id=#{id}
</delete>
```

### 4. 复杂查询
- 多表关联、嵌套、动态 SQL（if/choose/foreach/where/set/trim）、分页、聚合
```xml
<select id="findUsers" resultType="User">
  SELECT * FROM user
  <where>
    <if test="name != null">AND name = #{name}</if>
    <if test="age != null">AND age = #{age}</if>
  </where>
</select>
```
```xml
<select id="selectUserWithRoles" resultMap="userMap">
  SELECT u.*, r.* FROM user u
  LEFT JOIN user_role ur ON u.id=ur.user_id
  LEFT JOIN role r ON ur.role_id=r.id
  WHERE u.id=#{id}
</select>
```

### 5. 插件与扩展
- 分页插件 PageHelper、一级/二级缓存、自定义拦截器、乐观锁
```java
PageHelper.startPage(1, 10);
List<User> users = userMapper.findUsers();
```

### 6. 性能优化与调优
- SQL 日志、慢 SQL 分析、参数映射优化、缓存配置

### 7. 与 Spring/Spring Boot 集成
- @MapperScan、自动注入、事务管理
```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class App {}
```

### 8. 常见问题与调试
- N+1 问题、懒加载、缓存失效、参数传递错误、SQL 注入防护

---

## Hibernate 全面细化

### 1. 配置与环境搭建
- Maven 依赖、hibernate.cfg.xml、Spring/Spring Boot 集成
```xml
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-core</artifactId>
  <version>5.6.15.Final</version>
</dependency>
```
```xml
<!-- hibernate.cfg.xml -->
<hibernate-configuration>
  <session-factory>
    <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
    <property name="hibernate.hbm2ddl.auto">update</property>
    <property name="hibernate.show_sql">true</property>
  </session-factory>
</hibernate-configuration>
```

### 2. 实体映射与注解详解
- @Entity、@Table、@Id、@GeneratedValue、@Column、@OneToOne、@OneToMany、@ManyToOne、@ManyToMany、复合主键、枚举、嵌套对象
```java
@Entity
@Table(name = "user")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column(nullable = false, length = 32)
  private String name;
  @OneToMany(mappedBy = "user")
  private List<Role> roles;
}
```

### 3. CRUD 操作
- Session API、save/update/delete/get/load、批量操作
```java
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();
User user = new User();
user.setName("小胖");
session.save(user);
tx.commit();
session.close();
```

### 4. 复杂查询
- HQL、Criteria、原生 SQL、多表关联、聚合、分页、投影
```java
List<User> users = session.createQuery("from User where name=:name")
  .setParameter("name", "小胖").list();
```

### 5. 缓存与性能优化
- 一级/二级缓存、查询缓存、懒加载、抓取策略、性能调优参数

### 6. 事务与并发
- 事务管理、乐观锁/悲观锁、事务传播与隔离级别
```java
session.beginTransaction();
// ...
session.getTransaction().commit();
```

### 7. 与 Spring/Spring Boot 集成
- @EnableTransactionManagement、@Transactional、SessionFactory 注入

### 8. 常见问题与调试
- 懒加载异常、N+1 问题、实体状态、脏数据、事务失效

---

## JPA 全面细化

### 1. 配置与环境搭建
- Maven 依赖、persistence.xml、Spring Data JPA 配置
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
  <version>2.7.0</version>
</dependency>
```
```xml
<!-- persistence.xml -->
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

### 2. 实体映射与注解详解
- @Entity、@Table、@Id、@GeneratedValue、@Column、@OneToOne、@OneToMany、@ManyToOne、@ManyToMany、复合主键、枚举、嵌套对象
```java
@Entity
@Table(name = "user")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  @Column(nullable = false, length = 32)
  private String name;
  @OneToMany(mappedBy = "user")
  private List<Role> roles;
}
```

### 3. CRUD 操作
- Repository 接口、方法命名查询、@Query 注解、批量操作
```java
public interface UserRepository extends JpaRepository<User, Integer> {
  List<User> findByName(String name);
  @Query("select u from User u where u.name like %:name%")
  List<User> searchByName(@Param("name") String name);
}
```

### 4. 复杂查询
- JPQL、原生 SQL、Specification 动态查询、多表关联、分页、排序、聚合
```java
Page<User> page = userRepository.findAll(PageRequest.of(0, 10, Sort.by("id").descending()));
```

### 5. 事务与并发
- @Transactional、乐观锁/悲观锁、事务传播与隔离级别

### 6. 性能优化与调优
- 缓存、懒加载、抓取策略、查询优化

### 7. 与 Spring/Spring Boot 集成
- 自动 Repository 注入、事务管理、配置简化

### 8. 常见问题与调试
- 查询无结果、懒加载异常、事务失效、主键冲突

---

## 事务管理与传播机制

- 事务保证数据一致性，支持传播行为（REQUIRED、REQUIRES_NEW、NESTED 等）。
- Spring @Transactional 注解常用。

```java
import org.springframework.transaction.annotation.Transactional;
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
public void transfer() {
    // 转账业务逻辑
}
```

---

## 数据库迁移与版本管理

- 推荐使用 Flyway、Liquibase 进行数据库结构迁移和版本管理。

### Flyway 示例
```shell
flyway -url=jdbc:mysql://localhost:3306/test -user=root -password=xxx migrate
```
- 编写 SQL 脚本（V1__init.sql、V2__add_table.sql）

---

## 数据库开发最佳实践

- 使用参数化 SQL 防止注入
- 合理设计索引，避免全表扫描
- 读写分离、分库分表
- 定期备份、监控慢 SQL
- 代码与 SQL 分离，便于维护

---

## 数据库安全性

- 权限最小化原则，避免 root 直连
- 加密敏感数据，防止泄露
- 防止 SQL 注入、XSS、CSRF
- 定期更新数据库补丁

---

## 常见问题 FAQ

### Q1: JDBC、MyBatis、Hibernate、JPA 有什么区别？
A: JDBC 需手写 SQL，MyBatis 灵活映射，Hibernate/JPA 自动映射、开发效率高。

### Q2: 事务传播机制有哪些？
A: 常见有 REQUIRED、REQUIRES_NEW、NESTED 等，决定事务边界和嵌套行为。

### Q3: 如何做数据库迁移？
A: 推荐用 Flyway/Liquibase 管理 SQL 脚本，自动升级。

### Q4: 如何防止 SQL 注入？
A: 使用预编译参数化 SQL，ORM 框架默认防注入。

### Q5: 如何优化数据库性能？
A: 合理建索引、优化 SQL、分库分表、监控慢查询。

---

## ORM 框架深度专题

- [MyBatis 深入详解](/java/mybatis)
- [Hibernate 深入详解](/java/hibernate)
- [JPA 深入详解](/java/jpa)

> 推荐结合本主文档与上述专题文档系统学习 ORM 框架，获得从基础到进阶、从配置到调优的完整知识体系。 