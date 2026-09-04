# Demonstration Script for Evaluation Committee

## Objective
Impress the tender evaluation committee by demonstrating a live, functional, and highly polished prototype of the National TB e-Tracker.

## Scenario Setup
- **Environment**: Demo DHIS2 instance and custom React web app.
- **Data**: Mock data pre-loaded for 3 facilities across 2 counties.
- **Roles Prepared**: National Admin, Facility Data Clerk.

## Script

**1. Login & Dashboard (National Admin View) [2 mins]**
*Action*: Log in as a National Administrator.
*Talking Points*: 
- Highlight the modern, responsive interface.
- Show the National TB Overview Dashboard (Total Screened, Diagnosed, Treatment Cascade).
- Emphasize real-time data aggregation and the "Critical Alerts" panel.

**2. Patient Registration (Data Clerk View) [3 mins]**
*Action*: Switch to Facility Data Clerk role. Open the Registration Wizard.
*Talking Points*: 
- Show how easy it is to register a new presumptive patient.
- Demonstrate duplicate detection logic (if applicable).
- Complete the "Demographics" and "Screening" stages. 
- Highlight that the UI is optimized for quick entry and low bandwidth.

**3. Diagnosis and Treatment Workflow [3 mins]**
*Action*: Fast-forward to an existing patient who is MTB+ but hasn't started treatment.
*Talking Points*: 
- Show the alert generated for "Delayed Treatment".
- Navigate to the Treatment Initiation stage. Log baseline weight and regimen.
- Demonstrate Program Rules: showing HIV status fields automatically if HIV+.

**4. Follow-up and Defaulter Tracing [2 mins]**
*Action*: Open the "Defaulter List" tab.
*Talking Points*:
- Explain how DHIS2 program rules identify missed appointments.
- Show the list of patients requiring follow-up or contact tracing.

**5. Mobile & Offline Readiness [2 mins]**
*Action*: Show screenshots or a live emulator of the DHIS2 Android Capture app.
*Talking Points*:
- Assure the committee that the metadata is 100% compatible with the official Android app.
- Explain offline sync capabilities for rural facilities.

**6. Architecture & Security [3 mins]**
*Action*: Briefly show the User Role matrix and Metadata Dictionary docs.
*Talking Points*:
- Emphasize the "DHIS2-native" approach (no shadow databases).
- Highlight strict RBAC, data encryption, and compliance with MoH privacy guidelines.

**7. Q&A and Next Steps [5 mins]**
