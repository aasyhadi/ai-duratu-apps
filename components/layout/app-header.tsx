import { Bell, Search } from "lucide-react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />

        <div>
          <p className="font-semibold">AI Powered Apps</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Belajar aplikasi konvensional hingga AI Agent
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Pencarian"
          className="hidden sm:inline-flex"
        >
          <Search className="size-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifikasi">
          <Bell className="size-5" />
        </Button>

        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}