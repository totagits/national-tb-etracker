import { useState, useEffect } from 'react';
import { Activity, Users, AlertTriangle, ShieldCheck, FileText, UserPlus, LogOut, Search, Filter, Download, ArrowRight, HeartPulse, Building2, Server, Briefcase, Calendar, Database, Stethoscope, Headset, CheckCircle2, Clock, BookOpen, Lock, X, Phone, MessageSquare, MapPin, ExternalLink, ChevronRight, BookMarked, GitBranch, LayoutTemplate } from 'lucide-react';
import { ManagerDashboard } from './components/ManagerDashboard';
import { generatePatientReportPDF } from './utils/pdfGenerator';
import { DirectorDashboard } from './components/DirectorDashboard';
import { DHIS2Dashboard } from './components/DHIS2Dashboard';
import { InformaticsDashboard } from './components/InformaticsDashboard';
import { SecurityDashboard } from './components/SecurityDashboard';
import { TrainingDashboard } from './components/TrainingDashboard';
import { HelpdeskDashboard } from './components/HelpdeskDashboard';
import { NationalAdminDashboard } from './components/NationalAdminDashboard';
import { ProgramIndicatorsDashboard } from './components/ProgramIndicatorsDashboard';
import { RegistrationWizard } from './components/RegistrationWizard';
import { PWAInstallBanner, PWAUpdateToast, PWAInstallButton } from './components/PWAInstall';

const facilities = [
  "Redemption Hospital (Montserrado)",
  "JFK Medical Center (Montserrado)",
  "CB Dunbar Hospital (Bong)",
  "Phebe Hospital (Bong)",
  "Jackson F. Doe Hospital (Nimba)",
  "Ganta United Methodist Hospital (Nimba)",
  "Liberian Government Hospital (Grand Bassa)",
  "CH Rennie Hospital (Margibi)",
  "JJ Dossen Hospital (Maryland)",
  "Tellewoyan Hospital (Lofa)",
  "Foya Borma Hospital (Lofa)",
  "Martha Tubman Hospital (Grand Gedeh)",
  "Fish Town Hospital (River Gee)",
  "Rally Time Hospital (Grand Kru)",
  "Barclayville Health Center (Grand Kru)",
  "Sinoe FJ Grante Hospital (Sinoe)",
  "Bomi Hospital (Bomi)",
  "Gbarpolu Health Center (Gbarpolu)",
  "Grand Cape Mount Hospital (Grand Cape Mount)",
  "Rivercess Health Center (Rivercess)"
];

const initialPatients = [
  { id: 'TB-1042', name: 'John Doe', age: 45, sex: 'M', facility: 'JFK Medical Center', status: 'On Treatment' },
  { id: 'TB-1043', name: 'Jane Smith', age: 32, sex: 'F', facility: 'Redemption Hospital', status: 'Presumptive' },
  { id: 'TB-1044', name: 'Michael Johnson', age: 28, sex: 'M', facility: 'CH Rennie Hospital', status: 'Cured' },
  { id: 'TB-1045', name: 'Sarah Williams', age: 51, sex: 'F', facility: 'Phebe Hospital', status: 'Lost to Follow-up' },
  { id: 'TB-1046', name: 'David Brown', age: 39, sex: 'M', facility: 'Jackson F. Doe Hospital', status: 'On Treatment' },
];

const carouselImages = [
  '/assets/tb_exterior.png',
  '/assets/tb_interior.png',
  '/assets/tb_community.png'
];

