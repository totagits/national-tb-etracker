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

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  sex: string;
  facility: string;
  status: string;
  hivStatus?: string;
  regimen?: string;
  enrolledDate?: string;
  isLive?: boolean;
}

const CONFIG_STORAGE_KEY = 'tb_etracker_dhis2_config';
const PATIENTS_STORAGE_KEY = 'tb_etracker_patients_data';

export const INITIAL_DEMO_PATIENTS: PatientRecord[] = [
  { id: 'TB-1042', name: 'John Doe', age: 45, sex: 'M', facility: 'JFK Medical Center (Montserrado)', status: 'On Treatment', hivStatus: 'Negative', regimen: '1st Line (2HRZE/4HR)', enrolledDate: '2026-01-25' },
  { id: 'TB-1043', name: 'Jane Smith', age: 32, sex: 'F', facility: 'Redemption Hospital (Montserrado)', status: 'Presumptive', hivStatus: 'Positive', regimen: '1st Line (2HRZE/4HR)', enrolledDate: '2026-02-10' },
  { id: 'TB-1044', name: 'Michael Johnson', age: 28, sex: 'M', facility: 'CH Rennie Hospital (Margibi)', status: 'Cured', hivStatus: 'Negative', regimen: '1st Line (2HRZE/4HR)', enrolledDate: '2025-08-14' },
  { id: 'TB-1045', name: 'Sarah Williams', age: 51, sex: 'F', facility: 'Phebe Hospital (Bong)', status: 'Lost to Follow-up', hivStatus: 'Unknown', regimen: '1st Line (2HRZE/4HR)', enrolledDate: '2025-11-03' },
  { id: 'TB-1046', name: 'David Brown', age: 39, sex: 'M', facility: 'Jackson F. Doe Hospital (Nimba)', status: 'On Treatment', hivStatus: 'Positive', regimen: '2nd Line (MDR-TB)', enrolledDate: '2026-03-01' },
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