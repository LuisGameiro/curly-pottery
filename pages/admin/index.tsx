// app/admin/layout.tsx
import Link from "next/link";
import { Package, FolderTree, LayoutDashboard, Settings } from "lucide-react";
import Layout from "@components/common/Layout";
import AdminLayout from "./adminLayout";

export default function Admin({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </AdminLayout>
  );
}

Admin.Layout = Layout;
