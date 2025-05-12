/**
 * MyBatis 深入详解
 * @description MyBatis 配置、映射、CRUD、复杂查询、插件、性能优化、Spring集成、常见问题
 */

# MyBatis 深入详解

## 1. 配置与环境搭建

### Maven 依赖
```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>2.3.1</version>
</dependency>
```

### mybatis-config.xml 详解
```xml
<configuration>
  <settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
    <setting name="logImpl" value="STDOUT_LOGGING"/>
  </settings>
  <typeAliases>
    <package name="com.example.model"/>
  </typeAliases>
  <plugins>
    <!-- 分页插件等 -->
  </plugins>
  <environments default="dev">
    <environment id="dev">
      <transactionManager type="JDBC"/>
      <dataSource type="POOLED">
        <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/test"/>
        <property name="username" value="root"/>
        <property name="password" value="password"/>
      </dataSource>
    </environment>
  </environments>
  <mappers>
    <package name="com.example.mapper"/>
  </mappers>
</configuration>
```

### 多数据源配置
- Spring Boot 可通过 `@Primary`、`@Qualifier` 配置多数据源，详见官方文档。

### 日志集成
- 推荐使用 log4j2/slf4j，配置 log4j2.xml 或 application.yml。

---

## 2. 实体映射与注解详解

### resultMap 复杂映射
```xml
<resultMap id="userMap" type="User">
  <id property="id" column="id"/>
  <result property="name" column="name"/>
  <association property="address" javaType="Address"
    column="address_id" select="com.example.AddressMapper.selectById"/>
  <collection property="roles" ofType="Role"
    column="id" select="com.example.RoleMapper.selectByUserId"/>
</resultMap>
```

### 枚举类型映射
- 可自定义 TypeHandler 实现枚举与数据库字段的转换。

### 注解映射
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

### 自定义 TypeHandler
```java
@MappedTypes(Gender.class)
public class GenderTypeHandler extends BaseTypeHandler<Gender> {
  // 实现 setNonNullParameter/getNullableResult
}
```

---

## 3. CRUD 操作

### XML/注解单表增删改查
```xml
<insert id="insertUser" parameterType="User" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO user(name) VALUES(#{name})
</insert>
<update id="updateUser" parameterType="User">
  UPDATE user SET name=#{name} WHERE id=#{id}
</update>
<delete id="deleteUser" parameterType="int">
  DELETE FROM user WHERE id=#{id}
</delete>
<select id="selectUser" resultType="User">
  SELECT * FROM user WHERE id=#{id}
</select>
```

### 批量操作
```xml
<insert id="batchInsert" parameterType="list">
  INSERT INTO user(name) VALUES
  <foreach collection="list" item="item" separator=",">
    (#{item.name})
  </foreach>
</insert>
```

### 返回主键
- useGeneratedKeys="true" keyProperty="id" 或 selectKey

### 乐观锁实现
- 可通过 version 字段和 update 语句实现

---

## 4. 复杂查询

### 动态 SQL
```xml
<select id="findUsers" resultType="User">
  SELECT * FROM user
  <where>
    <if test="name != null">AND name = #{name}</if>
    <if test="age != null">AND age = #{age}</if>
  </where>
</select>
```
- 支持 choose/when/otherwise/foreach/trim/set/where

### 多表关联
```xml
<select id="selectUserWithRoles" resultMap="userMap">
  SELECT u.*, r.* FROM user u
  LEFT JOIN user_role ur ON u.id=ur.user_id
  LEFT JOIN role r ON ur.role_id=r.id
  WHERE u.id=#{id}
</select>
```

### 分页插件 PageHelper
```java
PageHelper.startPage(1, 10);
List<User> users = userMapper.findUsers();
```

---

## 5. 插件与扩展

### 分页插件
- PageHelper、MyBatis-Plus 分页

### 一级/二级缓存
- 一级缓存默认开启，二级缓存需在 mapper.xml 配置 <cache/>
- 缓存失效场景：增删改、commit/rollback、不同 SqlSession

### 自定义拦截器
- 实现 Interceptor 接口，可用于 SQL 日志、数据权限等

---

## 6. 性能优化与调优

- SQL 日志、慢 SQL 分析
- 参数映射优化
- 批量操作性能陷阱
- Mapper 热加载与自动刷新

---

## 7. 与 Spring/Spring Boot 集成

- @MapperScan、自动注入、事务管理
- 多数据源动态切换
- 与 Spring Data 生态集成

---

## 8. 常见问题与调试

- N+1 查询问题与解决
- 懒加载异常、缓存失效、参数丢失
- SQL 注入防护与安全最佳实践

---

> 本文档持续完善，欢迎补充更多 MyBatis 实战案例与最佳实践。 