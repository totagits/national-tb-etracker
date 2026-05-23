import { useState } from 'react';
import {
  Database, Settings, Upload, CheckCircle2, AlertCircle, FileCode2,
  Plus, Search, Edit2, RefreshCw, ChevronDown, ChevronRight,
  Activity, Download, Shield, Code2, GitBranch,
} from 'lucide-react';

// ─── Shared ───────────────────────────────────────────────────────────────────
const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>{label}</span>
);
const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEI_ATTRIBUTES = [
  { id: 'TEA-001', name: 'Last Name',           valueType: 'TEXT',        mandatory: true,  searchable: true,  unique: false, generated: false },
  { id: 'TEA-002', name: 'First Name',           valueType: 'TEXT',        mandatory: true,  searchable: true,  unique: false, generated: false },
  { id: 'TEA-003', name: 'Date of Birth',        valueType: 'DATE',        mandatory: true,  searchable: false, unique: false, generated: false },
  { id: 'TEA-004', name: 'Sex',                  valueType: 'TEXT (Option)',mandatory: true,  searchable: false, unique: false, generated: false },
  { id: 'TEA-005', name: 'TB Registration ID',   valueType: 'TEXT',        mandatory: true,  searchable: true,  unique: true,  generated: true  },
  { id: 'TEA-006', name: 'Address',              valueType: 'TEXT',        mandatory: false, searchable: false, unique: false, generated: false },
  { id: 'TEA-007', name: 'Phone Number',         valueType: 'PHONE_NUMBER',mandatory: false, searchable: true,  unique: false, generated: false },
  { id: 'TEA-008', name: 'HIV Status',           valueType: 'TEXT (Option)',mandatory: false, searchable: false, unique: false, generated: false },
  { id: 'TEA-009', name: 'County',               valueType: 'TEXT (Option)',mandatory: true,  searchable: true,  unique: false, generated: false },
  { id: 'TEA-010', name: 'Facility',             valueType: 'ORGANISATION_UNIT', mandatory: true, searchable: true, unique: false, generated: false },
  { id: 'TEA-011', name: 'National ID',          valueType: 'TEXT',        mandatory: false, searchable: true,  unique: true,  generated: false },
  { id: 'TEA-012', name: 'Referred By',          valueType: 'TEXT',        mandatory: false, searchable: false, unique: false, generated: false },
];

const PROGRAM_STAGES = [
  { id: 'PS-01', name: 'TB Screening & Presumptive Identification', repeatable: false, days: 0,   elements: 8,  type: 'Screening'  },
  { id: 'PS-02', name: 'Diagnostic Investigation',                  repeatable: false, days: 7,   elements: 12, type: 'Diagnostic' },
  { id: 'PS-03', name: 'TB Diagnosis Confirmation',                 repeatable: false, days: 14,  elements: 6,  type: 'Clinical'   },
  { id: 'PS-04', name: 'Treatment Initiation',                      repeatable: false, days: 21,  elements: 9,  type: 'Treatment'  },
  { id: 'PS-05', name: 'Monthly Treatment Follow-up',               repeatable: true,  days: 30,  elements: 11, type: 'Follow-up'  },
  { id: 'PS-06', name: 'Sputum Smear / GeneXpert Follow-up',        repeatable: true,  days: 60,  elements: 7,  type: 'Lab'        },
  { id: 'PS-07', name: 'HIV/TB Co-infection Assessment',            repeatable: false, days: 14,  elements: 8,  type: 'Clinical'   },
  { id: 'PS-08', name: 'Treatment Outcome Recording',               repeatable: false, days: 180, elements: 5,  type: 'Outcome'    },
];

const STAGE_ELEMENTS: Record<string, { id: string; name: string; valueType: string; mandatory: boolean; section: string }[]> = {
  'PS-01': [
    { id: 'DE-S01-01', name: 'Cough Duration (weeks)',        valueType: 'INTEGER',      mandatory: true,  section: 'Symptoms'    },
    { id: 'DE-S01-02', name: 'Night Sweats',                  valueType: 'BOOLEAN',      mandatory: true,  section: 'Symptoms'    },
    { id: 'DE-S01-03', name: 'Weight Loss',                   valueType: 'BOOLEAN',      mandatory: true,  section: 'Symptoms'    },
    { id: 'DE-S01-04', name: 'Fever',                         valueType: 'BOOLEAN',      mandatory: true,  section: 'Symptoms'    },
    { id: 'DE-S01-05', name: 'Hemoptysis',                    valueType: 'BOOLEAN',      mandatory: false, section: 'Symptoms'    },
    { id: 'DE-S01-06', name: 'Close TB Contact',              valueType: 'BOOLEAN',      mandatory: true,  section: 'Risk Factors' },
    { id: 'DE-S01-07', name: 'Previous TB History',           valueType: 'BOOLEAN',      mandatory: true,  section: 'Risk Factors' },
    { id: 'DE-S01-08', name: 'AI Screening Risk Score',       valueType: 'TEXT (Option)',mandatory: false, section: 'AI Output'   },
  ],
  'PS-08': [
    { id: 'DE-S08-01', name: 'Treatment Outcome',             valueType: 'TEXT (Option)',mandatory: true,  section: 'Outcome'  },
    { id: 'DE-S08-02', name: 'Outcome Date',                  valueType: 'DATE',         mandatory: true,  section: 'Outcome'  },
    { id: 'DE-S08-03', name: 'Outcome Notes',                 valueType: 'LONG_TEXT',    mandatory: false, section: 'Outcome'  },
    { id: 'DE-S08-04', name: 'Transfer Out Facility',         valueType: 'TEXT',         mandatory: false, section: 'Transfer' },
    { id: 'DE-S08-05', name: 'Death Cause (if applicable)',   valueType: 'TEXT',         mandatory: false, section: 'Outcome'  },
  ],
};

