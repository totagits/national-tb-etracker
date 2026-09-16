/**
 * DHIS2 Live API Connection Engine & Local Real-Time Pipeline
 * 
 * Provides dual-mode data management:
 * 1. Live DHIS2 Mode: Direct REST API communication with MoH DHIS2 instance (/api/v41).
 * 2. Secure Demo/Training Mode: Persistent local data storage (localStorage/IndexedDB) with zero PII exposure.
 */

export interface DHIS2Config {
  mode: 'live' | 'demo';
  serverUrl: string;
  authType: 'basic' | 'pat';
  username?: string;
  password?: string;
  token?: string;
  orgUnitId: string;
  orgUnitName: string;
  lastTested?: string;
  lastStatus?: 'connected' | 'error' | 'untested';
  systemVersion?: string;
  systemName?: string;
}

export interface EncounterRecord {
  id: string;
  stage: string; // e.g. 'PS-01 Enrollment' | 'PS-02 HTS' | 'PS-03 Screening' | 'PS-04 Initiation' | 'PS-05 Follow-Up M1' | 'PS-05 Follow-Up M2' | 'PS-05 Follow-Up M3' | 'PS-05 Follow-Up M5' | 'PS-07 Treatment Outcome'
  date: string;
  weightKg?: number;
  sputumSmear?: 'Positive' | 'Negative' | 'Not Done' | 'Pending';
  adherenceRate?: number; // e.g. 95%
  sideEffects?: string;
  notes: string;
  provider: string;
  dotType?: 'Facility DOT' | 'Community DOT (CHW)' | 'Digital Adherence (99DOTS)';
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  sex: string;
  facility: string;
  status: string; // 'On Treatment' | 'Presumptive' | 'Cured' | 'Completed' | 'Lost to Follow-up' | 'Treatment Failed' | 'Died'
  hivStatus?: string;
  regimen?: string;
  enrolledDate?: string;
  isLive?: boolean;

  // Dual-Registration & Geospatial fields
  regType?: 'Facility Point-of-Care' | 'Resident Geospatial';
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  county?: string;
  district?: string;
  clan?: string;
  community?: string;
  landmark?: string;
  phone?: string;
  chwName?: string;
  chwPhone?: string;
  chwPost?: string;
  householdContacts?: number;
  contactsScreened?: number;
  under5Contacts?: number;

  // Defaulter & Appointment Tracking
  lastVisitDate?: string;
  nextAppointmentDate?: string;
  appointmentStatus?: 'On Schedule' | 'Overdue' | 'Defaulter Risk' | 'Completed';
  daysOverdue?: number;

  // Longitudinal encounters
  encounters?: EncounterRecord[];

  // Facility Point-of-Care / Clinical Triage fields
  facilityDepartment?: string;
  facilityCardNumber?: string;
  admissionType?: string;
  attendingClinician?: string;
  clinicianCadre?: string;
  triagePriority?: string;
  triageTemp?: number;
  triageBp?: string;
  triagePulse?: number;
  triageSpo2?: number;
  reasonNoAddress?: string;
}

const CONFIG_STORAGE_KEY = 'tb_etracker_dhis2_config';
const PATIENTS_STORAGE_KEY = 'tb_etracker_patients_data';

