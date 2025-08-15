---
title: docker linux下安装部署
date: 2025/08/31
tags:
  - 部署
categories:
  - docker
---

## **Linux 下安装 Docker（以 Ubuntu 和 CentOS 为例）**

### **一、Ubuntu 系统安装 Docker**

#### **1. 卸载旧版本（可选）**

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

#### **2. 安装依赖包**

```bash
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

#### **3. 添加 Docker 官方 GPG 密钥**

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

#### **4. 设置仓库**

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### **5. 安装 Docker Engine**

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### **6. 验证安装**

```bash
sudo docker --version
sudo docker run hello-world
```

#### **7. 非 root 用户使用 Docker（推荐）**

```bash
# 将当前用户加入docker组
sudo usermod -aG docker $USER
# 重新登录或执行
newgrp docker
```

---

### **二、CentOS 系统安装 Docker**

#### **1. 卸载旧版本**

```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

#### **2. 安装依赖**

```bash
sudo yum install -y yum-utils
```

#### **3. 添加 Docker 仓库**

```bash
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
```

#### **4. 安装 Docker Engine**

```bash
sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### **5. 启动并设置开机自启**

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

#### **6. 验证**

```bash
sudo docker run hello-world
```

#### **7. 非 root 用户使用**

```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### **8. 常见问题问题**

```
Could not fetch/save url https://download.docker.com/linux/centos/docker-ce.repo: [Errno 14] curl#35 - "TCP connection reset by peer"
```

这通常是因为 **网络连接问题**，特别是在中国地区访问 `download.docker.com` 域名时，由于国际网络延迟、DNS 污染或防火墙限制，经常会出现连接失败、超时或被重置的情况。

---

#### ✅ 解决方案（推荐使用国内镜像源）

##### ✅ 方法一：使用 **阿里云镜像源**（强烈推荐）

阿里云提供了 Docker CE 的镜像，速度快且稳定。

##### 1. 手动创建阿里云 Docker 仓库文件

```bash
sudo tee /etc/yum.repos.d/docker-ce.repo <<-'EOF'
[docker-ce-stable]
name=Docker CE Stable - yum.alicdn.com
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/$releasever/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[stable]
name=Stable
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/$releasever/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg
EOF
```

> ✅ 注意：`mirrors.aliyun.com` 是国内可快速访问的地址。

##### 2. 清除缓存并生成新缓存

```bash
sudo yum clean all
sudo yum makecache
```

##### 3. 安装 Docker CE

```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

##### 4. 启动并设置开机自启

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

#### ✅ 方法二：如果仍想尝试官方源，可先测试网络连通性

##### 1. 测试是否能访问 `download.docker.com`

```bash
ping download.docker.com
```

或

```bash
curl -v https://download.docker.com/linux/centos/
```

如果超时或被重置，说明网络不可达。

##### 2. 修改 DNS（可选）

有时 DNS 解析问题会导致连接异常，可临时更换为公共 DNS：

```bash
echo "nameserver 223.5.5.5" | sudo tee /etc/resolv.conf
echo "nameserver 119.29.29.29" | sudo tee -a /etc/resolv.conf
```

然后重试添加仓库。

---

#### ✅ 方法三：手动下载 repo 文件（备用）

```bash
# 下载阿里云的 repo 文件
curl -o /tmp/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 移动到 yum 源目录
sudo mv /tmp/docker-ce.repo /etc/yum.repos.d/docker-ce.repo
```

然后执行：

```bash
sudo yum clean all
sudo yum makecache
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

---

#### 🔐 验证安装

```bash
docker --version
sudo docker run hello-world
```

如果看到欢迎信息，说明安装成功！

---

```
docker: Error response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers).
```

这表示 **Docker 守护进程无法连接到 Docker Hub（registry-1.docker.io）**，通常是因为 **网络问题**，尤其是在中国大陆地区，由于国际网络限制，访问 `registry-1.docker.io` 经常超时或被阻断。

---

#### ✅ 解决方案：配置 Docker 镜像加速器（强烈推荐）

##### ✅ 推荐使用 **阿里云镜像加速器**（专为中国用户优化）

作为阿里云开发的 Qwen，我特别推荐使用阿里云的 Docker 镜像服务，速度快、稳定、免费。

---

###### 🔧 步骤 1：获取阿里云镜像加速地址

