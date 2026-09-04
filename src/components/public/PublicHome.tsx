import React, { useEffect, useState } from 'react';
import { api } from '../../api.ts';
import { PerformanceRecord, Achievement, School } from '../../types.ts';
import {
  Trophy,
  School as SchoolIcon,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  Sparkles,
  Search,
} from 'lucide-react';
import { HMPravardhanLogo } from '../common/HMPravardhanLogo.tsx';

interface PublicHomeProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenLogin: (role: 'HEADMASTER' | 'EDUCATION_OFFICER') => void;
  onSelectHM: (hmId: string) => void;
  onSelectSchool: (school: School) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onNavigate,
  onOpenLogin,
  onSelectHM,
  onSelectSchool,
}) => {
  const [topRankers, setTopRankers] = useState<PerformanceRecord[]>([]);
  const [featuredAchievements, setFeaturedAchievements] = useState<Achievement[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRankings({ period: 'Term 3 (2025-26)' }),
      api.getAchievements({ featuredOnly: true }),
      api.getSchools(),
    ])
      .then(([rankings, achievements, schoolsList]) => {
        setTopRankers(rankings.slice(0, 3));
        setFeaturedAchievements(achievements.slice(0, 4));
        setSchools(schoolsList);
      })
      .catch((err) => console.error('Error fetching home data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Banner section */}
      <section className="bg-[#1E3A8A] text-white shadow-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-10 md:py-14 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-400/40 text-xs text-blue-200 font-semibold">
            <HMPravardhanLogo className="w-3.5 h-3.5 text-blue-300" />
            <span>HM Pravardhan &bull; Government School HM Development Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Evaluating Leadership, School Excellence &amp; Verified Achievements
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            A transparent evaluation framework computing weighted performance metrics across Academic Outcomes, Student Development, Teacher Management, Infrastructure, and verified achievements.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('rankings')}
              className="bg-white text-[#1E3A8A] font-bold text-sm px-5 py-2.5 rounded shadow hover:bg-blue-50 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>View HM Rankings</span>
            </button>
            <button
              onClick={() => onNavigate('schools')}
              className="bg-blue-700/50 border border-blue-400 text-white font-bold text-sm px-5 py-2.5 rounded hover:bg-blue-700 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <SchoolIcon className="w-4 h-4 text-blue-200" />
              <span>Explore 15 Schools</span>
            </button>
            <button
              onClick={() => onNavigate('achievements')}
              className="bg-blue-700/50 border border-blue-400 text-white font-bold text-sm px-5 py-2.5 rounded hover:bg-blue-700 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-blue-200" />
              <span>Achievement Wall</span>
            </button>
          </div>
        </div>
        <div className="absolute top-[-40px] right-[-40px] opacity-10 pointer-events-none">
          <div className="w-80 h-80 bg-white rounded-full"></div>
        </div>
      </section>

      {/* Quick Statistics Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Schools</span>
            <Building className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{schools.length || 15}</div>
          <div className="text-xs text-gray-500 mt-1">Across 7 Telangana Districts</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Headmasters</span>
            <Users className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-bold text-gray-800">15 Evaluated</div>
          <div className="text-xs text-gray-500 mt-1">Term 3 (2025-26) Active</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Top Final Score</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {topRankers[0]?.finalScore || '96.2'} <span className="text-xs text-gray-500 font-normal">/ 110</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Base + Approved Bonus Credits</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Achievements</span>
            <Award className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-bold text-gray-800">5 Awarded</div>
          <div className="text-xs text-gray-500 mt-1">Bonus Credits Credited</div>
        </div>
      </section>

      {/* Top Performing Headmasters Leaderboard */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Top Performing Headmasters (Current Term)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Ranked dynamically by weighted performance Base Score + Verified Bonus Credits
            </p>
          </div>
          <button
            onClick={() => onNavigate('rankings')}
            className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Rankings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRankers.map((hm, idx) => {
            const badgeBg =
              idx === 0
                ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                : idx === 1
                ? 'bg-gray-100 text-gray-700 border-gray-200 font-bold'
                : 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
            const rankLabel = idx === 0 ? 'State Rank #1 (Gold)' : idx === 1 ? 'State Rank #2 (Silver)' : 'State Rank #3 (Bronze)';

            return (
              <div
                key={hm.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded border ${badgeBg}`}>
                      {rankLabel}
                    </span>
                    <span className="text-xs text-green-600 font-bold flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{hm.rankChange >= 0 ? `+${hm.rankChange} Rank` : `${hm.rankChange} Rank`}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug">
                    {hm.headmasterName}
                  </h3>
                  <div className="text-xs text-gray-700 font-medium mt-1">
                    {hm.schoolName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {hm.district} &bull; {hm.mandal} Mandal
                  </div>

                  {/* Score breakdown bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Base Score (100 pts):</span>
                      <span className="font-bold text-gray-800">{hm.baseScore}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Bonus Credits (max 10):</span>
                      <span className="font-bold text-green-600">+{hm.approvedBonusCredits}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
                      <span className="text-gray-900">Final Score:</span>
                      <span className="text-green-600 font-extrabold text-base">{hm.finalScore}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => onSelectHM(hm.headmasterId)}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-xs font-bold py-2 rounded transition-colors text-center cursor-pointer"
                  >
                    View Public Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Achievements Preview */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Verified School Achievements
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Approved by Education Officers with verified certificates and bonus credits
            </p>
          </div>
          <button
            onClick={() => onNavigate('achievements')}
            className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Explore Achievement Wall</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
            >
              {ach.imageUrl && (
                <div className="h-40 overflow-hidden bg-gray-100 relative">
                  <img
                    src={ach.imageUrl}
                    alt={ach.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    +{ach.bonusCreditsAwarded} Bonus Pts
                  </span>
                  <span className="absolute bottom-2 left-2 bg-[#1E3A8A]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs uppercase">
                    {ach.category}
                  </span>
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug mb-1">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                    {ach.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <div className="font-semibold text-gray-700 truncate">{ach.schoolName}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span>{ach.district}</span>
                    <span className="text-green-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Portals & Roles Notice - Professional Polish Theme Card */}
      <section className="bg-[#1E3A8A] rounded-lg shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Department of School Education</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
              HM Pravardhan Portal
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Access your performance dashboard, upload achievements, submit score appeals, and manage school evaluation data.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onOpenLogin('HEADMASTER')}
                className="bg-white text-[#1E3A8A] font-bold px-5 py-2.5 rounded shadow-md hover:bg-blue-50 transition-all cursor-pointer text-sm"
              >
                Headmaster Login
              </button>
              <button
                onClick={() => onOpenLogin('EDUCATION_OFFICER')}
                className="bg-blue-700/50 border border-blue-400 text-white font-bold px-5 py-2.5 rounded hover:bg-blue-700 transition-all cursor-pointer text-sm"
              >
                Education Officer Access
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-6 text-sm text-blue-50 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <span>Institutional Evaluation Mandate</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Performance records are calculated across 6 weighted governance domains (30% Academic, 20% School Mgmt, 15% Student Dev, 15% Teacher Mgmt, 10% Infrastructure, 10% Admin). Headmasters can file appeals with supporting documentation directly through the portal.
            </p>
            <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-blue-200 font-semibold">
              <span>Statewide Coverage: 100%</span>
              <span>Verification Status: Active</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[-20px] right-[-20px] opacity-10 pointer-events-none">
          <div className="w-48 h-48 bg-white rounded-full"></div>
        </div>
      </section>
    </div>
  );
};
