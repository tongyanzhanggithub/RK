import type { Metadata } from "next";
import { SettingsForm } from "@/app/admin/(protected)/settings/settings-form";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Site configuration."
};

export default async function AdminSettingsPage({ searchParams }: { searchParams?: { saved?: string } }) {
  const values = await getSettings();

  return (
    <main>
      <div className="mb-8">
        <p className="font-black uppercase text-safety">Settings</p>
        <h1 className="text-4xl font-black">Site Settings</h1>
        <p className="mt-3 text-steel">Store name, contact details, currency and announcement bar. Saved to the database.</p>
      </div>
      <SettingsForm values={values} saved={searchParams?.saved === "1"} />
    </main>
  );
}
