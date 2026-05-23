import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ─── Install Prompt Banner ────────────────────────────────────────────────────
export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-[#1e3a5f] to-[#1a6b3a] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="p-4 flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base">Install TB e-Tracker</p>
            <p className="text-sm text-white/80 mt-0.5">Add to home screen for offline access across Liberia's 15 counties</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-white/70"><Wifi className="h-3 w-3" /> Works offline</span>
              <span className="flex items-center gap-1 text-xs text-white/70"><Bell className="h-3 w-3" /> Fast &amp; reliable</span>
              <span className="flex items-center gap-1 text-xs text-white/70"><Download className="h-3 w-3" /> No app store needed</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-white text-[#1e3a5f] font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/60 text-xs text-center hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              <X className="h-3 w-3" /> Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PWA Update Toast ─────────────────────────────────────────────────────────
export function PWAUpdateToast() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const onUpdate = () => setShowUpdate(true);
    window.addEventListener('pwa-update-available', onUpdate);
    return () => window.removeEventListener('pwa-update-available', onUpdate);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white border border-neutral-200 rounded-xl shadow-xl p-4 max-w-xs animate-fade-in">
      <p className="font-bold text-neutral-800 text-sm">Update Available</p>
      <p className="text-xs text-neutral-500 mt-1">A new version of TB e-Tracker is ready.</p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-[#1e3a5f] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-900"
        >
          Reload &amp; Update
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="text-neutral-500 text-xs px-2 hover:text-neutral-700"
        >
          Later
        </button>
      </div>
    </div>
  );
}

// ─── Install Button (for header) ──────────────────────────────────────────────
export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setDeferredPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed || !deferredPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <button
      onClick={handleInstall}
      title="Install TB e-Tracker as an app"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
    >
      <Download className="h-3.5 w-3.5" />
      Install App
    </button>
  );
}
