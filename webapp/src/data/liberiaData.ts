// ─────────────────────────────────────────────────────────────────────────────
// LIBERIA TB e-TRACKER — Shared National Data Layer
// All 15 counties · All 31 high-burden facilities · Consistent across every dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_COUNTIES = [
  'Montserrado', 'Nimba', 'Bong', 'Lofa', 'Margibi',
  'Grand Bassa', 'Maryland', 'Grand Gedeh', 'Sinoe',
  'Grand Cape Mount', 'Bomi', 'Gbarpolu', 'River Gee', 'Grand Kru', 'Rivercess',
];

export interface CountyData {
  county: string;
  region: 'Greater Monrovia' | 'North Central' | 'South Eastern A' | 'South Eastern B' | 'North Western';
  population: number;
  presumptive: number;
  tested: number;
  diagnosed: number;
  enrolled: number;
  initiated: number;
  success: number;
  onTreatment: number;
  ltfu: number;
  hivCoinfected: number;
  successRate: number;
  detectionRate: number; // per 100,000
  facilities: number;
  lastSync: string;
}

export const COUNTY_TB_DATA: CountyData[] = [
  { county: 'Montserrado', region: 'Greater Monrovia', population: 1118241, presumptive: 980, tested: 860, diagnosed: 380, enrolled: 355, initiated: 332, success: 298, onTreatment: 332, ltfu: 28, hivCoinfected: 88, successRate: 89.8, detectionRate: 34.0, facilities: 8, lastSync: '2026-05-21 08:12' },
  { county: 'Nimba',        region: 'North Central',   population: 468088,  presumptive: 420, tested: 368, diagnosed: 155, enrolled: 144, initiated: 135, success: 118, onTreatment: 135, ltfu: 14, hivCoinfected: 32, successRate: 87.4, detectionRate: 33.1, facilities: 4, lastSync: '2026-05-21 07:45' },
  { county: 'Bong',         region: 'North Central',   population: 333921,  presumptive: 310, tested: 272, diagnosed: 112, enrolled: 105, initiated: 98,  success: 84,  onTreatment: 98,  ltfu: 11, hivCoinfected: 24, successRate: 85.7, detectionRate: 33.5, facilities: 3, lastSync: '2026-05-20 16:30' },
  { county: 'Lofa',         region: 'North Central',   population: 276863,  presumptive: 248, tested: 210, diagnosed: 88,  enrolled: 80,  initiated: 73,  success: 60,  onTreatment: 73,  ltfu: 10, hivCoinfected: 18, successRate: 82.2, detectionRate: 31.8, facilities: 3, lastSync: '2026-05-19 14:00' },
  { county: 'Margibi',      region: 'Greater Monrovia', population: 228180, presumptive: 195, tested: 168, diagnosed: 70,  enrolled: 65,  initiated: 60,  success: 52,  onTreatment: 60,  ltfu: 7,  hivCoinfected: 15, successRate: 86.7, detectionRate: 30.7, facilities: 2, lastSync: '2026-05-21 09:00' },
  { county: 'Grand Bassa',  region: 'South Eastern A', population: 224839,  presumptive: 188, tested: 158, diagnosed: 64,  enrolled: 58,  initiated: 52,  success: 43,  onTreatment: 52,  ltfu: 8,  hivCoinfected: 14, successRate: 82.7, detectionRate: 28.5, facilities: 2, lastSync: '2026-05-20 11:15' },
  { county: 'Maryland',     region: 'South Eastern B', population: 159648,  presumptive: 132, tested: 112, diagnosed: 46,  enrolled: 42,  initiated: 38,  success: 32,  onTreatment: 38,  ltfu: 5,  hivCoinfected: 12, successRate: 84.2, detectionRate: 28.8, facilities: 2, lastSync: '2026-05-21 06:50' },
  { county: 'Grand Gedeh',  region: 'South Eastern A', population: 125258,  presumptive: 102, tested: 86,  diagnosed: 35,  enrolled: 32,  initiated: 29,  success: 24,  onTreatment: 29,  ltfu: 4,  hivCoinfected: 8,  successRate: 82.8, detectionRate: 27.9, facilities: 2, lastSync: '2026-05-20 09:30' },
  { county: 'Sinoe',        region: 'South Eastern A', population: 102391,  presumptive: 82,  tested: 68,  diagnosed: 27,  enrolled: 25,  initiated: 22,  success: 18,  onTreatment: 22,  ltfu: 3,  hivCoinfected: 6,  successRate: 81.8, detectionRate: 26.4, facilities: 2, lastSync: '2026-05-19 17:20' },
  { county: 'Grand Cape Mount', region: 'North Western', population: 127076, presumptive: 78, tested: 65, diagnosed: 26,  enrolled: 24,  initiated: 21,  success: 17,  onTreatment: 21,  ltfu: 3,  hivCoinfected: 5,  successRate: 81.0, detectionRate: 20.5, facilities: 1, lastSync: '2026-05-20 13:45' },
  { county: 'Bomi',         region: 'North Western',   population: 84119,   presumptive: 68,  tested: 56,  diagnosed: 22,  enrolled: 20,  initiated: 18,  success: 15,  onTreatment: 18,  ltfu: 2,  hivCoinfected: 4,  successRate: 83.3, detectionRate: 26.2, facilities: 1, lastSync: '2026-05-21 08:00' },
  { county: 'Gbarpolu',     region: 'North Western',   population: 83388,   presumptive: 58,  tested: 48,  diagnosed: 19,  enrolled: 17,  initiated: 15,  success: 12,  onTreatment: 15,  ltfu: 2,  hivCoinfected: 3,  successRate: 80.0, detectionRate: 22.8, facilities: 1, lastSync: '2026-05-18 10:30' },
  { county: 'River Gee',    region: 'South Eastern B', population: 66789,   presumptive: 52,  tested: 44,  diagnosed: 17,  enrolled: 16,  initiated: 14,  success: 11,  onTreatment: 14,  ltfu: 2,  hivCoinfected: 3,  successRate: 78.6, detectionRate: 25.5, facilities: 1, lastSync: '2026-05-19 08:15' },
  { county: 'Grand Kru',    region: 'South Eastern B', population: 57913,   presumptive: 44,  tested: 36,  diagnosed: 14,  enrolled: 13,  initiated: 11,  success: 9,   onTreatment: 11,  ltfu: 1,  hivCoinfected: 2,  successRate: 81.8, detectionRate: 24.2, facilities: 2, lastSync: '2026-05-20 15:00' },
  { county: 'Rivercess',    region: 'South Eastern A', population: 71509,   presumptive: 42,  tested: 34,  diagnosed: 13,  enrolled: 12,  initiated: 10,  success: 8,   onTreatment: 10,  ltfu: 1,  hivCoinfected: 2,  successRate: 80.0, detectionRate: 18.2, facilities: 1, lastSync: '2026-05-17 11:00' },
];

