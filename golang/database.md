# Go语言数据库与ORM

Go语言提供了强大而灵活的数据库操作能力，从原生的数据库接口到多种功能丰富的ORM框架。本文将全面介绍Go中数据库编程的各个方面。

## 数据库/SQL基础

### 标准库database/sql

Go标准库提供了`database/sql`包，它是一个通用的SQL接口，支持多种数据库驱动：

```go
import (
    "database/sql"
    _ "github.com/go-sql-driver/mysql" // 导入MySQL驱动
)

// 连接数据库
db, err := sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/dbname")
if err != nil {
    log.Fatal(err)
}
defer db.Close()

// 执行查询
rows, err := db.Query("SELECT id, name FROM users WHERE status = ?", 1)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()

// 遍历结果
for rows.Next() {
    var id int
    var name string
    if err := rows.Scan(&id, &name); err != nil {
        log.Fatal(err)
    }
    fmt.Printf("id: %d, name: %s\n", id, name)
}
```

### 预处理语句

```go
// 准备语句以重复使用
stmt, err := db.Prepare("INSERT INTO users(name, email) VALUES(?, ?)")
if err != nil {
    log.Fatal(err)
}
defer stmt.Close()

// 多次执行
for _, user := range users {
    _, err := stmt.Exec(user.Name, user.Email)
    if err != nil {
        log.Fatal(err)
    }
}
```

### 事务处理

```go
// 开始事务
tx, err := db.Begin()
if err != nil {
    log.Fatal(err)
}

// 执行多个操作
_, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, fromID)
if err != nil {
    tx.Rollback()
    log.Fatal(err)
}

_, err = tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, toID)
if err != nil {
    tx.Rollback()
    log.Fatal(err)
}

// 提交事务
err = tx.Commit()
if err != nil {
    log.Fatal(err)
}
```

### 连接池管理

Go 1.8以上版本的数据库连接池配置：

```go
db, err := sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/dbname")
if err != nil {
    log.Fatal(err)
}

// 设置最大打开连接数
db.SetMaxOpenConns(25)
// 设置最大空闲连接数
db.SetMaxIdleConns(5)
// 设置连接最大生存时间
db.SetConnMaxLifetime(5 * time.Minute)
```

## 常见数据库驱动

Go支持多种数据库系统，每种都有对应的驱动：

### MySQL

```go
import (
    _ "github.com/go-sql-driver/mysql"
)

dsn := "user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
db, err := sql.Open("mysql", dsn)
```

### PostgreSQL

```go
import (
    _ "github.com/lib/pq"
)

dsn := "host=localhost port=5432 user=postgres password=postgres dbname=test sslmode=disable"
db, err := sql.Open("postgres", dsn)
```

### SQLite

```go
import (
    _ "github.com/mattn/go-sqlite3"
)

db, err := sql.Open("sqlite3", "./data.db")
```

### MongoDB (非SQL数据库)

```go
import (
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
```

## 主流ORM框架

### GORM

GORM是Go语言中最流行的ORM库之一，提供了丰富的特性：

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
)

// 定义模型
type User struct {
    ID        uint   `gorm:"primaryKey"`
    Name      string
    Email     string `gorm:"uniqueIndex"`
    Age       int
    CreatedAt time.Time
    UpdatedAt time.Time
}

// 连接数据库
dsn := "user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
if err != nil {
    panic("failed to connect database")
}

// 迁移schema
db.AutoMigrate(&User{})

// 创建
db.Create(&User{Name: "张三", Email: "zhangsan@example.com", Age: 18})

// 查询
var user User
db.First(&user, 1)                  // 根据主键查找
db.First(&user, "name = ?", "张三")   // 根据条件查找

// 更新
db.Model(&user).Update("Name", "李四")
// 更新多个字段
db.Model(&user).Updates(User{Name: "李四", Age: 23})
// 只更新非零值字段
db.Model(&user).Updates(map[string]interface{}{"Name": "李四", "Age": 23})

// 删除
db.Delete(&user, 1)
```

#### GORM高级特性

##### 关联关系

```go
// 一对多关系
type User struct {
    ID      uint
    Name    string
    Articles []Article // 一个用户有多篇文章
}

type Article struct {
    ID     uint
    Title  string
    Content string
    UserID uint // 外键
}

// 预加载关联数据
var user User
db.Preload("Articles").First(&user, 1)

