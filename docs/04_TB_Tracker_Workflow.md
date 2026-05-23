# TB Tracker Workflow

## 1. Patient Workflow Diagram

```mermaid
graph TD
    A[Patient arrives at Facility] --> B(Stage 1: TB Screening)
    B --> C{Presumptive TB?}
    C -- No --> D[Routine Care / Discharge]
    C -- Yes --> E(Stage 2: Diagnosis & Lab)
    
    E --> F{Diagnostic Result}
    F -- Negative --> G[Evaluate for other conditions]
    F -- Positive / Clinical --> H(Stage 3: Treatment Initiation)
    
    H --> I{HIV Status}
    I -- Positive --> J(Stage 4: TB/HIV Co-Infection Mgmt)
    I -- Negative / Unknown --> K
    
    J --> K(Stage 5: Follow-Up Monitoring - Monthly)
    K --> L{Is Contact Tracing Req?}
    L -- Yes --> M(Stage 6: Contact Investigation)
    L -- No --> N
    
    M --> N{Transfer Required?}
    N -- Yes --> O(Stage 7: Transfer/Referral)
    N -- No --> P
    
    O --> P{Treatment Duration Complete?}
    P -- No --> K
    P -- Yes --> Q(Stage 8: Treatment Outcome)
    
    Q --> R((Case Closed))
```

## 2. Key Workflow Roles
1. **Facility Data Clerk / Clinician**: Conducts screening, registers patients, initiates treatment, logs follow-ups and outcomes.
2. **Laboratory Officer**: Inputs GeneXpert, Smear, and Culture results into Stage 2 and Follow-up stages.
3. **County M&E Officer**: Monitors dashboards for missed appointments, data quality, and cohort reporting.
4. **National TB Program Officer**: Analyzes national treatment cascades, case detection rates, and TB/HIV co-infection statistics.
5. **System Administrator**: Manages metadata, user roles, facility assignments, and system maintenance.

## 3. Critical Alert Triggers
- **Overdue Diagnosis**: Presumptive case logged, but no diagnostic results within X days.
- **Delayed Treatment**: MTB+ detected, but no treatment start date logged within X days.
- **Defaulter Risk**: Missed follow-up appointment.
- **DR-TB Alert**: Rifampicin resistance detected (requires immediate DR-TB referral).
- **TB/HIV Action**: HIV+ patient not on ART or lacking recent viral load results.