// ─── Computed Nationals ───────────────────────────────────────────────────────
export const NATIONAL_TOTALS = {
  presumptive: COUNTY_TB_DATA.reduce((s, c) => s + c.presumptive, 0),
  tested:      COUNTY_TB_DATA.reduce((s, c) => s + c.tested, 0),
  diagnosed:   COUNTY_TB_DATA.reduce((s, c) => s + c.diagnosed, 0),
  onTreatment: COUNTY_TB_DATA.reduce((s, c) => s + c.onTreatment, 0),
  success:     COUNTY_TB_DATA.reduce((s, c) => s + c.success, 0),
  ltfu:        COUNTY_TB_DATA.reduce((s, c) => s + c.ltfu, 0),
  hivCoinfected: COUNTY_TB_DATA.reduce((s, c) => s + c.hivCoinfected, 0),
  registered:  12450,
};

// ─── 31 High-Burden Facilities ────────────────────────────────────────────────
export interface Facility {
  id: string;
  name: string;
  county: string;
  district: string;
  type: 'Hospital' | 'Health Center' | 'Clinic';
  patients: number;
  onTreatment: number;
  ltfu: number;
  clerk: string;
  lastSync: string;
  syncStatus: 'Today' | 'Yesterday' | '2+ Days' | 'Not Synced';
  successRate: number;
}

