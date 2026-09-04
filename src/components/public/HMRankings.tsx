import React, { useState, useEffect } from 'react';
import { api } from '../../api.ts';
import { PerformanceRecord } from '../../types.ts';
import {
  Trophy,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Award,
  TrendingUp,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { HMPravardhanLogo } from '../common/HMPravardhanLogo.tsx';

interface HMRankingsProps {
  onSelectHM: (hmId: string) => void;
}

export const HMRankings: React.FC<HMRankingsProps> = ({ onSelectHM }) => {
  const [rankings, setRankings] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Term 3 (2025-26)');
  const [district, setDistrict] = useState('All');
  const [mandal, setMandal] = useState('All');
  const [search, setSearch] = useState('');

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await api.getRankings({
        period,
        district: district !== 'All' ? district : undefined,
        mandal: mandal !== 'All' ? mandal : undefined,
        search: search || undefined,
      });
      setRankings(data);
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [period, district, mandal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings();
  };

  const districts = ['All', 'Warangal Urban', 'Karimnagar', 'Hyderabad', 'Ranga Reddy', 'Medak', 'Nizamabad', 'Khammam', 'Nalgonda', 'Medchal-Malkajgiri'];

  return (
    <div className="space-y-6">
      {/* Header & Filter Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">
            <HMPravardhanLogo className="w-4 h-4 text-[#1E3A8A]" />
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Statewide Headmaster Evaluation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Headmaster Performance Rankings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Dynamic rankings calculated from institutional performance across 6 weighted categories (30% Academic, 20% School Mgmt, 15% Student Dev, 15% Teacher Mgmt, 10% Infrastructure, 10% Admin) plus verified bonus credits.
          </p>
        </div>

        {/* Filter controls */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search HM name or school name..."
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Term 3 (2025-26)">Term 3 (2025-26) - Current</option>
              <option value="Term 2 (2025-26)">Term 2 (2025-26)</option>
              <option value="Term 1 (2025-26)">Term 1 (2025-26)</option>
            </select>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Districts</option>
              {districts.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              onClick={fetchRankings}
              type="button"
              className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formula hint banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-950 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Ranking Calculation:</strong> Final Score = (Weighted Base Score / 100) + Approved Bonus Credits (Max 10). Dynamic ranks update automatically when bonus achievements or score appeals are approved.
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] bg-blue-100 text-[#1E3A8A] px-2.5 py-0.5 rounded font-bold shrink-0">
          Evaluated HMs: {rankings.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading dynamic rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No rankings found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[11px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Headmaster</th>
                  <th className="py-3.5 px-4">School &amp; District</th>
                  <th className="py-3.5 px-4 text-center">Base Score</th>
                  <th className="py-3.5 px-4 text-center">Bonus Pts</th>
                  <th className="py-3.5 px-4 text-center">Final Score</th>
                  <th className="py-3.5 px-4 text-center">Local Ranks</th>
                  <th className="py-3.5 px-4 text-center">Trend</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.map((r, index) => {
                  const rank = r.overallRank || index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-blue-50/70 transition-colors ${
                        isTop1 ? 'bg-blue-50/30' : isTop2 ? 'bg-gray-50/40' : isTop3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center">
                          {isTop1 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="w-7 h-7 rounded-full bg-gray-400 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-[#1E3A8A] font-bold text-xs">#{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Headmaster Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 leading-tight">
                          {r.headmasterName}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Head of Institution
                        </div>
                      </td>

                      {/* School & District */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800 leading-tight">
                          {r.schoolName}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {r.mandal} Mandal &bull; {r.district}
                        </div>
                      </td>

                      {/* Base Score */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {r.baseScore}
                        <div className="text-[10px] text-gray-400 font-normal">/ 100</div>
                      </td>

                      {/* Bonus Credits */}
                      <td className="py-3.5 px-4 text-center">
                        {r.approvedBonusCredits > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                            +{r.approvedBonusCredits}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">0</span>
                        )}
                      </td>

                      {/* Final Score */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="text-base font-extrabold text-green-600">
                          {r.finalScore}
                        </div>
                      </td>

                      {/* Local Ranks (District / Mandal) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            Dist: #{r.districtRank}
                          </span>
                          <br />
                          <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            Mandal: #{r.mandalRank}
                          </span>
                        </div>
                      </td>

                      {/* Rank Change / Trend */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {r.rankChange > 0 ? (
                          <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <ArrowUp className="w-3 h-3 mr-0.5" />
                            +{r.rankChange}
                          </span>
                        ) : r.rankChange < 0 ? (
                          <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            <ArrowDown className="w-3 h-3 mr-0.5" />
                            {r.rankChange}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            <Minus className="w-3 h-3 mr-0.5" />
                            0
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectHM(r.headmasterId)}
                          className="bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
