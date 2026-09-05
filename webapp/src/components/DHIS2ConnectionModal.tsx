import { useState } from 'react';
import {
  Server, Shield, CheckCircle2, AlertTriangle, X, RefreshCw,
  Database, Trash2, Download, ExternalLink, Zap
} from 'lucide-react';
import {
  type DHIS2Config, getDHIS2Config, saveDHIS2Config, testDHIS2Connection,
  purgeAllMockData, restoreDemoData, getStoredPatients
} from '../api/dhis2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: (config: DHIS2Config) => void;
  onPatientsChange?: (patients: any[]) => void;
}

export const DHIS2ConnectionModal = ({ isOpen, onClose, onConfigChange, onPatientsChange }: Props) => {
  const [config, setConfig] = useState<DHIS2Config>(getDHIS2Config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    version?: string;
    systemName?: string;
    latencyMs?: number;
  } | null>(null);
  const [toast, setToast] = useState('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApplyPreset = (name: string, url: string, ouId: string, ouName: string) => {
    setConfig(prev => ({
      ...prev,
      serverUrl: url,
      orgUnitId: ouId,
      orgUnitName: ouName
    }));
    setTestResult(null);
    showToast(`Loaded preset: ${name}`);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testDHIS2Connection(config);
      setTestResult(res);
      if (res.success) {
        setConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          lastStatus: 'connected',
          systemVersion: res.version,
          systemName: res.systemName
        }));
      } else {
        setConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          lastStatus: 'error'
        }));
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const saved = saveDHIS2Config(config);
    onConfigChange?.(saved);
    showToast('DHIS2 connection settings applied successfully.');
    setTimeout(() => onClose(), 800);
  };

  const handlePurgeMockData = () => {
    if (window.confirm('Are you sure you want to PURGE all mock patient records? The patient directory will be empty (0 records), ready for real-time live clinic data entry.')) {
      const cleared = purgeAllMockData();
      onPatientsChange?.(cleared);
      showToast('All mock data purged. Registry is now empty for live entry.');
    }
  };

  const handleRestoreDemoData = () => {
    const restored = restoreDemoData();
    onPatientsChange?.(restored);
    showToast('Restored baseline demonstration dataset.');
  };

  const handleExportJSON = () => {
    const pts = getStoredPatients();
    const blob = new Blob([JSON.stringify(pts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tb-tracker-patients-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Exported patient registry.');
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-health-blue to-blue-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">DHIS2 Live Connection Engine</h3>
              <p className="text-xs text-blue-200">Configure real-time REST API integration & data pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold animate-in fade-in">
              {toast}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Operating Data Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig(p => ({ ...p, mode: 'demo' }))}
                className={`p-3 rounded-lg text-left border transition-all ${
                  config.mode === 'demo'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                    : 'bg-white border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-sm text-neutral-900">Demo & Training Mode</span>
                </div>
                <p className="text-xs text-neutral-500">Persistent local storage (zero PII exposure). Safe for public demos and training.</p>
              </button>

              <button
                type="button"
                onClick={() => setConfig(p => ({ ...p, mode: 'live' }))}
                className={`p-3 rounded-lg text-left border transition-all ${
                  config.mode === 'live'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
                    : 'bg-white border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-neutral-900">Live DHIS2 API Mode</span>
                </div>
                <p className="text-xs text-neutral-500">Direct real-time communication with MoH DHIS2 instance (/api/v41).</p>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Endpoint Presets</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset('MoH Production', 'https://dhis2.moh.gov.lr/api', 'ImspTQPcCqd', 'Liberia National MoH')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white hover:border-health-blue text-neutral-700 flex items-center gap-1.5"
              >
                <Zap className="h-3 w-3 text-health-blue" /> MoH Liberia Production
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('MoH Staging', 'https://staging-dhis2.moh.gov.lr/api', 'ImspTQPcCqd', 'Liberia Staging Sandbox')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white hover:border-health-blue text-neutral-700 flex items-center gap-1.5"
              >
                <Zap className="h-3 w-3 text-amber-600" /> MoH Staging / Sandbox
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('DHIS2 Play Demo', 'https://play.dhis2.org/41.0.0/api', 'DiszpKrYNg8', 'Ngelehun CHC')}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 bg-white hover:border-health-blue text-neutral-700 flex items-center gap-1.5"
              >
                <ExternalLink className="h-3 w-3 text-neutral-500" /> DHIS2 Reference (play.dhis2.org)
              </button>
            </div>
          </div>

          {/* Server URL & Org Unit */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">DHIS2 Server Web API URL *</label>
              <input
                type="text"
                value={config.serverUrl}
                onChange={e => setConfig(p => ({ ...p, serverUrl: e.target.value }))}
                placeholder="https://dhis2.moh.gov.lr/api"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-health-blue outline-none"
              />
              <p className="text-xs text-neutral-400 mt-1">Must point to the /api root of the DHIS2 v40+ or v41 instance.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Authentication Method</label>
                <select
                  value={config.authType}
                  onChange={e => setConfig(p => ({ ...p, authType: e.target.value as any }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="basic">Basic Auth (Username / Password)</option>
                  <option value="pat">Personal Access Token (PAT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Assigned Organisation Unit ID</label>
                <input
                  type="text"
                  value={config.orgUnitId}
                  onChange={e => setConfig(p => ({ ...p, orgUnitId: e.target.value }))}
                  placeholder="e.g. ImspTQPcCqd"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono outline-none"
                />
              </div>
            </div>

            {config.authType === 'basic' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">DHIS2 Username</label>
                  <input
                    type="text"
                    value={config.username || ''}
                    onChange={e => setConfig(p => ({ ...p, username: e.target.value }))}
                    placeholder="admin"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">DHIS2 Password</label>
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={e => setConfig(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  value={config.token || ''}
                  onChange={e => setConfig(p => ({ ...p, token: e.target.value }))}
                  placeholder="d2pat_xxxxxxxxxxxxxxxxx"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono outline-none"
                />
              </div>
            )}
          </div>

          {/* Test Connection Button & Results */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-800">Connection Verification</h4>
                <p className="text-xs text-neutral-500">Pings /api/system/info to check latency and version</p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-health-blue text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Pinging Server…' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Connected Successfully ({testResult.latencyMs}ms latency)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Connection Failed ({testResult.latencyMs}ms)</span>
                    </>
                  )}
                </div>
                {testResult.success ? (
                  <p>System: <strong>{testResult.systemName}</strong> · DHIS2 Version: <strong>{testResult.version}</strong></p>
                ) : (
                  <p>{testResult.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Data Hygiene & Pipeline Controls */}
          <div className="border-t border-neutral-200 pt-4">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Data Hygiene & Pipeline Controls</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handlePurgeMockData}
                className="p-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Purge Mock Data (Empty 0)
              </button>
              <button
                type="button"
                onClick={handleRestoreDemoData}
                className="p-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Database className="h-3.5 w-3.5 text-health-blue" /> Restore Demo Baseline
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export Registry JSON
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              <strong>Purge Mock Data</strong> resets the patient directory to zero records, preparing the platform for live clinical data collection during site pilot.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Encrypted local storage · No PII leaked to public repositories</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold border border-neutral-200 rounded-lg hover:bg-white text-neutral-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold bg-health-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              Save & Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};