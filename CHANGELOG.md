# 更新日志 Changelog

本项目版本变更记录。格式参考 [Keep a Changelog](https://keepachangelog.com/)。

## [0.2.0] - 2026-06-15

### 新增 Added
- **前台中英文切换**：自建轻量 i18n（`lib/i18n.ts` + `LanguageProvider` + `LanguageToggle`），
  覆盖头/尾/导航/购物车/首页全文案/产品卡；记忆所选语言（cookie + localStorage），SSR 同步 `<html lang>`。
- **后台中文化**：侧边栏、顶栏、登录页、仪表盘整页改为中文（后台不跟前台语言联动）。
- **后台新模块 — 分类**（`/admin/categories`）：增删改、排序、启停，列表显示关联产品数。
- **后台新模块 — 维修指南**（`/admin/guides`）：标题/Slug/状态/摘要/正文/SEO，草稿与发布。
- **后台新模块 — 设置**（`/admin/settings`）：店名、联系邮箱、WhatsApp、币种、公告栏（键值存储）。
- 新增 Prisma 模型 `Category` / `RepairGuide` / `Setting`。
- `scripts/seed-taxonomy.js`：从现有产品数据填充分类与维修指南。
- 选品分析脚本与 Excel 产出（`scripts/build_*.py`，多维加权选品打分表）。
- 项目文档：`README.md`、`CHANGELOG.md`。

### 变更 Changed
- 首页拆分为服务端数据获取（`app/page.tsx`）+ 客户端展示组件（`components/home-content.tsx`）以支持 i18n。

### 备注 Notes
- 前台 `/products`、`/guides` 等内页与"设置"暂未接入数据库（仍读环境变量/写死列表），属后续工作。

## [0.1.0] - 2026-06 (baseline)

- Next.js 14 + Prisma + SQLite + Stripe 的 B2B 汽配出口独立站基线版本。
- 前台：首页、产品列表/详情、批发申请、购物车、Stripe Checkout、优惠券。
- 后台（Phase Admin 5）：仪表盘、产品、订单、库存、客户、批发审核、优惠券，自建管理员鉴权。
