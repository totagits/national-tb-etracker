# User Role and Access Control Matrix

## 1. Core Principles
- **Least Privilege**: Users only have access to the data required to perform their specific duties.
- **Organization Unit Restrictions**: Facility users can only see patients registered at their facility. County officers can see all facilities within their county. National officers have nationwide view.
- **Confidentiality**: Access to PII and sensitive data (e.g., HIV status) is tightly controlled and audited.

## 2. Role Definitions and Permissions

| Role Name | Scope | View Patients | Edit Patients | View Dashboards | Admin Access |
|---|---|---|---|---|---|
| **National System Administrator** | National | Yes | Yes | Yes | Full (Metadata, Users, OrgUnits) |
| **National TB Program Manager** | National | Yes (Aggregated/De-identified) | No | Yes (All) | No |
| **National HMIS/M&E Officer** | National | Yes | Yes | Yes (All) | Partial (Data Quality) |
| **County Health Team TB Officer** | County | Yes (County only) | Yes (County only)| Yes (County only)| No |
| **Facility Clinician** | Facility | Yes (Facility only) | Yes (Facility only) | Yes (Facility only) | No |
| **Facility Data Clerk** | Facility | Yes (Facility only) | Yes (Facility only) | Yes (Facility only) | No |
| **Laboratory Officer** | Facility/County | Yes (Assigned OrgUnits)| Yes (Lab stages only)| Yes (Lab Dashboards)| No |
| **Plan / MoH Read-Only Viewer** | National | Yes (De-identified) | No | Yes (All) | No |

## 3. Data Sharing and Protection Rules
1. **Transfer/Referral Visibility**: When a patient is transferred from Facility A to Facility B, Facility B gains read/write access to the Tracker record. Facility A retains read-only historical access.
2. **Audit Logs**: All metadata changes, patient record creations, and edits are logged natively within DHIS2.
3. **Demo Evaluator User**: A mock role configured specifically for the tender evaluation, populated with synthetic data only.
