"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckCircle2, XCircle, Clock, User, Package, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch } from "@/services/api"

interface OrderItem {
  name: string
  qty: number
  price: number
}

interface Order {
  id: string
  orderId: string
  patient: string
  items: OrderItem[]
  total: number
  status: "Pending" | "Accepted" | "Rejected"
  timeLeft: number // seconds
  date: string
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function timerColor(seconds: number) {
  if (seconds <= 60) return "text-destructive"
  if (seconds <= 180) return "text-chart-4"
  return "text-primary"
}

export default function IncomingOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      // Fetch both pending and accepted orders
      const [pendingRes, acceptedRes] = await Promise.all([
        authFetch(`/api/shop/orders/pending?shopId=${user.id}`),
        authFetch(`/api/shop/orders/accepted?shopId=${user.id}`)
      ])
      
      if (!pendingRes.ok || !acceptedRes.ok) throw new Error('Failed to fetch orders')
      
      const [pendingData, acceptedData] = await Promise.all([
        pendingRes.json(),
        acceptedRes.json()
      ])
      
      // Transform pending orders
      const pendingOrders = pendingData.orders.map((order: any) => ({
        id: order._id,
        orderId: `ORD-${order._id.slice(-6).toUpperCase()}`,
        patient: order.patientId?.name || 'Unknown Patient',
        items: order.medicines.map((m: any) => ({
          name: m.medicineName,
          qty: m.quantity,
          price: m.price || 0
        })),
        total: order.medicines.reduce((sum: number, m: any) => sum + (m.price || 0) * m.quantity, 0),
        status: "Pending" as const,
        timeLeft: Math.max(0, Math.floor((new Date(order.createdAt).getTime() + 10 * 60 * 1000 - Date.now()) / 1000)),
        date: new Date(order.createdAt).toLocaleDateString()
      }))
      
      // Transform accepted/rejected orders
      const resolvedOrders = acceptedData.orders.map((order: any) => ({
        id: order._id,
        orderId: `ORD-${order._id.slice(-6).toUpperCase()}`,
        patient: order.patientId?.name || 'Unknown Patient',
        items: order.medicines.map((m: any) => ({
          name: m.medicineName,
          qty: m.quantity,
          price: m.price || 0
        })),
        total: order.medicines.reduce((sum: number, m: any) => sum + (m.price || 0) * m.quantity, 0),
        status: order.status === 'accepted' ? "Accepted" as const : 
                order.status === 'rejected' ? "Rejected" as const : "Accepted" as const,
        timeLeft: 0,
        date: new Date(order.createdAt).toLocaleDateString()
      }))
      
      setOrders([...pendingOrders, ...resolvedOrders])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const tick = useCallback(() => {
    setOrders((prev) =>
      prev.map((o) =>
        o.status === "Pending" && o.timeLeft > 0
          ? { ...o, timeLeft: o.timeLeft - 1 }
          : o
      )
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tick])

  async function handleAccept(id: string) {
    if (!user?.id) return
    try {
      const response = await authFetch('/api/shop/accept-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, shopId: user.id })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to accept order')
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "Accepted" } : o))
      )
    } catch (err) {
      console.error('Failed to accept order:', err)
      alert(err instanceof Error ? err.message : 'Failed to accept order')
    }
  }

  async function handleReject(id: string) {
    try {
      // For now, just update local state - can add reject API later
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "Rejected" } : o))
      )
    } catch (err) {
      console.error('Failed to reject order:', err)
    }
  }

  const pending = orders.filter((o) => o.status === "Pending")
  const resolved = orders.filter((o) => o.status !== "Pending")

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
        <h2 className="text-2xl font-bold text-foreground">Incoming Orders</h2>
        <p className="text-muted-foreground">
          Review and respond to patient orders in real time.
        </p>
      </div>

      {/* Pending Orders */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Pending ({pending.length})
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((order) => (
              <Card
                key={order.id}
                className={`card-elevated ${
                  order.timeLeft <= 60 ? "border-destructive/30" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-card-foreground">
                      {order.orderId}
                    </CardTitle>
                    <div className={`flex items-center gap-1 text-sm font-bold ${timerColor(order.timeLeft)}`}>
                      <Clock className="h-4 w-4" />
                      {order.timeLeft > 0 ? formatTime(order.timeLeft) : "Expired"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {order.patient}
                    <span className="text-xs">&middot; {order.date}</span>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
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
                    <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
                      <span className="text-card-foreground">Total</span>
                      <span className="text-primary">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      onClick={() => handleAccept(order.id)}
                      disabled={order.timeLeft === 0}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleReject(order.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Orders */}
      {resolved.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Resolved ({resolved.length})
          </h3>
          <div className="flex flex-col gap-3">
            {resolved.map((order) => (
              <Card key={order.id} className="card-elevated">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        order.status === "Accepted"
                          ? "bg-emerald-100"
                          : "bg-rose-100"
                      }`}
                    >
                      {order.status === "Accepted" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{order.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.map(i => i.name).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.patient} &middot; ₹{order.total.toFixed(2)} &middot; {order.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      order.status === "Accepted"
                        ? "status-accepted font-bold"
                        : "status-rejected font-bold"
                    }
                  >
                    {order.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && resolved.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-card-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground">New orders will appear here in real time</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


