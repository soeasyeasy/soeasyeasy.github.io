---
title: docker 常用命令
date: 2025/08/15
tags:
  - 命令
categories:
  - docker
---

当然可以！作为阿里云研发的超大规模语言模型，我将为您 **全面、系统、详细地整理 Docker 和 Docker Compose 的所有常用命令**，并补充一些您可能不知道但非常实用的**高级命令和技巧**，涵盖开发、运维、调试、优化等场景。

---

# 🐳 **Docker & Docker Compose 命令大全（超详细版）**

---

## 一、Docker 基础命令分类

### ✅ 1. 镜像管理（Image）

| 命令                                       | 说明                       |
| ------------------------------------------ | -------------------------- |
| `docker images`                            | 列出本地所有镜像           |
| `docker images -a`                         | 显示所有镜像（包括中间层） |
| `docker images --no-trunc`                 | 显示完整镜像 ID            |
| `docker search nginx`                      | 搜索 Docker Hub 上的镜像   |
| `docker pull nginx:latest`                 | 拉取镜像（可指定标签）     |
| `docker pull --platform linux/amd64 nginx` | 拉取指定架构镜像           |
| `docker push myrepo/myapp:v1`              | 推送镜像到仓库             |
| `docker tag nginx mynginx:custom`          | 给镜像打标签               |
| `docker rmi nginx`                         | 删除镜像                   |
| `docker rmi $(docker images -q)`           | 删除所有本地镜像（慎用）   |
| `docker image prune`                       | 删除悬空镜像（dangling）   |
| `docker image prune -a`                    | 删除所有未使用的镜像       |
| `docker image ls --digests`                | 显示镜像摘要（digest）     |
| `docker image inspect nginx`               | 查看镜像详细信息（JSON）   |

---

### ✅ 2. 容器生命周期管理（Container）

| 命令                                   | 说明                         |
| -------------------------------------- | ---------------------------- |
| `docker run hello-world`               | 运行一个容器（一次性）       |
| `docker run -d nginx`                  | 后台运行容器（detached）     |
| `docker run -it ubuntu /bin/bash`      | 交互式运行并进入容器         |
| `docker run -p 8080:80 nginx`          | 端口映射（宿主机:容器）      |
| `docker run -v /host:/container nginx` | 卷映射（持久化数据）         |
| `docker run --name myapp nginx`        | 指定容器名称                 |
| `docker run --rm nginx`                | 容器退出后自动删除           |
| `docker run --env NAME=Qwen nginx`     | 设置环境变量                 |
| `docker start container_id`            | 启动已停止的容器             |
| `docker stop container_id`             | 停止容器（发送 SIGTERM）     |
| `docker restart container_id`          | 重启容器                     |
| `docker kill container_id`             | 强制终止容器（发送 SIGKILL） |
| `docker pause container_id`            | 暂停容器（冻结进程）         |
| `docker unpause container_id`          | 恢复容器                     |
| `docker rm container_id`               | 删除容器                     |
| `docker rm -f container_id`            | 强制删除运行中的容器         |
| `docker container prune`               | 删除所有已停止的容器         |

---

### ✅ 3. 容器查看与调试

| 命令                                        | 说明                                           |
| ------------------------------------------- | ---------------------------------------------- |
| `docker ps`                                 | 查看运行中的容器                               |
| `docker ps -a`                              | 查看所有容器（包括停止的）                     |
| `docker ps -q`                              | 仅显示容器 ID（适合脚本）                      |
| `docker ps -l`                              | 显示最新创建的容器                             |
| `docker logs container_id`                  | 查看容器日志                                   |
| `docker logs -f container_id`               | 实时查看日志（类似 tail -f）                   |
| `docker logs -t container_id`               | 显示时间戳                                     |
| `docker logs --tail 100 container_id`       | 查看最后 100 行日志                            |
| `docker exec -it container_id /bin/bash`    | 进入正在运行的容器                             |
| `docker exec -u 0 -it container_id /bin/sh` | 以 root 用户进入容器                           |
| `docker top container_id`                   | 查看容器内运行的进程                           |
| `docker stats`                              | 实时查看容器资源使用（CPU、内存、网络）        |
| `docker stats --no-stream`                  | 查看当前资源使用（不持续）                     |
| `docker inspect container_id`               | 查看容器详细信息（JSON 格式）                  |
| `docker port container_id`                  | 查看端口映射                                   |
| `docker diff container_id`                  | 查看容器文件系统变化（A:新增, D:删除, C:修改） |

