import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import {
  Award, TrendingUp, DollarSign, AlertTriangle, Download, CheckCircle2,
  Clock, Plus, X, Mail, ChevronDown, ChevronRight, Users, FileText,
  MessageSquare, Phone, Shield,
} from 'lucide-react';
import { STAKEHOLDERS, COUNTY_TB_DATA } from '../data/liberiaData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);

const statusColor: Record<string, string> = {
  Completed:    'bg-green-100 text-green-700 border-green-200',
  'In Progress':'bg-blue-100 text-blue-700 border-blue-200',
  'Not Started':'bg-neutral-100 text-neutral-500 border-neutral-200',
  Signed:       'bg-green-100 text-green-700 border-green-200',
  Pending:      'bg-amber-100 text-amber-700 border-amber-200',
  'Under Review':'bg-blue-100 text-blue-700 border-blue-200',
  Pass:         'bg-green-100 text-green-700 border-green-200',
  Fail:         'bg-red-100 text-red-700 border-red-200',
  Meeting:      'bg-purple-100 text-purple-700 border-purple-200',
  Report:       'bg-blue-100 text-blue-700 border-blue-200',
  Email:        'bg-neutral-100 text-neutral-600 border-neutral-200',
  Call:         'bg-amber-100 text-amber-700 border-amber-200',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const MILESTONES = [
  { id:'M1', title:'Project Inception & Planning',      status:'Completed',    due:'2026-02-28', done:'2026-02-26', progress:100, owner:'Project Director', deliverables:'Inception Report, Work Plan, Risk Register' },
  { id:'M2', title:'DHIS2 System Configuration',        status:'Completed',    due:'2026-04-15', done:'2026-04-12', progress:100, owner:'DHIS2 Config Specialist', deliverables:'Metadata, Tracker Programs, User Accounts' },
  { id:'M3', title:'UAT & Staff Training',              status:'In Progress',  due:'2026-06-30', done:'—',          progress:65,  owner:'Training Coordinator', deliverables:'Training Reports, UAT Sign-off, Issue Log' },
  { id:'M4', title:'National Rollout & System Handover',status:'Not Started',  due:'2026-09-30', done:'—',          progress:0,   owner:'Project Director', deliverables:'Handover Documentation, Final Report' },
];

const BUDGET_DATA = [
  { month:'Jan', planned:35000,  actual:32400  },
  { month:'Feb', planned:55000,  actual:53800  },
  { month:'Mar', planned:80000,  actual:77200  },
  { month:'Apr', planned:108000, actual:105900 },
  { month:'May', planned:135000, actual:131600 },
  { month:'Jun', planned:168000, actual:null   },
];

const ACTIVITIES = [
  { type:'Meeting',  subject:'Quarterly Review with MoH HMIS Director',           date:'2026-05-19', participants:'Project Director, MoH CMO, WHO Rep',      outcome:'Approved Phase 3 rollout plan. Next meeting: June 10.' },
  { type:'Report',   subject:'Global Fund Progress Report Q1 2026',               date:'2026-05-15', participants:'Project Director, Finance Officer',         outcome:'Submitted on time. Approval pending from Geneva.' },
  { type:'Email',    subject:'UAT Feedback from Tellewoyan Hospital',             date:'2026-05-14', participants:'Training Coordinator, Lofa County Officer',  outcome:'3 minor UI issues logged. Helpdesk notified.' },
  { type:'Call',     subject:'Emergency call — Lofa sync failure resolution',     date:'2026-05-13', participants:'DHIS2 Specialist, IT Support',              outcome:'Connectivity issue identified. Backup modem dispatched.' },
  { type:'Meeting',  subject:'Stakeholder alignment: US CDC PEPFAR integration',  date:'2026-05-10', participants:'Project Director, CDC Rep, MoH TB Division',  outcome:'TB/HIV integration timeline confirmed for Q3.' },
  { type:'Report',   subject:'Milestone 2 Invoice & Deliverables Submission',     date:'2026-05-08', participants:'Finance Officer, Project Director',          outcome:'Invoice submitted. Approved by Global Fund (May 12).' },
];

type QaStatus = 'Pass' | 'Fail' | 'Pending';
interface QaItem { id: string; category: string; item: string; status: QaStatus; by: string; date: string; }
const INITIAL_QA: QaItem[] = [
  { id:'Q01', category:'System Configuration', item:'DHIS2 Tracker program deployed with all 6 enrollment stages', status:'Pass',    by:'David Sumo',   date:'2026-05-10' },
  { id:'Q02', category:'System Configuration', item:'All 31 facility organisation units registered in DHIS2',       status:'Pass',    by:'David Sumo',   date:'2026-05-10' },
  { id:'Q03', category:'System Configuration', item:'15 county-level organisation units correctly mapped',          status:'Pass',    by:'David Sumo',   date:'2026-05-10' },
  { id:'Q04', category:'System Configuration', item:'All national reporting indicators configured and tested',      status:'Pass',    by:'Esther Flomo', date:'2026-05-12' },
  { id:'Q05', category:'Data Quality',         item:'Duplicate patient records deduplication completed',            status:'Pending', by:'—',            date:'—'          },
  { id:'Q06', category:'Data Quality',         item:'Data completeness > 90% across all active facilities',        status:'Pass',    by:'Esther Flomo', date:'2026-05-14' },
  { id:'Q07', category:'Data Quality',         item:'Treatment outcome data captured for ≥ 85% of Q4 2025 cohort', status:'Pass',    by:'Esther Flomo', date:'2026-05-14' },
  { id:'Q08', category:'Security',             item:'Role-based access control validated for all 8 user roles',    status:'Pass',    by:'Samuel Barwon', date:'2026-05-11' },
  { id:'Q09', category:'Security',             item:'SSL/TLS encryption verified on all data transmissions',       status:'Pass',    by:'Samuel Barwon', date:'2026-05-11' },
  { id:'Q10', category:'Security',             item:'DHIS2 audit logging enabled and verified',                    status:'Pass',    by:'Samuel Barwon', date:'2026-05-11' },
  { id:'Q11', category:'Training',             item:'≥ 80% of facility data clerks trained and certified',        status:'Pending', by:'—',            date:'—'          },
  { id:'Q12', category:'Training',             item:'Training materials available in local languages',             status:'Fail',    by:'Ruth Toe',     date:'2026-05-16' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const ExecTab = () => {
  const [expandedMs, setExpandedMs] = useState<string | null>(null);
  const totalBudget = 215000;
  const spentBudget = 131600;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Executive Leadership & Contractual Oversight</h2>
          <p className="text-sm text-neutral-500 mt-1">Global Fund TB e-Tracker Implementation — Liberia MoH · Reporting Period: Q1–Q2 2026</p>
        </div>
        <button onClick={() => (window as any).showToast('Generating executive PDF report…')}
          className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Award,        label:'Project Status',    value:'On Track',       sub:'Milestone 2/4 completed', color:'text-green-600', bg:'bg-green-50 border-green-200' },
          { icon: TrendingUp,   label:'Overall Progress',  value:'67%',            sub:'On schedule', color:'text-health-blue', bg:'bg-blue-50 border-blue-200' },
          { icon: DollarSign,   label:'Budget Utilised',   value:`$${(spentBudget/1000).toFixed(1)}K`, sub:`of $${(totalBudget/1000).toFixed(0)}K total · 3.2% under`, color:'text-green-700', bg:'bg-green-50 border-green-200' },
          { icon: AlertTriangle,label:'Active Risks',      value:'2 High',         sub:'1 Critical — Lofa sync', color:'text-amber-600', bg:'bg-amber-50 border-amber-200' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} border rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center gap-2 mb-1"><k.icon className="h-4 w-4 text-neutral-500" /><p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p></div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-neutral-400 mt-1">{k.sub}</p>
            {k.label === 'Overall Progress' && <div className="mt-2 bg-white rounded-full h-2 overflow-hidden"><div className="bg-health-blue h-2 rounded-full" style={{ width: '67%' }} /></div>}
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50"><h3 className="font-bold text-neutral-800">Implementation Milestones</h3></div>
        {MILESTONES.map(m => (
          <div key={m.id} className="border-b border-neutral-100 last:border-0">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50" onClick={() => setExpandedMs(expandedMs === m.id ? null : m.id)}>
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-black text-neutral-600 flex-shrink-0">{m.id}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-neutral-800">{m.title}</p>
                  <Pill label={m.status} color={statusColor[m.status]} />
                </div>
                <div className="mt-2 bg-neutral-100 rounded-full h-2 overflow-hidden w-full max-w-xs">
                  <div className={`h-2 rounded-full transition-all ${m.progress===100?'bg-green-500':m.progress>0?'bg-health-blue':'bg-neutral-300'}`} style={{ width:`${m.progress}%` }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0 hidden md:block">
                <p className="text-xs text-neutral-400">Due</p>
                <p className="text-sm font-bold text-neutral-700">{m.due}</p>
              </div>
              <div className="text-xl font-black text-neutral-300">{m.progress}%</div>
              {expandedMs === m.id ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
            </div>
            {expandedMs === m.id && (
              <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs font-bold text-neutral-400 mb-1">Owner</p><p className="font-bold text-neutral-700">{m.owner}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 mb-1">Completed On</p><p className="font-bold text-neutral-700">{m.done}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 mb-1">Key Deliverables</p><p className="text-neutral-600">{m.deliverables}</p></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-800 mb-4">Budget Burn Rate vs Plan (USD)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={BUDGET_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Planned" dot={false} />
              <Line type="monotone" dataKey="actual"  stroke="#004e89" strokeWidth={3} name="Actual" dot={{ r: 4, fill: '#004e89' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-800 mb-4">Recent Executive Activities</h3>
          <div className="space-y-3">
            {ACTIVITIES.slice(0, 5).map((a, i) => (
              <div key={i} className="flex gap-3 items-start pb-3 border-b border-neutral-100 last:border-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-health-blue/10 flex items-center justify-center">
                  {a.type === 'Meeting' ? <Users className="h-4 w-4 text-health-blue" /> :
                   a.type === 'Report'  ? <FileText className="h-4 w-4 text-health-blue" /> :
                   a.type === 'Email'   ? <Mail className="h-4 w-4 text-health-blue" /> :
                   <Phone className="h-4 w-4 text-health-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><Pill label={a.type} color={statusColor[a.type]} /><p className="text-xs text-neutral-400">{a.date}</p></div>
                  <p className="text-sm font-bold text-neutral-800 mt-0.5">{a.subject}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{a.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StakeholdersTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [stakeholders, setStakeholders] = useState(STAKEHOLDERS);
  const [form, setForm] = useState({ org: '', contact: '', role: '', email: '', signoff: '', signoffDate: '', status: 'Pending' });

  const add = () => {
    if (!form.org) return;
    setStakeholders(prev => [...prev, form]);
    setForm({ org: '', contact: '', role: '', email: '', signoff: '', signoffDate: '', status: 'Pending' });
    setShowModal(false);
    (window as any).showToast('Stakeholder added to registry.');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Stakeholder Registry & Sign-offs</h2>
          <p className="text-sm text-neutral-500">{stakeholders.filter(s => s.status === 'Signed').length} of {stakeholders.length} stakeholders have signed off</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Plus className="h-4 w-4" /> Add Stakeholder
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['Organization','Contact Person','Role','Email','Sign-off Item','Date','Status'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stakeholders.map((s,i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800">{s.org}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-health-blue/10 text-health-blue rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{s.contact[0]}</div>
                      <span className="text-sm text-neutral-700">{s.contact}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{s.role}</td>
                  <td className="px-4 py-3"><a href={`mailto:${s.email}`} className="text-sm text-health-blue hover:underline flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</a></td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{s.signoff}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{s.signoffDate}</td>
                  <td className="px-4 py-3"><Pill label={s.status} color={statusColor[s.status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[540px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Stakeholder</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label:'Organization *', key:'org', placeholder:'e.g. UNICEF Liberia' },
                { label:'Contact Person', key:'contact', placeholder:'Full name' },
                { label:'Role / Title', key:'role', placeholder:'e.g. Country Representative' },
                { label:'Email', key:'email', placeholder:'name@org.com' },
                { label:'Sign-off Item', key:'signoff', placeholder:'e.g. Training Plan' },
                { label:'Sign-off Date', key:'signoffDate', placeholder:'YYYY-MM-DD' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-neutral-600 block mb-1">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                  {['Pending','Signed','Under Review'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={add} disabled={!form.org} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OversightTab = () => {
  const rolloutData = COUNTY_TB_DATA.map(c => {
    const pct = Math.round((c.success / c.diagnosed) * 100);
    const status = pct >= 85 ? 'Completed' : pct >= 60 ? 'In Progress' : 'Scheduled';
    return { county: c.county, facilities: c.facilities, trained: pct, status, target: c.successRate >= 85 ? '2026-05-31' : '2026-07-31' };
  });
  const avgRollout = Math.round(rolloutData.reduce((s, r) => s + r.trained, 0) / rolloutData.length);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-bold text-neutral-800">County Implementation Oversight</h2>
        <p className="text-sm text-neutral-500 mt-1">Tracking implementation progress across all 15 counties — {avgRollout}% national average</p>
        <div className="mt-3 bg-neutral-100 rounded-full h-3 overflow-hidden max-w-md">
          <div className="bg-health-blue h-3 rounded-full" style={{ width: `${avgRollout}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50"><h3 className="font-bold text-neutral-800">County Rollout Status</h3></div>
          <div className="divide-y divide-neutral-100">
            {rolloutData.map(r => (
              <div key={r.county} className="px-5 py-3 flex items-center gap-4">
                <div className="w-28 text-sm font-bold text-neutral-700 flex-shrink-0">{r.county}</div>
                <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full ${r.status==='Completed'?'bg-green-500':r.status==='In Progress'?'bg-health-blue':'bg-amber-400'}`}
                    style={{ width:`${r.trained}%` }} />
                </div>
                <span className="text-sm font-black text-neutral-700 w-10 text-right">{r.trained}%</span>
                <Pill label={r.status} color={statusColor[r.status]} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-800 mb-4">TB Case Detection by County</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={COUNTY_TB_DATA.map(c => ({ name: c.county.slice(0,8), diagnosed: c.diagnosed, success: c.success }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={64} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="diagnosed" name="Diagnosed" fill="#004e89" radius={[0,4,4,0]} />
              <Bar dataKey="success"   name="Success"   fill="#27ae60" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const QualityTab = () => {
  const [items, setItems] = useState<QaItem[]>(INITIAL_QA);
  const toggle = (id: string) => {
    setItems(prev => prev.map(q => {
      if (q.id !== id) return q;
      const next: QaStatus = q.status === 'Pass' ? 'Fail' : q.status === 'Fail' ? 'Pending' : 'Pass';
      return { ...q, status: next, by: next !== 'Pending' ? 'Project Director' : '—', date: next !== 'Pending' ? new Date().toISOString().slice(0,10) : '—' };
    }));
  };
  const passCount = items.filter(q => q.status === 'Pass').length;
  const categories = Array.from(new Set(items.map(q => q.category)));

  return (
    <div className="space-y-5">
      <div className="flex gap-4 items-center bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <div className={`text-5xl font-black ${passCount / items.length >= 0.9 ? 'text-green-600' : 'text-amber-600'}`}>{Math.round(passCount/items.length*100)}%</div>
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Quality Assurance Checklist</h2>
          <p className="text-sm text-neutral-500">{passCount} of {items.length} checks passing · Click any row to toggle status</p>
        </div>
      </div>
      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200">
            <p className="text-sm font-bold text-neutral-700 flex items-center gap-2"><Shield className="h-4 w-4 text-health-blue" />{cat}</p>
          </div>
          {items.filter(q => q.category === cat).map(q => (
            <div key={q.id} className="px-5 py-3 flex items-center gap-4 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0" onClick={() => toggle(q.id)}>
              <div className="flex-shrink-0">
                {q.status === 'Pass'    ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                 q.status === 'Fail'    ? <X className="h-5 w-5 text-red-500" /> :
                 <Clock className="h-5 w-5 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800">{q.item}</p>
              </div>
              <Pill label={q.status} color={statusColor[q.status]} />
              <div className="hidden md:block text-right flex-shrink-0">
                <p className="text-xs text-neutral-400">{q.by !== '—' ? q.by : ''}</p>
                <p className="text-xs text-neutral-400">{q.date !== '—' ? q.date : ''}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CommunicationTab = () => {
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [comms, setComms] = useState(ACTIVITIES);
  const [form, setForm] = useState({ type: 'Meeting', subject: '', date: '', participants: '', outcome: '' });

  const filtered = filter === 'All' ? comms : comms.filter(c => c.type === filter);
  const add = () => {
    if (!form.subject) return;
    setComms(prev => [form, ...prev]);
    setForm({ type: 'Meeting', subject: '', date: '', participants: '', outcome: '' });
    setShowModal(false);
    (window as any).showToast('Communication logged.');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Executive Communication Log</h2>
          <p className="text-sm text-neutral-500">{comms.length} communications recorded</p>
        </div>
        <div className="flex gap-2">
          {['All','Meeting','Report','Email','Call'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter===t?'bg-health-blue text-white':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{t}</button>
          ))}
          <button onClick={() => setShowModal(true)} className="bg-health-blue text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-800">
            <Plus className="h-3.5 w-3.5" /> Compose
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-health-blue/10 flex items-center justify-center flex-shrink-0">
                  {a.type==='Meeting'?<Users className="h-5 w-5 text-health-blue"/>:a.type==='Report'?<FileText className="h-5 w-5 text-health-blue"/>:a.type==='Email'?<Mail className="h-5 w-5 text-health-blue"/>:<Phone className="h-5 w-5 text-health-blue"/>}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap"><Pill label={a.type} color={statusColor[a.type]} /><p className="text-xs text-neutral-400">{a.date}</p></div>
                  <p className="font-bold text-neutral-800 mt-1">{a.subject}</p>
                  <p className="text-xs text-neutral-500 mt-1"><span className="font-bold">Participants:</span> {a.participants}</p>
                  <p className="text-sm text-neutral-600 mt-1 bg-neutral-50 rounded-lg p-2">{a.outcome}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[540px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5"/>Log Communication</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Meeting','Report','Email','Call'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
                </div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Subject *</label>
                <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Communication subject" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue"/>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Participants</label>
                <input value={form.participants} onChange={e=>setForm(p=>({...p,participants:e.target.value}))} placeholder="Names, organizations" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Outcome / Notes</label>
                <textarea value={form.outcome} onChange={e=>setForm(p=>({...p,outcome:e.target.value}))} rows={3} placeholder="Key decisions, action items..." className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={add} disabled={!form.subject} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const DirectorDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'exec') return <ExecTab />;
  if (activeTab === 'stakeholders') return <StakeholdersTab />;
  if (activeTab === 'oversight') return <OversightTab />;
  if (activeTab === 'quality') return <QualityTab />;
  if (activeTab === 'communication') return <CommunicationTab />;
  return <ExecTab />;
};
