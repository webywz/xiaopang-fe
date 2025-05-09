# Go语言实战项目

本节提供一些Go语言的实战项目示例，帮助您理解如何在实际场景中应用Go语言。

## 项目1：简单的HTTP服务器

创建一个提供REST API的HTTP服务器。

```go
// main.go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "sync"
)

// User 用户结构体
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
    Age  int    `json:"age"`
}

// UserHandler 处理用户相关的请求
type UserHandler struct {
    sync.Mutex
    users map[int]User
}

// NewUserHandler 创建用户处理器
func NewUserHandler() *UserHandler {
    return &UserHandler{
        users: make(map[int]User),
    }
}

// ServeHTTP 实现http.Handler接口
func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // 设置响应类型
    w.Header().Set("Content-Type", "application/json")

    // 解析路径中的ID
    var id int
    var err error
    idStr := r.URL.Path[len("/users/"):]
    if idStr != "" {
        id, err = strconv.Atoi(idStr)
        if err != nil {
            http.Error(w, "无效的用户ID", http.StatusBadRequest)
            return
        }
    }

    switch r.Method {
    case "GET":
        if idStr == "" {
            // 获取所有用户
            h.getUsers(w, r)
        } else {
            // 获取特定用户
            h.getUser(w, r, id)
        }
    case "POST":
        // 创建用户
        h.createUser(w, r)
    case "PUT":
        // 更新用户
        h.updateUser(w, r, id)
    case "DELETE":
        // 删除用户
        h.deleteUser(w, r, id)
    default:
        http.Error(w, "方法不允许", http.StatusMethodNotAllowed)
    }
}

// getUsers 获取所有用户
func (h *UserHandler) getUsers(w http.ResponseWriter, r *http.Request) {
    h.Lock()
    defer h.Unlock()

    users := make([]User, 0, len(h.users))
    for _, user := range h.users {
        users = append(users, user)
    }

    json.NewEncoder(w).Encode(users)
}

// getUser 获取特定用户
func (h *UserHandler) getUser(w http.ResponseWriter, r *http.Request, id int) {
    h.Lock()
    defer h.Unlock()

    user, exists := h.users[id]
    if !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(user)
}

// createUser 创建用户
func (h *UserHandler) createUser(w http.ResponseWriter, r *http.Request) {
    h.Lock()
    defer h.Unlock()

    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // 分配新ID
    maxID := 0
    for id := range h.users {
        if id > maxID {
            maxID = id
        }
    }
    user.ID = maxID + 1

    // 存储用户
    h.users[user.ID] = user

    // 返回创建的用户
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// updateUser 更新用户
func (h *UserHandler) updateUser(w http.ResponseWriter, r *http.Request, id int) {
    h.Lock()
    defer h.Unlock()

    if _, exists := h.users[id]; !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }

    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // 确保ID不变
    user.ID = id

    // 更新用户
    h.users[id] = user

    json.NewEncoder(w).Encode(user)
}

// deleteUser 删除用户
func (h *UserHandler) deleteUser(w http.ResponseWriter, r *http.Request, id int) {
    h.Lock()
    defer h.Unlock()

    if _, exists := h.users[id]; !exists {
        http.Error(w, "用户不存在", http.StatusNotFound)
        return
    }

    // 删除用户
    delete(h.users, id)

    w.WriteHeader(http.StatusNoContent)
}

func main() {
    // 创建用户处理器
    userHandler := NewUserHandler()

    // 添加一些测试数据
    userHandler.users[1] = User{ID: 1, Name: "张三", Age: 30}
    userHandler.users[2] = User{ID: 2, Name: "李四", Age: 25}

    // 注册路由
    http.Handle("/users/", userHandler)
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "欢迎访问用户API服务")
    })

    // 启动服务器
    fmt.Println("服务器启动在 http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

使用方法：

```bash
# 启动服务器
go run main.go

# 测试API
# 获取所有用户
curl http://localhost:8080/users/

# 获取特定用户
curl http://localhost:8080/users/1

# 创建用户
curl -X POST -H "Content-Type: application/json" -d '{"name":"王五","age":35}' http://localhost:8080/users/

