"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Upload,
  Pill,
  ShoppingCart,
  ClipboardList,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  MapPin,
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
  store: string
  status: string
  items: number
  date: string
}

interface Notification {
  text: string
  time: string
  unread: boolean
}

const defaultStats: Stat[] = [
  { label: "Active Orders", value: "0", icon: ClipboardList, color: "text-blue-500" },
  { label: "Cart Items", value: "0", icon: ShoppingCart, color: "text-orange-500" },
  { label: "Prescriptions", value: "0", icon: Upload, color: "text-purple-500" },
  { label: "Completed", value: "0", icon: CheckCircle2, color: "text-green-500" },
]

function statusColor(status: string) {
  if (status === "Delivered" || status === "delivered") return "status-delivered font-bold"
  if (status === "In Transit" || status === "accepted") return "status-accepted font-bold"
  if (status === "Pending" || status === "pending") return "status-pending font-bold"
  if (status === "Rejected" || status === "rejected" || status === "Cancelled" || status === "cancelled") return "status-rejected font-bold"
  return "bg-slate-100 text-slate-600 font-semibold"
}

function getDisplayStatus(status: string): string {
  switch (status) {
    case "pending": return "Pending"
    case "accepted": return "In Transit"
    case "delivered": return "Delivered"
    case "rejected": return "Cancelled"
    default: return status
  }
}

export default function PatientHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stat[]>(defaultStats)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const response = await authFetch(`/api/patient/dashboard?patientId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch dashboard')
        const data = await response.json()
        
        setStats([
          { label: "Active Orders", value: data.activeOrders?.toString() || "0", icon: ClipboardList, color: "text-blue-500" },
          { label: "Cart Items", value: data.cartItems?.toString() || "0", icon: ShoppingCart, color: "text-orange-500" },
          { label: "Prescriptions", value: data.prescriptionCount?.toString() || "0", icon: Upload, color: "text-purple-500" },
          { label: "Completed", value: data.completedOrders?.toString() || "0", icon: CheckCircle2, color: "text-green-500" },
        ])
        
        // Transform recent orders
        const transformedOrders = (data.recentOrders || []).map((order: any) => ({
          id: `ORD-${order._id.slice(-6).toUpperCase()}`,
          store: order.acceptedBy?.shopName || 'Pending',
          status: getDisplayStatus(order.status),
          items: order.medicines?.length || 0,
          date: new Date(order.createdAt).toLocaleDateString()
        }))
        setRecentOrders(transformedOrders)
        
        // Transform notifications
        const transformedNotifications = (data.notifications || []).map((n: any) => ({
          text: n.message,
          time: new Date(n.createdAt).toLocaleTimeString(),
          unread: !n.read
        }))
        setNotifications(transformedNotifications)
        
        setUserName(user?.name || "")
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
      <div className="bg-gradient-to-r from-sky-100 via-cyan-50 to-transparent p-5 rounded-xl border-l-4 border-sky-400 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-800">
          {userName ? <>Welcome back, <span className="text-sky-500">{userName}</span></> : "Welcome to MediBridge"}
        </h2>
        <p className="text-slate-600 font-medium">{"Here's what's happening with your health today."}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, index) => (
          <Card key={s.label} className="card-elevated hover:shadow-lg hover:shadow-sky-100/50 transition-all hover:-translate-y-1">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${index === 0 ? 'bg-sky-100' : index === 1 ? 'bg-amber-100' : index === 2 ? 'bg-violet-100' : 'bg-emerald-100'}`}>
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
              <ClipboardList className="h-5 w-5 text-sky-500" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" asChild className="font-semibold border-sky-200 text-sky-600 hover:bg-sky-50">
              <Link href="/patient/orders">View All →</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No recent orders</p>
                <p className="text-xs text-slate-400">Your orders will appear here</p>
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
                      <span className="text-sm text-slate-500">
                        <span className="font-semibold">{order.store}</span> &middot; {order.items} items
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{order.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Bell className="h-5 w-5 text-amber-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No notifications</p>
                <p className="text-xs text-slate-400">Updates will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-6 py-4">
                    {n.unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    )}
                    {!n.unread && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm ${n.unread ? "font-medium text-slate-800" : "text-slate-500"}`}>
                        {n.text}
                      </span>
                      <span className="text-xs text-slate-400">{n.time}</span>
                    </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-violet-100 hover:-translate-y-1 hover:border-violet-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100">
                <Upload className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="font-bold text-slate-800">Upload Prescription</h3>
              <p className="text-sm text-slate-500">Upload a new prescription to get started</p>
              <Button asChild size="sm" className="mt-2 font-semibold bg-violet-500 hover:bg-violet-600 shadow-md shadow-violet-200">
                <Link href="/patient/prescription">Upload Now</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1 hover:border-emerald-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                <Pill className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-800">Search Medicines</h3>
              <p className="text-sm text-slate-500">Find medicines available at nearby stores</p>
              <Button asChild size="sm" variant="outline" className="mt-2 font-semibold border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                <Link href="/patient/medicines">Search</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-1 hover:border-sky-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100">
                <TrendingUp className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="font-bold text-slate-800">Track Orders</h3>
              <p className="text-sm text-slate-500">Check the status of your current orders</p>
              <Button asChild size="sm" variant="outline" className="mt-2 font-semibold border-sky-300 text-sky-600 hover:bg-sky-50">
                <Link href="/patient/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 bg-white shadow-md shadow-slate-100 transition-all hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-1 hover:border-rose-200">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100">
                <MapPin className="h-7 w-7 text-rose-500" />
              </div>
              <h3 className="font-bold text-slate-800">Nearby Shops</h3>
              <p className="text-sm text-slate-500">Find medical shops within 3 km</p>
              <Button asChild size="sm" variant="outline" className="mt-2 font-semibold border-rose-300 text-rose-600 hover:bg-rose-50">
                <Link href="/patient/nearby-shops">Find Shops</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


