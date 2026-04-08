"use client"

import { useState, useEffect } from "react"
import { MapPin, Save, Loader2, Phone, Home, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import DynamicMap from "@/components/ui/dynamic-map"

export default function LocationPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  
  const [locationData, setLocationData] = useState({
    lat: 19.0760,
    lng: 72.8777,
    shopAddress: "",
    phone: "",
  })
  
  const [hasLocation, setHasLocation] = useState(false)

  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch('/api/shop/location', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.location) {
            setLocationData({
              lat: data.location.lat,
              lng: data.location.lng,
              shopAddress: data.shopAddress || "",
              phone: data.phone || "",
            })
            setHasLocation(true)
          } else {
            setLocationData((prev) => ({
              ...prev,
              shopAddress: data.shopAddress || "",
              phone: data.phone || "",
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLocation()
    }
  }, [user])

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocationData((prev) => ({
      ...prev,
      lat,
      lng,
      shopAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }))
    setHasLocation(true)
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocationData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          shopAddress: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }))
        setHasLocation(true)
        setGettingLocation(false)
        toast.success("Location detected successfully!")
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error("Unable to get your location. Please select on map.")
        setGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSave = async () => {
    if (!hasLocation) {
      toast.error("Please select a location on the map")
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/shop/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          lat: locationData.lat,
          lng: locationData.lng,
          shopAddress: locationData.shopAddress,
          phone: locationData.phone,
        }),
      })

      if (response.ok) {
        toast.success("Location saved successfully!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save location")
      }
    } catch (error) {
      console.error('Error saving location:', error)
      toast.error("Failed to save location")
    } finally {
      setSaving(false)
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
        <h2 className="text-2xl font-bold text-foreground">Shop Location</h2>
        <p className="text-muted-foreground">
          Set your medical shop location so patients can find you on the map.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Map Section */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Location
            </CardTitle>
            <CardDescription>
              Click on the map to set your shop location, or use current location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGetCurrentLocation}
              variant="outline"
              disabled={gettingLocation}
              className="w-full"
            >
              {gettingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Use My Current Location
            </Button>
            
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <DynamicMap
                center={[locationData.lat, locationData.lng]}
                zoom={15}
                selectable={true}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {hasLocation && (
              <div className="text-sm text-muted-foreground">
                Selected: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Shop Details</CardTitle>
            <CardDescription>
              Address is auto-filled from your map selection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopAddress">
                <Home className="h-4 w-4 inline mr-2" />
                Shop Address
              </Label>
              <Input
                id="shopAddress"
                placeholder="Select location on map"
                value={locationData.shopAddress}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Automatically set based on your map selection (read-only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="Enter contact number"
                value={locationData.phone}
                onChange={(e) =>
                  setLocationData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !hasLocation}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Location
              </Button>
            </div>

            {!hasLocation && (
              <p className="text-sm text-destructive text-center">
                Please select a location on the map to save
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


