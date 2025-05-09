# Go语言标准库

Go语言提供了丰富的标准库，可以满足大多数开发需求。以下是一些常用标准库的介绍和示例。

## fmt - 格式化I/O

`fmt`包实现了格式化I/O，类似于C的printf和scanf。

```go
// 打印到标准输出
fmt.Println("你好，世界！")
fmt.Print("无换行打印")
fmt.Printf("格式化打印: %d, %s, %.2f\n", 10, "字符串", 3.14159)

// 格式化字符串
s := fmt.Sprintf("格式化字符串: %d, %s", 42, "Go")

// 扫描标准输入
var name string
var age int
fmt.Print("请输入姓名和年龄: ")
fmt.Scanln(&name, &age)
fmt.Printf("你好，%s，你的年龄是 %d\n", name, age)

// 常用格式化占位符
fmt.Printf("整数: %d\n", 42)
fmt.Printf("十六进制: %x\n", 42)
fmt.Printf("浮点数: %f\n", 3.14)
fmt.Printf("科学记数法: %e\n", 1000000.0)
fmt.Printf("字符串: %s\n", "Go语言")
fmt.Printf("布尔值: %t\n", true)
fmt.Printf("指针: %p\n", &age)
fmt.Printf("类型: %T\n", 3.14)
fmt.Printf("通用格式: %v\n", []int{1, 2, 3})
fmt.Printf("带字段名的结构体: %+v\n", struct{Name string; Age int}{"张三", 30})
fmt.Printf("Go语法格式: %#v\n", []int{1, 2, 3})
```

## strings - 字符串操作

`strings`包提供了许多操作字符串的函数。

```go
import "strings"

// 字符串包含、前缀、后缀
contains := strings.Contains("Go语言", "语言")    // true
hasPrefix := strings.HasPrefix("Go语言", "Go")  // true
hasSuffix := strings.HasSuffix("Go语言", "语言")  // true

// 计数
count := strings.Count("Go Go Go", "Go")  // 3

// 查找
index := strings.Index("Go语言", "语言")      // 2
lastIndex := strings.LastIndex("Go Go", "Go")  // 3

// 分割和连接
parts := strings.Split("a,b,c", ",")       // ["a", "b", "c"]
joined := strings.Join([]string{"a", "b", "c"}, "-")  // "a-b-c"

// 重复
repeated := strings.Repeat("Go", 3)  // "GoGoGo"

// 替换
replaced := strings.Replace("ooo", "o", "a", 2)  // "aao"
allReplaced := strings.ReplaceAll("ooo", "o", "a")  // "aaa"

// 转换
upper := strings.ToUpper("go")  // "GO"
lower := strings.ToLower("GO")  // "go"
title := strings.Title("go language")  // "Go Language"

// 裁剪
trimmed := strings.Trim("  Go  ", " ")  // "Go"
trimmedLeft := strings.TrimLeft("  Go  ", " ")  // "Go  "
trimmedRight := strings.TrimRight("  Go  ", " ")  // "  Go"
trimmedPrefix := strings.TrimPrefix("GoGo", "Go")  // "Go"
trimmedSuffix := strings.TrimSuffix("GoGo", "Go")  // "Go"

// 比较
eq := strings.EqualFold("Go", "go")  // true, 不区分大小写比较

// 字符串生成器
var builder strings.Builder
builder.WriteString("Go")
builder.WriteString("语言")
result := builder.String()  // "Go语言"
```

## strconv - 字符串转换

`strconv`包实现了基本数据类型和字符串之间的转换。

```go
import "strconv"

// 字符串转整数
i, err := strconv.Atoi("42")
if err != nil {
    fmt.Println("转换错误:", err)
}

// 整数转字符串
s := strconv.Itoa(42)

// 解析布尔值
b, err := strconv.ParseBool("true")
b, err = strconv.ParseBool("1")  // 也为true

// 解析浮点数
f, err := strconv.ParseFloat("3.14", 64)

// 解析整数，第二个参数指定进制
i, err = strconv.ParseInt("42", 10, 64)  // 十进制
i, err = strconv.ParseInt("2A", 16, 64)  // 十六进制

// 格式化布尔值
s = strconv.FormatBool(true)

// 格式化浮点数
s = strconv.FormatFloat(3.14, 'f', 2, 64)  // '3.14'，f格式，2位精度

// 格式化整数
s = strconv.FormatInt(42, 10)  // 十进制
s = strconv.FormatInt(42, 16)  // 十六进制
```

