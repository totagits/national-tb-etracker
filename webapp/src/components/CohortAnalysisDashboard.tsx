import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';
import { WHO_COHORTS } from '../data/liberiaData';

export const CohortAnalysisDashboard: React.FC = () => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('2025-Q4');
  const [cohortType, setCohortType] = useState<string>('DS-TB (6-Month)');

  const activeCohort = WHO_COHORTS.find(c => c.quarter === selectedQuarter && c.regimenType === cohortType) || WHO_COHORTS[0];

  const handleExportCSV = () => {
    const headers = ['Quarter', 'Cohort Name', 'Regimen Type', 'Registered', 'Bact Confirmed', 'Clin Diagnosed', 'Cured', 'Completed', 'TSR (%)', 'Failed', 'Died', 'LTFU', 'Not Evaluated'];
    const rows = WHO_COHORTS.map(c => [
      c.quarter,
      `"${c.name}"`,
      `"${c.regimenType}"`,
      c.enrolled,
      c.bactConfirmed,
      c.clinDiagnosed,
      c.cured,
      c.completed,
      c.treatmentSuccessRate,
      c.failed,
      c.died,
      c.ltfu,
      c.notEvaluated
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WHO_TB_Cohort_Analysis_${selectedQuarter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-health-blue bg-blue-100 px-3 py-1 rounded-full">
            WHO TB Treatment Outcome Cascade
          </span>
          <h2 className="text-2xl font-black text-neutral-900 mt-1">
            National Standardized Cohort Analysis
          </h2>
          <p className="text-xs text-neutral-500">
            Cohort evaluation at 6 months (DS-TB) and 24 months (MDR-TB) per WHO End TB Strategy and Liberia National TB Guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-health-blue" /> Export WHO Cohort Report (CSV)
          </button>
        </div>
      </div>

      {/* Cohort & Regimen Selectors */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-health-blue" />
            <span className="text-xs font-bold text-neutral-700">Quarterly Cohort:</span>
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(e.target.value)}
              className="text-xs border border-neutral-300 rounded-lg px-3 py-1.5 font-bold outline-none"
            >
              <option value="2025-Q1">2025 Q1 (Evaluated)</option>
              <option value="2025-Q2">2025 Q2 (Evaluated)</option>
              <option value="2025-Q3">2025 Q3 (Evaluated)</option>
              <option value="2025-Q4">2025 Q4 (Evaluated)</option>
              <option value="2026-Q1">2026 Q1 (Interim Active)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700">Cohort Regimen Type:</span>
            <select
              value={cohortType}
              onChange={e => setCohortType(e.target.value)}
              className="text-xs border border-neutral-300 rounded-lg px-3 py-1.5 font-medium outline-none"
            >
              <option value="DS-TB (6-Month)">Drug-Susceptible TB (6-Month Cohort)</option>
              <option value="TB/HIV Co-Infected">TB/HIV Co-Infected Sub-Cohort</option>
              <option value="MDR/RR-TB (24-Month)">Drug-Resistant TB (24-Month Cohort)</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-health-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          WHO Target TSR: ≥90%
        </div>
      </div>

      {/* Active Cohort Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block">Total Registered in Cohort</span>
          <p className="text-3xl font-black text-neutral-900 mt-1">{activeCohort.enrolled}</p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
            <span>Bacteriologically Confirmed:</span>
            <span className="font-bold text-neutral-700">{activeCohort.bactConfirmed}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block">Treatment Success Rate (TSR)</span>
          <p className={`text-3xl font-black mt-1 ${
            activeCohort.treatmentSuccessRate >= 90 ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            {activeCohort.treatmentSuccessRate}%
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
            <span>Cured + Completed:</span>
            <span className="font-bold text-emerald-700">{activeCohort.cured + activeCohort.completed}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block">Smear Conversion at 2 Months</span>
          <p className="text-3xl font-black text-blue-600 mt-1">{activeCohort.conversionAt2MonthsPct}%</p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
            <span>Benchmark:</span>
            <span className="font-bold text-neutral-700">≥85%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 block">Lost to Follow-up (LTFU)</span>
          <p className={`text-3xl font-black mt-1 ${
            (activeCohort.ltfu / activeCohort.enrolled) * 100 > 5 ? 'text-rose-600' : 'text-neutral-800'
          }`}>
            {activeCohort.ltfu} <span className="text-sm font-normal text-neutral-500">({((activeCohort.ltfu / activeCohort.enrolled) * 100).toFixed(1)}%)</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
            <span>Died in Treatment:</span>
            <span className="font-bold text-neutral-700">{activeCohort.died}</span>
          </div>
        </div>
      </div>

      {/* Outcome Distribution Bar */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-neutral-800">Cohort Outcome Distribution Cascade</h4>
        <div className="h-6 w-full bg-neutral-100 rounded-full overflow-hidden flex text-[11px] font-bold text-white text-center">
          <div
            style={{ width: `${(activeCohort.cured / activeCohort.enrolled) * 100}%` }}
            className="bg-emerald-600 flex items-center justify-center"
            title={`Cured: ${activeCohort.cured} (${((activeCohort.cured / activeCohort.enrolled) * 100).toFixed(1)}%)`}
          >
            {activeCohort.cured > 50 && `Cured ${((activeCohort.cured / activeCohort.enrolled) * 100).toFixed(0)}%`}
          </div>
          <div
            style={{ width: `${(activeCohort.completed / activeCohort.enrolled) * 100}%` }}
            className="bg-emerald-400 flex items-center justify-center text-neutral-900"
            title={`Completed: ${activeCohort.completed} (${((activeCohort.completed / activeCohort.enrolled) * 100).toFixed(1)}%)`}
          >
            {activeCohort.completed > 30 && `Comp ${((activeCohort.completed / activeCohort.enrolled) * 100).toFixed(0)}%`}
          </div>
          <div
            style={{ width: `${(activeCohort.failed / activeCohort.enrolled) * 100}%` }}
            className="bg-rose-500 flex items-center justify-center"
            title={`Failed: ${activeCohort.failed}`}
          >
          </div>
          <div
            style={{ width: `${(activeCohort.died / activeCohort.enrolled) * 100}%` }}
            className="bg-neutral-700 flex items-center justify-center"
            title={`Died: ${activeCohort.died}`}
          >
          </div>
          <div
            style={{ width: `${(activeCohort.ltfu / activeCohort.enrolled) * 100}%` }}
            className="bg-amber-500 flex items-center justify-center text-neutral-900"
            title={`LTFU: ${activeCohort.ltfu}`}
          >
          </div>
          {activeCohort.notEvaluated > 0 && (
            <div
              style={{ width: `${(activeCohort.notEvaluated / activeCohort.enrolled) * 100}%` }}
              className="bg-blue-300 flex items-center justify-center text-neutral-800"
              title={`Not Evaluated / In Care: ${activeCohort.notEvaluated}`}
            >
              In Care
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-emerald-600 rounded-xs"></span> Cured ({activeCohort.cured})</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-emerald-400 rounded-xs"></span> Completed ({activeCohort.completed})</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-rose-500 rounded-xs"></span> Failed ({activeCohort.failed})</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-neutral-700 rounded-xs"></span> Died ({activeCohort.died})</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-amber-500 rounded-xs"></span> LTFU / Defaulter ({activeCohort.ltfu})</div>
          {activeCohort.notEvaluated > 0 && (
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 bg-blue-300 rounded-xs"></span> Active In Care ({activeCohort.notEvaluated})</div>
          )}
        </div>
      </div>

      {/* Standard WHO Cohort Reporting Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h4 className="font-bold text-sm text-neutral-800">
            WHO Standard TB Cohort Analysis Matrix (Multi-Quarter Trend)
          </h4>
          <span className="text-xs text-neutral-500">
            DHIS2 Aggregate Report Template Equivalent
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Cohort Quarter</th>
                <th className="p-3">Regimen Type</th>
                <th className="p-3 text-right">Enrolled</th>
                <th className="p-3 text-right">Bact Confirmed</th>
                <th className="p-3 text-right">Cured</th>
                <th className="p-3 text-right">Completed</th>
                <th className="p-3 text-right font-black text-health-blue">TSR (%)</th>
                <th className="p-3 text-right">Failed</th>
                <th className="p-3 text-right">Died</th>
                <th className="p-3 text-right">LTFU</th>
                <th className="p-3 text-right">Not Eval</th>
                <th className="p-3 text-right">2M Conv (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {WHO_COHORTS.map(c => {
                const isCurrent = c.quarter === selectedQuarter && c.regimenType === cohortType;

                return (
                  <tr key={`${c.quarter}-${c.regimenType}`} className={`hover:bg-neutral-50 transition-colors ${isCurrent ? 'bg-blue-50/50 font-medium' : ''}`}>
                    <td className="p-3 font-bold text-neutral-800">{c.quarter}</td>
                    <td className="p-3 text-neutral-600">{c.regimenType}</td>
                    <td className="p-3 text-right font-bold">{c.enrolled}</td>
                    <td className="p-3 text-right text-neutral-600">{c.bactConfirmed}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{c.cured}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">{c.completed}</td>
                    <td className="p-3 text-right font-black text-health-blue">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        c.treatmentSuccessRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.treatmentSuccessRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-rose-600">{c.failed}</td>
                    <td className="p-3 text-right text-neutral-600">{c.died}</td>
                    <td className="p-3 text-right text-amber-700 font-bold">{c.ltfu}</td>
                    <td className="p-3 text-right text-neutral-400">{c.notEvaluated}</td>
                    <td className="p-3 text-right text-blue-700 font-bold">{c.conversionAt2MonthsPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
