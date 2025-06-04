'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'

interface UmbrellaLocation {
  id: string
  umbrella_id: string
  latitude: number
  longitude: number
  scanned_at: string
}

interface MapProps {
  locations: UmbrellaLocation[]
  onLocationClick?: (location: UmbrellaLocation) => void
}

// Leaflet CSS
const leafletCSS = `
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  
  .leaflet-container {
    height: 400px;
    width: 100%;
    border-radius: 0.5rem;
    z-index: 1;
  }
`

function Map({ locations, onLocationClick }: MapProps) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [markers, setMarkers] = useState<L.Marker[]>([])

  useEffect(() => {
    // CSS を動的に追加
    const style = document.createElement('style')
    style.textContent = leafletCSS
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // マップを初期化
    const mapInstance = L.map('map', {
      center: [35.6762, 139.6503], // 東京駅
      zoom: 10,
    })

    // タイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance)

    setMap(mapInstance)

    return () => {
      mapInstance.remove()
    }
  }, [])

  useEffect(() => {
    if (!map) return

    // 既存のマーカーを削除
    markers.forEach(marker => marker.remove())

    // 新しいマーカーを追加
    const newMarkers = locations.map(location => {
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(map)
        .bindPopup(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; color: #1e40af; margin: 0 0 4px 0;">${location.umbrella_id}</h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">
              記録日時: ${new Date(location.scanned_at).toLocaleString()}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              座標: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </p>
          </div>
        `)

      marker.on('click', () => {
        if (onLocationClick) {
          onLocationClick(location)
        }
      })

      return marker
    })

    setMarkers(newMarkers)

    // 地図の中心を調整
    if (locations.length > 0) {
      const group = new L.FeatureGroup(newMarkers)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [map, locations, onLocationClick, markers])

  return (
    <div style={{ width: '100%' }}>
      <div id="map" style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '8px', 
        zIndex: 1 
      }} />
    </div>
  )
}

export default Map 