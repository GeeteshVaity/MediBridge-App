"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2, Plus, Trash2, Send, IndianRupee, ChevronDown, ChevronUp, Check, Clock, User, X, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch } from "@/services/api"

interface OfferMedicine {
  medicineName: string
  brand: string
  quantity: number
  price: number
  available: boolean
}

interface MyOffer {
  _id: string
  medicines: OfferMedicine[]
  totalAmount: number
  deliveryFee: number
  status: string
}

interface Prescription {
  _id: string
  patientId: string
  patientName: string
  imageUrl: string
  imageData?: string
  status: string
  createdAt: string
  hasSubmittedOffer: boolean
  myOffer?: MyOffer
}

export default function ShopkeeperPrescriptionsPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  
  // Offer form state per prescription
  const [offerForms, setOfferForms] = useState<Record<string, {
    medicines: OfferMedicine[]
    deliveryFee: number
    notes: string
  }>>({})

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions()
    } else {
      setLoading(false)
    }
  }, [user])

  async function fetchPrescriptions() {
    try {
      const response = await authFetch(`/api/shop/prescriptions?shopId=${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch prescriptions')
      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  function initializeOfferForm(prescriptionId: string) {
    if (!offerForms[prescriptionId]) {
      setOfferForms(prev => ({
        ...prev,
        [prescriptionId]: {
          medicines: [{ medicineName: '', brand: '', quantity: 1, price: 0, available: true }],
          deliveryFee: 0,
          notes: ''
        }
      }))
    }
  }

  function updateMedicine(prescriptionId: string, index: number, field: keyof OfferMedicine, value: string | number | boolean) {
    setOfferForms(prev => {
      const form = prev[prescriptionId]
      const newMedicines = [...form.medicines]
      newMedicines[index] = { ...newMedicines[index], [field]: value }
      return { ...prev, [prescriptionId]: { ...form, medicines: newMedicines } }
    })
  }

  function addMedicine(prescriptionId: string) {
    setOfferForms(prev => {
      const form = prev[prescriptionId]
      return {
        ...prev,
        [prescriptionId]: {
          ...form,
          medicines: [...form.medicines, { medicineName: '', brand: '', quantity: 1, price: 0, available: true }]
        }
      }
    })
  }

  function removeMedicine(prescriptionId: string, index: number) {
    setOfferForms(prev => {
      const form = prev[prescriptionId]
      if (form.medicines.length <= 1) return prev
      const newMedicines = form.medicines.filter((_, i) => i !== index)
      return { ...prev, [prescriptionId]: { ...form, medicines: newMedicines } }
    })
  }

  function updateDeliveryFee(prescriptionId: string, value: number) {
    setOfferForms(prev => ({
      ...prev,
      [prescriptionId]: { ...prev[prescriptionId], deliveryFee: value }
    }))
  }

  function updateNotes(prescriptionId: string, value: string) {
    setOfferForms(prev => ({
      ...prev,
      [prescriptionId]: { ...prev[prescriptionId], notes: value }
    }))
  }

  function calculateTotal(prescriptionId: string): number {
    const form = offerForms[prescriptionId]
    if (!form) return 0
    const medicinesTotal = form.medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0)
    return medicinesTotal + form.deliveryFee
  }

  async function submitOffer(prescriptionId: string) {
    if (!user?.id) return
    const form = offerForms[prescriptionId]
    if (!form) return

    // Validate
    const validMedicines = form.medicines.filter(m => m.medicineName.trim() !== '')
    if (validMedicines.length === 0) {
      alert('Please add at least one medicine')
      return
    }

    setSubmitting(prescriptionId)
    try {
      const response = await authFetch('/api/shop/prescriptions/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          shopId: user.id,
          shopName: user.shopName || user.name,
          medicines: validMedicines,
          deliveryFee: form.deliveryFee,
          notes: form.notes
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit offer')
      }
      
      alert('Offer submitted successfully! The patient will be notified.')
      fetchPrescriptions()
    } catch (err) {
      console.error('Submit offer failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to submit offer')
    } finally {
      setSubmitting(null)
    }
  }

  function toggleExpand(prescriptionId: string) {
    if (expandedId === prescriptionId) {
      setExpandedId(null)
    } else {
      setExpandedId(prescriptionId)
      initializeOfferForm(prescriptionId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingPrescriptions = prescriptions.filter(p => !p.hasSubmittedOffer && p.status !== 'accepted')
  const submittedPrescriptions = prescriptions.filter(p => p.hasSubmittedOffer && p.myOffer?.status === 'pending')
  const acceptedPrescriptions = prescriptions.filter(p => p.hasSubmittedOffer && p.myOffer?.status === 'accepted')
  const rejectedPrescriptions = prescriptions.filter(p => p.hasSubmittedOffer && p.myOffer?.status === 'rejected')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
        <p className="text-muted-foreground">
          View patient prescriptions and send your price offers.
        </p>
      </div>

      {/* Pending Prescriptions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-chart-4" />
          Pending Prescriptions
          {pendingPrescriptions.length > 0 && (
            <Badge className="bg-chart-4/10 text-chart-4">{pendingPrescriptions.length}</Badge>
          )}
        </h3>

        {pendingPrescriptions.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium text-card-foreground">No pending prescriptions</p>
              <p className="text-sm text-muted-foreground">New prescriptions from patients will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingPrescriptions.map((prescription) => (
              <Card key={prescription._id} className="card-elevated">
                <CardContent className="p-0">
                  {/* Prescription Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpand(prescription._id)}
                  >
                    <div className="flex items-center gap-4">
                      {prescription.imageData && (
                        <img 
                          src={prescription.imageData} 
                          alt="Prescription" 
                          className="h-20 w-20 object-cover rounded-lg border"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground">
                            RX-{prescription._id.slice(-6).toUpperCase()}
                          </p>
                          <Badge className="bg-chart-4/10 text-chart-4">New</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          <span>{prescription.patientName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(prescription.createdAt).toLocaleDateString()} at{' '}
                          {new Date(prescription.createdAt).toLocaleTimeString()}
                        </p>
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

                  {/* Expanded - Offer Form */}
                  {expandedId === prescription._id && offerForms[prescription._id] && (
                    <div className="border-t p-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Prescription Image */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Prescription Image</Label>
                          {prescription.imageData && (
                            <img 
                              src={prescription.imageData} 
                              alt="Prescription" 
                              className="w-full h-auto max-h-96 object-contain rounded-lg border"
                            />
                          )}
                        </div>

                        {/* Offer Form */}
                        <div>
                          <Label className="text-sm font-medium mb-3 block">Your Offer</Label>
                          <div className="space-y-4">
                            {/* Medicines List */}
                            {offerForms[prescription._id].medicines.map((medicine, index) => (
                              <div key={index} className="border rounded-lg p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Medicine {index + 1}</span>
                                  {offerForms[prescription._id].medicines.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() => removeMedicine(prescription._id, index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Medicine Name</Label>
                                    <Input
                                      placeholder="e.g., Paracetamol"
                                      value={medicine.medicineName}
                                      onChange={(e) => updateMedicine(prescription._id, index, 'medicineName', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Brand</Label>
                                    <Input
                                      placeholder="e.g., Crocin"
                                      value={medicine.brand}
                                      onChange={(e) => updateMedicine(prescription._id, index, 'brand', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Quantity</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={medicine.quantity}
                                      onChange={(e) => updateMedicine(prescription._id, index, 'quantity', parseInt(e.target.value) || 1)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Price (₹)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={medicine.price}
                                      onChange={(e) => updateMedicine(prescription._id, index, 'price', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`available-${prescription._id}-${index}`}
                                    checked={medicine.available}
                                    onChange={(e) => updateMedicine(prescription._id, index, 'available', e.target.checked)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`available-${prescription._id}-${index}`} className="text-xs">
                                    In Stock
                                  </Label>
                                </div>
                              </div>
                            ))}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addMedicine(prescription._id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Medicine
                            </Button>

                            {/* Delivery Fee */}
                            <div>
                              <Label className="text-xs">Delivery Fee (₹)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={offerForms[prescription._id].deliveryFee}
                                onChange={(e) => updateDeliveryFee(prescription._id, parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            {/* Notes */}
                            <div>
                              <Label className="text-xs">Notes (Optional)</Label>
                              <Textarea
                                placeholder="Any additional notes for the patient..."
                                value={offerForms[prescription._id].notes}
                                onChange={(e) => updateNotes(prescription._id, e.target.value)}
                                className="h-20"
                              />
                            </div>

                            {/* Total */}
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Amount</span>
                              <span className="text-xl font-bold text-primary flex items-center">
                                <IndianRupee className="h-5 w-5" />
                                {calculateTotal(prescription._id).toFixed(2)}
                              </span>
                            </div>

                            {/* Submit Button */}
                            <Button
                              className="w-full"
                              onClick={() => submitOffer(prescription._id)}
                              disabled={submitting === prescription._id}
                            >
                              {submitting === prescription._id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              {submitting === prescription._id ? 'Submitting...' : 'Send Offer to Patient'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Offers */}
      {submittedPrescriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Awaiting Patient Response
            <Badge className="bg-primary/10 text-primary">{submittedPrescriptions.length}</Badge>
          </h3>
          <div className="flex flex-col gap-4">
            {submittedPrescriptions.map((prescription) => (
              <Card key={prescription._id} className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                          <Badge className="bg-primary/10 text-primary">Pending</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{prescription.patientName}</span>
                        </div>
                        {prescription.myOffer && (
                          <p className="text-sm font-medium text-primary mt-1">
                            Your offer: ₹{(prescription.myOffer.totalAmount + prescription.myOffer.deliveryFee).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Offers */}
      {acceptedPrescriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            Accepted Offers
            <Badge className="bg-accent/10 text-accent">{acceptedPrescriptions.length}</Badge>
          </h3>
          <div className="flex flex-col gap-4">
            {acceptedPrescriptions.map((prescription) => (
              <Card key={prescription._id} className="border-accent/30 border bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                          <Badge className="bg-accent/10 text-accent">
                            <Check className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{prescription.patientName}</span>
                        </div>
                        {prescription.myOffer && (
                          <p className="text-sm font-medium text-accent mt-1">
                            Order total: ₹{(prescription.myOffer.totalAmount + prescription.myOffer.deliveryFee).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Please prepare the order</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Offers */}
      {rejectedPrescriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            Not Selected
            <Badge variant="secondary">{rejectedPrescriptions.length}</Badge>
          </h3>
          <div className="flex flex-col gap-4">
            {rejectedPrescriptions.map((prescription) => (
              <Card key={prescription._id} className="border bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {prescription.imageData && (
                        <img 
                          src={prescription.imageData} 
                          alt="Prescription" 
                          className="h-16 w-16 object-cover rounded-lg border opacity-60"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-muted-foreground">
                            RX-{prescription._id.slice(-6).toUpperCase()}
                          </p>
                          <Badge variant="secondary" className="text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Not Selected
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{prescription.patientName}</span>
                        </div>
                        {prescription.myOffer && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Your offer was: ₹{(prescription.myOffer.totalAmount + prescription.myOffer.deliveryFee).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Patient chose another offer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


