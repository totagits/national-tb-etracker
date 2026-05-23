import { useState } from 'react';
import {
  GitMerge, CheckCircle2, AlertCircle, XCircle, Activity, Users,
  Plus, Download, ChevronDown, ChevronRight,
  Clock, Filter, TrendingUp, RefreshCw,
  Edit3, Save, BookOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
  AreaChart, Area
} from 'recharts';
import { COUNTY_TB_DATA, ALL_COUNTIES, NATIONAL_TOTALS, MONTHLY_TREND } from '../data/liberiaData';

// ─── Shared Types ─────────────────────────────────────────────────────────────
type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Open' | 'In Review' | 'Resolved' | 'Closed';

// ─── Shared UI ────────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-6">
    <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
    <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Pass: 'bg-green-100 text-green-700 border-green-200',
    Fail: 'bg-red-100 text-red-700 border-red-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Open: 'bg-red-100 text-red-700 border-red-200',
    'In Review': 'bg-blue-100 text-blue-700 border-blue-200',
    Resolved: 'bg-green-100 text-green-700 border-green-200',
    Closed: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[status] ?? 'bg-neutral-100 text-neutral-600'}`}>{status}</span>;
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. TB CASCADE MAPPING
// ══════════════════════════════════════════════════════════════════════════════

// Cascade data derived from shared data layer
const cascadeCounty = COUNTY_TB_DATA.map(c => ({
  county: c.county,
  presumptive: c.presumptive,
  tested: c.tested,
  diagnosed: c.diagnosed,
  enrolled: Math.round(c.enrolled),
  initiated: Math.round(c.initiated),
  success: c.success,
}));

const cascadeMonthly = MONTHLY_TREND.map(m => ({
  month: m.month,
  presumptive: m.screened,
  diagnosed: m.diagnosed,
  initiated: m.initiated,
  success: m.success,
}));

const FUNNEL_DATA = [
  { value: NATIONAL_TOTALS.presumptive, name: 'Presumptive TB',      fill: '#0e4b87' },
  { value: NATIONAL_TOTALS.tested,      name: 'Tested',             fill: '#1a6bbf' },
  { value: NATIONAL_TOTALS.diagnosed,   name: 'Diagnosed',          fill: '#e67e22' },
  { value: NATIONAL_TOTALS.onTreatment, name: 'On Treatment',       fill: '#d35400' },
  { value: NATIONAL_TOTALS.success,     name: 'Treatment Success',  fill: '#27ae60' },
];

const TBCascadeMapping = () => {
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [view, setView] = useState<'funnel' | 'county' | 'trend'>('funnel');

  const counties = ['All Counties', ...ALL_COUNTIES];

  const filtered = selectedCounty === 'All Counties' ? cascadeCounty : cascadeCounty.filter(c => c.county === selectedCounty);
  const barData = [
    { stage: 'Presumptive', count: filtered.reduce((s, c) => s + c.presumptive, 0) },
    { stage: 'Tested',      count: filtered.reduce((s, c) => s + c.tested, 0) },
    { stage: 'Diagnosed',   count: filtered.reduce((s, c) => s + c.diagnosed, 0) },
    { stage: 'Enrolled',    count: filtered.reduce((s, c) => s + c.enrolled, 0) },
    { stage: 'Initiated',   count: filtered.reduce((s, c) => s + c.initiated, 0) },
    { stage: 'Success',     count: filtered.reduce((s, c) => s + c.success, 0) },
  ];

  const successRate = barData[5].count > 0 ? ((barData[5].count / barData[0].count) * 100).toFixed(1) : '0';
  const diagRate = barData[0].count > 0 ? ((barData[2].count / barData[0].count) * 100).toFixed(1) : '0';
  const lossRate = barData[2].count > 0 ? (((barData[2].count - barData[5].count) / barData[2].count) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <SectionHeader
        title="TB Cascade Mapping"
        subtitle="End-to-end visualization of patient movement through the TB care cascade — from presumptive screening to treatment success."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Presumptive', value: filtered.reduce((s, c) => s + c.presumptive, 0).toLocaleString(), color: 'text-health-blue', bg: 'bg-blue-50', icon: Users },
          { label: 'Diagnosed TB', value: filtered.reduce((s, c) => s + c.diagnosed, 0).toLocaleString(), color: 'text-orange-600', bg: 'bg-orange-50', icon: Activity },
          { label: 'Diagnosis Rate', value: `${diagRate}%`, color: diagRate > '33' ? 'text-amber-600' : 'text-green-600', bg: 'bg-amber-50', icon: TrendingUp },
          { label: 'Treatment Success', value: `${successRate}%`, color: parseFloat(successRate) >= 85 ? 'text-green-700' : 'text-red-600', bg: parseFloat(successRate) >= 85 ? 'bg-green-50' : 'bg-red-50', icon: CheckCircle2 },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <div className="flex items-center gap-2 mb-1">
              <k.icon className={`h-4 w-4 ${k.color}`} />
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{k.label}</p>
            </div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Cascade loss alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Cascade Attrition Alert</p>
          <p className="text-xs text-amber-800 mt-1">
            <strong>{lossRate}%</strong> of diagnosed patients are lost before treatment success. WHO target: &lt;15% loss.
            Priority counties: <strong>Lofa, Grand Bassa</strong> — immediate follow-up action required.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex gap-2">
          {(['funnel', 'county', 'trend'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors capitalize ${view === v ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {v === 'funnel' ? 'National Funnel' : v === 'county' ? 'By County' : 'Monthly Trend'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none">
            {counties.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => window.print()} className="border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-neutral-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Charts */}
      {view === 'funnel' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h3 className="font-bold text-neutral-700 mb-6 flex items-center gap-2"><GitMerge className="h-5 w-5 text-health-blue" /> National TB Treatment Cascade</h3>
          <div className="space-y-3">
            {FUNNEL_DATA.map((d, i) => {
              const pct = ((d.value / FUNNEL_DATA[0].value) * 100).toFixed(1);
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-36 text-right">
                    <p className="text-xs font-bold text-neutral-600">{d.name}</p>
                    <p className="text-sm font-black text-neutral-900">{d.value.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-neutral-100 rounded-full h-8 overflow-hidden">
                    <div className="h-full rounded-full flex items-center pl-3 transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: d.fill }}>
                      <span className="text-white text-xs font-bold">{pct}%</span>
                    </div>
                  </div>
                  {i > 0 && (
                    <div className="text-right w-16">
                      <p className="text-[10px] text-neutral-400">Loss</p>
                      <p className="text-xs font-bold text-red-500">-{(FUNNEL_DATA[i - 1].value - d.value).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'county' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h3 className="font-bold text-neutral-700 mb-4">County-Level Cascade Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#004e89" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {['County', 'Presumptive', 'Tested', 'Diagnosed', 'Enrolled', 'Initiated', 'Success', 'Success Rate'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(c => (
                  <tr key={c.county} className="hover:bg-neutral-50">
                    <td className="px-3 py-2 font-bold text-neutral-800">{c.county}</td>
                    <td className="px-3 py-2">{c.presumptive}</td>
                    <td className="px-3 py-2">{c.tested}</td>
                    <td className="px-3 py-2">{c.diagnosed}</td>
                    <td className="px-3 py-2">{c.enrolled}</td>
                    <td className="px-3 py-2">{c.initiated}</td>
                    <td className="px-3 py-2 font-bold text-green-700">{c.success}</td>
                    <td className="px-3 py-2">
                      <span className={`font-bold ${((c.success / c.presumptive) * 100) >= 25 ? 'text-green-700' : 'text-red-600'}`}>
                        {((c.success / c.presumptive) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'trend' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h3 className="font-bold text-neutral-700 mb-4">Monthly Cascade Trend (2026)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cascadeMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="presumptive" stroke="#0e4b87" fill="#e8f0f9" name="Presumptive" />
                <Area type="monotone" dataKey="diagnosed" stroke="#e67e22" fill="#fef3e7" name="Diagnosed" />
                <Area type="monotone" dataKey="initiated" stroke="#8b5cf6" fill="#f3edff" name="Initiated" />
                <Area type="monotone" dataKey="success" stroke="#27ae60" fill="#eafaf1" name="Success" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. CLINICAL / PROGRAMMATIC WORKFLOW VALIDATION
// ══════════════════════════════════════════════════════════════════════════════
interface WorkflowItem {
  id: string;
  workflow: string;
  stage: string;
  rule: string;
  result: 'Pass' | 'Fail' | 'Pending';
  notes: string;
  validatedBy: string;
  date: string;
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  { id: 'WF-001', workflow: 'TB Screening', stage: 'Patient Registration', rule: 'All presumptive TB patients must have a TB ID assigned at point of registration', result: 'Pass', notes: 'TB ID auto-generated by DHIS2 Tracker', validatedBy: 'Esther Flomo', date: '2026-05-10' },
  { id: 'WF-002', workflow: 'Sputum Collection', stage: 'Laboratory', rule: 'Sputum collection date must be ≤ 3 days after presumptive case identification', result: 'Fail', notes: 'Lofa County: avg 6-day delay observed in UAT testing', validatedBy: 'Esther Flomo', date: '2026-05-12' },
  { id: 'WF-003', workflow: 'Treatment Initiation', stage: 'Clinical', rule: 'Treatment must start ≤ 7 days after positive bacteriological confirmation', result: 'Pass', notes: 'All test facilities met the threshold', validatedBy: 'Esther Flomo', date: '2026-05-13' },
  { id: 'WF-004', workflow: 'HIV Co-infection Screening', stage: 'Integrated Care', rule: 'Every TB patient must receive an HIV test within 2 weeks of TB diagnosis', result: 'Pending', notes: 'Awaiting Grand Bassa data submission', validatedBy: '—', date: '—' },
  { id: 'WF-005', workflow: 'Treatment Outcome Recording', stage: 'Outcome', rule: 'Treatment outcome must be recorded within 6 months of treatment initiation', result: 'Pass', notes: 'Compliance rate: 94%', validatedBy: 'Esther Flomo', date: '2026-05-15' },
  { id: 'WF-006', workflow: 'Defaulter Follow-up', stage: 'Continuity', rule: 'Patients missing ≥ 2 consecutive doses must be flagged and contacted within 48h', result: 'Fail', notes: 'Automated alert system not yet live in 4 facilities', validatedBy: 'Esther Flomo', date: '2026-05-16' },
];

const WorkflowValidation = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Pass' | 'Fail' | 'Pending'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ workflow: '', stage: '', rule: '', notes: '', result: 'Pending' as 'Pass' | 'Fail' | 'Pending' });

  const filtered = filter === 'All' ? workflows : workflows.filter(w => w.result === filter);
  const passCount = workflows.filter(w => w.result === 'Pass').length;
  const failCount = workflows.filter(w => w.result === 'Fail').length;
  const pendingCount = workflows.filter(w => w.result === 'Pending').length;

  const addWorkflow = () => {
    if (!form.workflow || !form.rule) return;
    const newItem: WorkflowItem = {
      id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
      ...form,
      validatedBy: 'Esther Flomo',
      date: new Date().toISOString().slice(0, 10),
    };
    setWorkflows(prev => [newItem, ...prev]);
    setForm({ workflow: '', stage: '', rule: '', notes: '', result: 'Pending' });
    setShowModal(false);
    (window as any).showToast('Workflow validation rule added successfully.');
  };

  const updateResult = (id: string, result: 'Pass' | 'Fail' | 'Pending') => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, result, validatedBy: 'Esther Flomo', date: new Date().toISOString().slice(0, 10) } : w));
    (window as any).showToast(`Workflow ${id} updated to ${result}.`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clinical / Programmatic Workflow Validation"
        subtitle="Validate that clinical and programmatic workflows are correctly implemented in the TB e-Tracker system and aligned with national TB guidelines."
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Workflows Passing', count: passCount, total: workflows.length, color: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-500' },
          { label: 'Failures / Issues', count: failCount, total: workflows.length, color: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-500' },
          { label: 'Pending Validation', count: pendingCount, total: workflows.length, color: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.count}<span className="text-base font-normal text-neutral-400"> / {s.total}</span></p>
            <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
              <div className={`${s.bar} h-2 rounded-full`} style={{ width: `${(s.count / s.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['All', 'Pass', 'Fail', 'Pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add Validation Rule
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(w => (
          <div key={w.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50" onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {w.result === 'Pass' ? <CheckCircle2 className="h-6 w-6 text-green-500" /> :
                   w.result === 'Fail' ? <XCircle className="h-6 w-6 text-red-500" /> :
                   <Clock className="h-6 w-6 text-amber-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400">{w.id}</span>
                    <StatusPill status={w.result} />
                  </div>
                  <p className="font-bold text-neutral-800 mt-0.5">{w.workflow}</p>
                  <p className="text-xs text-neutral-500 truncate">{w.rule}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <span className="text-xs bg-neutral-100 px-2 py-1 rounded-lg text-neutral-600 hidden md:block">{w.stage}</span>
                {expandedId === w.id ? <ChevronDown className="h-5 w-5 text-neutral-400" /> : <ChevronRight className="h-5 w-5 text-neutral-400" />}
              </div>
            </div>
            {expandedId === w.id && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><p className="text-xs font-bold text-neutral-500">Full Validation Rule</p><p className="text-sm text-neutral-700 mt-1">{w.rule}</p></div>
                  <div><p className="text-xs font-bold text-neutral-500">Validation Notes</p><p className="text-sm text-neutral-700 mt-1">{w.notes || '—'}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs font-bold text-neutral-500">Validated By</p><p className="text-sm text-neutral-700">{w.validatedBy}</p></div>
                    <div><p className="text-xs font-bold text-neutral-500">Date</p><p className="text-sm text-neutral-700">{w.date}</p></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-2">Update Result</p>
                  <div className="flex gap-2">
                    {(['Pass', 'Fail', 'Pending'] as const).map(r => (
                      <button key={r} onClick={() => updateResult(w.id, r)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${w.result === r ? (r === 'Pass' ? 'bg-green-500 text-white border-green-500' : r === 'Fail' ? 'bg-red-500 text-white border-red-500' : 'bg-amber-400 text-white border-amber-400') : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[580px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Add Workflow Validation Rule</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Workflow / Process *</label><input value={form.workflow} onChange={e => setForm(f => ({ ...f, workflow: e.target.value }))} placeholder="e.g. Contact Tracing" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Clinical Stage</label><input value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} placeholder="e.g. Laboratory" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Validation Rule *</label><textarea value={form.rule} onChange={e => setForm(f => ({ ...f, rule: e.target.value }))} rows={3} placeholder="Describe the specific validation rule based on national TB guidelines..." className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Notes / Evidence</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Supporting evidence, test results, or observations..." className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Initial Result</label>
                <div className="flex gap-2">
                  {(['Pass', 'Fail', 'Pending'] as const).map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, result: r }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${form.result === r ? 'bg-health-blue text-white border-health-blue' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addWorkflow} disabled={!form.workflow || !form.rule} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. REPORTING LOGIC
// ══════════════════════════════════════════════════════════════════════════════
interface ReportRule {
  id: string;
  name: string;
  category: string;
  expression: string;
  numerator: string;
  denominator?: string;
  target?: string;
  frequency: string;
  dhis2Element: string;
  status: 'Validated' | 'Draft' | 'Under Review';
}

const REPORT_RULES: ReportRule[] = [
  { id: 'RR-001', name: 'TB Case Notification Rate', category: 'Case Detection', expression: '(New TB Cases / 100,000 Population) × 100,000', numerator: 'Count of newly diagnosed TB cases', denominator: 'Estimated population at risk', target: '≥ 70 per 100,000', frequency: 'Quarterly', dhis2Element: 'TB_CASE_NOTIF_RATE', status: 'Validated' },
  { id: 'RR-002', name: 'Treatment Success Rate', category: 'Treatment Outcome', expression: '(Cured + Treatment Completed) / Total Cohort × 100', numerator: 'Cured + Treatment Completed', denominator: 'Total registered cohort', target: '≥ 85%', frequency: 'Annual (12-month cohort)', dhis2Element: 'TB_TX_SUCCESS_RATE', status: 'Validated' },
  { id: 'RR-003', name: 'TB/HIV Co-infection Rate', category: 'HIV Integration', expression: 'TB Patients with Known HIV+ Status / Total TB Patients × 100', numerator: 'TB patients confirmed HIV+', denominator: 'All TB patients with HIV test result', target: 'Baseline monitoring', frequency: 'Quarterly', dhis2Element: 'TB_HIV_COINFECT', status: 'Validated' },
  { id: 'RR-004', name: 'Lost to Follow-up Rate', category: 'Continuity of Care', expression: 'LTFU Cases / Total Registered Cohort × 100', numerator: 'Patients missing ≥ 2 months of treatment', denominator: 'Total registered cohort', target: '< 5%', frequency: 'Monthly', dhis2Element: 'TB_LTFU_RATE', status: 'Under Review' },
  { id: 'RR-005', name: 'Diagnostic Coverage Index', category: 'Laboratory', expression: 'TB Patients with Bacteriological Confirmation / Total TB Patients × 100', numerator: 'Bacteriologically confirmed TB', denominator: 'All TB patients', target: '≥ 50%', frequency: 'Quarterly', dhis2Element: 'TB_BACT_CONFIRM', status: 'Draft' },
  { id: 'RR-006', name: 'Pediatric TB Proportion', category: 'Vulnerable Populations', expression: 'TB Cases aged < 15 / Total TB Cases × 100', numerator: 'TB patients under 15 years', denominator: 'All registered TB patients', target: 'Baseline monitoring', frequency: 'Annual', dhis2Element: 'TB_PEDIATRIC_PROP', status: 'Validated' },
];

const ReportingLogic = () => {
  const [rules, setRules] = useState<ReportRule[]>(REPORT_RULES);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<ReportRule | null>(null);
  const [catFilter, setCatFilter] = useState('All');
  const [form, setForm] = useState({ name: '', category: '', expression: '', numerator: '', denominator: '', target: '', frequency: 'Monthly', dhis2Element: '' });

  const categories = ['All', ...Array.from(new Set(rules.map(r => r.category)))];
  const filtered = catFilter === 'All' ? rules : rules.filter(r => r.category === catFilter);

  const addRule = () => {
    if (!form.name || !form.expression) return;
    setRules(prev => [...prev, { id: `RR-${String(prev.length + 1).padStart(3, '0')}`, ...form, status: 'Draft' as const }]);
    setForm({ name: '', category: '', expression: '', numerator: '', denominator: '', target: '', frequency: 'Monthly', dhis2Element: '' });
    setShowModal(false);
    (window as any).showToast('Reporting logic rule saved to DHIS2 indicator registry.');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reporting Logic"
        subtitle="Define, validate, and manage all TB program indicator formulas, numerator/denominator definitions, and DHIS2 data element mappings."
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Validated Indicators', count: rules.filter(r => r.status === 'Validated').length, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Under Review', count: rules.filter(r => r.status === 'Under Review').length, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Draft / Pending', count: rules.filter(r => r.status === 'Draft').length, color: 'text-neutral-600', bg: 'bg-neutral-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${catFilter === c ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{c}</button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Plus className="h-4 w-4" /> Add Indicator
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 cursor-pointer hover:border-health-blue transition-colors" onClick={() => setSelected(r)}>
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-400">{r.id}</span>
                  <StatusPill status={r.status} />
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">{r.category}</span>
                </div>
                <h4 className="font-bold text-neutral-800">{r.name}</h4>
                <p className="text-xs text-neutral-500 mt-1 font-mono bg-neutral-50 inline-block px-2 py-1 rounded">{r.expression}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">Target</p>
                <p className="text-sm font-bold text-health-blue">{r.target || '—'}</p>
                <p className="text-xs text-neutral-400 mt-1">{r.frequency}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-bold">DHIS2:</span>
              <code className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{r.dhis2Element}</code>
              <span className="ml-auto text-health-blue font-bold">View details →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white w-[600px] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="hover:bg-blue-800 p-1.5 rounded-lg"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Indicator ID', val: selected.id },
                  { label: 'Status', val: <StatusPill status={selected.status} /> },
                  { label: 'Category', val: selected.category },
                  { label: 'Reporting Frequency', val: selected.frequency },
                  { label: 'Target / Threshold', val: selected.target || 'Baseline monitoring' },
                  { label: 'DHIS2 Data Element', val: <code className="bg-neutral-100 px-2 py-0.5 rounded text-xs">{selected.dhis2Element}</code> },
                ].map(item => (
                  <div key={item.label}><p className="text-xs font-bold text-neutral-500">{item.label}</p><div className="text-sm font-bold text-neutral-800 mt-0.5">{item.val}</div></div>
                ))}
              </div>
              <div><p className="text-xs font-bold text-neutral-500">Calculation Formula</p><p className="text-sm font-mono bg-blue-50 border border-blue-100 rounded-lg p-3 mt-1 text-blue-900">{selected.expression}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-bold text-neutral-500">Numerator</p><p className="text-sm text-neutral-700 mt-1">{selected.numerator}</p></div>
                {selected.denominator && <div><p className="text-xs font-bold text-neutral-500">Denominator</p><p className="text-sm text-neutral-700 mt-1">{selected.denominator}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">New Reporting Indicator</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Indicator Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. MDR-TB Detection Rate" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Category</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Drug Resistance" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Calculation Formula *</label><textarea value={form.expression} onChange={e => setForm(f => ({ ...f, expression: e.target.value }))} rows={2} placeholder="e.g. MDR-TB Cases / Total Bacteriologically Confirmed × 100" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none font-mono" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Numerator</label><input value={form.numerator} onChange={e => setForm(f => ({ ...f, numerator: e.target.value }))} placeholder="Describe numerator" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Denominator</label><input value={form.denominator} onChange={e => setForm(f => ({ ...f, denominator: e.target.value }))} placeholder="Describe denominator" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Target / Threshold</label><input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="e.g. ≥ 85%" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Reporting Frequency</label><select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                  {['Monthly', 'Quarterly', 'Annual'].map(f => <option key={f}>{f}</option>)}
                </select></div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">DHIS2 Data Element Code</label><input value={form.dhis2Element} onChange={e => setForm(f => ({ ...f, dhis2Element: e.target.value }))} placeholder="e.g. TB_MDR_DETECT" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none font-mono" /></div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addRule} disabled={!form.name || !form.expression} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Save Indicator</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. COHORT ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════
const cohortData = [
  { cohort: 'Q1 2025', registered: 420, completed: 357, cured: 310, failed: 18, ltfu: 22, died: 7, success: 85.0 },
  { cohort: 'Q2 2025', registered: 390, completed: 332, cured: 288, failed: 15, ltfu: 28, died: 9, success: 84.6 },
  { cohort: 'Q3 2025', registered: 455, completed: 387, cured: 338, failed: 21, ltfu: 18, died: 10, success: 85.1 },
  { cohort: 'Q4 2025', registered: 480, completed: 408, cured: 355, failed: 24, ltfu: 19, died: 10, success: 85.0 },
  { cohort: 'Q1 2026', registered: 502, completed: 427, cured: 371, failed: 22, ltfu: 21, died: 13, success: 85.1 },
];

const ageData = [
  { group: '0–4', m: 12, f: 9 }, { group: '5–14', m: 28, f: 22 },
  { group: '15–24', m: 85, f: 72 }, { group: '25–34', m: 148, f: 110 },
  { group: '35–44', m: 132, f: 88 }, { group: '45–54', m: 95, f: 62 },
  { group: '55–64', m: 70, f: 45 }, { group: '65+', m: 38, f: 25 },
];

const CohortAnalysis = () => {
  const [activeTab, setActiveTab] = useState<'outcomes' | 'age' | 'tbhiv'>('outcomes');
  const [selectedCohort, setSelectedCohort] = useState(cohortData[cohortData.length - 1]);

  const tbHivTrend = [
    { month: 'Jan', tbTotal: 90, hivPos: 22, hivTested: 78, artStarted: 18 },
    { month: 'Feb', tbTotal: 98, hivPos: 24, hivTested: 88, artStarted: 21 },
    { month: 'Mar', tbTotal: 85, hivPos: 20, hivTested: 75, artStarted: 17 },
    { month: 'Apr', tbTotal: 112, hivPos: 28, hivTested: 100, artStarted: 25 },
    { month: 'May', tbTotal: 118, hivPos: 30, hivTested: 108, artStarted: 27 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cohort Analysis"
        subtitle="Systematic analysis of TB patient cohorts by treatment outcome, demographics, TB/HIV co-infection status, and quarterly performance trends."
      />

      {/* Cohort selector */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
        <p className="text-xs font-bold text-neutral-500 mb-3 uppercase">Select Cohort Period</p>
        <div className="flex flex-wrap gap-2">
          {cohortData.map(c => (
            <button key={c.cohort} onClick={() => setSelectedCohort(c)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${selectedCohort.cohort === c.cohort ? 'bg-health-blue text-white border-health-blue' : 'bg-white text-neutral-600 border-neutral-200 hover:border-health-blue'}`}>
              {c.cohort}
            </button>
          ))}
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered', val: selectedCohort.registered, color: 'text-health-blue' },
          { label: 'Cured', val: selectedCohort.cured, color: 'text-green-700' },
          { label: 'Lost to Follow-up', val: selectedCohort.ltfu, color: 'text-orange-600' },
          { label: 'Treatment Success', val: `${selectedCohort.success}%`, color: selectedCohort.success >= 85 ? 'text-green-700' : 'text-red-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 text-center">
            <p className="text-xs font-bold text-neutral-400 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
            <div className="text-xs mt-1 text-neutral-400">Cohort: {selectedCohort.cohort}</div>
          </div>
        ))}
      </div>

      {/* Outcome donut-style breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
        <h3 className="font-bold text-neutral-800 mb-4">Treatment Outcome Breakdown — {selectedCohort.cohort}</h3>
        <div className="space-y-3">
          {[
            { label: 'Cured', count: selectedCohort.cured, color: 'bg-green-500' },
            { label: 'Treatment Completed', count: selectedCohort.completed - selectedCohort.cured, color: 'bg-blue-500' },
            { label: 'Treatment Failed', count: selectedCohort.failed, color: 'bg-red-500' },
            { label: 'Lost to Follow-up', count: selectedCohort.ltfu, color: 'bg-orange-400' },
            { label: 'Died', count: selectedCohort.died, color: 'bg-neutral-400' },
          ].map(o => {
            const pct = ((o.count / selectedCohort.registered) * 100).toFixed(1);
            return (
              <div key={o.label} className="flex items-center gap-4">
                <p className="w-40 text-sm font-bold text-neutral-700 text-right">{o.label}</p>
                <div className="flex-1 bg-neutral-100 rounded-full h-7 overflow-hidden">
                  <div className={`${o.color} h-full rounded-full flex items-center pl-3 transition-all`} style={{ width: `${pct}%` }}>
                    <span className="text-white text-xs font-bold">{pct}%</span>
                  </div>
                </div>
                <p className="w-10 text-sm font-bold text-neutral-700">{o.count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-0">
        {([['outcomes', 'Multi-Cohort Trend'], ['age', 'Age & Sex Distribution'], ['tbhiv', 'TB/HIV Co-infection']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === id ? 'border-health-blue text-health-blue' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'outcomes' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <h3 className="font-bold text-neutral-700 mb-4">Treatment Success Rate — All Cohorts</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 90]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Line type="monotone" dataKey="success" stroke="#004e89" strokeWidth={3} dot={{ r: 5, fill: '#004e89' }} name="Success Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-xs divide-y divide-neutral-200">
              <thead className="bg-neutral-50"><tr>
                {['Cohort', 'Registered', 'Cured', 'Completed', 'Failed', 'LTFU', 'Died', 'Success Rate'].map(h => <th key={h} className="px-3 py-2 text-left font-bold text-neutral-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {cohortData.map(c => (
                  <tr key={c.cohort} className="hover:bg-neutral-50">
                    <td className="px-3 py-2 font-bold">{c.cohort}</td>
                    <td className="px-3 py-2">{c.registered}</td>
                    <td className="px-3 py-2 text-green-700 font-bold">{c.cured}</td>
                    <td className="px-3 py-2">{c.completed}</td>
                    <td className="px-3 py-2 text-red-600">{c.failed}</td>
                    <td className="px-3 py-2 text-orange-600">{c.ltfu}</td>
                    <td className="px-3 py-2 text-neutral-500">{c.died}</td>
                    <td className="px-3 py-2 font-black text-health-blue">{c.success}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'age' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <h3 className="font-bold text-neutral-700 mb-4">Age & Sex Distribution of TB Cases (2026 YTD)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="group" type="category" tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="m" fill="#004e89" name="Male" radius={[0, 3, 3, 0]} />
                <Bar dataKey="f" fill="#e67e22" name="Female" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-neutral-400 mt-3">Peak burden: <strong>25–44 age group</strong> (economically productive population). Pediatric (&lt;15): <strong>{ageData.filter(a => ['0–4','5–14'].includes(a.group)).reduce((s,a) => s+a.m+a.f, 0)} cases</strong> requiring specialized management.</p>
        </div>
      )}

      {activeTab === 'tbhiv' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <h3 className="font-bold text-neutral-700 mb-4">TB/HIV Co-infection Monthly Trend (2026)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tbHivTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tbTotal" fill="#0e4b87" name="Total TB Cases" />
                <Bar dataKey="hivTested" fill="#8b5cf6" name="HIV Tested" />
                <Bar dataKey="hivPos" fill="#e67e22" name="HIV Positive" />
                <Bar dataKey="artStarted" fill="#27ae60" name="ART Started" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'HIV Testing Coverage', val: `${((tbHivTrend.reduce((s,m)=>s+m.hivTested,0)/tbHivTrend.reduce((s,m)=>s+m.tbTotal,0))*100).toFixed(1)}%`, target: '≥ 90%', ok: true },
              { label: 'Co-infection Rate', val: `${((tbHivTrend.reduce((s,m)=>s+m.hivPos,0)/tbHivTrend.reduce((s,m)=>s+m.hivTested,0))*100).toFixed(1)}%`, target: 'Baseline', ok: true },
              { label: 'ART Initiation Rate', val: `${((tbHivTrend.reduce((s,m)=>s+m.artStarted,0)/tbHivTrend.reduce((s,m)=>s+m.hivPos,0))*100).toFixed(1)}%`, target: '≥ 95%', ok: false },
              { label: 'Not Yet on ART', val: tbHivTrend.reduce((s,m)=>s+m.hivPos-m.artStarted,0).toString(), target: 'Target: 0', ok: false },
            ].map(k => (
              <div key={k.label} className={`rounded-lg p-3 border ${k.ok ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                <p className="text-[10px] font-bold text-neutral-500 uppercase">{k.label}</p>
                <p className={`text-xl font-black ${k.ok ? 'text-green-700' : 'text-amber-700'}`}>{k.val}</p>
                <p className="text-[10px] text-neutral-400">Target: {k.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 5. USER ACCEPTANCE SUPPORT (UAT)
// ══════════════════════════════════════════════════════════════════════════════
interface UATItem {
  id: string;
  testCase: string;
  module: string;
  tester: string;
  facility: string;
  priority: Severity;
  status: Status;
  steps: string;
  expected: string;
  actual: string;
  date: string;
  feedback?: string;
}

const INITIAL_UAT: UATItem[] = [
  { id: 'UAT-001', testCase: 'New patient registration with AI TB screening', module: 'Registration Wizard', tester: 'Mary Johnson', facility: 'JFK Medical Center', priority: 'Critical', status: 'Resolved', steps: '1. Login as Facility Clerk\n2. Click Registration Wizard\n3. Fill all 4 steps\n4. Submit', expected: 'Patient saved with TB-XXXX ID and AI risk score displayed', actual: 'Patient saved correctly. AI risk correctly classified 3 of 4 test cases', date: '2026-05-12', feedback: 'Wizard is intuitive. Step 3 label could be clearer.' },
  { id: 'UAT-002', testCase: 'County filter in National Admin analytics', module: 'National Admin Dashboard', tester: 'Dr. Samson Kollie', facility: 'MoH National HQ', priority: 'High', status: 'Resolved', steps: '1. Login as National Admin\n2. Open Analytics\n3. Select each county from dropdown', expected: 'Charts and table update to show selected county data only', actual: 'All 15 counties now filter correctly after fix in v2.0', date: '2026-05-14', feedback: 'County filter is now working well.' },
  { id: 'UAT-003', testCase: 'Patient search returns newly registered patients', module: 'Patient Search', tester: 'Esther Flomo', facility: 'Redemption Hospital', priority: 'Critical', status: 'In Review', steps: '1. Register a new patient\n2. Navigate to Patient Search\n3. Search by TB ID or name', expected: 'Newly registered patient appears in search results immediately', actual: 'Patient visible after page refresh, not immediately — state sync issue suspected', date: '2026-05-15', feedback: '' },
  { id: 'UAT-004', testCase: 'Meeting camera permissions on Chrome', module: 'Meeting Coordination', tester: 'James Kpan', facility: 'Remote / MoH HQ', priority: 'Medium', status: 'Open', steps: '1. Login as Project Manager\n2. Open Meeting Coordination\n3. Allow camera when prompted', expected: 'Live video self-view appears immediately after permission granted', actual: 'Permission prompt appeared but camera preview was delayed by ~3 seconds on low-bandwidth connection', date: '2026-05-16', feedback: '' },
  { id: 'UAT-005', testCase: 'PDF export of meeting minutes', module: 'Meeting Coordination', tester: 'Ruth Toe', facility: 'Training Center', priority: 'Low', status: 'Closed', steps: '1. Open live meeting\n2. Type minutes\n3. Click Export PDF', expected: 'Browser print dialog opens with meeting minutes formatted for A4 print', actual: 'Export PDF triggered correctly via window.print()', date: '2026-05-17', feedback: 'Works well. Would benefit from a TB e-Tracker branded header on the PDF.' },
];

const UATSupport = () => {
  const [uatItems, setUatItems] = useState<UATItem[]>(INITIAL_UAT);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<UATItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [modFilter, setModFilter] = useState('All');
  const [form, setForm] = useState({ testCase: '', module: '', tester: '', facility: '', priority: 'Medium' as Severity, steps: '', expected: '', actual: '' });
  const [feedback, setFeedback] = useState('');
  const [editingFeedback, setEditingFeedback] = useState(false);

  const modules = ['All', ...Array.from(new Set(uatItems.map(u => u.module)))];
  const filtered = uatItems
    .filter(u => statusFilter === 'All' || u.status === statusFilter)
    .filter(u => modFilter === 'All' || u.module === modFilter);

  const addUAT = () => {
    if (!form.testCase || !form.module) return;
    const newItem: UATItem = {
      id: `UAT-${String(uatItems.length + 1).padStart(3, '0')}`,
      ...form,
      status: 'Open',
      date: new Date().toISOString().slice(0, 10),
      feedback: '',
    };
    setUatItems(prev => [newItem, ...prev]);
    setForm({ testCase: '', module: '', tester: '', facility: '', priority: 'Medium', steps: '', expected: '', actual: '' });
    setShowModal(false);
    (window as any).showToast('UAT test case logged successfully.');
  };

  const cycleStatus = (id: string, cur: Status) => {
    const next: Record<Status, Status> = { Open: 'In Review', 'In Review': 'Resolved', Resolved: 'Closed', Closed: 'Open' };
    setUatItems(prev => prev.map(u => u.id === id ? { ...u, status: next[cur] } : u));
    (window as any).showToast(`Status updated to: ${next[cur]}`);
  };

  const saveFeedback = (id: string) => {
    setUatItems(prev => prev.map(u => u.id === id ? { ...u, feedback } : u));
    setSelected(prev => prev ? { ...prev, feedback } : null);
    setEditingFeedback(false);
    (window as any).showToast('Tester feedback saved.');
  };

  const openCount = uatItems.filter(u => u.status === 'Open').length;
  const critCount = uatItems.filter(u => u.priority === 'Critical' && u.status !== 'Closed').length;
  const resolvedPct = Math.round((uatItems.filter(u => ['Resolved', 'Closed'].includes(u.status)).length / uatItems.length) * 100);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User Acceptance Testing (UAT) Support"
        subtitle="Track, manage, and resolve UAT test cases submitted by facility staff, MoH officers, and implementation team members across all TB e-Tracker modules."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Test Cases', val: uatItems.length, color: 'text-health-blue', bg: 'bg-blue-50' },
          { label: 'Open Issues', val: openCount, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Critical (Unresolved)', val: critCount, color: 'text-orange-700', bg: 'bg-orange-50' },
          { label: 'Resolution Rate', val: `${resolvedPct}%`, color: resolvedPct >= 70 ? 'text-green-700' : 'text-amber-700', bg: resolvedPct >= 70 ? 'bg-green-50' : 'bg-amber-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-neutral-700">UAT Progress</h3>
          <span className="text-sm font-bold text-health-blue">{resolvedPct}% Complete</span>
        </div>
        <div className="bg-neutral-100 rounded-full h-4 overflow-hidden">
          <div className="bg-health-blue h-4 rounded-full transition-all" style={{ width: `${resolvedPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>{uatItems.filter(u => ['Resolved', 'Closed'].includes(u.status)).length} resolved</span>
          <span>{uatItems.length} total test cases</span>
        </div>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Open', 'In Review', 'Resolved', 'Closed'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === s ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{s}</button>
          ))}
          <select value={modFilter} onChange={e => setModFilter(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none">
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm text-sm">
          <Plus className="h-4 w-4" /> Log Test Case
        </button>
      </div>

      {/* UAT list */}
      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden hover:border-health-blue transition-colors">
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setSelected(u); setFeedback(u.feedback || ''); setEditingFeedback(false); }}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-400">{u.id}</span>
                  <StatusPill status={u.status} />
                  <StatusPill status={u.priority} />
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-500 font-medium">{u.module}</span>
                </div>
                <p className="font-bold text-neutral-800">{u.testCase}</p>
                <p className="text-xs text-neutral-500 mt-1">{u.tester} · {u.facility} · {u.date}</p>
                {u.actual && <p className="text-xs text-neutral-600 mt-2 bg-neutral-50 rounded-lg p-2 italic">"{u.actual}"</p>}
              </div>
              <button onClick={() => cycleStatus(u.id, u.status)}
                className="flex-shrink-0 border border-neutral-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-600 flex items-center gap-1 transition-colors">
                <RefreshCw className="h-3 w-3" /> Advance
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
            <BookOpen className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="font-bold text-neutral-500">No test cases match the current filter.</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-200 font-bold">{selected.id} · {selected.module}</p>
                <h3 className="font-bold text-lg mt-0.5">{selected.testCase}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="hover:bg-blue-800 p-1.5 rounded-lg flex-shrink-0"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <StatusPill status={selected.status} />
                <StatusPill status={selected.priority} />
                <span className="text-xs text-neutral-500">{selected.tester} · {selected.facility} · {selected.date}</span>
              </div>
              {[
                { label: 'Test Steps', val: selected.steps },
                { label: 'Expected Result', val: selected.expected },
                { label: 'Actual Result', val: selected.actual },
              ].map(s => s.val && (
                <div key={s.label}>
                  <p className="text-xs font-bold text-neutral-500 mb-1">{s.label}</p>
                  <pre className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 border whitespace-pre-wrap font-sans">{s.val}</pre>
                </div>
              ))}

              {/* Feedback */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold text-neutral-500">Tester Feedback</p>
                  {!editingFeedback && <button onClick={() => { setFeedback(selected.feedback || ''); setEditingFeedback(true); }} className="text-xs text-health-blue font-bold flex items-center gap-1"><Edit3 className="h-3 w-3" /> Edit</button>}
                </div>
                {editingFeedback ? (
                  <div className="space-y-2">
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" placeholder="Enter tester feedback..." />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingFeedback(false)} className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg">Cancel</button>
                      <button onClick={() => saveFeedback(selected.id)} className="px-4 py-1.5 text-sm bg-health-blue text-white font-bold rounded-lg hover:bg-blue-800 flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 border italic">{selected.feedback || 'No feedback yet.'}</p>
                )}
              </div>

              {/* Advance status */}
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-2">Update Status</p>
                <div className="flex gap-2">
                  {(['Open', 'In Review', 'Resolved', 'Closed'] as const).map(s => (
                    <button key={s} onClick={() => { setUatItems(prev => prev.map(u => u.id === selected.id ? { ...u, status: s } : u)); setSelected(prev => prev ? { ...prev, status: s } : null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selected.status === s ? 'bg-health-blue text-white border-health-blue' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">Log UAT Test Case</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Test Case Name *</label><input value={form.testCase} onChange={e => setForm(f => ({ ...f, testCase: e.target.value }))} placeholder="e.g. Offline data sync after reconnection" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Module *</label><input value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))} placeholder="e.g. Registration Wizard" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Priority</label><select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Severity }))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                  {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map(p => <option key={p}>{p}</option>)}
                </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Tester Name</label><input value={form.tester} onChange={e => setForm(f => ({ ...f, tester: e.target.value }))} placeholder="Full name" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Facility / Location</label><input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} placeholder="e.g. Phebe Hospital" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Test Steps</label><textarea value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} rows={3} placeholder="Step-by-step actions taken..." className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Expected Result</label><input value={form.expected} onChange={e => setForm(f => ({ ...f, expected: e.target.value }))} placeholder="What should happen" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Actual Result</label><textarea value={form.actual} onChange={e => setForm(f => ({ ...f, actual: e.target.value }))} rows={2} placeholder="What actually happened" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" /></div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addUAT} disabled={!form.testCase || !form.module} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Log Test Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export const InformaticsDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'workflow') return <TBCascadeMapping />;
  if (activeTab === 'validation') return <WorkflowValidation />;
  if (activeTab === 'logic') return <ReportingLogic />;
  if (activeTab === 'cohort') return <CohortAnalysis />;
  if (activeTab === 'uat_support') return <UATSupport />;
  return null;
};
