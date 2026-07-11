import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useUIStore } from './stores/ui'

declare global {
  interface Window {
    useUIStore?: typeof useUIStore
    openApiKeyModal?: () => void
    resetApiKey?: () => void
    clearAllData?: () => void
  }
}

if (import.meta.env.DEV) {
  // 调试辅助：仅开发环境挂载 store 到 window
  window.useUIStore = useUIStore
  window.openApiKeyModal = () => useUIStore.getState().setApiKeyModalOpen(true)
  window.resetApiKey = () => useUIStore.getState().setApiKey('')
  window.clearAllData = () => {
    localStorage.clear()
    console.log('All local storage data cleared.')
    window.location.reload()
  }

  console.log('Debug commands available:')
  console.log('window.openApiKeyModal() - Open API Key modal')
  console.log('window.resetApiKey() - Reset API Key to empty')
  console.log('window.clearAllData() - Clear all local storage and reload')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
