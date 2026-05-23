# National TB e-Tracker — Ministry of Health, Liberia

<div align="center">
  <img src="https://moh-lr.org/wp-content/uploads/2021/06/MOH-LOGO.png" alt="MoH Liberia Logo" width="120" />
  <h3>National TB Electronic Tracking System</h3>
  <p>Built for the Ministry of Health, Republic of Liberia · National TB Control Programme</p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
  ![DHIS2](https://img.shields.io/badge/DHIS2-Tracker-FF6B35)
  ![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)
  ![Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Deployed-4285F4?logo=googlecloud)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## 📋 Overview

The **National TB e-Tracker** is a comprehensive, patient-level tuberculosis case management and surveillance system developed for the **Ministry of Health (MoH), Republic of Liberia**. Built on modern web technologies and designed to integrate with DHIS2 Tracker, it enables real-time monitoring of the full TB treatment cascade across all 15 counties of Liberia.

This system was developed in response to the Terms of Reference (ToR) issued by the MoH National TB Control Programme for the *Development of a TB e-Tracker in DHIS2*.

---

## 🌐 Live Deployment

**Production URL:** https://tb-tracker-demo-1003650380242.us-central1.run.app

Deployed on **Google Cloud Run** — auto-scaling, serverless, always-on.

---

## ✨ Features

### 🏥 Multi-Role Dashboards
| Role | Dashboard | Key Capabilities |
|------|-----------|-----------------|
| **MoH National Admin** | National Analytics | County-level KPIs, trend charts, facility performance, cohort analysis |
| **County HMIS Officer** | County Dashboard | County surveillance, facility oversight, defaulter alerts |
| **Facility Data Clerk** | Facility Dashboard | Patient registration, follow-up entry, defaulter tracing |
| **Programme Manager** | Manager Dashboard | Strategic indicators, WHO reporting, partner coordination |
| **System Admin** | DHIS2 Config | Metadata management, program stages, indicators, option sets |
| **Training Officer** | Training Library | SOPs, videos, eLearning modules, reference cards |

### 📊 Core Functionality
- **Patient Registration Wizard** — Step-by-step TB patient enrollment with auto-generated TB IDs
- **Clinical Chart** — Full patient treatment timeline, bacteriological results, adherence tracking
- **Defaulter Tracing** — Automated LTFU identification with tracing workflow
- **WHO Screening Tool** — AI-assisted symptom screening with risk stratification
- **Treatment Outcome Recording** — WHO-compliant outcome classification (Cured, Completed, LTFU, Died, Failed)
- **DHIS2 Metadata Manager** — Program stages, data elements, option sets, indicators, program rules

### 📄 Professional PDF Generation
- **Patient Clinical Reports** — 2-page A4 PDFs with MoH letterhead, demographics, treatment timeline, lab results, signature blocks
- **Training Documents** — Multi-page PDFs with cover page, section content, WHO definition tables
- **National Programme Reports** — Landscape A4 with KPI tiles, county performance tables, trend analysis

### 📱 Progressive Web App (PWA)
- Installable on Android and desktop
- Offline-capable with service worker caching
- Optimized for low-bandwidth environments in rural Liberia

### 🔗 Project Stakeholders (Hyperlinked)
- [Ministry of Health, Liberia](https://moh-lr.org)
- [WHO Liberia](https://www.afro.who.int/countries/liberia)
- [Global Fund](https://www.theglobalfund.org)
- [USAID Liberia](https://www.usaid.gov/liberia)
- [CDC Global](https://www.cdc.gov/globalhealth)
- [DHIS2 (UiO)](https://dhis2.org)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Icons** | Lucide React |
| **PWA** | Vite PWA Plugin (Workbox) |
| **Containerization** | Docker / Google Cloud Buildpacks |
| **Hosting** | Google Cloud Run |
| **Backend Integration** | DHIS2 Tracker API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run Locally

```bash
# Clone the repository
git clone https://github.com/totagits/national-tb-etracker.git
cd national-tb-etracker/webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Google Cloud Run

```bash
gcloud run deploy tb-tracker-demo \
  --source ./webapp \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📁 Project Structure

```
national-tb-etracker/
├── webapp/                          # React/TypeScript PWA
│   ├── public/
│   │   ├── icons/                   # PWA icons (MoH logo)
│   │   └── assets/                  # Static assets
│   ├── src/
│   │   ├── components/              # Dashboard components
│   │   │   ├── NationalAdminDashboard.tsx
│   │   │   ├── CountyDashboard.tsx
│   │   │   ├── FacilityDashboard.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   ├── DHIS2Dashboard.tsx   # Metadata management
│   │   │   ├── TrainingDashboard.tsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── pdfGenerator.ts      # Professional PDF generation
│   │   ├── App.tsx                  # Root component + Patient Search
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── .gitignore
```

---

## 📖 Official Documentation

Included within the DHIS2 System Administration dashboard:

| Document | Description |
|----------|-------------|
| **Metadata Dictionary** | All DHIS2 tracked entity attributes, data elements, and option sets |
| **System Configuration** | Program stages, program rules, indicators, and sharing settings |
| **Workflow Diagrams** | TB treatment cascade and data entry workflow |
| **User Guides** | Role-specific guides for all 6 user roles |

---

## 🧩 DHIS2 Program Configuration

| Component | Count |
|-----------|-------|
| Program Stages | 8 |
| Tracked Entity Attributes | 12 |
| Data Elements | 66 |
| Option Sets | 14 |
| Program Indicators | 18 |
| Program Rules | 24 |

**Program:** TB Case-Based Surveillance
**Tracked Entity Type:** Person
**Program Type:** Tracker Program (with registration)

---

## 📊 Key Performance Indicators

- **Treatment Success Rate** — Target: ≥85% (WHO End TB Strategy)
- **Lost to Follow-up Rate** — Target: <5%
- **GeneXpert Testing Coverage** — Target: ≥80%
- **HIV Testing Coverage** — Target: 100%
- **Data Completeness** — Target: ≥95%

---

## 🤝 Contributing

This is a government health information system. For contributions, please contact:

- **National HMIS Unit:** hmis@moh.gov.lr
- **Technical Lead:** TOTAG Group — tis@totaggroup.com

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Ministry of Health · Republic of Liberia</strong><br/>
  National TB Control Programme · HMIS Unit<br/>
  <em>Built with ❤️ for better TB outcomes in Liberia</em>
</div>
