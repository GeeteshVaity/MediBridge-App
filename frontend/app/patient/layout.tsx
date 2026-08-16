"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Upload,
  Pill,
  MapPin,
  ShoppingCart,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"

const navItems = [
  { href: "/patient", label: "Home", icon: Home },
  { href: "/patient/prescription", label: "Upload Prescription", icon: Upload },
  { href: "/patient/medicines", label: "Order Medicine", icon: Pill },
  { href: "/patient/stores", label: "Nearby Stores", icon: MapPin },
  { href: "/patient/cart", label: "Cart", icon: ShoppingCart },
  { href: "/patient/orders", label: "Orders", icon: ClipboardList },
]

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { itemCount } = useCart()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6 bg-gradient-to-r from-sky-100 via-cyan-50 to-transparent">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg icon-gradient-blue shadow-md shadow-sky-200">
          <Pill className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-extrabold bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">MediBridge</span>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-sky-100 text-sky-600 border-l-4 border-sky-400 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-sky-500' : ''}`} />
                {item.label}
                {item.label === "Cart" && itemCount > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-600 font-bold">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </div>
  )
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-cyan-50/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 shadow-sm lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-slate-800">
              {navItems.find((i) => i.href === pathname)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user?.id} />
            <div className="flex h-10 w-10 items-center justify-center rounded-full icon-gradient-blue text-sm font-bold text-white shadow-md shadow-sky-200">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}


