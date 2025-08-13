---
title: 完整elk脚本
date: 2025/08/31
tags:
  - elk
categories:
  - elk
---

太好了！您希望使用 **Docker** 来启动 **Logstash**，并将应用的控制台日志（如 Spring Boot、Node.js 等）通过 Logstash 收集并写入 Elasticsearch。

下面我为您提供一个 **完整、可运行的 Docker + Logstash + Elasticsearch + Kibana** 集成方案，适用于生产或开发环境。

---

## ✅ 目标

将应用的 **控制台日志** → **Logstash（Docker）** → **Elasticsearch（Docker）** → **Kibana 可视化**

---

## ✅ 整体架构

```
[Your App]
     ↓ (stdout)
[Docker Container Log]
     ↓
[Filebeat 或直接 TCP/HTTP]
     ↓
[Logstash (Docker)] → 解析、过滤
     ↓
[Elasticsearch (Docker)] → 存储
     ↓
[Kibana (Docker)] → 可视化
```

---

## ✅ 步骤 1：准备 `docker-compose.yml`

创建一个 `docker-compose.yml` 文件，统一管理所有服务：

```yaml
version: "3.8"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.18
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    networks:
      - elk

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.18
    container_name: kibana
    depends_on:
      - elasticsearch
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - xpack.security.enabled=false
    ports:
      - "5601:5601"
    networks:
      - elk

  logstash:
    image: docker.elastic.co/logstash/logstash:7.17.18
    container_name: logstash
    depends_on:
      - elasticsearch
    ports:
      - "5000:5000/tcp" # 接收 JSON 日志（如 Logback TCP）
      - "5044:5044" # 接收 Filebeat（推荐）
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    environment:
      - xpack.monitoring.enabled=false
    networks:
      - elk

volumes:
  esdata:

networks:
  elk:
    driver: bridge
```

---

## ✅ 步骤 2：创建 `logstash.conf`

在 `docker-compose.yml` 同级目录创建 `logstash.conf`：

```conf
# 输入：接收来自应用或 Filebeat 的日志
input {
  # 方式1：接收 Filebeat 发送的日志（推荐）
  beats {
    port => 5044
  }

  # 方式2：接收 TCP JSON 日志（如 Java 应用直接发）
  # tcp {
  #   port => 5000
  #   codec => json
  # }
}

# 过滤：解析、丰富、修改日志
filter {
  # 如果是 Java 异常堆栈，合并多行
  if [message] =~ "\t" {
    multiline {
      pattern => "^\t"
      what => "previous"
    }
  }

  # 示例：添加自定义字段
  mutate {
    add_field => { "app_name" => "my-java-app" }
    add_field => { "env" => "production" }
  }

  # 可选：使用 Grok 解析非结构化日志
  # grok {
  #   match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{JAVACLASS:class} - %{GREEDYDATA:log_message}" }
  # }
}

# 输出：写入 Elasticsearch
output {
  elasticsearch {
    hosts => "http://elasticsearch:9200"
    index => "app-logs-%{+YYYY.MM.dd}"
    # 可选：查看发送内容（调试用）
    # stdout { codec => rubydebug }
  }
}
```

---

## ✅ 步骤 3：启动 ELK 栈

```bash
docker-compose up -d
```

等待服务启动：

```bash
docker-compose logs -f
```

看到 `Kibana is now available` 表示启动成功。

---

## ✅ 步骤 4：发送日志到 Logstash

### ✅ 方式 A：使用 Filebeat（推荐）

#### 1. 安装 Filebeat（在宿主机或另一个容器）

```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.17.18-linux-x86_64.tar.gz
tar -xzf filebeat-7.17.18-linux-x86_64.tar.gz
cd filebeat-7.17.18-linux-x86_64
```

#### 2. 配置 `filebeat.yml`

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/your/app.log # 你的日志文件路径

output.logstash:
  hosts: ["localhost:5044"]
```

#### 3. 启动 Filebeat

```bash
sudo ./filebeat -e
```

> ✅ 日志会通过 5044 端口发送到 Logstash。

---

### ✅ 方式 B：Java 应用直接发 TCP（结构化 JSON）

#### 1. 添加依赖（Spring Boot）

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

#### 2. 配置 `logback-spring.xml`

```xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>localhost:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>

