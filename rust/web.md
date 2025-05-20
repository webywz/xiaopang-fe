# Rust Web 开发

Rust 提供了多个优秀的 Web 开发框架和工具，可以构建高性能的 Web 应用。

## Web 框架

### Actix-web

```rust
use actix_web::{web, App, HttpResponse, HttpServer, Responder};

async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### Rocket

```rust
#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
```

### Axum

```rust
use axum::{
    routing::get,
    Router,
};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(handler));

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handler() -> &'static str {
    "Hello, World!"
}
```

## 路由处理

### 路径参数

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

async fn user_info(path: web::Path<(u32,)>) -> HttpResponse {
    HttpResponse::Ok().body(format!("User ID: {}", path.0))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/users/{id}", web::get().to(user_info))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### 查询参数

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

async fn search(query: web::Query<SearchQuery>) -> HttpResponse {
    HttpResponse::Ok().body(format!(
        "Searching for: {}, page: {}",
        query.q, query.page
    ))
}

#[derive(serde::Deserialize)]
struct SearchQuery {
    q: String,
    page: Option<u32>,
}
```

## 请求处理

### JSON 处理

```rust
use actix_web::{web, App, HttpResponse, HttpServer};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    name: String,
    email: String,
}

async fn create_user(user: web::Json<User>) -> HttpResponse {
    HttpResponse::Ok().json(user.0)
}
```

### 表单处理

```rust
use actix_web::{web, App, HttpResponse, HttpServer};
use serde::Deserialize;

#[derive(Deserialize)]
struct LoginForm {
    username: String,
    password: String,
}

async fn login(form: web::Form<LoginForm>) -> HttpResponse {
    HttpResponse::Ok().body(format!(
        "Welcome {}!",
        form.username
    ))
}
```

## 中间件

### 日志中间件

```rust
use actix_web::{middleware, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .route("/", web::get().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### 认证中间件

```rust
use actix_web::{dev::ServiceRequest, Error, middleware};
use actix_web::dev::ServiceResponse;

async fn auth_middleware(
    req: ServiceRequest,
    srv: &actix_web::dev::Service,
) -> Result<ServiceResponse, Error> {
    // 实现认证逻辑
    srv.call(req).await
}
```

## 数据库集成

### SQLx

```rust
use sqlx::postgres::PgPool;

async fn get_users(pool: web::Data<PgPool>) -> HttpResponse {
    let users = sqlx::query!("SELECT * FROM users")
        .fetch_all(&**pool)
        .await
        .unwrap();
    
    HttpResponse::Ok().json(users)
}
```

### Diesel

```rust
use diesel::prelude::*;
use diesel::pg::PgConnection;

fn establish_connection() -> PgConnection {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .expect("Error connecting to database")
}
```

## 模板引擎

### Tera

```rust
use actix_web::{web, App, HttpResponse, HttpServer};
use tera::Tera;

async fn index(tmpl: web::Data<Tera>) -> HttpResponse {
    let mut ctx = tera::Context::new();
    ctx.insert("name", "World");
    
    let rendered = tmpl.render("index.html", &ctx)
        .unwrap();
    
    HttpResponse::Ok().body(rendered)
}
```

## WebSocket

```rust
use actix_web::{web, App, Error, HttpServer};
use actix_web_actors::ws;

async fn ws_route(req: web::HttpRequest, stream: web::Payload) -> Result<web::HttpResponse, Error> {
    ws::start(MyWebSocket::new(), &req, stream)
}

struct MyWebSocket {
    // WebSocket 状态
}

impl MyWebSocket {
    fn new() -> Self {
        MyWebSocket {}
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        // 处理 WebSocket 消息
    }
}
```

## 最佳实践

1. **错误处理**
   - 使用自定义错误类型
   - 实现错误转换
   - 提供有意义的错误信息

2. **安全性**
   - 实现 CSRF 保护
   - 使用 HTTPS
   - 实现速率限制

3. **性能优化**
   - 使用连接池
   - 实现缓存
   - 异步处理

## 下一步

- 了解 [系统编程](/rust/systems-programming)
- 探索 [性能优化](/rust/performance)
- 学习 [安全编程](/rust/safety) 