export const FACILITIES: Facility[] = [
  { id: 'F01', name: 'Redemption Hospital',              county: 'Montserrado',    district: 'Bushrod Island',    type: 'Hospital',       patients: 380, onTreatment: 92, ltfu: 8,  clerk: 'Samson Kpoto',    lastSync: '2026-05-21 08:12', syncStatus: 'Today',     successRate: 90.2 },
  { id: 'F02', name: 'JFK Medical Center',               county: 'Montserrado',    district: 'Sinkor',            type: 'Hospital',       patients: 342, onTreatment: 84, ltfu: 6,  clerk: 'Mary Johnson',     lastSync: '2026-05-21 07:55', syncStatus: 'Today',     successRate: 91.5 },
  { id: 'F03', name: 'C.H. Rennie Hospital',             county: 'Margibi',        district: 'Kakata',            type: 'Hospital',       patients: 180, onTreatment: 44, ltfu: 5,  clerk: 'Peter Wleh',       lastSync: '2026-05-21 09:00', syncStatus: 'Today',     successRate: 87.3 },
  { id: 'F04', name: 'Phebe Hospital',                   county: 'Bong',           district: 'Suakoko',           type: 'Hospital',       patients: 210, onTreatment: 52, ltfu: 6,  clerk: 'David Sumo',       lastSync: '2026-05-20 16:30', syncStatus: 'Yesterday', successRate: 85.7 },
  { id: 'F05', name: 'Jackson F. Doe Hospital',          county: 'Nimba',          district: 'Tappita',           type: 'Hospital',       patients: 198, onTreatment: 48, ltfu: 5,  clerk: 'Esther Flomo',     lastSync: '2026-05-21 07:45', syncStatus: 'Today',     successRate: 88.4 },
  { id: 'F06', name: 'Ganta United Methodist Hospital',  county: 'Nimba',          district: 'Ganta',             type: 'Hospital',       patients: 175, onTreatment: 42, ltfu: 4,  clerk: 'James Nagbe',      lastSync: '2026-05-21 06:30', syncStatus: 'Today',     successRate: 86.9 },
  { id: 'F07', name: 'Tellewoyan Hospital',              county: 'Lofa',           district: 'Voinjama',          type: 'Hospital',       patients: 145, onTreatment: 36, ltfu: 6,  clerk: 'Ruth Toe',         lastSync: '2026-05-19 14:00', syncStatus: '2+ Days',   successRate: 81.5 },
  { id: 'F08', name: 'Foya District Hospital',           county: 'Lofa',           district: 'Foya',              type: 'Hospital',       patients: 112, onTreatment: 28, ltfu: 4,  clerk: 'Agnes Kollie',     lastSync: '2026-05-19 10:15', syncStatus: '2+ Days',   successRate: 82.3 },
  { id: 'F09', name: 'JJ Dossen Hospital',               county: 'Maryland',       district: 'Harper',            type: 'Hospital',       patients: 168, onTreatment: 38, ltfu: 4,  clerk: 'Moses Henries',    lastSync: '2026-05-21 06:50', syncStatus: 'Today',     successRate: 84.5 },
  { id: 'F10', name: 'Martha Tubman Hospital',           county: 'Grand Gedeh',    district: 'Zwedru',            type: 'Hospital',       patients: 138, onTreatment: 29, ltfu: 3,  clerk: 'Sarah Suah',       lastSync: '2026-05-20 09:30', syncStatus: 'Yesterday', successRate: 83.0 },
  { id: 'F11', name: 'Liberian Gov. Hospital (Buchanan)', county: 'Grand Bassa',   district: 'Buchanan',          type: 'Hospital',       patients: 195, onTreatment: 46, ltfu: 5,  clerk: 'John Fallah',      lastSync: '2026-05-20 11:15', syncStatus: 'Yesterday', successRate: 82.9 },
  { id: 'F12', name: 'Sinoe FJ Grante Hospital',         county: 'Sinoe',          district: 'Greenville',        type: 'Hospital',       patients: 128, onTreatment: 22, ltfu: 3,  clerk: 'Patience Sumo',    lastSync: '2026-05-19 17:20', syncStatus: '2+ Days',   successRate: 81.3 },
  { id: 'F13', name: 'Bomi Hospital',                    county: 'Bomi',           district: 'Tubmanburg',        type: 'Hospital',       patients: 110, onTreatment: 18, ltfu: 2,  clerk: 'Victor Dennis',    lastSync: '2026-05-21 08:00', syncStatus: 'Today',     successRate: 83.3 },
  { id: 'F14', name: 'Grand Cape Mount Hospital',        county: 'Grand Cape Mount', district: 'Robertsport',     type: 'Hospital',       patients: 105, onTreatment: 21, ltfu: 3,  clerk: 'Blessing Sheriff', lastSync: '2026-05-20 13:45', syncStatus: 'Yesterday', successRate: 80.9 },
  { id: 'F15', name: 'Gbarpolu Health Center',           county: 'Gbarpolu',       district: 'Bopolu',            type: 'Health Center',  patients: 88,  onTreatment: 15, ltfu: 2,  clerk: 'Emmanuel Toe',     lastSync: '2026-05-18 10:30', syncStatus: '2+ Days',   successRate: 80.0 },
  { id: 'F16', name: 'Fish Town District Hospital',      county: 'River Gee',      district: 'Fish Town',         type: 'Hospital',       patients: 92,  onTreatment: 14, ltfu: 2,  clerk: 'Lydia Kpadeh',     lastSync: '2026-05-19 08:15', syncStatus: '2+ Days',   successRate: 78.6 },
  { id: 'F17', name: 'Rally Time Hospital',              county: 'Grand Kru',      district: 'Barclayville',      type: 'Hospital',       patients: 78,  onTreatment: 11, ltfu: 1,  clerk: 'Thomas Wreh',      lastSync: '2026-05-20 15:00', syncStatus: 'Yesterday', successRate: 81.8 },
  { id: 'F18', name: 'Barclayville Health Center',       county: 'Grand Kru',      district: 'Barclayville',      type: 'Health Center',  patients: 52,  onTreatment: 8,  ltfu: 1,  clerk: 'Grace Tuon',       lastSync: '2026-05-20 14:00', syncStatus: 'Yesterday', successRate: 80.0 },
  { id: 'F19', name: 'Rivercess Health Center',          county: 'Rivercess',      district: 'Cestos City',       type: 'Health Center',  patients: 68,  onTreatment: 10, ltfu: 1,  clerk: 'Daniel Kolo',      lastSync: '2026-05-17 11:00', syncStatus: 'Not Synced', successRate: 80.0 },
  { id: 'F20', name: 'CB Dunbar Hospital',               county: 'Bong',           district: 'Gbarnga',           type: 'Hospital',       patients: 155, onTreatment: 38, ltfu: 4,  clerk: 'Nancy Wiah',       lastSync: '2026-05-21 08:45', syncStatus: 'Today',     successRate: 87.2 },
  { id: 'F21', name: 'Saclepea Government Hospital',     county: 'Nimba',          district: 'Saclepea',          type: 'Hospital',       patients: 120, onTreatment: 28, ltfu: 3,  clerk: 'Albert Gbarwea',   lastSync: '2026-05-21 07:20', syncStatus: 'Today',     successRate: 86.5 },
  { id: 'F22', name: 'Sanniquellie Government Hospital', county: 'Nimba',          district: 'Sanniquellie',      type: 'Hospital',       patients: 102, onTreatment: 22, ltfu: 2,  clerk: 'Cecelia Teah',     lastSync: '2026-05-20 12:30', syncStatus: 'Yesterday', successRate: 85.0 },
  { id: 'F23', name: 'Zwedru Government Hospital',       county: 'Grand Gedeh',    district: 'Zwedru City',       type: 'Hospital',       patients: 96,  onTreatment: 18, ltfu: 2,  clerk: 'Samuel Doe',       lastSync: '2026-05-21 09:15', syncStatus: 'Today',     successRate: 84.2 },
  { id: 'F24', name: 'Voinjama Government Hospital',     county: 'Lofa',           district: 'Voinjama Town',     type: 'Hospital',       patients: 88,  onTreatment: 16, ltfu: 3,  clerk: 'Fatu Kamara',      lastSync: '2026-05-19 16:00', syncStatus: '2+ Days',   successRate: 79.5 },
  { id: 'F25', name: 'Kakata Government Hospital',       county: 'Margibi',        district: 'Kakata City',       type: 'Hospital',       patients: 122, onTreatment: 26, ltfu: 3,  clerk: 'Ibrahim Kollie',   lastSync: '2026-05-21 08:30', syncStatus: 'Today',     successRate: 88.0 },
  { id: 'F26', name: 'Harper Government Hospital',       county: 'Maryland',       district: 'Harper City',       type: 'Hospital',       patients: 98,  onTreatment: 20, ltfu: 2,  clerk: 'Rebecca Nyahn',    lastSync: '2026-05-21 07:00', syncStatus: 'Today',     successRate: 83.7 },
  { id: 'F27', name: 'Buchanan Government Hospital',     county: 'Grand Bassa',    district: 'Buchanan City',     type: 'Hospital',       patients: 112, onTreatment: 24, ltfu: 4,  clerk: 'Comfort Mulbah',   lastSync: '2026-05-20 10:00', syncStatus: 'Yesterday', successRate: 81.5 },
  { id: 'F28', name: 'Greenville Government Hospital',   county: 'Sinoe',          district: 'Greenville City',   type: 'Hospital',       patients: 82,  onTreatment: 14, ltfu: 2,  clerk: 'Philip Karnga',    lastSync: '2026-05-19 15:45', syncStatus: '2+ Days',   successRate: 82.2 },
  { id: 'F29', name: 'Tubmanburg Hospital',              county: 'Bomi',           district: 'Tubmanburg City',   type: 'Hospital',       patients: 72,  onTreatment: 12, ltfu: 1,  clerk: 'Henrietta Paye',   lastSync: '2026-05-21 09:30', syncStatus: 'Today',     successRate: 84.0 },
  { id: 'F30', name: 'Monrovia Central Prison Clinic',   county: 'Montserrado',    district: 'Central Monrovia',  type: 'Clinic',         patients: 58,  onTreatment: 14, ltfu: 4,  clerk: 'Augustine Nimley', lastSync: '2026-05-20 14:20', syncStatus: 'Yesterday', successRate: 79.3 },
  { id: 'F31', name: 'Zorzor Government Hospital',       county: 'Lofa',           district: 'Zorzor',            type: 'Hospital',       patients: 78,  onTreatment: 16, ltfu: 2,  clerk: 'Mariama Bah',      lastSync: '2026-05-20 08:45', syncStatus: 'Yesterday', successRate: 83.2 },
];