<root level="INFO">
    <appender-ref ref="LOGSTASH"/>
</root>
```

> ✅ 应用启动后，日志会以 JSON 格式发送到 `localhost:5000`，被 Logstash 接收。

---

## ✅ 步骤 5：在 Kibana 查看日志

1. 打开：`http://localhost:5601`
2. 进入 **Stack Management > Index Patterns**
3. 创建索引模式：`app-logs-*`
4. 进入 **Discover**，选择该索引模式
5. ✅ 您将看到结构化的日志数据！

---

## ✅ 验证 Logstash 是否收到日志

查看 Logstash 日志：

```bash
docker logs -f logstash
```

如果看到类似：

```
Pipeline started successfully
Received incoming event from beats
```

说明日志已成功接收。

---

## ✅ 常见问题排查

| 问题                   | 解决方案                                                |
| ---------------------- | ------------------------------------------------------- |
| Logstash 启动失败      | 检查 `logstash.conf` 语法是否正确                       |
| 无法连接 Elasticsearch | 确保 `hosts => "http://elasticsearch:9200"`，使用容器名 |
| Filebeat 发送失败      | 检查 `output.logstash.hosts` 是否为 `localhost:5044`    |
| 日志未显示             | 检查索引是否存在：`GET _cat/indices?v`                  |

---

```
Unable to load plugin. {:type=>"filter", :name=>"multiline"}
2025-08-13 17:55:16 [2025-08-13T09:55:16,168][ERROR][logstash.agent           ] Failed to execute action {:action=>LogStash::PipelineAction::Create/pipeline_id:main, :exception=>"Java::JavaLang::IllegalStateException", :message=>"Unable to configure plugins: (PluginLoadingError) Couldn't find any filter plugin named 'multiline'. Are you sure this is correct? Trying to load the multiline filter plugin resulted in this error: Unable to load the requested plugin named multiline of type filter. The plugin is not installed.", :backtrace=>["org.logstash.config.ir.CompiledPipeline.<init>(CompiledPipeline.java:120)", "org.logstash.execution.JavaBasePipelineExt.initialize(JavaBasePipelineExt.java:86)", "org.logstash.execution.JavaBasePipelineExt$INVOKER$i$1$0$initialize.call(JavaBasePipelineExt$INVOKER$i$1$0$initialize.gen)", "org.jruby.internal.runtime.methods.JavaMethod$JavaMethodN.call(JavaMethod.java:837)", "org.jruby.ir.runtime.IRRuntimeHelpers.instanceSuper(IRRuntimeHelpers.java:1169)", "org.jruby.ir.runtime.IRRuntimeHelpers.instanceSuperSplatArgs(IRRuntimeHelpers.java:1156)", "org.jruby.ir.targets.InstanceSuperInvokeSite.invoke(InstanceSuperInvokeSite.java:39)", "usr.share.logstash.logstash_minus_core.lib.logstash.java_pipeline.RUBY$method$initialize$0(/usr/share/logstash/logstash-core/lib/logstash/java_pipeline.rb:48)", "org.jruby.internal.runtime.methods.CompiledIRMethod.call(CompiledIRMethod.java:80)", "org.jruby.internal.runtime.methods.MixedModeIRMethod.call(MixedModeIRMethod.java:70)", "org.jruby.runtime.callsite.CachingCallSite.cacheAndCall(CachingCallSite.java:333)", "org.jruby.runtime.callsite.CachingCallSite.call(CachingCallSite.java:87)", "org.jruby.RubyClass.newInstance(RubyClass.java:939)", "org.jruby.RubyClass$INVOKER$i$newInstance.call(RubyClass$INVOKER$i$newInstance.gen)", "org.jruby.ir.targets.InvokeSite.invoke(InvokeSite.java:207)", "usr.share.logstash.logstash_minus_core.lib.logstash.pipeline_action.create.RUBY$method$execute$0(/usr/share/logstash/logstash-core/lib/logstash/pipeline_action/create.rb:52)", "usr.share.logstash.logstash_minus_core.lib.logstash.pipeline_action.create.RUBY$method$execute$0$__VARARGS__(/usr/share/logstash/logstash-core/lib/logstash/pipeline_action/create.rb:50)", "org.jruby.internal.runtime.methods.CompiledIRMethod.call(CompiledIRMethod.java:80)", "org.jruby.internal.runtime.methods.MixedModeIRMethod.call(MixedModeIRMethod.java:70)", "org.jruby.ir.targets.InvokeSite.invoke(InvokeSite.java:207)", "usr.share.logstash.logstash_minus_core.lib.logstash.agent.RUBY$block$converge_state$2(/usr/share/logstash/logstash-core/lib/logstash/agent.rb:392)", "org.jruby.runtime.CompiledIRBlockBody.callDirect(CompiledIRBlockBody.java:138)", "org.jruby.runtime.IRBlockBody.call(IRBlockBody.java:58)", "org.jruby.runtime.IRBlockBody.call(IRBlockBody.java:52)", "org.jruby.runtime.Block.call(Block.java:139)", "org.jruby.RubyProc.call(RubyProc.java:318)", "org.jruby.internal.runtime.RubyRunnable.run(RubyRunnable.java:105)", "java.base/java.lang.Thread.run(Thread.java:829)"]}
```

