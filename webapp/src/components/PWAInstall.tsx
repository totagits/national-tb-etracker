import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, CheckCircle2, ChevronRight, Menu } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ── Floating Install Button (always visible on mobile, not installed) ──────────
export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    // Also check navigator.standalone for older iOS
    if ((navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Browser supports one-click install
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback: show manual instructions modal
      setShowModal(true);
    }
  };

  // Detect Android vs iOS for tailored instructions
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isInstalled) return null;

  return (
    <>
      {/* ── Floating Install Button ── */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-4 z-[9998] flex items-center gap-2 bg-gradient-to-r from-[#1e3a5f] to-[#138275] text-white px-4 py-3 rounded-full shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
        style={{ boxShadow: '0 8px 32px rgba(30,58,95,0.45)' }}
        aria-label="Install TB e-Tracker app"
      >
        <Smartphone className="h-5 w-5 flex-shrink-0" />
        <span className="font-bold text-sm whitespace-nowrap">Install App</span>
        <Download className="h-4 w-4 flex-shrink-0" />
      </button>

      {/* ── Install Success Toast ── */}
      {installSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-bold text-sm">TB e-Tracker installed!</span>
        </div>
      )}

      {/* ── Manual Instructions Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#138275] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-white text-base">Install TB e-Tracker</p>
                  <p className="text-white/70 text-xs">Add to your home screen</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Benefits */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: <Wifi className="h-4 w-4" />, label: 'Works Offline' },
                  { icon: <Download className="h-4 w-4" />, label: 'No App Store' },
                  { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Fast & Free' },
                ].map(b => (
                  <div key={b.label} className="bg-slate-50 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center border border-slate-100">
                    <div className="text-[#1e3a5f]">{b.icon}</div>
                    <span className="text-xs font-bold text-slate-600">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {isIOS ? 'Steps for iPhone / iPad' : isAndroid ? 'Steps for Android' : 'Installation Steps'}
              </p>

              {isAndroid && (
                <div className="space-y-3">
                  {[
                    {
                      num: 1,
                      title: 'Tap the menu icon',
                      detail: 'Tap the ⋮ three-dot menu in the top-right corner of Chrome',
                      icon: <Menu className="h-4 w-4" />,
                    },
                    {
                      num: 2,
                      title: 'Tap "Add to Home screen"',
                      detail: 'Scroll down in the menu and tap "Add to Home screen"',
                      icon: <Download className="h-4 w-4" />,
                    },
                    {
                      num: 3,
                      title: 'Tap "Add"',
                      detail: 'A dialog will appear — tap "Add" to confirm installation',
                      icon: <CheckCircle2 className="h-4 w-4" />,
                    },
                  ].map(step => (
                    <div key={step.num} className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="h-7 w-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}

                  {/* Visual hint */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">💡</span>
                    <p className="text-xs text-amber-800 font-medium">
                      If you don't see "Add to Home screen", make sure you're using <strong>Google Chrome</strong> (not Samsung Internet or another browser).
                    </p>
                  </div>
                </div>
              )}

              {isIOS && (
                <div className="space-y-3">
                  {[
                    {
                      num: 1,
                      title: 'Tap the Share button',
                      detail: 'Tap the Share icon (box with arrow) at the bottom of Safari',
                    },
                    {
                      num: 2,
                      title: 'Tap "Add to Home Screen"',
                      detail: 'Scroll down in the share sheet and tap "Add to Home Screen"',
                    },
                    {
                      num: 3,
                      title: 'Tap "Add"',
                      detail: 'Confirm the app name and tap "Add" in the top-right corner',
                    },
                  ].map(step => (
                    <div key={step.num} className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="h-7 w-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                        {step.num}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isAndroid && !isIOS && (
                <div className="space-y-3">
                  {[
                    { num: 1, title: 'Look for the install icon', detail: 'Check your browser\'s address bar for a ⊕ or download icon on the right side' },
                    { num: 2, title: 'Click "Install"', detail: 'Click the icon and select "Install" from the popup' },
                    { num: 3, title: 'Or use the browser menu', detail: 'Browser menu → "Install TB e-Tracker" or "Add to Home Screen"' },
                  ].map(step => (
                    <div key={step.num} className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="h-7 w-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">{step.num}</div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2c5282] transition-colors"
              >
                Got it — I'll follow the steps <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
