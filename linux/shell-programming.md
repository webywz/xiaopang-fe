# Shell编程

## Shell基础

### Shell类型
- Bash (Bourne Again Shell)
- Zsh (Z Shell)
- Ksh (Korn Shell)
- Csh (C Shell)
- Tcsh (Tenex C Shell)

### 基本语法
```bash
#!/bin/bash
# 这是注释

# 变量定义
name="value"
echo $name

# 命令执行
result=$(command)
```

## 变量和参数

### 变量定义
```bash
# 定义变量
name="value"
readonly name  # 只读变量
unset name     # 删除变量

# 特殊变量
$0  # 脚本名称
$1  # 第一个参数
$#  # 参数个数
$*  # 所有参数
$@  # 所有参数（数组形式）
$?  # 上一个命令的退出状态
```

### 变量操作
```bash
# 字符串操作
${var#pattern}  # 从开头删除最短匹配
${var##pattern} # 从开头删除最长匹配
${var%pattern}  # 从结尾删除最短匹配
${var%%pattern} # 从结尾删除最长匹配
${var/pattern/replacement}  # 替换第一个匹配
${var//pattern/replacement} # 替换所有匹配

# 数组操作
array=(value1 value2 value3)
echo ${array[0]}
echo ${array[@]}
echo ${#array[@]}
```

## 控制结构

### 条件判断
```bash
# if语句
if [ condition ]; then
    commands
elif [ condition ]; then
    commands
else
    commands
fi

# case语句
case $var in
    pattern1)
        commands
        ;;
    pattern2)
        commands
        ;;
    *)
        commands
        ;;
esac
```

### 循环结构
```bash
# for循环
for var in list; do
    commands
done

# while循环
while [ condition ]; do
    commands
done

# until循环
until [ condition ]; do
    commands
done
```

### 条件测试
```bash
# 文件测试
[ -f file ]     # 文件存在
[ -d dir ]      # 目录存在
[ -r file ]     # 文件可读
[ -w file ]     # 文件可写
[ -x file ]     # 文件可执行

# 字符串测试
[ -z string ]   # 字符串长度为0
[ -n string ]   # 字符串长度不为0
[ string1 = string2 ]  # 字符串相等
[ string1 != string2 ] # 字符串不等

# 数值测试
[ n1 -eq n2 ]   # 相等
[ n1 -ne n2 ]   # 不等
[ n1 -gt n2 ]   # 大于
[ n1 -lt n2 ]   # 小于
[ n1 -ge n2 ]   # 大于等于
[ n1 -le n2 ]   # 小于等于
```

## 函数

### 函数定义
```bash
# 基本函数
function_name() {
    commands
}

# 带参数的函数
function_name() {
    local var=$1
    commands
}

# 返回值
function_name() {
    return value
}
```

### 函数调用
```bash
# 调用函数
function_name
function_name arg1 arg2

# 获取返回值
result=$(function_name)
```

## 输入输出

### 标准输入输出
```bash
# 输出重定向
command > file    # 覆盖
command >> file   # 追加
command 2> file   # 错误输出
command &> file   # 所有输出

# 输入重定向
command < file
command << EOF
    input
EOF
```

### 管道
```bash
# 基本管道
command1 | command2

# 命名管道
mkfifo pipe
command1 > pipe & command2 < pipe
```

## 文本处理

### 常用命令
```bash
# grep搜索
grep pattern file
grep -r pattern dir
grep -i pattern file

# sed替换
sed 's/pattern/replacement/' file
sed -i 's/pattern/replacement/' file

# awk处理
awk '{print $1}' file
awk -F: '{print $1}' file
```

### 正则表达式
```bash
# 基本匹配
.       # 任意字符
*       # 零或多个
+       # 一个或多个
?       # 零或一个
^       # 行首
$       # 行尾
[]      # 字符集
[^]     # 否定字符集
```

## 错误处理

### 错误检查
```bash
# 检查命令返回值
if [ $? -eq 0 ]; then
    echo "Success"
else
    echo "Failed"
fi

# 设置错误处理
set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时报错
```

### 调试
```bash
# 开启调试
set -x  # 显示执行的命令
set -v  # 显示执行的命令（不展开变量）

# 调试信息
echo "Debug: $var" >&2
```

## 高级特性

### 进程控制
```bash
# 后台运行
command &

# 作业控制
jobs
fg %n
bg %n

# 信号处理
trap 'commands' signal
```

### 子shell
```bash
# 创建子shell
(command)

# 命令替换
$(command)
`command`
```

## 实用脚本示例

### 系统监控脚本
```bash
#!/bin/bash

# 监控系统资源
monitor_system() {
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)"
    
    echo "Memory Usage:"
    free -h
    
    echo "Disk Usage:"
    df -h
}

# 主函数
main() {
    while true; do
        monitor_system
        sleep 5
    done
}

main
```

### 文件备份脚本
```bash
#!/bin/bash

# 备份目录
backup_dir="/backup"
source_dir="/data"

# 创建备份
create_backup() {
    local date=$(date +%Y%m%d)
    local backup_file="$backup_dir/backup_$date.tar.gz"
    
    tar -czf "$backup_file" "$source_dir"
    
    if [ $? -eq 0 ]; then
        echo "Backup created: $backup_file"
    else
        echo "Backup failed"
        exit 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    find "$backup_dir" -name "backup_*.tar.gz" -mtime +7 -delete
}

# 主函数
main() {
    create_backup
    cleanup_old_backups
}

main
```

### 日志分析脚本
```bash
#!/bin/bash

# 分析日志文件
analyze_log() {
    local log_file=$1
    local pattern=$2
    
    echo "Analyzing $log_file for pattern: $pattern"
    grep "$pattern" "$log_file" | awk '{print $1}' | sort | uniq -c | sort -nr
}

# 主函数
main() {
    if [ $# -ne 2 ]; then
        echo "Usage: $0 <log_file> <pattern>"
        exit 1
    fi
    
    analyze_log "$1" "$2"
}

main "$@"
```

## 最佳实践

### 代码风格
1. 使用有意义的变量名
2. 添加适当的注释
3. 使用函数组织代码
4. 保持代码简洁

### 错误处理
1. 检查命令返回值
2. 使用set命令控制错误行为
3. 添加适当的错误信息
4. 实现清理机制

### 性能优化
1. 避免不必要的子shell
2. 使用内置命令替代外部命令
3. 优化循环结构
4. 合理使用管道

### 安全考虑
1. 验证用户输入
2. 使用引号处理变量
3. 限制脚本权限
4. 保护敏感信息 