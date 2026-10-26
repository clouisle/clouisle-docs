# 文档同步：v0.2.9 → 2026-10-26

## 背景与目标

- 文档站上次全量同步：2026-10-14（commit `8f82762`），对应产品约 #470。
- 产品仓库当前 HEAD：`98d3e88e`（2026-10-26）。基线 `v0.2.9`（`5daa6830`，2026-06-11）到 HEAD 共 150 个提交。
- 本次目标：让 `clouisle-docs` 与产品代码/产品 `docs/guide` 对齐；补齐新功能、修正过时描述、移除已下线能力；中英文同步。
- 事实来源优先级：产品代码与 `deploy/` > 产品 `docs/guide/`（已随代码更新）> 文档站现有内容。
- 不修改已交付的历史版本条目；新增内容进入 `[未发布]`。

## 写作与文件约定

- 先读 `.claude/skills/config-docs/SKILL.md` 与 `.claude/skills/docs-writing-style/SKILL.md`。
- 中文为默认：`page.mdx`；英文：`page.en.mdx`。两版结构一致，关键默认值/限制写进正文。
- frontmatter 必须有 `title`、`description`、`icon`（lucide 规范名）；正文不写 `# h1`。
- 页面相对链接使用 `.mdx` 相对路径；跨目录链接保持语言感知。
- 不启动 dev/build 服务；不做无关重构；不修改产品仓库。

## 变更清单（按负责人）

### A. 消息集成与新页面

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/usage/guides/integrations/index.mdx` + `.en.mdx` | 新增 | 集成总览：统一 Integration 模型、管理端与个人端边界、Feishu/WeChat 能力矩阵、Delivery Log |
| `content/docs/usage/guides/integrations/feishu.mdx` + `.en.mdx` | 新增 | 飞书：登录、通讯录同步、知识同步、通知、Agent 会话（回调/长连接、权限清单、卡片、附件/产物、个人设置、命令）、身份绑定、排障 |
| `content/docs/usage/guides/integrations/wechat.mdx` + `.en.mdx` | 新增 | 微信 iLink：平台开关、二维码授权、用途（无/知识采集/单 Agent）、采集格式、Agent 输入输出、命令、轮询与部署要求 |
| `content/docs/usage/guides/integrations/delivery-log.mdx` + `.en.mdx` | 新增 | `/deliveries` 页面、筛选、状态含义、错误字段、权限、API 摘要 |
| `content/docs/usage/guides/integrations/meta.json` + `.en.json` | 新增 | 目录元数据与顺序 |
| `content/docs/usage/guides/meta.json` + `.en.json` | 修改 | 增加 `integrations` 分组 |
| `content/docs/usage/guides/index.mdx` + `.en.mdx` | 修改 | 增加集成卡片 |
| `content/docs/usage/guides/administration/notifications.mdx` + `.en.mdx` | 修改 | 外部通知渠道仅保留 email / webhook / Feishu；删除 DingTalk、WeChat Work、Slack 描述 |
| `content/docs/api/notifications.mdx` + `.en.mdx` | 修改 | `deliveries[].channel` 仅 `email`/`webhook`/`feishu`；说明与集成投递队列的区别 |
| `content/docs/api/admin.mdx` + `.en.mdx` | 修改 | 新增 `GET /api/v1/admin/deliveries` 一节（参数、状态、权限、错误字段） |

### B. 设置、安全、权限与可观测性

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/usage/guides/administration/site-settings.mdx` + `.en.mdx` | 修改 | 集成页新增 WeChat iLink、Feishu Agent chat/知识同步；三张网络白名单独立开关；搜索配置入口；通知渠道修正 |
| `content/docs/reference/site-settings.mdx` + `.en.mdx` | 修改 | 增加 `model_endpoint_allowlist_enabled`、`ssrf_protection_enabled`、`sandbox_network_allowlist_enabled` 的默认值与语义；沙箱 egress 白名单与 SSRF 白名单区分 |
| `content/docs/usage/concepts/security.mdx` + `.en.mdx` | 修改 | 三类开关、关闭后的风险、fail-closed 读取、沙箱出口与 SSRF 分离 |
| `content/docs/usage/concepts/sandbox.mdx` + `.en.mdx` | 修改 | 出口开关只影响新任务；文件系统/资源限制不随开关关闭；精确主机名列表 |
| `content/docs/reference/observability.mdx` + `.en.mdx` | 修改 | 删除“工具/检索 span 未采集”的过时 Callout；补充 span 上限、聚合、六视图、实例发现、日期区间 |
| `content/docs/usage/guides/agent/monitor.mdx` + `.en.mdx` | 修改 | 监控入口仅创建者/团队管理员/超级管理员；统计范围与 7 天窗口（如尚未记录） |
| `content/docs/reference/permissions.mdx` + `.en.mdx` | 修改 | 增加 `admin:integrations:login:*`、`admin:integrations:settings:*`、Delivery Log 权限映射 |
| `content/docs/usage/guides/administration/roles-permissions.mdx` + `.en.mdx` | 修改 | 同步上述权限说明 |
| `content/docs/usage/guides/administration/audit-logs.mdx` + `.en.mdx` | 修改 | 字段级 before/after diff；沙箱任务生命周期审计事件 |

