"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Check, Loader2, PackagePlus, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"

interface MedicineRequest {
  id: string
  medicineName: string
  patientName: string
  status: string
  createdAt: string
  fulfilledBy?: {
    shopName: string
  }
}

export default function MedicineRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<MedicineRequest[]>([])
  const [fulfilledRequests, setFulfilledRequests] = useState<MedicineRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fulfillingIds, setFulfillingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      // Fetch pending requests
      const pendingResponse = await fetch('/api/medicine-requests?status=pending')
      if (!pendingResponse.ok) throw new Error('Failed to fetch requests')
      const pendingData = await pendingResponse.json()
      
      const transformedPending = (pendingData.requests || []).map((r: any) => ({
        id: r._id,
        medicineName: r.medicineName,
        patientName: r.patientName,
        status: r.status,
        createdAt: new Date(r.createdAt).toLocaleDateString(),
      }))
      setRequests(transformedPending)

      // Fetch fulfilled requests
      const fulfilledResponse = await fetch('/api/medicine-requests?status=fulfilled')
      if (!fulfilledResponse.ok) throw new Error('Failed to fetch fulfilled requests')
      const fulfilledData = await fulfilledResponse.json()
      
      const transformedFulfilled = (fulfilledData.requests || []).map((r: any) => ({
        id: r._id,
        medicineName: r.medicineName,
        patientName: r.patientName,
        status: r.status,
        createdAt: new Date(r.createdAt).toLocaleDateString(),
        fulfilledBy: r.fulfilledBy ? { shopName: r.fulfilledBy.shopName } : undefined,
      }))
      setFulfilledRequests(transformedFulfilled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleFulfill(requestId: string, medicineName: string) {
    if (!user?.id) {
      alert('Please login first')
      return
    }

    setFulfillingIds(prev => new Set(prev).add(requestId))
    
    try {
      const response = await fetch('/api/medicine-requests/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          shopId: user.id,
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fulfill request')
      }

      alert(`Great! You've marked "${medicineName}" as available. The patient has been notified!`)
      
      // Refresh the list
      await fetchRequests()
    } catch (err) {
      console.error('Failed to fulfill request:', err)
      alert(err instanceof Error ? err.message : 'Failed to fulfill request')
    } finally {
      setFulfillingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
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
        <h2 className="text-2xl font-bold text-foreground">Medicine Requests</h2>
        <p className="text-muted-foreground">
          Patients are looking for these medicines. Stock them to grow your business!
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="fulfilled" className="gap-2">
            <Check className="h-4 w-4" />
            Fulfilled ({fulfilledRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {requests.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium text-card-foreground">No pending requests</p>
                <p className="text-sm text-muted-foreground">
                  When patients request unavailable medicines, they'll appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => {
                const isFulfilling = fulfillingIds.has(request.id)
                return (
                  <Card key={request.id} className="card-elevated">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {request.medicineName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Requested by {request.patientName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">
                            <Clock className="h-3 w-3 mr-1" />
                            {request.createdAt}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => handleFulfill(request.id, request.medicineName)}
                            disabled={isFulfilling}
                            className="gap-1"
                          >
                            {isFulfilling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PackagePlus className="h-4 w-4" />
                            )}
                            {isFulfilling ? 'Processing...' : 'I Have This'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fulfilled" className="mt-6">
          {fulfilledRequests.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium text-card-foreground">No fulfilled requests yet</p>
                <p className="text-sm text-muted-foreground">
                  Fulfilled requests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fulfilledRequests.map((request) => (
                <Card key={request.id} className="card-elevated">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <Check className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-card-foreground">
                            {request.medicineName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Requested by {request.patientName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          <Check className="h-3 w-3 mr-1" />
                          Fulfilled
                        </Badge>
                        {request.fulfilledBy && (
                          <span className="text-xs text-muted-foreground">
                            by {request.fulfilledBy.shopName}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


