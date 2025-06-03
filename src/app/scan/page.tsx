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
    <div className="min-h-screen p-4 bg-white">
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              傘の位置記録
            </h1>
            {umbrellaId && (
              <p className="text-blue-600 font-medium">
                傘ID: {umbrellaId}
              </p>
            )}
          </div>
          
          <div className="card-content">
            {!isLoading && !error && !success && !showManualInput && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  位置情報を記録しますか？
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={tryAutoLocation}
                    className="btn btn-primary w-full"
                  >
                    自動で位置取得
                  </button>
                  <button 
                    onClick={() => setShowManualInput(true)}
                    className="btn btn-secondary w-full"
                  >
                    手動で位置入力
                  </button>
                </div>
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 自動取得は位置情報の許可が必要です
                  </p>
                </div>
              </div>
            )}

            {showManualInput && !success && (
              <div className="py-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  位置情報を入力
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緯度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 35.6762"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      経度
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="例: 139.6503"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      className="input"
                    />
                  </div>
                  <button
                    onClick={getCurrentLocationForManual}
                    className="btn btn-secondary w-full text-sm"
                  >
                    現在位置を取得して入力
                  </button>
                  <button
                    onClick={handleManualSave}
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? '保存中...' : '位置を記録'}
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false)
                      setError(null)
                    }}
                    className="btn btn-secondary w-full"
                  >
                    戻る
                  </button>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  位置情報を記録中...
                </h3>
                <p className="text-gray-600 text-sm">
                  しばらくお待ちください。
                </p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  エラーが発生しました
                </h3>
                <div className="alert alert-error mb-4">
                  {error}
                </div>
                <div className="space-y-2">
                  {!showManualInput && (
                    <button 
                      onClick={() => {
                        setError(null)
                        setShowManualInput(true)
                      }}
                      className="btn btn-primary w-full"
                    >
                      手動で位置入力
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setError(null)
                      setShowManualInput(false)
                    }} 
                    className="btn btn-secondary w-full"
                  >
                    🔄 再試行
                  </button>
                  <Link href="/" className="btn btn-secondary w-full">
                    ← ホームに戻る
                  </Link>
                </div>
              </div>
            )}
            
            {success && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  記録完了！
                </h3>
                <div className="alert alert-success mb-4">
                  傘の位置を正常に記録しました
                </div>
                
                {locationData && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                    <h4 className="font-semibold text-gray-700 mb-2">記録された情報</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">傘ID:</span>
                        <span className="ml-2 font-medium text-blue-600">{umbrellaId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">緯度:</span>
                        <span className="ml-2 font-mono">{locationData.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">経度:</span>
                        <span className="ml-2 font-mono">{locationData.longitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">記録時刻:</span>
                        <span className="ml-2">{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Link href="/umbrellas" className="btn btn-primary w-full">
                    位置一覧を見る
                  </Link>
                  <Link href="/" className="btn btn-secondary w-full">
                    ← ホームに戻る
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            テスト環境では手動入力をご利用ください
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScanPage
