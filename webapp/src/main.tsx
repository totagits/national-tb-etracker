import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with update notification
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event so PWAUpdateToast can show
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    console.log('[TB e-Tracker] App is ready for offline use.');
  },
  onRegisteredSW(swUrl, r) {
    // Poll for updates every 60 minutes while the app is open
    if (r) {
      setInterval(async () => {
        if (!(!r.installing && navigator.onLine)) return;
        const resp = await fetch(swUrl, { cache: 'no-store', headers: { cache: 'no-store', 'cache-control': 'no-cache' } });
        if (resp?.status === 200) await r.update();
      }, 60 * 60 * 1000);
    }
  },
});

// Expose updateSW globally for manual refresh
(window as any).__pwaUpdateSW = updateSW;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