const OPTION_SETS = [
  { id: 'OS-001', name: 'Sex',                    code: 'LBR_SEX',           options: ['Male','Female','Unknown'],                                        version: 2, used: 1 },
  { id: 'OS-002', name: 'TB Disease Category',    code: 'LBR_TB_CATEGORY',   options: ['Pulmonary TB','Extrapulmonary TB','Both'],                         version: 1, used: 3 },
  { id: 'OS-003', name: 'Treatment Regimen',      code: 'LBR_REGIMEN',       options: ['1st Line (2HRZE/4HR)','2nd Line','Retreatment'],                   version: 3, used: 2 },
  { id: 'OS-004', name: 'Treatment Outcome',      code: 'LBR_TX_OUTCOME',    options: ['Cured','Treatment Completed','Failed','Lost to Follow-up','Died'], version: 1, used: 1 },
  { id: 'OS-005', name: 'HIV Status',             code: 'LBR_HIV_STATUS',    options: ['Positive','Negative','Unknown'],                                   version: 1, used: 2 },
  { id: 'OS-006', name: 'Bacteriological Status', code: 'LBR_BACT_STATUS',   options: ['Bacteriologically Confirmed','Clinically Diagnosed'],             version: 1, used: 2 },
  { id: 'OS-007', name: 'Diagnostic Test',        code: 'LBR_DIAG_TEST',     options: ['GeneXpert MTB/RIF','Smear Microscopy','Culture','Clinical'],       version: 2, used: 1 },
  { id: 'OS-008', name: 'Screening Risk Level',   code: 'LBR_RISK_LEVEL',    options: ['Low','Medium','High','Confirmed Presumptive'],                    version: 1, used: 1 },
  { id: 'OS-009', name: 'County',                 code: 'LBR_COUNTY',        options: ['Montserrado','Nimba','Bong','Margibi','Lofa','Grand Bassa','Maryland','Grand Gedeh','Sinoe','Grand Cape Mount','Bomi','Gbarpolu','River Gee','Grand Kru','Rivercess'], version: 1, used: 3 },
  { id: 'OS-010', name: 'Patient Type',           code: 'LBR_PT_TYPE',       options: ['New','Relapse','Treatment After Failure','Treatment After LTFU'], version: 1, used: 1 },
];

const PROGRAM_RULES = [
  { id: 'PR-001', name: 'Hide HIV field for non-authorized roles', condition: 'd2:hasValue(#{user_role}) == false', action: 'HIDE_FIELD: hiv_status', status: 'Active', priority: 1, stage: 'All' },
  { id: 'PR-002', name: 'Treatment start ≥ Diagnosis date',        condition: "#{treatment_start_date} >= #{diagnosis_date}", action: 'ERROR_MESSAGE: Treatment cannot start before diagnosis', status: 'Active', priority: 2, stage: 'PS-04' },
  { id: 'PR-003', name: 'Warning: HIV status missing',             condition: "!d2:hasValue(#{hiv_status})", action: 'WARNING: HIV status is not recorded for this patient', status: 'Active', priority: 3, stage: 'PS-01' },
  { id: 'PR-004', name: 'Auto-assign High Risk if ≥3 symptoms',   condition: "#{cough_weeks} > 2 && #{night_sweats} == true && #{weight_loss} == true", action: "ASSIGN: #{risk_level} = 'High'", status: 'Active', priority: 4, stage: 'PS-01' },
  { id: 'PR-005', name: 'Require GeneXpert if smear positive',    condition: "#{smear_result} == 'Positive'", action: 'SHOW_FIELD: genexpert_result; MAKE_MANDATORY: genexpert_result', status: 'Active', priority: 5, stage: 'PS-02' },
  { id: 'PR-006', name: 'Block duplicate TB ID',                  condition: "d2:count(#{tb_registration_id}) > 1", action: 'ERROR_MESSAGE: Duplicate TB ID detected — contact informatics team', status: 'Active', priority: 1, stage: 'Enrollment' },
  { id: 'PR-007', name: 'Auto-complete outcome if Death',         condition: "#{outcome} == 'Died'", action: "ASSIGN: #{outcome_date} = V{event_date}", status: 'Draft', priority: 6, stage: 'PS-08' },
  { id: 'PR-008', name: 'Show Transfer fields only if LTFU',      condition: "#{outcome} == 'Lost to Follow-up'", action: 'SHOW_FIELD: transfer_facility; SHOW_FIELD: last_contact_date', status: 'Active', priority: 5, stage: 'PS-08' },
];

