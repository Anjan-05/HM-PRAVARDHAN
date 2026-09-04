import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api.ts';
import {
  School,
  Headmaster,
  PerformanceRecord,
  Achievement,
  Complaint,
  ScoreAppeal,
  AnalyticsSummary,
  PerformanceCategory,
} from '../../types.ts';
import {
  ShieldCheck,
  Building,
  Users,
  Trophy,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Edit2,
  Trash2,
  Scale,
  Sparkles,
  BarChart2,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  Sliders,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const EODashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'verification'
    | 'appeals'
    | 'complaints'
    | 'compare'
    | 'perf-entry'
    | 'schools'
    | 'headmasters'
  >('overview');

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [headmasters, setHeadmasters] = useState<Headmaster[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [appeals, setAppeals] = useState<ScoreAppeal[]>([]);
  const [rankings, setRankings] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);
  const [verStatus, setVerStatus] = useState<'VERIFIED' | 'REJECTED' | 'INFO_REQUIRED'>('VERIFIED');
  const [verBonus, setVerBonus] = useState<number>(2);
  const [verFeatured, setVerFeatured] = useState<boolean>(true);
  const [verFeedback, setVerFeedback] = useState<string>('');
  const [verSaving, setVerSaving] = useState(false);

  // Complaint response state
  const [selectedCmp, setSelectedCmp] = useState<Complaint | null>(null);
  const [cmpStatus, setCmpStatus] = useState<Complaint['status']>('Resolved');
  const [cmpResponse, setCmpResponse] = useState<string>('');
  const [cmpSaving, setCmpSaving] = useState(false);

  // Appeal review state
  const [selectedApl, setSelectedApl] = useState<ScoreAppeal | null>(null);
  const [aplStatus, setAplStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [aplRemarks, setAplRemarks] = useState<string>('');
  const [aplAdjustedScore, setAplAdjustedScore] = useState<number>(85);
  const [aplSaving, setAplSaving] = useState(false);

  // Comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Performance Entry state
  const [entryHmId, setEntryHmId] = useState<string>('');
  const [entryPeriod, setEntryPeriod] = useState<string>('Term 3 (2025-26)');
  const [entryScores, setEntryScores] = useState<Record<PerformanceCategory, number>>({
    academic: 85,
    schoolMgmt: 82,
    studentDev: 80,
    teacherMgmt: 84,
    infrastructure: 78,
    admin: 86,
  });
  const [entrySaving, setEntrySaving] = useState(false);
  const [entrySuccess, setEntrySuccess] = useState(false);

  // School modal state
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState<Partial<School>>({
    name: '',
    schoolCode: '',
    category: 'High School (6-10)',
    district: 'Warangal Urban',
    mandal: 'Kazipet',
    address: '',
    studentCount: 400,
    teacherCount: 16,
    establishedYear: 1985,
    contactNumber: '0870-2458899',
    headmasterId: '',
    headmasterName: 'Unassigned',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        analyticsData,
        schoolsData,
        hmsData,
        achData,
        cmpData,
        aplData,
        rankData,
      ] = await Promise.all([
        api.getAnalytics(),
        api.getSchools(),
        api.getHeadmasters(),
        api.getAchievements(),
        api.getComplaints(),
        api.getAppeals(),
        api.getRankings({ period: 'Term 3 (2025-26)' }),
      ]);

      setAnalytics(analyticsData);
      setSchools(schoolsData);
      setHeadmasters(hmsData);
      setAchievements(achData);
      setComplaints(cmpData);
      setAppeals(aplData);
      setRankings(rankData);

      if (hmsData.length > 0 && !entryHmId) {
        setEntryHmId(hmsData[0].id);
      }
      if (hmsData.length >= 2 && compareIds.length === 0) {
        setCompareIds([hmsData[0].id, hmsData[1].id]);
      }
    } catch (err) {
      console.error('Error loading EO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Achievement Verification
  const handleSaveVerification = async () => {
    if (!selectedAch) return;
    setVerSaving(true);
    try {
      await api.verifyAchievement(selectedAch.id, {
        status: verStatus,
        bonusCreditsAwarded: verStatus === 'VERIFIED' ? Number(verBonus) : 0,
        isFeatured: verFeatured,
        officerFeedback: verFeedback || 'Verified by District Education Office.',
        verifiedBy: user?.name || 'Dr. K. Srinivas Rao, DEO',
      });
      setSelectedAch(null);
      loadData();
    } catch (err) {
      console.error('Error verifying achievement:', err);
    } finally {
      setVerSaving(false);
    }
  };

  // Handle Complaint Response
  const handleSaveComplaintResponse = async () => {
    if (!selectedCmp) return;
    setCmpSaving(true);
    try {
      await api.respondComplaint(selectedCmp.id, {
        status: cmpStatus,
        officerResponse: cmpResponse || 'Action initiated by District Education Office.',
        resolvedBy: user?.name || 'Dr. K. Srinivas Rao, DEO',
      });
      setSelectedCmp(null);
      loadData();
    } catch (err) {
      console.error('Error responding to complaint:', err);
    } finally {
      setCmpSaving(false);
    }
  };

  // Handle Appeal Review
  const handleSaveAppealReview = async () => {
    if (!selectedApl) return;
    setAplSaving(true);
    try {
      await api.reviewAppeal(selectedApl.id, {
        status: aplStatus,
        reviewRemarks: aplRemarks || 'Reviewed and adjudicated by District Education Officer.',
        adjustedCategoryScore: aplStatus === 'APPROVED' ? Number(aplAdjustedScore) : undefined,
        reviewedBy: user?.name || 'Dr. K. Srinivas Rao, DEO',
      });
      setSelectedApl(null);
      loadData();
    } catch (err) {
      console.error('Error reviewing appeal:', err);
    } finally {
      setAplSaving(false);
    }
  };

  // Handle Performance Data Save
  const handleSavePerformanceEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const hm = headmasters.find((h) => h.id === entryHmId);
    if (!hm) return;
    const sch = schools.find((s) => s.id === hm.schoolId);

    setEntrySaving(true);
    try {
      // Find existing bonus credits for this HM
      const existingLatest = rankings.find((r) => r.headmasterId === hm.id);
      const bonusCredits = existingLatest?.approvedBonusCredits || 0;

      await api.savePerformance({
        headmasterId: hm.id,
        headmasterName: hm.name,
        schoolId: sch?.id || hm.schoolId || 'sch-1',
        schoolName: sch?.name || hm.schoolName,
        district: hm.district,
        mandal: sch?.mandal || 'Kazipet',
        evaluationPeriod: entryPeriod,
        periodOrder: entryPeriod.includes('Term 3') ? 3 : entryPeriod.includes('Term 2') ? 2 : 1,
        categories: entryScores,
        approvedBonusCredits: bonusCredits,
      });

      setEntrySuccess(true);
      setTimeout(() => setEntrySuccess(false), 3000);
      loadData();
    } catch (err) {
      console.error('Error saving performance record:', err);
    } finally {
      setEntrySaving(false);
    }
  };

  // Handle Save School
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSchool({
        name: schoolFormData.name!,
        schoolCode: schoolFormData.schoolCode!,
        category: schoolFormData.category!,
        district: schoolFormData.district!,
        mandal: schoolFormData.mandal!,
        address: schoolFormData.address!,
        studentCount: Number(schoolFormData.studentCount || 0),
        teacherCount: Number(schoolFormData.teacherCount || 0),
        establishedYear: Number(schoolFormData.establishedYear || 1990),
        contactNumber: schoolFormData.contactNumber || '0870-2458899',
        headmasterId: '',
        headmasterName: 'Unassigned',
      });
      setSchoolModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creating school:', err);
    }
  };

  // Calculate live base score in performance entry
  const calculatedBaseScore = Math.round(
    (entryScores.academic * 0.3 +
      entryScores.schoolMgmt * 0.2 +
      entryScores.studentDev * 0.15 +
      entryScores.teacherMgmt * 0.15 +
      entryScores.infrastructure * 0.1 +
      entryScores.admin * 0.1) *
      10
  ) / 10;

  return (
    <div className="space-y-6">
      {/* Officer Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  DEO-OFFICER-01
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-800">
                  Competent Evaluating Authority
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {user?.name || 'Dr. K. Srinivas Rao'}
              </h1>
              <div className="text-xs text-slate-300 mt-0.5">
                District Educational Officer &bull; Department of School Education
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Pending Verifications</span>
              <span className="text-lg font-bold text-amber-400">
                {achievements.filter((a) => a.status === 'PENDING_VERIFICATION').length}
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Open Complaints</span>
              <span className="text-lg font-bold text-blue-400">
                {complaints.filter((c) => c.status !== 'Resolved').length}
              </span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
              <span className="text-slate-400 block text-[10px]">Pending Appeals</span>
              <span className="text-lg font-bold text-purple-400">
                {appeals.filter((a) => a.status === 'SUBMITTED').length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Analytics &amp; KPIs
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'verification'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Achievement Verification</span>
            {achievements.filter((a) => a.status === 'PENDING_VERIFICATION').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {achievements.filter((a) => a.status === 'PENDING_VERIFICATION').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'appeals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Score Appeals</span>
            {appeals.filter((a) => a.status === 'SUBMITTED').length > 0 && (
              <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {appeals.filter((a) => a.status === 'SUBMITTED').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'complaints'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Complaint Review</span>
            {complaints.filter((c) => c.status !== 'Resolved').length > 0 && (
              <span className="bg-blue-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {complaints.filter((c) => c.status !== 'Resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            HM Comparison
          </button>
          <button
            onClick={() => setActiveTab('perf-entry')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'perf-entry'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Score Evaluation Entry
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            School Management ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab('headmasters')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'headmasters'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Headmaster Registry ({headmasters.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-medium">Evaluated Schools</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalSchools}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across 7 Telangana Districts</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-medium">Evaluated Headmasters</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalHeadmasters}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Term 3 (2025-26) Active</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-medium">State Average Score</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {analytics.averagePerformanceScore} / 110
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Base + Bonus inclusive</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 uppercase font-medium">Pending Review Items</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {analytics.pendingVerificationsCount +
                  analytics.pendingComplaintsCount +
                  analytics.pendingAppealsCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Requires officer adjudication</div>
            </div>
          </div>

          {/* District Performance Chart using Recharts */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  District Average Performance Index
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregate final scores across schools in each educational district
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.districtStats}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="district"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="averageScore" fill="#059669" radius={[4, 4, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2-Column: Top Performers vs Most Improved */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Performers */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Top 5 Performing Headmasters</h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {analytics.topPerformingHMs.map((item, idx) => (
                  <div key={item.hmId} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">
                        #{idx + 1} {item.hmName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.schoolName} &bull; {item.district}
                      </div>
                    </div>
                    <span className="font-black text-emerald-700 text-sm">{item.finalScore}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Improved HMs */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Most Improved Headmasters (Term-over-Term)
                </h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {analytics.mostImprovedHMs.map((item) => (
                  <div key={item.hmId} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{item.hmName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.schoolName} &bull; {item.district}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-xs">
                        +{item.improvementPercentage}%
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {item.previousScore} &rarr; {item.currentScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ACHIEVEMENT VERIFICATION ================= */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Achievement Verification Center</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review submitted school milestones and award bonus credits (1 to 3 pts, capped at 10 max). Verifying an achievement automatically recalculates the Headmaster&apos;s Final Score and dynamic rankings!
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {achievements.map((ach) => (
              <div key={ach.id} className="py-4 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {ach.imageUrl && (
                    <img
                      src={ach.imageUrl}
                      alt={ach.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{ach.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {ach.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ach.description}</p>
                    <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-3">
                      <span>Headmaster: <strong className="text-slate-800">{ach.headmasterName}</strong></span>
                      <span>&bull;</span>
                      <span>School: <strong className="text-slate-800">{ach.schoolName}</strong></span>
                      <span>&bull;</span>
                      <span>Date: {ach.achievementDate}</span>
                      {ach.documentName && (
                        <>
                          <span>&bull;</span>
                          <span className="text-blue-600 font-medium">{ach.documentName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col justify-between items-end">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      ach.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : ach.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : ach.status === 'INFO_REQUIRED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ach.status === 'VERIFIED'
                      ? `Verified (+${ach.bonusCreditsAwarded} Pts)`
                      : ach.status}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedAch(ach);
                      setVerStatus(ach.status === 'PENDING_VERIFICATION' ? 'VERIFIED' : ach.status);
                      setVerBonus(ach.bonusCreditsAwarded || 2);
                      setVerFeatured(ach.isFeatured ?? true);
                      setVerFeedback(ach.officerFeedback || '');
                    }}
                    className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Adjudicate Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SCORE APPEALS ================= */}
      {activeTab === 'appeals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Score Appeals Review Bureau</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review formal appeals filed by Headmasters requesting re-evaluation. Approving an appeal automatically rectifies the category score, recalculates Base and Final Scores, and updates dynamic rankings.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {appeals.map((apl) => (
              <div key={apl.id} className="py-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {apl.affectedCategory} Appeal ({apl.appealNumber})
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {apl.evaluationPeriod}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Appellant: <strong className="text-slate-800">{apl.headmasterName}</strong> &bull; {apl.schoolName}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      apl.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : apl.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {apl.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Original Score</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {apl.currentCategoryScore} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Claimed Rectified Score</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {apl.claimedCategoryScore} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Evidence Attached</span>
                    <span className="text-blue-600 font-medium truncate block">
                      {apl.evidenceName || 'Official_Document.pdf'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  <strong>Appellant Reason:</strong> {apl.reason}
                </p>

                {apl.reviewRemarks && (
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-blue-900">
                    <strong>Officer Adjudication Remarks ({apl.reviewedBy}):</strong> {apl.reviewRemarks}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedApl(apl);
                      setAplStatus('APPROVED');
                      setAplAdjustedScore(apl.claimedCategoryScore);
                      setAplRemarks(apl.reviewRemarks || '');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Adjudicate Appeal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: COMPLAINTS ================= */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Institutional Grievance &amp; Complaint Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review operational bottlenecks reported by Headmasters regarding infrastructure, grants, and staffing.
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {complaints.map((cmp) => (
              <div key={cmp.id} className="py-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{cmp.title}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                        {cmp.complaintNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Filed by: <strong>{cmp.headmasterName}</strong> ({cmp.schoolName}, {cmp.district})
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      cmp.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cmp.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cmp.status}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{cmp.description}</p>

                {cmp.officerResponse && (
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-slate-700">
                    <strong>Official Officer Response ({cmp.resolvedBy}):</strong> {cmp.officerResponse}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedCmp(cmp);
                      setCmpStatus(cmp.status);
                      setCmpResponse(cmp.officerResponse || '');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Respond &amp; Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: HM COMPARISON ================= */}
      {activeTab === 'compare' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Headmaster Side-by-Side Comparison</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select 2 to 4 Headmasters to compare category strengths, base scores, bonus points, and final standing.
            </p>
          </div>

          {/* Multi-select selection checkboxes */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Headmasters to Compare (Pick 2 to 4):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {headmasters.map((hm) => {
                const isChecked = compareIds.includes(hm.id);
                return (
                  <label
                    key={hm.id}
                    className={`flex items-center space-x-2 p-2 rounded border text-xs cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (compareIds.length < 4) {
                            setCompareIds([...compareIds, hm.id]);
                          }
                        } else {
                          if (compareIds.length > 1) {
                            setCompareIds(compareIds.filter((id) => id !== hm.id));
                          }
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="truncate">{hm.name} ({hm.schoolName})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Grouped Bar Chart comparing category metrics */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Metric Comparison Visualizer
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      category: 'Academic (30%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.academic || 0];
                        })
                      ),
                    },
                    {
                      category: 'School Mgmt (20%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.schoolMgmt || 0];
                        })
                      ),
                    },
                    {
                      category: 'Student Dev (15%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.studentDev || 0];
                        })
                      ),
                    },
                    {
                      category: 'Teacher Mgmt (15%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.teacherMgmt || 0];
                        })
                      ),
                    },
                    {
                      category: 'Infrastructure (10%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.infrastructure || 0];
                        })
                      ),
                    },
                    {
                      category: 'Admin (10%)',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.categories.admin || 0];
                        })
                      ),
                    },
                    {
                      category: 'Final Score',
                      ...Object.fromEntries(
                        compareIds.map((id) => {
                          const r = rankings.find((rec) => rec.headmasterId === id);
                          return [r?.headmasterName || id, r?.finalScore || 0];
                        })
                      ),
                    },
                  ]}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  {compareIds.map((id, index) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    const colors = ['#059669', '#2563eb', '#d97706', '#9333ea'];
                    return (
                      <Bar
                        key={id}
                        dataKey={r?.headmasterName || id}
                        fill={colors[index % colors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side by side comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 border-b border-r border-slate-200">Evaluation Metric</th>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <th key={id} className="p-3 border-b border-r border-slate-200">
                        <div className="font-bold text-slate-900">{r?.headmasterName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{r?.schoolName}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-200">State Overall Rank</td>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <td key={id} className="p-3 font-bold text-slate-900 border-r border-slate-200">
                        #{r?.overallRank}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-200">Final Evaluated Score</td>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <td key={id} className="p-3 font-black text-emerald-700 text-sm border-r border-slate-200">
                        {r?.finalScore}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-200">Academic (30%)</td>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <td key={id} className="p-3 border-r border-slate-200">
                        {r?.categories.academic} / 100
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-200">School Mgmt (20%)</td>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <td key={id} className="p-3 border-r border-slate-200">
                        {r?.categories.schoolMgmt} / 100
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-3 font-semibold border-r border-slate-200">Bonus Credits (max 10)</td>
                  {compareIds.map((id) => {
                    const r = rankings.find((rec) => rec.headmasterId === id);
                    return (
                      <td key={id} className="p-3 font-bold text-emerald-700 border-r border-slate-200">
                        +{r?.approvedBonusCredits} pts
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PERFORMANCE DATA ENTRY ================= */}
      {activeTab === 'perf-entry' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Official Performance Score Entry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter official inspection evaluation scores across 6 weighted categories. Saving a record recalculates Base Score, integrates verified bonus credits, and updates statewide rankings dynamically.
            </p>
          </div>

          {entrySuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Performance record saved successfully! Dynamic statewide rankings have been updated.</span>
            </div>
          )}

          <form onSubmit={handleSavePerformanceEntry} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Headmaster to Evaluate
                </label>
                <select
                  value={entryHmId}
                  onChange={(e) => setEntryHmId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 font-semibold"
                >
                  {headmasters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} &bull; {h.schoolName} ({h.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evaluation Term / Cycle
                </label>
                <select
                  value={entryPeriod}
                  onChange={(e) => setEntryPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 font-semibold"
                >
                  <option value="Term 3 (2025-26)">Term 3 (2025-26) - Current Active</option>
                  <option value="Term 2 (2025-26)">Term 2 (2025-26)</option>
                  <option value="Term 1 (2025-26)">Term 1 (2025-26)</option>
                </select>
              </div>
            </div>

            {/* Score Sliders & Inputs */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Score Input (0 to 100 per Category)
              </h4>

              {(Object.keys(entryScores) as PerformanceCategory[]).map((catKey) => {
                const meta = {
                  academic: { label: 'Academic Performance (Weight: 30%)', weight: 0.3 },
                  schoolMgmt: { label: 'School Management (Weight: 20%)', weight: 0.2 },
                  studentDev: { label: 'Student Development (Weight: 15%)', weight: 0.15 },
                  teacherMgmt: { label: 'Teacher Management (Weight: 15%)', weight: 0.15 },
                  infrastructure: { label: 'Infrastructure & Facilities (Weight: 10%)', weight: 0.1 },
                  admin: { label: 'Administrative Performance (Weight: 10%)', weight: 0.1 },
                }[catKey];

                return (
                  <div key={catKey} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800 md:col-span-1">
                      {meta.label}
                    </span>
                    <div className="md:col-span-2 flex items-center space-x-3">
                      <input
                        type="range"
                        min={30}
                        max={100}
                        value={entryScores[catKey]}
                        onChange={(e) =>
                          setEntryScores({ ...entryScores, [catKey]: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end space-x-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={entryScores[catKey]}
                        onChange={(e) =>
                          setEntryScores({ ...entryScores, [catKey]: Number(e.target.value) })
                        }
                        className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-bold text-slate-900"
                      />
                      <span className="text-slate-400">/ 100</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real-time Calculation Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-blue-900 font-bold block">Live Base Score Preview:</span>
                <span className="text-blue-700">Calculated from weighted 6-component equation</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-900">{calculatedBaseScore}</span>
                <span className="text-blue-600 text-[11px] block">/ 100 Base Points</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={entrySaving}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{entrySaving ? 'Saving & Recalculating...' : 'Commit Score & Update Statewide Rankings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 7: SCHOOL MANAGEMENT ================= */}
      {activeTab === 'schools' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Government School Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered institutions, enrollment stats, teacher faculty, and HM assignments.
              </p>
            </div>
            <button
              onClick={() => setSchoolModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New School</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3">School Code</th>
                  <th className="p-3">School Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Students</th>
                  <th className="p-3">Teachers</th>
                  <th className="p-3">Headmaster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schools.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-semibold text-slate-700">{s.schoolCode}</td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-600">
                      {s.mandal}, {s.district}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{s.studentCount}</td>
                    <td className="p-3 text-slate-700">{s.teacherCount}</td>
                    <td className="p-3 font-medium text-emerald-800">{s.headmasterName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: HEADMASTER REGISTRY ================= */}
      {activeTab === 'headmasters' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Headmaster Registry &amp; Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official roster of gazetted Headmasters evaluated under the state monitoring system.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Employee Code</th>
                  <th className="p-3">Headmaster Name</th>
                  <th className="p-3">Assigned School</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Qualifications</th>
                  <th className="p-3">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {headmasters.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-semibold text-slate-700">{h.employeeCode}</td>
                    <td className="p-3 font-bold text-slate-900">{h.name}</td>
                    <td className="p-3 text-slate-800 font-medium">{h.schoolName}</td>
                    <td className="p-3 text-slate-600">{h.district}</td>
                    <td className="p-3 text-slate-600">{h.qualification}</td>
                    <td className="p-3 font-semibold text-slate-800">{h.experienceYears} Years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VERIFICATION MODAL ================= */}
      {selectedAch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Officer Adjudication
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedAch.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAch(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                <div>
                  <strong>Headmaster:</strong> {selectedAch.headmasterName} ({selectedAch.schoolName})
                </div>
                <div>
                  <strong>Category:</strong> {selectedAch.category} &bull; <strong>Date:</strong> {selectedAch.achievementDate}
                </div>
                <div className="mt-1">
                  <strong>Description:</strong> {selectedAch.description}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerStatus('VERIFIED')}
                    className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                      verStatus === 'VERIFIED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Verify &amp; Award
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerStatus('INFO_REQUIRED')}
                    className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                      verStatus === 'INFO_REQUIRED'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerStatus('REJECTED')}
                    className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                      verStatus === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Reject Claim
                  </button>
                </div>
              </div>

              {verStatus === 'VERIFIED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bonus Credits to Award (1 to 3 pts)
                  </label>
                  <select
                    value={verBonus}
                    onChange={(e) => setVerBonus(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    <option value={1}>+1 Bonus Credit (Standard Milestone)</option>
                    <option value={2}>+2 Bonus Credits (District / Regional Recognition)</option>
                    <option value={3}>+3 Bonus Credits (State / National Award)</option>
                  </select>
                </div>
              )}

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verFeatured}
                  onChange={(e) => setVerFeatured(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Feature on Public Achievement Wall</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Feedback / Remarks
                </label>
                <textarea
                  rows={2}
                  value={verFeedback}
                  onChange={(e) => setVerFeedback(e.target.value)}
                  placeholder="Official endorsement remarks..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAch(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveVerification}
                  disabled={verSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
                >
                  {verSaving ? 'Saving Decision...' : 'Save & Update Final Rankings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPLAINT RESPONSE MODAL ================= */}
      {selectedCmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Officer Resolution
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedCmp.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                <div>
                  <strong>Headmaster:</strong> {selectedCmp.headmasterName} ({selectedCmp.schoolName})
                </div>
                <div>
                  <strong>Grievance:</strong> {selectedCmp.description}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Grievance Status
                </label>
                <select
                  value={cmpStatus}
                  onChange={(e) => setCmpStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Action Initiated">Action Initiated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Response to Headmaster
                </label>
                <textarea
                  required
                  rows={3}
                  value={cmpResponse}
                  onChange={(e) => setCmpResponse(e.target.value)}
                  placeholder="Detail action taken, sanction order number, or department instructions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCmp(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveComplaintResponse}
                  disabled={cmpSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
                >
                  {cmpSaving ? 'Saving...' : 'Dispatch Response to HM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPEAL REVIEW MODAL ================= */}
      {selectedApl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                  Adjudicate Score Appeal
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedApl.affectedCategory} Appeal ({selectedApl.appealNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApl(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                <div>
                  <strong>Appellant:</strong> {selectedApl.headmasterName} ({selectedApl.schoolName})
                </div>
                <div>
                  <strong>Current Score:</strong> {selectedApl.currentCategoryScore} / 100 &bull;{' '}
                  <strong>Claimed Score:</strong> {selectedApl.claimedCategoryScore} / 100
                </div>
                <div className="mt-1">
                  <strong>Appellant Reason:</strong> {selectedApl.reason}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjudication Verdict
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAplStatus('APPROVED')}
                    className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                      aplStatus === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Approve &amp; Rectify Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setAplStatus('REJECTED')}
                    className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                      aplStatus === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Reject Appeal
                  </button>
                </div>
              </div>

              {aplStatus === 'APPROVED' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adjusted Category Score (0 to 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={aplAdjustedScore}
                    onChange={(e) => setAplAdjustedScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    This will immediately update the performance record and recalculate rankings!
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Adjudication Remarks
                </label>
                <textarea
                  required
                  rows={2}
                  value={aplRemarks}
                  onChange={(e) => setAplRemarks(e.target.value)}
                  placeholder="State review findings and justification..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApl(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppealReview}
                  disabled={aplSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
                >
                  {aplSaving ? 'Adjudicating...' : 'Commit Verdict & Update Rankings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REGISTER SCHOOL MODAL ================= */}
      {schoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-6 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-slate-900">Register New Government School</h3>
              <button onClick={() => setSchoolModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={schoolFormData.name}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, name: e.target.value })}
                  placeholder="e.g. ZPHS Hasanparthy"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">School Code</label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.schoolCode}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, schoolCode: e.target.value })
                    }
                    placeholder="SCH-WAR-006"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={schoolFormData.category}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, category: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  >
                    <option value="High School (6-10)">High School (6-10)</option>
                    <option value="Model School">Model School</option>
                    <option value="Higher Secondary (6-12)">Higher Secondary (6-12)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.district}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, district: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mandal</label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.mandal}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, mandal: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Enrollment</label>
                  <input
                    type="number"
                    required
                    value={schoolFormData.studentCount}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, studentCount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher Staff</label>
                  <input
                    type="number"
                    required
                    value={schoolFormData.teacherCount}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, teacherCount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchoolModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded cursor-pointer"
                >
                  Register School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
