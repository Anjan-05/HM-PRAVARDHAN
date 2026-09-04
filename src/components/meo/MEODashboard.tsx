import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api.ts';
import {
  School,
  Achievement,
  ActivityPost,
  StudentRecord,
  StudentPerformanceSummary,
} from '../../types.ts';
import {
  Building2,
  Users,
  Trophy,
  Award,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  X,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { StudentPerformanceManager } from '../common/StudentPerformanceManager.tsx';
import { ActivityFeedCard } from '../activity/ActivityFeedCard.tsx';

export const MEODashboard: React.FC = () => {
  const { user } = useAuth();
  const mandalName = user?.mandal || 'Kazipet';
  const districtName = user?.district || 'Warangal Urban';
  const meoName = user?.name || 'Sri S. Venkateshwarlu';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'schools' | 'students' | 'verification' | 'activities'
  >('overview');

  const [schools, setSchools] = useState<School[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<ActivityPost[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentPerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // School search query
  const [schoolSearch, setSchoolSearch] = useState('');

  // Achievement verification modal
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);
  const [verStatus, setVerStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [verBonus, setVerBonus] = useState<number>(2);
  const [verFeedback, setVerFeedback] = useState<string>('');
  const [verSaving, setVerSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadMandalData = async () => {
    setLoading(true);
    try {
      // Fetch schools strictly inside this mandal
      const allSchools = await api.getSchools({ mandal: mandalName });
      const mandalSchools = allSchools.filter(
        (s) => (s.mandal || '').toLowerCase() === mandalName.toLowerCase()
      );
      setSchools(mandalSchools);

      // Fetch achievements for schools in this mandal
      const allAchs = await api.getAchievements();
      const mandalSchoolIds = new Set(mandalSchools.map((s) => s.id));
      const filteredAchs = allAchs.filter((a) => mandalSchoolIds.has(a.schoolId));
      setAchievements(filteredAchs);

      // Fetch activities for schools in this mandal
      const mandalActivities = await api.getActivityPosts({ mandal: mandalName });
      setActivities(mandalActivities);

      // Fetch aggregated Class 10 student summary for this mandal
      const sSummary = await api.getStudentSummary({ mandal: mandalName });
      setStudentSummary(sSummary);
    } catch (e) {
      console.error('Failed to load MEO data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandalData();
  }, [mandalName]);

  // Compute mandal overview stats
  const totalSchools = schools.length;
  const mandalAvgScore =
    totalSchools > 0
      ? (
          schools.reduce((acc, s) => acc + (s.latestScore || 75), 0) / totalSchools
        ).toFixed(1)
      : '0.0';

  const sortedSchools = [...schools].sort(
    (a, b) => (b.latestScore || 0) - (a.latestScore || 0)
  );
  const topSchool = sortedSchools[0] || null;
  const lowPerformingSchools = sortedSchools.filter((s) => (s.latestScore || 0) < 78);
  const pendingAchievements = achievements.filter((a) => a.status === 'PENDING');

  const handleVerifyAchievement = async () => {
    if (!selectedAch) return;
    setVerSaving(true);
    try {
      await api.verifyAchievement(selectedAch.id, {
        status: verStatus,
        awardedBonusCredits: verStatus === 'VERIFIED' ? Number(verBonus) : 0,
        feedback: verFeedback || 'Verified by Mandal Education Officer',
        featured: false,
      });
      setActionSuccess(`Achievement marked as ${verStatus}!`);
      setSelectedAch(null);
      setTimeout(() => setActionSuccess(null), 3500);
      loadMandalData();
    } catch (e: any) {
      alert(e.message || 'Failed to update achievement');
    } finally {
      setVerSaving(false);
    }
  };

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.udiseCode.includes(schoolSearch) ||
      s.category.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)}>
            <X className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Header Profile Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-xs">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">
                  MEO-KAZ-091
                </span>
                <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">
                  Mandal Education Officer
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {meoName}
              </h1>
              <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap gap-x-2">
                <span className="font-semibold text-white">{mandalName} Mandal</span>
                <span>&bull;</span>
                <span>{districtName} District</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-medium">Jurisdiction: Kazipet Mandal Schools Only</span>
              </div>
            </div>
          </div>

          {/* Mandal Quick Metrics Banner */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-5 text-xs shadow-md">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Mandal Schools
              </span>
              <span className="text-2xl font-black text-white">{totalSchools}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Assigned in {mandalName}</span>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Mandal Avg Score
              </span>
              <span className="text-2xl font-black text-emerald-400">{mandalAvgScore}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Out of 100 max</span>
            </div>
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                Class 10 Pass %
              </span>
              <span className="text-2xl font-black text-indigo-400">
                {studentSummary?.passPercentage || 92.5}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Mandal aggregate</span>
            </div>
          </div>
        </div>

        {/* MEO Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Mandal Overview
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'schools'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mandal Schools ({schools.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Performance (Class 10)</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'verification'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Achievement Verification</span>
            {pendingAchievements.length > 0 && (
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingAchievements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'activities'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mandal Activity Feed ({activities.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: MANDAL OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Schools in Mandal</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">{totalSchools} Schools</div>
              <div className="text-[11px] text-gray-500 mt-1">Under Kazipet Mandal supervision</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Top Performing</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-base font-bold text-gray-900 truncate">
                {topSchool?.name || 'ZPHS Kazipet'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Score: {topSchool?.latestScore || 84.8} / 100
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Intervention Needed</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                {lowPerformingSchools.length} Schools
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Evaluation score &lt; 78</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Verifications</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {pendingAchievements.length} Pending
              </div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                Awaiting MEO sign-off
              </div>
            </div>
          </div>

          {/* 2-Column: Top & Low performing schools breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Performers */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-gray-900">
                    Mandal High Performers
                  </h3>
                </div>
                <span className="text-xs text-gray-500">Sorted by Evaluation Score</span>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedSchools.slice(0, 4).map((s, idx) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {s.category} &bull; UDISE: {s.udiseCode}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-emerald-700">{s.latestScore || 80}</div>
                      <div className="text-[10px] text-gray-500">Mandal #{idx + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Performers Needing Intervention */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-gray-900">
                    Schools Requiring MEO Academic Intervention
                  </h3>
                </div>
                <span className="text-xs text-amber-700 font-semibold">Priority Action</span>
              </div>
              <div className="divide-y divide-gray-100">
                {lowPerformingSchools.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500">
                    All schools in {mandalName} are currently performing above the 78-point benchmark.
                  </div>
                ) : (
                  lowPerformingSchools.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {s.category} &bull; Needs remediation
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-amber-700">{s.latestScore || 72}</div>
                        <div className="text-[10px] text-amber-600 font-semibold">Action Required</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MANDAL SCHOOLS LIST ================= */}
      {activeTab === 'schools' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Schools in {mandalName} Mandal
              </h3>
              <p className="text-xs text-gray-500">
                Complete institutional directory under MEO jurisdiction
              </p>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search school name or UDISE..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">School Name &amp; Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Teachers</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Mandal Rank</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredSchools.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        UDISE: {s.udiseCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.category}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">{s.totalStudents}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">{s.totalTeachers}</td>
                    <td className="py-3 px-4 text-center font-black text-sm text-indigo-900">
                      {s.latestScore || 80}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STUDENT PERFORMANCE (CLASS 10) ================= */}
      {activeTab === 'students' && (
        <StudentPerformanceManager
          role="MEO"
          mandal={mandalName}
          district={districtName}
          schoolsList={schools.map((s) => ({ id: s.id, name: s.name, mandal: s.mandal }))}
        />
      )}

      {/* ================= TAB 4: ACHIEVEMENT VERIFICATION ================= */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Mandal Achievement Verification
            </h3>
            <p className="text-xs text-gray-500">
              Review and officially verify institutional achievements submitted by Headmasters in {mandalName} Mandal
            </p>
          </div>

          {achievements.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No achievements found for schools in this mandal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          a.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {a.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{a.dateAchieved}</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 mt-2">{a.title}</h4>
                    <p className="text-xs text-indigo-700 font-semibold">{a.schoolName}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">
                      {a.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">
                      Credits: <strong className="text-emerald-700">+{a.awardedBonusCredits || 0} pts</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedAch(a);
                        setVerBonus(a.awardedBonusCredits || 2);
                        setVerFeedback(a.evaluatorFeedback || '');
                        setVerStatus('VERIFIED');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Verify / Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: MANDAL ACTIVITY FEED ================= */}
      {activeTab === 'activities' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {mandalName} Mandal School Activity Highlights
            </h3>
            <p className="text-xs text-gray-500">
              Live professional updates, events, and initiatives posted by schools in your mandal
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No recent activity posts from schools in {mandalName} Mandal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => (
                <ActivityFeedCard
                  key={act.id}
                  post={act}
                  currentUser={user}
                  onLike={async (postId) => {
                    await api.toggleLikeActivityPost(postId, user?.id || 'meo-1');
                    loadMandalData();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Modal */}
      {selectedAch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900">Verify School Achievement</h3>
              <button onClick={() => setSelectedAch(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
              <div className="font-bold text-gray-900">{selectedAch.title}</div>
              <div className="text-indigo-700 font-semibold">{selectedAch.schoolName}</div>
              <div className="text-gray-500 mt-1">{selectedAch.description}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerStatus('VERIFIED')}
                    className={`py-2 rounded-lg font-bold border text-center cursor-pointer ${
                      verStatus === 'VERIFIED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Verify &amp; Award Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerStatus('REJECTED')}
                    className={`py-2 rounded-lg font-bold border text-center cursor-pointer ${
                      verStatus === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {verStatus === 'VERIFIED' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bonus Credits (Max 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={verBonus}
                    onChange={(e) => setVerBonus(parseInt(e.target.value) || 2)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Officer Feedback Remarks</label>
                <textarea
                  rows={3}
                  value={verFeedback}
                  onChange={(e) => setVerFeedback(e.target.value)}
                  placeholder="Official verification remarks..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAch(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verSaving}
                onClick={handleVerifyAchievement}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
              >
                {verSaving ? 'Saving...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
