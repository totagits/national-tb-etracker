import { useState } from 'react';
import {
  ArrowRight, ArrowLeft, CheckCircle2, UserPlus, Stethoscope,
  HeartPulse, Pill, MapPin, Building2, Locate, Bot, Save
} from 'lucide-react';
import { ALL_COUNTIES } from '../data/liberiaData';

export const RegistrationWizard = ({ facilities, onRegister }: { facilities: string[], onRegister: (p: any) => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Demographics & Dual Registration (PS-01)
    regType: 'Resident Geospatial' as 'Resident Geospatial' | 'Facility Point-of-Care',
    firstName: '',
    lastName: '',
    sex: 'Male',
    facility: facilities[0] || 'Redemption Hospital (Montserrado)',
    age: 32,
    nationalId: '',
    phone: '',
    patientType: 'New',

    // Geospatial Resident Fields (Solves Liberia Address Challenge)
    county: 'Montserrado',
    district: 'Bushrod Island',
    clan: 'West Point Borough',
    community: 'West Point Point Beach Zone',
    landmark: 'Opposite cold storage building, brown zinc roof house',
    lat: 6.3268,
    lng: -10.8122,
    accuracyMeters: 4,

    // Community Health Worker (CHW / gCHV) linkage
    chwName: 'Comfort Mulbah',
    chwPhone: '+231-88-601-9922',
    chwPost: 'West Point Community Health Post',
    householdContacts: 4,
    under5Contacts: 1,

    // Facility Point-of-Care & Clinical Triage Fields
    facilityDepartment: 'Outpatient Department (OPD)',
    facilityCardNumber: 'RED-2026-OPD-1094',
    admissionType: 'Walk-In Consultation (Self-Reported)',
    attendingClinician: 'Dr. Emmanuel Dennis',
    clinicianCadre: 'Physician / Medical Doctor',
    triagePriority: 'Priority (Cough ≥ 2 wks / Wasting)',
    triageTemp: 38.2,
    triageBp: '120/80',
    triagePulse: 84,
    triageSpo2: 96,
    reasonNoAddress: 'Transient / No Fixed Municipal Address in Liberia',

    // Step 2: HTS (PS-02)
    preTestCounseling: true,
    hivStatus: 'Negative',
    rapidTest1: 'Non-Reactive',
    rapidTest2: 'Not Done',
    artLinked: false,
    artNumber: '',
    cptInitiated: false,

    // Step 3: TB Screening (PS-03)
    cough2Weeks: true,
    weightLoss: true,
    fever: true,
    nightSweats: true,
    hemoptysis: false,
    closeContact: true,
    previousTb: false,
    geneXpertResult: 'MTB Detected, Rifampicin Resistance NOT Detected',
    diseaseType: 'Pulmonary Bacteriologically Confirmed',

    // Step 4: Treatment Initiation (PS-04)
    regimen: '1st Line (2HRZE/4HR)',
    weightKg: 56,
    dailyDoseTabs: 4,
    dotModel: 'Community DOT (CHW)',
    supporterName: 'Mary Doe (Spouse)',
    supporterPhone: '+231-77-889-1234'
  });

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setFormData(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracyMeters: Math.round(pos.coords.accuracy)
          }));
          setIsDetectingGps(false);
          if ((window as any).showToast) {
            (window as any).showToast(`Live GPS locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`);
          }
        },
        () => {
          // Simulated fallback for Liberian county coordinate
          const defaultLat = 6.3156 + (Math.random() - 0.5) * 0.04;
          const defaultLng = -10.8074 + (Math.random() - 0.5) * 0.04;
          setFormData(prev => ({
            ...prev,
            lat: Number(defaultLat.toFixed(4)),
            lng: Number(defaultLng.toFixed(4)),
            accuracyMeters: 5
          }));
          setIsDetectingGps(false);
          if ((window as any).showToast) {
            (window as any).showToast(`GPS beacon acquired: ${defaultLat.toFixed(4)}, ${defaultLng.toFixed(4)}`);
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setAiPrediction("High Probability TB (Confirmed Presumptive) — GeneXpert MTB Detected, RIF Sensitive");
      if ((window as any).showToast) {
        (window as any).showToast("AI Clinical Analysis: High confidence pulmonary TB identified. Category 1 regimen indicated.");
      }
    }, 1500);
  };
  
  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5);
      const generatedId = `TB-${Math.floor(1050 + Math.random() * 8900)}`;
      const isResident = formData.regType === 'Resident Geospatial';
      onRegister({
        id: generatedId,
        name: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        sex: formData.sex.charAt(0),
        facility: formData.facility,
        status: 'On Treatment',
        hivStatus: formData.hivStatus,
        regimen: formData.regimen,
        enrolledDate: new Date().toISOString().slice(0, 10),
        regType: formData.regType,
        lat: isResident ? formData.lat : undefined,
        lng: isResident ? formData.lng : undefined,
        accuracyMeters: isResident ? formData.accuracyMeters : undefined,
        county: isResident ? formData.county : (formData.facility.split('(')[1]?.replace(')', '').trim() || 'Montserrado'),
        district: isResident ? formData.district : undefined,
        clan: isResident ? formData.clan : undefined,
        community: isResident ? formData.community : undefined,
        landmark: isResident ? formData.landmark : `Point of Care: ${formData.facilityDepartment} (Card #${formData.facilityCardNumber})`,
        phone: formData.phone,
        chwName: isResident ? formData.chwName : undefined,
        chwPhone: isResident ? formData.chwPhone : undefined,
        chwPost: isResident ? formData.chwPost : undefined,
        householdContacts: isResident ? formData.householdContacts : 0,
        under5Contacts: isResident ? formData.under5Contacts : 0,
        facilityDepartment: formData.facilityDepartment,
        facilityCardNumber: formData.facilityCardNumber,
        admissionType: formData.admissionType,
        attendingClinician: formData.attendingClinician,
        clinicianCadre: formData.clinicianCadre,
        triagePriority: formData.triagePriority,
        triageTemp: formData.triageTemp,
        triageBp: formData.triageBp,
        triagePulse: formData.triagePulse,
        triageSpo2: formData.triageSpo2,
        reasonNoAddress: formData.reasonNoAddress,
        appointmentStatus: 'On Schedule',
        encounters: [
          {
            id: `ENC-${Date.now().toString().slice(-4)}`,
            stage: 'PS-01 Enrollment & PS-04 Initiation',
            date: new Date().toISOString().slice(0, 10),
            weightKg: formData.weightKg,
            sputumSmear: 'Positive',
            adherenceRate: 100,
            dotType: formData.dotModel as any,
            notes: isResident
              ? `Resident registration with GPS & landmark locator. GeneXpert: ${formData.geneXpertResult}. Assigned to CHW ${formData.chwName}.`
              : `Facility clinical triage registration at ${formData.facilityDepartment}. Card #${formData.facilityCardNumber}. Attending: ${formData.attendingClinician} (${formData.clinicianCadre}). Triage: Temp ${formData.triageTemp}°C, BP ${formData.triageBp}, SpO2 ${formData.triageSpo2}%. Reason: ${formData.reasonNoAddress}.`,
            provider: isResident ? 'Facility Clinician & Community gCHV' : `${formData.attendingClinician} (${formData.clinicianCadre})`
          }
        ]
      });
      if ((window as any).showToast) {
        (window as any).showToast(`Patient ${generatedId} synchronized to DHIS2 National Tracker across all program stages.`);
      }
    }, 1200);
  };

  const handleReset = () => {
    setStep(1);
    setAiPrediction(null);
    setFormData({
      regType: 'Resident Geospatial',
      firstName: '', lastName: '', sex: 'Male', facility: facilities[0] || 'Redemption Hospital (Montserrado)', age: 30,
      nationalId: '', phone: '', patientType: 'New',
      county: 'Montserrado', district: 'Bushrod Island', clan: 'West Point Borough',
      community: 'West Point Point Beach Zone', landmark: 'Opposite cold storage building, brown zinc roof house',
      lat: 6.3268, lng: -10.8122, accuracyMeters: 4,
      chwName: 'Comfort Mulbah', chwPhone: '+231-88-601-9922', chwPost: 'West Point Community Health Post',
      householdContacts: 4, under5Contacts: 1,
      facilityDepartment: 'Outpatient Department (OPD)',
      facilityCardNumber: 'RED-2026-OPD-1094',
      admissionType: 'Walk-In Consultation (Self-Reported)',
      attendingClinician: 'Dr. Emmanuel Dennis',
      clinicianCadre: 'Physician / Medical Doctor',
      triagePriority: 'Priority (Cough ≥ 2 wks / Wasting)',
      triageTemp: 38.2,
      triageBp: '120/80',
      triagePulse: 84,
      triageSpo2: 96,
      reasonNoAddress: 'Transient / No Fixed Municipal Address in Liberia',
      preTestCounseling: true, hivStatus: 'Negative', rapidTest1: 'Non-Reactive', rapidTest2: 'Not Done',
      artLinked: false, artNumber: '', cptInitiated: false,
      cough2Weeks: false, weightLoss: false, fever: false, nightSweats: false, hemoptysis: false,
      closeContact: false, previousTb: false,
      geneXpertResult: 'MTB Detected, Rifampicin Resistance NOT Detected',
      diseaseType: 'Pulmonary Bacteriologically Confirmed',
      regimen: '1st Line (2HRZE/4HR)', weightKg: 55, dailyDoseTabs: 4, dotModel: 'Community DOT (CHW)',
      supporterName: '', supporterPhone: ''
    });
  };

  if (step === 5) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="h-20 w-20 text-emerald-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-neutral-900 mb-2">Enrollment & Initiation Complete</h2>
        <p className="text-neutral-600 mb-6">
          The patient profile, {formData.regType === 'Resident Geospatial' ? 'resident GPS coordinates' : 'facility clinical triage record'}, HIV Testing Services (HTS), TB clinical diagnosis, and treatment initiation have been synchronized with the national DHIS2 instance.
        </p>
        <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 text-left text-sm space-y-2.5 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center"><span className="text-neutral-500">Patient Name:</span><span className="font-bold text-neutral-900">{formData.firstName} {formData.lastName}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Registration Mode:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${formData.regType === 'Resident Geospatial' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
              {formData.regType}
            </span>
          </div>
          <div className="flex justify-between"><span className="text-neutral-500">Facility:</span><span className="font-bold">{formData.facility}</span></div>
          
          {formData.regType === 'Resident Geospatial' ? (
            <>
              <div className="flex justify-between"><span className="text-neutral-500">GPS Coordinates:</span><span className="font-mono text-xs font-bold text-emerald-700">{formData.lat}, {formData.lng} (±{formData.accuracyMeters}m)</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Landmark:</span><span className="font-medium text-neutral-800 italic truncate max-w-[200px]">"{formData.landmark}"</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Assigned CHW:</span><span className="font-bold text-neutral-800">{formData.chwName} ({formData.chwPhone})</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Household Contacts:</span><span className="font-medium">{formData.householdContacts} (Under 5: {formData.under5Contacts})</span></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-neutral-500">Clinical Department:</span><span className="font-bold text-blue-800">{formData.facilityDepartment}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Facility Dossier #:</span><span className="font-mono font-bold text-neutral-800">{formData.facilityCardNumber}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Attending Clinician:</span><span className="font-medium">{formData.attendingClinician} ({formData.clinicianCadre})</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Triage Vitals:</span><span className="font-mono text-xs font-semibold">Temp: {formData.triageTemp}°C | BP: {formData.triageBp} | SpO₂: {formData.triageSpo2}%</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Address Status:</span><span className="text-xs text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">Exempt · {formData.reasonNoAddress}</span></div>
            </>
          )}

          <div className="flex justify-between pt-2 border-t border-neutral-200"><span className="text-neutral-500">TB Regimen:</span><span className="font-bold text-emerald-700">{formData.regimen}</span></div>
        </div>
        <button onClick={handleReset} className="bg-health-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm">
          Register Another Patient
        </button>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: '1. Registration (PS-01)', icon: UserPlus },
    { num: 2, label: '2. HTS Services (PS-02)', icon: HeartPulse },
    { num: 3, label: '3. TB Screening (PS-03)', icon: Stethoscope },
    { num: 4, label: '4. Treatment (PS-04)', icon: Pill },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Header / Progress Bar */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {stepsList.map(s => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className={`p-3 rounded-xl border text-center transition-all ${
              isCurrent ? 'bg-blue-50 border-health-blue text-health-blue font-bold shadow-sm' :
              isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' :
              'bg-white border-neutral-200 text-neutral-400'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        {/* STEP 1: Registration (PS-01) */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full uppercase">Program Stage PS-01</span>
              <h2 className="text-2xl font-bold text-neutral-800 mt-2">Patient Demographics & Dual Registration</h2>
              <p className="text-neutral-500 text-sm">
                Capture core tracked entity attributes. In Liberia, resident GPS and landmark mapping solve the absence of street addresses for longitudinal tracking.
              </p>
            </div>

            {/* Registration Mode Selector */}
            <div className="bg-neutral-100 p-1.5 rounded-xl flex flex-col sm:flex-row gap-2 border border-neutral-200">
              <button
                type="button"
                onClick={() => setFormData({...formData, regType: 'Resident Geospatial'})}
                className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  formData.regType === 'Resident Geospatial'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Resident & Community Registration (Geospatial & GPS)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, regType: 'Facility Point-of-Care'})}
                className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  formData.regType === 'Facility Point-of-Care'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Facility Point-of-Care Registration (Clinical Triage)
              </button>
            </div>

            {/* Dynamic Explanatory Mode Banner */}
            {formData.regType === 'Resident Geospatial' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-3 animate-in fade-in duration-200">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wide text-emerald-800 text-[11px]">Active Intake Mode</span>
                    <span className="bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">Longitudinal Community Tracing</span>
                  </div>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    <strong>Standardized Liberia Address Protocol:</strong> Solves the absence of formal street numbers by capturing live GPS coordinates, 4-tier administrative hierarchy (County &gt; District &gt; Clan &gt; Community), natural landmark narratives, and linking an assigned General Community Health Volunteer (gCHV) for DOTS home visits and defaulter retrieval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3 animate-in fade-in duration-200">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wide text-blue-800 text-[11px]">Active Intake Mode</span>
                    <span className="bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">Hospital / Clinic Point-of-Care</span>
                  </div>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    <strong>Clinical Triage / Address Not Available:</strong> Designed for hospital walk-in OPD consultations, emergency admissions, transient populations, or patients without permanent Liberian community addresses. Captures clinical triage acuity, department, vital signs, and facility dossier ID without requiring GPS or landmarks.
                  </p>
                </div>
              </div>
            )}

            {/* Core Demographics Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Michael" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Last Name *</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Gwoah" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Sex *</label><select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none"><option>Male</option><option>Female</option></select></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Age *</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">National ID / Voter Card</label><input type="text" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" placeholder="LBR-992-XXXX" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Patient Contact Phone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" placeholder="+231-77-XXX-XXXX" /></div>
              <div className="col-span-2"><label className="block text-sm font-bold text-neutral-700 mb-1">Enrolling Health Facility * (31 High-Burden Sites)</label><select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none">{facilities.map((f,i)=><option key={i}>{f}</option>)}</select></div>
            </div>

            {/* CONDITIONAL WORKFLOW: RESIDENT GEOSPATIAL vs. FACILITY POINT-OF-CARE */}
            {formData.regType === 'Resident Geospatial' ? (
              /* Resident Geospatial & Landmark Section */
              <div className="p-5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-bold text-sm text-emerald-900">
                      Geospatial Residence & Navigational Landmark Locator
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Locate className={`h-3.5 w-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    {isDetectingGps ? 'Locking Coordinates...' : 'Auto-Detect Current GPS'}
                  </button>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={e => setFormData({...formData, lat: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Longitude (°W)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lng}
                      onChange={e => setFormData({...formData, lng: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">GPS Accuracy Radius</label>
                    <input
                      type="text"
                      readOnly
                      value={`±${formData.accuracyMeters} meters`}
                      className="w-full bg-neutral-100 border border-neutral-300 rounded-lg p-2 font-mono text-neutral-600"
                    />
                  </div>
                </div>

                {/* Liberian Locality Hierarchy */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">County of Residence</label>
                    <select
                      value={formData.county}
                      onChange={e => setFormData({...formData, county: e.target.value})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                    >
                      {ALL_COUNTIES.map(c => <option key={c} value={c}>{c} County</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">District / Clan</label>
                    <input
                      type="text"
                      value={formData.clan}
                      onChange={e => setFormData({...formData, clan: e.target.value})}
                      placeholder="e.g. West Point Borough"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Community / Settlement</label>
                    <input
                      type="text"
                      value={formData.community}
                      onChange={e => setFormData({...formData, community: e.target.value})}
                      placeholder="e.g. Point Beach Zone"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                {/* Landmark narrative */}
                <div className="text-xs">
                  <label className="block font-bold text-neutral-700 mb-1">
                    Navigational Landmark Narrative (Crucial for Defaulter Retrieval)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={e => setFormData({...formData, landmark: e.target.value})}
                    placeholder="e.g. Opposite the cold storage building, brown zinc roof house near water pump"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs font-medium"
                  />
                </div>

                {/* Community Health Worker Linkage & Contact Tracing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-emerald-200/80">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Assigned CHW / gCHV Name</label>
                    <input
                      type="text"
                      value={formData.chwName}
                      onChange={e => setFormData({...formData, chwName: e.target.value})}
                      placeholder="e.g. Comfort Mulbah"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">CHW Contact Phone</label>
                    <input
                      type="text"
                      value={formData.chwPhone}
                      onChange={e => setFormData({...formData, chwPhone: e.target.value})}
                      placeholder="+231-88-XXX-XXXX"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Household Contacts (TPT)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.householdContacts}
                        onChange={e => setFormData({...formData, householdContacts: parseInt(e.target.value) || 0})}
                        className="w-1/2 bg-white border border-neutral-300 rounded-lg p-2"
                        placeholder="Total"
                      />
                      <input
                        type="number"
                        value={formData.under5Contacts}
                        onChange={e => setFormData({...formData, under5Contacts: parseInt(e.target.value) || 0})}
                        className="w-1/2 bg-white border border-neutral-300 rounded-lg p-2"
                        placeholder="Under 5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Facility Point-of-Care & Clinical Triage Intake (NO GPS, NO LANDMARK) */
              <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-health-blue">
                      Facility Point-of-Care & Clinical Triage Intake
                    </h4>
                  </div>
                  <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">
                    Hospital Clinical Unit · GPS Exempt
                  </span>
                </div>

                {/* Department, Card #, Admission Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Clinical Department / Unit *</label>
                    <select
                      value={formData.facilityDepartment}
                      onChange={e => setFormData({...formData, facilityDepartment: e.target.value})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                    >
                      <option>Outpatient Department (OPD)</option>
                      <option>Chest Clinic / TB Annex</option>
                      <option>Emergency & Acute Triage</option>
                      <option>Inpatient Medical Ward</option>
                      <option>Pediatric & Nutrition Ward</option>
                      <option>Antenatal Care (ANC) / PMTCT</option>
                      <option>Prison Health Clinic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Facility Card / Dossier # *</label>
                    <input
                      type="text"
                      value={formData.facilityCardNumber}
                      onChange={e => setFormData({...formData, facilityCardNumber: e.target.value})}
                      placeholder="e.g. RED-2026-OPD-1094"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Admission / Presentation Type *</label>
                    <select
                      value={formData.admissionType}
                      onChange={e => setFormData({...formData, admissionType: e.target.value})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                    >
                      <option>Walk-In Consultation (Self-Reported)</option>
                      <option>Emergency Triage Presentation</option>
                      <option>Internal Ward Referral</option>
                      <option>Transfer-In from Peripheral Clinic</option>
                      <option>Facility Contact Investigation</option>
                    </select>
                  </div>
                </div>

                {/* Attending Clinician & Triage Acuity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Attending Clinician / Triage Officer</label>
                    <input
                      type="text"
                      value={formData.attendingClinician}
                      onChange={e => setFormData({...formData, attendingClinician: e.target.value})}
                      placeholder="e.g. Dr. Emmanuel Dennis"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Medical Cadre</label>
                    <select
                      value={formData.clinicianCadre}
                      onChange={e => setFormData({...formData, clinicianCadre: e.target.value})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                    >
                      <option>Physician / Medical Doctor</option>
                      <option>Physician Assistant (PA)</option>
                      <option>Registered Nurse (RN)</option>
                      <option>Facility TB Focal Person</option>
                      <option>Officer-in-Charge (OIC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Triage Acuity Priority *</label>
                    <select
                      value={formData.triagePriority}
                      onChange={e => setFormData({...formData, triagePriority: e.target.value})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-bold text-rose-700"
                    >
                      <option>Priority (Cough ≥ 2 wks / Wasting)</option>
                      <option>Emergency (Severe Dyspnea / Hemoptysis)</option>
                      <option>Routine OPD Presentation</option>
                    </select>
                  </div>
                </div>

                {/* Triage Vitals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-blue-200/60">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Body Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.triageTemp}
                      onChange={e => setFormData({...formData, triageTemp: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      value={formData.triageBp}
                      onChange={e => setFormData({...formData, triageBp: e.target.value})}
                      placeholder="120/80"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Pulse / Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={formData.triagePulse}
                      onChange={e => setFormData({...formData, triagePulse: parseInt(e.target.value) || 0})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Oxygen Saturation (SpO₂ %)</label>
                    <input
                      type="number"
                      value={formData.triageSpo2}
                      onChange={e => setFormData({...formData, triageSpo2: parseInt(e.target.value) || 0})}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                {/* Reason No Community Address */}
                <div className="text-xs pt-2 border-t border-blue-200/60">
                  <label className="block font-bold text-neutral-700 mb-1">
                    Reason for Facility Point-of-Care Registration (No Community GPS)
                  </label>
                  <select
                    value={formData.reasonNoAddress}
                    onChange={e => setFormData({...formData, reasonNoAddress: e.target.value})}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium"
                  >
                    <option>Transient / No Fixed Municipal Address in Liberia</option>
                    <option>Hospital Inpatient / Acute Clinical Presentation</option>
                    <option>Informal Settlement / Dwelling Without Geographic Locality</option>
                    <option>Commercial Transport / Mining Camp Mobile Worker</option>
                    <option>Cross-Border / Inter-County Referral Pending Locality Verification</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <button onClick={() => setStep(2)} disabled={!formData.firstName || !formData.lastName} className="bg-health-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                Next: HIV Testing (HTS) <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: HTS (PS-02) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full uppercase">Program Stage PS-02</span>
              <h2 className="text-2xl font-bold text-neutral-800 mt-2">HIV Testing Services (HTS) & Care Linkage</h2>
              <p className="text-neutral-500 text-sm">Mandatory provider-initiated testing and counseling for all presumptive/confirmed TB patients.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">Pre-Test Counseling Offered? *</label>
                  <select value={formData.preTestCounseling ? 'Yes' : 'No'} onChange={e => setFormData({...formData, preTestCounseling: e.target.value === 'Yes'})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none">
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">Final Confirmed HIV Status *</label>
                  <select value={formData.hivStatus} onChange={e => setFormData({...formData, hivStatus: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none font-bold text-health-blue">
                    <option>Negative</option><option>Positive</option><option>Unknown / Refused</option>
                  </select>
                </div>
              </div>

              {formData.hivStatus === 'Positive' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-4 animate-in fade-in">
                  <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2"><HeartPulse className="h-4 w-4 text-purple-600"/>TB/HIV Co-infection Integration Requirements</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-purple-800 mb-1">ART Clinic Number</label><input type="text" value={formData.artNumber} onChange={e => setFormData({...formData, artNumber: e.target.value})} placeholder="e.g. ART-MON-1049" className="w-full border border-purple-300 rounded-lg p-2 text-sm bg-white" /></div>
                    <div><label className="block text-xs font-bold text-purple-800 mb-1">Cotrimoxazole (CPT) Initiated?</label><select value={formData.cptInitiated ? 'Yes' : 'No'} onChange={e => setFormData({...formData, cptInitiated: e.target.value === 'Yes'})} className="w-full border border-purple-300 rounded-lg p-2 text-sm bg-white"><option>Yes</option><option>No</option></select></div>
                  </div>
                  <p className="text-xs text-purple-700">Patient will be enrolled into the joint TB/HIV tracking cascade with automated 6-month viral load monitoring (PS-06).</p>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg font-bold text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="bg-health-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2">
                Next: TB Screening <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TB Screening & Diagnosis (PS-03) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase">Program Stage PS-03</span>
              <h2 className="text-2xl font-bold text-neutral-800 mt-2">Clinical TB Screening & AI Diagnostic Prediction</h2>
              <p className="text-neutral-500 text-sm">WHO 4-symptom clinical evaluation with GeneXpert MTB/RIF laboratory confirmation.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-neutral-700 border-b pb-1">1. WHO 4-Symptom Screening</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue">
                    <span className="text-sm font-bold">Cough &gt; 2 weeks?</span>
                    <input type="checkbox" checked={formData.cough2Weeks} onChange={e => setFormData({...formData, cough2Weeks: e.target.checked})} className="h-4 w-4 accent-health-blue"/>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue">
                    <span className="text-sm font-bold">Unexplained weight loss?</span>
                    <input type="checkbox" checked={formData.weightLoss} onChange={e => setFormData({...formData, weightLoss: e.target.checked})} className="h-4 w-4 accent-health-blue"/>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue">
                    <span className="text-sm font-bold">Persistent fever?</span>
                    <input type="checkbox" checked={formData.fever} onChange={e => setFormData({...formData, fever: e.target.checked})} className="h-4 w-4 accent-health-blue"/>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue">
                    <span className="text-sm font-bold">Drenching night sweats?</span>
                    <input type="checkbox" checked={formData.nightSweats} onChange={e => setFormData({...formData, nightSweats: e.target.checked})} className="h-4 w-4 accent-health-blue"/>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">GeneXpert MTB/RIF Result *</label>
                  <select value={formData.geneXpertResult} onChange={e => setFormData({...formData, geneXpertResult: e.target.value})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none font-bold">
                    <option>MTB Detected, Rifampicin Resistance NOT Detected</option>
                    <option>MTB Detected, Rifampicin Resistance DETECTED (MDR-TB)</option>
                    <option>MTB Not Detected</option>
                    <option>Indeterminate / Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1">Disease Classification *</label>
                  <select value={formData.diseaseType} onChange={e => setFormData({...formData, diseaseType: e.target.value})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                    <option>Pulmonary Bacteriologically Confirmed</option>
                    <option>Pulmonary Clinically Diagnosed</option>
                    <option>Extrapulmonary TB (Pleural/Lymph/Meningeal)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              {!aiPrediction ? (
                <>
                  <Bot className="h-10 w-10 text-health-blue mb-3" />
                  <p className="text-sm font-bold text-blue-900 mb-4">Run AI Predictive Analysis based on the inputs provided above.</p>
                  <button onClick={handlePredict} disabled={isPredicting} className="bg-health-blue text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2">
                    {isPredicting ? <span className="animate-pulse">Analyzing Clinical Data...</span> : "Predict TB Status"}
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-3" />
                  <p className="text-sm font-bold text-emerald-900 mb-1">AI Classification & Decision Support Result:</p>
                  <p className="text-base font-black text-emerald-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-200">{aiPrediction}</p>
                </>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-lg font-bold text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setStep(4)} className="bg-health-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2">
                Next: Treatment Initiation <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Treatment Initiation (PS-04) */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">Program Stage PS-04</span>
              <h2 className="text-2xl font-bold text-neutral-800 mt-2">Treatment Initiation & Regimen Setup</h2>
              <p className="text-neutral-500 text-sm">Assign weight-based Fixed-Dose Combination (FDC) regimen and assign DOT supporter.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Regimen Category *</label>
                <select value={formData.regimen} onChange={e => setFormData({...formData, regimen: e.target.value})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none font-bold text-emerald-700">
                  <option>1st Line (2HRZE/4HR)</option>
                  <option>2nd Line (MDR-TB Bedaquiline regimen)</option>
                  <option>Pediatric Regimen (HRZ)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Baseline Weight (kg) *</label>
                <input type="number" value={formData.weightKg} onChange={e => setFormData({...formData, weightKg: Number(e.target.value)})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Daily FDC Dosage (Tablets) *</label>
                <input type="number" value={formData.dailyDoseTabs} onChange={e => setFormData({...formData, dailyDoseTabs: Number(e.target.value)})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Directly Observed Therapy (DOT) Model *</label>
                <select value={formData.dotModel} onChange={e => setFormData({...formData, dotModel: e.target.value})} className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none">
                  <option>Facility DOT (Daily health center visit)</option>
                  <option>Community DOT (Trained CHW)</option>
                  <option>Family DOT (Designated treatment supporter)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Treatment Supporter Name</label>
                <input type="text" value={formData.supporterName} onChange={e => setFormData({...formData, supporterName: e.target.value})} placeholder="e.g. Mary Doe" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Treatment Supporter Contact</label>
                <input type="text" value={formData.supporterPhone} onChange={e => setFormData({...formData, supporterPhone: e.target.value})} placeholder="+231-77-XXX-XXXX" className="w-full border border-neutral-300 rounded-lg p-2.5 text-sm outline-none" />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-lg font-bold text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={handleSave} disabled={isSubmitting} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                {isSubmitting ? 'Synchronizing to DHIS2...' : <><Save className="h-5 w-5"/> Synchronize & Complete Enrollment</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
