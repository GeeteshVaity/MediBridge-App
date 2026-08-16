"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import api from "@/services/api"

export default function CartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, loading, operationLoading, updateQuantity, removeFromCart, clearCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    if (items.length === 0 || !user?.id) return
    
    setCheckingOut(true)
    try {
      const response = await api.post('/patient/create-order', {
        patientId: user.id,
        medicines: items.map(item => ({
          medicineName: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data?.error || 'Failed to create order')
      }

      // Clear the cart after successful order
      await clearCart()
      
      alert('Order placed successfully!')
      router.push('/patient/orders')
    } catch (err) {
      console.error('Checkout failed:', err)
      alert(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = items.length > 0 ? 2.00 : 0
  const total = subtotal + deliveryFee

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Cart</h2>
        <p className="text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-card-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add medicines to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const isUpdating = operationLoading === `update-${item.id}` || operationLoading === `update-${item.inventoryId}`
              const isRemoving = operationLoading === `remove-${item.id}` || operationLoading === `remove-${item.inventoryId}`
              
              return (
                <Card key={item.id} className="card-elevated">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <p className="mt-1 font-medium text-primary">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          disabled={isUpdating || isRemoving}
                          onClick={() => updateQuantity(item.id, item.name, item.quantity - 1)}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-card-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          disabled={isUpdating || isRemoving}
                          onClick={() => updateQuantity(item.id, item.name, item.quantity + 1)}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isRemoving || isUpdating}
                        onClick={() => removeFromCart(item.id, item.name)}
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Order Summary */}
        <Card className="h-fit border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-card-foreground">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-card-foreground">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-card-foreground">Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
            <Button className="mt-2 w-full" size="lg" disabled={items.length === 0 || checkingOut || operationLoading !== null} onClick={handleCheckout}>
              {checkingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {checkingOut ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


