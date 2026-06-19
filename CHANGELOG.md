# 更新日志 Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/)。

## [0.15.0] - 2026-06-20 — 首页轮播(Hero)后台可编辑

- 新增 **HeroSlide** 模型 + 后台 `/admin/hero`(列表/新建/编辑/启停/删除/排序),可视化编辑首页大图的标题、副标题、卖点、按钮。
- 首页轮播改为**优先读数据库幻灯片**;无任何启用幻灯片时**回退到内置多语言默认**(故未导入也不变样)。
- `scripts/seed-hero.js`:幂等导入现有 3 张默认幻灯片(仅当表为空)。
- 侧边栏新增「首页轮播」入口。真机验证:首页读 DB 幻灯片正常,后台页 200,tsc 通过。

## [0.14.1] - 2026-06-20 — 修复 http 部署登录掉线(会话 Cookie Secure 跟随站点是否 https)

## [0.14.0] - 2026-06-20 — 品牌更名为 Partavio + 地区货币补全

- **全站品牌 RepairKit Supply → Partavio**:页眉/页脚/后台、邮件(订单确认/发货/退款/找回密码/弃单)、SEO 标题与 JSON-LD、PayPal 品牌名、产品默认品牌、占位域名 `repairkit-supply.com → partavio.com`。
- logo 缩写 `RK → PV`;新订单号前缀 `RK- → PV-`。
- 地区货币补全:Oman/Bahrain/Egypt/Jordan/Iraq/Kyrgyzstan/Tajikistan 配本地货币显示(OMR/BHD/EGP/JOD/IQD/KGS/TJS,显示用近似汇率,仍按 USD 结算)。
- tsc 通过,无品牌残留。

## [0.13.0] - 2026-06-19 — 阿语/俄语深层翻译(核心购物流程)

- 在 v0.10.0 基础上,把**核心店面区块**完整翻译为阿拉伯语 + 俄语:
  `footer / common / homepage / products / product / cart / wholesale / checkout`(首页/产品/购物车/结账/批发全流程)。
- 其余长文/次要区块(legal 条款、guides/problems 正文、engines/about 等)暂用英文兜底,可后续补全(建议母语者校对,尤其阿语)。
- 真机验证:ar/ru 首页、购物车等渲染对应语言;tsc 通过。

## [0.12.0] - 2026-06-19 — 表单验证码(Cloudflare Turnstile)

