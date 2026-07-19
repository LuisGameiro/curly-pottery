'use client'

import { useState } from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import {
  Package,
  LayoutDashboard,
  ChevronDown,
  Van,
  Users,
  ChartBarIcon,
  Mail,
  Image,
} from 'lucide-react'
import { Text } from '@components/ui'
import { cn } from '@lib/utils'
import { useUser } from '@lib/hooks/useUser'
import Loading from 'app/loading'
import { useClickOutside } from '@lib/hooks/useClickOutside'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: ChartBarIcon },
  { name: 'Orders', href: '/admin/orders', icon: Van },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Gallery', href: '/admin/gallery', icon: Image },
]

export default function AdminLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isAuthenticated, isAdmin, isLoading } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false)
  }, isOpen)

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated || !isAdmin) {
    redirect('/auth/login')
  }

  const currentItem =
    navItems.find((item) => item.href === pathname) || navItems[0]

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-2/12 bg-background lg:border-r border-border px-4 py-2 ">
        <Text
          variant="pageHeading"
          className="hidden lg:block font-bold text-xl text-secondary mt-6 pt-6"
        >
          Store Admin
        </Text>

        <div ref={containerRef} className="relative w-full z-30">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="admin-nav-links"
            className="w-full lg:hidden flex items-center justify-between px-4 py-3 bg-accent-2 border-2 border-border rounded-lg font-semibold text-secondary"
          >
            <div className="flex items-center gap-2">
              <currentItem.icon size={20} />
              <span>{currentItem.name}</span>
            </div>
            <ChevronDown
              className={cn('transition-transform', isOpen && 'rotate-180')}
              size={18}
            />
          </button>
          <ul
            id="admin-nav-links"
            className={cn(
              'space-y-1 mt-2 p-2 bg-accent-2 border-2 border-border rounded-xl shadow-xl lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mt-0 lg:block transition-all',
              'absolute left-0 right-0 top-full lg:static z-50',
              { hidden: !isOpen },
            )}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium',
                      isActive
                        ? 'bg-secondary text-background'
                        : 'text-secondary hover:bg-secondary/60',
                    )}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <main className="flex-1 py-4 sm:px-2 md:px-8">{children}</main>
    </div>
  )
}
