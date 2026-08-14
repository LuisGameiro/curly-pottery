export const dynamic = 'force-dynamic'

import { StatCard } from '@components/admin/StatCard'
import { VercelDataCard } from '@components/admin/VercelDataCard'
import { StockMovementsCard } from '@components/admin/StockMovementsCard'
import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'
import {
  getDashboardStats,
  getRecentStockMovements,
} from '@actions/dashboard.actions'
import { getVercelDataUsage } from '@actions/vercelData.actions'
import Loading from 'app/loading'
import {
  Users,
  Package,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  TouchpadIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata = constructMetadata({
  title: 'Admin Dashboard',
  description:
    'Overview of your store performance and inventory health at Curly Pottery.',
})

async function AdminDashboardContent() {
  const [statsResponse, vercelResponse, stockResponse] = await Promise.all([
    getDashboardStats(),
    getVercelDataUsage(),
    getRecentStockMovements(50),
  ])

  if (!statsResponse.success) throw new Error(statsResponse.message)
  if (!vercelResponse.success) throw new Error(vercelResponse.message)
  if (!stockResponse.success) throw new Error(stockResponse.message)

  const stats = statsResponse.data
  const vercelData = vercelResponse.data
  const stockMovements = stockResponse.data

  return (
    <Container data-testid="admin-dashboard">
      <header>
        <Text variant="heading">Store Dashboard</Text>
        <Text variant="subHeading">
          Overview of your store performance and inventory health.
        </Text>
      </header>

      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="text-secondary" size={20} />}
          />
          <StatCard
            label="Pending Orders"
            value={stats.pendingOrders}
            icon={<Clock className="text-red" size={20} />}
            trend={stats.pendingOrders > 0 ? 'Action Required' : 'All Clear'}
            isCritical={stats.pendingOrders > 0}
          />
          <StatCard
            label="Active Products"
            value={stats.totalProducts}
            icon={<Package className="text-amber" size={20} />}
          />
          <StatCard
            label="Total Units in Stock"
            value={stats.totalInventoryUnits}
            icon={<ShoppingBag className="text-green" size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Container variant="box" className="col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <Layers className="text-muted" size={20} />
              <Text variant="bold">Inventory Health</Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-end text-sm text-muted font-semibold tracking-wider">
                  Stock Availability
                </div>
                <div className="flex h-4 w-full rounded-full overflow-hidden bg-accent-2">
                  <div
                    className="bg-green transition-all"
                    style={{
                      width: `${stats.totalProducts > 0 ? (stats.productsWithStock / stats.totalProducts) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-red transition-all"
                    style={{
                      width: `${stats.totalProducts > 0 ? (stats.productsOutOfStock / stats.totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green" />{' '}
                    {stats.productsWithStock} In Stock
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red" />{' '}
                    {stats.productsOutOfStock} Out of Stock
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-red/20">
                  <Text className="font-bold block mb-1">
                    {'Low Stock (<5)'}
                  </Text>
                  <Text className="justify-center">
                    {stats.lowStockVariants + ' Variants'}
                  </Text>
                </div>
                <div className="p-4 rounded-xl border border-border bg-green/20">
                  <Text className="font-bold block mb-1">
                    Active Categories
                  </Text>
                  <Text className="justify-center">
                    {stats.totalCategories}
                  </Text>
                </div>
              </div>
            </div>
          </Container>

          <Container variant="box" className="col-span-2 xl:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <TouchpadIcon className="text-muted" size={20} />
              <Text variant="bold">Quick Tasks</Text>
            </div>

            <div className="space-y-2">
              {stats.pendingOrders > 0 ? (
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-2 p-3 rounded-lg border border-red/60 bg-red/20 hover:bg-red/60 transition"
                >
                  <AlertCircle className="text-red" size={18} />
                  <div>
                    <Text className="font-bold">Process Orders</Text>
                    <Text>
                      You have {stats.pendingOrders} orders waiting for
                      shipment.
                    </Text>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-green/20 bg-green/20">
                  <CheckCircle2 className="text-green" size={18} />
                  <Text className="font-bold">All orders processed</Text>
                </div>
              )}
            </div>
          </Container>
        </div>

        <VercelDataCard data={vercelData} />

        <StockMovementsCard movements={stockMovements} />
      </section>
    </Container>
  )
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboardContent />
    </Suspense>
  )
}