export const INITIAL_DEMO_PATIENTS: PatientRecord[] = [
  {
    id: 'TB-1042',
    name: 'John Doe',
    age: 45,
    sex: 'M',
    facility: 'JFK Medical Center (Montserrado)',
    status: 'On Treatment',
    hivStatus: 'Negative',
    regimen: '1st Line (2HRZE/4HR)',
    enrolledDate: '2026-01-25',
    regType: 'Resident Geospatial',
    lat: 6.2954,
    lng: -10.7812,
    accuracyMeters: 4,
    county: 'Montserrado',
    district: 'Sinkor',
    clan: 'Oldest Congo Town',
    community: '12th Street Sinkor',
    landmark: 'Behind the polyclinic near the football field',
    phone: '+231-77-512-3401',
    chwName: 'Comfort Mulbah',
    chwPhone: '+231-88-601-9922',
    chwPost: 'Sinkor Community Health Post',
    householdContacts: 4,
    contactsScreened: 4,
    under5Contacts: 1,
    lastVisitDate: '2026-05-15',
    nextAppointmentDate: '2026-06-15',
    appointmentStatus: 'On Schedule',
    daysOverdue: 0,
    encounters: [
      { id: 'ENC-001', stage: 'PS-01 Enrollment & PS-04 Initiation', date: '2026-01-25', weightKg: 54, sputumSmear: 'Positive', adherenceRate: 100, notes: 'Initiated on 2HRZE/4HR. GeneXpert MTB detected, RIF sensitive.', provider: 'Dr. T. Kollie', dotType: 'Facility DOT' },
      { id: 'ENC-002', stage: 'PS-05 Follow-Up M1', date: '2026-02-25', weightKg: 56, sputumSmear: 'Positive', adherenceRate: 96, notes: 'Patient tolerating medication well. Mild nausea resolved.', provider: 'Nurse F. Sirleaf', dotType: 'Community DOT (CHW)' },
      { id: 'ENC-003', stage: 'PS-05 Follow-Up M2 (Smear Conversion)', date: '2026-03-25', weightKg: 58, sputumSmear: 'Negative', adherenceRate: 98, notes: 'Bacteriological conversion confirmed! Smear negative at 2 months. Transitioned to continuation phase.', provider: 'Dr. T. Kollie', dotType: 'Community DOT (CHW)' },
      { id: 'ENC-004', stage: 'PS-05 Follow-Up M3', date: '2026-04-25', weightKg: 60, sputumSmear: 'Not Done', adherenceRate: 100, notes: 'Continuing daily 4HR regimen. No adverse effects reported.', provider: 'CHW Comfort Mulbah', dotType: 'Community DOT (CHW)' }
    ]
  },
  {
    id: 'TB-1043',
    name: 'Jane Smith',
    age: 32,
    sex: 'F',
    facility: 'Redemption Hospital (Montserrado)',
    status: 'On Treatment',
    hivStatus: 'Positive',
    regimen: '1st Line (2HRZE/4HR)',
    enrolledDate: '2026-02-10',
    regType: 'Resident Geospatial',
    lat: 6.3268,
    lng: -10.8122,
    accuracyMeters: 5,
    county: 'Montserrado',
    district: 'Bushrod Island',
    clan: 'West Point Borough',
    community: 'West Point Point Beach Zone',
    landmark: 'Opposite the cold storage building, brown zinc roof house',
    phone: '+231-77-622-4911',
    chwName: 'Samson Kpoto',
    chwPhone: '+231-88-711-4455',
    chwPost: 'West Point Community Clinic',
    householdContacts: 5,
    contactsScreened: 3,
    under5Contacts: 2,
    lastVisitDate: '2026-04-10',
    nextAppointmentDate: '2026-05-10',
    appointmentStatus: 'Defaulter Risk',
    daysOverdue: 14,
    encounters: [
      { id: 'ENC-010', stage: 'PS-01 Enrollment & PS-02 HTS', date: '2026-02-10', weightKg: 46, sputumSmear: 'Positive', adherenceRate: 100, notes: 'Enrolled in TB/HIV joint cascade. Started on CPT and TB treatment.', provider: 'Clinician P. Wleh', dotType: 'Facility DOT' },
      { id: 'ENC-011', stage: 'PS-05 Follow-Up M1', date: '2026-03-12', weightKg: 47, sputumSmear: 'Positive', adherenceRate: 85, notes: 'Adherence suboptimal due to transportation challenges to Redemption Hospital. Referred to CHW.', provider: 'Nurse K. Tokpah', dotType: 'Community DOT (CHW)' }
    ]
  },
  {
    id: 'TB-1044',
    name: 'Michael Johnson',
    age: 28,
    sex: 'M',
    facility: 'C.H. Rennie Hospital (Margibi)',
    status: 'Cured',
    hivStatus: 'Negative',
    regimen: '1st Line (2HRZE/4HR)',
    enrolledDate: '2025-08-14',
    regType: 'Resident Geospatial',
    lat: 6.5311,
    lng: -10.3536,
    accuracyMeters: 6,
    county: 'Margibi',
    district: 'Kakata',
    clan: 'Kakata City',
    community: 'Bomi Hill Community',
    landmark: 'Behind Kakata Central High School near the breadfruit tree',
    phone: '+231-77-809-5112',
    chwName: 'Ibrahim Kollie',
    chwPhone: '+231-88-512-8877',
    chwPost: 'Kakata Health Post',
    householdContacts: 3,
    contactsScreened: 3,
    under5Contacts: 0,
    lastVisitDate: '2026-02-14',
    nextAppointmentDate: '2026-02-14',
    appointmentStatus: 'Completed',
    daysOverdue: 0,
    encounters: [
      { id: 'ENC-020', stage: 'PS-01 Enrollment', date: '2025-08-14', weightKg: 52, sputumSmear: 'Positive', adherenceRate: 100, notes: 'Presumptive sputum positive, initiated on Category 1.', provider: 'Dr. M. Sando', dotType: 'Facility DOT' },
      { id: 'ENC-021', stage: 'PS-05 Follow-Up M2', date: '2025-10-15', weightKg: 56, sputumSmear: 'Negative', adherenceRate: 100, notes: '2-month conversion achieved.', provider: 'Nurse D. Sumo', dotType: 'Community DOT (CHW)' },
      { id: 'ENC-022', stage: 'PS-05 Follow-Up M5', date: '2026-01-14', weightKg: 61, sputumSmear: 'Negative', adherenceRate: 100, notes: 'Pre-completion smear negative.', provider: 'Nurse D. Sumo', dotType: 'Community DOT (CHW)' },
      { id: 'ENC-023', stage: 'PS-07 Treatment Outcome: Cured', date: '2026-02-14', weightKg: 63, sputumSmear: 'Negative', adherenceRate: 100, notes: 'End of treatment smear confirmed negative. Patient declared CURED according to WHO standards.', provider: 'Dr. M. Sando', dotType: 'Facility DOT' }
    ]
  },
  {
    id: 'TB-1045',
    name: 'Sarah Williams',
    age: 51,
    sex: 'F',
    facility: 'Phebe Hospital (Bong)',
    status: 'Lost to Follow-up',
    hivStatus: 'Unknown',
    regimen: '1st Line (2HRZE/4HR)',
    enrolledDate: '2025-11-03',
    regType: 'Resident Geospatial',
    lat: 7.0039,
    lng: -9.5840,
    accuracyMeters: 10,
    county: 'Bong',
    district: 'Suakoko',
    clan: 'Suakoko Clan',
    community: 'Phebe Airstrip Village',
    landmark: 'Beside the roadside palm wine shed, 200m from Methodist chapel',
    phone: '+231-77-440-2918',
    chwName: 'David Sumo',
    chwPhone: '+231-88-422-1009',
    chwPost: 'Phebe Outreach Post',
    householdContacts: 6,
    contactsScreened: 2,
    under5Contacts: 3,
    lastVisitDate: '2025-12-05',
    nextAppointmentDate: '2026-01-05',
    appointmentStatus: 'Defaulter Risk',
    daysOverdue: 68,
    encounters: [
      { id: 'ENC-030', stage: 'PS-01 Enrollment', date: '2025-11-03', weightKg: 48, sputumSmear: 'Positive', adherenceRate: 100, notes: 'Diagnosed with pulmonary TB. Refused HIV test initially.', provider: 'Nurse N. Wiah', dotType: 'Facility DOT' },
      { id: 'ENC-031', stage: 'PS-05 Follow-Up M1', date: '2025-12-05', weightKg: 49, sputumSmear: 'Positive', adherenceRate: 70, notes: 'Missed several doses. Complained of dizziness. Home visit scheduled.', provider: 'CHW David Sumo', dotType: 'Community DOT (CHW)' }
    ]
  },
  {
    id: 'TB-1046',
    name: 'David Brown',
    age: 39,
    sex: 'M',
    facility: 'Jackson F. Doe Hospital (Nimba)',
    status: 'On Treatment',
    hivStatus: 'Positive',
    regimen: '2nd Line (MDR-TB)',
    enrolledDate: '2026-03-01',
    regType: 'Resident Geospatial',
    lat: 7.2344,
    lng: -8.9814,
    accuracyMeters: 4,
    county: 'Nimba',
    district: 'Tappita',
    clan: 'Tappita Township',
    community: 'Tappita Central Market Road',
    landmark: 'Adjacent to Tappita Community Radio antenna',
    phone: '+231-77-992-1844',
    chwName: 'Esther Flomo',
    chwPhone: '+231-88-773-6621',
    chwPost: 'Tappita Health Post',
    householdContacts: 4,
    contactsScreened: 4,
    under5Contacts: 1,
    lastVisitDate: '2026-05-01',
    nextAppointmentDate: '2026-06-01',
    appointmentStatus: 'On Schedule',
    daysOverdue: 0,
    encounters: [
      { id: 'ENC-040', stage: 'PS-01 & PS-03 GeneXpert (MDR-TB)', date: '2026-03-01', weightKg: 50, sputumSmear: 'Positive', adherenceRate: 100, notes: 'GeneXpert MTB DETECTED, Rifampicin Resistance DETECTED. Immediate MDR-TB second-line bedaquiline-containing regimen initiated.', provider: 'Dr. E. Flomo', dotType: 'Facility DOT' },
      { id: 'ENC-041', stage: 'PS-05 Follow-Up M1 (MDR-TB)', date: '2026-04-01', weightKg: 52, sputumSmear: 'Positive', adherenceRate: 98, notes: 'ECG normal (QTcF < 450ms). Monthly audiometry normal. Excellent adherence.', provider: 'Dr. E. Flomo', dotType: 'Community DOT (CHW)' },
      { id: 'ENC-042', stage: 'PS-05 Follow-Up M2 (MDR-TB)', date: '2026-05-01', weightKg: 55, sputumSmear: 'Negative', adherenceRate: 100, notes: 'Month 2 culture conversion pending; smear converted negative. ART continued.', provider: 'Dr. E. Flomo', dotType: 'Community DOT (CHW)' }
    ]
  },
  {
    id: 'TB-1047',
    name: 'Fatu Kamara',
    age: 24,
    sex: 'F',
    facility: 'Redemption Hospital (Montserrado)',
    status: 'On Treatment',
    hivStatus: 'Negative',
    regimen: '1st Line (2HRZE/4HR)',
    enrolledDate: '2026-04-12',
    regType: 'Resident Geospatial',
    lat: 6.3315,
    lng: -10.7950,
    accuracyMeters: 4,
    county: 'Montserrado',
    district: 'Bushrod Island',
    clan: 'Clara Town',
    community: 'St. Paul Bridge Junction',
    landmark: 'Opposite the petroleum depot, near the canoe landing',
    phone: '+231-77-310-7766',
    chwName: 'Samson Kpoto',
    chwPhone: '+231-88-711-4455',
    chwPost: 'Clara Town Clinic',
    householdContacts: 3,
    contactsScreened: 3,
    under5Contacts: 1,
    lastVisitDate: '2026-05-12',
    nextAppointmentDate: '2026-05-19',
    appointmentStatus: 'Overdue',
    daysOverdue: 5,
    encounters: [
      { id: 'ENC-050', stage: 'PS-01 Enrollment & PS-04 Initiation', date: '2026-04-12', weightKg: 51, sputumSmear: 'Positive', adherenceRate: 100, notes: 'Presumptive sputum GeneXpert positive. Enrolled into DOT.', provider: 'Nurse F. Sirleaf', dotType: 'Facility DOT' },
      { id: 'ENC-051', stage: 'PS-05 Follow-Up M1', date: '2026-05-12', weightKg: 52, sputumSmear: 'Positive', adherenceRate: 90, notes: 'Finished month 1 blister packs. Due for refill in 7 days.', provider: 'CHW Samson Kpoto', dotType: 'Community DOT (CHW)' }
    ]
  }
];

