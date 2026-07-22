import {
  Bot,
  Boxes,
  Database,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  type LucideIcon,
  Warehouse,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transaksi",
    href: "/transactions",
    icon: ShoppingCart,
  },
  {
    title: "Produk",
    href: "/products",
    icon: Boxes,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    title: "AI Chat",
    href: "/ai-chat",
    icon: Bot,
  },
  {
    title: "Tes Database",
    href: "/database-test",
    icon: Database,
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];