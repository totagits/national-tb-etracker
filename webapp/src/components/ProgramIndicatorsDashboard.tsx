import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity, Download, Filter, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';

const detectionData = [
  { month: 'Jan', screened: 4500, presumptive: 1200, diagnosed: 380, initiated: 375 },
  { month: 'Feb', screened: 5200, presumptive: 1450, diagnosed: 420, initiated: 410 },
  { month: 'Mar', screened: 4800, presumptive: 1300, diagnosed: 400, initiated: 390 },
  { month: 'Apr', screened: 5600, presumptive: 1600, diagnosed: 510, initiated: 505 },
  { month: 'May', screened: 6100, presumptive: 1750, diagnosed: 580, initiated: 570 },
];

const outcomeData = [
  { name: 'Cured', value: 85, color: '#0a8754' },
  { name: 'Treatment Completed', value: 5, color: '#2a9d8f' },
  { name: 'Failed', value: 3, color: '#e63946' },
  { name: 'Lost to Follow-up', value: 5, color: '#f4a261' },
  { name: 'Died', value: 2, color: '#370617' },
];

const viralSuppressionData = [
  { quarter: 'Q1 2025', tested: 290, suppressed: 232, unsuppressed: 58, rate: 80.0 },
  { quarter: 'Q2 2025', tested: 320, suppressed: 268, unsuppressed: 52, rate: 83.8 },
  { quarter: 'Q3 2025', tested: 305, suppressed: 262, unsuppressed: 43, rate: 85.9 },
  { quarter: 'Q4 2025', tested: 360, suppressed: 318, unsuppressed: 42, rate: 88.3 },
  { quarter: 'Q1 2026', tested: 395, suppressed: 360, unsuppressed: 35, rate: 91.1 },
];

const viralSuppressionByCounty = [
  { county: 'Montserrado', tested: 145, suppressedRate: 92.4, target: 90 },
  { county: 'Nimba',       tested: 68,  suppressedRate: 89.7, target: 90 },
  { county: 'Bong',        tested: 52,  suppressedRate: 90.4, target: 90 },
  { county: 'Margibi',     tested: 40,  suppressedRate: 87.5, target: 90 },
  { county: 'Lofa',        tested: 38,  suppressedRate: 84.2, target: 90 },
  { county: 'Grand Bassa', tested: 32,  suppressedRate: 87.5, target: 90 },
  { county: 'Maryland',    tested: 20,  suppressedRate: 85.0, target: 90 },
];

const hivTbCascade = [
  { stage: 'Total TB Patients', count: 1842, rate: '100%' },
  { stage: 'HIV Tested in HTS', count: 1785, rate: '96.9%' },
  { stage: 'TB/HIV Co-infected', count: 227, rate: '12.7%' },
  { stage: 'Linked to ART', count: 221, rate: '97.4%' },
  { stage: 'CPT Initiated', count: 218, rate: '96.0%' },
  { stage: 'Viral Load Tested', count: 204, rate: '89.9%' },
  { stage: 'Virally Suppressed (<1000)', count: 186, rate: '91.2%' },
];

const hivTbData = [
  { quarter: 'Q1 2025', coinfected: 310, art_initiated: 295, suppressed: 250 },
  { quarter: 'Q2 2025', coinfected: 340, art_initiated: 330, suppressed: 285 },
  { quarter: 'Q3 2025', coinfected: 320, art_initiated: 315, suppressed: 290 },
  { quarter: 'Q4 2025', coinfected: 380, art_initiated: 375, suppressed: 350 },
  { quarter: 'Q1 2026', coinfected: 410, art_initiated: 405, suppressed: 385 },
];

const countyPerformanceData = [
  { name: 'Montserrado', screeningRate: 92, successRate: 88, tbHivTesting: 95 },
  { name: 'Nimba',       screeningRate: 85, successRate: 82, tbHivTesting: 90 },
  { name: 'Bong',        screeningRate: 88, successRate: 85, tbHivTesting: 92 },
  { name: 'Lofa',        screeningRate: 78, successRate: 75, tbHivTesting: 80 },
  { name: 'Margibi',     screeningRate: 84, successRate: 81, tbHivTesting: 88 },
  { name: 'Grand Bassa', screeningRate: 82, successRate: 83, tbHivTesting: 86 },
  { name: 'Maryland',    screeningRate: 80, successRate: 84, tbHivTesting: 85 },
];