# 更新用户
curl -X PUT -H "Content-Type: application/json" -d '{"name":"王五","age":36}' http://localhost:8080/users/3

# 删除用户
curl -X DELETE http://localhost:8080/users/3
```

## 项目2：命令行工具

创建一个处理文本文件的命令行工具。

```go
// wordcount.go
package main

import (
    "bufio"
    "flag"
    "fmt"
    "io"
    "os"
    "strings"
)

// 计数器结构体
type Counter struct {
    Lines int
    Words int
    Chars int
}

// 处理文件并计数
func processFile(filename string) (Counter, error) {
    var counter Counter

    // 打开文件
    file, err := os.Open(filename)
    if err != nil {
        return counter, err
    }
    defer file.Close()

    return countContent(file)
}

// 处理流并计数
func countContent(r io.Reader) (Counter, error) {
    var counter Counter

    scanner := bufio.NewScanner(r)
    
    // 按行扫描
    for scanner.Scan() {
        line := scanner.Text()
        counter.Lines++
        counter.Words += len(strings.Fields(line))
        counter.Chars += len(line) + 1 // +1 for the newline character
    }

    // 减去最后一行的换行符
    if counter.Lines > 0 {
        counter.Chars--
    }

    return counter, scanner.Err()
}

func main() {
    // 定义命令行标志
    lines := flag.Bool("l", false, "Count lines")
    words := flag.Bool("w", false, "Count words")
    chars := flag.Bool("c", false, "Count characters")
    flag.Parse()

    // 如果没有指定任何标志，默认全部计数
    if !*lines && !*words && !*chars {
        *lines, *words, *chars = true, true, true
    }

    // 处理文件参数
    args := flag.Args()
    if len(args) == 0 {
        // 如果没有指定文件，从标准输入读取
        counter, err := countContent(os.Stdin)
        if err != nil {
            fmt.Fprintf(os.Stderr, "错误: %v\n", err)
            os.Exit(1)
        }
        printResults(counter, *lines, *words, *chars, "stdin")
    } else {
        // 处理每个指定的文件
        total := Counter{}
        
        for _, filename := range args {
            counter, err := processFile(filename)
            if err != nil {
                fmt.Fprintf(os.Stderr, "%s: %v\n", filename, err)
                continue
            }
            
            printResults(counter, *lines, *words, *chars, filename)
            
            // 累计总数
            total.Lines += counter.Lines
            total.Words += counter.Words
            total.Chars += counter.Chars
        }
        
        // 如果处理了多个文件，显示总计
        if len(args) > 1 {
            printResults(total, *lines, *words, *chars, "总计")
        }
    }
}

// 打印结果
func printResults(counter Counter, lines, words, chars bool, filename string) {
    var results []string
    
    if lines {
        results = append(results, fmt.Sprintf("%8d", counter.Lines))
    }
    if words {
        results = append(results, fmt.Sprintf("%8d", counter.Words))
    }
    if chars {
        results = append(results, fmt.Sprintf("%8d", counter.Chars))
    }
    
    fmt.Printf("%s %s\n", strings.Join(results, " "), filename)
}
```

使用方法：

```bash
# 编译程序
go build -o wordcount wordcount.go

# 计算文件的行数、单词数和字符数
./wordcount file.txt

# 只计算行数
./wordcount -l file.txt

# 只计算单词数
./wordcount -w file.txt

# 只计算字符数
./wordcount -c file.txt

# 处理多个文件
./wordcount file1.txt file2.txt

# 从标准输入读取内容
cat file.txt | ./wordcount
```

## 项目3：并发网络爬虫

使用Go的并发特性创建一个简单的网络爬虫。

```go
// crawler.go
package main

import (
    "flag"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "os"
    "path/filepath"
    "strings"
    "sync"

    "golang.org/x/net/html"
)

// 爬虫选项
type CrawlerOptions struct {
    MaxDepth    int
    Concurrency int
    BaseURL     string
    OutputDir   string
}

// 页面结构
type Page struct {
    URL   string
    Depth int
}