从错误信息来看，Logstash 在尝试加载 `multiline` 过滤器插件时遇到了问题。错误提示指出找不到名为 `multiline` 的过滤器插件。实际上，在 Logstash 中用于处理多行日志的插件名称应该是 `multiline` 插件，但它实际上是 `logstash-filter-multiline` 的一部分，且在较新版本中可能需要特别安装或者使用正确的配置。

不过，根据您的情况，似乎您使用的可能是旧版本的 Logstash 或者缺少了必要的插件安装步骤。这里提供一个解决方案来解决这个问题。

### 解决方案

#### 1. 使用正确的插件名称

首先确认是否确实需要 `multiline` 插件来合并多行日志。如果是的话，请确保以下几点：

- 确认您正在使用的是支持 `multiline` 插件的 Logstash 版本。
- 如果是 Docker 部署，确保 Docker 镜像包含了所有必要的插件。

对于您的情况，可能更推荐使用 `aggregate` 或者 `json` 这样的过滤器来处理日志，但针对多行日志（如 Java 异常堆栈），应该使用 `multiline` 插件的正确配置方式如下：

```conf
input {
  # 您的输入配置
}

filter {
  if [type] == "your-log-type" {
    multiline {
      pattern => "^\t" # 根据您的日志格式调整此正则表达式
      what => "previous"
      negate => true
    }
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

但是，基于您的错误信息，看起来 Logstash 并没有找到 `multiline` 描述的插件。这通常是因为该插件未被包含在默认的 Logstash 安装包内。

#### 2. 安装缺失的插件

如果确定是缺少插件的问题，您可以尝试手动安装 `logstash-filter-multiline` 插件。然而，在 Docker 环境下直接操作 Logstash 容器内的插件不是最佳实践。相反，可以创建一个自定义的 Dockerfile 来预安装所需的插件。

例如，创建一个新的 Dockerfile：

```dockerfile
FROM docker.elastic.co/logstash/logstash:7.17.18
RUN logstash-plugin install logstash-filter-multiline
```

然后构建并使用这个自定义镜像：

```bash
docker build -t my-logstash .
```

更新 `docker-compose.yml` 文件以使用新的镜像：

```yaml
services:
  logstash:
    image: my-logstash
    # 其余配置...
```

#### 3. 替代方案

如果您只是需要处理多行日志，另一个方法是使用 Filebeat 的多行日志收集功能，这样就不需要在 Logstash 中处理多行日志了。Filebeat 支持非常灵活的多行日志合并策略。

例如，在 Filebeat 的配置文件中添加以下部分：

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /path/to/your/logs/*.log
    multiline.pattern: '^\t' # 根据您的日志格式调整
    multiline.negate: false
    multiline.match: after
```

这种方法减少了 Logstash 的负担，并简化了整个 ELK 堆栈的日志处理流程。

---
