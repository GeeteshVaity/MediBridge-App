"use client"

import { useState, useEffect } from "react"
import { Upload, CheckCircle2, X, Loader2, FileText, Store, Clock, Check, IndianRupee, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/services/api"

interface OfferMedicine {
  medicineName: string
  brand?: string
  quantity: number
  price: number
  available: boolean
}

interface Offer {
  _id: string
  shopId: string
  shopName: string
  medicines: OfferMedicine[]
  totalAmount: number
  deliveryFee: number
  notes?: string
  status: string
  createdAt: string
}

interface Prescription {
  _id: string
  patientName: string
  imageUrl: string
  imageData?: string
  status: string
  createdAt: string
  offersCount: number
  offers: Offer[]
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-chart-4/10 text-chart-4">Waiting for Offers</Badge>
    case 'offers-received':
      return <Badge className="bg-primary/10 text-primary">Offers Received</Badge>
    case 'accepted':
      return <Badge className="bg-accent/10 text-accent">Order Placed</Badge>
    case 'completed':
      return <Badge className="bg-accent/10 text-accent">Completed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function PrescriptionPage() {
  const { user } = useAuth()
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions()
    } else {
      setLoading(false)
    }
  }, [user])

  async function fetchPrescriptions() {
    try {
      const response = await api.get('/patient/prescriptions', {
        params: { patientId: user?.id }
      })
      setPrescriptions(response.data.prescriptions || [])
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function processFile(file: File) {
    setUploaded(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function clearUpload() {
    setUploaded(null)
    setImagePreview(null)
  }

  async function handleSubmit() {
    if (!uploaded || !user?.id || !imagePreview) return

    setUploading(true)
    try {
      const response = await api.post('/patient/prescriptions', {
        patientId: user.id,
        patientName: user.name,
        imageUrl: uploaded,
        imageData: imagePreview,
      })

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Upload failed')
      }

      alert(`Prescription sent to ${response.data.notifiedShops || 'nearby'} medical shops! You'll receive offers soon.`)
      clearUpload()
      fetchPrescriptions()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  async function acceptOffer(offerId: string) {
    if (!user?.id) return

    const prescriptionId = prescriptions.find((prescription) =>
      prescription.offers.some((offer) => offer._id === offerId)
    )?._id

    if (!prescriptionId) {
      alert('Prescription not found for this offer.')
      return
    }

    setAcceptingOffer(offerId)
    try {
      const response = await api.post('/patient/prescriptions/accept-offer', {
        prescriptionId,
        offerId,
        patientId: user.id,
      })
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data?.error || 'Failed to accept offer')
      }

      alert('Order placed successfully! The shop will prepare your medicines.')
      fetchPrescriptions()
    } catch (err) {
      console.error('Accept offer failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to accept offer')
    } finally {
      setAcceptingOffer(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Prescription</h2>
        <p className="text-muted-foreground">
          Upload your prescription and receive offers from nearby medical shops.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}
          >
            {uploaded ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                {imagePreview && !imagePreview.includes('application/pdf') && (
                  <img 
                    src={imagePreview} 
                    alt="Prescription preview" 
                    className="w-full max-w-xs h-auto max-h-48 object-contain rounded-lg border"
                  />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <p className="font-medium text-card-foreground">{uploaded}</p>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={uploading}>
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Store className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? 'Sending...' : 'Send to Medical Shops'}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={clearUpload}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label htmlFor="prescriptionUpload" className="flex cursor-pointer flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">
                    Drag & drop your prescription here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse (JPG, PNG, PDF)
                  </p>
                </div>
                <Button size="sm" variant="outline" className="mt-2" type="button">
                  Browse Files
                </Button>
                <input
                  id="prescriptionUpload"
                  type="file"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
            <div>
              <p className="font-medium text-sm">Upload Prescription</p>
              <p className="text-xs text-muted-foreground">Take a photo or upload your prescription</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
            <div>
              <p className="font-medium text-sm">Receive Offers</p>
              <p className="text-xs text-muted-foreground">Medical shops will send you price offers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
            <div>
              <p className="font-medium text-sm">Choose & Order</p>
              <p className="text-xs text-muted-foreground">Accept the best offer and get your medicines</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Prescriptions</h3>
        {prescriptions.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium text-card-foreground">No prescriptions yet</p>
              <p className="text-sm text-muted-foreground">Upload your first prescription above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {prescriptions.map((prescription) => (
              <Card key={prescription._id} className="card-elevated">
                <CardContent className="p-0">
                  {/* Prescription Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(expandedId === prescription._id ? null : prescription._id)}
                  >
                    <div className="flex items-center gap-4">
                      {prescription.imageData && (
                        <img 
                          src={prescription.imageData} 
                          alt="Prescription" 
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground">
                            RX-{prescription._id.slice(-6).toUpperCase()}
                          </p>
                          {statusBadge(prescription.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                        {prescription.offers.filter(o => o.status === 'pending').length > 0 && prescription.status !== 'accepted' && (
                          <p className="text-sm text-primary font-medium">
                            {prescription.offers.filter(o => o.status === 'pending').length} offer{prescription.offers.filter(o => o.status === 'pending').length > 1 ? 's' : ''} received
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedId === prescription._id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Content - Offers */}
                  {expandedId === prescription._id && (
                    <div className="border-t px-4 pb-4">
                      {prescription.status === 'accepted' ? (
                        <div className="pt-4">
                          <div className="flex items-center gap-2 text-accent mb-3">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">Order Placed</span>
                          </div>
                          {prescription.offers.filter(o => o.status === 'accepted').map((offer) => (
                            <div key={offer._id} className="bg-accent/5 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4 text-accent" />
                                  <span className="font-medium">{offer.shopName}</span>
                                </div>
                                <Badge className="bg-accent/10 text-accent">Accepted</Badge>
                              </div>
                              <div className="space-y-1">
                                {offer.medicines.map((med, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {med.medicineName} {med.brand && `(${med.brand})`} x{med.quantity}
                                    </span>
                                    <span>₹{(med.price * med.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                                {offer.deliveryFee > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>₹{offer.deliveryFee.toFixed(2)}</span>
                                  </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-semibold">
                                  <span>Total</span>
                                  <span className="text-accent">₹{(offer.totalAmount + offer.deliveryFee).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : prescription.offers.filter(o => o.status === 'pending').length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center">
                          <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="font-medium text-card-foreground">Waiting for offers</p>
                          <p className="text-sm text-muted-foreground">
                            Medical shops are reviewing your prescription
                          </p>
                        </div>
                      ) : (
                        <div className="pt-4 space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Compare offers and choose the best one:
                          </p>
                          {prescription.offers.filter(o => o.status === 'pending').map((offer) => (
                            <div 
                              key={offer._id} 
                              className="border rounded-lg p-4 hover:border-primary transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{offer.shopName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="h-4 w-4 text-primary" />
                                  <span className="text-lg font-bold text-primary">
                                    {(offer.totalAmount + offer.deliveryFee).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-1 mb-3">
                                {offer.medicines.map((med, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {med.medicineName} {med.brand && `(${med.brand})`} x{med.quantity}
                                      {!med.available && <Badge variant="destructive" className="ml-2 text-xs">Unavailable</Badge>}
                                    </span>
                                    <span>₹{(med.price * med.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                                {offer.deliveryFee > 0 && (
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Delivery Fee</span>
                                    <span>₹{offer.deliveryFee.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                              
                              {offer.notes && (
                                <p className="text-xs text-muted-foreground mb-3 italic">
                                  Note: {offer.notes}
                                </p>
                              )}
                              
                              <Button 
                                className="w-full"
                                onClick={() => acceptOffer(offer._id)}
                                disabled={acceptingOffer === offer._id}
                              >
                                {acceptingOffer === offer._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                )}
                                {acceptingOffer === offer._id ? 'Processing...' : 'Accept Offer & Order'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