const INDICATORS = [
  { id: 'IN-001', name: 'TB Case Detection Rate',         code: 'LBR_CDR',           numerator: 'Number of new TB cases notified',                      denominator: 'Estimated TB incidence',               type: 'RATE',    annualized: true,  value: 78.4 },
  { id: 'IN-002', name: 'Treatment Success Rate',         code: 'LBR_TSR',           numerator: 'Cured + Treatment Completed',                          denominator: 'Total enrolled cohort',                type: 'RATE',    annualized: false, value: 89.2 },
  { id: 'IN-003', name: 'Lost to Follow-up Rate',         code: 'LBR_LTFU',          numerator: 'LTFU cases',                                           denominator: 'Total enrolled cohort',                type: 'RATE',    annualized: false, value: 5.8  },
  { id: 'IN-004', name: 'HIV/TB Co-infection Rate',       code: 'LBR_HIVTB',         numerator: 'TB patients with HIV+',                                denominator: 'Total TB patients with HIV tested',    type: 'RATE',    annualized: false, value: 12.3 },
  { id: 'IN-005', name: 'GeneXpert Testing Rate',         code: 'LBR_GENEXPERT',     numerator: 'Presumptive TB patients receiving GeneXpert test',     denominator: 'Total presumptive TB patients',        type: 'RATE',    annualized: false, value: 67.1 },
  { id: 'IN-006', name: 'Total New TB Notifications',    code: 'LBR_NOTIF',         numerator: 'All new TB cases confirmed',                           denominator: '',                                     type: 'NUMBER',  annualized: true,  value: 1842 },
  { id: 'IN-007', name: 'Facility-level Sync Rate',       code: 'LBR_SYNC',          numerator: 'Facilities synced within 24h',                         denominator: 'Total active facilities',              type: 'RATE',    annualized: false, value: 93.5 },
  { id: 'IN-008', name: 'Treatment Failure Rate',         code: 'LBR_TX_FAIL',       numerator: 'Failed treatment outcomes',                            denominator: 'Total enrolled cohort',                type: 'RATE',    annualized: false, value: 2.1  },
];

const METADATA_HISTORY = [
  { version: 'v2.4.1', date: '2026-05-10', author: 'David Sumo',    changes: 'Added AI screening risk score field to PS-01; updated Option Set OS-008', status: 'Deployed' },
  { version: 'v2.4.0', date: '2026-04-28', author: 'David Sumo',    changes: 'HIV Status attribute restricted to TB/HIV Officer role; updated sharing settings', status: 'Deployed' },
  { version: 'v2.3.2', date: '2026-04-10', author: 'Samuel Barwon', changes: 'Program Rule PR-006 (duplicate TB ID detection) activated', status: 'Deployed' },
  { version: 'v2.3.1', date: '2026-03-22', author: 'David Sumo',    changes: 'Added County Option Set (OS-009) with all 15 Liberia counties', status: 'Deployed' },
  { version: 'v2.3.0', date: '2026-03-01', author: 'David Sumo',    changes: 'Initial production deployment to Cloud Run. All 8 program stages live.', status: 'Deployed' },
  { version: 'v2.2.9', date: '2026-02-14', author: 'David Sumo',    changes: 'UAT version — all 12 TEI attributes, 31-facility org unit hierarchy', status: 'Archived' },
];