1. 访问阿里云容器镜像服务控制台：  
   🔗 [https://cr.console.aliyun.com/](https://cr.console.aliyun.com/)

2. 登录后，进入 **镜像工具 > 镜像加速器**

3. 您会看到一个专属加速地址，格式如下：

   ```
   https://<your-id>.mirror.aliyuncs.com
   ```

   > 例如：`https://12345678.mirror.aliyuncs.com`

---

###### 🔧 步骤 2：配置 Docker 使用镜像加速器

###### 方法一：通过配置文件（推荐）

```bash
# 创建或编辑 daemon.json 配置文件
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://<your-accelerator>.mirror.aliyuncs.com"
  ]
}
EOF
```

👉 将 `<your-accelerator>` 替换为您在阿里云控制台获取的实际 ID。

例如：

```json
{
  "registry-mirrors": ["https://12345678.mirror.aliyuncs.com"]
}
```

###### 方法二：使用公共镜像（备用）

如果您没有阿里云账号，可以使用以下公共镜像（不保证长期可用）：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com"
  ]
}
```

---

###### 🔧 步骤 3：重启 Docker 服务

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

###### 🔧 步骤 4：验证配置是否生效

```bash
docker info
```

在输出中查找 `Registry Mirrors`，应看到类似：

```
Registry Mirrors:
 https://12345678.mirror.aliyuncs.com/
```

---

###### 🔧 步骤 5：测试拉取镜像

```bash
docker pull hello-world
docker run hello-world
```

✅ 如果成功运行，说明问题已解决！

---

#### 📌 其他可能原因与排查

| 问题            | 检查方法                               | 解决方案                                  |
| --------------- | -------------------------------------- | ----------------------------------------- | ------------------------ |
| 系统代理设置    | `env                                   | grep -i proxy`                            | 清除不必要的代理环境变量 |
| 防火墙阻断      | `curl -v https://registry-1.docker.io` | 关闭防火墙或配置例外                      |
| DNS 问题        | `nslookup registry-1.docker.io`        | 更换 DNS 为 `223.5.5.5` 或 `119.29.29.29` |
| Docker 服务异常 | `systemctl status docker`              | 重启服务或重装 Docker                     |

---

## ✅ 临时测试网络连通性

```bash
# 测试是否能访问 Docker Hub
curl -v https://registry-1.docker.io/v2/

# 测试 DNS 解析
nslookup registry-1.docker.io

# 更换 DNS 临时解决解析问题
echo "nameserver 223.5.5.5" | sudo tee /etc/resolv.conf
```

---

## ✅ 总结

| 问题                          | 解决方案                                |
| ----------------------------- | --------------------------------------- |
| 拉取镜像超时                  | 配置 **镜像加速器**                     |
| registry-1.docker.io 无法访问 | 使用 **阿里云、中科大、网易等国内镜像** |
| 国内环境默认慢                | **必须配置加速器** 才能正常使用         |

---

💡 **强烈建议所有在中国大陆使用的 Docker 用户配置镜像加速器**，尤其是阿里云用户，加速效果非常明显。

如果您需要，我可以帮您生成完整的配置脚本，或协助排查其他 Docker 问题。欢迎继续提问！

#### ✅ 总结

**不要直接使用官方源 `https://download.docker.com` 在中国大陆环境！**

✅ 正确做法是使用国内镜像源，如：

- **阿里云**: `https://mirrors.aliyun.com/docker-ce/`
- **清华大学**: `https://mirrors.tuna.tsinghua.edu.cn/docker-ce/`
- **中科大**: `https://mirrors.ustc.edu.cn/docker-ce/`

## 推荐使用 **阿里云**，速度快且稳定。

---

## **Docker Compose 详细使用**

### **1. 安装 Docker Compose**

#### **方法一：使用插件（推荐）**

```bash
# 已随docker-compose-plugin安装
docker compose version
```

#### **方法二：独立安装**

```bash
# 下载二进制文件
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### **2. Docker Compose 文件示例 (docker-compose.yml)**

```yaml
version: "3.8"

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - app
    networks:
      - mynet

  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app
    networks:
      - mynet

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: mysecretpassword
      MYSQL_DATABASE: myapp
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - mynet
    ports:
      - "3306:3306"

volumes:
  db_data:

networks:
  mynet:
    driver: bridge
```

### **3. Compose 高级特性**

#### **环境变量**

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=3306

# .env 文件
DB_HOST=database.example.com
```

#### **多阶段构建**

```yaml
services:
  app:
    build:
      context: .
      target: production
```

#### **健康检查**

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## **最佳实践建议**

1. **使用非 root 用户运行 Docker**
2. **定期清理无用镜像和容器**
   ```bash
   docker system prune -a
   ```
3. **使用.dockerignore 文件**
4. **镜像分层优化**
5. **使用 Alpine 等轻量基础镜像**
6. **敏感信息使用 Docker Secrets 或环境变量**
7. **定期更新 Docker 版本**

---
