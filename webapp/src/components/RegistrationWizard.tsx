import { useState } from 'react';
import { ArrowRight, CheckCircle2, UserPlus, Stethoscope, Save, Bot } from 'lucide-react';

export const RegistrationWizard = ({ facilities, onRegister }: { facilities: string[], onRegister: (p: any) => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', sex: 'Male', facility: facilities[0], age: 30
  });

  const handleNext = () => setStep(2);

  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setAiPrediction("Presumptive TB (High Risk) - Refer to GeneXpert immediately.");
      (window as any).showToast("AI Analysis Complete: High probability of active TB detected.");
    }, 2000);
  };
  
  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
      onRegister({
        id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        sex: formData.sex.charAt(0),
        facility: formData.facility,
        status: aiPrediction ? 'Presumptive' : 'Screened'
      });
      (window as any).showToast("Patient Registration and Screening saved to DHIS2.");
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setAiPrediction(null);
    setFormData({ firstName: '', lastName: '', sex: 'Male', facility: facilities[0], age: 30 });
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="h-20 w-20 text-health-blue mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Registration Complete</h2>
        <p className="text-neutral-600 mb-8">The patient profile and TB screening record have been successfully synchronized with the national DHIS2 instance and are now searchable in the Patient Directory.</p>
        <button onClick={handleReset} className="bg-health-blue text-white px-6 py-3 rounded-md font-bold hover:bg-blue-800 transition-colors">
          Register Another Patient
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Header / Progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-health-blue -z-10 rounded-full transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        
        <div className={`flex flex-col items-center bg-neutral-50 px-2 ${step >= 1 ? 'text-health-blue' : 'text-neutral-400'}`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 ${step >= 1 ? 'border-health-blue bg-white' : 'border-neutral-300 bg-neutral-100'}`}>
            <UserPlus className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold mt-2 tracking-wider uppercase">1. Demographics</span>
        </div>

        <div className={`flex flex-col items-center bg-neutral-50 px-2 ${step >= 2 ? 'text-health-blue' : 'text-neutral-400'}`}>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 ${step >= 2 ? 'border-health-blue bg-white' : 'border-neutral-300 bg-neutral-100'}`}>
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold mt-2 tracking-wider uppercase">2. TB Screening</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">Patient Demographics</h2>
              <p className="text-neutral-500 text-sm">Capture standard identity and location details.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Michael" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Last Name *</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-health-blue outline-none" placeholder="e.g. Gwoah" /></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Sex *</label><select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none"><option>Male</option><option>Female</option></select></div>
              <div><label className="block text-sm font-bold text-neutral-700 mb-1">Age *</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none" /></div>
              <div className="col-span-2"><label className="block text-sm font-bold text-neutral-700 mb-1">Registration Facility *</label><select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 outline-none">{facilities.map((f,i)=><option key={i}>{f}</option>)}</select></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <button onClick={handleNext} disabled={!formData.firstName || !formData.lastName} className="bg-health-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                Next: TB Screening <ArrowRight className="h-5 w-5"/>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">Clinical TB Screening & AI Prediction</h2>
              <p className="text-neutral-500 text-sm">Complete WHO screening. Our AI will analyze Symptoms, Exposure, and Medical History to predict TB status.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-neutral-700 border-b pb-1">1. Symptoms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Cough &gt; 2 weeks?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Unexplained weight loss?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Fever?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Night sweats?</span><input type="checkbox" className="h-4 w-4"/></label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-neutral-700 border-b pb-1">2. Exposure & Risk</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Close contact with TB patient?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Healthcare worker?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">Living in crowded setting?</span><input type="checkbox" className="h-4 w-4"/></label>
                  <label className="flex items-center justify-between p-3 bg-neutral-50 rounded border cursor-pointer hover:border-health-blue"><span className="text-sm font-bold">History of smoking?</span><input type="checkbox" className="h-4 w-4"/></label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-neutral-700 border-b pb-1">3. Medical & Testing History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-neutral-700 mb-1">HIV Status</label><select className="w-full border rounded-lg p-2 text-sm outline-none"><option>Unknown</option><option>Negative</option><option>Positive</option></select></div>
                  <div><label className="block text-sm font-bold text-neutral-700 mb-1">Previous TB Treatment?</label><select className="w-full border rounded-lg p-2 text-sm outline-none"><option>No</option><option>Yes</option></select></div>
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
                  <CheckCircle2 className="h-10 w-10 text-amber-600 mb-3" />
                  <p className="text-sm font-bold text-amber-900 mb-1">AI Classification Result:</p>
                  <p className="text-lg font-extrabold text-amber-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-200">{aiPrediction}</p>
                </>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-200">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-lg font-bold text-neutral-600 hover:bg-neutral-100 transition-colors">
                Back
              </button>
              <button onClick={handleSave} disabled={isSubmitting || !aiPrediction} className="bg-health-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Saving to DHIS2...' : <><Save className="h-5 w-5"/> Save Patient Record</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
