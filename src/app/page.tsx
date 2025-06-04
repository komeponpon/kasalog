import Link from 'next/link'

function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '32px' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '20pt', 
          fontWeight: 'bold',
          marginBottom: '40px' 
        }}>
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
