import React, { useState } from 'react';
import {
  MapPin, Phone, User, AlertTriangle, Search, Navigation, Layers, Activity
} from 'lucide-react';
import type { PatientRecord } from '../api/dhis2';
import { ALL_COUNTIES } from '../data/liberiaData';

interface GeospatialTracingMapProps {
  patients: PatientRecord[];
  onOpenTimeline: (patient: PatientRecord) => void;
}

export const GeospatialTracingMap: React.FC<GeospatialTracingMapProps> = ({
  patients,
  onOpenTimeline
}) => {
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesCounty = selectedCounty === 'All' || p.county === selectedCounty;
    const matchesStatus = statusFilter === 'All' || p.appointmentStatus === statusFilter || p.status === statusFilter;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.community && p.community.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.landmark && p.landmark.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCounty && matchesStatus && matchesSearch;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || filteredPatients[0];

  // Map coordinates projection helper (Liberia roughly lat 4.3 to 8.6, lng -11.5 to -7.3)
  const projectToMap = (lat: number = 6.3156, lng: number = -10.8074) => {
    const minLat = 4.2, maxLat = 8.8;
    const minLng = -11.6, maxLng = -7.2;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const activeCount = patients.filter(p => p.appointmentStatus === 'On Schedule' || p.status === 'On Treatment').length;
  const overdueCount = patients.filter(p => p.appointmentStatus === 'Overdue').length;
  const defaulterCount = patients.filter(p => p.appointmentStatus === 'Defaulter Risk' || p.status === 'Lost to Follow-up').length;

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-health-blue bg-blue-100 px-3 py-1 rounded-full">
            Geospatial Intelligence & Community Tracing
          </span>
          <h2 className="text-2xl font-black text-neutral-900 mt-1">
            Resident Geolocation & Defaulter Retrieval Map
          </h2>
          <p className="text-xs text-neutral-500">
            Overcomes the absence of Liberian street addresses by linking GPS coordinates, landmarks, and Community Health Workers (CHWs).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> On Schedule
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Overdue
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Defaulter / LTFU
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500">Mapped Residents (GPS)</span>
          <p className="text-2xl font-black text-neutral-900 mt-1">{patients.length}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">100% with spatial landmarks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500">Active On Schedule</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Routine community DOTs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500">Appointment Overdue (≤7d)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{overdueCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">CHW phone check-in queued</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/50 shadow-xs">
          <span className="text-xs font-bold text-rose-800">Critical Defaulters (&gt;7d)</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{defaulterCount}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Immediate home visit dispatch</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search patient, community, landmark..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg outline-none focus:border-health-blue"
            />
          </div>

          <select
            value={selectedCounty}
            onChange={e => setSelectedCounty(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-3 py-1.5 font-medium outline-none"
          >
            <option value="All">All 15 Counties</option>
            {ALL_COUNTIES.map(c => <option key={c} value={c}>{c} County</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-3 py-1.5 font-medium outline-none"
          >
            <option value="All">All Adherence Tiers</option>
            <option value="On Schedule">On Schedule (Adherent)</option>
            <option value="Overdue">Overdue (Missed refill)</option>
            <option value="Defaulter Risk">Defaulter Risk (&gt;7 days)</option>
            <option value="Cured">Cured / Completed</option>
          </select>
        </div>

        <span className="text-xs text-neutral-500 font-medium">
          Showing {filteredPatients.length} of {patients.length} patients
        </span>
      </div>

      {/* Main Interactive Map & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Liberia Spatial Canvas Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white relative min-h-[480px] shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Liberia National Geospatial Canvas
              </span>
            </div>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">
              WGS84 Datum · Spatial Clustering Active
            </span>
          </div>

          {/* SVG Map of Liberia Background */}
          <div className="relative w-full h-[360px] my-auto">
            <svg viewBox="0 0 800 500" className="w-full h-full opacity-30 select-none">
              {/* Simplified Liberia territorial polygon */}
              <path
                d="M 120 180 Q 200 120 380 150 Q 520 120 620 220 Q 720 300 680 420 Q 580 440 460 380 Q 320 340 220 290 Q 140 250 120 180 Z"
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* County approximate centers */}
              <text x="260" y="270" fill="#94a3b8" fontSize="14" fontWeight="bold">Montserrado (Monrovia)</text>
              <text x="460" y="210" fill="#64748b" fontSize="12">Nimba</text>
              <text x="360" y="230" fill="#64748b" fontSize="12">Bong</text>
              <text x="340" y="160" fill="#64748b" fontSize="12">Lofa</text>
              <text x="320" y="290" fill="#64748b" fontSize="12">Margibi</text>
              <text x="360" y="320" fill="#64748b" fontSize="12">Grand Bassa</text>
              <text x="590" y="370" fill="#64748b" fontSize="12">Maryland</text>
              <text x="520" y="310" fill="#64748b" fontSize="12">Grand Gedeh</text>
              <text x="440" y="360" fill="#64748b" fontSize="12">Sinoe</text>
            </svg>

            {/* Plotted Patient Pins */}
            {filteredPatients.map(patient => {
              const pos = projectToMap(patient.lat, patient.lng);
              const isSelected = selectedPatient?.id === patient.id;
              const isDefaulter = patient.appointmentStatus === 'Defaulter Risk' || patient.status === 'Lost to Follow-up';
              const isOverdue = patient.appointmentStatus === 'Overdue';
              const isCured = patient.status === 'Cured' || patient.status === 'Completed';

              const pinColor = isDefaulter ? 'bg-rose-500 text-white ring-rose-400' :
                isOverdue ? 'bg-amber-500 text-white ring-amber-400' :
                isCured ? 'bg-blue-500 text-white ring-blue-400' :
                'bg-emerald-500 text-white ring-emerald-400';

              return (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full shadow-lg transition-all transform hover:scale-125 z-20 ${pinColor} ${
                    isSelected ? 'ring-4 ring-offset-2 ring-offset-slate-900 scale-125 z-30' : 'hover:ring-2'
                  }`}
                  title={`${patient.name} (${patient.id}) - ${patient.status}`}
                >
                  <MapPin className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 z-10 border-t border-slate-800 pt-3">
            <span>Atlantic Ocean (Liberian Coastline)</span>
            <span>Click any GPS pin to inspect landmark narrative & dispatch CHW</span>
          </div>
        </div>

        {/* Right Col: Selected Patient Action & Landmark Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-600">
                    {selectedPatient.id}
                  </span>
                  <h3 className="text-lg font-black text-neutral-900 mt-1">{selectedPatient.name}</h3>
                  <p className="text-xs text-neutral-500">
                    {selectedPatient.facility}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  selectedPatient.appointmentStatus === 'Defaulter Risk' ? 'bg-rose-100 text-rose-800' :
                  selectedPatient.appointmentStatus === 'Overdue' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedPatient.appointmentStatus || 'On Schedule'}
                </span>
              </div>

              {/* Landmark Box */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-health-blue font-bold">
                  <Navigation className="h-4 w-4" /> Navigational Landmark Description
                </div>
                <p className="text-neutral-700 italic font-medium">
                  "{selectedPatient.landmark || 'Community center perimeter, yellow kiosk opposite pump'}"
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-200/60">
                  <div>
                    <span className="text-neutral-400 block font-bold">Clan / Borough</span>
                    <span className="font-semibold text-neutral-800">{selectedPatient.clan || 'Greater Monrovia'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-bold">GPS Coordinates</span>
                    <span className="font-mono text-neutral-800">
                      {selectedPatient.lat ? `${selectedPatient.lat.toFixed(4)}, ${selectedPatient.lng?.toFixed(4)}` : '6.3156, -10.8074'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Community Health Worker Linkage */}
              <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-700 font-bold">
                  <User className="h-4 w-4 text-emerald-600" /> Assigned Community Health Worker (CHW)
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800">{selectedPatient.chwName || 'Comfort Mulbah'}</span>
                  <a
                    href={`tel:${selectedPatient.chwPhone || '+231-88-601-9922'}`}
                    className="text-health-blue font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {selectedPatient.chwPhone || '+231-88-601-9922'}
                  </a>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Stationed at: {selectedPatient.chwPost || 'Local Community Health Post'}
                </p>
              </div>

              {/* Defaulter / Overdue Warning if applicable */}
              {selectedPatient.daysOverdue && selectedPatient.daysOverdue > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Patient is {selectedPatient.daysOverdue} days overdue!</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Last appointment missed: {selectedPatient.nextAppointmentDate || '2026-05-10'}. Immediate home visit retrieval is indicated.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    if ((window as any).showToast) {
                      (window as any).showToast(`Dispatch alert sent to CHW ${selectedPatient.chwName || 'Comfort Mulbah'} for ${selectedPatient.name}.`);
                    }
                  }}
                  className="w-full bg-health-blue hover:bg-blue-800 text-white py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5" /> Dispatch CHW Home Retrieval
                </button>

                <button
                  onClick={() => onOpenTimeline(selectedPatient)}
                  className="w-full bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Activity className="h-3.5 w-3.5 text-health-blue" /> View Longitudinal Timeline
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 text-xs italic">
              Select a patient pin on the map to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