### C. 工具、模型与工作流

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/usage/guides/tools/built-in.mdx` + `.en.mdx` | 修改 | 重写 `web_search`：站点托管、Tavily/Bocha/SearXNG/DeepSeek、默认/启用、无回退、无 DuckDuckGo/Bing、无团队/Agent 凭据；`fetch_webpage` readability 与 scheme 限制；RSS 空字段省略 |
| `content/docs/usage/guides/tools/custom-tools.mdx` + `.en.mdx` | 修改 | 数据库工具（PostgreSQL/MySQL/Redis/MongoDB）、测试连接、超时/扫描上限；工具共享与空状态（如缺失） |
| `content/docs/usage/guides/tools/index.mdx` + `.en.mdx` | 修改 | 能力总览补充数据库工具与站点搜索 |
| `content/docs/usage/guides/agent/create-agent.mdx` + `.en.mdx` | 修改 | Web Search 仅站点启用引擎；附件/产物列表/引用；无知识库时 RAG off |
| `content/docs/reference/agent-config.mdx` + `.en.mdx` | 修改 | 核对附件字段；补充 `hide_artifact_list`（若缺）；删除任何 per-Agent 搜索凭据描述 |
| `content/docs/reference/model-providers.mdx` + `.en.mdx` | 修改 | TypeSafe/decision（若缺）、供应商图标与本地化名称、端点白名单开关 |
| `content/docs/usage/guides/models/providers.mdx` + `.en.mdx` | 修改 | 同上，面向操作 |
| `content/docs/reference/workflow-nodes.mdx` + `.en.mdx` | 修改 | Decision 节点、媒体生成节点、`web_search` 引擎下拉、工具参数类型转换、审批策略 `requireAllApprovals`、暂停描述模板 |
| `content/docs/usage/guides/workflow/nodes.mdx` + `.en.mdx` | 修改 | 同上，操作步骤 |
| `content/docs/usage/guides/workflow/orchestrate.mdx` + `.en.mdx` | 修改 | 审批策略与运行页 trace/deep-link（如缺） |
| `content/docs/api/tools.mdx` + `.en.mdx` | 修改 | `GET/PUT /api/v1/admin/tools/web-search/config`、`POST /web-search/test`、`GET /api/v1/tools/web-search/engines`、`POST /api/v1/tools/database/test-connection`；工具测试 `search_engine`；通用配置拒绝 `web_search` |
| `content/docs/api/models.mdx` + `.en.mdx` | 修改 | `decision` 模型类型与 TypeSafe 供应商；端点白名单错误 |
| `content/docs/api/agents.mdx` + `.en.mdx` | 修改 | 附件字段、`hide_artifact_list`、无 per-Agent 搜索凭据 |

### D. 知识库、记忆、聊天与资产

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/usage/concepts/agent.mdx` + `.en.mdx` | 修改 | durable run、`ask_user`、引用、附件/资产、执行轨迹、分支、移动端预览 |
| `content/docs/usage/guides/agent/conversation.mdx` + `.en.mdx` | 修改 | 引用与思考过程、执行轨迹折叠、排队引导胶囊、产物列表/隐藏开关、流恢复 |
| `content/docs/usage/guides/agent/media.mdx` + `.en.mdx` | 修改 | 生成图片/视频持久化为 scoped Asset、会话/工作流媒体引用、认证下载 |
| `content/docs/usage/guides/agent/memory.mdx` + `.en.mdx` | 修改 | `get_memory_subgraph`、时间窗/衰减、后台提取（若缺） |
| `content/docs/usage/guides/knowledge/create-knowledge-base.mdx` + `.en.mdx` | 修改 | 跨团队共享（核对）、批量处理通知横幅、共享只读 |
| `content/docs/usage/guides/knowledge/import-documents.mdx` + `.en.mdx` | 修改 | 批量完成通知、Markdown AST 分块、微信采集入口/原始文件生命周期 |
| `content/docs/usage/guides/knowledge/chunking.mdx` + `.en.mdx` | 修改 | 表头重复、章节层级、表格延续、分隔符转义解码 |
| `content/docs/usage/guides/knowledge/retrieval.mdx` + `.en.mdx` | 修改 | 混合检索/重排/有界上下文/灰度观测（核对） |
| `content/docs/reference/knowledge-settings.mdx` + `.en.mdx` | 修改 | 分块与检索默认值、共享规则 |
| `content/docs/api/knowledge.mdx` + `.en.mdx` | 修改 | `/share`、`/shares`、共享访问（若缺） |
| `content/docs/api/chat.mdx` + `.en.mdx` | 修改 | 引用契约、资产/媒体引用、排队 follow-up、`ask_user` 答题端点 |
| `content/docs/api/file-uploads.mdx` + `.en.mdx` | 修改 | 资产作用域授权、认证下载、预览状态 |

