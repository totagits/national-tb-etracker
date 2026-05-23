import { useState } from 'react';
import { generateTrainingDocPDF } from '../utils/pdfGenerator';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import {
  Download, Upload, Play, CheckCircle2, AlertTriangle,
  Plus, Search, X, ChevronDown,
} from 'lucide-react';
import { TRAINING_SESSIONS, ALL_COUNTIES } from '../data/liberiaData';


// ─── Shared helpers ───────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  Completed:  'bg-green-100 text-green-700 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Upcoming:   'bg-amber-100 text-amber-700 border-amber-200',
  Scheduled:  'bg-purple-100 text-purple-700 border-purple-200',
  Planned:    'bg-neutral-100 text-neutral-600 border-neutral-200',
};
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);

// ─── Training Materials ───────────────────────────────────────────────────────
const MATERIALS = [
  { id:'MAT-001', title:'TB Tracker System User Manual v2.1',               category:'SOP',       language:'English', size:'4.2 MB', updated:'2026-04-28', downloads:87,  icon:'📄' },
  { id:'MAT-002', title:'DHIS2 Android App — Field Guide for Data Clerks',  category:'SOP',       language:'English', size:'2.8 MB', updated:'2026-04-20', downloads:112, icon:'📱' },
  { id:'MAT-003', title:'TB Screening & Registration Quick Reference Card',  category:'Reference', language:'English', size:'0.9 MB', updated:'2026-05-01', downloads:145, icon:'📋' },
  { id:'MAT-004', title:'Treatment Outcome Recording — SOP',                category:'SOP',       language:'English', size:'1.5 MB', updated:'2026-04-15', downloads:68,  icon:'📄' },
  { id:'MAT-005', title:'DHIS2 TB Tracker — Introduction Training Video',   category:'Video',     language:'English', size:'128 MB', updated:'2026-04-10', downloads:54,  icon:'🎥', youtubeId:'sNNtJsTZrX0' },
  { id:'MAT-006', title:'How to Register a TB Patient (Step-by-Step Video)', category:'Video',    language:'English', size:'85 MB',  updated:'2026-04-18', downloads:73,  icon:'🎥', youtubeId:'Or9EncdUbx8' },
  { id:'MAT-007', title:'Offline Sync & Data Upload Tutorial Video',        category:'Video',     language:'English', size:'62 MB',  updated:'2026-05-02', downloads:49,  icon:'🎥', youtubeId:'t81WBJNE7qA' },
  { id:'MAT-008', title:'Data Quality Checklist for Facility Clerks',       category:'Reference', language:'English', size:'0.5 MB', updated:'2026-05-05', downloads:92,  icon:'✅' },
  { id:'MAT-009', title:'HIV/TB Co-infection Data Entry Reference Card',    category:'Reference', language:'English', size:'0.7 MB', updated:'2026-05-08', downloads:61,  icon:'📋' },
  { id:'MAT-010', title:'DHIS2 TB Tracker eLearning Module 1: Basics',      category:'eLearning', language:'English', size:'12 MB',  updated:'2026-04-05', downloads:38,  icon:'🎓' },
  { id:'MAT-011', title:'DHIS2 TB Tracker eLearning Module 2: Advanced',    category:'eLearning', language:'English', size:'15 MB',  updated:'2026-04-12', downloads:22,  icon:'🎓' },
  { id:'MAT-012', title:'Facility SOP: Troubleshooting Common Issues',      category:'SOP',       language:'English', size:'1.1 MB', updated:'2026-05-10', downloads:77,  icon:'🔧' },
];

