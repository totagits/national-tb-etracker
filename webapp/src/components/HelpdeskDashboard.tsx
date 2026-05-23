import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Search, Plus, MessageSquare, X, Send, ChevronDown,
} from 'lucide-react';
import type { Ticket } from '../data/liberiaData';
import { HELPDESK_TICKETS, ALL_COUNTIES } from '../data/liberiaData';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const priorityColor: Record<string, string> = {
  Critical: 'bg-red-100 text-red-800 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-amber-100 text-amber-700 border-amber-200',
  Low:      'bg-blue-100 text-blue-700 border-blue-200',
};
const statusColor: Record<string, string> = {
  Open:        'bg-red-100 text-red-700 border-red-200',
  'In Progress':'bg-blue-100 text-blue-700 border-blue-200',
  Resolved:    'bg-green-100 text-green-700 border-green-200',
  Closed:      'bg-neutral-100 text-neutral-600 border-neutral-200',
};
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);

const PIE_COLORS = ['#ef4444','#f97316','#f59e0b','#3b82f6'];

// ─── Knowledge Base ───────────────────────────────────────────────────────────
const KB_ARTICLES = [
  { id:'KB-001', title:'Cannot log in after password reset', category:'Login/Access', helpful:24, symptoms:'Login page shows "Invalid credentials" even after reset email received.', solution:'1. Clear browser cache and cookies.\n2. Ensure you are using the new password, not the old one.\n3. Check Caps Lock is off.\n4. If still locked, contact helpdesk — account may need admin reset in DHIS2.', related:3 },
  { id:'KB-002', title:'DHIS2 Android app not syncing', category:'Sync Issues', helpful:31, symptoms:'App shows offline icon or "Connection failed" when trying to upload patient data.', solution:'1. Check tablet WiFi/mobile data connection.\n2. Open DHIS2 app → Settings → Server URL and verify it points to the correct server.\n3. Tap "Sync now" and wait 2 minutes.\n4. If still failing, turn airplane mode on/off and retry.\n5. Escalate if offline queue has > 20 records pending.', related:5 },
  { id:'KB-003', title:'HIV Status field not appearing in form', category:'Data Entry', helpful:18, symptoms:'The "HIV Status" field is missing from the TB enrollment form.', solution:'1. Verify you are logged in as a TB/HIV Officer — this field is role-restricted.\n2. If you have the correct role, sync metadata: DHIS2 → Settings → Sync metadata.\n3. Log out and back in.\n4. If still missing, report to DHIS2 config specialist.', related:2 },
  { id:'KB-004', title:'Duplicate patient records created', category:'Data Entry', helpful:12, symptoms:'Same patient appears twice with different TB IDs in search results.', solution:'1. Do NOT delete either record — contact the informatics specialist.\n2. Identify the most complete record (more fields filled).\n3. Log a helpdesk ticket referencing both TB IDs.\n4. The informatics team will merge records in DHIS2 and update the audit log.', related:4 },
  { id:'KB-005', title:'Tablet not charging / not turning on', category:'Hardware', helpful:9, symptoms:'Tablet screen stays black or charging indicator does not appear.', solution:'1. Try a different charging cable and power adapter.\n2. Hold power button for 10 seconds to force restart.\n3. Check if the USB port is dirty — clean with compressed air.\n4. If still unresponsive, use paper forms as backup and log a hardware ticket.\n5. Replacement equipment request: contact Training Coordinator.', related:1 },
  { id:'KB-006', title:'Page loads slowly or shows blank screen', category:'System Errors', helpful:15, symptoms:'TB e-Tracker web app takes >10 seconds to load or shows white screen.', solution:'1. Check internet connection speed (minimum 1 Mbps recommended).\n2. Clear browser cache: Ctrl+Shift+Delete → Clear all.\n3. Try opening in incognito/private mode.\n4. Use Google Chrome for best performance.\n5. If on mobile data, switch to WiFi if available.', related:3 },
  { id:'KB-007', title:'Treatment outcome not saving', category:'Data Entry', helpful:7, symptoms:'Clicking "Save" on treatment outcome form shows no confirmation and data disappears.', solution:'1. Check all required fields are filled (outcome type, date, and notes).\n2. Ensure you are online — outcome recording requires server connection.\n3. Screenshot the form and retry.\n4. If data is lost, re-enter from the paper treatment card and log a bug report.', related:2 },
  { id:'KB-008', title:'Cannot access county-level analytics', category:'Login/Access', helpful:20, symptoms:'County officer sees "Access Denied" or empty data when opening county analytics.', solution:'1. Verify your user account is assigned to the correct county org unit in DHIS2.\n2. Log out and log in again to refresh permissions.\n3. Check with National Admin that your account has "County Officer" role.\n4. If issue persists, the National Admin must update your org unit assignment in DHIS2 Users.', related:2 },
  { id:'KB-009', title:'Meeting camera not showing video', category:'System Errors', helpful:11, symptoms:'Camera permission was granted but no video preview appears in meeting room.', solution:'1. Refresh the page and grant camera permission again when prompted.\n2. Check no other app is using the camera (close video call apps).\n3. Try a different browser (Chrome recommended).\n4. On Windows: Settings → Privacy → Camera → Allow access.\n5. Check physical camera cover is not blocking the lens.', related:1 },
  { id:'KB-010', title:'PDF export shows blank / missing data', category:'System Errors', helpful:8, symptoms:'Clicking "Export PDF" opens print dialog but the document is empty or truncated.', solution:'1. Wait for the page to fully load before clicking export.\n2. In print dialog: set "Print backgrounds" to ON.\n3. Select "Save as PDF" as destination.\n4. If data is missing, scroll through the full report first (triggers lazy loading), then export.', related:2 },
  { id:'KB-011', title:'Registration wizard stops at Step 1', category:'System Errors', helpful:19, symptoms:'Clicking "Next" on Step 1 of the registration wizard does nothing.', solution:'1. Ensure all required fields marked with * are filled.\n2. Check date of birth format: use the date picker, do not type manually.\n3. Check that TB ID field shows "Auto-generated" — if blank, reload the page.\n4. Disable browser extensions (especially ad blockers) and retry.', related:4 },
  { id:'KB-012', title:'Data not showing in national dashboard after entry', category:'Sync Issues', helpful:22, symptoms:'Patient registered at facility but does not appear in National Admin analytics.', solution:'1. Confirm the patient record was saved (green checkmark appeared).\n2. Analytics dashboards may have up to 1-hour lag — refresh after waiting.\n3. Check the county filter in analytics is set to "All 15 Counties".\n4. If still missing after 2 hours, log a sync issue ticket with the patient TB ID.', related:6 },
];

