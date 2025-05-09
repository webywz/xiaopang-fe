# Go语言基础语法

## 基本结构

每个Go程序都由包（package）组成，程序从main包开始运行：

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

## 变量声明

```go
// 声明单个变量
var name string
name = "张三"

// 声明并初始化
var age int = 25

// 简短声明（只能在函数内部使用）
score := 85.5

// 多变量声明
var (
    firstName string = "李"
    lastName  string = "四"
    height    int    = 175
)

// 多变量简短声明
x, y := 10, 20
```

## 基本数据类型

```go
// 布尔型
var isActive bool = true

// 数字类型
var intNum int = 42       // 整数
var floatNum float64 = 3.14 // 浮点数
var complex complex128 = 1 + 2i // 复数

// 字符串
var greeting string = "你好，世界"

// 常量
const PI = 3.14159
```

## 条件语句

```go
// if 语句
if score >= 90 {
    fmt.Println("优秀")
} else if score >= 60 {
    fmt.Println("及格")
} else {
    fmt.Println("不及格")
}

// switch 语句
switch day {
case "星期一":
    fmt.Println("开始工作")
case "星期六", "星期日":
    fmt.Println("周末休息")
default:
    fmt.Println("普通工作日")
}

// switch 无条件形式
switch {
case hour < 12:
    fmt.Println("上午好")
case hour < 18:
    fmt.Println("下午好")
default:
    fmt.Println("晚上好")
}
```

## 循环语句

Go 只有 for 循环，但有多种形式：

```go
// 标准for循环
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// 类似while循环
count := 0
for count < 5 {
    fmt.Println(count)
    count++
}

// 无限循环
for {
    fmt.Println("无限循环")
    break // 使用break跳出循环
}

// for range循环
numbers := []int{1, 2, 3, 4, 5}
for index, value := range numbers {
    fmt.Printf("索引: %d, 值: %d\n", index, value)
}
```

## 函数定义

```go
// 基本函数
func greet(name string) {
    fmt.Printf("你好，%s\n", name)
}

// 带返回值的函数
func add(a, b int) int {
    return a + b
}

// 多返回值
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("除数不能为零")
    }
    return a / b, nil
}

// 命名返回值
func rectangle(width, height float64) (area, perimeter float64) {
    area = width * height
    perimeter = 2 * (width + height)
    return // 裸返回，返回命名的返回值
}

// 可变参数
func sum(numbers ...int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}
```

## 指针

```go
// 指针声明和使用
var ptr *int  // 声明指针
num := 42
ptr = &num    // 获取地址

fmt.Printf("num的值: %d\n", num)
fmt.Printf("ptr指向的地址: %p\n", ptr)
fmt.Printf("ptr指向的值: %d\n", *ptr)

// 通过指针修改值
*ptr = 100
fmt.Printf("修改后num的值: %d\n", num)
```

## 结构体

```go
// 定义结构体
type Person struct {
    Name    string
    Age     int
    Address string
}

// 创建结构体实例
var p1 Person
p1.Name = "张三"
p1.Age = 30
p1.Address = "北京市"

// 简短初始化
p2 := Person{"李四", 25, "上海市"}

// 字段名初始化
p3 := Person{
    Name:    "王五",
    Age:     35,
    Address: "广州市",
}

// 结构体指针
p4 := &Person{"赵六", 40, "深圳市"}
fmt.Println(p4.Name) // 可以直接使用p4.Name，无需(*p4).Name
```

## 方法

```go
// 给结构体定义方法
type Rectangle struct {
    Width  float64
    Height float64
}

// 值接收者
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// 指针接收者
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// 使用方法
rect := Rectangle{10, 5}
fmt.Printf("面积: %.2f\n", rect.Area())

rect.Scale(2)
fmt.Printf("缩放后的面积: %.2f\n", rect.Area())
```

## 接口

```go
// 定义接口
type Shape interface {
    Area() float64
    Perimeter() float64
}

// 实现接口
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * 3.14 * c.Radius
}

// 使用接口
func printShapeInfo(s Shape) {
    fmt.Printf("面积: %.2f, 周长: %.2f\n", s.Area(), s.Perimeter())
}

circle := Circle{5}
printShapeInfo(circle)
```

## 错误处理

```go
// 使用error接口
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("除数不能为零")
    }
    return a / b, nil
}

// 错误检查
result, err := divide(10, 0)
if err != nil {
    fmt.Println("错误:", err)
} else {
    fmt.Println("结果:", result)
}

// defer语句
func readFile(filename string) {
    file, err := os.Open(filename)
    if err != nil {
        fmt.Println("打开文件错误:", err)
        return
    }
    defer file.Close() // 函数结束时关闭文件
    
    // 处理文件...
}

// panic 和 recover
func recoverExample() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered:", r)
        }
    }()
    
    panic("发生严重错误")
}
```

## 包和导入

```go
// 导入单个包
import "fmt"

// 导入多个包
import (
    "fmt"
    "math"
    "strings"
)

// 使用别名
import (
    f "fmt"
    m "math"
)

// 使用点操作符
import (
    . "fmt" // 可以直接使用Println而不是fmt.Println
)

// 忽略包但执行其初始化
import (
    _ "database/sql" // 仅执行init()函数
)
``` 