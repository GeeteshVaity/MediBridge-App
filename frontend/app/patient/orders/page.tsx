"use client"

import { useState, useEffect } from "react"
import { Package, CheckCircle2, Clock, Truck, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"

interface OrderItem {
  name: string
  qty: number
  price: number
}

interface Order {
  id: string
  store: string
  date: string
  status: string
  progress: number
  items: OrderItem[]
  total: number
}

function statusIcon(status: string) {
  switch (status) {
    case "Delivered":
    case "delivered":
      return <CheckCircle2 className="h-4 w-4 text-accent" />
    case "In Transit":
    case "in-transit":
      return <Truck className="h-4 w-4 text-primary" />
    case "Processing":
    case "accepted":
      return <Clock className="h-4 w-4 text-chart-4" />
    case "Cancelled":
    case "rejected":
      return <XCircle className="h-4 w-4 text-destructive" />
    default:
      return <Package className="h-4 w-4 text-muted-foreground" />
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Delivered":
    case "delivered":
      return "status-delivered font-bold"
    case "In Transit":
    case "in-transit":
    case "Processing":
    case "accepted":
      return "status-accepted font-bold"
    case "Cancelled":
    case "rejected":
      return "status-rejected font-bold"
    case "Pending":
    case "pending":
      return "status-pending font-bold"
    default:
      return "bg-slate-100 text-slate-600 font-semibold"
  }
}

function getDisplayStatus(status: string): string {
  switch (status) {
    case "pending": return "Pending"
    case "accepted": return "Processing"
    case "delivered": return "Delivered"
    case "rejected": return "Cancelled"
    default: return status
  }
}

function getProgress(status: string): number {
  switch (status) {
    case "pending": return 25
    case "accepted": return 50
    case "in-transit": return 75
    case "delivered": return 100
    case "rejected": return 0
    default: return 0
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/patient/orders?patientId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        const transformedOrders = data.orders.map((order: any) => ({
          id: `ORD-${order._id.slice(-6).toUpperCase()}`,
          store: order.acceptedBy?.shopName || 'Pending Assignment',
          date: new Date(order.createdAt).toLocaleDateString(),
          status: getDisplayStatus(order.status),
          progress: getProgress(order.status),
          items: order.medicines.map((m: any) => ({
            name: m.medicineName,
            qty: m.quantity,
            price: m.price || 0
          })),
          total: order.medicines.reduce((sum: number, m: any) => sum + (m.price || 0) * m.quantity, 0)
        }))
        setOrders(transformedOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive mb-2">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-primary underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Orders</h2>
        <p className="text-muted-foreground">Track and manage all your medicine orders.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium text-card-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground">Your orders will appear here once you place them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="card-elevated">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-semibold text-card-foreground">
                      {order.id}
                    </CardTitle>
                    <Badge variant="secondary" className={statusColor(order.status)}>
                      <span className="mr-1 flex items-center">{statusIcon(order.status)}</span>
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{order.date}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Store: <span className="font-medium text-card-foreground">{order.store}</span>
                </p>

                {/* Order progress */}
                {order.status !== "Cancelled" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Order Progress</span>
                      <span>{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                )}

                {/* Items */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.qty}
                        </span>
                        <span className="text-card-foreground">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
                    <span className="text-card-foreground">Total</span>
                    <span className="text-primary">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


