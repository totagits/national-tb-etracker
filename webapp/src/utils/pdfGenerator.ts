/**
 * pdfGenerator.ts
 * Professional PDF generation for the MoH Liberia TB e-Tracker system.
 * Uses jsPDF + jspdf-autotable for branded, print-ready documents.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Brand colours ──────────────────────────────────────────────────────────────
const NAVY   = [30,  58,  95]  as [number,number,number]; // #1e3a5f
const BLUE   = [44,  82, 130]  as [number,number,number]; // #2c5282
const TEAL   = [19, 130, 117]  as [number,number,number]; // #138275
const AMBER  = [180,120,  30]  as [number,number,number]; // amber
const RED    = [185,  28,  28]  as [number,number,number]; // red
const GREEN  = [ 21, 128,  61]  as [number,number,number]; // green
const LIGHT  = [241, 245, 249]  as [number,number,number]; // #f1f5f9
const WHITE  = [255, 255, 255]  as [number,number,number];
const DARK   = [ 26,  26,  26]  as [number,number,number];
const GREY   = [100, 116, 139]  as [number,number,number];
const LGREY  = [226, 232, 240]  as [number,number,number];

// ── Helpers ────────────────────────────────────────────────────────────────────
const setFill   = (doc: jsPDF, c: [number,number,number]) => doc.setFillColor(...c);
const setStroke = (doc: jsPDF, c: [number,number,number]) => doc.setDrawColor(...c);
const setFont   = (doc: jsPDF, size: number, style: 'normal'|'bold'='normal', color: [number,number,number]=DARK) => {
  doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...color);
};

// ── Shared: MoH Header banner ──────────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  const W = doc.internal.pageSize.getWidth();
  // Background banner
  setFill(doc, NAVY); doc.rect(0, 0, W, 38, 'F');
  // Accent stripe
  setFill(doc, TEAL); doc.rect(0, 38, W, 3, 'F');
  // Flag emoji placeholder - draw a small 🇱🇷 box
  setFill(doc, WHITE); doc.roundedRect(10, 8, 22, 22, 2, 2, 'F');
  setFont(doc, 12, 'bold', NAVY); doc.text('MoH', 12.5, 22);
  // Title text
  setFont(doc, 15, 'bold', WHITE); doc.text(title, 36, 16);
  setFont(doc, 8, 'normal', [180,200,230] as any); doc.text(subtitle, 36, 24);
  setFont(doc, 7, 'normal', [150,175,210] as any);
  const now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});
  doc.text(`Generated: ${now}  |  CONFIDENTIAL`, 36, 32);
}

// ── Shared: Footer ─────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  setFill(doc, LIGHT); doc.rect(0, H - 14, W, 14, 'F');
  setStroke(doc, LGREY); doc.setLineWidth(0.3); doc.line(0, H - 14, W, H - 14);
  setFont(doc, 7, 'normal', GREY);
  doc.text('TB e-Tracker v2.0  ·  Ministry of Health, Republic of Liberia  ·  National HMIS Programme', 10, H - 5);
  doc.text(`Page ${pageNum} of ${totalPages}`, W - 10, H - 5, { align: 'right' });
}

// ── Shared: Section header bar ─────────────────────────────────────────────────
function sectionBar(doc: jsPDF, y: number, label: string): number {
  const W = doc.internal.pageSize.getWidth();
  setFill(doc, LIGHT); doc.rect(10, y, W - 20, 8, 'F');
  setFill(doc, NAVY);  doc.rect(10, y, 3, 8, 'F');
  setFont(doc, 8, 'bold', NAVY); doc.text(label.toUpperCase(), 16, y + 5.5);
  return y + 12;
}

// ── Shared: Key-value info grid ────────────────────────────────────────────────
function infoGrid(doc: jsPDF, y: number, pairs: [string, string][], cols = 2): number {
  const W = doc.internal.pageSize.getWidth();
  const colW = (W - 20) / cols;
  const rowH = 12;
  let col = 0; let row = 0;
  pairs.forEach(([k, v]) => {
    const x = 10 + col * colW;
    const yy = y + row * rowH;
    setFill(doc, WHITE); setStroke(doc, LGREY); doc.setLineWidth(0.2);
    doc.roundedRect(x + 1, yy, colW - 2, rowH - 1, 1, 1, 'FD');
    setFont(doc, 7, 'bold', GREY); doc.text(k.toUpperCase(), x + 4, yy + 4.5);
    setFont(doc, 8, 'bold', DARK); doc.text(v, x + 4, yy + 9.5);
    col++;
    if (col >= cols) { col = 0; row++; }
  });
  const totalRows = Math.ceil(pairs.length / cols);
  return y + totalRows * rowH + 4;
}

// ══════════════════════════════════════════════════════════════════════════════
//  1. PATIENT REPORT PDF
// ══════════════════════════════════════════════════════════════════════════════
export function generatePatientReportPDF(patient: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Page 1 ──────────────────────────────────────────────────────────────────
  drawHeader(doc, 'TB Patient Clinical Report', 'TB e-Tracker  ·  Ministry of Health, Liberia');

  let y = 48;

  // Patient name banner
  setFill(doc, BLUE); doc.roundedRect(10, y, W - 20, 16, 2, 2, 'F');
  setFont(doc, 14, 'bold', WHITE);  doc.text(patient.name, 16, y + 7);
  setFont(doc, 8,  'normal', [180,200,230] as any);
  doc.text(patient.id, 16, y + 13);
  // Status badge
  const statusColor: Record<string,[number,number,number]> = {
    'On Treatment': BLUE, 'Cured': GREEN, 'Lost to Follow-up': RED,
    'Treatment Completed': GREEN, 'Presumptive': AMBER, 'Failed': RED,
  };
  const sc = statusColor[patient.status] ?? GREY;
  setFill(doc, sc);
  const badgeW = doc.getTextWidth(patient.status) + 8;
  doc.roundedRect(W - 20 - badgeW, y + 4, badgeW, 8, 2, 2, 'F');
  setFont(doc, 7, 'bold', WHITE); doc.text(patient.status, W - 16 - badgeW/2, y + 9.5, { align: 'center' });
  y += 22;

  // Demographics
  y = sectionBar(doc, y, '1. Patient Demographics');
  y = infoGrid(doc, y, [
    ['TB Registration ID', patient.id],
    ['Full Name', patient.name],
    ['Age', `${patient.age} years`],
    ['Sex', patient.sex === 'M' ? 'Male' : 'Female'],
    ['Facility', patient.facility],
    ['County', patient.facility.includes('Monrovia') ? 'Montserrado' : patient.facility.includes('Phebe') ? 'Bong' : 'Lofa'],
    ['HIV Status', 'Negative'],
    ['Patient Type', 'New Case'],
  ], 2);

  // Treatment
  y = sectionBar(doc, y, '2. Treatment Details');
  y = infoGrid(doc, y, [
    ['TB Classification', 'Pulmonary TB (Bacteriologically Confirmed)'],
    ['Treatment Regimen', 'Category 1 — 2HRZE/4HR'],
    ['Enrollment Date', '2026-01-25'],
    ['Expected End Date', '2026-07-25'],
    ['Prescribing Clinician', 'Dr. J. Kollie, MB ChB'],
    ['Treatment Month', patient.status === 'Cured' ? '6 (Completed)' : '4'],
    ['Adherence Rate', '94%'],
    ['Weight at Start', '58 kg'],
  ], 2);

  // Progress bar
  const pct = patient.status === 'Cured' || patient.status === 'Treatment Completed' ? 100
    : patient.status === 'On Treatment' ? 67 : 45;
  y += 2;
  setFont(doc, 7, 'bold', NAVY); doc.text('TREATMENT PROGRESS', 10, y);
  setFont(doc, 7, 'normal', GREY); doc.text(`${pct}% complete`, W - 10, y, { align: 'right' });
  y += 3;
  setFill(doc, LGREY); doc.roundedRect(10, y, W - 20, 5, 2, 2, 'F');
  setFill(doc, pct === 100 ? GREEN : BLUE);
  doc.roundedRect(10, y, (W - 20) * pct / 100, 5, 2, 2, 'F');
  y += 10;

  // Clinical timeline
  y = sectionBar(doc, y, '3. Clinical Timeline');
  const timeline = [
    { date: '2026-01-15', stage: 'TB Screening',            detail: 'Presumptive TB identified. Cough >2 weeks, night sweats.', status: 'done' },
    { date: '2026-01-18', stage: 'Diagnostic Investigation', detail: `GeneXpert MTB/RIF test ordered. Sputum collected at ${patient.facility}.`, status: 'done' },
    { date: '2026-01-21', stage: 'Diagnosis Confirmed',      detail: 'MTB Detected. RIF resistance NOT detected. Pulmonary TB confirmed.', status: 'done' },
    { date: '2026-01-25', stage: 'Treatment Initiated',      detail: 'Category 1 regimen started: 2HRZE/4HR. Baseline liver function normal.', status: 'done' },
    { date: '2026-03-01', stage: 'Month 2 Follow-up',        detail: 'Sputum smear negative. Weight +3 kg. Adherence 94%. No adverse events.', status: 'done' },
    { date: '2026-05-01', stage: 'Month 5 Follow-up',        detail: patient.status === 'Cured' ? 'End-of-treatment sputum negative. Outcome: CURED.' : patient.status === 'Lost to Follow-up' ? 'Missed appointment. Defaulter tracing initiated.' : 'Ongoing treatment. Next sputum smear scheduled.', status: patient.status === 'On Treatment' ? 'active' : 'done' },
  ];

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Stage', 'Clinical Notes', 'Status']],
    body: timeline.map(e => [e.date, e.stage, e.detail, e.status === 'active' ? 'Active' : 'Completed']),
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: LGREY },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 100 },
      3: { cellWidth: 20, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const v = data.cell.raw as string;
        if (v === 'Active') data.cell.styles.textColor = AMBER as any;
        if (v === 'Completed') data.cell.styles.textColor = GREEN as any;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Bacteriological results
  y = sectionBar(doc, y, '4. Bacteriological Results');
  const labRows = [
    ['2026-01-18', 'GeneXpert MTB/RIF', patient.facility, 'MTB DETECTED / RIF Susceptible', 'Positive'],
    ['2026-01-19', 'Sputum Smear (AFB)', patient.facility, '2+ Positive', 'Positive'],
    ['2026-03-01', 'Sputum Smear (Month 2)', patient.facility, 'Negative', 'Negative'],
  ];
  if (patient.status === 'Cured') labRows.push(['2026-07-01', 'End-of-Tx Sputum Smear', patient.facility, 'Negative — Cured', 'Negative']);

  autoTable(doc, {
    startY: y,
    head: [['Test Date', 'Test Type', 'Laboratory', 'Result', 'Interpretation']],
    body: labRows,
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: LGREY },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const v = data.cell.raw as string;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = (v === 'Negative' ? GREEN : v === 'Positive' ? RED : GREY) as any;
      }
    },
  });

  // Page 2 — declarations
  doc.addPage();
  drawHeader(doc, 'TB Patient Clinical Report (cont.)', `${patient.name}  ·  ${patient.id}`);
  y = 48;
  y = sectionBar(doc, y, '5. Clinical Notes & Remarks');
  setFill(doc, WHITE); setStroke(doc, LGREY); doc.setLineWidth(0.2);
  doc.roundedRect(10, y, W - 20, 35, 2, 2, 'FD');
  setFont(doc, 8, 'normal', DARK);
  doc.text('Patient is compliant with treatment. No drug-related adverse events recorded.', 14, y + 8);
  doc.text('HIV testing offered and completed — result: Negative.', 14, y + 15);
  doc.text('Nutritional support provided via community health volunteer.', 14, y + 22);
  doc.text('Next scheduled appointment: 2026-06-01 (Month 6 sputum smear and outcome assessment).', 14, y + 29);
  y += 40;

  y = sectionBar(doc, y, '6. Authorisation & Certification');
  const sigBox = (label: string, name: string, x: number, bY: number) => {
    setFill(doc, LIGHT); setStroke(doc, LGREY); doc.roundedRect(x, bY, 80, 28, 2, 2, 'FD');
    setFont(doc, 7, 'normal', GREY); doc.text(label, x + 4, bY + 8);
    setFont(doc, 8, 'bold', DARK); doc.text(name, x + 4, bY + 15);
    setStroke(doc, [100,116,139] as any); doc.setLineWidth(0.3); (doc as any).setLineDash([2,1]);
    doc.line(x + 4, bY + 23, x + 76, bY + 23);
    (doc as any).setLineDash([]);
    setFont(doc, 7, 'normal', GREY); doc.text('Signature & Date', x + 4, bY + 27);
  };
  sigBox('Attending Clinician', 'Dr. J. Kollie, MB ChB', 10, y);
  sigBox('Data Entry Clerk', 'Facility HMIS Officer', 95, y);
  sigBox('County HMIS Officer', 'County Health Team', 180, y);
  y += 38;

  // Disclaimer
  setFill(doc, [255,251,235] as any); setStroke(doc, AMBER);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, y, W - 20, 18, 2, 2, 'FD');
  setFont(doc, 7, 'bold', AMBER); doc.text('CONFIDENTIALITY NOTICE', 14, y + 7);
  setFont(doc, 7, 'normal', [100,80,0] as any);
  doc.text('This document contains personal health information protected under the Liberia Data Protection Act.', 14, y + 13);
  doc.text('Unauthorized disclosure is prohibited. Handle, store and dispose of this document securely.', 14, y + 18);

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  doc.save(`TB_Patient_Report_${patient.id}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
//  2. TRAINING DOCUMENT PDF
// ══════════════════════════════════════════════════════════════════════════════
interface DocSection { heading: string; body: string[]; table?: { headers: string[]; rows: string[][] }; }

export function generateTrainingDocPDF(id: string, title: string, category: string) {
  const docData = getDocumentData(id, title, category);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Cover page ──────────────────────────────────────────────────────────────
  // Full-height navy background
  setFill(doc, NAVY); doc.rect(0, 0, W, 50, 'F');
  setFill(doc, TEAL); doc.rect(0, 50, W, 4, 'F');

  // Logo box
  setFill(doc, WHITE); doc.roundedRect(10, 8, 30, 30, 3, 3, 'F');
  setFont(doc, 9, 'bold', NAVY); doc.text('Ministry', 12, 21); doc.text('of Health', 12, 27); doc.text('Liberia', 12, 33);

  // Title
  setFont(doc, 18, 'bold', WHITE); doc.text(title, 10, 70, { maxWidth: W - 20 });

  // Category badge
  const catColor: Record<string,[number,number,number]> = { SOP: TEAL, Reference: BLUE, eLearning: AMBER, Video: RED };
  const cc = catColor[category] ?? GREY;
  setFill(doc, cc);
  const cW = doc.getTextWidth(category) + 10;
  doc.roundedRect(10, 90, cW, 8, 2, 2, 'F');
  setFont(doc, 8, 'bold', WHITE); doc.text(category, 10 + cW/2, 95.5, { align: 'center' });

  // Meta
  setFont(doc, 9, 'normal', DARK);
  const meta = [
    `Document ID: ${id}`,
    `Version: 1.2`,
    `Issuing Authority: National TB Control Programme`,
    `Ministry of Health, Republic of Liberia`,
    `Issue Date: January 2026`,
    `Review Date: January 2027`,
  ];
  meta.forEach((line, i) => { doc.text(line, 10, 108 + i * 8); });

  // Separator
  setFill(doc, LGREY); doc.rect(10, 158, W - 20, 0.5, 'F');

  // WHO logo area + branding strip
  setFill(doc, LIGHT); doc.roundedRect(10, 163, W - 20, 18, 2, 2, 'F');
  setFont(doc, 8, 'bold', NAVY); doc.text('In collaboration with:', 14, 171);
  setFont(doc, 8, 'normal', GREY);
  doc.text('World Health Organization (WHO)  ·  Global Fund  ·  USAID  ·  CDC', 14, 178);

  // Confidentiality footer on cover
  setFill(doc, [255,245,245] as any); setStroke(doc, RED); doc.setLineWidth(0.4);
  doc.roundedRect(10, 188, W - 20, 14, 2, 2, 'FD');
  setFont(doc, 7, 'bold', RED); doc.text('FOR OFFICIAL USE ONLY', 14, 195);
  setFont(doc, 7, 'normal', DARK); doc.text('This document is intended solely for Ministry of Health personnel and authorized partners.', 14, 200);

  // ── Content pages ────────────────────────────────────────────────────────────
  docData.sections.forEach((section: DocSection) => {
    doc.addPage();
    drawHeader(doc, title, `${category}  ·  ${id}  ·  Ministry of Health, Liberia`);
    let y = 48;

    y = sectionBar(doc, y, section.heading);

    // Body text
    section.body.forEach((para: string) => {
      if (!para.trim()) { y += 3; return; }
      // Check if it's a bullet
      const isBullet = para.startsWith('•') || para.startsWith('-') || /^\d+\./.test(para);
      const isNote = para.startsWith('NOTE:') || para.startsWith('WARNING:') || para.startsWith('IMPORTANT:');
      if (isNote) {
        setFill(doc, [255,251,235] as any); setStroke(doc, AMBER); doc.setLineWidth(0.3);
        const lines = doc.splitTextToSize(para, W - 28);
        const boxH = lines.length * 5 + 6;
        doc.roundedRect(10, y, W - 20, boxH, 2, 2, 'FD');
        setFont(doc, 8, 'bold', AMBER); doc.text(lines, 14, y + 5);
        y += boxH + 4;
      } else if (isBullet) {
        setFont(doc, 8, 'normal', DARK);
        const lines = doc.splitTextToSize(para, W - 30);
        setFill(doc, TEAL); doc.circle(14, y + 2, 1, 'F');
        doc.text(lines, 17, y + 3.5);
        y += lines.length * 5 + 2;
      } else {
        setFont(doc, 8, 'normal', DARK);
        const lines = doc.splitTextToSize(para, W - 20);
        doc.text(lines, 10, y);
        y += lines.length * 5 + 3;
      }
      if (y > 250) { doc.addPage(); drawHeader(doc, title, `${category}  ·  ${id}`); y = 48; }
    });

    // Optional table
    if (section.table) {
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [section.table.headers],
        body: section.table.rows,
        margin: { left: 10, right: 10 },
        styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: LGREY },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
    }
  });

  // Footers on all pages (skip cover)
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    drawFooter(doc, i - 1, total - 1);
  }

  doc.save(`${id}_${title.replace(/[^a-zA-Z0-9]/g,'_').slice(0,40)}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
//  3. Document content data
// ══════════════════════════════════════════════════════════════════════════════
function getDocumentData(id: string, title: string, _category: string): { sections: DocSection[] } {
  const DOCS: Record<string, { sections: DocSection[] }> = {
    'MAT-001': { sections: [
      { heading: '1. Introduction & Purpose', body: [
        'The TB e-Tracker is a national patient-level TB surveillance and case management system built on the DHIS2 Tracker platform. It enables real-time monitoring of the full TB treatment cascade across all 15 counties of Liberia.',
        'This User Manual provides step-by-step guidance for all system users including facility data clerks, county HMIS officers, and national program managers.',
        'IMPORTANT: This system handles sensitive patient health data. All users must adhere to the Ministry of Health Data Protection Policy.',
      ]},
      { heading: '2. System Access & Login', body: [
        '• Open your web browser (Google Chrome recommended) and navigate to the TB e-Tracker URL provided by your county HMIS officer.',
        '• Enter your assigned username and password exactly as provided.',
        '• Select your organisation unit (facility) from the hierarchy dropdown.',
        '• Click the "Login" button to access your dashboard.',
        '• If you forget your password, click "Forgot Password" or contact the HMIS helpdesk at helpdesk@moh.gov.lr',
        'NOTE: Your account will be locked after 5 consecutive failed login attempts. Contact your county HMIS officer to unlock.',
      ]},
      { heading: '3. Registering a New TB Patient', body: [
        'Patient registration must be completed within 24 hours of TB diagnosis confirmation.',
        '• From your dashboard, click "Registration Wizard" in the left sidebar.',
        '• Step 1 — Personal Details: Enter Last Name, First Name, Date of Birth, Sex, County, and Facility. All fields marked (*) are mandatory.',
        '• Step 2 — TB Registration ID: This is auto-generated by the system (format: TB-XXXX). Do NOT manually enter an ID.',
        '• Step 3 — Screening Data: Record the screening date and tick all symptoms present.',
        '• Step 4 — Diagnostic Result: Enter the GeneXpert or sputum smear result when available.',
        '• Step 5 — Review and Submit: Confirm all details and click "Enroll Patient".',
        'NOTE: Once a patient is enrolled, their TB Registration ID is permanent and cannot be changed. Contact national HMIS if an error is made.',
      ], table: {
        headers: ['Field', 'Value Type', 'Required', 'Notes'],
        rows: [
          ['Last Name', 'Text', 'Yes', 'As on official ID'],
          ['First Name', 'Text', 'Yes', 'As on official ID'],
          ['Date of Birth', 'Date', 'Yes', 'Format: DD/MM/YYYY'],
          ['Sex', 'Option Set', 'Yes', 'Male / Female / Unknown'],
          ['TB Registration ID', 'Auto-generated', 'Yes', 'Do not modify'],
          ['County', 'Option Set', 'Yes', 'Select from list'],
          ['HIV Status', 'Option Set', 'Yes', 'Record at enrollment'],
        ]
      }},
      { heading: '4. Recording Follow-up Visits', body: [
        'Follow-up events must be entered within 48 hours of the clinical visit.',
        '• Search for the patient using their TB ID or full name via the Patient Search panel.',
        '• Click the patient name to open their treatment record.',
        '• Under "Monthly Treatment Follow-up" (Stage 5), click "New Event".',
        '• Record: Visit date, current weight, adherence percentage, side effects (if any), sputum result (if taken).',
        '• Click "Save" and ensure the data syncs successfully.',
      ]},
      { heading: '5. Treatment Outcomes', body: [
        'Treatment outcomes must be recorded at the end of the 6-month treatment period.',
        '• Open the Treatment Outcome stage (Stage 8) for the patient.',
        '• Select the correct WHO outcome from the dropdown.',
        '• Enter the outcome date and any transfer information if applicable.',
        '• Save and sync immediately.',
        'NOTE: All cohort patients must have an outcome recorded by the 10th of the month following treatment completion.',
      ]},
    ]},
    'MAT-002': { sections: [
      { heading: '1. Getting Started on Android', body: [
        'The DHIS2 Capture Android app enables data entry without a computer and supports offline data collection in low-connectivity areas.',
        '• Download "DHIS2 Capture" from the Google Play Store (free).',
        '• Open the app and enter the server URL when prompted.',
        '• Login with your facility username and password.',
        '• Select "TB Tracker" from the program list.',
        '• Tap "Download Offline Data" to enable offline data entry.',
      ]},
      { heading: '2. Offline Data Entry', body: [
        'All data entry functions work without an internet connection once the app is set up.',
        '• Records created offline are stored securely on your device.',
        '• A sync counter shows the number of pending records.',
        '• To force sync: tap Menu > Settings > Sync Data Now.',
        '• Always sync at least once per day when internet is available.',
        'WARNING: If your device is lost or damaged before syncing, data may be lost. Sync frequently.',
      ]},
      { heading: '3. Common Issues & Solutions', body: [], table: {
        headers: ['Issue', 'Likely Cause', 'Solution'],
        rows: [
          ['Cannot login', 'Wrong credentials or no internet', 'Verify URL and credentials; check internet'],
          ['Sync fails repeatedly', 'Poor internet or server issue', 'Retry after 15 min; contact helpdesk if persistent'],
          ['Patient not found', 'Wrong TB ID format', 'Use format TB-XXXX with hyphen'],
          ['Form fields grayed out', 'Insufficient permissions', 'Contact county HMIS officer'],
          ['App crashes on open', 'Outdated app version', 'Update from Google Play Store'],
          ['Duplicate entry warning', 'Patient already registered', 'Search before registering new patient'],
        ]
      }},
    ]},
    'MAT-003': { sections: [
      { heading: '1. TB Screening Criteria (WHO Standard)', body: [
        'Screen every patient attending a health facility for the following TB symptoms:',
        '• Cough lasting 2 or more weeks (most important symptom)',
        '• Night sweats',
        '• Unexplained weight loss',
        '• Fever lasting more than 2 weeks',
        '• Coughing up blood (hemoptysis)',
        '• History of close contact with a confirmed TB case in the past 12 months',
        'ACTION: If 1 or more symptoms are present → refer immediately for GeneXpert testing.',
      ]},
      { heading: '2. DHIS2 Registration Quick Steps', body: [
        '1. Open TB Tracker → click "Registration Wizard" in the sidebar.',
        '2. Enter all personal details (Last Name, First Name, DOB, Sex, County, Facility).',
        '3. TB Registration ID is auto-generated — note it on the paper register.',
        '4. Record screening date and tick all symptoms present.',
        '5. Enter GeneXpert or sputum smear result as soon as received from lab.',
        '6. If TB confirmed: treatment MUST start within 5 days of diagnosis.',
        'NOTE: The paper TB register and DHIS2 system must match exactly. Discrepancies must be resolved within 24 hours.',
      ]},
      { heading: '3. Key Codes & Definitions', body: [], table: {
        headers: ['Code', 'Full Term', 'Definition'],
        rows: [
          ['PTB', 'Pulmonary TB', 'TB affecting the lungs'],
          ['EPTB', 'Extrapulmonary TB', 'TB affecting organs other than lungs'],
          ['DS-TB', 'Drug-Susceptible TB', 'TB sensitive to first-line drugs'],
          ['DR-TB', 'Drug-Resistant TB', 'TB resistant to one or more first-line drugs'],
          ['LTFU', 'Lost to Follow-up', 'Patient interrupted treatment for 2+ months'],
          ['CUR', 'Cured', 'Bacteriologically confirmed negative at end of treatment'],
          ['CMP', 'Treatment Completed', 'Completed treatment without bacteriological confirmation'],
          ['DIE', 'Died', 'Patient died during treatment for any cause'],
        ]
      }},
    ]},
    'MAT-004': { sections: [
      { heading: '1. WHO TB Treatment Outcome Definitions', body: [], table: {
        headers: ['Outcome', 'Definition', 'Required Evidence'],
        rows: [
          ['Cured', 'Bacteriologically confirmed at start; smear/culture negative at month 5 and end', 'Two negative sputum smear results'],
          ['Treatment Completed', 'Completed treatment; no evidence of failure; no end-of-treatment smear available', 'Clinical confirmation by clinician'],
          ['Treatment Failed', 'Smear/culture positive at month 5 or later during treatment', 'Positive sputum result + clinician review'],
          ['Died', 'Patient died for any reason during treatment', 'Death certificate or clinical record'],
          ['Lost to Follow-up', 'Treatment interrupted for 2+ consecutive months', 'Tracing record confirming non-contact'],
          ['Not Evaluated', 'No outcome assigned by end of cohort', 'Should not exceed 5% of cohort'],
        ]
      }},
      { heading: '2. How to Record Outcomes in DHIS2', body: [
        '1. Locate the patient via Patient Search (use TB ID or full name).',
        '2. Click on the patient to open their full treatment record.',
        '3. Scroll to "Treatment Outcome Recording" (Program Stage 8).',
        '4. Click "New Event" and select the correct outcome from the dropdown list.',
        '5. Enter the outcome date: the date of the last sputum result, or date of death/loss.',
        '6. For Lost to Follow-up: complete the "Last Contact Date" and "Transfer Facility" fields.',
        '7. Click Save and sync immediately.',
        'IMPORTANT: Outcomes must be recorded within 30 days of treatment end. Late recording affects national reporting accuracy.',
      ]},
    ]},
  };
  return DOCS[id] ?? { sections: [{
    heading: `About This Document: ${title}`,
    body: [
      title,
      `Document ID: ${id}  |  Category: ${_category}`,
      '',
      'This training material is part of the TB e-Tracker capacity building programme of the National TB Control Programme, Ministry of Health, Republic of Liberia.',
      '',
      '• For the complete version of this document, contact your County HMIS Officer.',
      '• All training queries: hmis@moh.gov.lr',
      '• Helpdesk: helpdesk@moh.gov.lr  |  +231 886 000 111',
    ]
  }]};
}

// ══════════════════════════════════════════════════════════════════════════════
//  4. NATIONAL TB PROGRAMME REPORT PDF
// ══════════════════════════════════════════════════════════════════════════════
export function generateNationalReportPDF(countyFilter: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  const isAll = countyFilter === 'All 15 Counties';
  const title = isAll ? 'National TB Programme Report' : `${countyFilter} County TB Report`;

  // Header
  setFill(doc, NAVY); doc.rect(0, 0, W, 42, 'F');
  setFill(doc, TEAL); doc.rect(0, 42, W, 3, 'F');
  setFill(doc, WHITE); doc.roundedRect(10, 8, 26, 26, 2, 2, 'F');
  setFont(doc, 8, 'bold', NAVY); doc.text('MoH', 12, 20); doc.text('Liberia', 12, 27);
  setFont(doc, 16, 'bold', WHITE); doc.text(title, 42, 18);
  setFont(doc, 8, 'normal', [180,200,230] as any);
  doc.text('TB e-Tracker  |  National TB Control Programme  |  Ministry of Health, Republic of Liberia', 42, 27);
  const now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});
  setFont(doc, 7, 'normal', [150,175,210] as any);
  doc.text(`Report Period: January - May 2026  |  Generated: ${now}  |  CONFIDENTIAL`, 42, 36);

  let y = 52;

  // KPI summary row
  const kpis = [
    { label: 'Total Registered', value: isAll ? '4,247' : '312', sub: 'new TB patients' },
    { label: 'On Treatment', value: isAll ? '3,186' : '234', sub: 'active cases' },
    { label: 'Treatment Success', value: '89.2%', sub: 'WHO target: >85%' },
    { label: 'Lost to Follow-up', value: '5.8%', sub: 'WHO target: <5%' },
    { label: 'HIV/TB Co-inf.', value: '12.3%', sub: 'co-infected rate' },
    { label: 'GeneXpert Rate', value: '67.1%', sub: 'of presumptives tested' },
  ];
  const kpiW = (W - 20) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 10 + i * kpiW;
    setFill(doc, i % 2 === 0 ? NAVY : BLUE);
    doc.roundedRect(x + 1, y, kpiW - 2, 22, 2, 2, 'F');
    setFont(doc, 16, 'bold', WHITE); doc.text(k.value, x + kpiW/2, y + 12, { align: 'center' });
    setFont(doc, 6, 'bold', [180,200,230] as any); doc.text(k.label.toUpperCase(), x + kpiW/2, y + 18, { align: 'center' });
    setFont(doc, 6, 'normal', [130,160,200] as any); doc.text(k.sub, x + kpiW/2, y + 21.5, { align: 'center' });
  });
  y += 28;

  // County performance table
  y = sectionBar(doc, y, 'County-Level Performance Summary');
  const counties = [
    ['Montserrado', '1,245', '986', '89.4%', '4.2%', '15.1%', '78.3%', 'On Track'],
    ['Nimba',       '687',  '523', '91.2%', '3.8%', '8.7%',  '72.1%', 'On Track'],
    ['Bong',        '445',  '334', '88.9%', '5.1%', '11.2%', '65.4%', 'On Track'],
    ['Margibi',     '389',  '298', '87.3%', '6.2%', '9.8%',  '69.8%', 'At Risk'],
    ['Lofa',        '312',  '245', '90.1%', '4.9%', '10.4%', '71.2%', 'On Track'],
    ['Grand Bassa', '278',  '201', '86.4%', '7.1%', '12.3%', '63.5%', 'At Risk'],
    ['Maryland',    '234',  '178', '85.9%', '8.3%', '14.1%', '58.9%', 'Off Track'],
    ['Grand Gedeh', '198',  '143', '88.2%', '5.9%', '9.6%',  '66.7%', 'On Track'],
    ['Sinoe',       '176',  '134', '84.7%', '9.2%', '13.8%', '55.3%', 'Off Track'],
    ['Other',       '283',  '144', '87.6%', '5.3%', '10.9%', '61.4%', 'On Track'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['County', 'Total Cases', 'Active', 'Tx Success', 'LTFU Rate', 'HIV/TB', 'GeneXpert', 'Status']],
    body: isAll ? counties : counties.filter(r => r[0] === countyFilter.replace(' County', '')),
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.1, lineColor: LGREY },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const v = data.cell.raw as string;
        data.cell.styles.textColor = (v === 'On Track' ? GREEN : v === 'At Risk' ? AMBER : RED) as any;
      }
    },
  });

  // Page 2 - Trend data
  doc.addPage();
  setFill(doc, NAVY); doc.rect(0, 0, W, 42, 'F');
  setFill(doc, TEAL); doc.rect(0, 42, W, 3, 'F');
  setFont(doc, 16, 'bold', WHITE); doc.text(`${title} (cont.) — Trend Analysis`, 10, 24);
  setFont(doc, 8, 'normal', [180,200,230] as any); doc.text('TB e-Tracker  |  Ministry of Health, Republic of Liberia', 10, 35);
  y = 52;

  y = sectionBar(doc, y, 'Monthly Case Notifications — Jan to May 2026');
  autoTable(doc, {
    startY: y,
    head: [['Month', 'Presumptive', 'GeneXpert Tested', 'Confirmed', 'Started Treatment', 'LTFU', 'Cured/Completed']],
    body: [
      ['January 2026',  '312', '224', '198', '192', '8',  '45'],
      ['February 2026', '298', '218', '189', '184', '11', '52'],
      ['March 2026',    '334', '241', '213', '207', '9',  '61'],
      ['April 2026',    '318', '229', '201', '196', '13', '74'],
      ['May 2026',      '287', '208', '178', '174', '7',  '89'],
    ],
    margin: { left: 10, right: 10 },
    styles: { fontSize: 9, cellPadding: 3.5, lineWidth: 0.1, lineColor: LGREY },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  y = sectionBar(doc, y, 'Key Programme Recommendations');
  const recs = [
    '1. GeneXpert testing coverage remains below the 80% national target in 6 counties. Prioritize diagnostic expansion in Sinoe and Maryland.',
    '2. Lost to Follow-up rates in Maryland (8.3%) and Sinoe (9.2%) exceed the WHO 5% threshold. Intensify defaulter tracing activities.',
    '3. HIV testing coverage for TB patients is 94% nationally — maintain and sustain this achievement.',
    '4. Treatment success rate of 89.2% exceeds the WHO End TB target of >85%. Continue to build on best practices from high-performing counties.',
    '5. Data completeness is 96.8% nationally — continue weekly data quality reviews at facility and county level.',
  ];
  recs.forEach((r, i) => {
    setFont(doc, 8, 'normal', DARK);
    const lines = doc.splitTextToSize(r, W - 30);
    if (i % 2 === 0) { setFill(doc, LIGHT); doc.rect(10, y - 1, W - 20, lines.length * 5 + 5, 'F'); }
    setFill(doc, TEAL); doc.circle(15, y + 2, 1.5, 'F');
    doc.text(lines, 20, y + 3.5);
    y += lines.length * 5 + 6;
  });

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const H = doc.internal.pageSize.getHeight();
    setFill(doc, LIGHT); doc.rect(0, H - 12, W, 12, 'F');
    setStroke(doc, LGREY); doc.setLineWidth(0.3); doc.line(0, H - 12, W, H - 12);
    setFont(doc, 7, 'normal', GREY);
    doc.text('TB e-Tracker v2.0  |  National TB Control Programme  |  Ministry of Health, Republic of Liberia  |  CONFIDENTIAL', 10, H - 4);
    doc.text(`Page ${i} of ${total}`, W - 10, H - 4, { align: 'right' });
  }

  doc.save(`National_TB_Report_${countyFilter.replace(/[^a-zA-Z0-9]/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`);
}
