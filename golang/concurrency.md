# Go语言并发编程

Go语言在语言层面提供了对并发编程的原生支持，这是Go最强大的特性之一。

## Goroutine

Goroutine是Go中的轻量级线程，由Go运行时管理。

```go
// 启动一个goroutine
go func() {
    fmt.Println("在goroutine中执行")
}()

// 带参数的goroutine
go func(msg string) {
    fmt.Println(msg)
}("Hello, Goroutine!")

// 启动一个命名函数作为goroutine
go sayHello("世界")

// 等待goroutine完成
time.Sleep(1 * time.Second)
```

## 通道 (Channel)

通道是goroutine之间通信的管道。

```go
// 创建无缓冲通道
ch := make(chan string)

// 发送数据到通道
go func() {
    ch <- "数据"
}()

// 从通道接收数据
data := <-ch

// 创建带缓冲的通道
bufferedCh := make(chan int, 3)
bufferedCh <- 1 // 不会阻塞
bufferedCh <- 2 // 不会阻塞
bufferedCh <- 3 // 不会阻塞
// bufferedCh <- 4 // 会阻塞，直到有空间

// 关闭通道
close(ch)

// 从已关闭的通道接收数据
val, ok := <-ch
if !ok {
    fmt.Println("通道已关闭")
}

// 循环接收通道数据，直到通道关闭
for data := range ch {
    fmt.Println(data)
}
```

## Select语句

select语句让goroutine等待多个通信操作。

```go
select {
case msg1 := <-ch1:
    fmt.Println("接收到来自通道1的消息:", msg1)
case msg2 := <-ch2:
    fmt.Println("接收到来自通道2的消息:", msg2)
case ch3 <- "发送":
    fmt.Println("向通道3发送了消息")
case <-time.After(1 * time.Second):
    fmt.Println("超时")
default:
    fmt.Println("没有通道操作就绪")
}
```

## 超时处理

使用select和time.After实现超时处理：

```go
select {
case result := <-c:
    fmt.Println("接收到结果:", result)
case <-time.After(2 * time.Second):
    fmt.Println("操作超时")
}
```

## WaitGroup

WaitGroup用于等待一组goroutine完成执行。

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1) // 增加计数器
    
    go func(id int) {
        defer wg.Done() // 完成时减少计数器
        
        fmt.Printf("Worker %d starting\n", id)
        time.Sleep(time.Second)
        fmt.Printf("Worker %d done\n", id)
    }(i)
}

wg.Wait() // 等待所有goroutine完成
fmt.Println("所有worker已完成")
```

## 互斥锁 (Mutex)

Mutex用于提供对共享资源的独占访问。

```go
var (
    counter int
    mutex   sync.Mutex
)

func increment() {
    mutex.Lock() // 锁定
    defer mutex.Unlock() // 确保解锁
    
    counter++
}

// 在多个goroutine中使用
for i := 0; i < 1000; i++ {
    go increment()
}
```

## 读写锁 (RWMutex)

RWMutex允许多个读操作并行，但写操作是互斥的。

```go
var (
    data   map[string]string
    rwLock sync.RWMutex
)

func init() {
    data = make(map[string]string)
}

// 写操作
func write(key, value string) {
    rwLock.Lock() // 写锁定
    defer rwLock.Unlock()
    
    data[key] = value
}

// 读操作
func read(key string) string {
    rwLock.RLock() // 读锁定
    defer rwLock.RUnlock()
    
    return data[key]
}
```

## Once

Once用于确保函数只执行一次。

```go
var (
    instance *singleton
    once     sync.Once
)

func getInstance() *singleton {
    once.Do(func() {
        instance = &singleton{}
    })
    return instance
}
```

## Cond

Cond实现了条件变量，用于在满足特定条件时通知goroutine。

```go
var (
    condition = sync.NewCond(&sync.Mutex{})
    done      = false
)

// 消费者
go func() {
    condition.L.Lock()
    for !done {
        condition.Wait() // 等待条件满足
    }
    fmt.Println("条件满足，处理数据")
    condition.L.Unlock()
}()

// 生产者
time.Sleep(1 * time.Second)
condition.L.Lock()
done = true
condition.Signal() // 通知一个等待的goroutine
// condition.Broadcast() // 通知所有等待的goroutine
condition.L.Unlock()
```

## 原子操作

原子操作提供底层的原子内存原语，对于同步算法很有用。

```go
var (
    counter int64
)

// 原子增加
atomic.AddInt64(&counter, 1)