export const DEFAULT_CONFIG: DHIS2Config = {
  mode: 'demo',
  serverUrl: 'https://dhis2.moh.gov.lr/api',
  authType: 'basic',
  username: 'moh_tb_officer',
  password: '••••••••',
  orgUnitId: 'ImspTQPcCqd',
  orgUnitName: 'Liberia National MoH',
  lastStatus: 'untested'
};

// ─── Configuration Store ──────────────────────────────────────────────────────

export function getDHIS2Config(): DHIS2Config {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading DHIS2 config from storage:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveDHIS2Config(config: Partial<DHIS2Config>): DHIS2Config {
  const current = getDHIS2Config();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// ─── Patient Registry Store (Real-Time Local Storage) ─────────────────────────

export function getStoredPatients(): PatientRecord[] {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading patients from local storage:', e);
  }
  // Initialize with baseline demo patients
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PATIENTS));
  return INITIAL_DEMO_PATIENTS;
}

export function savePatientRecord(patient: PatientRecord): PatientRecord[] {
  const current = getStoredPatients();
  const updated = [patient, ...current];
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function purgeAllMockData(): PatientRecord[] {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function restoreDemoData(): PatientRecord[] {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PATIENTS));
  return INITIAL_DEMO_PATIENTS;
}

// ─── Live DHIS2 API Integration ───────────────────────────────────────────────