// ─── County Rollout ───────────────────────────────────────────────────────────
const ROLLOUT_DATA = [
  { county:'Montserrado', facilities:8, status:'Completed',   trained:94, target:'2026-04-30', note:'All 8 facilities fully trained & operational' },
  { county:'Nimba',       facilities:4, status:'Completed',   trained:88, target:'2026-04-30', note:'Ganta & Jackson F. Doe fully certified' },
  { county:'Bong',        facilities:3, status:'Completed',   trained:86, target:'2026-04-30', note:'Phebe Hospital refresher training May 20' },
  { county:'Margibi',     facilities:2, status:'In Progress', trained:72, target:'2026-05-31', note:'C.H. Rennie training session scheduled May 20' },
  { county:'Lofa',        facilities:3, status:'In Progress', trained:68, target:'2026-05-31', note:'Tellewoyan completed; Foya & Zorzor upcoming' },
  { county:'Grand Bassa', facilities:2, status:'In Progress', trained:65, target:'2026-05-31', note:'Buchanan training completed; second session planned' },
  { county:'Maryland',    facilities:2, status:'Upcoming',    trained:42, target:'2026-06-15', note:'Training scheduled: May 28' },
  { county:'Grand Gedeh', facilities:2, status:'Upcoming',    trained:38, target:'2026-06-15', note:'Training scheduled: June 3' },
  { county:'Sinoe',       facilities:2, status:'Scheduled',   trained:25, target:'2026-06-30', note:'Training scheduled: June 10' },
  { county:'Grand Cape Mount', facilities:1, status:'Scheduled', trained:20, target:'2026-06-30', note:'Trainer assigned; logistics confirmed' },
  { county:'Bomi',        facilities:1, status:'Scheduled',   trained:15, target:'2026-07-15', note:'Scheduled pending Tubmanburg facility confirmation' },
  { county:'Gbarpolu',    facilities:1, status:'Planned',     trained:10, target:'2026-07-31', note:'Remote training via video call being explored' },
  { county:'River Gee',   facilities:1, status:'Planned',     trained:8,  target:'2026-07-31', note:'Road access challenge — logistics under review' },
  { county:'Grand Kru',   facilities:2, status:'Planned',     trained:5,  target:'2026-08-15', note:'Awaiting trainer availability confirmation' },
  { county:'Rivercess',   facilities:1, status:'Planned',     trained:0,  target:'2026-08-31', note:'Not yet scheduled — lowest priority county' },
];

// ─── Post-training support ────────────────────────────────────────────────────
const POST_TRAINING_SUPPORT = [
  { id:'PT-001', facility:'Tellewoyan Hospital',    county:'Lofa',         staff:'Ruth Toe',         issue:'Cannot find "TB ID" field after system update',             date:'2026-05-19', type:'Phone',  resolved:'Yes'     },
  { id:'PT-002', facility:'Jackson F. Doe Hospital', county:'Nimba',       staff:'Esther Flomo',     issue:'App crashing when opening enrollment form on old Android',   date:'2026-05-18', type:'Remote', resolved:'Yes'     },
  { id:'PT-003', facility:'Phebe Hospital',          county:'Bong',        staff:'David Sumo',       issue:'HIV Status field not visible after training',                date:'2026-05-17', type:'Phone',  resolved:'Yes'     },
  { id:'PT-004', facility:'Liberian Gov. Hospital',  county:'Grand Bassa', staff:'John Fallah',      issue:'Forgot how to record treatment outcome — needs refresher',   date:'2026-05-16', type:'Visit',  resolved:'Yes'     },
  { id:'PT-005', facility:'C.H. Rennie Hospital',    county:'Margibi',     staff:'Peter Wleh',       issue:'Tablet showing "Server not found" error',                   date:'2026-05-15', type:'Phone',  resolved:'Yes'     },
  { id:'PT-006', facility:'JJ Dossen Hospital',      county:'Maryland',    staff:'Moses Henries',    issue:'Duplicate registration question from clerk',                date:'2026-05-14', type:'Remote', resolved:'Yes'     },
  { id:'PT-007', facility:'Redemption Hospital',     county:'Montserrado', staff:'Samson Kpoto',     issue:'Report export PDF showing blank pages',                     date:'2026-05-20', type:'Phone',  resolved:'No'      },
  { id:'PT-008', facility:'Martha Tubman Hospital',  county:'Grand Gedeh', staff:'Sarah Suah',       issue:'New nurse joining — needs introductory system walkthrough',  date:'2026-05-21', type:'Remote', resolved:'Pending' },
];

const PT_MONTHLY = [
  { month:'Jan', calls:5, visits:1, remote:3 },
  { month:'Feb', calls:8, visits:2, remote:4 },
  { month:'Mar', calls:4, visits:1, remote:2 },
  { month:'Apr', calls:12, visits:3, remote:6 },
  { month:'May', calls:9, visits:2, remote:5 },
];

