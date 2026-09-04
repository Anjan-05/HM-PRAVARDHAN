import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api.ts';
import {
  Headmaster,
  School,
  PerformanceRecord,
  Achievement,
  Complaint,
  ScoreAppeal,
  AppNotification,
  PerformanceCategory,
  ActivityPost,
  ActivityCategory,
} from '../../types.ts';
import { ActivityUploadModal } from '../activity/ActivityUploadModal.tsx';
import { ActivityFeedCard } from '../activity/ActivityFeedCard.tsx';
import { PerformanceTrendGraph } from './PerformanceTrendGraph.tsx';
import { StudentPerformanceManager } from '../common/StudentPerformanceManager.tsx';
import {
  Trophy,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Building,
  Users,
  GraduationCap,
  Scale,
  Sparkles,
  UploadCloud,
  HelpCircle,
  Bell,
  RefreshCw,
  Layers,
  Camera,
  Plus,
} from 'lucide-react';

const CATEGORY_META: Record<
  PerformanceCategory,
  { label: string; weight: number; description: string }
> = {
  academic: {
    label: 'Academic Performance',
    weight: 0.3,
    description: 'Pass percentage, standardized test scores, grade averages, learning outcomes',
  },
  schoolMgmt: {
    label: 'School Management',
    weight: 0.2,
    description: 'Attendance discipline, dropout reduction, safety standards, SMC meetings',
  },
  studentDev: {
    label: 'Student Development',
    weight: 0.15,
    description: 'Co-curricular activities, sports tournaments, club participation, science exhibitions',
  },
  teacherMgmt: {
    label: 'Teacher Management',
    weight: 0.15,
    description: 'Teacher attendance, lesson plan adherence, training participation, mentoring',
  },
  infrastructure: {
    label: 'Infrastructure & Facilities',
    weight: 0.1,
    description: 'Classroom maintenance, drinking water, sanitation, library, computer lab status',
  },
  admin: {
    label: 'Administrative Performance',
    weight: 0.1,
    description: 'Timely report submission, grant utilization, midday meal audit, compliance',
  },
};

interface HMDashboardProps {
  onNavigateToFeed?: () => void;
}