// 关联查询
var articles []Article
db.Model(&user).Association("Articles").Find(&articles)
```

##### 事务处理

```go
err := db.Transaction(func(tx *gorm.DB) error {
    // 在事务中执行多个数据库操作
    if err := tx.Create(&user).Error; err != nil {
        return err
    }
    
    if err := tx.Create(&article).Error; err != nil {
        return err
    }
    
    return nil
})
```

##### 钩子函数

```go
type User struct {
    // ...字段定义
    Password string
}

// 保存前的钩子
func (u *User) BeforeSave(tx *gorm.DB) (err error) {
    if u.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
        if err != nil {
            return err
        }
        u.Password = string(hashedPassword)
    }
    return
}
```

### Ent - Facebook的实体框架

Ent是Facebook开发的一个强大的实体框架，使用代码生成和强类型接口：

```go
// 安装ent
// go get -d entgo.io/ent/cmd/ent
// 生成schema: go run -mod=mod entgo.io/ent/cmd/ent init User

// schema/user.go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
    ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
    return []ent.Field{
        field.String("name").
            Default("unknown"),
        field.Int("age").
            Positive(),
        field.String("email").
            Unique(),
    }
}
```

生成代码并使用：

```go
// 生成代码: go generate ./ent

import (
    "context"
    "log"
    
    "<your-project>/ent"
    "<your-project>/ent/user"
)

func main() {
    client, err := ent.Open("sqlite3", "file:ent.db?mode=memory&cache=shared&_fk=1")
    if err != nil {
        log.Fatalf("failed opening connection to sqlite: %v", err)
    }
    defer client.Close()
    
    ctx := context.Background()
    // 运行自动迁移
    if err := client.Schema.Create(ctx); err != nil {
        log.Fatalf("failed creating schema resources: %v", err)
    }
    
    // 创建用户
    u, err := client.User.
        Create().
        SetName("张三").
        SetAge(30).
        SetEmail("zhangsan@example.com").
        Save(ctx)
    if err != nil {
        log.Fatalf("failed creating user: %v", err)
    }
    
    // 查询用户
    users, err := client.User.
        Query().
        Where(user.NameEQ("张三")).
        All(ctx)
    if err != nil {
        log.Fatalf("failed querying user: %v", err)
    }
    log.Println("user:", users)
}
```

### XORM

XORM是一个简单而强大的ORM库：

```go
import (
    _ "github.com/mattn/go-sqlite3"
    "xorm.io/xorm"
)

// 定义结构体
type User struct {
    Id      int64
    Name    string
    Age     int
    Created time.Time `xorm:"created"`
    Updated time.Time `xorm:"updated"`
}

// 创建引擎
engine, err := xorm.NewEngine("sqlite3", "./test.db")
if err != nil {
    log.Fatal(err)
}

// 同步结构体到数据库
err = engine.Sync2(new(User))
if err != nil {
    log.Fatal(err)
}

// 插入数据
user := &User{Name: "张三", Age: 28}
affected, err := engine.Insert(user)

// 查询
var users []User
err = engine.Where("age > ?", 20).Find(&users)

// 更新
user.Name = "李四"
affected, err = engine.ID(user.Id).Update(user)

// 删除
affected, err = engine.ID(user.Id).Delete(new(User))
```

### SQLBoiler

SQLBoiler是一个基于代码生成的ORM库，专注于性能：

```go
// 通过配置文件生成模型
// sqlboiler mysql --output models --pkgname models

import (
    "context"
    "database/sql"
    
    "github.com/volatiletech/sqlboiler/v4/boil"
    "github.com/volatiletech/sqlboiler/v4/queries/qm"
    
    "<your-project>/models"
)

func main() {
    db, err := sql.Open("mysql", "user:password@tcp(localhost:3306)/dbname")
    if err != nil {
        panic(err)
    }
    
    // 设置为全局数据库句柄
    boil.SetDB(db)
    
    ctx := context.Background()
    
    // 插入
    user := models.User{
        Name: "张三",
        Email: "zhangsan@example.com",
    }
    err = user.Insert(ctx, db, boil.Infer())
    
    // 查询 - 使用链式API
    users, err := models.Users(
        qm.Where("age > ?", 18),
        qm.OrderBy("created_at desc"),
        qm.Limit(10),
    ).All(ctx, db)
    
    // 更新
    user.Name = "李四"
    _, err = user.Update(ctx, db, boil.Infer())
    
    // 删除
    _, err = user.Delete(ctx, db)
}
```

## 数据库实践最佳方案

### 数据迁移管理

使用工具管理数据库迁移：

```go
// 使用 golang-migrate
// go get -u github.com/golang-migrate/migrate/v4/cmd/migrate

