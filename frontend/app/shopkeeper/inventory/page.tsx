"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Loader2, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch } from "@/services/api"

interface Medicine {
  id: string
  name: string
  brand: string
  quantity: number
  price: number
  expiry: string
  category: string
}

function stockBadge(qty: number) {
  if (qty <= 10) return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Critical</Badge>
  if (qty <= 30) return <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">Low</Badge>
  return <Badge variant="secondary" className="bg-accent/10 text-accent">In Stock</Badge>
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    brand: "",
    category: "",
    quantity: "",
    price: "",
    expiry: ""
  })

  useEffect(() => {
    async function fetchInventory() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const response = await authFetch(`/api/shop/inventory/get?shopId=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch inventory')
        const data = await response.json()
        // Transform backend data to frontend format
        const transformedInventory = data.inventory.map((item: any) => ({
          id: item._id,
          name: item.medicineName,
          brand: item.brand || 'Generic',
          quantity: item.quantity,
          price: item.price || 0,
          expiry: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
          category: item.category || 'General'
        }))
        setInventory(transformedInventory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [user])

  const filtered = inventory.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    try {
      const response = await authFetch(`/api/shop/inventory?inventoryId=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete item')
      setInventory((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('Failed to delete item:', err)
      alert('Failed to delete item')
    }
  }

  async function handleAddMedicine() {
    if (!newMedicine.name || !newMedicine.quantity) {
      alert('Please fill in all required fields')
      return
    }

    if (!user?.id) {
      alert('Please login first')
      return
    }

    try {
      const response = await authFetch('/api/shop/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: user.id,
          medicineName: newMedicine.name,
          quantity: parseInt(newMedicine.quantity),
          expiryDate: newMedicine.expiry || undefined,
          brand: newMedicine.brand || 'Generic',
          price: parseFloat(newMedicine.price) || 0,
          category: newMedicine.category || 'General'
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add medicine')
      }
      const data = await response.json()
      const newItem: Medicine = {
        id: data.inventory._id,
        name: data.inventory.medicineName,
        brand: data.inventory.brand || 'Generic',
        quantity: data.inventory.quantity,
        price: data.inventory.price || 0,
        expiry: data.inventory.expiryDate ? new Date(data.inventory.expiryDate).toISOString().split('T')[0] : '',
        category: data.inventory.category || 'General'
      }
      setInventory(prev => [...prev, newItem])
      setNewMedicine({ name: "", brand: "", category: "", quantity: "", price: "", expiry: "" })
      setDialogOpen(false)
    } catch (err) {
      console.error('Failed to add medicine:', err)
      alert(err instanceof Error ? err.message : 'Failed to add medicine')
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your medicine stock and pricing.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="medName">Medicine Name</Label>
                <Input 
                  id="medName" 
                  placeholder="e.g. Paracetamol 500mg" 
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medBrand">Brand</Label>
                  <Input 
                    id="medBrand" 
                    placeholder="e.g. Calpol" 
                    value={newMedicine.brand}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medCategory">Category</Label>
                  <Input 
                    id="medCategory" 
                    placeholder="e.g. Pain Relief" 
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medQty">Quantity</Label>
                  <Input 
                    id="medQty" 
                    type="number" 
                    placeholder="0" 
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medPrice">Price ($)</Label>
                  <Input 
                    id="medPrice" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medExpiry">Expiry Date</Label>
                  <Input 
                    id="medExpiry" 
                    type="date" 
                    value={newMedicine.expiry}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, expiry: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddMedicine}>Add Medicine</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="card-elevated">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.category}</TableCell>
                    <TableCell className="text-right font-medium text-card-foreground">{m.quantity}</TableCell>
                    <TableCell>{stockBadge(m.quantity)}</TableCell>
                    <TableCell className="text-right text-card-foreground">₹{m.price.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{m.expiry}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No medicines found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


