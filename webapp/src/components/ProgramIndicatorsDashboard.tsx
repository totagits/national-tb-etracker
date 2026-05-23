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

const hivTbData = [
  { quarter: 'Q1 2025', coinfected: 310, art_initiated: 295, suppressed: 250 },
  { quarter: 'Q2 2025', coinfected: 340, art_initiated: 330, suppressed: 285 },
  { quarter: 'Q3 2025', coinfected: 320, art_initiated: 315, suppressed: 290 },
  { quarter: 'Q4 2025', coinfected: 380, art_initiated: 375, suppressed: 350 },
  { quarter: 'Q1 2026', coinfected: 410, art_initiated: 405, suppressed: 385 },
];

const countyPerformanceData = [
  { name: 'Montserrado', screeningRate: 92, successRate: 88, tbHivTesting: 95 },
  { name: 'Nimba', screeningRate: 85, successRate: 82, tbHivTesting: 90 },
  { name: 'Bong', screeningRate: 88, successRate: 85, tbHivTesting: 92 },
  { name: 'Lofa', screeningRate: 78, successRate: 75, tbHivTesting: 80 },
  { name: 'Margibi', screeningRate: 84, successRate: 81, tbHivTesting: 88 },
];

export const ProgramIndicatorsDashboard = () => {
  const [activeSection, setActiveSection] = useState('detection');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">National Program Indicators</h2>
          <p className="text-sm text-neutral-500">Official HMIS analytical dashboards for TB programmatic reporting.</p>
        </div>
        <button onClick={() => window.print()} className="bg-health-blue hover:bg-blue-800 transition-colors text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Dashboards (PDF)
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-200">
        <button onClick={() => setActiveSection('detection')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'detection' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><Stethoscope className="h-4 w-4 inline mr-2"/>Case Detection</button>
        <button onClick={() => setActiveSection('outcomes')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'outcomes' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><Activity className="h-4 w-4 inline mr-2"/>Treatment Outcomes</button>
        <button onClick={() => setActiveSection('coinfection')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'coinfection' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><HeartPulse className="h-4 w-4 inline mr-2"/>TB/HIV Co-infection</button>
        <button onClick={() => setActiveSection('performance')} className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-bold text-sm transition-colors ${activeSection === 'performance' ? 'bg-health-blue text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}><ShieldCheck className="h-4 w-4 inline mr-2"/>County Performance</button>
      </div>

      <div className="bg-neutral-50 rounded-xl">
        {activeSection === 'detection' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-2">TB Case Detection Through Screening</h3>
              <p className="text-sm text-neutral-500 mb-6">Tracking the diagnostic cascade from initial symptom screening to treatment initiation.</p>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={detectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="screened" name="Total Screened" stackId="1" stroke="#e0e1dd" fill="#e0e1dd" />
                    <Area type="monotone" dataKey="presumptive" name="Presumptive TB" stackId="2" stroke="#ffb703" fill="#ffb703" />
                    <Area type="monotone" dataKey="diagnosed" name="Diagnosed TB" stackId="3" stroke="#004e89" fill="#004e89" />
                    <Area type="monotone" dataKey="initiated" name="Treatment Initiated" stackId="4" stroke="#0a8754" fill="#0a8754" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'outcomes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-2">National Treatment Outcomes</h3>
              <p className="text-sm text-neutral-500 mb-6">Percentage breakdown of final outcomes for the registered TB cohort.</p>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" label={({name, value}) => `${name} (${value}%)`}>
                      {outcomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 h-full flex flex-col justify-center">
                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Indicator Targets vs Actual</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold text-green-700">Treatment Success Rate</span><span>Target: 90%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: '90%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold text-red-600">Loss to Follow-up Rate</span><span>Target: &lt;5%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-red-500 h-3 rounded-full" style={{ width: '5%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold text-neutral-800">Death Rate</span><span>Target: &lt;3%</span></div>
                    <div className="w-full bg-neutral-200 rounded-full h-3"><div className="bg-neutral-800 h-3 rounded-full" style={{ width: '2%' }}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'coinfection' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-2">TB/HIV Co-infection & Viral Suppression</h3>
              <p className="text-sm text-neutral-500 mb-6">Monitoring ART initiation and viral suppression among co-infected patients over time.</p>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hivTbData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="coinfected" name="TB/HIV Co-infected" stroke="#ffb703" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="art_initiated" name="On ART" stroke="#004e89" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="suppressed" name="Virally Suppressed" stroke="#0a8754" strokeWidth={3} dot={{r: 4}} />
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
                  <h3 className="text-lg font-bold mb-1">County & Facility Performance Matrix</h3>
                  <p className="text-sm text-neutral-500">Comparative analysis of key program indicators by geography.</p>
                </div>
                <div className="flex gap-2">
                   <div className="relative"><input type="text" placeholder="Filter county..." className="pl-8 pr-4 py-2 border rounded-md text-sm outline-none"/><Filter className="h-4 w-4 absolute left-3 top-2.5 text-neutral-400"/></div>
                </div>
              </div>
              <div className="h-[350px]">
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
