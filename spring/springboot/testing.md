---
title: 测试
---

<!-- /**
 * SpringBoot 测试
 * @description 深入讲解 SpringBoot 单元测试、集成测试、Mock、覆盖率、测试容器、数据库测试、接口自动化、CI集成、常见问题与最佳实践、FAQ
 */ -->

# 测试

SpringBoot 提供了完善的测试体系，支持单元测试、集成测试、Mock、数据库测试、接口自动化等，助力高质量交付。

## 1. 测试体系概览
- **单元测试**：验证单个类/方法的功能，隔离依赖
- **集成测试**：验证多个组件协作，启动 Spring 容器
- **端到端测试**：模拟真实用户操作，覆盖全流程

## 2. 单元测试

### 依赖与环境
- 推荐 JUnit 5（spring-boot-starter-test 默认集成）
- 常用断言库：AssertJ、Hamcrest
- Mock 框架：Mockito、EasyMock

### 示例
```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;

    @Test
    void testFindUser() {
        User user = userService.findById(1L);
        assertNotNull(user);
    }
}
```

### Mock 测试
- 使用 @MockBean 替换依赖 Bean
- 使用 Mockito.mock/when/verify
- 示例：
  ```java
  @MockBean
  private UserRepository userRepository;

  @Test
  void testMockRepo() {
      when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
      // ...
  }
  ```

## 3. 集成测试

### 启动 Spring 容器
- @SpringBootTest 启动完整应用上下文
- @WebMvcTest 只加载 MVC 相关 Bean，适合 Controller 层测试
- @DataJpaTest 只加载 JPA 相关 Bean，适合数据层测试

### 示例
```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/api/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
    }
}
```

## 4. 数据库测试
- 使用 H2、PostgreSQL TestContainer 等内存数据库
- @Transactional 保证测试数据自动回滚
- @Sql 注解预置/清理数据
- 示例：
  ```java
  @DataJpaTest
  @Sql({"classpath:sql/init.sql"})
  class UserRepositoryTest { ... }
  ```

## 5. 测试覆盖率与质量
- 推荐 JaCoCo 插件统计覆盖率
- 关注分支覆盖、条件覆盖
- 代码审查与静态分析（SonarQube、Checkstyle）

## 6. 测试容器（Testcontainers）
- 支持 Docker 容器化测试环境（如 MySQL、Redis、Kafka）
- 保证测试环境一致性，适合微服务/分布式场景
- 示例：
  ```java
  @Testcontainers
  class MySQLTest {
      @Container
      static MySQLContainer<?> mysql = new MySQLContainer<>(DockerImageName.parse("mysql:8.0"));
      // ...
  }
  ```

## 7. 接口自动化测试
- 推荐 RestAssured、Postman/Newman、HttpRunner
- 支持接口回归、性能测试、断言校验
- 可集成到 CI/CD 流程

## 8. 持续集成（CI）与自动化
- 推荐 GitHub Actions、Jenkins、GitLab CI
- 自动执行测试、生成报告、推送覆盖率
- 示例（GitHub Actions）：
  ```yaml
  - name: Run Tests
    run: mvn test
  - name: Upload Coverage
    uses: codecov/codecov-action@v3
  ```

## 9. 常见问题与排查
- 测试用例未被执行：检查 @Test 注解、包结构
- Mock 失效：检查注入方式、@MockBean/@Mock 区别
- 数据未回滚：检查 @Transactional、数据库类型
- 覆盖率低：补充边界/异常/分支测试

## 10. 最佳实践
- 单元测试与集成测试分层管理
- 业务逻辑优先单元测试，接口/流程用集成测试
- Mock 外部依赖，保证测试隔离
- 测试数据自动清理，避免污染
- 持续集成自动执行测试，保障主干质量

## 11. FAQ

### Q: @SpringBootTest 和 @WebMvcTest 有什么区别？
A: @SpringBootTest 启动完整容器，适合集成测试；@WebMvcTest 只加载 MVC 相关 Bean，适合 Controller 层测试。

### Q: 如何测试异步/定时任务？
A: 可用 Awaitility 等工具等待异步结果，定时任务可用 @TestableScheduler 控制。

### Q: 如何保证测试数据不污染生产？
A: 使用内存数据库、@Transactional 自动回滚、@Sql 预置/清理。

---

> 测试是高质量交付的基石，建议单元测试+集成测试+自动化结合，持续提升代码健壮性与可维护性。 