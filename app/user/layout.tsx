"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Package, ChevronDown, User, Van } from "lucide-react";
import { Text } from "@components/ui";
import { cn } from "@lib/utils";
import { useUser } from "@lib/hooks/useUser";
import ClickOutside from "@lib/click-outside";
import Loading from "app/loading";

const navItems = [
  { name: "Profile", href: "/user", icon: User },
  { name: "Cart", href: "/user/cart", icon: Package },
  { name: "Orders", href: "/user/orders", icon: Van },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  const currentItem =
    navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <div className="flex flex-col lg:flex-row container mx-auto">
      <aside className="w-full lg:w-2/12 bg-background lg:border-r border-border px-4 py-2 ">
        <Text
          variant="pageHeading"
          className="hidden lg:block font-bold text-xl text-secondary mt-6 pt-6"
        >
          Profile
        </Text>
        <ClickOutside active={isOpen} onClick={() => setIsOpen(!isOpen)}>
          <div className="relative w-full z-30">
            <button
              onClick={() => setIsOpen((s) => !s)}
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

            <ul
              className={cn(
                "space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl absolute left-0 right-0 top-full z-50",
                "lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block  lg:static transition-all",
                { hidden: !isOpen },
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
            </ul>
          </div>
        </ClickOutside>
      </aside>

      <main className="flex-1 py-4 sm:px-2 md:px-8">{children}</main>
    </div>
  );
}
