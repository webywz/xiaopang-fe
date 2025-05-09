# Go语言数据结构

## 数组

数组是固定长度的相同类型元素序列。

```go
// 声明数组
var scores [5]int // 创建一个包含5个整数的数组，初始值都为0

// 初始化数组
var colors = [3]string{"红", "绿", "蓝"}

// 使用...自动计算长度
cities := [...]string{"北京", "上海", "广州", "深圳"}

// 指定索引初始化
nums := [5]int{0: 100, 4: 200} // [100, 0, 0, 0, 200]

// 访问和修改元素
fmt.Println(colors[0]) // 输出: 红
colors[1] = "黄"

// 数组长度
fmt.Println(len(colors)) // 输出: 3

// 遍历数组
for i := 0; i < len(cities); i++ {
    fmt.Println(cities[i])
}

// 使用 range 遍历
for index, value := range cities {
    fmt.Printf("索引: %d, 值: %s\n", index, value)
}

// 多维数组
var matrix [3][4]int // 3行4列的二维数组
matrix[0][0] = 1
```

## 切片

切片是对数组的动态视图，长度可变。

```go
// 创建切片
var fruits []string // 声明一个字符串切片，初始值为nil

// 使用make创建指定长度的切片
numbers := make([]int, 5) // 长度为5的整数切片，初始值都为0
numbers = make([]int, 5, 10) // 长度为5，容量为10

// 切片字面量
colors := []string{"红", "绿", "蓝"}

// 从数组创建切片
arr := [5]int{1, 2, 3, 4, 5}
slice1 := arr[1:4] // [2, 3, 4]
slice2 := arr[:3]  // [1, 2, 3]
slice3 := arr[2:]  // [3, 4, 5]
slice4 := arr[:]   // [1, 2, 3, 4, 5]

// 切片长度和容量
fmt.Printf("长度: %d, 容量: %d\n", len(slice1), cap(slice1))

// 添加元素
fruits = append(fruits, "苹果")
fruits = append(fruits, "香蕉", "橙子", "梨")

// 合并切片
vegetables := []string{"番茄", "黄瓜"}
food := append(fruits, vegetables...) // 使用...展开切片

// 复制切片
dest := make([]string, len(fruits))
copied := copy(dest, fruits)
fmt.Printf("复制了%d个元素\n", copied)

// 切片排序
sort.Strings(fruits)  // 字符串排序
sort.Ints(numbers)    // 整数排序
sort.Float64s([]float64{3.14, 1.5, 2.7}) // 浮点数排序

// 删除元素（通过重新切片）
// 删除索引为i的元素
i := 1
fruits = append(fruits[:i], fruits[i+1:]...)
```

## 映射 (Map)

映射是键值对的无序集合。

```go
// 声明映射
var users map[string]int // 映射字符串到整数，初始值为nil

// 使用make创建映射
users = make(map[string]int)

// 映射字面量
scores := map[string]int{
    "张三": 90,
    "李四": 85,
    "王五": 95,
}

// 添加和修改元素
users["张三"] = 30
users["李四"] = 25

// 获取元素
age := users["张三"] // 30

// 检查键是否存在
age, exists := users["赵六"]
if exists {
    fmt.Printf("赵六的年龄是: %d\n", age)
} else {
    fmt.Println("找不到赵六")
}

// 删除元素
delete(users, "李四")

// 遍历映射
for name, age := range users {
    fmt.Printf("%s: %d岁\n", name, age)
}

// 只遍历键
for name := range users {
    fmt.Println(name)
}

// 长度
fmt.Printf("用户数量: %d\n", len(users))
```

## 结构体

结构体是字段的集合。

```go
// 定义结构体
type Person struct {
    Name    string
    Age     int
    Address Address
}

type Address struct {
    City    string
    ZipCode string
}

// 创建结构体
var p1 Person
p1.Name = "张三"
p1.Age = 30
p1.Address.City = "北京"
p1.Address.ZipCode = "100000"

// 结构体字面量
p2 := Person{
    Name: "李四",
    Age:  25,
    Address: Address{
        City:    "上海",
        ZipCode: "200000",
    },
}

// 结构体指针
p3 := &Person{Name: "王五", Age: 35}
p3.Age = 36 // 等同于 (*p3).Age = 36

// 匿名结构体
point := struct {
    X, Y int
}{10, 20}

// 嵌入结构体（组合）
type Employee struct {
    Person  // 匿名字段，嵌入Person结构体
    Company string
    Salary  float64
}

emp := Employee{
    Person: Person{Name: "赵六", Age: 40},
    Company: "ABC科技",
    Salary: 20000,
}

// 可以直接访问嵌入结构体的字段
fmt.Println(emp.Name) // 输出: 赵六
```

## 接口

接口定义了对象的行为。

