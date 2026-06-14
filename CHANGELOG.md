# 更新日志 Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/)。

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