---

### ✅ 4. 网络管理（Network）

| 命令                                           | 说明                       |
| ---------------------------------------------- | -------------------------- |
| `docker network ls`                            | 列出所有网络               |
| `docker network create mynet`                  | 创建自定义网络             |
| `docker network create --driver bridge mynet`  | 创建桥接网络               |
| `docker network create --driver overlay mynet` | 创建覆盖网络（Swarm）      |
| `docker network connect mynet container_id`    | 将容器连接到网络           |
| `docker network disconnect mynet container_id` | 断开容器网络连接           |
| `docker network inspect mynet`                 | 查看网络详情               |
| `docker network rm mynet`                      | 删除网络                   |
| `docker run --network mynet nginx`             | 运行容器并指定网络         |
| `docker run --network host nginx`              | 使用主机网络模式（高性能） |
| `docker run --network none nginx`              | 不使用网络                 |

---

### ✅ 5. 存储卷管理（Volume）

| 命令                                                                            | 说明                       |
| ------------------------------------------------------------------------------- | -------------------------- |
| `docker volume ls`                                                              | 列出所有卷                 |
| `docker volume create myvol`                                                    | 创建卷                     |
| `docker volume inspect myvol`                                                   | 查看卷详情                 |
| `docker volume rm myvol`                                                        | 删除卷                     |
| `docker volume prune`                                                           | 删除未使用的卷             |
| `docker run -v myvol:/data nginx`                                               | 使用命名卷                 |
| `docker run -v /path/on/host:/data nginx`                                       | 使用绑定挂载（bind mount） |
| `docker run --mount source=myvol,target=/data nginx`                            | 使用 --mount 语法（推荐）  |
| `docker volume create --driver local --opt type=tmpfs --opt device=tmpfs mytmp` | 创建 tmpfs 卷              |

---

### ✅ 6. 构建与镜像制作（Build）

| 命令                                                       | 说明                          |
| ---------------------------------------------------------- | ----------------------------- |
| `docker build -t myapp:v1 .`                               | 构建镜像                      |
| `docker build --no-cache -t myapp .`                       | 构建时不使用缓存              |
| `docker build --build-arg HTTP_PROXY=http://proxy:8080 .`  | 传递构建参数                  |
| `docker build --target builder .`                          | 多阶段构建，指定目标阶段      |
| `docker buildx build --platform linux/amd64,linux/arm64 .` | 跨平台构建（需 buildx）       |
| `docker save -o myapp.tar myapp:v1`                        | 将镜像保存为 tar 文件         |
| `docker load -i myapp.tar`                                 | 从 tar 文件加载镜像           |
| `docker import url.tar myapp:v1`                           | 从 tar 导入镜像（不保留历史） |
| `docker export container_id > container.tar`               | 导出容器文件系统              |
| `docker import container.tar myapp:v1`                     | 从容器文件系统导入镜像        |

---

### ✅ 7. Docker 系统与信息

| 命令                            | 说明                                 |
| ------------------------------- | ------------------------------------ |
| `docker version`                | 查看 Docker 版本                     |
| `docker info`                   | 查看 Docker 系统信息                 |
| `docker system df`              | 查看磁盘使用情况（镜像、容器、卷）   |
| `docker system prune`           | 清理未使用的资源（容器、网络、镜像） |
| `docker system prune -a`        | 清理所有未使用的资源（包括镜像）     |
| `docker system prune --volumes` | 清理未使用的卷                       |
| `docker login`                  | 登录 Docker 仓库                     |
| `docker logout`                 | 注销登录                             |
| `docker events`                 | 实时查看 Docker 事件流               |
| `docker history nginx`          | 查看镜像构建历史                     |
| `docker wait container_id`      | 阻塞直到容器停止，返回退出码         |

---

## 二、Docker Compose 命令大全

> 💡 使用 `docker compose`（新插件）或 `docker-compose`（旧独立命令）

### ✅ 常用命令