// ─── Patient Search Panel (proper React component — fixes hook-in-render blink) ──
const PatientSearchPanel = ({ patients, patientSearchTerm, setPatientSearchTerm }: {
  patients: any[]; patientSearchTerm: string; setPatientSearchTerm: (v: string) => void;
}) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [chartPatient, setChartPatient] = useState<any>(null);

  const statusColors: Record<string,string> = {
    'On Treatment':'bg-blue-100 text-blue-800 border border-blue-200',
    'Presumptive':'bg-amber-100 text-amber-800 border border-amber-200',
    'Cured':'bg-green-100 text-green-800 border border-green-200',
    'Lost to Follow-up':'bg-red-100 text-red-800 border border-red-200',
    'Treatment Completed':'bg-green-100 text-green-800 border border-green-200',
    'Failed':'bg-red-100 text-red-800 border border-red-200',
  };
  const allStatuses = ['All','On Treatment','Presumptive','Cured','Lost to Follow-up','Treatment Completed'];
  const filtered = patients.filter(p => {
    const s = p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || p.id.toLowerCase().includes(patientSearchTerm.toLowerCase());
    const m = filterStatus === 'All' || p.status === filterStatus;
    return s && m;
  });

  const getTimeline = (p: any) => [
    { date: '2026-01-15', stage: 'TB Screening', detail: 'Presumptive TB identified. Cough >2 weeks, night sweats reported.', icon: 'S', status: 'done' },
    { date: '2026-01-18', stage: 'Diagnostic Investigation', detail: `GeneXpert MTB/RIF test ordered. Sputum sample collected at ${p.facility}.`, icon: 'D', status: 'done' },
    { date: '2026-01-21', stage: 'TB Diagnosis Confirmed', detail: 'MTB detected, RIF resistance NOT detected. Pulmonary TB confirmed.', icon: 'C', status: 'done' },
    { date: '2026-01-25', stage: 'Treatment Initiated', detail: 'Started on Category 1 regimen: 2HRZE/4HR. Weight: 58 kg.', icon: 'T', status: 'done' },
    { date: '2026-03-01', stage: 'Month 2 Follow-up', detail: 'Sputum smear negative. Weight gain: +3 kg. Adherence: 94%.', icon: 'F', status: 'done' },
    { date: '2026-05-01', stage: 'Month 5 Follow-up', detail: p.status === 'Cured' ? 'End of treatment sputum smear negative. Cured.' : p.status === 'Lost to Follow-up' ? 'Missed appointment. Defaulter tracing initiated.' : 'Ongoing treatment. Next sputum smear scheduled.', icon: 'F', status: p.status === 'On Treatment' ? 'active' : 'done' },
  ];

  const handlePrint = (p: any) => {
    generatePatientReportPDF(p);
  };

  const handleExportCSV = () => {
    const rows = [['TB ID','Name','Age','Sex','Facility','Status'], ...filtered.map(p=>[p.id,p.name,p.age,p.sex,p.facility,p.status])];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = 'tb-patients-' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  };

  const progressPct = (p: any) => p.status === 'Cured' || p.status === 'Treatment Completed' ? 100 : p.status === 'On Treatment' ? 67 : 45;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-neutral-400" />
          <input type="text" placeholder="Search by Name or TB ID" value={patientSearchTerm} onChange={e => setPatientSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-health-blue w-64" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
          {allStatuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} patient{filtered.length !== 1 ? 's' : ''} found</span>
        <button onClick={handleExportCSV} className="border border-neutral-200 text-neutral-600 px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 hover:bg-neutral-50 font-medium">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['TB ID','Patient Name','Age/Sex','Facility','Status','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-neutral-50 cursor-pointer ${selectedPatient?.id === p.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)}>
                  <td className="px-4 py-3 text-sm font-bold text-health-blue">{p.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{p.age}/{p.sex}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{p.facility}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[p.status] ?? 'bg-neutral-100 text-neutral-600'}`}>{p.status}</span></td>
                  <td className="px-4 py-3"><button onClick={e => { e.stopPropagation(); setSelectedPatient(p); }} className="text-xs text-health-blue font-bold hover:underline">View</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-neutral-400 text-sm">No patients match your search criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {selectedPatient ? (
            <>
              <div className="bg-health-blue text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-blue-200 font-bold uppercase">Patient Record</p>
                    <h3 className="text-lg font-black">{selectedPatient.name}</h3>
                    <p className="text-sm text-blue-200">{selectedPatient.id}</p>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="text-blue-200 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {([['Age', `${selectedPatient.age} yrs`], ['Sex', selectedPatient.sex === 'M' ? 'Male' : 'Female'], ['Facility', selectedPatient.facility], ['Status', selectedPatient.status], ['TB Type', 'Pulmonary TB'], ['Regimen', '2HRZE/4HR']] as [string,any][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                    <span className="text-xs font-bold text-neutral-500 uppercase">{k}</span>
                    <span className="text-sm font-bold text-neutral-800">{String(v)}</span>
                  </div>
                ))}
                <div className="pt-1">
                  <p className="text-xs text-neutral-400 mb-1">Treatment Progress</p>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-health-blue rounded-full" style={{width:`${progressPct(selectedPatient)}%`}} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 text-right">{progressPct(selectedPatient)}% complete</p>
                </div>
                <div className="pt-2 space-y-2">
                  <button onClick={() => setChartPatient(selectedPatient)} className="w-full bg-health-blue text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-800 flex items-center justify-center gap-2">
                    <HeartPulse className="h-4 w-4" /> View Full Chart
                  </button>
                  <button onClick={() => handlePrint(selectedPatient)} className="w-full border border-neutral-200 text-neutral-600 py-2 rounded-lg font-bold text-sm hover:bg-neutral-50 flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" /> Print Report
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-center text-neutral-300">
              <div><Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a patient to view their record</p></div>
            </div>
          )}
        </div>
      </div>

      {chartPatient && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-8">
            <div className="bg-gradient-to-r from-health-blue to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-wide mb-1">Full Clinical Record</p>
                  <h2 className="text-2xl font-black">{chartPatient.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-blue-200 text-sm font-bold">{chartPatient.id}</span>
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{chartPatient.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrint(chartPatient)} className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-3 py-2 rounded-lg flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> Print
                  </button>
                  <button onClick={() => setChartPatient(null)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg"><X className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Patient Demographics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['Age',`${chartPatient.age} years`],['Sex',chartPatient.sex==='M'?'Male':'Female'],['Facility',chartPatient.facility],['HIV Status','Negative'],['TB Type','Pulmonary TB'],['Regimen','2HRZE/4HR (Cat.1)'],['Enrolled','2026-01-25'],['Expected End','2026-07-25']].map(([k,v])=>(
                    <div key={k} className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                      <p className="text-xs font-bold text-neutral-400 uppercase">{k}</p>
                      <p className="text-sm font-bold text-neutral-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Treatment Progress</h3>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <div className="flex justify-between text-xs text-neutral-500 mb-2"><span>Month 1</span><span>Month 6</span></div>
                  <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-health-blue to-green-500 rounded-full" style={{width:`${progressPct(chartPatient)}%`}} />
                  </div>
                  <p className="text-xs font-bold text-health-blue mt-2">{chartPatient.status === 'Cured' ? 'Treatment Complete - Cured' : chartPatient.status === 'On Treatment' ? 'Month 4 of 6 - Intensive phase complete' : 'Treatment Interrupted - Tracing Active'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-4">Clinical Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
                  <div className="space-y-4">
                    {getTimeline(chartPatient).map((ev, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-black text-sm z-10 border-2 text-white ${ev.status==='active'?'bg-amber-400 border-amber-300':'bg-health-blue border-blue-300'}`}>{ev.icon}</div>
                        <div className={`flex-1 rounded-xl p-3 border ${ev.status==='active'?'bg-amber-50 border-amber-200':'bg-white border-neutral-200'}`}>
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-neutral-800 text-sm">{ev.stage}</p>
                            <span className="text-xs text-neutral-400 font-mono">{ev.date}</span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">{ev.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Bacteriological Results</h3>
                <table className="min-w-full bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  <thead className="bg-neutral-50"><tr>{['Test Date','Test Type','Result','Lab'].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr><td className="px-4 py-2 text-xs">2026-01-18</td><td className="px-4 py-2 text-xs">GeneXpert MTB/RIF</td><td className="px-4 py-2 text-xs font-bold text-red-600">MTB Detected / RIF Susceptible</td><td className="px-4 py-2 text-xs">{chartPatient.facility}</td></tr>
                    <tr><td className="px-4 py-2 text-xs">2026-01-19</td><td className="px-4 py-2 text-xs">Sputum Smear (AFB)</td><td className="px-4 py-2 text-xs font-bold text-amber-600">2+ Positive</td><td className="px-4 py-2 text-xs">{chartPatient.facility}</td></tr>
                    <tr><td className="px-4 py-2 text-xs">2026-03-01</td><td className="px-4 py-2 text-xs">Sputum Smear (Month 2)</td><td className="px-4 py-2 text-xs font-bold text-green-600">Negative</td><td className="px-4 py-2 text-xs">{chartPatient.facility}</td></tr>
                    {chartPatient.status === 'Cured' && <tr><td className="px-4 py-2 text-xs">2026-07-01</td><td className="px-4 py-2 text-xs">End of Treatment Smear</td><td className="px-4 py-2 text-xs font-bold text-green-600">Negative - Cured</td><td className="px-4 py-2 text-xs">{chartPatient.facility}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Defaulter List Panel (proper React component — fixes hook-in-render blink) ─
const DEFAULTERS_DATA = [
  { id:'TB-1045', name:'Sarah Williams',   facility:'Phebe Hospital (Bong)',              lastContact:'2026-05-14', daysOverdue:7,  phone:'+231 770 234 567', status:'Not Contacted' },
  { id:'TB-1052', name:'Joseph Kollie',    facility:'Tellewoyan Hospital (Lofa)',          lastContact:'2026-05-10', daysOverdue:11, phone:'+231 886 112 334', status:'In Progress'   },
  { id:'TB-1058', name:'Grace Sumo',       facility:'JJ Dossen Hospital (Maryland)',       lastContact:'2026-05-08', daysOverdue:13, phone:'+231 770 887 221', status:'Not Contacted' },
  { id:'TB-1061', name:'Emmanuel Toe',     facility:'Rally Time Hospital (Grand Kru)',     lastContact:'2026-05-05', daysOverdue:16, phone:'Unknown',          status:'Escalated'     },
  { id:'TB-1067', name:'Martha Nyahn',     facility:'Gbarpolu Health Center',              lastContact:'2026-05-03', daysOverdue:18, phone:'+231 886 445 223', status:'In Progress'   },
  { id:'TB-1073', name:'Thomas Freeman',   facility:'Martha Tubman Hospital (Grand Gedeh)',lastContact:'2026-04-28', daysOverdue:23, phone:'+231 770 998 112', status:'Escalated'     },
  { id:'TB-1079', name:'Rebecca Kamara',   facility:'Fish Town Hospital (River Gee)',      lastContact:'2026-04-22', daysOverdue:29, phone:'Unknown',          status:'Escalated'     },
];

const DefaulterListPanel = () => {
  const [defaulters, setDefaulters] = useState(DEFAULTERS_DATA);
  const [traceTarget, setTraceTarget] = useState<any>(null);
  const [traceForm, setTraceForm] = useState({ method:'Phone Call', notes:'', outcome:'No Answer', nextAction:'' });

  const urgencyColor = (days: number) => days >= 21 ? 'bg-red-100 text-red-800 border-red-200' : days >= 14 ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-amber-100 text-amber-800 border-amber-200';
  const tracingColor: Record<string,string> = {
    'Not Contacted':'bg-neutral-100 text-neutral-600 border-neutral-200',
    'In Progress':'bg-blue-100 text-blue-700 border-blue-200',
    'Escalated':'bg-red-100 text-red-700 border-red-200',
    'Contacted':'bg-green-100 text-green-700 border-green-200',
  };

  const submitTrace = () => {
    setDefaulters(prev => prev.map(d => d.id === traceTarget.id ? { ...d, status: traceForm.outcome === 'Patient Located' ? 'Contacted' : 'In Progress', lastContact: new Date().toISOString().slice(0,10) } : d));
    (window as any).showToast(`Tracing log saved for ${traceTarget.name}. Status updated.`);
    setTraceTarget(null);
    setTraceForm({ method:'Phone Call', notes:'', outcome:'No Answer', nextAction:'' });
  };

  return (
    <div className="space-y-5">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-red-800">Urgent Tracing Required — {defaulters.filter(d => d.status !== 'Contacted').length} patients are overdue for treatment check-in</p>
          <p className="text-xs text-red-600 mt-0.5">Patients missing 2+ consecutive monthly visits. Immediate outreach required per national TB protocols (NTP-SOP-04).</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Defaulters', val: defaulters.length, color:'text-red-700', bg:'bg-red-50' },
          { label:'Escalated', val: defaulters.filter(d=>d.status==='Escalated').length, color:'text-orange-700', bg:'bg-orange-50' },
          { label:'In Progress', val: defaulters.filter(d=>d.status==='In Progress').length, color:'text-blue-700', bg:'bg-blue-50' },
          { label:'Contacted', val: defaulters.filter(d=>d.status==='Contacted').length, color:'text-green-700', bg:'bg-green-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h3 className="font-bold text-neutral-800">Defaulter Tracing Queue</h3>
          <button onClick={() => (window as any).showToast('Defaulter list exported.')} className="border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-neutral-50 font-medium">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['TB ID','Patient Name','Facility','Last Contact','Days Overdue','Phone','Tracing Status','Action'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {defaulters.map(d => (
                <tr key={d.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-bold text-health-blue">{d.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800">{d.name}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{d.facility}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{d.lastContact}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-black px-2.5 py-1 rounded-full border ${urgencyColor(d.daysOverdue)}`}>{d.daysOverdue} days</span></td>
                  <td className="px-4 py-3 text-xs text-neutral-600 flex items-center gap-1"><Phone className="h-3 w-3 text-neutral-400"/>{d.phone}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tracingColor[d.status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>{d.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setTraceTarget(d)} className="text-xs bg-health-blue text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracing Modal */}
      {traceTarget && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[560px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-health-blue text-white p-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-200 font-bold uppercase">Patient Tracing Log</p>
                <h3 className="text-xl font-black">{traceTarget.name}</h3>
                <p className="text-sm text-blue-200">{traceTarget.id} · {traceTarget.facility}</p>
              </div>
              <button onClick={() => setTraceTarget(null)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center bg-red-50 rounded-xl p-3 border border-red-100">
                <div><p className="text-xs font-bold text-red-500 uppercase">Days Overdue</p><p className="text-2xl font-black text-red-700">{traceTarget.daysOverdue}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 uppercase">Last Contact</p><p className="text-sm font-bold text-neutral-700">{traceTarget.lastContact}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 uppercase">Phone</p><p className="text-sm font-bold text-neutral-700">{traceTarget.phone}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1">Contact Method</label>
                  <select value={traceForm.method} onChange={e => setTraceForm(p => ({...p, method: e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Phone Call','SMS','Home Visit','Community Health Worker','Facility Contact'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-600 block mb-1">Outcome</label>
                  <select value={traceForm.outcome} onChange={e => setTraceForm(p => ({...p, outcome: e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['No Answer','Phone Off','Patient Located','Referred to Another Facility','Deceased (Reported)','Refused Treatment'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Notes</label>
                <textarea value={traceForm.notes} onChange={e => setTraceForm(p => ({...p, notes: e.target.value}))} rows={3}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="Describe the tracing attempt, who was spoken to, location details…" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Next Action</label>
                <input value={traceForm.nextAction} onChange={e => setTraceForm(p => ({...p, nextAction: e.target.value}))}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"
                  placeholder="e.g. Schedule home visit for May 25, 2026" />
              </div>
            </div>
            <div className="bg-neutral-50 border-t p-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setTraceTarget(null)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={submitTrace} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Save Trace Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const allRoles = [
  { id: 'national_admin', name: 'MoH National System Admin', group: 'Clinical Platform' },
  { id: 'facility_clerk', name: 'MoH Facility Data Clerk', group: 'Clinical Platform' },
  { id: 'director', name: 'Project Director', group: 'Implementation Team' },
  { id: 'manager', name: 'Project Manager', group: 'Implementation Team' },
  { id: 'dhis2', name: 'DHIS2 Config Specialist', group: 'Implementation Team' },
  { id: 'health_info', name: 'Health Informatics Specialist', group: 'Implementation Team' },
  { id: 'security', name: 'Data Security & QA Lead', group: 'Implementation Team' },
  { id: 'training', name: 'Training Coordinator', group: 'Implementation Team' },
  { id: 'helpdesk', name: 'Helpdesk & Support Officer', group: 'Implementation Team' }
];

function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard' | 'about' | 'docs'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [docTab, setDocTab] = useState('architecture');
  const [selectedRoleId, setSelectedRoleId] = useState('national_admin');
  const [toastMessage, setToastMessage] = useState('');
  const [patients, setPatients] = useState(initialPatients);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const handleRegisterPatient = (newPatient: any) => {
    setPatients([newPatient, ...patients]);
  };

  useEffect(() => {
    (window as any).showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3000);
    };
  }, []);

  useEffect(() => {
    if (view === 'landing') {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [view]);

  const handleLogin = () => {
    const tabs = getTabsForRole(selectedRoleId);
    if (tabs.length > 0) setActiveTab(tabs[0].id);
    setView('dashboard');
  };

  const getTabsForRole = (roleId: string) => {
    switch(roleId) {
      case 'national_admin': 
        return [
          { id: 'dashboard', icon: Activity, label: 'National Dashboard' },
          { id: 'registration', icon: UserPlus, label: 'Registration Wizard' },
          { id: 'search', icon: Users, label: 'Patient Search' },
          { id: 'defaulters', icon: AlertTriangle, label: 'Defaulter List' },
          { id: 'reports', icon: FileText, label: 'System Reports' }
        ];
      case 'facility_clerk':
        return [
          { id: 'registration', icon: UserPlus, label: 'Registration Wizard' },
          { id: 'search', icon: Users, label: 'Facility Patients' },
          { id: 'defaulters', icon: AlertTriangle, label: 'Defaulter List' }
        ];
      case 'director': 
        return [
          { id: 'exec', icon: Briefcase, label: 'Overall Contractual Leadership' }, 
          { id: 'stakeholders', icon: Users, label: 'Stakeholder Engagement' },
          { id: 'oversight', icon: Activity, label: 'Implementation Oversight' },
          { id: 'quality', icon: CheckCircle2, label: 'Quality Assurance' },
          { id: 'communication', icon: FileText, label: 'Executive Communication' }
        ];
      case 'manager': 
        return [
          { id: 'workplan', icon: Calendar, label: 'Day-to-day Workplan Management' }, 
          { id: 'meeting', icon: Users, label: 'Meeting Coordination' },
          { id: 'risks', icon: AlertTriangle, label: 'Risk Tracking' },
          { id: 'reporting', icon: FileText, label: 'Progress Reporting' },
          { id: 'deliverables', icon: CheckCircle2, label: 'Deliverables Control' }
        ];
      case 'dhis2': 
        return [
          { id: 'tracker_design', icon: Database, label: 'Tracker Program Design' }, 
          { id: 'metadata', icon: Server, label: 'Metadata Configuration' },
          { id: 'stages_elements', icon: FileText, label: 'Program Stages & Data Elements' },
          { id: 'option_sets', icon: Filter, label: 'Option Sets' },
          { id: 'rules', icon: ShieldCheck, label: 'Program Rules & Validation' },
          { id: 'indicators', icon: Activity, label: 'Indicators' }
        ];
      case 'health_info': 
        return [
          { id: 'workflow', icon: Stethoscope, label: 'TB Cascade Mapping' }, 
          { id: 'validation', icon: CheckCircle2, label: 'Clinical/Programmatic Workflow Validation' },
          { id: 'logic', icon: FileText, label: 'Reporting Logic' },
          { id: 'cohort', icon: Activity, label: 'Cohort Analysis' },
          { id: 'uat_support', icon: Users, label: 'User Acceptance Support' }
        ];
      case 'security': 
        return [
          { id: 'review', icon: ShieldCheck, label: 'Security Review' }, 
          { id: 'test_plans', icon: FileText, label: 'Test Plans' },
          { id: 'uat', icon: AlertTriangle, label: 'Bug Tracking & UAT Support' },
          { id: 'audit', icon: Users, label: 'Role-Based Access Verification' },
          { id: 'compliance', icon: Lock, label: 'Data Protection Compliance' }
        ];
      case 'training': 
        return [
          { id: 'materials', icon: BookOpen, label: 'Training Materials & Job Aids' }, 
          { id: 'rollout', icon: Building2, label: 'Site-Level Rollout Coordination' },
          { id: 'attendance', icon: Users, label: 'Attendance Records' },
          { id: 'post_training', icon: Headset, label: 'Post-Training Support' }
        ];
      case 'helpdesk': 
        return [
          { id: 'logging', icon: FileText, label: 'Issue Logging & Response Tracking' }, 
          { id: 'troubleshooting', icon: Server, label: 'Troubleshooting & Bug Fixes' },
          { id: 'tickets', icon: Headset, label: 'User Support' },
          { id: 'sla', icon: Clock, label: 'Monthly Support Summaries' }
        ];
      default: return [];
    }
  };

  const renderPublicHeader = () => (
    <header className="bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
        <img src="/assets/moh_logo.png" alt="MoH Liberia" className="h-12 w-auto object-contain" />
        <div className="hidden md:block">
          <h1 className="font-bold text-xl leading-tight text-neutral-900">Ministry of Health</h1>
          <p className="text-[10px] text-health-blue uppercase tracking-widest font-semibold">Republic of Liberia</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button onClick={() => setView('about')} className={`text-sm font-medium transition-colors ${view === 'about' ? 'text-health-blue' : 'text-neutral-600 hover:text-health-blue'}`}>About Platform</button>
        <button onClick={() => setView('docs')} className={`text-sm font-medium transition-colors ${view === 'docs' ? 'text-health-blue' : 'text-neutral-600 hover:text-health-blue'}`}>Documentation</button>
        <button 
          onClick={() => setView('login')}
          className="bg-health-blue text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-blue-800 transition-all shadow-md hover:shadow-lg flex items-center space-x-1"
        >
          <span>Secure Login</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );

  const renderDashboardContent = () => {
    // Clinical Tabs
    if (activeTab === 'dashboard') {
      return <NationalAdminDashboard />;
    }

    if (activeTab === 'registration') {
      return <RegistrationWizard facilities={facilities} onRegister={handleRegisterPatient} />;
    }

    if (activeTab === 'search') {
      return <PatientSearchPanel patients={patients} patientSearchTerm={patientSearchTerm} setPatientSearchTerm={setPatientSearchTerm} />;
    }

    if (activeTab === 'defaulters') {
      return <DefaulterListPanel />;
    }

    if (activeTab === 'reports') {
      return <ProgramIndicatorsDashboard />;
    }

    // Implementation Tabs
    if (['exec', 'stakeholders', 'oversight', 'quality', 'communication'].includes(activeTab)) return <DirectorDashboard activeTab={activeTab} />;
    if (['workplan', 'meeting', 'risks', 'reporting', 'deliverables'].includes(activeTab)) return <ManagerDashboard activeTab={activeTab} />;
    if (['tracker_design', 'metadata', 'stages_elements', 'option_sets', 'rules', 'indicators'].includes(activeTab)) return <DHIS2Dashboard activeTab={activeTab} />;
    if (['workflow', 'validation', 'logic', 'cohort', 'uat_support'].includes(activeTab)) return <InformaticsDashboard activeTab={activeTab} />;
    if (['review', 'test_plans', 'uat', 'audit', 'compliance'].includes(activeTab)) return <SecurityDashboard activeTab={activeTab} />;
    if (['materials', 'rollout', 'attendance', 'post_training'].includes(activeTab)) return <TrainingDashboard activeTab={activeTab} />;
    if (['logging', 'troubleshooting', 'tickets', 'sla'].includes(activeTab)) return <HelpdeskDashboard activeTab={activeTab} />;

    return null;
  };

  // Static Views
  if (view === 'about') {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans flex flex-col">
        {renderPublicHeader()}
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-neutral-900 mb-4">About the National TB e-Tracker</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">A strategic health intervention built to digitize, secure, and accelerate Tuberculosis care across the Republic of Liberia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 text-center"><HeartPulse className="h-10 w-10 text-health-blue mx-auto mb-4" /><h3 className="text-lg font-bold mb-2">Clinical Precision</h3><p className="text-sm text-neutral-600">Enforces national TB/HIV guidelines via automated DHIS2 validation rules.</p></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 text-center"><Building2 className="h-10 w-10 text-health-blue mx-auto mb-4" /><h3 className="text-lg font-bold mb-2">15-County Scale</h3><p className="text-sm text-neutral-600">Designed for immediate deployment across 31 high-burden facilities.</p></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 text-center"><Server className="h-10 w-10 text-health-blue mx-auto mb-4" /><h3 className="text-lg font-bold mb-2">DHIS2 Native</h3><p className="text-sm text-neutral-600">Acts as a seamless, stateless lens over the National HMIS. 100% data sovereignty.</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
            <h3 className="text-2xl font-bold mb-8 border-b border-neutral-100 pb-4 text-center">Project Stakeholders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name:'Ministry of Health, Liberia', role:'Program Owner & National HMIS Authority', url:'https://moh-lr.org/', logo:'/assets/moh_logo.png', initials:'MoH', bg:'bg-health-blue', text:'text-white', desc:'The MoH leads all national TB programme policy, coordinates health system delivery, and owns the national DHIS2 instance on which this platform operates.' },
                { name:'Plan International Liberia', role:'Implementing Partner & Project Lead', url:'https://plan-international.org/liberia/', initials:'PLAN', bg:'bg-blue-100', text:'text-health-blue', desc:'Plan International is the primary implementing partner for the TB e-Tracker project, responsible for project management, training rollout, and stakeholder engagement across all 15 counties.' },
                { name:'The Global Fund', role:'Funder — TB Grant Cycle 7', url:'https://www.theglobalfund.org/', initials:'GF', bg:'bg-green-100', text:'text-green-700', desc:'The Global Fund finances this initiative through the Liberia TB/HIV Cycle 7 grant, with accountability to national epidemiological targets and WHO End TB Strategy milestones.' },
              ].map(s => (
                <div key={s.name} className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`${s.bg} p-6 flex items-center justify-center`}>
                    {s.logo ? <img src={s.logo} alt={s.name} className="h-16 object-contain" /> : <span className={`text-3xl font-black ${s.text}`}>{s.initials}</span>}
                  </div>
                  <div className="p-5">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-bold text-neutral-800 hover:text-health-blue flex items-center gap-1 group">
                      {s.name}<ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-xs text-health-blue font-bold mt-0.5 mb-3">{s.role}</p>
                    <p className="text-sm text-neutral-600">{s.desc}</p>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-health-blue font-bold hover:underline">
                      <MapPin className="h-3.5 w-3.5" /> Visit Official Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'docs') {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans flex flex-col">
        {renderPublicHeader()}
        <main className="flex-1 w-full max-w-7xl mx-auto flex py-8 px-6 gap-8">
          <div className="w-64 flex-shrink-0">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Official Documentation</h3>
            <nav className="space-y-1">
              <button onClick={() => setDocTab('metadata_dict')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${docTab === 'metadata_dict' ? 'bg-health-blue text-white' : 'text-neutral-700 hover:bg-neutral-200'}`}>Metadata Dictionary</button>
              <button onClick={() => setDocTab('sys_config')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${docTab === 'sys_config' ? 'bg-health-blue text-white' : 'text-neutral-700 hover:bg-neutral-200'}`}>System Config Details</button>
              <button onClick={() => setDocTab('workflow_diag')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${docTab === 'workflow_diag' ? 'bg-health-blue text-white' : 'text-neutral-700 hover:bg-neutral-200'}`}>Workflow Diagrams</button>
              <button onClick={() => setDocTab('user_guides')} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${docTab === 'user_guides' ? 'bg-health-blue text-white' : 'text-neutral-700 hover:bg-neutral-200'}`}>User Guides</button>
            </nav>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {docTab === 'metadata_dict' && (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div><h2 className="text-3xl font-bold text-neutral-900">DHIS2 Metadata Dictionary</h2><p className="text-neutral-500 mt-1 text-sm">Version 2.4.1 — Last updated 10 May 2026 · National TB e-Tracker</p></div>
                  <button onClick={() => (window as any).showToast('Downloading Metadata Dictionary XML…')} className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm flex-shrink-0"><Download className="h-4 w-4"/> Download XML</button>
                </div>
                {[
                  { section:'Tracked Entity Attributes (TEA)', icon: BookMarked, items:[
                    { id:'TEA-001', name:'Last Name', type:'TEXT', mandatory:true, searchable:true },
                    { id:'TEA-002', name:'First Name', type:'TEXT', mandatory:true, searchable:true },
                    { id:'TEA-003', name:'Date of Birth', type:'DATE', mandatory:true, searchable:false },
                    { id:'TEA-004', name:'Sex', type:'TEXT (Option Set)', mandatory:true, searchable:false },
                    { id:'TEA-005', name:'TB Registration ID', type:'TEXT (Auto-generated)', mandatory:true, searchable:true },
                    { id:'TEA-009', name:'County', type:'TEXT (Option Set)', mandatory:true, searchable:true },
                    { id:'TEA-010', name:'Facility', type:'ORGANISATION_UNIT', mandatory:true, searchable:true },
                    { id:'TEA-008', name:'HIV Status', type:'TEXT (Option Set)', mandatory:false, searchable:false },
                  ]},
                  { section:'Program Stages', icon: GitBranch, items:[
                    { id:'PS-01', name:'TB Screening & Presumptive Identification', type:'Non-repeatable · Day 0', mandatory:true, searchable:false },
                    { id:'PS-02', name:'Diagnostic Investigation', type:'Non-repeatable · Day 7', mandatory:true, searchable:false },
                    { id:'PS-03', name:'TB Diagnosis Confirmation', type:'Non-repeatable · Day 14', mandatory:true, searchable:false },
                    { id:'PS-04', name:'Treatment Initiation', type:'Non-repeatable · Day 21', mandatory:true, searchable:false },
                    { id:'PS-05', name:'Monthly Treatment Follow-up', type:'Repeatable · Day 30+', mandatory:true, searchable:false },
                    { id:'PS-07', name:'HIV/TB Co-infection Assessment', type:'Non-repeatable · Day 14', mandatory:false, searchable:false },
                    { id:'PS-08', name:'Treatment Outcome Recording', type:'Non-repeatable · Day 180', mandatory:true, searchable:false },
                  ]},
                  { section:'Option Sets', icon: LayoutTemplate, items:[
                    { id:'OS-004', name:'Treatment Outcome', type:'Cured · Treatment Completed · Failed · LTFU · Died', mandatory:false, searchable:false },
                    { id:'OS-003', name:'Treatment Regimen', type:'1st Line · 2nd Line · Retreatment', mandatory:false, searchable:false },
                    { id:'OS-009', name:'County (all 15)', type:'Montserrado · Nimba · Bong · Margibi · Lofa · [+10 more]', mandatory:false, searchable:false },
                    { id:'OS-007', name:'Diagnostic Test', type:'GeneXpert · Smear · Culture · Clinical', mandatory:false, searchable:false },
                  ]},
                ].map(grp => { const Icon = grp.icon; return (
                  <div key={grp.section}>
                    <h3 className="font-bold text-neutral-700 text-base flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100"><Icon className="h-5 w-5 text-health-blue"/>{grp.section}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-100 text-sm">
                        <thead><tr className="bg-neutral-50">{['ID','Name / Description','Value Type / Options','Mandatory','Searchable'].map(h=><th key={h} className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                          {grp.items.map(it=>(
                            <tr key={it.id} className="hover:bg-neutral-50">
                              <td className="px-3 py-2 text-xs font-bold text-neutral-400 font-mono">{it.id}</td>
                              <td className="px-3 py-2 font-bold text-neutral-800">{it.name}</td>
                              <td className="px-3 py-2 text-xs text-neutral-600">{it.type}</td>
                              <td className="px-3 py-2">{it.mandatory ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <span className="text-neutral-300">—</span>}</td>
                              <td className="px-3 py-2">{it.searchable ? <CheckCircle2 className="h-4 w-4 text-blue-500"/> : <span className="text-neutral-300">—</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );})}
              </div>
            )}
            {docTab === 'sys_config' && (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div><h2 className="text-3xl font-bold text-neutral-900">System Configuration Details</h2><p className="text-neutral-500 mt-1 text-sm">Technical architecture, deployment environment, and API specifications</p></div>
                  <button onClick={() => (window as any).showToast('Downloading System Config PDF…')} className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm flex-shrink-0"><Download className="h-4 w-4"/> Export PDF</button>
                </div>
                {[
                  { label:'Deployment Environment', items:[['Platform','Google Cloud Run (Fully managed, serverless)'],['DHIS2 Version','2.41.3 (Stable release)'],['Frontend Framework','React 18 + TypeScript + Vite'],['Styling','Tailwind CSS v4'],['Database','PostgreSQL 15 (managed by DHIS2)'],['Authentication','DHIS2 OAuth2 + Role-Based Access Control (RBAC)'],['TLS/SSL','Auto-renewed via Cloud Run · Let\'s Encrypt'],['Region','us-central1 (Iowa, USA)'],['Disaster Recovery','Automated Cloud Run revision rollback']] },
                  { label:'DHIS2 API Integration', items:[['Base URL','https://dhis2.moh.gov.lr/api/'],['API Version','v41'],['Tracker API Endpoint','/api/v41/tracker/enrollments'],['Analytics Endpoint','/api/v41/analytics/events/query'],['Data Value API','/api/v41/dataValueSets'],['Auth Method','Bearer Token (per-user DHIS2 PAT)'],['Sync Frequency','Every 30 minutes (online) · On-demand (offline Android)']] },
                  { label:'Facility Infrastructure (31 sites, 15 counties)', items:[['Online Facilities','24 of 31 (4G LTE or WiFi)'],['Offline-capable Facilities','7 (DHIS2 Android Capture app)'],['Android Device Model','Samsung Galaxy Tab A8 / A9'],['Sync Mechanism','DHIS2 Android Capture 3.1.x — local SQLite → Cloud sync'],['Network Fallback','SIM card (MTN/Orange) data plan'],['Device Management','MDM via Google Workspace for Education']] },
                  { label:'Security Configuration', items:[['Data Encryption','AES-256 at rest · TLS 1.3 in transit'],['Session Timeout','30 minutes of inactivity'],['Failed Login Policy','5 attempts → 30-min lockout'],['Audit Logging','All data entry events logged with user ID + timestamp'],['Patient Data Scope','Org-unit restricted (facility clerks see own facility only)'],['HIV Field Access','TB/HIV Officers only (DHIS2 sharing rules)'],['Backup Frequency','Daily automated backup with 30-day retention']] },
                ].map(section => (
                  <div key={section.label} className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="px-5 py-3 bg-health-blue text-white"><h3 className="font-bold">{section.label}</h3></div>
                    <div className="divide-y divide-neutral-100">
                      {section.items.map(([k,v]) => (
                        <div key={k} className="px-5 py-2.5 flex gap-4">
                          <span className="text-xs font-bold text-neutral-500 uppercase w-52 flex-shrink-0 pt-0.5">{k}</span>
                          <span className="text-sm text-neutral-700 font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {docTab === 'workflow_diag' && (
              <div className="p-8 space-y-6">
                <div><h2 className="text-3xl font-bold text-neutral-900">Workflow Diagrams</h2><p className="text-neutral-500 mt-1 text-sm">TB cascade logic from presumptive identification to treatment outcome — per WHO End TB Strategy & NTP Liberia guidelines</p></div>
                {[
                  { title:'1. TB Screening & Enrollment Workflow', color:'border-purple-500', steps:[
                    { label:'Patient arrives at facility', note:'Walk-in or CHW referral', icon:'👤' },
                    { label:'WHO 4-symptom screen', note:'Cough > 2wk · Night sweats · Weight loss · Fever', icon:'🩺' },
                    { label:'AI risk score assigned', note:'Low / Medium / High / Confirmed Presumptive', icon:'🤖' },
                    { label:'If Presumptive → Diagnostic Investigation (PS-02)', note:'GeneXpert MTB/RIF or Smear Microscopy ordered', icon:'🔬' },
                    { label:'If confirmed → Enrollment & treatment initiation', note:'DHIS2 Tracker enrollment created · TB Registration ID auto-generated', icon:'📋' },
                  ]},
                  { title:'2. Treatment & Follow-up Workflow', color:'border-green-500', steps:[
                    { label:'Treatment Initiation (PS-04)', note:'1st Line: 2HRZE/4HR · Regimen assigned by clinician', icon:'💊' },
                    { label:'Monthly Follow-up (PS-05, repeatable)', note:'DOT adherence recorded · Drug pickup confirmed', icon:'📅' },
                    { label:'Sputum conversion check (PS-06)', note:'End of intensive phase (month 2) · End of treatment (month 6)', icon:'🧪' },
                    { label:'HIV/TB co-infection assessment (PS-07)', note:'HIV test if unknown status · CPT/ART enrollment if positive', icon:'❤️‍🩹' },
                    { label:'Treatment Outcome (PS-08)', note:'Cured / Completed / Failed / LTFU / Died · Cascade closed', icon:'✅' },
                  ]},
                  { title:'3. Defaulter Detection & Tracing Workflow', color:'border-red-500', steps:[
                    { label:'System flags patient as defaulter', note:'Missing 2+ consecutive monthly visits', icon:'🚨' },
                    { label:'Alert sent to Facility Data Clerk', note:'Defaulter list populated in TB e-Tracker dashboard', icon:'📊' },
                    { label:'Tracing attempt logged', note:'Phone call · SMS · Home visit · CHW contact', icon:'📞' },
                    { label:'Status updated in DHIS2', note:'In Progress → Contacted → Returned to Treatment OR LTFU confirmed', icon:'🔄' },
                    { label:'Escalation if no contact after 14 days', note:'County TB Officer notified · Case escalated to health supervisor', icon:'⬆️' },
                  ]},
                ].map(wf => (
                  <div key={wf.title} className={`border-l-4 ${wf.color} bg-white rounded-r-xl border border-neutral-200 shadow-sm overflow-hidden`}>
                    <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50"><h3 className="font-bold text-neutral-800">{wf.title}</h3></div>
                    <div className="p-5">
                      <div className="space-y-3">
                        {wf.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-base">{step.icon}</div>
                              {i < wf.steps.length - 1 && <div className="w-0.5 h-6 bg-neutral-200 mt-1" />}
                            </div>
                            <div className="pt-1">
                              <p className="font-bold text-sm text-neutral-800">{step.label}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{step.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {docTab === 'user_guides' && (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div><h2 className="text-3xl font-bold text-neutral-900">User Guides</h2><p className="text-neutral-500 mt-1 text-sm">Role-specific manuals for all TB e-Tracker users</p></div>
                  <button onClick={() => (window as any).showToast('Downloading complete User Guide Pack…')} className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm flex-shrink-0"><Download className="h-4 w-4"/> Download All</button>
                </div>
                {[
                  { role:'MoH Facility Data Clerk', icon:'🏥', sections:[
                    { title:'Getting Started — Login & Dashboard Overview', steps:['Open the TB e-Tracker at the facility URL on your tablet or desktop browser.','Select your role: MoH Facility Data Clerk.','Authenticate using your DHIS2 username and password (provided by your County TB Officer).','You will land on the Registration Wizard. All actions are restricted to your assigned facility.'] },
                    { title:'Registering a New TB Patient', steps:['Click Registration Wizard in the left menu.','Enter the patient\'s demographic details (Last Name, First Name, Date of Birth, Sex, County, Facility).','The system will auto-check for existing registrations using the same name + date of birth.','Complete all mandatory fields (marked with *) and click Submit.','A TB Registration ID (e.g. TB-1089) will be auto-generated and displayed. Record this on the patient\'s paper card.'] },
                    { title:'Searching for an Existing Patient', steps:['Click Facility Patients in the left menu.','Type the patient name or TB Registration ID in the search box.','Filter by treatment status if needed.','Click View on a patient row to open their record.'] },
                    { title:'Defaulter Tracing', steps:['Click Defaulter List to see patients overdue for follow-up.','Click Trace next to a patient name.','A form will appear — record your contact method (phone/home visit), outcome, and notes.','The system will update the patient\'s tracing status. Escalate to your supervisor if the patient cannot be located within 14 days.'] },
                  ]},
                  { role:'MoH National System Administrator', icon:'🛡️', sections:[
                    { title:'National Dashboard Overview', steps:['After logging in, you see the National Dashboard with live TB cascade metrics across all 15 counties.','Use the county filter to drill down to a specific county.','All 31 facilities are represented in the data.'] },
                    { title:'Patient Search (National Scope)', steps:['Click Patient Search in the left menu.','You can search all patients across all facilities (unlike facility clerks who only see their own facility).','Use the status filter to find patients by treatment status.','Click View to see individual patient records.'] },
                    { title:'System Reports', steps:['Click System Reports to access DHIS2-generated program indicators.','View Treatment Success Rate, Case Detection Rate, LTFU Rate, and more.','Reports can be filtered by county and time period.','Use the Export button to download data for quarterly WHO/Global Fund reporting.'] },
                  ]},
                  { role:'DHIS2 Configuration Specialist', icon:'⚙️', sections:[
                    { title:'Accessing the Configuration Dashboard', steps:['Log in as DHIS2 Config Specialist.','Use the left menu to navigate: Tracker Program Design · Metadata Config · Program Stages · Option Sets · Program Rules · Indicators.'] },
                    { title:'Updating Option Sets', steps:['Navigate to Option Sets.','Click on the option set you want to modify (e.g. County, Treatment Outcome).','Click Edit to enter editing mode.','Add or remove options. Click Save.','All changes are version-tracked in the Metadata History log.'] },
                    { title:'Activating/Deactivating Program Rules', steps:['Navigate to Program Rules & Validation.','Review the rule\'s condition and action before changing its status.','Click Deactivate to take a rule offline for testing.','Click Activate to push it back into production.','Never deactivate the duplicate TB ID detection rule (PR-006) without Director approval.'] },
                  ]},
                ].map(guide => (
                  <div key={guide.role} className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex items-center gap-3">
                      <span className="text-2xl">{guide.icon}</span>
                      <div>
                        <h3 className="font-bold text-neutral-800">{guide.role}</h3>
                        <p className="text-xs text-neutral-400">{guide.sections.length} sections · {guide.sections.reduce((s,sec) => s + sec.steps.length, 0)} steps</p>
                      </div>
                      <button onClick={() => (window as any).showToast(`Downloading ${guide.role} guide…`)} className="ml-auto border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white">
                        <Download className="h-3.5 w-3.5"/> Download
                      </button>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {guide.sections.map(sec => (
                        <div key={sec.title} className="px-5 py-4">
                          <h4 className="font-bold text-sm text-neutral-700 mb-3 flex items-center gap-2"><ChevronRight className="h-4 w-4 text-health-blue"/>{sec.title}</h4>
                          <ol className="space-y-1.5 list-decimal list-inside">
                            {sec.steps.map((step, i) => <li key={i} className="text-sm text-neutral-600 leading-relaxed">{step}</li>)}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-neutral-50 font-sans flex flex-col">
        {renderPublicHeader()}
        <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-12 gap-12 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold tracking-wide uppercase mb-2">Official Digital Public Good</div>
            <h2 className="text-5xl font-extrabold text-neutral-900 leading-tight tracking-tight">National TB e-Tracker <br/><span className="text-health-blue">Modernizing Care.</span></h2>
            <p className="text-lg text-neutral-600 max-w-xl">A comprehensive, DHIS2-native digital tracking platform designed to accelerate TB case detection, enforce clinical guidelines, and secure treatment outcomes across all 15 counties of Liberia.</p>
            <div className="flex items-center space-x-4 pt-2">
              <button onClick={() => setView('login')} className="bg-health-blue text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-all shadow-lg text-lg flex items-center space-x-2"><span>Access Dashboard</span><ArrowRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="flex-1 relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
             {carouselImages.map((src, index) => (
              <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0 z-0'}`}>
                <img src={src} alt="TB Center" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
     );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col">
        {renderPublicHeader()}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#004e89 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[450px] border-t-4 border-t-health-blue z-10">
            <div className="flex flex-col items-center mb-8">
              <img src="/assets/moh_logo.png" alt="MoH Logo" className="h-20 mb-4" />
              <h2 className="text-2xl font-bold text-center text-neutral-900">System Login</h2>
              <p className="text-sm text-neutral-500 mt-2 text-center">Authenticate via National DHIS2 Instance</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select User Role (RBAC Demo)</label>
                <select 
                  value={selectedRoleId} 
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-4 py-3 bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-health-blue outline-none transition-all font-medium"
                >
                  <optgroup label="Clinical Users (MoH)">
                    {allRoles.filter(r => r.group === 'Clinical Platform').map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Implementation Team">
                    {allRoles.filter(r => r.group === 'Implementation Team').map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <button 
                onClick={handleLogin}
                className="w-full bg-health-blue hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-md transition-all shadow-md hover:shadow-lg mt-4 flex items-center justify-center space-x-2"
              >
                <span>Authenticate as {allRoles.find(r => r.id === selectedRoleId)?.name}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = allRoles.find(r => r.id === selectedRoleId);
  const activeTabs = getTabsForRole(selectedRoleId);

  return (
    <div className="flex h-screen bg-neutral-50 font-sans">
      <div className="w-64 bg-health-blue text-white flex flex-col shadow-lg z-10">
        <div className="p-4 border-b border-blue-800 flex items-center space-x-2 cursor-pointer" onClick={() => setView('landing')}>
          <img src="/assets/moh_logo.png" alt="MoH Logo" className="h-10 bg-white rounded-full p-0.5" />
          <div>
            <h1 className="font-bold text-lg leading-tight">TB e-Tracker</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider mt-1">Ministry of Health</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors text-sm font-medium ${activeTab === tab.id ? 'bg-blue-800 shadow-inner' : 'hover:bg-blue-800/50'}`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-blue-800 space-y-3">
          <div className="text-xs text-blue-200 flex flex-col space-y-1 bg-blue-900/50 p-2 rounded border border-blue-800">
            <span className="font-bold text-white border-b border-blue-800 pb-1 mb-1">{roleInfo?.group}</span>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>{roleInfo?.name}</span>
            </div>
          </div>
          <button 
            onClick={() => setView('login')}
            className="flex items-center space-x-2 text-sm text-blue-200 hover:text-white w-full px-2 py-2 transition-colors hover:bg-blue-800/50 rounded-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center shadow-sm sticky top-0 z-0">
          <h2 className="text-xl font-semibold text-neutral-800">
            {activeTabs.find(t => t.id === activeTab)?.label}
          </h2>
          <PWAInstallButton />
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative">
          {renderDashboardContent()}
          
          {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-health-blue text-white px-6 py-4 rounded-lg shadow-2xl font-medium animate-bounce z-50 flex items-center gap-3 border-2 border-blue-300">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </main>
      </div>
      <PWAInstallBanner />
      <PWAUpdateToast />
    </div>
  );
}

export default App;