// 爬虫结构
type Crawler struct {
    options      CrawlerOptions
    visitedLinks map[string]bool
    mutex        sync.Mutex
    wg           sync.WaitGroup
    queue        chan Page
}

// 创建新爬虫
func NewCrawler(options CrawlerOptions) *Crawler {
    return &Crawler{
        options:      options,
        visitedLinks: make(map[string]bool),
        queue:        make(chan Page, options.Concurrency),
    }
}

// 开始爬取
func (c *Crawler) Start(startURL string) {
    // 创建输出目录
    if c.options.OutputDir != "" {
        err := os.MkdirAll(c.options.OutputDir, 0755)
        if err != nil {
            fmt.Printf("创建输出目录失败: %v\n", err)
            return
        }
    }

    // 解析基础URL
    baseURL, err := url.Parse(c.options.BaseURL)
    if err != nil {
        fmt.Printf("解析基础URL失败: %v\n", err)
        return
    }

    // 解析起始URL
    u, err := url.Parse(startURL)
    if err != nil {
        fmt.Printf("解析起始URL失败: %v\n", err)
        return
    }

    // 如果是相对URL，转为绝对URL
    if !u.IsAbs() {
        u = baseURL.ResolveReference(u)
    }

    // 标记为已访问
    c.mutex.Lock()
    c.visitedLinks[u.String()] = true
    c.mutex.Unlock()

    // 放入队列
    c.queue <- Page{URL: u.String(), Depth: 0}

    // 启动工作协程
    for i := 0; i < c.options.Concurrency; i++ {
        c.wg.Add(1)
        go c.worker()
    }

    // 等待所有工作完成
    c.wg.Wait()
    close(c.queue)
}

// 工作协程
func (c *Crawler) worker() {
    defer c.wg.Done()

    for page := range c.queue {
        c.crawlPage(page)
    }
}

// 爬取页面
func (c *Crawler) crawlPage(page Page) {
    fmt.Printf("爬取: %s (深度: %d)\n", page.URL, page.Depth)

    // 如果达到最大深度，不继续爬取链接
    if page.Depth >= c.options.MaxDepth {
        return
    }

    // 获取页面内容
    resp, err := http.Get(page.URL)
    if err != nil {
        fmt.Printf("请求失败 %s: %v\n", page.URL, err)
        return
    }
    defer resp.Body.Close()

    // 检查内容类型
    contentType := resp.Header.Get("Content-Type")
    if !strings.Contains(contentType, "text/html") {
        fmt.Printf("跳过非HTML内容 %s: %s\n", page.URL, contentType)
        return
    }

    // 保存页面内容
    if c.options.OutputDir != "" {
        u, err := url.Parse(page.URL)
        if err != nil {
            fmt.Printf("解析URL失败 %s: %v\n", page.URL, err)
            return
        }

        // 创建文件名
        filename := filepath.Join(c.options.OutputDir, sanitizeFilename(u.Path))
        if filename == filepath.Join(c.options.OutputDir, "") || filename == filepath.Join(c.options.OutputDir, "/") {
            filename = filepath.Join(c.options.OutputDir, "index.html")
        } else if !strings.HasSuffix(filename, ".html") {
            filename += ".html"
        }

        // 确保目录存在
        dir := filepath.Dir(filename)
        if err := os.MkdirAll(dir, 0755); err != nil {
            fmt.Printf("创建目录失败 %s: %v\n", dir, err)
            return
        }

        // 保存内容
        file, err := os.Create(filename)
        if err != nil {
            fmt.Printf("创建文件失败 %s: %v\n", filename, err)
            return
        }
        defer file.Close()

        // 复制响应体到文件
        _, err = io.Copy(file, resp.Body)
        if err != nil {
            fmt.Printf("保存内容失败 %s: %v\n", filename, err)
            return
        }

        // 重新获取页面内容进行解析
        resp, err = http.Get(page.URL)
        if err != nil {
            fmt.Printf("二次请求失败 %s: %v\n", page.URL, err)
            return
        }
        defer resp.Body.Close()
    }

    // 解析HTML
    doc, err := html.Parse(resp.Body)
    if err != nil {
        fmt.Printf("解析HTML失败 %s: %v\n", page.URL, err)
        return
    }

    // 提取链接
    baseURL, _ := url.Parse(page.URL)
    links := extractLinks(doc, baseURL)

    // 解析基础URL
    base, err := url.Parse(c.options.BaseURL)
    if err != nil {
        fmt.Printf("解析基础URL失败: %v\n", err)
        return
    }

    // 处理每个链接
    for _, link := range links {
        // 如果是相对URL，转为绝对URL
        u, err := url.Parse(link)
        if err != nil {
            continue
        }

        if !u.IsAbs() {
            u = baseURL.ResolveReference(u)
        }

        // 检查是否在同一域名下
        if base.Hostname() != u.Hostname() {
            continue
        }

        linkURL := u.String()

        // 检查是否已访问
        c.mutex.Lock()
        visited := c.visitedLinks[linkURL]
        if !visited {
            c.visitedLinks[linkURL] = true
        }
        c.mutex.Unlock()

        // 如果未访问，加入队列
        if !visited {
            c.queue <- Page{URL: linkURL, Depth: page.Depth + 1}
        }
    }
}

