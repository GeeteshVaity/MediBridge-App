"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Navigation, Loader2, AlertCircle, CheckCircle2, MapPin as MapPinIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import DynamicMap from "@/components/ui/dynamic-map"
import type { MapMarker } from "@/components/ui/map"

interface NearbyShop {
  id: string
  shopName: string
  ownerName: string
  phone: string
  email: string
  address: string
  distance: string
  distanceValue: number
  location: {
    lat: number
    lng: number
  } | null
}

export default function StoresPage() {
  const [shops, setShops] = useState<NearbyShop[]>([])
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777])
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchRadius, setSearchRadius] = useState<number>(3)

  const fetchNearbyShops = async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/shops?lat=${lat}&lng=${lng}&maxDistance=${searchRadius}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch nearby shops')
      }

      const data = await response.json()

      if (data.shops && data.shops.length > 0) {
        const transformedShops: NearbyShop[] = data.shops.map((shop: any) => ({
          id: shop.id,
          shopName: shop.shopName || 'Pharmacy',
          ownerName: shop.name || 'Owner',
          phone: shop.phone || 'N/A',
          email: shop.email || 'N/A',
          address: shop.shopAddress || 'Address not available',
          distance: shop.distance || 'N/A',
          distanceValue: shop.distanceValue || 0,
          location: shop.location,
        }))

        setShops(transformedShops)

        // Create map markers
        const markers: MapMarker[] = transformedShops
          .filter((shop) => shop.location)
          .map((shop) => ({
            id: shop.id,
            lat: shop.location!.lat,
            lng: shop.location!.lng,
            title: shop.shopName,
            description: `${shop.distance} away`,
            isShop: true,
          }))

        setMapMarkers(markers)
        toast.success(`Found ${transformedShops.length} medical shops nearby!`)
      } else {
        setShops([])
        setMapMarkers([])
        toast.info(`No medical shops found within ${searchRadius} km radius`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shops'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      const message = "Geolocation is not supported by your browser"
      setError(message)
      toast.error(message)
      return
    }

    setGettingLocation(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setMapCenter([latitude, longitude])
        setGettingLocation(false)
        toast.success("Location detected successfully!")
        fetchNearbyShops(latitude, longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        const message = "Unable to get your location. Please enable location access."
        setError(message)
        toast.error(message)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value)
    setSearchRadius(newRadius)
    // Refetch shops if user location is already set
    if (userLocation) {
      fetchNearbyShops(userLocation.lat, userLocation.lng)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MapPinIcon className="h-8 w-8 text-primary" />
          Nearby Medical Shops
        </h1>
        <p className="text-muted-foreground mt-1">
          Find medical shops within your selected range
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Section */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shops on Map
            </CardTitle>
            <CardDescription>
              Click "Get My Location" to see shops near you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleGetLocation}
                disabled={gettingLocation || loading}
                className="w-full"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                Get My Location
              </Button>

              {/* Search Radius Selector */}
              {userLocation && (
                <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      Search Radius: <span className="text-primary">{searchRadius} km</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={handleRadiusChange}
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[500px] rounded-lg overflow-hidden border">
              <DynamicMap
                center={mapCenter}
                zoom={14}
                markers={mapMarkers}
                selectable={false}
              />
            </div>

            {userLocation && (
              <p className="text-xs text-muted-foreground text-center">
                Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Shops List Section */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">
              Nearby Shops
              {shops.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {shops.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Medical shops within {searchRadius} km
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : shops.length > 0 ? (
              <div className="space-y-3">
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedShopId === shop.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-tight">
                          {shop.shopName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {shop.ownerName}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-primary flex-shrink-0">
                        {shop.distance}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        📍 {shop.address}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3 text-primary" />
                        <span className="font-medium">{shop.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-primary" />
                        <span className="truncate text-muted-foreground">
                          {shop.email}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 text-xs h-7"
                      onClick={() => {
                        window.open(`tel:${shop.phone}`)
                      }}
                      disabled={shop.phone === 'N/A'}
                    >
                      Call Shop
                    </Button>
                  </div>
                ))}
              </div>
            ) : userLocation ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No shops found within {searchRadius} km
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click "Get My Location" to find nearby shops
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Select custom search radius (1 - 50 km)</p>
          <p>✓ Find all medical shops in your selected range</p>
          <p>✓ View accurate distance from your current position</p>
          <p>✓ See shop contact numbers and email addresses</p>
          <p>✓ Call shops directly from the app</p>
          <p>✓ Interactive map with all nearby shops marked</p>
        </CardContent>
      </Card>
    </div>
  )
}


