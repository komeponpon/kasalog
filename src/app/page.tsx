import Link from 'next/link'

function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">
          傘ログ
        </h1>
        <Link 
          href="/umbrellas" 
          className="btn btn-primary"
        >
          位置確認
        </Link>
      </div>
    </div>
  )
}

export default HomePage
