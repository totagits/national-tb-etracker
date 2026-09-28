import React, { useState } from 'react';
import {
  HeartPulse, Pill, CheckCircle2, Clock, Calendar, MessageSquare,
  AlertTriangle, Phone, Stethoscope, User, Send,
  ShieldCheck, Flame, Check
} from 'lucide-react';
import type { PatientRecord } from '../api/dhis2';

interface PatientCarePortalProps {
  currentPatient: PatientRecord;
  allPatients: PatientRecord[];
  onUpdatePatient: (updated: PatientRecord) => void;
  onSwitchPatient: (p: PatientRecord) => void;
}

interface ChatMessage {
  id: string;
  sender: 'patient' | 'care_team';
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
}

export const PatientCarePortal: React.FC<PatientCarePortalProps> = ({
  currentPatient,
  allPatients,
  onUpdatePatient,
  onSwitchPatient
}) => {
  const [activeTab, setActiveTab] = useState<'my_care' | 'lab_results' | 'messages' | 'security_settings'>('my_care');
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const [isDoseLoggedToday, setIsDoseLoggedToday] = useState(
    currentPatient.lastDoseConfirmedAt?.startsWith(todayStr) || false
  );
  const [streakDays, setStreakDays] = useState(currentPatient.adherenceStreakDays || 24);
  const [doseTime, setDoseTime] = useState('Morning (08:00 AM with Breakfast)');
  const [reportedSideEffect, setReportedSideEffect] = useState<string>('None');
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);

  // Chat thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'care_team',
      senderName: currentPatient.attendingClinician || 'Dr. Emmanuel Dennis',
      senderRole: 'Attending Physician',
      text: `Hello ${currentPatient.name.split(' ')[0]}, welcome to your My TB Care portal. Please remember to take your medication every morning with water.`,
      time: 'May 20, 09:15 AM'
    },
    {
      id: 'msg-2',
      sender: 'care_team',
      senderName: currentPatient.chwName || 'Comfort Mulbah',
      senderRole: 'Community Health Volunteer (gCHV)',
      text: `Greetings! I will visit your residence in ${currentPatient.community || currentPatient.facility} for your weekly community DOT check.`,
      time: 'May 21, 10:45 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Handle Dose Confirmation
  const handleConfirmDose = () => {
    setIsDoseLoggedToday(true);
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);

    const updated: PatientRecord = {
      ...currentPatient,
      lastDoseConfirmedAt: new Date().toISOString(),
      adherenceStreakDays: newStreak
    };
    onUpdatePatient(updated);

    if ((window as any).showToast) {
      (window as any).showToast(`Medication logged for today! Streak increased to ${newStreak} days. Your care team has been notified.`);
    }
  };

  // Handle Send Chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      senderName: currentPatient.name,
      senderRole: 'Patient',
      text: chatInput,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    const sentText = chatInput;
    setChatInput('');
    setIsSending(true);

    // Simulated Care Team auto-reply
    setTimeout(() => {
      setIsSending(false);
      let replyText = 'Thank you for your message. Your care team has received this and will review your chart.';
      if (sentText.toLowerCase().includes('urine') || sentText.toLowerCase().includes('orange') || sentText.toLowerCase().includes('red')) {
        replyText = 'Do not be alarmed! Reddish-orange discoloration of urine, sweat, or tears is a completely harmless and expected effect of Rifampicin. Continue your medication as scheduled!';
      } else if (sentText.toLowerCase().includes('refill') || sentText.toLowerCase().includes('travel')) {
        replyText = 'Please visit the pharmacy at ' + currentPatient.facility + ' 3 days before travelling so we can issue your buffer supply without interrupting your treatment.';
      } else if (sentText.toLowerCase().includes('nausea') || sentText.toLowerCase().includes('stomach')) {
        replyText = 'Try taking your pills with a light meal or porridge in the morning. If vomiting persists, let us know immediately.';
      }

      const teamReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'care_team',
        senderName: currentPatient.attendingClinician || 'Dr. Emmanuel Dennis',
        senderRole: 'Attending Physician',
        text: replyText,
        time: 'Just now'
      };
      setMessages(prev => [...prev, teamReply]);
    }, 1200);
  };

  const quickPrompts = [
    'My urine is reddish-orange, is this normal?',
    'When is my next sputum test at the clinic?',
    'Can I take my pills with tea or food?',
    'I need to request a medication refill before travelling.'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Patient Profile Header Card */}
      <div className="bg-gradient-to-r from-health-blue via-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              {currentPatient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active In Care (Digital DOTS)
                </span>
                <span className="font-mono text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded font-bold">
                  {currentPatient.id}
                </span>
                <span className="text-xs bg-amber-400 text-neutral-900 px-2 py-0.5 rounded font-black uppercase">
                  {currentPatient.preferredLanguage || 'Standard English'}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-1">Hello, {currentPatient.name}!</h1>
              <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-2">
                <span>Facility: <strong>{currentPatient.facility}</strong></span>
                <span>·</span>
                <span>Attending: <strong>{currentPatient.attendingClinician || 'Dr. Emmanuel Dennis'}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-xs flex flex-col gap-1.5 self-start md:self-auto">
            <span className="text-[11px] text-blue-200 uppercase tracking-wide font-bold flex items-center gap-1">
              <User className="h-3 w-3" /> Demo Patient Switcher:
            </span>
            <select
              value={currentPatient.id}
              onChange={e => {
                const found = allPatients.find(p => p.id === e.target.value);
                if (found) onSwitchPatient(found);
              }}
              className="bg-blue-950/80 border border-blue-400/40 rounded-lg px-2.5 py-1.5 text-white font-medium outline-none text-xs"
            >
              {allPatients.map(p => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name} ({p.id}) · {p.facility.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Treatment Progress Snapshot Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-200 block text-[11px] uppercase font-bold">Current Regimen</span>
            <span className="font-bold text-white text-sm">{currentPatient.regimen || '1st Line (2HRZE/4HR)'}</span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px] uppercase font-bold">Treatment Phase</span>
            <span className="font-bold text-emerald-300 text-sm">Continuation Phase (Month 3 of 6)</span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px] uppercase font-bold">Adherence Streak</span>
            <span className="font-bold text-amber-300 text-sm flex items-center gap-1">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
              {streakDays} Days Consistent
            </span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px] uppercase font-bold">Assigned Community gCHV</span>
            <span className="font-bold text-white text-sm">{currentPatient.chwName || 'Comfort Mulbah'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-200 bg-white rounded-xl shadow-xs px-2 overflow-x-auto">
        {[
          { id: 'my_care', label: 'My Daily Care & Digital DOTS', icon: HeartPulse },
          { id: 'lab_results', label: 'Lab & Sputum Conversion', icon: Stethoscope },
          { id: 'messages', label: 'MoH Care Team Messages', icon: MessageSquare, badge: messages.length },
          { id: 'security_settings', label: 'Account Security & PIN', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-health-blue text-health-blue'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-blue-100 text-health-blue text-xs px-2 py-0.5 rounded-full font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: My Daily Care & Digital DOTS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'my_care' && (
        <div className="space-y-6">
          {/* Digital DOTS Daily Medication Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Pill className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">Today's Daily DOTS Medication</h2>
                    <p className="text-xs text-neutral-500">
                      {new Date().toLocaleDateString('en-LR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isDoseLoggedToday ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-sm font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Medication Confirmed for Today!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold">
                    <Clock className="h-5 w-5 text-amber-600 animate-spin" />
                    <span>Dose Pending Today</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-700 uppercase tracking-wide text-[11px]">Prescription Protocol</span>
                    <span className="bg-blue-200/70 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">Continuation Phase</span>
                  </div>
                  <p className="text-neutral-800 text-sm font-semibold">
                    Take <strong>4 fixed-dose combination tablets (2HRZE / 4HR)</strong> once daily.
                  </p>
                  <p className="text-neutral-600 leading-relaxed">
                    Always swallow your tablets whole with water. Do not skip days, even if you feel completely healthy.
                  </p>
                </div>

                {!isDoseLoggedToday ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <select
                        value={doseTime}
                        onChange={e => setDoseTime(e.target.value)}
                        className="text-xs border border-neutral-300 rounded-xl p-3 bg-white outline-none flex-1 font-medium"
                      >
                        <option>Morning (08:00 AM with Breakfast)</option>
                        <option>Afternoon (01:00 PM with Lunch)</option>
                        <option>Evening (07:00 PM with Dinner)</option>
                      </select>

                      <button
                        onClick={() => setShowSideEffectModal(true)}
                        className="text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-50 px-3 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
                      >
                        Report Side Effect
                      </button>
                    </div>

                    <button
                      onClick={handleConfirmDose}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all text-base"
                    >
                      <Check className="h-6 w-6 bg-white/20 p-1 rounded-full" />
                      <span>Confirm: I Took My Medication Today</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span>Great work, {currentPatient.name.split(' ')[0]}!</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your dose confirmation has been timestamped in the National TB e-Tracker database. Your assigned community volunteer <strong>{currentPatient.chwName || 'Comfort Mulbah'}</strong> and <strong>{currentPatient.attendingClinician || 'Dr. Dennis'}</strong> have received your confirmation.
                    </p>
                    <div className="pt-2 flex items-center gap-3 text-xs text-emerald-700 font-medium">
                      <span>Logged at: <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      <span>·</span>
                      <button
                        onClick={() => setShowSideEffectModal(true)}
                        className="underline hover:text-emerald-900 font-bold"
                      >
                        Report any side effects
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivational Adherence Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/80 text-center space-y-3">
                <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                  <Flame className="h-10 w-10 fill-amber-500" />
                </div>
                <div>
                  <div className="text-3xl font-black text-neutral-900">{streakDays} Days</div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">Continuous Adherence Streak</div>
                </div>
                <div className="text-xs text-neutral-600 bg-white/80 rounded-xl p-3 border border-amber-200/60 leading-relaxed">
                  "Every single dose kills remaining TB bacteria and brings you closer to your official cure certificate."
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Journey & 6-Month Countdown */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Your 6-Month Treatment Milestone Journey</h3>
                <p className="text-xs text-neutral-500">WHO Standard Category 1 Protocol (Liberia NLTCP)</p>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-health-blue px-3 py-1 rounded-full">
                58 of 180 Days Completed (32%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="h-4 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200">
                <div
                  className="h-full bg-gradient-to-r from-health-blue via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: '38%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
                <span>Day 0 (Enrollment)</span>
                <span>Month 2 (Smear Conversion)</span>
                <span>Month 4 (Mid-Check)</span>
                <span className="font-bold text-emerald-700">Month 6 (CURED)</span>
              </div>
            </div>

            {/* 4 Stage Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900">Month 1</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-800">Tolerance & Baseline</p>
                <p className="text-emerald-700 text-[11px]">Weight check, side effect monitoring. Status: Completed.</p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900">Month 2</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="font-bold text-emerald-800">Bacteriological Conversion</p>
                <p className="text-emerald-700 text-[11px]">Sputum converted to Negative! Not infectious.</p>
              </div>

              <div className="bg-blue-50 border-2 border-health-blue rounded-xl p-4 space-y-1.5 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900">Month 3 - 4</span>
                  <span className="bg-health-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Current</span>
                </div>
                <p className="font-bold text-blue-900">Continuation Phase</p>
                <p className="text-blue-800 text-[11px]">Daily 4HR regimen to eradicate latent bacilli.</p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-1.5 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="font-black text-neutral-600">Month 6</span>
                  <Clock className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="font-bold text-neutral-700">Official TB Cure</p>
                <p className="text-neutral-500 text-[11px]">Final smear test & NLTCP discharge certificate.</p>
              </div>
            </div>
          </div>

          {/* Quick Clinic Appointment & MoH Helpline Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl text-health-blue">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-neutral-900 text-sm">Next Clinic Visit & Refill</h4>
                  <p className="text-xs text-neutral-500">Pick up medication & routine health check</p>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between"><span className="text-neutral-500">Scheduled Date:</span><span className="font-bold text-neutral-900">June 15, 2026</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Location:</span><span className="font-bold text-neutral-900">{currentPatient.facility}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Department:</span><span className="font-bold text-neutral-900">TB Chest Clinic / Pharmacy</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 rounded-2xl p-6 text-white space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl text-amber-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">MoH National TB Toll-Free Hotline</h4>
                  <p className="text-xs text-blue-200">24/7 Clinical Questions & Emergency Advice</p>
                </div>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                If you experience severe vomiting, yellowing of eyes, or persistent rash, dial toll-free immediately:
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="tel:4455"
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call 4455 (Toll-Free)</span>
                </a>
                <span className="text-xs text-blue-200">Free on Orange & Lonestar MTN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: Lab & Sputum Conversion */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lab_results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900">Bacteriological & Diagnostic Lab Results</h2>
              <p className="text-xs text-neutral-500">Official laboratory assays from {currentPatient.facility}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GeneXpert Card */}
              <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Molecular Assay</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">GeneXpert MTB/RIF</span>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900">MTB Detected · RIF Sensitive</div>
                  <div className="text-xs font-mono text-neutral-500 mt-0.5">Assay Date: 2026-01-20 · Sample: Sputum</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
                  <strong>Patient Meaning:</strong> Tuberculosis bacteria were detected, but they are fully sensitive to Rifampicin. This means standard first-line treatment is completely effective for your cure!
                </div>
              </div>

              {/* Sputum Smear Conversion Card */}
              <div className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Microscopy Status</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">Smear Negative</span>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-700">Month 2 Sputum Conversion Confirmed</div>
                  <div className="text-xs font-mono text-neutral-500 mt-0.5">Assay Date: 2026-03-25 · AFB Smear: Negative</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
                  <strong>Great News:</strong> Your Month 2 sputum test showed no visible bacteria under the microscope. You have successfully achieved smear conversion and cannot transmit TB to your family.
                </div>
              </div>
            </div>

            {/* Historical Lab Encounter Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Complete Diagnostic Timeline</h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 text-xs">
                  <thead className="bg-neutral-50 font-bold text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Encounter / Stage</th>
                      <th className="px-4 py-3 text-left">Sputum Smear</th>
                      <th className="px-4 py-3 text-left">Weight</th>
                      <th className="px-4 py-3 text-left">Adherence</th>
                      <th className="px-4 py-3 text-left">Clinical Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono">2026-01-25</td>
                      <td className="px-4 py-3 font-bold">PS-01 Enrollment & Baseline</td>
                      <td className="px-4 py-3 font-bold text-red-600">Positive (2+)</td>
                      <td className="px-4 py-3">54 kg</td>
                      <td className="px-4 py-3">100%</td>
                      <td className="px-4 py-3 text-neutral-600">Initiated on 2HRZE/4HR</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono">2026-02-25</td>
                      <td className="px-4 py-3 font-bold">PS-05 Month 1 Follow-Up</td>
                      <td className="px-4 py-3 font-bold text-amber-600">Positive (1+)</td>
                      <td className="px-4 py-3">56 kg (+2kg)</td>
                      <td className="px-4 py-3">96%</td>
                      <td className="px-4 py-3 text-neutral-600">Tolerating well, appetite returned</td>
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="px-4 py-3 font-mono">2026-03-25</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">PS-05 Month 2 Conversion</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">Negative (Converted)</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">58 kg (+4kg)</td>
                      <td className="px-4 py-3">98%</td>
                      <td className="px-4 py-3 text-emerald-800 font-medium">Bacteriological cure trajectory confirmed</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono">2026-07-25</td>
                      <td className="px-4 py-3 font-bold text-neutral-400">PS-05 Month 6 Final Smear</td>
                      <td className="px-4 py-3 text-neutral-400 italic">Scheduled</td>
                      <td className="px-4 py-3 text-neutral-400">—</td>
                      <td className="px-4 py-3 text-neutral-400">—</td>
                      <td className="px-4 py-3 text-neutral-400 italic">Discharge & Final Cure Evaluation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: MoH Care Team Messages */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-neutral-50 border-b border-neutral-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-health-blue font-bold flex items-center justify-center">
                MoH
              </div>
              <div>
                <h3 className="font-black text-sm text-neutral-900">
                  MoH Care Team · {currentPatient.facility}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {currentPatient.attendingClinician || 'Dr. Emmanuel Dennis'} & {currentPatient.chwName || 'Comfort Mulbah'} (gCHV)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-neutral-600">Online Support</span>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-neutral-50/40">
            {messages.map(m => {
              const isPatient = m.sender === 'patient';
              return (
                <div key={m.id} className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1 px-1">
                    <span className="font-bold text-neutral-600">{m.senderName}</span>
                    <span>· {m.senderRole}</span>
                    <span>· {m.time}</span>
                  </div>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isPatient
                        ? 'bg-health-blue text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 italic">
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" />
                <span>Care team is typing advice...</span>
              </div>
            )}
          </div>

          {/* Quick-Prompt Chips */}
          <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-neutral-400 font-bold uppercase shrink-0">Quick Questions:</span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(q)}
                className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200 flex gap-3 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask your doctor or community health worker a question…"
              className="flex-1 text-sm border border-neutral-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-health-blue"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-health-blue hover:bg-blue-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors shadow-xs"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: Account Security & PIN */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'security_settings' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-neutral-900">Account Security & Notifications</h2>
            <p className="text-xs text-neutral-500">Manage your password, registered phone, and alert preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border border-neutral-200 rounded-xl p-5">
              <h4 className="font-bold text-sm text-neutral-800">Contact & Alert Channels</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 block">Registered SMS Mobile</span>
                  <span className="font-bold text-neutral-900 text-sm font-mono">{currentPatient.phone || '+231-77-512-3401'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Carrier Network</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    Lonestar Cell MTN / Orange Liberia Verified
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Email Address</span>
                  <span className="font-medium text-neutral-800">{currentPatient.email || 'patient@tb-care.gov.lr'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border border-neutral-200 rounded-xl p-5">
              <h4 className="font-bold text-sm text-neutral-800">Security Credentials</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 block">Current Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Mandatory Password Reset Completed
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Temporary Activation PIN</span>
                  <span className="font-mono font-bold text-neutral-600">{currentPatient.temporaryPin || '4892'}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => (window as any).showToast('Password change form opened. Your password is securely encrypted.')}
                    className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Change Private Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Effect Modal */}
      {showSideEffectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4 className="font-black text-neutral-900 text-sm">Report Medication Side Effect</h4>
              </div>
              <button onClick={() => setShowSideEffectModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Select any symptoms you experienced today. Your healthcare provider will receive this report.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Reddish/Orange Urine', note: 'Normal & harmless with Rifampicin', safe: true },
                { name: 'Mild Nausea or Loss of Appetite', note: 'Common in first 2 weeks', safe: true },
                { name: 'Skin Rash or Itching', note: 'Requires care team review', safe: false },
                { name: 'Yellowing of Eyes / Skin (Jaundice)', note: 'Alert Dr. immediately', safe: false },
                { name: 'Blurry Vision or Eye Pain', note: 'Alert Dr. immediately', safe: false }
              ].map(s => (
                <label key={s.name} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-50 border border-neutral-200 cursor-pointer">
                  <input
                    type="radio"
                    name="side_effect"
                    checked={reportedSideEffect === s.name}
                    onChange={() => setReportedSideEffect(s.name)}
                    className="mt-0.5 text-health-blue"
                  />
                  <div>
                    <span className="font-bold text-neutral-800 block">{s.name}</span>
                    <span className={`text-[11px] ${s.safe ? 'text-neutral-500' : 'text-red-600 font-medium'}`}>{s.note}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button
                onClick={() => setShowSideEffectModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSideEffectModal(false);
                  if ((window as any).showToast) {
                    (window as any).showToast(`Side effect "${reportedSideEffect}" recorded in clinical chart.`);
                  }
                }}
                className="px-4 py-2 bg-health-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
