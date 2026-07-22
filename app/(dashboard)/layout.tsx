import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppSidebar />

      <div className="lg:pl-64">
        <AppHeader />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}