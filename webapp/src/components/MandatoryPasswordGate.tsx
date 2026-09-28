import React, { useState } from 'react';
import {
  Lock, ShieldCheck, KeyRound, AlertTriangle, Eye, EyeOff,
  CheckCircle2, ArrowRight, Phone, Sparkles, Building2
} from 'lucide-react';
import type { PatientRecord } from '../api/dhis2';

interface MandatoryPasswordGateProps {
  patient: PatientRecord;
  onActivated: (updatedPatient: PatientRecord) => void;
  onCancel?: () => void;
}

export const MandatoryPasswordGate: React.FC<MandatoryPasswordGateProps> = ({
  patient,
  onActivated,
  onCancel
}) => {
  const [enteredPin, setEnteredPin] = useState(patient.temporaryPin || '4892');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<'Standard English' | 'Liberian English / Koloqua'>('Standard English');
  const [recoveryPhone, setRecoveryPhone] = useState(patient.phone || '+231-77-512-3401');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isStrong = hasMinLength && hasLetter && hasNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!enteredPin.trim()) {
      setError('Please enter your temporary 4-digit PIN received via SMS/Email.');
      return;
    }

    if (!isStrong) {
      setError('New password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (!privacyAgreed) {
      setError('You must acknowledge the MoH Digital Health Privacy Notice to continue.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated: PatientRecord = {
        ...patient,
        isActivated: true,
        password: newPassword,
        preferredLanguage,
        recoveryPhone,
        adherenceStreakDays: patient.adherenceStreakDays || 24
      };
      if ((window as any).showToast) {
        (window as any).showToast('Security gate cleared! Welcome to your My TB Care portal.');
      }
      onActivated(updated);
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Top MoH Official Security Header */}
      <div className="bg-gradient-to-r from-health-blue via-blue-900 to-indigo-950 p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                  MoH Liberia · NLTCP Security Gate
                </span>
                <span className="bg-amber-400 text-neutral-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Mandatory Reset
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">Patient Account Activation</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                First-time mandatory password setup & clinical privacy agreement
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-white/70 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Back to Overview
            </button>
          )}
        </div>
      </div>

      {/* Patient Dossier Snapshot Banner */}
      <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-medium">Patient:</span>
          <span className="font-bold text-neutral-800">{patient.name}</span>
          <span className="font-mono bg-blue-100 text-health-blue px-2 py-0.5 rounded font-bold">
            {patient.id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <Building2 className="h-3.5 w-3.5 text-neutral-400" />
          <span>{patient.facility}</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Liberia Public Health Privacy Advisory */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-amber-900">
              Why is a password change required on your first login?
            </p>
            <p className="text-amber-800">
              Under the <strong>Liberia Health Information Privacy Standard & WHO Guidelines</strong>, your TB diagnostic records, GeneXpert results, and daily DOTS adherence must remain strictly confidential. Setting a private password ensures only you and your authorized care team can view your treatment progress.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Temporary PIN Verification */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-health-blue" />
                Temporary 4-Digit Activation PIN *
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                Dispatched via SMS / Email at registration
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={enteredPin}
                onChange={e => setEnteredPin(e.target.value)}
                placeholder="e.g. 4892"
                className="w-full font-mono text-base font-bold tracking-widest text-center py-2.5 px-4 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-health-blue focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Step 2: New Private Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-health-blue" />
                Create New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars (letters + numbers)"
                  className="w-full text-sm py-2.5 pl-3.5 pr-10 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-health-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full text-sm py-2.5 px-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-health-blue outline-none"
              />
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs space-y-1.5">
            <span className="font-bold text-neutral-600 block text-[11px] uppercase tracking-wide">
              Security Strength Requirements:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? 'text-emerald-700' : 'text-neutral-400'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-neutral-300'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${hasLetter ? 'text-emerald-700' : 'text-neutral-400'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasLetter ? 'text-emerald-600' : 'text-neutral-300'}`} />
                <span>Contains letters</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-700' : 'text-neutral-400'}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasNumber ? 'text-emerald-600' : 'text-neutral-300'}`} />
                <span>Contains a number</span>
              </div>
            </div>
          </div>

          {/* Preferences: Preferred Language & Recovery Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                Preferred Interface Dialect
              </label>
              <select
                value={preferredLanguage}
                onChange={e => setPreferredLanguage(e.target.value as any)}
                className="w-full text-sm py-2.5 px-3 border border-neutral-300 rounded-xl outline-none focus:ring-2 focus:ring-health-blue bg-white"
              >
                <option value="Standard English">Standard English</option>
                <option value="Liberian English / Koloqua">Liberian English / Koloqua (Local Colloquial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-neutral-500" />
                SMS Alert Phone (Lonestar / Orange)
              </label>
              <input
                type="text"
                value={recoveryPhone}
                onChange={e => setRecoveryPhone(e.target.value)}
                placeholder="+231-77-XXX-XXXX"
                className="w-full text-sm py-2.5 px-3.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-health-blue outline-none"
              />
            </div>
          </div>

          {/* Privacy Consent Agreement */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={e => setPrivacyAgreed(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-health-blue focus:ring-health-blue mt-0.5"
              />
              <span className="text-xs text-neutral-700 leading-relaxed">
                <strong>MoH Privacy Consent:</strong> I agree to use the <em>My TB Care</em> digital self-care portal for daily medication reporting and appointment tracking. I understand that my medical data is protected under the Republic of Liberia Ministry of Health e-Health Charter and will only be accessible to authorized healthcare staff.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-health-blue hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating Account & Encrypting Credentials...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Activate Account & Enter My TB Care Portal</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-neutral-100 border-t border-neutral-200 px-6 py-3 text-center text-[11px] text-neutral-500">
        National Leprosy and Tuberculosis Control Program (NLTCP) · Ministry of Health, Republic of Liberia · Toll-Free: 4455
      </div>
    </div>
  );
};
