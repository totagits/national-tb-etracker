import { useState, useMemo } from 'react';
import {
  ShieldCheck, XCircle, CheckCircle2, Clock,
  Search, Download, RefreshCw, ChevronDown, ChevronRight, X,
} from 'lucide-react';
import { AUDIT_LOGS } from '../data/liberiaData';


// ─── Shared helpers ───────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);
const statusColor: Record<string, string> = {
  Pass:         'bg-green-100 text-green-700 border-green-200',
  Fail:         'bg-red-100 text-red-700 border-red-200',
  Pending:      'bg-amber-100 text-amber-700 border-amber-200',
  'Not Run':    'bg-neutral-100 text-neutral-600 border-neutral-200',
  SUCCESS:      'bg-green-100 text-green-700 border-green-200',
  BLOCKED:      'bg-red-100 text-red-700 border-red-200',
  WARNING:      'bg-amber-100 text-amber-700 border-amber-200',
  Open:         'bg-red-100 text-red-700 border-red-200',
  'In Progress':'bg-blue-100 text-blue-700 border-blue-200',
  Fixed:        'bg-green-100 text-green-700 border-green-200',
  Verified:     'bg-purple-100 text-purple-700 border-purple-200',
  Critical:     'bg-red-100 text-red-800 border-red-200',
  High:         'bg-orange-100 text-orange-700 border-orange-200',
  Medium:       'bg-amber-100 text-amber-700 border-amber-200',
  Low:          'bg-blue-100 text-blue-700 border-blue-200',
  Compliant:    'bg-green-100 text-green-700 border-green-200',
  'Non-Compliant': 'bg-red-100 text-red-700 border-red-200',
  'In Review':  'bg-blue-100 text-blue-700 border-blue-200',
};