## io - 基本I/O接口

`io`包提供了I/O原语的基本接口。

```go
import (
    "io"
    "os"
    "strings"
)

// 复制数据
reader := strings.NewReader("some data")
_, err := io.Copy(os.Stdout, reader)

// 按指定大小复制
buffer := make([]byte, 4)
_, err = io.CopyBuffer(os.Stdout, reader, buffer)

// 有限复制
_, err = io.CopyN(os.Stdout, reader, 4)  // 只复制4个字节

// 读取所有数据
data, err := io.ReadAll(reader)

// 使用多个Reader
readers := []io.Reader{
    strings.NewReader("first"),
    strings.NewReader("second"),
}
multiReader := io.MultiReader(readers...)
io.Copy(os.Stdout, multiReader)  // 输出"firstsecond"

// 使用多个Writer
var buf1, buf2 strings.Builder
writers := io.MultiWriter(&buf1, &buf2)
io.WriteString(writers, "Hello")  // 同时写入buf1和buf2

// 管道
r, w := io.Pipe()
go func() {
    defer w.Close()
    w.Write([]byte("pipe data"))
}()
io.Copy(os.Stdout, r)  // 输出"pipe data"

// LimitReader限制读取的字节数
limited := io.LimitReader(strings.NewReader("longer text"), 6)
io.Copy(os.Stdout, limited)  // 只输出"longer"
```

## os - 操作系统功能

`os`包提供了与操作系统交互的功能。

```go
import (
    "os"
    "fmt"
)

// 获取和设置环境变量
home := os.Getenv("HOME")
os.Setenv("GOPATH", "/usr/local/go")

// 获取命令行参数
args := os.Args  // 第一个元素是程序名称

// 工作目录
dir, err := os.Getwd()
os.Chdir("/tmp")

// 创建和删除目录
err = os.Mkdir("test", 0755)
err = os.MkdirAll("test/subdir/another", 0755)  // 递归创建
err = os.Remove("test")
err = os.RemoveAll("test")  // 递归删除

// 文件操作
file, err := os.Create("test.txt")
if err != nil {
    fmt.Println(err)
    return
}
defer file.Close()

// 写入文件
file.Write([]byte("Hello, Go!"))
file.WriteString("\nSecond line")

// 打开文件
file, err = os.Open("test.txt")  // 只读
file, err = os.OpenFile("test.txt", os.O_RDWR|os.O_APPEND, 0644)  // 读写、追加

// 读取文件
data := make([]byte, 100)
count, err := file.Read(data)
fmt.Printf("读取了 %d 字节: %s\n", count, data[:count])

// 获取文件信息
fileInfo, err := os.Stat("test.txt")
fmt.Println("文件名:", fileInfo.Name())
fmt.Println("大小:", fileInfo.Size())
fmt.Println("修改时间:", fileInfo.ModTime())
fmt.Println("是目录?", fileInfo.IsDir())

// 重命名和移动文件
os.Rename("test.txt", "new.txt")

// 临时文件和目录
tempFile, err := os.CreateTemp("", "example-*.txt")
tempDir, err := os.MkdirTemp("", "example-dir-*")

// 文件权限
os.Chmod("new.txt", 0644)
os.Chown("new.txt", 1000, 1000)  // 更改用户和组

// 进程操作
pid := os.Getpid()
ppid := os.Getppid()

// 退出程序
// os.Exit(0)  // 成功退出
// os.Exit(1)  // 错误退出
```

## ioutil - I/O实用工具

注：在Go 1.16后，大部分功能已移至`io`和`os`包，但为了兼容性，`ioutil`包仍然存在。

```go
import (
    "io/ioutil"  // Go 1.16+: 使用 "io" 和 "os" 代替
    "fmt"
)

// 读取整个文件
data, err := ioutil.ReadFile("test.txt")  // Go 1.16+: os.ReadFile

// 写入整个文件
err = ioutil.WriteFile("output.txt", []byte("Hello"), 0644)  // Go 1.16+: os.WriteFile

// 读取目录内容
files, err := ioutil.ReadDir(".")  // Go 1.16+: os.ReadDir
for _, file := range files {
    fmt.Println(file.Name())
}

// 创建临时目录
tempDir, err := ioutil.TempDir("", "example")  // Go 1.16+: os.MkdirTemp

// 创建临时文件
tempFile, err := ioutil.TempFile("", "example-*.txt")  // Go 1.16+: os.CreateTemp

// 丢弃的Writer
devNull := ioutil.Discard  // 类似 /dev/null，写入的所有内容都被丢弃
fmt.Fprintf(devNull, "This goes nowhere")
```

