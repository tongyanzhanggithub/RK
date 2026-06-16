# 更新日志 Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/)。

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
