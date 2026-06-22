import { prisma } from "@/lib/db";

export const SETTING_FIELDS = [
  { key: "store_name", label: "店铺名称", placeholder: "Partavio", type: "text" },
  { key: "contact_email", label: "联系邮箱", placeholder: "sales@partavio.com", type: "email" },
  { key: "whatsapp_number", label: "WhatsApp 号码（纯数字含国家码，无 +）", placeholder: "8613800000000", type: "text" },
  { key: "default_currency", label: "默认币种", placeholder: "usd", type: "text" },
  { key: "announcement", label: "顶部公告栏文字（留空则隐藏）", placeholder: "Export RFQs answered within 24 hours", type: "text" },
  { key: "announcement_link", label: "公告栏链接（可选，点击公告跳转）", placeholder: "/promo/summer-sale", type: "text" },
  { key: "popup_enabled", label: "订阅弹窗：开启（填 on 开启，留空关闭）", placeholder: "on", type: "text" },
  { key: "popup_title", label: "订阅弹窗：标题", placeholder: "拿批发底价 & 到货提醒", type: "text" },
  { key: "popup_body", label: "订阅弹窗：副文案", placeholder: "留下邮箱，第一时间收到批发优惠与新品到货。", type: "text" },
  { key: "popup_delay_seconds", label: "订阅弹窗：延迟弹出秒数（默认 8）", placeholder: "8", type: "text" }
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]["key"];

export const SETTING_KEYS = SETTING_FIELDS.map((field) => field.key) as SettingKey[];

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSetting(key: SettingKey, fallback = ""): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}