## time - 时间和日期

`time`包提供了测量和显示时间的功能。

```go
import (
    "time"
    "fmt"
)

// 获取当前时间
now := time.Now()
fmt.Println(now)  // 2023-05-06 12:34:56.123456789 +0800 CST

// 创建时间
t := time.Date(2023, time.May, 6, 12, 34, 56, 0, time.Local)

// 获取时间的各个部分
year, month, day := t.Date()
hour, min, sec := t.Clock()
fmt.Printf("%d-%02d-%02d %02d:%02d:%02d\n", year, month, day, hour, min, sec)

// 获取星期几
weekday := t.Weekday()  // Saturday

// 时间戳
unix := t.Unix()      // 秒级时间戳
unixNano := t.UnixNano()  // 纳秒级时间戳

// 从时间戳创建时间
t = time.Unix(unix, 0)

// 格式化时间
layout := "2006-01-02 15:04:05"  // Go的参考时间，必须使用这个确切的时间作为模板
formatted := t.Format(layout)
fmt.Println(formatted)  // 2023-05-06 12:34:56

// 预定义格式
formatted = t.Format(time.RFC3339)  // 2023-05-06T12:34:56+08:00

// 解析时间
t, err := time.Parse("2006-01-02", "2023-05-06")
t, err = time.ParseInLocation("2006-01-02", "2023-05-06", time.Local)

// 时间计算
tomorrow := t.AddDate(0, 0, 1)  // 加一天
nextMonth := t.AddDate(0, 1, 0)  // 加一个月
nextYear := t.AddDate(1, 0, 0)  // 加一年

twoHoursLater := t.Add(2 * time.Hour)
tenMinutesEarlier := t.Add(-10 * time.Minute)

// 比较时间
before := t.Before(time.Now())  // t是否在现在之前
after := t.After(time.Now())    // t是否在现在之后
equal := t.Equal(t)             // 两个时间是否相等

// 时间间隔
duration := time.Since(t)       // 从t到现在的时间间隔
duration = time.Until(t)        // 从现在到t的时间间隔
duration = tomorrow.Sub(t)      // 两个时间之间的间隔

// 休眠
time.Sleep(100 * time.Millisecond)

// 定时器
timer := time.NewTimer(2 * time.Second)
<-timer.C  // 等待定时器触发

// 定时器重置和停止
timer.Reset(1 * time.Second)
timer.Stop()

// 周期性定时器
ticker := time.NewTicker(1 * time.Second)
for i := 0; i < 3; i++ {
    <-ticker.C
    fmt.Println("Tick")
}
ticker.Stop()
```

## net/http - HTTP客户端和服务器

`net/http`包提供了HTTP客户端和服务器实现。

