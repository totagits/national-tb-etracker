import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area
} from 'recharts';
import {
  Download, Users, HeartPulse, Clock, CheckCircle2,
  Search, TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import type { CountyData, Facility } from '../data/liberiaData';
import {
  COUNTY_TB_DATA, FACILITIES, AGE_SEX_DATA, MONTHLY_TREND,
  NATIONAL_TOTALS, ALL_COUNTIES,
} from '../data/liberiaData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SyncBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    'Today':      'bg-green-100 text-green-700 border-green-200',
    'Yesterday':  'bg-blue-100 text-blue-700 border-blue-200',
    '2+ Days':    'bg-amber-100 text-amber-700 border-amber-200',
    'Not Synced': 'bg-red-100 text-red-700 border-red-200',
  };
  const icons: Record<string, React.ReactNode> = {
    'Today':      <CheckCircle2 className="h-3 w-3" />,
    'Yesterday':  <Clock className="h-3 w-3" />,
    '2+ Days':    <AlertTriangle className="h-3 w-3" />,
    'Not Synced': <AlertTriangle className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${map[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
      {icons[status]} {status}
    </span>
  );
};

const KpiCard = ({
  label, value, sub, color, icon: Icon, trend
}: {
  label: string; value: string; sub?: string; color: string;
  icon: React.ElementType; trend?: 'up' | 'down';
}) => (
  <div className={`bg-white p-5 rounded-xl border border-neutral-200 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </h3>
      {trend && (
        trend === 'up'
          ? <TrendingUp className="h-4 w-4 text-green-500" />
          : <TrendingDown className="h-4 w-4 text-red-400" />
      )}
    </div>
    <p className="text-3xl font-black text-neutral-900">{value}</p>
    {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
  </div>
);

type SortKey = keyof Facility;

export const NationalAdminDashboard = () => {
  const [selectedCounty, setSelectedCounty] = useState('All 15 Counties');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('patients');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'facilities' | 'trend'>('overview');
  const [syncFilter, setSyncFilter] = useState('All');

  // Derived county data
  const countyData: CountyData | null = useMemo(
    () => selectedCounty === 'All 15 Counties'
      ? null
      : COUNTY_TB_DATA.find(c => c.county === selectedCounty) ?? null,
    [selectedCounty]
  );

  const kpi = countyData
    ? { registered: countyData.diagnosed * 3, onTreatment: countyData.onTreatment, success: countyData.successRate, ltfu: countyData.ltfu }
    : { registered: NATIONAL_TOTALS.registered, onTreatment: NATIONAL_TOTALS.onTreatment, success: 86.2, ltfu: NATIONAL_TOTALS.ltfu };

  // Facilities filter
  const filteredFacilities = useMemo(() => {
    let list = selectedCounty === 'All 15 Counties'
      ? FACILITIES
      : FACILITIES.filter(f => f.county === selectedCounty);
    if (facilitySearch)
      list = list.filter(f =>
        f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        f.county.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        f.clerk.toLowerCase().includes(facilitySearch.toLowerCase())
      );
    if (syncFilter !== 'All')
      list = list.filter(f => f.syncStatus === syncFilter);
    return [...list].sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [selectedCounty, facilitySearch, sortKey, sortAsc, syncFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  // Chart data
  const countyChartData = COUNTY_TB_DATA.map(c => ({
    name: c.county.length > 10 ? c.county.slice(0, 10) + '…' : c.county,
    fullName: c.county,
    diagnosed: c.diagnosed,
    success: c.success,
    onTreatment: c.onTreatment,
    ltfu: c.ltfu,
  }));

  const ageSexData = countyData
    ? AGE_SEX_DATA.map(d => ({ ...d, male: Math.round(d.male * (countyData.diagnosed / NATIONAL_TOTALS.diagnosed)), female: Math.round(d.female * (countyData.diagnosed / NATIONAL_TOTALS.diagnosed)) }))
    : AGE_SEX_DATA;

  const totalFacilitiesShown = selectedCounty === 'All 15 Counties' ? FACILITIES.length : FACILITIES.filter(f => f.county === selectedCounty).length;

  const handleCountyExport = () => {
    const rows = ['County,Presumptive,Diagnosed,On Treatment,LTFU,Success Rate'];
    ALL_COUNTIES.forEach(c => {
      rows.push([c, Math.floor(Math.random()*300+100), Math.floor(Math.random()*200+80), Math.floor(Math.random()*150+60), Math.floor(Math.random()*15+3) + '%', (Math.random()*10+80).toFixed(1) + '%'].join(','));
    });
    const csv = rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'national-tb-county-report-' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  };

  const handleFacilityExport = () => {
    const rows = ['Facility,County,Cases,Active,Last Sync,Status'];
    FACILITIES.forEach(f => {
      rows.push([f.name, f.county, f.patients, f.patients, 'Today', f.syncStatus].join(','));
    });
    const csv = rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'facility-data-' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">National Administrator Analytics</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Live TB surveillance data · {FACILITIES.length} high-burden facilities · 15 counties · Real-time sync
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedCounty}
            onChange={e => setSelectedCounty(e.target.value)}
            className="border border-neutral-300 rounded-lg px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-health-blue bg-white"
          >
            <option>All 15 Counties</option>
            {ALL_COUNTIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={() => (window as any).showToast('Generating national TB report PDF…')}
            className="bg-health-blue text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Registered" value={kpi.registered.toLocaleString()} sub={selectedCounty === 'All 15 Counties' ? 'Across all 15 counties' : selectedCounty} color="border-l-health-blue" icon={Users} trend="up" />
        <KpiCard label="On Treatment" value={kpi.onTreatment.toLocaleString()} sub="Currently active cases" color="border-l-amber-500" icon={HeartPulse} trend="up" />
        <KpiCard label="Treatment Success" value={`${kpi.success.toFixed(1)}%`} sub="WHO target ≥ 85%" color={kpi.success >= 85 ? 'border-l-green-500' : 'border-l-red-400'} icon={CheckCircle2} trend={kpi.success >= 85 ? 'up' : 'down'} />
        <KpiCard label="Lost to Follow-up" value={kpi.ltfu.toString()} sub="Requires immediate action" color="border-l-purple-500" icon={AlertTriangle} trend="down" />
      </div>

      {/* Sync Status Strip */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-health-blue" />
          <span className="text-sm font-bold text-neutral-700">Sync Status</span>
        </div>
        {[
          { label: 'Synced Today', count: FACILITIES.filter(f => (selectedCounty === 'All 15 Counties' || f.county === selectedCounty) && f.syncStatus === 'Today').length, color: 'text-green-600 bg-green-50' },
          { label: 'Yesterday', count: FACILITIES.filter(f => (selectedCounty === 'All 15 Counties' || f.county === selectedCounty) && f.syncStatus === 'Yesterday').length, color: 'text-blue-600 bg-blue-50' },
          { label: '2+ Days Ago', count: FACILITIES.filter(f => (selectedCounty === 'All 15 Counties' || f.county === selectedCounty) && f.syncStatus === '2+ Days').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'Not Synced', count: FACILITIES.filter(f => (selectedCounty === 'All 15 Counties' || f.county === selectedCounty) && f.syncStatus === 'Not Synced').length, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} px-3 py-1.5 rounded-lg flex items-center gap-2`}>
            <span className="text-xs font-bold">{s.label}</span>
            <span className="text-sm font-black">{s.count}</span>
          </div>
        ))}
        <span className="text-xs text-neutral-400 ml-auto">Last refreshed: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {([['overview', 'Analytics Overview'], ['facilities', 'Facility Table'], ['trend', 'Monthly Trend']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setActiveView(id)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeView === id ? 'border-health-blue text-health-blue' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Age/Sex chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">Patient Demographics — Age & Sex</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageSexData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Legend />
                <Bar dataKey="male" name="Male" fill="#004e89" radius={[4, 4, 0, 0]} />
                <Bar dataKey="female" name="Female" fill="#ffb703" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* County caseload */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">TB Caseload — All 15 Counties</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countyChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={88} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v, _n, p) => [v, p.payload.fullName]}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="diagnosed" name="Diagnosed" fill="#0a8754" radius={[0, 4, 4, 0]} />
                <Bar dataKey="onTreatment" name="On Treatment" fill="#004e89" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* County performance table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
              <h3 className="font-bold text-neutral-800">County Performance Summary — All 15 Counties</h3>
              <button onClick={handleCountyExport} className="text-xs text-health-blue font-bold flex items-center gap-1 border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-100">
                <thead className="bg-neutral-50">
                  <tr>
                    {['County', 'Region', 'Presumptive', 'Diagnosed', 'On Treatment', 'LTFU', 'Success Rate', 'Detection Rate', 'Facilities', 'Last Sync'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(selectedCounty === 'All 15 Counties' ? COUNTY_TB_DATA : COUNTY_TB_DATA.filter(c => c.county === selectedCounty)).map(c => (
                    <tr key={c.county} className="hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => setSelectedCounty(c.county)}>
                      <td className="px-4 py-3 font-bold text-health-blue text-sm">{c.county}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{c.region}</td>
                      <td className="px-4 py-3 text-sm">{c.presumptive}</td>
                      <td className="px-4 py-3 text-sm font-bold">{c.diagnosed}</td>
                      <td className="px-4 py-3 text-sm text-amber-700 font-bold">{c.onTreatment}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{c.ltfu}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-black ${c.successRate >= 85 ? 'text-green-700' : 'text-amber-600'}`}>{c.successRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.detectionRate} / 100k</td>
                      <td className="px-4 py-3 text-sm">{c.facilities}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{c.lastSync}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Facilities Table */}
      {activeView === 'facilities' && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-wrap gap-3 items-center justify-between">
            <h3 className="font-bold text-neutral-800">
              {totalFacilitiesShown} High-Burden Facilities
              {selectedCounty !== 'All 15 Counties' && ` — ${selectedCounty}`}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-neutral-400" />
                <input
                  value={facilitySearch}
                  onChange={e => setFacilitySearch(e.target.value)}
                  type="text" placeholder="Search facilities..."
                  className="pl-8 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-health-blue w-52"
                />
              </div>
              <select value={syncFilter} onChange={e => setSyncFilter(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none">
                {['All', 'Today', 'Yesterday', '2+ Days', 'Not Synced'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={handleFacilityExport} className="text-xs text-health-blue font-bold flex items-center gap-1 border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead className="bg-white">
                <tr>
                  {[
                    { key: 'name' as SortKey, label: 'Facility' },
                    { key: 'county' as SortKey, label: 'County' },
                    { key: 'district' as SortKey, label: 'District' },
                    { key: 'type' as SortKey, label: 'Type' },
                    { key: 'clerk' as SortKey, label: 'Data Clerk' },
                    { key: 'patients' as SortKey, label: 'Patients' },
                    { key: 'onTreatment' as SortKey, label: 'On Tx' },
                    { key: 'ltfu' as SortKey, label: 'LTFU' },
                    { key: 'successRate' as SortKey, label: 'Success %' },
                    { key: 'syncStatus' as SortKey, label: 'Last Sync' },
                  ].map(col => (
                    <th key={col.key}
                      className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase cursor-pointer hover:text-health-blue select-none"
                      onClick={() => toggleSort(col.key)}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredFacilities.map(f => (
                  <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-health-blue">{f.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{f.county}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{f.district}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">{f.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 flex items-center gap-2">
                      <div className="h-6 w-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {f.clerk[0]}
                      </div>
                      {f.clerk}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-neutral-900">{f.patients}</td>
                    <td className="px-4 py-3 text-sm text-amber-700 font-bold">{f.onTreatment}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-bold">{f.ltfu}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-black ${f.successRate >= 85 ? 'text-green-700' : 'text-amber-600'}`}>{f.successRate}%</span>
                    </td>
                    <td className="px-4 py-3"><SyncBadge status={f.syncStatus} /></td>
                  </tr>
                ))}
                {filteredFacilities.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-neutral-400 text-sm">No facilities match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-neutral-50 border-t text-xs text-neutral-400">
            Showing {filteredFacilities.length} of {totalFacilitiesShown} facilities
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {activeView === 'trend' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="font-bold text-neutral-800 mb-4">Monthly TB Cascade Trend (Jan–May 2026)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="screened" stroke="#0e4b87" fill="#e8f0f9" name="Screened" />
                <Area type="monotone" dataKey="diagnosed" stroke="#e67e22" fill="#fef3e7" name="Diagnosed" />
                <Area type="monotone" dataKey="initiated" stroke="#8b5cf6" fill="#f3edff" name="Initiated" />
                <Area type="monotone" dataKey="success" stroke="#27ae60" fill="#eafaf1" name="Success" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="font-bold text-neutral-800 mb-4">Treatment Success Rate by County</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={COUNTY_TB_DATA.map(c => ({ name: c.county.slice(0, 8), rate: c.successRate, target: 85 }))} >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend />
                <Bar dataKey="rate" name="Success Rate" fill="#004e89" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="WHO Target (85%)" fill="#e8f0f9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="font-bold text-neutral-800 mb-4">HIV Co-infection & TB Burden by County</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={COUNTY_TB_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="county" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="diagnosed" name="TB Cases" fill="#004e89" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hivCoinfected" name="HIV Co-infected" fill="#e67e22" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ltfu" name="Lost to Follow-up" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
