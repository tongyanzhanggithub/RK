import { prisma } from "@/lib/db";

export const SETTING_FIELDS = [
  { key: "store_name", label: "Store Name", placeholder: "RepairKit Supply", type: "text" },
  { key: "contact_email", label: "Contact Email", placeholder: "sales@repairkit-supply.com", type: "email" },
  { key: "whatsapp_number", label: "WhatsApp Number (digits incl. country code, no +)", placeholder: "8613800000000", type: "text" },
  { key: "default_currency", label: "Default Currency", placeholder: "usd", type: "text" },
  { key: "announcement", label: "Top Announcement Bar (optional)", placeholder: "Export RFQs answered within 24 hours", type: "text" }
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