// 提取链接
func extractLinks(n *html.Node, baseURL *url.URL) []string {
    var links []string

    if n.Type == html.ElementNode && n.Data == "a" {
        for _, attr := range n.Attr {
            if attr.Key == "href" {
                links = append(links, attr.Val)
                break
            }
        }
    }

    for c := n.FirstChild; c != nil; c = c.NextSibling {
        links = append(links, extractLinks(c, baseURL)...)
    }

    return links
}

// 文件名清理
func sanitizeFilename(s string) string {
    s = strings.Trim(s, "/")
    if s == "" {
        return "index.html"
    }
    
    // 替换不安全的文件名字符
    replacer := strings.NewReplacer(
        "/", "_",
        "\\", "_",
        ":", "_",
        "*", "_",
        "?", "_",
        "\"", "_",
        "<", "_",
        ">", "_",
        "|", "_",
    )
    
    return replacer.Replace(s)
}

func main() {
    // 命令行参数
    maxDepth := flag.Int("depth", 2, "最大爬取深度")
    concurrency := flag.Int("concurrency", 5, "并发爬取数量")
    outputDir := flag.String("output", "output", "输出目录")
    baseURL := flag.String("base", "", "基础URL")
    flag.Parse()

    if flag.NArg() < 1 {
        fmt.Println("使用方法: crawler [选项] URL")
        flag.PrintDefaults()
        os.Exit(1)
    }

    startURL := flag.Arg(0)
    
    // 如果未指定基础URL，使用起始URL
    if *baseURL == "" {
        u, err := url.Parse(startURL)
        if err != nil {
            fmt.Printf("解析URL失败: %v\n", err)
            os.Exit(1)
        }
        *baseURL = fmt.Sprintf("%s://%s", u.Scheme, u.Host)
    }

    // 创建爬虫选项
    options := CrawlerOptions{
        MaxDepth:    *maxDepth,
        Concurrency: *concurrency,
        BaseURL:     *baseURL,
        OutputDir:   *outputDir,
    }

    // 创建并启动爬虫
    crawler := NewCrawler(options)
    crawler.Start(startURL)

    fmt.Println("爬取完成！")
}
```

使用方法：

```bash
# 安装依赖
go get golang.org/x/net/html

# 编译程序
go build -o crawler crawler.go

# 爬取网站
./crawler https://example.com

# 指定最大深度
./crawler -depth 3 https://example.com

# 指定并发数
./crawler -concurrency 10 https://example.com

# 指定输出目录
./crawler -output website_data https://example.com

# 指定基础URL
./crawler -base https://example.com https://example.com/start-page
```

这些项目示例涵盖了Go语言的多个重要特性：HTTP服务器，命令行处理，并发编程，以及网络操作。通过学习和修改这些项目，您可以更好地理解Go语言在实际应用中的强大功能。 