export const HMDashboard: React.FC<HMDashboardProps> = ({ onNavigateToFeed }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'school' | 'history' | 'achievements' | 'appeals' | 'notifications' | 'activities'
  >('overview');

  const [hm, setHm] = useState<Headmaster | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [districtRankings, setDistrictRankings] = useState<PerformanceRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [appeals, setAppeals] = useState<ScoreAppeal[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [myActivities, setMyActivities] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Activity Feed state in HM Dashboard
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityPost | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [activityToast, setActivityToast] = useState<string | null>(null);

  // New Achievement form state
  const [achTitle, setAchTitle] = useState('');
  const [achCategory, setAchCategory] = useState('Academic Excellence');
  const [achDate, setAchDate] = useState(new Date().toISOString().split('T')[0]);
  const [achDesc, setAchDesc] = useState('');
  const [achImage, setAchImage] = useState('');
  const [achDocName, setAchDocName] = useState('');
  const [achSubmitting, setAchSubmitting] = useState(false);
  const [achSuccess, setAchSuccess] = useState(false);

  // New Complaint form state
  const [cmpTitle, setCmpTitle] = useState('');
  const [cmpCategory, setCmpCategory] = useState<Complaint['category']>('Infrastructure Delay');
  const [cmpDesc, setCmpDesc] = useState('');
  const [cmpPerfCat, setCmpPerfCat] = useState<PerformanceCategory>('infrastructure');
  const [cmpSubmitting, setCmpSubmitting] = useState(false);
  const [cmpSuccess, setCmpSuccess] = useState(false);

  // New Appeal form state
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealCategory, setAppealCategory] = useState<PerformanceCategory>('academic');
  const [appealClaimedScore, setAppealClaimedScore] = useState<number>(85);
  const [appealReason, setAppealReason] = useState('');
  const [appealDocName, setAppealDocName] = useState('');
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const hmId = user.headmasterId || 'hm-1';
      const [hmData, perfData, achData, cmpData, aplData, notifData, actData] = await Promise.all([
        api.getHeadmasterById(hmId),
        api.getPerformance({ headmasterId: hmId }),
        api.getAchievements({ headmasterId: hmId }),
        api.getComplaints(hmId),
        api.getAppeals(hmId),
        api.getNotifications(user.id),
        api.getActivityPosts({ headmasterId: hmId }).catch(() => []),
      ]);

      setHm(hmData);
      setRecords(perfData);
      setAchievements(achData);
      setComplaints(cmpData);
      setAppeals(aplData);
      setNotifications(notifData);
      setMyActivities(actData || []);

      if (hmData?.schoolId) {
        const sch = await api.getSchoolById(hmData.schoolId).catch(() => null);
        setSchool(sch);
      }

      const latestRec = perfData.slice().sort((a, b) => b.periodOrder - a.periodOrder)[0];
      const targetPeriod = latestRec?.evaluationPeriod || 'Term 3 (2025-26)';
      const targetDistrict = hmData?.district || user.district;

      if (targetDistrict) {
        const distRankings = await api.getRankings({
          district: targetDistrict,
          period: targetPeriod,
        }).catch(() => []);
        setDistrictRankings(distRankings);
      }
    } catch (err) {
      console.error('Error loading HM dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handler for uploading new achievement
  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hm || !school) return;
    setAchSubmitting(true);
    try {
      await api.createAchievement({
        headmasterId: hm.id,
        headmasterName: hm.name,
        schoolId: school.id,
        schoolName: school.name,
        district: hm.district,
        mandal: school.mandal,
        title: achTitle,
        description: achDesc,
        category: achCategory,
        achievementDate: achDate,
        imageUrl: achImage || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
        documentName: achDocName || 'Official_Achievement_Certificate.pdf',
      });
      setAchSuccess(true);
      setAchTitle('');
      setAchDesc('');
      setAchImage('');
      setAchDocName('');
      setTimeout(() => setAchSuccess(false), 4000);
      loadData();
    } catch (err) {
      console.error('Error submitting achievement:', err);
    } finally {
      setAchSubmitting(false);
    }
  };

  // Handler for image file upload to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAchImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for filing complaint
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hm || !school) return;
    setCmpSubmitting(true);
    try {
      await api.createComplaint({
        headmasterId: hm.id,
        headmasterName: hm.name,
        schoolId: school.id,
        schoolName: school.name,
        district: hm.district,
        title: cmpTitle,
        category: cmpCategory,
        description: cmpDesc,
        relatedPerformanceCategory: cmpPerfCat,
        supportingDocName: 'Official_Grievance_Request.pdf',
      });
      setCmpSuccess(true);
      setCmpTitle('');
      setCmpDesc('');
      setTimeout(() => setCmpSuccess(false), 4000);
      loadData();
    } catch (err) {
      console.error('Error filing complaint:', err);
    } finally {
      setCmpSubmitting(false);
    }
  };

  // Handler for submitting score appeal
  const handleCreateAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const latestRec = records[0];
    if (!hm || !school || !latestRec) return;
    setAppealSubmitting(true);
    try {
      const currentScore = latestRec.categories[appealCategory] || 70;
      await api.createAppeal({
        headmasterId: hm.id,
        headmasterName: hm.name,
        schoolId: school.id,
        schoolName: school.name,
        performanceRecordId: latestRec.id,
        evaluationPeriod: latestRec.evaluationPeriod,
        affectedCategory: appealCategory,
        currentCategoryScore: currentScore,
        claimedCategoryScore: Number(appealClaimedScore),
        reason: appealReason,
        evidenceName: appealDocName || 'Official_Score_Rectification_Proof.pdf',
      });
      setAppealSuccess(true);
      setAppealReason('');
      setTimeout(() => {
        setAppealSuccess(false);
        setAppealModalOpen(false);
      }, 2000);
      loadData();
    } catch (err) {
      console.error('Error submitting score appeal:', err);
    } finally {
      setAppealSubmitting(false);
    }
  };

  // Activity Feed CRUD handlers
  const handleCreateActivity = async (formData: {
    title: string;
    description: string;
    category: ActivityCategory;
    activityDate: string;
    media: any[];
  }) => {
    if (!hm || !school) return;
    const created = await api.createActivityPost({
      headmasterId: hm.id,
      headmasterName: hm.name,
      schoolId: school.id,
      schoolName: school.name,
      district: hm.district || school.district,
      mandal: school.mandal || '',
      title: formData.title,
      description: formData.description,
      category: formData.category,
      activityDate: formData.activityDate,
      media: formData.media,
    });
    setMyActivities((prev) => [created, ...prev]);
    setActivityToast('Activity post shared to common feed!');
    setTimeout(() => setActivityToast(null), 3500);
  };

  const handleUpdateActivity = async (formData: {
    title: string;
    description: string;
    category: ActivityCategory;
    activityDate: string;
    media: any[];
  }) => {
    if (!editingActivity || !hm) return;
    const updated = await api.updateActivityPost(editingActivity.id, {
      requestingHmId: hm.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      activityDate: formData.activityDate,
      media: formData.media,
    });
    setMyActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingActivity(null);
    setActivityToast('Activity post updated successfully!');
    setTimeout(() => setActivityToast(null), 3500);
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete || !hm) return;
    try {
      await api.deleteActivityPost(activityToDelete, hm.id);
      setMyActivities((prev) => prev.filter((a) => a.id !== activityToDelete));
      setActivityToDelete(null);
      setActivityToast('Activity post deleted.');
      setTimeout(() => setActivityToast(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to delete activity post.');
    }
  };

  const handleLikeActivity = async (postId: string) => {
    if (!user) return;
    try {
      const updated = await api.toggleLikeActivityPost(postId, user.id);
      setMyActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const currentRecord = records[0];

  // Find lowest scoring category for rule-based recommendation
  let weakestCategory: { key: PerformanceCategory; score: number; meta: any } | null = null;
  if (currentRecord) {
    const sortedCats = (Object.keys(currentRecord.categories) as PerformanceCategory[]).map(
      (catKey) => ({
        key: catKey,
        score: currentRecord.categories[catKey],
        meta: CATEGORY_META[catKey],
      })
    );
    sortedCats.sort((a, b) => a.score - b.score);
    weakestCategory = sortedCats[0];
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400">
        Loading official Headmaster workspace...
      </div>
    );
  }

  if (!hm) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
        No headmaster record found for current user.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HM Profile Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-xs">
              {hm.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  {hm.employeeCode}
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-800">
                  Gazetted Headmaster
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{hm.name}</h1>
              <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap gap-x-2">
                <span>{school?.name}</span>
                <span>&bull;</span>
                <span>{hm.district} District</span>
              </div>
            </div>
          </div>

          {currentRecord && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-5 text-xs shadow-md">
              <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-lg px-3 py-2">
                <span className="text-emerald-300 font-bold block text-[10px] uppercase tracking-wider">
                  Overall Final Score
                </span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-emerald-400">
                    {currentRecord.finalScore}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Base {currentRecord.baseScore} + Bonus {currentRecord.approvedBonusCredits}
                </span>
              </div>
              <div className="h-10 w-px bg-slate-700 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                  State Rank
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">#{currentRecord.overallRank}</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                    {currentRecord.rankChange >= 0
                      ? `+${currentRecord.rankChange} Pos`
                      : `${currentRecord.rankChange} Pos`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Top 5% across Telangana
                </span>
              </div>
              <div className="h-10 w-px bg-slate-700 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                  District &amp; Mandal Rank
                </span>
                <div className="text-xl font-bold text-slate-200">
                  District #{currentRecord.districtRank}{' '}
                  <span className="text-xs font-normal text-slate-400">&bull; Mandal #{currentRecord.mandalRank}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {hm.district} &bull; Kazipet Mandal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Performance (Class 10)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Performance History (3 Terms)
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'achievements'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>My Achievements</span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-800">
              {achievements.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'appeals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Complaints &amp; Grievances</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {complaints.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('school')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'school'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            School Profile
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'activities'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 mr-0.5" />
            <span>Activity Posts</span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-800">
              {myActivities.length}
            </span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Rule-based Recommendation Notice */}
          {weakestCategory && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-amber-900 text-sm">
                  System Recommendation: Focus on {weakestCategory.meta.label}
                </div>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  Your current score in <strong>{weakestCategory.meta.label}</strong> is{' '}
                  <strong>{weakestCategory.score} / 100</strong>. Improving this metric by 10 points will boost your overall Base Score by{' '}
                  <strong>+{(10 * weakestCategory.meta.weight).toFixed(1)} points</strong> and potentially advance your state rank.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setAppealCategory(weakestCategory!.key);
                      setAppealModalOpen(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    Appeal {weakestCategory.meta.label} Score
                  </button>
                  <button
                    onClick={() => setActiveTab('performance')}
                    className="bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    View All Categories
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* District Ranking Leaderboard (Immediately Visible on Login) */}
          <div id="hm-district-ranking-section" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    District Ranking Leaderboard — {hm?.district || user.district} District
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official performance rankings of Headmasters across {hm?.district || user.district} for {currentRecord?.evaluationPeriod || 'Term 3 (2025-26)'}
                  </p>
                </div>
              </div>
              {currentRecord && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-[#1E3A8A] font-semibold px-2.5 py-1 rounded border border-blue-200">
                    Your District Rank: <strong className="font-bold text-sm">#{currentRecord.districtRank}</strong> of {districtRankings.length || 1}
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded border border-emerald-200">
                    Score: {currentRecord.finalScore} / 100
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table id="district-rankings-table" className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-center w-28">District Rank</th>
                    <th className="py-3 px-4">Headmaster Name</th>
                    <th className="py-3 px-4">School Name</th>
                    <th className="py-3 px-4 text-center w-44">Final Performance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {districtRankings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-500">
                        Loading district ranking data...
                      </td>
                    </tr>
                  ) : (
                    districtRankings
                      .filter((r) => r.district.toLowerCase() === (hm?.district || user.district || '').toLowerCase())
                      .sort((a, b) => b.finalScore - a.finalScore)
                      .map((r, index) => {
                        const distRank = r.districtRank || index + 1;
                        const isCurrentHM = r.headmasterId === hm?.id || r.headmasterId === user.headmasterId;
                        const isTop1 = distRank === 1;
                        const isTop2 = distRank === 2;
                        const isTop3 = distRank === 3;

                        return (
                          <tr
                            key={r.id || `${r.headmasterId}-${index}`}
                            id={`district-rank-row-${r.headmasterId}`}
                            className={`transition-colors ${
                              isCurrentHM
                                ? 'bg-blue-50/80 font-medium'
                                : isTop1
                                ? 'bg-amber-50/20 hover:bg-slate-50'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* 1. District Rank */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center justify-center">
                                {isTop1 ? (
                                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    1
                                  </span>
                                ) : isTop2 ? (
                                  <span className="w-6 h-6 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    2
                                  </span>
                                ) : isTop3 ? (
                                  <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    3
                                  </span>
                                ) : (
                                  <span className="text-[#1E3A8A] font-bold text-xs">#{distRank}</span>
                                )}
                              </div>
                            </td>

                            {/* 2. Headmaster Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold ${isCurrentHM ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>
                                  {r.headmasterName}
                                </span>
                                {isCurrentHM && (
                                  <span className="bg-[#1E3A8A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {r.mandal} Mandal
                              </div>
                            </td>

                            {/* 3. School Name */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">
                                {r.schoolName}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {r.district} District
                              </div>
                            </td>

                            {/* 4. Final Performance Score */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-block font-extrabold text-xs sm:text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                {r.finalScore} / 100
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-1">
                <span className="text-xs uppercase font-medium">Base Score</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {currentRecord?.baseScore || 0} / 100
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Weighted 6 categories</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-1">
                <span className="text-xs uppercase font-medium">Bonus Credits</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                +{currentRecord?.approvedBonusCredits || 0} Pts
              </div>
              <div className="text-[11px] text-slate-500 mt-1">From verified achievements (max 10)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-1">
                <span className="text-xs uppercase font-medium">Active Achievements</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{achievements.length} Total</div>
              <div className="text-[11px] text-emerald-600 mt-1">
                {achievements.filter((a) => a.status === 'VERIFIED').length} Officially Verified
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex justify-between items-center text-slate-500 mb-1">
                <span className="text-xs uppercase font-medium">Complaints / Grievances</span>
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{complaints.length} Filed</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {complaints.filter((c) => c.status === 'Resolved').length} Resolved by Officer
              </div>
            </div>
          </div>

          {/* 2-Column layout: Category Performance Breakdown & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Performance Breakdown */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Category Performance &amp; Weight Contributions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official evaluation scores across 6 core institutional domains ({currentRecord?.evaluationPeriod})
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('appeals')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 cursor-pointer"
                >
                  File Appeal
                </button>
              </div>

              {currentRecord && (
                <div className="space-y-3.5 pt-1">
                  {(Object.keys(CATEGORY_META) as PerformanceCategory[]).map((catKey) => {
                    const meta = CATEGORY_META[catKey];
                    const score = currentRecord.categories[catKey] || 0;
                    const contribution = (score * meta.weight).toFixed(1);
                    return (
                      <div key={catKey} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <span>{meta.label}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Weight: {meta.weight * 100}%)
                            </span>
                          </span>
                          <span className="text-slate-700 font-semibold">
                            <strong className="text-emerald-700 font-black">{score}</strong> / 100{' '}
                            <span className="text-slate-400 text-[10px] font-normal">
                              (+{contribution} pts to Base)
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 85
                                ? 'bg-emerald-600'
                                : score >= 75
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">{meta.description}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions Column */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">Quick Actions</h3>
              <div className="space-y-2.5 text-xs">
                <button
                  onClick={() => setActiveTab('students')}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] font-semibold p-3 rounded-lg border border-blue-200 flex items-center space-x-2 transition-colors cursor-pointer text-left"
                >
                  <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <div className="font-bold">Manage Student Performance</div>
                    <div className="text-[10px] text-blue-700 font-normal">
                      Enter Class 10 marks &amp; view board analytics
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold p-3 rounded-lg border border-emerald-200 flex items-center space-x-2 transition-colors cursor-pointer text-left"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-bold">Submit New Achievement</div>
                    <div className="text-[10px] text-emerald-700 font-normal">
                      Upload award or milestone for bonus credits
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('appeals')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold p-3 rounded-lg border border-slate-200 flex items-center space-x-2 transition-colors cursor-pointer text-left"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">Submit School Complaint</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Report infrastructure or staffing bottlenecks
                    </div>
                  </div>
                </button>
              </div>

              {/* Notification Box */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xs text-slate-700 flex items-center space-x-1">
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recent Alerts ({notifications.length})</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 2).map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STUDENT PERFORMANCE (CLASS 10) ================= */}
      {activeTab === 'students' && (
        <StudentPerformanceManager
          role="HEADMASTER"
          schoolId={school?.id}
          schoolName={school?.name}
          mandal={school?.mandal}
          district={hm.district}
        />
      )}

      {/* ================= TAB 3: PERFORMANCE HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Performance Evolution (3 Terms)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical progression across Term 1, Term 2, and Term 3 with improvement calculations
            </p>
          </div>

          {/* Performance Improvement Graph across evaluation periods */}
          <PerformanceTrendGraph
            records={records}
            currentScore={currentRecord?.finalScore || 84.8}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{rec.evaluationPeriod}</span>
                    <div className="text-[11px] text-slate-500">Academic Year 2025-26</div>
                  </div>
                  <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Rank #{rec.overallRank}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-center">
                  <div className="text-xs text-slate-500">Final Evaluated Score</div>
                  <div className="text-3xl font-black text-emerald-700">{rec.finalScore}</div>
                  <div className="text-[11px] text-slate-400">
                    Base: {rec.baseScore} | Bonus: +{rec.approvedBonusCredits}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>District Rank:</span>
                    <strong className="text-slate-800">#{rec.districtRank}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mandal Rank:</span>
                    <strong className="text-slate-800">#{rec.mandalRank}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span>Improvement Trend:</span>
                    <span className="font-semibold">
                      {rec.rankChange > 0 ? (
                        <span className="text-emerald-600 flex items-center">
                          <ArrowUp className="w-3 h-3 mr-0.5" />+{rec.rankChange} Pos ({rec.improvementPercentage}%)
                        </span>
                      ) : rec.rankChange < 0 ? (
                        <span className="text-red-600 flex items-center">
                          <ArrowDown className="w-3 h-3 mr-0.5" />{rec.rankChange} Pos ({rec.improvementPercentage}%)
                        </span>
                      ) : (
                        <span className="text-slate-500">Baseline Assessment</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ACHIEVEMENTS & UPLOAD ================= */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Submission Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Submit School Achievement for Bonus Credits
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit verified science fairs, sports championships, campus green initiatives, or academic awards. Approved achievements award 1 to 3 bonus credits to your Final Score (max 10 total).
            </p>

            {achSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Achievement successfully submitted! It is now queued for Education Officer verification.</span>
              </div>
            )}

            <form onSubmit={handleCreateAchievement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Achievement Title</label>
                  <input
                    type="text"
                    required
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    placeholder="e.g. State Science Fair Gold Medalist in Robotics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={achCategory}
                    onChange={(e) => setAchCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Academic Excellence">Academic Excellence</option>
                    <option value="Science & Innovation">Science & Innovation</option>
                    <option value="Sports & Athletics">Sports & Athletics</option>
                    <option value="Environmental Initiative">Environmental Initiative</option>
                    <option value="School Development">School Development</option>
                    <option value="Digital Literacy">Digital Literacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description &amp; Context</label>
                <textarea
                  required
                  rows={3}
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  placeholder="Describe the milestone, competition level, student participants, and institutional impact..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Upload Photo Proof (Image)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Accepts PNG, JPG, WEBP</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Attachment / Certificate Name</label>
                  <input
                    type="text"
                    value={achDocName}
                    onChange={(e) => setAchDocName(e.target.value)}
                    placeholder="e.g. State_Award_Certificate_Signed.pdf"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Certified notification or gazette order</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={achSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{achSubmitting ? 'Submitting Claim...' : 'Submit for Officer Verification'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of HM Achievements */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Submitted Achievements &amp; Verification Status ({achievements.length})
            </h3>

            {achievements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No achievements submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {achievements.map((ach) => (
                  <div key={ach.id} className="py-4 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {ach.imageUrl && (
                        <img
                          src={ach.imageUrl}
                          alt={ach.title}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
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
                        <div className="text-[11px] text-slate-400 mt-1.5 flex items-center space-x-2">
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
                      <div>
                        {ach.status === 'VERIFIED' && (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Verified (+{ach.bonusCreditsAwarded} Bonus Pts)
                          </span>
                        )}
                        {ach.status === 'PENDING_VERIFICATION' && (
                          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Pending Officer Review
                          </span>
                        )}
                        {ach.status === 'REJECTED' && (
                          <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Rejected
                          </span>
                        )}
                        {ach.status === 'INFO_REQUIRED' && (
                          <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                            <HelpCircle className="w-3.5 h-3.5 mr-1" />
                            Info Required
                          </span>
                        )}
                      </div>

                      {ach.officerFeedback && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-2 max-w-xs text-left">
                          <strong>Officer Feedback:</strong> {ach.officerFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: COMPLAINTS & GRIEVANCES ================= */}
      {activeTab === 'appeals' && (
        <div className="space-y-6">
          {/* Submit Complaint Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              File Official Complaint / Bottleneck Grievance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Report infrastructure delays, grant disbursement lags, or teacher shortages that impact your institutional evaluation to the District Education Office.
            </p>

            {cmpSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complaint filed successfully! Tracking reference created.</span>
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Complaint Subject</label>
                  <input
                    type="text"
                    required
                    value={cmpTitle}
                    onChange={(e) => setCmpTitle(e.target.value)}
                    placeholder="e.g. Delay in Rooftop Repair Grant Release"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={cmpCategory}
                    onChange={(e) => setCmpCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Infrastructure Delay">Infrastructure Delay</option>
                    <option value="Grant Release">Grant Release</option>
                    <option value="Staffing Shortage">Staffing Shortage</option>
                    <option value="Evaluation Discrepancy">Evaluation Discrepancy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Details</label>
                <textarea
                  required
                  rows={3}
                  value={cmpDesc}
                  onChange={(e) => setCmpDesc(e.target.value)}
                  placeholder="Provide date of sanction, reference letter number, and exact bottleneck details..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={cmpSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{cmpSubmitting ? 'Filing Complaint...' : 'Submit to District Officer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* History of complaints */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Complaint History &amp; Official Resolutions ({complaints.length})
            </h3>

            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No complaints filed.</div>
            ) : (
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
                          Category: {cmp.category} &bull; Filed on {cmp.submissionDate.split('T')[0]}
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
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 mt-2">
                        <span className="font-semibold text-slate-900">
                          Officer Response ({cmp.resolvedBy}):
                        </span>{' '}
                        {cmp.officerResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: SCHOOL PROFILE ================= */}
      {activeTab === 'school' && school && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 text-xs sm:text-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">School Institutional Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned institution details registered with Department of School Education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">School Details</div>
              <div className="text-slate-600">
                <span className="text-slate-400">Official Name:</span> {school.name}
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">School Code:</span> {school.schoolCode}
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Category:</span> {school.category}
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Address:</span> {school.address}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">Faculty &amp; Enrollment</div>
              <div className="text-slate-600">
                <span className="text-slate-400">Students Enrolled:</span>{' '}
                <strong className="text-slate-900">{school.studentCount}</strong>
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Sanctioned Teachers:</span>{' '}
                <strong className="text-slate-900">{school.teacherCount}</strong>
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Pupil-Teacher Ratio (PTR):</span>{' '}
                <strong className="text-emerald-700">
                  {Math.round(school.studentCount / (school.teacherCount || 1))} : 1
                </strong>
              </div>
              <div className="text-slate-600">
                <span className="text-slate-400">Contact:</span> {school.phone} &bull; {school.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPEAL MODAL ================= */}
      {appealModalOpen && currentRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              File Score Appeal / Re-evaluation Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              If an official assessment contains an audit discrepancy, request an Education Officer review with supporting records.
            </p>

            {appealSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Appeal submitted to District Education Officer!</span>
              </div>
            )}

            <form onSubmit={handleCreateAppeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Category</label>
                <select
                  value={appealCategory}
                  onChange={(e) => setAppealCategory(e.target.value as PerformanceCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {(Object.keys(CATEGORY_META) as PerformanceCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_META[cat].label} (Currently: {currentRecord.categories[cat]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Score</label>
                  <input
                    type="text"
                    disabled
                    value={currentRecord.categories[appealCategory]}
                    className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 text-slate-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Claimed Score</label>
                  <input
                    type="number"
                    min={currentRecord.categories[appealCategory]}
                    max={100}
                    required
                    value={appealClaimedScore}
                    onChange={(e) => setAppealClaimedScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Appeal</label>
                <textarea
                  required
                  rows={3}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Explain why the awarded score was inaccurate. Mention student pass records, inspection dates, or verified receipts..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence Document Name</label>
                <input
                  type="text"
                  value={appealDocName}
                  onChange={(e) => setAppealDocName(e.target.value)}
                  placeholder="e.g. Official_SSC_Result_Gazette_Verification.pdf"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAppealModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appealSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{appealSubmitting ? 'Submitting...' : 'Submit Appeal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 7: ACTIVITY POSTS ================= */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Camera className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      My School Activity Posts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Share and manage photos and videos of your school's cultural, sports, and science events
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {onNavigateToFeed && (
                  <button
                    type="button"
                    onClick={onNavigateToFeed}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Common Feed</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload School Activity</span>
                </button>
              </div>
            </div>

            {/* Explanatory Banner */}
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Shared Social Moments:</strong> These posts appear in the common HM Activity Feed for Headmasters across Telangana to celebrate student activities and school life.
                Official achievements for bonus ranking points continue to be managed separately under <strong>My Achievements</strong>.
              </div>
            </div>
          </div>

          {/* Posts List */}
          {myActivities.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Activity Posts Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Share your school's sports competitions, science fairs, tree plantation drives, or cultural programs with fellow Headmasters.
              </p>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Activity Post</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myActivities.map((act) => (
                <ActivityFeedCard
                  key={act.id}
                  post={act}
                  currentUser={user}
                  onLike={handleLikeActivity}
                  onEdit={(p) => setEditingActivity(p)}
                  onDelete={(id) => setActivityToDelete(id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Upload Modal */}
      {isActivityModalOpen && (
        <ActivityUploadModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          onSubmit={handleCreateActivity}
        />
      )}

      {/* Activity Edit Modal */}
      {editingActivity && (
        <ActivityUploadModal
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSubmit={handleUpdateActivity}
          editingPost={editingActivity}
        />
      )}

      {/* Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Delete Activity Post?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Are you sure you want to delete this activity post from the common feed? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteActivity}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Toast */}
      {activityToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{activityToast}</span>
        </div>
      )}
    </div>
  );
};