```go
import (
    "net/http"
    "fmt"
    "io/ioutil"
    "log"
)

// HTTP 客户端 - 简单GET请求
resp, err := http.Get("https://example.com")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

body, err := ioutil.ReadAll(resp.Body)
fmt.Println("状态码:", resp.StatusCode)
fmt.Println("响应体:", string(body))

// 使用自定义HTTP客户端
client := &http.Client{
    Timeout: 10 * time.Second,
}
resp, err = client.Get("https://example.com")

// 创建自定义请求
req, err := http.NewRequest("GET", "https://example.com", nil)
req.Header.Add("User-Agent", "MyGoApp/1.0")
resp, err = client.Do(req)

// POST请求
resp, err = http.Post("https://example.com/form", 
                      "application/x-www-form-urlencoded", 
                      strings.NewReader("name=张三&age=30"))

// POST JSON
jsonData := []byte(`{"name":"张三","age":30}`)
resp, err = http.Post("https://example.com/api", 
                     "application/json", 
                     bytes.NewBuffer(jsonData))

// HTTP 服务器 - 处理函数
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "欢迎访问首页!")
})

http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    // 获取URL参数
    name := r.URL.Query().Get("name")
    if name == "" {
        name = "Guest"
    }
    
    // 获取请求方法
    fmt.Println("请求方法:", r.Method)
    
    // 获取请求头
    userAgent := r.Header.Get("User-Agent")
    
    // 设置响应头
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    
    // 返回响应
    fmt.Fprintf(w, "你好, %s!", name)
})

// 处理POST表单
http.HandleFunc("/form", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "只支持POST方法", http.StatusMethodNotAllowed)
        return
    }
    
    // 解析表单数据
    if err := r.ParseForm(); err != nil {
        http.Error(w, "解析表单出错", http.StatusBadRequest)
        return
    }
    
    name := r.Form.Get("name")
    age := r.Form.Get("age")
    
    fmt.Fprintf(w, "表单提交成功! 姓名: %s, 年龄: %s", name, age)
})

// 启动服务器
log.Println("服务器启动在 http://localhost:8080")
log.Fatal(http.ListenAndServe(":8080", nil))

// 使用HTTPS
// log.Fatal(http.ListenAndServeTLS(":443", "cert.pem", "key.pem", nil))

// 自定义服务器
server := &http.Server{
    Addr:         ":8080",
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  120 * time.Second,
    Handler:      nil, // 使用DefaultServeMux
}
log.Fatal(server.ListenAndServe())
```

## encoding/json - JSON处理

`encoding/json`包实现了JSON的编码和解码。

```go
import (
    "encoding/json"
    "fmt"
    "os"
)

// 基本类型到JSON
intSlice := []int{1, 2, 3, 4, 5}
jsonData, err := json.Marshal(intSlice)
fmt.Println(string(jsonData)) // [1,2,3,4,5]

// 结构体到JSON
type Person struct {
    Name    string  `json:"name"`
    Age     int     `json:"age"`
    Email   string  `json:"email,omitempty"`
    Address Address `json:"address"`
    Salary  float64 `json:"-"` // 不序列化该字段
}

type Address struct {
    City    string `json:"city"`
    Country string `json:"country"`
}

person := Person{
    Name:    "张三",
    Age:     30,
    Email:   "zhangsan@example.com",
    Address: Address{City: "北京", Country: "中国"},
    Salary:  10000,
}

jsonData, err = json.Marshal(person)
fmt.Println(string(jsonData))
// {"name":"张三","age":30,"email":"zhangsan@example.com","address":{"city":"北京","country":"中国"}}

// 格式化的JSON（美化输出）
jsonData, err = json.MarshalIndent(person, "", "  ")
fmt.Println(string(jsonData))

// JSON到基本类型
var numbers []int
json.Unmarshal([]byte("[1,2,3,4,5]"), &numbers)
fmt.Println(numbers) // [1 2 3 4 5]

// JSON到结构体
var p Person
json.Unmarshal(jsonData, &p)
fmt.Println(p.Name, p.Age, p.Address.City)

// 使用map接收未知结构的JSON
var data map[string]interface{}
json.Unmarshal([]byte(`{"name":"李四","score":95.5,"subjects":["数学","英语"]}`), &data)

fmt.Println(data["name"]) // 李四
fmt.Println(data["score"]) // 95.5

// 类型断言访问复杂数据
subjects := data["subjects"].([]interface{})
for _, subject := range subjects {
    fmt.Println(subject.(string))
}

// 编码到writer
enc := json.NewEncoder(os.Stdout)
enc.SetIndent("", "  ")
enc.Encode(person)

// 从reader解码
dec := json.NewDecoder(strings.NewReader(`{"name":"王五","age":25}`))
var anotherPerson Person
dec.Decode(&anotherPerson)
fmt.Println(anotherPerson.Name) // 王五
```

## database/sql - 数据库操作

`database/sql`包提供了与SQL数据库交互的通用接口。

