// app/admin/layout.tsx
import Link from 'next/link';
import { Package, FolderTree, LayoutDashboard, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: FolderTree },
    { name: 'Messages', href: '/admin/messages', icon: FolderTree },

  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6 font-bold text-xl text-blue-600">StoreAdmin</div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} 
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
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
  );
}