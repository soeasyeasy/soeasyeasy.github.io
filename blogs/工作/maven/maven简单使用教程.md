---
title: Maven 简单使用教程
date: 2025/03/26
tags:
  - maven
categories:
  - maven
---

以下是一份简单的 Maven 使用教程，涵盖基础概念、安装配置、常用操作及实战示例：

---

# Maven 简单使用教程

## 目录

1. [Maven 简介](#1-maven-简介)
2. [安装与配置](#2-安装与配置)
3. [项目结构与 POM 文件](#3-项目结构与-pom-文件)
4. [常用 Maven 命令](#4-常用-maven-命令)
5. [依赖管理](#5-依赖管理)
6. [构建生命周期](#6-构建生命周期)
7. [插件使用](#7-插件使用)
8. [多模块项目](#8-多模块项目)
9. [常见问题](#9-常见问题)

---

## 1. Maven 简介

Maven 是 Apache 开源的 Java 项目管理工具，提供：

- **依赖管理**：自动下载和管理第三方库
- **标准化构建流程**：编译、测试、打包、部署
- **项目模板**：快速生成项目骨架
- **多模块支持**：管理复杂项目结构

---

## 2. 安装与配置

### 2.1 安装步骤

1. **下载 Maven**  
   访问 [Maven 官网](https://maven.apache.org/download.cgi)，下载最新二进制包（如 `apache-maven-3.9.6-bin.zip`）。

2. **解压到本地目录**  
   例如：`C:\Program Files\apache-maven-3.9.6`

3. **配置环境变量**

   - **Windows**：
     ```bash
     # 系统变量添加
     M2_HOME = C:\Program Files\apache-maven-3.9.6
     PATH = %M2_HOME%\bin
     ```
   - **Linux/Mac**：  
     编辑 `~/.bashrc` 或 `~/.zshrc`：
     ```bash
     export M2_HOME=/opt/apache-maven-3.9.6
     export PATH=$M2_HOME/bin:$PATH
     ```

4. **验证安装**
   ```bash
   mvn -v
   # 输出类似：Apache Maven 3.9.6 (...)
   ```

### 2.2 配置镜像加速

修改 `conf/settings.xml`，添加阿里云镜像：

```xml
<mirrors>
  <mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

---

## 3. 项目结构与 POM 文件

### 3.1 标准目录结构

```
my-project/
├── src/
│   ├── main/
│   │   ├── java/          # 主代码
│   │   └── resources/     # 配置文件
│   └── test/
│       ├── java/          # 测试代码
│       └── resources/     # 测试配置
├── target/                # 构建输出
└── pom.xml                # 项目配置文件
```

### 3.2 POM 文件解析

`pom.xml` 是 Maven 的核心配置文件：

```xml
<project>
  <modelVersion>4.0.0</modelVersion>

  <!-- 项目坐标（唯一标识） -->
  <groupId>com.example</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging> <!-- 打包方式：jar/war/pom -->

  <!-- 依赖管理 -->
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.13.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <!-- 构建配置 -->
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.11.0</version>
        <configuration>
          <source>17</source>
          <target>17</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

---

## 4. 常用 Maven 命令

| 命令                  | 作用                      |
| --------------------- | ------------------------- |
| `mvn clean`           | 清理 `target` 目录        |
| `mvn compile`         | 编译主代码                |
| `mvn test`            | 运行测试                  |
| `mvn package`         | 打包（生成 jar/war 文件） |
| `mvn install`         | 安装到本地仓库            |
| `mvn deploy`          | 部署到远程仓库            |
| `mvn site`            | 生成项目文档              |
| `mvn dependency:tree` | 查看依赖树                |

**示例**：

```bash
# 完整构建流程
mvn clean package

# 跳过测试
mvn install -DskipTests
```

---

## 5. 依赖管理

### 5.1 添加依赖

在 `<dependencies>` 中添加：

```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>5.3.30</version>
</dependency>
```

### 5.2 依赖范围（Scope）

| Scope      | 说明                          |
| ---------- | ----------------------------- |
| `compile`  | 默认范围，参与所有阶段        |
| `test`     | 仅测试阶段使用（如 JUnit）    |
| `provided` | 由 JDK/容器提供（如 Servlet） |
| `runtime`  | 运行时需要，编译时不需要      |

### 5.3 排除冲突依赖

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>example-lib</artifactId>
  <version>1.0</version>
  <exclusions>
    <exclusion>
      <groupId>org.conflict</groupId>
      <artifactId>conflict-lib</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

---

## 6. 构建生命周期

Maven 包含三个标准生命周期：

1. **clean**：清理项目
2. **default**：核心构建流程（compile, test, package）
3. **site**：生成文档

**阶段（Phase）执行顺序**：

```bash
validate → compile → test → package → verify → install → deploy
```

---

## 7. 插件使用

### 7.1 常用插件

- **编译插件**：`maven-compiler-plugin`
- **打包插件**：`maven-assembly-plugin`
- **运行插件**：`exec-maven-plugin`

### 7.2 自定义插件配置

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-assembly-plugin</artifactId>
      <version>3.6.0</version>
      <configuration>
        <descriptorRefs>
          <descriptorRef>jar-with-dependencies</descriptorRef>
        </descriptorRefs>
      </configuration>
      <executions>
        <execution>
          <phase>package</phase>
          <goals>
            <goal>single</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

---

## 8. 多模块项目

### 8.1 项目结构

```
parent-project/
├── pom.xml               # 父 POM（packaging 为 pom）
├── module1/
│   └── pom.xml
└── module2/
    └── pom.xml
```

### 8.2 父 POM 配置

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>parent-project</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>

  <modules>
    <module>module1</module>
    <module>module2</module>
  </modules>
</project>
```

---

## 9. 常见问题

### 9.1 依赖下载失败

- 检查网络连接
- 确认镜像配置正确
- 删除本地仓库中对应的依赖目录（`~/.m2/repository`）

### 9.2 构建失败

- 查看错误日志：`mvn clean install -e`
- 检查 JDK 版本是否匹配
- 确认依赖版本是否存在

### 9.3 查看依赖冲突

```bash
mvn dependency:tree -Dverbose
```

---
