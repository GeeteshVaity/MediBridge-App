"use client"

import dynamic from 'next/dynamic'

// Dynamically import Map with no SSR
const Map = dynamic(() => import('@/components/ui/map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-muted rounded-lg flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  ),
})

export default Map
export type { MapMarker } from '@/components/ui/map'
