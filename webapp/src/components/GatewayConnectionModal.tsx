import React, { useState } from 'react';
import {
  X, Radio, Smartphone, Mail, CheckCircle2,
  AlertTriangle, Send, Server, Zap, Check
} from 'lucide-react';
import {
  getGatewayConfig,
  saveGatewayConfig,
  sendLiveEmail,
  sendLiveSMS,
  type GatewayConfig,
  type DispatchResult
} from '../api/gateway';

interface GatewayConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: (newConfig: GatewayConfig) => void;
}

export const GatewayConnectionModal: React.FC<GatewayConnectionModalProps> = ({
  isOpen,
  onClose,
  onConfigChange
}) => {
  const [config, setConfig] = useState<GatewayConfig>(getGatewayConfig);
  const [activeTab, setActiveTab] = useState<'mode' | 'email' | 'sms' | 'logs'>('mode');
  const [testEmailRecipient, setTestEmailRecipient] = useState(config.testRecipientEmail || 'michael.gwoah@gmail.com');
  const [testSmsRecipient, setTestSmsRecipient] = useState(config.testRecipientPhone || '+231-77-512-3401');
  
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [emailResult, setEmailResult] = useState<DispatchResult | null>(null);
  const [smsResult, setSmsResult] = useState<DispatchResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGatewayConfig(config);
    if (onConfigChange) onConfigChange(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    if ((window as any).showToast) {
      (window as any).showToast(`Gateway configuration saved! Current mode: ${config.mode.toUpperCase()}.`);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setEmailResult(null);
    try {
      const res = await sendLiveEmail(
        testEmailRecipient,
        'Michael George (Test)',
        'TB-TEST-2026',
        '4892',
        'Redemption Hospital (Montserrado)',
        config
      );
      setEmailResult(res);
      if (res.success) {
        if ((window as any).showToast) (window as any).showToast('Test email dispatched! Check your inbox.');
      }
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestSMS = async () => {
    setIsTestingSms(true);
    setSmsResult(null);
    try {
      const msg = `MoH Liberia NLTCP Test: Live SMS Gateway handshake verified. Patient ID: TB-TEST. Portal PIN: 4892. Helpline: 4455.`;
      const res = await sendLiveSMS(testSmsRecipient, msg, config);
      setSmsResult(res);
      if (res.success) {
        if ((window as any).showToast) (window as any).showToast('Test SMS transmission processed!');
      }
    } finally {
      setIsTestingSms(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-health-blue via-blue-900 to-indigo-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <Radio className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded font-bold text-white">
                  Telecommunications Pipeline
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                  config.mode === 'live' ? 'bg-emerald-400 text-neutral-950' : 'bg-amber-400 text-neutral-950'
                }`}>
                  {config.mode === 'live' ? '● Live Gateway' : 'Simulated Gateway'}
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">SMS & Email Gateway Configuration</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Manage live telecommunications dispatch to physical phones and inboxes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6">
          {[
            { id: 'mode', label: '1. Pipeline Mode', icon: Zap },
            { id: 'email', label: '2. Live Email Gateway', icon: Mail },
            { id: 'sms', label: '3. Live SMS Gateway', icon: Smartphone },
            { id: 'logs', label: '4. Diagnostics & Testing', icon: Server }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  isActive
                    ? 'border-health-blue text-health-blue bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MODE */}
          {activeTab === 'mode' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-neutral-900">Select Gateway Operating Mode</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Determine whether notifications are simulated in-app or dispatched over live telecommunication channels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulated Mode */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'simulated' }))}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    config.mode === 'simulated'
                      ? 'border-health-blue bg-blue-50/50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      Demonstration
                    </span>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      config.mode === 'simulated' ? 'border-health-blue bg-health-blue text-white' : 'border-neutral-300'
                    }`}>
                      {config.mode === 'simulated' && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-neutral-900">Simulated Demo Mode (Free)</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Generates realistic mobile phone previews, formats official MoH letterheads, and logs all events in the Security Audit Trail without sending real network requests.
                    </p>
                  </div>
                  <div className="text-[11px] text-neutral-500 bg-white/70 p-2.5 rounded-xl border border-neutral-200">
                    ✓ Zero API charges · ✓ In-app delivery preview · ✓ Offline compatible
                  </div>
                </div>

                {/* Live Mode */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'live' }))}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    config.mode === 'live'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                      Production
                    </span>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      config.mode === 'live' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-neutral-300'
                    }`}>
                      {config.mode === 'live' && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-neutral-900">Live Production Gateway</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Transmits live HTTP dispatch requests to real email inboxes and cellular SMS gateways (Orange Liberia, Lonestar MTN, Africa's Talking, Twilio).
                    </p>
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                    ✓ Real inbox delivery · ✓ Real GSM phone vibration · ✓ Live HTTP receipts
                  </div>
                </div>
              </div>

              {config.mode === 'live' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Note for Live SMS Delivery:</strong> Sending SMS to Liberian phones (+231 numbers) requires either an active <strong>Africa's Talking</strong> account or <strong>Twilio</strong> credentials. Ensure credentials are configured in the SMS tab.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE EMAIL GATEWAY */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-neutral-900">Live Email Gateway (Direct from Browser)</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Delivers official MoH welcome emails directly to the patient's personal email inbox.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                      Email Dispatch Provider
                    </label>
                    <select
                      value={config.emailProvider}
                      onChange={e => setConfig(prev => ({ ...prev, emailProvider: e.target.value as any }))}
                      className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-health-blue"
                    >
                      <option value="emailjs">EmailJS (Direct Browser-to-Inbox REST)</option>
                      <option value="resend">Resend / SMTP Relay</option>
                      <option value="custom_webhook">Custom MoH Mail Webhook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                      Sender Name / Address
                    </label>
                    <input
                      type="text"
                      value={config.emailSender || ''}
                      onChange={e => setConfig(prev => ({ ...prev, emailSender: e.target.value }))}
                      className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 outline-none font-mono"
                      placeholder="nltcp-alerts@tb-care.gov.lr"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                    Live Email Credentials & Dispatch Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block mb-1">Service ID</span>
                      <input
                        type="text"
                        value={config.emailServiceId || ''}
                        onChange={e => setConfig(prev => ({ ...prev, emailServiceId: e.target.value }))}
                        className="w-full border rounded-lg p-2 bg-white font-mono"
                        placeholder="service_moh_tb"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Template ID</span>
                      <input
                        type="text"
                        value={config.emailTemplateId || ''}
                        onChange={e => setConfig(prev => ({ ...prev, emailTemplateId: e.target.value }))}
                        className="w-full border rounded-lg p-2 bg-white font-mono"
                        placeholder="template_patient_onboard"
                      />
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Public Key / Token</span>
                      <input
                        type="text"
                        value={config.emailPublicKey || ''}
                        onChange={e => setConfig(prev => ({ ...prev, emailPublicKey: e.target.value }))}
                        className="w-full border rounded-lg p-2 bg-white font-mono"
                        placeholder="user_xxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Email Action */}
                <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-health-blue" />
                    <h4 className="font-bold text-xs text-neutral-900">Send Real Test Email Now</h4>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={e => setTestEmailRecipient(e.target.value)}
                      placeholder="Enter your personal email (e.g. name@gmail.com)"
                      className="flex-1 text-xs border border-neutral-300 rounded-xl px-3 py-2 bg-white outline-none"
                    />
                    <button
                      type="button"
                      disabled={isTestingEmail || !testEmailRecipient.trim()}
                      onClick={handleTestEmail}
                      className="bg-health-blue hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isTestingEmail ? 'Transmitting...' : 'Send Test Email'}</span>
                    </button>
                  </div>
                  {emailResult && (
                    <div className={`p-3 rounded-xl text-xs ${emailResult.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-red-100 text-red-900 border border-red-200'}`}>
                      <span className="font-bold">{emailResult.success ? '✓ Delivered:' : '✕ Delivery Status:'}</span> {emailResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SMS GATEWAY */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-neutral-900">Live Cellular SMS Gateway</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Routes SMS alerts over cellular networks directly to Liberian mobile devices.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                    Select Cellular Gateway Provider
                  </label>
                  <select
                    value={config.smsProvider}
                    onChange={e => setConfig(prev => ({ ...prev, smsProvider: e.target.value as any }))}
                    className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-health-blue"
                  >
                    <option value="africas_talking">Africa's Talking (Primary for Liberia Orange & Lonestar)</option>
                    <option value="twilio">Twilio SMS Gateway (Global & International)</option>
                    <option value="orange_lonestar_webhook">Direct MoH Shortcode Webhook (Orange / Lonestar)</option>
                  </select>
                </div>

                {config.smsProvider === 'twilio' ? (
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Twilio API Credentials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500 block mb-1">Account SID</span>
                        <input
                          type="text"
                          value={config.smsAccountSid || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsAccountSid: e.target.value }))}
                          placeholder="ACxxxxxxxxxxxxxxxx"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">Auth Token</span>
                        <input
                          type="password"
                          value={config.smsAuthToken || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsAuthToken: e.target.value }))}
                          placeholder="••••••••••••••••"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">From Number / Sender ID</span>
                        <input
                          type="text"
                          value={config.smsFromNumber || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsFromNumber: e.target.value }))}
                          placeholder="+1234567890 or MOH-NLTCP"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Africa's Talking Credentials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500 block mb-1">Username</span>
                        <input
                          type="text"
                          value={config.smsUsername || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsUsername: e.target.value }))}
                          placeholder="sandbox or enterprise username"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">API Key</span>
                        <input
                          type="password"
                          value={config.smsApiKey || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsApiKey: e.target.value }))}
                          placeholder="atsk_xxxxxxxxxxxxxxxx"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-500 block mb-1">Sender Alphanumeric ID</span>
                        <input
                          type="text"
                          value={config.smsFromNumber || ''}
                          onChange={e => setConfig(prev => ({ ...prev, smsFromNumber: e.target.value }))}
                          placeholder="MOH-NLTCP"
                          className="w-full border rounded-lg p-2 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Test SMS Action */}
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-700" />
                    <h4 className="font-bold text-xs text-neutral-900">Send Real Test SMS Now</h4>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testSmsRecipient}
                      onChange={e => setTestSmsRecipient(e.target.value)}
                      placeholder="Enter mobile phone (+231-77... or international)"
                      className="flex-1 text-xs border border-neutral-300 rounded-xl px-3 py-2 bg-white outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={isTestingSms || !testSmsRecipient.trim()}
                      onClick={handleTestSMS}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isTestingSms ? 'Transmitting...' : 'Send Test SMS'}</span>
                    </button>
                  </div>
                  {smsResult && (
                    <div className={`p-3 rounded-xl text-xs ${smsResult.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'}`}>
                      <span className="font-bold">{smsResult.success ? '✓ Result:' : '⚠ Notice:'}</span> {smsResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSTICS & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-base font-black text-neutral-900">Gateway Status & Network Health</h3>
                <p className="text-neutral-500 mt-0.5">Overview of active communication relays</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-neutral-700 block">Email Gateway Status</span>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Browser-to-Inbox Dispatcher Ready</span>
                  </div>
                  <p className="text-neutral-500 text-[11px]">Provider: {config.emailProvider}</p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <span className="font-bold text-neutral-700 block">Cellular GSM Gateway Status</span>
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <Radio className="h-4 w-4" />
                    <span>Orange Liberia / Lonestar Cell MTN Pipeline</span>
                  </div>
                  <p className="text-neutral-500 text-[11px]">Provider: {config.smsProvider}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {saveSuccess && <span className="text-emerald-700 font-bold">✓ Configuration successfully saved!</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-health-blue hover:bg-blue-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Save Gateway Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