export const ProgramIndicatorsDashboard = () => {
  const [activeSection, setActiveSection] = useState<'detection' | 'outcomes' | 'viralsuppression' | 'coinfection' | 'performance'>('detection');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">National Program Indicators & Analytics</h2>
          <p className="text-sm text-neutral-500">Official HMIS analytical dashboards for TB & TB/HIV surveillance — aligned with WHO End TB & MoH Liberia TOR.</p>
        </div>
        <button onClick={() => window.print()} className="bg-health-blue hover:bg-blue-800 transition-colors text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Dashboards (PDF)
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        <button onClick={() => setActiveSection('detection')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'detection' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><Stethoscope className="h-4 w-4 inline mr-2"/>1. Case Detection Through Screening</button>
        <button onClick={() => setActiveSection('outcomes')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'outcomes' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><Activity className="h-4 w-4 inline mr-2"/>2. Treatment Outcomes</button>
        <button onClick={() => setActiveSection('viralsuppression')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'viralsuppression' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><Activity className="h-4 w-4 inline mr-2"/>3. Viral Suppression (TB/HIV)</button>
        <button onClick={() => setActiveSection('coinfection')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'coinfection' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><HeartPulse className="h-4 w-4 inline mr-2"/>4. TB/HIV Co-infection Management</button>
        <button onClick={() => setActiveSection('performance')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'performance' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><ShieldCheck className="h-4 w-4 inline mr-2"/>5. County & Facility Performance</button>
      </div>

      <div className="bg-neutral-50 rounded-xl">
        {activeSection === 'detection' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold">TB Case Detection Through Screening</h3>
                  <p className="text-sm text-neutral-500">Tracking the diagnostic cascade from initial symptom screening to treatment initiation across Liberia.</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">WHO Aligned</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"><p className="text-xs font-bold text-neutral-500 uppercase">Screened for TB</p><p className="text-2xl font-black text-neutral-800">26,200</p><p className="text-xs text-neutral-400 mt-1">Symptom check completed</p></div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200"><p className="text-xs font-bold text-amber-700 uppercase">Presumptive TB</p><p className="text-2xl font-black text-amber-800">7,300</p><p className="text-xs text-amber-600 mt-1">27.8% yield rate</p></div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200"><p className="text-xs font-bold text-blue-700 uppercase">Diagnosed TB</p><p className="text-2xl font-black text-blue-800">2,110</p><p className="text-xs text-blue-600 mt-1">GeneXpert / Smear confirmed</p></div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200"><p className="text-xs font-bold text-emerald-700 uppercase">Treatment Initiated</p><p className="text-2xl font-black text-emerald-800">2,050</p><p className="text-xs text-emerald-600 mt-1">97.2% linkage to treatment</p></div>
              </div>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={detectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="screened" name="Total Screened" stackId="1" stroke="#cbd5e1" fill="#e2e8f0" />
                    <Area type="monotone" dataKey="presumptive" name="Presumptive TB" stackId="2" stroke="#f59e0b" fill="#fde68a" />
                    <Area type="monotone" dataKey="diagnosed" name="Diagnosed TB" stackId="3" stroke="#2563eb" fill="#93c5fd" />
                    <Area type="monotone" dataKey="initiated" name="Treatment Initiated" stackId="4" stroke="#059669" fill="#a7f3d0" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'outcomes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-2">National Treatment Outcomes (Cohort Analysis)</h3>
              <p className="text-sm text-neutral-500 mb-6">Percentage breakdown of treatment outcomes for registered patients across all 15 counties.</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({name, value}) => `${name} (${value}%)`}>
                      {outcomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">WHO Benchmark vs Liberia Actual</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-emerald-800">Treatment Success Rate (Cured + Completed)</span><span className="font-mono font-bold text-emerald-700">90.0% · Target: ≥90%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-emerald-600 h-3 rounded-full" style={{ width: '90%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-amber-800">Loss to Follow-up Rate (LTFU)</span><span className="font-mono font-bold text-amber-700">5.0% · Target: &lt;5%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{ width: '5%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-red-800">Treatment Failure Rate</span><span className="font-mono font-bold text-red-700">3.0% · Target: &lt;4%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{ width: '3%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-neutral-800">Mortality / Died</span><span className="font-mono font-bold text-neutral-700">2.0% · Target: &lt;3%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-neutral-800 h-3 rounded-full" style={{ width: '2%' }}></div></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <strong>Status:</strong> National TB Program treatment success is meeting the WHO End TB milestone across the 31 high-burden facilities.
              </div>
            </div>
          </div>
        )}

        {activeSection === 'viralsuppression' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold">Viral Suppression for TB/HIV Co-Affected Patients</h3>
                  <p className="text-sm text-neutral-500">Monitoring HIV viral load results, suppression rates (&lt; 1,000 copies/mL threshold), and ART adherence among co-infected patients per WHO/PEPFAR standards.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">91.1%</span>
                  <p className="text-xs text-neutral-400">Current Suppression Rate (Target: ≥90%)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-700 uppercase">Viral Load Testing Coverage</p>
                  <p className="text-3xl font-black text-blue-900 mt-1">89.9%</p>
                  <p className="text-xs text-blue-600 mt-1">204 of 227 co-infected patients with VL drawn</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Virally Suppressed (&lt;1,000 copies/mL)</p>
                  <p className="text-3xl font-black text-emerald-900 mt-1">91.1%</p>
                  <p className="text-xs text-emerald-600 mt-1">Exceeds national 90% threshold</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 uppercase">Unsuppressed (≥1,000 copies/mL)</p>
                  <p className="text-3xl font-black text-amber-900 mt-1">8.9%</p>
                  <p className="text-xs text-amber-600 mt-1">Active on Enhanced Adherence Counseling (EAC)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm text-neutral-700 mb-3">Quarterly Viral Suppression Trend (2025–2026)</h4>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viralSuppressionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="quarter" />
                        <YAxis domain={[70, 100]} />
                        <Tooltip formatter={(v, name) => [name === 'Suppression Rate (%)' ? `${v}%` : v, name]} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="Suppression Rate (%)" stroke="#059669" strokeWidth={3} dot={{r: 5}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-700 mb-3">Suppression Rate by Top Counties vs. 90% Target</h4>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={viralSuppressionByCounty} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="county" type="category" />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Legend />
                        <Bar dataKey="suppressedRate" name="Viral Suppression (%)" fill="#0284c7" />
                        <Bar dataKey="target" name="National Target (%)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'coinfection' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-2">TB/HIV Co-infection Management & Care Cascade</h3>
              <p className="text-sm text-neutral-500 mb-6">Tracking the complete joint HIV/TB clinical care cascade from screening through ART initiation and viral suppression.</p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Cascade Step</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Patient Count</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Coverage / Yield</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Benchmark</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {hivTbCascade.map(step => (
                      <tr key={step.stage} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-bold text-neutral-800">{step.stage}</td>
                        <td className="px-4 py-3 font-mono text-neutral-700">{step.count.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-health-blue">{step.rate}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">WHO Standard</td>
                        <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Optimal</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hivTbData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="coinfected" name="TB/HIV Co-infected Identified" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="art_initiated" name="On ART (Tenofovir/Lamivudine/Dolutegravir)" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="suppressed" name="Virally Suppressed (&lt;1000 copies)" stroke="#059669" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">County & Facility Performance Matrix (15 Counties · 31 High-Burden Sites)</h3>
                  <p className="text-sm text-neutral-500">Comparative surveillance analysis across key program indicators by geographic region.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative"><input type="text" placeholder="Filter county..." className="pl-8 pr-4 py-2 border rounded-md text-sm outline-none"/><Filter className="h-4 w-4 absolute left-3 top-2.5 text-neutral-400"/></div>
                </div>
              </div>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countyPerformanceData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="screeningRate" name="Screening Target Achieved (%)" fill="#004e89" />
                    <Bar dataKey="tbHivTesting" name="TB/HIV Testing Rate (%)" fill="#ffb703" />
                    <Bar dataKey="successRate" name="Treatment Success Rate (%)" fill="#0a8754" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

