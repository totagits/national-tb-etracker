# Technical Architecture Document

## 1. System Overview
The National TB e-Tracker is an integrated health information architecture centered on the DHIS2 platform. It adheres to a "DHIS2-native first" principle, ensuring all patient-level TB data is captured, stored, and analyzed within DHIS2.

## 2. Layered Architecture

### 2.1 DHIS2 Core Layer (System of Record)
- **Host**: National DHIS2 instance.
- **Implementation**: TB e-Tracker is configured as a longitudinal DHIS2 Tracker Program.
- **Data Model**: Tracked Entity Type (TB Patient), Tracked Entity Attributes, Program Stages, and Data Elements.
- **Environment**: Staging and Production environments for metadata validation and deployment.

### 2.2 Custom App Layer (Presentation & UX)
- **Purpose**: Modern, professional, responsive interface for facility data clerks, clinicians, and program officers.
- **Tech Stack**: React 18, TypeScript, DHIS2 Application Platform, `@dhis2/app-runtime`, `@dhis2/ui`, Recharts.
- **Alternatively**: Standalone Vite + React + Tailwind CSS client, using DHIS2 strictly as the backend API.
- **Features**: Patient search, registration wizard, timeline-based data entry, dynamic alerts, and analytical dashboards.

### 2.3 API and Integration Layer
- **Interfaces**: DHIS2 Web API and DHIS2 Tracker API.
- **Security**: Secure environment variables, no hardcoded credentials.
- **Resilience**: Conflict handling, retry logic, validation handling, and offline-aware abstraction services.

### 2.4 Mobile and Offline Layer
- **Tool**: DHIS2 Android Capture app compatibility.
- **Design Considerations**: Low-bandwidth optimized, offline synchronization support, logical field groupings, and short labels suitable for mobile data entry in rural health facilities.

### 2.5 Security Layer
- **Access Control**: Strict Role-Based Access Control (RBAC) and Organization Unit-based restrictions.
- **Data Protection**: TLS/HTTPS, minimization of PII, least privilege principles, and secure audit logs.
- **Compliance**: Adherence to Ministry of Health privacy requirements.

### 2.6 Analytics Layer
- **Primary Analytics**: DHIS2 native program indicators and dashboards.
- **Custom Visualizations**: Recharts within the Custom App Layer for specialized visualizations (e.g., Treatment Cascade).
- **Scope**: Facility, County, and National level analysis, with filtering by age, sex, TB type, and outcome.

## 3. Deployment Strategy
- **Infrastructure**: Nginx reverse proxy, CI/CD pipelines (GitHub Actions), Docker for staging/demo environments.
- **Rollout**: 31 high-burden facilities initially, with scalable infrastructure for full national deployment under GC8.
