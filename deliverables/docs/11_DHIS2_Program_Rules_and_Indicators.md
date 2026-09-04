# DHIS2 Program Rules, Validation Logic, and Indicators Analysis

As part of the expert analysis required for the National TB e-Tracker, we must define the behavioral logic that governs the system. DHIS2 relies on **Program Rules**, **Validation Rules**, and **Program Indicators** to ensure data quality, trigger alerts, and provide analytical decision support.

## 1. Program Rule Variables
Program Rule Variables are the building blocks of DHIS2 logic. We define variables to pull data from specific Data Elements (DE) or Tracked Entity Attributes (TEA) into our rules.

- `V{enrollment_date}`: The date the patient enrolled in the TB program.
- `V{event_date}`: The date the clinical event occurred.
- `#{cough_duration}`: Data Element capturing cough length (Stage 1).
- `#{gene_xpert_result}`: Data Element capturing GeneXpert MTB result (Stage 2).
- `#{rif_resistance}`: Data Element capturing Rifampicin Resistance (Stage 2).
- `#{hiv_status}`: Data Element capturing baseline HIV status (Stage 4).
- `#{viral_load_result}`: Data Element capturing copies/ml (Stage 4).

## 2. Core Program Rules & Actions

### Rule 1: Presumptive TB Auto-Classification
- **Expression**: `#{cough_duration} == '>= 2 weeks' || #{fever} == 'Yes' || #{weight_loss} == 'Yes'`
- **Action**: Assign value `Yes` to the `#{presumptive_tb}` Data Element and Display Warning: *"Patient is presumptive for TB. Proceed to Diagnostic Stage."*

### Rule 2: Drug-Resistant TB (DR-TB) Referral Alert
- **Expression**: `#{rif_resistance} == 'Detected'`
- **Action**: Show Error/Warning: *"Rifampicin Resistance Detected. Urgent DR-TB workflow and referral required."* Send Message to County M&E Officer.

### Rule 3: TB/HIV Co-Infection ART Alert
- **Expression**: `#{hiv_status} == 'Positive' && #{art_status} == 'Not on ART'`
- **Action**: Display Key Data (Widget): *"Patient is HIV Positive but not on ART. Initiate ART referral immediately."*

### Rule 4: Dynamic Field Hiding (Sex-Specific)
- **Expression**: `A{TEA_SEX} == 'M'`
- **Action**: Hide Field: `#{pregnancy_status}`. This ensures data clerks do not accidentally enter pregnancy data for males, improving data quality.

### Rule 5: Defaulter Risk (Missed Appointment)
- **Expression**: `d2:daysBetween(V{event_date}, V{current_date}) > 0 && #{appointment_status} == 'Missed'`
- **Action**: Send Alert to Facility Data Clerk and highlight the patient in the Defaulter Dashboard.

## 3. Validation Rules (Strict Data Quality)

Validation Rules differ from Program Rules in that they prevent the user from completing the form if the logic fails.

- **VR1 (Chronology)**: `#{treatment_start_date} >= #{diagnostic_date}`. Treatment cannot begin before the diagnosis is recorded.
- **VR2 (Outcomes)**: If `#{outcome}` is 'Cured', then `#{final_smear_result}` must be 'Negative'.
- **VR3 (Sample Collection)**: `#{diagnostic_date} >= #{sputum_collection_date}`.

## 4. Program Indicators (Analytics)

Program Indicators are aggregated metrics used in our Dashboards.

- **TB Case Detection Rate**: 
  - *Numerator*: Count of Enrolled instances where `#{tb_classification}` is not null.
  - *Denominator*: Estimated Presumptive Cases (or Total Screened).
- **Treatment Success Rate**:
  - *Numerator*: Count of instances where `#{outcome} == 'Cured' || #{outcome} == 'Treatment Completed'`.
  - *Denominator*: Total cohort started on treatment in the same period.
- **TB/HIV Co-infection Rate**:
  - *Numerator*: Count of instances where `#{hiv_status} == 'Positive'`.
  - *Denominator*: Total diagnosed TB cases.

## 5. Next Steps for Implementation
These logical expressions are mapped directly into the DHIS2 metadata JSON payload under the `programRules`, `programRuleVariables`, `programRuleActions`, and `programIndicators` arrays. During the **Pilot Phase**, these thresholds (e.g., alert timing) must be fine-tuned based on Ministry of Health feedback.