// ─── TAB: Tracker Program Design ─────────────────────────────────────────────
const TrackerDesignTab = () => {
  const [selectedAttr, setSelectedAttr] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tracker Program Design"
        subtitle="TB e-Tracker DHIS2 Tracker Program — Program type, TEI configuration, and enrollment settings."
        action={
          <button onClick={() => (window as any).showToast('Opening DHIS2 Tracker Program Editor…')}
            className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Edit2 className="h-4 w-4" /> Edit Program
          </button>
        }
      />

      {/* Program Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Program Name',      value: 'National TB e-Tracker',     color: 'text-health-blue' },
          { label: 'Program Type',      value: 'Tracker Program',            color: 'text-neutral-800' },
          { label: 'TEI Type',          value: 'Person',                     color: 'text-neutral-800' },
          { label: 'Tracked Attributes',value: '12',                         color: 'text-green-700'   },
          { label: 'Program Stages',    value: '8',                          color: 'text-amber-700'   },
          { label: 'DHIS2 Version',     value: '2.41.3 (Stable)',            color: 'text-neutral-800' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
            <p className="text-xs font-bold text-neutral-400 uppercase">{k.label}</p>
            <p className={`text-xl font-black mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Program Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-200">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2"><Settings className="h-4 w-4 text-health-blue"/> Enrollment Settings</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { setting: 'Allow future enrollment dates', value: 'No', status: 'good' },
              { setting: 'Only enroll once per tracked entity', value: 'Yes', status: 'good' },
              { setting: 'Show incident date', value: 'Yes (Diagnosis Date)', status: 'good' },
              { setting: 'Capture coordinates', value: 'Facility-level', status: 'good' },
              { setting: 'Feature type', value: 'Point (Facility GPS)', status: 'info' },
              { setting: 'Access level', value: 'Protected (Org-unit restricted)', status: 'good' },
              { setting: 'Minimum attributes before search', value: '2', status: 'info' },
            ].map(s => (
              <div key={s.setting} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                <span className="text-sm text-neutral-700">{s.setting}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-neutral-50 border-b border-neutral-200">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2"><Shield className="h-4 w-4 text-health-blue"/> Access & Sharing</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {[
              { role: 'MoH National System Admin', access: 'Data Capture + Data View + Manage', badge: 'Full Access' },
              { role: 'TB/HIV Officer',             access: 'Data Capture + Data View (all TEA)', badge: 'Full Access' },
              { role: 'County TB Officer',          access: 'Data View (county-scoped)',           badge: 'Read Only' },
              { role: 'Facility Data Clerk',        access: 'Data Capture (own facility only)',    badge: 'Restricted' },
              { role: 'Training Coordinator',       access: 'No clinical data access',             badge: 'No Access' },
            ].map(r => (
              <div key={r.role} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-neutral-800">{r.role}</p>
                  <p className="text-xs text-neutral-500">{r.access}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  r.badge === 'Full Access' ? 'bg-green-100 text-green-700 border-green-200' :
                  r.badge === 'Read Only' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  r.badge === 'Restricted' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-red-100 text-red-700 border-red-200'}`}>{r.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEI Attributes Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h3 className="font-bold text-neutral-800">Tracked Entity Attributes (TEA) — {TEI_ATTRIBUTES.length} configured</h3>
          <button onClick={() => (window as any).showToast('Opening TEA editor…')}
            className="text-xs border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-neutral-50">
            <Plus className="h-3.5 w-3.5" /> Add Attribute
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-white">
              <tr>{['ID','Attribute Name','Value Type','Mandatory','Searchable','Unique','Auto-Generated'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {TEI_ATTRIBUTES.map(a => (
                <tr key={a.id} className={`hover:bg-neutral-50 cursor-pointer ${selectedAttr === a.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedAttr(selectedAttr === a.id ? null : a.id)}>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-400">{a.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800">{a.name}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600 font-mono">{a.valueType}</td>
                  <td className="px-4 py-3">{a.mandatory ? <CheckCircle2 className="h-4 w-4 text-green-500"/> : <span className="text-neutral-300">—</span>}</td>
                  <td className="px-4 py-3">{a.searchable ? <CheckCircle2 className="h-4 w-4 text-blue-500"/> : <span className="text-neutral-300">—</span>}</td>
                  <td className="px-4 py-3">{a.unique ? <CheckCircle2 className="h-4 w-4 text-purple-500"/> : <span className="text-neutral-300">—</span>}</td>
                  <td className="px-4 py-3">{a.generated ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-200">Auto</span> : <span className="text-neutral-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Metadata Configuration ─────────────────────────────────────────────
const MetadataTab = () => {
  const [importing, setImporting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const startImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); (window as any).showToast('Metadata import completed — 0 conflicts detected.'); }, 2500);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Metadata Configuration"
        subtitle="Import/export DHIS2 metadata packages, manage version history, and resolve conflicts."
        action={
          <div className="flex gap-2">
            <button onClick={() => (window as any).showToast('Downloading metadata export as JSON…')}
              className="border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-neutral-50">
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <button onClick={startImport} disabled={importing}
              className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 disabled:opacity-60 shadow-sm">
              {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Importing…' : 'Import Metadata'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Version',  val: 'v2.4.1',           color: 'text-health-blue', bg: 'bg-blue-50'    },
          { label: 'Last Import',      val: '2026-05-10',        color: 'text-neutral-700', bg: 'bg-neutral-50' },
          { label: 'Conflicts',        val: '0',                 color: 'text-green-700',   bg: 'bg-green-50'   },
          { label: 'Import Status',    val: 'Clean',             color: 'text-green-700',   bg: 'bg-green-50'   },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Metadata Components */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <h3 className="font-bold text-neutral-800">Metadata Components</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {[
            { icon: Database,   name: 'Tracker Programs',           count: 1,   status: 'Synced',   lastSync: '2026-05-10' },
            { icon: FileCode2,  name: 'Tracked Entity Attributes',  count: 12,  status: 'Synced',   lastSync: '2026-05-10' },
            { icon: Settings,   name: 'Program Stages',             count: 8,   status: 'Synced',   lastSync: '2026-05-10' },
            { icon: Code2,      name: 'Data Elements',              count: 66,  status: 'Synced',   lastSync: '2026-05-10' },
            { icon: GitBranch,  name: 'Option Sets',                count: 10,  status: 'Synced',   lastSync: '2026-05-10' },
            { icon: Shield,     name: 'Program Rules',              count: 8,   status: 'Synced',   lastSync: '2026-05-10' },
            { icon: Activity,   name: 'Indicators',                 count: 8,   status: 'Synced',   lastSync: '2026-05-10' },
            { icon: Settings,   name: 'Organisation Units (Facilities)', count: 31, status: 'Synced', lastSync: '2026-05-10' },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.name} className="px-5 py-3 flex items-center gap-4 hover:bg-neutral-50">
                <Icon className="h-5 w-5 text-health-blue flex-shrink-0" />
                <span className="flex-1 text-sm font-bold text-neutral-700">{m.name}</span>
                <span className="text-xs text-neutral-500 font-mono">{m.count} object{m.count !== 1 ? 's' : ''}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">{m.status}</span>
                <span className="text-xs text-neutral-400 w-24 text-right">{m.lastSync}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center cursor-pointer hover:bg-neutral-100"
          onClick={() => setShowHistory(!showHistory)}>
          <h3 className="font-bold text-neutral-800">Version History</h3>
          {showHistory ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
        </div>
        {showHistory && (
          <div className="divide-y divide-neutral-100">
            {METADATA_HISTORY.map(h => (
              <div key={h.version} className="px-5 py-3 flex items-start gap-4 hover:bg-neutral-50">
                <span className="text-xs font-black text-health-blue w-14 flex-shrink-0">{h.version}</span>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">{h.changes}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{h.author} · {h.date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${h.status === 'Deployed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>{h.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// -- TAB: Program Stages & Data Elements ----------------------------------------
const StagesTab = () => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [stages, setStages] = useState(PROGRAM_STAGES);
  const [showAddStage, setShowAddStage] = useState(false);
  const [newStage, setNewStage] = useState({ name: '', type: 'Screening', days: 0, elements: 0, repeatable: false });

  const stageTypeColor: Record<string, string> = {
    Screening:  'bg-purple-100 text-purple-700 border-purple-200',
    Diagnostic: 'bg-blue-100 text-blue-700 border-blue-200',
    Clinical:   'bg-cyan-100 text-cyan-700 border-cyan-200',
    Treatment:  'bg-green-100 text-green-700 border-green-200',
    'Follow-up':'bg-amber-100 text-amber-700 border-amber-200',
    Lab:        'bg-rose-100 text-rose-700 border-rose-200',
    Outcome:    'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  const saveStageEdit = () => {
    setStages(prev => prev.map(s => s.id === editingStage.id ? editingStage : s));
    setEditingStage(null);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Program Stages & Data Elements"
        subtitle={"TB treatment journey from screening to outcome — " + stages.length + " stages, 66 data elements."}
        action={
          <button onClick={() => setShowAddStage(true)}
            className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Plus className="h-4 w-4" /> Add Stage
          </button>
        }
      />

      {stages.map((stage, idx) => (
        <div key={stage.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50"
            onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}>
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-health-blue text-white flex items-center justify-center font-black text-sm">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-800 text-sm">{stage.name}</span>
                <Pill label={stage.type} color={stageTypeColor[stage.type] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'} />
                {stage.repeatable && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 font-bold">Repeatable</span>}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{stage.elements} data elements · Day {stage.days} in cascade</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={e => { e.stopPropagation(); setEditingStage({...stage}); }}
                className="text-xs border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-neutral-50">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              {expandedStage === stage.id ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
            </div>
          </div>

          {expandedStage === stage.id && (
            <div className="border-t border-neutral-100 p-4 bg-neutral-50">
              {STAGE_ELEMENTS[stage.id] ? (
                <table className="min-w-full">
                  <thead>
                    <tr>{['Data Element ID','Element Name','Value Type','Mandatory','Section'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {STAGE_ELEMENTS[stage.id].map(de => (
                      <tr key={de.id} className="bg-white hover:bg-neutral-50">
                        <td className="px-3 py-2 text-xs font-mono text-neutral-400">{de.id}</td>
                        <td className="px-3 py-2 text-sm font-bold text-neutral-800">{de.name}</td>
                        <td className="px-3 py-2 text-xs font-mono text-neutral-500">{de.valueType}</td>
                        <td className="px-3 py-2">{de.mandatory ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <span className="text-neutral-300">-</span>}</td>
                        <td className="px-3 py-2"><span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{de.section}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-6 text-center text-neutral-400 text-sm">
                  <p className="mb-2">{stage.elements} data elements configured for this stage.</p>
                  <p className="text-xs text-neutral-300">Detailed element list available in the DHIS2 Maintenance app.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Stage Edit Modal */}
      {editingStage && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold">Editing Stage · {editingStage.id}</p>
                <h3 className="text-lg font-black">{editingStage.name}</h3>
              </div>
              <button onClick={() => setEditingStage(null)} className="text-blue-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Stage Name</label>
                <input value={editingStage.name} onChange={e => setEditingStage({...editingStage, name: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Stage Type</label>
                  <select value={editingStage.type} onChange={e => setEditingStage({...editingStage, type: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
                    {['Screening','Diagnostic','Clinical','Treatment','Follow-up','Lab','Outcome'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Day in Cascade</label>
                  <input type="number" value={editingStage.days} onChange={e => setEditingStage({...editingStage, days: Number(e.target.value)})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <input type="checkbox" id="rep-stage" checked={editingStage.repeatable} onChange={e => setEditingStage({...editingStage, repeatable: e.target.checked})}
                  className="h-4 w-4 accent-health-blue" />
                <label htmlFor="rep-stage" className="text-sm font-bold text-neutral-700">Repeatable stage (allows multiple events per enrollment)</label>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                <strong>DHIS2 Note:</strong> Data elements within each stage are managed via DHIS2 Maintenance. Changes here update the display configuration only.
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={saveStageEdit} className="flex-1 bg-health-blue text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-800">Save Changes</button>
              <button onClick={() => setEditingStage(null)} className="flex-1 border border-neutral-200 text-neutral-600 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStage && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-green-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-black">Add New Program Stage</h3>
              <button onClick={() => setShowAddStage(false)} className="text-green-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Stage Name *</label>
                <input value={newStage.name} onChange={e => setNewStage({...newStage, name: e.target.value})} placeholder="e.g. HIV Viral Load Monitoring"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                  <select value={newStage.type} onChange={e => setNewStage({...newStage, type: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
                    {['Screening','Diagnostic','Clinical','Treatment','Follow-up','Lab','Outcome'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Day in Cascade</label>
                  <input type="number" value={newStage.days} onChange={e => setNewStage({...newStage, days: Number(e.target.value)})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="new-rep-stage" checked={newStage.repeatable} onChange={e => setNewStage({...newStage, repeatable: e.target.checked})}
                  className="h-4 w-4 accent-green-600" />
                <label htmlFor="new-rep-stage" className="text-sm font-medium text-neutral-700">Repeatable stage</label>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => {
                if (!newStage.name) return;
                const id = 'PS-' + String(stages.length + 1).padStart(2,'0');
                setStages(prev => [...prev, { id, ...newStage }]);
                setNewStage({ name: '', type: 'Screening', days: 0, elements: 0, repeatable: false });
                setShowAddStage(false);
              }} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700">Add Stage</button>
              <button onClick={() => setShowAddStage(false)} className="flex-1 border border-neutral-200 text-neutral-600 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -- TAB: Option Sets ──────────────────────────────────────────────────────────
const OptionSetsTab = () => {
  const [expanded, setExpanded] = useState<string | null>('OS-001');
  const [search, setSearch] = useState('');
  const [optionSets, setOptionSets] = useState(OPTION_SETS);
  const [editingOS, setEditingOS] = useState<any>(null);
  const [showNewOS, setShowNewOS] = useState(false);
  const [newOSName, setNewOSName] = useState('');
  const [newOSCode, setNewOSCode] = useState('');

  const filtered = optionSets.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()));

  const saveOSEdit = () => {
    setOptionSets(prev => prev.map(o => o.id === editingOS.id ? editingOS : o));
    setEditingOS(null);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Option Sets"
        subtitle="Controlled vocabulary definitions ensuring data quality across all TB forms."
        action={
          <button onClick={() => setShowNewOS(true)}
            className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Plus className="h-4 w-4" /> New Option Set
          </button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search option sets..."
            className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-full" />
        </div>
        <span className="text-sm text-neutral-400 ml-auto self-center">{filtered.length} of {optionSets.length} option sets</span>
      </div>

      <div className="space-y-3">
        {filtered.map(os => (
          <div key={os.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50"
              onClick={() => setExpanded(expanded === os.id ? null : os.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800">{os.name}</span>
                  <span className="text-xs font-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{os.code}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{os.options.length} options · v{os.version} · Used in {os.used} form{os.used !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); setEditingOS({...os, options: [...os.options]}); }}
                  className="text-xs border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-neutral-50">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                {expanded === os.id ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
              </div>
            </div>
            {expanded === os.id && (
              <div className="border-t border-neutral-100 bg-neutral-50 p-4">
                <div className="flex flex-wrap gap-2">
                  {os.options.map((opt: string, i: number) => (
                    <div key={i} className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm group hover:border-health-blue transition-colors">
                      <span className="text-xs font-bold text-neutral-400 w-5">{i + 1}</span>
                      <span className="text-sm text-neutral-700 font-medium">{opt}</span>
                      <button onClick={() => {
                        const name = prompt('Edit option:', opt);
                        if (!name) return;
                        setOptionSets(prev => prev.map(o => {
                          if (o.id !== os.id) return o;
                          const opts = [...o.options]; opts[i] = name; return {...o, options: opts};
                        }));
                      }} className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-health-blue transition-all ml-1"><Edit2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const name = prompt('Enter new option name:');
                    if (!name) return;
                    setOptionSets(prev => prev.map(o => o.id === os.id ? {...o, options: [...o.options, name]} : o));
                  }} className="border-2 border-dashed border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:border-health-blue hover:text-health-blue flex items-center gap-1 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add Option
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Option Set Modal */}
      {editingOS && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center flex-shrink-0">
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold">Option Set · {editingOS.code}</p>
                <h3 className="text-lg font-black">{editingOS.name}</h3>
              </div>
              <button onClick={() => setEditingOS(null)} className="text-blue-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Display Name</label>
                  <input value={editingOS.name} onChange={e => setEditingOS({...editingOS, name: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">DHIS2 Code</label>
                  <input value={editingOS.code} onChange={e => setEditingOS({...editingOS, code: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">Options ({editingOS.options.length})</label>
                  <button onClick={() => setEditingOS({...editingOS, options: [...editingOS.options, '']})}
                    className="text-xs text-health-blue font-bold flex items-center gap-1 hover:underline">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editingOS.options.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-400 w-6 text-right">{i + 1}.</span>
                      <input value={opt} onChange={e => {
                        const opts = [...editingOS.options]; opts[i] = e.target.value;
                        setEditingOS({...editingOS, options: opts});
                      }} className="flex-1 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
                      <button onClick={() => setEditingOS({...editingOS, options: editingOS.options.filter((_: any, j: number) => j !== i)})}
                        className="text-neutral-300 hover:text-red-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
              <button onClick={saveOSEdit} className="flex-1 bg-health-blue text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-800">Save Changes</button>
              <button onClick={() => setEditingOS(null)} className="flex-1 border border-neutral-200 text-neutral-600 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Option Set Modal */}
      {showNewOS && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-black">New Option Set</h3>
              <button onClick={() => setShowNewOS(false)} className="text-green-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Name *</label>
                <input value={newOSName} onChange={e => setNewOSName(e.target.value)} placeholder="e.g. Patient Category"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">DHIS2 Code *</label>
                <input value={newOSCode} onChange={e => setNewOSCode(e.target.value)} placeholder="e.g. LBR_PAT_CATEGORY"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => {
                if (!newOSName || !newOSCode) return;
                const id = 'OS-' + String(optionSets.length + 1).padStart(3,'0');
                const created = { id, name: newOSName, code: newOSCode, options: [] as string[], version: 1, used: 0 };
                setOptionSets(prev => [...prev, created]);
                setNewOSName(''); setNewOSCode(''); setShowNewOS(false);
                setEditingOS({...created});
              }} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700">Create & Add Options</button>
              <button onClick={() => setShowNewOS(false)} className="flex-1 border border-neutral-200 text-neutral-600 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: Program Rules & Validation ─────────────────────────────────────────
const RulesTab = () => {
  const [rules, setRules] = useState(PROGRAM_RULES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = rules
    .filter(r => filter === 'All' || r.status === filter)
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Draft' : 'Active' } : r));
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Program Rules & Validation"
        subtitle="Automated DHIS2 rules enforcing clinical logic, mandatory fields, and data quality."
        action={
          <button onClick={() => (window as any).showToast('Opening Program Rule Builder…')}
            className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Plus className="h-4 w-4" /> New Rule
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Active Rules',  val: rules.filter(r=>r.status==='Active').length, color:'text-green-700',bg:'bg-green-50'},
          { label:'Draft Rules',   val: rules.filter(r=>r.status==='Draft').length,  color:'text-amber-700',bg:'bg-amber-50'},
          { label:'Total Rules',   val: rules.length,                                color:'text-health-blue',bg:'bg-blue-50'},
        ].map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-xs font-bold text-neutral-500 uppercase">{k.label}</p>
            <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
            className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none w-52" />
        </div>
        {['All','Active','Draft'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter===s?'bg-health-blue text-white':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(rule => (
          <div key={rule.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 mt-0.5 ${rule.status==='Active'?'text-green-500':'text-amber-400'}`}>
                {rule.status === 'Active' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-400">{rule.id}</span>
                  <Pill label={rule.status} color={rule.status==='Active'?'bg-green-100 text-green-700 border-green-200':'bg-amber-100 text-amber-700 border-amber-200'} />
                  <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{rule.stage}</span>
                  <span className="text-xs text-neutral-400">Priority {rule.priority}</span>
                </div>
                <p className="font-bold text-neutral-800 mt-1">{rule.name}</p>
                <div className="mt-2 space-y-1.5">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-neutral-400 mb-0.5">CONDITION</p>
                    <p className="text-xs font-mono text-neutral-700">{rule.condition}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-blue-400 mb-0.5">ACTION</p>
                    <p className="text-xs font-mono text-blue-700">{rule.action}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleStatus(rule.id)}
                  className="text-xs border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50">
                  {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -- TAB: Indicators ──────────────────────────────────────────────────────────
const IndicatorsTab = () => {
  const [filter, setFilter] = useState('All');
  const [indicators, setIndicators] = useState(INDICATORS);
  const [editingInd, setEditingInd] = useState<any>(null);
  const [showNewInd, setShowNewInd] = useState(false);
  const [newInd, setNewInd] = useState({ name:'', code:'', numerator:'', denominator:'', type:'RATE', annualized:false, value:0 });

  const filtered = indicators.filter(i => filter === 'All' || i.type === filter);

  const saveIndEdit = () => {
    setIndicators(prev => prev.map(i => i.id === editingInd.id ? editingInd : i));
    setEditingInd(null);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Indicators"
        subtitle="Calculated metrics derived from DHIS2 data elements - used in national dashboards and WHO reports."
        action={
          <button onClick={() => setShowNewInd(true)}
            className="bg-health-blue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-800 shadow-sm">
            <Plus className="h-4 w-4" /> New Indicator
          </button>
        }
      />

      <div className="flex gap-2 items-center flex-wrap">
        {['All','RATE','NUMBER'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter===f?'bg-health-blue text-white':'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{f}</button>
        ))}
        <span className="ml-auto text-xs text-neutral-400">{filtered.length} indicator{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>{['ID','Indicator Name','Code','Numerator','Denominator','Type','Annualized','Current Value','Action'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-neutral-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(ind => (
                <tr key={ind.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => setEditingInd({...ind})}>
                  <td className="px-4 py-3 text-xs font-bold text-neutral-400">{ind.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-neutral-800 max-w-[180px]">{ind.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-neutral-500">{ind.code}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600 max-w-[180px]">{ind.numerator}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500 max-w-[140px]">{ind.denominator || '-'}</td>
                  <td className="px-4 py-3"><Pill label={ind.type} color={ind.type==='RATE'?'bg-blue-100 text-blue-700 border-blue-200':'bg-purple-100 text-purple-700 border-purple-200'} /></td>
                  <td className="px-4 py-3">{ind.annualized ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <span className="text-neutral-300">-</span>}</td>
                  <td className="px-4 py-3 text-sm font-black text-health-blue">{ind.type === 'RATE' ? `${ind.value}%` : ind.value.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); setEditingInd({...ind}); }}
                      className="text-xs border border-neutral-200 text-neutral-600 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-neutral-50 whitespace-nowrap">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicator Edit Modal */}
      {editingInd && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
            <div className="bg-health-blue text-white p-5 rounded-t-2xl flex justify-between items-center flex-shrink-0">
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold">Editing Indicator · {editingInd.id}</p>
                <h3 className="text-lg font-black">{editingInd.name}</h3>
              </div>
              <button onClick={() => setEditingInd(null)} className="text-blue-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Indicator Name *</label>
                <input value={editingInd.name} onChange={e => setEditingInd({...editingInd, name: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">DHIS2 Code</label>
                  <input value={editingInd.code} onChange={e => setEditingInd({...editingInd, code: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                  <select value={editingInd.type} onChange={e => setEditingInd({...editingInd, type: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option>RATE</option><option>NUMBER</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Numerator *</label>
                <textarea rows={2} value={editingInd.numerator} onChange={e => setEditingInd({...editingInd, numerator: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Denominator</label>
                <textarea rows={2} value={editingInd.denominator} onChange={e => setEditingInd({...editingInd, denominator: e.target.value})}
                  placeholder="Leave blank for NUMBER type indicators"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Current Value</label>
                  <input type="number" step="0.1" value={editingInd.value} onChange={e => setEditingInd({...editingInd, value: Number(e.target.value)})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-health-blue" />
                </div>
                <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-100 self-end">
                  <input type="checkbox" id="annualized-chk" checked={editingInd.annualized} onChange={e => setEditingInd({...editingInd, annualized: e.target.checked})}
                    className="h-4 w-4 accent-health-blue" />
                  <label htmlFor="annualized-chk" className="text-sm font-bold text-neutral-700">Annualized</label>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                <strong>DHIS2 Tip:</strong> Numerator/denominator expressions reference DHIS2 data element UIDs. Changes here update display metadata and the current value shown on dashboards.
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 flex-shrink-0">
              <button onClick={saveIndEdit} className="flex-1 bg-health-blue text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-800">Save Changes</button>
              <button onClick={() => {
                if (window.confirm('Delete this indicator? This cannot be undone.')) {
                  setIndicators(prev => prev.filter(i => i.id !== editingInd.id));
                  setEditingInd(null);
                }
              }} className="border border-red-200 text-red-500 py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-red-50">Delete</button>
              <button onClick={() => setEditingInd(null)} className="border border-neutral-200 text-neutral-600 py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Indicator Modal */}
      {showNewInd && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="bg-green-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-black">New Indicator</h3>
              <button onClick={() => setShowNewInd(false)} className="text-green-200 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Indicator Name *</label>
                <input value={newInd.name} onChange={e => setNewInd({...newInd, name: e.target.value})} placeholder="e.g. Smear Conversion Rate"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">DHIS2 Code *</label>
                  <input value={newInd.code} onChange={e => setNewInd({...newInd, code: e.target.value})} placeholder="LBR_SMEAR_CVR"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                  <select value={newInd.type} onChange={e => setNewInd({...newInd, type: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option>RATE</option><option>NUMBER</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Numerator *</label>
                <input value={newInd.numerator} onChange={e => setNewInd({...newInd, numerator: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Denominator</label>
                <input value={newInd.denominator} onChange={e => setNewInd({...newInd, denominator: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="new-ann" checked={newInd.annualized} onChange={e => setNewInd({...newInd, annualized: e.target.checked})}
                  className="h-4 w-4 accent-green-600" />
                <label htmlFor="new-ann" className="text-sm font-medium text-neutral-700">Annualized indicator</label>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => {
                if (!newInd.name || !newInd.code) return;
                const id = 'IN-' + String(indicators.length + 1).padStart(3,'0');
                setIndicators(prev => [...prev, { id, ...newInd }]);
                setNewInd({ name:'', code:'', numerator:'', denominator:'', type:'RATE', annualized:false, value:0 });
                setShowNewInd(false);
              }} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700">Create Indicator</button>
              <button onClick={() => setShowNewInd(false)} className="flex-1 border border-neutral-200 text-neutral-600 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────
export const DHIS2Dashboard = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'tracker_design')  return <TrackerDesignTab />;
  if (activeTab === 'metadata')        return <MetadataTab />;
  if (activeTab === 'stages_elements') return <StagesTab />;
  if (activeTab === 'option_sets')     return <OptionSetsTab />;
  if (activeTab === 'rules')           return <RulesTab />;
  if (activeTab === 'indicators')      return <IndicatorsTab />;
  return <TrackerDesignTab />;
};
