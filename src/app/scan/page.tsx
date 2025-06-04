'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

function ScanPage() {
  const searchParams = useSearchParams()
  const umbrellaId = searchParams.get('umbrellaId')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [locationData, setLocationData] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  // 自動位置取得を試行
  const tryAutoLocation = () => {
    if (!umbrellaId) {
      setError('傘IDが見つかりません')
      return
    }

    setIsLoading(true)
    setError(null)
    
    navigator.geolocation.getCurrentPosition(
      async position => {
        await saveLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (geoError) => {
        console.error('位置情報取得エラー:', geoError)
        setIsLoading(false)
        
        // HTTP環境での位置情報エラーの場合
        if (location.protocol === 'http:' && location.hostname !== 'localhost') {
          setError('HTTPSが必要です。手動で位置情報を入力してください。')
        } else {
          setError('位置情報の取得に失敗しました。位置情報の許可を確認するか、手動で入力してください。')
        }
        setShowManualInput(true)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // 位置情報を保存
  const saveLocation = async (coords: { latitude: number, longitude: number }) => {
    try {
      setLocationData(coords)

      const { error } = await supabase.from('umbrella_locations').insert({
        umbrella_id: umbrellaId,
        ...coords,
        scanned_at: new Date().toISOString(),
      })

      if (error) throw error
      setSuccess(true)
    } catch {
      setError('位置情報の記録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 手動入力での保存
  const handleManualSave = async () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('有効な緯度経度を入力してください')
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('緯度は-90から90、経度は-180から180の範囲で入力してください')
      return
    }
    
    setIsLoading(true)
    setError(null)
    await saveLocation({ latitude: lat, longitude: lng })
  }

  // 現在位置を取得してフィールドに設定
  const getCurrentLocationForManual = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setManualLat(position.coords.latitude.toString())
        setManualLng(position.coords.longitude.toString())
      },
      () => {
        alert('位置情報の取得に失敗しました')
      }
    )
  }

  useEffect(() => {
    // 初回自動実行を削除し、手動で開始するように変更
  }, [])

  return (
    <div style={{ minHeight: '100vh', padding: '16px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '448px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          border: '1pt solid #e5e7eb'
        }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #e5e7eb', 
            textAlign: 'center' 
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              margin: 0
            }}>
              傘の位置記録
            </h1>
            {umbrellaId && (
              <p style={{ 
                color: '#2563eb', 
                fontWeight: '500',
                margin: 0,
                marginTop: '8px'
              }}>
                傘ID: {umbrellaId}
              </p>
            )}
          </div>
          
          <div style={{ padding: '24px' }}>
            {!isLoading && !error && !success && !showManualInput && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  margin: 0
                }}>
                  位置情報を記録しますか？
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={tryAutoLocation}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    自動で位置取得
                  </button>
                  <button 
                    onClick={() => setShowManualInput(true)}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    手動で位置入力
                  </button>
                </div>
                <div style={{ 
                  marginTop: '16px', 
                  backgroundColor: '#eff6ff', 
                  padding: '12px', 
                  borderRadius: '8px' 
                }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#1d4ed8',
                    margin: 0
                  }}>
                    💡 自動取得は位置情報の許可が必要です
                  </p>
                </div>
              </div>
            )}

            {showManualInput && !success && (
              <div style={{ padding: '32px 0' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  textAlign: 'center',
                  margin: 0
                }}>
                  位置情報を入力
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151', 
                      marginBottom: '4px' 
                    }}>
                      緯度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 35.6762"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151', 
                      marginBottom: '4px' 
                    }}>
                      経度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 139.6503"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    onClick={getCurrentLocationForManual}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    現在位置を取得して入力
                  </button>
                  <button
                    onClick={handleManualSave}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    {isLoading ? '保存中...' : '位置を記録'}
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setError(null)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    戻る
                  </button>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  位置情報を記録中...
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  margin: 0,
                  marginTop: '8px'
                }}>
                  しばらくお待ちください。
                </p>
              </div>
            )}
            
            {error && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#dc2626', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  エラーが発生しました
                </h3>
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: '8px', 
                  padding: '12px',
                  color: '#dc2626',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!showManualInput && (
                    <button 
                      onClick={() => {
                        setError(null)
                        setShowManualInput(true)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'backgroundColor 0.2s'
                      }}
                    >
                      手動で位置入力
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setError(null)
                      setShowManualInput(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'backgroundColor 0.2s'
                    }}
                  >
                    🔄 再試行
                  </button>
                  <Link href="/" style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}>
                    ← ホームに戻る
                  </Link>
                </div>
              </div>
            )}
            
            {success && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#059669', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  記録完了！
                </h3>
                <div style={{ 
                  backgroundColor: '#ecfdf5', 
                  border: '1px solid #a7f3d0', 
                  borderRadius: '8px', 
                  padding: '12px',
                  color: '#059669',
                  marginBottom: '16px'
                }}>
                  傘の位置を正常に記録しました
                </div>
                
                {locationData && (
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    textAlign: 'left' 
                  }}>
                    <h4 style={{ 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px',
                      fontSize: '16px',
                      margin: 0
                    }}>記録された情報</h4>
                    <div style={{ fontSize: '14px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280' }}>傘ID:</span>
                        <span style={{ 
                          marginLeft: '8px', 
                          fontWeight: '500', 
                          color: '#2563eb' 
                        }}>{umbrellaId}</span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280' }}>緯度:</span>
                        <span style={{ 
                          marginLeft: '8px', 
                          fontFamily: 'monospace' 
                        }}>{locationData.latitude.toFixed(6)}</span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#6b7280' }}>経度:</span>
                        <span style={{ 
                          marginLeft: '8px', 
                          fontFamily: 'monospace' 
                        }}>{locationData.longitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>記録時刻:</span>
                        <span style={{ marginLeft: '8px' }}>{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/umbrellas" style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}>
                    位置一覧を見る
                  </Link>
                  <Link href="/" style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}>
                    ← ホームに戻る
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            margin: 0
          }}>
            テスト環境では手動入力をご利用ください
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScanPage
