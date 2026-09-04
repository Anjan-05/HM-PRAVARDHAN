import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api.ts';
import {
  School,
  Headmaster,
  PerformanceRecord,
  Achievement,
  ScoreAppeal,
  PerformanceCategory,
  StudentPerformanceSummary,
} from '../../types.ts';
import {
  ShieldCheck,
  Building2,
  Users,
  Trophy,
  Award,
  AlertCircle,
  Search,
  Sliders,
  CheckCircle2,
  X,
  Scale,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Filter,
  Layers,
  FileCheck,
} from 'lucide-react';
import { StudentPerformanceManager } from '../common/StudentPerformanceManager.tsx';

interface MandalStat {
  mandal: string;
  totalSchools: number;
  averageScore: number;
  topSchool: string;
  topSchoolScore: number;
  passPercentage: number;
}

export const DEODashboard: React.FC = () => {
  const { user } = useAuth();
  const districtName = user?.district || 'Warangal Urban';
  const deoName = user?.name || 'Dr. K. Ramana Rao';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'mandals' | 'schools' | 'students' | 'evaluation' | 'appeals'
  >('overview');

  const [schools, setSchools] = useState<School[]>([]);
  const [headmasters, setHeadmasters] = useState<Headmaster[]>([]);
  const [rankings, setRankings] = useState<PerformanceRecord[]>([]);
  const [appeals, setAppeals] = useState<ScoreAppeal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentPerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // School Explorer Filters
  const [selectedMandalFilter, setSelectedMandalFilter] = useState<string>('ALL');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'latestScore' | 'totalStudents'>('latestScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Appeal Review Modal
  const [selectedApl, setSelectedApl] = useState<ScoreAppeal | null>(null);
  const [aplStatus, setAplStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [aplRemarks, setAplRemarks] = useState<string>('');
  const [aplAdjustedScore, setAplAdjustedScore] = useState<number>(85);
  const [aplSaving, setAplSaving] = useState(false);

  // Score Evaluation Entry
  const [evalHmId, setEvalHmId] = useState<string>('');
  const [evalPeriod, setEvalPeriod] = useState<string>('Term 3 (2025-26)');
  const [evalScores, setEvalScores] = useState<Record<PerformanceCategory, number>>({
    academic: 85,
    schoolMgmt: 82,
    studentDev: 80,
    community: 78,
    leadership: 84,
  });
  const [evalSaving, setEvalSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDistrictData = async () => {
    setLoading(true);
    try {
      // 1. Fetch schools strictly inside this district
      const allSchools = await api.getSchools({ district: districtName });
      const districtSchools = allSchools.filter(
        (s) => (s.district || '').toLowerCase() === districtName.toLowerCase()
      );
      setSchools(districtSchools);

      // 2. Fetch headmasters in this district
      const allHMs = await api.getHeadmasters();
      const districtHMs = allHMs.filter(
        (h) => (h.district || '').toLowerCase() === districtName.toLowerCase()
      );
      setHeadmasters(districtHMs);
      if (districtHMs.length > 0 && !evalHmId) {
        setEvalHmId(districtHMs[0].id);
      }

      // 3. Fetch rankings
      const allRanks = await api.getRankings();
      const districtRanks = allRanks.filter(
        (r) => (r.district || '').toLowerCase() === districtName.toLowerCase()
      );
      setRankings(districtRanks);

      // 4. Fetch appeals for schools in this district
      const allAppeals = await api.getAppeals();
      const schoolIdSet = new Set(districtSchools.map((s) => s.id));
      const districtAppeals = allAppeals.filter((a) => schoolIdSet.has(a.schoolId));
      setAppeals(districtAppeals);

      // 5. Fetch district-wide student performance summary
      const dSummary = await api.getStudentSummary({ district: districtName });
      setStudentSummary(dSummary);
    } catch (e) {
      console.error('Failed to load DEO district data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistrictData();
  }, [districtName]);

  // Derived Mandals in this District
  const mandalsInDistrict: string[] = Array.from(
    new Set(schools.map((s) => s.mandal).filter(Boolean))
  ) as string[];

  // Compute mandal-wise statistics
  const mandalStats: MandalStat[] = mandalsInDistrict.map((m: string) => {
    const mandalSchools = schools.filter((s) => s.mandal === m);
    const avg =
      mandalSchools.length > 0
        ? mandalSchools.reduce((acc, s) => acc + (s.latestScore || 75), 0) /
          mandalSchools.length
        : 0;
    const sortedMandalSchools = [...mandalSchools].sort(
      (a, b) => (b.latestScore || 0) - (a.latestScore || 0)
    );
    const top = sortedMandalSchools[0];

    return {
      mandal: m,
      totalSchools: mandalSchools.length,
      averageScore: Number(avg.toFixed(1)),
      topSchool: top?.name || 'N/A',
      topSchoolScore: top?.latestScore || 0,
      passPercentage: m.includes('Kazipet') ? 94.2 : m.includes('Hanamkonda') ? 93.8 : 91.5,
    };
  }).sort((a, b) => b.averageScore - a.averageScore);

  const totalMandals = mandalsInDistrict.length;
  const totalSchools = schools.length;
  const districtAvgScore =
    totalSchools > 0
      ? (
          schools.reduce((acc, s) => acc + (s.latestScore || 75), 0) / totalSchools
        ).toFixed(1)
      : '0.0';

  const topPerformingMandal = mandalStats[0] || null;
  const lowPerformingMandals = mandalStats.filter((m) => m.averageScore < 79);
  const pendingAppeals = appeals.filter((a) => a.status === 'SUBMITTED');

  // Handle Appeal Adjudication
  const handleReviewAppeal = async () => {
    if (!selectedApl) return;
    setAplSaving(true);
    try {
      await api.reviewAppeal(selectedApl.id, {
        status: aplStatus,
        reviewRemarks: aplRemarks || 'Reviewed and adjudicated by District Education Officer',
        adjustedCategoryScore: aplStatus === 'APPROVED' ? Number(aplAdjustedScore) : undefined,
        reviewedBy: deoName,
      });
      setToastMessage(`Score appeal successfully marked as ${aplStatus}!`);
      setSelectedApl(null);
      setTimeout(() => setToastMessage(null), 3500);
      loadDistrictData();
    } catch (e: any) {
      alert(e.message || 'Failed to review appeal');
    } finally {
      setAplSaving(false);
    }
  };

  // Handle Performance Evaluation Entry
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const hm = headmasters.find((h) => h.id === evalHmId);
    if (!hm) return;
    const sch = schools.find((s) => s.id === hm.schoolId);

    setEvalSaving(true);
    try {
      const existingLatest = rankings.find((r) => r.headmasterId === hm.id);
      const bonusCredits = existingLatest?.approvedBonusCredits || 0;

      await api.savePerformance({
        headmasterId: hm.id,
        headmasterName: hm.name,
        schoolId: sch?.id || hm.schoolId || 'sch-1',
        schoolName: sch?.name || hm.schoolName,
        district: districtName,
        mandal: sch?.mandal || 'Kazipet',
        evaluationPeriod: evalPeriod,
        periodOrder: evalPeriod.includes('Term 3') ? 3 : evalPeriod.includes('Term 2') ? 2 : 1,
        categories: evalScores,
        approvedBonusCredits: bonusCredits,
      });

      setToastMessage(`Official evaluation saved successfully for ${hm.name}!`);
      setTimeout(() => setToastMessage(null), 3500);
      loadDistrictData();
    } catch (e: any) {
      alert(e.message || 'Failed to record performance evaluation');
    } finally {
      setEvalSaving(false);
    }
  };

  // Filtered & Sorted Schools for Explorer
  const filteredSchools = schools
    .filter((s) => {
      const matchesMandal =
        selectedMandalFilter === 'ALL' || s.mandal === selectedMandalFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.udiseCode.includes(schoolSearch) ||
        s.mandal.toLowerCase().includes(schoolSearch.toLowerCase());
      return matchesMandal && matchesSearch;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField] || 0;
      let bVal: any = b[sortField] || 0;
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <X className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Header Profile Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center font-bold text-xl text-white shadow-xs">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
                  DEO-WGL-001
                </span>
                <span className="text-xs bg-blue-950 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-800">
                  District Educational Officer
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {deoName}
              </h1>
              <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap gap-x-2">
                <span className="font-semibold text-white">{districtName} District</span>
                <span>&bull;</span>
                <span>Department of School Education</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-medium">Full District Administrative Jurisdiction</span>
              </div>
            </div>
          </div>

          {/* District Quick Metrics Banner */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-5 text-xs shadow-md">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Total Mandals
              </span>
              <span className="text-2xl font-black text-white">{totalMandals || 3}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">In {districtName}</span>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Total Schools
              </span>
              <span className="text-2xl font-black text-white">{totalSchools}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Govt High Schools</span>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                District Avg Score
              </span>
              <span className="text-2xl font-black text-emerald-400">{districtAvgScore}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Scale 0 - 100</span>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Class 10 Pass %
              </span>
              <span className="text-2xl font-black text-blue-400">
                {studentSummary?.passPercentage || 92.5}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">District aggregate</span>
            </div>
          </div>
        </div>

        {/* DEO Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            District Overview
          </button>
          <button
            onClick={() => setActiveTab('mandals')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'mandals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mandal Comparison ({mandalStats.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'schools'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>School Explorer ({schools.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>District Student Performance (Class 10)</span>
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'evaluation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Score Evaluation Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'appeals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Score Appeals Review</span>
            {pendingAppeals.length > 0 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingAppeals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: DISTRICT OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Mandals in District</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">{totalMandals} Mandals</div>
              <div className="text-[11px] text-gray-500 mt-1">Supervised by DEO {districtName}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Top Performing Mandal</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-base font-bold text-gray-900 truncate">
                {topPerformingMandal?.mandal || 'Kazipet'} Mandal
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Avg Score: {topPerformingMandal?.averageScore || 82.5} / 100
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Low Performing Mandals</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                {lowPerformingMandals.length} Mandals
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Requiring administrative focus</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Score Appeals</span>
                <Scale className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {pendingAppeals.length} Appeals
              </div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                Awaiting DEO adjudication
              </div>
            </div>
          </div>

          {/* 2-Column: Mandal Leaders & Low Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Mandals */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-gray-900">
                    Mandal Performance Standings ({districtName})
                  </h3>
                </div>
                <span className="text-xs text-gray-500">Ranked by Evaluation Average</span>
              </div>
              <div className="divide-y divide-gray-100">
                {mandalStats.map((m, idx) => (
                  <div key={m.mandal} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-black text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">{m.mandal} Mandal</div>
                        <div className="text-[10px] text-gray-500">
                          {m.totalSchools} Schools &bull; Top: {m.topSchool} ({m.topSchoolScore})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-blue-900">{m.averageScore}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        Class 10 Pass: {m.passPercentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Administrative Alerts */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-gray-900">
                    District Education Officer Priority Directives
                  </h3>
                </div>
                <span className="text-xs text-blue-700 font-semibold">Directives</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-900">
                  <div className="font-bold">Term 3 Board Examination Preparedness</div>
                  <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                    Mandals with pass projection below 90% must initiate evening remedial coaching
                    and weekly student mock tests for Mathematics and Science.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900">
                  <div className="font-bold">Score Evaluation Entry Deadline</div>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    All category scores for Academic Leadership and Community Engagement must be finalized
                    by the end of the current evaluation cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MANDAL COMPARISON TABLE ================= */}
      {activeTab === 'mandals' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Mandal Comparative Analysis ({districtName} District)
            </h3>
            <p className="text-xs text-gray-500">
              Comparative benchmark across all educational mandals showing institutional count, evaluation averages, and top schools
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mandal Rank</th>
                  <th className="py-3 px-4">Mandal Name</th>
                  <th className="py-3 px-4 text-center">Total Schools</th>
                  <th className="py-3 px-4 text-center">Mandal Avg Score</th>
                  <th className="py-3 px-4">Top Performing School</th>
                  <th className="py-3 px-4 text-center">Class 10 Pass %</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {mandalStats.map((m, idx) => (
                  <tr key={m.mandal} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 text-sm">{m.mandal} Mandal</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800">{m.totalSchools}</td>
                    <td className="py-3 px-4 text-center font-black text-sm text-blue-900">
                      {m.averageScore} / 100
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{m.topSchool}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        Score: {m.topSchoolScore}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {m.passPercentage}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedMandalFilter(m.mandal);
                          setActiveTab('schools');
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                      >
                        View Schools &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SCHOOL EXPLORER ================= */}
      {activeTab === 'schools' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                School Explorer ({districtName} District)
              </h3>
              <p className="text-xs text-gray-500">
                Browse, search, and sort all government high schools across all mandals in {districtName}
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-bold text-gray-700">Mandal:</span>
                <select
                  value={selectedMandalFilter}
                  onChange={(e) => setSelectedMandalFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg py-1 px-2 text-xs font-bold text-gray-800"
                >
                  <option value="ALL">All Mandals ({schools.length})</option>
                  {mandalsInDistrict.map((m) => (
                    <option key={m} value={m}>
                      {m} Mandal
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search name, UDISE..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1 pl-8 pr-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">School Name &amp; Code</th>
                  <th className="py-3 px-4">Mandal</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Students</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">District Rank</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredSchools.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        UDISE: {s.udiseCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-800">{s.mandal}</td>
                    <td className="py-3 px-4 text-gray-600">{s.category}</td>
                    <td className="py-3 px-4 text-center text-gray-900 font-semibold">{s.totalStudents}</td>
                    <td className="py-3 px-4 text-center font-black text-sm text-blue-900">
                      {s.latestScore || 80}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const hm = headmasters.find((h) => h.schoolId === s.id);
                          if (hm) {
                            setEvalHmId(hm.id);
                            setActiveTab('evaluation');
                          } else {
                            alert('No HM profile mapped for evaluation.');
                          }
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                      >
                        Evaluate &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DISTRICT STUDENT PERFORMANCE (CLASS 10) ================= */}
      {activeTab === 'students' && (
        <StudentPerformanceManager
          role="DEO"
          district={districtName}
          schoolsList={schools.map((s) => ({ id: s.id, name: s.name, mandal: s.mandal }))}
          mandalsList={mandalsInDistrict}
        />
      )}

      {/* ================= TAB 5: SCORE EVALUATION ENTRY ================= */}
      {activeTab === 'evaluation' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              DEO Official Score Evaluation Entry
            </h3>
            <p className="text-xs text-gray-500">
              Assign or update official performance category scores for Gazetted Headmasters in {districtName}
            </p>
          </div>

          <form onSubmit={handleSaveEvaluation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Headmaster</label>
                <select
                  value={evalHmId}
                  onChange={(e) => setEvalHmId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 font-bold text-gray-900"
                >
                  {headmasters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} &bull; {h.schoolName} ({h.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Evaluation Period</label>
                <select
                  value={evalPeriod}
                  onChange={(e) => setEvalPeriod(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 font-bold text-gray-900"
                >
                  <option value="Term 3 (2025-26)">Term 3 (2025-26) - Annual Summative</option>
                  <option value="Term 2 (2025-26)">Term 2 (2025-26) - Midterm Review</option>
                  <option value="Term 1 (2025-26)">Term 1 (2025-26) - Diagnostic Phase</option>
                </select>
              </div>
            </div>

            {/* Category Score Sliders */}
            <div className="space-y-4 pt-4 border-t border-gray-100 text-xs">
              <h4 className="font-bold text-sm text-gray-900">
                Evaluation Categories &amp; Weightages
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Academic Leadership (Weight: 25%)</span>
                    <span className="text-blue-700 font-extrabold text-sm">{evalScores.academic} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={evalScores.academic}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, academic: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>School Governance &amp; Administration (Weight: 20%)</span>
                    <span className="text-blue-700 font-extrabold text-sm">{evalScores.schoolMgmt} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={evalScores.schoolMgmt}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, schoolMgmt: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Student Holistic Development (Weight: 20%)</span>
                    <span className="text-blue-700 font-extrabold text-sm">{evalScores.studentDev} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={evalScores.studentDev}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, studentDev: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Community Engagement &amp; SMC (Weight: 15%)</span>
                    <span className="text-blue-700 font-extrabold text-sm">{evalScores.community} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={evalScores.community}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, community: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Professional Development &amp; Innovation (Weight: 20%)</span>
                    <span className="text-blue-700 font-extrabold text-sm">{evalScores.leadership} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={evalScores.leadership}
                    onChange={(e) =>
                      setEvalScores({ ...evalScores, leadership: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={evalSaving}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-lg cursor-pointer shadow-xs"
              >
                {evalSaving ? 'Saving Official Record...' : 'Publish & Finalize Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 6: SCORE APPEALS REVIEW ================= */}
      {activeTab === 'appeals' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Score Appeals Adjudication
            </h3>
            <p className="text-xs text-gray-500">
              Official grievances and score appeals lodged by Headmasters in {districtName} District
            </p>
          </div>

          {appeals.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No score appeals pending from schools in this district.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appeals.map((apl) => (
                <div
                  key={apl.id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          apl.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apl.status === 'SUBMITTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {apl.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{apl.submittedDate}</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 mt-2">
                      {apl.category.toUpperCase()} Appeal &bull; Claim: {apl.claimedScore} pts
                    </h4>
                    <p className="text-xs text-blue-800 font-semibold">{apl.headmasterName}</p>
                    <p className="text-xs text-gray-500">{apl.schoolName}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
                      {apl.reason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">
                      Current Score: <strong>{apl.originalScore} / 100</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedApl(apl);
                        setAplStatus('APPROVED');
                        setAplAdjustedScore(apl.claimedScore || 85);
                        setAplRemarks(apl.reviewRemarks || '');
                      }}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Adjudicate Appeal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adjudication Modal */}
      {selectedApl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900">Adjudicate Score Appeal</h3>
              <button onClick={() => setSelectedApl(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
              <div className="font-bold text-gray-900">{selectedApl.headmasterName}</div>
              <div className="text-blue-800 font-semibold">{selectedApl.schoolName}</div>
              <div className="text-gray-500 mt-1">Appeal Category: {selectedApl.category}</div>
              <div className="text-gray-500">Reason: {selectedApl.reason}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Adjudication Ruling</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAplStatus('APPROVED')}
                    className={`py-2 rounded-lg font-bold border text-center cursor-pointer ${
                      aplStatus === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Approve Appeal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAplStatus('REJECTED')}
                    className={`py-2 rounded-lg font-bold border text-center cursor-pointer ${
                      aplStatus === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Reject Appeal
                  </button>
                </div>
              </div>

              {aplStatus === 'APPROVED' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Adjusted Final Category Score</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={aplAdjustedScore}
                    onChange={(e) => setAplAdjustedScore(parseInt(e.target.value) || 85)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official DEO Remarks</label>
                <textarea
                  rows={3}
                  value={aplRemarks}
                  onChange={(e) => setAplRemarks(e.target.value)}
                  placeholder="Official ruling notes..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApl(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={aplSaving}
                onClick={handleReviewAppeal}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer shadow-xs"
              >
                {aplSaving ? 'Recording Ruling...' : 'Submit Ruling'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
