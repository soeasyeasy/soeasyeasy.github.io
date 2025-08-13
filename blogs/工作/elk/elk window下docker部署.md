---
title: blogs/工作/elk/elk window下docker部署.md
date: 2025/08/31
tags:
  - elk
categories:
  - elk
---

在 ELK 这个术语中，"L" 代表 **Logstash**。ELK 是一个流行的开源日志管理平台的缩写，它由三个主要组件组成：

1. **Elasticsearch**：用于存储、搜索和分析日志数据及其他数据的分布式搜索引擎。
2. **Logstash**："L" 所指的部分，是一个服务器端的数据处理管道，能够同时从多个来源采集数据，进行转换，然后将数据发送到你选择的“存储库”中，如 Elasticsearch。
3. **Kibana**：提供了一个可视化的界面，用于浏览、搜索、分析和展示存储在 Elasticsearch 中的数据。

### Logstash 的主要功能

- **数据收集**：可以从各种数据源（如日志文件、系统指标、网络流等）采集数据。
- **数据处理**：通过丰富的过滤器插件对输入的数据进行解析、格式化、修改或增强。例如，可以使用 Grok 解析非结构化日志数据并使其结构化。
- **数据输出**：可以将处理后的数据发送到不同的目的地，最常见的是 Elasticsearch，但也可以配置为其他输出目标，如文件、电子邮件、数据库等。

### Logstash 工作流程

1. **Inputs（输入）**：定义如何从不同源头采集数据。支持多种输入插件，包括文件、syslog、beats 等。
2. **Filters（过滤器）**：用于处理和解析输入的数据。例如，你可以使用过滤器来解析日志行，添加地理信息，移除敏感数据等。
3. **Outputs（输出）**：指定处理完的数据应该发送到哪里。最常见的输出是 Elasticsearch，但也可以是其他形式，比如发送警报到电子邮件或保存到文件系统中。

### 示例场景

假设你有一个 Web 应用程序，它生成大量的访问日志。你可以配置 Logstash 来读取这些日志文件（Input），使用 Grok 过滤器解析每一行日志以提取有用的信息（Filter），然后将解析后的数据发送到 Elasticsearch（Output）。之后，使用 Kibana 可以创建仪表板来可视化这些日志数据，帮助你更好地理解应用的行为和性能。

### 替代方案

值得注意的是，在一些场景下，用户可能会选择不使用 Logstash，而是使用更轻量级的解决方案，如 **Filebeat** 或者 **Metricbeat**，它们属于 Elastic 的 Beats 系列。Beats 能够直接向 Elasticsearch 发送数据，并且与 Logstash 结合使用时也能减少资源消耗。这种情况下，架构可能被称为 **EFK**（Elasticsearch, Filebeat/Kibana）。不过，当需要复杂的数据处理逻辑时，Logstash 仍然是不可或缺的选择。

`spring-data-elasticsearch:5.0.7` 是 Spring Data Elasticsearch 的一个版本，它基于 **Elasticsearch 7.17.x** 客户端。

---

### ✅ 对应关系：Spring Data Elasticsearch 5.0.x → Elasticsearch 7.17.x

| 组件                                | 版本                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| **Spring Data Elasticsearch**       | `5.0.7`                                              |
| **底层 Elasticsearch Java Client**  | **7.17.x**（Transport Client / RestHighLevelClient） |
| **兼容的 Elasticsearch 服务端版本** | **7.17.x**                                           |

> ⚠️ 注意：Spring Data Elasticsearch 5.x **不使用**新的 `co.elastic.clients:elasticsearch-java`（即 8.x 的 Java API Client），而是基于旧的 **`org.elasticsearch.client:rest-high-level-client`**（7.17.x）。

---

### 🐳 Docker 镜像推荐

