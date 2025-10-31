"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  FileText,
  Settings,
  User,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: ROUTES.ORDERS,
    icon: ShoppingCart,
  },
  {
    name: "Products",
    href: ROUTES.PRODUCTS,
    icon: Package,
  },
  {
    name: "Customers",
    href: ROUTES.CUSTOMERS,
    icon: Users,
  },
  {
    name: "Analytics",
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
  },
  {
    name: "Reports",
    href: ROUTES.REPORTS,
    icon: FileText,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col gap-y-5 overflow-y-auto border-r bg-white dark:bg-slate-950 px-6">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold">Kiranawala</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive
                            ? "text-slate-900 dark:text-slate-50"
                            : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-50",
                          "h-6 w-6 shrink-0"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
