<!-- /**
 * Java IO流
 * @description Java 输入输出流的基本用法与案例
 */ -->

# Java IO 流详解

## 1. IO 流体系结构

Java IO（Input/Output）流用于处理数据的输入与输出，分为字节流和字符流。

- **字节流**：以字节为单位处理数据，适合二进制文件（如图片、音频）。
  - 输入流：`InputStream` 及其子类
  - 输出流：`OutputStream` 及其子类
- **字符流**：以字符为单位处理数据，适合文本文件。
  - 输入流：`Reader` 及其子类
  - 输出流：`Writer` 及其子类

IO 流结构图：
```
InputStream         OutputStream
   ├── FileInputStream   ├── FileOutputStream
   ├── BufferedInputStream ├── BufferedOutputStream
   └── ObjectInputStream  └── ObjectOutputStream
Reader              Writer
   ├── FileReader        ├── FileWriter
   └── BufferedReader    └── BufferedWriter
```

---

## 2. 常用 IO 类

### 2.1 字节流

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * 复制文件（字节流）
 * @param src 源文件路径
 * @param dest 目标文件路径
 * @throws IOException IO异常
 */
public void copyFile(String src, String dest) throws IOException {
    try (FileInputStream fis = new FileInputStream(src);
         FileOutputStream fos = new FileOutputStream(dest)) {
        byte[] buffer = new byte[1024];
        int len;
        while ((len = fis.read(buffer)) != -1) {
            fos.write(buffer, 0, len);
        }
    }
}
```

### 2.2 字符流

```java
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

/**
 * 读取并写入文本文件（字符流）
 * @param src 源文件路径
 * @param dest 目标文件路径
 * @throws IOException IO异常
 */
public void copyTextFile(String src, String dest) throws IOException {
    try (FileReader fr = new FileReader(src);
         FileWriter fw = new FileWriter(dest)) {
        char[] buffer = new char[1024];
        int len;
        while ((len = fr.read(buffer)) != -1) {
            fw.write(buffer, 0, len);
        }
    }
}
```

### 2.3 缓冲流

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

/**
 * 按行读取文本文件
 * @param path 文件路径
 * @throws IOException IO异常
 */
public void readLines(String path) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader(path))) {
        String line;
        while ((line = br.readLine()) != null) {
            System.out.println(line);
        }
    }
}
```

---

## 3. 文件与目录操作

```java
import java.io.File;

/**
 * 创建目录和文件
 * @param dirPath 目录路径
 * @param fileName 文件名
 * @throws IOException IO异常
 */
public void createFile(String dirPath, String fileName) throws IOException {
    File dir = new File(dirPath);
    if (!dir.exists()) {
        dir.mkdirs();
    }
    File file = new File(dir, fileName);
    if (!file.exists()) {
        file.createNewFile();
    }
}
```

---

## 4. try-with-resources 自动关闭资源（Java 7+）

- 自动关闭实现了 `AutoCloseable` 接口的资源，避免资源泄漏。

```java
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

/**
 * try-with-resources 写文件
 * @param path 文件路径
 * @throws IOException IO异常
 */
public void writeFile(String path) throws IOException {
    try (BufferedWriter bw = new BufferedWriter(new FileWriter(path))) {
        bw.write("Hello, IO!");
    }
}
```

---

## 5. NIO 简介

- NIO（New IO）是 Java 1.4 引入的高性能 IO，支持缓冲区、通道、非阻塞 IO。
- 常用类：`java.nio.file.Files`、`Paths`、`Channels`、`ByteBuffer`。

```java
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

/**
 * NIO 读取文件所有内容
 * @param path 文件路径
 * @return 文件内容字符串
 * @throws IOException IO异常
 */
public String readAll(String path) throws IOException {
    return new String(Files.readAllBytes(Paths.get(path)));
}
```

---

## 6. 常见易错点
- 忘记关闭流导致资源泄漏。
- 字节流与字符流混用导致乱码。
- 文件路径分隔符不兼容（建议用 File.separator）。
- 读写大文件时未使用缓冲流，效率低。
- try-with-resources 只能用于实现 AutoCloseable 的资源。