### E. 自托管与运维

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/self-host/configuration/environment-variables.mdx` + `.en.mdx` | 修改 | 新增/移除变量：WeChat 轮询参数、沙箱/网关、移除独立 receiver 相关项 |
| `content/docs/self-host/operations/upgrade.mdx` + `.en.mdx` | 修改 | 破坏性升级：`integration_deliveries` 取代旧投递表；API 与 worker 同步；API 先建表；Beat 重启一次；receipt 列；移除 wechat-receiver |
| `content/docs/self-host/architecture.mdx` + `.en.mdx` | 修改 | 统一投递队列、集成调度、微信轮询、飞书长连接归属、沙箱会话亲和/检查点、上传网关 |
| `content/docs/self-host/operations/storage.mdx` + `.en.mdx` | 修改 | 对象存储、worker 无 uploads 挂载、Named volume/hostPath |
| `content/docs/self-host/operations/monitoring.mdx` + `.en.mdx` | 修改 | 六视图可观测性、Delivery Log、告警 |
| `content/docs/self-host/operations/security-checklist.mdx` + `.en.mdx` | 修改 | 三类网络开关、沙箱出口、禁止通配符 |
| `content/docs/self-host/deploy/docker-compose.mdx` + `.en.mdx` | 修改 | 无独立 receiver、ffmpeg、沙箱卷 |
| `content/docs/self-host/deploy/kubernetes.mdx` + `.en.mdx` | 修改 | sandbox 节点本地存储、无 receiver、ffmpeg |
| `content/docs/self-host/operations/high-availability.mdx` + `.en.mdx` | 修改 | worker/Beat/集成调度与沙箱 worker |
| `content/docs/self-host/operations/troubleshooting.mdx` + `.en.mdx` | 修改 | 集成投递、长连接、轮询、沙箱检查点排障 |
| `content/docs/self-host/faq.mdx` + `.en.mdx` | 修改 | 清理过时渠道/服务描述 |

### F. 更新日志

| 文件 | 动作 | 内容 |
| --- | --- | --- |
| `content/docs/usage/changelog.mdx` + `.en.mdx` | 修改 | 在 `[未发布]` 下补齐 v0.2.9→HEAD 的全部功能：消息集成、Agent 运行时、模型、知识库/检索、记忆、工具、工作流、沙箱/安全、权限、可观测性、资产/预览、部署/存储、UI/i18n；删除重复条目 |

## 关键事实（写作时以此为准）

### 统一集成

- 单一 `Integration` 模型：SSO provider 与内置服务合并；保留 UUID、身份连接与回调 URL。
- 权限分域：`admin:integrations:login:read/update`、`admin:integrations:settings:read/update`。
- 全局 SSO 策略在 **设置 → 安全**；实例卡片在 `/site-settings/integrations`，Feishu 子页 `/site-settings/integrations/feishu`，WeChat 子页 `/site-settings/integrations/wechat`。
- 能力（`enabled_capabilities`）：登录、通讯录同步、通知、知识同步、Agent 会话；关闭能力保留持久状态。

### 飞书

- Agent 回调：`POST /api/v1/integrations/feishu/callback`（签名、300s 时间窗、64 KiB）。
- 长连接：`connection_mode=long_connection`，由 `agent` 队列 worker 内单例接收器维护（Redis 租约），无需额外服务；HTTP 回调仍支持。
- 管理 API：`/api/v1/admin/integrations/feishu/agent-chat/config`、`/config`、`/departments`、`/department-scope`、`/sync`；知识同步 `/api/v1/admin/integrations/feishu/knowledge/*`。
- 个人 API：`GET/PUT /api/v1/feishu-agent/config`、`GET /api/v1/feishu-agent/agents`。
- 权限 scope：`im:message.p2p_msg:readonly`、`im:message:send_as_bot`、`im:resource`、`contact:user.base:readonly`、`im:message.receive_v1` 事件。
- 产物限制：图片 ≤10 MiB；MP4 ≤30 MiB；其他文件 ≤30 MiB。
- 命令：`/use`、`/new`、`/stop`、`/status`、`/help` 等；个人开关暂停新消息/排队/未发送回复，不删历史。

### 微信 iLink

- 平台开关：Agent chat、知识采集；个人二维码授权独立。
- 用途：无 / 知识采集 / 单个已发布 Agent，同时只激活一个。
- 个人 API：`/api/v1/wechat-knowledge/*`（features、bindings、logins、purpose、receipts、original）。
- 轮询：`WECHAT_POLL_BATCH_SIZE=64`、`WECHAT_POLL_CONCURRENCY=16`、`WECHAT_POLL_MAX_BATCHES=8`；批次 30s 截止、90s 可恢复 claim；普通 worker 消费；无独立 receiver。
- 命令：`/new`(`/新对话`)、`/stop`(`/停止`)、`/status`(`/状态`)、`/help`(`/帮助`)、`/agents`(`/智能体`)、`/use <n>`(`/使用 <编号>`)；`/skip` 失败不得被当作回答。
- 部署：API 先启动完成 schema，再 worker/Beat；需要 ffmpeg；Agent 工具依赖 Sandbox Worker。

### Delivery Log

- 页面 `/deliveries`，权限 `admin:integrations:settings:read`。
- `GET /api/v1/admin/deliveries`：`provider_type`（feishu/wechat，可重复）、`status`（pending/sending/sent/error/unavailable/unknown，可重复）、`run_id`、`filename`、`limit` 1–100（默认 25）、`offset`。
- 返回 `items[]`：`id`、`provider_type`、`run_id`、`user_id`、`agent_id`、`chat_id`、`message_id`、`event_key`、`sequence`、`kind`、`filename`、`content_type`、`size`、`media_type`、`status`、`error`、`error_detail`、`has_media_key`、时间戳。
- 单表 `integration_deliveries` 取代 `feishu_agent_deliveries` / `wechat_agent_deliveries`；启动复制并删除旧表，API 与 worker 必须同版本。

### 站点搜索

- 管理端点：`GET/PUT /api/v1/admin/tools/web-search/config`、`POST /api/v1/admin/tools/web-search/test`（权限 `admin:capability:read/update/execute`）。
- 可用引擎：`GET /api/v1/tools/web-search/engines`（只返回已启用项）。
- 引擎：`tavily`、`bocha`、`searxng`、`deepseek`；`default_engine`；各 `*_enabled`。
- 密钥：`tavily_api_key`、`bocha_api_key`、`deepseek_api_key`、`searxng_auth_token`（只写）；`searxng_base_url`（可含反向代理子路径，可选 Bearer 必须 HTTPS）。
- 无 keyless 引擎；无自动跨供应商回退；执行时重新检查站点配置。
- 工具测试页 `search_engine` 可选 `auto` 或已启用引擎。

### 网络白名单开关

- `model_endpoint_allowlist_enabled` 默认 `true`。
- `ssrf_protection_enabled` 默认 `true`。
- `sandbox_network_allowlist_enabled` 默认 `true`。
- 关闭后保留已存列表，可随时恢复；沙箱开关只影响**新任务**，文件系统与资源限制仍生效；SSRF 关闭仍保留 URL/端口语法校验；损坏的布尔值按 fail-closed 处理。
- 沙箱出口白名单仅接受精确 DNS 主机名；默认 `pypi.org`、`files.pythonhosted.org`、`pypi.python.org`、`registry.npmjs.org`；通配符/IP 拒绝；上限 200 条。

### 通知渠道

- 外部渠道仅 `email`、`webhook`、`feishu`；`notification_deliveries` 记录通知渠道结果，`integration_deliveries` 记录消息集成的聊天/产物投递，两者不同。

### 可观测性

- 六个视图：运行结果、按需 trace、模型/工具/检索依赖、队列、基础设施、告警。
- AgentRun 工具/检索 span 已采集，最多 128 个/run，截断可见，历史不回填。
- 单 leader 每分钟终态摘要对账（每批 100，结束 60s 后，30 天保留）。
- Redis API 实例发现：10s 上报、30s stale、60s offline。
- 日历范围选择器（双月、本地日、UTC 过滤）。

### 资产与预览

- 生成图片/视频持久化为 scoped Asset；按 conversation/workflow/sandbox 作用域授权；认证下载；不暴露公共 URL。
- 统一产物列表（计数、展开、共享预览）；DOCX 缩略图/页码/缩放；PDF 只读；XLSX 只读；CSV GBK/GB18030。
- 预览状态：too-large、unauthorized、permission-denied、unsupported、parse-failure 均显式呈现。

## 移除/纠正清单

- DuckDuckGo、Bing 免 Key 搜索；任何“自动回退到 DuckDuckGo/Bing”的描述。
- `TAVILY_API_KEY` / `BOCHA_API_KEY` 作为运行时团队/Agent 凭据的描述（仅首次迁移导入）。
- 每个 Agent/团队配置搜索密钥或端点覆盖的能力。
- 独立 `wechat-receiver` 服务/命令/部署。
- worker 的 uploads 挂载（改为认证 API 网关）。
- 通知渠道 DingTalk、WeChat Work、Slack（保留 WeChat iLink 作为消息集成，不是通知渠道）。
- “工具/检索 span 尚未采集”的过时说明。
- 旧投递表名称 `feishu_agent_deliveries`、`wechat_agent_deliveries`（仅升级说明可出现）。

## 受众分层规则（第二轮修订）

四个模块严格按读者分层；同一主题可以重复出现，但深度与表达不同：

| 模块 | 读者 | 只写 | 不写 |
| --- | --- | --- | --- |
| `usage` | 普通用户与执行界面操作的管理员 | 界面路径、字段/按钮名称、可见行为、取值/限制、角色与权限的人话描述、失败后用户该做什么、必要的外部配置值（如回调地址、外部平台权限） | API 路由与请求/响应、数据库表/列、环境变量、服务/队列/Worker/Redis/Celery、代码标识符、内部配置键（`*_enabled` 等）、算法细节（RRF 权重等）、内部存储键 |
| `reference` | 需要精确字段的人 | 配置键、默认值、枚举、限制、状态语义、内部选项 | 面向任务的完整操作流程 |
| `api` | 开发者 | HTTP 端点、鉴权、请求/响应、错误码、幂等/重试 | 界面操作教程 |
| `self-host` | 部署/运维 | 服务拓扑、队列、环境变量、数据库迁移、升级/回滚、容量 | 产品使用教程 |

补充要求：

- `usage` 中需要技术细节时，用一句话说明行为，并链接到对应模块，不复制实现。
- 保留用户可感知的事实（如“关闭后新任务立即生效”“发送超时不会自动重发”），去掉其实现原因（租约、表名、队列名）。
- 外部平台自身的配置值（飞书回调 URL、权限名称、事件订阅）属于管理员操作前提，可以保留；平台自身的内部端点/表/服务名不可以。
- 产品功能名称允许出现：PostgreSQL/MySQL/Redis/MongoDB 作为“数据库工具类型”，Qdrant 等内部组件不作为使用说明出现。

## 页面结构约定（第三轮修订）

- 目录层级已由侧边栏表达，正文**不再**写「子页面 / Subpages」标题加 `<Cards>` 网格；这类卡片只用于站点首页或顶层栏目索引（`usage/index`、`api/index`、`reference/index`、`self-host/index`）。
- 分组索引页（如 `usage/guides/integrations/index`）只保留：定位段、能力/边界说明、跨模块链接。需要指向子页时在正文句子里直接链接。
- 同一信息不在同一页出现两次：能靠句子带出的导航，不再单独建一节。

## 第二轮执行结果（受众分层）

| 范围 | 结果 |
| --- | --- |
| `usage/guides/integrations/*` | 去掉 API 表、表名、内部键、Worker/队列/Redis；保留界面步骤、能力开关、命令、权限清单、外部平台配置值 |
| `usage/guides/administration/*` | 去掉端点、curl、权限码、内部字段；SSO 仅保留需填入第三方后台的回调地址 |
| `usage/guides/{tools,models,workflow,knowledge,agent}/*` | 去掉配置键、内部参数、实现函数名；保留可选项、默认值、限制与用户可见结果 |
| `usage/concepts/*` | 架构页改为用户视角的阶段叙述；检索/工作流概念去掉实现常数与端点 |
| `usage/changelog` | `[未发布]` 全部改为产品语言；历史版本仅清理误留在使用模块的技术描述 |
| 新增 `api/integrations` | 承接飞书/微信的管理端、个人端、回调、知识同步与回执端点；SSO API 中的飞书行改为链接 |
| 落点链接 | usage 中的技术细节统一指向已有 `reference/`、`api/`、`self-host/` 页面 |

验证：`npm run build` 789 页通过；`npm run types:check` 通过；相对链接 0 失效；中英标题结构 0 差异；`usage` 内仅剩必须保留的外部回调地址与用户请求路径。

## 验证

- 每个负责人自检：frontmatter、标题层级、相对链接、关键默认值在正文。
- 主代理统一执行：
  - 相对链接解析脚本（仅机械检查）。
  - `npm run types:check`。
  - 关键词扫描：`DuckDuckGo`、`Bing`、`dingtalk`、`slack`、`wechat-receiver`、`uploads` 挂载、旧投递表。
  - `npm run build`（如耗时可控）验证 MDX 编译与路由。
- 不启动 dev server。
