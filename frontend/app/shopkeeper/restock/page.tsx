"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Send, Package, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch } from "@/services/api"

interface RestockRequest {
  id: string
  medicine: string
  quantity: number
  status: "Delivered" | "In Transit" | "Pending"
  date: string
}

interface LowStockItem {
  name: string
  current: number
  recommended: number
}

function statusBadge(status: string) {
  switch (status) {
    case "Delivered":
    case "fulfilled":
      return <Badge variant="secondary" className="bg-accent/10 text-accent">Delivered</Badge>
    case "In Transit":
    case "in-progress":
      return <Badge variant="secondary" className="bg-primary/10 text-primary">In Transit</Badge>
    default:
      return <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">Pending</Badge>
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "Delivered":
    case "fulfilled":
      return <CheckCircle2 className="h-4 w-4 text-accent" />
    case "In Transit":
    case "in-progress":
      return <Package className="h-4 w-4 text-primary" />
    default:
      return <Clock className="h-4 w-4 text-chart-4" />
  }
}

export default function RestockPage() {
  const { user } = useAuth()
  const [restockHistory, setRestockHistory] = useState<RestockRequest[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    medicine: "",
    quantity: "",
    priority: "normal",
    notes: ""
  })

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const [restockRes, lowStockRes] = await Promise.all([
          authFetch(`/api/shop/restock?shopId=${user.id}`),
          authFetch(`/api/shop/inventory/low-stock?shopId=${user.id}`)
        ])
        
        if (!restockRes.ok || !lowStockRes.ok) throw new Error('Failed to fetch data')
        
        const [restockData, lowStockData] = await Promise.all([
          restockRes.json(),
          lowStockRes.json()
        ])
        
        // Transform restock history
        const transformedHistory = (restockData.restockRequests || []).map((r: any) => ({
          id: r._id.slice(-6).toUpperCase(),
          medicine: r.medicineName,
          quantity: r.quantity,
          status: r.status === 'delivered' || r.status === 'fulfilled' ? 'Delivered' :
                  r.status === 'in-transit' || r.status === 'in-progress' ? 'In Transit' : 'Pending',
          date: new Date(r.createdAt).toLocaleDateString()
        }))
        setRestockHistory(transformedHistory)
        
        // Transform low stock items
        const transformedLowStock = (lowStockData.lowStockItems || []).map((item: any) => ({
          name: item.medicineName,
          current: item.quantity,
          recommended: 50
        }))
        setLowStockItems(transformedLowStock)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.medicine || !formData.quantity || !user?.id) return
    
    setSubmitting(true)
    try {
      const response = await authFetch('/api/shop/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: user.id,
          medicineName: formData.medicine,
          quantity: parseInt(formData.quantity),
          priority: formData.priority,
          notes: formData.notes || undefined
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit request')
      }
      setSubmitted(true)
      setFormData({ medicine: "", quantity: "", priority: "normal", notes: "" })
    } catch (err) {
      console.error('Failed to submit restock request:', err)
      alert(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuickRestock(item: LowStockItem) {
    if (!user?.id) return
    try {
      const response = await authFetch('/api/shop/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: user.id,
          medicineName: item.name,
          quantity: item.recommended - item.current,
          priority: 'normal'
        })
      })
      if (!response.ok) throw new Error('Failed to submit quick restock')
      alert(`Restock request submitted for ${item.name}`)
    } catch (err) {
      console.error('Failed to submit quick restock:', err)
      alert('Failed to submit restock request')
    }
  }

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
        <h2 className="text-2xl font-bold text-foreground">Restock Requests</h2>
        <p className="text-muted-foreground">Request stock replenishment for low-inventory items.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Request Form */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">New Restock Request</CardTitle>
            <CardDescription>Fill in the details to request a restock.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <CheckCircle2 className="h-7 w-7 text-accent" />
                </div>
                <p className="font-medium text-card-foreground">Request Submitted!</p>
                <p className="text-sm text-muted-foreground">Your restock request is being processed.</p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="restockMed">Medicine Name</Label>
                  <Input 
                    id="restockMed" 
                    placeholder="e.g. Cetirizine 10mg" 
                    required 
                    value={formData.medicine}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicine: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="restockQty">Quantity Needed</Label>
                    <Input 
                      id="restockQty" 
                      type="number" 
                      placeholder="50" 
                      required 
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="restockPriority">Priority</Label>
                    <select
                      id="restockPriority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="urgent">Urgent</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="restockNotes">Notes (Optional)</Label>
                  <Input 
                    id="restockNotes" 
                    placeholder="Any additional notes..." 
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Suggestions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <RefreshCw className="h-4 w-4 text-primary" />
              Suggested Restocks
            </CardTitle>
            <CardDescription>Items running low that need attention.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-10 w-10 text-accent mb-2" />
                <p className="text-sm text-muted-foreground">All items are well stocked!</p>
              </div>
            ) : (
              <div className="divide-y">
                {lowStockItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {item.current} &middot; Recommended: {item.recommended}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleQuickRestock(item)}>
                      <RefreshCw className="h-3 w-3" />
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restock History */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">Restock History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {restockHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No restock history yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {restockHistory.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {statusIcon(r.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {r.id} - {r.medicine}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.quantity} units &middot; {r.date}
                      </p>
                    </div>
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