// ─── Security Review data ────────────────────────────────────────────────────
type SecStatus = 'Pass' | 'Fail' | 'Pending';
interface SecItem { id: string; category: string; description: string; status: SecStatus; reviewer: string; date: string; }
const INITIAL_SECURITY: SecItem[] = [
  { id:'S01', category:'DHIS2 Configuration', description:'Tracker program enabled with correct program rules and validations', status:'Pass', reviewer:'David Sumo', date:'2026-05-10' },
  { id:'S02', category:'DHIS2 Configuration', description:'All tracked entity attributes marked as sensitive are access-controlled', status:'Pass', reviewer:'David Sumo', date:'2026-05-10' },
  { id:'S03', category:'DHIS2 Configuration', description:'Organisation unit hierarchy correctly restricts data visibility by level', status:'Pass', reviewer:'David Sumo', date:'2026-05-10' },
  { id:'S04', category:'DHIS2 Configuration', description:'Default admin password changed — no default credentials in use', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-11' },
  { id:'S05', category:'DHIS2 Configuration', description:'DHIS2 system version is latest stable (2.41.x)', status:'Pending', reviewer:'—', date:'—' },
  { id:'S06', category:'Data Encryption', description:'HTTPS/TLS 1.3 enforced on all Cloud Run endpoints', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-11' },
  { id:'S07', category:'Data Encryption', description:'Database-at-rest encryption enabled on Cloud SQL', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-11' },
  { id:'S08', category:'Data Encryption', description:'DHIS2 Android SDK uses encrypted local storage on tablets', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-11' },
  { id:'S09', category:'Data Encryption', description:'Sensitive patient identifiers are not transmitted in plain-text logs', status:'Pending', reviewer:'—', date:'—' },
  { id:'S10', category:'Role-Based Access', description:'Facility Data Clerk role: can only create/edit patients at own facility', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S11', category:'Role-Based Access', description:'County Officer role: can only read data within assigned county', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S12', category:'Role-Based Access', description:'National Admin role: read/write all counties + user management', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S13', category:'Role-Based Access', description:'HIV status attribute restricted to TB/HIV officer role only', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S14', category:'Role-Based Access', description:'Training Coordinator role cannot access clinical patient data', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S15', category:'Role-Based Access', description:'Audit logging configured for all role-level data access events', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-12' },
  { id:'S16', category:'Network Security', description:'Cloud Run service configured with minimum required IAM permissions', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-13' },
  { id:'S17', category:'Network Security', description:'VPC firewall rules block all non-essential inbound traffic', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-13' },
  { id:'S18', category:'Network Security', description:'Failed login attempts trigger account lockout after 5 tries', status:'Pass', reviewer:'Samuel Barwon', date:'2026-05-13' },
  { id:'S19', category:'Network Security', description:'Penetration test completed by external vendor', status:'Fail', reviewer:'Samuel Barwon', date:'2026-05-16' },
  { id:'S20', category:'Network Security', description:'DDoS protection enabled on Cloud Run load balancer', status:'Pending', reviewer:'—', date:'—' },
];

// ─── Test Plans ───────────────────────────────────────────────────────────────
type TestStatus = 'Pass' | 'Fail' | 'Not Run';
interface TestCase { id: string; name: string; module: string; type: string; expected: string; status: TestStatus; testedBy: string; date: string; }
const INITIAL_TESTS: TestCase[] = [
  { id:'TC-001', name:'New patient registration flow (all 4 wizard steps)', module:'Registration',  type:'Functional',  expected:'Patient saved with TB ID, visible in search',  status:'Pass',    testedBy:'Esther Flomo',  date:'2026-05-13' },
  { id:'TC-002', name:'AI TB screening risk classification',                module:'Registration',  type:'Functional',  expected:'Risk score (Low/High/Confirmed) displayed',    status:'Pass',    testedBy:'Esther Flomo',  date:'2026-05-13' },
  { id:'TC-003', name:'County filter updates all analytics charts',         module:'Admin Analytics',type:'Functional', expected:'Charts, KPIs, table all reflect selected county',status:'Pass',    testedBy:'David Sumo',    date:'2026-05-14' },
  { id:'TC-004', name:'Facility sync status reflects last upload time',     module:'Admin Analytics',type:'Functional', expected:'Sync badge matches DHIS2 last updated timestamp',status:'Pass',    testedBy:'David Sumo',    date:'2026-05-14' },
  { id:'TC-005', name:'Unauthorized role cannot access HIV status field',   module:'Security',      type:'Security',    expected:'Field hidden; access attempt blocked + logged',  status:'Pass',    testedBy:'Samuel Barwon', date:'2026-05-12' },
  { id:'TC-006', name:'Login lockout after 5 failed attempts',              module:'Security',      type:'Security',    expected:'Account locked; helpdesk notified',              status:'Pass',    testedBy:'Samuel Barwon', date:'2026-05-12' },
  { id:'TC-007', name:'DHIS2 Android offline sync — reconnect upload',      module:'Mobile',        type:'Functional',  expected:'Queued records upload on reconnect',            status:'Pass',    testedBy:'David Sumo',    date:'2026-05-15' },
  { id:'TC-008', name:'Treatment outcome recording (cured/failed/LTFU)',    module:'Clinical',      type:'Functional',  expected:'Outcome saved, cohort report updated',          status:'Pass',    testedBy:'Esther Flomo',  date:'2026-05-14' },
  { id:'TC-009', name:'PDF export of patient record',                       module:'Reporting',     type:'Functional',  expected:'Browser print dialog opens with formatted data', status:'Pass',    testedBy:'Ruth Toe',      date:'2026-05-15' },
  { id:'TC-010', name:'Page load time under 3 seconds on 3G connection',   module:'Performance',   type:'Performance', expected:'< 3000ms DOMContentLoaded on 3G',                status:'Fail',    testedBy:'Samuel Barwon', date:'2026-05-16' },
  { id:'TC-011', name:'Meeting camera permission and video preview',        module:'Meetings',      type:'Functional',  expected:'getUserMedia granted, video preview shown',     status:'Pass',    testedBy:'Ruth Toe',      date:'2026-05-15' },
  { id:'TC-012', name:'Duplicate patient detection during registration',    module:'Registration',  type:'Functional',  expected:'Warning shown if matching name+DOB exists',     status:'Fail',    testedBy:'Esther Flomo',  date:'2026-05-16' },
  { id:'TC-013', name:'HTTPS enforced on all endpoints (no HTTP fallback)', module:'Security',      type:'Security',    expected:'HTTP redirects to HTTPS with HSTS header',      status:'Pass',    testedBy:'Samuel Barwon', date:'2026-05-12' },
  { id:'TC-014', name:'Training material download tracking',                module:'Training',      type:'Functional',  expected:'Download count increments on each download',    status:'Not Run', testedBy:'—',            date:'—'          },
  { id:'TC-015', name:'Google Meet integration: camera + participant list', module:'Meetings',      type:'Functional',  expected:'Camera live, participants selectable',          status:'Pass',    testedBy:'Ruth Toe',      date:'2026-05-15' },
];

// ─── Bugs ────────────────────────────────────────────────────────────────────
type BugStatus = 'Open' | 'In Progress' | 'Fixed' | 'Verified';
type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
interface Bug { id: string; title: string; severity: BugSeverity; module: string; status: BugStatus; reportedBy: string; date: string; description: string; }
const INITIAL_BUGS: Bug[] = [
  { id:'BUG-001', title:'Patient search returns "undefined" for April registrations', severity:'High',     module:'Patient Search',  status:'In Progress', reportedBy:'David Sumo',   date:'2026-05-21', description:'Searching by TB ID for patients registered in April returns "undefined" instead of patient card. Root cause: data migration gap.' },
  { id:'BUG-002', title:'DHIS2 offline sync fails on Lofa county tablets',           severity:'Critical',  module:'Mobile Sync',     status:'In Progress', reportedBy:'Ruth Toe',     date:'2026-05-20', description:'48 records stuck in offline queue at Tellewoyan Hospital. Connection timeout after 30s. Affects 3 devices.' },
  { id:'BUG-003', title:'Page load > 5s on 3G mobile connection',                   severity:'High',     module:'Performance',     status:'Open',        reportedBy:'Samuel Barwon', date:'2026-05-16', description:'Full app bundle (806KB) loads slowly on 3G. Needs code splitting and lazy loading.' },
  { id:'BUG-004', title:'Duplicate patient records — no dedup warning',              severity:'High',     module:'Registration',    status:'Open',        reportedBy:'Esther Flomo', date:'2026-05-16', description:'Two patients registered with same name+DOB without any system warning. Needs duplicate detection logic.' },
  { id:'BUG-005', title:'HIV Status field visible to Facility Clerk in some cases',  severity:'Critical',  module:'Security',        status:'Fixed',       reportedBy:'Samuel Barwon', date:'2026-05-12', description:'Sharing settings misconfiguration. Fixed by correcting DHIS2 attribute-level sharing rules. Re-verified on May 14.' },
  { id:'BUG-006', title:'Meeting camera preview delayed 3–5s on slow connections',   severity:'Medium',   module:'Meetings',        status:'Fixed',       reportedBy:'James Kpan',   date:'2026-05-16', description:'getUserMedia resolves but video element takes time to attach stream. Added loading indicator as workaround.' },
  { id:'BUG-007', title:'County filter in analytics does not persist on tab switch', severity:'Low',      module:'Admin Analytics', status:'Verified',    reportedBy:'Mary Johnson', date:'2026-05-14', description:'Selecting a county and switching tabs resets filter to "All 15 Counties". Fixed with lifted state in App.tsx.' },
  { id:'BUG-008', title:'PDF export missing TB e-Tracker letterhead',               severity:'Low',      module:'Reporting',       status:'Open',        reportedBy:'Ruth Toe',     date:'2026-05-17', description:'window.print() works but the printed output has no branded header. Needs @media print CSS + logo injection.' },
  { id:'BUG-009', title:'Training material download counter not functional',         severity:'Medium',   module:'Training',        status:'Open',        reportedBy:'Ruth Toe',     date:'2026-05-19', description:'Download button does not increment the counter. State not persisted — needs localStorage or API call.' },
  { id:'BUG-010', title:'Registration wizard Step 3 label unclear for clerks',       severity:'Low',      module:'Registration',    status:'Verified',    reportedBy:'Mary Johnson', date:'2026-05-12', description:'Label "Exposure & Risk" confused field clerks. Updated to "TB Exposure History & Risk Factors". Re-tested May 15.' },
];

// ─── Compliance ───────────────────────────────────────────────────────────────
type CompStatus = 'Compliant' | 'Non-Compliant' | 'In Review';
interface CompItem { id: string; requirement: string; reference: string; status: CompStatus; evidence: string; responsible: string; }
const COMPLIANCE_ITEMS: CompItem[] = [
  { id:'C01', requirement:'Patient data collected only with informed consent',                     reference:'Liberia Data Protection Act §12',  status:'Compliant',     evidence:'Consent form in registration wizard Step 1',  responsible:'Project Director' },
  { id:'C02', requirement:'Personal health data encrypted in transit and at rest',                 reference:'GDPR Art. 32 / LDA §18',           status:'Compliant',     evidence:'TLS 1.3 + Cloud SQL encryption verified',     responsible:'Samuel Barwon' },
  { id:'C03', requirement:'Data subjects can request access to their health records',              reference:'GDPR Art. 15 / LDA §20',           status:'In Review',     evidence:'Patient record export feature under development',responsible:'David Sumo' },
  { id:'C04', requirement:'Data breach notification within 72 hours',                             reference:'GDPR Art. 33 / LDA §24',           status:'Compliant',     evidence:'Incident response procedure documented',       responsible:'Samuel Barwon' },
  { id:'C05', requirement:'Data minimisation — only required fields collected',                    reference:'GDPR Art. 5(1)(c)',                status:'Compliant',     evidence:'Metadata review completed May 10',            responsible:'David Sumo' },
  { id:'C06', requirement:'Third-party data processors (Google Cloud) under DPA',                 reference:'GDPR Art. 28',                    status:'Compliant',     evidence:'Google Cloud DPA signed and on file',         responsible:'Project Director' },
  { id:'C07', requirement:'Data retention policy: patient records retained ≥ 7 years',            reference:'MoH Records Policy 2022',          status:'Compliant',     evidence:'DHIS2 deletion disabled; backup policy active',responsible:'David Sumo' },
  { id:'C08', requirement:'Staff trained on data protection responsibilities',                     reference:'GDPR Art. 39 / LDA §15',           status:'In Review',     evidence:'Training scheduled for all facility clerks',   responsible:'Ruth Toe' },
  { id:'C09', requirement:'Privacy Impact Assessment (PIA) completed',                            reference:'GDPR Art. 35',                    status:'Compliant',     evidence:'PIA completed and signed off April 8, 2026',  responsible:'Project Director' },
  { id:'C10', requirement:'National Data Authority notified of system deployment',                 reference:'Liberia Data Protection Act §8',  status:'Non-Compliant', evidence:'Notification pending MoH legal review',        responsible:'Project Director' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Security Review
// ─────────────────────────────────────────────────────────────────────────────
const ReviewTab = () => {
  const [items, setItems] = useState<SecItem[]>(INITIAL_SECURITY);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const categories = Array.from(new Set(items.map(i => i.category)));
  const passCount = items.filter(i => i.status === 'Pass').length;
  const pct = Math.round((passCount / items.length) * 100);

  const toggle = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next: SecStatus = item.status === 'Pass' ? 'Fail' : item.status === 'Fail' ? 'Pending' : 'Pass';
      return { ...item, status: next, reviewer: next !== 'Pending' ? 'Samuel Barwon' : '—', date: next !== 'Pending' ? new Date().toISOString().slice(0,10) : '—' };
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-6 items-center bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className={`text-5xl font-black ${pct>=90?'text-green-600':pct>=70?'text-amber-600':'text-red-600'}`}>{pct}%</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-neutral-800">Security Review Checklist</h2>
          <p className="text-sm text-neutral-500">{passCount} of {items.length} checks passing · Click any item to update status</p>
          <div className="mt-2 bg-neutral-100 rounded-full h-3 overflow-hidden max-w-sm">
            <div className={`h-3 rounded-full transition-all ${pct>=90?'bg-green-500':pct>=70?'bg-amber-500':'bg-red-500'}`} style={{ width:`${pct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label:'Pass',    count: items.filter(i=>i.status==='Pass').length,    color:'text-green-700', bg:'bg-green-50' },
            { label:'Fail',    count: items.filter(i=>i.status==='Fail').length,    color:'text-red-700',   bg:'bg-red-50'   },
            { label:'Pending', count: items.filter(i=>i.status==='Pending').length, color:'text-amber-700', bg:'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-neutral-500 font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {categories.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const catPass = catItems.filter(i => i.status === 'Pass').length;
        const isOpen = expandedCat === cat || expandedCat === null;
        return (
          <div key={cat} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100"
              onClick={() => setExpandedCat(isOpen && expandedCat === cat ? null : cat)}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-health-blue" />
                <span className="font-bold text-neutral-800">{cat}</span>
                <span className="text-xs text-neutral-400">{catPass}/{catItems.length} passing</span>
              </div>
              {isOpen && expandedCat === cat ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
            </div>
            <div className="divide-y divide-neutral-100">
              {catItems.map(item => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-50" onClick={() => toggle(item.id)}>
                  <div className="flex-shrink-0">
                    {item.status === 'Pass'    ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                     item.status === 'Fail'    ? <XCircle className="h-5 w-5 text-red-500" /> :
                     <Clock className="h-5 w-5 text-amber-400" />}
                  </div>
                  <p className="flex-1 text-sm text-neutral-700">{item.description}</p>
                  <Pill label={item.status} color={statusColor[item.status]} />
                  <div className="hidden md:block text-right text-xs text-neutral-400 flex-shrink-0">
                    <div>{item.reviewer}</div>
                    <div>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Test Plans
// ─────────────────────────────────────────────────────────────────────────────
const TestPlansTab = () => {
  const [tests, setTests] = useState<TestCase[]>(INITIAL_TESTS);
  const [modFilter, setModFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const modules = ['All', ...Array.from(new Set(tests.map(t => t.module)))];
  const filtered = tests
    .filter(t => modFilter === 'All' || t.module === modFilter)
    .filter(t => statusFilter === 'All' || t.status === statusFilter);

  const passCount = tests.filter(t => t.status === 'Pass').length;
  const failCount = tests.filter(t => t.status === 'Fail').length;

  const cycleStatus = (id: string) => {
    setTests(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: TestStatus = t.status === 'Not Run' ? 'Pass' : t.status === 'Pass' ? 'Fail' : 'Not Run';
      return { ...t, status: next, testedBy: next !== 'Not Run' ? 'Samuel Barwon' : '—', date: next !== 'Not Run' ? new Date().toISOString().slice(0,10) : '—' };
    }));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap gap-6 items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">UAT Test Plans</h2>
          <p className="text-sm text-neutral-500">{passCount} passing · {failCount} failing · {tests.filter(t=>t.status==='Not Run').length} not run</p>
        </div>
        <div className="flex gap-3">
          {[
            { label:'Pass Rate', val:`${Math.round(passCount/tests.length*100)}%`, color:'text-green-700', bg:'bg-green-50' },
            { label:'Failures',  val:failCount.toString(),                          color:'text-red-700',   bg:'bg-red-50'   },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-xl px-4 py-2 text-center border border-white`}>
              <p className={`text-2xl font-black ${k.color}`}>{k.val}</p>
              <p className="text-xs font-bold text-neutral-500">{k.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <select value={modFilter} onChange={e => setModFilter(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none">
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none">
            {['All','Pass','Fail','Not Run'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['ID','Test Case','Module','Type','Expected Result','Status','Tested By','Date'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => cycleStatus(t.id)}>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-400">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800 max-w-xs">{t.name}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">{t.module}</span></td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.type}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600 max-w-xs">{t.expected}</td>
                  <td className="px-4 py-3"><Pill label={t.status} color={statusColor[t.status]} /></td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.testedBy}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Bug Tracking / UAT
// ─────────────────────────────────────────────────────────────────────────────
const UATTab = () => {
  const [bugs, setBugs] = useState<Bug[]>(INITIAL_BUGS);
  const [selected, setSelected] = useState<Bug | null>(null);

  const columns: BugStatus[] = ['Open','In Progress','Fixed','Verified'];
  const advance = (id: string, cur: BugStatus) => {
    const next: Record<BugStatus, BugStatus> = { Open:'In Progress', 'In Progress':'Fixed', Fixed:'Verified', Verified:'Open' };
    setBugs(prev => prev.map(b => b.id === id ? { ...b, status: next[cur] } : b));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: next[cur] } : null);
    (window as any).showToast(`Bug ${id} → ${next[cur]}`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Bugs',       val:bugs.length,                                                     color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Open / Critical',  val:`${bugs.filter(b=>b.status==='Open').length} / ${bugs.filter(b=>b.severity==='Critical'&&b.status!=='Verified').length}`, color:'text-red-700', bg:'bg-red-50' },
          { label:'Fixed This Sprint',val:bugs.filter(b=>['Fixed','Verified'].includes(b.status)).length,  color:'text-green-700',   bg:'bg-green-50' },
          { label:'UAT Sign-off',     val:bugs.filter(b=>['Open','In Progress'].includes(b.status)).length === 0 ? '✓ Ready':'Pending', color:bugs.filter(b=>['Open','In Progress'].includes(b.status)).length===0?'text-green-700':'text-amber-700', bg:bugs.filter(b=>['Open','In Progress'].includes(b.status)).length===0?'bg-green-50':'bg-amber-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col} className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-200 bg-white flex justify-between items-center">
              <span className="font-bold text-sm text-neutral-700">{col}</span>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">{bugs.filter(b=>b.status===col).length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {bugs.filter(b => b.status === col).map(b => (
                <div key={b.id} className="bg-white rounded-lg border border-neutral-200 p-3 cursor-pointer hover:border-health-blue transition-colors shadow-sm"
                  onClick={() => setSelected(b)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Pill label={b.severity} color={statusColor[b.severity]} />
                    <span className="text-xs text-neutral-400">{b.id}</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-800 leading-tight">{b.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{b.module} · {b.date}</p>
                  <button onClick={e=>{e.stopPropagation();advance(b.id,b.status)}} className="mt-2 w-full text-xs border border-neutral-200 text-neutral-600 py-1 rounded hover:bg-neutral-50 flex items-center justify-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Advance
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white w-[560px] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-200">{selected.id} · {selected.module}</p>
                <h3 className="font-bold text-lg mt-0.5">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Pill label={selected.severity} color={statusColor[selected.severity]} />
                <Pill label={selected.status} color={statusColor[selected.status]} />
                <span className="text-xs text-neutral-500">Reported by {selected.reportedBy} · {selected.date}</span>
              </div>
              <div><p className="text-xs font-bold text-neutral-500 mb-1">Description</p>
                <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 border">{selected.description}</p>
              </div>
              <div className="flex gap-2">
                {columns.map(s => (
                  <button key={s} onClick={() => { advance(selected.id, selected.status); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selected.status===s?'bg-health-blue text-white border-health-blue':'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Audit Log
// ─────────────────────────────────────────────────────────────────────────────
const AuditTab = () => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return AUDIT_LOGS;
    const q = query.toLowerCase();
    return AUDIT_LOGS.filter(l =>
      l.user.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      l.county.toLowerCase().includes(q)
    );
  }, [query]);

  const blocked  = AUDIT_LOGS.filter(l => l.status === 'BLOCKED').length;
  const warnings = AUDIT_LOGS.filter(l => l.status === 'WARNING').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Events',     val:AUDIT_LOGS.length, color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Blocked Attempts', val:blocked,           color:'text-red-700',     bg:'bg-red-50'  },
          { label:'Warnings',         val:warnings,          color:'text-amber-700',   bg:'bg-amber-50'},
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs…"
              className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-full" />
          </div>
          <button onClick={() => (window as any).showToast('Audit log exported to CSV.')}
            className="border border-neutral-200 text-sm text-neutral-600 px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-neutral-50">
            <Download className="h-4 w-4" /> Export
          </button>
          <span className="text-xs text-neutral-400 ml-auto">{filtered.length} of {AUDIT_LOGS.length} events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-white">
              <tr>{['Timestamp','User','Role','County','Action','Resource','Status','IP Address'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((l, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-neutral-500 font-mono whitespace-nowrap">{l.timestamp}</td>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-700">{l.user}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{l.role}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{l.county}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-600">{l.action}</span></td>
                  <td className="px-4 py-3 text-xs text-neutral-600 max-w-xs truncate">{l.resource}</td>
                  <td className="px-4 py-3"><Pill label={l.status} color={statusColor[l.status]} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-neutral-400">{l.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Compliance
// ─────────────────────────────────────────────────────────────────────────────
const ComplianceTab = () => {
  const [items, setItems] = useState<CompItem[]>(COMPLIANCE_ITEMS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const compliantCount = items.filter(c => c.status === 'Compliant').length;
  const score = Math.round((compliantCount / items.length) * 100);

  const cycleStatus = (id: string) => {
    setItems(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next: CompStatus = c.status === 'Compliant' ? 'Non-Compliant' : c.status === 'Non-Compliant' ? 'In Review' : 'Compliant';
      return { ...c, status: next };
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-6 items-center bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className={`text-5xl font-black ${score>=90?'text-green-600':score>=70?'text-amber-600':'text-red-600'}`}>{score}%</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-neutral-800">Data Protection Compliance</h2>
          <p className="text-sm text-neutral-500">GDPR alignment + Liberia Data Protection Act · {compliantCount}/{items.length} requirements met</p>
          <div className="mt-2 bg-neutral-100 rounded-full h-3 overflow-hidden max-w-sm">
            <div className={`h-3 rounded-full transition-all ${score>=90?'bg-green-500':score>=70?'bg-amber-500':'bg-red-500'}`} style={{ width:`${score}%` }} />
          </div>
        </div>
        <button onClick={() => (window as any).showToast('Generating compliance report PDF…')}
          className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
          <Download className="h-4 w-4" /> Generate Report
        </button>
      </div>

      <div className="space-y-2">
        {items.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="flex-shrink-0">
                {c.status==='Compliant'?<CheckCircle2 className="h-5 w-5 text-green-500"/>:
                 c.status==='Non-Compliant'?<XCircle className="h-5 w-5 text-red-500"/>:
                 <Clock className="h-5 w-5 text-blue-400"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-800">{c.requirement}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{c.reference}</p>
              </div>
              <Pill label={c.status} color={statusColor[c.status]} />
              {expanded===c.id?<ChevronDown className="h-4 w-4 text-neutral-400"/>:<ChevronRight className="h-4 w-4 text-neutral-400"/>}
            </div>
            {expanded === c.id && (
              <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><p className="text-xs font-bold text-neutral-400 mb-1">Evidence</p><p className="text-neutral-700">{c.evidence}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 mb-1">Responsible</p><p className="text-neutral-700">{c.responsible}</p></div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Update Status</p>
                  <div className="flex gap-2">
                    {(['Compliant','Non-Compliant','In Review'] as CompStatus[]).map(s => (
                      <button key={s} onClick={()=>cycleStatus(c.id)}
                        className={`flex-1 py-1 rounded text-xs font-bold border transition-colors ${c.status===s?'bg-health-blue text-white border-health-blue':'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const SecurityDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'review')     return <ReviewTab />;
  if (activeTab === 'test_plans') return <TestPlansTab />;
  if (activeTab === 'uat')        return <UATTab />;
  if (activeTab === 'audit')      return <AuditTab />;
  if (activeTab === 'compliance') return <ComplianceTab />;
  return <ReviewTab />;
};
