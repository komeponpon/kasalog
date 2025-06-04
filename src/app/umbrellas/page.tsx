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
      <div style={{ minHeight: '100vh', padding: '16px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '16px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '16px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        {/* ヘッダー */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          border: '1pt solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              margin: 0
            }}>
              傘の位置情報
            </h1>
            <Link href="/" style={{ 
              padding: '8px', 
              color: '#6b7280', 
              textDecoration: 'none',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}>
              <Home style={{ width: '20px', height: '20px' }} />
            </Link>
          </div>
          
          {/* 表示切り替えボタン */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? '#3b82f6' : '#f3f4f6',
                color: viewMode === 'list' ? 'white' : '#6b7280',
                transition: 'all 0.2s'
              }}
              onClick={() => setViewMode('list')}
            >
              <List style={{ width: '16px', height: '16px' }} />
              リスト表示
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: viewMode === 'map' ? '#3b82f6' : '#f3f4f6',
                color: viewMode === 'map' ? 'white' : '#6b7280',
                transition: 'all 0.2s'
              }}
              onClick={() => setViewMode('map')}
            >
              <MapPin style={{ width: '16px', height: '16px' }} />
              地図表示
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '64px 0',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#6b7280' }}>読み込み中...</span>
          </div>
        ) : (
          <>
            {viewMode === 'map' ? (
              /* 地図表示 */
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1pt solid #e5e7eb',
                marginBottom: '32px'
              }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    地図表示 ({locations.length}件)
                  </h2>
                </div>
                <div style={{ padding: '24px' }}>
                  {locations.length > 0 ? (
                    <Map 
                      locations={locations} 
                      onLocationClick={setSelectedLocation}
                    />
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '64px 0', 
                      color: '#6b7280'
                    }}>
                      まだ傘の位置が記録されていません
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* リスト表示 */
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1pt solid #e5e7eb'
              }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    記録一覧 ({locations.length}件)
                  </h2>
                </div>
                <div>
                  {locations.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th style={{ 
                              padding: '12px 16px', 
                              textAlign: 'left', 
                              fontWeight: '600',
                              color: '#374151',
                              borderBottom: '1px solid #e5e7eb'
                            }}>傘ID</th>
                            <th style={{ 
                              padding: '12px 16px', 
                              textAlign: 'left', 
                              fontWeight: '600',
                              color: '#374151',
                              borderBottom: '1px solid #e5e7eb'
                            }}>住所</th>
                            <th style={{ 
                              padding: '12px 16px', 
                              textAlign: 'left', 
                              fontWeight: '600',
                              color: '#374151',
                              borderBottom: '1px solid #e5e7eb'
                            }}>緯度</th>
                            <th style={{ 
                              padding: '12px 16px', 
                              textAlign: 'left', 
                              fontWeight: '600',
                              color: '#374151',
                              borderBottom: '1px solid #e5e7eb'
                            }}>経度</th>
                            <th style={{ 
                              padding: '12px 16px', 
                              textAlign: 'left', 
                              fontWeight: '600',
                              color: '#374151',
                              borderBottom: '1px solid #e5e7eb'
                            }}>記録日時</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locations.map((location) => (
                            <tr key={location.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ 
                                padding: '12px 16px',
                                fontWeight: '500',
                                color: '#2563eb'
                              }}>
                                {location.umbrella_id}
                              </td>
                              <td style={{ 
                                padding: '12px 16px',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {location.address || '取得中...'}
                              </td>
                              <td style={{ 
                                padding: '12px 16px',
                                fontFamily: 'monospace'
                              }}>
                                {location.latitude.toFixed(6)}
                              </td>
                              <td style={{ 
                                padding: '12px 16px',
                                fontFamily: 'monospace'
                              }}>
                                {location.longitude.toFixed(6)}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {new Date(location.scanned_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '64px 16px', 
                      color: '#6b7280'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        marginBottom: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '50%'
                      }}>
                        <Umbrella style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                      </div>
                      <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>
                        まだ傘の位置が記録されていません
                      </p>
                      <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                        NFCタグをスキャンして位置を記録してみましょう
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 選択された位置の詳細 */}
            {selectedLocation && (
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1pt solid #e5e7eb',
                marginTop: '24px'
              }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#111827',
                    margin: 0
                  }}>
                    傘の詳細情報
                  </h3>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px'
                  }}>
                    <div>
                      <h4 style={{ 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '12px',
                        fontSize: '16px'
                      }}>基本情報</h4>
                      <div style={{ fontSize: '14px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>傘ID:</span>
                          <span style={{ 
                            marginLeft: '8px', 
                            fontWeight: '500', 
                            color: '#2563eb'
                          }}>
                            {selectedLocation.umbrella_id}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#6b7280' }}>記録日時:</span>
                          <span style={{ marginLeft: '8px' }}>
                            {new Date(selectedLocation.scanned_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '12px',
                        fontSize: '16px'
                      }}>位置情報</h4>
                      <div style={{ fontSize: '14px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>住所:</span>
                          <span style={{ marginLeft: '8px' }}>
                            {selectedLocation.address || '取得中...'}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>緯度:</span>
                          <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                            {selectedLocation.latitude.toFixed(6)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#6b7280' }}>経度:</span>
                          <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                            {selectedLocation.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'backgroundColor 0.2s'
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
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