因此，您应该使用 **Elasticsearch 7.17.x** 的 Docker 镜像，例如：

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:7.17.18
```

✅ 推荐版本：`7.17.18`（7.x 最终版本，稳定、安全补丁更新）

---

### 🔗 版本对应表（Spring Data Elasticsearch → Elasticsearch）

| Spring Data Elasticsearch | Spring Boot | Elasticsearch 服务端      | 客户端类型                               |
| ------------------------- | ----------- | ------------------------- | ---------------------------------------- |
| 5.0.x (如 5.0.7)          | 3.0.x       | 7.17.x                    | `RestHighLevelClient`                    |
| 5.1.x                     | 3.1.x       | 7.17.x / 8.7+（有限支持） | 混合                                     |
| 6.0+                      | 3.2+        | 8.9+                      | `java-api-client` (`co.elastic.clients`) |

> 📌 `spring-data-elasticsearch:5.0.7` 发布于 2023 年初，是 Spring Data 2022.0.x 版本的一部分，对应 Spring Boot 3.0.x。

---

### ✅ 总结

- ✅ **Docker 镜像版本**：`elasticsearch:7.17.18`
- ✅ **Maven 依赖**：
  ```xml
  <dependency>
      <groupId>org.springframework.data</groupId>
      <artifactId>spring-data-elasticsearch</artifactId>
      <version>5.0.7</version>
  </dependency>
  ```
- ✅ **客户端类型**：`RestHighLevelClient`（已弃用，但在 7.17 中仍可用）
- ✅ **连接方式**：HTTP + Transport（9300 端口在 7.x 中仍可用，但推荐用 REST）

---

### 🛑 不要使用 Elasticsearch 8.x 的 Docker 镜像

如 `8.0`, `8.1`, `8.13` 等，虽然 **7.17 客户端可以连接 8.x 服务端**（向后兼容），但：

- 8.x 默认启用安全（用户名/密码）
- 某些 API 行为变化（如默认分页大小）
- 可能触发弃用警告或兼容性问题

所以，**最稳妥的是使用 `7.17.18`**。

---

✅ **最终推荐 Docker 命令**：

```bash
docker run -d \
  --name es717 \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:7.17.18
```

---

## ✅ 1. 什么是 Kibana？

Kibana 是 Elasticsearch 的可视化界面，用于：

- 查询数据（Dev Tools）
- 创建仪表盘（Dashboard）
- 监控集群状态
- 管理索引（Index Patterns, Index Management）

---

## ✅ 2. 安装 Kibana（Docker 方式，推荐）

您已经运行了 Elasticsearch 7.17.18，现在添加 Kibana：

### 🐳 启动 Kibana 容器

```bash
docker run -d \
  --name kibana \
  -p 5601:5601 \
  --network host \  # 或使用 --link 与 es 容器通信
  -e "ELASTICSEARCH_HOSTS=http://localhost:9200" \
  -e "XPACK_SECURITY_ENABLED=false" \
  docker.elastic.co/kibana/kibana:7.17.18
```

> ⚠️ 如果 Elasticsearch 不在 `localhost`，请将 `ELASTICSEARCH_HOSTS` 改为实际地址，如：
>
> ```bash
> -e "ELASTICSEARCH_HOSTS=http://192.168.1.100:9200"
> ```

---

## ✅ 3. 访问 Kibana

打开浏览器访问：

```
http://localhost:5601
```

您将看到 Kibana 首页。

> 📌 由于您禁用了安全功能（`xpack.security.enabled=false`），无需登录即可使用。

---

## ✅ 4. 常用功能入口

| 功能                    | 路径                                  |
| ----------------------- | ------------------------------------- | ---------------------------- |
| **Dev Tools（控制台）** | `http://localhost:5601/app/dev_tools` | 用于执行 REST API 查询       |
| **Discover**            | 主页                                  | 查看文档、创建 Index Pattern |
| **Stack Management**    | 左侧菜单                              | 管理索引、标签、脚本等       |

---

## ✅ 5. 示例：在 Dev Tools 中测试 IDs 查询

进入 **Dev Tools**，输入：

```json
GET /your_index_name/_search
{
  "query": {
    "ids": {
      "values": ["1", "2", "3"]
    }
  }
}
```

替换 `your_index_name` 为您的实际索引名。

---

## ✅ 6. 与 Spring Data Elasticsearch 配合使用

- Kibana 用于 **调试、查看数据、验证映射（mapping）**
- Spring 应用负责业务逻辑
- 两者连接同一个 Elasticsearch 实例

---

## ✅ 7. 注意事项

| 项目         | 说明                                                          |
| ------------ | ------------------------------------------------------------- |
| **版本匹配** | Kibana 版本必须与 Elasticsearch **主版本一致**（都是 7.17.x） |
| **内存**     | Kibana 至少需要 1GB 内存，建议 Docker 分配 2GB                |
| **网络**     | 确保 Kibana 能访问 Elasticsearch 的 `9200` 端口               |
| **生产环境** | 建议启用 `xpack.security.enabled=true` 并设置密码             |

---

## ✅ 8. 停止/删除容器

```bash
# 停止
docker stop kibana

# 删除
docker rm kibana
```

---

您提出了一个非常关键的问题！