// 创建迁移文件
// migrate create -ext sql -dir migrations -seq create_users_table

// 在Go代码中应用迁移
import (
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/mysql"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)

func applyMigrations() error {
    m, err := migrate.New(
        "file://migrations",
        "mysql://user:password@tcp(localhost:3306)/dbname",
    )
    if err != nil {
        return err
    }
    
    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        return err
    }
    
    return nil
}
```

### 仓储模式

使用仓储模式分离数据访问逻辑：

```go
// 定义接口
type UserRepository interface {
    Get(id int64) (*User, error)
    List(limit, offset int) ([]*User, error)
    Create(user *User) error
    Update(user *User) error
    Delete(id int64) error
}

// GORM实现
type UserGormRepository struct {
    db *gorm.DB
}

func NewUserGormRepository(db *gorm.DB) UserRepository {
    return &UserGormRepository{db: db}
}

func (r *UserGormRepository) Get(id int64) (*User, error) {
    var user User
    result := r.db.First(&user, id)
    return &user, result.Error
}

// ... 其他方法实现
```

### 数据库连接管理

使用依赖注入管理数据库连接：

```go
import (
    "github.com/google/wire"
)

// 定义提供数据库连接的函数
func ProvideDB() (*gorm.DB, error) {
    dsn := "user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True"
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err
    }
    
    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db, nil
}

// 使用wire进行依赖注入
var ProviderSet = wire.NewSet(
    ProvideDB,
    NewUserGormRepository,
    wire.Bind(new(UserRepository), new(*UserGormRepository)),
)
```

### 数据库分片与读写分离

```go
// 使用gorm的多数据库连接功能
type DBResolver struct {
    Write *gorm.DB
    Reads []*gorm.DB
}

func NewDBResolver() (*DBResolver, error) {
    // 写库连接
    writeDSN := "user:password@tcp(master.example.com:3306)/dbname"
    writeDB, err := gorm.Open(mysql.Open(writeDSN), &gorm.Config{})
    if err != nil {
        return nil, err
    }
    
    // 读库连接
    var readDBs []*gorm.DB
    readDSNs := []string{
        "user:password@tcp(slave1.example.com:3306)/dbname",
        "user:password@tcp(slave2.example.com:3306)/dbname",
    }
    
    for _, dsn := range readDSNs {
        db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
        if err != nil {
            return nil, err
        }
        readDBs = append(readDBs, db)
    }
    
    return &DBResolver{
        Write: writeDB,
        Reads: readDBs,
    }, nil
}

// 使用读写分离
func (r *DBResolver) DB() *gorm.DB {
    if rand.Intn(100) < 80 { // 80%的读操作
        return r.Reads[rand.Intn(len(r.Reads))]
    }
    return r.Write
}
```

## 性能优化与监控

### 查询优化

```go
// 使用索引
db.Model(&User{}).Where("name = ? AND age > ?", "张三", 18).Find(&users)

// 仅选择需要的字段
db.Model(&User{}).Select("id", "name").Find(&users)

// 避免N+1查询问题，使用预加载
db.Preload("Articles").Preload("Profile").Find(&users)

// 分批处理大量数据
db.Model(&User{}).FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
    for _, result := range results {
        // 批量处理结果...
    }
    return nil
})
```

### 连接池监控

```go
import (
    "time"
    "github.com/prometheus/client_golang/prometheus"
)

// 定义指标
var (
    dbConnections = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "db_connections",
            Help: "数据库连接数",
        },
        []string{"state"},
    )
)

func init() {
    // 注册指标
    prometheus.MustRegister(dbConnections)
}

// 监控数据库连接
func monitorDBPool(db *sql.DB) {
    ticker := time.NewTicker(15 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        stats := db.Stats()
        dbConnections.WithLabelValues("idle").Set(float64(stats.Idle))
        dbConnections.WithLabelValues("inUse").Set(float64(stats.InUse))
        dbConnections.WithLabelValues("open").Set(float64(stats.OpenConnections))
    }
}
```

## 安全最佳实践

### 防止SQL注入

```go
// 使用参数化查询
db.Where("name = ?", userInput).Find(&users)

