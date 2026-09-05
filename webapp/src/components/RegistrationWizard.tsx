import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, UserPlus, Stethoscope, Save, Bot, HeartPulse, Pill } from 'lucide-react';

export const RegistrationWizard = ({ facilities, onRegister }: { facilities: string[], onRegister: (p: any) => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Demographics (PS-01)
    firstName: '', lastName: '', sex: 'Male', facility: facilities[0] || 'Redemption Hospital (Montserrado)', age: 32,
    nationalId: '', phone: '', patientType: 'New',
    // Step 2: HTS (PS-02)
    preTestCounseling: true, hivStatus: 'Negative', rapidTest1: 'Non-Reactive', rapidTest2: 'Not Done',
    artLinked: false, artNumber: '', cptInitiated: false,
    // Step 3: TB Screening (PS-03)
    cough2Weeks: true, weightLoss: true, fever: true, nightSweats: true, hemoptysis: false,
    closeContact: true, previousTb: false,
    geneXpertResult: 'MTB Detected, Rifampicin Resistance NOT Detected',
    diseaseType: 'Pulmonary Bacteriologically Confirmed',
    // Step 4: Treatment Initiation (PS-04)
    regimen: '1st Line (2HRZE/4HR)', weightKg: 56, dailyDoseTabs: 4, dotModel: 'Facility DOT',
    supporterName: 'Mary Doe (Spouse)', supporterPhone: '+231-77-889-1234'
  });

  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setAiPrediction("High Probability TB (Confirmed Presumptive) — GeneXpert MTB Detected, RIF Sensitive");
      (window as any).showToast("AI Clinical Analysis: High confidence pulmonary TB identified. Category 1 regimen indicated.");
    }, 1500);
  };
  
  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5);
      const generatedId = `TB-${Math.floor(1050 + Math.random() * 8900)}`;
      onRegister({
        id: generatedId,
        name: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        sex: formData.sex.charAt(0),
        facility: formData.facility,
        status: 'On Treatment',
        hivStatus: formData.hivStatus,
        regimen: formData.regimen
      });
      (window as any).showToast(`Patient ${generatedId} synchronized to DHIS2 National Tracker across all program stages.`);
    }, 1200);
  };

  const handleReset = () => {
    setStep(1);
    setAiPrediction(null);
    setFormData({
      firstName: '', lastName: '', sex: 'Male', facility: facilities[0] || 'Redemption Hospital (Montserrado)', age: 30,
      nationalId: '', phone: '', patientType: 'New',
      preTestCounseling: true, hivStatus: 'Negative', rapidTest1: 'Non-Reactive', rapidTest2: 'Not Done',
      artLinked: false, artNumber: '', cptInitiated: false,
      cough2Weeks: false, weightLoss: false, fever: false, nightSweats: false, hemoptysis: false,
      closeContact: false, previousTb: false,
      geneXpertResult: 'MTB Detected, Rifampicin Resistance NOT Detected',
      diseaseType: 'Pulmonary Bacteriologically Confirmed',
      regimen: '1st Line (2HRZE/4HR)', weightKg: 55, dailyDoseTabs: 4, dotModel: 'Facility DOT',
      supporterName: '', supporterPhone: ''
    });
  };

  if (step === 5) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="h-20 w-20 text-emerald-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-neutral-900 mb-2">Enrollment & Initiation Complete</h2>
        <p className="text-neutral-600 mb-6">
          The patient profile, HIV Testing Services (HTS), TB clinical diagnosis, and treatment initiation event have been synchronized with the national DHIS2 instance.
        </p>
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-sm space-y-2 mb-8 max-w-md mx-auto">
          <div className="flex justify-between"><span className="text-neutral-500">Patient Name:</span><span className="font-bold">{formData.firstName} {formData.lastName}</span></div>
          <div className="flex justify-between"><span className="text-neutral-500">Facility:</span><span className="font-bold">{formData.facility}</span></div>
          <div className="flex justify-between"><span className="text-neutral-500">HIV Status:</span><span className="font-bold">{formData.hivStatus}</span></div>
          <div className="flex justify-between"><span className="text-neutral-500">Regimen:</span><span className="font-bold text-emerald-700">{formData.regimen}</span></div>
          <div className="flex justify-between"><span className="text-neutral-500">DOT Model:</span><span className="font-bold">{formData.dotModel}</span></div>
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
              <h2 className="text-2xl font-bold text-neutral-800 mt-2">Patient Demographics & Enrollment</h2>
              <p className="text-neutral-500 text-sm">Capture core tracked entity attributes per national DHIS2 metadata dictionary.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Michael" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Last Name *</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Gwoah" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Sex *</label><select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none"><option>Male</option><option>Female</option></select></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Age *</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">National ID / Voter Number</label><input type="text" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" placeholder="LBR-992-XXXX" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Patient Category *</label><select value={formData.patientType} onChange={e => setFormData({...formData, patientType: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none"><option>New</option><option>Relapse</option><option>Treatment After Failure</option><option>Transfer-In</option></select></div>
              <div className="col-span-2"><label className="block text-sm font-bold text-neutral-700 mb-1">Registration Facility * (31 High-Burden Sites)</label><select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none">{facilities.map((f,i)=><option key={i}>{f}</option>)}</select></div>
            </div>
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