// 原子读取
value := atomic.LoadInt64(&counter)

// 原子存储
atomic.StoreInt64(&counter, 100)

// 比较并交换
swapped := atomic.CompareAndSwapInt64(&counter, 100, 200)
if swapped {
    fmt.Println("交换成功")
}

// 原子交换
oldValue := atomic.SwapInt64(&counter, 300)
fmt.Printf("旧值: %d\n", oldValue)
```

## Context

Context用于跨API边界和goroutine传递截止时间、取消信号和其他请求范围的值。

```go
// 创建基础context
ctx := context.Background()

// 带取消的context
ctx, cancel := context.WithCancel(context.Background())
defer cancel() // 确保所有路径都调用cancel

// 带超时的context
ctx, cancel = context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

// 带截止时间的context
deadline := time.Now().Add(5 * time.Second)
ctx, cancel = context.WithDeadline(context.Background(), deadline)
defer cancel()

// 带值的context
ctx = context.WithValue(ctx, "key", "value")

// 在goroutine中使用context
go func(ctx context.Context) {
    select {
    case <-ctx.Done():
        fmt.Println("工作取消:", ctx.Err())
        return
    case <-time.After(3 * time.Second):
        fmt.Println("工作完成")
    }
}(ctx)

// 手动取消
cancel()
```

## 工作池模式

使用goroutine和通道实现工作池：

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("worker %d 开始处理任务 %d\n", id, job)
        time.Sleep(time.Second) // 模拟工作
        fmt.Printf("worker %d 完成任务 %d\n", id, job)
        results <- job * 2 // 发送结果
    }
}

// 创建任务和结果通道
jobs := make(chan int, 100)
results := make(chan int, 100)

// 启动3个worker
for w := 1; w <= 3; w++ {
    go worker(w, jobs, results)
}

// 发送5个任务
for j := 1; j <= 5; j++ {
    jobs <- j
}
close(jobs)

// 收集所有结果
for a := 1; a <= 5; a++ {
    <-results
}
```

## 扇入扇出模式

将任务分发给多个worker，然后合并结果：

```go
func gen(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func sq(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func merge(cs ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)
    
    // 为每个输入通道启动一个goroutine
    output := func(c <-chan int) {
        for n := range c {
            out <- n
        }
        wg.Done()
    }
    
    wg.Add(len(cs))
    for _, c := range cs {
        go output(c)
    }
    
    // 启动一个goroutine关闭输出通道
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}

// 使用
input := gen(1, 2, 3, 4, 5)

// 启动3个sq实例
c1 := sq(input)
c2 := sq(input)
c3 := sq(input)

// 消费合并的输出
for result := range merge(c1, c2, c3) {
    fmt.Println(result)
}
```

## 速率限制

使用通道实现速率限制：

```go
// 每200毫秒接受一个请求
limiter := time.Tick(200 * time.Millisecond)

for req := range requests {
    <-limiter // 等待下一个速率限制窗口
    go processRequest(req)
}

// 允许短暂的突发请求，但保持整体速率限制
burstyLimiter := make(chan time.Time, 3)
for i := 0; i < 3; i++ {
    burstyLimiter <- time.Now()
}

go func() {
    for t := range time.Tick(200 * time.Millisecond) {
        burstyLimiter <- t
    }
}()

for req := range requests {
    <-burstyLimiter
    go processRequest(req)
}
```

## 并发模式

### 生成器模式
```go
func generator() <-chan int {
    ch := make(chan int)
    go func() {
        for i := 0; ; i++ {
            ch <- i
            time.Sleep(500 * time.Millisecond)
        }
    }()
    return ch
}

// 使用生成器
gen := generator()
for i := 0; i < 5; i++ {
    fmt.Println(<-gen)
}
```

### 管道模式
```go
func generator(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func filter(in <-chan int, f func(int) bool) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            if f(n) {
                out <- n
            }
        }
        close(out)
    }()
    return out
}

// 使用管道
nums := generator(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
squares := square(nums)
even := filter(squares, func(n int) bool {
    return n%2 == 0
})

for n := range even {
    fmt.Println(n)
}
```

### 取消模式
```go
func worker(ctx context.Context) <-chan int {
    results := make(chan int)
    go func() {
        defer close(results)
        
        for {
            select {
            case <-ctx.Done():
                return
            case <-time.After(500 * time.Millisecond):
                results <- rand.Intn(100)
            }
        }
    }()
    return results
}

// 使用带取消的worker
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()

for result := range worker(ctx) {
    fmt.Println(result)
}
``` 