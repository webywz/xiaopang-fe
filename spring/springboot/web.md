---
title: Web开发
---

/**
 * SpringBoot Web开发
 * @description 深入讲解 SpringBoot Web 应用开发，包括 Controller 设计、Restful 规范、参数校验、请求响应、全局异常、静态资源、拦截器/过滤器、CORS、文件上传/下载、接口幂等性、接口文档、接口安全、性能优化、常见问题与最佳实践、FAQ
 */

# Web开发

SpringBoot 提供了极为便捷的 Web 应用开发体验，支持 RESTful API、MVC、静态资源、文件上传、拦截器等全套能力，适合企业级项目。

## 1. Controller 设计与 RESTful 规范

### 1.1 Controller 基本用法
```java
@RestController
@RequestMapping("/api")
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, SpringBoot!";
    }
}
```

### 1.2 RESTful 设计规范
- 路径用名词，资源层级用斜杠分隔，如 `/api/users/1/orders`
- GET 查询、POST 新增、PUT 更新、DELETE 删除
- 状态码语义化：200 成功、201 新建、204 无内容、400 参数错误、401 未授权、403 禁止、404 未找到、500 服务器错误
- 推荐统一响应结构（如 code、msg、data）

### 1.3 参数校验
- 使用 `@Valid`、`@Validated` 注解，结合 JSR-303/JSR-380
- 常用注解：`@NotNull`、`@Size`、`@Email`、`@Pattern`
- 示例：
  ```java
  public class UserDTO {
      @NotNull private String username;
      @Email private String email;
      // ...
  }
  @PostMapping("/user")
  public Result createUser(@Valid @RequestBody UserDTO user) { ... }
  ```

### 1.4 路由与参数绑定
- `@RequestParam`：请求参数
- `@PathVariable`：路径参数
- `@RequestBody`：JSON 请求体
- `@RequestHeader`：请求头
- `@CookieValue`：Cookie

### 1.5 分页与排序
- 推荐 PageHelper、Spring Data Pageable
- 示例：
  ```java
  @GetMapping("/users")
  public Page<User> list(@RequestParam int page, @RequestParam int size) { ... }
  ```

## 2. 请求与响应进阶

### 2.1 自定义请求头、响应头
- 通过 `@RequestHeader` 获取，`ResponseEntity` 设置

### 2.2 文件下载、流式响应
- 返回 `ResponseEntity<Resource>`，设置 Content-Disposition
- 支持大文件分片下载、断点续传

### 2.3 统一响应结构
- 推荐封装 Result/ApiResponse 类，统一 code/msg/data
- 示例：
  ```java
  public class Result<T> {
      private int code;
      private String msg;
      private T data;
      // getter/setter
  }
  ```

## 3. 全局异常处理

### 3.1 @ControllerAdvice + @ExceptionHandler
- 捕获所有 Controller 层异常，返回统一结构
- 支持自定义异常类、业务异常码
- 示例：
  ```java
  @ControllerAdvice
  public class GlobalExceptionHandler {
      @ExceptionHandler(BizException.class)
      public Result handleBiz(BizException ex) {
          return Result.fail(ex.getCode(), ex.getMessage());
      }
      @ExceptionHandler(Exception.class)
      public Result handle(Exception ex) {
          return Result.fail(500, ex.getMessage());
      }
  }
  ```

### 3.2 常见异常类型
- 参数校验异常（MethodArgumentNotValidException）
- 业务异常（自定义 BizException）
- 404/405/500 等全局异常

## 4. 静态资源管理
- 默认静态资源目录：`src/main/resources/static/`
- 访问 `/static/logo.png` 可通过 `/logo.png` 直接访问
- 支持自定义静态资源路径、缓存策略、CDN 加速
- 推荐前后端分离，静态资源独立部署

## 5. 拦截器与过滤器

### 5.1 拦截器（HandlerInterceptor）
- 用于登录校验、权限控制、日志埋点、接口限流
- 注册到 WebMvcConfigurer
- 支持 preHandle、postHandle、afterCompletion

