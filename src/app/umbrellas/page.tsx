'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Map from '@/components/Map'
import Link from 'next/link'
import { Umbrella, List, MapPin, Home, X } from 'lucide-react'

interface UmbrellaLocation {
  id: string
  umbrella_id: string
  latitude: number
  longitude: number
  scanned_at: string
  address?: string
}

function UmbrellasPage() {
  const [locations, setLocations] = useState<UmbrellaLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<UmbrellaLocation | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  useEffect(() => {
    fetchLocations()
  }, [])

  async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        const address = data.address
        let formattedAddress = ''
        
        if (address) {
          const parts = []
          if (address.state) parts.push(address.state)
          if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village)
          }
          if (address.suburb) parts.push(address.suburb)
          if (address.quarter || address.neighbourhood) {
            parts.push(address.quarter || address.neighbourhood)
          }
          if (address.house_number && address.road) {
            parts.push(`${address.road}${address.house_number}`)
          } else if (address.road) {
            parts.push(address.road)
          }
          
          formattedAddress = parts.join('')
        }
        
        return formattedAddress || data.display_name.split(',')[0]
      }
      return '住所不明'
    } catch (error) {
      console.error('住所取得エラー:', error)
      return '住所取得失敗'
    }
  }

  async function fetchLocations() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('umbrella_locations')
        .select('*')
        .order('scanned_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        const locationsWithAddress = await Promise.all(
          data.map(async (location) => {
            const address = await getAddressFromCoordinates(location.latitude, location.longitude)
            return { ...location, address }
          })
        )
        setLocations(locationsWithAddress)
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('位置情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-error">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-end">
            <Link href="/" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          </div>
          
          {/* タブ切り替え */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
                リスト
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setViewMode('map')}
              >
                <MapPin className="w-4 h-4" />
                地図
              </button>
            </nav>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="spinner"></div>
            <span className="ml-3 text-gray-600">読み込み中...</span>
          </div>
        ) : (
          <>
            {viewMode === 'map' ? (
              /* 地図表示 */
              <div className="card mb-8">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-800">
                    地図表示 ({locations.length}件)
                  </h2>
                </div>
                <div className="card-content">
                  {locations.length > 0 ? (
                    <Map 
                      locations={locations} 
                      onLocationClick={setSelectedLocation}
                    />
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      まだ傘の位置が記録されていません
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* リスト表示 */
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-800">
                    記録一覧 ({locations.length}件)
                  </h2>
                </div>
                <div className="card-content p-0">
                  {locations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>傘ID</th>
                            <th>住所</th>
                            <th>緯度</th>
                            <th>経度</th>
                            <th>記録日時</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locations.map((location) => (
                            <tr key={location.id}>
                              <td className="font-medium text-blue-600">
                                {location.umbrella_id}
                              </td>
                              <td className="text-sm max-w-xs">
                                {location.address || '取得中...'}
                              </td>
                              <td className="font-mono text-sm">
                                {location.latitude.toFixed(6)}
                              </td>
                              <td className="font-mono text-sm">
                                {location.longitude.toFixed(6)}
                              </td>
                              <td>
                                {new Date(location.scanned_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-50 rounded-full">
                        <Umbrella className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg mb-2">まだ傘の位置が記録されていません</p>
                      <p className="text-sm">NFCタグをスキャンして位置を記録してみましょう</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 選択された位置の詳細 */}
            {selectedLocation && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-bold text-gray-800">
                    傘の詳細情報
                  </h3>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">基本情報</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">傘ID:</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {selectedLocation.umbrella_id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">記録日時:</span>
                          <span className="ml-2">
                            {new Date(selectedLocation.scanned_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">位置情報</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">住所:</span>
                          <span className="ml-2">
                            {selectedLocation.address || '取得中...'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">緯度:</span>
                          <span className="ml-2 font-mono">
                            {selectedLocation.latitude.toFixed(6)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">経度:</span>
                          <span className="ml-2 font-mono">
                            {selectedLocation.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="btn btn-close flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UmbrellasPage 