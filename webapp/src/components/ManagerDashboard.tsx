import { useState } from 'react';
import {
  AlertTriangle, Clock, Plus, X, Download,
  Edit2, Send, ChevronDown, RefreshCw,
} from 'lucide-react';
import { MeetingCoordination } from './MeetingCoordination';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';
type Priority   = 'Critical' | 'High' | 'Medium' | 'Low';
type RiskStatus = 'Unmitigated' | 'Mitigating' | 'Mitigated' | 'Accepted';

interface Task {
  id: string; title: string; assignee: string; dueDate: string;
  priority: Priority; status: TaskStatus; deliverable: string; progress: number;
}
interface Risk {
  id: string; description: string; category: string; probability: 1|2|3|4|5;
  impact: 1|2|3|4|5; owner: string; status: RiskStatus; mitigation: string; date: string;
}
interface Deliverable {
  id: string; name: string; responsible: string; dueDate: string;
  progress: number; status: 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
  milestone: string;
}

// ─── Shared ────────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);
const priorityColor: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-800 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-amber-100 text-amber-700 border-amber-200',
  Low:      'bg-blue-100 text-blue-700 border-blue-200',
};
const riskBg: Record<RiskStatus, string> = {
  Unmitigated: 'bg-red-100 text-red-700 border-red-200',
  Mitigating:  'bg-amber-100 text-amber-700 border-amber-200',
  Mitigated:   'bg-green-100 text-green-700 border-green-200',
  Accepted:    'bg-neutral-100 text-neutral-600 border-neutral-200',
};
const deliverableColor: Record<string, string> = {
  'On Track':  'bg-green-100 text-green-700 border-green-200',
  'At Risk':   'bg-amber-100 text-amber-700 border-amber-200',
  'Delayed':   'bg-red-100 text-red-700 border-red-200',
  'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
};

// ─── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_TASKS: Task[] = [
  { id:'T-001', title:'Draft UAT Test Scripts for all 8 program stages',            assignee:'Samuel Barwon',  dueDate:'2026-05-25', priority:'Critical', status:'In Progress', deliverable:'D-05', progress:65 },
  { id:'T-002', title:'Confirm final list of Facility TB Clerks from MoH',          assignee:'Ruth Toe',       dueDate:'2026-05-22', priority:'High',     status:'To Do',      deliverable:'D-02', progress:0  },
  { id:'T-003', title:'Complete DHIS2 Metadata Configuration (all 15 counties)',     assignee:'David Sumo',     dueDate:'2026-05-23', priority:'High',     status:'In Progress', deliverable:'D-03', progress:80 },
  { id:'T-004', title:'Schedule county training sessions — Lofa & Maryland',         assignee:'Ruth Toe',       dueDate:'2026-05-28', priority:'Medium',   status:'To Do',      deliverable:'D-04', progress:0  },
  { id:'T-005', title:'Submit Week 8 Progress Report to Project Director',           assignee:'James Kpan',     dueDate:'2026-05-23', priority:'High',     status:'To Do',      deliverable:'D-06', progress:0  },
  { id:'T-006', title:'Fix DHIS2 Android sync timeout on Lofa county tablets',      assignee:'David Sumo',     dueDate:'2026-05-22', priority:'Critical', status:'In Progress', deliverable:'D-03', progress:40 },
  { id:'T-007', title:'Run full TB Cascade Mapping validation — Nimba County',      assignee:'Esther Flomo',   dueDate:'2026-05-27', priority:'Medium',   status:'To Do',      deliverable:'D-05', progress:0  },
  { id:'T-008', title:'Architecture Design Sign-off (MoH)',                          assignee:'James Kpan',     dueDate:'2026-04-30', priority:'High',     status:'Done',       deliverable:'D-01', progress:100},
  { id:'T-009', title:'Cloud Run Environment Provisioning',                          assignee:'David Sumo',     dueDate:'2026-04-28', priority:'High',     status:'Done',       deliverable:'D-01', progress:100},
  { id:'T-010', title:'Prepare onboarding materials for Montserrado clerks',         assignee:'Ruth Toe',       dueDate:'2026-05-19', priority:'Medium',   status:'Done',       deliverable:'D-04', progress:100},
  { id:'T-011', title:'Security penetration test — coordinate with vendor',         assignee:'Samuel Barwon',  dueDate:'2026-06-01', priority:'High',     status:'Blocked',    deliverable:'D-05', progress:10 },
  { id:'T-012', title:'PDF export letterhead — add branded print stylesheet',        assignee:'David Sumo',     dueDate:'2026-05-30', priority:'Low',      status:'To Do',      deliverable:'D-03', progress:0  },
];

const INITIAL_RISKS: Risk[] = [
  { id:'RSK-001', description:'MoH delays in finalizing list of Facility TB Clerks — blocks training scheduling', category:'Stakeholder', probability:4, impact:5, owner:'James Kpan', status:'Unmitigated', mitigation:'Escalated to Project Director on May 20. Follow-up meeting with MoH Director scheduled May 23.', date:'2026-05-10' },
  { id:'RSK-002', description:'Internet connectivity issues at rural clinics (Lofa, Grand Kru, Rivercess)', category:'Technical', probability:5, impact:4, owner:'David Sumo', status:'Mitigating', mitigation:'DHIS2 Android offline mode configured. Tablets use local sync queue. SIM card data plans being procured for 6 sites.', date:'2026-05-08' },
  { id:'RSK-003', description:'DHIS2 server certificate renewal failure could break mobile sync', category:'Technical', probability:2, impact:5, owner:'David Sumo', status:'Mitigated', mitigation:'Auto-renewal configured on Cloud Run. Monitoring alert set for 30-day warning. Last renewed May 11, 2026.', date:'2026-05-02' },
  { id:'RSK-004', description:'Training fatigue — facility clerks attending training without management buy-in', category:'Human Resources', probability:3, impact:3, owner:'Ruth Toe', status:'Mitigating', mitigation:'County Health Officers informed ahead of training. Attendance confirmation required from facility in-charges.', date:'2026-05-12' },
  { id:'RSK-005', description:'Duplicate patient records — detection logic not yet activated in production', category:'Data Quality', probability:4, impact:4, owner:'Samuel Barwon', status:'Unmitigated', mitigation:'Program Rule PR-006 drafted and tested in UAT. Pending activation in production DHIS2 after final review.', date:'2026-05-16' },
  { id:'RSK-006', description:'Budget overrun on training transportation costs', category:'Financial', probability:2, impact:3, owner:'James Kpan', status:'Accepted', mitigation:'Accepted risk — transportation budget reviewed and approved by Global Fund May 15. No further action needed.', date:'2026-05-15' },
  { id:'RSK-007', description:'Tablet hardware failures in high-heat coastal facilities (Maryland, Grand Kru)', category:'Technical', probability:3, impact:2, owner:'Ruth Toe', status:'Mitigating', mitigation:'Spare tablets (3) procured and ready for deployment. SOP for tablet replacement logged in helpdesk KB.', date:'2026-05-13' },
];

const DELIVERABLES: Deliverable[] = [
  { id:'D-01', name:'System Architecture & Environment Setup',       responsible:'David Sumo',    dueDate:'2026-04-30', progress:100, status:'Completed', milestone:'M1: Foundation' },
  { id:'D-02', name:'User Registration & DHIS2 Account Provisioning',responsible:'James Kpan',   dueDate:'2026-05-31', progress:55,  status:'At Risk',   milestone:'M2: Deployment' },
  { id:'D-03', name:'DHIS2 Tracker Configuration (all 15 counties)', responsible:'David Sumo',   dueDate:'2026-05-25', progress:80,  status:'On Track',  milestone:'M2: Deployment' },
  { id:'D-04', name:'Facility Training — All 31 Sites',              responsible:'Ruth Toe',     dueDate:'2026-07-31', progress:40,  status:'On Track',  milestone:'M3: Training'   },
  { id:'D-05', name:'UAT Execution & Bug Resolution',                responsible:'Samuel Barwon',dueDate:'2026-06-15', progress:30,  status:'At Risk',   milestone:'M4: QA & Launch'},
  { id:'D-06', name:'Weekly Progress Reporting (ongoing)',           responsible:'James Kpan',   dueDate:'2026-08-31', progress:62,  status:'On Track',  milestone:'All'            },
  { id:'D-07', name:'National Launch Event Preparation',             responsible:'James Kpan',   dueDate:'2026-08-15', progress:10,  status:'On Track',  milestone:'M5: Launch'     },
  { id:'D-08', name:'Post-Launch Support Documentation',             responsible:'Ruth Toe',     dueDate:'2026-09-30', progress:5,   status:'On Track',  milestone:'M6: Handover'   },
];

const WEEKLY_REPORTS = [
  { week:'Week 8 (May 14–20)', submittedBy:'James Kpan', date:'2026-05-21', status:'Draft',     highlights:'Android sync issue discovered at Lofa. UAT scripts 65% complete. Training at Margibi completed.', issues:'Tablet sync timeout affecting Lofa county (3 devices). MoH user list still pending.', nextWeek:'Fix sync timeout. Submit final user list request to MoH. Continue Bong training.' },
  { week:'Week 7 (May 7–13)',  submittedBy:'James Kpan', date:'2026-05-14', status:'Submitted', highlights:'Montserrado training completed (94% attendance). DHIS2 metadata v2.4.1 deployed. Security review 85% complete.', issues:'One Redemption Hospital tablet battery faulty — replaced.', nextWeek:'Begin Margibi training. Complete remaining UAT test cases. Draft Week 8 report.' },
  { week:'Week 6 (Apr 30–May 6)', submittedBy:'James Kpan', date:'2026-05-07', status:'Approved', highlights:'Nimba training completed. GeneXpert field mapping finalized. Cloud Run TLS certificate renewed.', issues:'None critical.', nextWeek:'Montserrado training. HIV status field restriction activated.' },
];

// ─── TAB: Workplan Management ─────────────────────────────────────────────────
const WorkplanTab = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [form, setForm] = useState({ title:'', assignee:'James Kpan', dueDate:'', priority:'Medium' as Priority, deliverable:'D-03', description:'' });

  const columns: TaskStatus[] = ['To Do','In Progress','Done','Blocked'];
  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterAssignee !== 'All' && t.assignee !== filterAssignee) return false;
    return true;
  });

  const addTask = () => {
    if (!form.title) return;
    const newTask: Task = {
      id: `T-${String(tasks.length + 1).padStart(3,'0')}`,
      title: form.title, assignee: form.assignee, dueDate: form.dueDate,
      priority: form.priority, status: 'To Do', deliverable: form.deliverable, progress: 0,
    };
    setTasks(prev => [newTask, ...prev]);
    setForm({ title:'', assignee:'James Kpan', dueDate:'', priority:'Medium', deliverable:'D-03', description:'' });
    setShowModal(false);
    (window as any).showToast(`Task "${newTask.title.slice(0,30)}…" created.`);
  };

  const advance = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Record<TaskStatus, TaskStatus> = { 'To Do':'In Progress','In Progress':'Done','Done':'To Do','Blocked':'To Do' };
      return { ...t, status: next[t.status], progress: next[t.status] === 'Done' ? 100 : t.progress };
    }));
  };

  const statusBg: Record<TaskStatus, string> = {
    'To Do':      'bg-neutral-50',
    'In Progress':'bg-blue-50',
    'Done':       'bg-green-50',
    'Blocked':    'bg-red-50',
  };

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Tasks',    val: tasks.length,                                                                 color:'text-health-blue', bg:'bg-blue-50' },
          { label:'In Progress',    val: tasks.filter(t=>t.status==='In Progress').length,                            color:'text-amber-700',   bg:'bg-amber-50'},
          { label:'Blocked',        val: tasks.filter(t=>t.status==='Blocked').length,                                color:'text-red-700',     bg:'bg-red-50'  },
          { label:'Completed',      val: tasks.filter(t=>t.status==='Done').length,                                   color:'text-green-700',   bg:'bg-green-50'},
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap gap-3 items-center">
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
          {['All','To Do','In Progress','Done','Blocked'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filterAssignee} onChange={e=>setFilterAssignee(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
          <option>All</option>
          {assignees.map(a=><option key={a}>{a}</option>)}
        </select>
        <span className="text-xs text-neutral-400 ml-auto">{filteredTasks.length} tasks</span>
        <button onClick={()=>setShowModal(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Plus className="h-4 w-4"/> New Task
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col} className={`${statusBg[col]} rounded-xl border border-neutral-200 overflow-hidden`}>
            <div className="px-4 py-3 border-b border-neutral-200 bg-white flex justify-between items-center">
              <span className="font-bold text-sm text-neutral-700">{col}</span>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">{filteredTasks.filter(t=>t.status===col).length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[300px]">
              {filteredTasks.filter(t=>t.status===col).map(t=>(
                <div key={t.id} className="bg-white rounded-lg border border-neutral-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-neutral-400">{t.id}</span>
                    <Pill label={t.priority} color={priorityColor[t.priority]}/>
                  </div>
                  <p className="text-xs font-bold text-neutral-800 leading-tight line-clamp-3">{t.title}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>{t.assignee.split(' ')[0]}</span>
                      <span>{t.progress}%</span>
                    </div>
                    <div className="bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${t.progress===100?'bg-green-500':t.status==='Blocked'?'bg-red-400':'bg-health-blue'}`} style={{width:`${t.progress}%`}}/>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-0.5"><Clock className="h-3 w-3"/>{t.dueDate}</p>
                  </div>
                  <button onClick={()=>advance(t.id)} className="mt-2 w-full text-xs border border-neutral-200 text-neutral-600 py-1 rounded hover:bg-neutral-50">
                    → Move Forward
                  </button>
                </div>
              ))}
              {filteredTasks.filter(t=>t.status===col).length===0 && (
                <div className="text-center py-8 text-neutral-300 text-xs">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[580px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="h-5 w-5"/> Create New Task</h3>
              <button onClick={()=>setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Task Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" placeholder="e.g. Draft UAT test scripts for PS-01"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Assignee</label>
                  <select value={form.assignee} onChange={e=>setForm(p=>({...p,assignee:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['James Kpan','David Sumo','Samuel Barwon','Ruth Toe','Esther Flomo','Mary Johnson'].map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Priority</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value as Priority}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Critical','High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Deliverable</label>
                  <select value={form.deliverable} onChange={e=>setForm(p=>({...p,deliverable:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {DELIVERABLES.map(d=><option key={d.id} value={d.id}>{d.id}: {d.name.slice(0,30)}…</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" placeholder="Detailed task requirements…"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addTask} disabled={!form.title} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: Risk Tracking ────────────────────────────────────────────────────────
const RisksTab = () => {
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Risk|null>(null);
  const [form, setForm] = useState({ description:'', category:'Technical', probability:3, impact:3, owner:'James Kpan', mitigation:'' });

  const riskScore = (r: Risk) => r.probability * r.impact;
  const riskLabel = (score: number) => score >= 16 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low';
  const riskColor = (score: number) => score >= 16 ? 'text-red-700' : score >= 9 ? 'text-orange-700' : score >= 4 ? 'text-amber-700' : 'text-blue-700';

  const advance = (id: string) => {
    setRisks(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next: Record<RiskStatus, RiskStatus> = { Unmitigated:'Mitigating', Mitigating:'Mitigated', Mitigated:'Accepted', Accepted:'Unmitigated' };
      return { ...r, status: next[r.status] };
    }));
  };

  const addRisk = () => {
    if (!form.description) return;
    const r: Risk = {
      id: `RSK-${String(risks.length+1).padStart(3,'0')}`,
      description: form.description, category: form.category,
      probability: form.probability as 1|2|3|4|5, impact: form.impact as 1|2|3|4|5,
      owner: form.owner, status:'Unmitigated', mitigation: form.mitigation,
      date: new Date().toISOString().slice(0,10),
    };
    setRisks(prev=>[r,...prev]);
    setForm({ description:'', category:'Technical', probability:3, impact:3, owner:'James Kpan', mitigation:'' });
    setShowModal(false);
    (window as any).showToast('Risk logged to register.');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Risk Register</h2>
          <p className="text-sm text-neutral-500 mt-1">Proactive tracking of implementation blockers · P×I scoring matrix</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>(window as any).showToast('Exporting risk register…')}
            className="border border-neutral-200 text-neutral-600 px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 hover:bg-neutral-50">
            <Download className="h-4 w-4"/> Export
          </button>
          <button onClick={()=>setShowModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-700 shadow-sm">
            <AlertTriangle className="h-4 w-4"/> Log Risk
          </button>
        </div>
      </div>

      {/* Summary matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['Critical','High','Medium','Low'] as const).map(level => {
          const count = risks.filter(r => riskLabel(riskScore(r)) === level && r.status !== 'Accepted').length;
          const colors = { Critical:'text-red-700 bg-red-50', High:'text-orange-700 bg-orange-50', Medium:'text-amber-700 bg-amber-50', Low:'text-blue-700 bg-blue-50' };
          return (
            <div key={level} className={`${colors[level]} rounded-xl p-4 border border-white shadow-sm`}>
              <p className="text-xs font-bold text-neutral-500 uppercase">{level} Risks</p>
              <p className={`text-3xl font-black mt-1 ${colors[level].split(' ')[0]}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Risk cards */}
      <div className="space-y-3">
        {risks.map(r => {
          const score = riskScore(r);
          return (
            <div key={r.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-neutral-50" onClick={()=>setSelected(selected?.id===r.id?null:r)}>
                <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex flex-col items-center justify-center font-black text-lg border-2 ${
                  score>=16?'bg-red-50 text-red-700 border-red-200':score>=9?'bg-orange-50 text-orange-700 border-orange-200':score>=4?'bg-amber-50 text-amber-700 border-amber-200':'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {score}
                  <span className="text-[8px] font-bold">P×I</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-neutral-400">{r.id}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${riskBg[r.status]}`}>{r.status}</span>
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded border border-neutral-200">{r.category}</span>
                  </div>
                  <p className="text-sm font-bold text-neutral-800">{r.description}</p>
                  <p className="text-xs text-neutral-400 mt-1">Owner: {r.owner} · Logged: {r.date} · P:{r.probability} × I:{r.impact} = {riskLabel(score)}</p>
                </div>
                <button onClick={e=>{e.stopPropagation();advance(r.id);}} className="flex-shrink-0 text-xs border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50">
                  <RefreshCw className="h-3.5 w-3.5"/>
                </button>
              </div>
              {selected?.id===r.id && (
                <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">
                  <p className="text-xs font-bold text-neutral-400 mb-1 uppercase">Mitigation Plan</p>
                  <p className="text-sm text-neutral-700 bg-white rounded-lg border border-neutral-200 p-3">{r.mitigation || 'No mitigation plan documented yet.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[560px] rounded-2xl shadow-2xl">
            <div className="bg-red-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Log New Risk</h3>
              <button onClick={()=>setShowModal(false)} className="hover:bg-red-700 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Risk Description *</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" placeholder="Describe the risk and its potential impact…"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Technical','Stakeholder','Financial','Human Resources','Data Quality','External'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Risk Owner</label>
                  <select value={form.owner} onChange={e=>setForm(p=>({...p,owner:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['James Kpan','David Sumo','Samuel Barwon','Ruth Toe','Esther Flomo'].map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Probability (1–5)</label>
                  <input type="range" min={1} max={5} value={form.probability} onChange={e=>setForm(p=>({...p,probability:+e.target.value}))} className="w-full"/>
                  <p className="text-center font-bold text-health-blue">{form.probability}</p>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Impact (1–5)</label>
                  <input type="range" min={1} max={5} value={form.impact} onChange={e=>setForm(p=>({...p,impact:+e.target.value}))} className="w-full"/>
                  <p className="text-center font-bold text-health-blue">{form.impact}</p>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">Risk Score: <span className={`text-xl font-black ${riskColor(form.probability*form.impact)}`}>{form.probability*form.impact}</span> — {riskLabel(form.probability*form.impact)}</p>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Mitigation Plan</label>
                <textarea value={form.mitigation} onChange={e=>setForm(p=>({...p,mitigation:e.target.value}))} rows={2} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" placeholder="Proposed actions to mitigate this risk…"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addRisk} disabled={!form.description} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-60">Log Risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: Progress Reporting ──────────────────────────────────────────────────
const ReportingTab = () => {
  const [reports] = useState(WEEKLY_REPORTS);
  const [selected, setSelected] = useState(WEEKLY_REPORTS[0]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ highlights:'', issues:'', nextWeek:'' });

  const startDraft = () => {
    setDraft({ highlights:'', issues:'', nextWeek:'' });
    setEditMode(true);
  };

  const submitReport = () => {
    setEditMode(false);
    (window as any).showToast('Week 9 Progress Report submitted to Project Director.');
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Progress Reporting</h2>
          <p className="text-sm text-neutral-500 mt-1">Weekly narrative reports submitted to Project Director and MoH stakeholders.</p>
        </div>
        <button onClick={startDraft} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Plus className="h-4 w-4"/> New Report
        </button>
      </div>

      {editMode && (
        <div className="bg-white rounded-xl border-2 border-health-blue shadow-md p-6 space-y-4">
          <h3 className="font-bold text-neutral-800 flex items-center gap-2"><Edit2 className="h-4 w-4 text-health-blue"/>Drafting: Week 9 Progress Report</h3>
          <div><label className="text-xs font-bold text-neutral-600 block mb-1">Key Highlights & Achievements *</label>
            <textarea value={draft.highlights} onChange={e=>setDraft(p=>({...p,highlights:e.target.value}))} rows={4} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" placeholder="Key milestones completed this week, training sessions held, features deployed…"/>
          </div>
          <div><label className="text-xs font-bold text-neutral-600 block mb-1">Issues & Blockers</label>
            <textarea value={draft.issues} onChange={e=>setDraft(p=>({...p,issues:e.target.value}))} rows={3} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" placeholder="Any blockers, delays, or issues requiring escalation…"/>
          </div>
          <div><label className="text-xs font-bold text-neutral-600 block mb-1">Next Week Plan</label>
            <textarea value={draft.nextWeek} onChange={e=>setDraft(p=>({...p,nextWeek:e.target.value}))} rows={3} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" placeholder="Key activities planned for next week…"/>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setEditMode(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium">Cancel</button>
            <button onClick={submitReport} disabled={!draft.highlights} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60 flex items-center gap-2">
              <Send className="h-4 w-4"/> Submit to Director
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <h3 className="font-bold text-neutral-700">Report Archive</h3>
          </div>
          {reports.map(r => (
            <div key={r.week} onClick={()=>setSelected(r)}
              className={`p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${selected?.week===r.week?'bg-blue-50 border-l-2 border-l-health-blue':''}`}>
              <p className="text-xs font-bold text-neutral-800">{r.week}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-neutral-500">{r.submittedBy}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${r.status==='Approved'?'bg-green-100 text-green-700 border-green-200':r.status==='Submitted'?'bg-blue-100 text-blue-700 border-blue-200':'bg-amber-100 text-amber-700 border-amber-200'}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-neutral-800">{selected.week}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Submitted by {selected.submittedBy} · {selected.date}</p>
            </div>
            <button onClick={()=>(window as any).showToast('Report exported as PDF.')}
              className="border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-neutral-50">
              <Download className="h-4 w-4"/> Export PDF
            </button>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label:'Key Highlights & Achievements', content: selected.highlights, color:'border-green-500' },
              { label:'Issues & Blockers',             content: selected.issues,    color:'border-red-400'   },
              { label:'Next Week Plan',                content: selected.nextWeek,  color:'border-blue-400'  },
            ].map(s => (
              <div key={s.label} className={`border-l-4 ${s.color} bg-neutral-50 rounded-r-xl pl-4 pr-4 py-3`}>
                <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{s.label}</p>
                <p className="text-sm text-neutral-700">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Deliverables Control ─────────────────────────────────────────────────
const DeliverablesTab = () => {
  const [deliverables] = useState<Deliverable[]>(DELIVERABLES);
  const [expanded, setExpanded] = useState<string|null>(null);

  const completedCount = deliverables.filter(d=>d.status==='Completed').length;
  const overallProgress = Math.round(deliverables.reduce((s,d)=>s+d.progress,0)/deliverables.length);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Deliverables Control</h2>
          <p className="text-sm text-neutral-500 mt-1">Master tracker for all contractual deliverables — 6 milestones, 8 deliverables.</p>
        </div>
        <button onClick={()=>(window as any).showToast('Deliverables report exported.')}
          className="border border-neutral-200 text-neutral-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-50 font-bold">
          <Download className="h-4 w-4"/> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Overall Progress', val:`${overallProgress}%`, color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Completed',        val:completedCount,        color:'text-green-700',   bg:'bg-green-50'},
          { label:'At Risk',          val:deliverables.filter(d=>d.status==='At Risk').length,   color:'text-amber-700', bg:'bg-amber-50'},
          { label:'Delayed',          val:deliverables.filter(d=>d.status==='Delayed').length,   color:'text-red-700',   bg:'bg-red-50'  },
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-neutral-700">Project Overall Completion</p>
          <p className="text-xl font-black text-health-blue">{overallProgress}%</p>
        </div>
        <div className="bg-neutral-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full bg-gradient-to-r from-health-blue to-green-500 transition-all" style={{width:`${overallProgress}%`}}/>
        </div>
      </div>

      {/* Deliverables list */}
      <div className="space-y-3">
        {deliverables.map(d => (
          <div key={d.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50" onClick={()=>setExpanded(expanded===d.id?null:d.id)}>
              <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center font-black text-sm border-2 ${d.status==='Completed'?'bg-green-50 text-green-700 border-green-200':d.status==='At Risk'?'bg-amber-50 text-amber-700 border-amber-200':d.status==='Delayed'?'bg-red-50 text-red-700 border-red-200':'bg-blue-50 text-blue-700 border-blue-200'}`}>{d.id}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-sm text-neutral-800">{d.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${deliverableColor[d.status]}`}>{d.status}</span>
                </div>
                <p className="text-xs text-neutral-400">{d.milestone} · {d.responsible} · Due: {d.dueDate}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${d.progress===100?'bg-green-500':d.status==='Delayed'?'bg-red-400':d.status==='At Risk'?'bg-amber-400':'bg-health-blue'}`} style={{width:`${d.progress}%`}}/>
                  </div>
                  <span className="text-xs font-black text-neutral-600 w-10 text-right">{d.progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e=>{e.stopPropagation();(window as any).showToast(`Editing deliverable: ${d.name}…`);}}
                  className="text-xs border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 flex items-center gap-1">
                  <Edit2 className="h-3.5 w-3.5"/> Edit
                </button>
                {expanded===d.id?<ChevronDown className="h-4 w-4 text-neutral-400"/>:<ChevronDown className="h-4 w-4 text-neutral-200"/>}
              </div>
            </div>
            {expanded===d.id && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-3 flex gap-4 text-sm text-neutral-600">
                <div><span className="font-bold text-xs text-neutral-400 block mb-0.5">RESPONSIBLE</span>{d.responsible}</div>
                <div><span className="font-bold text-xs text-neutral-400 block mb-0.5">MILESTONE</span>{d.milestone}</div>
                <div><span className="font-bold text-xs text-neutral-400 block mb-0.5">DUE DATE</span>{d.dueDate}</div>
                <div><span className="font-bold text-xs text-neutral-400 block mb-0.5">COMPLETION</span>{d.progress}%</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────
export const ManagerDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'workplan')    return <WorkplanTab />;
  if (activeTab === 'meeting')     return <MeetingCoordination />;
  if (activeTab === 'risks')       return <RisksTab />;
  if (activeTab === 'reporting')   return <ReportingTab />;
  if (activeTab === 'deliverables')return <DeliverablesTab />;
  return <WorkplanTab />;
};
