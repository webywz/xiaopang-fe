# Rust 实战项目

通过实际项目来学习 Rust 编程，掌握各种实用技能。

## Web 服务

### RESTful API

```rust
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
}

async fn get_users() -> impl Responder {
    let users = vec![
        User { id: 1, name: String::from("Alice") },
        User { id: 2, name: String::from("Bob") },
    ];
    HttpResponse::Ok().json(users)
}

async fn create_user(user: web::Json<User>) -> impl Responder {
    HttpResponse::Created().json(user.into_inner())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/users", web::get().to(get_users))
            .route("/users", web::post().to(create_user))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### WebSocket 聊天室

```rust
use actix_web::{web, App, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use actix::{Actor, StreamHandler};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    user: String,
    message: String,
}

struct ChatSession {
    user: String,
}

impl Actor for ChatSession {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ChatSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(text)) => {
                let message = ChatMessage {
                    user: self.user.clone(),
                    message: text.to_string(),
                };
                ctx.text(serde_json::to_string(&message).unwrap());
            }
            _ => (),
        }
    }
}

async fn chat_route(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let session = ChatSession {
        user: "Anonymous".to_string(),
    };
    ws::start(session, &req, stream)
}
```

## 命令行工具

### 文件处理工具

```rust
use clap::{App, Arg};
use std::fs;
use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let matches = App::new("file-tool")
        .version("1.0")
        .author("Your Name")
        .about("File processing tool")
        .arg(
            Arg::with_name("input")
                .short('i')
                .long("input")
                .value_name("FILE")
                .help("Input file")
                .required(true),
        )
        .arg(
            Arg::with_name("output")
                .short('o')
                .long("output")
                .value_name("FILE")
                .help("Output file")
                .required(true),
        )
        .get_matches();

    let input_path = matches.value_of("input").unwrap();
    let output_path = matches.value_of("output").unwrap();

    process_file(input_path, output_path)?;
    Ok(())
}

fn process_file(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let content = fs::read_to_string(input)?;
    let processed = content.to_uppercase();
    fs::write(output, processed)?;
    Ok(())
}
```

### 系统监控工具

```rust
use sysinfo::{System, SystemExt, ProcessExt};
use std::thread;
use std::time::Duration;

fn main() {
    let mut sys = System::new_all();
    
    loop {
        sys.refresh_all();
        
        println!("System memory: {} MB", sys.used_memory() / 1024 / 1024);
        println!("System CPU usage: {}%", sys.global_cpu_info().cpu_usage());
        
        for (pid, process) in sys.processes() {
            println!("{}: {} MB", process.name(), process.memory() / 1024 / 1024);
        }
        
        thread::sleep(Duration::from_secs(1));
    }
}
```

## 游戏开发

### 2D 游戏

```rust
use ggez::{Context, GameResult};
use ggez::graphics::{self, Color, DrawParam, Mesh, Rect};
use ggez::event::{self, EventHandler};

struct GameState {
    player: Player,
}

struct Player {
    position: [f32; 2],
    velocity: [f32; 2],
}

impl EventHandler for GameState {
    fn update(&mut self, ctx: &mut Context) -> GameResult {
        // 更新玩家位置
        self.player.position[0] += self.player.velocity[0];
        self.player.position[1] += self.player.velocity[1];
        Ok(())
    }

    fn draw(&mut self, ctx: &mut Context) -> GameResult {
        let mut canvas = graphics::Canvas::from_frame(ctx, Color::BLACK);
        
        // 绘制玩家
        let player_mesh = Mesh::new_rectangle(
            ctx,
            graphics::DrawMode::fill(),
            Rect::new(0.0, 0.0, 32.0, 32.0),
        )?;
        
        canvas.draw(
            &player_mesh,
            DrawParam::default().dest(self.player.position),
        );
        
        canvas.finish(ctx)?;
        Ok(())
    }
}
```

## 数据库应用

### ORM 示例

```rust
use diesel::prelude::*;
use diesel::pg::PgConnection;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Serialize)]
struct User {
    id: i32,
    name: String,
    email: String,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = users)]
struct NewUser {
    name: String,
    email: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = std::env::var("DATABASE_URL")?;
    let conn = PgConnection::establish(&database_url)?;
    
    // 创建用户
    let new_user = NewUser {
        name: "Alice".to_string(),
        email: "alice@example.com".to_string(),
    };
    
    diesel::insert_into(users::table)
        .values(&new_user)
        .execute(&conn)?;
    
    // 查询用户
    let users = users::table
        .filter(users::name.eq("Alice"))
        .load::<User>(&conn)?;
    
    for user in users {
        println!("Found user: {}", user.name);
    }
    
    Ok(())
}
```

## 网络应用

### TCP 服务器

```rust
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    
    while match stream.read(&mut buffer) {
        Ok(size) => {
            if size == 0 {
                false
            } else {
                stream.write(&buffer[0..size]).unwrap();
                true
            }
        }
        Err(_) => false,
    } {}
}

fn main() -> std::io::Result<()> {
    let listener = TcpListener::bind("127.0.0.1:8080")?;
    
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(|| {
                    handle_client(stream);
                });
            }
            Err(e) => {
                eprintln!("Connection failed: {}", e);
            }
        }
    }
    
    Ok(())
}
```

## 最佳实践

1. **项目结构**
   - 使用模块化设计
   - 遵循 Rust 项目约定
   - 合理组织代码

2. **错误处理**
   - 使用自定义错误类型
   - 实现错误转换
   - 提供错误上下文

3. **测试策略**
   - 单元测试
   - 集成测试
   - 性能测试

4. **文档编写**
   - 使用文档注释
   - 提供示例代码
   - 说明使用场景

## 下一步

- 探索 [系统编程](/rust/systems-programming)
- 学习 [性能优化](/rust/performance)
- 了解 [安全编程](/rust/safety) 