"use client"

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  description?: string
  isShop?: boolean
}

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onLocationSelect?: (lat: number, lng: number) => void
  selectable?: boolean
  className?: string
  showUserLocation?: boolean
}

export default function Map({
  center = [19.0760, 72.8777], // Default: Mumbai
  zoom = 13,
  markers = [],
  onLocationSelect,
  selectable = false,
  className = '',
  showUserLocation = false,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapReady, setMapReady] = useState(false)
  
  // Store callback in ref to always have latest reference
  const onLocationSelectRef = useRef(onLocationSelect)
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect
  }, [onLocationSelect])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Create markers layer
    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer

    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      setMapReady(false)
    }
  }, [])

  // Handle click for location selection - separate effect with proper dependencies
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    const map = mapInstanceRef.current

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!selectable) return
      
      const { lat, lng } = e.latlng

      // Remove previous selected marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
      }

      // Add new marker
      const marker = L.marker([lat, lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup('Selected Location')
        .openPopup()

      selectedMarkerRef.current = marker
      
      // Call the callback using ref to get latest function
      if (onLocationSelectRef.current) {
        onLocationSelectRef.current(lat, lng)
      }
    }

    if (selectable) {
      map.on('click', handleMapClick)
    }

    return () => {
      map.off('click', handleMapClick)
    }
  }, [mapReady, selectable])

  // Update center when prop changes
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [mapReady, center, zoom])

  // Update markers
  useEffect(() => {
    if (!mapReady || !markersLayerRef.current) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add new markers
    markers.forEach((marker) => {
      const icon = marker.isShop ? shopIcon : defaultIcon
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${marker.title}</strong>
            ${marker.description ? `<br/><span style="font-size: 12px; color: #666;">${marker.description}</span>` : ''}
          </div>
        `)
      markersLayerRef.current?.addLayer(leafletMarker)
    })
  }, [mapReady, markers])

  // Get and show user location
  useEffect(() => {
    if (!mapReady || !showUserLocation || !mapInstanceRef.current) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])

          if (mapInstanceRef.current) {
            // Center map on user location
            mapInstanceRef.current.setView([latitude, longitude], zoom)

            // Add user location marker
            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('Your Location')
          }
        },
        (error) => {
          console.error('Error getting user location:', error)
        },
        { enableHighAccuracy: true }
      )
    }
  }, [mapReady, showUserLocation, zoom])

  // Set selectable marker if we have a pre-selected location
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    
    if (selectable && center && center[0] !== 19.0760) {
      // If we have a custom center (not default), show the marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
      }

      const marker = L.marker(center, { icon: defaultIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Shop Location')

      selectedMarkerRef.current = marker
    }
  }, [mapReady, selectable, center])

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[300px] rounded-lg ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
