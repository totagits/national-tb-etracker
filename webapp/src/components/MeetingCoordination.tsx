import { useState, useEffect, useRef } from 'react';
import {
  Video, Plus, X, Users, Download, Clock, CheckCircle2, Mic, MicOff,
  Camera, CameraOff, Monitor, MonitorStop, PhoneOff, Link, Copy,
  Calendar, Mail, Edit3, Send, ChevronDown, AlertCircle,
  UserPlus, FileText, Trash2, MessageSquare, BookUser, Search
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Participant {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  phone?: string;
}

interface Attendee extends Participant {
  status: 'accepted' | 'pending' | 'declined' | 'present' | 'absent';
}

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  due: string;
  done: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  agenda?: string;
  meetLink: string;
  attendees: Attendee[];
  minutes: string;
  actionItems: ActionItem[];
  status: 'live' | 'scheduled' | 'completed';
}

// ─── Initial Participant Registry ─────────────────────────────────────────────
const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Dr. Samson Kollie', role: 'Project Director', organization: 'MoH Liberia', email: 'skollie@moh.gov.lr', phone: '+231-886-001001' },
  { id: 'p2', name: 'Mary Johnson', role: 'Project Manager', organization: 'Plan International', email: 'mjohnson@planinternational.org', phone: '+231-886-002002' },
  { id: 'p3', name: 'David Sumo', role: 'DHIS2 Config Specialist', organization: 'DHIS2 Core Team', email: 'dsumo@dhis2.org', phone: '+231-886-003003' },
  { id: 'p4', name: 'Esther Flomo', role: 'Health Informatics Specialist', organization: 'MoH Liberia', email: 'eflomo@moh.gov.lr', phone: '+231-886-004004' },
  { id: 'p5', name: 'James Kpan', role: 'Data Security & QA Lead', organization: 'Plan International', email: 'jkpan@planinternational.org', phone: '+231-886-005005' },
  { id: 'p6', name: 'Ruth Toe', role: 'Training Coordinator', organization: 'MoH Liberia', email: 'rtoe@moh.gov.lr', phone: '+231-886-006006' },
  { id: 'p7', name: 'Samuel Barwon', role: 'Helpdesk Officer', organization: 'MoH Liberia', email: 'sbarwon@moh.gov.lr', phone: '+231-886-007007' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    live: 'bg-red-100 text-red-700 border-red-200',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-neutral-100 text-neutral-500',
    accepted: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    declined: 'bg-red-100 text-red-700',
  };
  const label: Record<string, string> = {
    live: '🔴 LIVE', scheduled: 'Scheduled', completed: 'Completed',
    present: 'Present', absent: 'Absent', accepted: 'Accepted', pending: 'Pending', declined: 'Declined',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${map[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
      {label[status] ?? status}
    </span>
  );
};

// ─── Participant Directory Tab ─────────────────────────────────────────────────
const ParticipantDirectory = ({
  participants,
  onAdd,
  onDelete,
}: {
  participants: Participant[];
  onAdd: (p: Participant) => void;
  onDelete: (id: string) => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', role: '', organization: '', email: '', phone: '' });

  const filtered = participants.filter(p =>
    [p.name, p.role, p.organization, p.email].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    onAdd({ id: `p${Date.now()}`, ...form });
    setForm({ name: '', role: '', organization: '', email: '', phone: '' });
    setShowForm(false);
    (window as any).showToast(`${form.name} added to the TB e-Tracker participant registry.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-neutral-200">
        <div>
          <h3 className="text-xl font-bold text-neutral-800">Participant Registry</h3>
          <p className="text-sm text-neutral-500">Manage all TB e-Tracker project stakeholders and meeting participants.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-health-blue text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Add Participant
        </button>
      </div>

      {/* Add Participant Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-health-blue shadow-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-neutral-800 flex items-center gap-2"><UserPlus className="h-5 w-5 text-health-blue" /> Register New Participant</h4>
            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} type="text" placeholder="e.g. Dr. James Kollie" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Role / Title *</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} type="text" placeholder="e.g. County TB Officer" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Organization / Facility</label>
              <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} type="text" placeholder="e.g. MoH Liberia / JFK Medical Center" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Email Address *</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="user@moh.gov.lr" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" placeholder="+231-886-XXXXXX" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg">Cancel</button>
            <button onClick={handleAdd} disabled={!form.name || !form.email} className="bg-health-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-60 shadow-sm">
              Save Participant
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          type="text" placeholder="Search by name, role, organization, or email..."
          className="w-full border border-neutral-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-health-blue"
        />
      </div>

      {/* Participant Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Role</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Organization</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Email</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Phone</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-health-blue text-white text-sm flex items-center justify-center font-bold flex-shrink-0">{p.name[0]}</div>
                  <span className="text-sm font-bold text-neutral-800">{p.name}</span>
                </td>
                <td className="px-5 py-3 text-sm text-neutral-600">{p.role}</td>
                <td className="px-5 py-3 text-sm text-neutral-500">{p.organization}</td>
                <td className="px-5 py-3 text-sm text-health-blue">{p.email}</td>
                <td className="px-5 py-3 text-sm text-neutral-500">{p.phone || '—'}</td>
                <td className="px-5 py-3">
                  <button onClick={() => { if (window.confirm(`Remove ${p.name} from the registry?`)) onDelete(p.id); }} className="text-neutral-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-neutral-400 text-sm">No participants found. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-400">{participants.length} registered participants · When you schedule a meeting, you select from this registry to invite attendees.</p>
    </div>
  );
};

// ─── Live Meeting Room ──────────────────────────────────────────────────────
const LiveMeetingRoom = ({
  meeting,
  participants,
  onEnd,
}: {
  meeting: Meeting;
  participants: Participant[];
  onEnd: () => void;
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [minutes, setMinutes] = useState(meeting.minutes);
  const [actionItems, setActionItems] = useState<ActionItem[]>(meeting.actionItems);
  const [newAction, setNewAction] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(meeting.attendees[0]?.name ?? '');
  const [newActionDue, setNewActionDue] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [chat, setChat] = useState<{ name: string; msg: string }[]>([
    { name: 'Dr. Samson Kollie', msg: "Good morning team! Let's begin." },
    { name: 'Mary Johnson', msg: 'Ready. Sharing agenda now.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>(meeting.attendees);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [copied, setCopied] = useState(false);

  // ── Camera / Mic state ─────────────────────────────────────
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const minutesRef = useRef<HTMLTextAreaElement>(null);

  // Request camera + mic on mount; release on unmount
  useEffect(() => {
    let cancelled = false;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
        setCameraError(null);
      } catch (err: any) {
        if (!cancelled) {
          const msg =
            err.name === 'NotAllowedError' ? 'Camera/microphone permission denied. Please allow access in your browser settings and refresh.' :
            err.name === 'NotFoundError' ? 'No camera or microphone found on this device.' :
            'Could not access camera/microphone: ' + (err.message ?? err.name);
          setCameraError(msg);
          setCameraReady(false);
        }
      }
    };
    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Toggle mic hardware track
  const toggleMic = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setMicOn(m => !m);
  };

  // Toggle camera hardware track
  const toggleCam = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setCamOn(c => !c);
  };

  // End meeting + release camera
  const handleEndMeeting = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    onEnd();
  };

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const addActionItem = () => {
    if (!newAction.trim()) return;
    setActionItems(prev => [...prev, {
      id: `ai-${Date.now()}`, text: newAction,
      assignee: newActionAssignee, due: newActionDue || 'TBD', done: false,
    }]);
    setNewAction('');
    setNewActionDue('');
    (window as any).showToast('Action item added!');
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat(prev => [...prev, { name: 'You (Project Manager)', msg: chatInput }]);
    setChatInput('');
  };

  const toggleAttendance = (id: string) => {
    setAttendees(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'present' ? 'absent' : 'present' } : a
    ));
  };

  const addMidMeetingParticipant = (p: Participant) => {
    if (attendees.find(a => a.id === p.id)) {
      (window as any).showToast(`${p.name} is already in this meeting.`);
      return;
    }
    setAttendees(prev => [...prev, { ...p, status: 'pending' }]);
    (window as any).showToast(`Meeting invite sent to ${p.name} (${p.email})`);
  };

  const sendExternalInvite = () => {
    if (!inviteEmail || !inviteName) return;
    setAttendees(prev => [...prev, {
      id: `ext-${Date.now()}`, name: inviteName, role: 'External Invitee',
      organization: '', email: inviteEmail, status: 'pending',
    }]);
    (window as any).showToast(`Meeting invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteName('');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meeting.meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presentCount = attendees.filter(a => a.status === 'present').length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="bg-neutral-900 rounded-xl text-white p-4 flex items-center justify-between shadow-lg flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Live</span>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{meeting.title}</h3>
            <p className="text-xs text-neutral-400">Duration: {formatElapsed(elapsed)} &nbsp;·&nbsp; {presentCount}/{attendees.length} attendees</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={toggleMic} className={`p-2.5 rounded-full transition-colors ${micOn ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-600 hover:bg-red-700'}`} title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}>
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button onClick={toggleCam} className={`p-2.5 rounded-full transition-colors ${camOn ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-red-600 hover:bg-red-700'}`} title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}>
            {camOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { setScreenSharing(s => !s); (window as any).showToast(screenSharing ? 'Screen share stopped.' : 'Screen sharing started — all participants can see your screen.'); }}
            className={`p-2.5 rounded-full transition-colors ${screenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-neutral-700 hover:bg-neutral-600'}`}
            title="Share Screen"
          >
            {screenSharing ? <MonitorStop className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>
          <button onClick={copyLink} className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
            <Video className="h-4 w-4" /> Join Video
          </a>
          <button onClick={handleEndMeeting} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ml-2">
            <PhoneOff className="h-4 w-4" /> End Meeting
          </button>
        </div>
      </div>

      {/* Camera permission error */}
      {cameraError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <CameraOff className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Camera / Microphone Access Required</p>
            <p className="text-xs text-red-700 mt-1">{cameraError}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-xs font-bold text-red-700 underline">Retry</button>
          </div>
        </div>
      )}

      {/* Live camera self-view */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Host self-view */}
        <div className="relative bg-neutral-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? 'opacity-0' : 'opacity-100'}`}
          />
          {!camOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CameraOff className="h-8 w-8 text-neutral-500 mb-2" />
              <p className="text-xs text-neutral-500">Camera Off</p>
            </div>
          )}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mb-2" />
              <p className="text-xs text-neutral-400">Requesting camera access...</p>
            </div>
          )}
          {/* Name tag */}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
            {!micOn && <MicOff className="h-3 w-3 text-red-400" />}
            You (Host)
          </div>
          {cameraReady && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </div>
          )}
        </div>

        {/* Remote participant placeholders */}
        {attendees.filter(a => a.status === 'present' && a.id !== meeting.attendees[0]?.id).slice(0, 3).map((a, i) => (
          <div key={a.id} className="relative bg-neutral-800 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center gap-2">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-black text-white ${
              ['bg-health-blue', 'bg-amber-600', 'bg-green-700'][i % 3]
            }`}>{a.name[0]}</div>
            <p className="text-xs text-neutral-400">{a.name.split(' ')[0]}</p>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">{a.name.split(' ')[0]}</div>
          </div>
        ))}
      </div>

      {screenSharing && (
        <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-2 text-sm text-green-800 font-bold flex items-center gap-2">
          <Monitor className="h-4 w-4" /> You are sharing your screen with all participants. Click Screen Share again to stop.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Minutes + Actions + Chat */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-neutral-800 flex items-center gap-2"><Edit3 className="h-4 w-4 text-health-blue" /> Live Meeting Minutes</h4>
              <button onClick={() => window.print()} className="text-xs text-neutral-500 hover:text-health-blue flex items-center gap-1 border rounded px-2 py-1">
                <Download className="h-3 w-3" /> Export PDF
              </button>
            </div>
            <textarea ref={minutesRef} value={minutes} onChange={(e) => setMinutes(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-health-blue h-52 resize-y font-mono"
              placeholder="Type minutes here in real-time..." />
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Action Items</h4>
            <div className="space-y-2 mb-4">
              {actionItems.map(ai => (
                <div key={ai.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${ai.done ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-white border-neutral-200 hover:border-health-blue'}`}>
                  <input type="checkbox" checked={ai.done} onChange={() => setActionItems(prev => prev.map(a => a.id === ai.id ? { ...a, done: !a.done } : a))} className="h-4 w-4 accent-health-blue" />
                  <p className={`flex-1 text-sm font-medium ${ai.done ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>{ai.text}</p>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{ai.assignee}</span>
                  <span className="text-xs text-neutral-400 flex items-center gap-1"><Clock className="h-3 w-3" />{ai.due}</span>
                  <button onClick={() => setActionItems(prev => prev.filter(a => a.id !== ai.id))} className="text-neutral-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-3 space-y-2">
              <input type="text" value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && addActionItem()} placeholder="New action item..." className="w-full text-sm border border-neutral-200 rounded p-2 outline-none focus:border-health-blue" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newActionAssignee} onChange={e => setNewActionAssignee(e.target.value)} className="text-sm border rounded p-1.5 outline-none">
                  {attendees.map(a => <option key={a.id}>{a.name}</option>)}
                </select>
                <input type="date" value={newActionDue} onChange={e => setNewActionDue(e.target.value)} className="text-sm border rounded p-1.5 outline-none" />
              </div>
              <button onClick={addActionItem} className="w-full bg-health-blue text-white text-sm font-bold py-1.5 rounded hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Action Item
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-health-blue" /> Meeting Chat</h4>
            <div className="bg-neutral-50 rounded-lg h-36 overflow-y-auto p-3 space-y-2 mb-3 border border-neutral-200">
              {chat.map((c, i) => (
                <div key={i}>
                  <span className="text-xs font-bold text-health-blue">{c.name}: </span>
                  <span className="text-xs text-neutral-700">{c.msg}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} type="text" placeholder="Type a message..." className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-health-blue" />
              <button onClick={sendChat} className="bg-health-blue text-white px-3 py-2 rounded-lg hover:bg-blue-800"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Right: Attendance + Invite */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-neutral-800">Attendance</h4>
              <span className="bg-health-blue text-white text-xs font-bold px-3 py-1 rounded-full">{presentCount}/{attendees.length} Present</span>
            </div>
            <div className="space-y-2">
              {attendees.map(a => (
                <label key={a.id} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:border-health-blue transition-colors">
                  <input type="checkbox" checked={a.status === 'present'} onChange={() => toggleAttendance(a.id)} className="h-4 w-4 accent-health-blue rounded" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${a.status !== 'present' ? 'opacity-50' : ''}`}>{a.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{a.role}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </label>
              ))}
            </div>
          </div>

          {/* Invite from Registry */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2"><UserPlus className="h-4 w-4 text-health-blue" /> Add Participant</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-2">From Registry</p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {participants.filter(p => !attendees.find(a => a.id === p.id)).map(p => (
                    <button key={p.id} onClick={() => addMidMeetingParticipant(p)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-neutral-200 hover:border-health-blue hover:bg-blue-50 text-left transition-colors">
                      <div className="h-6 w-6 rounded-full bg-neutral-200 text-neutral-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{p.name[0]}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{p.role}</p>
                      </div>
                      <Plus className="h-3 w-3 text-health-blue ml-auto flex-shrink-0" />
                    </button>
                  ))}
                  {participants.filter(p => !attendees.find(a => a.id === p.id)).length === 0 && (
                    <p className="text-xs text-neutral-400 text-center py-2">All registered participants are already invited.</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-bold text-neutral-500 mb-2">Or Invite External Person</p>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Full Name" className="w-full border border-neutral-200 rounded-lg p-2 text-sm outline-none focus:border-health-blue mb-2" />
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@address.com" className="w-full border border-neutral-200 rounded-lg p-2 text-sm outline-none focus:border-health-blue mb-2" />
                <button onClick={sendExternalInvite} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Mail className="h-4 w-4" /> Send Meeting Invite
                </button>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-neutral-500 mb-2 font-bold">Meeting link:</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-neutral-100 text-xs rounded p-2 truncate text-neutral-600">{meeting.meetLink}</code>
                  <button onClick={copyLink} className="text-health-blue hover:text-blue-800">
                    {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Schedule Meeting Modal ─────────────────────────────────────────────────
const ScheduleModal = ({
  onClose,
  onCreate,
  participants,
}: {
  onClose: () => void;
  onCreate: (m: Meeting) => void;
  participants: Participant[];
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [agenda, setAgenda] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const toggle = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = participants.filter(p =>
    [p.name, p.role, p.organization].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = () => {
    if (!title || !date || !time) return;
    setCreating(true);
    setTimeout(() => {
      const meetCode = [3, 4, 3].map(n => Math.random().toString(36).substring(2, 2 + n)).join('-');
      const newMeeting: Meeting = {
        id: `mtg-${Date.now()}`,
        title, date, time, duration, agenda,
        meetLink: `https://meet.google.com/${meetCode}`,
        status: 'scheduled',
        attendees: participants.filter(p => selectedIds.includes(p.id)).map(p => ({ ...p, status: 'pending' as const })),
        minutes: '',
        actionItems: [],
      };
      onCreate(newMeeting);
      setCreating(false);
      (window as any).showToast(`Meeting scheduled! Invites sent to ${newMeeting.attendees.length} participants.`);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-[660px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        <div className="bg-health-blue text-white p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Video className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-lg">Schedule Meeting</h3>
              <p className="text-xs text-blue-200">A secure meeting link will be auto-generated and emailed to all invitees.</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-blue-800 p-1.5 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Meeting Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. TB e-Tracker Monthly Review" className="w-full border border-neutral-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-health-blue" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Date *</label>
              <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full border border-neutral-300 rounded-lg p-2.5 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Time *</label>
              <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full border border-neutral-300 rounded-lg p-2.5 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Duration (min)</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full border border-neutral-300 rounded-lg p-2.5 outline-none">
                {['30', '45', '60', '90', '120'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Meeting Agenda (optional)</label>
            <textarea value={agenda} onChange={e => setAgenda(e.target.value)} rows={3} placeholder="1. Review UAT progress&#10;2. County data sync status&#10;3. Action items follow-up" className="w-full border border-neutral-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-health-blue text-sm" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-neutral-700">Select Participants</label>
              <span className="text-xs text-neutral-500">{selectedIds.length} selected from {participants.length} registered</span>
            </div>
            <div className="relative mb-2">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search participants..." className="w-full border border-neutral-200 rounded-lg pl-8 pr-4 py-2 text-sm outline-none" />
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto border border-neutral-200 rounded-lg p-3 bg-neutral-50">
              {filtered.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-neutral-200 cursor-pointer hover:border-health-blue transition-colors">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-health-blue" />
                  <div className="h-7 w-7 rounded-full bg-health-blue text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{p.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-neutral-500">{p.role} &nbsp;·&nbsp; {p.organization}</p>
                  </div>
                  <span className="text-xs text-neutral-400">{p.email}</span>
                </label>
              ))}
              {filtered.length === 0 && <p className="text-center text-sm text-neutral-400 py-4">No participants found. Add them first in the Participant Registry tab.</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">A secure video conference link will be auto-generated. Each selected participant will receive an email invitation with a one-click <strong>Join Meeting</strong> button.</p>
          </div>
        </div>

        <div className="bg-neutral-50 p-4 border-t flex justify-between items-center rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-200 rounded-lg">Cancel</button>
          <button onClick={handleCreate} disabled={creating || !title || !date || !time}
            className="bg-health-blue hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 disabled:opacity-60 transition-colors">
            {creating
              ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Scheduling...</>
              : <><Calendar className="h-4 w-4" /> Schedule & Send Invites</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Past Meeting Card ──────────────────────────────────────────────────────
const PastMeetingCard = ({ meeting }: { meeting: Meeting }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center"><Video className="h-5 w-5" /></div>
          <div>
            <h4 className="font-bold text-neutral-800">{meeting.title}</h4>
            <p className="text-xs text-neutral-500">
              {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp; {meeting.attendees.length} attendees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={meeting.status} />
          <button onClick={(e) => { e.stopPropagation(); window.print(); }} className="text-health-blue text-sm font-medium flex items-center gap-1 border border-neutral-200 px-3 py-1 rounded-lg hover:bg-blue-50">
            <Download className="h-4 w-4" /> Minutes PDF
          </button>
          <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {expanded && (
        <div className="border-t border-neutral-200 p-4 bg-neutral-50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Minutes</h5>
            <div className="bg-white border rounded-lg p-3 text-sm text-neutral-600 font-mono whitespace-pre-line">{meeting.minutes || '(No minutes recorded)'}</div>
          </div>
          <div>
            <h5 className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Action Items</h5>
            {meeting.actionItems.length === 0 && <p className="text-xs text-neutral-400">No action items.</p>}
            {meeting.actionItems.map(ai => (
              <div key={ai.id} className="flex items-center gap-2 py-1.5 border-b border-neutral-100">
                <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${ai.done ? 'text-green-500' : 'text-neutral-300'}`} />
                <p className={`text-sm flex-1 ${ai.done ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>{ai.text}</p>
                <span className="text-xs text-neutral-400">{ai.assignee}</span>
              </div>
            ))}
            <div className="mt-4">
              <h5 className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Attendees</h5>
              <div className="flex flex-wrap gap-2">
                {meeting.attendees.map(a => (
                  <div key={a.id} className="flex items-center gap-1 bg-white border border-neutral-200 rounded-full px-2 py-1">
                    <div className="h-5 w-5 rounded-full bg-health-blue text-white text-[10px] flex items-center justify-center font-bold">{a.name[0]}</div>
                    <span className="text-xs font-medium">{a.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export const MeetingCoordination = () => {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'mtg-001',
      title: 'Weekly MoH Sync: TB e-Tracker UAT Review',
      date: '2026-05-20', time: '10:00', duration: '60',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'live',
      attendees: [
        { ...INITIAL_PARTICIPANTS[0], status: 'present' },
        { ...INITIAL_PARTICIPANTS[1], status: 'present' },
        { ...INITIAL_PARTICIPANTS[2], status: 'absent' },
        { ...INITIAL_PARTICIPANTS[3], status: 'present' },
      ],
      minutes: '- Reviewed UAT progress for the 31 high-burden facilities.\n- Confirmed SOP training materials distributed to all 15 counties.\n- Identified risk RSK-001: internet connectivity at Lofa county clinics.',
      actionItems: [
        { id: 'ai1', text: 'Send DHIS2 metadata schema v2 to MoH IT', assignee: 'David Sumo', due: '2026-05-22', done: false },
        { id: 'ai2', text: 'Coordinate with Lofa County for offline sync training', assignee: 'Ruth Toe', due: '2026-05-24', done: false },
        { id: 'ai3', text: 'Escalate RSK-001 to Project Director', assignee: 'Mary Johnson', due: '2026-05-21', done: true },
      ],
    },
    {
      id: 'mtg-002',
      title: 'Project Kickoff & Stakeholder Alignment',
      date: '2026-05-10', time: '09:00', duration: '90',
      meetLink: 'https://meet.google.com/xyz-1234-abc',
      status: 'completed',
      attendees: INITIAL_PARTICIPANTS.map(p => ({ ...p, status: 'present' as const })),
      minutes: '- Officially launched the National TB e-Tracker project.\n- Reviewed project charter and roles.\n- All team members confirmed deliverable timelines.',
      actionItems: [
        { id: 'ai4', text: 'Distribute project charter to all stakeholders', assignee: 'Mary Johnson', due: '2026-05-12', done: true },
      ],
    },
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'meetings' | 'participants'>('meetings');
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>('mtg-001');

  const liveMeeting = meetings.find(m => m.id === activeMeetingId && m.status === 'live');
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const pastMeetings = meetings.filter(m => m.status === 'completed');

  const handleEndMeeting = () => {
    setMeetings(prev => prev.map(m => m.id === activeMeetingId ? { ...m, status: 'completed' } : m));
    setActiveMeetingId(null);
    (window as any).showToast('Meeting ended. Minutes saved and distributed to all participants.');
  };

  const handleStartMeeting = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'live' } : m));
    setActiveMeetingId(id);
    setActiveTab('meetings');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Meeting Coordination & Minutes</h2>
          <p className="text-sm text-neutral-500">Schedule meetings, track attendance, document minutes, and manage all project participants.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('participants')}
            className="border border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <BookUser className="h-4 w-4" /> Participant Registry
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-health-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
          >
            <Video className="h-4 w-4" /> Schedule Meeting
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 gap-1">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'meetings' ? 'border-health-blue text-health-blue' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          Meetings
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'participants' ? 'border-health-blue text-health-blue' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          Participant Registry
          <span className="bg-health-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{participants.length}</span>
        </button>
      </div>

      {/* Participant Directory */}
      {activeTab === 'participants' && (
        <ParticipantDirectory
          participants={participants}
          onAdd={(p) => setParticipants(prev => [...prev, p])}
          onDelete={(id) => setParticipants(prev => prev.filter(p => p.id !== id))}
        />
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          {/* Live Meeting Room */}
          {liveMeeting && (
            <div>
              <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> Current Live Session
              </h3>
              <LiveMeetingRoom meeting={liveMeeting} participants={participants} onEnd={handleEndMeeting} />
            </div>
          )}

          {/* Scheduled */}
          {scheduledMeetings.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-health-blue" /> Upcoming Meetings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledMeetings.map(m => (
                  <div key={m.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-neutral-800">{m.title}</h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} at {m.time} &nbsp;·&nbsp; {m.duration} min
                        </p>
                      </div>
                      <StatusBadge status="scheduled" />
                    </div>
                    {m.agenda && <p className="text-xs text-neutral-500 bg-neutral-50 rounded p-2 whitespace-pre-line">{m.agenda}</p>}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {m.attendees.slice(0, 5).map(a => (
                          <div key={a.id} title={a.name} className="h-7 w-7 rounded-full bg-health-blue text-white text-xs flex items-center justify-center border-2 border-white font-bold">{a.name[0]}</div>
                        ))}
                        {m.attendees.length > 5 && <div className="h-7 w-7 rounded-full bg-neutral-200 text-neutral-600 text-xs flex items-center justify-center border-2 border-white font-bold">+{m.attendees.length - 5}</div>}
                      </div>
                      <span className="text-xs text-neutral-500">{m.attendees.length} participants invited</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-neutral-100">
                      <a href={m.meetLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Link className="h-4 w-4" /> Join Link
                      </a>
                      <button onClick={() => handleStartMeeting(m.id)} className="flex-1 bg-health-blue hover:bg-blue-800 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Video className="h-4 w-4" /> Start Meeting
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          <div>
            <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-neutral-600" /> Past Meeting Records
            </h3>
            <div className="space-y-3">
              {pastMeetings.map(m => <PastMeetingCard key={m.id} meeting={m} />)}
              {pastMeetings.length === 0 && !liveMeeting && scheduledMeetings.length === 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
                  <Video className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                  <p className="font-bold text-neutral-600">No meetings yet</p>
                  <p className="text-sm text-neutral-400 mt-1">Click "Schedule Meeting" to set up your first TB e-Tracker project meeting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onCreate={(m) => setMeetings(prev => [...prev, m])}
          participants={participants}
        />
      )}
    </div>
  );
};
