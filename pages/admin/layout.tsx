import Link from "next/link";
import { Package, FolderTree, LayoutDashboard, Settings } from "lucide-react";
import Layout from "@components/common/Layout";
import { Footer, Navbar } from "@components/common";
import { Text } from "@components/ui";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: FolderTree },
    { name: "Customers", href: "/admin/customers", icon: FolderTree },
  ];

  const navBarlinks = [
    { label: "Shop", href: "/shop" },
    { label: "Contacts", href: "/contacts" },
    { label: "Admin", href: "/admin" },
  ]

  return (
    <div className={' h-full bg-background mx-auto transition-colors duration-150 min-h-screen'}>
      <Navbar links={navBarlinks} />

      <div className="flex min-h-screen bg-background">
        <aside className="w-64 bg-background border-r border-border hidden md:block">
          <Text variant="heading" className="p-6 font-bold text-xl text-secondary">StoreAdmin</Text>
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-secondary hover:bg-blue-50 hover:text-secondary/60 rounded-lg transition"
              >
                <item.icon size={20} /> {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>


      </div>
      <Footer />
    </div>
  );
}

AdminLayout.Layout = Layout;