```go
import (
    "database/sql"
    "fmt"
    "log"
    
    _ "github.com/go-sql-driver/mysql" // 导入但不直接使用
)

// 连接数据库
db, err := sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/dbname")
if err != nil {
    log.Fatal(err)
}
defer db.Close()

// 测试连接
if err = db.Ping(); err != nil {
    log.Fatal(err)
}

// 执行单个查询
var count int
err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
fmt.Printf("用户总数: %d\n", count)

// 执行多行查询
rows, err := db.Query("SELECT id, name, age FROM users")
if err != nil {
    log.Fatal(err)
}
defer rows.Close()

// 遍历结果
for rows.Next() {
    var id int
    var name string
    var age int
    
    if err := rows.Scan(&id, &name, &age); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("ID: %d, 姓名: %s, 年龄: %d\n", id, name, age)
}

// 检查遍历过程中是否有错误
if err = rows.Err(); err != nil {
    log.Fatal(err)
}

// 执行非查询SQL (INSERT, UPDATE, DELETE)
result, err := db.Exec("INSERT INTO users(name, age) VALUES(?, ?)", "赵六", 35)
if err != nil {
    log.Fatal(err)
}

// 获取影响的行数
rowsAffected, err := result.RowsAffected()
fmt.Printf("影响的行数: %d\n", rowsAffected)

// 获取最后插入的ID
lastID, err := result.LastInsertId()
fmt.Printf("最后插入的ID: %d\n", lastID)

// 准备语句
stmt, err := db.Prepare("INSERT INTO users(name, age) VALUES(?, ?)")
if err != nil {
    log.Fatal(err)
}
defer stmt.Close()

// 多次执行准备语句
for i := 0; i < 3; i++ {
    name := fmt.Sprintf("用户%d", i)
    age := 20 + i
    
    _, err = stmt.Exec(name, age)
    if err != nil {
        log.Fatal(err)
    }
}

// 事务
tx, err := db.Begin()
if err != nil {
    log.Fatal(err)
}

// 执行事务操作
_, err = tx.Exec("UPDATE users SET age = age + 1 WHERE id = ?", 1)
if err != nil {
    tx.Rollback()
    log.Fatal(err)
}

_, err = tx.Exec("UPDATE accounts SET balance = balance - 100 WHERE user_id = ?", 1)
if err != nil {
    tx.Rollback()
    log.Fatal(err)
}

// 提交事务
if err = tx.Commit(); err != nil {
    log.Fatal(err)
}
```

## flag - 命令行标志解析

`flag`包实现了命令行标志解析。

```go
import (
    "flag"
    "fmt"
)

// 定义命令行标志
var (
    name  = flag.String("name", "World", "指定名称")
    age   = flag.Int("age", 0, "指定年龄")
    isVIP = flag.Bool("vip", false, "是否是VIP")
)

// 也可以绑定到变量
var port int
flag.IntVar(&port, "port", 8080, "指定端口")

// 解析命令行标志
flag.Parse()

// 使用标志值
fmt.Printf("名称: %s\n", *name)
fmt.Printf("年龄: %d\n", *age)
fmt.Printf("VIP: %t\n", *isVIP)
fmt.Printf("端口: %d\n", port)

// 获取位置参数（非标志参数）
args := flag.Args()
fmt.Printf("其他参数: %v\n", args)

// 自定义使用说明
flag.Usage = func() {
    fmt.Fprintf(flag.CommandLine.Output(), "用法: %s [选项] [参数]\n", os.Args[0])
    fmt.Fprintln(flag.CommandLine.Output(), "选项:")
    flag.PrintDefaults()
}

// 检查特定标志是否被设置
if flag.Lookup("name").Value.String() != "World" {
    fmt.Println("使用了自定义名称")
}
```

## log - 日志记录

`log`包实现了简单的日志记录功能。

```go
import (
    "log"
    "os"
)

// 使用默认logger
log.Println("这是一条信息")
log.Printf("格式化信息: %s", "示例")

// 错误日志和致命错误
// log.Fatalln("致命错误") // 输出后调用os.Exit(1)
// log.Panicln("严重错误") // 输出后调用panic()

// 自定义logger
infoLog := log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
infoLog.Println("这是一条信息")

// 写入文件
logFile, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
if err != nil {
    log.Fatal(err)
}
defer logFile.Close()

fileLog := log.New(logFile, "FILE: ", log.LstdFlags)
fileLog.Println("这条日志写入文件")

// 设置默认logger的输出目标
log.SetOutput(logFile)
log.Println("默认logger现在也写入文件")

// 设置日志格式标志
log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds | log.Llongfile)

// 设置日志前缀
log.SetPrefix("TRACE: ")

// 同时写入多个输出
multiWriter := io.MultiWriter(os.Stdout, logFile)
combinedLog := log.New(multiWriter, "COMBINED: ", log.LstdFlags)
combinedLog.Println("同时写入控制台和文件")
```