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
  const [locationData, setLocationData] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    if (!umbrellaId) {
      setError('傘IDが見つかりません')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const locationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          setLocationData(locationInfo)

          const { error } = await supabase.from('umbrella_locations').insert({
            umbrella_id: umbrellaId,
            ...locationInfo,
            scanned_at: new Date().toISOString(),
          })

          if (error) throw error
          setSuccess(true)
        } catch {
          setError('位置情報の記録に失敗しました')
        } finally {
          setIsLoading(false)
        }
      },
      () => {
        setError('位置情報の取得に失敗しました。位置情報の許可を確認してください。')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [umbrellaId])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ☂️ 傘の位置記録
            </h1>
            {umbrellaId && (
              <p className="text-blue-600 font-medium">
                傘ID: {umbrellaId}
              </p>
            )}
          </div>
          
          <div className="card-content">
            {isLoading && (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  位置情報を記録中...
                </h3>
                <p className="text-gray-600 text-sm">
                  GPS情報を取得しています。しばらくお待ちください。
                </p>
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 より正確な位置情報のため、屋外でお試しください
                  </p>
                </div>
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
                  <Link href="/" className="btn btn-secondary w-full">
                    ← ホームに戻る
                  </Link>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-primary w-full"
                  >
                    🔄 再試行
                  </button>
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
                    📋 位置一覧を見る
                  </Link>
                  <Link href="/" className="btn btn-secondary w-full">
                    ← ホームに戻る
                  </Link>
                </div>
              </div>
            )}
            
            {!isLoading && !error && !success && (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">
                  初期化中...
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            このアプリは位置情報を使用します。プライバシーに配慮して設計されています。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScanPage
