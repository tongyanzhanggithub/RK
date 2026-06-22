import { Suspense } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SavedToast } from "@/components/saved-toast";
import { requireAdmin } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell adminName={admin.name} isSuperAdmin={admin.role === "SUPER_ADMIN"}>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      {children}
    </AdminShell>
  );
}