```go
// 定义接口
type Writer interface {
    Write([]byte) (int, error)
}

type Reader interface {
    Read([]byte) (int, error)
}

// 组合接口
type ReadWriter interface {
    Reader
    Writer
}

// 实现接口
type File struct {
    // ...
}

func (f *File) Write(data []byte) (int, error) {
    // 实现Write方法
    return len(data), nil
}

func (f *File) Read(data []byte) (int, error) {
    // 实现Read方法
    return len(data), nil
}

// 使用接口
var rw ReadWriter = &File{}
rw.Write([]byte("测试数据"))
rw.Read(make([]byte, 100))

// 空接口
var anything interface{}
anything = 42
anything = "Hello"
anything = struct{ Name string }{"张三"}

// 类型断言
str, ok := anything.(string)
if ok {
    fmt.Printf("值是字符串: %s\n", str)
} else {
    fmt.Println("值不是字符串")
}

// 类型选择
switch v := anything.(type) {
case int:
    fmt.Printf("整数: %d\n", v)
case string:
    fmt.Printf("字符串: %s\n", v)
default:
    fmt.Printf("未知类型: %T\n", v)
}
```

## 通道 (Channel)

通道是goroutine之间的通信机制。

```go
// 创建通道
ch := make(chan int) // 无缓冲通道
bufCh := make(chan string, 10) // 缓冲通道，容量为10

// 发送数据到通道
ch <- 42
bufCh <- "Hello"

// 从通道接收数据
value := <-ch
message := <-bufCh

// 关闭通道
close(ch)

// 检查通道是否关闭
val, ok := <-ch
if !ok {
    fmt.Println("通道已关闭")
}

// 遍历通道
for v := range ch {
    fmt.Println(v) // 持续读取直到通道关闭
}

// 选择多个通道操作
select {
case v := <-ch:
    fmt.Printf("从ch接收: %d\n", v)
case bufCh <- "World":
    fmt.Println("发送到bufCh")
case <-time.After(1 * time.Second):
    fmt.Println("超时")
default:
    fmt.Println("没有通道操作就绪")
}

// 单向通道
func send(ch chan<- int) { // 只能发送的通道
    ch <- 42
}

func receive(ch <-chan int) { // 只能接收的通道
    val := <-ch
    fmt.Println(val)
}
```

## 集合操作

Go没有内置的集合类型，但可以使用map实现：

```go
// 使用map实现集合
set := make(map[string]bool)

// 添加元素
set["苹果"] = true
set["香蕉"] = true

// 检查元素是否存在
if set["苹果"] {
    fmt.Println("苹果在集合中")
}

// 删除元素
delete(set, "香蕉")

// 集合大小
fmt.Printf("集合大小: %d\n", len(set))

// 遍历集合
for item := range set {
    fmt.Println(item)
}

// 集合并集
union := make(map[string]bool)
for k := range set1 {
    union[k] = true
}
for k := range set2 {
    union[k] = true
}

// 集合交集
intersection := make(map[string]bool)
for k := range set1 {
    if set2[k] {
        intersection[k] = true
    }
}
```

## 链表

Go标准库提供了链表实现：

```go
import "container/list"

// 创建链表
l := list.New()

// 添加元素
l.PushBack("last")  // 在尾部添加
l.PushFront("first") // 在头部添加
elem := l.PushBack("middle")

// 插入元素
l.InsertBefore("before middle", elem)
l.InsertAfter("after middle", elem)

// 移除元素
l.Remove(elem)

// 遍历链表
for e := l.Front(); e != nil; e = e.Next() {
    fmt.Println(e.Value)
}

// 反向遍历
for e := l.Back(); e != nil; e = e.Prev() {
    fmt.Println(e.Value)
}

// 链表长度
fmt.Printf("链表长度: %d\n", l.Len())
```

## 堆

Go提供了heap包实现堆操作：

```go
import (
    "container/heap"
    "fmt"
)

// 自定义整数堆
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // 小顶堆
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x interface{}) {
    *h = append(*h, x.(int))
}

func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

// 使用堆
h := &IntHeap{2, 1, 5}
heap.Init(h)
heap.Push(h, 3)
fmt.Printf("最小值: %d\n", (*h)[0])
fmt.Printf("弹出: %d\n", heap.Pop(h))
```

## 环形缓冲区

Go标准库提供了环形缓冲区：

```go
import "container/ring"

// 创建容量为5的环
r := ring.New(5)

// 填充数据
for i := 0; i < r.Len(); i++ {
    r.Value = i
    r = r.Next()
}

// 遍历环
r.Do(func(p interface{}) {
    fmt.Println(p)
})

// 移动
r = r.Move(2) // 向前移动2个位置

// 链接两个环
r2 := ring.New(3)
r.Link(r2) // 返回的是r环和r2环链接处的位置
```