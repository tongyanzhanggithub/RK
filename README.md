# RepairKit Supply — 小型发动机配件独立站

面向中东、中亚、东南亚市场的汽配 B2B/B2C 独立站。主营 168F / 170F / 188F / GX160 风格小型汽油机的维修套件、零配件与整机，支持零售在线支付和批发询盘两条业务线。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14（App Router）+ TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | SQLite + Prisma ORM |
| 支付 | Stripe Checkout + Webhook 订单同步 |
| 表单校验 | Zod |
| 图标 | lucide-react |

## 功能

**前台商城**

- 产品目录与详情页（兼容机型、适用设备、解决的故障、套件清单、规格、FAQ）
- **维修指南**：公开页 `/guides` 与详情 `/guides/[slug]`，产品详情页关联展示相关指南
- **首页分类导航由 Category 表驱动**（启用、按排序），可在后台维护
- **中英文切换**（EN / 中文，整站 i18n）
- 购物车（localStorage 持久化）+ Stripe Checkout 在线支付
- 优惠券（百分比 / 固定金额 / 免运费），下单前实时校验
- 批发 / RFQ 申请表单，WhatsApp 浮窗询盘
- SEO：sitemap、robots、每个产品独立的 SEO 字段

**后台管理（`/admin`，中文界面）**

- 仪表盘：营收、订单、库存预警概览
- 产品管理：创建 / 编辑 / 归档，零售价、批发价、成本价；**产品图片本地上传**（存 `public/uploads/`）
- 库存管理：入库 / 退货 / 损耗 / 盘点，完整调整流水
- 订单管理：支付状态、发货与物流单号
- 优惠券管理：有效期、使用上限、最低消费
- 客户管理与批发申请审核、用户评价管理
- **分类管理**：产品分类的增删改、排序、启停（驱动前台分类导航）
- **维修指南管理**：撰写 / 发布排障指南（草稿 / 已发布）
- **站点设置**：店名、联系邮箱、WhatsApp、币种、公告栏
- 状态徽章中文显示（枚举值与逻辑保持英文）
- 独立的管理员账号体系（PBKDF2 密码哈希 + HMAC 签名会话 Cookie）

**Stripe 集成**

- Checkout Session 创建时即落库订单（PENDING），webhook 确认支付后更新状态
- 支付成功自动扣减库存（幂等，防重复扣减）、记录优惠券用量、回填客户资料
- 处理支付失败、会话过期、退款等事件

## 快速开始

```bash
# 1. 安装依赖（需要 Node.js 22+，seed 脚本依赖 node:sqlite）
npm install

# 2. 配置环境变量
copy .env.example .env
# 编辑 .env，填入 Stripe 密钥等（见下表）

# 3. 初始化数据库（建表 + 写入种子产品数据）
npm run db:seed

# 4. 生成 Prisma Client
npm run db:generate

# 5. 创建管理员账号
$env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PASSWORD='你的密码'; npm run admin:create

# 6. 填充分类与维修指南（从现有产品派生，幂等）
node scripts/seed-taxonomy.js

# 7. 启动开发服务器（http://127.0.0.1:4173）
npm run dev
```

## 环境变量

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | SQLite 文件路径，默认 `file:./dev.db` |
| `NEXT_PUBLIC_SITE_URL` | 站点地址，用于 Stripe 支付完成后的跳转 |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp 询盘号码（纯数字含国家码，不带 `+`） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 联系邮箱 |
| `STRIPE_SECRET_KEY` | Stripe 私钥（`sk_` 开头） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥（`whsec_` 开头） |
| `ADMIN_SESSION_SECRET` | 后台会话签名密钥，生产环境必须设为长随机串 |

Stripe Webhook 的本地调试与生产配置见 [STRIPE_WEBHOOK_SETUP.md](STRIPE_WEBHOOK_SETUP.md)。

## NPM 脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（127.0.0.1:4173） |
| `npm run build` / `npm run start` | 生产构建 / 启动 |
| `npm run db:seed` | 建表并写入种子数据（重复执行会重置产品数据） |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run admin:create` | 创建或重置管理员账号（读取 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 环境变量） |

## 目录结构

```
app/
  page.tsx                  # 首页
  products/                 # 产品列表与详情
  guides/                   # 维修指南（列表 + 详情）
  cart/                     # 购物车
  checkout/                 # 支付成功 / 取消页
  wholesale/                # 批发申请
  admin/                    # 后台（login + (protected) 受保护路由组）
  api/
    admin/upload/           # 后台图片上传（鉴权，存 public/uploads/）
    checkout/               # 创建 Stripe Checkout Session
    coupons/validate/       # 优惠券实时校验
    stripe/webhook/         # Stripe 事件回调
components/                 # 共享组件（购物车 Provider、产品卡、后台壳、图片上传等）
lib/                        # 核心逻辑（认证、i18n、优惠券计算、Stripe 同步、状态映射、Prisma 实例）
prisma/                     # schema 与种子脚本
public/uploads/             # 后台上传的产品图片（git 忽略，仅保留目录）
data/                       # 静态内容（机型、设备、故障场景）
scripts/                    # create-admin.js、seed-taxonomy.js
```

版本变更记录见 [CHANGELOG.md](CHANGELOG.md)。

## 注意事项

- `.env` 与 `dev.db` 已被 git 忽略，不会提交到仓库；部署时需自行配置。
- 生产环境务必设置强随机的 `ADMIN_SESSION_SECRET`，否则后台会话可被伪造。
- SQLite 适合当前体量；如果订单量上来，Prisma 的 `provider` 换成 PostgreSQL 即可平滑迁移。
