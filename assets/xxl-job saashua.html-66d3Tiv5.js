import{_ as s,c as a,a as l,o as i}from"./app-BQKXFdnG.js";const e="/assets/image-9-B3LdZziC.png",t="/assets/image-10-K_UpY7Pc.png",c="/assets/image-11-QNxiX5Ew.png",r="/assets/image-12-1JYt0ZvW.png",p={};function d(v,n){return i(),a("div",null,n[0]||(n[0]=[l('<h3 id="xxl-job-saas-化方案" tabindex="-1"><a class="header-anchor" href="#xxl-job-saas-化方案"><span>XXL-JOB SaaS 化方案</span></a></h3><p><img src="'+e+'" alt="XXL-JOB SaaS 化方案"></p><h3 id="单机模式" tabindex="-1"><a class="header-anchor" href="#单机模式"><span>单机模式</span></a></h3><ul><li><p><strong>部分 SaaS 化</strong></p><ul><li><strong>独立性维护</strong>：XXL-JOB 作为一个独立运行的平台，保留其原始数据库结构与登录机制。</li><li><strong>任务触发机制</strong>： <ul><li>在任务执行时传递租户 ID。考虑到项目使用 JDK 17 而原 sed 使用的版本是 JDK 8，存在序列化问题。因此，将 sed 组件所依赖的 job 版本升级至与项目匹配的 JDK 17，以解决兼容性问题，并已验证实现。</li><li>对于需要被多个租户执行的相同任务，支持通过配置使同一个任务能够为不同租户多次创建，或配置一个任务同时服务于多个租户，遍历租户信息循环执行。管理员有权创建需所有租户执行的任务。</li></ul></li></ul></li><li><p><strong>全面 SaaS 化</strong></p><ul><li><strong>前后端分离</strong>：所有请求均需通过 SaaS 平台提供的 token 进行身份验证。</li><li><strong>用户管理整合</strong>：移除原有的用户表，将其集成至 SaaS 平台的统一用户管理系统中（包括用户、token、角色和菜单系统），使 XXL-JOB 无缝融入平台。</li><li><strong>数据隔离</strong>：为每个租户创建独立的数据表，确保在逻辑层面上的数据隔离，保证各租户只能访问自己的任务信息。</li><li><strong>任务新建与触发机制</strong>： <ul><li>租户仅能创建属于自己的任务；管理员则可创建适用于所有租户的任务。</li><li>修改 JobScheduleHelper 加载任务信息的方式，使其从多数据源获取，并调整调度中心的分布式锁实现方式，以适应多租户环境。同时，在任务执行时根据数据源传递租户 ID。评估快慢线程池、调度线程、时间轮线程等是否需要支持多租户。</li></ul></li></ul></li></ul><h3 id="集群模式" tabindex="-1"><a class="header-anchor" href="#集群模式"><span>集群模式</span></a></h3><ul><li><strong>独立部署</strong><ul><li>每个租户拥有独立的调度中心和数据源。鉴于 XXL-JOB 本身支持多调度中心，可根据数据源名称触发任务并传递租户 ID。</li><li>需解决的问题是如何限制租户只能看到自己的调度中心。</li><li>注释掉注册循环中的 break 语句，以便原先针对单一数据源的调度中心能适应新的需求。</li></ul></li></ul><h3 id="采用方案" tabindex="-1"><a class="header-anchor" href="#采用方案"><span>采用方案</span></a></h3><p>最后采用最简单的单价、任务传参方式：</p><ul><li><strong>建立任务时传参</strong><img src="'+t+'" alt="alt text"></li><li><strong>新建 aop</strong> 在任务调用前后对租户进行处理 <img src="'+c+'" alt="alt text"><img src="'+r+`" alt="alt text"></li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text" data-title="text"><pre><code><span class="line">package com.xxl.job.core.context;</span>
<span class="line"></span>
<span class="line">import com.alibaba.fastjson2.JSONArray;</span>
<span class="line">import com.alibaba.fastjson2.JSONObject;</span>
<span class="line">import com.xxl.job.core.handler.annotation.XxlJob;</span>
<span class="line">import lombok.extern.slf4j.Slf4j;</span>
<span class="line">import org.apache.commons.lang3.StringUtils;</span>
<span class="line">import org.aspectj.lang.ProceedingJoinPoint;</span>
<span class="line">import org.aspectj.lang.annotation.Around;</span>
<span class="line">import org.aspectj.lang.annotation.Aspect;</span>
<span class="line">import org.springframework.stereotype.Component;</span>
<span class="line"></span>
<span class="line">import java.util.ArrayList;</span>
<span class="line">import java.util.List;</span>
<span class="line">import java.util.concurrent.atomic.AtomicReference;</span>
<span class="line"></span>
<span class="line">/**</span>
<span class="line"> * @author hc</span>
<span class="line"> */</span>
<span class="line">@Aspect</span>
<span class="line">@Component</span>
<span class="line">@Slf4j</span>
<span class="line">public class TenantAspect {</span>
<span class="line"></span>
<span class="line">    @Around(&quot;@annotation(xxlJob)&quot;)</span>
<span class="line">    public Object before(ProceedingJoinPoint joinPoint, XxlJob xxlJob) throws Throwable {</span>
<span class="line">        // 在这里获取job参数并设置租户上下文</span>
<span class="line">        String jobParam = XxlJobHelper.getJobParam();</span>
<span class="line">        Object[] args = joinPoint.getArgs();</span>
<span class="line">        log.debug(&quot;Initializing tenant context for job: {}, params: {}&quot;, xxlJob.value(), jobParam);</span>
<span class="line">        if (StringUtils.isNotBlank(jobParam)) {</span>
<span class="line">            JSONObject jsonObject = JSONObject.parseObject(jobParam);</span>
<span class="line">            if (null != jsonObject &amp;&amp; jsonObject.containsKey(Constants.DEFAULT_TENANT_ID_HEADER_NAME)) {</span>
<span class="line">                // 解析租户ID列表</span>
<span class="line">                List&lt;String&gt; tenantIds = parseTenantIds(jsonObject);</span>
<span class="line">                // 处理参数逻辑：当仅包含租户参数时清空参数</span>
<span class="line">                if (jsonObject.size() == 1 &amp;&amp; args.length &gt; 0) {</span>
<span class="line">                    args[0] = null;</span>
<span class="line">                }</span>
<span class="line">                if (!tenantIds.isEmpty()) {</span>
<span class="line">                    AtomicReference&lt;Object&gt; result = new AtomicReference&lt;&gt;();</span>
<span class="line">                    tenantIds.parallelStream().forEach(tenantId -&gt; {</span>
<span class="line">                        try {</span>
<span class="line">                            // 设置当前租户上下文</span>
<span class="line">                            TenantContext.setCurrentTenant(new TenantProfile(tenantId));</span>
<span class="line">                            log.debug(&quot;Set tenant context: {}&quot;, tenantId);</span>
<span class="line">                            // 执行任务方法</span>
<span class="line">                            result.set(joinPoint.proceed(args));</span>
<span class="line">                        } catch (Throwable e) {</span>
<span class="line">                            throw new RuntimeException(e);</span>
<span class="line">                        } finally {</span>
<span class="line">                            // 清理租户上下文</span>
<span class="line">                            TenantContext.setCurrentTenant(null);</span>
<span class="line">                            log.debug(&quot;Cleared tenant context: {}&quot;, tenantId);</span>
<span class="line">                        }</span>
<span class="line">                    });</span>
<span class="line">                    //TODO 待确定多个租户不同的返回结果怎么解决</span>
<span class="line">                    return result;</span>
<span class="line">                }</span>
<span class="line">            }</span>
<span class="line">        }</span>
<span class="line">        try {</span>
<span class="line">            return joinPoint.proceed(args);</span>
<span class="line">        } finally {</span>
<span class="line">            // 清理租户上下文</span>
<span class="line">            log.debug(&quot;Clear tenant context: {}&quot;, TenantContext.getCurrentTenant().getTenantId());</span>
<span class="line">            TenantContext.setCurrentTenant(null);</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">    /**</span>
<span class="line">     * 解析租户ID列表，支持JSON数组或逗号分隔字符串</span>
<span class="line">     */</span>
<span class="line">    private List&lt;String&gt; parseTenantIds(JSONObject jsonObject) {</span>
<span class="line">        List&lt;String&gt; tenantIds = new ArrayList&lt;&gt;();</span>
<span class="line">        Object tenantIdValue = jsonObject.get(Constants.DEFAULT_TENANT_ID_HEADER_NAME);</span>
<span class="line">        if (tenantIdValue instanceof String) {</span>
<span class="line">            // 处理逗号分隔字符串</span>
<span class="line">            String[] parts = ((String) tenantIdValue).split(&quot;,&quot;);</span>
<span class="line">            for (String part : parts) {</span>
<span class="line">                if (StringUtils.isNotBlank(part)) {</span>
<span class="line">                    tenantIds.add(part.trim());</span>
<span class="line">                }</span>
<span class="line">            }</span>
<span class="line">        } else if (tenantIdValue instanceof JSONArray array) {</span>
<span class="line">            // 处理JSON数组格式</span>
<span class="line">            for (int i = 0; i &lt; array.size(); i++) {</span>
<span class="line">                tenantIds.add(array.getString(i));</span>
<span class="line">            }</span>
<span class="line">        } else if (tenantIdValue != null) {</span>
<span class="line">            // 处理其他类型（如单个值）</span>
<span class="line">            tenantIds.add(tenantIdValue.toString().trim());</span>
<span class="line">        }</span>
<span class="line">        return tenantIds;</span>
<span class="line">    }</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10)]))}const u=s(p,[["render",d],["__file","xxl-job saashua.html.vue"]]),m=JSON.parse('{"path":"/blogs/gongzuo/2025/xxl-job saashua.html","title":"XXL-JOB SaaS 化方案","lang":"en-US","frontmatter":{"title":"XXL-JOB SaaS 化方案","date":"2025/03/03","tags":["xxl-job","saas"],"categories":["工作"]},"headers":[{"level":3,"title":"XXL-JOB SaaS 化方案","slug":"xxl-job-saas-化方案","link":"#xxl-job-saas-化方案","children":[]},{"level":3,"title":"单机模式","slug":"单机模式","link":"#单机模式","children":[]},{"level":3,"title":"集群模式","slug":"集群模式","link":"#集群模式","children":[]},{"level":3,"title":"采用方案","slug":"采用方案","link":"#采用方案","children":[]}],"git":{"createdTime":1740995408000,"updatedTime":1741323725000,"contributors":[{"name":"huangcheng","email":"2387020215@qq.com","commits":4}]},"filePathRelative":"blogs/工作/2025/xxl-job saas化.md"}');export{u as comp,m as data};