// ─── Demographics (Age/Sex) ───────────────────────────────────────────────────
export const AGE_SEX_DATA = [
  { group: '0–4',   male: 38,  female: 42  },
  { group: '5–14',  male: 88,  female: 72  },
  { group: '15–24', male: 185, female: 165 },
  { group: '25–34', male: 310, female: 225 },
  { group: '35–44', male: 285, female: 180 },
  { group: '45–54', male: 210, female: 135 },
  { group: '55–64', male: 142, female: 88  },
  { group: '65+',   male: 80,  female: 50  },
];

// ─── Monthly Trend (2026) ─────────────────────────────────────────────────────
export const MONTHLY_TREND = [
  { month: 'Jan', screened: 210, diagnosed: 72, initiated: 65, success: 55 },
  { month: 'Feb', screened: 235, diagnosed: 80, initiated: 72, success: 62 },
  { month: 'Mar', screened: 198, diagnosed: 65, initiated: 58, success: 50 },
  { month: 'Apr', screened: 268, diagnosed: 91, initiated: 84, success: 72 },
  { month: 'May', screened: 282, diagnosed: 98, initiated: 91, success: 78 },
];

// ─── Stakeholders ─────────────────────────────────────────────────────────────
export const STAKEHOLDERS = [
  { org: 'Ministry of Health (MoH)', contact: 'Dr. Wilhelmina Jallah', role: 'Chief Medical Officer', email: 'cmo@moh.gov.lr', signoff: 'System Architecture', signoffDate: '2026-05-10', status: 'Signed' },
  { org: 'Plan International Liberia', contact: 'Mary Johnson', role: 'Project Manager', email: 'mjohnson@planinternational.org', signoff: 'Implementation Plan', signoffDate: '2026-05-08', status: 'Signed' },
  { org: 'The Global Fund', contact: 'James Anderson', role: 'Portfolio Manager', email: 'j.anderson@theglobalfund.org', signoff: 'UAT Approval', signoffDate: '—', status: 'Pending' },
  { org: 'DHIS2 Core Team', contact: 'David Sumo', role: 'DHIS2 Config Specialist', email: 'dsumo@dhis2.org', signoff: 'Metadata Configuration', signoffDate: '2026-05-12', status: 'Signed' },
  { org: 'WHO Liberia Country Office', contact: 'Dr. Amara Jallah', role: 'TB Programme Officer', email: 'jallaha@who.int', signoff: 'Clinical Protocols', signoffDate: '2026-05-15', status: 'Signed' },
  { org: 'US CDC (PEPFAR)', contact: 'Dr. Linda Mills', role: 'HIV/TB Integration Lead', email: 'lmills@cdc.gov', signoff: 'TB/HIV Integration Plan', signoffDate: '—', status: 'Pending' },
  { org: 'USAID Liberia', contact: 'Robert Clarke', role: 'Health Systems Officer', email: 'rclarke@usaid.gov', signoff: 'Sustainability Framework', signoffDate: '2026-05-14', status: 'Signed' },
  { org: 'National Drugs Service (NDS)', contact: 'Fatu Kamara', role: 'Supply Chain Officer', email: 'fkamara@nds.gov.lr', signoff: 'Drug Logistics Integration', signoffDate: '—', status: 'Under Review' },
];

