"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { SETTING_KEYS } from "@/lib/settings";

export type SettingsFormState = {
  error?: string;
};

export async function saveSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  try {
    for (const key of SETTING_KEYS) {
      const value = String(formData.get(key) || "").trim();
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to save settings." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  redirect("/admin/settings?saved=1");
}
