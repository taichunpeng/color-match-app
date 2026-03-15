import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// PWA 安装提示组件
function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') console.log('[PWA] 用户接受安装')
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      borderTop: '1px solid rgba(99,102,241,0.4)',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <img src="/icons/icon-72.svg" alt="" width={40} height={40}
           style={{ borderRadius: '20%', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>安装到手机桌面</div>
        <div style={{ color: 'rgba(199,210,254,0.8)', fontSize: 12, marginTop: 2 }}>
          离线可用，像原生 App 一样运行
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: '#6366f1', color: 'white', border: 'none',
          borderRadius: 8, padding: '8px 16px', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', flexShrink: 0,
        }}
      >
        安装
      </button>
      <button
        onClick={() => setShowBanner(false)}
        style={{
          background: 'transparent', color: 'rgba(199,210,254,0.6)',
          border: 'none', fontSize: 20, cursor: 'pointer',
          padding: '4px', lineHeight: 1, flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <InstallBanner />
  </React.StrictMode>,
)