// ─── Training Sessions ────────────────────────────────────────────────────────
export const TRAINING_SESSIONS = [
  { id: 'TS-001', title: 'DHIS2 Tracker Basics for Data Clerks', county: 'Montserrado', facility: 'JFK Medical Center', date: '2026-04-10', trainer: 'Ruth Toe', enrolled: 24, attended: 22, passRate: 91.7, status: 'Completed' },
  { id: 'TS-002', title: 'TB Screening & Data Capture Workshop', county: 'Nimba', facility: 'Jackson F. Doe Hospital', date: '2026-04-15', trainer: 'Ruth Toe', enrolled: 18, attended: 16, passRate: 88.9, status: 'Completed' },
  { id: 'TS-003', title: 'Treatment Outcome Recording', county: 'Bong', facility: 'Phebe Hospital', date: '2026-04-22', trainer: 'Samuel Barwon', enrolled: 15, attended: 14, passRate: 85.7, status: 'Completed' },
  { id: 'TS-004', title: 'TB/HIV Co-infection Data Entry', county: 'Lofa', facility: 'Tellewoyan Hospital', date: '2026-05-05', trainer: 'Ruth Toe', enrolled: 12, attended: 10, passRate: 80.0, status: 'Completed' },
  { id: 'TS-005', title: 'Offline Sync & Mobile Capture (DHIS2 App)', county: 'Grand Bassa', facility: 'Liberian Gov. Hospital', date: '2026-05-12', trainer: 'David Sumo', enrolled: 20, attended: 18, passRate: 83.3, status: 'Completed' },
  { id: 'TS-006', title: 'DHIS2 Tracker Basics for Data Clerks', county: 'Margibi', facility: 'C.H. Rennie Hospital', date: '2026-05-20', trainer: 'Ruth Toe', enrolled: 14, attended: 0, passRate: 0, status: 'Upcoming' },
  { id: 'TS-007', title: 'TB Screening & Data Capture Workshop', county: 'Maryland', facility: 'JJ Dossen Hospital', date: '2026-05-28', trainer: 'Samuel Barwon', enrolled: 16, attended: 0, passRate: 0, status: 'Upcoming' },
  { id: 'TS-008', title: 'DHIS2 Tracker Basics for Data Clerks', county: 'Grand Gedeh', facility: 'Martha Tubman Hospital', date: '2026-06-03', trainer: 'Ruth Toe', enrolled: 12, attended: 0, passRate: 0, status: 'Scheduled' },
  { id: 'TS-009', title: 'DHIS2 Tracker Basics for Data Clerks', county: 'Sinoe', facility: 'Sinoe FJ Grante Hospital', date: '2026-06-10', trainer: 'Ruth Toe', enrolled: 10, attended: 0, passRate: 0, status: 'Scheduled' },
  { id: 'TS-010', title: 'DHIS2 Tracker Basics for Data Clerks', county: 'River Gee', facility: 'Fish Town District Hospital', date: '2026-06-17', trainer: 'Samuel Barwon', enrolled: 8, attended: 0, passRate: 0, status: 'Planned' },
];

