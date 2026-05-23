# Requirements Analysis and Workflow Mapping Report

## 1. Project Context
Plan International Liberia, in collaboration with the Ministry of Health Liberia and the Global Fund GC7-supported TB/HIV program, requires the design, configuration, testing, and deployment of a National TB e-Tracker within DHIS2. 

The primary goal is case-based longitudinal patient monitoring from TB screening through diagnosis, treatment initiation, follow-up, and outcome reporting. The initial scope covers 31 high-burden TB health facilities, with architectural readiness for a national rollout.

## 2. Primary Objective
Design, configure, and hand over a DHIS2-native TB e-Tracker that supports:
- Patient-level TB data management
- Real-time program monitoring
- Secure facility, county, and national reporting
- TB/HIV co-infection analytics
- Cohort analysis and decision-making

## 3. Core Implementation Principles
- **DHIS2-Native First**: The solution must heavily leverage DHIS2 core capabilities. No standalone external databases competing with DHIS2.
- **Single Source of Truth**: DHIS2 Tracker remains the definitive system of record.
- **Integration over Duplication**: Avoid duplicating the existing HIV Tracker; capture only necessary TB/HIV co-infection markers for TB program monitoring.
- **Accessibility**: Must be low-bandwidth friendly, mobile-compatible (DHIS2 Android Capture), and secure.

## 4. Key Functional Requirements
- **Patient Registration & Unique ID**: Tracked Entity Type for TB Patient, deduplication checks, and national/system ID generation.
- **Longitudinal Tracking**: Program stages for Screening, Diagnosis, Treatment Initiation, Co-Infection, Follow-up, Contact Tracing, Referrals, and Outcomes.
- **Alerts & Decision Support**: Program rules for overdue visits, missed doses, delayed treatments, and abnormal lab results.
- **Analytics & Dashboards**: Comprehensive DHIS2 dashboards for case detection, treatment cascades, co-infection, outcomes, and data quality.
- **Role-Based Access Control (RBAC)**: Strict data isolation by Organization Unit (facility/county/national) and functional role.

## 5. Workflow Mapping
The standard patient journey maps to the following key modules:
1. **Screening**: Identification of presumptive TB based on symptoms (cough > 2 weeks, fever, weight loss).
2. **Diagnosis & Lab**: Sputum collection, GeneXpert, Smear, Culture, X-ray. Confirmation of MTB and Drug Resistance (RR-TB/MDR-TB).
3. **Treatment Initiation**: Registration of baseline weight, regimen, and DOT option.
4. **TB/HIV Co-Infection**: Linkage to HIV status, ART status, and viral load monitoring.
5. **Follow-Up Monitoring**: Monthly clinical reviews, sputum follow-ups, and adherence tracking.
6. **Contact Tracing**: Household screening and TPT initiation for eligible contacts.
7. **Referral/Transfer**: Inter-facility continuity of care.
8. **Treatment Outcome**: Case closure (Cured, Completed, Failed, Died, LTFU).

## 6. Security and Compliance
- Strict adherence to patient confidentiality and HMIS standards.
- Least-privilege access model.
- Audit logging and secure data validation.
- No storage of unnecessary Personally Identifiable Information (PII) outside DHIS2.
