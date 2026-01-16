"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  ChevronDown,
  Van,
  Users,
  ChartBarIcon,
} from "lucide-react";
import { Text } from "@components/ui";
import { cn } from "@lib/utils";
import ClickOutside from "@lib/click-outside";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: ChartBarIcon },
    { name: "Orders", href: "/admin/orders", icon: Van },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  const currentItem =
    navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <div className="flex flex-col lg:flex-row container mx-auto">
      <aside className="w-full lg:w-2/12 bg-background lg:border-r border-border px-4 py-2 ">
        <Text
          variant="pageHeading"
          className="hidden lg:block font-bold text-xl text-secondary mt-6 pt-6"
        >
          Store Admin
        </Text>

        <div className="relative w-full z-30">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full lg:hidden flex items-center justify-between px-4 py-3 bg-accent-2 border-2 border-border rounded-lg font-semibold text-secondary"
          >
            <div className="flex items-center gap-3">
              <currentItem.icon size={20} />
              <span>{currentItem.name}</span>
            </div>
            <ChevronDown
              className={cn("transition-transform", isOpen && "rotate-180")}
              size={18}
            />
          </button>
          <ClickOutside active={isOpen} onClick={() => setIsOpen(!isOpen)}>
            <ul
              className={cn(
                "space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block transition-all",
                "absolute left-0 right-0 top-full lg:static z-50",
                { hidden: !isOpen }
              )}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium",
                      isActive
                        ? "bg-secondary text-white"
                        : "text-secondary hover:bg-blue-50"
                    )}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </ul>
          </ClickOutside>
        </div>
      </aside>

      <main className="flex-1 py-4 sm:px-2 md:px-8">{children}</main>
    </div>
  );
}