| 命令                                 | 说明                             |
| ------------------------------------ | -------------------------------- |
| `docker compose up`                  | 启动所有服务                     |
| `docker compose up -d`               | 后台启动                         |
| `docker compose up --build`          | 构建后启动                       |
| `docker compose up --force-recreate` | 强制重建容器                     |
| `docker compose down`                | 停止并删除容器、网络             |
| `docker compose down -v`             | 删除卷（谨慎！）                 |
| `docker compose down --rmi all`      | 删除镜像                         |
| `docker compose stop`                | 停止服务（不删除）               |
| `docker compose start`               | 启动已停止的服务                 |
| `docker compose restart`             | 重启服务                         |
| `docker compose ps`                  | 查看服务状态                     |
| `docker compose logs`                | 查看所有服务日志                 |
| `docker compose logs -f web`         | 实时查看某服务日志               |
| `docker compose exec web /bin/sh`    | 进入服务容器                     |
| `docker compose build`               | 构建服务镜像                     |
| `docker compose build --no-cache`    | 不使用缓存构建                   |
| `docker compose config`              | 验证并显示最终 compose 配置      |
| `docker compose config --services`   | 仅列出服务名称                   |
| `docker compose config --images`     | 仅列出镜像                       |
| `docker compose top`                 | 查看服务进程                     |
| `docker compose pause`               | 暂停所有服务                     |
| `docker compose unpause`             | 恢复暂停的服务                   |
| `docker compose kill`                | 强制终止服务                     |
| `docker compose run web /bin/sh`     | 临时运行一个服务容器（用于调试） |
| `docker compose run --rm web ls /`   | 运行一次命令后删除容器           |

---

### ✅ 高级 Compose 技巧

#### 1. 使用多个 compose 文件（环境隔离）

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 2. 指定环境文件

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DB_HOST
# .env 文件
DB_HOST=prod-db.example.com
```

#### 3. 健康检查

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

#### 4. 依赖与启动顺序

```yaml
depends_on:
  db:
    condition: service_healthy
```

---

## 三、您可能不知道的 Docker 高级命令

### 🔥 1. `docker stats --format`（自定义输出）

```bash
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### 🔥 2. `docker run --init`（使用 tini 作为 init 进程）

```bash
docker run --init myapp
```

> 避免僵尸进程，推荐生产使用。

### 🔥 3. `docker run --read-only`（只读文件系统）

```bash
docker run --read-only --tmpfs /tmp myapp
```

> 提高安全性。

### 🔥 4. `docker run --security-opt`（安全选项）

```bash
docker run --security-opt apparmor=unconfined myapp
```

### 🔥 5. `docker checkpoint`（检查点与恢复）

```bash
docker checkpoint create container_id checkpoint1
docker start --checkpoint checkpoint1 container_id
```

> 需启用实验特性。

### 🔥 6. `docker build --squash`（压缩镜像层）

```bash
docker build --squash -t myapp .
```

> 减少镜像层数，需启用 `--experimental`。

### 🔥 7. `docker scan`（镜像漏洞扫描）

```bash
docker scan nginx:latest
```

> 需安装 `docker scan` 插件。

### 🔥 8. `docker context`（多环境管理）

```bash
docker context create remote --docker "host=ssh://user@remote"
docker context use remote
```

> 管理多个 Docker 主机。

---

## 四、最佳实践建议

1. **始终使用镜像加速器**（如阿里云）
2. **使用 `.dockerignore`** 避免不必要的文件进入构建上下文
3. **使用非 root 用户运行容器**
4. **定期清理资源**：`docker system prune -a`
5. **使用 `--rm`** 临时容器
6. **生产环境使用 `docker compose` 或 Kubernetes**
7. **敏感信息使用 `docker secret` 或环境变量管理**

---

## ✅ 总结

| 类别    | 关键命令                                          |
| ------- | ------------------------------------------------- |
| 镜像    | `pull`, `build`, `push`, `tag`, `rmi`             |
| 容器    | `run`, `start`, `stop`, `exec`, `logs`            |
| 网络    | `network create`, `connect`, `inspect`            |
| 卷      | `volume create`, `ls`, `prune`                    |
| 系统    | `system prune`, `info`, `version`                 |
| Compose | `up`, `down`, `logs`, `exec`, `config`            |
| 高级    | `checkpoint`, `scan`, `context`, `build --squash` |

---

这份命令大全涵盖了 **99% 的日常使用场景**，并包含了一些**高级运维技巧**。建议收藏此页，作为您的 Docker 手册。
