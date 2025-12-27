"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FolderTree,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Navbar, Footer } from "@components/common";
import { Text } from "@components/ui";
import { cn } from "@lib/utils"; // Assuming you have a cn helper for tailwind classes

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
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: FolderTree },
    { name: "Customers", href: "/admin/customers", icon: FolderTree },
  ];

  const currentItem =
    navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-background transition-colors duration-150">
      <Navbar
        links={[
          { label: "Shop", href: "/shop" },
          { label: "Contacts", href: "/contacts" },
          { label: "Admin", href: "/admin" },
        ]}
      />

      <div className="flex flex-col lg:flex-row min-h-screen container mx-auto">
        <aside className="w-full lg:w-2/12 bg-background border-b md:border-r border-border p-4 ">
          <Text
            variant="pageHeading"
            className="hidden lg:block font-bold text-xl text-secondary mb-6"
          >
            StoreAdmin
          </Text>

          <div className="relative">
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

            <nav
              className={cn(
                "absolute md:relative left-0 right-0 top-full mt-2 md:mt-0 z-50 md:z-auto",
                "bg-background md:bg-transparent border-2 md:border-0 border-border rounded-xl md:rounded-none shadow-xl md:shadow-none",
                "flex flex-col gap-1 p-2 md:p-0 transition-all",
                !isOpen && "hidden lg:flex",
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
                        : "text-secondary hover:bg-blue-50",
                    )}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 py-4 sm:px-2 md:px-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
