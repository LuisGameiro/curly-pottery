import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'
import { getDashboardStats } from 'actions/dashboard.actions'
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
import { ReactNode, Suspense } from 'react'

export const metadata = constructMetadata({
  title: 'Admin Dashboard',
  description:
    'Overview of your store performance and inventory health at Curly Pottery.',
})

export default async function DashboardPage() {
  const response = await getDashboardStats()

  if (!response.success) {
    throw new Error(response.message)
  }

  const stats = response.data

  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header>
          <Text variant="heading">Store Dashboard</Text>
          <Text variant="subHeading">
            Overview of your store performance and inventory health.
          </Text>
        </header>

        <section className="space-y-8">
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
              icon={<Package className="text-purple-500" size={20} />}
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
                        width: `${(stats.productsWithStock / stats.totalProducts) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red/60 transition-all"
                      style={{
                        width: `${(stats.productsOutOfStock / stats.totalProducts) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green" />{' '}
                      {stats.productsWithStock} In Stock
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red/20" />{' '}
                      {stats.productsOutOfStock} Out of Stock
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-red/20/60">
                    <Text className=" text-red font-bold block mb-1">
                      {'Low Stock (<5)'}
                    </Text>
                    <Text className=" text-red">
                      {stats.lowStockVariants + ' Variants'}
                    </Text>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-green/20">
                    <Text className=" text-muted font-bold block mb-1">
                      Active Categories
                    </Text>
                    <Text className="text-muted">{stats.totalCategories}</Text>
                  </div>
                </div>
              </div>
            </Container>

            <Container variant="box" className="col-span-2 xl:col-span-1">
              <div className="flex items-center gap-4 mb-4">
                <TouchpadIcon className="text-muted" size={20} />
                <Text variant="bold">Quick Tasks</Text>
              </div>

              <div className="space-y-3">
                {stats.pendingOrders > 0 ? (
                  <Link
                    href="/admin/orders"
                    className="flex gap-2 p-3 rounded-lg border border-red/60 bg-red/60 hover:bg-red/60 transition items-center"
                  >
                    <AlertCircle className="text-red shrink-0" size={18} />
                    <div>
                      <Text className=" font-bold text-red">
                        Process Orders
                      </Text>
                      <Text className=" text-red">
                        You have {stats.pendingOrders} orders waiting for
                        shipment.
                      </Text>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-green/20 bg-green-50">
                    <CheckCircle2 className="text-green shrink-0" size={18} />
                    <Text className=" font-bold text-green">
                      All orders processed
                    </Text>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </section>
      </Container>
    </Suspense>
  )
}

interface StatCardProp {
  label: string
  value: number
  icon: ReactNode
  trend?: string
  isCritical?: boolean
}

function StatCard({ label, value, icon, trend, isCritical }: StatCardProp) {
  return (
    <Container
      variant="box"
      className={` ${isCritical ? 'border-red/60 ' : ''}`}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4 mb-4 ">
          <div className="rounded-lg">{icon}</div>
          <Text variant="bold">{label}</Text>
        </div>
        {trend && (
          <span
            className={` font-bold px-2 py-0.5 rounded-full ${isCritical ? 'text-red' : ' text-green'}`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="flex justify-end items-center">
        <Text className="subHeanding">{value}</Text>
      </div>
    </Container>
  )
}
