import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useUIStore } from './stores/ui'

// 调试辅助：挂载 store 到 window
// @ts-ignore
window.useUIStore = useUIStore;
// @ts-ignore
window.openApiKeyModal = () => useUIStore.getState().setApiKeyModalOpen(true);
// @ts-ignore
window.resetApiKey = () => useUIStore.getState().setApiKey('');

console.log('Debug commands available:');
console.log('window.openApiKeyModal() - Open API Key modal');
console.log('window.resetApiKey() - Reset API Key to empty');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