### 5.2 过滤器（Filter）
- 用于请求预处理、XSS 防护、全局日志
- 注册为 Bean 或 @WebFilter

### 5.3 示例
```java
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        // ...
        return true;
    }
}
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor()).addPathPatterns("/api/**");
    }
}
```

## 6. 跨域资源共享（CORS）
- 支持全局/局部跨域配置
- 推荐用 WebMvcConfigurer 配置全局 CORS
- 支持指定域名、方法、头部、凭证
- 示例：
  ```java
  @Configuration
  public class CorsConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/**")
              .allowedOrigins("https://yourdomain.com")
              .allowedMethods("GET", "POST", "PUT", "DELETE")
              .allowCredentials(true);
      }
  }
  ```

## 7. 文件上传与下载

### 7.1 文件上传
- 依赖 `spring-boot-starter-web`
- 配置最大文件大小：`spring.servlet.multipart.max-file-size=10MB`
- Controller 方法参数用 `MultipartFile`
- 支持多文件上传、断点续传、分片上传
- 示例：
  ```java
  @PostMapping("/upload")
  public Result upload(@RequestParam("file") MultipartFile file) {
      // ...
      return Result.success();
  }
  ```

### 7.2 文件下载
- 返回 `ResponseEntity<Resource>`，设置 Content-Disposition
- 支持大文件分片下载

## 8. 接口幂等性
- 幂等 Token、唯一索引、状态机
- 防止重复提交、支付、下单
- 推荐用拦截器+Redis 实现

## 9. 接口文档与自动化测试
- 推荐 Swagger（springfox-swagger2、springdoc-openapi）
- 自动生成接口文档、支持在线调试
- 示例：
  ```java
  @ApiOperation("创建用户")
  @PostMapping("/user")
  public Result createUser(@RequestBody UserDTO user) { ... }
  ```
- 推荐 Postman、RestAssured 做接口自动化测试

## 10. 接口安全
- JWT 认证、RBAC 权限、接口签名、限流、验证码
- 防止 XSS、CSRF、SQL 注入
- HTTPS 强制、敏感信息脱敏
- 日志审计、异常报警

## 11. 性能优化
- GZIP 压缩、缓存控制、CDN 加速
- 异步处理（@Async）、线程池、消息队列
- 数据库分页、懒加载、批量操作
- 慢查询分析、接口监控（Actuator、Prometheus）

## 12. 常见问题与排查
- 404/405：检查路由、HTTP 方法、静态资源路径
- 参数绑定失败：检查注解、类型、JSON 格式
- 跨域失败：检查 CORS 配置、前端请求头
- 文件上传失败：检查依赖、配置、前端表单
- 响应慢：排查数据库、网络、代码性能

## 13. 最佳实践
- 路由统一加前缀，便于管理
- Controller 层只做参数校验和分发，业务逻辑下沉到 Service
- 异常统一处理，返回结构标准化
- 静态资源与接口分离，便于前后端协作
- 接口文档自动生成，便于前后端联调
- 安全、性能、监控全流程覆盖

## 14. FAQ

### Q: 如何自定义 404/500 错误页面？
A: 在 `resources/public` 目录下放置 `error/404.html`、`error/500.html` 即可。

### Q: 如何实现接口版本管理？
A: 路由加版本前缀，如 `/api/v1/user`，或用自定义注解实现。

### Q: 如何保证接口幂等性？
A: 推荐用幂等 Token、唯一索引、状态机，结合 Redis/数据库实现。

### Q: 如何自动生成接口文档？
A: 推荐集成 Swagger/OpenAPI，注解生成文档，支持在线调试。

### Q: 如何防止接口被刷？
A: 配合限流（如 Bucket4j、Sentinel）、验证码、IP 黑名单。

---

> SpringBoot Web 开发能力强大，建议结合实际项目多实践，善用全局异常、拦截器、接口文档和安全手段，提升健壮性与可维护性。 