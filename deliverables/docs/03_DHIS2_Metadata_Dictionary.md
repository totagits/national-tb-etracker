# DHIS2 Metadata Dictionary

## 1. Tracked Entity Type
- **Name**: TB Patient (or Person)

## 2. Tracked Entity Attributes (TEAs)
- System-generated unique TB Tracker ID
- National patient identifier
- TB registration number
- Facility TB register number
- First name, Middle name, Last name (or pseudonymous identifier)
- Sex
- Date of birth / Estimated age
- Age group (auto-calculated)
- Location: County, District, Facility, Community
- Phone number / Contact person
- Pregnancy status
- Key population / Vulnerability marker
- Baseline HIV status
- Previous TB treatment history
- Drug resistance risk factor
- Transfer-in status
- Registration date / Enrollment date

## 3. Tracker Program Stages

### Stage 1: TB Screening and Presumptive Case Identification
- **Data Elements**: Screening date, Location, Cough duration, Fever, Night sweats, Weight loss, Hemoptysis, Contact with TB patient, Presumptive TB result, Referral for diagnosis.
- **Program Rules**: Auto-classify as presumptive TB if cough >= 2 weeks; Trigger diagnostic evaluation alert.

### Stage 2: TB Diagnosis and Laboratory
- **Data Elements**: Diagnostic date, Method, Sputum collection date, GeneXpert result, Smear microscopy, Culture, Chest X-ray, Clinical diagnosis, TB site, Bacteriologically confirmed/Clinically diagnosed, Drug resistance status.
- **Program Rules**: Result date >= sample collection date. GeneXpert MTB+ triggers treatment initiation alert. Rifampicin resistance triggers DR-TB workflow.

### Stage 3: Treatment Initiation
- **Data Elements**: Treatment start date, Patient type (new, relapse, etc.), TB classification, Regimen, DOT option, Baseline weight, Treatment supporter assigned.
- **Program Rules**: Treatment start >= diagnosis date. Generate delayed treatment alerts. Calculate next appointment date.

### Stage 4: TB/HIV Co-Infection Management
- **Data Elements**: HIV test date, Result, ART enrollment status, ART start date, Viral load due date, Viral load result, CPT status.
- **Program Rules**: Flag unsuppressed viral load. Trigger ART initiation alerts. Avoid duplicating HIV Tracker fields.

### Stage 5: Follow-Up Monitoring (Repeatable)
- **Data Elements**: Visit date, Follow-up month, Appointment status, Weight, Adherence status, Missed doses, Adverse events, Sputum follow-up result, Next appointment date.
- **Program Rules**: Missed visits trigger defaulter alerts. Poor adherence flags for counseling.

### Stage 6: Contact Investigation (Repeatable)
- **Data Elements**: Number of household contacts, Screened, Presumptive, Diagnosed, Eligible for TPT, Started on TPT.
- **Program Rules**: Recommend contact tracing for bacteriologically confirmed pulmonary TB.

### Stage 7: Transfer and Referral
- **Data Elements**: Referral date, Origin, Destination, Reason, Acceptance status, Transfer-out/in dates.
- **Program Rules**: Pending transfers appear on dashboards. Access shared across org units upon transfer.

### Stage 8: Treatment Outcome
- **Data Elements**: Outcome date, Outcome (Cured, Completed, Failed, Died, LTFU, Not evaluated, Transferred out), Final smear result, Closure status.
- **Program Rules**: Outcome date >= treatment start. Cured requires bacteriological confirmation logic. Case closure locks edits.