---

## 7. 进阶拓展
- 对象序列化与反序列化（ObjectInputStream/ObjectOutputStream）
- DataInputStream/DataOutputStream 处理基本类型
- NIO 的 Selector、Channel、Buffer
- 第三方高性能 IO 库（如 Netty）

---

## 8. 参考资料
- [Java 官方 IO 文档](https://docs.oracle.com/javase/tutorial/essential/io/index.html)
- 《Java 编程思想》
- 《Effective Java》

---

## 目录
- [File 类](#file-类)
- [字节流 InputStream/OutputStream](#字节流-inputstreamoutputstream)
- [字符流 Reader/Writer](#字符流-readerwriter)
- [缓冲流 Buffered 流](#缓冲流-buffered-流)
- [对象流 ObjectInputStream/ObjectOutputStream](#对象流-objectinputstreamobjectoutputstream)
- [NIO 简介](#nio-简介)
- [常见文件操作案例](#常见文件操作案例)
- [常见问题 FAQ](#常见问题-faq)

---

## File 类

- 用于表示文件和目录，支持文件属性、创建、删除、重命名等操作。

```java
import java.io.File;

File file = new File("test.txt");
System.out.println(file.exists()); // 判断文件是否存在
System.out.println(file.getAbsolutePath());
```

---

## 字节流 InputStream/OutputStream

- 处理所有类型的原始字节数据，适合二进制文件（如图片、音频）。

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;

FileInputStream fis = new FileInputStream("input.txt");
FileOutputStream fos = new FileOutputStream("output.txt");
int b;
while ((b = fis.read()) != -1) {
    fos.write(b);
}
fis.close();
fos.close();
```

---

## 字符流 Reader/Writer

- 处理字符数据，适合文本文件。

```java
import java.io.FileReader;
import java.io.FileWriter;

FileReader fr = new FileReader("input.txt");
FileWriter fw = new FileWriter("output.txt");
int c;
while ((c = fr.read()) != -1) {
    fw.write(c);
}
fr.close();
fw.close();
```

---

## 缓冲流 Buffered 流

- 提高读写效率，减少磁盘操作次数。

```java
import java.io.BufferedReader;
import java.io.FileReader;

BufferedReader br = new BufferedReader(new FileReader("input.txt"));
String line;
while ((line = br.readLine()) != null) {
    System.out.println(line);
}
br.close();
```

---

## 对象流 ObjectInputStream/ObjectOutputStream

- 用于对象的序列化与反序列化。

```java
import java.io.*;

ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("obj.dat"));
oos.writeObject(new Person("小胖", 20));
oos.close();

ObjectInputStream ois = new ObjectInputStream(new FileInputStream("obj.dat"));
Person p = (Person) ois.readObject();
ois.close();
```

---

## NIO 简介

- NIO（New IO）是 Java 1.4 引入的高性能 IO，支持缓冲区、通道、选择器等。
- 适合高并发、大数据量场景。

```java
import java.nio.file.*;

Files.copy(Paths.get("a.txt"), Paths.get("b.txt"), StandardCopyOption.REPLACE_EXISTING);
```

---

## 常见文件操作案例

- 创建文件/目录、删除、重命名、遍历目录等。

```java
File dir = new File("testDir");
dir.mkdir(); // 创建目录
dir.delete(); // 删除目录

File[] files = dir.listFiles();
for (File f : files) {
    System.out.println(f.getName());
}
```

---

## 常见问题 FAQ

### Q1: 字节流和字符流如何选择？
A: 处理二进制数据用字节流，处理文本用字符流。

### Q2: IO 操作后为什么要关闭流？
A: 释放系统资源，避免内存泄漏。

### Q3: NIO 和传统 IO 区别？
A: NIO 支持非阻塞 IO、高效缓冲区和通道，适合高性能场景。

---

> 本文档持续完善，欢迎补充更多 IO 流相关案例。 