// ─── Helpdesk Tickets ─────────────────────────────────────────────────────────
export interface Ticket {
  id: string;
  title: string;
  county: string;
  facility: string;
  reporter: string;
  category: 'Login/Access' | 'Data Entry' | 'Sync Issue' | 'System Error' | 'Training' | 'Hardware';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created: string;
  updated: string;
  slaHours: number;
  resolvedHours?: number;
  assignee: string;
  description: string;
}

export const HELPDESK_TICKETS: Ticket[] = [
  { id: 'HD-001', title: 'Cannot log in to DHIS2 after password reset', county: 'Montserrado', facility: 'Redemption Hospital', reporter: 'Samson Kpoto', category: 'Login/Access', priority: 'High', status: 'Resolved', created: '2026-05-19 09:15', updated: '2026-05-19 11:30', slaHours: 8, resolvedHours: 2.25, assignee: 'Samuel Barwon', description: 'User locked out after 3 failed attempts. Account needed admin reset.' },
  { id: 'HD-002', title: 'Sync failing — data not uploading from Lofa county', county: 'Lofa', facility: 'Tellewoyan Hospital', reporter: 'Ruth Toe', category: 'Sync Issue', priority: 'Critical', status: 'In Progress', created: '2026-05-20 07:00', updated: '2026-05-21 06:30', slaHours: 4, assignee: 'David Sumo', description: 'DHIS2 Android app showing "connection timeout". Offline queue has 48 records pending.' },
  { id: 'HD-003', title: 'TB registration form missing "HIV Status" field', county: 'Nimba', facility: 'Jackson F. Doe Hospital', reporter: 'Esther Flomo', category: 'Data Entry', priority: 'High', status: 'Resolved', created: '2026-05-18 14:22', updated: '2026-05-18 16:45', slaHours: 8, resolvedHours: 2.38, assignee: 'David Sumo', description: 'HIV Status attribute not appearing in Enrollment form. Was a metadata push issue — resolved by re-syncing metadata.' },
  { id: 'HD-004', title: 'System error when searching patient by TB ID', county: 'Bong', facility: 'Phebe Hospital', reporter: 'David Sumo', category: 'System Error', priority: 'Medium', status: 'Open', created: '2026-05-21 08:00', updated: '2026-05-21 08:00', slaHours: 24, assignee: 'Samuel Barwon', description: 'Search returns "undefined" for TB IDs registered in April. Likely a data migration issue.' },
  { id: 'HD-005', title: 'Need refresher training on outcome recording', county: 'Grand Bassa', facility: 'Liberian Gov. Hospital', reporter: 'John Fallah', category: 'Training', priority: 'Low', status: 'Closed', created: '2026-05-17 10:00', updated: '2026-05-18 09:00', slaHours: 48, resolvedHours: 23, assignee: 'Ruth Toe', description: 'Clerk requested additional training on treatment outcome data entry. Scheduled and completed.' },
  { id: 'HD-006', title: 'Tablet not charging — cannot use DHIS2 mobile app', county: 'River Gee', facility: 'Fish Town District Hospital', reporter: 'Lydia Kpadeh', category: 'Hardware', priority: 'Medium', status: 'Open', created: '2026-05-20 11:30', updated: '2026-05-20 11:30', slaHours: 24, assignee: 'Samuel Barwon', description: 'Charging port damaged. Facility is using paper forms as backup. Replacement tablet being sourced.' },
  { id: 'HD-007', title: 'Duplicate patient records created for same individual', county: 'Maryland', facility: 'JJ Dossen Hospital', reporter: 'Moses Henries', category: 'Data Entry', priority: 'High', status: 'In Progress', created: '2026-05-19 13:00', updated: '2026-05-20 09:45', slaHours: 8, assignee: 'Esther Flomo', description: 'Patient registered twice with different TB IDs. Need to merge records. Informatics team involved.' },
  { id: 'HD-008', title: 'County health officer cannot view Sinoe facility data', county: 'Sinoe', facility: 'Sinoe FJ Grante Hospital', reporter: 'Patience Sumo', category: 'Login/Access', priority: 'Medium', status: 'Resolved', created: '2026-05-16 14:00', updated: '2026-05-16 16:30', slaHours: 24, resolvedHours: 2.5, assignee: 'Samuel Barwon', description: 'DHIS2 sharing settings for Sinoe org unit not configured for county health officer role.' },
];

