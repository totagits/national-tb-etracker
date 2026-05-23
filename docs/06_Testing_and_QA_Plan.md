# Testing and Quality Assurance Plan

## 1. Overview
This QA Plan ensures the National TB e-Tracker meets clinical data integrity standards, Ministry of Health requirements, and DHIS2 best practices prior to the 31-site rollout.

## 2. Testing Phases

### Phase 1: Unit & Metadata Testing
- Validate DHIS2 metadata import in staging environment.
- Verify Tracked Entity Attributes, Program Stages, and Data Elements exist without conflicts.
- **Tools**: DHIS2 API validation scripts, manual metadata review.

### Phase 2: Logic and Rules Testing
- Test Program Rules for triggering alerts (e.g., delayed treatment, missing HIV status).
- Test Validation Rules (e.g., Treatment Start Date >= Diagnosis Date).
- Verify auto-calculation of next appointment dates.

### Phase 3: Integration & Dashboard Testing
- Create mock patients across all workflow branches (cured, LTFU, failed).
- Verify DHIS2 Program Indicators correctly aggregate case detection and treatment cascades.
- Validate custom Recharts dashboard displays correct data.

### Phase 4: Role & Access Control Testing
- Log in as Facility Clerk: verify access is restricted to assigned facility.
- Log in as County Officer: verify access is restricted to assigned county.
- Verify read-only roles cannot mutate data.

### Phase 5: Mobile & Low-Bandwidth Testing
- Test configuration against DHIS2 Android Capture App.
- Simulate 3G/Offline environments to test offline sync and data conflict resolution.

### Phase 6: User Acceptance Testing (UAT)
- **Participants**: MoH staff, HMIS team, Facility Data Clerks.
- **Process**: Users execute standard workflows using a UAT script. Feedback is collected, triaged, and addressed prior to production deployment.

## 3. Acceptance Criteria
- 100% of core workflow stages pass validation without blocking errors.
- Dashboards accurately reflect mock dataset.
- Role restrictions strictly enforced.
- Android compatibility confirmed.
