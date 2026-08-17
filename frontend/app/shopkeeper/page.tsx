"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch } from "@/services/api"

interface Stat {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface RecentOrder {
  id: string
  patient: string
  medicines: string
  items: number
  total: number
  status: string
  date: string
}

interface LowStockAlert {
  name: string
  stock: number
  threshold: number
}

const defaultStats: Stat[] = [
  { label: "Pending Orders", value: "0", icon: ClipboardList, color: "text-orange-500" },
  { label: "Low Stock Items", value: "0", icon: AlertTriangle, color: "text-red-500" },
  { label: "Prescriptions", value: "0", icon: FileText, color: "text-purple-500" },
  { label: "Total Products", value: "0", icon: Package, color: "text-green-500" },
]

function statusColor(status: string) {
  if (status === "New" || status === "pending" || status === "Pending") return "status-pending font-bold"
  if (status === "Accepted" || status === "accepted") return "status-accepted font-bold"
  if (status === "Rejected" || status === "rejected") return "status-rejected font-bold"
  if (status === "Delivered" || status === "delivered" || status === "Completed") return "status-delivered font-bold"
  return "status-new font-bold"
}

export default function ShopkeeperHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stat[]>(defaultStats)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([])
  const [shopName, setShopName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        // Relative /api goes through the Next.js rewrite (see next.config.mjs)
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"
        const response = await authFetch(`${API_BASE}/shop/dashboard?shopId=${user.id}`)
        
        if (!response.ok) throw new Error('Failed to fetch dashboard')
        const data = await response.json()
        
        setStats([
          { label: "Pending Orders", value: data.pendingOrders?.toString() || "0", icon: ClipboardList, color: "text-orange-500" },
          { label: "Low Stock Items", value: data.lowStockCount?.toString() || "0", icon: AlertTriangle, color: "text-red-500" },
          { label: "Prescriptions", value: data.pendingPrescriptions?.toString() || "0", icon: FileText, color: "text-purple-500" },
          { label: "Total Products", value: data.totalProducts?.toString() || "0", icon: Package, color: "text-green-500" },
        ])
        
        // Transform recent orders
        const transformedOrders = (data.recentOrders || []).map((order: any) => {
          const medicineNames = order.medicines?.map((m: any) => m.medicineName).join(', ') || 'No medicines'
          return {
            id: `ORD-${order._id?.slice(-6).toUpperCase()}` || 'N/A',
            patient: order.patientId?.name || 'Unknown',
            medicines: medicineNames,
            items: order.medicines?.length || 0,
            total: order.medicines?.reduce((sum: number, m: any) => sum + (m.price || 0) * m.quantity, 0) || 0,
            status: order.status === 'pending' ? 'New' : order.status === 'accepted' ? 'Accepted' : 'Delivered',
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'
          }
        })
        setRecentOrders(transformedOrders)
        
        // Transform low stock items
        const transformedLowStock = (data.lowStockItems || []).map((item: any) => ({
          name: item.medicineName,
          stock: item.quantity,
          threshold: 20
        }))
        setLowStockAlerts(transformedLowStock)
        
        setShopName(user?.name || "Your store")
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-emerald-100 via-teal-50 to-transparent p-5 rounded-xl border-l-4 border-emerald-400 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-800">Store <span className="text-emerald-500">Dashboard</span></h2>
        <p className="text-slate-600 font-medium"><span className="font-bold">{shopName || "Your store"}</span> overview and quick actions.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, index) => (
          <Card key={s.label} className="card-elevated hover:shadow-lg hover:shadow-emerald-100/50 transition-all hover:-translate-y-1">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${index === 0 ? 'bg-amber-100' : index === 1 ? 'bg-rose-100' : index === 2 ? 'bg-violet-100' : 'bg-emerald-100'}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="text-3xl font-extrabold text-slate-800">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" asChild className="font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              <Link href="/shopkeeper/orders">View All →</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No recent orders</p>
                <p className="text-xs text-slate-400">Orders will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{order.id}</span>
                        <Badge variant="secondary" className={statusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">
                        {order.medicines}
                      </span>
                      <span className="text-xs text-slate-500">
                        <span className="font-medium">{order.patient}</span> &middot; {order.items} items &middot; <span className="font-bold text-emerald-500">₹{order.total.toFixed(2)}</span>
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{order.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No low stock alerts</p>
                <p className="text-xs text-slate-400">All items are in stock</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockAlerts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-500">
                        Threshold: <span className="font-semibold">{item.threshold}</span> units
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-600 font-bold">
                      {item.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1 hover:border-emerald-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <Package className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-800">Manage Inventory</h3>
              <p className="text-sm text-slate-500">Add, update or remove stock items</p>
              <Button asChild size="sm" className="mt-2 font-semibold bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200">
                <Link href="/shopkeeper/inventory">Go to Inventory</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-1 hover:border-amber-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
                <ClipboardList className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-800">View Orders</h3>
              <p className="text-sm text-slate-500">Accept or reject incoming orders</p>
              <Button asChild size="sm" variant="outline" className="mt-2 font-semibold border-amber-300 text-amber-600 hover:bg-amber-50">
                <Link href="/shopkeeper/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-1 hover:border-rose-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100">
                <TrendingUp className="h-7 w-7 text-rose-500" />
              </div>
              <h3 className="font-bold text-slate-800">Restock Items</h3>
              <p className="text-sm text-slate-500">Request restocking for low items</p>
              <Button asChild size="sm" variant="outline" className="mt-2 font-semibold border-rose-300 text-rose-600 hover:bg-rose-50">
                <Link href="/shopkeeper/restock">Restock</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}