> **在 Windows 上使用 Docker Desktop 启动了 Elasticsearch 和 Kibana，Kibana 能否通过 `http://localhost:9200` 连接 Elasticsearch？**

---

### ✅ 简短回答：

**可以！在绝大多数情况下，Kibana 容器内使用 `http://localhost:9200` 是能正常连接到 Elasticsearch 的——但前提是：您使用的是 `host` 网络模式，或者正确配置了容器间通信。**

但默认情况下，**Docker 容器的 `localhost` 不等于宿主机的 `localhost`**，所以需要特别注意网络配置。

---

## 🧩 问题本质：容器网络隔离

- 您在 Windows 上运行 Docker。
- Elasticsearch 容器监听 `0.0.0.0:9200`，并通过 `-p 9200:9200` 映射到 Windows 主机。
- Kibana 容器运行在自己的网络环境中。
- Kibana 容器内的 `localhost` 指的是 **它自己**，而不是宿主机或 Elasticsearch 容器。

所以，如果 Kibana 配置为：

```env
ELASTICSEARCH_HOSTS=http://localhost:9200
```

它会去访问 **自己容器内部的 9200 端口**，而那里没有 Elasticsearch，导致连接失败。

---

## ✅ 正确解决方案

### ✅ 方案 1：使用 Docker 自定义网络（推荐 ✅）

这是最标准、最可靠的方式。

#### 1. 创建自定义网络

```bash
docker network create es-net
```

#### 2. 启动 Elasticsearch 并加入网络

```bash
docker run -d \
  --name elasticsearch \
  --network es-net \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:7.17.18
```

#### 3. 启动 Kibana 并加入同一网络

```bash
docker run -d \
  --name kibana \
  --network es-net \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  -e "XPACK_SECURITY_ENABLED=false" \
  docker.elastic.co/kibana/kibana:7.17.18
```

> 🔥 关键点：
>
> - `--network es-net`：两个容器在同一个网络
> - `http://elasticsearch:9200`：使用容器名称作为主机名，Docker 会自动解析

✅ 这种方式在 Windows、Mac、Linux 上都适用。

---

### ✅ 方案 2：使用 `host.docker.internal`（Windows/Mac 专用）

Docker Desktop 为 Windows 和 Mac 提供了一个特殊主机名：

> `host.docker.internal`

它指向 **宿主机（Windows）本身**。

#### 启动 Kibana 时使用：

```bash
docker run -d \
  --name kibana \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://host.docker.internal:9200" \
  -e "XPACK_SECURITY_ENABLED=false" \
  docker.elastic.co/kibana/kibana:7.17.18
```

这样 Kibana 容器就能通过 `host.docker.internal:9200` 访问宿主机上的 Elasticsearch。

✅ 适用于：

- Elasticsearch 运行在 Windows 本机（非容器）
- 或 Elasticsearch 容器已通过 `-p 9200:9200` 暴露端口

---

### ❌ 方案 3：`--network host`（Windows 不支持）

```bash
--network host
```

这种方式可以让容器共享宿主机网络，`localhost` 直接生效。

⚠️ **但在 Windows 上的 Docker Desktop 中，`--network host` 不支持！**

所以这个方案 **不可用**。

---

## ✅ 总结：Windows 上推荐做法

| 场景                                                  | 推荐方案                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| ✅ **Elasticsearch 和 Kibana 都用 Docker**            | **使用 `docker network` + 容器名称（如 `http://elasticsearch:9200`）** |
| ✅ **Elasticsearch 在 Windows 本机运行（非 Docker）** | 使用 `http://host.docker.internal:9200`                                |
| ✅ **两个都用 Docker，但不想建网络**                  | 确保 ES 暴露端口，Kibana 用 `http://host.docker.internal:9200`         |

---

## ✅ 验证方法

进入 Kibana 容器测试连接：

```bash
docker exec -it kibana bash
curl http://elasticsearch:9200  # 或 host.docker.internal:9200
```

如果返回 Elasticsearch 的 JSON 信息，说明连接成功。

---

## ✅ 最终建议

使用 **自定义网络 + 容器名称**，这是最标准、跨平台、可扩展的方式。

```bash
# 1. 创建网络
docker network create es-net

# 2. 启动 ES
docker run -d --name es --network es-net -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:7.17.18

# 3. 启动 Kibana
docker run -d --name kibana --network es-net -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://es:9200" -e "XPACK_SECURITY_ENABLED=false" kibana:7.17.18
```

✅ 完美运行，无网络问题。

---