// 避免直接拼接SQL字符串
// 错误示例
db.Raw("SELECT * FROM users WHERE name = " + userInput).Scan(&users)
```

### 密码存储

```go
import "golang.org/x/crypto/bcrypt"

// 加密密码
func hashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}

// 验证密码
func checkPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### 敏感数据处理

```go
// 使用标签控制序列化行为
type User struct {
    ID       uint
    Username string
    Password string `json:"-" gorm:"->;<-:create"` // 创建时可写入，但不可读取，不序列化到JSON
    Email    string `gorm:"uniqueIndex"`
}
```

## 实战案例

### 构建完整的数据访问层

```go
// 领域模型
type Product struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Price       float64   `json:"price"`
    Stock       int       `json:"stock"`
    CategoryID  uint      `json:"category_id"`
    Category    Category  `json:"category" gorm:"foreignKey:CategoryID"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// 仓储接口
type ProductRepository interface {
    FindByID(id uint) (*Product, error)
    FindAll(page, pageSize int) ([]*Product, int64, error)
    FindByCategory(categoryID uint) ([]*Product, error)
    Create(product *Product) error
    Update(product *Product) error
    Delete(id uint) error
}

// GORM实现
type ProductGormRepository struct {
    db *gorm.DB
}

func NewProductGormRepository(db *gorm.DB) ProductRepository {
    return &ProductGormRepository{db: db}
}

func (r *ProductGormRepository) FindByID(id uint) (*Product, error) {
    var product Product
    result := r.db.Preload("Category").First(&product, id)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, ErrProductNotFound
        }
        return nil, result.Error
    }
    return &product, nil
}

func (r *ProductGormRepository) FindAll(page, pageSize int) ([]*Product, int64, error) {
    var products []*Product
    var count int64
    
    offset := (page - 1) * pageSize
    
    // 获取总数
    if err := r.db.Model(&Product{}).Count(&count).Error; err != nil {
        return nil, 0, err
    }
    
    // 分页查询
    if err := r.db.Preload("Category").Offset(offset).Limit(pageSize).Find(&products).Error; err != nil {
        return nil, 0, err
    }
    
    return products, count, nil
}

// ... 其他方法实现

// 服务层
type ProductService struct {
    repo ProductRepository
}

func NewProductService(repo ProductRepository) *ProductService {
    return &ProductService{repo: repo}
}

func (s *ProductService) GetProduct(id uint) (*Product, error) {
    return s.repo.FindByID(id)
}

func (s *ProductService) CreateProduct(product *Product) error {
    // 业务逻辑验证
    if product.Price <= 0 {
        return errors.New("price must be positive")
    }
    
    if product.Stock < 0 {
        return errors.New("stock cannot be negative")
    }
    
    return s.repo.Create(product)
}

// ... 其他方法实现
```

### RESTful API集成

```go
// 使用 Gin 框架
import (
    "github.com/gin-gonic/gin"
)

// 控制器
type ProductController struct {
    service *ProductService
}

func NewProductController(service *ProductService) *ProductController {
    return &ProductController{service: service}
}

// 路由
func (c *ProductController) RegisterRoutes(router *gin.Engine) {
    products := router.Group("/api/products")
    {
        products.GET("", c.ListProducts)
        products.GET("/:id", c.GetProduct)
        products.POST("", c.CreateProduct)
        products.PUT("/:id", c.UpdateProduct)
        products.DELETE("/:id", c.DeleteProduct)
    }
}

// 处理函数
func (c *ProductController) GetProduct(ctx *gin.Context) {
    id := ctx.Param("id")
    productID, err := strconv.ParseUint(id, 10, 64)
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }
    
    product, err := c.service.GetProduct(uint(productID))
    if err != nil {
        if errors.Is(err, ErrProductNotFound) {
            ctx.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
            return
        }
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get product"})
        return
    }
    
    ctx.JSON(http.StatusOK, product)
}

// ... 其他处理函数
```

## 总结

Go语言提供了强大的数据库操作能力，从内置的`database/sql`接口到丰富的第三方ORM框架。选择合适的数据库操作方式应该基于项目的复杂性、性能需求和团队技能。

- 简单项目可以直接使用`database/sql`
- 中型项目可以考虑GORM或XORM等ORM框架
- 大型复杂项目可以结合使用ORM和原生SQL，或考虑Ent等更强大的框架

无论选择哪种方式，都应该遵循最佳实践，注重性能优化和安全性，使用仓储模式分离数据访问逻辑，并做好连接池管理。 