function getAuthHeaders(config: DHIS2Config): Headers {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  if (config.authType === 'pat' && config.token) {
    headers.append('Authorization', `ApiToken ${config.token}`);
  } else if (config.username && config.password) {
    headers.append('Authorization', 'Basic ' + btoa(`${config.username}:${config.password}`));
  }
  return headers;
}

/**
 * Pings the target DHIS2 instance system info endpoint
 */
export async function testDHIS2Connection(config?: DHIS2Config): Promise<{
  success: boolean;
  version?: string;
  systemName?: string;
  serverDate?: string;
  latencyMs?: number;
  message?: string;
}> {
  const cfg = config || getDHIS2Config();
  const startTime = Date.now();

  try {
    const baseUrl = cfg.serverUrl.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/system/info`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(cfg),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        latencyMs,
        message: `HTTP ${response.status}: ${response.statusText}. Check server URL and credentials.`
      };
    }

    const data = await response.json();
    return {
      success: true,
      version: data.version || '2.41.x',
      systemName: data.systemName || 'National Health Information System (DHIS2)',
      serverDate: data.serverDate || new Date().toISOString(),
      latencyMs,
      message: 'Connection successful'
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    if (error.name === 'AbortError') {
      return { success: false, latencyMs, message: 'Connection timed out after 8 seconds.' };
    }
    return {
      success: false,
      latencyMs,
      message: error.message?.includes('Failed to fetch')
        ? 'Network error / CORS restriction. Ensure DHIS2 server allows CORS or use a reverse proxy.'
        : error.message || 'Connection failed'
    };
  }
}

/**
 * Submits a new TB patient enrollment to DHIS2 Tracker API (/api/v41/tracker)
 */
export async function pushPatientToDHIS2(patient: PatientRecord, config?: DHIS2Config): Promise<{ success: boolean; message: string; uid?: string }> {
  const cfg = config || getDHIS2Config();

  if (cfg.mode === 'demo') {
    return {
      success: true,
      message: 'Saved to local persistent storage (Demo / Training mode).',
      uid: patient.id
    };
  }

  try {
    const baseUrl = cfg.serverUrl.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/tracker?async=false`;

    const payload = {
      trackedEntities: [
        {
          trackedEntityType: 'TB_PATIENT_TET_ID',
          orgUnit: cfg.orgUnitId,
          attributes: [
            { attribute: 'TEA_REG_ID', value: patient.id },
            { attribute: 'TEA_FULL_NAME', value: patient.name },
            { attribute: 'TEA_AGE', value: String(patient.age) },
            { attribute: 'TEA_SEX', value: patient.sex },
            { attribute: 'TEA_FACILITY', value: patient.facility },
            { attribute: 'TEA_HIV_STATUS', value: patient.hivStatus || 'Unknown' },
          ],
          enrollments: [
            {
              program: 'TB_NATIONAL_TRACKER',
              enrolledAt: patient.enrolledDate || new Date().toISOString().slice(0, 10),
              occurredAt: patient.enrolledDate || new Date().toISOString().slice(0, 10),
              orgUnit: cfg.orgUnitId,
              status: 'ACTIVE',
              events: [
                {
                  program: 'TB_NATIONAL_TRACKER',
                  programStage: 'PS-01',
                  orgUnit: cfg.orgUnitId,
                  occurredAt: new Date().toISOString().slice(0, 10),
                  status: 'COMPLETED',
                  dataValues: [
                    { dataElement: 'DE_TB_ID', value: patient.id },
                    { dataElement: 'DE_REGIMEN', value: patient.regimen || '1st Line (2HRZE/4HR)' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(cfg),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, message: `DHIS2 Error ${response.status}: ${errText}` };
    }

    const resData = await response.json();
    return {
      success: true,
      message: 'Successfully synchronized into National DHIS2 Tracker database.',
      uid: resData?.bundleReport?.typeReportMap?.TRACKED_ENTITY?.objectReports?.[0]?.uid || patient.id
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to push to DHIS2: ${err.message}. Saved to local fallback storage.`
    };
  }
}

export function updatePatientRecord(patient: PatientRecord): PatientRecord[] {
  const current = getStoredPatients();
  const index = current.findIndex(p => p.id === patient.id);
  let updated: PatientRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = patient;
  } else {
    updated = [patient, ...current];
  }
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function addPatientEncounter(patientId: string, encounter: EncounterRecord): PatientRecord[] {
  const current = getStoredPatients();
  const index = current.findIndex(p => p.id === patientId);
  if (index >= 0) {
    const p = current[index];
    const existing = p.encounters || [];
    const updatedEncounters = [...existing, encounter];
    current[index] = {
      ...p,
      encounters: updatedEncounters,
      lastVisitDate: encounter.date,
      status: encounter.stage.includes('Cured') ? 'Cured' : encounter.stage.includes('Outcome') ? 'Completed' : p.status
    };
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(current));
  }
  return current;
}