// ─── Security / Audit Logs ────────────────────────────────────────────────────
export interface AuditLog {
  timestamp: string;
  user: string;
  role: string;
  county: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  ipAddress: string;
}

export const AUDIT_LOGS: AuditLog[] = [
  { timestamp: '2026-05-21 09:12:33', user: 'facility_clerk_jfk', role: 'Facility Data Clerk', county: 'Montserrado', action: 'CREATE', resource: 'Tracked Entity Instance (Patient TB-1856)', status: 'SUCCESS', ipAddress: '41.66.128.12' },
  { timestamp: '2026-05-21 09:08:15', user: 'national_admin_01', role: 'National Admin', county: 'National', action: 'READ', resource: 'National Analytics Dashboard', status: 'SUCCESS', ipAddress: '41.66.130.5' },
  { timestamp: '2026-05-21 08:55:42', user: 'county_officer_lofa', role: 'County Officer', county: 'Lofa', action: 'UPDATE', resource: 'Treatment Outcome (TB-1401)', status: 'SUCCESS', ipAddress: '41.66.145.88' },
  { timestamp: '2026-05-21 08:44:20', user: 'clerk_tellewoyan_anon', role: 'Unknown', county: 'Lofa', action: 'READ', resource: 'HIV_STATUS attribute', status: 'BLOCKED', ipAddress: '41.66.145.91' },
  { timestamp: '2026-05-21 08:30:09', user: 'facility_clerk_phebe', role: 'Facility Data Clerk', county: 'Bong', action: 'CREATE', resource: 'TB Screening Event (TB-1842)', status: 'SUCCESS', ipAddress: '192.168.10.4' },
  { timestamp: '2026-05-21 08:22:01', user: 'training_coord_01', role: 'Training Coordinator', county: 'National', action: 'READ', resource: 'Training Materials Library', status: 'SUCCESS', ipAddress: '41.66.130.22' },
  { timestamp: '2026-05-21 07:55:30', user: 'unknown_probe', role: 'None', county: '—', action: 'LOGIN', resource: 'Admin Panel (unauthorized attempt)', status: 'BLOCKED', ipAddress: '185.234.217.8' },
  { timestamp: '2026-05-21 07:48:12', user: 'facility_clerk_jd', role: 'Facility Data Clerk', county: 'Nimba', action: 'UPDATE', resource: 'Enrollment (TB-1788)', status: 'SUCCESS', ipAddress: '192.168.5.12' },
  { timestamp: '2026-05-20 17:30:00', user: 'county_officer_nimba', role: 'County Officer', county: 'Nimba', action: 'EXPORT', resource: 'County Report (Q1 2026)', status: 'WARNING', ipAddress: '41.66.142.30' },
  { timestamp: '2026-05-20 15:12:44', user: 'helpdesk_01', role: 'Helpdesk Officer', county: 'National', action: 'RESET_PASSWORD', resource: 'User: facility_clerk_redemption', status: 'SUCCESS', ipAddress: '41.66.130.10' },
  { timestamp: '2026-05-20 14:22:18', user: 'facility_clerk_mon2', role: 'Facility Data Clerk', county: 'Montserrado', action: 'DELETE', resource: 'Duplicate Record (TB-1412-B)', status: 'BLOCKED', ipAddress: '41.66.128.55' },
  { timestamp: '2026-05-20 13:05:00', user: 'informatics_01', role: 'Informatics Specialist', county: 'National', action: 'READ', resource: 'National Cohort Report (All Counties)', status: 'SUCCESS', ipAddress: '41.66.130.18' },
];