- 新增 `lib/turnstile.ts` + `components/turnstile-widget.tsx`,接入 **批发申请 / 询价 / 产品评价** 三个公开表单。
- **env 门控**:配 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` 才启用;不配时表单照常工作、不显示验证码、服务端不拦截(本地默认)。
- 服务端在各 action 内校验 token(免费、隐私友好,防垃圾询盘/刷评价)。
- `.env*` 加 Turnstile 变量。真机验证:未配 key 时三表单页均 200、照常提交;tsc 通过。

## [0.11.0] - 2026-06-19 — 弃单挽回邮件(env/cron 门控)

- **结账前可选填邮箱**:购物车加「Email for order updates (optional)」,经 Stripe / PayPal 两条链路存到 PENDING 订单(为挽回提供联系方式)。
- **挽回邮件** `lib/abandoned-cart-email.ts`:对留邮箱、1–72h 未付款的订单发一次提醒(幂等,`abandonedEmailSentAt` 防重);无 SMTP 时静默跳过。
- **定时接口** `/api/cron/abandoned-cart`:`CRON_SECRET` 保护,crontab 每小时调用一次扫描发送;新增 `Order.abandonedEmailSentAt`。
- 部署文档加 cron 配置;`.env*` 加 `CRON_SECRET`。
- 真机验证:无密钥 401、正确密钥返回候选/已发数;未配 SMTP 时只统计不发信(安全)。需你配好 SMTP + cron 才真正发信。

## [0.10.0] - 2026-06-19 — 阿拉伯语 + 俄语(中东/中亚市场)

- 新增 **阿拉伯语(ar)与俄语(ru)** 两种前台语言(语言切换器:EN / 中 / ع / RU)。
- **阿语自动 RTL**:根据语言设置 `<html dir="rtl">`,切换无需刷新。
- i18n 改为「英文兜底 + 翻译覆盖」(deepMerge):已翻译导航/页眉/Cookie 等高频区块,其余暂用英文,后续可逐步补全。
- **修复语言闪烁**:`LanguageProvider` 改为由服务端 cookie 初始化(`initialLocale`),SSR 直接渲染正确语言(中文也受益,不再先英后中)。
- 说明:深层文案翻译可继续补;基于 URL 的多语言 SEO(hreflang)需 URL 路由改造,属后续。

## [0.9.0] - 2026-06-19 — 产品评价(社会证明)

- 新增 **ProductReview** 模型(按产品、评分、标题、正文、待审核标志);种子写入 6 条样例评价。
- **产品详情页**:标题旁星级摘要、底部「Customer Reviews」区(平均分 + 评价列表)、访客提交表单(默认待审核)。
- **Product JSON-LD 增加 `aggregateRating`**(有评价时)→ Google 富结果(带星)。
- **后台 `/admin/reviews` 审核**:待审核置顶,一键通过/下架/删除;侧边栏入口。
- 客户提交的评价默认不公开,后台通过后才前台展示(防刷/质控)。
- 工具:`scripts/dev-db.js` 错误处理加固(端口占用提示)。

## [0.8.1] - 2026-06-19 — Cookie 同意横幅(GDPR)

- 新增底部 **Cookie 同意横幅**(接受/拒绝 + 隐私政策链接,中英双语),首次访问显示,选择后记 cookie 不再弹。
- **Google Analytics 改为同意后才加载**:`analytics.tsx` 客户端化,仅在访客点"接受"后注入 GA;拒绝则完全不加载追踪。购物车/语言/会话等必要 cookie 不受影响。
- 共享 `lib/consent.ts` 管理同意状态 + 变更事件(接受后无需刷新即生效)。

## [0.8.0] - 2026-06-19 — 按地区分档运费(框架)

- **`lib/shipping.ts` 重写为分区计费**:东南亚 / 中东 / 欧洲英国 / 中亚 / 其它 五个区,
  每区按「首重价 + 续重步进加价」计费,并支持「订单满额包邮」与「时效(ETA)」。**费率为占位值,改 `SHIPPING_ZONES` 即可**。
- 国家→分区映射;重量缺失的商品按 `DEFAULT_ITEM_WEIGHT_G` 估算。
- 接入结账两条链路:`lib/payments/order-draft.ts`(PayPal/通用)与 `app/api/checkout/route.ts`(Stripe)按目的国+总重量算运费,满额包邮自动 0 元;免运费优惠券逻辑保留。
- 购物车展示分区运费、**预计送达天数**、以及「满 X 包邮」提示;满额时运费显示 Free。
- 真机验证:SEA 0.3kg=$6.90、EU 1.2kg=$18.90、ME 0.6kg=$14.40、中亚 0.5kg=$8.90、满额包邮=Free、其它区 0.7kg=$17.90,计算正确;tsc 通过、相关路由 200。

## [0.7.0] - 2026-06-19 — 支付层抽象 + PayPal（大陆主体收款准备）

面向"大陆营业执照 + 不开海外公司"的收款方案：主卡通道规划走 Airwallex，备选 PayPal。本版搭好可插拔支付层并接入 PayPal（沙箱就绪），Airwallex 留占位待账号下来接入。Stripe 流程保持不变、不删除。

### 新增
- **中立结算模块 `lib/order-settlement.ts`**：把"标记订单已付"的副作用（状态机 / 优惠券用量 / 扣库存 / 确认邮件 / 客户落库）抽成单一可复用入口 `markOrderPaid()`，所有支付通道共用同一套经测试逻辑；并提供 `recordRefund()`。Stripe 同步改为复用这些函数，行为不变。
- **支付层抽象 `lib/payments/`**：`types`（统一接口）、`index`（探测已配置的通道供结账页显示）、`order-draft`（中立建单：校验购物车/库存/优惠券、按币种计价、创建 PENDING 订单）。
- **PayPal 对接（沙箱就绪，env 门控）**：`lib/payments/paypal.ts`（Orders API v2：建单/捕获/Webhook 验签）+ 路由 `api/payments/paypal`（创建）、`/capture`（回跳捕获并结算）、`/webhook`（兜底，幂等）。
- **Airwallex 占位** `lib/payments/airwallex.ts` + 路由：未配置时报友好提示；配齐 `AIRWALLEX_*` 后结账页"信用卡"按钮自动改走它取代 Stripe。
- **结账页二选一**：购物车按已配置通道渲染"信用卡 / PayPal"按钮（`availablePaymentOptions()` 决定）。
- Order 新增 `paymentRef`（通用网关交易号）。成功页同时识别 Stripe 的 `?session_id` 与 PayPal/Airwallex 的 `?order=`。

### 验证
- `tsc` 通过；用真实 PostgreSQL 跑通 `markOrderPaid` 全链路：扣库存(12→10)、写 SALE 流水、优惠券用量+1、`paidAt/paymentRef` 落库，且**重复结算幂等**（不重复扣库存、不重复计用量）。
- PayPal/Airwallex 实链路需各自账号的沙箱/正式密钥后再连测；当前代码 env 门控，未配置不影响现有 Stripe 流程。

## [0.6.0] - 2026-06-19 — 上线准备：SQLite → PostgreSQL + 阿里云部署

### 数据库迁移（破坏性，本地开发方式有变）
- **provider 切到 PostgreSQL**：从 SQLite 迁移，支持并发、备份、横向扩展 —— 上线前置条件。
- **重写 `prisma/seed.js`**：去掉 `node:sqlite` 直连与手写 DDL，全部改用 Prisma Client（`createMany`/`create`）。
  schema 改由 Prisma 管理（`prisma db push`），seed 只负责写数据。产品/参考数据数组原样保留。
- **重写 `scripts/create-admin.js`**：改用 Prisma `upsert`，不再依赖 `node:sqlite`。
- **后台搜索加 `mode: "insensitive"`**（15 处 `contains`）：PG 的 `contains` 默认区分大小写，
  不加会导致后台按订单号/邮箱/名称等搜索失效。已用真实 Postgres 验证：搜 "KIT" 不敏感命中 13 条、敏感命中 0 条。
- 早期一次性 SQLite 迁移脚本 `scripts/migrate-*.js` 标记为废弃（不被构建/运行引用，仅留作历史）。

### 验证
- 用 `embedded-postgres` 本地起真实 PostgreSQL 18，完整跑通 `db push → seed → create-admin → 冒烟查询`：
  13 产品 / 3 订单 / 5 订单行 / 3 客户 / 3 优惠券 / 1 管理员，订单↔商品/客户/优惠券关系与折扣计算均正确；`tsc` 通过。

### 阿里云部署资产（新增）
- `docs/部署-阿里云.md`：从买 ECS/RDS、海外节点(免备案)、安全组，到 build/PM2/Nginx/HTTPS/Stripe webhook/备份/抗流量的完整清单。
- `deploy/setup-ecs.sh`（Ubuntu 一键装 Node20/Nginx/PM2/Certbot）、`deploy/nginx.conf.example`（反代+静态缓存+`cf-ipcountry` 透传）、`deploy/ecosystem.config.js`（PM2）。
- `docker-compose.dev.yml`：本地开发用 Postgres，与线上同引擎。
- `.env.production.example` 改写为阿里云口径（RDS 内网串、OSS 可选、本机磁盘存图默认）。

### 说明
- **图片上传无需改动即可上线**：`app/api/admin/upload/route.ts` 已支持本机 `public/uploads/` 回退，ECS 持久磁盘可直接用；
  迁 OSS 是「多机/上 CDN」时的后续优化，非上线阻塞项。
- 本地开发不再用 SQLite，改用 `docker-compose.dev.yml` 起 Postgres（详见 README / 部署文档第 10 节）。

## [0.5.0] - 2026-06-16 — 订单管理大升级（三阶段）

### 阶段 1
- **后台一键退款**：Stripe `refunds.create`（全额/部分），结果由 `charge.refunded` Webhook 回填并发退款邮件。
- **取消订单自动恢复库存**：取消时反向加回库存并写 `RETURN` 调整流水（修复"取消不退库存"的隐患）。
- **订单审计时间线**（`OrderEvent`）：状态变更 / 退款 / 库存 / 退货 / 发货 / 争议 / 风控 全程留痕。
- **退货 RMA 流程**：后台按单创建并推进（申请→批准→收货→退款/拒绝）、`/admin/returns` 总览、侧边栏入口；
  客户在 `/account/orders/[id]` 可提交退货申请。

### 阶段 2
- **多包裹发货**（`Shipment`）：一单可加多个承运商+追踪号，自动标记发货并通知。
- **可打印发票 / 形式发票 + 装箱单**（`/invoice`、`/packing-slip`，浏览器打印存 PDF；含公司信息与 VAT 拆分）。
- **手动建单**（`/admin/orders/new`）：线下/电汇(T/T)订单，标记已付款则扣库存。
- **拒付/争议**：Webhook 处理 `charge.dispute.created/closed` → 标记 `disputeStatus` + 审计；详情页红色告警。

### 阶段 3
- **批量操作**：订单列表勾选 + 批量改状态（发货发邮件 / 取消恢复库存）。
- **Stripe Radar 风险展示**：`charge.succeeded` 回填 `riskLevel/riskScore`，详情页显示，elevated/highest 记审计。
- 新模型 `OrderEvent / Shipment / ReturnRequest` + `Order.disputeStatus/riskLevel/riskScore` + `Customer.vatNumber`。

### 说明 / 需外部账号的部分
- **真实承运商面单 API**（自动出单号/打印面单）需对接 DHL/FedEx 等承运商账号 —— 当前提供可打印的装箱/拣货单替代。
- **ERP / 会计对接**需你的目标系统 —— 当前已有订单/客户 CSV 导出可作桥梁。
- **Radar 风控调参**在 Stripe 后台设置；站内只做展示与告警。

## [0.4.8] - 2026-06-16

### 新增 Added
- **多币种定价/收款**（`STRIPE_MULTICURRENCY=1` 开启）：可结算货币（GBP/EUR/AED/SAR/SGD/USD）按访客所在国
  以**当地货币真实收款**——Stripe Checkout 会话直接以当地币种创建（行项/运费/优惠券按区域 FX 换算为当地最小单位），
  订单与确认邮件以当地币种记账；其余货币仍按 USD 收款、当地价仅作估算显示。
  - `lib/region.ts` 加 `chargeable` 标记与 `chargeCurrency` / `localChargeMinor` 助手；
    `RegionProvider` 新增 `chargeEnabled`，可结算币种展示**确切价**（去掉「≈ / billed in USD」）。
  - `app/api/checkout/route.ts` 按所选国家换算并以当地币种建 Stripe 会话。

### 说明 Notes
- **默认关闭**，须确认 Stripe 账户支持目标 presentment 货币后再开。
- FX 为 `lib/region.ts` 中的**静态近似汇率**，会真实影响收款金额 → 建议加小幅缓冲并定期更新（或后续接实时汇率）。

## [0.4.7] - 2026-06-16

### 新增 Added
- **退款通知邮件**：Stripe `charge.refunded` 同步后自动给买家发退款邮件（全额/部分），
  `refundEmailSentAt` 防重复；后台订单详情新增「退款通知」重发入口。
- **结账 VAT 拆分（可选开关）**：`STRIPE_AUTOMATIC_TAX=1` 开启后，标价按**含税**处理，
  Stripe 在结账时自动拆出 VAT（英国 20% 等）并回填 `order.taxCents`；确认邮件与订单明细显示「含 VAT」行。
  默认关闭，须先在 Stripe 后台启用 Stripe Tax 方可打开。

### 说明 Notes
- 本次主要是**补缺口**：Stripe 托管结账、3DS、付款成功才建单/扣库存/发确认邮件、订单状态机
  （待付款→已付款→已发货→已完成 + 退款）、下单确认/发货邮件等**早已实现**，此次补齐退款邮件与 VAT 拆分管道。
- 真正"按 GBP 含税收款 + 开 VAT 发票"还需业务侧决定：收款币种、是否注册英国 VAT / IOSS、启用 Stripe Tax。

## [0.4.6] - 2026-06-16

### 新增 Added
- **地区识别与货币/税显示**：访客进站时按边缘地理头（Vercel `x-vercel-ip-country` / Cloudflare `cf-ipcountry`）
  判断国家，自动以当地货币**近似显示**价格、展示该地区 VAT 提示与「ship-to」信息；
  头部新增**国家/货币手动切换器**（IP 偶尔不准时可改，写入 `rk-country` cookie）。
  - `lib/region.ts`（国家→货币/近似汇率/VAT 注，覆盖中东/中亚/东南亚/英欧/南亚等）、`lib/region-server.ts`、
    `components/region-provider.tsx`、`region-switcher.tsx`、`components/price.tsx`。
  - 产品卡 / 详情 / 购物车价格按所选货币近似显示。

### 说明 Notes
- 仅为**显示**层：下单仍由 Stripe 按 **USD** 收款；购物车明确标注「Your card is charged $X (USD)」。
- 汇率为静态近似值（仅用于「≈ 本币」提示，不影响实际扣款），需定期手动更新。

## [0.4.5] - 2026-06-16

### 新增 Added
- **合规页面**（支付网关 / 广告平台审核所需）：新增《条款与条件》`/terms`、《隐私政策》`/privacy`、
  《联系我们》`/contact`（均中英双语）；连同已有的《配送政策》`/shipping`、《退换及保修》`/returns`
  一并加入页脚「政策」栏。
- 公司信息集中到 `lib/contact.ts`（`COMPANY_NAME / COMPANY_ADDRESS / COMPANY_PHONE / COMPANY_HOURS`，
  可经 `.env` 配置）；联系页读取真实邮箱/WhatsApp，未填的电话/地址自动隐藏。

### 说明 Notes
- ⚠️ 上线/送审前必须在 `.env` 填入**真实**的 `NEXT_PUBLIC_COMPANY_NAME/ADDRESS/PHONE` 与 `NEXT_PUBLIC_WHATSAPP_NUMBER`，
  否则 Stripe / Google / Meta 审核可能因联系方式/主体信息不实而拒绝。

## [0.4.4] - 2026-06-16

### 新增 Added
- **列表「只看保证适配」筛选**：产品页筛选栏新增绿色 Guaranteed Fit 开关（`?guaranteed=1`），一键只看保证适配的件。
- **结账/购物车保证适配提示**：购物车每个保证适配商品显示绿色「保证适配」徽章，订单摘要汇总提示
  「其中 N 件为保证适配 —— 装不上 30 天免费退货」，均链接到 `/guaranteed-fit`。

## [0.4.3] - 2026-06-16

### 新增 Added
- **Guaranteed Fit 保证适配**（仿 eBay Motors Assured Fit）：买家在 My Garage 选发动机后，
  已核实适配的合格配件在产品卡/列表/详情显示绿色「Guaranteed Fit」徽章，并承诺装不上 30 天内免费退货。
  - 新增产品字段 `Product.fitmentGuaranteed`；后台产品表单新增「保证适配资格」勾选项。
  - `fit-badge` / `fitment-checker` 在确认适配且合格时升级为保证适配徽章与承诺。
  - 新增政策页 `/guaranteed-fit`（中英双语，i18n `gfit.*`）+ 页脚入口。
  - `scripts/seed-guaranteed-fit.js`：把有核实兼容型号的具体件批量登记为保证适配。

## [0.4.2] - 2026-06-16

### 新增 Added
- **客户订单详情页**（前台账户）：个人中心订单历史的每张卡片可点击进入 `/account/orders/[id]`，
  展示商品明细、金额拆分（小计/折扣/运费/税/合计）、收货地址、物流单号与轨迹链接、支付/订单/履约状态。
  仅本人可见（按登录邮箱校验，越权访问返回 404）。

## [0.4.1] - 2026-06-16

### 新增 Added
- **客户收货地址簿**（前台账户）：`/account/addresses` 增删改、设默认地址；首个地址自动设为默认，
  删除默认后自动顺延。新增 Prisma 模型 `CustomerAddress`；个人中心新增「Shipping addresses」入口。

## [0.4.0] - 2026-06-16

本次迭代围绕 **eBay 式适配（Fitment）体系、B2B 询价、客户账户、SEO/细节打磨、首页改版** 展开。

### 新增 Added
- **客户账户系统**（前台，独立于管理后台）：
  - 注册 / 登录 / 登出（`/account/login`、`/account/register`），邮箱为唯一标识，PBKDF2 + HMAC 会话（30 天）。
  - 个人中心 `/account`：按邮箱聚合订单历史（含历史访客订单）、状态 / 明细 / 物流、资料、登出。
  - 忘记密码找回：`/account/forgot-password` + `/account/reset-password`（32 字节令牌、SHA-256 存储、30 分钟有效、一次性、防账号探测、限流）。
  - 用下过单的邮箱注册可“认领”历史访客订单；游客刷卡结账保持免登录。
  - 模型新增 `Customer.passwordHash / resetTokenHash / resetTokenExpiresAt`；`lib/customer-auth.ts`。
- **批量询价车（Bulk RFQ）**：`/quote` 多产品+数量一次询价，WhatsApp 整单消息 + 表单提交留存；
  后台 `/admin/quotes` 集中报价跟进。模型 `QuoteRequest`。
- **eBay 式适配体系**：
  - 产品列表置顶 **适配栏**（选发动机→只看适配件，联动 My Garage，持续显示“正在显示适配 X”）。
  - **My Garage** 多设备车库（替代单台 My Engine）；“适配我的车库”跨多发动机一键筛选。
  - 产品卡 **Confirmed fit / Not for your X** 徽章；详情页适配模块前置到价格上方。
  - 后台 **适配健康度看板** `/admin/fitment`（覆盖率、数据质量警告、各发动机零件覆盖）；
    产品表单 **勾选式型号录入**（受控词表）；型号落地页显示收录数量（SEO + 信任）。
  - 后台 **故障排查管理** `/admin/problems`（含交互式诊断树 JSON）；前台诊断树、难度/工具/视频、症状↔型号互链。
- **运营工具**：库存预警邮件（付款后跌破阈值）、产品 CSV 批量导入/导出、订单 CSV 导出、
  后台重发确认/发货邮件、最近浏览产品、客户 CSV 导出与手动建档、批发风险评分。
- **首页**：自动轮播 Hero（3 张幻灯片）、产品优先重排、深色“按型号选购”聚焦区。

### 变更 Changed
- **购物车 / 询价 / 账户** 移至头部右上角（标准电商位置）。
- **SEO/细节打磨**：型号/故障/指南/产品页结构化数据（Breadcrumb / ItemList / HowTo / Article / FAQPage）、
  OG/Twitter 社交预览、自定义 404、键盘焦点样式、减少动效偏好、路由骨架屏、统一微交互、产品图改用 `next/image`。

### 说明 Notes
- 客户会话密钥 `CUSTOMER_SESSION_SECRET`（未设则回退 `ADMIN_SESSION_SECRET`），已写入 `.env.example`。
- 邮件功能（订单/发货/库存/密码重置）依赖 SMTP；未配置时静默跳过，开发环境重置链接打印到控制台。
- 动态 OG 默认图因 `@vercel/og` 在含中文路径的 Windows 本地有字体加载 bug 而未启用，生产（Linux）不受影响。

## [0.3.0] - 2026-06-15

本次迭代在主线（邮件通知、CSV 导出、找件器、产品图库、GA4、评价管理、密码重置、
about/shipping/returns/engines/problems 页、自带中英 i18n 等）基础上，新增与完善了以下能力。

### 新增 Added
- **后台 · 分类管理**（`/admin/categories`）：增删改、排序、启停，显示每个分类关联产品数。
- **后台 · 维修指南管理**（`/admin/guides`）：标题 / Slug / 状态（草稿·已发布）/ 摘要 / 正文 / SEO。
- **后台 · 站点设置**（`/admin/settings`）：店名、联系邮箱、WhatsApp、币种、公告栏（键值存储）。
- **后台 · 产品图片本地上传**：`POST /api/admin/upload`（管理员鉴权、5MB、JPG/PNG/WebP/GIF/AVIF），
  存入 `public/uploads/`；产品表单支持主图与相册上传 + 预览。
- **前台 · 维修指南公开页**：`/guides` 列表与 `/guides/[slug]` 详情，接入中英 i18n + 头/底部导航。
- **前台 · 产品详情关联维修指南**：按 `relatedGuideSlugs` 展示已发布指南卡片。
- 新增 Prisma 模型 `Category` / `RepairGuide` / `Setting`；`lib/admin-status.ts`（状态枚举→中文显示映射）；
  `scripts/seed-taxonomy.js`（从产品数据填充分类与指南）。

### 变更 Changed
- **后台界面整体中文化**：侧边栏、登录 / 找回密码、仪表盘、产品、订单、库存、客户、批发、
  优惠券、评价、分类、维修指南、设置等全部改为中文显示（枚举值、`value`、路由、字段名保持英文不变）。
- **后台状态徽章中文显示**：订单 / 产品 / 客户 / 优惠券 / 批发 / 库存的状态以中文呈现，底层枚举与颜色逻辑不变。
- **首页分类导航改由 `Category` 表驱动**（启用、按 `sortOrder`），表为空时回退到按产品聚合。

### 说明 Notes
- 上传的图片（`public/uploads/`）、`.env`、`prisma/dev.db` 均被 git 忽略。
- CSV 导出表头：订单导出为中文，客户导出暂保留英文（避免影响下游解析）。
