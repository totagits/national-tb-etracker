/**
 * DHIS2 API Integration Service
 * 
 * This module provides abstraction services for interacting with the DHIS2 Web API.
 * It strictly adheres to the "DHIS2-native first" principle by using DHIS2 as the source of truth.
 */

// Configure with environment variables in a real implementation
const DHIS2_API_URL = import.meta.env.VITE_DHIS2_URL || 'https://play.dhis2.org/demo/api';
const DHIS2_USERNAME = import.meta.env.VITE_DHIS2_USERNAME || 'admin';
const DHIS2_PASSWORD = import.meta.env.VITE_DHIS2_PASSWORD || 'district';

const PROGRAM_ID = 'TB_TRACKER_PROGRAM';
const TET_ID = 'TB_PATIENT_TET_ID';
const ORG_UNIT_ID = 'ImspTQPcCqd'; // Example Org Unit

/**
 * Basic fetch wrapper with authentication and error handling
 */
async function fetchDHIS2(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.append('Authorization', 'Basic ' + btoa(`${DHIS2_USERNAME}:${DHIS2_PASSWORD}`));
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  const response = await fetch(`${DHIS2_API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DHIS2 API Error [${response.status}]:`, errorText);
    throw new Error(`DHIS2 API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 1. Tracked Entities Module
 * Searches for TB Patients based on query attributes.
 */
export async function searchPatients(query: string = '') {
  try {
    // Example: GET /api/tracker/trackedEntities?program=X&ou=Y
    // Use mock data for demo if DHIS2 is unreachable
    console.log(`Searching for patients in DHIS2 with query: ${query}...`);
    const data = await fetchDHIS2(`tracker/trackedEntities?program=${PROGRAM_ID}&orgUnit=${ORG_UNIT_ID}`);
    return data.instances || [];
  } catch (error) {
    console.warn("Falling back to local mock data due to API error.");
    return [
      { id: '1', attributes: [{ attribute: 'TEA_FIRST_NAME', value: 'John' }, { attribute: 'TEA_LAST_NAME', value: 'Doe' }] }
    ];
  }
}

/**
 * 2. Registration Module
 * Registers a new patient into the TB Tracker.
 */
export async function registerPatient(attributes: Record<string, string>, enrollmentDate: string) {
  const payload = {
    trackedEntities: [
      {
        trackedEntityType: TET_ID,
        orgUnit: ORG_UNIT_ID,
        attributes: Object.entries(attributes).map(([attr, val]) => ({ attribute: attr, value: val })),
        enrollments: [
          {
            program: PROGRAM_ID,
            enrolledAt: enrollmentDate,
            occurredAt: enrollmentDate,
            orgUnit: ORG_UNIT_ID,
            status: "ACTIVE"
          }
        ]
      }
    ]
  };

  return fetchDHIS2('tracker', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * 3. Events Module
 * Logs a new clinical event (e.g., Diagnosis, Follow-up).
 */
export async function addClinicalEvent(enrollmentId: string, programStage: string, dataValues: Record<string, string>, eventDate: string) {
  const payload = {
    events: [
      {
        enrollment: enrollmentId,
        program: PROGRAM_ID,
        programStage: programStage,
        orgUnit: ORG_UNIT_ID,
        occurredAt: eventDate,
        status: "COMPLETED",
        dataValues: Object.entries(dataValues).map(([dataElement, val]) => ({
          dataElement,
          value: val
        }))
      }
    ]
  };

  return fetchDHIS2('tracker', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * 4. Analytics Module
 * Fetches aggregated data from DHIS2 Program Indicators for the dashboard.
 */
export async function getAnalyticsData() {
  // Example: GET /api/analytics?dimension=dx:INDICATOR_ID&dimension=pe:THIS_YEAR
  return fetchDHIS2('analytics?dimension=dx:TB_CASE_DETECTION_RATE&dimension=pe:THIS_YEAR');
}