// ─── Mock attendees ───────────────────────────────────────────────────────────
const ATTENDEES: Record<string, { name: string; role: string; facility: string; passed: boolean }[]> = {
  'TS-001': [
    { name:'Samson Kpoto',    role:'Data Clerk',         facility:'JFK Medical Center',   passed:true  },
    { name:'Mary Johnson',    role:'Data Clerk',         facility:'Redemption Hospital',  passed:true  },
    { name:'Grace Williams',  role:'Nurse',              facility:'JFK Medical Center',   passed:true  },
    { name:'Thomas Quaye',    role:'Data Clerk',         facility:'ELWA Hospital',        passed:false },
    { name:'Alice Nah',       role:'TB Officer',         facility:'JFK Medical Center',   passed:true  },
  ],
  'TS-002': [
    { name:'Esther Flomo',    role:'Data Clerk',         facility:'Jackson F. Doe',       passed:true  },
    { name:'James Nagbe',     role:'Data Clerk',         facility:'Ganta UMH',            passed:true  },
    { name:'Margaret Teh',    role:'Nurse',              facility:'Saclepea Hospital',    passed:false },
    { name:'Emmanuel Gaye',   role:'Data Clerk',         facility:'Sanniquellie Gov.',    passed:true  },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Materials
// ─────────────────────────────────────────────────────────────────────────────
const MaterialsTab = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [downloads, setDownloads] = useState<Record<string,number>>({});
  const [form, setForm] = useState({ title:'', category:'SOP', language:'English', description:'' });
  const [previewVideo, setPreviewVideo] = useState<typeof MATERIALS[0] | null>(null);
  const [playing, setPlaying] = useState(false);

  const VIDEO_THUMBS: Record<string, string> = {
    'MAT-005': '/assets/vid_intro.png',
    'MAT-006': '/assets/vid_registration.png',
    'MAT-007': '/assets/vid_sync.png',
  };
  const VIDEO_DURATIONS: Record<string, string> = {
    'MAT-005': '18:34',
    'MAT-006': '12:47',
    'MAT-007': '09:15',
  };
  const VIDEO_YOUTUBE_IDS: Record<string, string> = {
    'MAT-005': 'sNNtJsTZrX0',
    'MAT-006': 'Or9EncdUbx8',
    'MAT-007': 't81WBJNE7qA',
  };

  const cats = ['All','SOP','Video','Reference','eLearning'];
  const filtered = MATERIALS
    .filter(m => catFilter === 'All' || m.category === catFilter)
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = (id: string, title: string, category: string) => {
    setDownloads(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
    if (category === 'Video') {
      const videoLinks: Record<string, string> = {
        'MAT-005': 'https://www.youtube.com/watch?v=sNNtJsTZrX0',
        'MAT-006': 'https://www.youtube.com/watch?v=Or9EncdUbx8',
        'MAT-007': 'https://www.youtube.com/watch?v=t81WBJNE7qA',
      };
      const url = videoLinks[id];
      if (url) window.open(url, '_blank');
      return;
    }
    if (category === 'eLearning') {
      const w = window.open('', '_blank', 'width=920,height=720');
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#f4f6f9}header{background:#1e3a5f;color:white;padding:20px 40px}header h1{margin:0;font-size:20px}header p{margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px}.nav{background:#2c5282;padding:10px 40px;display:flex;gap:6px}.nb{background:rgba(255,255,255,0.1);color:white;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px}.nb.active{background:white;color:#1e3a5f;font-weight:bold}.main{max-width:860px;margin:32px auto;padding:0 24px}.card{background:white;border-radius:12px;padding:28px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}.bar{background:linear-gradient(90deg,#1e3a5f,#3b82f6);height:8px;border-radius:8px;width:0;transition:width 0.8s}.btn{background:#1e3a5f;color:white;padding:12px 24px;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:14px}.topic{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px;cursor:pointer;transition:all 0.2s}.topic:hover{background:#f0f4ff;border-color:#1e3a5f}.tnum{width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;color:#1e3a5f;flex-shrink:0}</style></head><body><header><h1>${title}</h1><p>Ministry of Health, Liberia - TB e-Tracker eLearning Programme</p></header><div class="nav"><button class="nb active">Overview</button><button class="nb">Content</button><button class="nb">Assessment</button></div><div class="main"><div class="card"><h2 style="color:#1e3a5f;margin-top:0">Welcome</h2><p>Complete all modules to receive your certificate of completion.</p><div style="background:#e5e7eb;height:8px;border-radius:8px;margin:14px 0"><div class="bar" id="pb"></div></div><p style="font-size:12px;color:#888" id="pct">0% complete</p><h3>Learning Objectives</h3><ul style="line-height:2.2"><li>Understand the TB treatment cascade and DHIS2 workflow</li><li>Register TB patients accurately</li><li>Record follow-up visits and milestones</li><li>Report treatment outcomes per WHO definitions</li><li>Use defaulter tracing tools</li></ul><button class="btn" onclick="document.getElementById('pb').style.width='20%';document.getElementById('pct').textContent='20% complete'">Start Module 1</button></div><div class="card"><h3 style="color:#1e3a5f;margin-top:0">Module Contents</h3>${['Introduction to TB e-Tracker (5 min)','Patient Registration Workflow (10 min)','Follow-up Data Entry (8 min)','Treatment Outcomes & WHO Definitions (6 min)','Defaulter Tracing (5 min)'].map((t,i)=>`<div class="topic" onclick="var p=Math.min(100,(${i+1})*20);document.getElementById('pb').style.width=p+'%';document.getElementById('pct').textContent=p+'% complete'"><div class="tnum">${i+1}</div><span style="font-size:14px">${t}</span></div>`).join('')}</div></div></body></html>`);
      w.document.close();
      return;
    }
    // SOP and Reference — generate professional PDF
    generateTrainingDocPDF(id, title, category);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Training Materials Library</h2>
          <p className="text-sm text-neutral-500">{MATERIALS.length} materials · SOPs, videos, reference cards, eLearning</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search materials…" className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-44"/>
          </div>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${catFilter===c?'bg-health-blue text-white':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{c}</button>
          ))}
          <button onClick={()=>setShowUpload(true)} className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Upload className="h-4 w-4"/> Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-health-blue/30 transition-all overflow-hidden">
            {m.category === 'Video' ? (
              <div className="relative group cursor-pointer" onClick={() => setPreviewVideo(m)}>
                <img src={VIDEO_THUMBS[m.id] || '/assets/vid_intro.png'} alt={m.title}
                  className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="h-14 w-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-health-blue ml-1" />
                  </div>
                </div>
                {VIDEO_DURATIONS[m.id] && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {VIDEO_DURATIONS[m.id]}
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-neutral-50 p-6 flex items-center justify-center text-5xl border-b border-neutral-100">
                {m.icon}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  m.category==='SOP'?'bg-blue-50 text-blue-700 border-blue-100':
                  m.category==='Video'?'bg-red-50 text-red-700 border-red-100':
                  m.category==='Reference'?'bg-green-50 text-green-700 border-green-100':
                  'bg-purple-50 text-purple-700 border-purple-100'}`}>{m.category}</span>
                <span className="text-xs text-neutral-400">{m.size}</span>
              </div>
              <p className="font-bold text-neutral-800 text-sm leading-tight mb-2">{m.title}</p>
              <p className="text-xs text-neutral-400">Updated: {m.updated} · {m.downloads + (downloads[m.id]||0)} downloads</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleDownload(m.id, m.title, m.category)}
                  className="flex-1 bg-health-blue text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-800 transition-colors">
                  <Download className="h-3.5 w-3.5"/> Download
                </button>
                {m.category === 'Video' && (
                  <button onClick={() => { setPreviewVideo(m); setPlaying(false); }}
                    className="border border-neutral-200 text-neutral-600 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-50">
                    <Play className="h-3.5 w-3.5"/> Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase flex items-center gap-1.5"><Play className="h-3.5 w-3.5"/> Video Preview</p>
                <h3 className="font-bold text-base mt-0.5">{previewVideo.title}</h3>
              </div>
              <button onClick={() => { setPreviewVideo(null); setPlaying(false); }} className="hover:bg-neutral-700 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            {/* Real YouTube player */}
            <div className="relative bg-neutral-950 aspect-video flex items-center justify-center">
              {playing && VIDEO_YOUTUBE_IDS[previewVideo.id] ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${VIDEO_YOUTUBE_IDS[previewVideo.id]}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={VIDEO_THUMBS[previewVideo.id] || '/assets/vid_intro.png'}
                    alt={previewVideo.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <button
                      onClick={() => setPlaying(true)}
                      className="h-20 w-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-red-700 transition-all border-4 border-white/30"
                    >
                      <Play className="h-9 w-9 text-white ml-1"/>
                    </button>
                    <p className="text-white text-sm mt-4 font-semibold drop-shadow">Click to play</p>
                  </div>
                  {VIDEO_DURATIONS[previewVideo.id] && (
                    <span className="absolute bottom-4 right-4 bg-black/80 text-white text-sm font-bold px-2 py-1 rounded">
                      Duration: {VIDEO_DURATIONS[previewVideo.id]}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="p-5 bg-neutral-50 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400">Language: <strong>English</strong> · Size: <strong>{previewVideo.size}</strong> · Updated: <strong>{previewVideo.updated}</strong> · Downloads: <strong>{previewVideo.downloads}</strong></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewVideo(null)} className="border border-neutral-200 text-neutral-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100">Close</button>
                  <button onClick={() => { handleDownload(previewVideo.id, previewVideo.title, previewVideo.category); setPreviewVideo(null); }}
                    className="bg-health-blue text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800">
                    <Download className="h-4 w-4"/> Download Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[520px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Upload className="h-5 w-5"/>Upload New Material</h3>
              <button onClick={()=>setShowUpload(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Document / material title" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['SOP','Video','Reference','eLearning'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Language</label>
                  <select value={form.language} onChange={e=>setForm(p=>({...p,language:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['English','Liberian English','Kpelle','Bassa'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 block mb-1">File Upload</label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50 hover:border-health-blue cursor-pointer">
                  <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2"/>
                  <p className="text-sm text-neutral-500">Click to browse or drag & drop</p>
                  <p className="text-xs text-neutral-400 mt-1">PDF, DOCX, MP4, PPTX up to 500MB</p>
                </div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Brief description of the material and who it is for" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowUpload(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={()=>{setShowUpload(false);(window as any).showToast('Material uploaded successfully to the library.');}} disabled={!form.title}
                className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Rollout
// ─────────────────────────────────────────────────────────────────────────────
const RolloutTab = () => {
  const completedCount = ROLLOUT_DATA.filter(r=>r.status==='Completed').length;
  const avgTrained = Math.round(ROLLOUT_DATA.reduce((s,r)=>s+r.trained,0)/ROLLOUT_DATA.length);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'National Rollout',    val:`${avgTrained}%`,        color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Fully Completed',     val:`${completedCount}/15`,  color:'text-green-700',   bg:'bg-green-50'},
          { label:'Total Facilities',    val:'31',                     color:'text-neutral-700', bg:'bg-neutral-50'},
          { label:'Total Staff Trained', val:'198',                    color:'text-amber-700',   bg:'bg-amber-50'},
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50"><h3 className="font-bold text-neutral-800">All 15 Counties — Rollout Progress</h3></div>
          <div className="divide-y divide-neutral-100">
            {ROLLOUT_DATA.map(r=>(
              <div key={r.county} className="px-5 py-3 flex items-center gap-4 hover:bg-neutral-50">
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-bold text-neutral-700">{r.county}</p>
                  <p className="text-xs text-neutral-400">{r.facilities} {r.facilities===1?'facility':'facilities'}</p>
                </div>
                <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all ${
                    r.status==='Completed'?'bg-green-500':
                    r.status==='In Progress'?'bg-health-blue':
                    r.status==='Upcoming'?'bg-amber-400':
                    r.status==='Scheduled'?'bg-purple-400':'bg-neutral-300'}`}
                    style={{ width:`${r.trained}%` }}/>
                </div>
                <span className="text-sm font-black w-10 text-right text-neutral-700">{r.trained}%</span>
                <Pill label={r.status} color={statusColor[r.status]}/>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-800 mb-4">Training Completion % by County</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ROLLOUT_DATA.map(r=>({ name:r.county.slice(0,8), trained:r.trained }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10}} unit="%"/>
              <YAxis dataKey="name" type="category" width={72} tick={{fontSize:10}}/>
              <Tooltip formatter={(v:any)=>`${v}%`}/>
              <Bar dataKey="trained" name="% Trained" fill="#004e89" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Attendance
// ─────────────────────────────────────────────────────────────────────────────
const AttendanceTab = () => {
  const [countyF, setCountyF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [expandedSession, setExpandedSession] = useState<string|null>(null);

  const total = TRAINING_SESSIONS.reduce((s,t)=>s+(t.attended>0?t.attended:0),0);
  const completedSessions = TRAINING_SESSIONS.filter(t=>t.status==='Completed');
  const avgAttendance = completedSessions.length ? Math.round(completedSessions.reduce((s,t)=>s+(t.attended/t.enrolled*100),0)/completedSessions.length) : 0;
  const avgPass = completedSessions.length ? (completedSessions.reduce((s,t)=>s+t.passRate,0)/completedSessions.length).toFixed(1) : '0';

  const filtered = TRAINING_SESSIONS
    .filter(t => countyF === 'All' || t.county === countyF)
    .filter(t => statusF === 'All' || t.status === statusF);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Sessions',   val:TRAINING_SESSIONS.length.toString(), color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Total Trained',    val:total.toString(),                     color:'text-green-700',   bg:'bg-green-50'},
          { label:'Avg Attendance',   val:`${avgAttendance}%`,                 color:'text-amber-700',   bg:'bg-amber-50'},
          { label:'Avg Pass Rate',    val:`${avgPass}%`,                       color:'text-purple-700',  bg:'bg-purple-50'},
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-wrap gap-3 items-center justify-between">
          <h3 className="font-bold text-neutral-800">Training Sessions</h3>
          <div className="flex gap-2">
            <select value={countyF} onChange={e=>setCountyF(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none">
              <option>All</option>{ALL_COUNTIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none">
              {['All','Completed','Upcoming','Scheduled','Planned'].map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>(window as any).showToast('Attendance report exported to CSV.')}
              className="border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-neutral-50">
              <Download className="h-4 w-4"/> Export
            </button>
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {filtered.map(t=>(
            <div key={t.id}>
              <div className="px-5 py-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-50"
                onClick={()=>setExpandedSession(expandedSession===t.id?null:t.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-bold text-neutral-400">{t.id}</span><Pill label={t.status} color={statusColor[t.status]}/></div>
                  <p className="font-bold text-neutral-800 text-sm mt-0.5">{t.title}</p>
                  <p className="text-xs text-neutral-400">{t.county} · {t.facility} · {t.date} · Trainer: {t.trainer}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-neutral-700">{t.attended}/{t.enrolled}</p>
                  <p className="text-xs text-neutral-400">Attended</p>
                </div>
                {t.status === 'Completed' && (
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${t.passRate>=85?'text-green-700':'text-amber-600'}`}>{t.passRate}%</p>
                    <p className="text-xs text-neutral-400">Pass Rate</p>
                  </div>
                )}
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${expandedSession===t.id?'rotate-180':''}`}/>
              </div>
              {expandedSession===t.id && (
                <div className="bg-neutral-50 border-t border-neutral-100 px-5 py-4">
                  <p className="text-xs font-bold text-neutral-500 mb-2 uppercase">Attendees</p>
                  {(ATTENDEES[t.id] ?? [{name:'Agnes Kollie',role:'Data Clerk',facility:t.facility,passed:true},{name:'Daniel Kolo',role:'Nurse',facility:t.facility,passed:true},{name:'Victoria Moore',role:'TB Officer',facility:t.facility,passed:false}]).map((a,i)=>(
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0">
                      <div className="h-7 w-7 bg-health-blue/10 text-health-blue rounded-full flex items-center justify-center text-xs font-black">{a.name[0]}</div>
                      <div className="flex-1"><p className="text-sm font-bold text-neutral-700">{a.name}</p><p className="text-xs text-neutral-400">{a.role} · {a.facility}</p></div>
                      {a.passed?<CheckCircle2 className="h-5 w-5 text-green-500"/>:<AlertTriangle className="h-5 w-5 text-amber-400"/>}
                      <span className={`text-xs font-bold ${a.passed?'text-green-700':'text-amber-600'}`}>{a.passed?'Passed':'Not Passed'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: Post-Training Support
// ─────────────────────────────────────────────────────────────────────────────
const PostTrainingTab = () => {
  const [requests, setRequests] = useState(POST_TRAINING_SUPPORT);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ facility:'', county:'Montserrado', staff:'', issue:'', type:'Phone', date:'' });

  const add = () => {
    if (!form.issue) return;
    setRequests(prev=>[{ id:`PT-${String(prev.length+1).padStart(3,'0')}`, ...form, resolved:'Pending' },...prev]);
    setForm({ facility:'', county:'Montserrado', staff:'', issue:'', type:'Phone', date:'' });
    setShowForm(false);
    (window as any).showToast('Support request logged.');
  };

  const callsThisMonth = requests.filter(r=>r.type==='Phone').length;
  const visitsThisMonth = requests.filter(r=>r.type==='Visit').length;
  const resolved = requests.filter(r=>r.resolved==='Yes').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Phone Support',    val:callsThisMonth,  color:'text-health-blue', bg:'bg-blue-50' },
          { label:'Site Visits',      val:visitsThisMonth, color:'text-green-700',   bg:'bg-green-50'},
          { label:'Issues Resolved',  val:resolved,        color:'text-amber-700',   bg:'bg-amber-50'},
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <h3 className="font-bold text-neutral-800">Post-Training Support Log</h3>
            <button onClick={()=>setShowForm(true)} className="bg-health-blue text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-800">
              <Plus className="h-3.5 w-3.5"/> Log Request
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {requests.map(r=>(
              <div key={r.id} className="px-5 py-3 flex items-start gap-3 hover:bg-neutral-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-neutral-400">{r.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${r.type==='Phone'?'bg-blue-50 text-blue-700 border-blue-100':r.type==='Visit'?'bg-green-50 text-green-700 border-green-100':'bg-purple-50 text-purple-700 border-purple-100'}`}>{r.type}</span>
                    <span className="text-xs text-neutral-400">{r.date}</span>
                  </div>
                  <p className="text-sm font-bold text-neutral-800 mt-0.5 leading-tight">{r.issue}</p>
                  <p className="text-xs text-neutral-400">{r.staff} · {r.facility} · {r.county}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${r.resolved==='Yes'?'bg-green-100 text-green-700 border-green-200':r.resolved==='No'?'bg-red-100 text-red-700 border-red-200':'bg-amber-100 text-amber-700 border-amber-200'}`}>{r.resolved}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="font-bold text-neutral-700 mb-4">Monthly Post-Training Support Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={PT_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="calls"  name="Phone Support" stroke="#004e89" strokeWidth={2} dot={{r:4}}/>
              <Line type="monotone" dataKey="visits" name="Site Visits"   stroke="#27ae60" strokeWidth={2} dot={{r:4}}/>
              <Line type="monotone" dataKey="remote" name="Remote"         stroke="#e67e22" strokeWidth={2} dot={{r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-[500px] rounded-2xl shadow-2xl">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">Log Support Request</h3>
              <button onClick={()=>setShowForm(false)} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">County</label>
                  <select value={form.county} onChange={e=>setForm(p=>({...p,county:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {ALL_COUNTIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Support Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    {['Phone','Visit','Remote'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Facility</label>
                  <input value={form.facility} onChange={e=>setForm(p=>({...p,facility:e.target.value}))} placeholder="Facility name" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
                </div>
                <div><label className="text-xs font-bold text-neutral-600 block mb-1">Staff Member</label>
                  <input value={form.staff} onChange={e=>setForm(p=>({...p,staff:e.target.value}))} placeholder="Full name" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
                </div>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Issue / Question *</label>
                <textarea value={form.issue} onChange={e=>setForm(p=>({...p,issue:e.target.value}))} rows={3} placeholder="Describe the issue or question raised" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
              <div><label className="text-xs font-bold text-neutral-600 block mb-1">Date</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none"/>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg font-medium">Cancel</button>
              <button onClick={add} disabled={!form.issue} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-60">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const TrainingDashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'materials')     return <MaterialsTab />;
  if (activeTab === 'rollout')       return <RolloutTab />;
  if (activeTab === 'attendance')    return <AttendanceTab />;
  if (activeTab === 'post_training') return <PostTrainingTab />;
  return <MaterialsTab />;
};
