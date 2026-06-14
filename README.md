# RepairKit Supply · 汽摩配件出口独立站

面向中东、中亚、东南亚（及英国等）市场的 **B2B 汽摩配件出口独立站**，主打"重庆工厂直供"。
包含完整的 **前台商城** 与 **后台管理系统**，技术栈 Next.js 14 (App Router) + Prisma + SQLite + Stripe。

---

## ✨ 功能

### 前台（顾客侧）
- 首页：工厂直供卖点、按品类导航、畅销品、WhatsApp 询盘 CTA
- 产品列表 / 产品详情（适配机型、解决问题、套件内容、规格、FAQ）
- 批发 / RFQ 申请表单
- 购物车 + Stripe Checkout 结账（支付状态以 Stripe Webhook 为准）
- 优惠券校验
- **中英文即时切换**（EN / 中文，自建轻量 i18n，记忆选择、SSR 同步 `<html lang>`）
- SEO：sitemap、robots、每页 metadata

### 后台（运营侧，`/admin`，中文界面）
- 仪表盘：今日/本月销售额、订单、低库存预警、待审批发申请
- 产品、订单、库存、客户、批发审核、优惠券管理
- **分类**：产品分类的增删改、排序、启停（`/admin/categories`）
- **维修指南**：排障/维修内容管理，草稿/发布（`/admin/guides`）
- **设置**：店名、联系邮箱、WhatsApp、币种、公告栏（`/admin/settings`）
- 鉴权：中间件保护 + HMAC 签名会话 cookie（8 小时）+ PBKDF2 密码哈希

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制示例并填写）
cp .env.example .env

# 3. 初始化数据库（创建表结构）
npx prisma db push

# 4. 填充演示数据（产品、订单、客户、优惠券等）
npm run db:seed

# 5. 填充分类与维修指南（从产品数据派生）
node scripts/seed-taxonomy.js

# 6. 创建管理员账号
#    PowerShell:
#    $env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='你的密码至少8位'; npm run admin:create

# 7. 启动开发服务器（http://127.0.0.1:4173）
npm run dev
```

---

## 🔑 环境变量（`.env`）

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | SQLite 路径，默认 `file:./dev.db` |
| `NEXT_PUBLIC_SITE_URL` | 站点地址，默认 `http://127.0.0.1:4173` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp 号码（纯数字含国家码，无 `+`） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 联系邮箱 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥（见 `STRIPE_WEBHOOK_SETUP.md`） |
| `ADMIN_SESSION_SECRET` | 后台会话签名密钥（务必改成长随机串） |

> ⚠️ `.env` 与 `prisma/dev.db` 已被 `.gitignore` 忽略，不会进入仓库。

---

## 🛠 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（127.0.0.1:4173） |
| `npm run build` / `npm run start` | 构建 / 生产启动 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:seed` | 填充演示数据 |
| `npm run admin:create` | 创建/重设管理员（读 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 环境变量） |
| `node scripts/seed-taxonomy.js` | 填充分类与维修指南 |

---

## 📁 目录结构

```
app/
  (前台)        page / products / cart / checkout / wholesale / api
  admin/        login + (protected)/ 仪表盘·产品·订单·库存·客户·批发·优惠券·分类·维修指南·设置
components/      站点头/尾、购物车、语言切换、产品卡、后台外壳等
lib/            db(Prisma)、admin-auth、i18n、settings、coupons、stripe-order-sync 等
data/           产品/机型/设备/问题 种子数据
prisma/         schema.prisma + seed.js（dev.db 不入库）
scripts/        create-admin.js、seed-taxonomy.js、选品分析脚本(build_*.py)
```

---

## 🌐 多语言

- **前台**：英文默认，右上角 `EN | 中文` 切换；词典在 `lib/i18n.ts`，新增文案在此添加。
- **后台**：中文为主（硬编码，不跟前台切换联动）。

---

## 📊 选品分析（业务工具）

`scripts/build_*.py` 生成 Excel 选品打分表（多维加权：价差 / 销量 / 毛利 / 重庆供应链 / 竞争 / 物流 / 售后 / 合规），
产出 `汽摩通用配件-综合选品.xlsx` 等。需要 Python + openpyxl。

---

## 🧾 其它

- **Stripe Webhook 配置**：见 [`STRIPE_WEBHOOK_SETUP.md`](STRIPE_WEBHOOK_SETUP.md)
- **遗留文件**：根目录的 `index.html` / `script.js` / `styles.css` / `preview-server.js` 为迁移到 Next.js 前的旧版静态原型，仅作参考，未被现版本使用。
- 版本变更见 [`CHANGELOG.md`](CHANGELOG.md)。
