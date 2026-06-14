import { prisma } from "@/lib/db";

export const SETTING_FIELDS = [
  { key: "store_name", label: "店铺名称", placeholder: "RepairKit Supply", type: "text" },
  { key: "contact_email", label: "联系邮箱", placeholder: "sales@repairkit-supply.com", type: "email" },
  { key: "whatsapp_number", label: "WhatsApp 号码（纯数字含国家码，无 +）", placeholder: "8613800000000", type: "text" },
  { key: "default_currency", label: "默认币种", placeholder: "usd", type: "text" },
  { key: "announcement", label: "顶部公告栏文字（可选）", placeholder: "Export RFQs answered within 24 hours", type: "text" }
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
