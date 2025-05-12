---
title: 安全与认证
---

/**
 * SpringBoot 安全与认证
 * @description 深入讲解 Spring Security 原理、认证授权、JWT、OAuth2、CSRF、RBAC、加密、常见安全漏洞与防护、最佳实践、FAQ 等
 */

# 安全与认证

SpringBoot 集成了强大的 Spring Security 框架，支持多种认证授权方式，适合企业级安全需求。

## 1. Spring Security 原理与架构
- 基于 Servlet 过滤器链，所有请求都经过安全过滤器
- 核心组件：`AuthenticationManager`、`UserDetailsService`、`SecurityContext`、`FilterChain`
- 支持表单登录、HTTP Basic、Token、OAuth2、LDAP 等多种认证方式

## 2. 认证与授权流程
- 用户请求 -> 过滤器链 -> 认证（Authentication） -> 授权（Authorization） -> 资源访问
- 认证通过后，用户信息存储在 `SecurityContextHolder`
- 授权通过后，允许访问受保护资源

## 3. 用户体系与密码加密
- 用户信息实现 `UserDetails` 接口，持久化存储
- 密码加密推荐使用 `BCryptPasswordEncoder`
- 示例：
  ```java
  @Bean
  public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder();
  }
  ```
- 用户自定义加载：实现 `UserDetailsService#loadUserByUsername`

## 4. 配置与自定义登录
- 继承 `WebSecurityConfigurerAdapter`（Spring Security 5.7 之前）或实现 `SecurityFilterChain`（5.7+ 推荐）
- 配置登录页、登出、异常处理、静态资源放行
- 示例：
  ```java
  @Configuration
  public class SecurityConfig {
      @Bean
      public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
          http
              .authorizeHttpRequests()
                  .antMatchers("/login", "/css/**").permitAll()
                  .anyRequest().authenticated()
              .and()
              .formLogin().loginPage("/login").permitAll()
              .and()
              .logout().permitAll();
          return http.build();
      }
  }
  ```

## 5. JWT 认证机制
- 适合前后端分离、移动端、微服务
- 登录成功后生成 JWT，前端存储在 localStorage/cookie
- 每次请求携带 JWT，后端解析校验
- 推荐使用 jjwt、spring-security-oauth2-resource-server
- 示例：
  ```java
  String token = Jwts.builder()
      .setSubject(username)
      .setExpiration(new Date(System.currentTimeMillis() + 86400000))
      .signWith(SignatureAlgorithm.HS512, secret)
      .compact();
  ```

## 6. OAuth2 与单点登录（SSO）
- Spring Security 支持 OAuth2.0、OpenID Connect
- 可作为认证服务器、资源服务器、客户端
- 推荐用 spring-boot-starter-oauth2-client/resource-server
- 支持第三方登录（微信、GitHub、企业微信等）
- 单点登录（SSO）适合多系统统一认证

## 7. CSRF 防护
- 默认开启 CSRF 防护，防止跨站请求伪造
- 表单需携带 `_csrf` token
- API 场景可关闭 CSRF 或自定义防护
- 示例：
  ```java
  http.csrf().disable(); // 仅限 API 场景
  ```

## 8. RBAC 权限模型
- 基于角色的访问控制（Role-Based Access Control）
- 配置角色、权限、菜单
- 方法级安全：`@PreAuthorize`、`@Secured`、`@RolesAllowed`
- 示例：
  ```java
  @PreAuthorize("hasRole('ADMIN')")
  public void adminOnly() {}
  ```

## 9. 方法级安全与注解
- 启用方法安全：`@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)`
- 常用注解：`@PreAuthorize`、`@PostAuthorize`、`@Secured`、`@RolesAllowed`

## 10. 加密存储与敏感信息保护
- 密码、Token、密钥等敏感信息建议加密存储
- 配合 Jasypt、KMS、环境变量等
- 日志脱敏，防止敏感信息泄露

## 11. 常见安全漏洞与防护
- **XSS**：前端输出转义，后端过滤输入
- **CSRF**：开启 CSRF 防护，Token 校验
- **SQL 注入**：使用预编译 SQL、MyBatis/JPA 参数绑定
- **暴力破解**：登录限流、验证码、IP 黑名单
- **会话劫持**：HTTPS、Cookie HttpOnly/Secure
- **敏感信息泄露**：配置脱敏、日志加密

## 12. 安全配置与最佳实践
- 静态资源、登录、注册、验证码等接口放行
- 生产环境强制 HTTPS
- 密码加密存储，Token 定期刷新
- 日志不打印敏感信息
- 定期安全扫描与渗透测试
- 依赖库及时升级，修复 CVE

## 13. 常见问题与排查
- 登录失败：检查 UserDetailsService、密码加密、认证流程
- 权限不足：检查角色、权限配置、注解
- JWT 失效：检查 Token 过期、签名、时钟同步
- 跨域失败：检查 CORS 配置、前端请求头
- CSRF 报错：表单/接口是否携带 Token

## 14. FAQ

### Q: Spring Security 和 Shiro 有什么区别？
A: Spring Security 功能更全，生态更好，适合企业级项目；Shiro 轻量级，适合中小项目。

### Q: 如何自定义登录逻辑？
A: 实现 UserDetailsService，配置自定义登录页和认证流程。

### Q: JWT 如何安全存储？
A: 推荐 HttpOnly Cookie，防止 XSS 窃取。

### Q: 如何防止接口被刷？
A: 配合限流（如 Bucket4j、Sentinel）、验证码、IP 黑名单。

---

> 安全无小事，建议结合实际业务场景，充分利用 Spring Security 能力，定期安全加固与审计。 