// ─── Monthly SLA data ────────────────────────────────────────────────────────
const SLA_MONTHLY = [
  { month:'Jan', total:12, resolved:11, avgHours:3.1, slaMet:91.7, critical:1 },
  { month:'Feb', total:15, resolved:14, avgHours:2.8, slaMet:93.3, critical:2 },
  { month:'Mar', total:9,  resolved:9,  avgHours:2.2, slaMet:100,  critical:0 },
  { month:'Apr', total:18, resolved:17, avgHours:3.5, slaMet:88.9, critical:3 },
  { month:'May', total:21, resolved:16, avgHours:3.2, slaMet:94.2, critical:2 },
];

const CONVERSATION: Record<string, { sender: string; message: string; time: string }[]> = {
  'HD-002': [
    { sender:'Ruth Toe (Reporter)',    message:'Urgent! The DHIS2 Android app is not syncing at Tellewoyan Hospital. We have 48 patient records in the offline queue and cannot upload. The system shows "Connection timeout" after 30 seconds.', time:'2026-05-20 07:05' },
    { sender:'David Sumo (Assignee)',  message:'Hi Ruth, I\'ve received the ticket. I\'m connecting to the DHIS2 server now to check the sync logs. Can you confirm: is this affecting all 3 tablets at the facility, or just one?', time:'2026-05-20 07:45' },
    { sender:'Ruth Toe (Reporter)',    message:'All 3 tablets. We checked the WiFi — it\'s working fine (we can browse the internet). The issue is specifically with the DHIS2 app sync endpoint.', time:'2026-05-20 08:10' },
    { sender:'David Sumo (Assignee)',  message:'Confirmed. I can see in the Cloud Run logs that the server is responding but there\'s a certificate validation error on the Android SDK side — it\'s rejecting the TLS certificate after the recent server update. I\'m preparing a fix now. In the meantime, please continue on paper forms. ETA for fix: 2 hours.', time:'2026-05-20 09:30' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Logging
// ─────────────────────────────────────────────────────────────────────────────
const LoggingTab = () => {
  const [tickets, setTickets] = useState<Ticket[]>(HELPDESK_TICKETS);
  const [search, setSearch] = useState('');
  const [priorityF, setPriorityF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [categoryF, setCategoryF] = useState('All');
  const [countyF, setCountyF] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ title:'', county:'Montserrado', facility:'', category:'Sync Issue', priority:'Medium', description:'', reporter:'' });

  const categories = ['All','Login/Access','Data Entry','Sync Issue','System Error','Training','Hardware'];
  const filtered = useMemo(() => tickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.facility.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityF !== 'All' && t.priority !== priorityF) return false;
    if (statusF   !== 'All' && t.status   !== statusF)   return false;
    if (categoryF !== 'All' && t.category !== categoryF) return false;
    if (countyF   !== 'All' && t.county   !== countyF)   return false;
    return true;
  }), [tickets, search, priorityF, statusF, categoryF, countyF]);

  const openCount = tickets.filter(t => ['Open','In Progress'].includes(t.status)).length;
  const critHigh = tickets.filter(t => ['Critical','High'].includes(t.priority) && t.status !== 'Closed').length;

  const addTicket = () => {
    if (!form.title) return;
    const t: Ticket = {
      id: `HD-${String(tickets.length+1).padStart(3,'0')}`,
      title: form.title, county: form.county, facility: form.facility,
      reporter: form.reporter, category: form.category as any,
      priority: form.priority as any, status: 'Open',
      created: new Date().toISOString().slice(0,16).replace('T',' '),
      updated: new Date().toISOString().slice(0,16).replace('T',' '),
      slaHours: form.priority === 'Critical' ? 4 : form.priority === 'High' ? 8 : 24,
      assignee: 'Samuel Barwon', description: form.description,
    };
    setTickets(prev => [t, ...prev]);
    setForm({ title:'', county:'Montserrado', facility:'', category:'Sync Issue', priority:'Medium', description:'', reporter:'' });
    setShowModal(false);
    (window as any).showToast('Ticket logged — assigned to Samuel Barwon.');
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Open Tickets',      val:openCount,   color:'text-red-700',   bg:'bg-red-50'   },
          { label:'Critical / High',   val:critHigh,    color:'text-orange-700',bg:'bg-orange-50'},
          { label:'Avg Resolution',    val:'3.2h',      color:'text-health-blue',bg:'bg-blue-50' },
          { label:'SLA Compliance',    val:'94.2%',     color:'text-green-700', bg:'bg-green-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets…" className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-48" />
        </div>
        {[
          { val:priorityF, set:setPriorityF, opts:['All','Critical','High','Medium','Low'], label:'Priority' },
          { val:statusF,   set:setStatusF,   opts:['All','Open','In Progress','Resolved','Closed'], label:'Status' },
          { val:categoryF, set:setCategoryF, opts:categories, label:'Category' },
          { val:countyF,   set:setCountyF,   opts:['All',...ALL_COUNTIES], label:'County' },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e=>f.set(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
            {f.opts.map(o=><option key={o}>{o}</option>)}
          </select>
        ))}
        <button onClick={()=>setShowModal(true)} className="ml-auto bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Plus className="h-4 w-4"/> Log New Ticket
        </button>
      </div>

      {/* Ticket table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['ID','Title','County','Facility','Category','Priority','Status','Created','Assignee'].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(t=>(
                <tr key={t.id} className="hover:bg-neutral-50 cursor-pointer" onClick={()=>setSelected(t)}>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-400">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-health-blue max-w-xs truncate">{t.title}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{t.county}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500 max-w-[120px] truncate">{t.facility}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.category}</td>
                  <td className="px-4 py-3"><Pill label={t.priority} color={priorityColor[t.priority]}/></td>
                  <td className="px-4 py-3"><Pill label={t.status} color={statusColor[t.status]}/></td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{t.created}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{t.assignee}</td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-400">No tickets match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={()=>setSelected(null)}>
          <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-start">
              <div><p className="text-xs text-blue-200">{selected.id} · {selected.category}</p><h3 className="font-bold text-lg mt-0.5">{selected.title}</h3></div>
              <button onClick={()=>setSelected(null)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap"><Pill label={selected.priority} color={priorityColor[selected.priority]}/><Pill label={selected.status} color={statusColor[selected.status]}/></div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[['County',selected.county],['Facility',selected.facility],['Reporter',selected.reporter],['Assignee',selected.assignee],['Created',selected.created],['SLA',`${selected.slaHours}h`]].map(([l,v])=>(
                  <div key={l}><p className="text-xs font-bold text-neutral-400">{l}</p><p className="font-bold text-neutral-700 mt-0.5">{v}</p></div>
                ))}
              </div>
              <div><p className="text-xs font-bold text-neutral-400 mb-1">Description</p><p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 border">{selected.description}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* New ticket modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">Log New Support Ticket</h3>
              <button onClick={()=>setShowModal(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Brief description of the issue" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">County</label>
                  <select value={form.county} onChange={e=>setForm(p=>({...p,county:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {ALL_COUNTIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Priority</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Critical','High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Login/Access','Data Entry','Sync Issue','System Error','Training','Hardware'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Reporter</label>
                  <input value={form.reporter} onChange={e=>setForm(p=>({...p,reporter:e.target.value}))} placeholder="Full name" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
                </div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Facility</label>
                <input value={form.facility} onChange={e=>setForm(p=>({...p,facility:e.target.value}))} placeholder="Facility name" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={4} placeholder="Detailed description of the issue — steps to reproduce, error messages, screenshots…" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={addTicket} disabled={!form.title} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Knowledge Base / Troubleshooting
// ─────────────────────────────────────────────────────────────────────────────
const TroubleshootingTab = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [helpful, setHelpful] = useState<Record<string,number>>({});
  const [expanded, setExpanded] = useState<string|null>(null);

  const cats = ['All','Login/Access','Sync Issues','Data Entry','Hardware','System Errors'];
  const filtered = KB_ARTICLES
    .filter(a => catFilter === 'All' || a.category === catFilter)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.symptoms.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Troubleshooting Knowledge Base</h2>
          <p className="text-sm text-neutral-500">{KB_ARTICLES.length} articles · Click an article to expand solution steps</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles…" className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-48"/>
          </div>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${catFilter===c?'bg-health-blue text-white':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(a=>(
          <div key={a.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-neutral-50" onClick={()=>setExpanded(expanded===a.id?null:a.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">{a.category}</span>
                  <span className="text-xs text-neutral-400">{a.id} · {a.related} related tickets</span>
                </div>
                <p className="font-bold text-neutral-800">{a.title}</p>
                <p className="text-xs text-neutral-500 mt-1 italic">"{a.symptoms}"</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={e=>{e.stopPropagation();setHelpful(p=>({...p,[a.id]:(p[a.id]||a.helpful)+1}));(window as any).showToast('Marked as helpful!');}}
                  className="text-xs text-neutral-500 hover:text-green-600 flex items-center gap-1 border border-neutral-200 rounded-lg px-2.5 py-1 hover:bg-green-50 transition-colors">
                  👍 {helpful[a.id] || a.helpful}
                </button>
                {expanded===a.id?<ChevronDown className="h-4 w-4 text-neutral-400"/>:<MessageSquare className="h-4 w-4 text-neutral-400"/>}
              </div>
            </div>
            {expanded===a.id && (
              <div className="bg-neutral-50 border-t border-neutral-200 p-5">
                <p className="text-xs font-bold text-neutral-500 mb-2 uppercase">Step-by-Step Solution</p>
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                  {a.solution.split('\n').map((line,i)=>(
                    <p key={i} className={`text-sm text-neutral-700 ${i>0?'mt-2':''}`}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length===0&&<div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400">No articles match your search.</div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Ticket Detail / User Support
// ─────────────────────────────────────────────────────────────────────────────
const TicketsTab = () => {
  const [tickets] = useState<Ticket[]>(HELPDESK_TICKETS);
  const [selectedId, setSelectedId] = useState('HD-002');
  const [reply, setReply] = useState('');
  const [convos, setConvos] = useState<Record<string,{sender:string;message:string;time:string}[]>>(CONVERSATION);

  const ticket = tickets.find(t=>t.id===selectedId) ?? tickets[0];
  const thread = convos[selectedId] ?? [];

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg = { sender:'Helpdesk Officer (You)', message:reply, time:new Date().toISOString().slice(0,16).replace('T',' ') };
    setConvos(p=>({...p,[selectedId]:[...(p[selectedId]??[]),msg]}));
    setReply('');
    (window as any).showToast('Reply sent.');
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-220px)]">
      {/* Left panel */}
      <div className="w-64 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-y-auto flex-shrink-0">
        <div className="p-3 border-b border-neutral-200 bg-neutral-50">
          <p className="text-xs font-bold text-neutral-500 uppercase">All Tickets</p>
        </div>
        {tickets.map(t=>(
          <div key={t.id} onClick={()=>setSelectedId(t.id)}
            className={`p-3 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${selectedId===t.id?'bg-blue-50 border-l-2 border-l-health-blue':''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-neutral-400">{t.id}</span>
              <Pill label={t.priority} color={priorityColor[t.priority]}/>
            </div>
            <p className="text-xs font-bold text-neutral-800 leading-tight line-clamp-2">{t.title}</p>
            <p className="text-[10px] text-neutral-400 mt-1">{t.county} · {t.status}</p>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
        <div className="bg-health-blue text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2"><span className="text-xs text-blue-200">{ticket.id}</span><Pill label={ticket.priority} color={priorityColor[ticket.priority]}/><Pill label={ticket.status} color="bg-white/20 text-white border-white/30"/></div>
              <h3 className="font-bold text-lg mt-1">{ticket.title}</h3>
            </div>
            <button onClick={()=>(window as any).showToast(`Ticket ${ticket.id} escalated to Project Manager.`)}
              className="text-xs border border-white/30 text-white px-3 py-1.5 rounded-lg hover:bg-white/10">Escalate</button>
          </div>
          <p className="text-xs text-blue-200 mt-2">{ticket.county} · {ticket.facility} · Reporter: {ticket.reporter} · Assignee: {ticket.assignee}</p>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
          <div className="bg-white rounded-lg border border-neutral-200 p-3">
            <p className="text-xs font-bold text-neutral-400 mb-1">Original Report</p>
            <p className="text-sm text-neutral-700">{ticket.description}</p>
          </div>
          {thread.map((msg,i)=>(
            <div key={i} className={`flex ${msg.sender.includes('You')?'justify-end':''}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${msg.sender.includes('You')?'bg-health-blue text-white':'bg-white border border-neutral-200 text-neutral-800'}`}>
                <p className={`text-xs font-bold mb-1 ${msg.sender.includes('You')?'text-blue-200':'text-neutral-400'}`}>{msg.sender}</p>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-[10px] mt-1.5 ${msg.sender.includes('You')?'text-blue-200':'text-neutral-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div className="p-4 border-t border-neutral-200 bg-white flex gap-3">
          <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={2} placeholder="Type your reply…"
            className="flex-1 border border-neutral-200 rounded-lg p-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-health-blue"/>
          <button onClick={sendReply} disabled={!reply.trim()} className="bg-health-blue text-white px-4 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
            <Send className="h-4 w-4"/> Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SLA
// ─────────────────────────────────────────────────────────────────────────────
const SLATab = () => {
  const catData = [
    { name:'Sync Issue',    count:5 },{ name:'Login/Access',  count:4 },
    { name:'Data Entry',    count:3 },{ name:'System Error',  count:3 },
    { name:'Hardware',      count:2 },{ name:'Training',      count:2 },
  ];
  const priorityData = [
    { name:'Critical',count:2 },{ name:'High',count:3 },
    { name:'Medium',  count:4 },{ name:'Low', count:2 },
  ];
  const countyData = [
    { name:'Montserrado',count:4 },{ name:'Lofa',count:3 },
    { name:'Maryland',   count:2 },{ name:'Bong',count:2 },{ name:'Sinoe',count:1 },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Monthly SLA Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50"><tr>{['Month','Total Tickets','Resolved','Avg Resolution Time','SLA Met %','Critical Issues'].map(h=>(
              <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {SLA_MONTHLY.map(m=>(
                <tr key={m.month} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold text-neutral-800">{m.month}</td>
                  <td className="px-4 py-3 text-sm">{m.total}</td>
                  <td className="px-4 py-3 text-sm text-green-700 font-bold">{m.resolved}</td>
                  <td className="px-4 py-3 text-sm">{m.avgHours}h</td>
                  <td className="px-4 py-3"><span className={`text-sm font-black ${m.slaMet>=95?'text-green-700':'text-amber-600'}`}>{m.slaMet}%</span></td>
                  <td className="px-4 py-3 text-sm text-red-600 font-bold">{m.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-700 mb-4">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10}}/>
              <YAxis dataKey="name" type="category" width={88} tick={{fontSize:10}}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#004e89" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-700 mb-4">By Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${((percent ?? 0)*100).toFixed(0)}%`} labelLine={false}>
                {priorityData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-700 mb-4">Top 5 Counties by Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:9}} angle={-20} textAnchor="end" height={40}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#e67e22" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const HelpdeskDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'logging')         return <LoggingTab />;
  if (activeTab === 'troubleshooting') return <TroubleshootingTab />;
  if (activeTab === 'tickets')         return <TicketsTab />;
  if (activeTab === 'sla')             return <SLATab />;
  return <LoggingTab />;
};
