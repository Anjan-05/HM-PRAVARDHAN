import React, { useState, useEffect } from 'react';
import { api } from '../../api.ts';
import { Headmaster, PerformanceRecord, Achievement, School } from '../../types.ts';
import {
  Trophy,
  Award,
  GraduationCap,
  Calendar,
  Building,
  MapPin,
  TrendingUp,
  CheckCircle2,
  X,
  Phone,
  Mail,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface PublicHMProfileProps {
  headmasterId: string;
  onBack: () => void;
  onSelectSchool?: (school: School) => void;
}

export const PublicHMProfile: React.FC<PublicHMProfileProps> = ({
  headmasterId,
  onBack,
  onSelectSchool,
}) => {
  const [hm, setHm] = useState<Headmaster | null>(null);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getHeadmasterById(headmasterId),
      api.getPerformance({ headmasterId }),
      api.getAchievements({ headmasterId, status: 'VERIFIED' }),
    ])
      .then(async ([hmData, perfData, achData]) => {
        setHm(hmData);
        setRecords(perfData);
        setAchievements(achData);
        if (hmData?.schoolId) {
          const sch = await api.getSchoolById(hmData.schoolId).catch(() => null);
          setSchool(sch);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [headmasterId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
        Loading official Headmaster profile...
      </div>
    );
  }

  if (!hm) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
        <p>Headmaster profile not found.</p>
        <button
          onClick={onBack}
          className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
        >
          Return to directory
        </button>
      </div>
    );
  }

  const latestRecord = records[0];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-lg bg-[#1E3A8A] text-white font-bold text-xl flex items-center justify-center shadow-xs">
              {hm.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {hm.employeeCode}
                </span>
                <span className="text-xs bg-blue-100 text-[#1E3A8A] font-bold px-2 py-0.5 rounded">
                  Gazetted Headmaster
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{hm.name}</h1>
              <div className="text-xs sm:text-sm text-gray-600 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                <span>{hm.qualifications}</span>
                <span className="text-gray-300">&bull;</span>
                <span>{hm.experienceYears} Years Educational Experience</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-bold text-gray-700">{hm.schoolName}</span>
                <span>({hm.district} District)</span>
              </div>
            </div>
          </div>

          {/* Current Score Ribbon */}
          {latestRecord && (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-4 text-center min-w-[200px] w-full md:w-auto">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Current Term 3 Final Score
              </div>
              <div className="text-3xl font-extrabold text-[#1E3A8A] mt-1">
                {latestRecord.finalScore}
                <span className="text-xs font-normal text-gray-400"> / 110</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Base: <strong className="text-gray-900">{latestRecord.baseScore}</strong> | Bonus: <strong className="text-[#1E3A8A]">+{latestRecord.approvedBonusCredits}</strong>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-around text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">State Rank</span>
                  <span className="font-bold text-gray-900">#{latestRecord.overallRank}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">District Rank</span>
                  <span className="font-bold text-gray-900">#{latestRecord.districtRank}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Mandal Rank</span>
                  <span className="font-bold text-gray-900">#{latestRecord.mandalRank}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column layout: Historical Performance + Verified Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Evolution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900 text-base">Evaluation History</h3>
          </div>
          <p className="text-xs text-gray-500">
            Performance progression across evaluation terms with dynamic rank trajectory
          </p>

          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3.5 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs sm:text-sm text-gray-900">
                    {rec.evaluationPeriod}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#1E3A8A]">
                      Score: {rec.finalScore}
                    </span>
                    <span className="text-xs font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      Rank #{rec.overallRank}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px] text-gray-600">
                  <div>
                    <span className="text-gray-400 font-medium">Base Score:</span> {rec.baseScore}
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Bonus Credits:</span> +{rec.approvedBonusCredits}
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Trend:</span>{' '}
                    {rec.rankChange > 0 ? (
                      <span className="text-green-700 font-bold">+{rec.rankChange} Ranks</span>
                    ) : rec.rankChange < 0 ? (
                      <span className="text-red-600 font-bold">{rec.rankChange} Ranks</span>
                    ) : (
                      <span className="text-gray-500 font-medium">Baseline</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Achievements Feed */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#1E3A8A]" />
            <h3 className="font-bold text-gray-900 text-base">
              Verified Achievements ({achievements.length})
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Officially verified school milestones, awards, and bonus credit credits
          </p>

          {achievements.length === 0 ? (
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-6 text-center text-xs text-gray-400">
              No verified bonus achievements recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3.5 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        {ach.title}
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">
                        +{ach.bonusCreditsAwarded} Bonus Pts
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{ach.description}</p>
                  <div className="text-[10px] text-gray-400 flex justify-between items-center pt-1 border-t border-gray-200">
                    <span>
                      {ach.category} &bull; {ach.achievementDate}
                    </span>
                    <span className="text-green-700 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified by {ach.verifiedBy}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
