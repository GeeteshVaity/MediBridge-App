"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, ShoppingBag, AlertTriangle, Package, Info, Loader2, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface Notification {
  id: string
  type: "order" | "stock" | "system" | "restock" | "prescription"
  title: string
  message: string
  time: string
  read: boolean
}

function typeIcon(type: string) {
  switch (type) {
    case "order":
      return <ShoppingBag className="h-5 w-5 text-primary" />
    case "stock":
      return <AlertTriangle className="h-5 w-5 text-chart-4" />
    case "restock":
      return <Package className="h-5 w-5 text-accent" />
    case "prescription":
      return <FileText className="h-5 w-5 text-primary" />
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        const transformedNotifications = data.notifications.map((n: any) => ({
          id: n._id,
          type: n.type || 'system',
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleString(),
          read: n.read
        }))
        setNotifications(transformedNotifications)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [user])

  async function markAllRead() {
    if (!user?.id) return
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length === 0) return
      
      await Promise.all(
        unreadIds.map(id =>
          fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id })
          })
        )
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium text-card-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`card-elevated transition-colors ${!n.read ? "border-primary/20 bg-primary/[0.02]" : ""}`}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${!n.read ? "text-card-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


