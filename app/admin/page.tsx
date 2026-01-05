import AdminLayout from "./layout";
import { Container, Grid, Text } from "@components/ui";
import { getDashboardStats } from "actions/dashboard.actions";
import {
  Users,
  Package,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";


export default async function DashboardPage() {
    const stats = await getDashboardStats();

  return (
    <Container>
      <header>
        <div>
          <Text variant="heading">Store Dashboard</Text>
          <Text variant="subHeading">
            Overview of your store's performance and inventory health.
          </Text>
        </div>
      </header>
      <main className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="text-blue-500" size={20} />}
          />
          <StatCard
            label="Pending Orders"
            value={stats.pendingOrders}
            icon={<Clock className="text-red-500" size={20} />}
            trend={stats.pendingOrders > 0 ? "Action Required" : "All Clear"}
            isCritical={stats.pendingOrders > 0}
          />
          <StatCard
            label="Active Products"
            value={stats.totalProducts}
            icon={<Package className="text-purple-500" size={20} />}
          />
          <StatCard
            label="Total Units in Stock"
            value={stats.totalInventoryUnits}
            icon={<ShoppingBag className="text-green-500" size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-accent-2 border rounded-2xl p-4 gap-4 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Layers className="text-slate-400" size={20} />
                <Text variant="bold">Inventory Health</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <div className="sspace-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-sm text-muted-foreground font-semibold tracking-wider">
                    Stock Availability
                  </div>
                </div>
                <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="bg-green-500 transition-all"
                    style={{
                      width: `${(stats.productsWithStock / stats.totalProducts) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-400 transition-all"
                    style={{
                      width: `${(stats.productsOutOfStock / stats.totalProducts) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />{" "}
                    {stats.productsWithStock} In Stock
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />{" "}
                    {stats.productsOutOfStock} Out of Stock
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                  <Text className=" text-red-700 font-bold block mb-1">
                    {"Low Stock (<5)"}
                  </Text>
                  <Text className=" font-black text-red-900">
                    {stats.lowStockVariants + " Variants"}
                  </Text>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <Text className=" text-slate-500 font-bold block mb-1">
                    Active Categories
                  </Text>
                  <Text className="font-black text-slate-900">
                    {stats.totalCategories}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent-2 border rounded-2xl p-4 shadow-sm">
            <Text className="font-bold mb-4 block">Quick Tasks</Text>
            <div className="space-y-3">
              {stats.pendingOrders > 0 ? (
                <Link
                  href="/admin/orders"
                  className="flex gap-3 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition items-center"
                >
                  <AlertCircle className="text-red-600 shrink-0" size={18} />
                  <div>
                    <Text className=" font-bold text-red-900">
                      Process Orders
                    </Text>
                    <Text className=" text-red-700">
                      You have {stats.pendingOrders} orders waiting for
                      shipment.
                    </Text>
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                  <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                  <Text className=" font-bold text-green-900">
                    All orders processed
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Container>
  );
}

function StatCard({ label, value, icon, trend, isCritical }: any) {
  return (
    <div
      className={`bg-accent-2 border p-4 rounded-2xl shadow-sm space-y-2 ${isCritical ? "border-red-200 " : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg">{icon}</div>
          <Text variant="bold">{label}</Text>
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCritical ? "text-red-700" : " text-green-500"}`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="flex justify-end items-center">
        <Text className="subHeanding">{value}</Text>
      </div>
    </div>
  );
}

