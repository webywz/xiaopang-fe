/**
 * Java 测试与Mock
 * @description Java 单元测试与 Mock 框架实践
 */

# Java 测试与 Mock 详解

## 1. Java 测试基础

- **单元测试（Unit Test）**：验证最小功能单元（如方法、类）的正确性。
- **集成测试（Integration Test）**：验证多个模块/组件协作是否正确。
- **端到端测试（E2E Test）**：模拟真实用户场景，验证系统整体功能。

---

## 2. JUnit 基础与进阶

JUnit 是 Java 最流行的测试框架，支持注解、断言、测试生命周期管理。

### 2.1 基本注解
- `@Test`：标记测试方法
- `@BeforeEach` / `@AfterEach`：每个测试前/后执行
- `@BeforeAll` / `@AfterAll`：所有测试前/后执行（静态方法）
- `@Disabled`：忽略测试

### 2.2 断言
- `Assertions.assertEquals`、`assertTrue`、`assertThrows` 等

```java
import org.junit.jupiter.api.*;
/**
 * JUnit5 基本测试示例
 */
class CalculatorTest {
    @BeforeEach
    void setUp() {
        // 初始化
    }
    @Test
    void testAdd() {
        Assertions.assertEquals(3, 1 + 2);
    }
    @Test
    void testException() {
        Assertions.assertThrows(ArithmeticException.class, () -> {
            int x = 1 / 0;
        });
    }
}
```

### 2.3 参数化测试

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ParameterizedTest
@ValueSource(strings = {"小胖", "Java", "测试"})
void testWithParams(String str) {
    Assertions.assertNotNull(str);
}
```

---

## 3. Mock 技术与常用框架

- **Mock**：用虚拟对象替代真实依赖，隔离被测单元，便于测试。
- 常用框架：Mockito、PowerMock、EasyMock

### 3.1 Mockito 基本用法

```java
import static org.mockito.Mockito.*;
import org.mockito.Mockito;
import org.junit.jupiter.api.Test;

interface UserService {
    String getName(int id);
}

class UserController {
    private UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    public String hello(int id) {
        return "Hello, " + userService.getName(id);
    }
}

class UserControllerTest {
    @Test
    void testHello() {
        UserService mockService = mock(UserService.class);
        when(mockService.getName(1)).thenReturn("小胖");
        UserController controller = new UserController(mockService);
        Assertions.assertEquals("Hello, 小胖", controller.hello(1));
    }
}
```

### 3.2 Mock 场景与最佳实践
- 隔离外部依赖（如数据库、网络、第三方服务）
- 测试异常分支、边界条件
- 避免副作用（如写文件、发邮件）
- 只 Mock 你不关心的依赖，核心逻辑用真实实现

---

## 4. 常见易错点
- 忘记加 @Test 导致测试未执行
- Mock 行为未覆盖所有分支
- 断言不严谨，未覆盖边界
- 依赖未隔离导致测试不稳定
- 测试用例间有状态依赖

---

## 5. 进阶拓展
- Spring Boot 测试（@SpringBootTest、@MockBean）
- Mock 静态方法、构造器（PowerMock）
- 覆盖率分析（JaCoCo、Cobertura）
- TDD/BDD 测试驱动开发
- CI 持续集成中的自动化测试

---

## 6. 参考资料
- [JUnit5 官方文档](https://junit.org/junit5/)
- [Mockito 官方文档](https://site.mockito.org/)
- [PowerMock 官方文档](https://github.com/powermock/powermock)
- [Spring Boot 测试官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- 《测试驱动开发》
- 《Effective Unit Testing》

---

## 目录
- [单元测试（JUnit）](#单元测试junit)
- [Mock 框架（Mockito）](#mock-框架mockito)
- [集成测试](#集成测试)
- [测试覆盖率](#测试覆盖率)
- [测试最佳实践](#测试最佳实践)
- [常见问题 FAQ](#常见问题-faq)

---

## 单元测试（JUnit）

- JUnit 是 Java 最流行的单元测试框架。
- 常用注解：`@Test`、`@Before`、`@After`、`@BeforeClass`、`@AfterClass`

```java
import org.junit.Test;
import static org.junit.Assert.*;

public class MathTest {
    @Test
    public void testAdd() {
        assertEquals(5, 2 + 3);
    }
}
```

---

## Mock 框架（Mockito）

- Mockito 用于模拟依赖对象，隔离被测单元。

```java
import static org.mockito.Mockito.*;
import org.junit.Test;

public class UserServiceTest {
    @Test
    public void testGetUser() {
        UserDao mockDao = mock(UserDao.class);
        when(mockDao.getUser(1)).thenReturn(new User("小胖"));
        UserService service = new UserService(mockDao);
        assertEquals("小胖", service.getUser(1).getName());
    }
}
```

---

## 集成测试

- 集成测试关注多个模块协作，常结合 Spring Test、H2 数据库等。

```java
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest
public class AppIntegrationTest {
    // ...
}
```

---

## 测试覆盖率

- 常用工具：JaCoCo、Cobertura
- 目标：覆盖率越高越好，但也要关注测试质量

---

## 测试最佳实践

- 测试用例独立、可重复
- 命名规范、覆盖边界情况
- 持续集成自动化测试

---

## 常见问题 FAQ

### Q1: JUnit 和 TestNG 有什么区别？
A: JUnit 更主流，TestNG 功能更丰富，支持分组、依赖等。

### Q2: Mock 有什么作用？
A: Mock 用于隔离依赖，专注测试目标代码。

### Q3: 如何提升测试覆盖率？
A: 关注边界、异常、分支，结合覆盖率工具分析。

---

> 本文档持续完善，欢迎补充更多测试与 Mock 相关案例。 