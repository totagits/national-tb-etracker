import React, { useState } from 'react';
import {
  X, Calendar, MapPin, Phone, User, Activity,
  CheckCircle2, Plus, Scale, FileText
} from 'lucide-react';
import { addPatientEncounter, type PatientRecord, type EncounterRecord } from '../api/dhis2';

interface LongitudinalTimelineModalProps {
  patient: PatientRecord;
  onClose: () => void;
  onPatientUpdated: () => void;
}

export const LongitudinalTimelineModal: React.FC<LongitudinalTimelineModalProps> = ({
  patient,
  onClose,
  onPatientUpdated
}) => {
  const [showAddEncounter, setShowAddEncounter] = useState(false);
  const [stage, setStage] = useState('PS-05 Follow-Up M3');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<number>(56);
  const [sputumSmear, setSputumSmear] = useState<'Positive' | 'Negative' | 'Not Done' | 'Pending'>('Negative');
  const [adherenceRate, setAdherenceRate] = useState<number>(98);
  const [dotType, setDotType] = useState<'Facility DOT' | 'Community DOT (CHW)' | 'Digital Adherence (99DOTS)'>('Community DOT (CHW)');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState('Nurse F. Sirleaf / CHW');

  const encounters = patient.encounters || [];

  const handleSaveEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    const newEncounter: EncounterRecord = {
      id: `ENC-${Date.now().toString().slice(-4)}`,
      stage,
      date,
      weightKg: Number(weightKg),
      sputumSmear,
      adherenceRate: Number(adherenceRate),
      dotType,
      notes: notes || `Follow-up evaluation completed. Sputum: ${sputumSmear}, Adherence: ${adherenceRate}%.`,
      provider
    };

    addPatientEncounter(patient.id, newEncounter);
    onPatientUpdated();
    setShowAddEncounter(false);
    setNotes('');
    if ((window as any).showToast) {
      (window as any).showToast(`Longitudinal encounter for ${patient.id} recorded and synced to DHIS2.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-health-blue to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider">
              {patient.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              patient.status === 'Cured' ? 'bg-emerald-500 text-white' :
              patient.status === 'Lost to Follow-up' ? 'bg-rose-500 text-white' :
              'bg-amber-400 text-neutral-900'
            }`}>
              {patient.status}
            </span>
            <span className="text-xs bg-blue-800/80 px-2.5 py-1 rounded-full text-blue-100">
              {patient.regType || 'Resident Geospatial'}
            </span>
          </div>
          <h2 className="text-2xl font-black">{patient.name}</h2>
          <p className="text-blue-200 text-sm mt-1">
            {patient.sex === 'M' ? 'Male' : 'Female'}, {patient.age} yrs · {patient.facility} · Enrolled: {patient.enrolledDate || '2026-01-25'}
          </p>
        </div>

        {/* Geospatial Residence & Contact Banner */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-health-blue shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-700">Resident Geolocation</p>
              <p className="text-neutral-500 font-mono">
                {patient.lat ? `${patient.lat.toFixed(4)}° N, ${patient.lng?.toFixed(4)}° W` : '6.3156° N, -10.8074° W'}
              </p>
              <p className="text-neutral-600 mt-0.5 font-medium">
                {patient.clan ? `${patient.clan}, ${patient.community}` : 'Greater Monrovia Cluster'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <User className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-700">Community Health Worker (CHW)</p>
              <p className="text-neutral-800 font-semibold">{patient.chwName || 'Comfort Mulbah'}</p>
              <p className="text-neutral-500 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" /> {patient.chwPhone || '+231-88-601-9922'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-700">Navigational Landmark Narrative</p>
              <p className="text-neutral-600 italic">
                "{patient.landmark || 'Behind the community center near the roadside pump'}"
              </p>
              {patient.householdContacts && (
                <p className="text-neutral-500 mt-1">
                  Contacts: <span className="font-bold text-neutral-700">{patient.householdContacts}</span> ({patient.under5Contacts || 0} Under-5)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-800">Longitudinal Clinical Care Cascade</h3>
              <p className="text-xs text-neutral-500">
                Standardized WHO TB event milestones from Presumptive Screening to Outcome.
              </p>
            </div>
            <button
              onClick={() => setShowAddEncounter(!showAddEncounter)}
              className="bg-health-blue hover:bg-blue-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Follow-Up Encounter
            </button>
          </div>

          {/* Add Encounter Form */}
          {showAddEncounter && (
            <form onSubmit={handleSaveEncounter} className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <h4 className="font-bold text-sm text-health-blue flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Record New Follow-Up Encounter (PS-05 / PS-07)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddEncounter(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Encounter Milestone *</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                  >
                    <option>PS-05 Follow-Up M1 (Month 1)</option>
                    <option>PS-05 Follow-Up M2 (Smear Conversion Check)</option>
                    <option>PS-05 Follow-Up M3 (Continuation Phase)</option>
                    <option>PS-05 Follow-Up M5 (Pre-completion)</option>
                    <option>PS-07 Treatment Outcome: Cured</option>
                    <option>PS-07 Treatment Outcome: Treatment Completed</option>
                    <option>PS-07 Treatment Outcome: Failed / Defaulted</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Encounter Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    min="10"
                    max="150"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Sputum Smear Result</label>
                  <select
                    value={sputumSmear}
                    onChange={e => setSputumSmear(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Negative">Negative (Converted)</option>
                    <option value="Positive">Positive (Bacteriologically Active)</option>
                    <option value="Pending">Pending Lab Analysis</option>
                    <option value="Not Done">Not Done / Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Adherence % (Pill Count)</label>
                  <input
                    type="number"
                    value={adherenceRate}
                    onChange={e => setAdherenceRate(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">DOT Delivery Model</label>
                  <select
                    value={dotType}
                    onChange={e => setDotType(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Community DOT (CHW)">Community DOT (CHW Home Visit)</option>
                    <option value="Facility DOT">Facility DOT (Clinic Refill)</option>
                    <option value="Digital Adherence (99DOTS)">Digital Adherence (99DOTS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Clinical Notes & Follow-up Plan</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Sputum conversion confirmed. No side effects. 30 days blister packs issued."
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Provider / Evaluator</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-health-blue text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Save & Synchronize to DHIS2
                </button>
              </div>
            </form>
          )}

          {/* Timeline Sequence */}
          <div className="relative pl-6 border-l-2 border-neutral-200 space-y-6">
            {encounters.length === 0 ? (
              <div className="text-neutral-500 text-sm py-4 italic">
                No longitudinal encounters recorded yet. Click "Log Follow-Up Encounter" above.
              </div>
            ) : (
              encounters.map((enc, idx) => {
                const isConversion = enc.stage.includes('Conversion') || enc.sputumSmear === 'Negative';
                const isOutcome = enc.stage.includes('Outcome');

                return (
                  <div key={enc.id || idx} className="relative group">
                    {/* Dot on line */}
                    <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                      isOutcome ? 'bg-emerald-600 ring-4 ring-emerald-100' :
                      isConversion ? 'bg-blue-600 ring-4 ring-blue-100' :
                      'bg-neutral-400'
                    }`} />

                    <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs hover:border-health-blue transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-neutral-800 flex items-center gap-1.5">
                          {enc.stage}
                          {isOutcome && <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {enc.date}
                          </span>
                          {enc.dotType && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-medium">
                              {enc.dotType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-neutral-100 my-2">
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Weight</span>
                          <span className="font-bold text-neutral-800 flex items-center gap-1">
                            <Scale className="h-3 w-3 text-neutral-400" />
                            {enc.weightKg ? `${enc.weightKg} kg` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Sputum Smear</span>
                          <span className={`font-bold inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                            enc.sputumSmear === 'Negative' ? 'bg-emerald-100 text-emerald-800' :
                            enc.sputumSmear === 'Positive' ? 'bg-rose-100 text-rose-800' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {enc.sputumSmear || 'Not Done'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Adherence</span>
                          <span className="font-bold text-emerald-700">
                            {enc.adherenceRate ? `${enc.adherenceRate}%` : '100%'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Evaluator</span>
                          <span className="text-neutral-700 truncate block">
                            {enc.provider || 'Clinical Team'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 mt-1 font-sans">
                        {enc.notes}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Current Regimen: <span className="font-bold text-neutral-800">{patient.regimen || '1st Line (2HRZE/4HR)'}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-900 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            Close Patient Record
          </button>
        </div>
      </div>
    </div>
  );
};
